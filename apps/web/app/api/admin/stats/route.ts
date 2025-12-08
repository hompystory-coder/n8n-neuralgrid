export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"
import { metricsStore } from "@/lib/monitoring/metrics"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  const startTime = Date.now()
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      metricsStore.addMetric({
        timestamp: Date.now(),
        responseTime: Date.now() - startTime,
        endpoint: '/api/admin/stats',
        statusCode: 401
      })
      return NextResponse.json(
        { error: "인증되지 않았습니다" },
        { status: 401 }
      )
    }
    
    if ((session.user as any).role !== "ADMIN") {
      metricsStore.addMetric({
        timestamp: Date.now(),
        responseTime: Date.now() - startTime,
        endpoint: '/api/admin/stats',
        statusCode: 403
      })
      return NextResponse.json(
        { error: "권한이 없습니다" },
        { status: 403 }
      )
    }
    
    const totalUsers = await prisma.user.count()
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
    
    metricsStore.addMetric({
      timestamp: Date.now(),
      responseTime: Date.now() - startTime,
      endpoint: '/api/admin/stats',
      statusCode: 200
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
    metricsStore.addMetric({
      timestamp: Date.now(),
      responseTime: Date.now() - startTime,
      endpoint: '/api/admin/stats',
      statusCode: 500
    })
    return NextResponse.json(
      { error: "통계를 불러오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
