'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface VideoJob {
  id: string
  filename: string
  size: number
  uploadedAt: string
  status: 'uploaded' | 'processing' | 'completed' | 'failed'
  progress?: number
  type?: string
}

export default function HistoryPage() {
  const [jobs, setJobs] = useState<VideoJob[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'completed' | 'processing' | 'failed'>('all')

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/video/upload')
      const data = await response.json()
      
      if (data.success) {
        setJobs(data.jobs || [])
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true
    return job.status === filter
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR')
  }

  const formatSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4caf50'
      case 'processing': return '#ff9800'
      case 'failed': return '#f44336'
      default: return '#2196f3'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '완료'
      case 'processing': return '처리 중'
      case 'failed': return '실패'
      default: return '업로드됨'
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header */}
      <header style={{
        padding: '20px 40px',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{
              fontSize: '32px',
              background: 'linear-gradient(45deg, #fff, #a8edea)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
              🎬 EasyVideo Web
            </div>
          </Link>
          <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
            | 비디오 히스토리
          </div>
        </div>
        
        <Link href="/">
          <button style={{
            padding: '10px 25px',
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            ← 돌아가기
          </button>
        </Link>
      </header>

      {/* Main Content */}
      <main style={{ padding: '40px 20px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <h1 style={{ margin: 0, color: '#333' }}>📚 비디오 히스토리</h1>
            
            {/* Filter Buttons */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[
                { key: 'all', label: '전체', icon: '📋' },
                { key: 'completed', label: '완료', icon: '✓' },
                { key: 'processing', label: '처리 중', icon: '⏳' },
                { key: 'failed', label: '실패', icon: '✗' }
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  style={{
                    padding: '10px 20px',
                    background: filter === key ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#f5f5f5',
                    color: filter === key ? 'white' : '#666',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            {[
              { label: '전체', count: jobs.length, color: '#2196f3' },
              { label: '완료', count: jobs.filter(j => j.status === 'completed').length, color: '#4caf50' },
              { label: '처리 중', count: jobs.filter(j => j.status === 'processing').length, color: '#ff9800' },
              { label: '실패', count: jobs.filter(j => j.status === 'failed').length, color: '#f44336' }
            ].map((stat, index) => (
              <div
                key={index}
                style={{
                  padding: '20px',
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                  borderLeft: `4px solid ${stat.color}`
                }}
              >
                <div style={{ color: '#999', fontSize: '14px', marginBottom: '5px' }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: stat.color }}>
                  {stat.count}
                </div>
              </div>
            ))}
          </div>

          {/* Jobs List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
              <p>로딩 중...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
              <div style={{ fontSize: '80px', marginBottom: '20px' }}>📭</div>
              <h3 style={{ marginBottom: '10px' }}>히스토리가 없습니다</h3>
              <p>업로드한 비디오가 여기에 표시됩니다.</p>
              <Link href="/">
                <button style={{
                  marginTop: '20px',
                  padding: '12px 30px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}>
                  비디오 업로드하기
                </button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  style={{
                    padding: '20px',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '20px',
                    flexWrap: 'wrap',
                    transition: 'transform 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div style={{ flex: '1 1 300px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '24px' }}>🎥</span>
                      <h3 style={{ margin: 0, color: '#333', fontSize: '16px' }}>
                        {job.filename}
                      </h3>
                    </div>
                    <div style={{ color: '#999', fontSize: '13px' }}>
                      {formatDate(job.uploadedAt)} • {formatSize(job.size)}
                    </div>
                    {job.type && (
                      <div style={{ marginTop: '5px' }}>
                        <span style={{
                          padding: '3px 10px',
                          background: '#e3f2fd',
                          color: '#1976d2',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {job.type === 'enhance' && '화질 개선'}
                          {job.type === 'watermark' && '워터마크 제거'}
                          {job.type === 'background' && '배경 제거'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={{ flex: '0 0 auto' }}>
                    <div style={{
                      padding: '8px 20px',
                      background: getStatusColor(job.status),
                      color: 'white',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      minWidth: '100px'
                    }}>
                      {getStatusText(job.status)}
                      {job.progress !== undefined && job.status === 'processing' && (
                        <div style={{ fontSize: '12px', marginTop: '3px' }}>
                          {Math.round(job.progress)}%
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '30px',
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.7)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <p style={{ margin: 0 }}>
          © 2026 EasyVideo Web | AI-Powered Video Enhancement Platform
        </p>
      </footer>
    </div>
  )
}
