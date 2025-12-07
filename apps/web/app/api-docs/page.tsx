import Link from 'next/link'

export default function ApiDocs() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              NeuralGrid
            </Link>
            <nav className="flex gap-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900">홈</Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">대시보드</Link>
              <Link href="/api/auth/signin" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                로그인
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">API 문서</h1>
          <p className="text-xl text-gray-600 mb-12">
            NeuralGrid RESTful API를 사용하여 워크플로우 자동화를 프로그래밍 방식으로 제어하세요.
          </p>

          {/* Quick Start */}
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold mb-4">빠른 시작</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Base URL</h3>
                <code className="block bg-gray-100 p-4 rounded text-sm">
                  https://neuralgrid.kr/api
                </code>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">인증</h3>
                <p className="text-gray-600 mb-2">
                  모든 API 요청은 NextAuth 세션을 통해 인증됩니다. 로그인 후 쿠키를 포함하여 요청하세요.
                </p>
                <code className="block bg-gray-100 p-4 rounded text-sm">
                  {`fetch('https://neuralgrid.kr/api/workflows', {
  credentials: 'include'
})`}
                </code>
              </div>
            </div>
          </section>

          {/* Workflows API */}
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold mb-6">워크플로우 API</h2>
            
            <div className="space-y-6">
              {/* GET /api/workflows */}
              <div className="border-l-4 border-blue-600 pl-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded font-mono text-sm font-semibold">GET</span>
                  <code className="text-lg font-mono">/api/workflows</code>
                </div>
                <p className="text-gray-600 mb-3">사용자의 모든 워크플로우 목록을 가져옵니다.</p>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="font-semibold mb-2">응답 예시:</p>
                  <pre className="text-sm overflow-x-auto">
{`{
  "workflows": [
    {
      "id": "clx123abc",
      "name": "이메일 자동 응답",
      "description": "받은 이메일에 자동으로 응답",
      "isActive": true,
      "usageCount": 150,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}`}
                  </pre>
                </div>
              </div>

              {/* POST /api/workflows */}
              <div className="border-l-4 border-blue-600 pl-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded font-mono text-sm font-semibold">POST</span>
                  <code className="text-lg font-mono">/api/workflows</code>
                </div>
                <p className="text-gray-600 mb-3">새로운 워크플로우를 생성합니다.</p>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="font-semibold mb-2">요청 본문:</p>
                  <pre className="text-sm overflow-x-auto">
{`{
  "name": "워크플로우 이름",
  "description": "워크플로우 설명",
  "workflowData": {
    "nodes": [...],
    "connections": {...}
  },
  "tags": ["automation", "email"],
  "isActive": false
}`}
                  </pre>
                </div>
              </div>

              {/* GET /api/workflows/[id] */}
              <div className="border-l-4 border-blue-600 pl-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded font-mono text-sm font-semibold">GET</span>
                  <code className="text-lg font-mono">/api/workflows/[id]</code>
                </div>
                <p className="text-gray-600">특정 워크플로우의 상세 정보를 가져옵니다.</p>
              </div>

              {/* PUT /api/workflows/[id] */}
              <div className="border-l-4 border-blue-600 pl-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded font-mono text-sm font-semibold">PUT</span>
                  <code className="text-lg font-mono">/api/workflows/[id]</code>
                </div>
                <p className="text-gray-600">워크플로우 정보를 업데이트합니다.</p>
              </div>

              {/* DELETE /api/workflows/[id] */}
              <div className="border-l-4 border-blue-600 pl-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded font-mono text-sm font-semibold">DELETE</span>
                  <code className="text-lg font-mono">/api/workflows/[id]</code>
                </div>
                <p className="text-gray-600">워크플로우를 삭제합니다.</p>
              </div>

              {/* POST /api/workflows/[id]/execute */}
              <div className="border-l-4 border-blue-600 pl-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded font-mono text-sm font-semibold">POST</span>
                  <code className="text-lg font-mono">/api/workflows/[id]/execute</code>
                </div>
                <p className="text-gray-600 mb-3">워크플로우를 수동으로 실행합니다.</p>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="font-semibold mb-2">요청 본문:</p>
                  <pre className="text-sm overflow-x-auto">
{`{
  "data": {
    "input": "실행에 필요한 데이터"
  }
}`}
                  </pre>
                </div>
              </div>
            </div>
          </section>

          {/* Templates API */}
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold mb-6">템플릿 API</h2>
            
            <div className="space-y-6">
              {/* GET /api/templates */}
              <div className="border-l-4 border-purple-600 pl-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded font-mono text-sm font-semibold">GET</span>
                  <code className="text-lg font-mono">/api/templates</code>
                </div>
                <p className="text-gray-600 mb-3">모든 워크플로우 템플릿 목록을 가져옵니다.</p>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="font-semibold mb-2">쿼리 파라미터:</p>
                  <ul className="text-sm space-y-1">
                    <li><code>category</code> - 카테고리 필터 (예: marketing, sales)</li>
                    <li><code>featured</code> - 추천 템플릿만 (true/false)</li>
                  </ul>
                </div>
              </div>

              {/* GET /api/templates/[id] */}
              <div className="border-l-4 border-purple-600 pl-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded font-mono text-sm font-semibold">GET</span>
                  <code className="text-lg font-mono">/api/templates/[id]</code>
                </div>
                <p className="text-gray-600">특정 템플릿의 상세 정보를 가져옵니다.</p>
              </div>

              {/* POST /api/templates/[id]/install */}
              <div className="border-l-4 border-purple-600 pl-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded font-mono text-sm font-semibold">POST</span>
                  <code className="text-lg font-mono">/api/templates/[id]/install</code>
                </div>
                <p className="text-gray-600">템플릿을 사용자의 워크플로우로 설치합니다.</p>
              </div>
            </div>
          </section>

          {/* Payments API */}
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold mb-6">결제 API</h2>
            
            <div className="space-y-6">
              {/* POST /api/payments/confirm */}
              <div className="border-l-4 border-green-600 pl-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded font-mono text-sm font-semibold">POST</span>
                  <code className="text-lg font-mono">/api/payments/confirm</code>
                </div>
                <p className="text-gray-600 mb-3">Toss Payments 결제를 승인합니다.</p>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="font-semibold mb-2">요청 본문:</p>
                  <pre className="text-sm overflow-x-auto">
{`{
  "orderId": "order_123",
  "amount": 29000,
  "paymentKey": "toss_payment_key"
}`}
                  </pre>
                </div>
              </div>

              {/* POST /api/payments/cancel */}
              <div className="border-l-4 border-green-600 pl-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded font-mono text-sm font-semibold">POST</span>
                  <code className="text-lg font-mono">/api/payments/cancel</code>
                </div>
                <p className="text-gray-600">결제를 취소합니다.</p>
              </div>
            </div>
          </section>

          {/* Admin API */}
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold mb-6">관리자 API</h2>
            <p className="text-yellow-600 mb-4">⚠️ 관리자 권한 필요</p>
            
            <div className="space-y-6">
              {/* GET /api/admin/stats */}
              <div className="border-l-4 border-red-600 pl-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded font-mono text-sm font-semibold">GET</span>
                  <code className="text-lg font-mono">/api/admin/stats</code>
                </div>
                <p className="text-gray-600">시스템 전체 통계를 가져옵니다.</p>
              </div>

              {/* GET /api/admin/users */}
              <div className="border-l-4 border-red-600 pl-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded font-mono text-sm font-semibold">GET</span>
                  <code className="text-lg font-mono">/api/admin/users</code>
                </div>
                <p className="text-gray-600">모든 사용자 목록을 가져옵니다.</p>
              </div>
            </div>
          </section>

          {/* Webhooks */}
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold mb-6">웹훅</h2>
            
            <div className="space-y-6">
              {/* POST /api/webhooks/n8n */}
              <div className="border-l-4 border-orange-600 pl-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded font-mono text-sm font-semibold">POST</span>
                  <code className="text-lg font-mono">/api/webhooks/n8n</code>
                </div>
                <p className="text-gray-600">n8n 워크플로우에서 호출할 수 있는 웹훅입니다.</p>
              </div>

              {/* POST /api/webhooks/toss */}
              <div className="border-l-4 border-orange-600 pl-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded font-mono text-sm font-semibold">POST</span>
                  <code className="text-lg font-mono">/api/webhooks/toss</code>
                </div>
                <p className="text-gray-600">Toss Payments 콜백 웹훅입니다.</p>
              </div>
            </div>
          </section>

          {/* Error Codes */}
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold mb-6">에러 코드</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">코드</th>
                    <th className="px-4 py-3 text-left">설명</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="px-4 py-3"><code className="text-red-600">400</code></td>
                    <td className="px-4 py-3">잘못된 요청 (Bad Request)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3"><code className="text-red-600">401</code></td>
                    <td className="px-4 py-3">인증 실패 (Unauthorized)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3"><code className="text-red-600">403</code></td>
                    <td className="px-4 py-3">권한 없음 (Forbidden)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3"><code className="text-red-600">404</code></td>
                    <td className="px-4 py-3">리소스를 찾을 수 없음 (Not Found)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3"><code className="text-red-600">429</code></td>
                    <td className="px-4 py-3">요청 한도 초과 (Too Many Requests)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3"><code className="text-red-600">500</code></td>
                    <td className="px-4 py-3">서버 오류 (Internal Server Error)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Rate Limiting */}
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold mb-6">속도 제한</h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                API 요청 속도는 구독 플랜에 따라 제한됩니다:
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="font-semibold">Free:</span>
                  <span className="text-gray-600">시간당 100회</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-semibold">Pro:</span>
                  <span className="text-gray-600">시간당 1,000회</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-semibold">Enterprise:</span>
                  <span className="text-gray-600">무제한</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Support */}
          <section className="bg-blue-50 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-4">도움이 필요하신가요?</h2>
            <p className="text-gray-600 mb-6">
              API 사용 중 문제가 있거나 질문이 있으시면 언제든 문의해주세요.
            </p>
            <div className="flex gap-4">
              <Link
                href="/contact"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                문의하기
              </Link>
              <Link
                href="/"
                className="px-6 py-3 bg-white text-gray-800 rounded-lg hover:bg-gray-100 font-semibold"
              >
                홈으로
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
