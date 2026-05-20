# Backend API 구현 가이드

## 🔧 백엔드 아키텍처

### API 엔드포인트 설계

```typescript
// 비디오 업로드
POST /api/v1/upload
Content-Type: multipart/form-data
Body: {
  video: File
}
Response: {
  jobId: string,
  uploadedAt: timestamp,
  fileSize: number,
  duration: number
}

// 화질 개선
POST /api/v1/enhance
Body: {
  jobId: string,
  resolution: "HD" | "FHD" | "2K" | "4K",
  options: {
    removeNoise: boolean,
    sharpen: boolean
  }
}
Response: {
  processingJobId: string,
  estimatedTime: number,
  status: "queued"
}

// 워터마크 제거
POST /api/v1/remove-watermark
Body: {
  jobId: string,
  method: "auto" | "manual" | "position",
  coordinates?: { x: number, y: number, width: number, height: number }
}
Response: {
  processingJobId: string,
  estimatedTime: number,
  status: "queued"
}

// 배경 제거
POST /api/v1/remove-background
Body: {
  jobId: string,
  outputFormat: "webm" | "mov" | "solid" | "gradient",
  accuracy: number // 1-10
}
Response: {
  processingJobId: string,
  estimatedTime: number,
  status: "queued"
}

// 작업 상태 확인
GET /api/v1/status/:processingJobId
Response: {
  status: "queued" | "processing" | "completed" | "failed",
  progress: number, // 0-100
  message: string,
  resultUrl?: string
}

// 결과 다운로드
GET /api/v1/download/:processingJobId
Response: Video File (stream)
```

## 📦 백엔드 구현 예시 (Node.js + Express)

### 1. 프로젝트 구조

```
backend/
├── src/
│   ├── controllers/
│   │   ├── uploadController.ts
│   │   ├── enhanceController.ts
│   │   ├── watermarkController.ts
│   │   └── backgroundController.ts
│   ├── services/
│   │   ├── videoProcessingService.ts
│   │   ├── aiService.ts
│   │   └── storageService.ts
│   ├── queues/
│   │   └── videoQueue.ts
│   ├── models/
│   │   └── Job.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── upload.ts
│   └── server.ts
├── ai-workers/
│   ├── enhance_worker.py
│   ├── watermark_remover.py
│   └── background_remover.py
├── package.json
└── docker-compose.yml
```

### 2. 필요한 npm 패키지

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "multer": "^1.4.5-lts.1",
    "bull": "^4.11.5",
    "redis": "^4.6.10",
    "@aws-sdk/client-s3": "^3.450.0",
    "ffmpeg-static": "^5.2.0",
    "fluent-ffmpeg": "^2.1.2",
    "prisma": "^5.7.0",
    "@prisma/client": "^5.7.0",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/multer": "^1.4.11",
    "typescript": "^5.3.3",
    "ts-node": "^10.9.2"
  }
}
```

### 3. 비디오 처리 서비스 (TypeScript)

```typescript
// src/services/videoProcessingService.ts
import ffmpeg from 'fluent-ffmpeg';
import { Queue, Worker } from 'bull';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export class VideoProcessingService {
  private queue: Queue;
  private s3Client: S3Client;

  constructor() {
    this.queue = new Queue('video-processing', {
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379')
      }
    });

    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    });

    this.setupWorkers();
  }

  async enhanceVideo(jobId: string, options: EnhanceOptions) {
    await this.queue.add('enhance', {
      jobId,
      options
    });
  }

  private setupWorkers() {
    new Worker('video-processing', async (job) => {
      switch (job.name) {
        case 'enhance':
          return await this.processEnhancement(job.data);
        case 'remove-watermark':
          return await this.processWatermarkRemoval(job.data);
        case 'remove-background':
          return await this.processBackgroundRemoval(job.data);
      }
    });
  }

  private async processEnhancement(data: any) {
    // FFmpeg를 사용한 기본 화질 개선
    // 실제 AI 처리는 Python 워커로 전달
    const inputPath = await this.downloadFromS3(data.jobId);
    const outputPath = `/tmp/enhanced_${data.jobId}.mp4`;

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .videoCodec('libx264')
        .size(data.options.resolution)
        .outputOptions([
          '-preset slow',
          '-crf 18',
          '-pix_fmt yuv420p'
        ])
        .on('progress', (progress) => {
          // 진행률 업데이트
          this.updateProgress(data.jobId, progress.percent);
        })
        .on('end', async () => {
          // S3에 업로드
          await this.uploadToS3(outputPath, data.jobId);
          resolve({ success: true });
        })
        .on('error', reject)
        .save(outputPath);
    });
  }
}
```

### 4. AI 워커 (Python)

```python
# ai-workers/enhance_worker.py
import torch
from realesrgan import RealESRGANer
from basicsr.archs.rrdbnet_arch import RRDBNet
import cv2
import redis
import json

