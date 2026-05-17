'use client'

import { useState, useRef } from 'react'

// Upload Info Component
export function UploadInfo() {
  return (
    <div style={{ color: '#666', lineHeight: '1.8' }}>
      <p><strong>EasyVideo Web</strong>에 오신 것을 환영합니다!</p>
      <h4 style={{ marginTop: '20px', color: '#667eea' }}>주요 기능:</h4>
      <ul style={{ paddingLeft: '20px' }}>
        <li>🎯 AI 기반 비디오 화질 개선 (HD/4K)</li>
        <li>🚫 워터마크 자동 제거</li>
        <li>🎭 배경 제거 및 투명화</li>
        <li>✂️ 비디오 편집 도구</li>
        <li>📹 스크린 레코더</li>
      </ul>
      <div style={{
        marginTop: '30px',
        padding: '20px',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
        borderRadius: '10px',
        border: '1px solid rgba(102, 126, 234, 0.3)'
      }}>
        <strong>💡 시작하기:</strong>
        <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
          왼쪽의 업로드 영역을 클릭하여 비디오를 선택하세요.
        </p>
      </div>
    </div>
  )
}

// Enhance Options Component
export function EnhanceOptions({ resolution, setResolution, processing, selectedFile, onProcess }: any) {
  return (
    <div>
      <p style={{ color: '#666', marginBottom: '20px', lineHeight: '1.6' }}>
        AI 기술을 사용하여 비디오 화질을 향상시킵니다.
        저화질 비디오를 HD, 1080p 또는 4K로 변환할 수 있습니다.
      </p>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 'bold' }}>
          출력 해상도:
        </label>
        <select 
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '2px solid #e0e0e0',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          <option value="HD">HD (1280x720)</option>
          <option value="FHD">Full HD (1920x1080)</option>
          <option value="2K">2K (2560x1440)</option>
          <option value="4K">4K (3840x2160)</option>
        </select>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input type="checkbox" defaultChecked />
          <span style={{ color: '#666' }}>노이즈 제거</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '8px' }}>
          <input type="checkbox" defaultChecked />
          <span style={{ color: '#666' }}>샤프닝 적용</span>
        </label>
      </div>
      <button
        onClick={onProcess}
        disabled={processing || !selectedFile}
        style={{
          width: '100%',
          padding: '15px',
          background: processing ? '#ccc' : 'linear-gradient(135deg, #667eea, #764ba2)',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: processing || !selectedFile ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease'
        }}
      >
        {processing ? '처리 중...' : '✨ 화질 개선 시작'}
      </button>
    </div>
  )
}

// Watermark Options Component
export function WatermarkOptions({ removeMethod, setRemoveMethod, processing, selectedFile, onProcess }: any) {
  return (
    <div>
      <p style={{ color: '#666', marginBottom: '20px', lineHeight: '1.6' }}>
        AI가 자동으로 워터마크나 로고를 감지하고 제거합니다.
        제거할 영역을 수동으로 선택할 수도 있습니다.
      </p>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 'bold' }}>
          제거 방법:
        </label>
        <select 
          value={removeMethod}
          onChange={(e) => setRemoveMethod(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '2px solid #e0e0e0',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          <option value="auto">자동 감지 및 제거</option>
          <option value="manual">수동 영역 선택</option>
          <option value="position">특정 위치 지정</option>
        </select>
      </div>
      <div style={{
        padding: '15px',
        background: '#fff3cd',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #ffc107'
      }}>
        <strong>⚠️ 주의:</strong>
        <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#666' }}>
          저작권이 있는 워터마크를 제거하는 것은 법적 문제가 될 수 있습니다.
          자신의 콘텐츠에만 사용하세요.
        </p>
      </div>
      <button
        onClick={onProcess}
        disabled={processing || !selectedFile}
        style={{
          width: '100%',
          padding: '15px',
          background: processing ? '#ccc' : 'linear-gradient(135deg, #f093fb, #f5576c)',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: processing || !selectedFile ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease'
        }}
      >
        {processing ? '처리 중...' : '🚫 워터마크 제거 시작'}
      </button>
    </div>
  )
}

// Background Options Component
export function BackgroundOptions({ outputFormat, setOutputFormat, accuracy, setAccuracy, processing, selectedFile, onProcess }: any) {
  return (
    <div>
      <p style={{ color: '#666', marginBottom: '20px', lineHeight: '1.6' }}>
        AI를 사용하여 비디오에서 배경을 제거하고 투명한 배경을 만듭니다.
        녹색 스크린 없이도 작동합니다.
      </p>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 'bold' }}>
          출력 형식:
        </label>
        <select 
          value={outputFormat}
          onChange={(e) => setOutputFormat(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '2px solid #e0e0e0',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          <option value="webm">투명 배경 (WebM)</option>
          <option value="mov">투명 배경 (MOV)</option>
          <option value="solid">단색 배경</option>
          <option value="gradient">그라데이션 배경</option>
        </select>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 'bold' }}>
          정확도: {accuracy}
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={accuracy}
          onChange={(e) => setAccuracy(parseInt(e.target.value))}
          style={{ width: '100%' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#999' }}>
          <span>빠름</span>
          <span>정확</span>
        </div>
      </div>
      <button
        onClick={onProcess}
        disabled={processing || !selectedFile}
        style={{
          width: '100%',
          padding: '15px',
          background: processing ? '#ccc' : 'linear-gradient(135deg, #4facfe, #00f2fe)',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: processing || !selectedFile ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease'
        }}
      >
        {processing ? '처리 중...' : '🎭 배경 제거 시작'}
      </button>
    </div>
  )
}

