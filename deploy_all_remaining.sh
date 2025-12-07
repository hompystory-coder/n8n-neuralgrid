#!/bin/bash
set -e

cd ~/n8n-neuralgrid/apps/web

echo "=========================================="
echo "나머지 소스 파일 생성 중..."
echo "=========================================="

# 사용자 프로필 API
echo "[2/10] 사용자 프로필 API 생성..."
cat > app/api/user/profile/route.ts << 'EOF'
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
    
    const subscription = await prisma.subscription.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })
    
    const currentMonth = new Date().toISOString().slice(0, 7)
    let usage = await prisma.usage.findUnique({
      where: {
        userId_month: {
          userId: session.user.id,
          month: currentMonth,
        }
      }
    })
    
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
EOF
echo "✓ 사용자 프로필 API 완료"

# 관리자 통계 API
echo "[3/10] 관리자 통계 API 생성..."
cat > app/api/admin/stats/route.ts << 'EOF'
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
    
    if (session.user.role !== "ADMIN") {
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
EOF
echo "✓ 관리자 통계 API 완료"

echo ""
echo "=========================================="
echo "✓ API 파일 생성 완료!"
echo "이제 페이지 파일을 생성합니다..."
echo "  bash ~/n8n-neuralgrid/deploy_pages.sh"
echo "=========================================="
