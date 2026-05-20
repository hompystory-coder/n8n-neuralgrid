# 🎭 가사 감정 강화 업그레이드 (Emotional Story Enhancement)

## 📋 작업 완료 내역

### ✅ 1단계: 이슈 수집 강화 (Issue Collection)

**문제점**:
- 이슈 수집이 너무 일반적 (단순 "웹 검색해라" 만 요청)
- emotionalStory가 너무 짧음 (100자) - 감정 표현 부족
- 구체적 상황/스토리 없이 단순 키워드만 전달

**해결책**:
```javascript
// 🔥 BEFORE (100자):
"emotionalStory": "새벽 카페에서 따뜻한 커피 향에 취해, 창밖 빗소리를 들으며 혼자만의 시간을 즐기는 직장인. 일상의 소소한 행복을 느낀다."

// ✅ AFTER (300자):
"emotionalStory": "새벽 6시, 아직 어두운 주방에서 커피를 내리는 직장인. 원두 갈리는 소리, 뜨거운 물 부어지는 소리에 하루가 시작된다. 창가에 앉아 따뜻한 커피를 마시며 혼자만의 고요한 시간을 즐긴다. 점점 밝아오는 하늘을 보며, 오늘 하루도 잘 보낼 수 있을 것 같은 용기가 생긴다. 작은 행복이 주는 평온함."
```

**추가 필드**:
- `emotionalStory`: 300자 이상, 구체적 시간·장소·인물·행동·감정 변화
- `sensoryDetails`: 시각/청각/후각/촉각 디테일
- `characterMood`: 인물의 감정 변화
- `moment`: 가장 인상 깊은 순간

---

### ✅ 2단계: 가사 생성 프롬프트 강화 (Lyrics Generation)

**문제점**:
- 가사 생성 시 이슈 제목/키워드만 사용
- 감정 스토리를 활용하지 않음
- System Instruction이 너무 짧고 감정 지시 부족

**해결책**:
```javascript
// 🎯 BEFORE (짧은 System Instruction):
당신은 전문 작사가입니다. 
가사 길이: 350-550자
7개 섹션만 사용
Pre-Chorus 금지

// ✅ AFTER (강화된 System Instruction):
당신은 전문 작사가입니다. ${index + 1}번째 곡 작성 중.

🎯 **이번 곡의 스타일**: "${selectedStyle.name}" - ${selectedStyle.description}

🚨 **절대 준수사항**:
1. **가사 길이: ${minChars}-${maxChars}${unit}** (절대 초과 금지!)
2. **7개 섹션**: [Intro] 2줄, [Verse 1] 3줄, [Chorus] 3줄, [Verse 2] 3줄, [Chorus] 3줄, [Bridge] 2줄, [Outro] 2줄
3. 한 줄 최대 12-15자
4. **Pre-Chorus, Verse 3, Final Chorus 절대 금지!**

🎭 **핵심 작사 원칙**:
- **이슈 자체가 아니라, 이슈 속 "감정 스토리"를 가사로 전환**
- **"emotionalStory"에 등장하는 시간, 장소, 인물, 행동, 감정을 활용**
- **"sensoryDetails"를 은유와 이미지로 풀어서 표현**
- 키워드를 직접 말하지 말고, **키워드가 주는 느낌을 시적으로 묘사**
- Verse 1은 상황 전개, Verse 2는 감정 심화, Chorus는 핵심 메시지 반복
- Bridge는 클라이맥스 감정, Outro는 여운과 마무리
- **모든 줄은 구체적 이미지와 감각으로 구성** (추상적 표현 지양)
```

**User Prompt에 추가**:
```javascript
📰 **이슈**: ${issue.title}
📖 **설명**: ${issue.description}
💭 **감정 스토리**: ${issue.emotionalStory || issue.description}  // ← 추가!
👁️ **감각 디테일**: ${issue.sensoryDetails || '(없음)'}           // ← 추가!
😊 **분위기**: ${issue.mood}
🏷️ **키워드**: ${issue.keywords.join(', ')}
```

---

## 📊 예상 효과

