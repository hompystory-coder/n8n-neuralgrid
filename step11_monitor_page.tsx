// Save this as: ~/n8n-neuralgrid/apps/web/app/monitor/page.tsx

"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"

interface Metrics {
  cpu: {
    usage: string
    cores: number
  }
  memory: {
    total: string
    used: string
    free: string
    usagePercent: string
  }
  disk: Array<{
    fs: string
    size: string
    used: string
    available: string
    usePercent: string
  }>
  os: {
    platform: string
    distro: string
    uptime: string
  }
}

interface PM2Process {
  name: string
  status: string
  uptime: number
  memory: string
  cpu: number
  restarts: number
}

export default function MonitorPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [pm2Status, setPm2Status] = useState<{ processes: PM2Process[], total: number, online: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      if (session?.user?.role !== "ADMIN") {
        router.push("/dashboard")
      } else {
        fetchData()
        const interval = setInterval(fetchData, 5000) // Update every 5 seconds
        return () => clearInterval(interval)
      }
    }
  }, [status, session, router])

  const fetchData = async () => {
    try {
      // In production, these would call the monitor server at https://monitor.neuralgrid.kr
      const [metricsRes, pm2Res] = await Promise.all([
        fetch('https://monitor.neuralgrid.kr/api/metrics'),
        fetch('https://monitor.neuralgrid.kr/api/pm2-status'),
      ])

      if (metricsRes.ok) {
        const data = await metricsRes.json()
        setMetrics(data)
      }

      if (pm2Res.ok) {
        const data = await pm2Res.json()
        setPm2Status(data)
      }
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Navigation */}
      <nav className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
                NeuralGrid Monitor
              </h1>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-300 hover:text-white transition">
                ← 관리자 대시보드
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">서버 모니터링</h1>
          <div className="text-sm text-gray-400">
            실시간 업데이트 • 5초마다 갱신
          </div>
        </div>

        {/* System Metrics */}
        {metrics && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* CPU */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">CPU 사용률</h3>
                  <span className="text-2xl">💻</span>
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text mb-2">
                  {metrics.cpu.usage}%
                </div>
                <p className="text-sm text-gray-400">{metrics.cpu.cores} Cores</p>
              </div>

              {/* Memory */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">메모리</h3>
                  <span className="text-2xl">🧠</span>
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 text-transparent bg-clip-text mb-2">
                  {metrics.memory.usagePercent}%
                </div>
                <p className="text-sm text-gray-400">
                  {metrics.memory.used}GB / {metrics.memory.total}GB
                </p>
              </div>

              {/* Disk */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">디스크</h3>
                  <span className="text-2xl">💾</span>
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text mb-2">
                  {metrics.disk[0]?.usePercent}%
                </div>
                <p className="text-sm text-gray-400">
                  {metrics.disk[0]?.used}GB / {metrics.disk[0]?.size}GB
                </p>
              </div>

              {/* System Info */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">시스템</h3>
                  <span className="text-2xl">⚙️</span>
                </div>
                <div className="text-xl font-bold text-white mb-2">
                  {metrics.os.distro}
                </div>
                <p className="text-sm text-gray-400">Uptime: {metrics.os.uptime}</p>
              </div>
            </div>
          </>
        )}

        {/* PM2 Processes */}
        {pm2Status && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-xl mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">PM2 프로세스</h3>
              <div className="text-sm text-gray-400">
                {pm2Status.online} / {pm2Status.total} Online
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">이름</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">상태</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">업타임</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">메모리</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">CPU</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">재시작</th>
                  </tr>
                </thead>
                <tbody>
                  {pm2Status.processes.map((proc, index) => (
                    <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="py-3 px-4 text-white font-medium">{proc.name}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          proc.status === 'online' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {proc.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-300">{proc.uptime}m</td>
                      <td className="py-3 px-4 text-gray-300">{proc.memory} MB</td>
                      <td className="py-3 px-4 text-gray-300">{proc.cpu}%</td>
                      <td className="py-3 px-4 text-gray-300">{proc.restarts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Status Message */}
        {!metrics && !pm2Status && !loading && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center">
            <p className="text-gray-400">모니터링 데이터를 불러올 수 없습니다</p>
            <p className="text-sm text-gray-500 mt-2">모니터링 서버가 실행 중인지 확인하세요</p>
          </div>
        )}
      </div>
    </div>
  )
}