// Screen Recorder Component
export function ScreenRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([])
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' as any },
        audio: true
      })

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      })

      const chunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        setRecordedChunks([blob])
        
        if (videoRef.current) {
          videoRef.current.src = URL.createObjectURL(blob)
        }

        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)
      setRecordingTime(0)

      // 타이머 시작
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (error) {
      console.error('Screen recording error:', error)
      alert('스크린 레코딩을 시작할 수 없습니다. 브라우저에서 권한을 확인해주세요.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const downloadRecording = () => {
    if (recordedChunks.length > 0) {
      const blob = recordedChunks[0]
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `screen-recording-${Date.now()}.webm`
      a.click()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>📹 스크린 레코더</h2>
      
      <div style={{
        padding: '30px',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))',
        borderRadius: '15px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        {!isRecording && recordedChunks.length === 0 && (
          <>
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>🎬</div>
            <h3 style={{ marginBottom: '15px', color: '#333' }}>화면 녹화를 시작하세요</h3>
            <p style={{ color: '#666', marginBottom: '25px' }}>
              브라우저의 Screen Capture API를 사용하여 화면을 녹화할 수 있습니다.
            </p>
            <button
              onClick={startRecording}
              style={{
                padding: '15px 40px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 5px 15px rgba(102, 126, 234, 0.3)'
              }}
            >
              🔴 녹화 시작
            </button>
          </>
        )}

        {isRecording && (
          <>
            <div style={{ fontSize: '80px', marginBottom: '20px', animation: 'pulse 1.5s infinite' }}>
              ⏺️
            </div>
            <h3 style={{ marginBottom: '15px', color: '#e74c3c' }}>녹화 중...</h3>
            <div style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '25px',
              fontFamily: 'monospace'
            }}>
              {formatTime(recordingTime)}
            </div>
            <button
              onClick={stopRecording}
              style={{
                padding: '15px 40px',
                background: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 5px 15px rgba(231, 76, 60, 0.3)'
              }}
            >
              ⏹️ 녹화 중지
            </button>
          </>
        )}

        {!isRecording && recordedChunks.length > 0 && (
          <>
            <video
              ref={videoRef}
              controls
              style={{
                width: '100%',
                maxWidth: '800px',
                borderRadius: '10px',
                marginBottom: '20px'
              }}
            />
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={downloadRecording}
                style={{
                  padding: '15px 30px',
                  background: 'linear-gradient(135deg, #4caf50, #8bc34a)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                📥 다운로드
              </button>
              <button
                onClick={() => {
                  setRecordedChunks([])
                  setRecordingTime(0)
                }}
                style={{
                  padding: '15px 30px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                🔄 새로 녹화
              </button>
            </div>
          </>
        )}
      </div>

      <div style={{
        padding: '20px',
        background: '#fff3cd',
        borderRadius: '10px',
        border: '1px solid #ffc107'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>💡 사용 팁</h4>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
          <li>전체 화면, 특정 창, 또는 브라우저 탭을 선택할 수 있습니다</li>
          <li>시스템 오디오와 마이크를 함께 녹음할 수 있습니다</li>
          <li>WebM 형식으로 저장되며, 대부분의 비디오 플레이어에서 재생 가능합니다</li>
        </ul>
      </div>
    </div>
  )
}

// Feature Cards Component
export function FeatureCards() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginTop: '40px'
    }}>
      {[
        { icon: '🚀', title: '빠른 처리', desc: 'GPU 가속으로 빠른 처리 속도' },
        { icon: '🔒', title: '안전한 보안', desc: '업로드된 파일은 암호화되어 보호됩니다' },
        { icon: '☁️', title: '클라우드 저장', desc: '처리된 비디오를 클라우드에 저장' },
        { icon: '📱', title: '모바일 지원', desc: '모든 기기에서 사용 가능' }
      ].map((feature, index) => (
        <div
          key={index}
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '25px',
            borderRadius: '15px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>{feature.icon}</div>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{feature.title}</h3>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{feature.desc}</p>
        </div>
      ))}
    </div>
  )
}

// Footer Component
export function Footer() {
  return (
    <footer style={{
      padding: '30px',
      textAlign: 'center',
      color: 'rgba(255, 255, 255, 0.7)',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <p style={{ margin: 0 }}>
        © 2026 EasyVideo Web | AI-Powered Video Enhancement Platform
      </p>
      <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
        실제 백엔드 API와 연동된 프로토타입 | 진행률 추적 및 다운로드 지원
      </p>
    </footer>
  )
}
