// Save this as: ~/n8n-neuralgrid/apps/web/app/api/admin/stats/route.ts

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check authentication
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "인증되지 않았습니다" },
        { status: 401 }
      )
    }
    
    // Check admin role
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "권한이 없습니다" },
        { status: 403 }
      )
    }
    
    // Get total users
    const totalUsers = await prisma.user.count()
    
    // Get active users (users with active subscriptions)
    const activeUsers = await prisma.subscription.count({
      where: { status: "ACTIVE" }
    })
    
    // Get current month
    const currentMonth = new Date().toISOString().slice(0, 7)
    
    // Get total usage stats
    const usageStats = await prisma.usage.aggregate({
      where: { month: currentMonth },
      _sum: {
        workflowsCount: true,
        executionsCount: true,
        aiShortsCount: true,
        storageUsed: true,
      }
    })
    
    // Get recent users (last 10)
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
