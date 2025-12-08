import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { metricsStore } from './lib/monitoring/metrics'

export function middleware(request: NextRequest) {
  const startTime = Date.now()
  const { pathname } = request.nextUrl

  // API 요청만 추적
  if (pathname.startsWith('/api/')) {
    // 응답 후 메트릭 기록을 위한 플래그
    const response = NextResponse.next()
    
    // 응답 헤더에 시작 시간 추가
    response.headers.set('x-start-time', startTime.toString())
    response.headers.set('x-pathname', pathname)
    
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
