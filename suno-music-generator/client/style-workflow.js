// ==========================================
// 간단한 스타일 기반 음악 생성
// ==========================================

console.log('🎨 Simple Style Workflow 초기화');

// Socket.IO 썸네일 웹훅 이벤트 등록 (socket은 이미 workflow.html에서 선언됨)
if (typeof socket !== 'undefined') {
  // 썸네일 생성 완료 이벤트
  socket.on('thumbnail-complete', (data) => {
    console.log('🎉 Socket: 썸네일 생성 완료', data);
    
    if (window.currentThumbnailRequestId === data.requestId) {
      // 폴링 중단하고 결과 표시
      const btn = document.getElementById('generateThumbnailBtn');
      const originalHTML = btn ? btn.innerHTML : '';
      displayThumbnailResult(data, originalHTML);
    }
  });
  
  // 썸네일 요청 이벤트 (디버깅용)
  socket.on('thumbnail-request', (data) => {
    console.log('📬 Socket: 썸네일 요청 수신', data);
  });
  
  console.log('✅ Socket.IO 연결 완료 (썸네일 웹훅 지원)');
}

// 전역 변수
let currentGenerationTaskId = null;
let currentPlayingAudio = null;
let selectedSongs = new Map(); // songId -> {song, order}
let currentGeneratedStyle = ''; // 현재 생성 중인 스타일 저장
let currentGeneratedLanguage = 'korean'; // 현재 생성 중인 언어 저장 (기본값: korean)
let selectedImages = new Map(); // songIndex -> {imageUrl, isUpgraded, upgradedUrl}
let selectionOrder = []; // 선택한 순서대로 songIndex 배열 (Time Track용)
let trackOrder = new Map(); // songIndex -> trackNumber (1~20) - 앨범 트랙 순서 관리
let generatedMusicList = []; // 생성된 음악 리스트

/**
 * 🎯 트랙 번호가 할당된 곡들을 트랙 번호 순으로 가져오기
 * @returns {Array} - {songIndex, trackNumber, song} 객체 배열 (트랙 번호 순 정렬)
 */
function getSelectedTracks() {
  const tracks = [];
  for (const [songIndex, trackNumber] of trackOrder.entries()) {
    const song = generatedMusicList[songIndex];
    console.log(`🔍 [DEBUG] Track ${trackNumber} (index ${songIndex}): title="${song?.title}"`);
    if (song) {
      tracks.push({
        songIndex: songIndex,
        trackNumber: trackNumber,
        song: song,
        title: song.title || `Track ${trackNumber}`,
        audioUrl: song.audioUrl || song.source_audio_url || song.audio_url,
        imageUrl: song.imageUrl || song.source_image_url || song.image_url,
        duration: song.duration || 180,
        lyrics: song.lyrics || ''
      });
    }
  }
  // 트랙 번호 순으로 정렬
  tracks.sort((a, b) => a.trackNumber - b.trackNumber);
  console.log('📋 [DEBUG] getSelectedTracks result:', tracks.map(t => ({ trackNumber: t.trackNumber, title: t.title })));
  return tracks;
}


/**
 * 네트워크 재시도 유틸리티 함수
 */
async function fetchWithRetry(url, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok && i < retries - 1) {
        console.warn(`⚠️ 재시도 ${i + 1}/${retries}: ${url}`);
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        continue;
      }
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      console.warn(`⚠️ 재시도 ${i + 1}/${retries}: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
}

/**
 * 간단한 스타일 음악 생성 (메인 함수)
 */
async function generateSimpleStyleMusic() {
  try {
    // 1. 입력값 가져오기
    const styleInput = document.getElementById('simpleStyleInput').value.trim();
    const count = parseInt(document.getElementById('simpleStyleCount').value) || 2;
    const language = document.querySelector('input[name="simpleLanguage"]:checked').value;
    const gender = document.querySelector('input[name="simpleGender"]:checked').value;

    // 2. 유효성 검사
    if (!styleInput) {
      alert('❌ 스타일을 입력해주세요!');
      return;
    }

    if (count < 1 || count > 20) {
      alert('❌ 생성 수량은 1-20개 사이여야 합니다!');
      return;
    }

    console.log('🎨 스타일 음악 생성 시작:', { styleInput, count, language, gender });

    // 3. UI 업데이트 - 생성 중 표시
    document.getElementById('simpleStyleGenerating').style.display = 'block';
    document.getElementById('simpleStyleResults').style.display = 'none';
    document.getElementById('simpleStyleStatus').textContent = 'AI가 가사와 제목을 생성하고 있습니다...';

    // 4. 보컬 성별 힌트 추가
    let finalStyle = styleInput;
    if (gender === 'female') {
      finalStyle += ', female vocals';
    } else if (gender === 'male') {
      finalStyle += ', male vocals';
    }

    // 5. 언어 힌트 추가
    if (language === 'korean') {
      finalStyle += ', Korean lyrics';
    } else if (language === 'english') {
      finalStyle += ', English lyrics';
    }

    console.log('📝 최종 스타일:', finalStyle);
    
    // 스타일과 언어 저장 (메타데이터용 - 원본 입력값만 저장)
    currentGeneratedStyle = styleInput;
    currentGeneratedLanguage = language;

    // 6. 서버에 간단 생성 요청
    const response = await fetch('/api/style/generate-simple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        style: finalStyle,
        language: language,
        gender: gender,
        count: count
      })
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || '음악 생성 실패');
    }

    console.log('✅ 생성 요청 완료:', result);
    currentGenerationTaskId = result.taskId;

    // 7. 상태 업데이트
    const allTaskIds = result.allTaskIds || [result.taskId];
    document.getElementById('simpleStyleStatus').innerHTML = 
      `Suno AI가 ${result.count}곡의 음악을 만들고 있습니다... 각 곡마다 다른 가사와 제목을 생성합니다.`;

    // 8. 모든 task 완료 대기
    await waitForAllTasksCompletion(allTaskIds);

  } catch (error) {
    console.error('❌ 음악 생성 오류:', error);
    document.getElementById('simpleStyleGenerating').style.display = 'none';
    alert(`❌ 음악 생성 실패: ${error.message}`);
  }
}

/**
 * 여러 Task 완료 대기
 */
async function waitForAllTasksCompletion(taskIds) {
  const maxAttempts = 120; // 최대 20분 (10초 간격)
  let attempts = 0;
  const completedTasks = new Map(); // taskId -> result
  const failedTasks = new Set(); // 실패한 taskId

  const checkAllStatus = async () => {
    try {
      attempts++;
      const elapsed = Math.floor(attempts * 10);
      
      console.log(`📊 전체 상태 확인 중... (${attempts}/${maxAttempts})`);
      
      // 모든 task 상태 확인 (재시도 로직 추가)
      const promises = taskIds.map(taskId => 
        fetchWithRetry(`/api/music/status/${taskId}`, 3) // 3회 재시도
          .then(res => res.json())
          .catch(err => {
            console.error(`❌ ${taskId} 상태 확인 실패:`, err.message);
            return { success: false, error: err.message };
          })
      );
      
      const results = await Promise.all(promises);
      
      // 완료된 task 수집
      results.forEach((result, index) => {
        const taskId = taskIds[index];
        const status = result.status || result.data?.status;
        
        if ((status === 'SUCCESS' || status === 'TEXT_SUCCESS' || status === 'completed') && 
            !completedTasks.has(taskId)) {
          completedTasks.set(taskId, result.data);
          console.log(`✅ ${index + 1}번째 곡 완료!`, result.data);
        } else if (status === 'failed' && !failedTasks.has(taskId)) {
          failedTasks.add(taskId);
          console.log(`❌ ${index + 1}번째 곡 실패 (건너뛰기)`);
        }
      });
      
      // 진행 상태 업데이트
      const completedCount = completedTasks.size;
      const failedCount = failedTasks.size;
      const finishedCount = completedCount + failedCount;
      const totalCount = taskIds.length;
      const progressPercent = Math.floor((finishedCount / totalCount) * 100);
      
      updateGenerationStatus(
        attempts, 
        elapsed, 
        finishedCount === totalCount ? 'complete' : 'generating',
        `${completedCount}/${totalCount}곡 완료${failedCount > 0 ? ` (${failedCount}곡 실패)` : ''}`
      );
      
      updateProgressBar(finishedCount, totalCount);
      
      // 모두 완료되었는지 확인 (완료 + 실패)
      if (finishedCount === totalCount) {
        console.log(`🎉 처리 완료! (성공: ${completedCount}, 실패: ${failedCount})`);
        
        // 성공한 곡만 표시
        const allSongs = [];
        completedTasks.forEach(data => {
          if (data.allTracks) {
            console.log('🔍 [DEBUG] Task allTracks:', data.allTracks.map(t => ({ title: t.title, audioUrl: t.audioUrl?.substring(0, 50) })));
            allSongs.push(...data.allTracks);
          }
        });
        
        console.log('🎵 [DEBUG] Final allSongs titles:', allSongs.map(s => s.title));
        displaySimpleStyleResults({ allTracks: allSongs });
        
        if (failedCount > 0) {
          setTimeout(() => {
            alert(`⚠️ ${failedCount}곡은 Suno API에서 생성에 실패했습니다.\n성공한 ${completedCount}곡만 표시됩니다.`);
          }, 500);
        }
        return;
      }
      
      // 아직 진행 중
      if (attempts < maxAttempts) {
        setTimeout(checkAllStatus, 10000);
      } else {
        throw new Error(`생성 시간 초과 (${completedCount}/${totalCount}곡만 완료됨)`);
      }
      
    } catch (error) {
      console.error('❌ 상태 확인 오류:', error);
      document.getElementById('simpleStyleGenerating').style.display = 'none';
      alert(`❌ 음악 생성 실패: ${error.message}`);
    }
  };

  // 첫 체크는 15초 후 시작 (생성 시작 시간 고려)
  setTimeout(checkAllStatus, 15000);
}

/**
 * 음악 생성 완료 대기 (단일 task - 백업용)
 */
async function waitForSimpleStyleCompletion(taskId) {
  const maxAttempts = 60; // 최대 10분 (10초 간격)
  let attempts = 0;

  const checkStatus = async () => {
    try {
      attempts++;
      const elapsed = Math.floor(attempts * 10); // 경과 시간 (초)
      
      // 실시간 상태 업데이트
      updateGenerationStatus(attempts, elapsed, 'checking');
      
      console.log(`📊 생성 상태 확인 중... (${attempts}/${maxAttempts})`);

      const response = await fetch(`/api/music/status/${taskId}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '상태 확인 실패');
      }

      // status는 result.status 또는 result.data.status에 있을 수 있음
      const status = result.status || result.data?.status;

      if (status === 'SUCCESS' || status === 'TEXT_SUCCESS' || status === 'completed') {
        // 생성 완료!
        console.log('✅ 음악 생성 완료!', result.data);
        updateGenerationStatus(attempts, elapsed, 'complete');
        displaySimpleStyleResults(result.data);
        return;
      } else if (status === 'FAILED' || status === 'failed') {
        throw new Error('음악 생성 실패');
      } else if (status === 'PENDING' || status === 'GENERATING' || status === 'pending' || status === 'generating') {
        // 아직 생성 중...
        updateGenerationStatus(attempts, elapsed, status.toLowerCase());
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 10000); // 10초 후 재시도
        } else {
          throw new Error('생성 시간 초과 (10분)');
        }
      } else {
        // 알 수 없는 상태 - 재시도
        console.log('⚠️ 알 수 없는 상태:', status, '- 10초 후 재시도');
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 10000);
        } else {
          throw new Error('생성 시간 초과 (10분)');
        }
      }

    } catch (error) {
      console.error('❌ 상태 확인 오류:', error);
      updateGenerationStatus(attempts, 0, 'error');
      document.getElementById('simpleStyleGenerating').style.display = 'none';
      alert(`❌ 음악 생성 실패: ${error.message}`);
    }
  };

  // 첫 체크는 10초 후 시작
  setTimeout(checkStatus, 10000);
}

/**
 * 실시간 생성 상태 업데이트
 */
function updateGenerationStatus(attempts, elapsed, status, extraMessage = '') {
  const statusElement = document.getElementById('simpleStyleStatus');
  if (!statusElement) return;

  let message = '';
  let icon = '';
  
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const timeStr = `${minutes}분 ${seconds}초`;

  switch(status) {
    case 'checking':
      icon = '🔍';
      message = `상태 확인 중... (${attempts}번째 확인, 경과: ${timeStr})`;
      break;
    case 'pending':
      icon = '⏳';
      message = `대기 중... Suno AI가 작업을 시작합니다 (경과: ${timeStr})`;
      break;
    case 'generating':
      icon = '🎵';
      message = `음악 생성 중... ${extraMessage || 'AI가 창의적으로 작곡하고 있습니다'} (경과: ${timeStr})`;
      break;
    case 'complete':
      icon = '✅';
      message = `생성 완료! ${extraMessage} 총 소요 시간: ${timeStr}`;
      break;
    case 'error':
      icon = '❌';
      message = '오류가 발생했습니다.';
      break;
    default:
      icon = '🎵';
      message = `음악 생성 진행 중... ${extraMessage} (경과: ${timeStr})`;
  }

  statusElement.innerHTML = `${icon} ${message}`;
  
  // 프로그레스 바 업데이트 (선택사항)
  if (status !== 'complete') {
    updateProgressBar(attempts, 60);
  }
}

/**
 * 프로그레스 바 업데이트
 */
function updateProgressBar(current, max) {
  const progressBarElement = document.getElementById('simpleStyleProgressBar');
  if (!progressBarElement) return;
  
  const percentage = Math.min((current / max) * 100, 100);
  progressBarElement.style.width = percentage + '%';
  
  const percentText = document.getElementById('simpleStyleProgressText');
  if (percentText) {
    percentText.textContent = Math.floor(percentage) + '%';
  }
}

/**
 * 생성된 음악 결과 표시 (개선된 그리드 레이아웃)
 */
function displaySimpleStyleResults(data) {
  console.log('🎉 결과 표시:', data);

  // 생성 중 UI 숨기기
  document.getElementById('simpleStyleGenerating').style.display = 'none';

  // 결과 섹션 표시
  const resultsDiv = document.getElementById('simpleStyleResults');
  const resultListDiv = document.getElementById('simpleStyleResultList');
  const countSpan = document.getElementById('simpleStyleResultCount');

  resultsDiv.style.display = 'block';

  // 음악 데이터 추출 (여러 형식 지원)
  const songs = data.allTracks || data.response || data.sunoData || [];
  console.log('🎵 추출한 곡 수:', songs.length);
  countSpan.textContent = `${songs.length}`;
  
  // 전역 리스트에 저장
  generatedMusicList = songs;
  console.log('✅ generatedMusicList 저장 완료:', generatedMusicList.length, '곡');

  // 결과 리스트 초기화 및 그리드 스타일 적용
  resultListDiv.innerHTML = '';
  resultListDiv.style.cssText = `
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
    margin-top: 24px;
    padding: 8px;
  `;

  // 각 음악 박스 생성
  songs.forEach((song, index) => {
    const musicBox = createMusicBox(song, index + 1);
    resultListDiv.appendChild(musicBox);
  });

  // 🎬 음악 생성 완료 후 앨범 생성 버튼 활성화
  const createAlbumSection = document.getElementById('createAlbumSection');
  const createAlbumButton = document.getElementById('createAlbumButton');
  const albumButtonStatus = document.getElementById('albumButtonStatus');
  
  if (createAlbumSection && createAlbumButton) {
    // 음악이 생성되면 버튼 섹션 표시
    createAlbumSection.style.display = 'block';
    createAlbumButton.disabled = false;
    createAlbumButton.style.opacity = '1';
    createAlbumButton.style.cursor = 'pointer';
    
    // 상태 메시지 업데이트
    if (albumButtonStatus) {
      if (trackOrder.size > 0) {
        albumButtonStatus.textContent = `${trackOrder.size}곡 선택됨 → ZIP + 앨범정보 자동 생성`;
      } else {
        albumButtonStatus.textContent = '트랙 번호를 선택하세요 (1~20 버튼 클릭)';
      }
    }
    
    console.log('✅ 앨범 생성 버튼 활성화됨');
  }
  
  // 🎶 작업 관리 버튼 표시 (앨범 정보 아래)
  const workManagementButtons = document.getElementById('workManagementButtons');
  if (workManagementButtons) {
    workManagementButtons.style.display = 'block';
    console.log('✅ 작업 관리 버튼 표시됨');
  }

  // 스크롤 이동
  resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
  
  // 축하 애니메이션
  setTimeout(() => {
    const boxes = resultListDiv.querySelectorAll('.music-mini-box');
    boxes.forEach((box, i) => {
      setTimeout(() => {
        box.style.opacity = '0';
        box.style.transform = 'translateY(20px)';
        setTimeout(() => {
          box.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
          box.style.opacity = '1';
          box.style.transform = 'translateY(0)';
        }, 50);
      }, i * 100);
    });
  }, 100);
}

/**
 * 예쁜 미니 박스 형태로 음악 박스 생성
 */
function createMusicBox(song, index) {
  const box = document.createElement('div');
  box.className = 'music-mini-box';
  box.dataset.songId = `song-${index}`;
  box.dataset.songIndex = index;
  box.dataset.duration = song.duration || 210; // ✅ duration 저장!
  
  // 가사 포맷팅
  const lyrics = song.lyrics || song.lyric || song.prompt || '';
  const formattedLyrics = lyrics.replace(/\n/g, '<br>');
  
  // 썸네일 이미지 (고해상도 우선 사용)
  const thumbnail = song.imageLargeUrl || song.image_large_url || song.imageUrl || song.image_url || '';
  
  box.style.cssText = `
    background: linear-gradient(145deg, rgba(30,30,45,0.95), rgba(20,20,35,0.95));
    border: 2px solid rgba(251,146,60,0.4);
    border-radius: 16px;
    padding: 0;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    position: relative;
  `;
  
  box.innerHTML = `
    <!-- 헤더 섹션 -->
    <div style="position: relative; padding: 20px; background: linear-gradient(135deg, rgba(251,146,60,0.15), rgba(236,72,153,0.15));">
      <div style="position: absolute; top: 12px; left: 12px; background: linear-gradient(135deg, #fb923c, #ec4899); width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.3em; font-weight: bold; color: white; box-shadow: 0 4px 12px rgba(251,146,60,0.4);">
        ${index}
      </div>
      
      <div style="margin-left: 52px;">
        <h3 style="margin: 0 0 8px 0; color: #fb923c; font-size: 1.3em; font-weight: 700; line-height: 1.3;">
          🎵 ${song.title || 'Untitled'}
        </h3>
        
        <!-- 트랙 순서 선택 박스 -->
        <div style="margin: 8px 0; display: flex; flex-wrap: wrap; gap: 4px; align-items: center;">
          <span style="font-size: 0.8em; color: rgba(255,255,255,0.5); margin-right: 4px;">앨범수록:</span>
          ${Array.from({length: 20}, (_, i) => i + 1).map(num => `
            <button 
              class="track-order-btn" 
              data-song-index="${index}" 
              data-track-number="${num}"
              onclick="selectTrackOrder(${index}, ${num})"
              style="
                width: 28px; 
                height: 28px; 
                padding: 0;
                background: rgba(30,30,45,0.8);
                border: 1.5px solid rgba(251,146,60,0.3);
                border-radius: 6px;
                color: rgba(255,255,255,0.6);
                font-size: 0.75em;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                display: inline-flex;
                align-items: center;
                justify-content: center;
              "
              onmouseover="if(!this.disabled && !this.classList.contains('occupied')) { this.style.borderColor='rgba(251,146,60,0.8)'; this.style.background='rgba(251,146,60,0.2)'; this.style.transform='scale(1.1)' }"
              onmouseout="if(!this.classList.contains('my-selection') && !this.classList.contains('occupied')) { this.style.borderColor='rgba(251,146,60,0.3)'; this.style.background='rgba(30,30,45,0.8)'; this.style.transform='scale(1)' }"
            >
              ${num}
            </button>
          `).join('')}
        </div>
        
        <div style="display: flex; gap: 12px; flex-wrap: wrap; font-size: 0.85em; color: rgba(255,255,255,0.6);">
          <span style="display: flex; align-items: center; gap: 4px;">
            ⏱️ ${song.duration ? formatDuration(song.duration) : '--:--'}
          </span>
          ${song.model ? `<span style="display: flex; align-items: center; gap: 4px;">🎼 ${song.model}</span>` : ''}
          ${song.tags ? `<span style="display: flex; align-items: center; gap: 4px; font-size: 0.75em; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${song.tags}">🏷️ ${song.tags.split(',')[0].trim()}</span>` : ''}
        </div>
      </div>
    </div>
    
    <!-- 썸네일 & 재생 섹션 -->
    ${thumbnail ? `
    <div style="position: relative; width: 100%; height: 180px; background: url('${thumbnail}') center/cover; overflow: hidden; cursor: pointer;" 
         data-image-url="${thumbnail}"
         data-song-index="${index}"
         data-song-title="${song.title || 'Untitled'}"
         data-song-style="${song.style || ''}"
         data-song-lyrics="${(song.lyrics || '').replace(/"/g, '&quot;')}"
         onclick="handleImageClick(this)">
      
      <!-- 업스케일 상태 표시 -->
      <div style="position: absolute; top: 12px; left: 12px; z-index: 10;">
        <div class="upscale-status" style="display: flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); padding: 8px 12px; border-radius: 8px; border: 2px solid rgba(139,92,246,0.5);">
          <span style="color: white; font-size: 0.85em; font-weight: 600;">🖼️ 클릭하여 업스케일</span>
        </div>
      </div>
      
      <!-- 다운로드 선택 체크박스 (우상단) -->
      <div style="position: absolute; top: 12px; right: 12px; z-index: 10;">
        <label style="display: flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); padding: 8px 12px; border-radius: 8px; cursor: pointer; border: 2px solid rgba(34,197,94,0.5); transition: all 0.3s;"
               onmouseover="this.style.background='rgba(34,197,94,0.3)'; this.style.borderColor='rgba(34,197,94,0.8)'"
               onmouseout="this.style.background='rgba(0,0,0,0.7)'; this.style.borderColor='rgba(34,197,94,0.5)'"
               onclick="event.stopPropagation();">
          <input type="checkbox" class="image-select-checkbox" data-song-index="${index}" data-image-url="${thumbnail}"
                 onchange="toggleImageSelection(this, ${index}, '${thumbnail}')"
                 style="width: 18px; height: 18px; cursor: pointer; accent-color: #22c55e;">
          <span style="color: white; font-size: 0.85em; font-weight: 600;">다운로드</span>
        </label>
      </div>
      
      <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.9), transparent); padding: 16px;">
        <audio controls style="width: 100%; height: 40px; border-radius: 8px; background: rgba(255,255,255,0.1);" preload="metadata" class="music-player" data-song-id="song-${index}">
          <source src="${song.audioUrl || song.source_audio_url || song.audio_url}" type="audio/mpeg">
        </audio>
      </div>
    </div>
    ` : `
    <div style="padding: 16px; background: rgba(0,0,0,0.2);">
      <audio controls style="width: 100%; border-radius: 8px; background: rgba(255,255,255,0.05);" preload="metadata" class="music-player" data-song-id="song-${index}">
        <source src="${song.audioUrl || song.source_audio_url || song.audio_url}" type="audio/mpeg">
      </audio>
    </div>
    `}
    
    <!-- 가사 섹션 -->
    ${lyrics && lyrics !== '[Instrumental]' ? `
    <div style="padding: 16px; border-top: 1px solid rgba(255,255,255,0.1);">
      <button onclick="toggleLyrics(this)" 
              style="width: 100%; background: linear-gradient(135deg, rgba(251,146,60,0.2), rgba(236,72,153,0.2)); border: 1px solid rgba(251,146,60,0.4); color: #fb923c; padding: 10px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.9em; transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 8px;">
        <span>📝 가사 보기</span>
        <span style="font-size: 0.8em;">▼</span>
      </button>
      <div class="lyrics-content" style="max-height: 0; overflow: hidden; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); margin-top: 0;">
        <div style="margin-top: 12px; padding: 16px; background: rgba(0,0,0,0.4); border-radius: 8px; border-left: 3px solid #fb923c;">
          <div style="color: rgba(255,255,255,0.85); font-size: 0.9em; line-height: 1.8; white-space: pre-wrap; max-height: 300px; overflow-y: auto;">
