require('dotenv').config();
const axios = require('axios');

const taskId = process.argv[2] || 'bcd2ce4efd9bfc6735ed5edaf0fbb9d1';
const SUNO_API_KEY = process.env.SUNO_API_KEY;

async function check() {
  try {
    const response = await axios.get(
      `https://api.sunoapi.org/api/v1/generate/record-info?taskId=${taskId}`,
      {
        headers: {
          'Authorization': `Bearer ${SUNO_API_KEY}`
        }
      }
    );

    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.error('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

check();
