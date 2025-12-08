export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"
import { measureResponseTime } from "@/lib/monitoring/metrics"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  const startTime = Date.now()
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "인증되지 않았습니다" },
        { status: 401 }
      )
    }
    
    if ((session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "권한이 없습니다" },
        { status: 403 }
      )
    }
    
    const { result: totalUsers } = await measureResponseTime(
      () => prisma.user.count(),
      '/api/admin/stats - user.count'
    )
    const activeUsers = await prisma.subscription.count({
      where: { status: "ACTIVE" }
    })
    
    const currentMonth = new Date().toISOString().slice(0, 7)
    const usageStats = await prisma.usage.aggregate({
      where: { month: currentMonth },
      _sum: {
        workflowsCount: true,
        executionsCount: true,
        aiShortsCount: true,
        storageUsed: true,
      }
    })
    
    const recentUsers = await prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    })
    
    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalWorkflows: usageStats._sum.workflowsCount || 0,
      totalExecutions: usageStats._sum.executionsCount || 0,
      totalAiShorts: usageStats._sum.aiShortsCount || 0,
      totalStorage: usageStats._sum.storageUsed || 0,
      recentUsers,
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json(
      { error: "통계를 불러오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
