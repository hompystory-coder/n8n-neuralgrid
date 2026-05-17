import { NextRequest, NextResponse } from 'next/server';
import { generateAndSaveMusic, getTodayTaskProgress } from '@/lib/services/music-manager.service';

/**
 * POST /api/admin/generate
 * Generate AI music using Suno API
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin API key
    const adminKey = request.headers.get('x-admin-key');
    const expectedKey = process.env.ADMIN_API_KEY;

    if (!adminKey || adminKey !== expectedKey) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin API key' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      genre,
      count = 2,
      randomMode = false,
      customPrompt,
      instrumental = false,
      downloadToHDD = true,
    } = body;

    // Verify required parameters
    if (!genre && !customPrompt && !randomMode) {
      return NextResponse.json(
        { success: false, error: 'Genre, custom prompt, or random mode is required' },
        { status: 400 }
      );
    }

    // Get Suno API key from environment
    const sunoApiKey = process.env.SUNO_API_KEY;
    if (!sunoApiKey) {
      return NextResponse.json(
        { success: false, error: 'Suno API key not configured' },
        { status: 500 }
      );
    }

    // Check today's task progress
    const taskProgress = await getTodayTaskProgress();
    if (taskProgress.completed >= taskProgress.target) {
      return NextResponse.json(
        {
          success: false,
          error: `Daily limit reached (${taskProgress.completed}/${taskProgress.target})`,
          taskProgress,
        },
        { status: 429 }
      );
    }

    // Generate and save music
    console.log(`🎵 Generating ${count} tracks...`);
    const result = await generateAndSaveMusic({
      genre,
      count,
      randomMode,
      customPrompt,
      instrumental,
      downloadToHDD,
      apiKey: sunoApiKey,
    });

    // Get updated task progress
    const updatedProgress = await getTodayTaskProgress();

    return NextResponse.json({
      success: result.success,
      message: result.message,
      tracks: result.tracks,
      taskProgress: updatedProgress,
    });
  } catch (error: any) {
    console.error('❌ Music generation failed:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Music generation failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/generate
 * Get today's task progress
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin API key
    const adminKey = request.headers.get('x-admin-key');
    const expectedKey = process.env.ADMIN_API_KEY;

    if (!adminKey || adminKey !== expectedKey) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin API key' },
        { status: 401 }
      );
    }

    const taskProgress = await getTodayTaskProgress();

    return NextResponse.json({
      success: true,
      taskProgress,
    });
  } catch (error: any) {
    console.error('❌ Failed to fetch task progress:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
