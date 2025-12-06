import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@neuralgrid/database'
import { checkAdminPermission } from '@/lib/api/admin'

// GET /api/admin/users - 사용자 목록 조회
export async function GET(req: NextRequest) {
  try {
    await checkAdminPermission()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          subscription: true,
          _count: {
            select: {
              workflows: true,
              executions: true,
              payments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      users: users.map((u) => ({
        ...u,
        password: undefined, // 비밀번호 제외
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '사용자 목록 조회 실패' },
      { status: error.message.includes('권한') ? 403 : 500 }
    )
  }
}
