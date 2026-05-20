#!/usr/bin/env python3
"""
🎨 통합 썸네일 자동 생성 시스템
GenSpark와 Replicate FLUX 모두 지원
"""

import requests
import time
import json
import sys
import os
from datetime import datetime
from pathlib import Path

# Replicate 지원 확인
try:
    import replicate
    REPLICATE_AVAILABLE = True
except ImportError:
    REPLICATE_AVAILABLE = False
    print("⚠️  Replicate 라이브러리가 설치되지 않았습니다.")

# OpenAI 지원 확인
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    print("⚠️  OpenAI 라이브러리가 설치되지 않았습니다.")

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
REPLICATE_API_TOKEN = os.getenv('REPLICATE_API_TOKEN', '')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')

# Replicate API 설정
if REPLICATE_AVAILABLE and REPLICATE_API_TOKEN:
    os.environ['REPLICATE_API_TOKEN'] = REPLICATE_API_TOKEN

# OpenAI API 설정
if OPENAI_AVAILABLE and OPENAI_API_KEY:
    openai_client = OpenAI(api_key=OPENAI_API_KEY)
else:
    openai_client = None

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
            pending_requests = [r for r in data.get('requests', []) if r.get('status') == 'pending']
            if pending_requests:
                return pending_requests
        
        return []
            
    except Exception as e:
        log(f"❌ 큐 조회 실패: {e}")
        return []

