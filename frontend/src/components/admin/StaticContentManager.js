import React, { useState, useEffect } from 'react';
import { apiGetAuth, apiPostAuth, apiPutAuth, apiDeleteAuth } from '../../utils/api';
import './AdminComponents.css';

const StaticContentManager = () => {
  const [activeTab, setActiveTab] = useState('content-sections');
  const [contentSections, setContentSections] = useState([]);
  const [heroFeatures, setHeroFeatures] = useState([]);
  const [aboutFeatures, setAboutFeatures] = useState([]);
  const [aboutStats, setAboutStats] = useState([]);
  const [footerBottomLinks, setFooterBottomLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [
        contentSectionsData,
        heroFeaturesData,
        aboutFeaturesData,
        aboutStatsData,
        footerBottomLinksData
      ] = await Promise.all([
        apiGetAuth('/content/admin/sections'),
        apiGetAuth('/content/admin/hero-features'),
        apiGetAuth('/content/admin/about-features'),
        apiGetAuth('/content/admin/about-stats'),
        apiGetAuth('/content/admin/footer-bottom-links')
      ]);

      if (!contentSectionsData.error) setContentSections(contentSectionsData);
      if (!heroFeaturesData.error) setHeroFeatures(heroFeaturesData);
      if (!aboutFeaturesData.error) setAboutFeatures(aboutFeaturesData);
      if (!aboutStatsData.error) setAboutStats(aboutStatsData);
      if (!footerBottomLinksData.error) setFooterBottomLinks(footerBottomLinksData);
    } catch (error) {
      console.error('Error fetching static content:', error);
      setMessage('Error fetching content');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'content-sections': return contentSections;
      case 'hero-features': return heroFeatures;
      case 'about-features': return aboutFeatures;
      case 'about-stats': return aboutStats;
      case 'footer-bottom-links': return footerBottomLinks;
      default: return [];
    }
  };

  const getCurrentEndpoint = () => {
    switch (activeTab) {
      case 'content-sections': return `${API_BASE_URL}/content/admin/sections`;
      case 'hero-features': return `${API_BASE_URL}/content/admin/hero-features`;
      case 'about-features': return `${API_BASE_URL}/content/admin/about-features`;
      case 'about-stats': return `${API_BASE_URL}/content/admin/about-stats`;
      case 'footer-bottom-links': return `${API_BASE_URL}/content/admin/footer-bottom-links`;
      default: return '';
    }
  };

  const getDefaultFormData = () => {
    switch (activeTab) {
      case 'content-sections':
        return { title: '', subtitle: '', content: '', button_text: '', button_link: '', is_active: true };
      case 'hero-features':
        return { title: '', icon: '⭐', order_index: 0, is_active: true };
      case 'about-features':
        return { title: '', icon: '⭐', order_index: 0, is_active: true };
      case 'about-stats':
        return { title: '', icon: '⭐', is_active: true };
      case 'footer-bottom-links':
        return { title: '', link: '#', order_index: 0, is_active: true };
      default:
        return {};
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingItem(null);
    setFormData(getDefaultFormData());
    setMessage('');
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsCreating(false);
    setFormData({ ...item });
    setMessage('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'order_index' ? parseInt(value) || 0 : value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const endpoint = getCurrentEndpoint();
      let response;

      if (activeTab === 'content-sections') {
        // Content sections are always updates, never creates
        response = await apiPutAuth(`${endpoint}/${editingItem.id}`, formData);
        if (!response.error) setMessage('Content section updated successfully!');
      } else if (isCreating) {
        response = await apiPostAuth(endpoint, formData);
        if (!response.error) setMessage('Item created successfully!');
      } else {
        response = await apiPutAuth(`${endpoint}/${editingItem.id}`, formData);
        if (!response.error) setMessage('Item updated successfully!');
      }

      // Refresh data
      fetchAllData();
      
      // Reset form
      setEditingItem(null);
      setIsCreating(false);
      setFormData(getDefaultFormData());
    } catch (error) {
      console.error('Error saving item:', error);
      setMessage('Error saving item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const endpoint = getCurrentEndpoint();
      const response = await apiDeleteAuth(`${endpoint}/${id}`);
      if (!response.error) {
        setMessage('Item deleted successfully!');
        fetchAllData();
      } else {
        setMessage('Error deleting item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      setMessage('Error deleting item');
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setIsCreating(false);
    setFormData(getDefaultFormData());
    setMessage('');
  };

  const renderForm = () => {
    const currentData = getCurrentData();
    
    return (
      <div className="edit-form-container">
        <h3 className="form-title">
          {isCreating ? `Add New ${activeTab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}` : 
           `Edit ${activeTab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`}
        </h3>
        
        <form onSubmit={handleSubmit} className="edit-form">
          {activeTab === 'content-sections' && (
            <>
              <div className="form-group">
                <label className="form-label">Section Name</label>
                <input
                  type="text"
                  name="section_name"
                  className="form-input"
                  value={formData.section_name}
                  readOnly
                  style={{ backgroundColor: '#f8fafc', cursor: 'not-allowed' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Section title"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Subtitle</label>
                <input
                  type="text"
                  name="subtitle"
                  className="form-input"
                  value={formData.subtitle}
                  onChange={handleChange}
                  placeholder="Section subtitle"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Content</label>
                <textarea
                  name="content"
                  className="form-input form-textarea"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Section content"
                  rows="4"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Button Text</label>
                  <input
                    type="text"
                    name="button_text"
                    className="form-input"
                    value={formData.button_text}
                    onChange={handleChange}
                    placeholder="Button text"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Button Link</label>
                  <input
                    type="text"
                    name="button_link"
                    className="form-input"
                    value={formData.button_link}
                    onChange={handleChange}
                    placeholder="Button link"
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'hero-features' && (
            <>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Feature title"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Icon</label>
                  <input
                    type="text"
                    name="icon"
                    className="form-input"
                    value="⭐"
                    readOnly
                    style={{ backgroundColor: '#f8fafc', cursor: 'not-allowed' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Order</label>
                  <input
                    type="number"
                    name="order_index"
                    className="form-input"
                    value={formData.order_index}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'about-features' && (
            <>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Feature title"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Icon</label>
                  <input
                    type="text"
                    name="icon"
                    className="form-input"
                    value="⭐"
                    readOnly
                    style={{ backgroundColor: '#f8fafc', cursor: 'not-allowed' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Order</label>
                  <input
                    type="number"
                    name="order_index"
                    className="form-input"
                    value={formData.order_index}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'about-stats' && (
            <>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Stat title"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Icon</label>
                <input
                  type="text"
                  name="icon"
                  className="form-input"
                  value="⭐"
                  readOnly
                  style={{ backgroundColor: '#f8fafc', cursor: 'not-allowed' }}
                />
              </div>
            </>
          )}

          {activeTab === 'footer-bottom-links' && (
            <>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Link title"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Link</label>
                  <input
                    type="text"
                    name="link"
                    className="form-input"
                    value={formData.link}
                    onChange={handleChange}
                    placeholder="#section or /page"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Order</label>
                  <input
                    type="number"
                    name="order_index"
                    className="form-input"
                    value={formData.order_index}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>
            </>
          )}


            <>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Social media title"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Icon</label>
                  <input
                    type="text"
                    name="icon"
                    className="form-input"
                    value="⭐"
                    readOnly
                    style={{ backgroundColor: '#f8fafc', cursor: 'not-allowed' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Link</label>
                  <input
                    type="text"
                    name="link"
                    className="form-input"
                    value={formData.link}
                    onChange={handleChange}
                    placeholder="https://..."
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Aria Label</label>
                  <input
                    type="text"
                    name="aria_label"
                    className="form-input"
                    value={formData.aria_label}
                    onChange={handleChange}
                    placeholder="Accessibility label"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Order</label>
                  <input
                    type="number"
                    name="order_index"
                    className="form-input"
                    value={formData.order_index}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>
            </>


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
              {saving ? 'Saving...' : (isCreating ? 'Create Item' : 'Save Changes')}
            </button>
          </div>
        </form>
      </div>
    );
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
        <h2 className="section-title">Static Content Management</h2>
        <p className="section-description">
          Manage all static content elements across your website
        </p>
      </div>

      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
          {message}
        </div>
      )}

      <div className="content-grid">
        <div className="sections-list">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'content-sections' ? 'active' : ''}`}
              onClick={() => setActiveTab('content-sections')}
            >
              Content Sections
            </button>
            <button 
              className={`tab ${activeTab === 'hero-features' ? 'active' : ''}`}
              onClick={() => setActiveTab('hero-features')}
            >
              Hero Features
            </button>
            <button 
              className={`tab ${activeTab === 'about-features' ? 'active' : ''}`}
              onClick={() => setActiveTab('about-features')}
            >
              About Features
            </button>
            <button 
              className={`tab ${activeTab === 'about-stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('about-stats')}
            >
              About Stats
            </button>

            <button 
              className={`tab ${activeTab === 'footer-bottom-links' ? 'active' : ''}`}
              onClick={() => setActiveTab('footer-bottom-links')}
            >
              Footer Bottom Links
            </button>
          </div>

          <div className="list-header">
            <h3 className="list-title">
              {activeTab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} ({getCurrentData().length})
            </h3>
            {activeTab !== 'content-sections' && (
              <button 
                className="btn btn-primary add-item-btn"
                onClick={handleCreate}
              >
                + Add New
              </button>
            )}
          </div>

          <div className="items-grid">
            {activeTab === 'content-sections' ? (
              getCurrentData().map((item) => (
                <div key={item.id} className={`item-card ${!item.is_active ? 'inactive' : ''}`}>
                  <div className="item-header">
                    <div className="item-icon">📄</div>
                    <div className="card-status">
                      <span className={`status-badge ${item.is_active ? 'active' : 'inactive'}`}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <h4 className="item-title">{item.section_name}</h4>
                  <p className="item-description"><strong>Title:</strong> {item.title}</p>
                  <p className="item-description"><strong>Subtitle:</strong> {item.subtitle}</p>
                  {item.content && (
                    <p className="item-description"><strong>Content:</strong> {item.content.substring(0, 100)}...</p>
                  )}
                  {item.button_text && (
                    <p className="item-link">Button: {item.button_text} → {item.button_link}</p>
                  )}
                  
                  <div className="item-actions">
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))
            ) : (
              getCurrentData().map((item) => (
                <div key={item.id} className={`item-card ${!item.is_active ? 'inactive' : ''}`}>
                  <div className="item-header">
                    {item.icon && (
                      <div className="item-icon">{item.icon}</div>
                    )}
                    <div className="card-status">
                      <span className={`status-badge ${item.is_active ? 'active' : 'inactive'}`}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <h4 className="item-title">{item.title}</h4>
                  {item.description && (
                    <p className="item-description">{item.description}</p>
                  )}
                  {item.link && (
                    <p className="item-link">Link: {item.link}</p>
                  )}
                  {item.order_index !== undefined && (
                    <p className="item-order">Order: {item.order_index}</p>
                  )}
                  
                  <div className="item-actions">
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => handleDelete(item.id)}
                      style={{ color: '#dc3545', borderColor: '#dc3545' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {(editingItem !== null || isCreating) && renderForm()}
      </div>

      <style>{`
        .tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 20px;
          border-bottom: 2px solid var(--border-light);
          padding-bottom: 15px;
        }
        
        .tab {
          padding: 10px 20px;
          border: none;
          background: var(--background-light);
          color: var(--text-secondary);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          font-weight: 500;
        }
        
        .tab:hover {
          background: var(--primary-gold);
          color: var(--white);
        }
        
        .tab.active {
          background: var(--primary-gold);
          color: var(--white);
        }
        
        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .item-link, .item-order {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin: 5px 0;
        }
      `}</style>
    </div>
  );
};

export default StaticContentManager;
