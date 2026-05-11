// Suno AI API Client for NeuronStar Music
// API Documentation: https://docs.sunoapi.org/
// Authentication: Bearer Token

const SUNO_API_BASE = process.env.SUNO_API_BASE_URL || 'https://api.sunoapi.org/api/v1';

export interface SunoTrack {
  id: string;
  title: string;
  audio_url: string;
  image_url?: string;
  video_url?: string;
  lyric?: string;
  prompt?: string;
  model_name?: string;
  duration?: number;
  created_at: string;
  status?: string;
}

export interface SunoGenerateResponse {
  taskId: string;
}

/**
 * Generate music using Suno AI
 * Returns taskId for polling status
 */
export async function generateMusic(
  prompt: string,
  apiKey: string,
  instrumental: boolean = false
): Promise<SunoGenerateResponse> {
  const response = await fetch(`${SUNO_API_BASE}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      customMode: false,
      instrumental: instrumental,
      model: 'V4_5ALL',
      prompt: prompt,
      callBackUrl: 'https://music.neuralgrid.kr/api/suno/callback', // Required by API
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Suno API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  
  if (data.code !== 200 || !data.data?.taskId) {
    throw new Error(data.msg || 'Failed to generate music');
  }

  return { taskId: data.data.taskId };
}

/**
 * Get generation status and tracks
 */
export async function getGenerationStatus(
  taskId: string,
  apiKey: string
): Promise<SunoTrack[]> {
  const response = await fetch(`${SUNO_API_BASE}/generate/record-info?taskId=${taskId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Suno API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  
  if (data.code !== 200) {
    throw new Error(data.msg || 'Failed to get generation status');
  }

  const taskData = data.data;
  const status = taskData?.status || 'PENDING';
  const sunoData = taskData?.response?.sunoData || [];

  // Map Suno API response to our format
  return sunoData.map((item: any) => ({
    id: item.id || '',
    title: item.title || 'Untitled',
    audio_url: item.audioUrl || '',
    image_url: item.imageUrl || '',
    video_url: item.videoUrl || '',
    lyric: item.prompt || '',
    prompt: item.prompt || '',
    model_name: item.modelName || 'V4_5ALL',
    duration: item.duration || 0,
    created_at: item.createTime ? new Date(item.createTime).toISOString() : new Date().toISOString(),
    status: status === 'SUCCESS' ? 'complete' : 'processing',
  }));
}

/**
 * Wait for tracks to complete (polling)
 */
export async function waitForTracks(
  taskId: string,
  apiKey: string,
  maxWaitTime: number = 300000 // 5 minutes
): Promise<SunoTrack[]> {
  const startTime = Date.now();
  const pollInterval = 10000; // 10 seconds

  while (Date.now() - startTime < maxWaitTime) {
    const tracks = await getGenerationStatus(taskId, apiKey);
    
    // Check if tracks are ready
    const completeTracks = tracks.filter(t => t.audio_url && t.audio_url.length > 0);
    
    if (completeTracks.length >= 2) {
      console.log(`✅ ${completeTracks.length} tracks ready`);
      return completeTracks;
    }

    console.log(`⏳ Waiting for tracks... (${tracks.length} found, ${completeTracks.length} ready)`);
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  // Timeout - return what we have
  const finalTracks = await getGenerationStatus(taskId, apiKey);
  return finalTracks.filter(t => t.audio_url);
}

/**
 * Get genre-specific prompt
 */
export function getGenrePrompt(genre: string): string {
  const prompts: Record<string, string> = {
    pop: 'catchy pop music with upbeat melody and modern production',
    rock: 'energetic rock music with electric guitars and powerful drums',
    jazz: 'smooth jazz with saxophone and piano melodies',
    electronic: 'electronic dance music with synthesizers and beats',
    'hip-hop': 'hip-hop beat with rap vocals and urban vibes',
    classical: 'classical orchestral music with elegant arrangements',
    country: 'country music with acoustic guitar and storytelling',
    'r&b': 'smooth R&B with soulful vocals and groovy rhythms',
  };

  return prompts[genre.toLowerCase()] || prompts.pop;
}
