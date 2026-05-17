import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

export const runtime = 'nodejs'

// In-memory storage (processingJobs와 동기화 필요)
const processingJobs = new Map<string, any>()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const processingId = params.id

    // 처리된 작업 찾기
    const job = processingJobs.get(processingId)
    
    if (!job) {
      return NextResponse.json(
        { error: 'Processing job not found' },
        { status: 404 }
      )
    }

    if (job.status !== 'completed') {
      return NextResponse.json(
        { 
          error: 'Video processing not completed yet',
          status: job.status,
          progress: job.progress
        },
        { status: 400 }
      )
    }

    if (!job.filePath) {
      return NextResponse.json(
        { error: 'Processed file not found' },
        { status: 404 }
      )
    }

    // 파일 경로 생성
    const filePath = path.join(process.cwd(), job.filePath)

    try {
      // 파일 읽기
      const fileBuffer = await readFile(filePath)
      
      // 파일명 생성
      const filename = `processed_${job.type}_${Date.now()}.mp4`

      // 파일 다운로드 응답
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': fileBuffer.length.toString(),
        },
      })
    } catch (fileError) {
      console.error('File read error:', fileError)
      return NextResponse.json(
        { error: 'Failed to read processed file' },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Download failed: ' + error.message },
      { status: 500 }
    )
  }
}
