import React, { useEffect, useState } from 'react';
import { apiGetAuth, apiPostAuth, apiPutAuth, apiDeleteAuth } from '../../utils/api';
import './AdminComponents.css';

const HeroFeaturesManager = () => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const [editingItem, setEditingItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ title: '', icon: '' });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const data = await apiGetAuth('/content/admin/hero-features');
      
      if (data.error) {
        console.error('Failed to fetch hero features:', data.error);
        setMessage('Failed to load hero features');
        setFeatures([]);
        return;
      }
      
      setFeatures(data);
      setMessage(`${data.length} hero features loaded`);
    } catch (e) {
      console.error('Error fetching hero-features:', e);
      setMessage('Error fetching features');
      setFeatures([]);
    } finally { setLoading(false); }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingItem(null);
    setFormData({ title: '', icon: '⭐' });
    setMessage('');
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsCreating(false);
    setFormData({ 
      title: item.title || '', 
      icon: '✓'
    });
    setMessage('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'order_index' ? (parseInt(value) || 0) : value)
    }));
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      if (isCreating) {
        const payload = { 
          title: formData.title, 
          icon: '✓', 
          order_index: features.length, 
          is_active: true 
        };
        const data = await apiPostAuth('/content/admin/hero-features', payload);
        
        if (data.error) {
          console.error('Failed to create hero feature:', data.error);
          setMessage(`Error creating hero feature: ${data.error}`);
          return;
        }
        
        const newFeature = { ...payload, id: data.id };
        setFeatures(prev => [...prev, newFeature]);
        setMessage('Hero feature created successfully!');
      } else if (editingItem) {
        const payload = { 
          title: formData.title, 
          icon: '✓', 
          order_index: editingItem.order_index || 0, 
          is_active: editingItem.is_active !== undefined ? editingItem.is_active : true 
        };
        const data = await apiPutAuth(`/content/admin/hero-features/${editingItem.id}`, payload);
        
        if (data.error) {
          console.error('Failed to update hero feature:', data.error);
          setMessage(`Error updating hero feature: ${data.error}`);
          return;
        }
        
        setFeatures(prev => prev.map(it => it.id === editingItem.id ? { ...it, title: formData.title, icon: '✓' } : it));
        setMessage('Hero feature updated successfully!');
      }
      handleCancel();
    } catch (e) {
      console.error('Save error:', e);
      setMessage(`Error: ${isCreating ? 'creating' : 'updating'} hero feature failed`);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu özelliği silmek istediğinize emin misiniz?')) return;
    try {
      const data = await apiDeleteAuth(`/content/admin/hero-features/${id}`);
      
      if (data.error) {
        console.error('Failed to delete hero feature:', data.error);
        setMessage(`Error deleting hero feature: ${data.error}`);
        return;
      }
      
      setFeatures(prev => prev.filter(it => it.id !== id));
      setMessage('Hero feature deleted successfully!');
    } catch (e) {
      console.error('Delete error:', e);
      setMessage('Error deleting hero feature');
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingItem(null);
    setFormData({ title: '', icon: '✓' });
  };

  if (loading) {
    return (
      <div className="admin-section">
        <div className="loading"><div className="spinner"></div></div>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2 className="section-title">Hero Features Management</h2>
        <p className="section-description">Hero bölüm özelliklerini yönetin</p>
      </div>

      {message && (<div className={`alert ${message.startsWith('Hata') ? 'alert-error' : 'alert-success'}`}>{message}</div>)}

      <button className="btn btn-primary add-item-btn" onClick={handleCreate}>+ Yeni Özellik Ekle</button>

      <div className="content-grid">
        <div className="sections-list">
          <h3 className="list-title">Mevcut Özellikler</h3>
          <div className="items-grid">
            {features.map(item => (
              <div key={item.id} className={`item-card ${!item.is_active ? 'inactive' : ''}`}>
                <div className="item-header">
                  <div className="item-icon">✓</div>
                  <div className="card-status">
                    <span className={`status-badge ${item.is_active ? 'active' : 'inactive'}`}>{item.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
                <h4 className="item-title">{item.title}</h4>
                <p className="item-description">{item.description}</p>
                <div className="item-meta-row">
                  <span className="meta-pill">Order: {item.order_index}</span>
                </div>
                <div className="item-actions">
                  <button className="btn btn-primary btn-sm" onClick={() => handleEdit(item)}>Edit</button>
                  <button className="btn btn-outline btn-sm" onClick={() => handleDelete(item.id)} style={{ color: '#dc3545', borderColor: '#dc3545' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {(editingItem || isCreating) && (
          <div className="edit-form-container">
            <h3 className="form-title">{isCreating ? 'Yeni Özellik Oluştur' : `Düzenle: ${editingItem.title}`}</h3>
            <form onSubmit={handleSubmit} className="edit-form">
              <div className="form-group">
                <label className="form-label" htmlFor="title">Başlık</label>
                <input id="title" name="title" className="form-input" type="text" value={formData.title} onChange={handleChange} required />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={handleCancel} disabled={saving}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : (isCreating ? 'Create Feature' : 'Save Changes')}</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroFeaturesManager;
