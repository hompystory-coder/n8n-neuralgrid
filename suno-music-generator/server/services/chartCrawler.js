/**
 * 🔥 인기 차트 크롤링 서비스
 * 
 * 목적: 하루에 한 번 인기 차트 크롤링하여 레퍼런스로 활용
 * 비용 절감: 가사 생성 시마다 크롤링하지 않고 캐시 활용
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

class ChartCrawler {
    constructor() {
        this.dataPath = path.join(__dirname, '../data/charts.json');
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24시간
    }

    /**
     * 저장된 차트 데이터 로드
     */
    async loadCachedCharts() {
        try {
            const data = await fs.readFile(this.dataPath, 'utf8');
            const charts = JSON.parse(data);
            
            // 캐시가 24시간 이내인지 확인
            const lastUpdate = new Date(charts.lastUpdated);
            const now = new Date();
            const isExpired = (now - lastUpdate) > this.cacheExpiry;
            
            return {
                ...charts,
                isExpired,
                needsUpdate: isExpired
            };
        } catch (error) {
            console.log('캐시된 차트 없음, 새로 크롤링 필요');
            return null;
        }
    }

    /**
     * Bugs Music TOP 100 크롤링 (한국 차트)
     * 
     * Bugs는 robots.txt가 비교적 관대하고 구조가 단순함
     */
    async crawlBugs() {
        try {
            console.log('🐛 Bugs Music 차트 크롤링 시작...');
            
            const url = 'https://music.bugs.co.kr/chart';
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            const $ = cheerio.load(response.data);
            const songs = [];
            
            // TOP 50만 수집 (비용 절감)
            $('tbody tr').slice(0, 50).each((index, element) => {
                try {
                    const rank = index + 1;
                    const title = $(element).find('.title a').first().text().trim();
                    const artist = $(element).find('.artist a').first().text().trim();
                    const album = $(element).find('.album a').first().text().trim();
                    
                    // 🎵 미리듣기 링크 추출
                    const trackId = $(element).attr('trackid');
                    const previewUrl = trackId ? `https://music.bugs.co.kr/track/${trackId}` : null;
                    
                    // 🎵 앨범 이미지 URL 추출
                    const albumImg = $(element).find('.thumbnail img').attr('src');
                    
                    if (title && artist) {
                        songs.push({
                            rank,
                            title,
                            artist,
                            album,
                            trackId,
                            previewUrl,
                            albumImage: albumImg || null,
                            source: 'bugs'
                        });
                    }
                } catch (err) {
                    console.error(`곡 ${index} 파싱 오류:`, err.message);
                }
            });
            
            console.log(`✅ Bugs Music ${songs.length}곡 수집 완료`);
            return songs;
            
        } catch (error) {
            console.error('❌ Bugs Music 크롤링 실패:', error.message);
            return [];
        }
    }

    /**
     * YouTube Music Trending (Korea) - YouTube Data API v3 사용
     * 
     * 무료 할당량: 하루 10,000 units
     * 검색 요청: 100 units
     * 비디오 정보: 1 unit
     */
    async crawlYouTube() {
        try {
            // YouTube Data API 키 필요
            const apiKey = process.env.YOUTUBE_API_KEY;
            
            if (!apiKey) {
                console.log('⚠️ YouTube API 키 없음, 스킵');
                return [];
            }
            
            console.log('🎬 YouTube Music 차트 크롤링 시작...');
            
            // K-POP/Korean Music 트렌딩
            const url = 'https://www.googleapis.com/youtube/v3/search';
            const response = await axios.get(url, {
                params: {
                    key: apiKey,
                    part: 'snippet',
                    q: 'kpop music 2024 official mv',
                    type: 'video',
                    videoCategoryId: '10', // Music category
                    regionCode: 'KR',
                    order: 'viewCount',
                    maxResults: 30
                }
            });
            
            const songs = response.data.items.map((item, index) => ({
                rank: index + 1,
                title: item.snippet.title,
                artist: item.snippet.channelTitle,
                videoId: item.id.videoId,
                thumbnail: item.snippet.thumbnails.high.url,
                source: 'youtube'
            }));
            
            console.log(`✅ YouTube Music ${songs.length}곡 수집 완료`);
            return songs;
            
        } catch (error) {
            console.error('❌ YouTube Music 크롤링 실패:', error.message);
            return [];
        }
    }

    /**
     * Spotify Web API 사용
     * 
     * 인증: Client Credentials Flow
     * 무료: 월 50,000 요청
     */
    async crawlSpotify() {
        try {
            const clientId = process.env.SPOTIFY_CLIENT_ID;
            const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
            
            if (!clientId || !clientSecret) {
                console.log('⚠️ Spotify API 키 없음, 스킵');
                return [];
            }
            
            console.log('🎵 Spotify 차트 크롤링 시작...');
            
            // 1. Access Token 획득
            const authResponse = await axios.post(
                'https://accounts.spotify.com/api/token',
                'grant_type=client_credentials',
                {
                    headers: {
                        'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );
            
            const accessToken = authResponse.data.access_token;
            
            // 2. Top Tracks in Korea Playlist 검색
            const playlistResponse = await axios.get(
                'https://api.spotify.com/v1/playlists/37i9dQZEVXbJZGli0rRP3r/tracks', // Top 50 - South Korea
                {
                    headers: {
                        'Authorization': 'Bearer ' + accessToken
                    },
                    params: {
                        limit: 30
                    }
                }
            );
            
            const songs = playlistResponse.data.items.map((item, index) => ({
                rank: index + 1,
                title: item.track.name,
                artist: item.track.artists.map(a => a.name).join(', '),
                album: item.track.album.name,
                spotifyUrl: item.track.external_urls.spotify,
                previewUrl: item.track.preview_url,
                popularity: item.track.popularity,
                source: 'spotify'
            }));
            
            console.log(`✅ Spotify ${songs.length}곡 수집 완료`);
            return songs;
            
        } catch (error) {
            console.error('❌ Spotify 크롤링 실패:', error.message);
            return [];
        }
    }

    /**
     * 🎵 통합 가사 추출 (여러 소스 시도)
     * 1순위: Genius API
     * 2순위: AZLyrics
     * 3순위: Lyrics.com
     * 4순위: Bugs Music 가사
     */
    async getLyrics(title, artist) {
        console.log(`🎤 가사 추출 시도: "${title}" - ${artist}`);
        
        // 1순위: Genius API
        let lyrics = await this.getLyricsFromGenius(title, artist);
        if (lyrics) {
            console.log('✅ Genius에서 가사 추출 성공');
            return lyrics;
        }
        
        // 2순위: AZLyrics (무료, API 없음)
        lyrics = await this.getLyricsFromAZLyrics(title, artist);
        if (lyrics) {
            console.log('✅ AZLyrics에서 가사 추출 성공');
            return lyrics;
        }
        
        // 3순위: Lyrics.com
        lyrics = await this.getLyricsFromLyricsCom(title, artist);
        if (lyrics) {
            console.log('✅ Lyrics.com에서 가사 추출 성공');
            return lyrics;
        }
        
        // 4순위: Bugs Music (한국 음악 전용)
        lyrics = await this.getLyricsFromBugs(title, artist);
        if (lyrics) {
            console.log('✅ Bugs Music에서 가사 추출 성공');
            return lyrics;
        }
        
        console.log('❌ 모든 소스에서 가사 추출 실패');
        return null;
    }
    
    /**
     * Genius API로 가사 추출
     */
    async getLyricsFromGenius(title, artist) {
        try {
            const accessToken = process.env.GENIUS_ACCESS_TOKEN;
            
            if (!accessToken) {
                return null;
            }
            
            // 1. 곡 검색
            const searchResponse = await axios.get('https://api.genius.com/search', {
                headers: {
                    'Authorization': 'Bearer ' + accessToken
                },
                params: {
                    q: `${title} ${artist}`
                },
                timeout: 10000
            });
            
            if (searchResponse.data.response.hits.length === 0) {
                return null;
            }
            
            const songPath = searchResponse.data.response.hits[0].result.path;
            
            // 2. 가사 페이지 크롤링
            const lyricsUrl = `https://genius.com${songPath}`;
            const pageResponse = await axios.get(lyricsUrl, { timeout: 10000 });
            const $ = cheerio.load(pageResponse.data);
            
            const lyrics = $('[data-lyrics-container="true"]').text().trim();
            
            return lyrics || null;
            
        } catch (error) {
            console.error(`Genius 가사 추출 실패:`, error.message);
            return null;
        }
    }
    
    /**
     * AZLyrics에서 가사 추출 (백업)
     */
    async getLyricsFromAZLyrics(title, artist) {
        try {
            // AZLyrics URL 형식: https://www.azlyrics.com/lyrics/artistname/songtitle.html
            const cleanArtist = artist.toLowerCase().replace(/[^a-z0-9]/g, '');
            const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
            
            const url = `https://www.azlyrics.com/lyrics/${cleanArtist}/${cleanTitle}.html`;
            
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 10000
            });
            
            const $ = cheerio.load(response.data);
            
            // AZLyrics 구조: div 태그 중 class 없고 가사만 있는 부분
            let lyrics = '';
            $('div').each((i, elem) => {
                const text = $(elem).text().trim();
                // 가사는 보통 여러 줄이고 [Verse], [Chorus] 같은 태그 포함
                if (text.length > 200 && (text.includes('[') || text.includes('\n\n'))) {
                    lyrics = text;
                    return false; // break
                }
            });
            
            return lyrics || null;
            
        } catch (error) {
            return null;
        }
    }
    
    /**
     * Lyrics.com에서 가사 추출 (백업)
     */
    async getLyricsFromLyricsCom(title, artist) {
        try {
            // Lyrics.com 검색 후 크롤링
            const searchUrl = `https://www.lyrics.com/lyrics/${encodeURIComponent(title + ' ' + artist)}`;
            
            const response = await axios.get(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 10000
            });
            
            const $ = cheerio.load(response.data);
            
            // Lyrics.com 가사 구조
            const lyrics = $('#lyric-body-text').text().trim();
            
            return lyrics || null;
            
        } catch (error) {
            return null;
        }
    }
    
    /**
     * Bugs Music에서 가사 추출 (한국 음악 특화)
     */
    async getLyricsFromBugs(title, artist) {
        try {
            console.log(`🐛 Bugs Music 가사 추출 시도: "${title}" - ${artist}`);
            
            // Bugs Music 검색
            const searchUrl = 'https://music.bugs.co.kr/search/track';
            const response = await axios.get(searchUrl, {
                params: {
                    q: `${title} ${artist}`
                },
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 10000
            });
            
            const $ = cheerio.load(response.data);
            
            // table.list에서 첫 번째 곡의 링크 추출
            const firstLink = $('table.list tbody tr').first().find('a[href*="/track/"]').attr('href');
            
            if (!firstLink) {
                console.log('   ❌ 곡 링크를 찾을 수 없음');
                return null;
            }
            
            // /track/6450133 형식에서 trackId 추출
            const trackIdMatch = firstLink.match(/\/track\/(\d+)/);
            if (!trackIdMatch) {
                console.log('   ❌ trackId 추출 실패');
                return null;
            }
            
            const trackId = trackIdMatch[1];
            console.log(`   ✅ trackId 추출: ${trackId}`);
            
            // 곡 상세 페이지에서 가사 가져오기
            const lyricsUrl = `https://music.bugs.co.kr/track/${trackId}`;
            console.log(`   📄 가사 페이지 요청: ${lyricsUrl}`);
            
            const lyricsResponse = await axios.get(lyricsUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 10000
            });
            
            const $lyrics = cheerio.load(lyricsResponse.data);
            
            // 가사 추출 (여러 셀렉터 시도)
            let lyrics = $lyrics('.lyricsContainer').text().trim();
            if (!lyrics) lyrics = $lyrics('#lyrics').text().trim();
            if (!lyrics) lyrics = $lyrics('xmp').text().trim();  // Bugs는 종종 xmp 태그 사용
            
            if (lyrics && lyrics.length > 0) {
                console.log(`   ✅ 가사 추출 성공 (${lyrics.length}자)`);
                return lyrics;
            } else {
                console.log('   ❌ .lyricsContainer를 찾을 수 없음');
                // 다른 셀렉터도 시도
                const lyrics2 = $lyrics('.lyricsCont').text().trim();
                if (lyrics2) {
                    console.log(`   ✅ .lyricsCont에서 가사 추출 성공 (${lyrics2.length}자)`);
                    return lyrics2;
                }
                return null;
            }
            
        } catch (error) {
            console.log(`   ❌ Bugs Music 오류: ${error.message}`);
            return null;
        }
    }

    /**
     * 장르/무드 자동 분류
     */
    classifySong(title, artist) {
        const keywords = {
            ballad: ['사랑', '그리움', '이별', '추억', '눈물', 'love', 'miss', 'goodbye'],
            hiphop: ['rap', 'hip hop', '힙합', 'trap', 'drill'],
            pop: ['pop', '팝', 'dance', '댄스'],
            indie: ['indie', '인디', 'acoustic', '어쿠스틱'],
            rnb: ['r&b', 'rnb', 'soul', '소울']
        };
        
        const text = `${title} ${artist}`.toLowerCase();
        
        for (const [genre, words] of Object.entries(keywords)) {
            if (words.some(word => text.includes(word))) {
                return genre;
            }
        }
        
        return 'pop'; // 기본값
    }

    /**
     * 모든 소스 통합 및 저장
     */
    async updateCharts() {
        try {
            console.log('📊 차트 업데이트 시작...');
            const startTime = Date.now();
            
            // 병렬로 크롤링 실행
            const [bugs, youtube, spotify] = await Promise.all([
                this.crawlBugs(),
                this.crawlYouTube(),
                this.crawlSpotify()
            ]);
            
            // 소스별로 정리
            const allSongs = [
                ...bugs.map(s => ({ ...s, source: 'bugs' })),
                ...youtube.map(s => ({ ...s, source: 'youtube' })),
                ...spotify.map(s => ({ ...s, source: 'spotify' }))
            ];
            
            // 중복 제거 (제목+아티스트 기준)
            const uniqueSongs = [];
            const seen = new Set();
            
            for (const song of allSongs) {
                const key = `${song.title.toLowerCase()}-${song.artist.toLowerCase()}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    uniqueSongs.push({
                        ...song,
                        genre: this.classifySong(song.title, song.artist)
                    });
                }
            }
            
            // 장르별로 그룹화
            const byGenre = {
                ballad: [],
                hiphop: [],
                pop: [],
                indie: [],
                rnb: []
            };
            
            uniqueSongs.forEach(song => {
                if (byGenre[song.genre]) {
                    byGenre[song.genre].push(song);
                }
            });
            
            // 데이터 저장
            const chartData = {
                lastUpdated: new Date().toISOString(),
                nextUpdate: new Date(Date.now() + this.cacheExpiry).toISOString(),
                totalSongs: uniqueSongs.length,
                sources: {
                    bugs: bugs.length,
                    youtube: youtube.length,
                    spotify: spotify.length
                },
                charts: byGenre
            };
            
            // 디렉토리 생성
            const dataDir = path.dirname(this.dataPath);
            await fs.mkdir(dataDir, { recursive: true });
            
            // 파일 저장
            await fs.writeFile(this.dataPath, JSON.stringify(chartData, null, 2));
            
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`✅ 차트 업데이트 완료! (${elapsed}초)`);
            console.log(`📊 총 ${chartData.totalSongs}곡 수집 (Bugs: ${bugs.length}, YouTube: ${youtube.length}, Spotify: ${spotify.length})`);
            
            return chartData;
            
        } catch (error) {
            console.error('❌ 차트 업데이트 실패:', error);
            throw error;
        }
    }

    /**
     * 차트 데이터 조회 (캐시 우선)
     */
    async getCharts(forceUpdate = false) {
        // 캐시 확인
        if (!forceUpdate) {
            const cached = await this.loadCachedCharts();
            if (cached && !cached.needsUpdate) {
                console.log('✅ 캐시된 차트 데이터 사용');
                return cached;
            }
        }
        
        // 캐시 없거나 만료됨 → 새로 크롤링
        return await this.updateCharts();
    }
}

module.exports = new ChartCrawler();