class VideoEnhancer:
    def __init__(self):
        self.redis_client = redis.Redis(host='localhost', port=6379)
        self.model = self.load_model()
    
    def load_model(self):
        """Real-ESRGAN 모델 로드"""
        model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, 
                       num_block=23, num_grow_ch=32, scale=4)
        
        upsampler = RealESRGANer(
            scale=4,
            model_path='weights/RealESRGAN_x4plus.pth',
            model=model,
            tile=400,
            tile_pad=10,
            pre_pad=0,
            half=True  # FP16 for faster processing
        )
        return upsampler
    
    def enhance_video(self, input_path: str, output_path: str, 
                     job_id: str):
        """비디오 화질 개선"""
        cap = cv2.VideoCapture(input_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # 출력 비디오 설정
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_path, fourcc, fps, 
                             (width * 4, height * 4))
        
        frame_count = 0
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # AI 화질 개선
            enhanced_frame, _ = self.model.enhance(frame, outscale=4)
            out.write(enhanced_frame)
            
            # 진행률 업데이트
            frame_count += 1
            progress = int((frame_count / total_frames) * 100)
            self.update_progress(job_id, progress)
        
        cap.release()
        out.release()
        return True
    
    def update_progress(self, job_id: str, progress: int):
        """Redis에 진행률 업데이트"""
        self.redis_client.set(f"progress:{job_id}", progress)

if __name__ == "__main__":
    enhancer = VideoEnhancer()
    # 워커 시작
    enhancer.start_worker()
```

### 5. Docker Compose 설정

```yaml
version: '3.8'

services:
  # Frontend
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:4000

  # Backend API
  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - DATABASE_URL=postgresql://user:pass@postgres:5432/easyvideo
      - AWS_REGION=us-east-1
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
    depends_on:
      - redis
      - postgres

  # AI Workers (GPU required)
  ai-worker:
    build: ./ai-workers
    runtime: nvidia
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    volumes:
      - ./models:/app/models
    depends_on:
      - redis

  # Redis (Queue)
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

  # PostgreSQL (Database)
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=easyvideo
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  redis-data:
  postgres-data:
```

## 🔐 보안 고려사항

### 1. 파일 업로드 보안
- 파일 크기 제한 (예: 500MB)
- MIME 타입 검증
- 악성 파일 스캔
- 임시 파일 자동 삭제

### 2. API 보안
- JWT 인증
- Rate Limiting
- CORS 설정
- API Key 관리

### 3. 데이터 보안
- S3 버킷 암호화
- HTTPS 전송
- 처리 후 자동 삭제 (24시간)

## 💰 비용 최적화

### 1. 컴퓨팅 최적화
- 오토스케일링
- Spot 인스턴스 활용
- 배치 처리

### 2. 스토리지 최적화
- 압축 저장
- Lifecycle 정책 (자동 삭제)
- CDN 캐싱

### 3. 대역폭 최적화
- 비디오 스트리밍
- 청크 업로드
- 압축 전송

## 📊 모니터링

### 필요한 메트릭
- 작업 처리 시간
- 성공/실패율
- 리소스 사용률 (CPU, GPU, 메모리)
- API 응답 시간
- 비용 추적

### 도구
- **Prometheus**: 메트릭 수집
- **Grafana**: 시각화
- **Sentry**: 에러 추적
- **CloudWatch**: AWS 모니터링

## 🚀 배포 전략

### Phase 1: MVP
- 기본 업로드/다운로드
- 간단한 화질 개선
- 최소 기능

### Phase 2: AI 통합
- Real-ESRGAN 화질 개선
- Lama Cleaner 워터마크 제거
- RemBG 배경 제거

### Phase 3: 고급 기능
- 실시간 프리뷰
- 협업 기능
- API 제공

### Phase 4: 확장
- 모바일 앱
- 더 많은 AI 모델
- 플러그인 시스템

---

**참고**: 이것은 가이드입니다. 실제 구현 시 프로젝트 요구사항에 맞게 조정하세요.
