import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@neuralgrid/database'
import { getUserSession } from '@/lib/api/auth'
import { cancelPayment } from '@/lib/payments/toss'

// POST /api/payments/cancel - 결제 취소
export async function POST(req: NextRequest) {
  try {
    const session = await getUserSession()
    const { paymentKey, cancelReason } = await req.json()

    if (!paymentKey) {
      return NextResponse.json(
        { error: 'paymentKey가 필요합니다' },
        { status: 400 }
      )
    }

    // 결제 기록 조회
    const payment = await prisma.payment.findFirst({
      where: {
        pgPaymentKey: paymentKey,
        userId: session.user.id,
      },
    })

    if (!payment) {
      return NextResponse.json(
        { error: '결제 정보를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // Toss Payments API로 결제 취소
    await cancelPayment(paymentKey, cancelReason || '사용자 요청')

    // 결제 상태 업데이트
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'CANCELED',
      },
    })

    // 구독을 FREE 플랜으로 다운그레이드
    await prisma.subscription.update({
      where: { userId: session.user.id },
      data: {
        plan: 'FREE',
        price: 0,
        executionLimit: 1000,
        workflowLimit: 3,
        status: 'CANCELED',
        canceledAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: '결제가 취소되었습니다',
    })
  } catch (error: any) {
    console.error('Payment cancellation error:', error)
    return NextResponse.json(
      { error: error.message || '결제 취소 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
