"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

export const dynamic = 'force-dynamic'

interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalWorkflows: number
  totalExecutions: number
  storageUsed: string
  systemHealth: number
}

interface ChartData {
  userGrowth: Array<{ month: string; users: number; active: number }>
  executionStats: Array<{ date: string; executions: number; success: number; failed: number }>
  userDistribution: Array<{ name: string; value: number }>
  systemMetrics: Array<{ metric: string; value: number; fullMark: number }>
  topWorkflows: Array<{ name: string; executions: number }>
  cpuUsage: Array<{ time: string; usage: number; cores: number }>
  memoryUsage: Array<{ time: string; used: number; free: number; cached: number }>
  diskIO: Array<{ time: string; read: number; write: number }>
  networkTraffic: Array<{ time: string; incoming: number; outgoing: number }>
  responseTime: Array<{ time: string; api: number; db: number; cache: number }>
  errorRate: Array<{ time: string; rate: number; count: number }>
}

interface RecentUser {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: string
}

export default function AdminPage() {
  const router = useRouter()
  const session = useSession()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [loading, setLoading] = useState(true)
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>(null)
  const metricsHistoryRef = useRef<any[]>([])
  const [metricsHistory, setMetricsHistory] = useState<any[]>([])

  useEffect(() => {
    if (session.status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (session.status === "authenticated") {
      if (session.data?.user?.role !== "ADMIN") {
        router.push("/dashboard")
        return
      }
      fetchData()
      const interval = setInterval(fetchData, 5000)
      return () => clearInterval(interval)
    }
  }, [session.status, router])

  const fetchData = async () => {
    try {
      // 실제 시스템 메트릭 가져오기
      const metricsRes = await fetch('/api/system/metrics')
      if (metricsRes.ok) {
        const metrics = await metricsRes.json()
        setRealTimeMetrics(metrics)
        
        // 메트릭 히스토리에 추가 (최근 30개만 유지)
        const newHistory = [...metricsHistoryRef.current, { ...metrics, fetchedAt: new Date() }]
        metricsHistoryRef.current = newHistory.slice(-30)
        
        setStats({
          totalUsers: 247,
          activeUsers: 189,
          totalWorkflows: 1523,
          totalExecutions: 45678,
          storageUsed: metrics.memory ? `${metrics.memory.used} GB / ${metrics.memory.total} GB` : "127.5 GB",
          systemHealth: metrics.memory ? Math.round(100 - parseFloat(metrics.memory.usagePercent)) : 98
        })
      } else {
        setStats({
          totalUsers: 247,
          activeUsers: 189,
          totalWorkflows: 1523,
          totalExecutions: 45678,
          storageUsed: "127.5 GB",
          systemHealth: 98
        })
      }

      const now = new Date()
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date(now)
        date.setMonth(date.getMonth() - (5 - i))
        return date
      })

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now)
        date.setDate(date.getDate() - (6 - i))
        return date
      })

      const last24Hours = Array.from({ length: 24 }, (_, i) => {
        const date = new Date(now)
        date.setHours(date.getHours() - (23 - i))
        return date
      })

      const last30Minutes = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(now)
        date.setMinutes(date.getMinutes() - (29 - i))
        return date
      })

      setChartData({
        userGrowth: last6Months.map(date => ({
          month: date.toLocaleDateString('ko-KR', { month: 'short' }),
          users: 150 + Math.floor(Math.random() * 100),
          active: 100 + Math.floor(Math.random() * 80),
        })),
        executionStats: last7Days.map(date => ({
          date: `${date.getMonth() + 1}/${date.getDate()}`,
          executions: 5000 + Math.floor(Math.random() * 2000),
          success: 4500 + Math.floor(Math.random() * 1800),
          failed: 100 + Math.floor(Math.random() * 200),
        })),
        userDistribution: [
          { name: 'Free', value: 120 },
          { name: 'Pro', value: 87 },
          { name: 'Business', value: 40 },
        ],
        systemMetrics: realTimeMetrics ? [
          { metric: 'CPU', value: parseFloat(realTimeMetrics.cpu.usage), fullMark: 100 },
          { metric: 'Memory', value: parseFloat(realTimeMetrics.memory.usagePercent), fullMark: 100 },
          { metric: 'Disk', value: Math.min(parseFloat(realTimeMetrics.disk.write) * 10, 100), fullMark: 100 },
          { metric: 'Network', value: Math.min((parseFloat(realTimeMetrics.network.received) + parseFloat(realTimeMetrics.network.transmitted)) / 100, 100), fullMark: 100 },
          { metric: 'Uptime', value: Math.min(realTimeMetrics.system.uptime / 864000 * 100, 100), fullMark: 100 },
        ] : [
          { metric: 'CPU', value: 65, fullMark: 100 },
          { metric: 'Memory', value: 78, fullMark: 100 },
          { metric: 'Disk', value: 45, fullMark: 100 },
          { metric: 'Network', value: 82, fullMark: 100 },
          { metric: 'Response Time', value: 90, fullMark: 100 },
        ],
        topWorkflows: [
          { name: 'Slack Notifications', executions: 1245 },
          { name: 'Email Automation', executions: 987 },
          { name: 'Data Sync', executions: 856 },
          { name: 'Social Media Post', executions: 723 },
          { name: 'Report Generation', executions: 654 },
        ],
        cpuUsage: last30Minutes.map((date, index) => {
          const historyIndex = index - (30 - metricsHistoryRef.current.length)
          if (historyIndex >= 0 && metricsHistoryRef.current[historyIndex]) {
            return {
              time: date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
              usage: parseFloat(metricsHistoryRef.current[historyIndex].cpu.usage),
              cores: metricsHistoryRef.current[historyIndex].cpu.cores,
            }
          }
          return {
            time: date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            usage: 50 + Math.floor(Math.random() * 40),
            cores: 4,
          }
        }),
        memoryUsage: last30Minutes.map((date, index) => {
          const historyIndex = index - (30 - metricsHistoryRef.current.length)
          if (historyIndex >= 0 && metricsHistoryRef.current[historyIndex]) {
            const m = metricsHistoryRef.current[historyIndex].memory
            return {
              time: date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
              used: parseFloat(m.used) * 1024,
              free: parseFloat(m.free) * 1024,
              cached: (parseFloat(m.total) - parseFloat(m.used) - parseFloat(m.free)) * 1024,
            }
          }
          return {
            time: date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            used: 6000 + Math.floor(Math.random() * 2000),
            free: 2000 + Math.floor(Math.random() * 1000),
            cached: 1500 + Math.floor(Math.random() * 500),
          }
        }),
        diskIO: last30Minutes.map((date, index) => {
          const historyIndex = index - (30 - metricsHistoryRef.current.length)
          if (historyIndex >= 0 && metricsHistoryRef.current[historyIndex]) {
            return {
              time: date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
              read: parseFloat(metricsHistoryRef.current[historyIndex].disk.read),
              write: parseFloat(metricsHistoryRef.current[historyIndex].disk.write),
            }
          }
          return {
            time: date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            read: 100 + Math.floor(Math.random() * 150),
            write: 50 + Math.floor(Math.random() * 100),
          }
        }),
        networkTraffic: last30Minutes.map((date, index) => {
          const historyIndex = index - (30 - metricsHistoryRef.current.length)
          if (historyIndex >= 0 && metricsHistoryRef.current[historyIndex]) {
            return {
              time: date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
              incoming: parseFloat(metricsHistoryRef.current[historyIndex].network.received) * 1024,
              outgoing: parseFloat(metricsHistoryRef.current[historyIndex].network.transmitted) * 1024,
            }
          }
          return {
            time: date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            incoming: 500 + Math.floor(Math.random() * 500),
            outgoing: 300 + Math.floor(Math.random() * 300),
          }
        }),
        responseTime: realTimeMetrics?.performance?.hourlyStats 
          ? realTimeMetrics.performance.hourlyStats.map((stat: any) => ({
              time: `${stat.hour}시`,
              api: stat.avgResponseTime || 0,
              db: Math.max(0, (stat.avgResponseTime || 0) * 0.6),
              cache: Math.max(0, (stat.avgResponseTime || 0) * 0.2),
            }))
          : last24Hours.map(date => ({
              time: `${date.getHours()}시`,
              api: 50 + Math.floor(Math.random() * 100),
              db: 30 + Math.floor(Math.random() * 70),
              cache: 10 + Math.floor(Math.random() * 30),
            })),
        errorRate: realTimeMetrics?.performance?.hourlyStats
          ? realTimeMetrics.performance.hourlyStats.map((stat: any) => ({
              time: `${stat.hour}시`,
              rate: stat.errorRate || 0,
              count: stat.errorCount || 0,
            }))
          : last24Hours.map(date => ({
              time: `${date.getHours()}시`,
              rate: Math.random() * 5,
              count: Math.floor(Math.random() * 50),
            })),
      })

      setRecentUsers([
        { id: '1', email: 'user1@example.com', name: 'User One', role: 'USER', createdAt: new Date().toISOString() },
        { id: '2', email: 'user2@example.com', name: 'User Two', role: 'USER', createdAt: new Date().toISOString() },
        { id: '3', email: 'user3@example.com', name: 'User Three', role: 'PRO', createdAt: new Date().toISOString() },
      ])
    } catch (error) {
      console.error("Failed to fetch admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b', '#10b981']

  if (session.status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl text-white">Loading Admin Dashboard...</div>
        </div>
      </div>
    )
  }

  if (!session.data || session.data.user?.role !== "ADMIN") {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black text-white">
      <nav className="fixed top-0 w-full bg-black/50 backdrop-blur-xl z-50 border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center font-bold">NG</div>
              <span className="text-xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">NeuralGrid Admin</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="hover:text-red-400 transition-colors">대시보드</Link>
              <Link href="/mypage" className="hover:text-red-400 transition-colors">마이페이지</Link>
              <Link href="/admin" className="text-red-400 font-semibold">관리자</Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full text-sm font-semibold">ADMIN</div>
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center font-bold">
                {session.data.user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-12">
            <h1 className="text-5xl font-black bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent mb-4">관리자 대시보드</h1>
            <p className="text-xl text-gray-400">시스템 전체 현황 및 관리 🛡️</p>
          </div>

          {stats && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-900/30 to-blue-600/10 border border-blue-500/30 rounded-3xl p-6 hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-2xl">👥</div>
                    <div className="text-sm text-blue-400">+15%</div>
                  </div>
                  <h3 className="text-gray-400 text-sm mb-2">총 사용자</h3>
                  <div className="text-4xl font-bold text-blue-400">{stats.totalUsers}</div>
                  <p className="text-xs text-gray-500 mt-2">{stats.activeUsers}명 활성</p>
                </div>

                <div className="bg-gradient-to-br from-purple-900/30 to-purple-600/10 border border-purple-500/30 rounded-3xl p-6 hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-2xl">🔄</div>
                    <div className="text-sm text-purple-400">+24%</div>
                  </div>
                  <h3 className="text-gray-400 text-sm mb-2">워크플로우</h3>
                  <div className="text-4xl font-bold text-purple-400">{stats.totalWorkflows}</div>
                  <p className="text-xs text-gray-500 mt-2">전체 생성됨</p>
                </div>

                <div className="bg-gradient-to-br from-green-900/30 to-green-600/10 border border-green-500/30 rounded-3xl p-6 hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-2xl">⚡</div>
                    <div className="text-sm text-green-400">+18%</div>
                  </div>
                  <h3 className="text-gray-400 text-sm mb-2">총 실행</h3>
                  <div className="text-4xl font-bold text-green-400">{stats.totalExecutions.toLocaleString()}</div>
                  <p className="text-xs text-gray-500 mt-2">누적 실행 횟수</p>
                </div>

                <div className="bg-gradient-to-br from-orange-900/30 to-orange-600/10 border border-orange-500/30 rounded-3xl p-6 hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center text-2xl">🏥</div>
                    <div className="text-sm text-orange-400">{stats.systemHealth}%</div>
                  </div>
                  <h3 className="text-gray-400 text-sm mb-2">시스템 상태</h3>
                  <div className="text-4xl font-bold text-orange-400">정상</div>
                  <p className="text-xs text-gray-500 mt-2">{stats.storageUsed} 사용중</p>
                </div>
              </div>

              {chartData && (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                      <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <span className="text-2xl">📈</span>
                        사용자 증가 추이 (6개월)
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData.userGrowth}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="month" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} labelStyle={{ color: '#f3f4f6' }} />
                          <Legend />
                          <Line type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 5 }} name="총 사용자" />
                          <Line type="monotone" dataKey="active" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} name="활성 사용자" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                      <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <span className="text-2xl">⚡</span>
                        실행 통계 (최근 7일)
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData.executionStats}>
                          <defs>
                            <linearGradient id="colorExec" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="date" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} labelStyle={{ color: '#f3f4f6' }} />
                          <Legend />
                          <Area type="monotone" dataKey="executions" stroke="#ec4899" fillOpacity={1} fill="url(#colorExec)" name="총 실행" />
                          <Area type="monotone" dataKey="success" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="성공" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                      <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <span className="text-2xl">📊</span>
                        사용자 플랜 분포
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie 
                            data={chartData.userDistribution} 
                            cx="50%" 
                            cy="50%" 
                            labelLine={false} 
                            label={({ name, percent }: any) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`} 
                            outerRadius={100} 
                            fill="#8884d8" 
                            dataKey="value"
                          >
                            {chartData.userDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                      <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <span className="text-2xl">🎯</span>
                        시스템 성능 지표
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={chartData.systemMetrics}>
                          <PolarGrid stroke="#374151" />
                          <PolarAngleAxis dataKey="metric" stroke="#9ca3af" />
                          <PolarRadiusAxis stroke="#9ca3af" />
                          <Radar name="현재 상태" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl lg:col-span-2">
                      <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <span className="text-2xl">🏆</span>
                        인기 워크플로우 TOP 5
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData.topWorkflows} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis type="number" stroke="#9ca3af" />
                          <YAxis dataKey="name" type="category" stroke="#9ca3af" width={150} />
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} labelStyle={{ color: '#f3f4f6' }} />
                          <Bar dataKey="executions" fill="#ec4899" radius={[0, 8, 8, 0]} name="실행 횟수" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                      <span className="text-3xl">🖥️</span>
                      실시간 시스템 모니터링
                      <span className="text-sm font-normal text-green-400 animate-pulse">(5초 자동 갱신)</span>
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                      <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <span className="text-2xl">💻</span>
                        CPU 사용률 (최근 30분)
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData.cpuUsage}>
                          <defs>
                            <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="time" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} labelStyle={{ color: '#f3f4f6' }} />
                          <Legend />
                          <Area type="monotone" dataKey="usage" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCpu)" name="CPU 사용률 (%)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                      <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <span className="text-2xl">🧠</span>
                        메모리 사용량 (최근 30분)
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData.memoryUsage}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="time" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} labelStyle={{ color: '#f3f4f6' }} />
                          <Legend />
                          <Area type="monotone" dataKey="used" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="사용중 (MB)" />
                          <Area type="monotone" dataKey="cached" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} name="캐시 (MB)" />
                          <Area type="monotone" dataKey="free" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="여유 (MB)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                      <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <span className="text-2xl">💾</span>
                        디스크 I/O (최근 30분)
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData.diskIO}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="time" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} labelStyle={{ color: '#f3f4f6' }} />
                          <Legend />
                          <Line type="monotone" dataKey="read" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="읽기 (MB/s)" />
                          <Line type="monotone" dataKey="write" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} name="쓰기 (MB/s)" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                      <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <span className="text-2xl">🌐</span>
                        네트워크 트래픽 (최근 30분)
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData.networkTraffic}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="time" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} labelStyle={{ color: '#f3f4f6' }} />
                          <Legend />
                          <Area type="monotone" dataKey="incoming" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="수신 (KB/s)" />
                          <Area type="monotone" dataKey="outgoing" stroke="#ec4899" fill="#ec4899" fillOpacity={0.6} name="송신 (KB/s)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                      <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <span className="text-2xl">⚡</span>
                        응답 시간 (최근 24시간)
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData.responseTime}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="time" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} labelStyle={{ color: '#f3f4f6' }} />
                          <Legend />
                          <Line type="monotone" dataKey="api" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} name="API (ms)" />
                          <Line type="monotone" dataKey="db" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="데이터베이스 (ms)" />
                          <Line type="monotone" dataKey="cache" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} name="캐시 (ms)" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                      <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <span className="text-2xl">🚨</span>
                        에러 발생률 (최근 24시간)
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData.errorRate}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="time" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} labelStyle={{ color: '#f3f4f6' }} />
                          <Legend />
                          <Bar dataKey="rate" fill="#ef4444" name="에러율 (%)" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              )}

              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <span className="text-2xl">👥</span>
                  최근 가입 사용자
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-gray-400 font-semibold">이메일</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-semibold">이름</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-semibold">플랜</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-semibold">가입일</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((user) => (
                        <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4">{user.email}</td>
                          <td className="py-3 px-4">{user.name || '-'}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              user.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' :
                              user.role === 'PRO' ? 'bg-purple-500/20 text-purple-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-400">{new Date(user.createdAt).toLocaleDateString('ko-KR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
