import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { generateMusic, waitForTracks, getGenrePrompt } from './suno.service';

const prisma = new PrismaClient();

export interface MusicData {
  suno_id: string;
  title: string;
  genre: string;
  audio_url: string;
  thumbnail_url?: string;
  lyrics?: string;
  duration: number;
  createdAt: Date;
}

export async function saveMusicToDB(music: MusicData) {
  try {
    const result = await prisma.music.create({
      data: {
        sunoId: music.suno_id,
        title: music.title,
        genre: music.genre,
        audioUrl: music.audio_url,
        thumbnailUrl: music.thumbnail_url || '',
        lyrics: music.lyrics || '',
        duration: music.duration,
        viewCount: 0,
        likeCount: 0,
        downloadCount: 0,
        createdAt: music.createdAt,
      },
    });
    console.log(`✅ Music saved to DB: ${result.title} (ID: ${result.id})`);
    return result;
  } catch (error) {
    console.error('❌ Failed to save music to DB:', error);
    throw error;
  }
}

export async function bulkSaveMusic(musicList: MusicData[]) {
  const results = [];
  for (const music of musicList) {
    try {
      const result = await saveMusicToDB(music);
      results.push(result);
    } catch (error) {
      console.error(`Failed to save ${music.title}:`, error);
    }
  }
  return results;
}

export async function downloadMusicFile(
  audioUrl: string,
  genre: string,
  filename: string
): Promise<string | null> {
  try {
    const storagePath = process.env.MUSIC_STORAGE_PATH || '/mnt/music-storage/generated-music';
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    const targetDir = path.join(storagePath, String(year), month, genre.toLowerCase());
    
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log(`📁 Created directory: ${targetDir}`);
    }

    const targetPath = path.join(targetDir, filename);
    
    console.log(`⬇️ Downloading: ${audioUrl}`);
    const response = await axios({
      method: 'GET',
      url: audioUrl,
      responseType: 'stream',
      timeout: 300000,
    });

    const writer = fs.createWriteStream(targetPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log(`✅ Downloaded to: ${targetPath}`);
        resolve(targetPath);
      });
      writer.on('error', (error) => {
        console.error(`❌ Download failed: ${error.message}`);
        reject(error);
      });
    });
  } catch (error) {
    console.error('❌ Download error:', error);
    return null;
  }
}

export async function generateAndSaveMusic(options: {
  genre?: string;
  count?: number;
  randomMode?: boolean;
  customPrompt?: string;
  instrumental?: boolean;
  downloadToHDD?: boolean;
  apiKey: string;
}) {
  const {
    genre,
    count = 2,
    randomMode = false,
    customPrompt,
    instrumental = false,
    downloadToHDD = true,
    apiKey,
  } = options;

  try {
    console.log('🎵 Starting music generation...');
    console.log(`Genre: ${genre || 'Random'}, Count: ${count}, Instrumental: ${instrumental}`);

    let prompt = customPrompt;
    if (!prompt && genre) {
      prompt = getGenrePrompt(genre);
    }

    if (!prompt) {
      throw new Error('No prompt provided and no genre specified');
    }

    if (instrumental) {
      prompt = `${prompt} [Instrumental]`;
    }

    const { taskId } = await generateMusic(prompt, apiKey);
    console.log(`⏳ Task ID: ${taskId}, waiting for tracks...`);

    const tracks = await waitForTracks(taskId, apiKey);
    console.log(`✅ Generated ${tracks.length} tracks`);

    const musicDataList: MusicData[] = tracks.map((track) => ({
      suno_id: track.id,
      title: track.title,
      genre: genre || 'Unknown',
      audio_url: track.audio_url,
      thumbnail_url: track.image_url,
      lyrics: track.lyric || track.prompt,
      duration: track.duration || 0,
      createdAt: new Date(track.created_at),
    }));

    const savedMusic = await bulkSaveMusic(musicDataList);
    console.log(`✅ Saved ${savedMusic.length} tracks to database`);

    if (downloadToHDD) {
      console.log('⬇️ Downloading to external HDD...');
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        const music = musicDataList[i];
        
        const timestamp = Date.now();
        const filename = `${music.title}_${timestamp}.mp3`
          .replace(/[^a-zA-Z0-9_.-]/g, '_');

        const localPath = await downloadMusicFile(
          track.audio_url,
          music.genre,
          filename
        );

        if (localPath) {
          console.log(`✅ Downloaded: ${filename}`);
        } else {
          console.error(`❌ Failed to download: ${filename}`);
        }
      }
    }

    return {
      success: true,
      tracks: savedMusic,
      message: `Successfully generated and saved ${savedMusic.length} tracks`,
    };
  } catch (error: any) {
    console.error('❌ Music generation failed:', error);
    return {
      success: false,
      tracks: [],
      message: error.message || 'Music generation failed',
    };
  }
}

export async function getTodayTaskProgress() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const count = await prisma.music.count({
    where: {
      createdAt: {
        gte: today,
      },
    },
  });

  return {
    completed: count,
    target: 20,
  };
}
