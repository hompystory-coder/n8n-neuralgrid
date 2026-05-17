// Admin Dashboard: NeuronStar Music - Premium Control Panel
// Advanced music generation and management system

'use client';

import { useState, useEffect } from 'react';

interface Music {
  id: string;
  title: string;
  genre: string;
  thumbnailUrl?: string;
  audioUrl: string;
  duration: number;
  viewCount: number;
  likeCount: number;
  downloadCount: number;
  createdAt: string;
}

interface Stats {
  totalMusic: number;
  todayGenerated: number;
  totalDownloads: number;
  quota: {
    completed: number;
    target: number;
  };
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'generate' | 'music' | 'suno'>('dashboard');
  const [genre, setGenre] = useState('pop');
  const [count, setCount] = useState(2);
  const [customPrompt, setCustomPrompt] = useState('');
  const [instrumental, setInstrumental] = useState(false);
  const [downloadToHDD, setDownloadToHDD] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [musicList, setMusicList] = useState<Music[]>([]);
  const [adminKey, setAdminKey] = useState('');

  const genres = ['pop', 'rock', 'hip-hop', 'electronic', 'jazz', 'classical', 'r&b', 'country'];

  useEffect(() => {
    const storedKey = localStorage.getItem('admin_api_key');
    if (storedKey) {
      setAdminKey(storedKey);
      fetchStats(storedKey);
      fetchMusic();
    }
  }, []);

