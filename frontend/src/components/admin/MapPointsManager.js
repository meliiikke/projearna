import React, { useEffect, useState } from 'react';
import { apiGetAuth, apiPostAuth, apiPutAuth, apiDeleteAuth } from '../../utils/api';
import './AdminComponents.css';

const MapPointsManager = () => {
  const [mapPoints, setMapPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const [editingItem, setEditingItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    icon: '🏢' 
  });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const data = await apiGetAuth('/content/admin/map-points');
      
      if (data.error) {
        console.error('Failed to fetch map points:', data.error);
        setMessage('Failed to load map points');
        setMapPoints([]);
        return;
      }
      
      setMapPoints(data);
      setMessage(`${data.length} map points loaded`);
    } catch (e) {
      console.error('Error fetching map-points:', e);
      setMessage('Error fetching map points');
      setMapPoints([]);
    } finally { setLoading(false); }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingItem(null);
    setFormData({ 
      title: '', 
      description: '', 
      icon: '🏢' 
    });
    setMessage('');
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsCreating(false);
    setFormData({ 
      title: item.title || '', 
      description: item.description || '',
      icon: item.icon || '🏢'
    });
    setMessage('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      if (isCreating) {
        const data = await apiPostAuth('/content/admin/map-points', formData);
        
        if (data.error) {
          console.error('Failed to create map point:', data.error);
          setMessage(`Error creating map point: ${data.error}`);
          return;
        }
        
        setMessage('Map point created successfully');
      } else {
        const data = await apiPutAuth(`/content/admin/map-points/${editingItem.id}`, formData);
        
        if (data.error) {
          console.error('Failed to update map point:', data.error);
          setMessage(`Error updating map point: ${data.error}`);
          return;
        }
        
        setMessage('Map point updated successfully');
      }
      
      setIsCreating(false);
      setEditingItem(null);
      setFormData({ title: '', description: '', icon: '🏢' });
      fetchItems();
    } catch (error) {
      console.error('Error saving map point:', error);
      setMessage('Error saving map point');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this map point?')) return;
    
    try {
      const data = await apiDeleteAuth(`/content/admin/map-points/${id}`);
      
      if (data.error) {
        console.error('Failed to delete map point:', data.error);
        setMessage(`Error deleting map point: ${data.error}`);
        return;
      }
      
      setMessage('Map point deleted successfully');
      fetchItems();
    } catch (error) {
      console.error('Error deleting map point:', error);
      setMessage('Error deleting map point');
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingItem(null);
    setFormData({ title: '', description: '', icon: '🏢' });
    setMessage('');
  };

  const handleUpdateCoordinates = async () => {
    if (!window.confirm('This will update coordinates for all map points without coordinates. Continue?')) return;
    
    try {
      setSaving(true);
      const data = await apiPostAuth('/content/admin/map-points/update-coordinates');
      
      if (data.error) {
        console.error('Failed to update coordinates:', data.error);
        setMessage(`Error updating coordinates: ${data.error}`);
        return;
      }
      
      setMessage(data.message);
      fetchItems(); // Refresh the list
    } catch (error) {
      console.error('Error updating coordinates:', error);
      setMessage('Error updating coordinates');
    } finally {
      setSaving(false);
    }
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
        <h2 className="section-title">Map Points Management</h2>
        <p className="section-description">Interactive map points for the statistics section</p>
      </div>

      {message && (
        <div className={`alert ${message.startsWith('Error') ? 'alert-error' : 'alert-success'}`}>
          {message}
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button className="btn btn-primary add-item-btn" onClick={handleCreate}>
          + Add New Map Point
        </button>
        <button 
          className="btn btn-outline" 
          onClick={handleUpdateCoordinates}
          style={{ borderColor: 'var(--primary-gold)', color: 'var(--primary-gold)' }}
        >
          🔄 Update Coordinates
        </button>
      </div>

      <div className="content-grid">
        <div className="sections-list">
          <h3 className="list-title">Current Map Points</h3>
          <div className="items-grid">
            {mapPoints.map(item => (
              <div key={item.id} className={`item-card ${!item.is_active ? 'inactive' : ''}`}>
                <div className="item-header">
                  <div className="item-icon">{item.icon}</div>
                  <div className="card-status">
                    <span className={`status-badge ${item.is_active ? 'active' : 'inactive'}`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <h4 className="item-title">{item.title}</h4>
                <p className="item-description">{item.description}</p>
                
                <div className="item-meta-row">
                  <span className="meta-pill">Auto-positioned</span>
                </div>
                
                <div className="item-actions">
                  <button className="btn btn-primary btn-sm" onClick={() => handleEdit(item)}>
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
            ))}
          </div>
        </div>

        {(editingItem || isCreating) && (
          <div className="edit-form-container">
            <h3 className="form-title">
              {isCreating ? 'Add New Map Point' : 'Edit Map Point'}
            </h3>
            
            <form onSubmit={handleSubmit} className="edit-form">
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="form-input"
                  required
                  placeholder="e.g., Istanbul Office"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-input form-textarea"
                  placeholder="e.g., Main office in Istanbul"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Note</label>
                <div className="form-hint" style={{ padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px', border: '1px solid #e9ecef' }}>
                  <strong>Auto-positioning:</strong> Map points will be automatically positioned randomly on the world map. No coordinates needed!
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Icon</label>
                <input
                  type="text"
                  name="icon"
                  value={formData.icon}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., 🏢"
                />
                <span className="form-hint">Emoji or text icon</span>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-outline btn-sm" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                  {saving ? 'Saving...' : (isCreating ? 'Create' : 'Update')}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPointsManager;
