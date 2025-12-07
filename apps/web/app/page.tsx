import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            NeuralGrid
          </h1>
          <p className="text-2xl text-gray-600 mb-4">
            n8n 기반 워크플로우 자동화 플랫폼
          </p>
          <p className="text-lg text-gray-500 mb-12">
            코드 없이 비즈니스 프로세스를 자동화하세요. 강력한 n8n 엔진과 직관적인 인터페이스로 누구나 쉽게 자동화를 시작할 수 있습니다.
          </p>
          
          <div className="flex gap-4 justify-center mb-8">
            <Link
              href="/api/auth/signin"
              className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              무료로 시작하기
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 bg-white text-gray-800 text-lg font-semibold rounded-lg hover:bg-gray-100 transition-colors border-2 border-gray-200"
            >
              자세히 알아보기
            </Link>
          </div>

          <div className="flex gap-6 justify-center text-sm text-gray-500">
            <span>✓ 무료 플랜 제공</span>
            <span>✓ 신용카드 불필요</span>
            <span>✓ 5분 안에 시작</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            강력한 기능
          </h2>
          <p className="text-xl text-gray-600">
            비즈니스 자동화에 필요한 모든 것
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-2xl font-bold mb-3">워크플로우 자동화</h3>
            <p className="text-gray-600 mb-4">
              드래그 앤 드롭으로 복잡한 비즈니스 프로세스를 쉽게 구축하고 자동화하세요.
            </p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>• 300+ 통합 앱</li>
              <li>• 실시간 실행</li>
              <li>• 조건부 로직</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-2xl font-bold mb-3">템플릿 마켓</h3>
            <p className="text-gray-600 mb-4">
              검증된 워크플로우 템플릿으로 빠르게 시작하세요. 커뮤니티가 만든 수백 개의 템플릿 제공.
            </p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>• 즉시 사용 가능</li>
              <li>• 커스터마이징 가능</li>
              <li>• 지속 업데이트</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-2xl font-bold mb-3">실시간 모니터링</h3>
            <p className="text-gray-600 mb-4">
              워크플로우 실행 현황을 실시간으로 확인하고 문제를 즉시 파악하세요.
            </p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>• 실행 히스토리</li>
              <li>• 에러 알림</li>
              <li>• 성능 분석</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-2xl font-bold mb-3">안전한 인증</h3>
            <p className="text-gray-600 mb-4">
              NextAuth 기반의 강력한 인증 시스템으로 데이터를 안전하게 보호합니다.
            </p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>• 소셜 로그인</li>
              <li>• 이메일 인증</li>
              <li>• 권한 관리</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-2xl font-bold mb-3">간편한 결제</h3>
            <p className="text-gray-600 mb-4">
              Toss Payments 연동으로 안전하고 편리한 구독 관리를 제공합니다.
            </p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>• 다양한 결제 수단</li>
              <li>• 자동 청구</li>
              <li>• 환불 지원</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold mb-3">RESTful API</h3>
            <p className="text-gray-600 mb-4">
              강력한 API로 외부 시스템과 쉽게 연동하고 자동화를 확장하세요.
            </p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>• 18개 엔드포인트</li>
              <li>• 완전한 CRUD</li>
              <li>• 웹훅 지원</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-20 bg-gray-50">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            투명한 가격 정책
          </h2>
          <p className="text-xl text-gray-600">
            비즈니스 규모에 맞는 플랜을 선택하세요
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-2xl font-bold mb-2">Free</h3>
            <div className="text-4xl font-bold mb-6">₩0<span className="text-lg text-gray-500">/월</span></div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>워크플로우 3개</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>월 1,000회 실행</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>기본 템플릿 접근</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>커뮤니티 지원</span>
              </li>
            </ul>
            <Link
              href="/api/auth/signin"
              className="block w-full text-center px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              시작하기
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-blue-600 text-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
              인기
            </div>
            <h3 className="text-2xl font-bold mb-2">Pro</h3>
            <div className="text-4xl font-bold mb-6">₩29,000<span className="text-lg opacity-75">/월</span></div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-yellow-300">✓</span>
                <span>무제한 워크플로우</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-300">✓</span>
                <span>월 10,000회 실행</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-300">✓</span>
                <span>모든 템플릿 접근</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-300">✓</span>
                <span>우선 지원</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-300">✓</span>
                <span>API 접근</span>
              </li>
            </ul>
            <Link
              href="/api/auth/signin"
              className="block w-full text-center px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              시작하기
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
            <div className="text-4xl font-bold mb-6">₩99,000<span className="text-lg text-gray-500">/월</span></div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>무제한 워크플로우</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>무제한 실행</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>프리미엄 템플릿</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>24/7 전담 지원</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>커스텀 통합</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>SLA 보장</span>
              </li>
            </ul>
            <Link
              href="/api/auth/signin"
              className="block w-full text-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold"
            >
              시작하기
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            시작하는 방법
          </h2>
          <p className="text-xl text-gray-600">
            3단계로 시작하는 워크플로우 자동화
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-bold mb-2">회원가입</h3>
              <p className="text-gray-600">
                이메일 또는 소셜 계정으로 간편하게 가입하세요. 신용카드 없이 무료로 시작할 수 있습니다.
              </p>
            </div>

            <div className="flex-1 text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-bold mb-2">템플릿 선택</h3>
              <p className="text-gray-600">
                수백 개의 검증된 워크플로우 템플릿 중에서 선택하거나, 처음부터 직접 만들어보세요.
              </p>
            </div>

            <div className="flex-1 text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-bold mb-2">자동화 실행</h3>
              <p className="text-gray-600">
                워크플로우를 활성화하고 자동으로 실행되는 것을 확인하세요. 실시간 모니터링도 가능합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="container mx-auto px-4 py-20 bg-gray-50">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            개발자 리소스
          </h2>
          <p className="text-xl text-gray-600">
            API 문서와 가이드로 더 많은 것을 구축하세요
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Link href="/api-docs" className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-2xl font-bold mb-3">API 문서</h3>
            <p className="text-gray-600 mb-4">
              18개의 RESTful API 엔드포인트 상세 문서. 워크플로우, 템플릿, 결제 등 모든 기능에 접근하세요.
            </p>
            <span className="text-blue-600 font-semibold">문서 보기 →</span>
          </Link>

          <a href="http://115.91.5.140:3000/n8n/" target="_blank" rel="noopener noreferrer" className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-2xl font-bold mb-3">n8n 에디터</h3>
            <p className="text-gray-600 mb-4">
              직관적인 비주얼 에디터로 워크플로우를 드래그 앤 드롭으로 구축하세요. 코딩 지식 불필요.
            </p>
            <span className="text-blue-600 font-semibold">에디터 열기 →</span>
          </a>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            지금 바로 시작하세요
          </h2>
          <p className="text-xl mb-8 opacity-90">
            무료 플랜으로 NeuralGrid의 강력한 자동화를 경험해보세요
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/api/auth/signin"
              className="px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              무료로 시작하기
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 bg-transparent text-white text-lg font-semibold rounded-lg hover:bg-white/10 transition-colors border-2 border-white"
            >
              자세히 알아보기
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">NeuralGrid</h3>
              <p className="text-gray-400">
                n8n 기반 워크플로우 자동화 플랫폼
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">제품</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#features" className="hover:text-white">기능</Link></li>
                <li><Link href="#pricing" className="hover:text-white">가격</Link></li>
                <li><Link href="/api-docs" className="hover:text-white">API 문서</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">리소스</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="http://115.91.5.140:3000/n8n/" className="hover:text-white">n8n 에디터</a></li>
                <li><Link href="/dashboard/workflows" className="hover:text-white">대시보드</Link></li>
                <li><Link href="/templates" className="hover:text-white">템플릿</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">회사</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">소개</Link></li>
                <li><Link href="/contact" className="hover:text-white">문의</Link></li>
                <li><Link href="/terms" className="hover:text-white">이용약관</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 NeuralGrid. All rights reserved.</p>
            <p className="mt-2">Built with Next.js, n8n, and ❤️</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