  const fetchStats = async (key?: string) => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          'x-admin-key': key || adminKey
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchMusic = async () => {
    try {
      const response = await fetch('/api/music?limit=50');
      const data = await response.json();
      if (data.success) {
        setMusicList(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch music:', error);
    }
  };

  const handleGenerate = async () => {
    if (!adminKey) {
      alert('Please enter your Admin API Key first');
      return;
    }

    localStorage.setItem('admin_api_key', adminKey);
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          genre,
          count,
          customPrompt: customPrompt || undefined,
          instrumental,
          downloadToHDD
        })
      });

      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        await fetchStats();
        await fetchMusic();
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteMusic = async (id: string) => {
    if (!confirm('Are you sure you want to delete this track?')) return;
    
    // TODO: Implement delete API
    alert('Delete functionality will be implemented');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Top Navigation */}
      <nav className="bg-black/50 backdrop-blur-xl border-b border-purple-500/30 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                🎛️ NeuronStar Admin
              </h1>
              <a
                href="/"
                className="px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg text-sm transition-all"
              >
                ← Back to Music
              </a>
            </div>
            
            {stats && (
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="text-gray-400">Total Music:</span>
                  <span className="ml-2 font-bold text-purple-300">{stats.totalMusic}</span>
                </div>
                <div>
                  <span className="text-gray-400">Today:</span>
                  <span className="ml-2 font-bold text-green-400">{stats.todayGenerated}</span>
                </div>
                <div>
                  <span className="text-gray-400">Quota:</span>
                  <span className="ml-2 font-bold text-yellow-400">
                    {stats.quota.completed}/{stats.quota.target}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div className="bg-black/30 backdrop-blur-md border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {[
              { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
              { id: 'generate', label: '🎵 Generate Music', icon: '🎵' },
              { id: 'music', label: '🎧 Music Library', icon: '🎧' },
              { id: 'suno', label: '⚙️ Suno Jobs', icon: '⚙️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white border-b-2 border-purple-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold mb-6">Dashboard Overview</h2>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-purple-600/20 to-purple-600/5 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
                <div className="text-4xl mb-2">🎵</div>
                <div className="text-3xl font-bold mb-1">{stats.totalMusic}</div>
                <div className="text-sm text-gray-400">Total Music Tracks</div>
              </div>

              <div className="bg-gradient-to-br from-green-600/20 to-green-600/5 backdrop-blur-md rounded-xl p-6 border border-green-500/30">
                <div className="text-4xl mb-2">✨</div>
                <div className="text-3xl font-bold mb-1">{stats.todayGenerated}</div>
                <div className="text-sm text-gray-400">Generated Today</div>
              </div>

              <div className="bg-gradient-to-br from-blue-600/20 to-blue-600/5 backdrop-blur-md rounded-xl p-6 border border-blue-500/30">
                <div className="text-4xl mb-2">⬇️</div>
                <div className="text-3xl font-bold mb-1">{stats.totalDownloads}</div>
                <div className="text-sm text-gray-400">Total Downloads</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-600/5 backdrop-blur-md rounded-xl p-6 border border-yellow-500/30">
                <div className="text-4xl mb-2">🎯</div>
                <div className="text-3xl font-bold mb-1">
                  {stats.quota.completed}/{stats.quota.target}
                </div>
                <div className="text-sm text-gray-400">Daily Quota</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
              <h3 className="text-xl font-bold mb-4">Daily Generation Progress</h3>
              <div className="bg-gray-700 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 h-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{
                    width: `${Math.min(100, (stats.quota.completed / stats.quota.target) * 100)}%`
                  }}
                >
                  <span className="text-xs font-bold">
                    {Math.round((stats.quota.completed / stats.quota.target) * 100)}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                {stats.quota.target - stats.quota.completed} tracks remaining today
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => setActiveTab('generate')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl p-8 text-left transition-all shadow-lg shadow-purple-500/30"
              >
                <div className="text-4xl mb-3">🎵</div>
                <h3 className="text-2xl font-bold mb-2">Generate Music</h3>
                <p className="text-gray-200">Create new AI-generated music tracks</p>
              </button>

              <button
                onClick={() => setActiveTab('music')}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl p-8 text-left transition-all shadow-lg shadow-blue-500/30"
              >
                <div className="text-4xl mb-3">🎧</div>
                <h3 className="text-2xl font-bold mb-2">Music Library</h3>
                <p className="text-gray-200">Browse and manage all music tracks</p>
              </button>
            </div>
          </div>
        )}

        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold mb-6">Generate AI Music</h2>

            <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
              {/* Admin Key */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  🔑 Admin API Key
                </label>
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Enter your admin API key"
                  className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500 text-white placeholder-gray-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Genre */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    🎼 Genre
                  </label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500 capitalize text-white"
                  >
                    {genres.map((g) => (
                      <option key={g} value={g} className="bg-gray-900 capitalize">
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Count */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    🔢 Number of Tracks
                  </label>
                  <input
                    type="number"
                    value={count}
                    onChange={(e) => setCount(Math.min(10, Math.max(2, parseInt(e.target.value) || 2)))}
                    min="2"
                    max="10"
                    step="2"
                    className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">Generates in pairs (2, 4, 6, 8, 10)</p>
                </div>
              </div>

              {/* Custom Prompt */}
              <div className="mt-6">
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  ✍️ Custom Prompt (Optional)
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value.substring(0, 500))}
                  placeholder="Describe the music you want to create..."
                  rows={4}
                  className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500 text-white placeholder-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">{customPrompt.length}/500 characters</p>
              </div>

              {/* Options */}
              <div className="mt-6 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={instrumental}
                    onChange={(e) => setInstrumental(e.target.checked)}
                    className="w-5 h-5 rounded border-purple-500/30 bg-black/30"
                  />
                  <span className="text-sm group-hover:text-purple-300 transition-colors">
                    🎼 Instrumental (no vocals)
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={downloadToHDD}
                    onChange={(e) => setDownloadToHDD(e.target.checked)}
                    className="w-5 h-5 rounded border-purple-500/30 bg-black/30"
                  />
                  <span className="text-sm group-hover:text-purple-300 transition-colors">
                    💾 Download to External HDD
                  </span>
                </label>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full mt-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Generating... (2-5 minutes)
                  </span>
                ) : (
                  `🎵 Generate ${count} Tracks`
                )}
              </button>
            </div>

            {/* Result */}
            {result && (
              <div
                className={`p-6 rounded-xl border ${
                  result.success
                    ? 'bg-green-900/20 border-green-500/50'
                    : 'bg-red-900/20 border-red-500/50'
                }`}
              >
                <h3 className="text-xl font-bold mb-3">
                  {result.success ? '✅ Success!' : '❌ Failed'}
                </h3>
                <p className="text-gray-200">{result.message}</p>
              </div>
            )}
          </div>
        )}

        {/* Music Library Tab */}
        {activeTab === 'music' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Music Library</h2>
              <button
                onClick={fetchMusic}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all"
              >
                🔄 Refresh
              </button>
            </div>

            {musicList.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <div className="text-6xl mb-4">🎵</div>
                <p>No music tracks yet. Generate some!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {musicList.map((music) => (
                  <div
                    key={music.id}
                    className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-purple-500/30 hover:border-purple-500/50 transition-all flex items-center gap-4"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                      {music.thumbnailUrl ? (
                        <img
                          src={music.thumbnailUrl}
                          alt={music.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-2xl">🎵</div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg truncate">{music.title}</h3>
                      <p className="text-sm text-purple-300 capitalize">{music.genre}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                        <span>👁️ {music.viewCount}</span>
                        <span>❤️ {music.likeCount}</span>
                        <span>⬇️ {music.downloadCount}</span>
                        <span>⏱️ {Math.floor(music.duration / 60)}:{(music.duration % 60).toString().padStart(2, '0')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={music.audioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition-all"
                      >
                        ▶️ Play
                      </a>
                      <button
                        onClick={() => deleteMusic(music.id)}
                        className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg text-sm transition-all"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Suno Jobs Tab */}
        {activeTab === 'suno' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold mb-6">Suno Automated Jobs</h2>

            <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
              <h3 className="text-xl font-bold mb-4">⏰ Daily Auto-Generation</h3>
              <p className="text-gray-300 mb-4">
                Automatically generates 20 songs every day at 2:00 AM
              </p>
              
              <div className="bg-black/30 rounded-lg p-4">
                <pre className="text-sm text-gray-400">
                  Schedule: 0 2 * * * (Daily at 2:00 AM){'\n'}
                  Target: 20 tracks/day{'\n'}
                  Genres: Distributed across all genres{'\n'}
                  Status: {stats ? '🟢 Active' : '🔴 Inactive'}
                </pre>
              </div>

              <button
                className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all"
              >
                🔧 Configure Schedule
              </button>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-xl p-6">
              <h4 className="font-bold text-yellow-300 mb-2">⚠️ Coming Soon</h4>
              <p className="text-sm text-gray-300">
                Advanced job management, history logs, and manual triggers will be available in the next update.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