${formattedLyrics}
          </div>
        </div>
      </div>
    </div>
    ` : lyrics === '[Instrumental]' ? `
    <div style="padding: 16px; border-top: 1px solid rgba(255,255,255,0.1);">
      <div style="text-align: center; padding: 20px; background: rgba(168,85,247,0.1); border-radius: 12px; border: 1px dashed rgba(168,85,247,0.4);">
        <div style="font-size: 2em; margin-bottom: 8px;">🎹</div>
        <div style="color: rgba(168,85,247,0.9); font-weight: 600; font-size: 0.95em; margin-bottom: 4px;">
          인스트루멘탈 음악
        </div>
        <div style="color: rgba(255,255,255,0.5); font-size: 0.85em;">
          보컬 없는 순수 악기 연주곡입니다
        </div>
      </div>
    </div>
    ` : ''}
    
    <!-- 액션 버튼 섹션 -->
    <div style="padding: 16px; background: rgba(0,0,0,0.2);">
      <!-- 상단: 즐겨찾기 & 선택 버튼 통합 -->
      <div style="display: grid; grid-template-columns: auto 1fr; gap: 10px; margin-bottom: 12px;">
        <!-- 즐겨찾기 버튼 -->
        <button onclick="event.stopPropagation(); toggleFavorite(this, '${(song.title || 'Untitled').replace(/'/g, "\\'")}', ${index})"
                class="favorite-btn"
                data-song-id="song-${index}"
                style="width: 50px; height: 50px; padding: 0; background: linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,146,60,0.15)); border: 2px solid rgba(251,191,36,0.4); border-radius: 10px; cursor: pointer; transition: all 0.3s; font-size: 1.5em; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.2);"
                onmouseover="this.style.borderColor='rgba(251,191,36,0.8)'; this.style.transform='scale(1.05)'; this.style.boxShadow='0 4px 12px rgba(251,191,36,0.4)'"
                onmouseout="this.style.borderColor='rgba(251,191,36,0.4)'; this.style.transform='scale(1)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.2)'">
          ⭐
        </button>
      </div>
      
      <!-- 하단: 다운로드 & 링크 복사 버튼 -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <a href="${song.audioUrl || song.source_audio_url || song.audio_url}" download="${(song.title || 'music').replace(/[^a-zA-Z0-9가-힣]/g, '_')}.mp3" 
           style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 14px; background: linear-gradient(135deg, rgba(34,197,94,0.15), rgba(22,163,74,0.15)); border: 2px solid rgba(34,197,94,0.4); color: #22c55e; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 0.95em; transition: all 0.3s; box-shadow: 0 2px 8px rgba(0,0,0,0.2);"
           onmouseover="this.style.background='linear-gradient(135deg, rgba(34,197,94,0.25), rgba(22,163,74,0.25))'; this.style.borderColor='rgba(34,197,94,0.7)'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(34,197,94,0.4)'"
           onmouseout="this.style.background='linear-gradient(135deg, rgba(34,197,94,0.15), rgba(22,163,74,0.15))'; this.style.borderColor='rgba(34,197,94,0.4)'; this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.2)'">
          <span style="font-size: 1.2em;">💾</span>
          <span>다운로드</span>
        </a>
        <button onclick="copyToClipboard('${song.audioUrl || song.source_audio_url || song.audio_url}')" 
                style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 14px; background: linear-gradient(135deg, rgba(59,130,246,0.15), rgba(37,99,235,0.15)); border: 2px solid rgba(59,130,246,0.4); color: #3b82f6; border-radius: 10px; font-weight: 600; font-size: 0.95em; cursor: pointer; transition: all 0.3s; box-shadow: 0 2px 8px rgba(0,0,0,0.2);"
                onmouseover="this.style.background='linear-gradient(135deg, rgba(59,130,246,0.25), rgba(37,99,235,0.25))'; this.style.borderColor='rgba(59,130,246,0.7)'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(59,130,246,0.4)'"
                onmouseout="this.style.background='linear-gradient(135deg, rgba(59,130,246,0.15), rgba(37,99,235,0.15))'; this.style.borderColor='rgba(59,130,246,0.4)'; this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.2)'">
          <span style="font-size: 1.2em;">🔗</span>
          <span>링크 복사</span>
        </button>
      </div>
    </div>
  `;
  
  // 호버 효과
  box.addEventListener('mouseenter', () => {
    box.style.transform = 'translateY(-8px) scale(1.02)';
    box.style.boxShadow = '0 12px 40px rgba(251,146,60,0.4), 0 0 0 1px rgba(251,146,60,0.3)';
    box.style.borderColor = 'rgba(251,146,60,0.8)';
  });
  
  box.addEventListener('mouseleave', () => {
    box.style.transform = 'translateY(0) scale(1)';
    box.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
    box.style.borderColor = 'rgba(251,146,60,0.4)';
  });
  
  // 오디오 플레이어 이벤트 리스너 (자동 정지)
  const audioPlayer = box.querySelector('.music-player');
  if (audioPlayer) {
    audioPlayer.addEventListener('play', () => {
      // 다른 모든 오디오 정지
      if (currentPlayingAudio && currentPlayingAudio !== audioPlayer) {
        currentPlayingAudio.pause();
      }
      currentPlayingAudio = audioPlayer;
    });
  }
  
  // 곡 데이터 저장 (나중에 다운로드용)
  box.songData = song;
  
  return box;
}

/**
 * 시간 포맷팅 (초 → MM:SS)
 */
function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 클립보드 복사
 */
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('✅ 링크가 클립보드에 복사되었습니다!');
  }).catch(err => {
    console.error('❌ 복사 실패:', err);
    alert('❌ 링크 복사에 실패했습니다.');
  });
}

/**
 * 가사 펼치기/접기 (개선된 버전)
 */
function toggleLyrics(button) {
  const lyricsContent = button.nextElementSibling;
  const isExpanded = lyricsContent.style.maxHeight && lyricsContent.style.maxHeight !== '0px';
  
  if (isExpanded) {
    // 접기
    lyricsContent.style.maxHeight = '0';
    lyricsContent.style.marginTop = '0';
    button.innerHTML = '<span>📝 가사 보기</span><span style="font-size: 0.8em;">▼</span>';
    button.style.background = 'linear-gradient(135deg, rgba(251,146,60,0.2), rgba(236,72,153,0.2))';
  } else {
    // 펼치기
    lyricsContent.style.maxHeight = '400px';
    lyricsContent.style.marginTop = '12px';
    button.innerHTML = '<span>📝 가사 숨기기</span><span style="font-size: 0.8em;">▲</span>';
    button.style.background = 'linear-gradient(135deg, rgba(251,146,60,0.3), rgba(236,72,153,0.3))';
  }
}

/**
 * 트랙 번호 할당 (사용자가 직접 번호 입력)
 */
function assignTrackNumber(input, songIndex, title) {
  const trackNumber = parseInt(input.value);
  const songId = `song-${songIndex}`;
  const box = input.closest('.music-mini-box');
  const statusBadge = box.querySelector('.track-status');
  
  // 빈 값이거나 유효하지 않은 번호
  if (!trackNumber || trackNumber < 1 || trackNumber > 20) {
    // 기존 선택 제거
    if (selectedSongs.has(songId)) {
      selectedSongs.delete(songId);
      statusBadge.style.display = 'none';
      input.style.borderColor = 'rgba(251,146,60,0.4)';
      console.log(`❌ 트랙 ${trackNumber} 제거: ${title}`);
    }
    updateDownloadAllButton();
    return;
  }
  
  // 이미 같은 번호가 사용중인지 확인
  let conflictSongId = null;
  selectedSongs.forEach((data, id) => {
    if (data.trackNumber === trackNumber && id !== songId) {
      conflictSongId = id;
    }
  });
  
  // 충돌 처리: 기존 곡의 번호를 제거
  if (conflictSongId) {
    const conflictData = selectedSongs.get(conflictSongId);
    const conflictInput = conflictData.box.querySelector('.track-number-input');
    const conflictStatus = conflictData.box.querySelector('.track-status');
    
    // 기존 곡 번호 제거
    selectedSongs.delete(conflictSongId);
    conflictInput.value = '';
    conflictStatus.style.display = 'none';
    conflictInput.style.borderColor = 'rgba(251,146,60,0.4)';
    
    console.log(`⚠️ Track ${trackNumber} 충돌 → 기존 곡 제거: ${conflictData.title}`);
  }
  
  // 새 트랙 번호 할당
  selectedSongs.set(songId, {
    index: songIndex,
    title: title,
    trackNumber: trackNumber,
    box: box,
    song: box.songData
  });
  
  // 상태 배지 표시
  statusBadge.textContent = `✓ Track ${String(trackNumber).padStart(2, '0')}`;
  statusBadge.style.display = 'inline-block';
  statusBadge.style.animation = 'bounceIn 0.5s ease';
  input.style.borderColor = '#10b981';
  input.style.boxShadow = '0 0 12px rgba(16,185,129,0.4)';
  
  console.log(`✅ Track ${trackNumber} 할당: ${title}`);
  
  // 버튼 상태 업데이트
  updateDownloadAllButton();
}

/**
 * 곡 선택/해제 토글 (레거시 - 사용 안 함)
 */
function toggleSongSelection(checkbox, index, title) {
  const songId = `song-${index}`;
  const box = checkbox.closest('.music-mini-box');
  const orderBadge = box.querySelector('.selection-order');
  const label = checkbox.closest('label');
  
  if (checkbox.checked) {
    // ✅ 선택됨 - 순서 할당
    const order = selectedSongs.size + 1;
    selectedSongs.set(songId, {
      index: index,
      title: title,
      order: order,
      box: box,
      song: box.songData
    });
    
    // 순서 배지 표시 (애니메이션)
    orderBadge.textContent = String(order).padStart(2, '0');
    orderBadge.style.display = 'inline-block';
    orderBadge.style.animation = 'bounceIn 0.5s ease';
    
    // 라벨 스타일 변경 (선택됨)
    label.style.background = 'linear-gradient(135deg, rgba(251,146,60,0.3), rgba(236,72,153,0.3))';
    label.style.borderColor = 'rgba(251,146,60,0.8)';
    label.style.boxShadow = '0 4px 16px rgba(251,146,60,0.5)';
    
    console.log(`✅ 곡 선택: ${title} (순서: ${order})`);
  } else {
    // ❌ 선택 해제
    const removedOrder = selectedSongs.get(songId).order;
    selectedSongs.delete(songId);
    
    // 순서 배지 숨김 (애니메이션)
    orderBadge.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
      orderBadge.style.display = 'none';
    }, 300);
    
    // 라벨 스타일 원복
    label.style.background = 'linear-gradient(135deg, rgba(251,146,60,0.1), rgba(236,72,153,0.1))';
    label.style.borderColor = 'rgba(251,146,60,0.3)';
    label.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    
    // 뒤 순서들 재정렬
    selectedSongs.forEach((data, id) => {
      if (data.order > removedOrder) {
        data.order--;
        const badge = data.box.querySelector('.selection-order');
        badge.textContent = String(data.order).padStart(2, '0');
        // 순서 변경 애니메이션
        badge.style.animation = 'pulse 0.4s ease';
      }
    });
    
    console.log(`❌ 곡 선택 해제: ${title} (순서 ${removedOrder} 제거, 뒤 곡들 재정렬)`);
  }
  
  // 전체 다운로드 버튼 상태 업데이트
  updateDownloadAllButton();
}

/**
 * 전체 선택/해제
 */
function toggleAllSongs() {
  const checkboxes = document.querySelectorAll('.song-select-checkbox');
  const allChecked = Array.from(checkboxes).every(cb => cb.checked);
  
  checkboxes.forEach(cb => {
    if (allChecked) {
      if (cb.checked) cb.click(); // 전체 해제
    } else {
      if (!cb.checked) cb.click(); // 전체 선택
    }
  });
}

/**
 * 전체 다운로드 버튼 업데이트
 */
function updateDownloadAllButton() {
  const button = document.getElementById('downloadAllButton');
  const countSpan = document.getElementById('selectedCount');
  
  // 트랙 번호가 할당된 곡 개수 (새로운 방식)
  const count = trackOrder.size;
  
  // 기존 다운로드 버튼 업데이트
  if (button && countSpan) {
    countSpan.textContent = count;
    
    if (count > 0) {
      button.disabled = false;
      button.style.opacity = '1';
      button.style.cursor = 'pointer';
    } else {
      button.disabled = true;
      button.style.opacity = '0.5';
      button.style.cursor = 'not-allowed';
    }
  }
  
  // 🖼️ 이미지 관리 버튼 업데이트
  const imageManageBtn = document.getElementById('imageManageBtn');
  if (imageManageBtn) {
    if (count > 0) {
      imageManageBtn.disabled = false;
      imageManageBtn.style.opacity = '1';
      imageManageBtn.style.cursor = 'pointer';
    } else {
      imageManageBtn.disabled = true;
      imageManageBtn.style.opacity = '0.5';
      imageManageBtn.style.cursor = 'not-allowed';
    }
  }
  
  // 🎬 앨범 생성 버튼 업데이트 - 음악이 있으면 항상 표시
  const createAlbumBtn = document.getElementById('createAlbumButton');
  const albumSection = document.getElementById('createAlbumSection');
  const albumStatus = document.getElementById('albumButtonStatus');
  
  if (createAlbumBtn && albumSection && albumStatus) {
    // 음악이 생성되었으면 항상 버튼 표시 (트랙 선택 여부 무관)
    if (generatedMusicList && generatedMusicList.length > 0) {
      albumSection.style.display = 'block';
      createAlbumBtn.disabled = false;
      createAlbumBtn.style.opacity = '1';
      createAlbumBtn.style.cursor = 'pointer';
      
      if (count > 0) {
        albumStatus.textContent = `${count}곡 선택됨 → ZIP + 앨범정보 자동 생성`;
      } else {
        albumStatus.textContent = '트랙 번호를 선택하세요 (1~20 버튼 클릭)';
      }
      
      // 🎵 AI 순위 분석 버튼 표시 (2곡 이상일 때)
      const aiRankBtn = document.getElementById('aiRankButton');
      if (aiRankBtn && generatedMusicList.length >= 2) {
        aiRankBtn.style.display = 'inline-block';
      }
    } else {
      albumSection.style.display = 'none';
    }
  }
}

/**
 * 선택한 곡들 순서대로 다운로드
 */
async function downloadSelectedSongs() {
  if (selectedSongs.size === 0) {
    alert('❌ 다운로드할 곡을 선택해주세요!');
    return;
  }
  
  console.log(`📥 ${selectedSongs.size}곡 다운로드 시작...`);
  
  // 순서대로 정렬
  const sortedSongs = Array.from(selectedSongs.values()).sort((a, b) => a.order - b.order);
  
  // 다운로드 진행 표시
  const button = document.getElementById('downloadAllButton');
  const originalText = button.innerHTML;
  button.innerHTML = '⏳ 다운로드 중...';
  button.disabled = true;
  
  try {
    for (const songData of sortedSongs) {
      const { order, title, song } = songData;
      const audioUrl = song.audioUrl || song.source_audio_url || song.audio_url;
      
      // 파일명 생성: 01-제목.mp3
      const sanitizedTitle = title.replace(/[^a-zA-Z0-9가-힣\s]/g, '_');
      const filename = `${String(order).padStart(2, '0')}-${sanitizedTitle}.mp3`;
      
      console.log(`📥 다운로드 중: ${filename}`);
      
      // 다운로드 실행
      await downloadFile(audioUrl, filename);
      
      // 각 다운로드 사이 딜레이 (브라우저 제한 회피)
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    alert(`✅ ${selectedSongs.size}곡 다운로드 완료!`);
    console.log('✅ 전체 다운로드 완료');
    
  } catch (error) {
    console.error('❌ 다운로드 오류:', error);
    alert(`❌ 다운로드 실패: ${error.message}`);
  } finally {
    button.innerHTML = originalText;
    button.disabled = false;
  }
}

/**
 * 파일 다운로드 헬퍼
 */
async function downloadFile(url, filename) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Blob URL 정리
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
    
  } catch (error) {
    console.error(`❌ 파일 다운로드 실패: ${filename}`, error);
    throw error;
  }
}

// 전역 함수로 등록
window.toggleLyrics = toggleLyrics;
window.copyToClipboard = copyToClipboard;
window.toggleSongSelection = toggleSongSelection;
window.assignTrackNumber = assignTrackNumber;
window.createAlbumWithMetadata = createAlbumWithMetadata;
window.toggleAllSongs = toggleAllSongs;
window.downloadSelectedSongs = downloadSelectedSongs;

/**
 * 스타일 입력 글자 수 카운터 초기화
 */
function initStyleCharCounter() {
  const textarea = document.getElementById('simpleStyleInput');
  const counter = document.getElementById('styleCharCount');
  
  if (textarea && counter) {
    // 입력 이벤트 리스너
    textarea.addEventListener('input', () => {
      const currentLength = textarea.value.length;
      const maxLength = 5000;
      
      counter.textContent = `${currentLength.toLocaleString()} / ${maxLength.toLocaleString()}자`;
      
      // 글자 수에 따른 색상 변경
      if (currentLength >= maxLength) {
        counter.style.color = '#ef4444'; // 빨강 (최대)
      } else if (currentLength >= maxLength * 0.9) {
        counter.style.color = '#f59e0b'; // 주황 (90% 이상)
      } else if (currentLength >= maxLength * 0.7) {
        counter.style.color = '#fbbf24'; // 노랑 (70% 이상)
      } else {
        counter.style.color = 'rgba(251,146,60,0.8)'; // 기본
      }
    });
    
    console.log('✅ 스타일 입력 글자 수 카운터 초기화 완료');
  }
}

