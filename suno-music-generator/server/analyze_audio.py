#!/usr/bin/env python3
"""
🎵 정밀 음악 분석 스크립트
librosa를 사용한 실제 오디오 파일 분석
"""
import sys
import json
import librosa
import numpy as np
from collections import Counter

def analyze_audio(audio_path):
    """
    오디오 파일을 분석하여 BPM, 음색, 악기, 에너지 등 추출
    """
    try:
        # 오디오 로드 (최대 180초)
        y, sr = librosa.load(audio_path, duration=180, sr=22050)
        
        # 1️⃣ BPM 분석 (템포)
        tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
        tempo = float(tempo)
        
        # 2️⃣ 스펙트럼 분석 (악기 추론)
        # 스펙트럴 센트로이드 (밝기)
        spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
        avg_brightness = float(np.mean(spectral_centroids))
        
        # 스펙트럴 롤오프 (고주파 비율)
        spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
        avg_rolloff = float(np.mean(spectral_rolloff))
        
        # 제로 크로싱 레이트 (노이즈/타악기 감지)
        zcr = librosa.feature.zero_crossing_rate(y)[0]
        avg_zcr = float(np.mean(zcr))
        
        # 3️⃣ 에너지 분석
        # RMS 에너지
        rms = librosa.feature.rms(y=y)[0]
        avg_energy = float(np.mean(rms))
        energy_std = float(np.std(rms))
        
        # 다이나믹 레인지
        dynamic_range = float(np.max(rms) - np.min(rms))
        
        # 4️⃣ 화성 분석 (음색 특성)
        # 크로마 특징 (화음/멜로디)
        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        avg_chroma = float(np.mean(chroma))
        
        # MFCC (음색 지문)
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        mfcc_mean = [float(x) for x in np.mean(mfcc, axis=1)]
        
        # 5️⃣ 리듬 분석
        # 비트 강도
        onset_strength = librosa.onset.onset_strength(y=y, sr=sr)
        avg_onset = float(np.mean(onset_strength))
        
        # 6️⃣ 음역대 분석 (보컬 추론)
        # 주파수 대역별 에너지
        fft = np.fft.fft(y)
        freqs = np.fft.fftfreq(len(fft), 1/sr)
        magnitude = np.abs(fft)
        
        # 보컬 주파수 대역 (200Hz~5000Hz)
        vocal_mask = (freqs >= 200) & (freqs <= 5000)
        vocal_energy = float(np.sum(magnitude[vocal_mask]))
        
        # 베이스 주파수 대역 (20Hz~200Hz)
        bass_mask = (freqs >= 20) & (freqs <= 200)
        bass_energy = float(np.sum(magnitude[bass_mask]))
        
        # 고음 대역 (5000Hz~)
        treble_mask = (freqs >= 5000)
        treble_energy = float(np.sum(magnitude[treble_mask]))
        
        # 7️⃣ 악기 추론
        instruments = infer_instruments(
            avg_brightness, avg_rolloff, avg_zcr,
            bass_energy, vocal_energy, treble_energy,
            avg_chroma, tempo
        )
        
        # 8️⃣ 장르/무드 추론
        genre_hints = infer_genre(tempo, avg_energy, avg_brightness, avg_zcr)
        
        # 9️⃣ 에너지 레벨 (1-10)
        energy_level = calculate_energy_level(avg_energy, energy_std, dynamic_range, tempo)
        
        # 🔟 보컬 스타일 추론
        vocal_style = infer_vocal_style(vocal_energy, avg_brightness, mfcc_mean)
        
        return {
            'success': True,
            'tempo': round(tempo),
            'tempo_confidence': 'high',
            'instruments': instruments,
            'genre_hints': genre_hints,
            'energy_level': energy_level,
            'vocal_style': vocal_style,
            'audio_features': {
                'brightness': round(avg_brightness, 2),
                'rolloff': round(avg_rolloff, 2),
                'zcr': round(avg_zcr, 4),
                'rms_energy': round(avg_energy, 4),
                'dynamic_range': round(dynamic_range, 4),
                'chroma': round(avg_chroma, 4),
                'onset_strength': round(avg_onset, 2),
                'bass_energy': round(bass_energy / 1e9, 2),  # 정규화
                'vocal_energy': round(vocal_energy / 1e9, 2),
                'treble_energy': round(treble_energy / 1e9, 2)
            }
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


def infer_instruments(brightness, rolloff, zcr, bass, vocal, treble, chroma, tempo):
    """
    오디오 특성으로 악기 추론
    """
    instruments = []
    
    # 베이스 악기
    if bass > 1.0:  # 베이스가 강함
        if tempo > 120:
            instruments.append('808')
        else:
            instruments.append('bass')
    
    # 드럼/타악기
    if zcr > 0.05:  # 높은 제로 크로싱 = 타악기
        if tempo > 130:
            instruments.append('trap-drums')
        elif tempo < 100:
            instruments.append('lo-fi-drums')
        else:
            instruments.append('drums')
    
    # 하이햇
    if treble > 0.5 and zcr > 0.04:
        instruments.append('hi-hat')
    
    # 피아노/건반
    if chroma > 0.3 and brightness < 2000:
        if tempo < 100:
            instruments.append('rhodes')
        else:
            instruments.append('piano')
    
    # 신스
    if brightness > 2500:
        instruments.append('synth')
    
    # 기타
    if 1500 < brightness < 2500 and chroma > 0.25:
        if tempo < 120:
            instruments.append('jazz-guitar')
        else:
            instruments.append('electric-guitar')
    
    # 패드/앰비언트
    if rolloff > 3000 and chroma > 0.3:
        instruments.append('pad')
    
    # Lo-fi 효과
    if zcr < 0.03 and brightness < 1500:
        instruments.append('vinyl-crackle')
    
    return instruments[:6]  # 최대 6개


def infer_genre(tempo, energy, brightness, zcr):
    """
    BPM과 음색 특성으로 장르 추론
    """
    hints = []
    
    if tempo < 100:
        if brightness < 1500:
            hints.append('lo-fi')
        if energy < 0.05:
            hints.append('ambient')
        hints.append('chill')
    elif 100 <= tempo < 120:
        hints.append('pop')
        if brightness > 2000:
            hints.append('indie')
    elif 120 <= tempo < 140:
        hints.append('house')
        hints.append('dance')
    else:  # tempo >= 140
        hints.append('trap')
        hints.append('edm')
    
    # 에너지 기반
    if energy > 0.1:
        hints.append('energetic')
    else:
        hints.append('calm')
    
    return hints


def calculate_energy_level(avg_energy, energy_std, dynamic_range, tempo):
    """
    에너지 레벨 계산 (1-10)
    """
    # 기본 점수 (RMS 에너지)
    score = avg_energy * 100
    
    # 다이나믹 레인지 고려
    score += energy_std * 20
    
    # BPM 고려
    if tempo > 140:
        score += 2
    elif tempo < 80:
        score -= 1
    
    # 1-10 범위로 정규화
    energy_level = min(10, max(1, int(score * 100)))
    
    return energy_level


def infer_vocal_style(vocal_energy, brightness, mfcc):
    """
    보컬 스타일 추론
    """
    if vocal_energy < 0.5:
        return {
            'type': 'instrumental',
            'confidence': 'high'
        }
    
    style = 'standard'
    tone = 'neutral'
    
    # 밝기 기반 톤 추론
    if brightness > 2500:
        tone = 'bright'
        style = 'clear'
    elif brightness < 1500:
        tone = 'warm'
        style = 'soft'
    
    # MFCC 기반 스타일
    if mfcc[1] > 50:  # 높은 MFCC 2차 계수 = 거친 음색
        tone = 'raspy'
        style = 'powerful'
    elif mfcc[1] < -50:
        tone = 'breathy'
        style = 'delicate'
    
    return {
        'type': 'vocal',
        'style': style,
        'tone': tone,
        'confidence': 'medium'
    }


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'success': False, 'error': 'No audio file provided'}))
        sys.exit(1)
    
    audio_path = sys.argv[1]
    result = analyze_audio(audio_path)
    print(json.dumps(result, ensure_ascii=False))
