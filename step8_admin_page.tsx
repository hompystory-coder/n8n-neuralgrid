// Save this as: ~/n8n-neuralgrid/apps/web/app/admin/page.tsx

"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"

interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalWorkflows: number
  totalExecutions: number
  totalAiShorts: number
  totalStorage: number
  recentUsers: Array<{
    id: string
    name: string
    email: string
    role: string
    createdAt: string
  }>
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      if (session?.user?.role !== "ADMIN") {
        router.push("/dashboard")
      } else {
        fetchAdminStats()
      }
    }
  }, [status, session, router])

  const fetchAdminStats = async () => {
    try {
      const res = await fetch("/api/admin/stats")
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch admin stats:", error)
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

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="text-white">데이터를 불러올 수 없습니다</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Navigation */}
      <nav className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
                NeuralGrid Admin
              </h1>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-300 hover:text-white transition">
                대시보드
              </Link>
              <Link href="/mypage" className="text-gray-300 hover:text-white transition">
                마이페이지
              </Link>
              <Link href="/admin" className="text-white font-medium">
                관리자
              </Link>
              <Link href="https://monitor.neuralgrid.kr" className="text-gray-300 hover:text-white transition">
                모니터링
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-white mb-8">슈퍼 관리자 대시보드</h1>

        {/* System Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <p className="text-gray-400 text-sm mb-2">전체 사용자</p>
            <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <p className="text-gray-400 text-sm mb-2">활성 사용자</p>
            <p className="text-3xl font-bold text-green-400">{stats.activeUsers}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <p className="text-gray-400 text-sm mb-2">워크플로우</p>
            <p className="text-3xl font-bold text-purple-400">{stats.totalWorkflows}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <p className="text-gray-400 text-sm mb-2">실행 횟수</p>
            <p className="text-3xl font-bold text-blue-400">{stats.totalExecutions}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <p className="text-gray-400 text-sm mb-2">AI 쇼츠</p>
            <p className="text-3xl font-bold text-pink-400">{stats.totalAiShorts}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <p className="text-gray-400 text-sm mb-2">저장공간</p>
            <p className="text-3xl font-bold text-yellow-400">{stats.totalStorage.toFixed(1)}GB</p>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-xl mb-8">
          <h3 className="text-xl font-bold text-white mb-6">최근 가입 사용자</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">이름</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">이메일</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">역할</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">가입일</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentUsers.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="py-3 px-4 text-white">{user.name}</td>
                    <td className="py-3 px-4 text-gray-300">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === "ADMIN" 
                          ? "bg-purple-500/20 text-purple-400" 
                          : "bg-blue-500/20 text-blue-400"
                      }`}>
                        {user.role === "ADMIN" ? "관리자" : "사용자"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Link href="https://monitor.neuralgrid.kr" className="block">
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/50 transition cursor-pointer">
              <div className="text-3xl mb-3">📊</div>
              <h4 className="text-lg font-bold text-white mb-2">서버 모니터링</h4>
              <p className="text-gray-400 text-sm">실시간 서버 상태 확인</p>
            </div>
          </Link>
          <Link href="https://n8n.neuralgrid.kr" className="block">
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/50 transition cursor-pointer">
              <div className="text-3xl mb-3">⚙️</div>
              <h4 className="text-lg font-bold text-white mb-2">n8n 관리</h4>
              <p className="text-gray-400 text-sm">워크플로우 관리</p>
            </div>
          </Link>
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl rounded-xl p-6 border border-green-500/20 hover:border-green-500/50 transition cursor-pointer">
            <div className="text-3xl mb-3">👥</div>
            <h4 className="text-lg font-bold text-white mb-2">사용자 관리</h4>
            <p className="text-gray-400 text-sm">사용자 권한 설정</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-xl rounded-xl p-6 border border-yellow-500/20 hover:border-yellow-500/50 transition cursor-pointer">
            <div className="text-3xl mb-3">📈</div>
            <h4 className="text-lg font-bold text-white mb-2">분석 리포트</h4>
            <p className="text-gray-400 text-sm">사용량 통계 및 분석</p>
          </div>
        </div>
      </div>
    </div>
  )
}
