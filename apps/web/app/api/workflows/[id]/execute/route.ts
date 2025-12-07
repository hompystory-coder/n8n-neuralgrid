import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@neuralgrid/database'
import { getUserSession, getUserWithSubscription } from '@/lib/api/auth'
import { checkExecutionLimit } from '@/lib/api/workflows'

// POST /api/workflows/[id]/execute - 워크플로우 실행
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getUserSession()
    const user = await getUserWithSubscription(session.user.id)

    // 워크플로우 조회
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!workflow) {
      return NextResponse.json(
        { error: '워크플로우를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 실행 한도 체크
    await checkExecutionLimit(user.id)

    // n8n ID 확인
    const n8nId = (workflow.workflowData as any)?.n8nId

    // n8n 서비스가 없으면 mock 실행 결과 반환
    if (!n8nId) {
      const execution = await prisma.workflowExecution.create({
        data: {
          workflowId: workflow.id,
          userId: user.id,
          status: 'SUCCESS',
          startedAt: new Date(),
          finishedAt: new Date(),
          duration: 100,
          executionData: { message: 'Mock execution (n8n not configured)' },
        },
      })

      // 구독 실행 카운트 증가
      await prisma.subscription.update({
        where: { userId: user.id },
        data: {
          executionCount: { increment: 1 },
        },
      })

      return NextResponse.json({
        message: '워크플로우가 실행되었습니다 (Mock)',
        execution,
      })
    }

    // n8n API를 통해 실제 실행
    try {
      const n8nResponse = await fetch(`${process.env.N8N_URL || 'http://115.91.5.140:5678'}/api/v1/executions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflowId: n8nId,
          data: workflow.workflowData,
        }),
      })

      if (!n8nResponse.ok) {
        throw new Error('n8n execution failed')
      }

      const n8nData = await n8nResponse.json()

      // 실행 기록 저장
      const execution = await prisma.workflowExecution.create({
        data: {
          workflowId: workflow.id,
          userId: user.id,
          status: n8nData.finished ? 'SUCCESS' : 'RUNNING',
          startedAt: new Date(n8nData.startedAt),
          finishedAt: n8nData.stoppedAt ? new Date(n8nData.stoppedAt) : null,
          executionData: n8nData.data || {},
        },
      })

      // 구독 실행 카운트 증가
      await prisma.subscription.update({
        where: { userId: user.id },
        data: {
          executionCount: { increment: 1 },
        },
      })

      return NextResponse.json({
        message: '워크플로우가 실행되었습니다',
        execution,
      })
    } catch (n8nError) {
      // n8n 연동 실패 시에도 실행 기록 생성
      const execution = await prisma.workflowExecution.create({
        data: {
          workflowId: workflow.id,
          userId: user.id,
          status: 'ERROR',
          startedAt: new Date(),
          finishedAt: new Date(),
          executionData: { error: 'n8n service unavailable' },
        },
      })

      return NextResponse.json({
        message: '워크플로우 실행 중 오류 발생',
        execution,
      }, { status: 500 })
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '워크플로우 실행 실패' },
      { status: 500 }
    )
  }
}