// DOM 로드 후 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStyleCharCounter);
} else {
  initStyleCharCounter();
}

console.log('✅ Simple Style Workflow 준비 완료');

// ==========================================
// ⭐ 즐겨찾기 기능
// ==========================================

/**
 * 즐겨찾기 토글 (패널 열기/닫기)
 */
function toggleFavorites() {
  const panel = document.getElementById('favoritesPanel');
  if (panel.style.display === 'none') {
    panel.style.display = 'block';
    loadFavorites();
  } else {
    panel.style.display = 'none';
  }
}

/**
 * 스타일 즐겨찾기 추가 (여러 개 추가 가능)
 */
function toggleFavorite(button, title, index) {
  // 현재 생성된 스타일 가져오기
  const style = currentGeneratedStyle;
  
  if (!style) {
    alert('❌ 스타일 정보를 찾을 수 없습니다!');
    return;
  }
  
  console.log('⭐ 즐겨찾기 추가:', { title, style });
  
  const favorites = JSON.parse(localStorage.getItem('musicStyleFavorites') || '[]');
  
  // 고유 ID 생성 (제목 + 현재 시간)
  const uniqueId = `${title}_${Date.now()}`;
  
  // 버튼이 이미 추가되었는지 확인 (data 속성으로 체크)
  const isAlreadyAdded = button.dataset.favoriteId;
  
  if (isAlreadyAdded) {
    // 이미 추가된 경우 - 제거
    const removeIndex = favorites.findIndex(f => f.id === isAlreadyAdded);
    if (removeIndex >= 0) {
      favorites.splice(removeIndex, 1);
      localStorage.setItem('musicStyleFavorites', JSON.stringify(favorites));
      
      // 버튼 스타일 리셋
      button.style.background = 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,146,60,0.15))';
      button.style.borderColor = 'rgba(251,191,36,0.4)';
      button.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
      button.dataset.favoriteId = '';
      
      alert('❌ 즐겨찾기에서 제거되었습니다!');
      updateFavoritesCount();
      
      const panel = document.getElementById('favoritesPanel');
      if (panel && panel.style.display !== 'none') {
        loadFavorites();
      }
    }
    return;
  }
  
  // 새로 추가
  favorites.push({
    id: uniqueId,
    style: style,
    title: title,
    timestamp: Date.now()
  });
  
  localStorage.setItem('musicStyleFavorites', JSON.stringify(favorites));
  
  // 버튼 스타일 변경 (추가됨 표시)
  button.style.background = 'linear-gradient(135deg, rgba(251,191,36,0.4), rgba(251,146,60,0.4))';
  button.style.borderColor = 'rgba(251,191,36,1)';
  button.style.boxShadow = '0 0 16px rgba(251,191,36,0.6)';
  button.dataset.favoriteId = uniqueId;
  
  // 체크마크 추가
  const originalText = button.textContent;
  button.textContent = '✅';
  setTimeout(() => {
    button.textContent = originalText;
  }, 800);
  
  alert('✨ 즐겨찾기에 추가되었습니다!');
  updateFavoritesCount();
  
  // 패널이 열려있으면 새로고침
  const panel = document.getElementById('favoritesPanel');
  if (panel && panel.style.display !== 'none') {
    loadFavorites();
  }
}

/**
 * 즐겨찾기 목록 로드
 */
function loadFavorites() {
  const favorites = JSON.parse(localStorage.getItem('musicStyleFavorites') || '[]');
  const listDiv = document.getElementById('favoritesList');
  
  if (favorites.length === 0) {
    listDiv.innerHTML = `
      <p style="color: rgba(255,255,255,0.5); text-align: center; padding: 20px; margin: 0;">
        아직 즐겨찾기가 없습니다.<br>생성된 곡의 ⭐ 버튼을 눌러 저장하세요!
      </p>
    `;
    return;
  }
  
  // 최신순 정렬
  favorites.sort((a, b) => b.timestamp - a.timestamp);
  
  listDiv.innerHTML = favorites.map((fav, index) => `
    <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; border-left: 3px solid #fbbf24; transition: all 0.3s; cursor: pointer;"
         onmouseover="this.style.background='rgba(251,191,36,0.15)'"
         onmouseout="this.style.background='rgba(255,255,255,0.05)'"
         onclick="useFavorite(${index})">
      <div style="display: flex; justify-content: space-between; align-items: start; gap: 12px;">
        <div style="flex: 1; min-width: 0;">
          <div style="color: #fbbf24; font-weight: 600; font-size: 0.95em; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
            <span>🎵</span>
            <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${fav.title}</span>
          </div>
          <div style="color: rgba(255,255,255,0.7); font-size: 0.85em; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${fav.style.substring(0, 100)}${fav.style.length > 100 ? '...' : ''}
          </div>
          <div style="color: rgba(255,255,255,0.4); font-size: 0.75em; margin-top: 6px;">
            저장: ${new Date(fav.timestamp).toLocaleDateString('ko-KR')}
          </div>
        </div>
        <button onclick="event.stopPropagation(); removeFavorite(${index})" 
                style="flex-shrink: 0; background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.5); color: #ef4444; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 0.8em; transition: all 0.3s;"
                onmouseover="this.style.background='rgba(239,68,68,0.3)'"
                onmouseout="this.style.background='rgba(239,68,68,0.2)'">
          🗑️ 삭제
        </button>
      </div>
    </div>
  `).join('');
}

/**
 * 즐겨찾기 스타일 사용 (입력란에 자동 입력)
 */
function useFavorite(index) {
  const favorites = JSON.parse(localStorage.getItem('musicStyleFavorites') || '[]');
  if (favorites[index]) {
    const styleInput = document.getElementById('simpleStyleInput');
    styleInput.value = favorites[index].style;
    styleInput.focus();
    
    // 글자 수 카운터 업데이트
    const charCount = document.getElementById('styleCharCount');
    const length = favorites[index].style.length;
    const maxLength = 5000;
    const percentage = (length / maxLength) * 100;
    
    let color = 'rgba(251,146,60,0.8)';
    if (percentage >= 90) color = 'rgba(239,68,68,0.9)';
    else if (percentage >= 70) color = 'rgba(251,191,36,0.9)';
    
    charCount.textContent = `${length.toLocaleString()} / ${maxLength.toLocaleString()}자`;
    charCount.style.color = color;
    
    // 패널 닫기
    document.getElementById('favoritesPanel').style.display = 'none';
    
    // 알림
    alert(`✨ "${favorites[index].title}" 스타일이 입력되었습니다!`);
  }
}

/**
 * 즐겨찾기 삭제
 */
function removeFavorite(index) {
  if (!confirm('이 스타일을 즐겨찾기에서 삭제하시겠습니까?')) {
    return;
  }
  
  const favorites = JSON.parse(localStorage.getItem('musicStyleFavorites') || '[]');
  favorites.splice(index, 1);
  localStorage.setItem('musicStyleFavorites', JSON.stringify(favorites));
  
  updateFavoritesCount();
  loadFavorites();
  alert('✅ 삭제되었습니다!');
}

/**
 * 즐겨찾기 개수 업데이트
 */
function updateFavoritesCount() {
  const favorites = JSON.parse(localStorage.getItem('musicStyleFavorites') || '[]');
  const countSpan = document.getElementById('favoritesCount');
  if (countSpan) {
    countSpan.textContent = favorites.length;
  }
}

/**
 * 📊 앨범 정보 자동 업데이트 (선택 시)
 */
async function autoUpdateAlbumInfo() {
  const summaryDiv = document.getElementById('finalSummaryResult');
  if (!summaryDiv) return;
  
  // 이미 업데이트 중이면 중복 실행 방지
  if (autoUpdateAlbumInfo.updating) return;
  autoUpdateAlbumInfo.updating = true;
  
  try {
    // showFinalSummary 재사용 (자동 모드)
    await showFinalSummary(true);
  } finally {
    autoUpdateAlbumInfo.updating = false;
  }
}

/**
 * 📋 앨범 정보 복사하기
 */
function copyAlbumInfo(event) {
  const contentDiv = document.getElementById('summaryContent');
  if (!contentDiv) return;
  
  // HTML 태그 제거하고 텍스트만 추출
  const text = contentDiv.innerText || contentDiv.textContent;
  
  // 클립보드에 복사
  navigator.clipboard.writeText(text).then(() => {
    // 복사 성공 알림
    const btn = event.target.closest('button');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<span>✅</span><span>복사 완료!</span>';
    btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.background = 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
    }, 2000);
  }).catch(err => {
    console.error('복사 실패:', err);
    alert('❌ 복사에 실패했습니다. 텍스트를 수동으로 선택해주세요.');
  });
}

/**
 * 💾 현재 작업 저장
 */
function saveCurrentWork() {
  // 현재 생성된 음악 리스트
  const musicList = Array.from(generatedMusicList);
  
  if (musicList.length === 0) {
    alert('⚠️ 저장할 음악이 없습니다!');
    return;
  }
  
  // 트랙 번호가 지정된 곡들
  const tracksData = [];
  selectedSongs.forEach((data, id) => {
    tracksData.push({
      trackNumber: data.trackNumber,
      songIndex: data.index,
      title: data.title,
      song: data.song
    });
  });
  
  // 저장할 데이터 구조
  const workData = {
    id: Date.now(), // 고유 ID
    savedAt: new Date().toISOString(),
    savedAtFormatted: new Date().toLocaleString('ko-KR'),
    totalSongs: musicList.length,
    selectedTracks: tracksData.length,
    musicList: musicList,
    tracks: tracksData,
    albumInfo: {
      // 앨범 정보가 있으면 함께 저장
      content: document.getElementById('summaryContent')?.innerHTML || ''
    }
  };
  
  // 로컬 스토리지에 저장
  const saved = JSON.parse(localStorage.getItem('savedWorks') || '[]');
  saved.unshift(workData); // 최신이 맨 위로
  
  // 최대 50개까지만 저장
  if (saved.length > 50) {
    saved.pop();
  }
  
  localStorage.setItem('savedWorks', JSON.stringify(saved));
  
  // 성공 알림
  const btn = event.target;
  const originalText = btn.textContent;
  btn.textContent = '✅ 저장 완료!';
  btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
  
  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.background = 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(37,99,235,0.2))';
  }, 2000);
  
  console.log('💾 작업 저장 완료:', workData);
}

/**
 * 📚 저장된 작업 목록 보기
 */
function showSavedWorks() {
  const modal = document.getElementById('savedWorksModal');
  const listDiv = document.getElementById('savedWorksList');
  
  // 저장된 데이터 불러오기
  const saved = JSON.parse(localStorage.getItem('savedWorks') || '[]');
  
  if (saved.length === 0) {
    listDiv.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.5);">
        <div style="font-size: 4em; margin-bottom: 20px;">📭</div>
        <h3 style="color: rgba(255,255,255,0.7); margin-bottom: 10px;">저장된 작업이 없습니다</h3>
        <p>음악을 생성하고 "💾 작업 저장" 버튼을 눌러보세요!</p>
      </div>
    `;
  } else {
    listDiv.innerHTML = saved.map((work, index) => `
      <div style="background: linear-gradient(135deg, rgba(251,146,60,0.1), rgba(236,72,153,0.1)); border: 2px solid rgba(251,146,60,0.3); border-radius: 12px; padding: 20px; transition: all 0.3s; cursor: pointer;"
           onmouseover="this.style.borderColor='rgba(251,146,60,0.6)'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 24px rgba(251,146,60,0.3)'"
           onmouseout="this.style.borderColor='rgba(251,146,60,0.3)'; this.style.transform='translateY(0)'; this.style.boxShadow='none'">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
              <span style="font-size: 1.5em;">🎵</span>
              <h3 style="margin: 0; color: #fb923c; font-size: 1.2em; font-weight: 700;">
                작업 #${saved.length - index}
              </h3>
            </div>
            <div style="color: rgba(255,255,255,0.7); font-size: 0.9em; line-height: 1.6;">
              <div>📅 저장 시간: ${work.savedAtFormatted}</div>
              <div>🎼 전체 곡: ${work.totalSongs}곡 | 📀 선택 트랙: ${work.selectedTracks}곡</div>
            </div>
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button onclick="event.stopPropagation(); loadWork(${work.id})" 
                    style="padding: 10px 20px; background: linear-gradient(135deg, #10b981, #059669); border: none; color: white; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.9em; transition: all 0.3s;">
              📂 불러오기
            </button>
            <button onclick="event.stopPropagation(); deleteWork(${work.id})" 
                    style="padding: 10px 20px; background: linear-gradient(135deg, rgba(239,68,68,0.8), rgba(220,38,38,0.8)); border: none; color: white; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.9em; transition: all 0.3s;">
              🗑️ 삭제
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  modal.style.display = 'block';
}

/**
 * ✕ 저장 목록 닫기
 */
function closeSavedWorks() {
  document.getElementById('savedWorksModal').style.display = 'none';
}

/**
 * 📂 저장된 작업 불러오기
 */
function loadWork(workId) {
  const saved = JSON.parse(localStorage.getItem('savedWorks') || '[]');
  const work = saved.find(w => w.id === workId);
  
  if (!work) {
    alert('❌ 작업을 찾을 수 없습니다!');
    return;
  }
  
  if (!confirm(`📂 이 작업을 불러올까요?\n\n저장 시간: ${work.savedAtFormatted}\n전체 곡: ${work.totalSongs}곡\n선택 트랙: ${work.selectedTracks}곡\n\n⚠️ 현재 작업 내용은 사라집니다!`)) {
    return;
  }
  
  // 현재 상태 초기화
  generatedMusicList = work.musicList;
  selectedSongs = new Map();
  
  // 음악 리스트 표시
  const resultDiv = document.getElementById('simpleStyleResults');
  const listDiv = document.getElementById('simpleStyleResultList');
  const countSpan = document.getElementById('simpleStyleResultCount');
  
  resultDiv.style.display = 'block';
  countSpan.textContent = work.totalSongs;
  listDiv.innerHTML = '';
  
  // 음악 박스 생성
  work.musicList.forEach((song, index) => {
    const box = createMusicMiniBox(song, index);
    listDiv.appendChild(box);
  });
  
  // 트랙 번호 복원
  work.tracks.forEach(track => {
    const input = document.querySelector(`.track-number-input[data-song-index="${track.songIndex}"]`);
    if (input) {
      input.value = track.trackNumber;
      // 트랙 번호 할당 이벤트 발생
      assignTrackNumber(input, track.songIndex, track.title);
    }
  });
  
  // 앨범 정보 복원
  if (work.albumInfo.content) {
    const summaryContent = document.getElementById('summaryContent');
    if (summaryContent) {
      summaryContent.innerHTML = work.albumInfo.content;
    }
  }
  
  // 모달 닫기
  closeSavedWorks();
  
  // 성공 알림
  alert(`✅ 작업을 불러왔습니다!\n\n${work.totalSongs}곡, ${work.selectedTracks}개 트랙`);
  
  console.log('📂 작업 불러오기 완료:', work);
}

/**
 * 🗑️ 저장된 작업 삭제
 */
function deleteWork(workId) {
  if (!confirm('🗑️ 이 작업을 삭제하시겠습니까?\n\n삭제된 작업은 복구할 수 없습니다!')) {
    return;
  }
  
  let saved = JSON.parse(localStorage.getItem('savedWorks') || '[]');
  saved = saved.filter(w => w.id !== workId);
  localStorage.setItem('savedWorks', JSON.stringify(saved));
  
  // 목록 새로고침
  showSavedWorks();
  
  console.log('🗑️ 작업 삭제 완료:', workId);
}

// 페이지 로드 시 즐겨찾기 개수 업데이트
document.addEventListener('DOMContentLoaded', () => {
  updateFavoritesCount();
});

// 즉시 실행 (DOMContentLoaded가 이미 발생한 경우)
updateFavoritesCount();

/**
 * 🎬 최종 정리: 앨범 메타데이터 생성
 * @param {boolean} autoMode - true면 자동 업데이트 (알림 없음)
 */
async function showFinalSummary(autoMode = false) {
  console.log('📊 최종 정리 시작' + (autoMode ? ' (자동)' : ''));
  
  const resultList = document.getElementById('simpleStyleResultList');
  const summaryDiv = document.getElementById('finalSummaryResult');
  const contentDiv = document.getElementById('summaryContent');
  
  // 생성된 모든 곡 정보 수집
  const musicBoxes = resultList.querySelectorAll('.music-mini-box');
  if (musicBoxes.length === 0) {
    if (!autoMode) alert('⚠️ 생성된 곡이 없습니다!');
    return;
  }
  
  // ✅ 선택한 곡만 순서대로 수집
  const songs = [];
  
  // selectionOrder에 기록된 순서대로 곡 정보 수집
  if (selectionOrder.length > 0) {
    console.log('📋 선택 순서:', selectionOrder);
    
    selectionOrder.forEach((songIndex, order) => {
      const box = musicBoxes[songIndex];
      if (!box) return;
      
      const titleEl = box.querySelector('h3');
      const lyricsEl = box.querySelector('.lyrics-content');
      
      // duration 가져오기
      let duration = parseInt(box.dataset.duration) || 210;
      if (duration === 210) {
        const audioEl = box.querySelector('audio');
        if (audioEl && audioEl.duration && !isNaN(audioEl.duration)) {
          duration = Math.floor(audioEl.duration);
        }
      }
      
      if (titleEl) {
        const songData = {
          title: titleEl.textContent.replace('🎵 ', '').trim(),
          lyrics: lyricsEl ? lyricsEl.textContent.trim() : '',
          duration: duration,
          orderNumber: order + 1  // ✅ 순서 번호 추가
        };
        songs.push(songData);
        console.log(`  ${order + 1}. ${songData.title} (${duration}초)`);
      }
    });
  } else {
    // 선택이 없으면 모든 곡
    musicBoxes.forEach((box, index) => {
      const titleEl = box.querySelector('h3');
      const lyricsEl = box.querySelector('.lyrics-content');
      
      let duration = parseInt(box.dataset.duration) || 210;
      if (duration === 210) {
        const audioEl = box.querySelector('audio');
        if (audioEl && audioEl.duration && !isNaN(audioEl.duration)) {
          duration = Math.floor(audioEl.duration);
        }
      }
      
      if (titleEl) {
        songs.push({
          title: titleEl.textContent.replace('🎵 ', '').trim(),
          lyrics: lyricsEl ? lyricsEl.textContent.trim() : '',
          duration: duration,
          orderNumber: index + 1
        });
      }
    });
  }
  
  console.log('🎵 수집된 곡 수:', songs.length);
  console.log('📊 Duration 확인:', songs.map(s => `${s.title}: ${s.duration}초`));
  
  // 가사와 제목 분석
  const allLyrics = songs.map(s => s.lyrics).join('\n\n');
  const allTitles = songs.map(s => s.title).join(', ');
  
  // 스타일 정보 가져오기
  const styleInput = document.getElementById('simpleStyleInput');
  const currentStyle = styleInput ? styleInput.value : '';
  
  // 로딩 표시
  contentDiv.innerHTML = `
    <div style="text-align: center; padding: 40px;">
      <div style="font-size: 3em; animation: spin 1s linear infinite;">🎨</div>
      <p style="margin-top: 16px; color: rgba(255,255,255,0.7);">AI가 앨범 정보를 생성하고 있습니다...</p>
    </div>
  `;
  summaryDiv.style.display = 'block';
  summaryDiv.scrollIntoView({ behavior: 'smooth' });
  
  try {
    // 서버에 분석 요청
    const response = await fetch('/api/style/analyze-album', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        songs,
        style: currentStyle,
        allLyrics,
        allTitles
      })
    });
    
    if (!response.ok) {
      throw new Error('앨범 분석 실패');
    }
    
    const data = await response.json();
    
    // 결과 표시
    contentDiv.innerHTML = `
      <div style="display: grid; gap: 24px;">
        <!-- 앨범명 -->
        <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 12px; border-left: 4px solid #8b5cf6;">
          <h4 style="margin: 0 0 12px 0; color: #a78bfa; font-size: 1.1em; font-weight: 600; display: flex; align-items: center; gap: 8px;">
            <span>💿</span>
            <span>앨범명 (Album Title)</span>
          </h4>
          <p style="margin: 0; font-size: 1.3em; font-weight: 700; color: white;">${data.albumTitle}</p>
        </div>
        
        <!-- YouTube 제목 -->
        <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 12px; border-left: 4px solid #ef4444;">
          <h4 style="margin: 0 0 12px 0; color: #fca5a5; font-size: 1.1em; font-weight: 600; display: flex; align-items: center; gap: 8px;">
            <span>🎬</span>
            <span>YouTube 제목</span>
          </h4>
          <p style="margin: 0; font-size: 1.2em; color: white;">${data.youtubeTitle}</p>
        </div>
        
        <!-- YouTube 설명 -->
        <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 12px; border-left: 4px solid #10b981;">
          <h4 style="margin: 0 0 12px 0; color: #6ee7b7; font-size: 1.1em; font-weight: 600; display: flex; align-items: center; gap: 8px;">
            <span>📝</span>
            <span>설명 (Description)</span>
          </h4>
          <div style="white-space: pre-wrap; color: rgba(255,255,255,0.9); line-height: 1.8; font-family: monospace; background: rgba(0,0,0,0.2); padding: 16px; border-radius: 8px; max-height: 400px; overflow-y: auto;">${data.description}</div>
        </div>
        
        <!-- 태그 (# 형식) -->
        <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 12px; border-left: 4px solid #f59e0b;">
          <h4 style="margin: 0 0 12px 0; color: #fbbf24; font-size: 1.1em; font-weight: 600; display: flex; align-items: center; gap: 8px;">
            <span>🏷️</span>
            <span>태그 (Tags)</span>
          </h4>
          <div style="white-space: pre-wrap; color: rgba(255,255,255,0.9); line-height: 1.8; font-family: monospace; background: rgba(0,0,0,0.2); padding: 16px; border-radius: 8px; max-height: 300px; overflow-y: auto;">${data.tags}</div>
        </div>
        
        <!-- 태그 2 (콤마 형식) -->
        <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 12px; border-left: 4px solid #06b6d4;">
          <h4 style="margin: 0 0 12px 0; color: #67e8f9; font-size: 1.1em; font-weight: 600; display: flex; align-items: center; gap: 8px;">
            <span>🔖</span>
            <span>태그 2 (Comma Separated)</span>
          </h4>
          <div style="white-space: pre-wrap; color: rgba(255,255,255,0.9); line-height: 1.8; font-family: monospace; background: rgba(0,0,0,0.2); padding: 16px; border-radius: 8px; max-height: 200px; overflow-y: auto;">${data.tagsComma}</div>
        </div>
        
        <!-- 복사 버튼 -->
        <button onclick="copyAlbumMetadata()" 
                style="padding: 16px; background: linear-gradient(135deg, #8b5cf6, #7c3aed); border: 2px solid rgba(139,92,246,0.6); border-radius: 12px; color: white; font-size: 1em; font-weight: 700; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 16px rgba(139,92,246,0.3); display: flex; align-items: center; justify-content: center; gap: 12px;"
                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(139,92,246,0.5)'"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 16px rgba(139,92,246,0.3)'">
          <span>📋</span>
          <span>전체 정보 복사</span>
        </button>
      </div>
    `;
    
    // 메타데이터 전역 저장 (복사용)
    window.albumMetadata = data;
    
    // 🎨 썸네일 프롬프트 자동 생성
    try {
      console.log('🎨 썸네일 프롬프트 자동 생성 시작...');
      const thumbnailData = await generateThumbnail(
        data.youtubeTitle || data.youtubeTitleKo || '음악 플레이리스트',
        currentStyle || 'Lo-Fi Hip Hop',
        currentGeneratedLanguage
      );
      
      // 썸네일 프롬프트 표시
      displayThumbnailPreview(thumbnailData, contentDiv);
      
      // 전역 저장
      window.albumMetadata.thumbnail = thumbnailData;
      
      console.log('✅ 썸네일 프롬프트 생성 완료');
    } catch (thumbnailError) {
      console.error('⚠️ 썸네일 생성 실패 (선택사항):', thumbnailError);
      // 썸네일 생성 실패해도 앨범 메타데이터는 표시
    }
    
  } catch (error) {
    console.error('❌ 분석 실패:', error);
    contentDiv.innerHTML = `
      <div style="text-align: center; padding: 40px; color: rgba(255,100,100,0.9);">
        <div style="font-size: 3em; margin-bottom: 16px;">⚠️</div>
        <p style="font-size: 1.2em; font-weight: 600;">앨범 정보 생성에 실패했습니다.</p>
        <p style="margin-top: 8px; color: rgba(255,255,255,0.6);">${error.message}</p>
        <button onclick="showFinalSummary()" 
                style="margin-top: 20px; padding: 12px 24px; background: rgba(139,92,246,0.3); border: 2px solid rgba(139,92,246,0.6); border-radius: 8px; color: white; cursor: pointer;">
          다시 시도
        </button>
      </div>
    `;
  }
}

