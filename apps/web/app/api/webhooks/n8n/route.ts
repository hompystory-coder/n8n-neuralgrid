import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@neuralgrid/database'

// POST /api/webhooks/n8n - n8n Webhook 핸들러
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const workflowId = searchParams.get('workflowId')

    if (!workflowId) {
      return NextResponse.json(
        { error: 'workflowId is required' },
        { status: 400 }
      )
    }

    // 워크플로우 조회
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: { user: { include: { subscription: true } } },
    })

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      )
    }

    // 실행 한도 체크
    const subscription = workflow.user.subscription
    if (subscription && subscription.executionCount >= subscription.executionLimit) {
      return NextResponse.json(
        { error: '실행 한도에 도달했습니다' },
        { status: 429 }
      )
    }

    // Webhook 데이터
    const webhookData = await req.json().catch(() => ({}))

    // 워크플로우 실행 기록 생성
    const execution = await prisma.workflowExecution.create({
      data: {
        workflowId: workflow.id,
        userId: workflow.userId,
        status: 'SUCCESS',
        startedAt: new Date(),
        finishedAt: new Date(),
        executionData: webhookData,
      },
    })

    // 실행 카운트 증가
    if (subscription) {
      await prisma.subscription.update({
        where: { userId: workflow.userId },
        data: {
          executionCount: { increment: 1 },
        },
      })
    }

    return NextResponse.json({
      success: true,
      executionId: execution.id,
      message: 'Webhook received and workflow executed',
    })
  } catch (error: any) {
    console.error('n8n Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// GET /api/webhooks/n8n - Webhook URL 테스트
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const workflowId = searchParams.get('workflowId')

  return NextResponse.json({
    message: 'n8n Webhook endpoint',
    workflowId,
    example: {
      url: `/api/webhooks/n8n?workflowId=${workflowId || 'YOUR_WORKFLOW_ID'}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        // Your webhook data
      },
    },
  })
}
