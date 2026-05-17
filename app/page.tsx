'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface ProcessingStatus {
  processingId: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number
  type: string
  resultUrl?: string
  filePath?: string
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string>('')
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('')
  const [jobId, setJobId] = useState<string>('')
  const [processing, setProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null)
  const [activeTab, setActiveTab] = useState<'upload' | 'enhance' | 'watermark' | 'background' | 'recorder'>('upload')
  const [showNotification, setShowNotification] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const statusCheckInterval = useRef<NodeJS.Timeout | null>(null)

  // Notification helper
  const notify = (type: 'success' | 'error' | 'info', message: string) => {
    setShowNotification({ type, message })
    setTimeout(() => setShowNotification(null), 5000)
  }

  // 진행률 체크
  useEffect(() => {
    if (processingStatus && processingStatus.status === 'processing') {
      statusCheckInterval.current = setInterval(async () => {
        try {
          const response = await fetch(`/api/video/process?id=${processingStatus.processingId}`)
          const data = await response.json()
          
          if (data.success) {
            setProcessingStatus(data)
            
            if (data.status === 'completed') {
              setProcessing(false)
              notify('success', '비디오 처리가 완료되었습니다! 다운로드 버튼을 클릭하세요.')
              if (statusCheckInterval.current) {
                clearInterval(statusCheckInterval.current)
              }
            } else if (data.status === 'failed') {
              setProcessing(false)
              notify('error', '비디오 처리 중 오류가 발생했습니다.')
              if (statusCheckInterval.current) {
                clearInterval(statusCheckInterval.current)
              }
            }
          }
        } catch (error) {
          console.error('Status check failed:', error)
        }
      }, 2000)
    }

    return () => {
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current)
      }
    }
  }, [processingStatus?.processingId, processingStatus?.status])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      notify('error', '비디오 파일을 선택해주세요.')
      return
    }

    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setVideoUrl(url)
    notify('info', '비디오를 업로드하는 중...')

    // 파일을 서버에 업로드
    try {
      const formData = new FormData()
      formData.append('video', file)

      const response = await fetch('/api/video/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      
      if (data.success) {
        setJobId(data.jobId)
        setActiveTab('enhance')
        setThumbnailUrl(data.thumbnailPath)
        notify('success', '업로드 성공! 이제 처리를 시작할 수 있습니다.')
      } else {
        notify('error', '업로드 실패: ' + data.error)
      }
    } catch (error) {
      console.error('Upload error:', error)
      notify('error', '업로드 중 오류가 발생했습니다.')
    }
  }

  const handleProcessing = async (type: 'enhance' | 'watermark' | 'background', options: any) => {
    if (!selectedFile || !jobId) {
      notify('error', '먼저 비디오를 업로드해주세요.')
      return
    }
    
    setProcessing(true)
    setProcessingStatus(null)
    notify('info', `${type === 'enhance' ? '화질 개선' : type === 'watermark' ? '워터마크 제거' : '배경 제거'} 처리를 시작합니다...`)

    try {
      const response = await fetch('/api/video/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jobId,
          type,
          options
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setProcessingStatus({
          processingId: data.processingId,
          status: data.status,
          progress: data.progress,
          type
        })
      } else {
        notify('error', '처리 시작 실패: ' + data.error)
        setProcessing(false)
      }
    } catch (error) {
      console.error('Processing error:', error)
      notify('error', '처리 중 오류가 발생했습니다.')
      setProcessing(false)
    }
  }

  const handleDownload = async () => {
    if (!processingStatus || processingStatus.status !== 'completed') {
      notify('error', '처리가 완료된 후 다운로드할 수 있습니다.')
      return
    }

    try {
      // 다운로드 URL로 직접 이동
      window.location.href = `/api/video/download/${processingStatus.processingId}`
      notify('success', '다운로드를 시작합니다...')
    } catch (error) {
      console.error('Download error:', error)
      notify('error', '다운로드 중 오류가 발생했습니다.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Notification */}
      {showNotification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '15px 25px',
          background: showNotification.type === 'success' ? '#4caf50' :
                     showNotification.type === 'error' ? '#f44336' : '#2196f3',
          color: 'white',
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          animation: 'slideIn 0.3s ease-out',
          maxWidth: '400px',
          fontSize: '14px'
        }}>
          {showNotification.message}
        </div>
      )}

      {/* Header */}
      <header style={{
        padding: '20px 40px',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              fontSize: '32px',
              background: 'linear-gradient(45deg, #fff, #a8edea)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold'
            }}>
              🎬 EasyVideo Web
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
              AI-Powered Video Enhancement
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/history">
              <button style={{
                padding: '10px 20px',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                📚 히스토리
              </button>
            </Link>
          </div>
          
          {/* Status Badge */}
          {processingStatus && (
            <div style={{
              padding: '10px 20px',
              background: processingStatus.status === 'completed' ? '#4caf50' : 
                         processingStatus.status === 'processing' ? '#ff9800' :
                         processingStatus.status === 'failed' ? '#f44336' : '#2196f3',
              color: 'white',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {processingStatus.status === 'completed' && '✓ 완료'}
              {processingStatus.status === 'processing' && `⏳ 처리 중 ${Math.round(processingStatus.progress)}%`}
              {processingStatus.status === 'queued' && '⏸ 대기 중'}
              {processingStatus.status === 'failed' && '✗ 실패'}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '40px 20px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}>
          {/* Video Preview Section */}
          {videoUrl && (
            <div style={{
              marginBottom: '30px',
              textAlign: 'center',
              padding: '20px',
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
              borderRadius: '15px'
            }}>
              <h3 style={{ marginBottom: '15px', color: '#333' }}>📹 비디오 미리보기</h3>
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                style={{
                  width: '100%',
                  maxWidth: '800px',
                  borderRadius: '10px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                }}
              />
              <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                {selectedFile?.name} ({(selectedFile?.size || 0 / 1024 / 1024).toFixed(2)} MB)
              </div>
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #e0e0e0', flexWrap: 'wrap' }}>
            {[
              { id: 'upload', label: '📤 업로드' },
              { id: 'enhance', label: '✨ 화질 개선' },
              { id: 'watermark', label: '🚫 워터마크 제거' },
              { id: 'background', label: '🎭 배경 제거' },
              { id: 'recorder', label: '📹 스크린 레코더' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '15px 25px',
                  border: 'none',
                  background: activeTab === tab.id ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
                  color: activeTab === tab.id ? 'white' : '#666',
                  borderRadius: '10px 10px 0 0',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                  transition: 'all 0.3s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ minHeight: '400px' }}>
            {activeTab === 'upload' && (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <h2 style={{ fontSize: '32px', marginBottom: '20px', color: '#333' }}>
                  📤 비디오 업로드
                </h2>
                <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px' }}>
                  AI 기반 비디오 처리를 시작하려면 비디오 파일을 업로드하세요
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '20px 50px',
                    fontSize: '18px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  🎬 비디오 선택
                </button>
                
                <div style={{
                  marginTop: '50px',
                  padding: '30px',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  borderRadius: '15px',
                  color: 'white'
                }}>
                  <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>✨ 주요 기능</h3>
                  <ul style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto', lineHeight: '2' }}>
                    <li>🎯 AI 기반 화질 개선 (HD, FHD, 2K, 4K)</li>
                    <li>🚫 자동 워터마크 제거</li>
                    <li>🎭 배경 제거 및 투명화</li>
                    <li>📹 화면 녹화 기능</li>
                    <li>⚡ 실시간 처리 진행률 표시</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'enhance' && (
              <div style={{ padding: '20px' }}>
                <h2 style={{ fontSize: '28px', marginBottom: '20px', color: '#333' }}>
                  ✨ 화질 개선
                </h2>
                <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px' }}>
                  AI 기술을 사용하여 비디오 화질을 향상시킵니다
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                  {['hd', 'fhd', '2k', '4k'].map(quality => (
                    <button
                      key={quality}
                      onClick={() => handleProcessing('enhance', { quality })}
                      disabled={processing || !jobId}
                      style={{
                        padding: '30px 20px',
                        fontSize: '18px',
                        background: processing ? '#ccc' : 'linear-gradient(135deg, #667eea, #764ba2)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '15px',
                        cursor: processing || !jobId ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        opacity: processing || !jobId ? 0.5 : 1,
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                        transition: 'transform 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (!processing && jobId) e.currentTarget.style.transform = 'scale(1.05)'
                      }}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      {quality.toUpperCase()}<br/>
                      <span style={{ fontSize: '12px', opacity: 0.8 }}>
                        {quality === 'hd' && '1280×720'}
                        {quality === 'fhd' && '1920×1080'}
                        {quality === '2k' && '2560×1440'}
                        {quality === '4k' && '3840×2160'}
                      </span>
                    </button>
                  ))}
                </div>

                {processingStatus && processingStatus.type === 'enhance' && (
                  <div style={{
                    padding: '20px',
                    background: '#f5f5f5',
                    borderRadius: '10px',
                    marginTop: '20px'
                  }}>
                    <h3 style={{ marginBottom: '15px', color: '#333' }}>처리 진행률</h3>
                    <div style={{
                      width: '100%',
                      height: '30px',
                      background: '#e0e0e0',
                      borderRadius: '15px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <div style={{
                        width: `${processingStatus.progress}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #4caf50, #8bc34a)',
                        transition: 'width 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold'
                      }}>
                        {Math.round(processingStatus.progress)}%
                      </div>
                    </div>
                    
                    {processingStatus.status === 'completed' && (
                      <button
                        onClick={handleDownload}
                        style={{
                          marginTop: '20px',
                          padding: '15px 40px',
                          fontSize: '16px',
                          background: '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        ⬇️ 다운로드
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'watermark' && (
              <div style={{ padding: '20px' }}>
                <h2 style={{ fontSize: '28px', marginBottom: '20px', color: '#333' }}>
                  🚫 워터마크 제거
                </h2>
                <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px' }}>
                  AI 기술을 사용하여 비디오에서 워터마크를 제거합니다
                </p>

                <button
                  onClick={() => handleProcessing('watermark', {})}
                  disabled={processing || !jobId}
                  style={{
                    padding: '20px 50px',
                    fontSize: '18px',
                    background: processing ? '#ccc' : 'linear-gradient(135deg, #f093fb, #f5576c)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50px',
                    cursor: processing || !jobId ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    opacity: processing || !jobId ? 0.5 : 1,
                    boxShadow: '0 4px 15px rgba(240, 147, 251, 0.4)'
                  }}
                >
                  {processing ? '⏳ 처리 중...' : '🚀 워터마크 제거 시작'}
                </button>

                {processingStatus && processingStatus.type === 'watermark' && (
                  <div style={{
                    padding: '20px',
                    background: '#f5f5f5',
                    borderRadius: '10px',
                    marginTop: '20px'
                  }}>
                    <h3 style={{ marginBottom: '15px', color: '#333' }}>처리 진행률</h3>
                    <div style={{
                      width: '100%',
                      height: '30px',
                      background: '#e0e0e0',
                      borderRadius: '15px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${processingStatus.progress}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #f093fb, #f5576c)',
                        transition: 'width 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold'
                      }}>
                        {Math.round(processingStatus.progress)}%
                      </div>
                    </div>
                    
                    {processingStatus.status === 'completed' && (
                      <button
                        onClick={handleDownload}
                        style={{
                          marginTop: '20px',
                          padding: '15px 40px',
                          fontSize: '16px',
                          background: '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        ⬇️ 다운로드
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'background' && (
              <div style={{ padding: '20px' }}>
                <h2 style={{ fontSize: '28px', marginBottom: '20px', color: '#333' }}>
                  🎭 배경 제거
                </h2>
                <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px' }}>
                  비디오에서 배경을 제거하고 투명화합니다
                </p>

                <button
                  onClick={() => handleProcessing('background', {})}
                  disabled={processing || !jobId}
                  style={{
                    padding: '20px 50px',
                    fontSize: '18px',
                    background: processing ? '#ccc' : 'linear-gradient(135deg, #a8edea, #fed6e3)',
                    color: '#333',
                    border: 'none',
                    borderRadius: '50px',
                    cursor: processing || !jobId ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    opacity: processing || !jobId ? 0.5 : 1,
                    boxShadow: '0 4px 15px rgba(168, 237, 234, 0.4)'
                  }}
                >
                  {processing ? '⏳ 처리 중...' : '🚀 배경 제거 시작'}
                </button>

                {processingStatus && processingStatus.type === 'background' && (
                  <div style={{
                    padding: '20px',
                    background: '#f5f5f5',
                    borderRadius: '10px',
                    marginTop: '20px'
                  }}>
                    <h3 style={{ marginBottom: '15px', color: '#333' }}>처리 진행률</h3>
                    <div style={{
                      width: '100%',
                      height: '30px',
                      background: '#e0e0e0',
                      borderRadius: '15px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${processingStatus.progress}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #a8edea, #fed6e3)',
                        transition: 'width 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#333',
                        fontWeight: 'bold'
                      }}>
                        {Math.round(processingStatus.progress)}%
                      </div>
                    </div>
                    
                    {processingStatus.status === 'completed' && (
                      <button
                        onClick={handleDownload}
                        style={{
                          marginTop: '20px',
                          padding: '15px 40px',
                          fontSize: '16px',
                          background: '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        ⬇️ 다운로드
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'recorder' && (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '28px', marginBottom: '20px', color: '#333' }}>
                  📹 화면 녹화
                </h2>
                <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px' }}>
                  브라우저 화면 녹화 기능입니다 (Screen Capture API)
                </p>
                <div style={{
                  padding: '40px',
                  background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                  borderRadius: '15px',
                  color: '#333'
                }}>
                  <p style={{ fontSize: '18px', marginBottom: '20px' }}>
                    🚧 화면 녹화 기능은 곧 추가될 예정입니다
                  </p>
                  <p style={{ fontSize: '14px', opacity: 0.8 }}>
                    Screen Capture API를 사용한 고품질 화면 녹화를 지원합니다
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '30px 20px',
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.7)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <p style={{ fontSize: '14px', marginBottom: '10px' }}>
          🎬 EasyVideo Web - AI-Powered Video Enhancement
        </p>
        <p style={{ fontSize: '12px', opacity: 0.7 }}>
          Powered by FFmpeg & Next.js
        </p>
      </footer>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
