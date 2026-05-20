export default function TestPage() {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>✅ 서버 작동 테스트</h1>
      <p>이 페이지가 보이면 서버가 정상 작동 중입니다!</p>
      <div style={{ marginTop: '30px' }}>
        <a href="/" style={{
          padding: '15px 30px',
          background: '#667eea',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
          display: 'inline-block'
        }}>
          메인 페이지로 이동
        </a>
      </div>
    </div>
  )
}
