// Axios'u en üste import et
import axios from 'axios';

// API base URL'ini belirleyen fonksiyon
const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    // Development: package.json'da proxy kullanılıyor
    return '/api';
  }

  // Production: Netlify env'den al veya fallback olarak Railway URL'sini kullan
  const baseUrl =
    process.env.REACT_APP_API_BASE_URL ||
    'https://perfect-caring-production.up.railway.app/api';

  // HTTPS garanti et
  return baseUrl.replace(/^http:/, 'https:');
};

// Export edilen API base URL
export const API_BASE_URL = getApiBaseUrl();

// Debug logları (Netlify deploy sırasında görmek için)
console.log('🌐 API_BASE_URL:', API_BASE_URL);
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
console.log('🔧 REACT_APP_API_BASE_URL:', process.env.REACT_APP_API_BASE_URL);

// Backend base URL (API olmadan)
export const BACKEND_BASE_URL = API_BASE_URL.replace('/api', '');

// Resim URL'lerini normalize eden yardımcı fonksiyon
export const normalizeImageUrl = (imageUrl) => {
  if (!imageUrl) return null;

  // Cloudinary için HTTPS garanti et
  if (imageUrl.includes('cloudinary.com')) {
    return imageUrl.replace(/^http:/, 'https:');
  }

  // Zaten HTTPS ise olduğu gibi döndür
  if (imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Local veya eski URL'leri yakala → null döndür
  if (
    imageUrl.startsWith('/uploads/') ||
    imageUrl.includes('img-') ||
    imageUrl.includes('uploads/') ||
    imageUrl.match(/img-\d+-\d+\.(jpg|jpeg|png|webp|gif)/i) ||
    imageUrl.match(/img-\d+\.(jpg|jpeg|png|webp|gif)/i)
  ) {
    console.warn('⚠️ Eski resim URL\'si bulundu, Cloudinary kullanın:', imageUrl);
    return null;
  }

  return null;
};

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export default api;
