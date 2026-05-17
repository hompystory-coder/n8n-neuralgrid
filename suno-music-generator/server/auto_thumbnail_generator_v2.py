#!/usr/bin/env python3
"""
🎨 완전 자동화 썸네일 생성 시스템 v2
OpenAI DALL-E 3를 사용하여 완전히 자동으로 4개 이미지 생성
"""

import requests
import time
import json
import sys
import os
from datetime import datetime
from openai import OpenAI
from pathlib import Path

# .env 파일 읽기
def load_env_file():
    """Load environment variables from .env file"""
    env_path = Path(__file__).parent.parent / '.env'
    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key] = value

# .env 로드
load_env_file()

# 설정
SERVER_URL = os.getenv('SERVER_URL', 'http://localhost:5000')
WEBHOOK_BASE = f'{SERVER_URL}/api/webhook'
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')

# OpenAI 클라이언트 초기화
if not OPENAI_API_KEY:
    print("❌ OPENAI_API_KEY 환경변수가 설정되지 않았습니다!")
    sys.exit(1)

client = OpenAI(api_key=OPENAI_API_KEY)

def log(message):
    """타임스탬프와 함께 로그 출력"""
    timestamp = datetime.now().strftime('%H:%M:%S')
    print(f"[{timestamp}] {message}")
    sys.stdout.flush()

