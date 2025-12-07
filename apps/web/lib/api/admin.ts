import { prisma, UserRole } from '@neuralgrid/database'
import { getUserSession } from './auth'

export async function checkAdminPermission() {
  const session = await getUserSession()
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user || user.role === 'USER') {
    throw new Error('관리자 권한이 필요합니다')
  }

  return user
}

export async function checkSuperAdminPermission() {
  const session = await getUserSession()
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user || user.role !== 'SUPER_ADMIN') {
    throw new Error('최고 관리자 권한이 필요합니다')
  }

  return user
}
