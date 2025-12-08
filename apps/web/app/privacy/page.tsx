import Link from 'next/link'

export default function PrivacyPage() {
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
          <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            개인정보 처리방침
          </h1>
          <p className="text-gray-400 mb-12">최종 업데이트: 2024년 12월 8일</p>

          <div className="space-y-8 text-gray-300">
            <section className="bg-purple-900/20 border border-purple-500/30 rounded-2xl p-6">
              <p>
                NeuralGrid(이하 "회사")는 개인정보보호법 등 관련 법령상의 개인정보보호 규정을 
                준수하며, 회원의 개인정보 보호에 최선을 다하고 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. 수집하는 개인정보의 항목 및 수집방법</h2>
              
              <h3 className="text-xl font-semibold text-white mb-3 mt-6">가. 수집하는 개인정보 항목</h3>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
                <p className="font-semibold mb-2">① 회원가입 시</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>필수항목: 이메일 주소, 비밀번호, 이름</li>
                  <li>선택항목: 프로필 이미지, 전화번호</li>
                </ul>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
                <p className="font-semibold mb-2">② 서비스 이용 과정에서 자동 수집되는 정보</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>IP 주소, 쿠키, 서비스 이용 기록, 기기 정보</li>
                  <li>워크플로우 실행 기록, AI 쇼츠 생성 기록</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">나. 개인정보 수집방법</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>회원가입 및 서비스 이용 과정에서 회원이 직접 입력</li>
                <li>서비스 이용 과정에서 자동 수집 도구를 통한 수집</li>
                <li>제휴사로부터의 제공</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. 개인정보의 수집 및 이용목적</h2>
              <p className="mb-3">
                회사는 수집한 개인정보를 다음의 목적을 위해 활용합니다:
              </p>

              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="font-semibold mb-2">① 서비스 제공</p>
                  <p className="text-gray-400">
                    워크플로우 자동화, AI 쇼츠 생성, 콘텐츠 제공, 맞춤 서비스 제공, 
                    본인인증, 구매 및 요금 결제, 물품배송 또는 청구서 발송
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="font-semibold mb-2">② 회원 관리</p>
                  <p className="text-gray-400">
                    회원제 서비스 이용에 따른 본인확인, 개인식별, 불량회원의 부정 이용 방지와 
                    비인가 사용 방지, 가입 의사 확인, 연령확인, 불만처리 등 민원처리
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="font-semibold mb-2">③ 마케팅 및 광고</p>
                  <p className="text-gray-400">
                    이벤트 등 광고성 정보 전달, 접속 빈도 파악, 회원의 서비스 이용에 대한 통계
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. 개인정보의 보유 및 이용기간</h2>
              <p className="mb-3">
                회사는 회원이 서비스를 이용하는 동안 개인정보를 보유 및 이용합니다. 
                회원이 탈퇴하는 경우 해당 개인정보는 지체 없이 파기됩니다.
              </p>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="font-semibold mb-2">법령에 따른 보관</p>
                <p className="mb-2">다만, 관계법령의 규정에 의하여 다음과 같이 보존합니다:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-gray-400">
                  <li>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)</li>
                  <li>대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래법)</li>
                  <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)</li>
                  <li>웹사이트 방문 기록: 3개월 (통신비밀보호법)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. 개인정보의 파기절차 및 방법</h2>
              
              <h3 className="text-xl font-semibold text-white mb-3">가. 파기절차</h3>
              <p className="mb-4">
                회원이 서비스 가입 등을 위해 입력한 정보는 목적이 달성된 후 내부 방침 및 
                기타 관련 법령에 의한 정보보호 사유에 따라(보유 및 이용기간 참조) 일정 기간 저장된 후 
                파기됩니다.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">나. 파기방법</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>종이에 출력된 개인정보: 분쇄기로 분쇄하거나 소각</li>
                <li>전자적 파일 형태로 저장된 개인정보: 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. 회원의 권리와 행사방법</h2>
              <p className="mb-3">
                회원은 언제든지 다음과 같은 권리를 행사할 수 있습니다:
              </p>

              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>개인정보 열람 요구</li>
                <li>오류가 있을 경우 정정 요구</li>
                <li>삭제 요구</li>
                <li>처리 정지 요구</li>
              </ul>

              <p className="mt-4">
                위 권리 행사는 회사에 대해 서면, 전화, 전자우편 등을 통하여 하실 수 있으며, 
                회사는 이에 대해 지체 없이 조치하겠습니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. 개인정보 보호책임자</h2>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <p className="mb-3">
                  회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 
                  정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
                </p>
                <div className="mt-4 space-y-2">
                  <p><strong>개인정보 보호책임자</strong></p>
                  <p>이메일: <a href="mailto:privacy@neuralgrid.kr" className="text-purple-400 hover:text-purple-300">privacy@neuralgrid.kr</a></p>
                  <p>
                    <Link href="/contact" className="text-purple-400 hover:text-purple-300">
                      문의 페이지
                    </Link>
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. 개인정보 처리방침의 변경</h2>
              <p>
                이 개인정보 처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 
                삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
              </p>
            </section>

            <section className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">문의</h2>
              <p className="mb-3">
                개인정보 처리방침에 관한 문의사항이 있으시면 아래로 연락주시기 바랍니다:
              </p>
              <ul className="space-y-2">
                <li>이메일: <a href="mailto:privacy@neuralgrid.kr" className="text-purple-400 hover:text-purple-300">privacy@neuralgrid.kr</a></li>
                <li>
                  <Link href="/contact" className="text-purple-400 hover:text-purple-300">
                    문의 페이지
                  </Link>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
