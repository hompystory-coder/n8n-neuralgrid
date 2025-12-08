// Save this as: ~/n8n-neuralgrid/apps/web/app/mypage/page.tsx

"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"

interface UserData {
  user: {
    id: string
    name: string
    email: string
    role: string
    createdAt: string
  }
  subscription: {
    plan: string
    status: string
    startDate: string
  }
  usage: {
    workflowsCount: number
    executionsCount: number
    aiShortsCount: number
    storageUsed: number
  }
}

export default function MyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      fetchUserData()
    }
  }, [status, router])

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/user/profile")
      if (res.ok) {
        const data = await res.json()
        setUserData(data)
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="text-white">로딩 중...</div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="text-white">데이터를 불러올 수 없습니다</div>
      </div>
    )
  }

  const planNames = {
    FREE: "무료",
    STARTER: "스타터",
    PROFESSIONAL: "프로페셔널",
    ENTERPRISE: "엔터프라이즈"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Navigation */}
      <nav className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
                NeuralGrid
              </h1>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-300 hover:text-white transition">
                대시보드
              </Link>
              <Link href="/mypage" className="text-white font-medium">
                마이페이지
              </Link>
              {session?.user?.role === "ADMIN" && (
                <Link href="/admin" className="text-gray-300 hover:text-white transition">
                  관리자
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-white mb-8">마이페이지</h1>

        {/* Profile Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-xl mb-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
              {userData.user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{userData.user.name}</h2>
              <p className="text-gray-400">{userData.user.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                가입일: {new Date(userData.user.createdAt).toLocaleDateString("ko-KR")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-gray-400 text-sm mb-1">역할</p>
              <p className="text-white font-medium">
                {userData.user.role === "ADMIN" ? "관리자" : "사용자"}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-gray-400 text-sm mb-1">구독 플랜</p>
              <p className="text-white font-medium">
                {planNames[userData.subscription.plan as keyof typeof planNames]}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-gray-400 text-sm mb-1">상태</p>
              <p className="text-green-400 font-medium">
                {userData.subscription.status === "ACTIVE" ? "활성" : "비활성"}
              </p>
            </div>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-xl mb-6">
          <h3 className="text-xl font-bold text-white mb-6">이번 달 사용량</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text mb-2">
                {userData.usage.workflowsCount}
              </div>
              <p className="text-gray-400 text-sm">워크플로우</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text mb-2">
                {userData.usage.executionsCount}
              </div>
              <p className="text-gray-400 text-sm">실행 횟수</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text mb-2">
                {userData.usage.aiShortsCount}
              </div>
              <p className="text-gray-400 text-sm">AI 쇼츠</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text mb-2">
                {userData.usage.storageUsed.toFixed(1)}GB
              </div>
              <p className="text-gray-400 text-sm">저장공간</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/dashboard" className="block">
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition cursor-pointer">
              <h4 className="text-lg font-bold text-white mb-2">대시보드</h4>
              <p className="text-gray-400 text-sm">워크플로우 관리 및 모니터링</p>
            </div>
          </Link>
          <Link href="https://shorts.neuralgrid.kr" className="block">
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition cursor-pointer">
              <h4 className="text-lg font-bold text-white mb-2">AI 쇼츠 생성</h4>
              <p className="text-gray-400 text-sm">자동으로 숏폼 콘텐츠 생성</p>
            </div>
          </Link>
          <Link href="https://n8n.neuralgrid.kr" className="block">
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition cursor-pointer">
              <h4 className="text-lg font-bold text-white mb-2">n8n 편집기</h4>
              <p className="text-gray-400 text-sm">워크플로우 편집 및 생성</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
