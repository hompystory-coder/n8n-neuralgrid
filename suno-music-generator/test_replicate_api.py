#!/usr/bin/env python3
"""
🧪 Replicate FLUX API 테스트 스크립트
완전 자동화 가능 여부 확인
"""

import sys
import os

# 환경 변수 확인
REPLICATE_API_TOKEN = os.getenv('REPLICATE_API_TOKEN', '')

if not REPLICATE_API_TOKEN:
    print("❌ REPLICATE_API_TOKEN 환경 변수가 설정되지 않았습니다")
    print("\n📝 설정 방법:")
    print("1. Replicate 계정 생성: https://replicate.com")
    print("2. API 토큰 발급: https://replicate.com/account/api-tokens")
    print("3. .env 파일에 추가:")
    print("   REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxxxxxxx")
    print("\n또는 직접 실행:")
    print("   REPLICATE_API_TOKEN=r8_xxx python3 test_replicate_api.py")
    sys.exit(1)

# Replicate 라이브러리 확인
try:
    import replicate
    print("✅ Replicate 라이브러리 설치됨")
except ImportError:
    print("❌ Replicate 라이브러리가 설치되지 않았습니다")
    print("\n설치 명령어:")
    print("   pip3 install replicate")
    sys.exit(1)

# API 토큰 설정
os.environ['REPLICATE_API_TOKEN'] = REPLICATE_API_TOKEN

print("\n" + "="*70)
print("🚀 Replicate FLUX Schnell API 테스트")
print("="*70)
print(f"API 토큰: {REPLICATE_API_TOKEN[:10]}...{REPLICATE_API_TOKEN[-5:]}")
print("="*70 + "\n")

# 테스트 1: 단일 이미지 생성
print("📸 테스트 1: 단일 이미지 생성")
print("-"*70)

test_prompt = """
Create a vibrant YouTube thumbnail with a modern, energetic design.
Background: Gradient from deep purple (#8B5CF6) to pink (#EC4899)
Text: "Heartbreak Playlist" in bold, white, stylish font
Style: Cinematic, emotional, high contrast
Add: Subtle music note icons, soft glow effects
Aspect ratio: 16:9
"""

try:
    print(f"프롬프트: {test_prompt.strip()[:100]}...")
    print("생성 중... (약 5-10초 소요)")
    
    output = replicate.run(
        "black-forest-labs/flux-schnell",
        input={
            "prompt": test_prompt.strip(),
            "aspect_ratio": "16:9",
            "num_outputs": 1,
            "output_format": "webp",
            "output_quality": 90
        }
    )
    
    if isinstance(output, list) and len(output) > 0:
        image_url = str(output[0])
    else:
        image_url = str(output)
    
    print(f"\n✅ 성공!")
    print(f"이미지 URL: {image_url}")
    print(f"URL 길이: {len(image_url)} 문자")
    
    # URL 유효성 확인
    if image_url.startswith('http'):
        print("✅ 유효한 HTTP URL")
    else:
        print("⚠️  URL 형식이 예상과 다릅니다")
    
except Exception as e:
    print(f"\n❌ 실패: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n" + "="*70)

# 테스트 2: 4개 연속 생성 (실제 사용 시나리오)
print("📸 테스트 2: 4개 썸네일 연속 생성 (실제 시나리오)")
print("-"*70)

prompts = [
    {
        'label': '디자인 A (텍스트 포함)',
        'prompt': 'YouTube thumbnail: "Heartbreak Playlist" text, purple gradient, cinematic, 16:9'
    },
    {
        'label': '디자인 A (텍스트 없음)',
        'prompt': 'YouTube thumbnail: Abstract broken heart visual, purple gradient, no text, cinematic, 16:9'
    },
    {
        'label': '디자인 B (텍스트 포함)',
        'prompt': 'YouTube thumbnail: "Heartbreak Playlist" neon text, dark moody background, 16:9'
    },
    {
        'label': '디자인 B (텍스트 없음)',
        'prompt': 'YouTube thumbnail: Moody rain and heartbreak visual, no text, dark aesthetic, 16:9'
    }
]

import time

results = []
start_time = time.time()

for i, prompt_data in enumerate(prompts, 1):
    print(f"\n[{i}/4] {prompt_data['label']}")
    print(f"  생성 중...")
    
    try:
        output = replicate.run(
            "black-forest-labs/flux-schnell",
            input={
                "prompt": prompt_data['prompt'],
                "aspect_ratio": "16:9",
                "num_outputs": 1,
                "output_format": "webp",
                "output_quality": 90
            }
        )
        
        if isinstance(output, list) and len(output) > 0:
            image_url = str(output[0])
        else:
            image_url = str(output)
        
        results.append({
            'label': prompt_data['label'],
            'url': image_url,
            'success': True
        })
        
        print(f"  ✅ 완료: {image_url[:60]}...")
        
    except Exception as e:
        results.append({
            'label': prompt_data['label'],
            'error': str(e),
            'success': False
        })
        print(f"  ❌ 실패: {e}")
    
    # 다음 요청 전 짧은 대기
    if i < len(prompts):
        time.sleep(0.5)

end_time = time.time()
total_time = end_time - start_time

print("\n" + "="*70)
print("📊 테스트 결과")
print("="*70)

success_count = sum(1 for r in results if r['success'])
print(f"성공: {success_count}/4")
print(f"실패: {4 - success_count}/4")
print(f"총 소요 시간: {total_time:.1f}초")
print(f"평균 시간/이미지: {total_time/4:.1f}초")

print("\n생성된 이미지:")
for i, result in enumerate(results, 1):
    if result['success']:
        print(f"  {i}. ✅ {result['label']}")
        print(f"      {result['url']}")
    else:
        print(f"  {i}. ❌ {result['label']}: {result.get('error', 'Unknown error')}")

print("\n" + "="*70)

if success_count == 4:
    print("🎉 완벽! 완전 자동화 가능!")
    print("\n다음 단계:")
    print("1. .env 파일에 REPLICATE_API_TOKEN 추가")
    print("2. 서버 재시작: cd /home/user/webapp/suno-music-generator && node server/index.js")
    print("3. 웹사이트에서 AI 모델 'Replicate' 선택")
    print("4. 썸네일 생성 버튼 클릭")
    print("5. 완전 자동으로 생성 및 표시!")
    print("\n💰 예상 비용: $0.012 per 요청 (4 images × $0.003)")
    sys.exit(0)
elif success_count > 0:
    print("⚠️  일부 성공. API 연결은 작동하지만 안정성 확인 필요")
    sys.exit(1)
else:
    print("❌ 모든 테스트 실패. API 토큰 또는 설정 확인 필요")
    sys.exit(1)
