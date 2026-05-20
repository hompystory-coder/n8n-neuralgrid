'use client'

import { useState, useRef, useEffect } from 'react'

interface ProcessingStatus {
  processingId: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number
  type: string
  resultUrl?: string
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string>('')
  const [jobId, setJobId] = useState<string>('')
  const [processing, setProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null)
  const [activeTab, setActiveTab] = useState<'upload' | 'enhance' | 'watermark' | 'background' | 'recorder'>('upload')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const statusCheckInterval = useRef<NodeJS.Timeout | null>(null)

  // 진행률 체크
  useEffect(() => {
    if (processingStatus && processingStatus.status === 'processing') {
      statusCheckInterval.current = setInterval(async () => {
        try {
          const response = await fetch(`/api/video/process?id=${processingStatus.processingId}`)
          const data = await response.json()
          
          if (data.success) {
            setProcessingStatus(data)
            
            if (data.status === 'completed' || data.status === 'failed') {
              setProcessing(false)
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
      alert('비디오 파일을 선택해주세요.')
      return
    }

    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setVideoUrl(url)

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
        alert('업로드 성공! 이제 처리를 시작할 수 있습니다.')
      } else {
        alert('업로드 실패: ' + data.error)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('업로드 중 오류가 발생했습니다.')
    }
  }

  const handleProcessing = async (type: 'enhance' | 'watermark' | 'background', options: any) => {
    if (!selectedFile || !jobId) {
      alert('먼저 비디오를 업로드해주세요.')
      return
    }
    
    setProcessing(true)
    setProcessingStatus(null)

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
        alert('처리 시작 실패: ' + data.error)
        setProcessing(false)
      }
    } catch (error) {
      console.error('Processing error:', error)
      alert('처리 중 오류가 발생했습니다.')
      setProcessing(false)
    }
  }

  const handleDownload = async () => {
    if (!processingStatus || processingStatus.status !== 'completed') {
      alert('처리가 완료된 후 다운로드할 수 있습니다.')
      return
    }

    try {
      const response = await fetch(`/api/video/download/${processingStatus.processingId}`)
      const data = await response.json()
      
      if (data.success && data.downloadUrl) {
        window.open(data.downloadUrl, '_blank')
      } else {
        alert('다운로드 URL을 가져올 수 없습니다.')
      }
    } catch (error) {
      console.error('Download error:', error)
      alert('다운로드 중 오류가 발생했습니다.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header */}
      <header style={{
        padding: '20px 40px',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                  transition: 'all 0.3s ease',
                  marginBottom: '-2px'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Progress Bar */}
          {processingStatus && processingStatus.status === 'processing' && (
            <div style={{ marginBottom: '30px' }}>
              <div style={{
                background: '#e0e0e0',
                borderRadius: '10px',
                overflow: 'hidden',
                height: '30px',
                position: 'relative'
              }}>
                <div style={{
                  background: 'linear-gradient(90deg, #667eea, #764ba2)',
                  height: '100%',
                  width: `${processingStatus.progress}%`,
                  transition: 'width 0.5s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  {Math.round(processingStatus.progress)}%
                </div>
              </div>
              <p style={{ marginTop: '10px', textAlign: 'center', color: '#666' }}>
                {processingStatus.type === 'enhance' && '화질 개선 처리 중...'}
                {processingStatus.type === 'watermark' && '워터마크 제거 처리 중...'}
                {processingStatus.type === 'background' && '배경 제거 처리 중...'}
              </p>
            </div>
          )}

          {/* Completed Message */}
          {processingStatus && processingStatus.status === 'completed' && (
            <div style={{
              marginBottom: '30px',
              padding: '20px',
              background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(139, 195, 74, 0.1))',
              borderRadius: '10px',
              border: '2px solid #4caf50',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#4caf50', fontSize: '24px' }}>
                ✓ 처리 완료!
              </h3>
              <p style={{ margin: '0 0 15px 0', color: '#666' }}>
                비디오 처리가 성공적으로 완료되었습니다.
              </p>
              <button
                onClick={handleDownload}
                style={{
                  padding: '15px 40px',
                  background: 'linear-gradient(135deg, #4caf50, #8bc34a)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 5px 15px rgba(76, 175, 80, 0.3)'
                }}
              >
                📥 다운로드
              </button>
            </div>
          )}

          {/* Content Area - will be added in next part */}
          <div style={{ minHeight: '400px' }}>
            <TabContent
              activeTab={activeTab}
              selectedFile={selectedFile}
              videoUrl={videoUrl}
              processing={processing}
              fileInputRef={fileInputRef}
              onFileSelect={handleFileSelect}
              onProcess={handleProcessing}
              onReset={() => {
                setSelectedFile(null)
                setVideoUrl('')
                setJobId('')
                setProcessingStatus(null)
                setActiveTab('upload')
              }}
            />
          </div>
        </div>

        {/* Feature Cards */}
        <FeatureCards />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

// Tab Content Component
function TabContent({ activeTab, selectedFile, videoUrl, processing, fileInputRef, onFileSelect, onProcess, onReset }: any) {
  if (activeTab === 'recorder') {
    return <ScreenRecorder />
  }

  return (
    <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
      {/* Left Side - Upload or Video Preview */}
      <VideoPreview
        videoUrl={videoUrl}
        selectedFile={selectedFile}
        fileInputRef={fileInputRef}
        onFileSelect={onFileSelect}
        onReset={onReset}
      />

      {/* Right Side - Tools */}
      <ProcessingTools
        activeTab={activeTab}
        selectedFile={selectedFile}
        processing={processing}
        onProcess={onProcess}
      />
    </div>
  )
}

// Video Preview Component  
function VideoPreview({ videoUrl, selectedFile, fileInputRef, onFileSelect, onReset }: any) {
  return (
    <div style={{ flex: '1 1 500px' }}>
      {!videoUrl ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '3px dashed #667eea',
            borderRadius: '15px',
            padding: '60px',
            textAlign: 'center',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))'
          }}
        >
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>🎥</div>
          <h3 style={{ fontSize: '24px', marginBottom: '10px', color: '#333' }}>
            비디오를 드래그하거나 클릭하세요
          </h3>
          <p style={{ color: '#666', fontSize: '14px' }}>
            MP4, AVI, MOV, MKV 등 지원 (최대 500MB)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={onFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <div>
          <video
            src={videoUrl}
            controls
            style={{
              width: '100%',
              borderRadius: '15px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
            }}
          />
          <div style={{ marginTop: '15px', color: '#666', fontSize: '14px' }}>
            <strong>파일명:</strong> {selectedFile?.name}
            <br />
            <strong>크기:</strong> {((selectedFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB
          </div>
          <button
            onClick={onReset}
            style={{
              marginTop: '15px',
              padding: '10px 20px',
              background: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            다른 비디오 선택
          </button>
        </div>
      )}
    </div>
  )
}

// Processing Tools Component
function ProcessingTools({ activeTab, selectedFile, processing, onProcess }: any) {
  const [resolution, setResolution] = useState('FHD')
  const [removeMethod, setRemoveMethod] = useState('auto')
  const [outputFormat, setOutputFormat] = useState('webm')
  const [accuracy, setAccuracy] = useState(7)

  return (
    <div style={{ flex: '1 1 400px' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>
        {activeTab === 'upload' && '📤 비디오 업로드'}
        {activeTab === 'enhance' && '✨ AI 화질 개선'}
        {activeTab === 'watermark' && '🚫 워터마크 제거'}
        {activeTab === 'background' && '🎭 배경 제거'}
      </h2>

      {activeTab === 'upload' && <UploadInfo />}
      {activeTab === 'enhance' && (
        <EnhanceOptions
          resolution={resolution}
          setResolution={setResolution}
          processing={processing}
          selectedFile={selectedFile}
          onProcess={() => onProcess('enhance', { resolution })}
        />
      )}
      {activeTab === 'watermark' && (
        <WatermarkOptions
          removeMethod={removeMethod}
          setRemoveMethod={setRemoveMethod}
          processing={processing}
          selectedFile={selectedFile}
          onProcess={() => onProcess('watermark', { method: removeMethod })}
        />
      )}
      {activeTab === 'background' && (
        <BackgroundOptions
          outputFormat={outputFormat}
          setOutputFormat={setOutputFormat}
          accuracy={accuracy}
          setAccuracy={setAccuracy}
          processing={processing}
          selectedFile={selectedFile}
          onProcess={() => onProcess('background', { format: outputFormat, accuracy })}
        />
      )}
    </div>
  )
}

// Individual option components would go here...
// (UploadInfo, EnhanceOptions, WatermarkOptions, BackgroundOptions, ScreenRecorder, FeatureCards, Footer)
// I'll add these in the next message to keep the file manageable
