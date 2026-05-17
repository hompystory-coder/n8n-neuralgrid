const axios = require('axios');

const SUNO_API_KEY = 'ed2ac381296182c4891cfec2d22138a5';
const API_BASE_URL = 'https://api.sunoapi.org/api/v1';

const taskId = process.argv[2] || '6fb317e15047f43e2f6e18b211ab0a35';

async function checkStatus() {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/generate/record-info?taskId=${taskId}`,
      {
        headers: {
          'Authorization': `Bearer ${SUNO_API_KEY}`
        }
      }
    );
    
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.data && response.data.data.response && response.data.data.response.sunoData) {
      console.log('\n🎵 Generated Songs:');
      response.data.data.response.sunoData.forEach((song, index) => {
        console.log(`\n  Song ${index + 1}:`);
        console.log(`  - Title: ${song.title}`);
        console.log(`  - ID: ${song.id}`);
        console.log(`  - Audio: ${song.audio_url}`);
        console.log(`  - Video: ${song.video_url}`);
        console.log(`  - Duration: ${song.duration}s`);
      });
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

checkStatus();