def fetch_pending_thumbnails():
    """대기 중인 썸네일 요청 가져오기"""
    try:
        response = requests.get(f'{WEBHOOK_BASE}/thumbnail-queue', timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if data.get('success') and data.get('count', 0) > 0:
            # pending 상태만 필터링
            pending_requests = [r for r in data.get('requests', []) if r.get('status') == 'pending']
            if pending_requests:
                log(f"✅ {len(pending_requests)}개의 대기 중인 썸네일 발견")
                return pending_requests
        
        return []
            
    except Exception as e:
        log(f"❌ 큐 조회 실패: {e}")
        return []

def generate_image_with_dalle3(prompt, size='1792x1024', quality='standard'):
    """
    DALL-E 3로 단일 이미지 생성
    """
    try:
        log(f"🎨 [DALL-E 3] 이미지 생성 시작...")
        
        response = client.images.generate(
            model='dall-e-3',
            prompt=prompt,
            n=1,
            size=size,
            quality=quality,
            style='vivid'
        )
        
        image_url = response.data[0].url
        revised_prompt = response.data[0].revised_prompt
        
        log(f"✅ [DALL-E 3] 생성 완료!")
        
        return {
            'success': True,
            'imageUrl': image_url,
            'revisedPrompt': revised_prompt,
            'width': 1792 if size == '1792x1024' else 1024,
            'height': 1024 if size == '1792x1024' else 1792
        }
    except Exception as e:
        log(f"❌ [DALL-E 3] 생성 실패: {e}")
        return {
            'success': False,
            'error': str(e)
        }

def generate_4_thumbnails(prompts):
    """
    4개의 썸네일을 순차적으로 생성
    """
    log(f"\n{'='*70}")
    log(f"🚀 [DALL-E 3] 4개 썸네일 생성 시작")
    log(f"{'='*70}\n")
    
    results = []
    errors = []
    
    for i, prompt_data in enumerate(prompts, 1):
        log(f"\n[{i}/4] {prompt_data['label']} 생성 중...")
        
        try:
            result = generate_image_with_dalle3(prompt_data['prompt'])
            
            if result['success']:
                results.append({
                    'version': prompt_data['version'],
                    'label': prompt_data['label'],
                    'imageUrl': result['imageUrl'],
                    'imageUrlNoWatermark': result['imageUrl'],  # DALL-E는 워터마크 없음
                    'width': result['width'],
                    'height': result['height']
                })
                log(f"✅ [{i}/4] {prompt_data['label']} 완료")
            else:
                errors.append({
                    'version': prompt_data['version'],
                    'label': prompt_data['label'],
                    'error': result.get('error', 'Unknown error')
                })
                log(f"❌ [{i}/4] {prompt_data['label']} 실패")
        except Exception as e:
            errors.append({
                'version': prompt_data['version'],
                'label': prompt_data['label'],
                'error': str(e)
            })
            log(f"❌ [{i}/4] {prompt_data['label']} 오류: {e}")
        
        # Rate limit 방지
        if i < len(prompts):
            log(f"⏳ 다음 이미지를 위해 2초 대기...")
            time.sleep(2)
    
    log(f"\n{'='*70}")
    log(f"✅ [DALL-E 3] 생성 완료")
    log(f"   성공: {len(results)}/4")
    log(f"   실패: {len(errors)}/4")
    log(f"{'='*70}\n")
    
    return {
        'success': len(results) > 0,
        'results': results,
        'errors': errors
    }

def send_completion_webhook(request_id, images):
    """
    완료된 썸네일을 웹훅으로 전송
    """
    try:
        log(f"\n📤 웹훅 전송 시작...")
        log(f"   Request ID: {request_id}")
        log(f"   이미지 수: {len(images)}개")
        
        payload = {
            'requestId': request_id,
            'images': images,
            'timestamp': datetime.now().isoformat()
        }
        
        response = requests.post(
            f'{WEBHOOK_BASE}/thumbnail-complete',
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        response.raise_for_status()
        
        log(f"✅ 웹훅 전송 성공!")
        return True
    except Exception as e:
        log(f"❌ 웹훅 전송 실패: {e}")
        return False

def process_thumbnail_request_auto(request_data):
    """썸네일 요청 자동 처리 (OpenAI DALL-E 3 사용)"""
    request_id = request_data.get('requestId')
    title = request_data.get('title')
    clean_title = request_data.get('cleanTitle', title)
    prompts = request_data.get('prompts', [])
    
    log(f"\n{'='*70}")
    log(f"🎨 새 썸네일 요청 감지!")
    log(f"{'='*70}")
    log(f"📌 Request ID: {request_id}")
    log(f"📝 제목: {title}")
    log(f"✂️  정리된 제목: {clean_title}")
    log(f"🎯 생성할 버전: {len(prompts)}개")
    log(f"{'='*70}\n")
    
    if len(prompts) != 4:
        log(f"❌ 프롬프트가 4개가 아닙니다: {len(prompts)}개")
        return False
    
    # 4개 이미지 생성
    generation_result = generate_4_thumbnails(prompts)
    
    if not generation_result['success'] or len(generation_result['results']) == 0:
        log(f"❌ 이미지 생성 실패")
        return False
    
    # 완료 웹훅 전송
    success = send_completion_webhook(request_id, generation_result['results'])
    
    if success:
        log(f"\n🎉 썸네일 생성 및 전송 완료!")
        log(f"   생성된 이미지: {len(generation_result['results'])}개")
        log(f"   실패한 이미지: {len(generation_result['errors'])}개")
    
    return success

def main():
    """메인 루프 - 계속 모니터링"""
    log("="*70)
    log("🚀 완전 자동화 썸네일 생성 시스템 v2 (OpenAI DALL-E 3)")
    log("="*70)
    log(f"서버 URL: {SERVER_URL}")
    log(f"체크 주기: 5초")
    log(f"이미지 생성: OpenAI DALL-E 3 (완전 자동)")
    log(f"\n💡 작동 방식:")
    log(f"1. 5초마다 대기 중인 썸네일 요청 확인")
    log(f"2. 새 요청 감지 시 자동으로 DALL-E 3 호출")
    log(f"3. 4개 이미지 순차 생성 (각 2초 간격)")
    log(f"4. 완료 후 자동으로 웹훅 전송")
    log(f"5. 웹사이트에 실시간 표시")
    log("="*70 + "\n")
    
    processed_requests = set()
    
    try:
        while True:
            pending = fetch_pending_thumbnails()
            
            if pending:
                for request in pending:
                    request_id = request.get('requestId')
                    
                    # 이미 처리한 요청은 스킵
                    if request_id in processed_requests:
                        continue
                    
                    log(f"\n🔔 새 요청 발견: {request_id}")
                    success = process_thumbnail_request_auto(request)
                    
                    if success:
                        processed_requests.add(request_id)
                        log(f"✅ 요청 처리 완료\n")
                    else:
                        log(f"❌ 요청 처리 실패\n")
                    
                    log(f"{'-'*70}\n")
            
            # 5초마다 체크
            time.sleep(5)
            
    except KeyboardInterrupt:
        log(f"\n\n👋 시스템 종료")
        sys.exit(0)
    except Exception as e:
        log(f"\n❌ 오류 발생: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
