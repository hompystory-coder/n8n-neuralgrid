import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-lg z-50 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center font-bold">
                NG
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                NeuralGrid
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <Link href="#solutions" className="hover:text-purple-400 transition-colors">솔루션</Link>
              <Link href="#features" className="hover:text-purple-400 transition-colors">기능</Link>
              <Link href="#ai-shorts" className="hover:text-purple-400 transition-colors">AI 쇼츠</Link>
              <a href="https://monitor.neuralgrid.kr" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">모니터링</a>
              <Link href="#pricing" className="hover:text-purple-400 transition-colors">가격</Link>
              <Link href="/api-docs" className="hover:text-purple-400 transition-colors">API</Link>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/auth/signin"
                className="text-gray-300 hover:text-white transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/auth/signup"
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:from-purple-500 hover:to-pink-500 transition-all font-semibold"
              >
                시작하기
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-5xl">
          <div className="inline-block mb-6 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-sm text-purple-400">
            ✨ AI 기반 자동화 플랫폼
          </div>
          
          <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              자동화로<br/>미래를 만드세요
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto">
            노코드 워크플로우 자동화부터 AI 쇼츠 생성까지<br/>
            NeuralGrid로 콘텐츠 제작과 비즈니스를 혁신하세요 🚀
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:from-purple-500 hover:to-pink-500 transition-all font-bold text-lg shadow-lg shadow-purple-500/50"
            >
              🚀 무료로 시작하기
            </Link>
            <Link
              href="#ai-shorts"
              className="px-8 py-4 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all font-bold text-lg"
            >
              🎬 AI 쇼츠 보기
            </Link>
          </div>

          <div className="flex flex-wrap gap-6 justify-center text-sm text-gray-500">
            <span className="flex items-center gap-2">✓ 신용카드 불필요</span>
            <span className="flex items-center gap-2">✓ 5분 안에 시작</span>
            <span className="flex items-center gap-2">✓ 무료 플랜 제공</span>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-20 px-4 bg-gradient-to-b from-purple-900/10 to-black">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                두 가지 강력한 솔루션
              </span>
            </h2>
            <p className="text-xl text-gray-400">
              원하는 자동화를 선택하고 바로 시작하세요
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Workflow Automation */}
            <div className="group relative bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-3xl p-8 hover:border-purple-500/50 transition-all">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-6">
                  🔄
                </div>
                
                <h3 className="text-3xl font-bold mb-4">워크플로우 자동화</h3>
                <p className="text-gray-400 mb-6 text-lg">
                  n8n 기반의 강력한 노코드 자동화 플랫폼. 드래그 앤 드롭으로 복잡한 비즈니스 프로세스를 자동화하세요.
                </p>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-xs">✓</div>
                    <span>300+ 앱 통합 (Slack, Gmail, Notion 등)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-xs">✓</div>
                    <span>비주얼 워크플로우 에디터</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-xs">✓</div>
                    <span>실시간 모니터링 & 알림</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-xs">✓</div>
                    <span>커스텀 로직 & 조건부 실행</span>
                  </div>
                </div>

                <Link
                  href="http://n8n.neuralgrid.kr"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full hover:from-purple-500 hover:to-blue-500 transition-all font-semibold"
                >
                  에디터 열기 →
                </Link>
              </div>
            </div>

            {/* AI Shorts Generator */}
            <div className="group relative bg-gradient-to-br from-pink-900/20 to-orange-900/20 border border-pink-500/20 rounded-3xl p-8 hover:border-pink-500/50 transition-all">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 to-orange-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-600 to-orange-600 rounded-2xl flex items-center justify-center text-3xl mb-6">
                  🎬
                </div>
                
                <h3 className="text-3xl font-bold mb-4">AI 쇼츠 자동 생성</h3>
                <p className="text-gray-400 mb-6 text-lg">
                  AI가 스크립트 작성부터 영상 제작까지 자동화. YouTube, Instagram, TikTok 쇼츠를 한 번에 생성하세요.
                </p>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-pink-500/20 rounded-full flex items-center justify-center text-xs">✓</div>
                    <span>AI 스크립트 자동 생성</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-pink-500/20 rounded-full flex items-center justify-center text-xs">✓</div>
                    <span>TTS 보이스오버 (한국어/영어)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-pink-500/20 rounded-full flex items-center justify-center text-xs">✓</div>
                    <span>자동 자막 생성 & 디자인</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-pink-500/20 rounded-full flex items-center justify-center text-xs">✓</div>
                    <span>멀티 플랫폼 최적화 렌더링</span>
                  </div>
                </div>

                <a
                  href="http://115.91.5.140:5678"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-orange-600 rounded-full hover:from-pink-500 hover:to-orange-500 transition-all font-semibold"
                >
                  생성기 열기 →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Shorts Detailed Section */}
      <section id="ai-shorts" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-2 bg-pink-500/10 border border-pink-500/20 rounded-full text-sm text-pink-400">
              🎬 AI 쇼츠 생성기
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
                3분이면 쇼츠 영상 완성
              </span>
            </h2>
            <p className="text-xl text-gray-400">
              복잡한 편집 없이 AI가 알아서 제작하는 숏폼 콘텐츠
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-gradient-to-br from-pink-900/10 to-purple-900/10 border border-pink-500/20 rounded-2xl p-6">
              <div className="text-4xl mb-4">✍️</div>
              <h3 className="text-xl font-bold mb-3">AI 스크립트 작성</h3>
              <p className="text-gray-400">
                주제만 입력하면 AI가 매력적인 스크립트를 자동 생성. 바이럴 콘텐츠 패턴 분석으로 조회수 상승!
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/10 to-blue-900/10 border border-purple-500/20 rounded-2xl p-6">
              <div className="text-4xl mb-4">🎙️</div>
              <h3 className="text-xl font-bold mb-3">자연스러운 TTS</h3>
              <p className="text-gray-400">
                ElevenLabs 기반 고품질 보이스오버. 감정 표현과 억양까지 자연스러운 음성 생성.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-900/10 to-green-900/10 border border-blue-500/20 rounded-2xl p-6">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-bold mb-3">자동 자막 & 효과</h3>
              <p className="text-gray-400">
                트렌디한 자막 디자인과 배경 음악 자동 추가. 플랫폼별 최적화된 포맷으로 렌더링.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-pink-900/20 to-orange-900/20 border border-pink-500/20 rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-4">워크플로우 완전 자동화</h3>
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">1</div>
                    <div>
                      <div className="font-semibold mb-1">주제 입력</div>
                      <div className="text-gray-400 text-sm">트렌드 키워드 또는 원하는 주제 입력</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">2</div>
                    <div>
                      <div className="font-semibold mb-1">AI 자동 생성</div>
                      <div className="text-gray-400 text-sm">스크립트, 음성, 자막 모두 AI가 생성</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">3</div>
                    <div>
                      <div className="font-semibold mb-1">영상 렌더링</div>
                      <div className="text-gray-400 text-sm">플랫폼별 최적화된 쇼츠 영상 완성</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">4</div>
                    <div>
                      <div className="font-semibold mb-1">자동 업로드</div>
                      <div className="text-gray-400 text-sm">YouTube, Instagram, TikTok 동시 업로드</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-black/50 border border-white/10 rounded-2xl p-6">
                <div className="text-sm text-gray-400 mb-4">지원 플랫폼</div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">▶</div>
                    <div>
                      <div className="font-semibold">YouTube Shorts</div>
                      <div className="text-xs text-gray-400">9:16 최적화</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">📷</div>
                    <div>
                      <div className="font-semibold">Instagram Reels</div>
                      <div className="text-xs text-gray-400">9:16 최적화</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                    <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-cyan-400">🎵</div>
                    <div>
                      <div className="font-semibold">TikTok</div>
                      <div className="text-xs text-gray-400">9:16 최적화</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 bg-gradient-to-b from-black to-purple-900/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                플랫폼 핵심 기능
              </span>
            </h2>
            <p className="text-xl text-gray-400">
              프로 크리에이터와 비즈니스를 위한 강력한 도구
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-xl font-bold mb-2">초고속 렌더링</h3>
              <p className="text-gray-400">GPU 가속 렌더링으로 3분 안에 풀HD 쇼츠 완성</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="text-xl font-bold mb-2">템플릿 라이브러리</h3>
              <p className="text-gray-400">100+ 프리미엄 템플릿으로 빠른 제작 시작</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-xl font-bold mb-2">분석 대시보드</h3>
              <p className="text-gray-400">실시간 조회수, 참여율 등 상세 통계 제공</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <div className="text-3xl mb-3">🔗</div>
              <h3 className="text-xl font-bold mb-2">API 통합</h3>
              <p className="text-gray-400">RESTful API로 외부 시스템과 쉽게 연동</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <div className="text-3xl mb-3">🌐</div>
              <h3 className="text-xl font-bold mb-2">멀티 계정 관리</h3>
              <p className="text-gray-400">여러 SNS 계정을 한 곳에서 관리</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <div className="text-3xl mb-3">🔐</div>
              <h3 className="text-xl font-bold mb-2">안전한 저장소</h3>
              <p className="text-gray-400">클라우드 스토리지에 모든 콘텐츠 안전 보관</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                가격 플랜
              </span>
            </h2>
            <p className="text-xl text-gray-400">
              무료로 시작하고 성장하면서 업그레이드하세요
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all">
              <div className="text-sm text-gray-400 mb-2">개인용</div>
              <h3 className="text-3xl font-bold mb-2">Starter</h3>
              <div className="text-4xl font-bold mb-6">
                ₩0<span className="text-lg text-gray-400">/월</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <span className="text-green-400">✓</span>
                  <span>워크플로우 3개</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-400">✓</span>
                  <span>월 1,000회 실행</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-400">✓</span>
                  <span>AI 쇼츠 5개/월</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-400">✓</span>
                  <span>기본 템플릿</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-400">✓</span>
                  <span>커뮤니티 지원</span>
                </li>
              </ul>
              <Link
                href="/auth/signup"
                className="block w-full text-center px-6 py-3 bg-white/10 rounded-full hover:bg-white/20 transition-all font-semibold"
              >
                무료 시작
              </Link>
            </div>

            {/* Pro - Popular */}
            <div className="relative bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-2 border-purple-500 rounded-3xl p-8 transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-sm font-bold">
                🔥 인기
              </div>
              
              <div className="text-sm text-purple-300 mb-2">크리에이터용</div>
              <h3 className="text-3xl font-bold mb-2">Pro</h3>
              <div className="text-4xl font-bold mb-6">
                ₩29,000<span className="text-lg text-gray-400">/월</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <span className="text-purple-400">✓</span>
                  <span>무제한 워크플로우</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-purple-400">✓</span>
                  <span>월 10,000회 실행</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-purple-400">✓</span>
                  <span>AI 쇼츠 50개/월</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-purple-400">✓</span>
                  <span>프리미엄 템플릿</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-purple-400">✓</span>
                  <span>우선 지원</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-purple-400">✓</span>
                  <span>API 접근</span>
                </li>
              </ul>
              <Link
                href="/auth/signup"
                className="block w-full text-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:from-purple-500 hover:to-pink-500 transition-all font-bold"
              >
                지금 시작
              </Link>
            </div>

            {/* Business */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all">
              <div className="text-sm text-gray-400 mb-2">비즈니스용</div>
              <h3 className="text-3xl font-bold mb-2">Business</h3>
              <div className="text-4xl font-bold mb-6">
                ₩99,000<span className="text-lg text-gray-400">/월</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <span className="text-blue-400">✓</span>
                  <span>무제한 워크플로우</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-blue-400">✓</span>
                  <span>무제한 실행</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-blue-400">✓</span>
                  <span>AI 쇼츠 무제한</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-blue-400">✓</span>
                  <span>커스텀 템플릿</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-blue-400">✓</span>
                  <span>24/7 전담 지원</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-blue-400">✓</span>
                  <span>화이트라벨</span>
                </li>
              </ul>
              <Link
                href="/auth/signup"
                className="block w-full text-center px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full hover:from-blue-500 hover:to-cyan-500 transition-all font-semibold"
              >
                문의하기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="relative bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-3xl p-12 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iIzg4OCIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-5"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                지금 바로 시작하세요
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                무료 플랜으로 NeuralGrid의 강력한 자동화를 경험해보세요
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/signup"
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:from-purple-500 hover:to-pink-500 transition-all font-bold text-lg shadow-lg shadow-purple-500/50"
                >
                  무료로 시작하기 →
                </Link>
                <Link
                  href="/api-docs"
                  className="px-8 py-4 bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition-all font-bold text-lg"
                >
                  API 문서 보기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center font-bold text-sm">
                  NG
                </div>
                <span className="font-bold">NeuralGrid</span>
              </div>
              <p className="text-gray-400 text-sm">
                AI 기반 자동화 플랫폼으로<br/>비즈니스를 혁신하세요
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">솔루션</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#solutions" className="hover:text-white transition-colors">워크플로우 자동화</Link></li>
                <li><Link href="#ai-shorts" className="hover:text-white transition-colors">AI 쇼츠 생성</Link></li>
                <li><a href="http://115.91.5.140:5678" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">유튜브 쇼츠 생성기</a></li>
                <li><a href="http://n8n.neuralgrid.kr" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">n8n 에디터</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">리소스</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#features" className="hover:text-white transition-colors">기능</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">가격</Link></li>
                <li><a href="https://monitor.neuralgrid.kr" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">모니터링</a></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">대시보드</Link></li>
                <li><Link href="/api-docs" className="hover:text-white transition-colors">API 문서</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">회사</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">소개</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">문의</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">이용약관</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">개인정보처리방침</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 NeuralGrid. All rights reserved.</p>
            <p className="mt-2">Made with 💜 by AI</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
