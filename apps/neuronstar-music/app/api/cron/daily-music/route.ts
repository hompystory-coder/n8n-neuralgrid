import { NextRequest, NextResponse } from 'next/server';
import { generateAndSaveMusic } from '@/lib/services/music-manager.service';

function distributeGenres(totalCount: number): string[] {
  const genres = ['pop', 'rock', 'jazz', 'electronic', 'hip-hop', 'classical', 'country', 'r&b'];
  const distribution: string[] = [];
  const perGenre = Math.floor(totalCount / genres.length);
  const remainder = totalCount % genres.length;

  genres.forEach((genre) => {
    for (let i = 0; i < perGenre; i++) {
      distribution.push(genre);
    }
  });

  for (let i = 0; i < remainder; i++) {
    const randomGenre = genres[Math.floor(Math.random() * genres.length)];
    distribution.push(randomGenre);
  }

  return distribution.sort(() => Math.random() - 0.5);
}

export async function GET(request: NextRequest) {
  try {
    const cronSecret = request.headers.get('x-cron-secret');
    if (cronSecret !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sunoApiKey = process.env.SUNO_API_KEY;
    if (!sunoApiKey) {
      return NextResponse.json(
        { success: false, error: 'Suno API key not configured' },
        { status: 500 }
      );
    }

    console.log('🤖 자동 음악 생성 작업 시작...');
    const targetCount = 20;
    const genreDistribution = distributeGenres(targetCount);
    const results = [];
    const errors = [];

    for (let i = 0; i < genreDistribution.length; i += 2) {
      const genre = genreDistribution[i];
      try {
        console.log(`🎵 생성 중: ${genre} (${i + 1}-${i + 2}/${targetCount})`);
        const result = await generateAndSaveMusic({
          genre,
          count: 2,
          instrumental: Math.random() > 0.7,
          downloadToHDD: true,
          apiKey: sunoApiKey,
        });

        if (result.success) {
          results.push(...(result.tracks || []));
          console.log(`✅ 성공: ${genre} - ${result.tracks?.length || 0}곡`);
        } else {
          errors.push({ genre, error: result.message });
        }

        if (i + 2 < genreDistribution.length) {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      } catch (error: any) {
        errors.push({ genre, error: error.message });
      }
    }

    console.log(`✅ 자동 생성 완료: 성공 ${results.length}곡, 실패 ${errors.length}건`);
    return NextResponse.json({
      success: true,
      generated: results.length,
      errors: errors.length,
      results,
      errorDetails: errors,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
