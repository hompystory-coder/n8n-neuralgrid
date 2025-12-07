import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@neuralgrid/database'
import { getUserSession, getUserWithSubscription } from '@/lib/api/auth'
import { checkWorkflowLimit } from '@/lib/api/workflows'

// POST /api/templates/[id]/install - 템플릿 설치 (워크플로우로 복사)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getUserSession()
    const user = await getUserWithSubscription(session.user.id)

    // 워크플로우 생성 한도 체크
    await checkWorkflowLimit(user.id)

    // 템플릿 조회
    const template = await prisma.template.findUnique({
      where: { id: params.id },
    })

    if (!template) {
      return NextResponse.json(
        { error: '템플릿을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 워크플로우 생성
    const workflow = await prisma.workflow.create({
      data: {
        name: `${template.name} (템플릿)`,
        description: template.description,
        tags: template.tags,
        workflowData: template.workflowData,
        isActive: false,
        userId: user.id,
      },
    })

    // 구독의 워크플로우 카운트 증가
    await prisma.subscription.update({
      where: { userId: user.id },
      data: {
        workflowCount: { increment: 1 },
      },
    })

    // 템플릿 사용 횟수 증가
    await prisma.template.update({
      where: { id: template.id },
      data: {
        usageCount: { increment: 1 },
      },
    })

    return NextResponse.json({
      success: true,
      workflow: {
        id: workflow.id,
        name: workflow.name,
      },
      message: '템플릿이 설치되었습니다. 워크플로우를 편집하여 사용하세요.',
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '템플릿 설치에 실패했습니다' },
      { status: 500 }
    )
  }
}
