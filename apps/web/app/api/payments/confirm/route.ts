import { NextRequest, NextResponse } from 'next/server'
import { prisma, SubscriptionPlan } from '@neuralgrid/database'
import { getUserSession } from '@/lib/api/auth'
import { confirmPayment } from '@/lib/payments/toss'

// POST /api/payments/confirm - 결제 승인
export async function POST(req: NextRequest) {
  try {
    const session = await getUserSession()
    const { paymentKey, orderId, amount, planType } = await req.json()

    if (!paymentKey || !orderId || !amount || !planType) {
      return NextResponse.json(
        { error: '필수 파라미터가 누락되었습니다' },
        { status: 400 }
      )
    }

    // Toss Payments API로 결제 승인
    const paymentData = await confirmPayment(paymentKey, orderId, amount)

    if (paymentData.status !== 'DONE') {
      return NextResponse.json(
        { error: '결제 승인에 실패했습니다' },
        { status: 400 }
      )
    }

    // 플랜별 한도 설정
    const planLimits = {
      FREE: { executionLimit: 1000, workflowLimit: 3, price: 0 },
      PRO: { executionLimit: 10000, workflowLimit: -1, price: 29000 },
      ENTERPRISE: { executionLimit: -1, workflowLimit: -1, price: 99000 },
    }

    const limits = planLimits[planType as keyof typeof planLimits]

    // 사용자 구독 업데이트
    const now = new Date()
    const periodEnd = new Date(now)
    periodEnd.setMonth(periodEnd.getMonth() + 1)

    await prisma.subscription.update({
      where: { userId: session.user.id },
      data: {
        plan: planType as SubscriptionPlan,
        price: limits.price,
        executionLimit: limits.executionLimit,
        workflowLimit: limits.workflowLimit,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    })

    // 결제 기록 저장
    await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount,
        status: 'COMPLETED',
        plan: planType as SubscriptionPlan,
        billingCycle: 'monthly',
        pgProvider: 'toss',
        pgOrderId: orderId,
        pgPaymentKey: paymentKey,
        paymentMethod: paymentData.method,
        cardInfo: paymentData.card ? `${paymentData.card.company} (${paymentData.card.number})` : null,
        receiptUrl: paymentData.receipt?.url,
        paidAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: '결제가 완료되었습니다',
      plan: planType,
    })
  } catch (error: any) {
    console.error('Payment confirmation error:', error)
    return NextResponse.json(
      { error: error.message || '결제 처리 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
