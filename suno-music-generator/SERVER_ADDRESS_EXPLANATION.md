# 🌐 서버 주소 안내 - Sandbox URL vs Local URL

## ❓ 사용자 질문

> "자꾸 https://5000-iivtan8dhgihp36f7am7d-a402f90a.sandbox.novita.ai/ 여기주소로 알려주는데 여기 주소로 작업한거야? 여기가 아니잖아"

## 📍 주소 설명

### 현재 작업 환경

#### 1. **실제 개발 위치**
```bash
/home/user/webapp/suno-music-generator
```
- ✅ **이곳에서 모든 코드 작업이 이루어집니다**
- ✅ **Git 저장소가 여기에 있습니다**
- ✅ **서버가 여기서 실행됩니다**

#### 2. **서버 실행 포트**
```
http://localhost:5000
```
- ✅ 서버는 **포트 5000**에서 실행 중
- ✅ `node server/index.js` 명령으로 실행
- ✅ 로컬 네트워크에서는 이 주소로 접속

#### 3. **Sandbox 공개 URL** (⚠️ 중요!)
```
https://5000-iivtan8dhgihp36f7am7d-a402f90a.sandbox.novita.ai/
```
- ✅ **이것은 외부에서 접속 가능한 공개 URL입니다**
- ✅ Sandbox 환경에서 자동으로 생성된 URL
- ✅ **실제로 사용자가 브라우저에서 접속해야 하는 주소**

---

## 🔍 왜 Sandbox URL을 알려주는가?

### Sandbox 환경의 특성

#### ❌ **문제: localhost는 외부 접속 불가**
```
http://localhost:5000  ← 개발자 컴퓨터에서만 접속 가능!
```
- 사용자의 브라우저에서는 **접속할 수 없습니다**
- `localhost`는 각 컴퓨터의 자기 자신을 가리킴
- 개발 서버가 Sandbox 내부에서 실행 중이므로 외부 접근 불가

#### ✅ **해결: Sandbox 공개 URL**
```
https://5000-iivtan8dhgihp36f7am7d-a402f90a.sandbox.novita.ai/  ← 어디서든 접속 가능!
```
- Sandbox 시스템이 자동으로 생성한 **공개 URL**
- 인터넷에 연결된 어디서든 접속 가능
- 포트 5000을 외부에 노출

---

## 🎯 정리

### 작업 흐름

```
┌─────────────────────────────────────────────────────────────┐
│ 1. 개발자 작업 위치                                            │
│    /home/user/webapp/suno-music-generator                    │
│                                                               │
│    ↓ (코드 작성, Git 커밋)                                    │
│                                                               │
│ 2. 서버 실행                                                  │
│    node server/index.js                                       │
│    → http://localhost:5000 (Sandbox 내부에서만 접근 가능)      │
│                                                               │
│    ↓ (Sandbox 시스템이 자동으로 공개 URL 생성)                 │
│                                                               │
│ 3. 공개 URL (사용자 접속용)                                    │
│    https://5000-iivtan8dhgihp36f7am7d-a402f90a.sandbox.novita.ai/ │
│    → 어디서든 브라우저로 접속 가능!                             │
└─────────────────────────────────────────────────────────────┘
```

### 핵심 포인트

1. ✅ **코드 작업**: `/home/user/webapp/suno-music-generator` 에서 진행
2. ✅ **서버 실행**: `localhost:5000` 에서 실행
3. ✅ **사용자 접속**: `https://5000-iivtan8dhgihp36f7am7d-a402f90a.sandbox.novita.ai/` 사용

---

## 🌐 URL 구조 설명

### Sandbox URL 분석
```
https://5000-iivtan8dhgihp36f7am7d-a402f90a.sandbox.novita.ai/
       ^^^^  ^^^^^^^^^^^^^^^^^^^^^^^^^^  ^^^^^^^^ ^^^^^^^^
       │     │                           │        │
       │     │                           │        └─ 도메인
       │     │                           └─────────── Sandbox 시스템
       │     └─────────────────────────────────────── Sandbox ID
       └──────────────────────────────────────────── 포트 번호
```

