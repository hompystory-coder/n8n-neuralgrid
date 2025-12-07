import { prisma } from '@neuralgrid/database'
import { getUserWithSubscription } from './auth'

export async function checkWorkflowLimit(userId: string) {
  const user = await getUserWithSubscription(userId)
  const subscription = user.subscription

  if (subscription.workflowCount >= subscription.workflowLimit) {
    throw new Error(
      `워크플로우 생성 한도에 도달했습니다. (${subscription.workflowLimit}개)\n플랜을 업그레이드하시겠습니까?`
    )
  }

  return true
}

export async function checkExecutionLimit(userId: string) {
  const user = await getUserWithSubscription(userId)
  const subscription = user.subscription

  if (subscription.executionCount >= subscription.executionLimit) {
    throw new Error(
      `이번 달 실행 한도에 도달했습니다. (${subscription.executionLimit}회)\n플랜을 업그레이드하시겠습니까?`
    )
  }

  return true
}
