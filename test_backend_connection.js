const axios = require('axios');

async function testBackendConnection() {
  console.log('🔍 Testing backend connection...');
  
  const urls = [
    'http://localhost:3001/api/health',
    'http://localhost:3001/api/content/sections',
    'http://localhost:3001/api/hero-slides/slides'
  ];
  
  for (const url of urls) {
    try {
      console.log(`\n📡 Testing: ${url}`);
      const response = await axios.get(url, { timeout: 5000 });
      console.log(`✅ Status: ${response.status}`);
      console.log(`📊 Data:`, response.data);
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      if (error.code === 'ECONNREFUSED') {
        console.log('🚨 Backend server is not running on port 3001');
      }
    }
  }
}

testBackendConnection();
