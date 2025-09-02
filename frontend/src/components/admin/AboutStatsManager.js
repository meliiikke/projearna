import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import './AdminComponents.css';

const AboutStatsManager = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const [editingItem, setEditingItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ title: '', icon: '' });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${API_BASE_URL}/content/admin/about-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setStats(res.data);
    } catch (e) {
      console.error('Error fetching about-stats:', e);
      setMessage('Error fetching stats');
    } finally { setLoading(false); }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingItem(null);
    setFormData({ title: '', value: '', icon: '⚡' });
    setMessage('');
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsCreating(false);
    setFormData({ 
      title: item.title || '', 
      value: item.value || '',
      icon: '⚡'
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
        const payload = { 
          title: formData.title, 
          value: formData.value,
          icon: '⚡', 
          is_active: true 
        };
        const token = localStorage.getItem('adminToken');
        await axios.post(`${API_BASE_URL}/content/admin/about-stats`, payload, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        // Refresh data from server to ensure consistency
        await fetchItems();
        setMessage('İstatistik eklendi');
      } else if (editingItem) {
        const payload = { 
          title: formData.title, 
          value: formData.value,
          icon: '⚡', 
          is_active: editingItem.is_active !== undefined ? editingItem.is_active : true 
        };
        const token = localStorage.getItem('adminToken');
        await axios.put(`${API_BASE_URL}/content/admin/about-stats/${editingItem.id}`, payload, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        // Refresh data from server to ensure consistency
        await fetchItems();
        setMessage('İstatistik güncellendi');
      }
      handleCancel();
    } catch (e) {
      console.error('Save error:', e);
      console.error('Error details:', {
        message: e.message,
        code: e.code,
        response: e.response?.data,
        status: e.response?.status
      });
      
      if (e.code === 'ERR_NETWORK') {
        setMessage('Network error: Backend server is not responding. Please check if the server is running.');
      } else if (e.response?.status === 401) {
        setMessage('Authentication error: Please login again.');
      } else if (e.response?.status === 500) {
        setMessage('Server error: Please try again later.');
      } else {
        setMessage(`Hata: ${isCreating ? 'ekleme' : 'güncelleme'} başarısız - ${e.message}`);
      }
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu istatistiği silmek istediğinize emin misiniz?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_BASE_URL}/content/admin/about-stats/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // Refresh data from server to ensure consistency
      await fetchItems();
      setMessage('İstatistik silindi');
    } catch (e) {
      console.error('Delete error:', e);
      setMessage('Silme sırasında hata');
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingItem(null);
    setFormData({ title: '', value: '', icon: '⚡' });
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
        <h2 className="section-title">About Stats Management</h2>
        <p className="section-description">Hakkımızda istatistiklerini yönetin</p>
      </div>

      {message && (<div className={`alert ${message.startsWith('Hata') ? 'alert-error' : 'alert-success'}`}>{message}</div>)}

      <button className="btn btn-primary add-item-btn" onClick={handleCreate}>+ Yeni İstatistik Ekle</button>

      <div className="content-grid">
        <div className="sections-list">
          <h3 className="list-title">Mevcut İstatistikler</h3>
          <div className="items-grid">
            {stats.map(item => (
              <div key={item.id} className={`item-card ${!item.is_active ? 'inactive' : ''}`}>
                <div className="item-header">
                  <div className="item-icon">⚡</div>
                  <div className="card-status">
                    <span className={`status-badge ${item.is_active ? 'active' : 'inactive'}`}>{item.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
                <h4 className="item-title">{item.title}</h4>
                <div className="stat-value">{item.value}</div>
                <p className="item-description">{item.description}</p>
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
            <h3 className="form-title">{isCreating ? 'Yeni İstatistik Oluştur' : `Düzenle: ${editingItem.title}`}</h3>
            <form onSubmit={handleSubmit} className="edit-form">
              <div className="form-group">
                <label className="form-label" htmlFor="title">Başlık</label>
                <input id="title" name="title" className="form-input" type="text" value={formData.title} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="value">Değer</label>
                <input id="value" name="value" className="form-input" type="text" value={formData.value} onChange={handleChange} placeholder="2015, 60, 500+" required />
                <small className="form-help">Sayısal değer girin (örn: 2015, 60, 500+)</small>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={handleCancel} disabled={saving}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : (isCreating ? 'Create Stat' : 'Save Changes')}</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutStatsManager;
