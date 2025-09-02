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

// Resim URL'lerini normalize eden yardımcı fonksiyon - Sadece Cloudinary için
export const normalizeImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  // Eğer zaten tam URL ise, HTTPS kullanımını garanti et
  if (imageUrl.startsWith('http')) {
    return imageUrl.replace(/^http:/, 'https:');
  }
  
  // Eğer Cloudinary URL'si ise, olduğu gibi döndür
  if (imageUrl.includes('cloudinary.com')) {
    return imageUrl;
  }
  
  // Eski resim URL'leri için null döndür (artık kullanılmıyor)
  if (imageUrl.startsWith('/uploads') || imageUrl.includes('img-')) {
    console.warn('Eski resim URL\'si tespit edildi, Cloudinary kullanın:', imageUrl);
    return null;
  }
  
  // Diğer durumlarda da null döndür
  return null;
};

// Eski yöntemler kaldırıldı - sadece Cloudinary kullanıyoruz

// Axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export default api;
