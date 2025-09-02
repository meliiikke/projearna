const axios = require('axios');

async function testCORS() {
  console.log('🔍 Testing CORS configuration...');
  
  const baseUrl = 'https://projearna-production.up.railway.app/api';
  const origin = 'https://arnasitesi.netlify.app';
  
  const endpoints = [
    '/content/hero-features',
    '/content/about-features', 
    '/content/services',
    '/content/map-points',
    '/hero-slides/slides'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Testing: ${endpoint}`);
      
      // Test preflight OPTIONS request
      console.log('  🔄 Testing OPTIONS preflight...');
      const optionsResponse = await axios.options(`${baseUrl}${endpoint}`, {
        headers: {
          'Origin': origin,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      
      console.log(`  ✅ OPTIONS Status: ${optionsResponse.status}`);
      console.log(`  📋 CORS Headers:`, {
        'Access-Control-Allow-Origin': optionsResponse.headers['access-control-allow-origin'],
        'Access-Control-Allow-Methods': optionsResponse.headers['access-control-allow-methods'],
        'Access-Control-Allow-Headers': optionsResponse.headers['access-control-allow-headers']
      });
      
      // Test actual GET request
      console.log('  🔄 Testing GET request...');
      const getResponse = await axios.get(`${baseUrl}${endpoint}`, {
        headers: {
          'Origin': origin
        }
      });
      
      console.log(`  ✅ GET Status: ${getResponse.status}`);
      console.log(`  📊 Data length: ${Array.isArray(getResponse.data) ? getResponse.data.length : 'N/A'}`);
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      if (error.response) {
        console.log(`  📋 Status: ${error.response.status}`);
        console.log(`  📋 Headers:`, error.response.headers);
      }
    }
  }
}

testCORS();
