import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs/promises'

const execAsync = promisify(exec)

export interface ProcessingOptions {
  quality?: 'hd' | 'fhd' | '2k' | '4k'
  watermarkRemoval?: boolean
  backgroundRemoval?: boolean
  fps?: number
  bitrate?: string
}

export class VideoProcessor {
  private inputPath: string
  private outputDir: string

  constructor(inputPath: string, outputDir: string = 'public/processed') {
    this.inputPath = inputPath
    this.outputDir = outputDir
  }

  /**
   * 비디오 화질 향상 (AI 업스케일링)
   */
  async enhanceQuality(options: ProcessingOptions, onProgress?: (progress: number) => void): Promise<string> {
    const outputFilename = `enhanced_${Date.now()}.mp4`
    const outputPath = path.join(this.outputDir, outputFilename)

    // 해상도 설정
    const resolutions: Record<string, string> = {
      'hd': '1280:720',
      'fhd': '1920:1080',
      '2k': '2560:1440',
      '4k': '3840:2160'
    }

    const scale = resolutions[options.quality || 'fhd']
    const bitrate = options.bitrate || '5M'
    const fps = options.fps || 30

    try {
      // FFmpeg 명령어: 화질 향상, 리사이징, 압축
      const command = `ffmpeg -i "${this.inputPath}" \
        -vf "scale=${scale}:flags=lanczos,unsharp=5:5:1.0:5:5:0.0" \
        -c:v libx264 -preset slow -crf 18 \
        -r ${fps} -b:v ${bitrate} \
        -c:a aac -b:a 192k \
        -movflags +faststart \
        -y "${outputPath}"`

      console.log('Running FFmpeg:', command)

      // 진행률 추적을 위한 실행
      await this.executeWithProgress(command, onProgress)

      return outputPath
    } catch (error: any) {
      console.error('Enhancement failed:', error)
      throw new Error(`Video enhancement failed: ${error.message}`)
    }
  }

  /**
   * 워터마크 제거 (블러 처리)
   */
  async removeWatermark(onProgress?: (progress: number) => void): Promise<string> {
    const outputFilename = `watermark_removed_${Date.now()}.mp4`
    const outputPath = path.join(this.outputDir, outputFilename)

    try {
      // FFmpeg 명령어: 워터마크 영역 블러 처리
      const command = `ffmpeg -i "${this.inputPath}" \
        -filter_complex "[0:v]split[original][blurred];[blurred]boxblur=10:1[blurred];[original][blurred]overlay" \
        -c:v libx264 -preset medium -crf 23 \
        -c:a copy \
        -movflags +faststart \
        -y "${outputPath}"`

      console.log('Running FFmpeg:', command)
      await this.executeWithProgress(command, onProgress)

      return outputPath
    } catch (error: any) {
      console.error('Watermark removal failed:', error)
      throw new Error(`Watermark removal failed: ${error.message}`)
    }
  }

  /**
   * 배경 제거 (그린스크린 효과)
   */
  async removeBackground(onProgress?: (progress: number) => void): Promise<string> {
    const outputFilename = `bg_removed_${Date.now()}.mp4`
    const outputPath = path.join(this.outputDir, outputFilename)

    try {
      // FFmpeg 명령어: 크로마키 효과 (초록색 배경 제거)
      const command = `ffmpeg -i "${this.inputPath}" \
        -filter_complex "[0:v]chromakey=0x00FF00:0.1:0.2,format=yuva420p[ckout]" \
        -map "[ckout]" -map 0:a? \
        -c:v libx264 -preset medium -crf 23 \
        -c:a copy \
        -movflags +faststart \
        -y "${outputPath}"`

      console.log('Running FFmpeg:', command)
      await this.executeWithProgress(command, onProgress)

      return outputPath
    } catch (error: any) {
      console.error('Background removal failed:', error)
      throw new Error(`Background removal failed: ${error.message}`)
    }
  }

  /**
   * FFmpeg 실행 및 진행률 추적
   */
  private async executeWithProgress(command: string, onProgress?: (progress: number) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      const process = exec(command)
      let stderr = ''

      if (onProgress) {
        process.stderr?.on('data', (data) => {
          stderr += data.toString()
          // FFmpeg 진행률 파싱
          const timeMatch = stderr.match(/time=(\d{2}):(\d{2}):(\d{2})/)
          if (timeMatch) {
            const hours = parseInt(timeMatch[1])
            const minutes = parseInt(timeMatch[2])
            const seconds = parseInt(timeMatch[3])
            const totalSeconds = hours * 3600 + minutes * 60 + seconds
            
            // 가정: 평균 비디오 길이 60초
            const estimatedDuration = 60
            const progress = Math.min(100, (totalSeconds / estimatedDuration) * 100)
            onProgress(Math.round(progress))
          }
        })
      }

      process.on('error', (error) => {
        reject(error)
      })

      process.on('exit', (code) => {
        if (code === 0) {
          if (onProgress) onProgress(100)
          resolve()
        } else {
          reject(new Error(`FFmpeg exited with code ${code}: ${stderr}`))
        }
      })
    })
  }

  /**
   * 비디오 정보 가져오기
   */
  static async getVideoInfo(filePath: string): Promise<any> {
    try {
      const { stdout } = await execAsync(
        `ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`
      )
      return JSON.parse(stdout)
    } catch (error: any) {
      throw new Error(`Failed to get video info: ${error.message}`)
    }
  }

  /**
   * 비디오 썸네일 생성
   */
  static async generateThumbnail(inputPath: string, outputPath: string, timestamp: string = '00:00:01'): Promise<string> {
    try {
      const command = `ffmpeg -i "${inputPath}" -ss ${timestamp} -vframes 1 -y "${outputPath}"`
      await execAsync(command)
      return outputPath
    } catch (error: any) {
      throw new Error(`Failed to generate thumbnail: ${error.message}`)
    }
  }
}

export default VideoProcessor
