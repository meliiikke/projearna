// API URL Test Script
console.log('🔍 Testing API URL Configuration...\n');

// Simulate different environments
const environments = [
  { name: 'Development', NODE_ENV: 'development', REACT_APP_API_BASE_URL: undefined },
  { name: 'Production', NODE_ENV: 'production', REACT_APP_API_BASE_URL: 'https://perfect-caring-production.up.railway.app/api' }
];

environments.forEach(env => {
  console.log(`📱 ${env.name} Environment:`);
  console.log(`  NODE_ENV: ${env.NODE_ENV}`);
  console.log(`  REACT_APP_API_BASE_URL: ${env.REACT_APP_API_BASE_URL || 'undefined'}`);
  
  // Simulate the getApiBaseUrl function
  let apiBaseUrl;
  if (env.NODE_ENV === 'development') {
    apiBaseUrl = '/api'; // Proxy kullanıldığında relative path
  } else {
    const baseUrl = env.REACT_APP_API_BASE_URL || 'https://perfect-caring-production.up.railway.app/api';
    apiBaseUrl = baseUrl.replace(/^http:/, 'https:');
  }
  
  console.log(`  API_BASE_URL: ${apiBaseUrl}`);
  
  // Test endpoint
  const endpoint = '/content/sections';
  const fullUrl = `${apiBaseUrl}${endpoint}`;
  console.log(`  Full URL: ${fullUrl}`);
  
  // Check for double domain issue
  if (fullUrl.includes('arnasitesi.netlify.app') && fullUrl.includes('perfect-caring-production.up.railway.app')) {
    console.log(`  ❌ DOUBLE DOMAIN ISSUE DETECTED!`);
  } else {
    console.log(`  ✅ URL looks correct`);
  }
  
  console.log('');
});

console.log('🎯 Expected Results:');
console.log('  Development: /api/content/sections (relative path)');
console.log('  Production: https://perfect-caring-production.up.railway.app/api/content/sections (full URL)');
console.log('  No double domains should appear!');
