// Suno AI API Client for NeuronStar Music
// Uses sunoapi.org API for music generation
// API Documentation: https://docs.sunoapi.org/

export interface SunoGenerateRequest {
  customMode: boolean;
  instrumental: boolean;
  model: 'V3_5' | 'V4' | 'V4_5' | 'V4_5PLUS' | 'V5';
  prompt: string;
  style?: string;
  title?: string;
  callback?: string;
  styleWeight?: number;
  novelty?: number;
}

export interface SunoTrack {
  id: string;
  title: string;
  image_url: string;
  lyric: string;
  audio_url: string;
  video_url: string;
  created_at: string;
  model_name: string;
  status: string;
  gpt_description_prompt: string;
  prompt: string;
  type: string;
  tags: string;
  duration?: number;  // Duration in seconds
}

export interface SunoGenerateResponse {
  success: boolean;
  tracks?: SunoTrack[];
  taskId?: string;
  error?: string;
}

// Suno API base configuration (sunoapi.org)
const SUNO_API_BASE = process.env.SUNO_API_BASE_URL || 'https://api.sunoapi.org/api/v1';

/**
 * Generate music using Suno AI (sunoapi.org)
 * Note: Each request generates exactly 2 songs
 * Streaming URL available in 30-40 seconds
 * Download URL available in 2-3 minutes
 */
