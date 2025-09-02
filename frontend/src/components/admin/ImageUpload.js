import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import './ImageUpload.css';

const ImageUpload = ({ onImageSelect, currentImage }) => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(currentImage);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/upload/images`, {
        headers: {
          'x-auth-token': token
        },
        timeout: 30000,
      });
      
      // Backend'den gelen Cloudinary resimlerini kullan
      const cloudinaryImages = response.data.map(image => ({
        name: image.name,
        url: image.url, // Cloudinary URL'si zaten tam URL
        cloudinaryId: image.cloudinaryId, // "projearna_uploads/abc123" formatında
        uploadDate: image.uploadDate,
        format: image.format,
        size: image.size
      }));
      
      setImages(cloudinaryImages);
    } catch (error) {
      console.error('Error fetching images:', error);
      if (error.response?.status === 401) {
        console.error('Auth hatası! Token kontrol edin.');
      } else {
        console.error('Resimler yüklenirken hata:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log('📤 Starting upload for file:', file.name, file.size, file.type);

    const formData = new FormData();
    formData.append('image', file); // Backend'de beklenen key adı

    setUploading(true);

    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Token available:', !!token);
      console.log('🔑 Token value:', token ? token.substring(0, 20) + '...' : 'null');
      console.log('🌐 Upload URL:', `${API_BASE_URL}/upload/image`);
      
      if (!token) {
        alert('Token bulunamadı! Lütfen sayfayı yenileyin ve tekrar giriş yapın.');
        return;
      }
      
      const response = await axios.post(`${API_BASE_URL}/upload/image`, formData, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });

      console.log('✅ Upload response:', response.data);

      // Backend'den gelen Cloudinary response'u
      const { imageUrl } = response.data;
      
      if (!imageUrl) {
        throw new Error('Backend did not return imageUrl');
      }
      
      // URL formatını kontrol et
      if (imageUrl.includes('cloudinary.com')) {
        console.log('✅ Cloudinary URL received:', imageUrl);
      } else {
        console.warn('⚠️ Non-Cloudinary URL received:', imageUrl);
      }
      
      // Resmi listeye ekle
      await fetchImages();
      
      // Yeni yüklenen resmi seç - Cloudinary URL'si
      handleImageSelect(imageUrl);
      
      alert('Resim başarıyla Cloudinary\'ye yüklendi!');
    } catch (error) {
      console.error('❌ Upload error:', error);
      console.error('❌ Error response:', error.response?.data);
      
      if (error.response?.status === 401) {
        alert('Auth hatası! Lütfen tekrar giriş yapın.');
      } else if (error.response?.status === 400) {
        alert(`Dosya hatası: ${error.response.data?.message || error.message}`);
      } else if (error.response?.status === 500) {
        alert(`Sunucu hatası: ${error.response.data?.message || error.message}`);
      } else {
        alert(`Resim yüklenirken hata oluştu: ${error.message}`);
      }
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleImageSelect = (imageUrl) => {
    // imageUrl zaten tam URL olmalı
    setSelectedImage(imageUrl);
    onImageSelect(imageUrl);
  };

  const handleImageDelete = async (image) => {
    if (!window.confirm('Bu resmi silmek istediğinizden emin misiniz?')) return;

    try {
      const token = localStorage.getItem('token');
      
      // Önce cloudinaryId'yi dene, yoksa imageUrl'yi kullan
      const deleteParam = image.cloudinaryId || image.url;
      
      if (!deleteParam) {
        alert('Resim ID bulunamadı!');
        return;
      }
      
      console.log('Deleting image with param:', deleteParam);
      
      await axios.delete(`${API_BASE_URL}/upload/image/${encodeURIComponent(deleteParam)}`, {
        headers: {
          'x-auth-token': token
        }
      });
      
      await fetchImages();
      
      // Eğer silinen resim seçili ise, seçimi temizle
      if (selectedImage === image.url) {
        setSelectedImage('');
        onImageSelect('');
      }
      
      alert('Resim başarıyla Cloudinary\'den silindi!');
    } catch (error) {
      console.error('Delete error:', error);
      if (error.response?.status === 401) {
        alert('Auth hatası! Lütfen tekrar giriş yapın.');
      } else if (error.response?.status === 404) {
        alert('Resim bulunamadı veya zaten silinmiş!');
      } else if (error.response?.status === 400) {
        alert('Bu eski resim Cloudinary\'de bulunmuyor. Sadece yeni yüklenen resimler silinebilir.');
      } else {
        alert(`Resim silinirken hata oluştu: ${error.message}`);
      }
    }
  };

  return (
    <div className="image-upload-container">
      <div className="upload-section">
        <label htmlFor="image-upload" className="upload-btn">
          {uploading ? 'Yükleniyor...' : '+ Yeni Resim Yükle'}
        </label>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={uploading}
          style={{ display: 'none' }}
        />
      </div>

      {selectedImage && (
        <div className="selected-image">
          <h4>Seçili Resim:</h4>
          <img 
            src={selectedImage} 
            alt="Seçili resim" 
            onError={(e) => {
              // Fallback placeholder göster
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+UmVzaW0gWMO8a2xlbmVtaXlvcjwvdGV4dD48L3N2Zz4=';
            }}
          />
          <p>{selectedImage}</p>
        </div>
      )}

      <div className="images-grid">
        <h4>Yüklü Resimler:</h4>
        {loading ? (
          <div className="loading">Resimler yükleniyor...</div>
        ) : images.length === 0 ? (
          <div className="no-images">Henüz resim yüklenmemiş</div>
        ) : (
          <div className="image-list">
            {images.map((image) => (
              <div 
                key={image.name} 
                className={`image-item ${selectedImage === image.url ? 'selected' : ''}`}
              >
                <img 
                  src={image.url} 
                  alt={image.name}
                  onClick={() => handleImageSelect(image.url)}
                  onError={(e) => {
                    // Cloudinary URL'si başarısız olursa placeholder göster
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+UmVzaW0gWMO8a2xlbmVtaXlvcjwvdGV4dD48L3N2Zz4=';
                  }}
                />
                <div className="image-actions">
                  <button 
                    className="select-btn"
                    onClick={() => handleImageSelect(image.url)}
                  >
                    Seç
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleImageDelete(image)}
                  >
                    Sil
                  </button>
                </div>
                <p className="image-name">{image.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
