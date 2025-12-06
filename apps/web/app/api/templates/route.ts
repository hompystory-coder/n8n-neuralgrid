import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@neuralgrid/database'
import { getUserSession } from '@/lib/api/auth'

// GET /api/templates - 템플릿 목록 조회
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')

    const where: any = {}

    if (category) {
      where.category = category
    }

    if (featured === 'true') {
      where.featured = true
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const templates = await prisma.template.findMany({
      where,
      orderBy: { usageCount: 'desc' },
      take: 50,
    })

    return NextResponse.json({
      templates: templates.map((t) => ({
        ...t,
        workflowData: undefined, // 목록에서는 데이터 제외
      })),
      total: templates.length,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: '템플릿 목록 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}

// POST /api/templates - 템플릿 생성 (워크플로우를 템플릿으로 공유)
export async function POST(req: NextRequest) {
  try {
    const session = await getUserSession()
    
    // 관리자 권한 체크
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다' },
        { status: 403 }
      )
    }

    const { workflowId, name, description, category, tags } = await req.json()

    if (!workflowId) {
      return NextResponse.json(
        { error: 'workflowId가 필요합니다' },
        { status: 400 }
      )
    }

    // 워크플로우 조회
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    })

    if (!workflow) {
      return NextResponse.json(
        { error: '워크플로우를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 템플릿 생성
    const template = await prisma.template.create({
      data: {
        name: name || workflow.name,
        description: description || workflow.description || '',
        category: category || 'general',
        tags: tags || workflow.tags,
        workflowData: workflow.workflowData,
        authorId: user.id,
      },
    })

    return NextResponse.json({
      success: true,
      template: {
        ...template,
        workflowData: undefined,
      },
      message: '템플릿이 생성되었습니다',
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: '템플릿 생성에 실패했습니다' },
      { status: 500 }
    )
  }
}
