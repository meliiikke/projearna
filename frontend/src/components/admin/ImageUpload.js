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
      const response = await axios.get(`${API_BASE_URL}/upload/images`);
      // Resimler artık frontend public klasöründe - URL'leri olduğu gibi kullan
      setImages(response.data);
      setImages(imagesWithFullUrl);
    } catch (error) {
      console.error('Error fetching images:', error);
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
      });

      // Resmi listeye ekle
      await fetchImages();
      
      // Yeni yüklenen resmi seç - resimler artık frontend public klasöründe
      handleImageSelect(response.data.imageUrl);
      
      alert('Resim başarıyla yüklendi!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Resim yüklenirken hata oluştu!');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleImageSelect = (imageUrl) => {
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
          <img src={selectedImage} alt="Seçili resim" />
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
