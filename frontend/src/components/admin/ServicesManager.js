import React, { useState, useEffect } from 'react';
import ImageUpload from './ImageUpload';
import { normalizeImageUrl } from '../../config/api';
import { apiGetAuth, apiPostAuth, apiPutAuth, apiDeleteAuth } from '../../utils/api';
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
      const data = await apiGetAuth('/content/admin/services');
      
      if (data.error) {
        console.error('Error fetching services:', data.error);
        setMessage('Error fetching services');
        setServices([]);
        return;
      }
      
      // Backend'den gelen resim URL'lerini tam URL yap
      const servicesWithFullImageUrl = data.map(service => {
        const normalizedUrl = service.image_url ? normalizeImageUrl(service.image_url) : null;
        
        // Eski resim URL'si tespit edilirse uyarı ver
        if (service.image_url && !normalizedUrl) {
          console.warn(`Service "${service.title}" eski resim URL'si kullanıyor:`, service.image_url);
        }
        
        return {
          ...service,
          image_url: normalizedUrl
        };
      });
      
      setServices(servicesWithFullImageUrl);
      setMessage(`${servicesWithFullImageUrl.length} services loaded`);
    } catch (error) {
      console.error('Error fetching services:', error);
      setMessage('Error fetching services');
      setServices([]);
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
      console.log('Saving service:', formData);
      
      if (isCreating) {
        const data = await apiPostAuth('/content/admin/services', formData);
        
        if (!data.error) {
          console.log('Service creation response:', data);
          setServices(prev => [...prev, { ...formData, id: data.id }]);
          setMessage('Service created successfully!');
        } else {
          console.error('Failed to create service:', data.error);
          setMessage(`Error creating service: ${data.error}`);
          return;
        }
      } else if (editingService) {
        const data = await apiPutAuth(`/content/admin/services/${editingService.id}`, formData);
        
        if (!data.error) {
          console.log('Service update response:', data);
          setServices(prev => prev.map(service => 
            service.id === editingService.id 
              ? { ...service, ...formData }
              : service
          ));
          setMessage('Service updated successfully!');
        } else {
          console.error('Failed to update service:', data.error);
          setMessage(`Error updating service: ${data.error}`);
          return;
        }
      }

      handleCancel();
    } catch (error) {
      console.error('Error saving service:', error);
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
        setMessage(`Error ${isCreating ? 'creating' : 'updating'} service: ${error.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;

    try {
      const data = await apiDeleteAuth(`/content/admin/services/${id}`);
      
      if (!data.error) {
        setServices(prev => prev.filter(service => service.id !== id));
        setMessage('Service deleted successfully!');
      } else {
        console.error('Failed to delete service:', data.error);
        setMessage(`Error deleting service: ${data.error}`);
      }
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
