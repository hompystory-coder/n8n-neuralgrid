// Toss Payments API 헬퍼

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY || ''
const TOSS_CLIENT_KEY = process.env.TOSS_CLIENT_KEY || ''

export async function confirmPayment(paymentKey: string, orderId: string, amount: number) {
  const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(TOSS_SECRET_KEY + ':').toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      paymentKey,
      orderId,
      amount,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Payment confirmation failed')
  }

  return response.json()
}

export async function cancelPayment(paymentKey: string, cancelReason: string) {
  const response = await fetch(`https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(TOSS_SECRET_KEY + ':').toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cancelReason,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Payment cancellation failed')
  }

  return response.json()
}

export function getTossClientKey() {
  return TOSS_CLIENT_KEY
}
