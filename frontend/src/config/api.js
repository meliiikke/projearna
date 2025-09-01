// Axios'u en üste import etmelisin
import axios from 'axios';

// API Configuration for different environments
const getApiBaseUrl = () => {
  // Development: use proxy
  if (process.env.NODE_ENV === 'development') {
    return '';
  }

  // Production: use environment variable or default
  return process.env.REACT_APP_API_BASE_URL || 'https://projearna-production.up.railway.app/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export default api;
