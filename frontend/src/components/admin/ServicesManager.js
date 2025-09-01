import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ImageUpload from './ImageUpload';
import { API_BASE_URL } from '../../config/api';
import './AdminComponents.css';

const ServicesManager = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '',
    image_url: '',
    order_index: 0,
    is_active: true
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/content/admin/services`);
      
      // Resimler artık frontend public klasöründe - URL'leri olduğu gibi kullan
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
      setMessage('Error fetching services');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setIsCreating(false);
    setFormData({
      title: service.title || '',
      description: service.description || '',
      icon: service.icon || '',
      image_url: service.image_url || '',
      order_index: service.order_index || 0,
      is_active: service.is_active
    });
    setMessage('');
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingService(null);
    setFormData({
      title: '',
      description: '',
      icon: '⭐',
      image_url: '',
      order_index: services.length,
      is_active: true
    });
    setMessage('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'order_index' ? parseInt(value) || 0 : value)
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
    setMessage('');

    try {
      if (isCreating) {
        const response = await axios.post(`${API_BASE_URL}/content/admin/services`, formData);
        setServices(prev => [...prev, { ...formData, id: response.data.id }]);
        setMessage('Service created successfully!');
      } else if (editingService) {
        await axios.put(`${API_BASE_URL}/content/admin/services/${editingService.id}`, formData);
        setServices(prev => prev.map(service => 
          service.id === editingService.id 
            ? { ...service, ...formData }
            : service
        ));
        setMessage('Service updated successfully!');
      }

      handleCancel();
    } catch (error) {
      console.error('Error saving service:', error);
      setMessage(`Error ${isCreating ? 'creating' : 'updating'} service`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/content/admin/services/${id}`);
      setServices(prev => prev.filter(service => service.id !== id));
      setMessage('Service deleted successfully!');
    } catch (error) {
      console.error('Error deleting service:', error);
      setMessage('Error deleting service');
    }
  };

  const handleCancel = () => {
    setEditingService(null);
    setIsCreating(false);
    setFormData({
      title: '',
      description: '',
      icon: '',
      image_url: '',
      order_index: 0,
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
        <h2 className="section-title">Services Management</h2>
        <p className="section-description">
          Manage your website services and offerings
        </p>
      </div>

      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
          {message}
        </div>
      )}

      <button 
        className="btn btn-primary add-item-btn"
        onClick={handleCreate}
      >
        + Add New Service
      </button>

      <div className="content-grid">
        <div className="sections-list">
          <h3 className="list-title">Current Services</h3>
          <div className="items-grid">
            {services.map(service => (
              <div key={service.id} className={`item-card ${!service.is_active ? 'inactive' : ''}`}>
                <div className="item-header">
                  <div className="item-icon">{service.icon}</div>
                  <div className="card-status">
                    <span className={`status-badge ${service.is_active ? 'active' : 'inactive'}`}>
                      {service.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <h4 className="item-title">{service.title}</h4>
                <p className="item-description">{service.description}</p>
                
                <div className="item-actions">
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => handleEdit(service)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => handleDelete(service.id)}
                    style={{ color: '#dc3545', borderColor: '#dc3545' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {(editingService || isCreating) && (
          <div className="edit-form-container">
            <h3 className="form-title">
              {isCreating ? 'Create New Service' : `Edit: ${editingService.title}`}
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
                <label htmlFor="description" className="form-label">Description</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-input form-textarea"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="order_index" className="form-label">Order</label>
                <input
                  type="number"
                  id="order_index"
                  name="order_index"
                  className="form-input"
                  value={formData.order_index}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Servis Resmi (Opsiyonel)</label>
                <ImageUpload 
                  onImageSelect={handleImageSelect}
                  currentImage={formData.image_url}
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
                  {saving ? 'Saving...' : (isCreating ? 'Create Service' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesManager;