### BEFORE (이전):
1. **이슈 수집**: "홈카페 트렌드" (키워드만)
2. **가사 생성**: "홈카페", "커피", "취미" 키워드를 그대로 사용한 평범한 가사

### AFTER (현재):
1. **이슈 수집**: 
   - 이슈: "홈카페 트렌드"
   - 감정 스토리: "새벽 6시, 아직 어두운 주방에서 커피를 내리는 직장인. 원두 갈리는 소리, 뜨거운 물 부어지는 소리에 하루가 시작된다..."
   - 감각 디테일: "진한 커피 향, 따뜻한 컵의 온기, 창밖 아침 햇살"

2. **가사 생성**:
   - 감정 스토리를 바탕으로 "새벽", "주방", "혼자만의 시간", "작은 행복" 등의 구체적 이미지와 감정을 은유로 표현
   - 키워드 "홈카페"를 직접 언급하지 않고, "새벽의 고요", "따뜻한 향기", "나만의 시간" 등으로 시적으로 표현

---

## 🎯 핵심 개선사항

| 항목 | BEFORE | AFTER | 효과 |
|------|--------|-------|------|
| emotionalStory | 100자 | 300자+ | 📈 3배 확대 → 구체적 스토리 |
| 프롬프트 길이 | 10줄 | 30줄+ | 📈 3배 강화 → 명확한 지시 |
| 감정 표현 | 키워드 중심 | 스토리 중심 | 🎭 시적 표현 증가 |
| 감각 디테일 | 없음 | 5감 활용 | 👁️ 구체성 증가 |

---

## 🚀 테스트 방법

1. **서버 접속**: https://5000-iivtan8dhgihp36f7am7d-a402f90a.sandbox.novita.ai/workflow
2. **음악 생성**:
   - 스타일: `Clear vocals, catchy, pop, emotional`
   - 언어: `Korean`
   - 성별: `Female` 또는 `Male`
   - 곡 수: `2-3곡`
3. **확인 사항**:
   - ✅ 가사가 350-550자 이내인가?
   - ✅ Pre-Chorus, Verse 3, Final Chorus가 없는가?
   - ✅ 가사가 감정 스토리를 반영하는가?
   - ✅ 키워드를 직접 언급하지 않고 은유로 표현하는가?

---

## 🔍 로그 확인

```bash
# 이슈 수집 확인 (emotionalStory 포함 여부)
cat /tmp/suno-final2.log | grep "emotionalStory" | head -3

# 가사 생성 확인 (길이 검증)
cat /tmp/suno-final2.log | grep "가사 생성 완료" | tail -5

# Gemini 프롬프트 확인
cat /tmp/suno-final2.log | grep -A 30 "🎯 **이번 곡의 스타일**" | head -40
```

---

## 📝 Git 커밋 기록

```bash
# 최근 커밋
git log --oneline -5

# 예상 출력:
# cc8b41d feat: 🎭 가사 감정 강화 - emotionalStory 300자 확대 + 작사 프롬프트 개선
# 8000c0f fix: 🚨 강제 섹션 제거 (항상 적용) - Pre-Chorus/Verse 3/Final Chorus
# ...
```

---

## 💡 다음 단계 제안

1. **A/B 테스트**: BEFORE vs AFTER 가사 비교
2. **사용자 피드백**: 실제 음악 감상 후 평가
3. **추가 감정 스타일**: 현재 6개 → 10개로 확대?
4. **Gemini 파라미터 최적화**: temperature, maxTokens 조정

---

## 🎉 결론

**핵심 변화**: "이슈 제목 → 가사" 방식에서 **"감정 스토리 → 가사"** 방식으로 전환!

- ✅ 이슈 수집 시 300자 이상 감정 스토리 필수
- ✅ 가사 생성 시 감정 스토리와 감각 디테일 활용
- ✅ System Instruction 강화 (10줄 → 30줄)
- ✅ 작사 원칙 명확화 (은유, 시적 표현, 구체적 이미지)

**기대 효과**: 더 깊이 있고, 감성적이며, 시적인 가사 생성! 🎵🎭
