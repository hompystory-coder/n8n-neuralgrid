// 메모리 기반 메트릭 저장소 (간단한 인메모리 DB)
interface MetricEntry {
  timestamp: number
  responseTime: number
  endpoint: string
  statusCode: number
  error?: string
}

class MetricsStore {
  private metrics: MetricEntry[] = []
  private maxEntries = 1000 // 최대 1000개 저장

  addMetric(entry: MetricEntry) {
    this.metrics.push(entry)
    // 최대 개수 초과 시 오래된 것 삭제
    if (this.metrics.length > this.maxEntries) {
      this.metrics = this.metrics.slice(-this.maxEntries)
    }
  }

  getMetrics(since: number): MetricEntry[] {
    return this.metrics.filter(m => m.timestamp >= since)
  }

  getHourlyStats(hours: number = 24) {
    const now = Date.now()
    const hourMs = 60 * 60 * 1000
    const startTime = now - (hours * hourMs)
    
    const recentMetrics = this.getMetrics(startTime)
    const hourlyData: any[] = []

    for (let i = 0; i < hours; i++) {
      const hourStart = startTime + (i * hourMs)
      const hourEnd = hourStart + hourMs
      
      const hourMetrics = recentMetrics.filter(
        m => m.timestamp >= hourStart && m.timestamp < hourEnd
      )

      if (hourMetrics.length > 0) {
        const avgResponseTime = hourMetrics.reduce((sum, m) => sum + m.responseTime, 0) / hourMetrics.length
        const errorCount = hourMetrics.filter(m => m.statusCode >= 400).length
        const errorRate = (errorCount / hourMetrics.length) * 100

        hourlyData.push({
          hour: new Date(hourStart).getHours(),
          avgResponseTime: Math.round(avgResponseTime),
          errorCount,
          errorRate: parseFloat(errorRate.toFixed(2)),
          totalRequests: hourMetrics.length
        })
      } else {
        // 데이터가 없으면 0으로
        hourlyData.push({
          hour: new Date(hourStart).getHours(),
          avgResponseTime: 0,
          errorCount: 0,
          errorRate: 0,
          totalRequests: 0
        })
      }
    }

    return hourlyData
  }

  clear() {
    this.metrics = []
  }
}

// 전역 싱글톤 인스턴스
export const metricsStore = new MetricsStore()

// 응답 시간 측정 유틸리티
export function measureResponseTime<T>(
  fn: () => Promise<T>,
  endpoint: string
): Promise<{ result: T; responseTime: number }> {
  const start = Date.now()
  
  return fn()
    .then(result => {
      const responseTime = Date.now() - start
      metricsStore.addMetric({
        timestamp: Date.now(),
        responseTime,
        endpoint,
        statusCode: 200
      })
      return { result, responseTime }
    })
    .catch(error => {
      const responseTime = Date.now() - start
      metricsStore.addMetric({
        timestamp: Date.now(),
        responseTime,
        endpoint,
        statusCode: error.status || 500,
        error: error.message
      })
      throw error
    })
}