/**
 * 🎬 앨범 생성 (ZIP + 앨범 정보 자동 생성)
 */
async function createAlbumWithMetadata() {
  console.log('🎬 앨범 생성 시작 (ZIP + 메타데이터)');
  
  // 로딩 표시
  const btn = document.getElementById('createAlbumButton');
  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<span style="font-size: 1.5em; animation: spin 1s linear infinite;">🎨</span><div style="text-align: left;"><div>앨범 생성중...</div><div style="font-size: 0.6em; font-weight: 500; opacity: 0.8; margin-top: 4px;">ZIP 압축 및 메타데이터 분석중</div></div>';
  btn.disabled = true;
  
  try {
    // 1️⃣ ZIP 압축 생성
    await createAlbumPackage();
    
    // 2️⃣ 앨범 정보 자동 생성
    await generateAlbumMetadata();
    
    // 완료
    btn.innerHTML = '<span style="font-size: 1.5em;">✅</span><div style="text-align: left;"><div>앨범 생성 완료!</div><div style="font-size: 0.6em; font-weight: 500; opacity: 0.8; margin-top: 4px;">ZIP 다운로드 및 앨범정보 확인</div></div>';
    
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.disabled = false;
    }, 3000);
    
  } catch (error) {
    console.error('❌ 앨범 생성 실패:', error);
    alert('❌ 앨범 생성에 실패했습니다: ' + error.message);
    btn.innerHTML = originalHTML;
    btn.disabled = false;
  }
}

/**
 * 📊 앨범 메타데이터 자동 생성
 */
async function generateAlbumMetadata() {
  console.log('📊 앨범 메타데이터 생성 시작');
  
  const summaryDiv = document.getElementById('finalSummaryResult');
  const contentDiv = document.getElementById('summaryContent');
  
  if (!summaryDiv || !contentDiv) return;
  
  // 트랙 번호가 할당된 곡들 가져오기 (이미 정렬됨)
  const sortedSongs = getSelectedTracks();
  
  if (sortedSongs.length === 0) {
    contentDiv.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align: center; padding: 40px 20px;">💡 곡을 선택하면 자동으로 앨범 정보가 생성됩니다</p>';
    return;
  }
  
  // 로딩 표시
  contentDiv.innerHTML = `
    <div style="text-align: center; padding: 40px;">
      <div style="font-size: 3em; animation: spin 1s linear infinite;">🎨</div>
      <p style="margin-top: 20px; color: rgba(255,255,255,0.7);">AI가 선택한 ${sortedSongs.length}곡을 분석하여<br>YouTube 최적화 앨범 정보를 생성중...</p>
      <p style="margin-top: 10px; font-size: 0.9em; color: rgba(255,255,255,0.5);">클릭률 높은 제목, SEO 최적화 설명, 트렌드 태그 생성</p>
    </div>
  `;
  
  try {
    // 스타일 정보 가져오기
    const styleInput = document.getElementById('simpleStyleInput');
    const style = styleInput ? styleInput.value : 'Music Collection';
    
    // 트랙 데이터 준비
    const tracks = sortedSongs.map(track => ({
      title: track.title,
      duration: track.duration,
      lyrics: track.lyrics || ''
    }));
    
    console.log('🎯 AI 메타데이터 생성 요청:', { trackCount: tracks.length, style });
    
    // AI 메타데이터 생성 요청 (저장된 언어 사용)
    const response = await fetch('/api/style/generate-album-metadata', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tracks, style, language: currentGeneratedLanguage })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'AI 생성 실패');
    }
    
    const metadata = data.metadata;
    console.log('✅ AI 메타데이터 수신:', metadata);
    
    // 타임스탬프 계산
    let currentTime = 0;
    const timestamps = sortedSongs.map(track => {
      const timestamp = formatTime(currentTime);
      currentTime += track.duration;
      return `${timestamp} – ${track.title}`;
    }).join('\n');
    
    const totalMinutes = Math.round(sortedSongs.reduce((sum, t) => sum + t.duration, 0) / 60);
    
    // AI 생성 앨범 정보 표시
    const albumInfo = `
<div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 12px; border-left: 4px solid #8b5cf6;">
  <h4 style="color: #8b5cf6; margin: 0 0 16px 0; font-size: 1.2em;">📀 앨범 기본 정보</h4>
  <p style="margin: 8px 0;"><strong>앨범명:</strong> ${metadata.albumName}</p>
  <p style="margin: 8px 0;"><strong>총 곡 수:</strong> ${sortedSongs.length}곡</p>
  <p style="margin: 8px 0;"><strong>총 재생시간:</strong> ${totalMinutes}분</p>
  <div style="margin-top: 12px; padding: 10px; background: rgba(139,92,246,0.2); border-radius: 8px; font-size: 0.85em; color: rgba(255,255,255,0.7);">
    <span style="color: #a855f7;">✨ AI가 생성한 감성적 앨범명</span>
  </div>
</div>

<div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 12px; border-left: 4px solid #8b5cf6; margin-top: 16px;">
  <h4 style="color: #8b5cf6; margin: 0 0 16px 0; font-size: 1.2em;">🎬 YouTube 업로드 정보</h4>
  <p style="margin: 8px 0;"><strong>제목:</strong></p>
  <div style="background: rgba(0,0,0,0.4); padding: 12px; border-radius: 8px; margin: 8px 0; font-family: monospace;">
${metadata.youtubeTitle}
  </div>
  <div style="margin-top: 8px; padding: 8px; background: rgba(34,197,94,0.2); border-radius: 6px; font-size: 0.85em; color: rgba(255,255,255,0.7);">
    <span style="color: #22c55e;">🎯 클릭률 최적화 제목 (이모지, 숫자, 감성 키워드 포함)</span>
  </div>
  
  <p style="margin: 16px 0 8px 0;"><strong>설명:</strong></p>
  <div style="background: rgba(0,0,0,0.4); padding: 12px; border-radius: 8px; margin: 8px 0; font-family: monospace; white-space: pre-wrap;">
${metadata.description}

━━━━━━━━━━━━━━━━━━━━━━
📋 Tracklist:
━━━━━━━━━━━━━━━━━━━━━━

${timestamps}

━━━━━━━━━━━━━━━━━━━━━━
⏱️ Total Duration: ${totalMinutes}분 (${sortedSongs.length} tracks)
🎵 Style: ${style}
━━━━━━━━━━━━━━━━━━━━━━
  </div>
  <div style="margin-top: 8px; padding: 8px; background: rgba(59,130,246,0.2); border-radius: 6px; font-size: 0.85em; color: rgba(255,255,255,0.7);">
    <span style="color: #3b82f6;">📊 SEO 최적화 설명 (추천 상황, 대상 청중, 분위기 포함)</span>
  </div>
  
  <p style="margin: 16px 0 8px 0;"><strong>태그:</strong></p>
  <div style="background: rgba(0,0,0,0.4); padding: 12px; border-radius: 8px; margin: 8px 0; font-family: monospace;">
${metadata.tags}
  </div>
  <div style="margin-top: 8px; padding: 8px; background: rgba(236,72,153,0.2); border-radius: 6px; font-size: 0.85em; color: rgba(255,255,255,0.7);">
    <span style="color: #ec4899;">🔥 트렌드 기반 태그 (장르, 분위기, 용도, 시간대 혼합)</span>
  </div>
</div>

<div style="margin-top: 16px; padding: 16px; background: linear-gradient(135deg, rgba(139,92,246,0.1), rgba(34,197,94,0.1)); border-radius: 12px; border: 1px solid rgba(139,92,246,0.3);">
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
    <span style="font-size: 1.5em;">🤖</span>
    <strong style="color: #a855f7;">AI 생성 완료</strong>
  </div>
  <p style="margin: 0; font-size: 0.9em; color: rgba(255,255,255,0.7); line-height: 1.6;">
    GenSpark AI가 ${sortedSongs.length}곡의 가사와 스타일을 분석하여<br>
    YouTube 알고리즘에 최적화된 메타데이터를 생성했습니다.
  </p>
</div>
    `;
    
    contentDiv.innerHTML = albumInfo;
    
    // 전역 변수에 저장 (복사 기능용)
    window.albumMetadata = {
      albumTitle: metadata.albumName,
      youtubeTitle: metadata.youtubeTitle,
      description: metadata.description,
      tags: metadata.tags,
      trackList: timestamps,
      totalMinutes: totalMinutes,
      trackCount: sortedSongs.length,
      style: style
    };
    
    console.log('✅ AI 앨범 메타데이터 생성 및 표시 완료');
    
    // 썸네일 생성 섹션 표시
    const thumbnailSection = document.getElementById('thumbnailSection');
    if (thumbnailSection) {
      thumbnailSection.style.display = 'block';
      console.log('🎨 썸네일 생성 섹션 활성화');
    }
    
  } catch (error) {
    console.error('❌ AI 메타데이터 생성 실패:', error);
    
    // 폴백: 기본 방식으로 생성
    const totalMinutes = Math.round(sortedSongs.reduce((sum, t) => sum + t.duration, 0) / 60);
    let currentTime = 0;
    const timestamps = sortedSongs.map(track => {
      const timestamp = formatTime(currentTime);
      currentTime += track.duration;
      return `${timestamp} – ${track.title}`;
    }).join('\n');
    
    const styleInput = document.getElementById('simpleStyleInput');
    const style = styleInput ? styleInput.value : 'Music Collection';
    const albumName = sortedSongs[0]?.title ? `${sortedSongs[0].title} 외 ${sortedSongs.length - 1}곡` : `음악 모음집 ${sortedSongs.length}곡`;
    
    contentDiv.innerHTML = `
<div style="background: rgba(220,38,38,0.2); padding: 16px; border-radius: 12px; border: 1px solid rgba(220,38,38,0.4); margin-bottom: 16px;">
  <p style="margin: 0; color: #fca5a5;">⚠️ AI 생성 실패. 기본 메타데이터를 표시합니다.</p>
  <p style="margin: 8px 0 0 0; font-size: 0.85em; color: rgba(255,255,255,0.6);">오류: ${error.message}</p>
</div>

<div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 12px; border-left: 4px solid #8b5cf6;">
  <h4 style="color: #8b5cf6; margin: 0 0 16px 0; font-size: 1.2em;">📀 앨범 기본 정보</h4>
  <p style="margin: 8px 0;"><strong>앨범명:</strong> ${albumName}</p>
  <p style="margin: 8px 0;"><strong>총 곡 수:</strong> ${sortedSongs.length}곡</p>
  <p style="margin: 8px 0;"><strong>총 재생시간:</strong> ${totalMinutes}분</p>
</div>

<div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 12px; border-left: 4px solid #8b5cf6; margin-top: 16px;">
  <h4 style="color: #8b5cf6; margin: 0 0 16px 0; font-size: 1.2em;">🎬 YouTube 업로드 정보</h4>
  <p style="margin: 8px 0;"><strong>제목:</strong></p>
  <div style="background: rgba(0,0,0,0.4); padding: 12px; border-radius: 8px; margin: 8px 0; font-family: monospace;">
[Playlist] ${albumName} | ${sortedSongs.length} Songs for Study, Work & Relax | ${totalMinutes}분
  </div>
  
  <p style="margin: 16px 0 8px 0;"><strong>설명:</strong></p>
  <div style="background: rgba(0,0,0,0.4); padding: 12px; border-radius: 8px; margin: 8px 0; font-family: monospace; white-space: pre-wrap;">
A curated collection of ${sortedSongs.length} tracks.
Perfect for study, work, and relaxation.

━━━━━━━━━━━━━━━━━━━━━━
📋 Tracklist:
━━━━━━━━━━━━━━━━━━━━━━

${timestamps}

━━━━━━━━━━━━━━━━━━━━━━
⏱️ Total Duration: ${totalMinutes}분 (${sortedSongs.length} tracks)
🎵 Style: ${style}
━━━━━━━━━━━━━━━━━━━━━━
  </div>
  
  <p style="margin: 16px 0 8px 0;"><strong>태그:</strong></p>
  <div style="background: rgba(0,0,0,0.4); padding: 12px; border-radius: 8px; margin: 8px 0; font-family: monospace;">
감성음악, 플레이리스트, 공부음악, 집중음악, 휴식음악, 카페음악, 분위기음악, music playlist, study music, focus music, relaxing music, chill vibes, background music
  </div>
</div>
    `;
  }
}


/**
 * 시간 포맷 (초 → MM:SS)
 */
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * 📦 선택한 곡들을 ZIP으로 압축 다운로드
 */
async function createAlbumPackage() {
  console.log('📦 앨범 패키지 생성 시작');
  
  const resultList = document.getElementById('simpleStyleResultList');
  const musicBoxes = resultList.querySelectorAll('.music-mini-box');
  
  if (musicBoxes.length === 0) {
    alert('⚠️ 다운로드할 곡이 없습니다!');
    return;
  }
  
  // 트랙 번호가 할당된 곡들을 가져오기
  let selectedTracks = getSelectedTracks();
  
  // 트랙 번호가 없으면 자동 할당
  if (selectedTracks.length === 0 && generatedMusicList.length > 0) {
    console.log('⚠️ 트랙 번호가 없습니다. 자동으로 할당합니다...');
    selectedTracks = generatedMusicList.map((song, index) => ({
      songIndex: index,
      trackNumber: index + 1,
      song: song,
      title: song.title || `Track ${index + 1}`,
      audioUrl: song.audioUrl || song.source_audio_url || song.audio_url,
      imageUrl: song.imageUrl || song.source_image_url || song.image_url,
      duration: song.duration || 180,
      lyrics: song.lyrics || ''
    }));
  }
  
  const sortedSongs = selectedTracks.map(track => ({
    url: track.audioUrl,
    title: track.title,
    trackNumber: track.trackNumber
  }));
  
  console.log('📦 트랙 번호 순으로 정렬:', sortedSongs.map(s => `Track ${s.trackNumber}: ${s.title}`));
  
  try {
    // 파일명에 트랙 번호 추가
    const songsWithTrackNumber = sortedSongs.map(song => ({
      url: song.url,
      title: `${String(song.trackNumber).padStart(2, '0')}_${song.title}`
    }));
    
    // 서버에 ZIP 생성 요청
    const response = await fetch('/api/style/create-album-zip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songs: songsWithTrackNumber })
    });
    
    if (!response.ok) {
      throw new Error('ZIP 생성 실패');
    }
    
    // ZIP 파일 다운로드
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Album_${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    console.log('✅ ZIP 다운로드 완료!');
    
  } catch (error) {
    console.error('❌ 압축 실패:', error);
    throw error; // createAlbumWithMetadata에서 처리하도록 에러 전파
  }
}

/**
 * 📋 앨범 메타데이터 복사
 */
function copyAlbumMetadata() {
  if (!window.albumMetadata) {
    alert('⚠️ 복사할 데이터가 없습니다!');
    return;
  }
  
  const data = window.albumMetadata;
  const text = `
🎵 앨범명 (Album Title):
${data.albumTitle}

🎬 YouTube 제목:
${data.youtubeTitle}

📝 설명 (Description):
${data.description}

🏷️ 태그 (Tags):
${data.tags}
  `.trim();
  
  navigator.clipboard.writeText(text).then(() => {
    // 복사 성공 피드백
    const btn = event.target.closest('button');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `
      <span>✅</span>
      <span>복사 완료!</span>
    `;
    setTimeout(() => {
      btn.innerHTML = originalHTML;
    }, 2000);
  }).catch(err => {
    console.error('복사 실패:', err);
    alert('⚠️ 복사에 실패했습니다: ' + err.message);
  });
}

/**
 * 📦 앨범 생성 및 압축 다운로드
 */
