import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { exec } from "child_process"
import { promisify } from "util"
import os from "os"
import { metricsStore } from "@/lib/monitoring/metrics"

const execAsync = promisify(exec)

export const dynamic = 'force-dynamic'

// 시스템 메트릭 수집 함수
async function getSystemMetrics() {
  try {
    // CPU 사용률
    const cpuUsage = os.loadavg()[0] / os.cpus().length * 100
    
    // 메모리 정보
    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const usedMem = totalMem - freeMem
    
    // 디스크 용량 정보 (Linux 전용)
    let diskTotal = 0
    let diskUsed = 0
    let diskAvailable = 0
    let diskUsagePercent = 0
    try {
      const { stdout: diskSpace } = await execAsync("df -BG / | tail -1")
      const parts = diskSpace.trim().split(/\s+/)
      if (parts.length >= 5) {
        diskTotal = parseInt(parts[1]) // GB
        diskUsed = parseInt(parts[2]) // GB
        diskAvailable = parseInt(parts[3]) // GB
        diskUsagePercent = parseInt(parts[4]) // %
      }
    } catch (e) {
      // 디스크 용량을 읽을 수 없는 경우 기본값 사용
      console.error("Failed to read disk space:", e)
    }
    
    // 디스크 I/O (Linux 전용)
    let diskRead = 0
    let diskWrite = 0
    try {
      const { stdout: diskStats } = await execAsync("cat /proc/diskstats | grep -E '(sda|nvme0n1|vda)' | head -1")
      const parts = diskStats.trim().split(/\s+/)
      if (parts.length >= 10) {
        diskRead = parseInt(parts[5]) * 512 / (1024 * 1024) // MB
        diskWrite = parseInt(parts[9]) * 512 / (1024 * 1024) // MB
      }
    } catch (e) {
      // 디스크 통계를 읽을 수 없는 경우 기본값 사용
    }
    
    // 네트워크 트래픽 (Linux 전용)
    let networkRx = 0
    let networkTx = 0
    try {
      const { stdout: netStats } = await execAsync("cat /proc/net/dev | grep -E '(eth0|ens|enp)' | head -1")
      const parts = netStats.trim().split(/\s+/)
      if (parts.length >= 10) {
        networkRx = parseInt(parts[1]) / (1024 * 1024) // MB
        networkTx = parseInt(parts[9]) / (1024 * 1024) // MB
      }
    } catch (e) {
      // 네트워크 통계를 읽을 수 없는 경우 기본값 사용
    }
    
    return {
      timestamp: new Date().toISOString(),
      cpu: {
        usage: Math.min(cpuUsage, 100).toFixed(2),
        cores: os.cpus().length,
        model: os.cpus()[0]?.model || 'Unknown'
      },
      memory: {
        total: (totalMem / (1024 ** 3)).toFixed(2), // GB
        used: (usedMem / (1024 ** 3)).toFixed(2), // GB
        free: (freeMem / (1024 ** 3)).toFixed(2), // GB
        usagePercent: ((usedMem / totalMem) * 100).toFixed(2)
      },
      disk: {
        total: diskTotal,
        used: diskUsed,
        available: diskAvailable,
        usagePercent: diskUsagePercent,
        io: {
          read: diskRead.toFixed(2),
          write: diskWrite.toFixed(2)
        }
      },
      network: {
        received: networkRx.toFixed(2),
        transmitted: networkTx.toFixed(2)
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        uptime: os.uptime(),
        hostname: os.hostname()
      }
    }
  } catch (error) {
    console.error("Failed to get system metrics:", error)
    throw error
  }
}

export async function GET(request: Request) {
  const startTime = Date.now()
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== "ADMIN") {
      metricsStore.addMetric({
        timestamp: Date.now(),
        responseTime: Date.now() - startTime,
        endpoint: '/api/system/metrics',
        statusCode: 401
      })
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const metrics = await getSystemMetrics()
    
    // 응답 시간 및 에러율 통계 추가
    const hourlyStats = metricsStore.getHourlyStats(24)
    
    metricsStore.addMetric({
      timestamp: Date.now(),
      responseTime: Date.now() - startTime,
      endpoint: '/api/system/metrics',
      statusCode: 200
    })
    
    return NextResponse.json({
      ...metrics,
      performance: {
        hourlyStats,
        currentResponseTime: Date.now() - startTime
      }
    })
  } catch (error) {
    console.error("System metrics API error:", error)
    metricsStore.addMetric({
      timestamp: Date.now(),
      responseTime: Date.now() - startTime,
      endpoint: '/api/system/metrics',
      statusCode: 500,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return NextResponse.json(
      { error: "Failed to fetch system metrics" },
      { status: 500 }
    )
  }
}
