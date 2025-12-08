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
        endpoint: '/api/dashboard/stats',
        statusCode: 401
      })
      return NextResponse.json(
        { error: "인증되지 않았습니다" },
        { status: 401 }
      )
    }
    
    const userId = (session.user as any).id
    const currentMonth = new Date().toISOString().slice(0, 7)
    
    // 현재 월 사용량 데이터
    let usage = await prisma.usage.findUnique({
      where: {
        userId_month: {
          userId,
          month: currentMonth,
        }
      }
    })
    
    // 사용량 데이터가 없으면 기본값 생성
    if (!usage) {
      usage = await prisma.usage.create({
        data: {
          userId,
          month: currentMonth,
          workflowsCount: 0,
          executionsCount: 0,
          aiShortsCount: 0,
          storageUsed: 0,
        }
      })
    }
    
    // 최근 7일간 실행 데이터 (Mock - 실제 실행 로그 테이블이 있다면 변경 필요)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return {
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        executions: Math.floor(usage!.executionsCount / 7) + Math.floor(Math.random() * 20),
        success: Math.floor(usage!.executionsCount / 7) + Math.floor(Math.random() * 15),
        failed: Math.floor(Math.random() * 5),
      }
    })
    
    // 주간 활동 데이터 (Mock - 실제 일별 로그가 있다면 변경 필요)
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const dailyStats = weekDays.map(day => ({
      day,
      workflows: Math.floor(usage!.workflowsCount / 7) + Math.floor(Math.random() * 3),
      executions: Math.floor(usage!.executionsCount / 7) + Math.floor(Math.random() * 20),
    }))
    
    metricsStore.addMetric({
      timestamp: Date.now(),
      responseTime: Date.now() - startTime,
      endpoint: '/api/dashboard/stats',
      statusCode: 200
    })
    
    return NextResponse.json({
      workflows: {
        total: usage.workflowsCount,
        active: Math.floor(usage.workflowsCount * 0.7), // 70% 활성화로 가정
      },
      executions: {
        today: Math.floor(usage.executionsCount / 30), // 월 평균을 일 단위로
        thisWeek: Math.floor(usage.executionsCount / 4), // 월을 4주로 나눔
        thisMonth: usage.executionsCount,
      },
      aiShorts: {
        generated: usage.aiShortsCount,
        pending: 0, // 대기 중인 쇼츠는 별도 테이블 필요
      },
      storage: {
        used: `${(usage.storageUsed / 1024).toFixed(1)} GB`,
        limit: "10 GB", // 구독 플랜에 따라 다름
        percentage: Math.min(Math.round((usage.storageUsed / 1024 / 10) * 100), 100),
      },
      chartData: {
        executionTrend: last7Days,
        workflowActivity: [
          { name: 'Active', value: Math.floor(usage.workflowsCount * 0.7) },
          { name: 'Inactive', value: Math.floor(usage.workflowsCount * 0.3) },
        ],
        dailyStats,
      }
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    metricsStore.addMetric({
      timestamp: Date.now(),
      responseTime: Date.now() - startTime,
      endpoint: '/api/dashboard/stats',
      statusCode: 500
    })
    return NextResponse.json(
      { error: "대시보드 통계를 불러오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