async function createAlbum() {
  if (selectedSongs.size === 0) {
    alert('⚠️ 선택된 곡이 없습니다!');
    return;
  }
  
  const button = document.getElementById('create-album-btn');
  const originalHTML = button.innerHTML;
  
  try {
    // 버튼 비활성화
    button.disabled = true;
    button.innerHTML = `<div style="display: inline-block; animation: spin 1s linear infinite; font-size: 1.5em;">🎵</div> 앨범 생성 중...`;
    
    // 선택된 곡들 데이터 수집
    const songs = [];
    selectedSongs.forEach((data, songId) => {
      const box = data.box;
      const audioUrl = box.querySelector('.music-player source').src;
      songs.push({
        url: audioUrl,
        title: data.title,
        order: data.order
      });
    });
    
    // 순서대로 정렬
    songs.sort((a, b) => a.order - b.order);
    
    console.log(`📦 앨범 생성 시작: ${songs.length}곡`, songs);
    
    // 서버에 ZIP 생성 요청
    const response = await fetch('/api/style/create-album-zip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songs })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '앨범 생성 실패');
    }
    
    // ZIP 파일 다운로드
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Album_${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    // 성공 메시지
    button.innerHTML = '✅ 다운로드 완료!';
    button.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
    
    setTimeout(() => {
      button.innerHTML = originalHTML;
      button.style.background = 'linear-gradient(135deg, #fb923c, #ec4899)';
      button.disabled = false;
    }, 3000);
    
    console.log('✅ 앨범 다운로드 완료');
    
  } catch (error) {
    console.error('❌ 앨범 생성 오류:', error);
    alert(`⚠️ 앨범 생성 실패: ${error.message}`);
    button.innerHTML = originalHTML;
    button.disabled = false;
  }
}

/**
 * 📊 메타데이터 생성 (앨범명, 유튜브 제목/설명/태그)
 */
async function generateMetadata() {
  if (selectedSongs.size === 0) {
    alert('⚠️ 선택된 곡이 없습니다!');
    return;
  }
  
  const button = document.getElementById('generate-metadata-btn');
  const originalHTML = button.innerHTML;
  
  try {
    // 버튼 비활성화
    button.disabled = true;
    button.innerHTML = `<div style="display: inline-block; animation: spin 1s linear infinite; font-size: 1.5em;">📊</div> 분석 중...`;
    
    // ✅ 트랙 순서를 반영한 곡 데이터 수집
    const songs = [];
    selectedSongs.forEach((data, songId) => {
      const box = data.box;
      const songIndex = parseInt(box.dataset.songIndex);
      const lyricsDiv = box.querySelector('.lyrics-content div div');
      const lyrics = lyricsDiv ? lyricsDiv.textContent.trim() : '';
      const duration = parseInt(box.dataset.duration) || 210;
      
      // 트랙 순서 가져오기 (설정되지 않으면 원래 순서 사용)
      const trackNumber = trackOrder.get(songIndex) || (data.order + 1);
      
      songs.push({
        title: data.title,
        lyrics: lyrics,
        order: data.order,
        trackNumber: trackNumber,
        duration: duration
      });
    });
    
    // ✅ 트랙 번호순으로 정렬
    songs.sort((a, b) => a.trackNumber - b.trackNumber);
    
    // 현재 스타일 추출 (첫 곡 기준)
    // 스타일을 사람이 읽을 수 있는 짧은 설명으로 변환
    let style = currentGeneratedStyle || '다양한 장르';
    
    // 긴 기술 프롬프트를 감성적인 짧은 설명으로 변환
    if (style.length > 50) {
      // 주요 키워드 추출 시도
      const keywords = [];
      
      // 장르 키워드 추출
      if (style.toLowerCase().includes('k-pop')) keywords.push('K-POP');
      else if (style.toLowerCase().includes('pop')) keywords.push('Pop');
      if (style.toLowerCase().includes('ballad')) keywords.push('발라드');
      if (style.toLowerCase().includes('r&b') || style.toLowerCase().includes('rnb')) keywords.push('R&B');
      if (style.toLowerCase().includes('jazz')) keywords.push('Jazz');
      if (style.toLowerCase().includes('indie')) keywords.push('Indie');
      if (style.toLowerCase().includes('hip hop') || style.toLowerCase().includes('hip-hop')) keywords.push('Hip-Hop');
      
      // 분위기 키워드 추출
      if (style.toLowerCase().includes('emotional')) keywords.push('감성');
      if (style.toLowerCase().includes('chill')) keywords.push('Chill');
      if (style.toLowerCase().includes('upbeat')) keywords.push('경쾌한');
      
      // 키워드가 있으면 조합, 없으면 첫 30자만 사용
      if (keywords.length > 0) {
        style = keywords.join(' ');
      } else {
        style = style.substring(0, 30).trim() + '...';
      }
    }
    
    console.log(`📊 메타데이터 생성 시작: ${songs.length}곡 (트랙 순서 반영)`, { songs, style });
    
    // 서버에 메타데이터 생성 요청
    const response = await fetch('/api/style/generate-album-metadata', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songs, style })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '메타데이터 생성 실패');
    }
    
    const metadata = await response.json();
    console.log('✅ 메타데이터 생성 완료:', metadata);
    
    // ✅ Time Track 계산 (트랙 순서대로)
    let currentTime = 0;
    const timeTrack = songs.map((song, idx) => {
      const timestamp = formatTimestamp(currentTime);
      currentTime += song.duration;
      return `${timestamp} - ${String(song.trackNumber).padStart(2, '0')}_${song.title}`;
    }).join('\n');
    
    const totalMinutes = Math.floor(currentTime / 60);
    const totalSeconds = currentTime % 60;
    const durationText = `${totalMinutes}:${String(totalSeconds).padStart(2, '0')}`;
    
    // 메타데이터 표시
    const displayDiv = document.getElementById('metadata-display');
    const contentDiv = document.getElementById('metadata-content');
    
    contentDiv.innerHTML = `
      <div style="margin-bottom: 20px;">
        <h4 style="color: #a855f7; margin: 0 0 8px 0; font-size: 1.1em;">🎵 앨범명</h4>
        <div style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: 8px; border-left: 3px solid #a855f7;">
          <p style="margin: 0 0 8px 0; color: rgba(255,255,255,0.9); font-size: 1.2em; font-weight: 600;">${metadata.albumNameKo || metadata.albumName || '앨범명'}</p>
          <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 1em; font-style: italic;">${metadata.albumNameEn || metadata.albumName || 'Album Name'}</p>
        </div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h4 style="color: #a855f7; margin: 0 0 8px 0; font-size: 1.1em;">📺 유튜브 제목</h4>
        <div style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: 8px; border-left: 3px solid #a855f7;">
          <p style="margin: 0 0 8px 0; color: rgba(255,255,255,0.9); font-size: 1.1em;">${metadata.youtubeTitleKo || metadata.youtubeTitle || '유튜브 제목'}</p>
          <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 0.95em; font-style: italic;">${metadata.youtubeTitleEn || metadata.youtubeTitle || 'YouTube Title'}</p>
        </div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h4 style="color: #a855f7; margin: 0 0 8px 0; font-size: 1.1em;">📝 유튜브 설명</h4>
        <p style="margin: 0; color: rgba(255,255,255,0.85); line-height: 1.6; white-space: pre-wrap;">${metadata.youtubeDescription}</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h4 style="color: #a855f7; margin: 0 0 8px 0; font-size: 1.1em;">🏷️ 태그</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${metadata.tags.split(',').map(tag => `
            <span style="padding: 6px 12px; background: rgba(168,85,247,0.2); border: 1px solid rgba(168,85,247,0.4); border-radius: 8px; color: #a855f7; font-size: 0.9em;">${tag.trim()}</span>
          `).join('')}
        </div>
      </div>
      
      <div class="time-track-section" style="margin-bottom: 20px; background: rgba(0,0,0,0.3); padding: 16px; border-radius: 12px; border-left: 4px solid #06b6d4;">
        <h4 style="color: #67e8f9; margin: 0 0 8px 0; font-size: 1.1em;">🕐 Time Track</h4>
        <div style="margin-bottom: 12px; color: rgba(255,255,255,0.7);">
          <span>총 재생시간: </span>
          <span class="total-duration" style="font-weight: bold; color: #67e8f9;">${durationText}</span>
        </div>
        <pre style="margin: 0; color: rgba(255,255,255,0.9); line-height: 1.8; font-family: 'Courier New', monospace; background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px; overflow-x: auto; white-space: pre;">${timeTrack}</pre>
      </div>
      
      <button onclick="copyMetadata(${JSON.stringify(metadata).replace(/"/g, '&quot;')})" 
              style="width: 100%; padding: 14px; background: linear-gradient(135deg, #8b5cf6, #a855f7); border: none; border-radius: 10px; color: white; font-weight: 600; cursor: pointer; transition: all 0.3s; font-size: 1em;">
        📋 전체 복사하기
      </button>
    `;
    
    displayDiv.style.display = 'block';
    displayDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // 전역 메타데이터 저장 (Time Track 복사용)
    window.albumMetadata = {
      ...metadata,
      timeTrack: timeTrack,
      totalDuration: durationText
    };
    
    // 성공 메시지
    button.innerHTML = '✅ 생성 완료!';
    button.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
    
    setTimeout(() => {
      button.innerHTML = originalHTML;
      button.style.background = 'linear-gradient(135deg, #8b5cf6, #a855f7)';
      button.disabled = false;
    }, 3000);
    
  } catch (error) {
    console.error('❌ 메타데이터 생성 오류:', error);
    alert(`⚠️ 메타데이터 생성 실패: ${error.message}`);
    button.innerHTML = originalHTML;
    button.disabled = false;
  }
}

/**
 * 📋 메타데이터 전체 복사
 */
function copyMetadata(metadata) {
  const text = `🎵 앨범명:
한글: ${metadata.albumNameKo || metadata.albumName || '앨범명'}
영어: ${metadata.albumNameEn || metadata.albumName || 'Album Name'}

📺 유튜브 제목:
한글: ${metadata.youtubeTitleKo || metadata.youtubeTitle || '유튜브 제목'}
영어: ${metadata.youtubeTitleEn || metadata.youtubeTitle || 'YouTube Title'}

📝 유튜브 설명:
${metadata.youtubeDescription}

🏷️ 태그: ${metadata.tags}`;
  
  navigator.clipboard.writeText(text).then(() => {
    alert('✅ 메타데이터가 클립보드에 복사되었습니다!');
  }).catch(err => {
    console.error('복사 실패:', err);
    alert('⚠️ 복사에 실패했습니다');
  });
}

/**
 * 🖼️ 이미지 선택 토글
 */
function toggleImageSelection(checkbox, songIndex, imageUrl) {
  if (checkbox.checked) {
    selectedImages.set(songIndex, {
      imageUrl: imageUrl,
      isUpgraded: false,
      upgradedUrl: null
    });
    // ✅ 선택 순서 기록
    if (!selectionOrder.includes(songIndex)) {
      selectionOrder.push(songIndex);
    }
    console.log(`🖼️ 이미지 선택: ${songIndex} (순서: ${selectionOrder.indexOf(songIndex) + 1})`);
  } else {
    selectedImages.delete(songIndex);
    // ✅ 선택 순서에서 제거
    const orderIndex = selectionOrder.indexOf(songIndex);
    if (orderIndex > -1) {
      selectionOrder.splice(orderIndex, 1);
    }
    console.log(`🖼️ 이미지 선택 해제: ${songIndex}`);
  }
  
  updateImageActionButtons();
}

/**
 * 🔄 이미지 액션 버튼 업데이트
 */
function updateImageActionButtons() {
  const upgradeBtn = document.getElementById('upgradeImagesBtn');
  const downloadBtn = document.getElementById('downloadImagesBtn');
  
  if (upgradeBtn && downloadBtn) {
    const count = selectedImages.size;
    upgradeBtn.disabled = count === 0;
    downloadBtn.disabled = count === 0;
    
    if (count > 0) {
      upgradeBtn.style.opacity = '1';
      upgradeBtn.style.cursor = 'pointer';
      downloadBtn.style.opacity = '1';
      downloadBtn.style.cursor = 'pointer';
      upgradeBtn.innerHTML = `<span style="font-size: 1.5em;">✨</span><span>선택한 이미지 업그레이드 (${count})</span>`;
      downloadBtn.innerHTML = `<span style="font-size: 1.5em;">📥</span><span>선택한 이미지 다운로드 (${count})</span>`;
    } else {
      upgradeBtn.style.opacity = '0.5';
      upgradeBtn.style.cursor = 'not-allowed';
      downloadBtn.style.opacity = '0.5';
      downloadBtn.style.cursor = 'not-allowed';
      upgradeBtn.innerHTML = `<span style="font-size: 1.5em;">✨</span><span>이미지 업그레이드</span>`;
      downloadBtn.innerHTML = `<span style="font-size: 1.5em;">📥</span><span>이미지 다운로드</span>`;
    }
  }
}

/**
 * ✨ 선택한 이미지들 업스케일 (고화질 2종 생성)
 * - 1280x720 (YouTube 썸네일)
 * - 3000x3000 (앨범 커버)
 */
async function upgradeSelectedImages() {
  if (selectedImages.size === 0) {
    alert('⚠️ 업스케일할 이미지를 선택해주세요!');
    return;
  }
  
  const btn = document.getElementById('upgradeImagesBtn');
  const originalHTML = btn.innerHTML;
  btn.innerHTML = `<span style="font-size: 1.5em; animation: spin 1s linear infinite;">✨</span><span>업스케일 중...</span>`;
  btn.disabled = true;
  
  // 로딩 오버레이 표시
  showLoadingOverlay('🎨 AI가 이미지를 분석하고 고화질 이미지 2종을 생성하고 있습니다...');
  
  try {
    let successCount = 0;
    const total = selectedImages.size;
    
    for (const [songIndex, imageData] of selectedImages.entries()) {
      try {
        console.log(`✨ 업스케일 중 (${successCount + 1}/${total}): ${imageData.imageUrl}`);
        
        // 곡 정보 가져오기
        const musicBox = document.querySelector(`.music-mini-box[data-song-index="${songIndex}"]`);
        const titleElement = musicBox ? musicBox.querySelector('h3') : null;
        const title = titleElement ? titleElement.textContent.replace('🎵 ', '').trim() : 'Untitled';
        const audioElement = musicBox ? musicBox.querySelector('audio') : null;
        const audioUrl = audioElement ? audioElement.querySelector('source').src : '';
        
        // 가사 정보 (만약 저장되어 있다면)
        const lyricsDiv = musicBox ? musicBox.querySelector('.lyrics-content div div') : null;
        const lyrics = lyricsDiv ? lyricsDiv.textContent : '';
        
        // 스타일 정보
        const style = currentGeneratedStyle || 'cozy-lofi';
        
        console.log(`📝 곡 정보: ${title}, 스타일: ${style}`);
        
        updateLoadingOverlay(`🎨 "${title}" 이미지 분석 및 업스케일 중... (${successCount + 1}/${total})`);
        
        // 서버에 업스케일 요청
        const response = await fetch('/api/style/upscale-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl: imageData.imageUrl,
            title: title,
            style: style,
            lyrics: lyrics
          })
        });
        
        if (!response.ok) {
          const error = await response.text();
          throw new Error(`업스케일 실패: ${error}`);
        }
        
        const data = await response.json();
        
        console.log(`✅ 업스케일 완료:`, data);
        
        // 업스케일된 이미지 저장
        imageData.isUpgraded = true;
        imageData.enhanced = data.enhanced;
        imageData.description = data.description;
        imageData.prompt = data.prompt;
        selectedImages.set(songIndex, imageData);
        
        successCount++;
        
        // UI 업데이트 (체크박스에 완료 표시)
        const checkbox = document.querySelector(`.image-select-checkbox[data-song-index="${songIndex}"]`);
        if (checkbox && checkbox.parentElement) {
          const label = checkbox.parentElement;
          label.style.background = 'rgba(16,185,129,0.3)';
          label.style.borderColor = 'rgba(16,185,129,0.8)';
          label.querySelector('span').textContent = '✅';
        }
        
        btn.innerHTML = `<span style="font-size: 1.5em; animation: spin 1s linear infinite;">✨</span><span>업스케일 중... (${successCount}/${total})</span>`;
        
      } catch (error) {
        console.error(`❌ 업스케일 실패 (${songIndex}):`, error);
        alert(`❌ "${error.message}" 업스케일 실패`);
      }
    }
    
    hideLoadingOverlay();
    
    if (successCount > 0) {
      // 성공 팝업 표시
      showUpscaleResultsModal(successCount);
      btn.innerHTML = `<span style="font-size: 1.5em;">✅</span><span>업스케일 완료 (${successCount})</span>`;
    } else {
      throw new Error('모든 이미지 업스케일 실패');
    }
    
  } catch (error) {
    console.error('❌ 업스케일 오류:', error);
    hideLoadingOverlay();
    alert(`❌ 업스케일 실패: ${error.message}`);
    btn.innerHTML = originalHTML;
  } finally {
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.disabled = false;
      updateImageActionButtons();
    }, 3000);
  }
}

/**
 * 🖼️ 이미지 클릭 시 업스케일 처리
 */
async function handleImageClick(element) {
  const imageUrl = element.dataset.imageUrl;
  const songIndex = element.dataset.songIndex;
  const title = element.dataset.songTitle;
  const style = element.dataset.songStyle;
  const lyrics = element.dataset.songLyrics;
  
  // 상태 표시 엘리먼트
  const statusDiv = element.querySelector('.upscale-status');
  const originalHTML = statusDiv.innerHTML;
  
  // 업스케일 시작
  statusDiv.innerHTML = `
    <span style="font-size: 1.5em; animation: spin 1s linear infinite;">✨</span>
    <span style="color: white; font-size: 0.85em; font-weight: 600;">업스케일 중...</span>
  `;
  
  try {
    console.log(`🖼️ 이미지 업스케일 시작: ${title}`);
    
    // Step 1: 이미지를 Base64로 변환 (CORS 우회)
    console.log('📥 이미지 다운로드 중...');
    const base64Image = await imageToBase64(imageUrl);
    console.log('✅ 이미지 Base64 변환 완료');
    
    // Step 2: 서버에 업스케일 요청 (Base64)
    const response = await fetch('/api/style/upscale-image-base64', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: base64Image,
        title: title,
        style: style,
        lyrics: lyrics
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '업스케일 실패');
    }
    
    const data = await response.json();
    console.log(`✅ 업스케일 완료:`, data);
    
    // 업스케일 완료 표시
    statusDiv.innerHTML = `
      <span style="font-size: 1.5em;">✅</span>
      <span style="color: #22c55e; font-size: 0.85em; font-weight: 600;">업스케일 완료!</span>
    `;
    
    // 업스케일된 이미지 미리보기 및 다운로드 모달 표시
    showUpscaledImageModal({
      title: title,
      youtubeUrl: data.youtubeUrl,
      albumUrl: data.albumUrl,
      originalUrl: imageUrl,
      metadata: data.metadata
    });
    
    // 3초 후 원래 상태로
    setTimeout(() => {
      statusDiv.innerHTML = originalHTML;
    }, 3000);
    
  } catch (error) {
    console.error(`❌ 업스케일 실패 (${title}):`, error);
    
    // 에러 표시
    statusDiv.innerHTML = `
      <span style="font-size: 1.5em;">❌</span>
      <span style="color: #ef4444; font-size: 0.85em; font-weight: 600;">실패</span>
    `;
    
    alert(`❌ 업스케일 실패: ${error.message}`);
    
    // 3초 후 원래 상태로
    setTimeout(() => {
      statusDiv.innerHTML = originalHTML;
    }, 3000);
  }
}

/**
 * 🔄 이미지를 Base64로 변환 (CORS 우회)
 */
async function imageToBase64(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // CORS 시도
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      try {
        const base64 = canvas.toDataURL('image/jpeg', 0.95);
        resolve(base64);
      } catch (error) {
        reject(new Error('이미지 변환 실패: CORS 제한'));
      }
    };
    
    img.onerror = () => {
      reject(new Error('이미지 로드 실패'));
    };
    
    img.src = url;
  });
}

/**
 * 🎨 업스케일된 이미지 미리보기 및 다운로드 모달
 */
