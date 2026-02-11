const axios = require('axios');

const API_URL = 'http://localhost:5093/api/projects';
const PROJECT_ID = 'c6fe18b4-74d5-4122-8204-d5d307715a3b';

async function testUpdate() {
    try {
        console.log(`Setting esPublico to TRUE for project ${PROJECT_ID}...`);
        const payload = {
            titulo: 'Uziel Back Updated',
            videoUrl: '',
            canvasBlocks: [],
            esPublico: true
        };

        const response = await axios.put(`${API_URL}/${PROJECT_ID}`, payload);
        console.log('Update Response:', response.data);

        // Now verification call not needed here, as I'll check Firestore with MCP tool again
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testUpdate();
