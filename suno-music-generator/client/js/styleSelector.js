/**
 * 🎵 Style Selector Module
 * 198개 장르 데이터베이스를 활용한 스타일 선택 시스템
 * 
 * 3가지 사용자 경험 제공:
 * 1. 빠른 시작 (Quick Start) - 20개 프리셋
 * 2. AI 추천 (Smart Recommendation) - 가사 기반 Top 3 추천
 * 3. 프로 모드 (Professional) - 198개 장르 전체 브라우저
 */

class StyleSelector {
    constructor() {
        this.genres = [];
        this.categories = [];
        this.presets = [];
        this.currentMode = 'quick'; // quick | ai | pro
        this.selectedGenre = null;
        this.customSettings = {
            bpm: 120,
            mood: [],
            instruments: []
        };
        
        this.init();
    }

    async init() {
        await this.loadData();
        this.render();
        this.attachEventListeners();
    }

    async loadData() {
        try {
            // 카테고리와 장르 목록 로드
            const categoriesRes = await fetch('/api/genres/categories');
            const categoriesData = await categoriesRes.json();
            this.categories = categoriesData.success ? categoriesData.data.categories : [];
            
            // 프리셋 로드
            const presetsRes = await fetch('/api/genres/presets');
            const presetsData = await presetsRes.json();
            this.presets = presetsData.success ? (presetsData.data.presets || presetsData.data) : [];
            
            console.log('✅ 스타일 데이터 로드 완료:', {
                categories: this.categories.length,
                presets: this.presets.length
            });
        } catch (error) {
            console.error('❌ 스타일 데이터 로드 실패:', error);
            this.showError('스타일 데이터를 불러올 수 없습니다.');
        }
    }

