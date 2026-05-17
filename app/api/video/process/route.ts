import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { VideoProcessor, ProcessingOptions } from '@/lib/video-processor'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes

interface ProcessingJobRequest {
  jobId: string
  type: 'enhance' | 'watermark' | 'background'
  options: ProcessingOptions
}

interface ProcessingJob {
  jobId: string
  processingId: string
  type: string
  options: any
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number
  startedAt: string
  completedAt?: string
  estimatedTime: number
  resultUrl?: string
  error?: string
  filePath?: string
}

// In-memory storage (실제 서비스에서는 Redis/Database 사용)
const processingJobs = new Map<string, ProcessingJob>()
const uploadedJobs = new Map<string, any>()

/**
 * 실제 비디오 처리 (FFmpeg)
 */
async function processVideoReal(processingId: string) {
  const job = processingJobs.get(processingId)
  if (!job) return

  try {
    job.status = 'processing'
    processingJobs.set(processingId, job)

    // 입력 파일 경로
    const inputPath = path.join(process.cwd(), 'public', 'uploads', `${job.jobId}.mp4`)
    const outputDir = path.join(process.cwd(), 'public', 'processed')
    
    const processor = new VideoProcessor(inputPath, outputDir)
    
    let outputPath: string

    // 진행률 콜백
    const onProgress = (progress: number) => {
      const currentJob = processingJobs.get(processingId)
      if (currentJob) {
        currentJob.progress = progress
        processingJobs.set(processingId, currentJob)
      }
    }

    // 처리 타입에 따라 실행
    switch (job.type) {
      case 'enhance':
        outputPath = await processor.enhanceQuality(job.options, onProgress)
        break
      case 'watermark':
        outputPath = await processor.removeWatermark(onProgress)
        break
      case 'background':
        outputPath = await processor.removeBackground(onProgress)
        break
      default:
        throw new Error(`Unknown processing type: ${job.type}`)
    }

    // 완료 처리
    job.status = 'completed'
    job.progress = 100
    job.completedAt = new Date().toISOString()
    job.filePath = outputPath.replace(process.cwd(), '')
    job.resultUrl = `/api/video/download/${processingId}`
    
    processingJobs.set(processingId, job)
    console.log(`Processing completed: ${processingId}`)

  } catch (error: any) {
    console.error(`Processing failed for ${processingId}:`, error)
    job.status = 'failed'
    job.error = error.message
    processingJobs.set(processingId, job)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ProcessingJobRequest = await request.json()
    const { jobId, type, options } = body

    if (!jobId || !type) {
      return NextResponse.json(
        { error: 'Missing required parameters: jobId and type' },
        { status: 400 }
      )
    }

    // 처리 작업 생성
    const processingId = `proc_${Date.now()}_${Math.random().toString(36).substring(7)}`
    
    const job: ProcessingJob = {
      jobId,
      processingId,
      type,
      options,
      status: 'queued',
      progress: 0,
      startedAt: new Date().toISOString(),
      estimatedTime: 120 // 2분
    }

    processingJobs.set(processingId, job)

    // 백그라운드에서 처리 시작
    processVideoReal(processingId).catch(error => {
      console.error('Background processing error:', error)
    })

    return NextResponse.json({
      success: true,
      processingId: job.processingId,
      status: job.status,
      progress: job.progress,
      estimatedTime: job.estimatedTime,
      message: `Video ${type} processing started`
    })

  } catch (error: any) {
    console.error('Processing error:', error)
    return NextResponse.json(
      { error: 'Processing failed: ' + error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const processingId = searchParams.get('id')

    if (!processingId) {
      // 모든 처리 작업 반환
      const jobs = Array.from(processingJobs.values())
      return NextResponse.json({
        success: true,
        jobs,
        total: jobs.length
      })
    }

    // 특정 작업 상태 반환
    const job = processingJobs.get(processingId)
    
    if (!job) {
      return NextResponse.json(
        { error: 'Processing job not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      ...job
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch status: ' + error.message },
      { status: 500 }
    )
  }
}
