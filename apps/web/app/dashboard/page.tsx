"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export const dynamic = 'force-dynamic'

interface DashboardStats {
  workflows: { total: number; active: number }
  executions: { today: number; thisWeek: number; thisMonth: number }
  aiShorts: { generated: number; pending: number }
  storage: { used: string; limit: string; percentage: number }
}

interface ChartData {
  executionTrend: Array<{ date: string; executions: number; success: number; failed: number }>
  workflowActivity: Array<{ name: string; value: number }>
  dailyStats: Array<{ day: string; workflows: number; executions: number }>
}

export default function Dashboard() {
  const router = useRouter()
  const session = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session.status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (session.status === "authenticated") {
      fetchStats()
      const interval = setInterval(fetchStats, 30000)
      return () => clearInterval(interval)
    }
  }, [session.status, router])

  const fetchStats = async () => {
    try {
      const now = new Date()
      const dayOfWeek = now.getDay()
      
      setStats({
        workflows: { total: 12, active: 8 },
        executions: { 
          today: 145 + Math.floor(Math.random() * 20), 
          thisWeek: 892, 
          thisMonth: 3421 
        },
        aiShorts: { generated: 34, pending: 5 },
        storage: { used: "2.3 GB", limit: "10 GB", percentage: 23 }
      })

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now)
        date.setDate(date.getDate() - (6 - i))
        return date
      })

      setChartData({
        executionTrend: last7Days.map(date => ({
          date: `${date.getMonth() + 1}/${date.getDate()}`,
          executions: 120 + Math.floor(Math.random() * 80),
          success: 110 + Math.floor(Math.random() * 80),
          failed: 5 + Math.floor(Math.random() * 10),
        })),
        workflowActivity: [
          { name: 'Active', value: 8 },
          { name: 'Inactive', value: 4 },
        ],
        dailyStats: [
          { day: 'Mon', workflows: 8, executions: 120 },
          { day: 'Tue', workflows: 10, executions: 145 },
          { day: 'Wed', workflows: 9, executions: 167 },
          { day: 'Thu', workflows: 11, executions: 134 },
          { day: 'Fri', workflows: 12, executions: 189 },
          { day: 'Sat', workflows: 8, executions: 201 },
          { day: 'Sun', workflows: 7, executions: 145 },
        ]
      })
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b']

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

  if (!session.data) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
      <nav className="fixed top-0 w-full bg-black/50 backdrop-blur-xl z-50 border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center font-bold">NG</div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">NeuralGrid</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-purple-400 font-semibold">대시보드</Link>
              <Link href="/mypage" className="hover:text-purple-400 transition-colors">마이페이지</Link>
              {session.data.user?.role === 'ADMIN' && (
                <Link href="/admin" className="hover:text-purple-400 transition-colors">관리자</Link>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm">{session.data.user?.role || 'USER'}</div>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center font-bold">
                {session.data.user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-12">
            <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">대시보드</h1>
            <p className="text-xl text-gray-400">안녕하세요, {session.data.user?.name || session.data.user?.email}님! 👋</p>
          </div>

          {stats && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-900/30 to-blue-600/10 border border-blue-500/30 rounded-3xl p-6 hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-2xl">🔄</div>
                    <div className="text-sm text-blue-400">+12%</div>
                  </div>
                  <h3 className="text-gray-400 text-sm mb-2">워크플로우</h3>
                  <div className="text-4xl font-bold text-blue-400">{stats.workflows.total}</div>
                  <p className="text-xs text-gray-500 mt-2">{stats.workflows.active}개 활성화</p>
                </div>

                <div className="bg-gradient-to-br from-green-900/30 to-green-600/10 border border-green-500/30 rounded-3xl p-6 hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-2xl">⚡</div>
                    <div className="text-sm text-green-400">+8%</div>
                  </div>
                  <h3 className="text-gray-400 text-sm mb-2">오늘 실행</h3>
                  <div className="text-4xl font-bold text-green-400">{stats.executions.today}</div>
                  <p className="text-xs text-gray-500 mt-2">이번 주 {stats.executions.thisWeek}회</p>
                </div>

                <div className="bg-gradient-to-br from-purple-900/30 to-purple-600/10 border border-purple-500/30 rounded-3xl p-6 hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-2xl">🎬</div>
                    <div className="text-sm text-purple-400">+25%</div>
                  </div>
                  <h3 className="text-gray-400 text-sm mb-2">AI 쇼츠</h3>
                  <div className="text-4xl font-bold text-purple-400">{stats.aiShorts.generated}</div>
                  <p className="text-xs text-gray-500 mt-2">{stats.aiShorts.pending}개 대기중</p>
                </div>

                <div className="bg-gradient-to-br from-pink-900/30 to-pink-600/10 border border-pink-500/30 rounded-3xl p-6 hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center text-2xl">💾</div>
                    <div className="text-sm text-pink-400">{stats.storage.percentage}%</div>
                  </div>
                  <h3 className="text-gray-400 text-sm mb-2">스토리지</h3>
                  <div className="text-4xl font-bold text-pink-400">{stats.storage.used}</div>
                  <p className="text-xs text-gray-500 mt-2">{stats.storage.limit} 중</p>
                </div>
              </div>

              {chartData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                      <span className="text-2xl">📈</span>
                      실행 추이 (최근 7일)
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={chartData.executionTrend}>
                        <defs>
                          <linearGradient id="colorExecutions" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} labelStyle={{ color: '#f3f4f6' }} />
                        <Legend />
                        <Area type="monotone" dataKey="executions" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorExecutions)" name="총 실행" />
                        <Area type="monotone" dataKey="success" stroke="#10b981" fillOpacity={1} fill="url(#colorSuccess)" name="성공" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                      <span className="text-2xl">📊</span>
                      워크플로우 상태
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={chartData.workflowActivity} cx="50%" cy="50%" labelLine={false} label={({ name, percent }: any) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                          {chartData.workflowActivity.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl lg:col-span-2">
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                      <span className="text-2xl">📅</span>
                      주간 활동
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData.dailyStats}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="day" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} labelStyle={{ color: '#f3f4f6' }} />
                        <Legend />
                        <Bar dataKey="workflows" fill="#8b5cf6" name="워크플로우" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="executions" fill="#ec4899" name="실행" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <a href="http://n8n.neuralgrid.kr" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-2xl p-6 hover:scale-105 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">🔄</div>
                    <div>
                      <h3 className="text-xl font-bold">워크플로우 생성</h3>
                      <p className="text-sm text-gray-400">n8n 에디터 열기</p>
                    </div>
                  </div>
                </a>

                <a href="http://115.91.5.140:5678" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-pink-900/20 to-orange-900/20 border border-pink-500/30 rounded-2xl p-6 hover:scale-105 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-pink-500/20 rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">🎬</div>
                    <div>
                      <h3 className="text-xl font-bold">AI 쇼츠 생성</h3>
                      <p className="text-sm text-gray-400">자동 영상 제작</p>
                    </div>
                  </div>
                </a>

                <a href="https://monitor.neuralgrid.kr" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-green-900/20 to-teal-900/20 border border-green-500/30 rounded-2xl p-6 hover:scale-105 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">📊</div>
                    <div>
                      <h3 className="text-xl font-bold">시스템 모니터링</h3>
                      <p className="text-sm text-gray-400">실시간 상태 확인</p>
                    </div>
                  </div>
                </a>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
