import { API_BASE_URL } from '../config/api';

/**
 * Centralized API request helper with error handling
 * Prevents site crashes and maintains auth state
 */
export const apiRequest = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
    console.log(`🔧 Full URL: ${window.location.origin}${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    if (!response.ok) {
      // Eğer unauthorized ise sadece login sayfasına düşür
      if (response.status === 401) {
        console.warn('⚠️ Unauthorized - login required');
        return { error: 'unauthorized', status: 401 };
      }

      const errorText = await response.text();
      console.error(`❌ API Error ${response.status}: ${errorText}`);
      console.error(`❌ Response URL: ${response.url}`);
      return { 
        error: errorText || `API error: ${response.status}`, 
        status: response.status 
      };
    }

    const data = await response.json();
    console.log(`✅ API Success: ${options.method || 'GET'} ${url}`);
    return data;
  } catch (err) {
    console.error(`❌ API Request failed: ${endpoint}`, err.message);
    console.error(`❌ Error details:`, err);
    
    // Network error durumunda daha detaylı bilgi
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      console.error(`🚨 Network Error: Backend server may not be running`);
      console.error(`🚨 Expected URL: ${API_BASE_URL}${endpoint}`);
    }
    
    return { error: err.message };
  }
};

/**
 * GET request helper
 */
export const apiGet = (endpoint, options = {}) => {
  return apiRequest(endpoint, { ...options, method: 'GET' });
};

/**
 * POST request helper
 */
export const apiPost = (endpoint, data, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data)
  });
};

/**
 * PUT request helper
 */
export const apiPut = (endpoint, data, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

/**
 * DELETE request helper
 */
export const apiDelete = (endpoint, options = {}) => {
  return apiRequest(endpoint, { ...options, method: 'DELETE' });
};

/**
 * Authenticated request helper (includes auth token)
 */
export const apiRequestAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    return { error: 'No authentication token found' };
  }

  return apiRequest(endpoint, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {})
    }
  });
};

/**
 * Authenticated GET request
 */
export const apiGetAuth = (endpoint, options = {}) => {
  return apiRequestAuth(endpoint, { ...options, method: 'GET' });
};

/**
 * Authenticated POST request
 */
export const apiPostAuth = (endpoint, data, options = {}) => {
  return apiRequestAuth(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data)
  });
};

/**
 * Authenticated PUT request
 */
export const apiPutAuth = (endpoint, data, options = {}) => {
  return apiRequestAuth(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

/**
 * Authenticated DELETE request
 */
export const apiDeleteAuth = (endpoint, options = {}) => {
  return apiRequestAuth(endpoint, { ...options, method: 'DELETE' });
};
