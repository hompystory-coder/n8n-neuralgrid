import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { VideoProcessor } from '@/lib/video-processor'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes

interface VideoJob {
  id: string
  filename: string
  size: number
  uploadedAt: string
  status: 'uploaded' | 'processing' | 'completed' | 'failed'
  progress: number
  type?: 'enhance' | 'watermark' | 'background'
  options?: any
  resultUrl?: string
  error?: string
  filePath?: string
  thumbnailPath?: string
  duration?: number
  videoInfo?: any
}

// In-memory storage (실제 서비스에서는 Redis/Database 사용)
const videoJobs = new Map<string, VideoJob>()

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('video') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      )
    }

    // 파일 크기 제한 (500MB)
    const maxSize = 500 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 500MB' },
        { status: 400 }
      )
    }

    // 비디오 파일 검증
    if (!file.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a video file.' },
        { status: 400 }
      )
    }

    // Job ID 생성
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(7)}`
    
    // 업로드 디렉토리 생성
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    // 파일 저장
    const fileExtension = path.extname(file.name) || '.mp4'
    const savedFilename = `${jobId}${fileExtension}`
    const filePath = path.join(uploadDir, savedFilename)
    
    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    console.log(`File saved to: ${filePath}`)

    // 비디오 정보 추출
    let videoInfo
    let duration = 0
    try {
      videoInfo = await VideoProcessor.getVideoInfo(filePath)
      duration = parseFloat(videoInfo.format?.duration || '0')
    } catch (error) {
      console.warn('Failed to get video info:', error)
    }

    // 썸네일 생성
    const thumbnailDir = path.join(process.cwd(), 'public', 'thumbnails')
    await mkdir(thumbnailDir, { recursive: true })
    const thumbnailPath = path.join(thumbnailDir, `${jobId}.jpg`)
    
    try {
      await VideoProcessor.generateThumbnail(filePath, thumbnailPath)
      console.log(`Thumbnail generated: ${thumbnailPath}`)
    } catch (error) {
      console.warn('Failed to generate thumbnail:', error)
    }

    // 파일 정보 저장
    const job: VideoJob = {
      id: jobId,
      filename: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      status: 'uploaded',
      progress: 0,
      filePath: `/uploads/${savedFilename}`,
      thumbnailPath: `/thumbnails/${jobId}.jpg`,
      duration,
      videoInfo
    }

    videoJobs.set(jobId, job)

    console.log(`Video uploaded: ${jobId} - ${file.name} (${file.size} bytes)`)

    return NextResponse.json({
      success: true,
      jobId,
      filename: file.name,
      size: file.size,
      uploadedAt: job.uploadedAt,
      filePath: job.filePath,
      thumbnailPath: job.thumbnailPath,
      duration
    })

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed: ' + error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // 모든 작업 목록 반환
    const jobs = Array.from(videoJobs.values()).sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )

    return NextResponse.json({
      success: true,
      jobs,
      total: jobs.length
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch jobs: ' + error.message },
      { status: 500 }
    )
  }
}
