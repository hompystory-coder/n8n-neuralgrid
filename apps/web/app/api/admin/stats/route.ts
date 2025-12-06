import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@neuralgrid/database'
import { checkAdminPermission } from '@/lib/api/admin'

// GET /api/admin/stats - 전체 통계 조회
export async function GET(req: NextRequest) {
  try {
    await checkAdminPermission()

    // 병렬로 통계 수집
    const [
      totalUsers,
      activeUsers,
      totalWorkflows,
      activeWorkflows,
      totalExecutions,
      totalPayments,
      revenueThisMonth,
    ] = await Promise.all([
      // 전체 사용자 수
      prisma.user.count(),
      
      // 활성 사용자 수
      prisma.user.count({
        where: { isActive: true },
      }),
      
      // 전체 워크플로우 수
      prisma.workflow.count(),
      
      // 활성 워크플로우 수
      prisma.workflow.count({
        where: { isActive: true },
      }),
      
      // 전체 실행 수
      prisma.workflowExecution.count(),
      
      // 전체 결제 수
      prisma.payment.count({
        where: { status: 'COMPLETED' },
      }),
      
      // 이번 달 매출
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          paidAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: {
          amount: true,
        },
      }),
    ])

    // 플랜별 사용자 분포
    const usersByPlan = await prisma.subscription.groupBy({
      by: ['plan'],
      _count: true,
    })

    // 최근 가입 사용자
    const recentUsers = await prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        role: true,
      },
    })

    return NextResponse.json({
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
        },
        workflows: {
          total: totalWorkflows,
          active: activeWorkflows,
        },
        executions: {
          total: totalExecutions,
        },
        payments: {
          total: totalPayments,
          revenueThisMonth: revenueThisMonth._sum.amount || 0,
        },
        usersByPlan: usersByPlan.map((p) => ({
          plan: p.plan,
          count: p._count,
        })),
      },
      recentUsers,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '통계 조회 실패' },
      { status: error.message.includes('권한') ? 403 : 500 }
    )
  }
}
