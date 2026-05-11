#!/usr/bin/env python3
"""
🎯 3-모드 썸네일 자동화 시스템
명확한 자동화 수준 분리

모드 1: FULLY_AUTOMATIC (완전 자동) - Replicate/외부 API
모드 2: SEMI_AUTOMATIC (반자동) - GenSpark + AI 어시스턴트
모드 3: MANUAL (수동) - 사용자가 직접 명령
"""

import requests
import time
import json
import sys
import os
from datetime import datetime
from pathlib import Path
from enum import Enum

class AutomationMode(Enum):
    """자동화 모드"""
    FULLY_AUTOMATIC = "완전 자동"  # 100% 자동, AI 개입 불필요
    SEMI_AUTOMATIC = "반자동"      # 50% 자동, AI 어시스턴트 필요
    MANUAL = "수동"                # 0% 자동, 사용자 명령 필요

# Replicate 지원 확인
try:
    import replicate
    REPLICATE_AVAILABLE = True
except ImportError:
    REPLICATE_AVAILABLE = False

# 환경 변수 로드
def load_env_file():
    env_path = Path(__file__).parent.parent / '.env'
    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key] = value

load_env_file()

# 설정
SERVER_URL = os.getenv('SERVER_URL', 'http://localhost:5000')
WEBHOOK_BASE = f'{SERVER_URL}/api/webhook'
REPLICATE_API_TOKEN = os.getenv('REPLICATE_API_TOKEN', '')

# Replicate 설정
if REPLICATE_AVAILABLE and REPLICATE_API_TOKEN:
    os.environ['REPLICATE_API_TOKEN'] = REPLICATE_API_TOKEN

def log(message, mode=None):
    """모드별 색상 로그"""
    timestamp = datetime.now().strftime('%H:%M:%S')
    
    mode_emoji = {
        AutomationMode.FULLY_AUTOMATIC: "🟢",
        AutomationMode.SEMI_AUTOMATIC: "🟡",
        AutomationMode.MANUAL: "🔴"
    }
    
    prefix = f"[{timestamp}]"
    if mode:
        prefix += f" {mode_emoji.get(mode, '')} [{mode.value}]"
    
    print(f"{prefix} {message}")
    sys.stdout.flush()

def detect_automation_mode(ai_model):
    """AI 모델에 따라 자동화 모드 판단"""
    if ai_model == 'replicate':
        if REPLICATE_AVAILABLE and REPLICATE_API_TOKEN:
            return AutomationMode.FULLY_AUTOMATIC
        else:
            return AutomationMode.MANUAL  # 설정 필요
    elif ai_model == 'genspark':
        return AutomationMode.SEMI_AUTOMATIC
    else:
        return AutomationMode.MANUAL

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