    render() {
        const container = document.getElementById('styleSelector');
        if (!container) {
            console.error('❌ styleSelector 컨테이너를 찾을 수 없습니다.');
            return;
        }

        container.innerHTML = `
            <div class="style-selector-container">
                <!-- 모드 선택 탭 -->
                <div class="mode-tabs">
                    <button class="mode-tab active" data-mode="quick">
                        <span class="icon">⚡</span>
                        <span class="label">빠른 시작</span>
                        <span class="desc">20개 프리셋</span>
                    </button>
                    <button class="mode-tab" data-mode="ai">
                        <span class="icon">🎯</span>
                        <span class="label">AI 추천</span>
                        <span class="desc">스마트 분석</span>
                    </button>
                    <button class="mode-tab" data-mode="pro">
                        <span class="icon">🎛️</span>
                        <span class="label">프로 모드</span>
                        <span class="desc">198개 장르</span>
                    </button>
                </div>

                <!-- 빠른 시작 모드 -->
                <div class="mode-content active" data-mode="quick">
                    <h3 class="mode-title">⚡ 빠른 시작 - 원하는 느낌을 클릭하세요!</h3>
                    <div class="presets-grid" id="presetsGrid">
                        ${this.renderPresets()}
                    </div>
                </div>

                <!-- AI 추천 모드 -->
                <div class="mode-content" data-mode="ai">
                    <h3 class="mode-title">🎯 AI 추천 - 가사를 분석해서 최적의 장르를 찾아드립니다</h3>
                    <div class="ai-input-section">
                        <textarea 
                            id="lyricsForAI" 
                            placeholder="가사를 입력하면 AI가 자동으로 분위기를 분석하여 어울리는 장르를 추천해드립니다&#10;&#10;예시:&#10;봄날의 햇살이 나를 감싸면&#10;네 생각이 나서 눈물이 나&#10;우리가 함께했던 그 거리를&#10;혼자 걷는 이 밤이 너무 길어"
                            rows="6"
                        ></textarea>
                        <button class="btn-analyze" id="btnAnalyzeLyrics">
                            <span class="icon">🔍</span>
                            AI 분석 시작
                        </button>
                    </div>
                    <div class="ai-recommendations" id="aiRecommendations">
                        <!-- AI 추천 결과가 여기에 표시됩니다 -->
                    </div>
                </div>

                <!-- 프로 모드 -->
                <div class="mode-content" data-mode="pro">
                    <h3 class="mode-title">🎛️ 프로 모드 - 세밀한 조정으로 완벽한 사운드를 만드세요</h3>
                    
                    <!-- 카테고리 선택 -->
                    <div class="pro-section">
                        <h4 class="section-title">1️⃣ 장르 카테고리 선택 (12개)</h4>
                        <div class="categories-grid" id="categoriesGrid">
                            ${this.renderCategories()}
                        </div>
                    </div>

                    <!-- 장르 목록 (카테고리 선택 후 표시) -->
                    <div class="pro-section" id="genresSection" style="display: none;">
                        <h4 class="section-title">2️⃣ 세부 장르 선택</h4>
                        <div class="search-box">
                            <input 
                                type="text" 
                                id="genreSearch" 
                                placeholder="장르 검색... (예: trap, ballad, rock)"
                            />
                        </div>
                        <div class="genres-list" id="genresList">
                            <!-- 선택된 카테고리의 장르들이 여기에 표시됩니다 -->
                        </div>
                    </div>

                    <!-- 세부 조정 (장르 선택 후 표시) -->
                    <div class="pro-section" id="customizeSection" style="display: none;">
                        <h4 class="section-title">3️⃣ 세부 조정</h4>
                        
                        <!-- BPM 슬라이더 -->
                        <div class="customize-item">
                            <label class="customize-label">
                                <span class="label-text">BPM (템포)</span>
                                <span class="bpm-value" id="bpmValue">120</span>
                            </label>
                            <input 
                                type="range" 
                                id="bpmSlider" 
                                min="60" 
                                max="180" 
                                value="120" 
                                step="1"
                                class="bpm-slider"
                            />
                            <div class="bpm-labels">
                                <span>느림 (60)</span>
                                <span>보통 (120)</span>
                                <span>빠름 (180)</span>
                            </div>
                        </div>

                        <!-- 무드 선택 -->
                        <div class="customize-item">
                            <label class="customize-label">분위기 (Mood)</label>
                            <div class="mood-tags" id="moodTags">
                                <!-- 선택된 장르의 무드가 여기에 표시됩니다 -->
                            </div>
                        </div>

                        <!-- 악기 선택 -->
                        <div class="customize-item">
                            <label class="customize-label">악기 (Instruments)</label>
                            <div class="instrument-tags" id="instrumentTags">
                                <!-- 선택된 장르의 악기가 여기에 표시됩니다 -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 선택된 스타일 미리보기 -->
                <div class="selected-style-preview" id="stylePreview" style="display: none;">
                    <h4 class="preview-title">📋 선택된 스타일 미리보기</h4>
                    <div class="preview-content" id="previewContent">
                        <!-- 선택 결과가 여기에 표시됩니다 -->
                    </div>
                    <div class="preview-prompt">
                        <label>🎵 Suno 프롬프트</label>
                        <textarea id="finalPrompt" readonly rows="3"></textarea>
                        <button class="btn-copy-prompt" id="btnCopyPrompt">
                            <span class="icon">📋</span>
                            프롬프트 복사
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderPresets() {
        if (this.presets.length === 0) {
            return '<div class="loading">프리셋 로딩 중...</div>';
        }

        return this.presets.map(preset => `
            <div class="preset-card" data-preset-id="${preset.id}">
                <div class="preset-emoji">${preset.emoji || '🎵'}</div>
                <div class="preset-name">${preset.name}</div>
                <div class="preset-desc">${preset.description}</div>
                <div class="preset-meta">
                    <span class="meta-genre">${preset.genre}</span>
                    <span class="meta-bpm">${preset.bpm} BPM</span>
                </div>
            </div>
        `).join('');
    }

    renderCategories() {
        if (this.categories.length === 0) {
            return '<div class="loading">카테고리 로딩 중...</div>';
        }

        return this.categories.map(cat => `
            <div class="category-card" data-category-id="${cat.id}">
                <div class="category-emoji">${cat.emoji}</div>
                <div class="category-name">${cat.name}</div>
                <div class="category-count">${cat.count}개 장르</div>
            </div>
        `).join('');
    }

    attachEventListeners() {
        // 모드 전환
        document.querySelectorAll('.mode-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchMode(e.currentTarget.dataset.mode));
        });

        // 프리셋 선택
        document.addEventListener('click', (e) => {
            const presetCard = e.target.closest('.preset-card');
            if (presetCard) {
                this.selectPreset(presetCard.dataset.presetId);
            }
        });

        // AI 분석 버튼
        const btnAnalyze = document.getElementById('btnAnalyzeLyrics');
        if (btnAnalyze) {
            btnAnalyze.addEventListener('click', () => this.analyzeWithAI());
        }

        // 카테고리 선택
        document.addEventListener('click', (e) => {
            const categoryCard = e.target.closest('.category-card');
            if (categoryCard) {
                this.selectCategory(categoryCard.dataset.categoryId);
            }
        });

        // 장르 검색
        const searchInput = document.getElementById('genreSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.searchGenres(e.target.value));
        }

        // BPM 슬라이더
        const bpmSlider = document.getElementById('bpmSlider');
        if (bpmSlider) {
            bpmSlider.addEventListener('input', (e) => this.updateBPM(e.target.value));
        }

        // 프롬프트 복사
        const btnCopy = document.getElementById('btnCopyPrompt');
        if (btnCopy) {
            btnCopy.addEventListener('click', () => this.copyPrompt());
        }
    }

    switchMode(mode) {
        this.currentMode = mode;

        // 탭 활성화
        document.querySelectorAll('.mode-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.mode === mode);
        });

        // 콘텐츠 활성화
        document.querySelectorAll('.mode-content').forEach(content => {
            content.classList.toggle('active', content.dataset.mode === mode);
        });

        console.log(`✅ 모드 전환: ${mode}`);
    }

    async selectPreset(presetId) {
        const preset = this.presets.find(p => p.id === presetId);
        if (!preset) return;

        console.log('✅ 프리셋 선택:', preset.name);

        // 프리셋을 Suno 프롬프트로 변환
        try {
            const response = await fetch('/api/genres/preset-to-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ presetId })
            });

            const result = await response.json();
            
            this.showPreview({
                name: preset.name,
                description: preset.description,
                genre: preset.genre,
                bpm: preset.bpm,
                mood: preset.mood,
                prompt: result.prompt,
                metadata: result.metadata
            });

            // 선택된 프리셋 시각적 표시
            document.querySelectorAll('.preset-card').forEach(card => {
                card.classList.toggle('selected', card.dataset.presetId === presetId);
            });

        } catch (error) {
            console.error('❌ 프리셋 변환 실패:', error);
            this.showError('프리셋을 처리할 수 없습니다.');
        }
    }

    async analyzeWithAI() {
        const lyrics = document.getElementById('lyricsForAI')?.value.trim();
        
        if (!lyrics) {
            alert('가사를 입력해주세요!');
            return;
        }

        const btnAnalyze = document.getElementById('btnAnalyzeLyrics');
        const originalText = btnAnalyze.innerHTML;
        btnAnalyze.disabled = true;
        btnAnalyze.innerHTML = '<span class="spinner">⏳</span> AI 분석 중...';

        try {
            const response = await fetch(`/api/genres/recommend?lyrics=${encodeURIComponent(lyrics)}&count=3`);
            const recommendations = await response.json();

            console.log('✅ AI 추천 결과:', recommendations);
            this.showAIRecommendations(recommendations);

        } catch (error) {
            console.error('❌ AI 분석 실패:', error);
            this.showError('AI 분석에 실패했습니다. 다시 시도해주세요.');
        } finally {
            btnAnalyze.disabled = false;
            btnAnalyze.innerHTML = originalText;
        }
    }

    showAIRecommendations(recommendations) {
        const container = document.getElementById('aiRecommendations');
        if (!container) return;

        container.innerHTML = `
            <div class="recommendations-header">
                <h4>🎯 AI 추천 결과 - Top 3</h4>
                <p class="recommendations-desc">가사의 감정과 분위기를 분석하여 가장 어울리는 장르를 선별했습니다</p>
            </div>
            <div class="recommendations-grid">
                ${recommendations.map((rec, index) => `
                    <div class="recommendation-card" data-genre-id="${rec.genreId}">
                        <div class="rec-badge">${index + 1}위 추천</div>
                        <div class="rec-emoji">${rec.emoji || '🎵'}</div>
                        <div class="rec-name">${rec.name}</div>
                        <div class="rec-category">${rec.category}</div>
                        <div class="rec-reason">${rec.reason}</div>
                        <div class="rec-meta">
                            <span class="meta-item">
                                <span class="meta-label">BPM</span>
                                <span class="meta-value">${rec.recommendedBPM}</span>
                            </span>
                            <span class="meta-item">
                                <span class="meta-label">무드</span>
                                <span class="meta-value">${rec.mood.slice(0, 2).join(', ')}</span>
                            </span>
                        </div>
                        <button class="btn-select-rec" data-genre-id="${rec.genreId}">
                            이 장르 선택
                        </button>
                    </div>
                `).join('')}
            </div>
        `;

        // 추천 장르 선택 이벤트
        container.querySelectorAll('.btn-select-rec').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const genreId = e.currentTarget.dataset.genreId;
                this.selectRecommendedGenre(genreId);
            });
        });
    }

    async selectRecommendedGenre(genreId) {
        try {
            const response = await fetch(`/api/genres/genre/${genreId}`);
            const genre = await response.json();

            console.log('✅ 추천 장르 선택:', genre.name);

            // 프롬프트 생성
            const promptResponse = await fetch('/api/genres/generate-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    genreId,
                    customBPM: genre.bpm.default
                })
            });

            const promptResult = await promptResponse.json();

            this.showPreview({
                name: genre.name,
                description: genre.description,
                genre: genre.name,
                bpm: genre.bpm.default,
                mood: genre.mood,
                instruments: genre.instruments,
                prompt: promptResult.prompt,
                metadata: promptResult.metadata
            });

            // 선택된 카드 강조
            document.querySelectorAll('.recommendation-card').forEach(card => {
                card.classList.toggle('selected', card.dataset.genreId === genreId);
            });

        } catch (error) {
            console.error('❌ 추천 장르 선택 실패:', error);
            this.showError('장르를 처리할 수 없습니다.');
        }
    }

    async selectCategory(categoryId) {
        try {
            const response = await fetch(`/api/genres/category/${categoryId}`);
            const genres = await response.json();

            console.log(`✅ 카테고리 선택: ${categoryId}, ${genres.length}개 장르`);

            // 카테고리 카드 활성화
            document.querySelectorAll('.category-card').forEach(card => {
                card.classList.toggle('selected', card.dataset.categoryId === categoryId);
            });

            // 장르 목록 표시
            const genresSection = document.getElementById('genresSection');
            const genresList = document.getElementById('genresList');
            
            if (genresSection && genresList) {
                genresSection.style.display = 'block';
                genresList.innerHTML = genres.map(genre => `
                    <div class="genre-item" data-genre-id="${genre.id}">
                        <div class="genre-info">
                            <div class="genre-name">${genre.name}</div>
                            <div class="genre-desc">${genre.description}</div>
                        </div>
                        <div class="genre-meta">
                            <span class="meta-bpm">${genre.bpm.min}-${genre.bpm.max} BPM</span>
                            <span class="meta-mood">${genre.mood.slice(0, 2).join(', ')}</span>
                        </div>
                    </div>
                `).join('');

                // 장르 선택 이벤트
                genresList.querySelectorAll('.genre-item').forEach(item => {
                    item.addEventListener('click', (e) => {
                        const genreId = e.currentTarget.dataset.genreId;
                        this.selectGenre(genres.find(g => g.id === genreId));
                    });
                });
            }

        } catch (error) {
            console.error('❌ 카테고리 로드 실패:', error);
            this.showError('카테고리를 불러올 수 없습니다.');
        }
    }

    async searchGenres(query) {
        if (!query || query.length < 2) return;

        try {
            const response = await fetch(`/api/genres/search?q=${encodeURIComponent(query)}`);
            const results = await response.json();

            console.log(`🔍 검색 결과: "${query}" - ${results.length}개`);

            const genresList = document.getElementById('genresList');
            if (genresList) {
                genresList.innerHTML = results.map(result => `
                    <div class="genre-item search-result" data-genre-id="${result.genre.id}">
                        <div class="genre-info">
                            <div class="genre-name">${result.genre.name}</div>
                            <div class="genre-desc">${result.genre.description}</div>
                        </div>
                        <div class="genre-meta">
                            <span class="meta-score">일치도: ${Math.round(result.score * 100)}%</span>
                            <span class="meta-bpm">${result.genre.bpm.min}-${result.genre.bpm.max} BPM</span>
                        </div>
                    </div>
                `).join('');

                // 검색 결과 클릭 이벤트
                genresList.querySelectorAll('.genre-item').forEach(item => {
                    item.addEventListener('click', (e) => {
                        const genreId = e.currentTarget.dataset.genreId;
                        const genre = results.find(r => r.genre.id === genreId)?.genre;
                        if (genre) this.selectGenre(genre);
                    });
                });
            }

        } catch (error) {
            console.error('❌ 검색 실패:', error);
        }
    }

    async selectGenre(genre) {
        this.selectedGenre = genre;

        console.log('✅ 장르 선택:', genre.name);

        // 장르 항목 활성화
        document.querySelectorAll('.genre-item').forEach(item => {
            item.classList.toggle('selected', item.dataset.genreId === genre.id);
        });

        // 세부 조정 섹션 표시
        const customizeSection = document.getElementById('customizeSection');
        if (customizeSection) {
            customizeSection.style.display = 'block';

            // BPM 슬라이더 초기화
            const bpmSlider = document.getElementById('bpmSlider');
            const bpmValue = document.getElementById('bpmValue');
            if (bpmSlider && bpmValue) {
                bpmSlider.min = genre.bpm.min;
                bpmSlider.max = genre.bpm.max;
                bpmSlider.value = genre.bpm.default;
                bpmValue.textContent = genre.bpm.default;
                this.customSettings.bpm = genre.bpm.default;
            }

            // 무드 태그 표시
            const moodTags = document.getElementById('moodTags');
            if (moodTags) {
                moodTags.innerHTML = genre.mood.map(mood => `
                    <label class="tag-checkbox">
                        <input type="checkbox" value="${mood}" checked>
                        <span class="tag-label">${mood}</span>
                    </label>
                `).join('');
                
                this.customSettings.mood = [...genre.mood];

                // 무드 변경 이벤트
                moodTags.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                    checkbox.addEventListener('change', (e) => {
                        if (e.target.checked) {
                            this.customSettings.mood.push(e.target.value);
                        } else {
                            this.customSettings.mood = this.customSettings.mood.filter(m => m !== e.target.value);
                        }
                        this.updatePreview();
                    });
                });
            }

            // 악기 태그 표시
            const instrumentTags = document.getElementById('instrumentTags');
            if (instrumentTags) {
                instrumentTags.innerHTML = genre.instruments.map(inst => `
                    <label class="tag-checkbox">
                        <input type="checkbox" value="${inst}" checked>
                        <span class="tag-label">${inst}</span>
                    </label>
                `).join('');
                
                this.customSettings.instruments = [...genre.instruments];

                // 악기 변경 이벤트
                instrumentTags.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                    checkbox.addEventListener('change', (e) => {
                        if (e.target.checked) {
                            this.customSettings.instruments.push(e.target.value);
                        } else {
                            this.customSettings.instruments = this.customSettings.instruments.filter(i => i !== e.target.value);
                        }
                        this.updatePreview();
                    });
                });
            }
        }

        // 초기 프리뷰 업데이트
        this.updatePreview();
    }

    updateBPM(bpm) {
        this.customSettings.bpm = parseInt(bpm);
        const bpmValue = document.getElementById('bpmValue');
        if (bpmValue) {
            bpmValue.textContent = bpm;
        }
        this.updatePreview();
    }

    async updatePreview() {
        if (!this.selectedGenre) return;

        try {
            const response = await fetch('/api/genres/generate-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    genreId: this.selectedGenre.id,
                    customBPM: this.customSettings.bpm,
                    customMood: this.customSettings.mood,
                    customInstruments: this.customSettings.instruments
                })
            });

            const result = await response.json();

            this.showPreview({
                name: this.selectedGenre.name,
                description: this.selectedGenre.description,
                genre: this.selectedGenre.name,
                bpm: this.customSettings.bpm,
                mood: this.customSettings.mood,
                instruments: this.customSettings.instruments,
                prompt: result.prompt,
                metadata: result.metadata
            });

        } catch (error) {
            console.error('❌ 프리뷰 업데이트 실패:', error);
        }
    }

    showPreview(data) {
        const preview = document.getElementById('stylePreview');
        const previewContent = document.getElementById('previewContent');
        const finalPrompt = document.getElementById('finalPrompt');

        if (!preview || !previewContent || !finalPrompt) return;

        preview.style.display = 'block';

        previewContent.innerHTML = `
            <div class="preview-item">
                <span class="preview-label">장르</span>
                <span class="preview-value">${data.name}</span>
            </div>
            <div class="preview-item">
                <span class="preview-label">설명</span>
                <span class="preview-value">${data.description}</span>
            </div>
            <div class="preview-item">
                <span class="preview-label">BPM</span>
                <span class="preview-value">${data.bpm}</span>
            </div>
            <div class="preview-item">
                <span class="preview-label">무드</span>
                <span class="preview-value">${Array.isArray(data.mood) ? data.mood.join(', ') : data.mood}</span>
            </div>
            ${data.instruments ? `
                <div class="preview-item">
                    <span class="preview-label">악기</span>
                    <span class="preview-value">${data.instruments.join(', ')}</span>
                </div>
            ` : ''}
        `;

        finalPrompt.value = data.prompt;

        // 스크롤하여 프리뷰 표시
        preview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    copyPrompt() {
        const promptTextarea = document.getElementById('finalPrompt');
        if (!promptTextarea) return;

        promptTextarea.select();
        document.execCommand('copy');

        const btnCopy = document.getElementById('btnCopyPrompt');
        if (btnCopy) {
            const originalText = btnCopy.innerHTML;
            btnCopy.innerHTML = '<span class="icon">✅</span> 복사 완료!';
            setTimeout(() => {
                btnCopy.innerHTML = originalText;
            }, 2000);
        }

        console.log('✅ 프롬프트 복사 완료');
    }

    showError(message) {
        alert(message);
    }

    // 외부에서 호출할 수 있는 메서드
    getSelectedPrompt() {
        const promptTextarea = document.getElementById('finalPrompt');
        return promptTextarea ? promptTextarea.value : '';
    }

    getSelectedStyle() {
        return {
            genre: this.selectedGenre,
            settings: this.customSettings,
            prompt: this.getSelectedPrompt()
        };
    }
}

// 전역에서 사용할 수 있도록 export
window.StyleSelector = StyleSelector;
