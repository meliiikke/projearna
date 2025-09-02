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

// Backend base URL (API olmadan)
export const BACKEND_BASE_URL = API_BASE_URL.replace('/api', '');

// Resim URL'lerini normalize eden yardımcı fonksiyon
export const normalizeImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  // Eğer zaten tam URL ise, olduğu gibi döndür
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // Eğer /uploads ile başlıyorsa, proxy endpoint kullan
  if (imageUrl.startsWith('/uploads')) {
    const filename = imageUrl.split('/').pop();
    return `${API_BASE_URL}/upload/proxy/${filename}`;
  }
  
  // Diğer durumlarda da proxy endpoint kullan
  return `${API_BASE_URL}/upload/proxy/${imageUrl}`;
};

// Axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export default api;
