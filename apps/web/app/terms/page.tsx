import Link from 'next/link'

export default function TermsPage() {
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
            이용약관
          </h1>
          <p className="text-gray-400 mb-12">최종 업데이트: 2024년 12월 8일</p>

          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">제1조 (목적)</h2>
              <p>
                본 약관은 NeuralGrid(이하 "회사")가 제공하는 AI 자동화 플랫폼 서비스(이하 "서비스")의 
                이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 서비스 이용조건 및 절차 등 
                기본적인 사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">제2조 (정의)</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li>"서비스"란 회사가 제공하는 워크플로우 자동화, AI 쇼츠 생성 등 모든 서비스를 의미합니다.</li>
                <li>"회원"이란 본 약관에 따라 회사와 이용계약을 체결하고 서비스를 이용하는 자를 말합니다.</li>
                <li>"계정"이란 회원의 식별과 서비스 이용을 위해 회원이 설정하고 회사가 승인한 이메일과 비밀번호의 조합을 말합니다.</li>
                <li>"콘텐츠"란 회원이 서비스에 게시 또는 등록하는 문자, 이미지, 동영상, 링크 등의 정보를 말합니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">제3조 (약관의 게시와 개정)</h2>
              <p className="mb-3">
                ① 회사는 본 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.
              </p>
              <p>
                ② 회사는 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있으며, 
                약관을 개정할 경우 적용일자 및 개정사유를 명시하여 현행약관과 함께 서비스 초기 화면에 
                그 적용일자 7일 이전부터 적용일자 전일까지 공지합니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">제4조 (서비스의 제공 및 변경)</h2>
              <p className="mb-3">
                ① 회사는 다음과 같은 서비스를 제공합니다:
              </p>
              <ul className="space-y-2 list-disc list-inside mb-3">
                <li>워크플로우 자동화 서비스 (n8n 기반)</li>
                <li>AI 쇼츠 자동 생성 서비스</li>
                <li>실시간 시스템 모니터링 서비스</li>
                <li>API 제공 서비스</li>
                <li>기타 회사가 추가 개발하거나 제공하는 서비스</li>
              </ul>
              <p>
                ② 회사는 서비스의 내용, 품질, 기술 사양 등을 상시 개선할 수 있으며, 
                중대한 변경이 있을 경우 회원에게 사전 통지합니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">제5조 (서비스 이용 계약의 성립)</h2>
              <p className="mb-3">
                ① 이용계약은 회원이 되고자 하는 자(이하 "가입신청자")가 본 약관의 내용에 동의한 후 
                회원가입신청을 하고 회사가 이러한 신청에 대하여 승낙함으로써 체결됩니다.
              </p>
              <p>
                ② 회사는 가입신청자의 신청에 대하여 승낙함을 원칙으로 합니다. 
                다만, 다음 각 호에 해당하는 신청에 대하여는 승낙을 거절할 수 있습니다:
              </p>
              <ul className="space-y-2 list-disc list-inside mt-3">
                <li>실명이 아니거나 타인의 명의를 이용한 경우</li>
                <li>허위의 정보를 기재하거나 회사가 제시하는 내용을 기재하지 않은 경우</li>
                <li>14세 미만의 아동이 법정대리인의 동의를 얻지 않은 경우</li>
                <li>기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">제6조 (회원 정보의 변경)</h2>
              <p>
                회원은 개인정보관리화면을 통하여 언제든지 자신의 개인정보를 열람하고 수정할 수 있습니다. 
                회원은 회원가입 신청 시 기재한 사항이 변경되었을 경우 온라인으로 수정을 하거나 
                전자우편 기타 방법으로 회사에 대하여 그 변경사항을 알려야 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">제7조 (이용 요금)</h2>
              <p className="mb-3">
                ① 서비스는 기본적으로 무료입니다. 다만, 유료 서비스의 경우 해당 서비스에 명시된 요금을 
                지불해야 이용할 수 있습니다.
              </p>
              <p>
                ② 회사는 유료 서비스 이용 요금을 회사와 계약한 전자지불업체에서 정한 방법에 
                의하거나 회사가 정한 청구서에 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">제8조 (환불 정책)</h2>
              <p className="mb-3">
                ① 회원은 서비스 이용 중 언제든지 환불을 요청할 수 있습니다.
              </p>
              <p>
                ② 환불 기준은 다음과 같습니다:
              </p>
              <ul className="space-y-2 list-disc list-inside mt-3">
                <li>서비스 시작 후 7일 이내: 전액 환불</li>
                <li>서비스 시작 후 7일 초과: 사용일수를 제외한 금액 환불</li>
                <li>회사의 귀책사유로 인한 서비스 중단: 전액 환불</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">제9조 (회원 탈퇴 및 자격 상실)</h2>
              <p className="mb-3">
                ① 회원은 언제든지 탈퇴를 요청할 수 있으며, 회사는 즉시 회원 탈퇴를 처리합니다.
              </p>
              <p>
                ② 회원이 다음 각 호의 사유에 해당하는 경우, 회사는 회원 자격을 제한 및 정지시킬 수 있습니다:
              </p>
              <ul className="space-y-2 list-disc list-inside mt-3">
                <li>가입 신청 시 허위 내용을 등록한 경우</li>
                <li>다른 사람의 서비스 이용을 방해하거나 그 정보를 도용하는 등 전자거래 질서를 위협하는 경우</li>
                <li>서비스를 이용하여 법령과 본 약관이 금지하거나 공서양속에 반하는 행위를 하는 경우</li>
              </ul>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">문의</h2>
              <p className="mb-3">
                본 약관에 관한 문의사항이 있으시면 아래로 연락주시기 바랍니다:
              </p>
              <ul className="space-y-2">
                <li>이메일: <a href="mailto:support@neuralgrid.kr" className="text-purple-400 hover:text-purple-300">support@neuralgrid.kr</a></li>
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
