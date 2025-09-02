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

// Resim URL'lerini normalize eden yardımcı fonksiyon - CORS sorununu çözmek için geliştirilmiş
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
  const filename = imageUrl.split('/').pop();
  return `${API_BASE_URL}/upload/proxy/${filename}`;
};

// Alternatif resim URL fonksiyonu - serve endpoint kullanır
export const normalizeImageUrlServe = (imageUrl) => {
  if (!imageUrl) return null;
  
  // Eğer zaten tam URL ise, olduğu gibi döndür
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // Eğer /uploads ile başlıyorsa, serve endpoint kullan
  if (imageUrl.startsWith('/uploads')) {
    const filename = imageUrl.split('/').pop();
    return `${API_BASE_URL}/upload/serve/${filename}`;
  }
  
  // Diğer durumlarda da serve endpoint kullan
  const filename = imageUrl.split('/').pop();
  return `${API_BASE_URL}/upload/serve/${filename}`;
};

// Fallback resim URL fonksiyonu - direkt static serving
export const normalizeImageUrlDirect = (imageUrl) => {
  if (!imageUrl) return null;
  
  // Eğer zaten tam URL ise, olduğu gibi döndür
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // Eğer /uploads ile başlıyorsa, direkt backend URL ile birleştir
  if (imageUrl.startsWith('/uploads')) {
    return `${BACKEND_BASE_URL}${imageUrl}`;
  }
  
  // Diğer durumlarda da direkt backend URL ile birleştir
  return `${BACKEND_BASE_URL}${imageUrl}`;
};

// Axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export default api;
