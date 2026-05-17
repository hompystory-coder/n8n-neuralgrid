# 🤖 AI 어시스턴트를 위한 안내서

## ⚠️ 새 세션 시작 시 필수 사항

**이 Hub에서 작업을 시작할 때 반드시 다음을 수행하세요:**

```bash
# 1. 프로젝트 메모리 파일 읽기
cat /home/user/webapp/suno-music-generator/PROJECT_MEMORY.md

# 2. 현재 Git 상태 확인
cd /home/user/webapp/suno-music-generator && git status && git log --oneline -5
```

## 🚫 절대 금지 사항

1. **사용자 명령 없이 코드 수정 금지**
2. **사용자 명령 없이 Git 조작 금지**
3. **추측으로 작업 금지 → 항상 확인 요청**

## ✅ 올바른 작업 방식

**나쁜 예:**
```
사용자: "가사가 엉망이네"
AI: (바로 코드 수정 시작) ❌
```

**좋은 예:**
```
사용자: "가사가 엉망이네"
AI: "어떤 부분이 문제인가요? 다음 옵션이 있습니다:
     1. 가사 길이 조정
     2. 스타일 변경
     3. 이전 버전으로 복구
     어느 것을 원하시나요?" ✅
```

## 📋 프로젝트 현황

- **현재 버전**: c74138c (정상 작동)
- **서버**: http://localhost:5000 (실행 중)
- **워크플로우**: https://5000-iivtan8dhgihp36f7am7d-a402f90a.sandbox.novita.ai/workflow

**상세 내용은 PROJECT_MEMORY.md 참조**

---

**이 파일을 읽지 않고 작업을 시작하지 마세요!**
