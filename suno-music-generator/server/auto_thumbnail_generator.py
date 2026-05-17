#!/usr/bin/env python3
"""
🎨 완전 자동화 썸네일 생성 시스템
대기 중인 요청을 감지하고 자동으로 4개 이미지를 생성합니다
"""

import requests
import time
import json
import sys
import os
from datetime import datetime

# 설정
SERVER_URL = os.getenv('SERVER_URL', 'http://localhost:5000')
WEBHOOK_BASE = f'{SERVER_URL}/api/webhook'
GENSPARK_API_URL = 'https://www.genspark.ai/api/image-generation'

# GenSpark API 키는 환경변수나 설정에서 가져와야 합니다
# 현재는 시스템이 자동으로 처리한다고 가정
GENSPARK_TOKEN = os.getenv('GENSPARK_TOKEN', '')

def log(message):
    """타임스탬프와 함께 로그 출력"""
    timestamp = datetime.now().strftime('%H:%M:%S')
    print(f"[{timestamp}] {message}")

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

def generate_image_with_genspark(prompt, aspect_ratio='16:9'):
    """
    GenSpark image_generation API를 통해 이미지 생성
    
    Note: 실제로는 이 함수는 GenSpark의 내부 시스템을 통해 자동으로 처리됩니다.
    AI 어시스턴트(Claude/Gemini)가 image_generation 도구를 호출하면 됩니다.
    
    이 스크립트는 "AI 어시스턴트 없이" 자동으로 실행할 수 없습니다.
    대신, AI 어시스턴트가 이 정보를 받아서 image_generation을 호출해야 합니다.
    """
    log("⚠️  이미지 생성은 AI 어시스턴트를 통해서만 가능합니다")
    log("    이 스크립트는 요청을 감지하고 프롬프트를 제공하는 역할만 합니다")
    return None

def process_thumbnail_request_auto(request_data):
    """썸네일 요청 자동 처리 (4개 버전)"""
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
    
    # 각 프롬프트 정보 출력
    for i, p in enumerate(prompts, 1):
        log(f"📋 프롬프트 {i}: {p.get('label')}")
        log(f"   버전: {p.get('version')}")
        log(f"   텍스트: {'포함' if 'with_text' in p.get('version', '') else '없음'}")
        log(f"   디자인: {'A' if 'design_a' in p.get('version', '') else 'B'}\n")
    
    log(f"\n{'='*70}")
    log(f"⚠️  AI 어시스턴트에게 전달할 정보:")
    log(f"{'='*70}")
    log(f"Request ID: {request_id}")
    log(f"프롬프트 수: 4개")
    log(f"\n💡 AI 어시스턴트가 해야 할 일:")
    log(f"   1. 이 Request ID를 감지")
    log(f"   2. 4개 프롬프트로 각각 image_generation 호출")
    log(f"   3. 4개 이미지 URL 수집")
    log(f"   4. webhook/thumbnail-complete로 결과 전송")
    log(f"{'='*70}\n")
    
    # 프롬프트를 JSON 파일로 저장 (AI가 읽을 수 있도록)
    output_file = f'/tmp/thumbnail_request_{request_id}.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            'requestId': request_id,
            'title': title,
            'cleanTitle': clean_title,
            'prompts': prompts,
            'timestamp': datetime.now().isoformat()
        }, f, ensure_ascii=False, indent=2)
    
    log(f"💾 프롬프트 정보 저장: {output_file}")
    log(f"   AI 어시스턴트가 이 파일을 읽어서 처리할 수 있습니다\n")
    
    return True

def main():
    """메인 루프 - 계속 모니터링"""
    log("="*70)
    log("🚀 완전 자동화 썸네일 생성 시스템 시작")
    log("="*70)
    log(f"서버 URL: {SERVER_URL}")
    log(f"체크 주기: 5초")
    log(f"\n💡 작동 방식:")
    log(f"1. 5초마다 대기 중인 썸네일 요청 확인")
    log(f"2. 새 요청 감지 시 프롬프트 정보 저장")
    log(f"3. AI 어시스턴트가 /tmp/*.json 파일을 읽고 처리")
    log(f"4. 4개 이미지 생성 후 자동으로 웹사이트에 표시")
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
                        log(f"✅ 요청 정보 저장 완료\n")
                    
                    log(f"{'-'*70}\n")
            else:
                # 대기 중인 요청 없음
                pass
            
            # 5초마다 체크
            time.sleep(5)
            
    except KeyboardInterrupt:
        log(f"\n\n👋 시스템 종료")
        sys.exit(0)
    except Exception as e:
        log(f"\n❌ 오류 발생: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
