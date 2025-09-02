// Axios'u en üste import etmelisin
import axios from 'axios';

// API Configuration for different environments
const getApiBaseUrl = () => {
  // Development: use local backend
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3001/api';
  }

  // Production: use environment variable or default - HTTPS zorunlu
  const baseUrl = process.env.REACT_APP_API_BASE_URL || 'https://perfect-caring-production.up.railway.app/api';
  // HTTPS kullanımını garanti et
  return baseUrl.replace(/^http:/, 'https:');
};

export const API_BASE_URL = getApiBaseUrl();

// Backend base URL (API olmadan)
export const BACKEND_BASE_URL = API_BASE_URL.replace('/api', '');

// Resim URL'lerini normalize eden yardımcı fonksiyon - Cloudinary + eski URL temizliği
export const normalizeImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  // Eğer Cloudinary URL'si ise, HTTPS kullanımını garanti et
  if (imageUrl.includes('cloudinary.com')) {
    return imageUrl.replace(/^http:/, 'https:');
  }
  
  // Eğer zaten HTTPS URL ise, olduğu gibi döndür
  if (imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Eski local URL'leri tespit et ve null döndür (CORS hatalarını önlemek için)
  if (imageUrl.startsWith('/uploads/') || 
      imageUrl.includes('img-') || 
      imageUrl.includes('uploads/') ||
      imageUrl.match(/img-\d+-\d+\.(jpg|jpeg|png|webp|gif)/i) ||
      imageUrl.match(/img-\d+\.(jpg|jpeg|png|webp|gif)/i)) {
    console.warn('Eski resim URL\'si tespit edildi, Cloudinary kullanın:', imageUrl);
    return null;
  }
  
  // Diğer durumlar için null döndür
  return null;
};

// Eski yöntemler kaldırıldı - sadece Cloudinary kullanıyoruz

// Axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export default api;
