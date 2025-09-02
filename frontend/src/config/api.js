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

// Resim URL'lerini normalize eden yardımcı fonksiyon - Cloudinary için
export const normalizeImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  // Eğer zaten tam URL ise (Cloudinary veya diğer), olduğu gibi döndür
  if (imageUrl.startsWith('http')) {
    return imageUrl.replace(/^http:/, 'https:');
  }
  
  // Eğer /uploads ile başlıyorsa, direkt static serving kullan (fallback)
  if (imageUrl.startsWith('/uploads')) {
    return `${BACKEND_BASE_URL}${imageUrl}`;
  }
  
  // Diğer durumlarda da direkt static serving kullan (fallback)
  return `${BACKEND_BASE_URL}/uploads/${imageUrl}`;
};

// Eski yöntemler kaldırıldı - sadece Cloudinary kullanıyoruz

// Axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export default api;
