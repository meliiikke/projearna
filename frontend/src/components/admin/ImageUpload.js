import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, normalizeImageUrl, normalizeImageUrlServe, normalizeImageUrlDirect } from '../../config/api';
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
      const response = await axios.get(`${API_BASE_URL}/upload/images`, {
        // CORS için ek ayarlar
        withCredentials: false,
        timeout: 30000,
      });
      // Backend'den gelen resim URL'lerini kullan - CORS sorununu çözmek için base64 endpoint kullan
      const imagesWithFullUrl = response.data.map(image => ({
        ...image,
        url: image.fullUrl || normalizeImageUrl(image.url),
        proxyUrl: normalizeImageUrl(image.url),
        serveUrl: normalizeImageUrlServe(image.url),
        directUrl: normalizeImageUrlDirect(image.url),
        base64Url: normalizeImageUrlBase64(image.url)
      }));
      setImages(imagesWithFullUrl);
    } catch (error) {
      console.error('Error fetching images:', error);
      if (error.response?.status === 0) {
        console.error('CORS hatası! Backend\'i kontrol edin.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/upload/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // CORS için ek ayarlar
        withCredentials: false,
        timeout: 30000,
      });

      // Resmi listeye ekle
      await fetchImages();
      
      // Yeni yüklenen resmi seç - backend'den gelen fullUrl'i kullan
      const fullImageUrl = response.data.fullUrl || normalizeImageUrl(response.data.imageUrl);
      handleImageSelect(fullImageUrl);
      
      alert('Resim başarıyla yüklendi!');
    } catch (error) {
      console.error('Upload error:', error);
      if (error.response?.status === 0) {
        alert('CORS hatası! Lütfen backend\'i kontrol edin.');
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

  const handleImageDelete = async (filename) => {
    if (!window.confirm('Bu resmi silmek istediğinizden emin misiniz?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/upload/image/${filename}`);
      await fetchImages();
      
      if (selectedImage && selectedImage.includes(filename)) {
        setSelectedImage('');
        onImageSelect('');
      }
      
      alert('Resim başarıyla silindi!');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Resim silinirken hata oluştu!');
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
                  src={image.directUrl} 
                  alt={image.name}
                  onClick={() => handleImageSelect(image.directUrl)}
                  onError={(e) => {
                    // İlk deneme başarısız olursa serve endpoint'i dene
                    if (e.target.src !== image.serveUrl) {
                      e.target.src = image.serveUrl;
                    } else if (e.target.src !== image.proxyUrl) {
                      // İkinci deneme de başarısız olursa proxy endpoint'i dene
                      e.target.src = image.proxyUrl;
                    } else {
                      // Son çare olarak placeholder göster
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+UmVzaW0gWMO8a2xlbmVtaXlvcjwvdGV4dD48L3N2Zz4=';
                    }
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
                    onClick={() => handleImageDelete(image.name)}
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
