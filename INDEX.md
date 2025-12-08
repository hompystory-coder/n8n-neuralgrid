# NeuralGrid 플랫폼 업그레이드 - 파일 인덱스

## 📚 문서 구조

### 🚀 시작하기 (필수 문서)

1. **README.md** ⭐ START HERE
   - 패키지 전체 개요
   - 빠른 시작 가이드
   - 아키텍처 다이어그램
   - 접속 URL 정리

2. **QUICK_START.md** ⚡ 빠른 배포 (5-7분)
   - 최소 단계로 배포
   - 명령어 중심
   - 초보자 친화적

3. **DEPLOYMENT_INSTRUCTIONS.md** 📋 상세 가이드 (45분)
   - 단계별 상세 설명
   - 각 단계의 예상 출력
   - 트러블슈팅 포함

4. **FILE_MAPPING.md** 🗂️ 파일 경로 매핑
   - 모든 파일의 설치 위치
   - 디렉토리 구조
   - 빠른 복사 명령어

5. **SUMMARY.md** 📊 프로젝트 요약
   - 전체 프로젝트 개요
   - 기술 스택
   - 성능 지표
   - 통계 정보

---

## 💻 소스 코드 파일

### 데이터베이스 & 인증
| 파일 | 설명 | 대상 경로 |
|------|------|-----------|
| `step1_prisma_schema.prisma` | Prisma 데이터베이스 스키마 | `apps/web/prisma/schema.prisma` |
| `step2_nextauth_route.ts` | NextAuth 설정 | `apps/web/app/api/auth/[...nextauth]/route.ts` |
| `step3_signup_api.ts` | 회원가입 API | `apps/web/app/api/auth/signup/route.ts` |

### 사용자 페이지
| 파일 | 설명 | 대상 경로 |
|------|------|-----------|
| `step4_signin_page.tsx` | 로그인 페이지 | `apps/web/app/auth/signin/page.tsx` |
| `step5_signup_page.tsx` | 회원가입 페이지 | `apps/web/app/auth/signup/page.tsx` |
| `step6_mypage.tsx` | 마이페이지 | `apps/web/app/mypage/page.tsx` |
| `step7_user_profile_api.ts` | 프로필 API | `apps/web/app/api/user/profile/route.ts` |

### 관리자 기능
| 파일 | 설명 | 대상 경로 |
|------|------|-----------|
| `step8_admin_page.tsx` | 관리자 대시보드 | `apps/web/app/admin/page.tsx` |
| `step9_admin_stats_api.ts` | 관리자 통계 API | `apps/web/app/api/admin/stats/route.ts` |

### 서버 모니터링
| 파일 | 설명 | 대상 경로 |
|------|------|-----------|
| `step10_monitor_server.js` | Express 모니터링 서버 | `monitor-server/index.js` |
| `step11_monitor_page.tsx` | 모니터링 UI 페이지 | `apps/web/app/monitor/page.tsx` |

### 배포 스크립트
| 파일 | 설명 | 사용법 |
|------|------|--------|
| `step12_deploy_script.sh` | 자동 배포 스크립트 | `chmod +x && ./step12_deploy_script.sh` |

---

## 📖 문서별 사용 시나리오

### 시나리오 1: 처음 배포하는 경우
```
1. README.md (전체 이해)
   ↓
2. QUICK_START.md (빠른 배포)
   ↓
3. 배포 실행
   ↓
4. SUMMARY.md (결과 확인)
```

### 시나리오 2: 신중하게 배포하는 경우
```
1. README.md (전체 이해)
   ↓
2. FILE_MAPPING.md (파일 구조 파악)
   ↓
3. DEPLOYMENT_INSTRUCTIONS.md (상세 가이드)
   ↓
4. 단계별 배포 실행
   ↓
5. SUMMARY.md (결과 확인)
```

### 시나리오 3: 문제 발생 시
```
1. DEPLOYMENT_INSTRUCTIONS.md
   → 트러블슈팅 섹션
   ↓
2. 로그 확인 (pm2 logs, nginx logs)
   ↓
3. 필요 시 롤백
```

---

## 🔍 파일 크기 참조

### 문서 파일
```
README.md                      - 14K  (메인 가이드)
DEPLOYMENT_INSTRUCTIONS.md     - 16K  (상세 배포)
SUMMARY.md                     - 12K  (프로젝트 요약)
FILE_MAPPING.md                - 8.4K (파일 경로)
QUICK_START.md                 - 7.8K (빠른 시작)
NEURALGRID_UPGRADE_GUIDE.md    - 7.2K (업그레이드 개요)
```

### 소스 코드 파일
```
step11_monitor_page.tsx        - 9.3K (모니터링 UI)
step8_admin_page.tsx           - 8.8K (관리자 대시보드)
step6_mypage.tsx               - 8.1K (마이페이지)
step12_deploy_script.sh        - 7.7K (배포 스크립트)
step5_signup_page.tsx          - 6.5K (회원가입 페이지)
step10_monitor_server.js       - 4.8K (모니터링 서버)
step4_signin_page.tsx          - 4.4K (로그인 페이지)
step1_prisma_schema.prisma     - 3.4K (DB 스키마)
step3_signup_api.ts            - 2.6K (회원가입 API)
step2_nextauth_route.ts        - 2.5K (NextAuth)
step7_user_profile_api.ts      - 2.4K (프로필 API)
step9_admin_stats_api.ts       - 2.2K (통계 API)
```

