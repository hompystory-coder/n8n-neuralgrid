const axios = require('axios');
const API_KEY = 'ed2ac381296182c4891cfec2d22138a5';

async function checkTask(taskId, name) {
    try {
        const response = await axios.get(
            `https://api.sunoapi.org/api/v1/generate/record-info?taskId=${taskId}`,
            { headers: { 'Authorization': `Bearer ${API_KEY}` } }
        );
        
        console.log(`\n📊 ${name}:`);
        console.log(`   TaskID: ${taskId}`);
        console.log(`   Status: ${response.data.data.status}`);
        
        if (response.data.data.response) {
            console.log(`   Tracks: ${response.data.data.response.length}`);
            response.data.data.response.forEach((track, idx) => {
                console.log(`\n   🎵 Track ${idx + 1}:`);
                console.log(`      Status: ${track.status}`);
                console.log(`      Audio: ${track.audio_url || 'N/A'}`);
            });
        }
    } catch (error) {
        console.error(`   ❌ Error:`, error.message);
    }
}

(async () => {
    await checkTask('e0dd4939fb8bfb416f74cefad86df731', 'Upload and Cover');
    await checkTask('7c966855bf8275604e1f35e33a396776', 'Upload and Extend');
})();
