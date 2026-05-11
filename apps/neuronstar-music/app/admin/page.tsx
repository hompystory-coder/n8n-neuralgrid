'use client';

import { useState, useEffect } from 'react';

interface Music {
  id: string;
  title: string;
  genre: string;
  audioUrl: string;
  thumbnailUrl?: string;
  duration: number;
  createdAt: string;
  status: string;
}

interface DashboardStats {
  totalMusic: number;
  todayGenerated: number;
  totalDownloads: number;
  quota: { completed: number; target: number };
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'music' | 'tasks'>('music');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [musicList, setMusicList] = useState<Music[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 음악 생성 모달
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    genre: 'pop',
    count: 1,
    customPrompt: '',
  });

  // 대시보드 통계 로드
  useEffect(() => {
    fetchStats();
    fetchMusicList();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchMusicList = async () => {
    try {
      const res = await fetch('/api/music');
      const data = await res.json();
      if (data.success) {
        setMusicList(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch music:', error);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          genre: generateForm.genre,
          count: generateForm.count,
          customPrompt: generateForm.customPrompt || undefined,
          downloadToHDD: true,
        }),
      });

      const result = await res.json();
      
      if (result.success) {
        alert(`✅ 성공! ${result.tracks?.length || 0}곡이 생성되었습니다.`);
        setShowGenerateModal(false);
        fetchStats();
        fetchMusicList();
      } else {
        alert(`❌ 실패: ${result.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('Generation failed:', error);
      alert('❌ 생성 요청 실패');
    } finally {
      setLoading(false);
    }
  };

  const genres = ['pop', 'rock', 'jazz', 'electronic', 'hip-hop', 'classical', 'country', 'r&b'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <span className="text-4xl">🎵</span>
                NeuronStar Music 관리자
              </h1>
              <p className="mt-2 opacity-90">AI 음악 생성 및 관리 시스템</p>
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-lg transition"
            >
              홈으로
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🎼</div>
              <div>
                <p className="text-gray-500 text-sm">전체 음악</p>
                <p className="text-3xl font-bold text-purple-600">{stats?.totalMusic || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-4">
              <div className="text-4xl">✨</div>
              <div>
                <p className="text-gray-500 text-sm">오늘 생성</p>
                <p className="text-3xl font-bold text-blue-600">{stats?.todayGenerated || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-4">
              <div className="text-4xl">📥</div>
              <div>
                <p className="text-gray-500 text-sm">다운로드</p>
                <p className="text-3xl font-bold text-green-600">{stats?.totalDownloads || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🎯</div>
              <div>
                <p className="text-gray-500 text-sm">일일 할당량</p>
                <p className="text-3xl font-bold text-orange-600">
                  {stats?.quota?.completed || 0}/{stats?.quota?.target || 20}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('music')}
              className={`flex-1 px-6 py-4 font-medium transition ${
                activeTab === 'music'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🎵 음악 관리
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex-1 px-6 py-4 font-medium transition ${
                activeTab === 'tasks'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ⚙️ 수노 작업
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'music' && (
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">음악 목록</h2>
              <button
                onClick={() => setShowGenerateModal(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition font-medium"
              >
                + 음악 생성 요청
              </button>
            </div>

            {/* Music List */}
            <div className="space-y-4">
              {musicList.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-6xl mb-4">🎵</div>
                  <p>생성된 음악이 없습니다</p>
                </div>
              ) : (
                musicList.map((music) => (
                  <div
                    key={music.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition"
                  >
                    <img
                      src={music.thumbnailUrl || '/placeholder-music.png'}
                      alt={music.title}
                      className="w-16 h-16 rounded object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold">{music.title}</h3>
                      <p className="text-sm text-gray-500">
                        {music.genre} • {Math.floor(music.duration / 60)}:{String(music.duration % 60).padStart(2, '0')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:bg-blue-50 px-4 py-2 rounded">
                        ▶️ 재생
                      </button>
                      <button className="text-green-600 hover:bg-green-50 px-4 py-2 rounded">
                        📥 다운로드
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-bold mb-6">수노 자동 작업</h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="font-bold text-blue-900 mb-2">⏰ 자동 생성 스케줄</h3>
              <p className="text-blue-800 mb-4">
                매일 오전 2시에 자동으로 20곡을 생성합니다.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">다음 실행:</p>
                  <p className="font-mono font-bold">내일 오전 02:00</p>
                </div>
                <div>
                  <p className="text-gray-600">장르 분배:</p>
                  <p className="font-mono">자동 (균등 분배)</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg">최근 작업 히스토리</h3>
              <p className="text-gray-500">작업 히스토리가 없습니다.</p>
            </div>
          </div>
        )}
      </div>

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-2xl font-bold mb-6">음악 생성 요청</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">장르</label>
                <select
                  value={generateForm.genre}
                  onChange={(e) => setGenerateForm({ ...generateForm, genre: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                >
                  {genres.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">생성 곡수</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={generateForm.count}
                  onChange={(e) => setGenerateForm({ ...generateForm, count: parseInt(e.target.value) })}
                  className="w-full border rounded-lg px-4 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">Suno API는 한 번에 2곡씩 생성됩니다</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  프롬프트 (선택사항, 최대 500자)
                </label>
                <textarea
                  value={generateForm.customPrompt}
                  onChange={(e) => setGenerateForm({ ...generateForm, customPrompt: e.target.value })}
                  placeholder="예: 밝고 경쾌한 분위기의 여름 팝송..."
                  className="w-full border rounded-lg px-4 py-2 h-24 resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{generateForm.customPrompt.length}/500자</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  💡 프롬프트 작성 도움말:
                </p>
                <ul className="text-xs text-yellow-700 mt-2 space-y-1">
                  <li>• 분위기, 악기, 템포 등을 구체적으로 설명하세요</li>
                  <li>• 예: "경쾌한 기타 리프와 드럼 비트가 있는 신나는 팝"</li>
                  <li>• 감정: 행복한, 슬픈, 신나는, 차분한 등</li>
                </ul>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition"
                  disabled={loading}
                >
                  취소
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition font-medium disabled:opacity-50"
                >
                  {loading ? '생성 중...' : '생성 요청'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
