import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ImageUpload from './ImageUpload';
import { API_BASE_URL, normalizeImageUrl } from '../../config/api';
import './AdminComponents.css';

const HeroSlidesManager = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSlide, setEditingSlide] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    content: '',
    image_url: '',
    button_text: '',
    button_link: '',
    slide_order: 0,
    is_active: true
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      console.log('Fetching hero slides...');
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_BASE_URL}/hero-slides/admin/hero-slides`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Hero slides response:', response.data);
      
      // Backend'den gelen resim URL'lerini normalize et
      const slidesWithFullImageUrl = response.data?.map(slide => {
        const normalizedUrl = slide.image_url ? normalizeImageUrl(slide.image_url) : null;
        
        // Eski resim URL'si tespit edilirse uyarı ver ve null yap
        if (slide.image_url && !normalizedUrl) {
          console.warn(`Hero slide "${slide.title}" eski resim URL'si kullanıyor, temizleniyor:`, slide.image_url);
        }
        
        return {
          ...slide,
          image_url: normalizedUrl
        };
      }) || [];
      
      setSlides(slidesWithFullImageUrl);
      
      // Eski resim URL'leri varsa kullanıcıyı bilgilendir
      const oldImageCount = response.data?.filter(slide => 
        slide.image_url && !normalizeImageUrl(slide.image_url)
      ).length || 0;
      
      if (oldImageCount > 0) {
        setMessage(`${slidesWithFullImageUrl.length} hero slides loaded. ${oldImageCount} slide has old image URLs that need to be updated with new Cloudinary images.`);
      } else {
        setMessage(`${slidesWithFullImageUrl.length} hero slides loaded`);
      }
    } catch (error) {
      console.error('Error fetching hero slides:', error);
      setMessage('Error fetching hero slides: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (slide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      content: slide.content || '',
      image_url: slide.image_url || '',
      button_text: slide.button_text || '',
      button_link: slide.button_link || '',
      slide_order: slide.slide_order || 0,
      is_active: slide.is_active !== undefined ? slide.is_active : true
    });
    setMessage('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageSelect = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      image_url: imageUrl
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const token = localStorage.getItem('adminToken');
      
      if (editingSlide && editingSlide.id) {
        // Update existing slide
        console.log('Updating slide with ID:', editingSlide.id);
        await axios.put(`${API_BASE_URL}/hero-slides/admin/hero-slides/${editingSlide.id}`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setMessage('Hero slide updated successfully!');
      } else {
        // Create new slide
        console.log('Creating new slide');
        await axios.post(`${API_BASE_URL}/hero-slides/admin/hero-slides`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setMessage('New hero slide created successfully!');
      }
      
      // Refresh slides list
      fetchSlides();
      
      // Reset form
      setEditingSlide(null);
      setFormData({
        title: '',
        subtitle: '',
        content: '',
        image_url: '',
        button_text: '',
        button_link: '',
        slide_order: 0,
        is_active: true
      });
    } catch (error) {
      console.error('Error saving hero slide:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.code === 'ERR_NETWORK') {
        setMessage('Network error: Backend server is not responding. Please check if the server is running.');
      } else if (error.response?.status === 401) {
        setMessage('Authentication error: Please login again.');
      } else if (error.response?.status === 500) {
        setMessage('Server error: Please try again later.');
      } else {
        setMessage(`Error saving hero slide: ${error.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slideId) => {
    if (!window.confirm('Bu hero slide\'ı silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_BASE_URL}/hero-slides/admin/hero-slides/${slideId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setMessage('Hero slide deleted successfully!');
      fetchSlides();
    } catch (error) {
      console.error('Error deleting hero slide:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.code === 'ERR_NETWORK') {
        setMessage('Network error: Backend server is not responding. Please check if the server is running.');
      } else if (error.response?.status === 401) {
        setMessage('Authentication error: Please login again.');
      } else if (error.response?.status === 500) {
        setMessage('Server error: Please try again later.');
      } else {
        setMessage(`Error deleting hero slide: ${error.message}`);
      }
    }
  };

  const handleCancel = () => {
    setEditingSlide(null);
    setFormData({
      title: '',
      subtitle: '',
      content: '',
      image_url: '',
      button_text: '',
      button_link: '',
      slide_order: 0,
      is_active: true
    });
    setMessage('');
  };

  if (loading) {
    return (
      <div className="admin-section">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading hero slides...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2 className="section-title">Hero Slides Manager</h2>
        <p className="section-description">
          Manage the hero slider content on your homepage
        </p>
      </div>

      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
          {message}
        </div>
      )}

      <div className="content-grid">
        <div className="sections-list">
          <div className="list-header">
            <h3 className="list-title">Hero Slides ({slides.length})</h3>
            <button 
              className="btn btn-primary add-item-btn"
              onClick={() => setEditingSlide({})}
            >
              <span>+ Add New Slide</span>
            </button>
          </div>
          
          {slides.length === 0 ? (
            <div className="no-sections">
              <p>Henüz hero slide bulunamadı. İlk slide'ınızı oluşturun!</p>
              <button 
                className="btn btn-primary"
                onClick={() => setEditingSlide({})}
              >
                İlk Slide'ı Oluştur
              </button>
            </div>
          ) : (
            <div className="sections-cards">
              {slides
                .sort((a, b) => (a.slide_order || 0) - (b.slide_order || 0))
                .map((slide, index) => (
                <div 
                  key={slide.id || index} 
                  className={`section-card ${!slide.is_active ? 'inactive' : ''}`}
                >
                  <div className="card-header">
                    <h4 className="card-title">
                      Slide #{slide.slide_order || index + 1}
                    </h4>
                    <div className="card-status">
                      <span className={`status-badge ${slide.is_active ? 'active' : 'inactive'}`}>
                        {slide.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="card-content">
                    <div className="card-text">{slide.title || 'Untitled Slide'}</div>
                    <div className="card-description">
                      {slide.subtitle || 'No subtitle'}
                    </div>
                    {slide.image_url ? (
                      <div className="card-image">
                        <img 
                          src={slide.image_url} 
                          alt="Slide preview" 
                          style={{
                            width: '100%',
                            height: '100px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            marginTop: '10px'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <div style={{display: 'none', padding: '20px', textAlign: 'center', color: '#999', fontSize: '0.9rem'}}>
                          Resim yüklenemedi
                        </div>
                      </div>
                    ) : (
                      <div style={{padding: '20px', textAlign: 'center', color: '#999', fontSize: '0.9rem', border: '1px dashed #ddd', borderRadius: '8px', marginTop: '10px'}}>
                        Resim yok
                      </div>
                    )}
                  </div>
                  
                  <div className="card-actions">
                    <button 
                      className="btn btn-sm btn-outline"
                      onClick={() => handleEdit(slide)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(slide.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {editingSlide !== null && (
          <div className="edit-form-container">
            <h3 className="form-title">
              {editingSlide.id ? 'Edit Hero Slide' : 'Create New Hero Slide'}
            </h3>
            
            <form onSubmit={handleSubmit} className="edit-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Slide Order</label>
                  <input
                    type="number"
                    name="slide_order"
                    value={formData.slide_order}
                    onChange={handleChange}
                    className="form-input"
                    min="0"
                    placeholder="Slide sırası (0, 1, 2...)"
                  />
                </div>
                
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="checkbox-input"
                    />
                    <span className="checkbox-text">Active</span>
                  </label>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Hero slide başlığı"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Subtitle</label>
                <input
                  type="text"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Alt başlık"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Content</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  className="form-input form-textarea"
                  placeholder="Açıklama metni"
                  rows="3"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Button Text</label>
                  <input
                    type="text"
                    name="button_text"
                    value={formData.button_text}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Buton metni"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Button Link</label>
                  <input
                    type="text"
                    name="button_link"
                    value={formData.button_link}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="#services, #about, vb."
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Background Image</label>
                <ImageUpload onImageSelect={handleImageSelect} />
                {formData.image_url && (
                  <div style={{ marginTop: '10px' }}>
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>
                      Selected image: {formData.image_url}
                    </p>
                    <img 
                      src={formData.image_url} 
                      alt="Preview" 
                      style={{
                        width: '100%',
                        maxHeight: '200px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        marginTop: '5px'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div style={{display: 'none', padding: '20px', textAlign: 'center', color: '#999', fontSize: '0.9rem', border: '1px dashed #ddd', borderRadius: '8px'}}>
                      Resim yüklenemedi
                    </div>
                  </div>
                )}
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : (editingSlide.id ? 'Update Slide' : 'Create Slide')}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroSlidesManager;
