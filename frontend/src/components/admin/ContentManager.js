import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ImageUpload from './ImageUpload';
import { API_BASE_URL } from '../../config/api';
import './AdminComponents.css';

const ContentManager = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    content: '',
    image_url: '',
    button_text: '',
    button_link: '',
    is_active: true
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      console.log('Fetching sections...');
      const response = await axios.get(`${API_BASE_URL}/content/admin/sections`);
      console.log('Sections response:', response.data);
      
      // Resim URL'lerini tam backend URL'i ile birleştir
      const sectionsWithFullImageUrl = response.data.map(section => ({
        ...section,
        image_url: section.image_url && section.image_url.startsWith('http') 
          ? section.image_url 
          : section.image_url 
            ? `${API_BASE_URL.replace('/api', '')}${section.image_url}`
            : ''
      }));
      
      setSections(sectionsWithFullImageUrl);
      setMessage(`${sectionsWithFullImageUrl.length} content sections loaded`);
    } catch (error) {
      console.error('Error fetching sections:', error);
      setMessage('Error fetching content sections: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (section) => {
    setEditingSection(section);
    setFormData({
      title: section.title || '',
      subtitle: section.subtitle || '',
      content: section.content || '',
      image_url: section.image_url || '',
      button_text: section.button_text || '',
      button_link: section.button_link || '',
      is_active: section.is_active
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
    if (!editingSection) return;

    setSaving(true);
    setMessage('');

    try {
      await axios.put(`${API_BASE_URL}/content/admin/sections/${editingSection.id}`, formData);
      
      // Update local state
      setSections(prev => prev.map(section => 
        section.id === editingSection.id 
          ? { ...section, ...formData }
          : section
      ));

      setMessage('Content section updated successfully!');
      setEditingSection(null);
      
      // Clear form
      setFormData({
        title: '',
        subtitle: '',
        content: '',
        image_url: '',
        button_text: '',
        button_link: '',
        is_active: true
      });
    } catch (error) {
      console.error('Error updating section:', error);
      setMessage('Error updating content section');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingSection(null);
    setFormData({
      title: '',
      subtitle: '',
      content: '',
      image_url: '',
      button_text: '',
      button_link: '',
      is_active: true
    });
    setMessage('');
  };

  if (loading) {
    return (
      <div className="admin-section">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2 className="section-title">Content Sections</h2>
        <p className="section-description">
          Manage the main content sections of your website
        </p>
      </div>

      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
          {message}
        </div>
      )}

      <div className="content-grid">
        <div className="sections-list">
          <h3 className="list-title">Available Sections</h3>
          {sections.length === 0 ? (
            <div className="no-sections">
              <p>Henüz content section bulunamadı. Backend'den veriler çekilemiyor olabilir.</p>
              <button 
                className="btn btn-primary"
                onClick={fetchSections}
              >
                Tekrar Dene
              </button>
            </div>
          ) : (
            <div className="sections-cards">
              {sections.map(section => (
                <div key={section.id} className={`section-card ${!section.is_active ? 'inactive' : ''}`}>
                  <div className="card-header">
                    <h4 className="card-title">{section.section_name}</h4>
                    <div className="card-status">
                      <span className={`status-badge ${section.is_active ? 'active' : 'inactive'}`}>
                        {section.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="card-content">
                    <p className="card-subtitle">{section.subtitle || 'Subtitle yok'}</p>
                    <p className="card-text">{section.title || 'Title yok'}</p>
                    {section.content && (
                      <p className="card-description">
                        {section.content.length > 100 
                          ? `${section.content.substring(0, 100)}...` 
                          : section.content
                        }
                      </p>
                    )}
                  </div>
                  
                  <div className="card-actions">
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleEdit(section)}
                    >
                      Düzenle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {editingSection && (
          <div className="edit-form-container">
            <h3 className="form-title">
              Edit: {editingSection.section_name}
            </h3>
            
            <form onSubmit={handleSubmit} className="edit-form">
              <div className="form-group">
                <label htmlFor="title" className="form-label">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="form-input"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="subtitle" className="form-label">Subtitle</label>
                <input
                  type="text"
                  id="subtitle"
                  name="subtitle"
                  className="form-input"
                  value={formData.subtitle}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="content" className="form-label">Content</label>
                <textarea
                  id="content"
                  name="content"
                  className="form-input form-textarea"
                  value={formData.content}
                  onChange={handleChange}
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Resim</label>
                <ImageUpload 
                  onImageSelect={handleImageSelect}
                  currentImage={formData.image_url}
                />
                <input
                  type="text"
                  name="image_url"
                  className="form-input"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="Resim URL'si"
                  style={{ marginTop: '10px' }}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="button_text" className="form-label">Button Text</label>
                  <input
                    type="text"
                    id="button_text"
                    name="button_text"
                    className="form-input"
                    value={formData.button_text}
                    onChange={handleChange}
                    placeholder="Learn More"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="button_link" className="form-label">Button Link</label>
                  <input
                    type="text"
                    id="button_link"
                    name="button_link"
                    className="form-input"
                    value={formData.button_link}
                    onChange={handleChange}
                    placeholder="#section"
                  />
                </div>
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
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentManager;