def generate_image_with_flux(prompt):
    """Replicate FLUX Schnell로 이미지 생성"""
    try:
        log(f"🎨 [FLUX] 이미지 생성 시작...")
        
        output = replicate.run(
            "black-forest-labs/flux-schnell",
            input={
                "prompt": prompt,
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
        
        log(f"✅ [FLUX] 생성 완료!")
        
        return {
            'success': True,
            'imageUrl': image_url,
            'width': 1792,
            'height': 1024
        }
    except Exception as e:
        log(f"❌ [FLUX] 생성 실패: {e}")
        return {
            'success': False,
            'error': str(e)
        }

def generate_image_with_dalle3(prompt):
    """OpenAI DALL-E 3로 이미지 생성"""
    try:
        log(f"🎨 [DALL-E 3] 이미지 생성 시작...")
        
        response = openai_client.images.generate(
            model='dall-e-3',
            prompt=prompt,
            n=1,
            size='1792x1024',  # 16:9 aspect ratio
            quality='standard',
            style='vivid'
        )
        
        image_url = response.data[0].url
        
        log(f"✅ [DALL-E 3] 생성 완료!")
        
        return {
            'success': True,
            'imageUrl': image_url,
            'width': 1792,
            'height': 1024
        }
    except Exception as e:
        log(f"❌ [DALL-E 3] 생성 실패: {e}")
        return {
            'success': False,
            'error': str(e)
        }

def generate_4_thumbnails_replicate(prompts):
    """Replicate로 4개 썸네일 생성"""
    log(f"\n{'='*70}")
    log(f"🚀 [Replicate FLUX] 4개 썸네일 생성 시작")
    log(f"{'='*70}\n")
    
    results = []
    errors = []
    
    for i, prompt_data in enumerate(prompts, 1):
        log(f"\n[{i}/4] {prompt_data['label']} 생성 중...")
        
        try:
            result = generate_image_with_flux(prompt_data['prompt'])
            
            if result['success']:
                results.append({
                    'version': prompt_data['version'],
                    'label': prompt_data['label'],
                    'imageUrl': result['imageUrl'],
                    'imageUrlNoWatermark': result['imageUrl'],
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
        
        if i < len(prompts):
            log(f"⏳ 다음 이미지를 위해 1초 대기...")
            time.sleep(1)
    
    log(f"\n{'='*70}")
    log(f"✅ [Replicate FLUX] 생성 완료")
    log(f"   성공: {len(results)}/4")
    log(f"   실패: {len(errors)}/4")
    log(f"{'='*70}\n")
    
    return {
        'success': len(results) > 0,
        'results': results,
        'errors': errors
    }

def generate_4_thumbnails_openai(prompts):
    """OpenAI DALL-E 3로 4개 썸네일 생성"""
    log(f"\n{'='*70}")
    log(f"🚀 [OpenAI DALL-E 3] 4개 썸네일 생성 시작")
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
                    'imageUrlNoWatermark': result['imageUrl'],
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
        
        if i < len(prompts):
            log(f"⏳ 다음 이미지를 위해 2초 대기...")
            time.sleep(2)
    
    log(f"\n{'='*70}")
    log(f"✅ [OpenAI DALL-E 3] 생성 완료")
    log(f"   성공: {len(results)}/4")
    log(f"   실패: {len(errors)}/4")
    log(f"{'='*70}\n")
    
    return {
        'success': len(results) > 0,
        'results': results,
        'errors': errors
    }

def save_genspark_request(request_data):
    """GenSpark 요청을 JSON 파일로 저장 (AI 어시스턴트가 읽음)"""
    request_id = request_data.get('requestId')
    output_file = f'/tmp/thumbnail_request_{request_id}.json'
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            'requestId': request_id,
            'title': request_data.get('title'),
            'cleanTitle': request_data.get('cleanTitle'),
            'prompts': request_data.get('prompts'),
            'timestamp': datetime.now().isoformat()
        }, f, ensure_ascii=False, indent=2)
    
    log(f"💾 GenSpark 요청 저장: {output_file}")
    log(f"   AI 어시스턴트가 이 파일을 읽고 처리할 수 있습니다")

def send_completion_webhook(request_id, images):
    """완료된 썸네일을 웹훅으로 전송"""
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

def process_thumbnail_request(request_data):
    """썸네일 요청 처리 (모델에 따라 분기)"""
    request_id = request_data.get('requestId')
    title = request_data.get('title')
    clean_title = request_data.get('cleanTitle', title)
    prompts = request_data.get('prompts', [])
    ai_model = request_data.get('aiModel', 'genspark')
    
    log(f"\n{'='*70}")
    log(f"🎨 새 썸네일 요청 감지!")
    log(f"{'='*70}")
    log(f"📌 Request ID: {request_id}")
    log(f"📝 제목: {title}")
    log(f"✂️  정리된 제목: {clean_title}")
    log(f"🎯 생성할 버전: {len(prompts)}개")
    log(f"🤖 AI 모델: {ai_model}")
    log(f"{'='*70}\n")
    
    if len(prompts) != 4:
        log(f"❌ 프롬프트가 4개가 아닙니다: {len(prompts)}개")
        return False
    
    # 모델에 따라 처리 방식 분기
    if ai_model == 'replicate':
        if not REPLICATE_AVAILABLE:
            log(f"❌ Replicate 라이브러리가 설치되지 않았습니다")
            return False
        if not REPLICATE_API_TOKEN:
            log(f"❌ REPLICATE_API_TOKEN이 설정되지 않았습니다")
            return False
        
        # Replicate FLUX로 자동 생성
        generation_result = generate_4_thumbnails_replicate(prompts)
        
        if not generation_result['success'] or len(generation_result['results']) == 0:
            log(f"❌ 이미지 생성 실패")
            return False
        
        # 웹훅 전송
        success = send_completion_webhook(request_id, generation_result['results'])
        
        if success:
            log(f"\n🎉 [Replicate] 썸네일 생성 및 전송 완료!")
            log(f"   생성된 이미지: {len(generation_result['results'])}개")
        
        return success
    
    elif ai_model == 'openai':
        if not OPENAI_AVAILABLE or not openai_client:
            log(f"❌ OpenAI 라이브러리가 설치되지 않았거나 API 키가 없습니다")
            return False
        
        # OpenAI DALL-E 3로 자동 생성
        generation_result = generate_4_thumbnails_openai(prompts)
        
        if not generation_result['success'] or len(generation_result['results']) == 0:
            log(f"❌ 이미지 생성 실패")
            return False
        
        # 웹훅 전송
        success = send_completion_webhook(request_id, generation_result['results'])
        
        if success:
            log(f"\n🎉 [OpenAI] 썸네일 생성 및 전송 완료!")
            log(f"   생성된 이미지: {len(generation_result['results'])}개")
        
        return success
        
    elif ai_model == 'genspark':
        # GenSpark - JSON 파일로 저장만 (AI 어시스턴트가 처리)
        save_genspark_request(request_data)
        log(f"⚠️  GenSpark 모드: AI 어시스턴트가 수동으로 처리해야 합니다")
        return True
    
    else:
        log(f"❌ 알 수 없는 AI 모델: {ai_model}")
        return False

def main():
    """메인 루프"""
    log("="*70)
    log("🚀 통합 썸네일 자동 생성 시스템")
    log("="*70)
    log(f"서버 URL: {SERVER_URL}")
    log(f"체크 주기: 5초")
    log(f"\n지원 모델:")
    log(f"  1. GenSpark nano-banana-2 (무료, 수동)")
    if REPLICATE_AVAILABLE and REPLICATE_API_TOKEN:
        log(f"  2. Replicate FLUX Schnell (완전 자동) ✅")
    else:
        log(f"  2. Replicate FLUX Schnell (완전 자동) ❌ (설정 필요)")
    if OPENAI_AVAILABLE and openai_client:
        log(f"  3. OpenAI DALL-E 3 (완전 자동) ✅")
    else:
        log(f"  3. OpenAI DALL-E 3 (완전 자동) ❌ (설정 필요)")
    
    log(f"\n💡 작동 방식:")
    log(f"1. 5초마다 대기 중인 썸네일 요청 확인")
    log(f"2. aiModel 값에 따라 자동 처리:")
    log(f"   - 'replicate' → FLUX Schnell 자동 생성")
    log(f"   - 'openai' → DALL-E 3 자동 생성")
    log(f"   - 'genspark' → JSON 파일 저장 (수동 처리)")
    log(f"3. 웹사이트에 실시간 표시")
    log("="*70 + "\n")
    
    processed_requests = set()
    
    try:
        while True:
            pending = fetch_pending_thumbnails()
            
            if pending:
                for request in pending:
                    request_id = request.get('requestId')
                    
                    if request_id in processed_requests:
                        continue
                    
                    log(f"\n🔔 새 요청 발견: {request_id}")
                    success = process_thumbnail_request(request)
                    
                    if success:
                        processed_requests.add(request_id)
                        log(f"✅ 요청 처리 완료\n")
                    else:
                        log(f"❌ 요청 처리 실패\n")
                    
                    log(f"{'-'*70}\n")
            
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
