const axios = require('axios');

async function testProductionConnection() {
  console.log('🔍 Testing Production Connection...');
  
  const baseUrl = 'https://perfect-caring-production.up.railway.app/api';
  const frontendUrl = 'https://arnasitesi.netlify.app';
  
  const endpoints = [
    { name: 'Health Check', endpoint: '/health', method: 'GET' },
    { name: 'Test Endpoint', endpoint: '/test', method: 'GET' },
    { name: 'Content Sections', endpoint: '/content/sections', method: 'GET' },
    { name: 'Hero Features', endpoint: '/content/hero-features', method: 'GET' },
    { name: 'About Features', endpoint: '/content/about-features', method: 'GET' },
    { name: 'Services', endpoint: '/content/services', method: 'GET' },
    { name: 'Map Points', endpoint: '/content/map-points', method: 'GET' },
    { name: 'Hero Slides', endpoint: '/hero-slides/slides', method: 'GET' }
  ];
  
  for (const test of endpoints) {
    try {
      console.log(`\n📡 Testing: ${test.name} (${test.method})`);
      
      // Test preflight OPTIONS request
      console.log('  🔄 Testing OPTIONS preflight...');
      const optionsResponse = await axios.options(`${baseUrl}${test.endpoint}`, {
        headers: {
          'Origin': frontendUrl,
          'Access-Control-Request-Method': test.method,
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      
      console.log(`  ✅ OPTIONS Status: ${optionsResponse.status}`);
      console.log(`  📋 CORS Headers:`, {
        'Access-Control-Allow-Origin': optionsResponse.headers['access-control-allow-origin'],
        'Access-Control-Allow-Methods': optionsResponse.headers['access-control-allow-methods'],
        'Access-Control-Allow-Headers': optionsResponse.headers['access-control-allow-headers']
      });
      
      // Test actual request
      console.log(`  🔄 Testing ${test.method} request...`);
      const response = await axios({
        method: test.method.toLowerCase(),
        url: `${baseUrl}${test.endpoint}`,
        headers: {
          'Origin': frontendUrl
        }
      });
      
      console.log(`  ✅ ${test.method} Status: ${response.status}`);
      console.log(`  📊 Data length: ${Array.isArray(response.data) ? response.data.length : 'N/A'}`);
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      if (error.response) {
        console.log(`  📋 Status: ${error.response.status}`);
        console.log(`  📋 Headers:`, error.response.headers);
      }
    }
  }
  
  console.log('\n🎯 Production Connection Test Completed!');
}

testProductionConnection();
