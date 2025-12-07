import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@neuralgrid/database'

// POST /api/webhooks/toss - Toss Payments Webhook 핸들러
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('Toss Webhook received:', body)

    const { eventType, data } = body

    switch (eventType) {
      case 'PAYMENT_CONFIRMED':
        await handlePaymentConfirmed(data)
        break

      case 'PAYMENT_CANCELED':
        await handlePaymentCanceled(data)
        break

      case 'VIRTUAL_ACCOUNT_ISSUED':
        await handleVirtualAccountIssued(data)
        break

      default:
        console.log(`Unhandled event type: ${eventType}`)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Toss Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentConfirmed(data: any) {
  const { paymentKey, orderId } = data

  // 결제 기록 조회
  const payment = await prisma.payment.findFirst({
    where: { pgOrderId: orderId },
  })

  if (!payment) {
    console.error('Payment not found:', orderId)
    return
  }

  // 결제 상태 업데이트
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'COMPLETED',
      pgPaymentKey: paymentKey,
      paidAt: new Date(),
    },
  })

  // 구독 활성화
  const subscription = await prisma.subscription.findFirst({
    where: { userId: payment.userId },
  })

  if (subscription) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })
  }

  console.log('Payment confirmed:', orderId)
}

async function handlePaymentCanceled(data: any) {
  const { orderId } = data

  // 결제 기록 업데이트
  await prisma.payment.updateMany({
    where: { pgOrderId: orderId },
    data: {
      status: 'CANCELED',
    },
  })

  console.log('Payment canceled:', orderId)
}

async function handleVirtualAccountIssued(data: any) {
  const { orderId } = data

  // 가상계좌 정보 저장
  await prisma.payment.updateMany({
    where: { pgOrderId: orderId },
    data: {
      paymentMethod: '가상계좌',
      status: 'PENDING',
    },
  })

  console.log('Virtual account issued:', orderId)
}