**총 크기**: 약 140KB (압축 전)

---

## 🎯 권장 순서

### 1단계: 준비 (읽기)
```bash
cat README.md          # 전체 개요
cat QUICK_START.md     # 빠른 시작 (또는)
cat DEPLOYMENT_INSTRUCTIONS.md  # 상세 가이드
```

### 2단계: 파일 확인
```bash
cat FILE_MAPPING.md    # 파일 경로 확인
ls -la step*.{prisma,ts,tsx,js,sh}  # 파일 존재 확인
```

### 3단계: 배포 시작
```bash
# Quick Start 방식 (추천)
# QUICK_START.md 파일의 명령어를 순서대로 실행

# 또는 자동 스크립트 방식
chmod +x step12_deploy_script.sh
./step12_deploy_script.sh
```

### 4단계: 확인
```bash
cat SUMMARY.md         # 배포 결과 요약
```

---

## 📂 파일 복사 체크리스트

### Phase 1: 디렉토리 생성
```bash
cd ~/n8n-neuralgrid/apps/web
mkdir -p prisma
mkdir -p app/api/auth/{[...nextauth],signup}
mkdir -p app/api/{user/profile,admin/stats}
mkdir -p app/auth/{signin,signup}
mkdir -p app/{mypage,admin,monitor}

cd ~/n8n-neuralgrid
mkdir -p monitor-server
```

### Phase 2: 파일 복사
- [ ] `step1_prisma_schema.prisma` → `apps/web/prisma/schema.prisma`
- [ ] `step2_nextauth_route.ts` → `apps/web/app/api/auth/[...nextauth]/route.ts`
- [ ] `step3_signup_api.ts` → `apps/web/app/api/auth/signup/route.ts`
- [ ] `step4_signin_page.tsx` → `apps/web/app/auth/signin/page.tsx`
- [ ] `step5_signup_page.tsx` → `apps/web/app/auth/signup/page.tsx`
- [ ] `step6_mypage.tsx` → `apps/web/app/mypage/page.tsx`
- [ ] `step7_user_profile_api.ts` → `apps/web/app/api/user/profile/route.ts`
- [ ] `step8_admin_page.tsx` → `apps/web/app/admin/page.tsx`
- [ ] `step9_admin_stats_api.ts` → `apps/web/app/api/admin/stats/route.ts`
- [ ] `step10_monitor_server.js` → `monitor-server/index.js`
- [ ] `step11_monitor_page.tsx` → `apps/web/app/monitor/page.tsx`

---

## 🔑 핵심 파일 요약

### 필수 문서 (반드시 읽어야 함)
1. **README.md** - 시작점
2. **QUICK_START.md** 또는 **DEPLOYMENT_INSTRUCTIONS.md** - 배포 가이드

### 필수 소스 파일 (12개 모두 필요)
- 데이터베이스: `step1`
- 인증: `step2`, `step3`, `step4`, `step5`
- 사용자: `step6`, `step7`
- 관리자: `step8`, `step9`
- 모니터링: `step10`, `step11`
- 배포: `step12` (선택)

---

## 💡 팁

### 빠른 참조
```bash
# 모든 문서 파일 목록
ls -1 *.md

# 모든 소스 파일 목록
ls -1 step*

# 파일 내용 빠르게 보기
grep -H "^#" *.md | head -20
```

### 검색
```bash
# 특정 주제 찾기
grep -r "Prisma" *.md
grep -r "NextAuth" *.md
grep -r "모니터링" *.md
```

---

## 🆘 긴급 참조

### 배포 중 오류 발생
→ **DEPLOYMENT_INSTRUCTIONS.md** > 트러블슈팅 섹션

### 파일 경로 확인 필요
→ **FILE_MAPPING.md**

### 빠르게 배포 다시 시작
→ **QUICK_START.md**

### 전체 프로젝트 이해 필요
→ **SUMMARY.md**

---

## 📞 문서 간 연결

```
README.md (시작)
    ├── QUICK_START.md (빠른 배포)
    ├── DEPLOYMENT_INSTRUCTIONS.md (상세 배포)
    │   └── FILE_MAPPING.md (파일 경로)
    └── SUMMARY.md (프로젝트 요약)
        └── NEURALGRID_UPGRADE_GUIDE.md (업그레이드 개요)
```

---

## ✅ 배포 완료 확인

배포가 완료되면:
1. ✅ PM2 프로세스 4개 모두 `online`
2. ✅ https://neuralgrid.kr/auth/signin (200 OK)
3. ✅ https://neuralgrid.kr/auth/signup (200 OK)
4. ✅ https://monitor.neuralgrid.kr (200 OK)
5. ✅ 회원가입/로그인 작동
6. ✅ 마이페이지 접근 가능
7. ✅ 관리자 대시보드 접근 (ADMIN)

---

**이제 시작할 준비가 되었습니다!**

👉 다음 단계: **[README.md](./README.md)** 를 읽고 배포를 시작하세요!
