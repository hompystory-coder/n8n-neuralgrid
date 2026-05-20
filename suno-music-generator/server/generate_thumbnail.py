#!/usr/bin/env python3
"""
🎨 GenSpark Image Generation for Thumbnail
nano-banana-2 모델을 사용하여 YouTube 썸네일 생성
"""

import sys
import json
import requests
import os

def generate_thumbnail(prompt, aspect_ratio="16:9", model="nano-banana-2"):
    """
    GenSpark API를 사용하여 썸네일 이미지 생성
    """
    # API 키 로드
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        return {
            'success': False,
            'error': 'API 키가 설정되지 않았습니다'
        }
    
    # GenSpark Image Generation API 엔드포인트
    # 참고: 실제 엔드포인트는 GenSpark 문서 확인 필요
    url = 'https://www.genspark.ai/api/image/generate'
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}'
    }
    
    payload = {
        'prompt': prompt,
        'aspect_ratio': aspect_ratio,
        'model': model,
        'image_size': 'auto'
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=60)
        
        if response.status_code == 200:
            data = response.json()
            return {
                'success': True,
                'imageUrl': data.get('image_url') or data.get('url'),
                'data': data
            }
        else:
            return {
                'success': False,
                'error': f'API returned status {response.status_code}',
                'details': response.text
            }
    
    except requests.exceptions.Timeout:
        return {
            'success': False,
            'error': 'Request timeout (60s exceeded)'
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({
            'success': False,
            'error': 'Usage: python3 generate_thumbnail.py <prompt> [aspect_ratio] [model]'
        }))
        sys.exit(1)
    
    prompt = sys.argv[1]
    aspect_ratio = sys.argv[2] if len(sys.argv) > 2 else "16:9"
    model = sys.argv[3] if len(sys.argv) > 3 else "nano-banana-2"
    
    result = generate_thumbnail(prompt, aspect_ratio, model)
    print(json.dumps(result, ensure_ascii=False))
