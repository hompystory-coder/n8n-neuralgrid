// Save this as: ~/n8n-neuralgrid/apps/web/app/api/user/profile/route.ts

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "인증되지 않았습니다" },
        { status: 401 }
      )
    }
    
    // Fetch user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다" },
        { status: 404 }
      )
    }
    
    // Fetch subscription
    const subscription = await prisma.subscription.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })
    
    // Fetch current month usage
    const currentMonth = new Date().toISOString().slice(0, 7)
    let usage = await prisma.usage.findUnique({
      where: {
        userId_month: {
          userId: session.user.id,
          month: currentMonth,
        }
      }
    })
    
    // Create usage record if not exists
    if (!usage) {
      usage = await prisma.usage.create({
        data: {
          userId: session.user.id,
          month: currentMonth,
          workflowsCount: 0,
          executionsCount: 0,
          aiShortsCount: 0,
          storageUsed: 0,
        }
      })
    }
    
    return NextResponse.json({
      user,
      subscription: subscription || {
        plan: "FREE",
        status: "ACTIVE",
        startDate: user.createdAt,
      },
      usage: {
        workflowsCount: usage.workflowsCount,
        executionsCount: usage.executionsCount,
        aiShortsCount: usage.aiShortsCount,
        storageUsed: usage.storageUsed,
      }
    })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json(
      { error: "프로필을 불러오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
