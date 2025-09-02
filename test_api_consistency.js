const fs = require('fs');
const path = require('path');

function findApiCalls(directory) {
  const apiCalls = [];
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules')) {
        scanDirectory(filePath);
      } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Find direct fetch calls
        const fetchMatches = content.match(/fetch\([^)]+\)/g);
        if (fetchMatches) {
          fetchMatches.forEach(match => {
            apiCalls.push({
              file: filePath,
              type: 'fetch',
              call: match
            });
          });
        }
        
        // Find axios calls
        const axiosMatches = content.match(/axios\.(get|post|put|delete)\([^)]+\)/g);
        if (axiosMatches) {
          axiosMatches.forEach(match => {
            apiCalls.push({
              file: filePath,
              type: 'axios',
              call: match
            });
          });
        }
        
        // Find API_BASE_URL usage
        const apiBaseUrlMatches = content.match(/API_BASE_URL/g);
        if (apiBaseUrlMatches) {
          apiCalls.push({
            file: filePath,
            type: 'api_base_url',
            count: apiBaseUrlMatches.length
          });
        }
        
        // Find utils/api imports
        const utilsApiMatches = content.match(/from ['"]\.\.\/utils\/api['"]/g);
        if (utilsApiMatches) {
          apiCalls.push({
            file: filePath,
            type: 'utils_api_import',
            count: utilsApiMatches.length
          });
        }
      }
    }
  }
  
  scanDirectory(directory);
  return apiCalls;
}

function analyzeApiConsistency() {
  console.log('🔍 Analyzing API Call Consistency...\n');
  
  const frontendSrc = path.join(__dirname, 'frontend', 'src');
  const apiCalls = findApiCalls(frontendSrc);
  
  console.log('📊 API Call Analysis Results:\n');
  
  // Group by type
  const byType = apiCalls.reduce((acc, call) => {
    if (!acc[call.type]) acc[call.type] = [];
    acc[call.type].push(call);
    return acc;
  }, {});
  
  // Report findings
  console.log('✅ Files using utils/api (Good):');
  const utilsApiFiles = byType.utils_api_import || [];
  utilsApiFiles.forEach(call => {
    console.log(`  - ${call.file.replace(__dirname, '')}`);
  });
  
  console.log('\n❌ Files with direct fetch calls (Needs review):');
  const fetchFiles = byType.fetch || [];
  if (fetchFiles.length === 0) {
    console.log('  - None found (Good!)');
  } else {
    fetchFiles.forEach(call => {
      console.log(`  - ${call.file.replace(__dirname, '')}: ${call.call}`);
    });
  }
  
  console.log('\n❌ Files with direct axios calls (Needs review):');
  const axiosFiles = byType.axios || [];
  if (axiosFiles.length === 0) {
    console.log('  - None found (Good!)');
  } else {
    axiosFiles.forEach(call => {
      console.log(`  - ${call.file.replace(__dirname, '')}: ${call.call}`);
    });
  }
  
  console.log('\n📈 Summary:');
  console.log(`  - Files using utils/api: ${utilsApiFiles.length}`);
  console.log(`  - Files with direct fetch: ${fetchFiles.length}`);
  console.log(`  - Files with direct axios: ${axiosFiles.length}`);
  
  // Check for consistency
  const hasDirectCalls = fetchFiles.length > 0 || axiosFiles.length > 0;
  
  if (!hasDirectCalls) {
    console.log('\n🎉 All API calls are consistent! Using utils/api helpers.');
  } else {
    console.log('\n⚠️  Some files still use direct API calls. Consider updating them to use utils/api helpers.');
  }
  
  return {
    utilsApiFiles: utilsApiFiles.length,
    fetchFiles: fetchFiles.length,
    axiosFiles: axiosFiles.length,
    isConsistent: !hasDirectCalls
  };
}

// Run analysis
const results = analyzeApiConsistency();

// Exit with appropriate code
process.exit(results.isConsistent ? 0 : 1);
