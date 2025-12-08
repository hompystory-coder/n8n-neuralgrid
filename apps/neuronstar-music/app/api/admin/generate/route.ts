import { NextRequest, NextResponse } from 'next/server';
import { generateAndSaveMusic, getTodayTaskProgress } from '@/lib/services/music-manager.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      genre,
      count = 2,
      customPrompt,
      downloadToHDD = true,
    } = body;

    if (!genre && !customPrompt) {
      return NextResponse.json(
        { success: false, error: 'Genre 또는 custom prompt가 필요합니다' },
        { status: 400 }
      );
    }

    const sunoApiKey = process.env.SUNO_API_KEY;
    if (!sunoApiKey) {
      return NextResponse.json(
        { success: false, error: 'Suno API key가 설정되지 않았습니다' },
        { status: 500 }
      );
    }

    // 일일 할당량 확인
    const taskProgress = await getTodayTaskProgress();
    if (taskProgress.completed >= taskProgress.target) {
      return NextResponse.json(
        {
          success: false,
          error: `일일 생성 한도 도달 (${taskProgress.completed}/${taskProgress.target})`,
          taskProgress,
        },
        { status: 429 }
      );
    }

    console.log(`🎵 음악 생성 시작: ${genre}, ${count}곡`);
    const result = await generateAndSaveMusic({
      genre,
      count,
      customPrompt,
      instrumental: false,
      downloadToHDD,
      apiKey: sunoApiKey,
    });

    const updatedProgress = await getTodayTaskProgress();

    return NextResponse.json({
      success: result.success,
      message: result.message,
      tracks: result.tracks,
      taskProgress: updatedProgress,
    });
  } catch (error: any) {
    console.error('❌ 음악 생성 실패:', error);
    return NextResponse.json(
      { success: false, error: error.message || '음악 생성 실패' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const taskProgress = await getTodayTaskProgress();
    return NextResponse.json({
      success: true,
      taskProgress,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
