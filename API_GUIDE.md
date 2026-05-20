# NeuronStar Music - API Documentation

## Overview
This document describes the complete API structure for the NeuronStar Music AI generation platform.

## Base URL
- **Development**: `http://localhost:3002`
- **Production**: `https://music.neuralgrid.kr`

## API Endpoints

### 1. Music Listing API
**Endpoint**: `GET /api/music`

**Description**: Fetch music list with pagination and genre filtering

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 12)
- `genre` (optional): Filter by genre (e.g., 'pop', 'rock', 'jazz')

**Example Request**:
```bash
curl "http://localhost:3002/api/music?page=1&limit=12&genre=pop"
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "suno_id": "abc123",
      "title": "Summer Vibes",
      "artist": "Suno AI",
      "genre": "pop",
      "audio_url": "https://cdn.suno.ai/abc123.mp3",
      "image_url": "https://cdn.suno.ai/abc123.jpg",
      "video_url": "https://cdn.suno.ai/abc123.mp4",
      "lyrics": "...",
      "duration": 180,
      "view_count": 0,
      "like_count": 0,
      "download_count": 0,
      "created_at": "2025-12-08T05:34:36.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### 2. Music Generation API (Admin Only)
**Endpoint**: `POST /api/admin/generate`

**Description**: Generate AI music using Suno API

**Headers**:
- `x-admin-key`: Admin API key (required)
- `Content-Type`: application/json

**Request Body**:
```json
{
  "genre": "pop",
  "count": 2,
  "randomMode": false,
  "customPrompt": "optional custom prompt",
  "instrumental": false,
  "downloadToHDD": true
}
```

**Parameters**:
- `genre` (string): Music genre (pop, rock, jazz, etc.)
- `count` (number): Number of tracks to generate (default: 2)
- `randomMode` (boolean): Use random genre (default: false)
- `customPrompt` (string, optional): Custom generation prompt
- `instrumental` (boolean): Generate instrumental only (default: false)
- `downloadToHDD` (boolean): Download to external HDD (default: true)

**Example Request**:
```bash
curl -X POST "http://localhost:3002/api/admin/generate" \
  -H "x-admin-key: YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "genre": "pop",
    "count": 2,
    "downloadToHDD": true
  }'
```

**Example Response (Success)**:
```json
{
  "success": true,
  "message": "Successfully generated and saved 2 tracks",
  "tracks": [
    {
      "id": 1,
      "suno_id": "abc123",
      "title": "Summer Vibes",
      "artist": "Suno AI",
      "genre": "pop",
      "audio_url": "https://cdn.suno.ai/abc123.mp3",
      "duration": 180,
      "created_at": "2025-12-08T05:34:36.000Z"
    }
  ],
  "taskProgress": {
    "completed": 2,
    "target": 20
  }
}
```

**Example Response (Error)**:
```json
{
  "success": false,
  "error": "Invalid admin API key"
}
```

---

### 3. Task Progress API (Admin Only)
**Endpoint**: `GET /api/admin/generate`

**Description**: Get today's music generation task progress

**Headers**:
- `x-admin-key`: Admin API key (required)

**Example Request**:
```bash
curl "http://localhost:3002/api/admin/generate" \
  -H "x-admin-key: YOUR_ADMIN_API_KEY"
```

**Example Response**:
```json
{
  "success": true,
  "taskProgress": {
    "completed": 5,
    "target": 20
  }
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request (missing parameters) |
| 401 | Unauthorized (invalid API key) |
| 429 | Too Many Requests (daily limit reached) |
| 500 | Internal Server Error |

---

## Environment Variables

Required environment variables in `.env`:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5434/neuronstar_music"

# API Keys
SUNO_API_KEY="your_suno_api_key"
ADMIN_API_KEY="your_admin_api_key"

# Storage
MUSIC_STORAGE_PATH="/mnt/music-storage/generated-music"

# Server
PORT=3002
```

---

## File Structure

```
app/
├── api/
│   ├── music/
│   │   └── route.ts          # Music listing API
│   └── admin/
│       └── generate/
│           └── route.ts      # Music generation API
├── admin/
│   └── page.tsx              # Admin dashboard UI
└── page.tsx                  # Homepage (music library)

lib/
└── services/
    ├── suno.service.ts       # Suno AI API client
    └── music-manager.service.ts  # Music management & HDD download

prisma/
├── schema.prisma             # Database schema
└── migrations/               # Migration files
```

---

## Testing Guide

### 1. Test Music Listing (No Auth Required)
```bash
curl "http://localhost:3002/api/music"
```

### 2. Test Task Progress (Admin Auth Required)
```bash
curl "http://localhost:3002/api/admin/generate" \
  -H "x-admin-key: 9eZwW+qgElNVnajvVW6BEe/03Lc6qDq+1qM10hNzqJ8="
```

### 3. Test Music Generation (Admin Auth Required)
```bash
curl -X POST "http://localhost:3002/api/admin/generate" \
  -H "x-admin-key: 9eZwW+qgElNVnajvVW6BEe/03Lc6qDq+1qM10hNzqJ8=" \
  -H "Content-Type: application/json" \
  -d '{
    "genre": "pop",
    "count": 2,
    "downloadToHDD": true
  }'
```

### 4. Verify Downloaded Files
```bash
ls -lh /mnt/music-storage/generated-music/2025/12/pop/
```

---

## Notes

1. **Daily Limit**: Maximum 20 tracks per day (configurable in `music-manager.service.ts`)
2. **Generation Time**: ~2-3 minutes per batch (Suno API processing time)
3. **File Storage**: Files saved to `/mnt/music-storage/generated-music/YYYY/MM/genre/`
4. **Supported Genres**: Pop, Rock, Jazz, Electronic, Hip-Hop, Classical, Country, R&B

---

## Next Steps

1. Deploy to production server
2. Configure PM2 for auto-restart
3. Set up Nginx reverse proxy
4. Test first music generation
5. Verify file downloads to external HDD

