"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"

interface ProfileData {
  user: {
    id: string
    name: string | null
    email: string
    role: string
    createdAt: string
  }
  subscription: {
    plan: string
    status: string
    currentPeriodEnd: string | null
  } | null
  usage: {
    workflowCount: number
    executionCount: number
    storageUsed: string
  }
}

export default function MyPage() {
  const router = useRouter()
  const session = useSession()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session.status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (session.status === "authenticated") {
      fetchProfile()
    }
  }, [session.status, router])

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile")
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
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

  if (!session.data) {
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
                NeuralGrid
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="hover:text-purple-400 transition-colors">
                대시보드
              </Link>
              <Link href="/mypage" className="text-purple-400 font-semibold">
                마이페이지
              </Link>
              {session.data.user?.role === 'ADMIN' && (
                <Link href="/admin" className="hover:text-purple-400 transition-colors">
                  관리자
                </Link>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm">
                {session.data.user?.role || 'USER'}
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center font-bold">
                {session.data.user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center text-4xl font-bold shadow-2xl">
                {session.data.user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  마이페이지
                </h1>
                <p className="text-xl text-gray-400 mt-2">
                  안녕하세요, {session.data.user?.name || session.data.user?.email}님!
                </p>
              </div>
            </div>
          </div>

          {profile && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Profile Info */}
              <div className="lg:col-span-1 space-y-6">
                {/* Profile Card */}
                <div className="bg-gradient-to-br from-purple-900/30 to-purple-600/10 border border-purple-500/30 rounded-3xl p-8 backdrop-blur-xl">
                  <div className="text-center mb-6">
                    <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-5xl font-bold mx-auto mb-4 shadow-2xl">
                      {profile.user.name?.[0]?.toUpperCase() || profile.user.email[0].toUpperCase()}
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{profile.user.name || "사용자"}</h3>
                    <p className="text-gray-400 text-sm">{profile.user.email}</p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                      <span className="text-gray-400 text-sm">역할</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        profile.user.role === 'ADMIN' 
                          ? 'bg-red-500/20 border border-red-500/30 text-red-400'
                          : 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
                      }`}>
                        {profile.user.role}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                      <span className="text-gray-400 text-sm">가입일</span>
                      <span className="text-white text-sm font-semibold">
                        {new Date(profile.user.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl font-semibold hover:from-red-500 hover:to-orange-500 transition-all transform hover:scale-105"
                  >
                    로그아웃
                  </button>
                </div>

                {/* Quick Links */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                  <h3 className="text-lg font-bold mb-4">빠른 링크</h3>
                  <div className="space-y-2">
                    <Link href="/dashboard" className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all group">
                      <span className="text-2xl">📊</span>
                      <span className="font-semibold group-hover:text-purple-400 transition-colors">대시보드</span>
                    </Link>
                    <a href="http://n8n.neuralgrid.kr" className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all group">
                      <span className="text-2xl">🔄</span>
                      <span className="font-semibold group-hover:text-purple-400 transition-colors">워크플로우</span>
                    </a>
                    {profile.user.role === 'ADMIN' && (
                      <Link href="/admin" className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all group">
                        <span className="text-2xl">🛡️</span>
                        <span className="font-semibold group-hover:text-purple-400 transition-colors">관리자</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Stats & Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Usage Stats */}
                <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
                  <div className="p-8 border-b border-white/10">
                    <h2 className="text-2xl font-bold mb-2">사용량 통계</h2>
                    <p className="text-gray-400">이번 달 사용 현황</p>
                  </div>

                  <div className="p-8">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-br from-blue-900/30 to-blue-600/10 border border-blue-500/30 rounded-2xl p-6 hover:scale-105 transition-transform">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-2xl">
                            🔄
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">워크플로우</div>
                            <div className="text-3xl font-bold text-blue-400">{profile.usage.workflowCount}</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">생성된 워크플로우</div>
                      </div>

                      <div className="bg-gradient-to-br from-green-900/30 to-green-600/10 border border-green-500/30 rounded-2xl p-6 hover:scale-105 transition-transform">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-2xl">
                            ⚡
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">실행 횟수</div>
                            <div className="text-3xl font-bold text-green-400">{profile.usage.executionCount}</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">총 실행 횟수</div>
                      </div>

                      <div className="bg-gradient-to-br from-purple-900/30 to-purple-600/10 border border-purple-500/30 rounded-2xl p-6 hover:scale-105 transition-transform">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-2xl">
                            💾
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">스토리지</div>
                            <div className="text-3xl font-bold text-purple-400">{profile.usage.storageUsed}</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">사용 중인 용량</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subscription */}
                {profile.subscription && (
                  <div className="bg-gradient-to-br from-yellow-900/20 to-orange-600/10 border border-yellow-500/30 rounded-3xl p-8 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-yellow-500/20 rounded-2xl flex items-center justify-center text-3xl">
                          👑
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">구독 정보</h3>
                          <p className="text-gray-400 text-sm">현재 플랜 상태</p>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        profile.subscription.status === 'ACTIVE'
                          ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                          : 'bg-gray-500/20 border border-gray-500/30 text-gray-400'
                      }`}>
                        {profile.subscription.status}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-4 bg-white/5 rounded-xl">
                        <div className="text-sm text-gray-400 mb-1">플랜</div>
                        <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                          {profile.subscription.plan}
                        </div>
                      </div>

                      {profile.subscription.currentPeriodEnd && (
                        <div className="p-4 bg-white/5 rounded-xl">
                          <div className="text-sm text-gray-400 mb-1">갱신일</div>
                          <div className="text-xl font-bold text-white">
                            {new Date(profile.subscription.currentPeriodEnd).toLocaleDateString('ko-KR')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Activity Timeline */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                  <h3 className="text-2xl font-bold mb-6">활동 요약</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                      <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-2xl">
                        🎉
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">계정 생성</div>
                        <div className="text-sm text-gray-400">{new Date(profile.user.createdAt).toLocaleString('ko-KR')}</div>
                      </div>
                    </div>
                    
                    {profile.usage.workflowCount > 0 && (
                      <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-2xl">
                          🔄
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">워크플로우 생성</div>
                          <div className="text-sm text-gray-400">총 {profile.usage.workflowCount}개 생성됨</div>
                        </div>
                      </div>
                    )}
                    
                    {profile.usage.executionCount > 0 && (
                      <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-2xl">
                          ⚡
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">워크플로우 실행</div>
                          <div className="text-sm text-gray-400">총 {profile.usage.executionCount}회 실행됨</div>
                        </div>
                      </div>
                    )}
                    
                    {profile.usage.aiShortsCount > 0 && (
                      <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                        <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center text-2xl">
                          🎬
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">AI 쇼츠 생성</div>
                          <div className="text-sm text-gray-400">총 {profile.usage.aiShortsCount}개 생성됨</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
