import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@neuralgrid/database'
import { getUserSession } from '@/lib/api/auth'
import { checkWorkflowLimit } from '@/lib/api/workflows'

// GET /api/workflows - 워크플로우 목록 조회
export async function GET(req: NextRequest) {
  try {
    const session = await getUserSession()
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const [workflows, total] = await Promise.all([
      prisma.workflow.findMany({
        where: { userId: session.user.id },
        include: {
          executions: {
            take: 5,
            orderBy: { startedAt: 'desc' },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.workflow.count({
        where: { userId: session.user.id },
      }),
    ])

    return NextResponse.json({
      workflows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '워크플로우 조회 실패' },
      { status: 500 }
    )
  }
}

// POST /api/workflows - 워크플로우 생성
export async function POST(req: NextRequest) {
  try {
    const session = await getUserSession()
    const body = await req.json()
    const { name, description, workflowData, tags } = body

    if (!name) {
      return NextResponse.json(
        { error: '워크플로우 이름은 필수입니다' },
        { status: 400 }
      )
    }

    // 워크플로우 생성 한도 확인
    await checkWorkflowLimit(session.user.id)

    // 워크플로우 생성
    const workflow = await prisma.workflow.create({
      data: {
        userId: session.user.id,
        name,
        description: description || '',
        workflowData: workflowData || {},
        tags: tags || [],
      },
    })

    // 구독의 워크플로우 카운트 업데이트
    await prisma.subscription.update({
      where: { userId: session.user.id },
      data: {
        workflowCount: { increment: 1 },
      },
    })

    return NextResponse.json(
      {
        message: '워크플로우가 생성되었습니다',
        workflow,
      },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '워크플로우 생성 실패' },
      { status: 500 }
    )
  }
}
