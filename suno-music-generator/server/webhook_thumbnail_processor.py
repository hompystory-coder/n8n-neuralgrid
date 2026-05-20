#!/usr/bin/env python3
"""
썸네일 웹훅 자동 처리 스크립트
AI 어시스턴트가 대기 중인 썸네일 요청을 자동으로 처리합니다
"""

import requests
import time
import json
import sys
import os

# 서버 URL
SERVER_URL = os.getenv('SERVER_URL', 'http://localhost:5000')
WEBHOOK_BASE = f'{SERVER_URL}/api/webhook'

def fetch_pending_thumbnails():
    """대기 중인 썸네일 요청 가져오기"""
    try:
        response = requests.get(f'{WEBHOOK_BASE}/thumbnail-queue', timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if data.get('success') and data.get('count', 0) > 0:
            print(f"✅ {data['count']}개의 대기 중인 썸네일 발견")
            return data.get('requests', [])
        else:
            print("📭 대기 중인 썸네일 없음")
            return []
            
    except Exception as e:
        print(f"❌ 큐 조회 실패: {e}")
        return []

def process_thumbnail_request(request_data):
    """썸네일 요청 처리"""
    request_id = request_data.get('requestId')
    title = request_data.get('title')
    style = request_data.get('style')
    prompt = request_data.get('prompt')
    
    print(f"\n🎨 썸네일 처리 시작:")
    print(f"  - Request ID: {request_id}")
    print(f"  - Title: {title}")
    print(f"  - Style: {style}")
    print(f"\n📝 프롬프트:")
    print(f"{prompt}")
    print(f"\n" + "="*60)
    print(f"⚠️  이 스크립트는 자동으로 이미지를 생성할 수 없습니다.")
    print(f"    AI 어시스턴트에게 다음과 같이 요청해주세요:")
    print(f"\n💡 요청 방법:")
    print(f'    "위 프롬프트로 nano-banana-2 모델, 16:9 비율로 이미지 생성해줘"')
    print(f"\n" + "="*60)
    
    # 사용자 입력 대기
    print(f"\n⏳ AI 어시스턴트가 이미지를 생성한 후,")
    print(f"   생성된 이미지 URL을 입력하세요:")
    print(f"   (종료하려면 'skip' 입력)")
    
    image_url = input("\n이미지 URL: ").strip()
    
    if image_url.lower() == 'skip':
        print("⏭️  건너뜀")
        return False
    
    if not image_url.startswith('http'):
        print("❌ 유효하지 않은 URL")
        return False
    
    # 워터마크 없는 URL 입력 (선택사항)
    print(f"\n워터마크 없는 URL (선택, 없으면 Enter):")
    image_url_no_watermark = input("워터마크 없는 URL: ").strip()
    
    # 완료 웹훅 전송
    try:
        completion_data = {
            'requestId': request_id,
            'imageUrl': image_url,
            'imageUrlNoWatermark': image_url_no_watermark if image_url_no_watermark else image_url,
            'width': 1365,
            'height': 768
        }
        
        response = requests.post(
            f'{WEBHOOK_BASE}/thumbnail-complete',
            json=completion_data,
            timeout=10
        )
        response.raise_for_status()
        
        print(f"\n✅ 썸네일 완료 알림 전송 성공!")
        print(f"   웹페이지에서 결과를 확인하세요.")
        return True
        
    except Exception as e:
        print(f"\n❌ 완료 알림 전송 실패: {e}")
        return False

def main():
    """메인 루프"""
    print("="*60)
    print("🎨 썸네일 웹훅 자동 처리기")
    print("="*60)
    print(f"서버 URL: {SERVER_URL}")
    print(f"\n💡 사용 방법:")
    print(f"1. 웹사이트에서 '썸네일 생성' 버튼 클릭")
    print(f"2. 이 스크립트가 요청을 감지하고 프롬프트 표시")
    print(f"3. AI 어시스턴트에게 이미지 생성 요청")
    print(f"4. 생성된 URL을 이 스크립트에 입력")
    print(f"5. 웹사이트에 자동으로 결과 표시")
    print("="*60)
    
    print(f"\n⏳ 대기 중인 썸네일 요청을 확인합니다...\n")
    
    try:
        while True:
            pending = fetch_pending_thumbnails()
            
            if pending:
                for request in pending:
                    process_thumbnail_request(request)
                    print(f"\n" + "-"*60 + "\n")
            
            # 10초마다 큐 확인
            print(f"💤 10초 후 다시 확인합니다... (Ctrl+C로 종료)")
            time.sleep(10)
            
    except KeyboardInterrupt:
        print(f"\n\n👋 종료합니다.")
        sys.exit(0)

if __name__ == '__main__':
    main()