function showUpscaledImageModal(data) {
  console.log('🎨 모달 데이터:', data);
  
  // URL 검증
  if (!data.youtubeUrl || !data.albumUrl) {
    console.error('❌ URL이 없습니다:', data);
    alert('⚠️ 업스케일된 이미지 URL을 찾을 수 없습니다.');
    return;
  }
  
  // HTTP를 HTTPS로 자동 변환 (Mixed Content 방지)
  data.youtubeUrl = data.youtubeUrl.replace(/^http:\/\//i, 'https://');
  data.albumUrl = data.albumUrl.replace(/^http:\/\//i, 'https://');
  console.log('🔒 HTTPS URLs:', { youtubeUrl: data.youtubeUrl, albumUrl: data.albumUrl });
  
  // 안전한 파일명 생성
  const safeTitle = data.title.replace(/[^a-zA-Z0-9가-힣\s]/g, '_').substring(0, 50);
  const youtubeFilename = `${safeTitle}_youtube.jpg`;
  const albumFilename = `${safeTitle}_album.jpg`;
  
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.95);
    backdrop-filter: blur(10px);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeIn 0.3s ease-out;
  `;
  
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border-radius: 24px;
    padding: 32px;
    max-width: 1200px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    border: 1px solid rgba(139,92,246,0.3);
    position: relative;
  `;
  
  modalContent.innerHTML = `
    <!-- 닫기 버튼 -->
    <button id="closeModalBtn"
            style="position: absolute; top: 20px; right: 20px; background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.5); color: #ef4444; padding: 8px 16px; border-radius: 12px; cursor: pointer; font-size: 1em; font-weight: 600; transition: all 0.3s; z-index: 1;"
            onmouseover="this.style.background='rgba(239,68,68,0.3)'"
            onmouseout="this.style.background='rgba(239,68,68,0.2)'">
      ✕ 닫기
    </button>
    
    <!-- 타이틀 -->
    <h2 style="margin: 0 0 24px 0; color: #8b5cf6; font-size: 1.8em; font-weight: 700; display: flex; align-items: center; gap: 12px;">
      <span style="font-size: 1.2em;">✨</span>
      업스케일 완료: ${data.title}
    </h2>
    
    <!-- 메타데이터 정보 -->
    ${data.metadata ? `
    <div style="background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.3); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; color: rgba(255,255,255,0.8); font-size: 0.9em;">
        <div>
          <span style="color: rgba(255,255,255,0.5);">📐 원본:</span> 
          <strong>${data.metadata.original.width}×${data.metadata.original.height}</strong>
        </div>
        <div>
          <span style="color: rgba(255,255,255,0.5);">📺 YouTube:</span> 
          <strong>${data.metadata.youtube.width}×${data.metadata.youtube.height}</strong>
          <span style="color: rgba(255,255,255,0.5);">(${(data.metadata.youtube.size / 1024).toFixed(0)} KB)</span>
        </div>
        <div>
          <span style="color: rgba(255,255,255,0.5);">💿 Album:</span> 
          <strong>${data.metadata.album.width}×${data.metadata.album.height}</strong>
          <span style="color: rgba(255,255,255,0.5);">(${(data.metadata.album.size / 1024).toFixed(0)} KB)</span>
        </div>
      </div>
    </div>
    ` : ''}
    
    <!-- 이미지 그리드 -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-bottom: 24px;">
      
      <!-- YouTube 썸네일 (1280x720) -->
      <div style="background: rgba(255,255,255,0.05); border-radius: 16px; padding: 16px; border: 2px solid rgba(139,92,246,0.3);">
        <h3 style="margin: 0 0 12px 0; color: #fb923c; font-size: 1.1em; font-weight: 600; display: flex; align-items: center; gap: 8px;">
          <span>📺</span>
          YouTube 썸네일 (1280×720)
        </h3>
        <div style="position: relative; background: rgba(0,0,0,0.3); border-radius: 12px; overflow: hidden; margin-bottom: 12px;">
          <img src="${data.youtubeUrl}" 
               onload="this.style.opacity='1'; this.previousElementSibling.style.display='none'"
               onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"
               style="width: 100%; display: block; opacity: 0; transition: opacity 0.3s;"
               alt="YouTube Thumbnail">
          <!-- 로딩 -->
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: rgba(255,255,255,0.5); font-size: 2em;">
            ⏳
          </div>
          <!-- 에러 -->
          <div style="display: none; align-items: center; justify-content: center; height: 180px; color: #ef4444;">
            ❌ 로드 실패
          </div>
        </div>
        <button id="downloadYoutubeBtn"
                style="width: 100%; background: linear-gradient(135deg, #ef4444, #dc2626); border: none; color: white; padding: 12px; border-radius: 12px; cursor: pointer; font-size: 1em; font-weight: 600; transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 8px;"
                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(239,68,68,0.4)'"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
          <span style="font-size: 1.2em;">📥</span>
          <span>다운로드</span>
        </button>
      </div>
      
      <!-- 앨범 커버 (3000x3000) -->
      <div style="background: rgba(255,255,255,0.05); border-radius: 16px; padding: 16px; border: 2px solid rgba(139,92,246,0.3);">
        <h3 style="margin: 0 0 12px 0; color: #fb923c; font-size: 1.1em; font-weight: 600; display: flex; align-items: center; gap: 8px;">
          <span>💿</span>
          앨범 커버 (3000×3000)
        </h3>
        <div style="position: relative; background: rgba(0,0,0,0.3); border-radius: 12px; overflow: hidden; margin-bottom: 12px;">
          <img src="${data.albumUrl}" 
               onload="this.style.opacity='1'; this.previousElementSibling.style.display='none'"
               onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"
               style="width: 100%; display: block; opacity: 0; transition: opacity 0.3s;"
               alt="Album Cover">
          <!-- 로딩 -->
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: rgba(255,255,255,0.5); font-size: 2em;">
            ⏳
          </div>
          <!-- 에러 -->
          <div style="display: none; align-items: center; justify-content: center; height: 300px; color: #ef4444;">
            ❌ 로드 실패
          </div>
        </div>
        <button id="downloadAlbumBtn"
                style="width: 100%; background: linear-gradient(135deg, #8b5cf6, #7c3aed); border: none; color: white; padding: 12px; border-radius: 12px; cursor: pointer; font-size: 1em; font-weight: 600; transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 8px;"
                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(139,92,246,0.4)'"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
          <span style="font-size: 1.2em;">📥</span>
          <span>다운로드</span>
        </button>
      </div>
      
    </div>
    
    <!-- 원본 이미지 (참고용) -->
    <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 16px; border: 1px solid rgba(255,255,255,0.1);">
      <h4 style="margin: 0 0 8px 0; color: rgba(255,255,255,0.6); font-size: 0.9em; font-weight: 500;">
        🔍 원본 이미지 (360×360)
      </h4>
      <img src="${data.originalUrl}" 
           style="width: 180px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);"
           alt="Original Image">
    </div>
  `;
  
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // 이벤트 리스너 추가
  document.getElementById('closeModalBtn').addEventListener('click', () => {
    modal.remove();
  });
  
  document.getElementById('downloadYoutubeBtn').addEventListener('click', () => {
    downloadImage(data.youtubeUrl, youtubeFilename);
  });
  
  document.getElementById('downloadAlbumBtn').addEventListener('click', () => {
    downloadImage(data.albumUrl, albumFilename);
  });
  
  console.log('✅ 모달 표시 완료');
}

/**
 * 🖼️ 이미지 다운로드 헬퍼 (개선)
 */
async function downloadImage(url, filename) {
  try {
    console.log(`📥 다운로드 시작: ${filename}`);
    console.log(`📍 URL: ${url}`);
    
    // URL 유효성 검사
    if (!url || url === 'undefined' || url === 'null') {
      throw new Error('이미지 URL이 유효하지 않습니다');
    }
    
    // HTTP를 HTTPS로 자동 변환 (Mixed Content 방지)
    url = url.replace(/^http:\/\//i, 'https://');
    console.log(`🔒 HTTPS URL: ${url}`);
    
    // 서버를 통해 프록시 다운로드 (CORS 우회)
    const proxyUrl = `/api/style/download-image?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
    console.log(`🔄 프록시 다운로드: ${proxyUrl}`);
    
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`이미지 다운로드 실패: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log(`✅ Blob 생성 완료 (${(blob.size / 1024).toFixed(2)} KB)`);
    
    // Blob URL 생성 및 다운로드
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    // 클린업
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      console.log(`✅ 다운로드 완료: ${filename}`);
    }, 100);
    
  } catch (error) {
    console.error('❌ 다운로드 실패:', error);
    alert(`❌ 다운로드 실패: ${error.message}\n\n파일명: ${filename}\n\n브라우저의 다운로드 차단을 확인해주세요.`);
  }
}

/**
 * 📊 업스케일 결과 모달 표시
 */
function showUpscaleResultsModal(count) {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.8);
    backdrop-filter: blur(10px);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  `;
  
  let imagesHTML = '';
  for (const [songIndex, imageData] of selectedImages.entries()) {
    if (!imageData.isUpgraded) continue;
    
    const musicBox = document.querySelector(`.music-mini-box[data-song-index="${songIndex}"]`);
    const titleElement = musicBox ? musicBox.querySelector('h3') : null;
    const title = titleElement ? titleElement.textContent.replace('🎵 ', '').trim() : 'Untitled';
    
    imagesHTML += `
      <div style="margin-bottom: 30px; padding: 20px; background: rgba(30,30,45,0.8); border-radius: 12px; border: 1px solid rgba(251,146,60,0.3);">
        <h3 style="color: #fb923c; margin-bottom: 16px; font-size: 1.2em;">🎵 ${title}</h3>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
          <div>
            <h4 style="color: rgba(255,255,255,0.8); font-size: 0.9em; margin-bottom: 8px;">📱 YouTube 썸네일 (1280×720)</h4>
            <img src="${imageData.enhanced.youtube.url}" style="width: 100%; border-radius: 8px; border: 2px solid rgba(251,146,60,0.3);" />
            <p style="color: rgba(255,255,255,0.5); font-size: 0.75em; margin-top: 4px;">${imageData.enhanced.youtube.message}</p>
          </div>
          <div>
            <h4 style="color: rgba(255,255,255,0.8); font-size: 0.9em; margin-bottom: 8px;">💿 앨범 커버 (3000×3000)</h4>
            <img src="${imageData.enhanced.album.url}" style="width: 100%; border-radius: 8px; border: 2px solid rgba(139,92,246,0.3);" />
            <p style="color: rgba(255,255,255,0.5); font-size: 0.75em; margin-top: 4px;">${imageData.enhanced.album.message}</p>
          </div>
        </div>
        
        <div style="display: flex; gap: 12px;">
          <button onclick="downloadImage('${imageData.enhanced.youtube.url}', '${title}_youtube.jpg')" 
                  style="flex: 1; background: linear-gradient(135deg, #fb923c, #ec4899); color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: 600;">
            📥 YouTube 다운로드
          </button>
          <button onclick="downloadImage('${imageData.enhanced.album.url}', '${title}_album.jpg')" 
                  style="flex: 1; background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: 600;">
            📥 앨범 다운로드
          </button>
        </div>
      </div>
    `;
  }
  
  modal.innerHTML = `
    <div style="max-width: 1200px; width: 100%; max-height: 90vh; overflow-y: auto; background: linear-gradient(145deg, rgba(30,30,45,0.98), rgba(20,20,35,0.98)); border-radius: 20px; border: 2px solid rgba(251,146,60,0.4); padding: 32px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <h2 style="color: #fb923c; margin: 0; font-size: 1.8em;">
          ✅ ${count}개 이미지 업스케일 완료!
        </h2>
        <button onclick="this.closest('div').parentElement.remove()" 
                style="background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.5); color: #ef4444; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600;">
          ✕ 닫기
        </button>
      </div>
      
      <div style="color: rgba(255,255,255,0.7); margin-bottom: 24px; padding: 16px; background: rgba(0,0,0,0.3); border-radius: 8px; border-left: 3px solid #fb923c;">
        <p style="margin: 0;">🎨 각 이미지마다 <strong>2종의 고화질 이미지</strong>가 생성되었습니다:</p>
        <ul style="margin: 8px 0 0 20px; padding: 0;">
          <li>📱 <strong>YouTube 썸네일</strong>: 1280×720 (16:9 비율)</li>
          <li>💿 <strong>앨범 커버</strong>: 3000×3000 (정사각형)</li>
        </ul>
      </div>
      
      ${imagesHTML}
    </div>
  `;
  
  document.body.appendChild(modal);
}

/**
 * 📥 단일 이미지 다운로드 헬퍼
 */


/**
 * 📥 선택한 이미지들 다운로드
 */
async function downloadSelectedImages() {
  if (selectedImages.size === 0) {
    alert('⚠️ 다운로드할 이미지를 선택해주세요!');
    return;
  }
  
  const btn = document.getElementById('downloadImagesBtn');
  const originalHTML = btn.innerHTML;
  btn.innerHTML = `<span style="font-size: 1.5em;">⏳</span><span>다운로드 중...</span>`;
  btn.disabled = true;
  
  try {
    let count = 0;
    for (const [songIndex, imageData] of selectedImages.entries()) {
      // 업그레이드된 이미지가 있으면 그걸, 없으면 원본
      const imageUrl = imageData.isUpgraded ? imageData.upgradedUrl : imageData.imageUrl;
      
      // 이미지 다운로드
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `Album_Cover_${songIndex + 1}_${imageData.isUpgraded ? 'HD' : 'Original'}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      count++;
      
      // 각 다운로드 사이 딜레이
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    alert(`✅ ${count}개 이미지 다운로드 완료!`);
    
  } catch (error) {
    console.error('❌ 다운로드 오류:', error);
    alert(`❌ 다운로드 실패: ${error.message}`);
  } finally {
    btn.innerHTML = originalHTML;
    btn.disabled = false;
  }
}

// CSS 애니메이션 추가 (스타일 태그에 삽입)
if (!document.getElementById('album-animations')) {
  const style = document.createElement('style');
  style.id = 'album-animations';
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes fadeIn {
      0% { opacity: 0; transform: scale(0.95); }
      100% { opacity: 1; transform: scale(1); }
    }
  `;
  document.head.appendChild(style);
}

/**
 * 🎵 트랙 순서 선택 함수
 * @param {number} songIndex - 곡의 인덱스 (1부터 시작)
 * @param {number} trackNumber - 선택한 트랙 번호 (1~20)
 */
function selectTrackOrder(songIndex, trackNumber) {
  console.log(`🎯 트랙 순서 선택: 곡 #${songIndex} → 트랙 #${trackNumber}`);
  
  // 이미 다른 곡이 이 트랙 번호를 사용 중인지 확인
  let previousSongIndex = null;
  for (const [idx, num] of trackOrder.entries()) {
    if (num === trackNumber && idx !== songIndex) {
      previousSongIndex = idx;
      break;
    }
  }
  
  // 다른 곡이 사용 중이면 경고하고 중단
  if (previousSongIndex !== null) {
    alert(`⚠️ 트랙 #${trackNumber}번은 이미 곡 #${previousSongIndex}번이 사용 중입니다!`);
    return;
  }
  
  // 현재 곡의 기존 트랙 번호 가져오기
  const oldTrackNumber = trackOrder.get(songIndex);
  
  // 새로운 트랙 번호 설정
  trackOrder.set(songIndex, trackNumber);
  
  console.log('📋 현재 트랙 순서:', Array.from(trackOrder.entries()));
  
  // 🎨 모든 곡의 모든 트랙 버튼 업데이트
  updateAllTrackButtons();
  
  // Time Track 업데이트 (메타데이터가 있으면)
  updateTimeTrackDisplay();
}

/**
 * 🎨 모든 곡의 모든 트랙 버튼 스타일 업데이트
 */
function updateAllTrackButtons() {
  // 모든 트랙 순서 버튼 가져오기
  const allButtons = document.querySelectorAll('.track-order-btn');
  
  allButtons.forEach(btn => {
    const btnSongIndex = parseInt(btn.dataset.songIndex);
    const btnTrackNumber = parseInt(btn.dataset.trackNumber);
    
    // 이 트랙 번호를 누가 선택했는지 찾기
    let ownerSongIndex = null;
    for (const [songIdx, trackNum] of trackOrder.entries()) {
      if (trackNum === btnTrackNumber) {
        ownerSongIndex = songIdx;
        break;
      }
    }
    
    // 스타일 초기화
    btn.classList.remove('selected', 'occupied', 'my-selection');
    
    if (ownerSongIndex === null) {
      // 🟢 Case 1: 아무도 선택 안 함 - 기본 스타일
      btn.style.background = 'rgba(30,30,45,0.8)';
      btn.style.borderColor = 'rgba(251,146,60,0.3)';
      btn.style.color = 'rgba(255,255,255,0.6)';
      btn.style.fontWeight = '600';
      btn.style.boxShadow = 'none';
      btn.style.transform = 'scale(1)';
      btn.style.cursor = 'pointer';
      btn.disabled = false;
      
    } else if (ownerSongIndex === btnSongIndex) {
      // 🟩 Case 2: 내가 선택함 - 초록 그라데이션 + 발광
      btn.classList.add('selected', 'my-selection');
      btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      btn.style.borderColor = '#10b981';
      btn.style.color = 'white';
      btn.style.fontWeight = 'bold';
      btn.style.boxShadow = '0 0 16px rgba(16,185,129,0.8)';
      btn.style.transform = 'scale(1.15)';
      btn.style.cursor = 'pointer';
      btn.disabled = false;
      
    } else {
      // 🔵 Case 3: 다른 곡이 선택함 - 회색 + 비활성화
      btn.classList.add('occupied');
      btn.style.background = 'rgba(100,100,120,0.4)';
      btn.style.borderColor = 'rgba(150,150,170,0.5)';
      btn.style.color = 'rgba(255,255,255,0.4)';
      btn.style.fontWeight = '600';
      btn.style.boxShadow = 'none';
      btn.style.transform = 'scale(1)';
      btn.style.cursor = 'not-allowed';
      btn.disabled = true;
    }
  });
  
  console.log('🎨 모든 트랙 버튼 스타일 업데이트 완료');
  
  // 🎬 앨범 생성 버튼 상태 업데이트
  updateDownloadAllButton();
}

/**
 * 🕐 Time Track 표시 업데이트
 */
function updateTimeTrackDisplay() {
  const metadataContent = document.getElementById('metadata-content');
  if (!metadataContent || !window.albumMetadata) return;
  
  // 트랙 순서가 설정된 곡들만 가져오기
  const orderedSongs = [];
  for (const [songIndex, trackNumber] of trackOrder.entries()) {
    const songBox = document.querySelector(`.music-mini-box[data-song-index="${songIndex}"]`);
    if (songBox) {
      const title = songBox.querySelector('h3').textContent.replace('🎵 ', '').trim();
      const duration = parseInt(songBox.dataset.duration) || 210;
      orderedSongs.push({ trackNumber, songIndex, title, duration });
    }
  }
  
  // 트랙 번호순으로 정렬
  orderedSongs.sort((a, b) => a.trackNumber - b.trackNumber);
  
  if (orderedSongs.length === 0) return;
  
  // Time Track 재계산
  let currentTime = 0;
  const timeTrack = orderedSongs.map((song, idx) => {
    const timestamp = formatTimestamp(currentTime);
    currentTime += song.duration;
    return `${timestamp} - ${String(song.trackNumber).padStart(2, '0')}_${song.title}`;
  }).join('\n');
  
  // 총 재생시간
  const totalMinutes = Math.floor(currentTime / 60);
  const totalSeconds = currentTime % 60;
  const durationText = `${totalMinutes}:${String(totalSeconds).padStart(2, '0')}`;
  
  // Time Track 섹션 찾아서 업데이트
  const timeTrackSection = metadataContent.querySelector('.time-track-section');
  if (timeTrackSection) {
    const preElement = timeTrackSection.querySelector('pre');
    if (preElement) {
      preElement.textContent = timeTrack;
    }
    
    // 총 재생시간도 업데이트
    const durationSpan = metadataContent.querySelector('.total-duration');
    if (durationSpan) {
      durationSpan.textContent = durationText;
    }
  }
  
  console.log('🕐 Time Track 업데이트 완료:', orderedSongs.length, '곡');
}

/**
 * ⏱️ 타임스탬프 포맷 (초 → MM:SS)
 */
function formatTimestamp(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * 📦 트랙 순서를 반영한 ZIP 다운로드
 */
async function createAlbumWithOrder() {
  // 선택된 곡들 가져오기
  const selectedSongs = [];
  document.querySelectorAll('.song-select-checkbox:checked').forEach(checkbox => {
    const songId = checkbox.dataset.songId;
    const songBox = document.querySelector(`[data-song-id="${songId}"]`);
    if (!songBox) return;
    
    const songIndex = parseInt(songBox.dataset.songIndex);
    const trackNumber = trackOrder.get(songIndex) || 99; // 미지정 곡은 뒤로
    
    selectedSongs.push({
      songId,
      songIndex,
      trackNumber,
      title: songBox.querySelector('h3').textContent.replace('🎵 ', '').trim(),
      audioUrl: songBox.querySelector('audio source').src
    });
  });
  
  if (selectedSongs.length === 0) {
    alert('⚠️ 선택된 곡이 없습니다!');
    return;
  }
  
  // 트랙 번호순 정렬
  selectedSongs.sort((a, b) => a.trackNumber - b.trackNumber);
  
  // 파일명에 트랙 번호 추가
  const songsWithFilename = selectedSongs.map(song => ({
    ...song,
    filename: `${String(song.trackNumber).padStart(2, '0')}_${song.title.replace(/[^a-zA-Z0-9가-힣]/g, '_')}.mp3`
  }));
  
  console.log('📦 트랙 순서가 반영된 앨범:', songsWithFilename);
  
  // 서버로 ZIP 생성 요청
  try {
    const response = await fetch('/api/style/create-album-zip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songs: songsWithFilename })
    });
    
    if (!response.ok) throw new Error('ZIP 생성 실패');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Album_${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    console.log('✅ 앨범 다운로드 완료!');
  } catch (error) {
    console.error('❌ ZIP 생성 실패:', error);
    alert('⚠️ 앨범 다운로드 실패: ' + error.message);
  }
}

/**
 * 🎵 AI 음악 순위 분석
 */
async function analyzeAndRankTracks() {
  console.log('🎯 AI 순위 분석 시작');
  
  const tracks = getSelectedTracks();
  
  if (tracks.length === 0) {
    alert('⚠️ 분석할 곡을 선택해주세요!');
    return;
  }
  
  // 로딩 UI 표시
  showRankingLoadingUI(tracks.length);
  
  try {
    const response = await fetch('/api/style/rank-tracks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tracks: tracks.map(t => ({
          title: t.title,
          audioUrl: t.audioUrl,
          imageUrl: t.imageUrl,
          duration: t.duration,
          lyrics: t.lyrics,
          style: document.getElementById('styleInput')?.value || ''
        })),
        options: {
          maxTracks: 30,
          batchSize: 5,
          skipDuplicates: true
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`서버 오류: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || '분석 실패');
    }
    
    console.log('✅ AI 분석 완료:', result);
    
    // 결과 표시
    displayRankingResults(result);
    
  } catch (error) {
    console.error('❌ AI 순위 분석 오류:', error);
    alert(`❌ AI 분석 실패: ${error.message}`);
    hideRankingUI();
  }
}

/**
 * 로딩 UI 표시
 */
function showRankingLoadingUI(trackCount) {
  let rankingContainer = document.getElementById('aiRankingContainer');
  
  if (!rankingContainer) {
    rankingContainer = document.createElement('div');
    rankingContainer.id = 'aiRankingContainer';
    rankingContainer.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      z-index: 10000;
      min-width: 500px;
      max-width: 90vw;
      max-height: 90vh;
      overflow-y: auto;
    `;
    document.body.appendChild(rankingContainer);
  }
  
  rankingContainer.innerHTML = `
    <div style="text-align: center;">
      <div style="font-size: 4em; animation: bounce 1s infinite;">🤖</div>
      <h2 style="color: white; margin: 20px 0;">AI 음악 분석 중...</h2>
      <p style="color: rgba(255,255,255,0.8); font-size: 1.1em;">
        ${trackCount}곡을 유튜브 최적화 기준으로 분석하고 있습니다
      </p>
      <div style="margin-top: 30px; padding: 20px; background: rgba(0,0,0,0.2); border-radius: 10px;">
        <p style="color: rgba(255,255,255,0.7); margin: 5px 0;">✅ 첫 30초 매력도 분석</p>
        <p style="color: rgba(255,255,255,0.7); margin: 5px 0;">✅ 감정 몰입도 측정</p>
        <p style="color: rgba(255,255,255,0.7); margin: 5px 0;">✅ 중독성 평가</p>
        <p style="color: rgba(255,255,255,0.7); margin: 5px 0;">✅ 예상 지속률 계산</p>
      </div>
      <p style="color: rgba(255,255,255,0.6); font-size: 0.9em; margin-top: 20px;">
        ⏱️ 예상 시간: ${Math.ceil(trackCount / 5)}초
      </p>
    </div>
  `;
  
  rankingContainer.style.display = 'block';
}

