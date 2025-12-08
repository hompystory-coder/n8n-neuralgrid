import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { metricsStore } from "@/lib/monitoring/metrics"

const prisma = new PrismaClient()

const signupSchema = z.object({
  email: z.string().email("유효한 이메일을 입력해주세요"),
  password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다"),
  name: z.string().min(2, "이름은 최소 2자 이상이어야 합니다"),
})

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  try {
    const body = await req.json()
    const validated = signupSchema.parse(body)
    
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email }
    })
    
    if (existingUser) {
      metricsStore.addMetric({
        timestamp: Date.now(),
        responseTime: Date.now() - startTime,
        endpoint: '/api/auth/signup',
        statusCode: 400
      })
      return NextResponse.json(
        { error: "이미 등록된 이메일입니다" },
        { status: 400 }
      )
    }
    
    const hashedPassword = await bcrypt.hash(validated.password, 12)
    
    const user = await prisma.user.create({
      data: {
        email: validated.email,
        password: hashedPassword,
        name: validated.name,
        role: "USER",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      }
    })
    
    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: "FREE",
        status: "ACTIVE",
      }
    })
    
    const currentMonth = new Date().toISOString().slice(0, 7)
    await prisma.usage.create({
      data: {
        userId: user.id,
        month: currentMonth,
        workflowsCount: 0,
        executionsCount: 0,
        aiShortsCount: 0,
        storageUsed: 0,
      }
    })
    
    metricsStore.addMetric({
      timestamp: Date.now(),
      responseTime: Date.now() - startTime,
      endpoint: '/api/auth/signup',
      statusCode: 201
    })
    
    return NextResponse.json(
      {
        message: "회원가입이 완료되었습니다",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      metricsStore.addMetric({
        timestamp: Date.now(),
        responseTime: Date.now() - startTime,
        endpoint: '/api/auth/signup',
        statusCode: 400
      })
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    
    console.error("Signup error:", error)
    metricsStore.addMetric({
      timestamp: Date.now(),
      responseTime: Date.now() - startTime,
      endpoint: '/api/auth/signup',
      statusCode: 500
    })
    return NextResponse.json(
      { error: "회원가입 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
