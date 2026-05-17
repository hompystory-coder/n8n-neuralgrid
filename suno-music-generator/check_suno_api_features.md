# Suno API 기능 조사

## 페르소나 관련 API 엔드포인트

### 1. 페르소나 생성 (Create Persona)
- **가능 여부**: ❓ 확인 필요
- **예상 엔드포인트**: `POST /api/v1/persona/create`
- **필요 파라미터**: 
  - `audio_file`: 음성 샘플 파일
  - `name`: 페르소나 이름
  - `description`: 설명

### 2. 오디오 업로드 (Audio Upload)
- **가능 여부**: ❓ 확인 필요
- **예상 엔드포인트**: `POST /api/v1/audio/upload`

### 3. 기존 음악 분석 (Analyze Music)
- **가능 여부**: ❓ 확인 필요
- **예상 엔드포인트**: `POST /api/v1/audio/analyze`

## 테스트 필요
