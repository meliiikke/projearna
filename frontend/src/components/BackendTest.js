import React, { useState, useEffect } from 'react';
import { apiGet } from '../utils/api';

const BackendTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const testEndpoints = [
    { name: 'Health Check', endpoint: '/health' },
    { name: 'Test Endpoint', endpoint: '/test' },
    { name: 'Content Sections', endpoint: '/content/sections' },
    { name: 'Hero Slides', endpoint: '/hero-slides/slides' }
  ];

  const runTests = async () => {
    setLoading(true);
    setTestResults([]);

    for (const test of testEndpoints) {
      try {
        console.log(`Testing ${test.name}: ${test.endpoint}`);
        const result = await apiGet(test.endpoint);
        
        setTestResults(prev => [...prev, {
          name: test.name,
          endpoint: test.endpoint,
          status: result.error ? 'FAILED' : 'SUCCESS',
          error: result.error || null,
          data: result.error ? null : result
        }]);
      } catch (error) {
        setTestResults(prev => [...prev, {
          name: test.name,
          endpoint: test.endpoint,
          status: 'FAILED',
          error: error.message,
          data: null
        }]);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>🔧 Backend Connection Test</h2>
      <p>This component tests the connection between frontend and backend.</p>
      
      <button 
        onClick={runTests} 
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {loading ? 'Testing...' : 'Run Tests Again'}
      </button>

      <div style={{ display: 'grid', gap: '10px' }}>
        {testResults.map((result, index) => (
          <div 
            key={index}
            style={{
              padding: '15px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              backgroundColor: result.status === 'SUCCESS' ? '#d4edda' : '#f8d7da'
            }}
          >
            <h3 style={{ margin: '0 0 10px 0', color: result.status === 'SUCCESS' ? '#155724' : '#721c24' }}>
              {result.status === 'SUCCESS' ? '✅' : '❌'} {result.name}
            </h3>
            <p><strong>Endpoint:</strong> {result.endpoint}</p>
            {result.error && (
              <p style={{ color: '#721c24' }}><strong>Error:</strong> {result.error}</p>
            )}
            {result.data && (
              <details>
                <summary>Response Data</summary>
                <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BackendTest;
