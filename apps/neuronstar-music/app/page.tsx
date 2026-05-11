// Homepage: NeuronStar Music
// Display music list with player

'use client';

import { useEffect, useState } from 'react';

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
  tags?: string;
  createdAt: string;
}

export default function HomePage() {
  const [musicList, setMusicList] = useState<Music[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState<Music | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedGenre, setSelectedGenre] = useState<string>('');

  const genres = ['pop', 'rock', 'hiphop', 'electronic', 'jazz', 'classical', 'ambient', 'lofi'];

  useEffect(() => {
    fetchMusic();
  }, [page, selectedGenre]);

  const fetchMusic = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      
      if (selectedGenre) {
        params.append('genre', selectedGenre);
      }

      const response = await fetch(`/api/music?${params}`);
      const data = await response.json();

      if (data.success) {
        setMusicList(data.music);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch music:', error);
    } finally {
      setLoading(false);
    }
  };

  const playTrack = (music: Music) => {
    setCurrentTrack(music);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-md border-b border-purple-500/30 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            🎵 NeuronStar Music
          </h1>
          <p className="text-gray-400 mt-1">AI-Generated Music Library</p>
        </div>
      </header>

      {/* Genre Filter */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedGenre('')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedGenre === ''
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            All Genres
          </button>
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${
                selectedGenre === genre
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Music Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {musicList.map((music) => (
                <div
                  key={music.id}
                  className="bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden border border-purple-500/20 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/20 cursor-pointer"
                  onClick={() => playTrack(music)}
                >
                  <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    {music.thumbnailUrl ? (
                      <img
                        src={music.thumbnailUrl}
                        alt={music.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-6xl">🎵</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg truncate">{music.title}</h3>
                    <p className="text-sm text-purple-300 capitalize mt-1">{music.genre}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-3">
                      <span>👁️ {music.viewCount}</span>
                      <span>❤️ {music.likeCount}</span>
                      <span>⬇️ {music.downloadCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Fixed Audio Player */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-purple-500/30 p-4">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <div className="flex-1">
              <h4 className="font-bold">{currentTrack.title}</h4>
              <p className="text-sm text-gray-400 capitalize">{currentTrack.genre}</p>
            </div>
            <audio
              controls
              autoPlay
              src={currentTrack.audioUrl}
              className="flex-1 max-w-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
