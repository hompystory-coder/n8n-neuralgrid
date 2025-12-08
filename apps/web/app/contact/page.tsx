import Link from 'next/link'

export default function ContactPage() {
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
            문의하기
          </h1>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="text-3xl mb-3">📧</div>
                <h3 className="text-xl font-bold mb-2">이메일</h3>
                <a href="mailto:support@neuralgrid.kr" className="text-purple-400 hover:text-purple-300">
                  support@neuralgrid.kr
                </a>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="text-3xl mb-3">💬</div>
                <h3 className="text-xl font-bold mb-2">고객 지원</h3>
                <p className="text-gray-400">
                  평일 오전 9시 ~ 오후 6시<br/>
                  (주말 및 공휴일 제외)
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="text-3xl mb-3">🏢</div>
                <h3 className="text-xl font-bold mb-2">비즈니스 문의</h3>
                <a href="mailto:business@neuralgrid.kr" className="text-purple-400 hover:text-purple-300">
                  business@neuralgrid.kr
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6">빠른 문의</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">이름</label>
                  <input
                    type="text"
                    placeholder="홍길동"
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">이메일</label>
                  <input
                    type="email"
                    placeholder="example@email.com"
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">문의 유형</label>
                  <select className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none">
                    <option>일반 문의</option>
                    <option>기술 지원</option>
                    <option>비즈니스 제휴</option>
                    <option>기타</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">메시지</label>
                  <textarea
                    rows={5}
                    placeholder="문의 내용을 입력해주세요..."
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:from-purple-500 hover:to-pink-500 transition-all font-semibold"
                >
                  문의 보내기
                </button>
              </form>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-6">자주 묻는 질문</h2>
            <div className="space-y-4">
              <details className="bg-white/5 border border-white/10 rounded-xl p-4">
                <summary className="font-semibold cursor-pointer">무료 플랜으로 시작할 수 있나요?</summary>
                <p className="mt-2 text-gray-400">
                  네! Starter 플랜은 완전 무료이며 신용카드 등록 없이 바로 시작할 수 있습니다.
                </p>
              </details>

              <details className="bg-white/5 border border-white/10 rounded-xl p-4">
                <summary className="font-semibold cursor-pointer">워크플로우 자동화는 어떻게 사용하나요?</summary>
                <p className="mt-2 text-gray-400">
                  n8n 에디터에서 드래그 앤 드롭으로 쉽게 워크플로우를 만들 수 있습니다. 
                  300개 이상의 앱과 연동 가능합니다.
                </p>
              </details>

              <details className="bg-white/5 border border-white/10 rounded-xl p-4">
                <summary className="font-semibold cursor-pointer">AI 쇼츠 생성 시간은 얼마나 걸리나요?</summary>
                <p className="mt-2 text-gray-400">
                  평균 3분 이내에 풀HD 쇼츠 영상이 완성됩니다. GPU 가속 렌더링을 사용합니다.
                </p>
              </details>

              <details className="bg-white/5 border border-white/10 rounded-xl p-4">
                <summary className="font-semibold cursor-pointer">API 사용이 가능한가요?</summary>
                <p className="mt-2 text-gray-400">
                  Pro 플랜 이상부터 RESTful API를 사용할 수 있습니다. 
                  <Link href="/api-docs" className="text-purple-400 hover:text-purple-300"> API 문서</Link>를 참고하세요.
                </p>
              </details>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
