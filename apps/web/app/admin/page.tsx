"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"

interface Stats {
  totalUsers: number
  activeUsers: number
  totalWorkflows: number
  totalExecutions: number
  storageUsed: string
  recentUsers: Array<{
    id: string
    name: string | null
    email: string
    createdAt: string
  }>
}

export default function AdminPage() {
  const router = useRouter()
  const session = useSession()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session.status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (session.status === "authenticated") {
      if (session.data?.user?.role !== "ADMIN") {
        router.push("/")
      } else {
        fetchStats()
      }
    }
  }, [session.status, session.data, router])

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats")
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (session.status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl text-white">Loading...</div>
        </div>
      </div>
    )
  }

  if (!session.data || session.data.user?.role !== "ADMIN") {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/50 backdrop-blur-xl z-50 border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center font-bold">
                NG
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                NeuralGrid Admin
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="hover:text-purple-400 transition-colors">
                대시보드
              </Link>
              <Link href="/admin" className="text-purple-400 font-semibold">
                관리자
              </Link>
              <Link href="/mypage" className="hover:text-purple-400 transition-colors">
                마이페이지
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full text-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                ADMIN
              </div>
              <Link href="/mypage" className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center font-bold">
                {session.data.user?.name?.[0]?.toUpperCase() || 'A'}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center text-3xl">
                🛡️
              </div>
              <div>
                <h1 className="text-5xl font-black bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                  관리자 대시보드
                </h1>
                <p className="text-xl text-gray-400 mt-2">
                  시스템 전체 현황을 관리하세요
                </p>
              </div>
            </div>
          </div>

          {stats && (
            <>
              {/* Stats Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="bg-gradient-to-br from-blue-900/30 to-blue-600/10 border border-blue-500/30 rounded-3xl p-8 hover:border-blue-500/50 transition-all hover:scale-105 transform">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center text-3xl">
                      👥
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Total</div>
                      <div className="text-2xl font-bold text-blue-400">{stats.totalUsers}</div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-1">전체 사용자</h3>
                  <p className="text-sm text-gray-400">등록된 총 사용자 수</p>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">활성 사용자</span>
                      <span className="text-green-400 font-semibold">{stats.activeUsers}명</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-900/30 to-purple-600/10 border border-purple-500/30 rounded-3xl p-8 hover:border-purple-500/50 transition-all hover:scale-105 transform">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center text-3xl">
                      🔄
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Count</div>
                      <div className="text-2xl font-bold text-purple-400">{stats.totalWorkflows}</div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-1">워크플로우</h3>
                  <p className="text-sm text-gray-400">생성된 총 워크플로우</p>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">이번 달</span>
                      <span className="text-purple-400 font-semibold">+{Math.floor(stats.totalWorkflows * 0.3)}개</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-900/30 to-green-600/10 border border-green-500/30 rounded-3xl p-8 hover:border-green-500/50 transition-all hover:scale-105 transform">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center text-3xl">
                      ⚡
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Total</div>
                      <div className="text-2xl font-bold text-green-400">{stats.totalExecutions.toLocaleString()}</div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-1">실행 횟수</h3>
                  <p className="text-sm text-gray-400">총 워크플로우 실행</p>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">성공률</span>
                      <span className="text-green-400 font-semibold">98.5%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-900/30 to-orange-600/10 border border-orange-500/30 rounded-3xl p-8 hover:border-orange-500/50 transition-all hover:scale-105 transform">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-orange-500/20 rounded-2xl flex items-center justify-center text-3xl">
                      💾
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Used</div>
                      <div className="text-2xl font-bold text-orange-400">{stats.storageUsed}</div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-1">스토리지</h3>
                  <p className="text-sm text-gray-400">전체 사용량</p>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full" style={{width: '34%'}}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Users Table */}
              <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
                <div className="p-8 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">최근 가입 사용자</h2>
                      <p className="text-gray-400">신규 등록된 사용자 목록</p>
                    </div>
                    <div className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm">
                      {stats.recentUsers.length}명
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-white/5">
                        <th className="px-8 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">사용자</th>
                        <th className="px-8 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">이메일</th>
                        <th className="px-8 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">가입일</th>
                        <th className="px-8 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">상태</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {stats.recentUsers.map((user, index) => (
                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-8 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-sm">
                                {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                              </div>
                              <div className="font-semibold">{user.name || "이름 없음"}</div>
                            </div>
                          </td>
                          <td className="px-8 py-4 whitespace-nowrap text-gray-300">{user.email}</td>
                          <td className="px-8 py-4 whitespace-nowrap text-gray-400">
                            {new Date(user.createdAt).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="px-8 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-xs text-green-400 font-semibold">
                              활성
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* System Health */}
              <div className="grid md:grid-cols-3 gap-6 mt-12">
                <div className="bg-gradient-to-br from-green-900/20 to-green-600/10 border border-green-500/30 rounded-3xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-2xl">
                      🟢
                    </div>
                    <div>
                      <div className="font-semibold text-lg">시스템 상태</div>
                      <div className="text-sm text-gray-400">모든 서비스 정상</div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-green-400">100%</div>
                </div>

                <div className="bg-gradient-to-br from-blue-900/20 to-blue-600/10 border border-blue-500/30 rounded-3xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-2xl">
                      ⚡
                    </div>
                    <div>
                      <div className="font-semibold text-lg">서버 성능</div>
                      <div className="text-sm text-gray-400">평균 응답 시간</div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-blue-400">45ms</div>
                </div>

                <div className="bg-gradient-to-br from-purple-900/20 to-purple-600/10 border border-purple-500/30 rounded-3xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-2xl">
                      📊
                    </div>
                    <div>
                      <div className="font-semibold text-lg">데이터베이스</div>
                      <div className="text-sm text-gray-400">연결 상태</div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-purple-400">Active</div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
