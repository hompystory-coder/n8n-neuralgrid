import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@neuralgrid/database'

// GET /api/templates/[id] - 템플릿 상세 조회
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const template = await prisma.template.findUnique({
      where: { id: params.id },
    })

    if (!template) {
      return NextResponse.json(
        { error: '템플릿을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    return NextResponse.json({ template })
  } catch (error: any) {
    return NextResponse.json(
      { error: '템플릿 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}