- **`5000`**: 서버가 실행 중인 포트
- **`iivtan8dhgihp36f7am7d-a402f90a`**: 고유한 Sandbox 세션 ID
- **`sandbox.novita.ai`**: Sandbox 호스팅 도메인

---

## ✅ 확인 방법

### 현재 서버 상태 확인
```bash
# 1. 작업 디렉토리 확인
pwd
# 출력: /home/user

cd /home/user/webapp/suno-music-generator
pwd
# 출력: /home/user/webapp/suno-music-generator

# 2. 서버 프로세스 확인
ps aux | grep "node server/index.js"
# 출력: user 257476 ... node server/index.js

# 3. 포트 확인
lsof -i:5000
# 출력: node    257476 user   27u  IPv4 ... *:5000 (LISTEN)
```

### 접속 테스트
```bash
# Sandbox 내부에서 테스트
curl http://localhost:5000

# 외부에서 테스트 (브라우저)
https://5000-iivtan8dhgihp36f7am7d-a402f90a.sandbox.novita.ai/
```

---

## 🎯 사용자 접속 가이드

### 1. **워크플로우 페이지 접속**
```
https://5000-iivtan8dhgihp36f7am7d-a402f90a.sandbox.novita.ai/workflow
```

### 2. **메인 페이지**
```
https://5000-iivtan8dhgihp36f7am7d-a402f90a.sandbox.novita.ai/
```

### 3. **API 엔드포인트**
```
https://5000-iivtan8dhgihp36f7am7d-a402f90a.sandbox.novita.ai/api/...
```

---

## ❓ 자주 묻는 질문 (FAQ)

### Q1: "localhost로 접속하면 안 되나요?"
**A**: ❌ Sandbox 환경에서는 불가능합니다.
- `localhost`는 각 컴퓨터의 자기 자신을 가리킵니다
- 사용자의 브라우저에서 `localhost:5000`을 열면 사용자의 컴퓨터의 포트 5000을 찾습니다
- 개발 서버는 Sandbox 안에 있으므로 외부에서 접근 불가

### Q2: "Sandbox URL이 바뀌나요?"
**A**: ✅ Sandbox 세션이 재시작되면 **변경될 수 있습니다**.
- Sandbox ID가 바뀌면 URL도 변경됨
- 현재 세션에서는 `iivtan8dhgihp36f7am7d-a402f90a` 사용 중
- 재시작 시 새로운 ID 생성 가능

### Q3: "실제 배포 후에는 어떤 주소를 사용하나요?"
**A**: ✅ 배포 환경에 따라 다릅니다:
- **Vercel**: `https://your-project.vercel.app`
- **Netlify**: `https://your-project.netlify.app`
- **도메인 연결 시**: `https://yourdomain.com`

### Q4: "코드는 어디서 작업하나요?"
**A**: ✅ `/home/user/webapp/suno-music-generator`
- 모든 코드 수정은 이 경로에서 진행
- Git 저장소도 여기에 위치
- 서버도 이 경로에서 실행

---

## 🎉 결론

### ✅ **맞습니다! 해당 주소로 작업 중입니다**

```
작업 위치: /home/user/webapp/suno-music-generator
실행 서버: http://localhost:5000 (Sandbox 내부)
공개 URL: https://5000-iivtan8dhgihp36f7am7d-a402f90a.sandbox.novita.ai/ (외부 접속용)
```

### 핵심 이해
1. **코드 작업은 `/home/user/webapp/suno-music-generator`에서 진행**
2. **서버는 `localhost:5000`에서 실행 중**
3. **사용자는 Sandbox URL로 접속**

### 왜 Sandbox URL인가?
- Sandbox 환경의 특성상 외부 접속을 위해 필요
- 자동으로 생성되는 공개 URL
- 개발과 테스트를 위한 임시 주소

---

**작성일**: 2026-05-05  
**현재 Sandbox ID**: `iivtan8dhgihp36f7am7d-a402f90a`  
**공개 URL**: `https://5000-iivtan8dhgihp36f7am7d-a402f90a.sandbox.novita.ai/`  
**서버 포트**: `5000`