def add_text_to_image(image_url, text, version, template):
    """
    이미지에 텍스트 추가 (Node.js 서비스 호출)
    """
    try:
        response = requests.post(
            f'{SERVER_URL}/api/text-overlay/add',
            json={
                'imageUrl': image_url,
                'text': text,
                'version': version,
                'template': template
            },
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                return data.get('image')  # Base64 data URL
        
        return None
    except Exception as e:
        log(f"⚠️ 텍스트 추가 실패: {e}")
        return None

def generate_with_replicate(prompts, title='', template=None):
    """
    🟢 모드 1: 완전 자동 (FULLY_AUTOMATIC)
    Replicate FLUX Schnell로 완전 자동 생성 + 텍스트 자동 추가
    """
    log(f"4개 썸네일 자동 생성 시작...", AutomationMode.FULLY_AUTOMATIC)
    
    results = []
    errors = []
    
    for i, prompt_data in enumerate(prompts, 1):
        log(f"[{i}/4] {prompt_data['label']} 생성 중...", AutomationMode.FULLY_AUTOMATIC)
        
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
            
            log(f"[{i}/4] ✅ 이미지 생성 완료", AutomationMode.FULLY_AUTOMATIC)
            
            # with_text 버전이면 텍스트 추가
            version = prompt_data['version']
            if 'with_text' in version and title:
                log(f"[{i}/4] 🎨 텍스트 추가 중: '{title}'", AutomationMode.FULLY_AUTOMATIC)
                text_image = add_text_to_image(image_url, title, version, template)
                
                if text_image:
                    log(f"[{i}/4] ✅ 텍스트 추가 완료", AutomationMode.FULLY_AUTOMATIC)
                    # Base64 이미지를 imageUrlNoWatermark에 저장
                    results.append({
                        'version': version,
                        'label': prompt_data['label'],
                        'imageUrl': image_url,  # 원본 (텍스트 없음)
                        'imageUrlNoWatermark': text_image,  # 텍스트 추가됨 (Base64)
                        'width': 1792,
                        'height': 1024,
                        'hasText': True
                    })
                else:
                    log(f"[{i}/4] ⚠️ 텍스트 추가 실패, 원본 사용", AutomationMode.FULLY_AUTOMATIC)
                    results.append({
                        'version': version,
                        'label': prompt_data['label'],
                        'imageUrl': image_url,
                        'imageUrlNoWatermark': image_url,
                        'width': 1792,
                        'height': 1024,
                        'hasText': False
                    })
            else:
                # 텍스트 없는 버전
                results.append({
                    'version': version,
                    'label': prompt_data['label'],
                    'imageUrl': image_url,
                    'imageUrlNoWatermark': image_url,
                    'width': 1792,
                    'height': 1024,
                    'hasText': False
                })
            
            log(f"[{i}/4] ✅ 완료", AutomationMode.FULLY_AUTOMATIC)
            
        except Exception as e:
            errors.append({
                'version': prompt_data['version'],
                'label': prompt_data['label'],
                'error': str(e)
            })
            log(f"[{i}/4] ❌ 실패: {e}", AutomationMode.FULLY_AUTOMATIC)
        
        if i < len(prompts):
            log(f"⏳ Rate limit 방지: 10초 대기...", AutomationMode.FULLY_AUTOMATIC)
            time.sleep(10)
    
    return {
        'success': len(results) > 0,
        'results': results,
        'errors': errors
    }

def save_genspark_request(request_data):
    """
    🟡 모드 2: 반자동 (SEMI_AUTOMATIC)
    GenSpark 요청을 JSON으로 저장 (AI 어시스턴트가 처리)
    """
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
    
    log(f"요청 저장: {output_file}", AutomationMode.SEMI_AUTOMATIC)
    log(f"⚠️  AI 어시스턴트가 수동으로 처리 필요!", AutomationMode.SEMI_AUTOMATIC)
    log(f"   파일: {output_file}", AutomationMode.SEMI_AUTOMATIC)

def send_completion_webhook(request_id, images):
    """완료된 썸네일을 웹훅으로 전송"""
    try:
        log(f"웹훅 전송: {len(images)}개 이미지")
        
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
        
        log(f"✅ 웹훅 전송 완료")
        return True
    except Exception as e:
        log(f"❌ 웹훅 전송 실패: {e}")
        return False

def process_request_by_mode(request_data):
    """자동화 모드에 따라 요청 처리"""
    request_id = request_data.get('requestId')
    title = request_data.get('title')
    clean_title = request_data.get('cleanTitle', title)
    prompts = request_data.get('prompts', [])
    ai_model = request_data.get('aiModel', 'genspark')
    
    # 자동화 모드 감지
    mode = detect_automation_mode(ai_model)
    
    log(f"\n{'='*70}")
    log(f"🎨 새 썸네일 요청 감지!", mode)
    log(f"{'='*70}")
    log(f"Request ID: {request_id}", mode)
    log(f"제목: {title}", mode)
    log(f"AI 모델: {ai_model}", mode)
    log(f"자동화 모드: {mode.value}", mode)
    log(f"{'='*70}\n", mode)
    
    if len(prompts) != 4:
        log(f"❌ 프롬프트가 4개가 아닙니다: {len(prompts)}개", mode)
        return False
    
    # 모드별 처리
    if mode == AutomationMode.FULLY_AUTOMATIC:
        log("🟢 완전 자동 모드: 즉시 생성 시작", mode)
        generation_result = generate_with_replicate(
            prompts, 
            title=clean_title,
            template=request_data.get('template')
        )
        
        if not generation_result['success'] or len(generation_result['results']) == 0:
            log("❌ 이미지 생성 실패", mode)
            return False
        
        success = send_completion_webhook(request_id, generation_result['results'])
        
        if success:
            log(f"🎉 완료! {len(generation_result['results'])}개 이미지 생성 및 전송", mode)
        
        return success
        
    elif mode == AutomationMode.SEMI_AUTOMATIC:
        log("🟡 반자동 모드: AI 어시스턴트 대기", mode)
        save_genspark_request(request_data)
        log("💡 다음 단계: AI 어시스턴트가 파일을 읽고 image_generation 호출", mode)
        return True
        
    elif mode == AutomationMode.MANUAL:
        log("🔴 수동 모드: 설정 필요", mode)
        
        if ai_model == 'replicate':
            log("❌ Replicate API 토큰이 설정되지 않았습니다", mode)
            log("설정 방법:", mode)
            log("1. https://replicate.com 계정 생성", mode)
            log("2. API 토큰 발급", mode)
            log("3. .env에 REPLICATE_API_TOKEN=r8_xxx 추가", mode)
        else:
            log(f"❌ 알 수 없는 AI 모델: {ai_model}", mode)
        
        return False

def main():
    """메인 루프"""
    print("\n" + "="*70)
    print("🎯 3-모드 썸네일 자동화 시스템")
    print("="*70)
    print(f"서버 URL: {SERVER_URL}")
    print(f"체크 주기: 5초")
    
    print(f"\n📊 지원 모드:")
    print(f"\n🟢 모드 1: 완전 자동 (FULLY_AUTOMATIC)")
    print(f"   - 사용자 클릭 → 자동 생성 → 자동 표시")
    print(f"   - AI 개입 불필요")
    print(f"   - Replicate FLUX: ", end='')
    if REPLICATE_AVAILABLE and REPLICATE_API_TOKEN:
        print("✅ 활성화")
    else:
        print("❌ 비활성화 (설정 필요)")
    
    print(f"\n🟡 모드 2: 반자동 (SEMI_AUTOMATIC)")
    print(f"   - 사용자 클릭 → AI 어시스턴트 개입 → 자동 표시")
    print(f"   - GenSpark: ✅ 항상 사용 가능")
    
    print(f"\n🔴 모드 3: 수동 (MANUAL)")
    print(f"   - 설정 오류 또는 미지원 AI 모델")
    
    print("="*70 + "\n")
    
    processed_requests = set()
    
    try:
        while True:
            pending = fetch_pending_thumbnails()
            
            if pending:
                for request in pending:
                    request_id = request.get('requestId')
                    
                    if request_id in processed_requests:
                        continue
                    
                    log(f"\n🔔 새 요청: {request_id}")
                    success = process_request_by_mode(request)
                    
                    if success:
                        processed_requests.add(request_id)
                        log(f"✅ 처리 완료\n")
                    else:
                        log(f"❌ 처리 실패\n")
                    
                    log(f"{'-'*70}\n")
            
            time.sleep(5)
            
    except KeyboardInterrupt:
        log(f"\n\n👋 시스템 종료")
        sys.exit(0)
    except Exception as e:
        log(f"\n❌ 오류: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