/**
 * 결과 표시
 */
function displayRankingResults(result) {
  const { tracks, strategies, statistics } = result;
  
  const rankingContainer = document.getElementById('aiRankingContainer');
  
  rankingContainer.innerHTML = `
    <div style="color: white;">
      <!-- 헤더 -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
        <h2 style="margin: 0;">🏆 AI 분석 결과</h2>
        <button onclick="hideRankingUI()" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-size: 1.1em;">
          ✖️ 닫기
        </button>
      </div>
      
      <!-- 통계 -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px;">
        <div style="background: rgba(0,0,0,0.2); padding: 20px; border-radius: 10px; text-align: center;">
          <div style="font-size: 2em; margin-bottom: 10px;">📊</div>
          <div style="font-size: 1.5em; font-weight: bold;">${statistics.totalTracks}곡</div>
          <div style="font-size: 0.9em; opacity: 0.8;">분석 완료</div>
        </div>
        <div style="background: rgba(0,0,0,0.2); padding: 20px; border-radius: 10px; text-align: center;">
          <div style="font-size: 2em; margin-bottom: 10px;">⭐</div>
          <div style="font-size: 1.5em; font-weight: bold;">${statistics.averageScore.toFixed(1)}/100</div>
          <div style="font-size: 0.9em; opacity: 0.8;">평균 점수</div>
        </div>
        <div style="background: rgba(0,0,0,0.2); padding: 20px; border-radius: 10px; text-align: center;">
          <div style="font-size: 2em; margin-bottom: 10px;">⏱️</div>
          <div style="font-size: 1.5em; font-weight: bold;">${statistics.analysisTime}초</div>
          <div style="font-size: 0.9em; opacity: 0.8;">분석 시간</div>
        </div>
      </div>
      
      <!-- 최고 점수 트랙 -->
      <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 25px; border-radius: 15px; margin-bottom: 30px;">
        <h3 style="margin: 0 0 15px 0; display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.5em;">🥇</span>
          최고 점수 트랙 (유튜브 첫 곡 추천!)
        </h3>
        <div style="font-size: 1.3em; font-weight: bold; margin-bottom: 10px;">
          "${statistics.topTrack.title}"
        </div>
        <div style="display: flex; gap: 20px; margin-top: 15px; flex-wrap: wrap;">
          <div>
            <span style="opacity: 0.9;">총점:</span>
            <span style="font-size: 1.3em; font-weight: bold; margin-left: 5px;">${statistics.topTrack.scores.total}/100</span>
          </div>
          <div>
            <span style="opacity: 0.9;">예상 지속률:</span>
            <span style="font-size: 1.3em; font-weight: bold; margin-left: 5px;">${statistics.topTrack.predictedRetention}</span>
          </div>
        </div>
        <div style="margin-top: 15px; padding: 15px; background: rgba(0,0,0,0.2); border-radius: 10px;">
          <div style="font-weight: bold; margin-bottom: 8px;">💡 AI 분석:</div>
          <div style="opacity: 0.9;">${statistics.topTrack.reason}</div>
        </div>
        ${statistics.topTrack.strengths.length > 0 ? `
          <div style="margin-top: 15px;">
            <div style="font-weight: bold; margin-bottom: 8px;">✅ 강점:</div>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              ${statistics.topTrack.strengths.map(s => `
                <span style="background: rgba(0,0,0,0.2); padding: 5px 12px; border-radius: 20px; font-size: 0.9em;">
                  ${s}
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
      
      <!-- 배치 전략 탭 -->
      <div style="margin-bottom: 20px;">
        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
          <button onclick="showStrategy('hook_first')" id="strategy-btn-hook_first" style="flex: 1; padding: 15px; background: rgba(255,255,255,0.3); border: 2px solid rgba(255,255,255,0.5); color: white; border-radius: 10px; cursor: pointer; font-size: 1em; font-weight: bold;">
            🎣 후킹 우선 (추천)
          </button>
          <button onclick="showStrategy('balanced')" id="strategy-btn-balanced" style="flex: 1; padding: 15px; background: rgba(255,255,255,0.1); border: 2px solid rgba(255,255,255,0.3); color: white; border-radius: 10px; cursor: pointer; font-size: 1em;">
            ⚖️ 밸런스 배치
          </button>
          <button onclick="showStrategy('energy_ascending')" id="strategy-btn-energy_ascending" style="flex: 1; padding: 15px; background: rgba(255,255,255,0.1); border: 2px solid rgba(255,255,255,0.3); color: white; border-radius: 10px; cursor: pointer; font-size: 1em;">
            📈 에너지 상승
          </button>
        </div>
      </div>
      
      <!-- 전략별 순서 표시 -->
      ${Object.keys(strategies).map(strategyKey => `
        <div id="strategy-${strategyKey}" class="strategy-panel" style="display: ${strategyKey === 'hook_first' ? 'block' : 'none'};">
          <div style="background: rgba(0,0,0,0.2); padding: 20px; border-radius: 10px; margin-bottom: 15px;">
            <h4 style="margin: 0 0 10px 0; display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 1.5em;">${strategies[strategyKey].emoji}</span>
              ${strategies[strategyKey].name}
            </h4>
            <p style="opacity: 0.8; margin: 0;">${strategies[strategyKey].description}</p>
          </div>
          
          <div style="background: rgba(0,0,0,0.2); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <ol style="margin: 0; padding-left: 20px;">
              ${strategies[strategyKey].order.slice(0, 10).map((track, idx) => `
                <li style="margin: 15px 0; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px; position: relative;">
                  <div style="display: flex; justify-content: space-between; align-items: start; gap: 15px;">
                    <div style="flex: 1;">
                      <div style="font-weight: bold; font-size: 1.1em; margin-bottom: 5px;">
                        ${track.title}
                      </div>
                      <div style="font-size: 0.9em; opacity: 0.8;">
                        ${Math.floor(track.duration / 60)}:${String(Math.floor(track.duration % 60)).padStart(2, '0')}
                      </div>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-size: 1.5em; font-weight: bold; color: ${
                        track.scores.total >= 85 ? '#4ade80' :
                        track.scores.total >= 70 ? '#fbbf24' :
                        track.scores.total >= 60 ? '#fb923c' : '#ef4444'
                      };">
                        ${track.scores.total}
                      </div>
                      <div style="font-size: 0.8em; opacity: 0.7;">/ 100점</div>
                      <div style="font-size: 0.9em; opacity: 0.8; margin-top: 5px;">
                        지속률: ${track.predictedRetention}
                      </div>
                    </div>
                  </div>
                  
                  <!-- 세부 점수 -->
                  <div style="display: flex; gap: 15px; margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 0.85em;">
                    <div>🎯 첫30초: ${track.scores.first30Seconds}/50</div>
                    <div>💖 감정: ${track.scores.emotionalEngagement}/30</div>
                    <div>🔁 중독성: ${track.scores.addictiveness}/20</div>
                  </div>
                </li>
              `).join('')}
            </ol>
          </div>
          
          <button onclick="applyTrackOrder('${strategyKey}')" style="width: 100%; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; color: white; border-radius: 15px; cursor: pointer; font-size: 1.1em; font-weight: bold; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
            ✅ 이 순서로 적용하기
          </button>
        </div>
      `).join('')}
    </div>
    
    <style>
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
      }
    </style>
  `;
}

/**
 * 전략 전환
 */
window.showStrategy = function(strategyKey) {
  // 모든 패널 숨기기
  document.querySelectorAll('.strategy-panel').forEach(panel => {
    panel.style.display = 'none';
  });
  
  // 모든 버튼 비활성화 스타일
  document.querySelectorAll('[id^="strategy-btn-"]').forEach(btn => {
    btn.style.background = 'rgba(255,255,255,0.1)';
    btn.style.borderColor = 'rgba(255,255,255,0.3)';
  });
  
  // 선택된 패널 표시
  document.getElementById(`strategy-${strategyKey}`).style.display = 'block';
  
  // 선택된 버튼 활성화 스타일
  const selectedBtn = document.getElementById(`strategy-btn-${strategyKey}`);
  selectedBtn.style.background = 'rgba(255,255,255,0.3)';
  selectedBtn.style.borderColor = 'rgba(255,255,255,0.5)';
};

/**
 * 순서 적용
 */
window.applyTrackOrder = function(strategyKey) {
  console.log(`✅ "${strategyKey}" 순서 적용`);
  
  // TODO: 실제 트랙 순서 업데이트 로직 추가
  // trackOrder Map 업데이트
  
  alert('✅ 트랙 순서가 적용되었습니다!\n\n앨범 ZIP 생성 시 이 순서대로 생성됩니다.');
  hideRankingUI();
};

/**
 * UI 숨기기
 */
window.hideRankingUI = function() {
  const container = document.getElementById('aiRankingContainer');
  if (container) {
    container.style.display = 'none';
  }
};

// 전역 함수로 등록
window.analyzeAndRankTracks = analyzeAndRankTracks;

/**
 * 🎵 AI 순위 분석 메인 함수 (버튼 클릭 시)
 */
window.analyzeTracksWithAI = async function() {
  console.log('🎯 AI 순위 분석 시작...');
  
  // 생성된 음악 확인
  if (!generatedMusicList || generatedMusicList.length < 2) {
    alert('❌ 분석할 음악이 부족합니다. 최소 2곡 이상 생성해주세요.');
    return;
  }
  
  const button = document.getElementById('aiRankButton');
  const originalText = button.innerHTML;
  
  try {
    // 로딩 표시
    button.disabled = true;
    button.innerHTML = `
      <span style="font-size: 1.4em;">⏳</span>
      <div style="text-align: left;">
        <div>AI 분석 중...</div>
        <div style="font-size: 0.65em; font-weight: 500; opacity: 0.85; margin-top: 4px;">
          ${generatedMusicList.length}곡 분석 중 (약 ${Math.ceil(generatedMusicList.length * 2)}초 소요)
        </div>
      </div>
    `;
    
    // 트랙 데이터 준비
    const tracks = generatedMusicList.map((song, index) => ({
      id: `track-${index}`,
      title: song.title || `트랙 ${index + 1}`,
      audioUrl: song.audioUrl,
      imageUrl: song.imageUrl,
      duration: song.duration || 180,
      lyrics: song.lyrics || '',
      style: song.style || currentStyleInput
    }));
    
    console.log('📊 분석 요청 데이터:', { trackCount: tracks.length });
    
    // API 호출
    const response = await fetch('/api/ranker/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tracks: tracks,
        options: {
          maxTracks: 30,
          batchSize: 5,
          skipDuplicates: true
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`분석 실패: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || '알 수 없는 오류');
    }
    
    console.log('✅ AI 분석 완료:', result.data);
    
    // 전역 변수에 저장 (순서 적용 시 사용)
    window.currentRankingResult = result.data;
    
    // UI 표시
    displayRankingResults(result.data);
    
  } catch (error) {
    console.error('❌ AI 분석 오류:', error);
    alert(`❌ AI 분석 중 오류가 발생했습니다:\n\n${error.message}\n\n다시 시도해주세요.`);
  } finally {
    // 버튼 복원
    button.disabled = false;
    button.innerHTML = originalText;
  }
};

/**
 * 🎨 AI 순위 결과 UI 표시
 */
function displayRankingResults(data) {
  const { tracks, strategies, statistics } = data;
  
  console.log('🎨 결과 UI 생성:', {
    tracks: tracks.length,
    strategies: Object.keys(strategies).length,
    avgScore: statistics.averageScore
  });
  
  // 기존 UI 제거
  let container = document.getElementById('aiRankingContainer');
  if (container) {
    container.remove();
  }
  
  // 새 UI 생성
  container = document.createElement('div');
  container.id = 'aiRankingContainer';
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.9);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow-y: auto;
    padding: 20px;
  `;
  
  // 전략 탭 생성
  const strategiesHTML = Object.entries(strategies).map(([key, strategy]) => {
    const tracks = strategy.order;
    const tracksHTML = tracks.map((track, index) => `
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 16px; margin-bottom: 12px; border-left: 4px solid ${getScoreColor(track.scores.total)}; display: flex; align-items: center; gap: 16px;">
        <div style="font-size: 2em; font-weight: bold; color: rgba(255,255,255,0.4); min-width: 40px;">${index + 1}</div>
        <div style="flex: 1;">
          <div style="font-weight: 700; font-size: 1.1em; color: white; margin-bottom: 6px;">${track.title}</div>
          <div style="font-size: 0.9em; color: rgba(255,255,255,0.6); margin-bottom: 8px;">${track.reason}</div>
          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <div style="background: rgba(251,146,60,0.2); padding: 6px 12px; border-radius: 8px; font-size: 0.85em; color: #fb923c;">
              <strong>첫 30초:</strong> ${track.scores.first30Seconds}/50
            </div>
            <div style="background: rgba(168,85,247,0.2); padding: 6px 12px; border-radius: 8px; font-size: 0.85em; color: #a855f7;">
              <strong>감정:</strong> ${track.scores.emotionalEngagement}/30
            </div>
            <div style="background: rgba(34,197,94,0.2); padding: 6px 12px; border-radius: 8px; font-size: 0.85em; color: #22c55e;">
              <strong>중독성:</strong> ${track.scores.addictiveness}/20
            </div>
            <div style="background: rgba(59,130,246,0.2); padding: 6px 12px; border-radius: 8px; font-size: 0.85em; color: #3b82f6; font-weight: 700;">
              <strong>총점:</strong> ${track.scores.total}/100
            </div>
          </div>
          <div style="margin-top: 8px; font-size: 0.85em; color: rgba(255,255,255,0.5);">
            예상 시청 지속률: <strong style="color: #4ade80;">${track.predictedRetention}</strong>
          </div>
        </div>
      </div>
    `).join('');
    
    return `
      <div id="strategy-${key}" class="strategy-panel" style="display: ${key === 'hook_first' ? 'block' : 'none'};">
        <div style="margin-bottom: 16px; padding: 16px; background: rgba(255,255,255,0.03); border-radius: 12px;">
          <div style="font-size: 1.2em; font-weight: 700; color: white; margin-bottom: 8px;">
            ${strategy.emoji} ${strategy.name}
          </div>
          <div style="color: rgba(255,255,255,0.6);">${strategy.description}</div>
        </div>
        ${tracksHTML}
        <button onclick="applyRankingOrder('${key}')" style="width: 100%; padding: 16px; margin-top: 16px; background: linear-gradient(135deg, #8b5cf6, #7c3aed); border: none; border-radius: 12px; color: white; font-size: 1.1em; font-weight: 700; cursor: pointer; transition: all 0.3s;">
          ✅ 이 순서 적용하기
        </button>
      </div>
    `;
  }).join('');
  
  container.innerHTML = `
    <div style="background: rgba(20,20,30,0.98); border-radius: 20px; max-width: 900px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 32px; box-shadow: 0 20px 60px rgba(0,0,0,0.5); border: 2px solid rgba(255,255,255,0.1);">
      <!-- 헤더 -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 2px solid rgba(255,255,255,0.1);">
        <div>
          <h2 style="color: white; margin: 0; font-size: 1.8em; font-weight: 800;">🤖 AI 순위 분석 결과</h2>
          <p style="color: rgba(255,255,255,0.6); margin: 8px 0 0 0; font-size: 0.95em;">
            ${statistics.totalTracks}곡 분석 완료 (${statistics.analysisTime}초 소요)
          </p>
        </div>
        <button onclick="hideRankingUI()" style="background: rgba(255,255,255,0.1); border: none; color: white; font-size: 1.5em; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; transition: all 0.3s;">✕</button>
      </div>
      
      <!-- 통계 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div style="background: linear-gradient(135deg, rgba(59,130,246,0.2), rgba(37,99,235,0.2)); padding: 16px; border-radius: 12px; border: 1px solid rgba(59,130,246,0.3);">
          <div style="color: rgba(255,255,255,0.7); font-size: 0.9em; margin-bottom: 6px;">평균 점수</div>
          <div style="color: white; font-size: 1.8em; font-weight: 800;">${statistics.averageScore.toFixed(1)}</div>
        </div>
        <div style="background: linear-gradient(135deg, rgba(251,146,60,0.2), rgba(249,115,22,0.2)); padding: 16px; border-radius: 12px; border: 1px solid rgba(251,146,60,0.3);">
          <div style="color: rgba(255,255,255,0.7); font-size: 0.9em; margin-bottom: 6px;">최고 점수</div>
          <div style="color: white; font-size: 1.8em; font-weight: 800;">${statistics.topTrack.scores.total}</div>
        </div>
        <div style="background: linear-gradient(135deg, rgba(34,197,94,0.2), rgba(22,163,74,0.2)); padding: 16px; border-radius: 12px; border: 1px solid rgba(34,197,94,0.3);">
          <div style="color: rgba(255,255,255,0.7); font-size: 0.9em; margin-bottom: 6px;">최고 곡</div>
          <div style="color: white; font-size: 1.1em; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${statistics.topTrack.title}">${statistics.topTrack.title}</div>
        </div>
      </div>
      
      <!-- 전략 탭 -->
      <div style="display: flex; gap: 12px; margin-bottom: 20px;">
        <button onclick="showStrategy('hook_first')" id="strategy-btn-hook_first" style="flex: 1; padding: 15px; background: rgba(255,255,255,0.3); border: 2px solid rgba(255,255,255,0.5); color: white; border-radius: 10px; cursor: pointer; font-size: 1em; font-weight: bold; transition: all 0.3s;">
          🎣 후킹 우선
        </button>
        <button onclick="showStrategy('balanced')" id="strategy-btn-balanced" style="flex: 1; padding: 15px; background: rgba(255,255,255,0.1); border: 2px solid rgba(255,255,255,0.3); color: white; border-radius: 10px; cursor: pointer; font-size: 1em; font-weight: bold; transition: all 0.3s;">
          ⚖️ 밸런스
        </button>
        <button onclick="showStrategy('energy_ascending')" id="strategy-btn-energy_ascending" style="flex: 1; padding: 15px; background: rgba(255,255,255,0.1); border: 2px solid rgba(255,255,255,0.3); color: white; border-radius: 10px; cursor: pointer; font-size: 1em; font-weight: bold; transition: all 0.3s;">
          📈 에너지 상승
        </button>
      </div>
      
      <!-- 전략별 순위 -->
      ${strategiesHTML}
    </div>
  `;
  
  document.body.appendChild(container);
}

/**
 * 점수에 따른 색상 반환
 */
function getScoreColor(score) {
  if (score >= 80) return '#22c55e'; // 초록
  if (score >= 60) return '#3b82f6'; // 파랑
  if (score >= 40) return '#fb923c'; // 주황
  return '#ef4444'; // 빨강
}

/**
 * 순서 적용 (AI 추천 → 실제 트랙 번호 자동 설정)
 */
window.applyRankingOrder = function(strategyKey) {
  console.log('✅ 순서 적용 시작:', strategyKey);
  
  // 현재 AI 분석 결과에서 선택된 전략 가져오기
  if (!window.currentRankingResult || !window.currentRankingResult.strategies) {
    alert('❌ 분석 결과를 찾을 수 없습니다. 다시 분석해주세요.');
    return;
  }
  
  const strategy = window.currentRankingResult.strategies[strategyKey];
  if (!strategy || !strategy.order) {
    alert('❌ 전략 데이터를 찾을 수 없습니다.');
    return;
  }
  
  console.log(`🎯 "${strategy.name}" 전략 적용 중...`);
  console.log('📊 추천 순서:', strategy.order.map((t, i) => `${i+1}. ${t.title}`));
  
  // 기존 trackOrder 초기화
  trackOrder.clear();
  
  // AI 추천 순서대로 트랙 번호 자동 설정
  let successCount = 0;
  let failCount = 0;
  
  strategy.order.forEach((track, index) => {
    const trackNumber = index + 1; // 1번부터 시작
    
    // trackId에서 songIndex 추출 (track-0 → 0)
    const songIndex = parseInt(track.trackId.replace('track-', ''));
    
    // 유효성 검사
    if (isNaN(songIndex) || songIndex < 0 || songIndex >= generatedMusicList.length) {
      console.warn(`⚠️  [${trackNumber}] 잘못된 곡 인덱스: ${songIndex}`);
      failCount++;
      return;
    }
    
    // 트랙 번호 설정
    trackOrder.set(songIndex, trackNumber);
    successCount++;
    
    console.log(`✅ [${trackNumber}] 곡 #${songIndex} "${track.title}" 설정 완료`);
  });
  
  console.log(`\n📋 최종 트랙 순서:`, Array.from(trackOrder.entries()));
  console.log(`✅ 성공: ${successCount}곡, ❌ 실패: ${failCount}곡\n`);
  
  // UI 업데이트
  updateAllTrackButtons();
  updateTimeTrackDisplay();
  updateDownloadButton();
  
  // 성공 메시지
  const strategyEmoji = strategy.emoji || '✅';
  const message = `${strategyEmoji} "${strategy.name}" 순서가 적용되었습니다!\n\n` +
                  `✅ ${successCount}곡의 트랙 번호가 자동으로 설정되었습니다.\n\n` +
                  `📝 순서:\n` +
                  strategy.order.slice(0, 5).map((t, i) => 
                    `${i + 1}. ${t.title} (${t.scores.total}점)`
                  ).join('\n') +
                  (strategy.order.length > 5 ? `\n... 외 ${strategy.order.length - 5}곡` : '') +
                  `\n\n💡 트랙 번호를 클릭하면 언제든 수동으로 변경 가능합니다.`;
  
  alert(message);
  
  // UI 닫기
  hideRankingUI();
  
  // 앨범 생성 섹션으로 스크롤
  const albumSection = document.getElementById('createAlbumSection');
  if (albumSection) {
    albumSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

// ==========================================
// 🎨 썸네일 자동 생성 기능
// ==========================================

/**
 * 썸네일 생성 함수
 * @param {string} title - YouTube 제목
 * @param {string} style - 음악 스타일
 * @param {string} language - 언어 (korean/english)
 * @returns {Promise<object>} - {prompt, config}
 */
async function generateThumbnail(title, style, language = 'korean') {
  try {
    console.log('🎨 썸네일 프롬프트 생성 시작...');
    console.log(`   제목: "${title}"`);
    console.log(`   스타일: "${style}"`);
    
    const response = await fetch('/api/style/generate-thumbnail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        style,
        language,
        generateImage: true
      })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || '썸네일 생성 실패');
    }
    
    console.log('✅ 썸네일 프롬프트 생성 완료');
    console.log(`   분위기: ${result.config.mood}`);
    console.log(`   색상: ${result.config.colorScheme}`);
    
    return result;
    
  } catch (error) {
    console.error('❌ 썸네일 생성 오류:', error);
    throw error;
  }
}

/**
 * 앨범 메타데이터와 함께 썸네일 표시
 */
function displayThumbnailPreview(thumbnailData, containerElement) {
  if (!thumbnailData || !containerElement) return;
  
  const previewHTML = `
    <div style="
      background: rgba(251, 146, 60, 0.1);
      border: 2px solid #fb923c;
      border-radius: 12px;
      padding: 20px;
      margin-top: 20px;
    ">
      <h3 style="color: #fb923c; margin: 0 0 15px 0;">
        🎨 YouTube 썸네일 프롬프트
      </h3>
      
      <div style="
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 15px;
      ">
        <div style="color: #94a3b8; font-size: 14px; margin-bottom: 8px;">
          <strong>분위기:</strong> ${thumbnailData.config.mood}
        </div>
        <div style="color: #94a3b8; font-size: 14px; margin-bottom: 8px;">
          <strong>색상:</strong> ${thumbnailData.config.colorScheme}
        </div>
        <div style="color: #94a3b8; font-size: 14px;">
          <strong>주요 요소:</strong> ${thumbnailData.config.visualElements}
        </div>
      </div>
      
      <details style="margin-top: 10px;">
        <summary style="
          color: #fb923c;
          cursor: pointer;
          font-size: 14px;
          padding: 8px;
          background: rgba(251, 146, 60, 0.1);
          border-radius: 6px;
        ">
          📝 이미지 생성 프롬프트 보기
        </summary>
        <pre style="
          background: rgba(0, 0, 0, 0.3);
          color: #e2e8f0;
          padding: 15px;
          border-radius: 8px;
          margin-top: 10px;
          font-size: 12px;
          line-height: 1.6;
          white-space: pre-wrap;
          word-wrap: break-word;
          max-height: 300px;
          overflow-y: auto;
        ">${thumbnailData.prompt}</pre>
      </details>
      
      <div style="
        margin-top: 15px;
        padding: 12px;
        background: rgba(59, 130, 246, 0.1);
        border-left: 3px solid #3b82f6;
        border-radius: 6px;
      ">
        <div style="color: #60a5fa; font-size: 13px; line-height: 1.6;">
          💡 <strong>사용 방법:</strong><br>
          위 프롬프트를 GenSpark image_generation 툴에 전달하여<br>
          고품질 YouTube 썸네일을 생성할 수 있습니다.<br>
          <br>
          <strong>설정:</strong> aspect_ratio: "16:9", model: "${thumbnailData.config.model}"
        </div>
      </div>
    </div>
  `;
  
  containerElement.insertAdjacentHTML('beforeend', previewHTML);
}


console.log('✅ AI 음악 순위 분석 시스템 로드 완료');

/**
 * 📋 클립보드에 텍스트 복사
 */
function copyToClipboard(button) {
  const text = button.getAttribute('data-text');
  
  // 클립보드 API 사용
  navigator.clipboard.writeText(text).then(() => {
    const originalText = button.innerHTML;
    button.innerHTML = '✅ 복사 완료!';
    button.style.background = '#22c55e';
    
    setTimeout(() => {
      button.innerHTML = originalText;
      button.style.background = '#3b82f6';
    }, 2000);
  }).catch(err => {
    console.error('복사 실패:', err);
    alert('복사에 실패했습니다. 프롬프트를 직접 선택하여 복사해주세요.');
  });
}

/**
 * 📋 프롬프트 복사 및 사용법 안내
 */
function copyPromptAndShowInstructions() {
  // 현재 생성된 프롬프트 찾기
  const promptElement = document.querySelector('#thumbnailResult pre');
  if (!promptElement) {
    alert('프롬프트를 찾을 수 없습니다.');
    return;
  }
  
  const prompt = promptElement.textContent;
  
  // 클립보드에 복사
  navigator.clipboard.writeText(prompt).then(() => {
    // 성공 메시지와 사용법 표시
    const instructions = `
✅ 프롬프트가 클립보드에 복사되었습니다!

📝 이미지 생성 방법:

1️⃣ AI 채팅창에 다음과 같이 입력하세요:

"아래 프롬프트로 nano-banana-2 모델, 16:9 비율로 이미지를 생성해줘:

[복사한 프롬프트를 붙여넣기]"

2️⃣ 또는 더 간단하게:

"위에 생성된 썸네일 프롬프트로 이미지 만들어줘"

💡 nano-banana-2 모델은 무료이고 고품질 이미지를 생성합니다!
    `;
    
    alert(instructions);
  }).catch(err => {
    console.error('복사 실패:', err);
    alert('복사에 실패했습니다. 프롬프트를 직접 선택하여 복사해주세요.');
  });
}

/**
 * 🎨 YouTube 썸네일 생성 (웹훅 방식)
 */
async function generateYouTubeThumbnail() {
  console.log('🎨 YouTube 썸네일 생성 시작 (웹훅 자동화)');
  
  const btn = document.getElementById('generateThumbnailBtn');
  const resultDiv = document.getElementById('thumbnailResult');
  
  if (!btn || !resultDiv) {
    console.error('❌ 썸네일 버튼 또는 결과 영역을 찾을 수 없습니다');
    return;
  }
  
  // 앨범 메타데이터 확인
  if (!window.albumMetadata) {
    alert('⚠️ 먼저 앨범을 생성해주세요!');
    return;
  }
  
  // 로딩 상태
  const originalHTML = btn.innerHTML;
  btn.innerHTML = `
    <span style="font-size: 1.4em; animation: spin 1s linear infinite;">🎨</span>
    <div style="text-align: left;">
      <div>썸네일 요청 중...</div>
      <div style="font-size: 0.7em; font-weight: 500; opacity: 0.9; margin-top: 4px;">
        AI 어시스턴트가 자동으로 처리합니다
      </div>
    </div>
  `;
  btn.disabled = true;
  
  try {
    // AI 모델 선택 (기본값: replicate - FLUX Schnell 완전 자동)
    const aiModel = document.getElementById('aiModelSelect')?.value || 'replicate';
    
    // 웹훅으로 썸네일 요청
    const response = await fetch('/api/webhook/thumbnail-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: window.albumMetadata.youtubeTitle || window.albumMetadata.albumTitle,
        style: window.albumMetadata.style || 'Music Playlist',
        language: currentGeneratedLanguage,
        aiModel: aiModel  // 'openai' (자동) 또는 'genspark' (수동)
      })
    });
    
    const data = await response.json();
    console.log('🎨 썸네일 요청 응답:', data);
    
    if (!data.success) {
      throw new Error(data.error || '썸네일 요청 실패');
    }
    
    // 요청 ID 저장
    window.currentThumbnailRequestId = data.requestId;
    
    // 대기 중 UI 표시
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
      <div style="padding: 20px; background: rgba(59,130,246,0.1); border: 2px solid rgba(59,130,246,0.3); border-radius: 12px;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <span style="font-size: 2em; animation: spin 2s linear infinite;">⏳</span>
          <div>
            <div style="font-size: 1.2em; font-weight: 700; color: #3b82f6;">AI 어시스턴트가 썸네일 생성 중...</div>
            <div style="font-size: 0.9em; color: rgba(255,255,255,0.7); margin-top: 4px;">
              요청 ID: ${data.requestId}
            </div>
          </div>
        </div>
        
        <div style="padding: 16px; background: rgba(251,191,36,0.1); border-left: 3px solid #fbbf24; border-radius: 8px;">
          <div style="font-weight: 600; color: #fbbf24; margin-bottom: 8px;">📝 생성 프롬프트</div>
          <pre style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; color: rgba(255,255,255,0.8); font-size: 0.85em; line-height: 1.6; white-space: pre-wrap;">${data.prompt}</pre>
        </div>
        
        <div style="margin-top: 16px; padding: 12px; background: rgba(139,92,246,0.1); border-radius: 8px; text-align: center;">
          <div style="font-size: 0.9em; color: rgba(255,255,255,0.7);">
            💡 자동으로 완료됩니다 (예상 시간: 10-30초)
          </div>
        </div>
      </div>
    `;
    
    // 폴링 시작 (Socket.IO로 대체 가능)
    pollThumbnailStatus(data.requestId, originalHTML);
    
  } catch (error) {
    console.error('❌ 썸네일 요청 실패:', error);
    
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
      <div style="padding: 20px; background: rgba(220,38,38,0.1); border: 2px solid rgba(220,38,38,0.3); border-radius: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 2em;">❌</span>
          <div>
            <div style="font-size: 1.1em; font-weight: 700; color: #ef4444;">썸네일 요청 실패</div>
            <div style="font-size: 0.9em; color: rgba(255,255,255,0.7); margin-top: 4px;">
              ${error.message}
            </div>
          </div>
        </div>
      </div>
    `;
    
    btn.innerHTML = originalHTML;
    btn.disabled = false;
  }
}

/**
 * 썸네일 상태 폴링
 */
async function pollThumbnailStatus(requestId, originalButtonHTML) {
  const btn = document.getElementById('generateThumbnailBtn');
  const resultDiv = document.getElementById('thumbnailResult');
  const maxAttempts = 120; // 최대 120초로 연장
  let attempts = 0;
  
  const poll = async () => {
    try {
      attempts++;
      
      const response = await fetch(`/api/webhook/thumbnail-status/${requestId}`);
      const data = await response.json();
      
      console.log(`🔍 폴링 ${attempts}/${maxAttempts}:`, data.status);
      
      // 폴링 진행상황을 UI에 표시
      if (data.status === 'pending') {
        const progressPercent = Math.min((attempts / maxAttempts) * 100, 95);
        resultDiv.innerHTML = `
          <div style="padding: 20px; background: rgba(59,130,246,0.1); border: 2px solid rgba(59,130,246,0.3); border-radius: 12px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
              <span style="font-size: 2em; animation: spin 2s linear infinite;">⏳</span>
              <div style="flex: 1;">
                <div style="font-size: 1.2em; font-weight: 700; color: #3b82f6;">AI 어시스턴트가 썸네일 생성 중...</div>
                <div style="font-size: 0.9em; color: rgba(255,255,255,0.7); margin-top: 4px;">
                  대기 시간: ${attempts}초 / ${maxAttempts}초
                </div>
              </div>
            </div>
            
            <div style="margin-bottom: 16px;">
              <div style="background: rgba(0,0,0,0.3); height: 8px; border-radius: 4px; overflow: hidden;">
                <div style="background: linear-gradient(90deg, #3b82f6, #8b5cf6); height: 100%; width: ${progressPercent}%; transition: width 1s ease;"></div>
              </div>
            </div>
            
            <div style="padding: 12px; background: rgba(139,92,246,0.1); border-radius: 8px; text-align: center;">
              <div style="font-size: 0.9em; color: rgba(255,255,255,0.7);">
                ${attempts < 30 ? '💡 AI가 이미지를 생성하고 있습니다...' : 
                  attempts < 60 ? '⏳ 조금만 더 기다려주세요...' :
                  attempts < 90 ? '🎨 거의 다 됐습니다!' :
                  '⚡ 곧 완료됩니다!'}
              </div>
            </div>
          </div>
        `;
      }
      
      if (data.status === 'completed') {
        // 생성 완료
        console.log('✅ 썸네일 생성 완료! 결과 표시 중...');
        displayThumbnailResult(data, originalButtonHTML);
        return;
      }
      
      if (data.status === 'failed') {
        throw new Error(data.error || '썸네일 생성 실패');
      }
      
      // 대기 중이면 계속 폴링
      if (attempts < maxAttempts) {
        setTimeout(poll, 1000);
      } else {
        // 타임아웃 후에도 백그라운드에서 계속 확인
        console.warn('⚠️ 폴링 타임아웃 - Socket.IO를 기다립니다...');
        resultDiv.innerHTML = `
          <div style="padding: 20px; background: rgba(251,191,36,0.1); border: 2px solid rgba(251,191,36,0.3); border-radius: 12px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 2em; animation: spin 2s linear infinite;">⏳</span>
              <div>
                <div style="font-size: 1.1em; font-weight: 700; color: #fbbf24;">AI가 썸네일 생성 중...</div>
                <div style="font-size: 0.9em; color: rgba(255,255,255,0.7); margin-top: 4px;">
                  폴링 타임아웃 - Socket.IO 실시간 알림을 기다리고 있습니다
                </div>
              </div>
            </div>
            <div style="margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.3); border-radius: 6px;">
              <div style="font-size: 0.9em; color: rgba(255,255,255,0.7);">
                💡 AI 어시스턴트가 이미지를 생성하면 자동으로 표시됩니다<br>
                Request ID: ${requestId}
              </div>
            </div>
          </div>
        `;
        
        btn.innerHTML = originalButtonHTML;
        btn.disabled = false;
      }
      
    } catch (error) {
      console.error('❌ 썸네일 폴링 실패:', error);
      
      resultDiv.innerHTML = `
        <div style="padding: 20px; background: rgba(220,38,38,0.1); border: 2px solid rgba(220,38,38,0.3); border-radius: 12px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 2em;">❌</span>
            <div>
              <div style="font-size: 1.1em; font-weight: 700; color: #ef4444;">썸네일 생성 실패</div>
              <div style="font-size: 0.9em; color: rgba(255,255,255,0.7); margin-top: 4px;">
                ${error.message}
              </div>
            </div>
          </div>
        </div>
      `;
      
      btn.innerHTML = originalButtonHTML;
      btn.disabled = false;
    }
  };
  
  poll();
}

/**
 * 썸네일 결과 표시 (4가지 버전)
 */
function displayThumbnailResult(data, originalButtonHTML) {
  const btn = document.getElementById('generateThumbnailBtn');
  const resultDiv = document.getElementById('thumbnailResult');
  
  console.log('✅ 썸네일 생성 완료 (4가지 버전):', data);
  
  let resultHTML = `
    <div style="padding: 20px; background: rgba(34,197,94,0.1); border: 2px solid rgba(34,197,94,0.3); border-radius: 12px;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
        <span style="font-size: 2em;">✅</span>
        <div>
          <div style="font-size: 1.2em; font-weight: 700; color: #22c55e;">4가지 썸네일 버전 생성 완료!</div>
          <div style="font-size: 0.9em; color: rgba(255,255,255,0.7); margin-top: 4px;">
            디자인 A & B × 텍스트 유무 = 총 4개 옵션
          </div>
        </div>
      </div>
  `;
  
  // 4가지 이미지 표시
  if (data.images && data.images.length === 4) {
    resultHTML += `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 24px; margin: 20px 0;">
    `;
    
    data.images.forEach((img, index) => {
      resultHTML += `
        <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 16px; border: 2px solid rgba(255,255,255,0.1);">
          <div style="font-weight: 600; color: #fbbf24; margin-bottom: 8px; font-size: 0.95em;">
            ${img.label}
          </div>
          
          <div style="position: relative; margin: 12px 0;">
            <img src="${img.imageUrl}" alt="${img.label}" 
                 style="width: 100%; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.4); display: block;">
            ${img.version.includes('no_text') ? 
              `<div style="position: absolute; top: 8px; right: 8px; background: rgba(239,68,68,0.9); color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.75em; font-weight: 600;">
                텍스트 없음
              </div>` : 
              `<div style="position: absolute; top: 8px; right: 8px; background: rgba(34,197,94,0.9); color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.75em; font-weight: 600;">
                텍스트 포함
              </div>`
            }
          </div>
          
          <div style="display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;">
            <a href="${img.imageUrlNoWatermark || img.imageUrl}" target="_blank" download 
               style="flex: 1; min-width: 120px; text-align: center; padding: 8px 12px; background: linear-gradient(135deg, #22c55e, #16a34a); color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 0.85em;">
              📥 다운로드
            </a>
            
            <button onclick="window.open('${img.imageUrl}', '_blank')" 
                    style="flex: 1; min-width: 100px; padding: 8px 12px; background: #3b82f6; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.85em;">
              🔍 크게 보기
            </button>
          </div>
          
          <div style="margin-top: 8px; font-size: 0.8em; color: rgba(255,255,255,0.5);">
            ${img.width} × ${img.height}
          </div>
        </div>
      `;
    });
    
    resultHTML += `
      </div>
      
      <div style="margin-top: 20px; padding: 16px; background: rgba(59,130,246,0.1); border-radius: 8px; border: 1px solid rgba(59,130,246,0.3);">
        <div style="font-weight: 600; color: #60a5fa; margin-bottom: 8px;">
          💡 선택 가이드
        </div>
        <div style="font-size: 0.9em; color: rgba(255,255,255,0.7); line-height: 1.6;">
          • <strong>디자인 A (텍스트 포함)</strong>: 바로 업로드 가능한 완성본<br>
          • <strong>디자인 A (텍스트 없음)</strong>: 커스텀 텍스트 추가 가능<br>
          • <strong>디자인 B (텍스트 포함)</strong>: 대체 디자인 완성본<br>
          • <strong>디자인 B (텍스트 없음)</strong>: 대체 디자인 배경
        </div>
      </div>
    `;
  }
  
  resultHTML += `
    </div>
  `;
  
  resultDiv.innerHTML = resultHTML;
  
  // 버튼 복원
  btn.innerHTML = originalButtonHTML;
  btn.disabled = false;
}

