import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@neuralgrid/database'
import { getUserSession } from '@/lib/api/auth'

// GET /api/workflows/[id] - 워크플로우 상세 조회
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getUserSession()
    
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        executions: {
          take: 20,
          orderBy: { startedAt: 'desc' },
        },
      },
    })

    if (!workflow) {
      return NextResponse.json(
        { error: '워크플로우를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    return NextResponse.json({ workflow })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '워크플로우 조회 실패' },
      { status: 500 }
    )
  }
}

// PUT /api/workflows/[id] - 워크플로우 수정
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getUserSession()
    const body = await req.json()
    const { name, description, workflowData, tags, isActive } = body

    // 소유권 확인
    const existing = await prisma.workflow.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: '워크플로우를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 워크플로우 업데이트
    const workflow = await prisma.workflow.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(workflowData && { workflowData }),
        ...(tags && { tags }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json({
      message: '워크플로우가 수정되었습니다',
      workflow,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '워크플로우 수정 실패' },
      { status: 500 }
    )
  }
}

// DELETE /api/workflows/[id] - 워크플로우 삭제
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getUserSession()

    // 소유권 확인
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

    // 워크플로우 삭제
    await prisma.workflow.delete({
      where: { id: params.id },
    })

    // 구독의 워크플로우 카운트 감소
    await prisma.subscription.update({
      where: { userId: session.user.id },
      data: {
        workflowCount: { decrement: 1 },
      },
    })

    return NextResponse.json({
      message: '워크플로우가 삭제되었습니다',
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '워크플로우 삭제 실패' },
      { status: 500 }
    )
  }
}