export async function generateMusic(
  prompt: string,
  apiKey?: string,
  makeInstrumental: boolean = false
): Promise<SunoGenerateResponse> {
  try {
    const key = apiKey || process.env.SUNO_API_KEY;
    if (!key) {
      throw new Error('SUNO_API_KEY is not configured');
    }

    // Use customMode=false for simplicity (recommended by docs)
    // This only requires a prompt (max 500 chars)
    const requestBody: any = {
      customMode: false,
      instrumental: makeInstrumental,
      model: 'V5', // Latest model
      prompt: prompt.substring(0, 500), // Enforce length limit
      callBackUrl: 'https://webhook.site/suno-callback' // Dummy URL (we use polling)
    };

    const generateResponse = await fetch(`${SUNO_API_BASE}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      throw new Error(`Suno API error: ${generateResponse.status} - ${errorText}`);
    }

    const generateData = await generateResponse.json();
    
    // Response format: { code: 200, msg: "success", data: { taskId: "..." } }
    if (!generateData || generateData.code !== 200 || !generateData.data?.taskId) {
      throw new Error(generateData?.msg || 'Failed to create generation task');
    }

    // Store task ID for later polling
    const taskId = generateData.data.taskId;
    
    return {
      success: true,
      taskId: taskId,
      tracks: [] // Tracks will be available after polling
    };
  } catch (error) {
    console.error('Suno generate error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get music generation status and results
 * Endpoint: /generate/record-info?taskId={taskId}
 */
export async function getGenerationStatus(
  taskId: string,
  apiKey?: string
): Promise<SunoGenerateResponse> {
  try {
    const key = apiKey || process.env.SUNO_API_KEY;
    if (!key) {
      throw new Error('SUNO_API_KEY is not configured');
    }

    const response = await fetch(`${SUNO_API_BASE}/generate/record-info?taskId=${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${key}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Suno API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Response format: { code: 200, msg: "success", data: { taskId, status, response: { sunoData: [...] } } }
    if (!data || data.code !== 200) {
      throw new Error(data?.msg || 'Failed to fetch generation status');
    }

    const taskStatus = data.data?.status || 'PENDING';
    const tracks = data.data?.response?.sunoData || [];
    
    return {
      success: true,
      taskId: taskId,
      tracks: Array.isArray(tracks) ? tracks.map((item: any) => ({
        id: item.id || '',
        title: item.title || 'Untitled',
        image_url: item.imageUrl || item.sourceImageUrl || '',
        lyric: item.prompt || '',
        audio_url: item.audioUrl || item.sourceAudioUrl || '',
        video_url: item.videoUrl || '',
        created_at: item.createTime ? new Date(item.createTime).toISOString() : new Date().toISOString(),
        model_name: item.modelName || 'V5',
        status: taskStatus === 'SUCCESS' ? 'completed' : 'processing',
        gpt_description_prompt: item.prompt || '',
        prompt: item.prompt || '',
        type: item.type || 'gen',
        tags: item.tags || '',
        duration: item.duration || 0
      })) : []
    };
  } catch (error) {
    console.error('Suno status error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Generate music by genre (simplified interface)
 */
export async function generateMusicByGenre(
  genre: string,
  count: number,
  apiKey?: string
): Promise<SunoGenerateResponse> {
  const genrePrompts: Record<string, string> = {
    pop: 'pop, catchy, upbeat, modern',
    rock: 'rock, electric guitar, energetic, powerful',
    hiphop: 'hip hop, rap, urban, beats',
    electronic: 'electronic, edm, synth, dance',
    jazz: 'jazz, smooth, saxophone, sophisticated',
    classical: 'classical, orchestra, elegant, timeless',
    ambient: 'ambient, atmospheric, peaceful, meditative',
    lofi: 'lofi, chill, relaxed, study music'
  };

  const prompt = genrePrompts[genre.toLowerCase()] || genre;
  
  // Generate multiple tracks
  const results: SunoTrack[] = [];
  
  for (let i = 0; i < count; i++) {
    const result = await generateMusic(prompt, apiKey, false);
    
    if (result.success && result.tracks) {
      results.push(...result.tracks);
    }
    
    // Add delay to avoid rate limiting
    if (i < count - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  return {
    success: results.length > 0,
    tracks: results,
    error: results.length === 0 ? 'No tracks generated' : undefined
  };
}

/**
 * Wait for tracks to be ready (polling)
 * Polling interval: 10 seconds (recommended by docs)
 * Max wait time: 5 minutes (30 attempts x 10s)
 */
export async function waitForTracks(
  taskId: string,
  apiKey?: string,
  maxAttempts: number = 30,
  delayMs: number = 10000
): Promise<SunoTrack[]> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await getGenerationStatus(taskId, apiKey);
    
    if (result.success && result.tracks) {
      const completedTracks = result.tracks.filter(
        track => (track.status === 'complete' || track.status === 'completed') && track.audio_url
      );
      
      // Each request generates exactly 2 songs (per docs)
      if (completedTracks.length >= 2) {
        return completedTracks;
      }
      
      // Check for failures
      const failedTracks = result.tracks.filter(
        track => track.status === 'error' || track.status === 'failed'
      );
      
      // If we have some completed tracks and rest failed, return what we have
      if (completedTracks.length > 0 && (completedTracks.length + failedTracks.length >= 2)) {
        return completedTracks;
      }
    }
    
    // Wait before next attempt
    if (attempt < maxAttempts - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  // Timeout - return whatever we have
  const finalResult = await getGenerationStatus(taskId, apiKey);
  return finalResult.tracks?.filter(track => track.audio_url) || [];
}

/**
 * Get genre-specific prompt
 */
export function getGenrePrompt(genre: string): string {
  const prompts: Record<string, string> = {
    pop: 'Create an upbeat pop song with catchy melody and modern production',
    rock: 'Create a rock song with powerful electric guitars and energetic drums',
    hiphop: 'Create a hip hop track with strong beats and urban vibes',
    electronic: 'Create an electronic dance music track with synths and beats',
    jazz: 'Create a smooth jazz piece with sophisticated saxophone melodies',
    classical: 'Create a classical music piece with elegant orchestral arrangement',
    ambient: 'Create an ambient soundscape with peaceful atmospheric tones',
    lofi: 'Create a lofi chill track perfect for relaxation and study'
  };
  
  return prompts[genre.toLowerCase()] || `Create a ${genre} music track`;
}
