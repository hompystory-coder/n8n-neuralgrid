import Link from 'next/link'

export default function AboutPage() {
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

            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-300 hover:text-white transition-colors"
              >
                홈으로
              </Link>
              <Link
                href="/auth/signin"
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:from-purple-500 hover:to-pink-500 transition-all font-semibold"
              >
                로그인
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-8">
            NeuralGrid 소개
          </h1>

          <div className="space-y-8 text-lg text-gray-300">
            <section>
              <h2 className="text-3xl font-bold text-white mb-4">🚀 우리의 미션</h2>
              <p>
                NeuralGrid는 AI 기술과 자동화를 통해 크리에이터와 비즈니스의 생산성을 
                극대화하는 것을 목표로 합니다. 복잡한 워크플로우 자동화부터 AI 기반 
                콘텐츠 생성까지, 누구나 쉽게 사용할 수 있는 노코드 플랫폼을 제공합니다.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-white mb-4">💡 핵심 가치</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-2">혁신</h3>
                  <p className="text-gray-400">
                    최신 AI 기술을 활용하여 지속적으로 새로운 기능을 개발합니다.
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-2">편의성</h3>
                  <p className="text-gray-400">
                    코딩 없이 누구나 쉽게 사용할 수 있는 직관적인 인터페이스를 제공합니다.
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-2">효율성</h3>
                  <p className="text-gray-400">
                    반복적인 작업을 자동화하여 창의적인 작업에 집중할 수 있게 합니다.
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-2">신뢰성</h3>
                  <p className="text-gray-400">
                    안정적인 서비스와 24/7 모니터링으로 중단 없는 서비스를 제공합니다.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-white mb-4">🎯 제공 서비스</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🔄</span>
                  <div>
                    <strong>워크플로우 자동화:</strong> n8n 기반의 강력한 노코드 자동화 플랫폼
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🎬</span>
                  <div>
                    <strong>AI 쇼츠 생성:</strong> AI가 스크립트부터 영상 제작까지 자동화
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <strong>실시간 모니터링:</strong> 시스템 상태와 성능을 실시간으로 추적
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🔗</span>
                  <div>
                    <strong>API 통합:</strong> RESTful API로 외부 시스템과 쉽게 연동
                  </div>
                </li>
              </ul>
            </section>

            <section className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-white mb-4">📧 문의하기</h2>
              <p className="mb-4">
                NeuralGrid에 대해 더 알고 싶으시거나 비즈니스 문의가 있으시면 
                언제든지 연락주세요!
              </p>
              <Link
                href="/contact"
                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:from-purple-500 hover:to-pink-500 transition-all font-semibold"
              >
                문의하기 →
              </Link>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
