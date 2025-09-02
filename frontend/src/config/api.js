// Axios'u en üste import etmelisin
import axios from 'axios';

// API Configuration for different environments
const getApiBaseUrl = () => {
  // Development: use proxy
  if (process.env.NODE_ENV === 'development') {
    return '';
  }

  // Production: use environment variable or default - HTTPS zorunlu
  const baseUrl = process.env.REACT_APP_API_BASE_URL || 'https://projearna-production.up.railway.app/api';
  // HTTPS kullanımını garanti et
  return baseUrl.replace(/^http:/, 'https:');
};

export const API_BASE_URL = getApiBaseUrl();

// Backend base URL (API olmadan)
export const BACKEND_BASE_URL = API_BASE_URL.replace('/api', '');

// Resim URL'lerini normalize eden yardımcı fonksiyon - CORS sorununu çözmek için geliştirilmiş
export const normalizeImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  // Eğer zaten tam URL ise, HTTPS kullanımını garanti et
  if (imageUrl.startsWith('http')) {
    return imageUrl.replace(/^http:/, 'https:');
  }
  
  // Eğer /uploads ile başlıyorsa, direkt static serving kullan
  if (imageUrl.startsWith('/uploads')) {
    return `${BACKEND_BASE_URL}${imageUrl}`;
  }
  
  // Diğer durumlarda da direkt static serving kullan
  return `${BACKEND_BASE_URL}/uploads/${imageUrl}`;
};

// Alternatif resim URL fonksiyonu - serve endpoint kullanır
export const normalizeImageUrlServe = (imageUrl) => {
  if (!imageUrl) return null;
  
  // Eğer zaten tam URL ise, HTTPS kullanımını garanti et
  if (imageUrl.startsWith('http')) {
    return imageUrl.replace(/^http:/, 'https:');
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
  
  // Eğer zaten tam URL ise, HTTPS kullanımını garanti et
  if (imageUrl.startsWith('http')) {
    return imageUrl.replace(/^http:/, 'https:');
  }
  
  // Eğer /uploads ile başlıyorsa, direkt backend URL ile birleştir
  if (imageUrl.startsWith('/uploads')) {
    return `${BACKEND_BASE_URL}${imageUrl}`;
  }
  
  // Diğer durumlarda da direkt backend URL ile birleştir
  return `${BACKEND_BASE_URL}${imageUrl}`;
};

// Base64 resim URL fonksiyonu - CORS sorununu tamamen bypass eder
export const normalizeImageUrlBase64 = (imageUrl) => {
  if (!imageUrl) return null;
  
  // Eğer zaten data URL ise, olduğu gibi döndür
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // Dosya adını çıkar
  let filename;
  if (imageUrl.startsWith('/uploads')) {
    filename = imageUrl.split('/').pop();
  } else if (imageUrl.startsWith('http')) {
    filename = imageUrl.split('/').pop();
  } else {
    filename = imageUrl;
  }
  
  // Base64 endpoint URL'i döndür
  return `${API_BASE_URL}/upload/base64/${filename}`;
};

// Base64 resim yükleme fonksiyonu
export const loadImageAsBase64 = async (imageUrl) => {
  try {
    const base64Url = normalizeImageUrlBase64(imageUrl);
    const response = await fetch(base64Url);
    const data = await response.json();
    
    if (data.success && data.dataUrl) {
      return data.dataUrl;
    }
    return null;
  } catch (error) {
    console.error('Base64 image load error:', error);
    return null;
  }
};

// Axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export default api;
