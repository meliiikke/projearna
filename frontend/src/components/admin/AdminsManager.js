import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import './AdminComponents.css';

const AdminsManager = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const [editingItem, setEditingItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', is_active: true });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/content/admin/admins`);
      setItems(res.data);
    } catch (e) {
      console.error('Error fetching admins:', e);
      setMessage('Error fetching admins');
    } finally { setLoading(false); }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingItem(null);
    setFormData({ username: '', email: '', password: '', is_active: true });
    setMessage('');
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsCreating(false);
    setFormData({ username: item.username || '', email: item.email || '', password: '', is_active: !!item.is_active });
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
        await axios.post(`${API_BASE_URL}/content/admin/admins`, formData);
        await fetchItems();
        setMessage('Admin eklendi');
      } else if (editingItem) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        await axios.put(`${API_BASE_URL}/content/admin/admins/${editingItem.id}`, payload);
        await fetchItems();
        setMessage('Admin güncellendi');
      }
      handleCancel();
    } catch (e) {
      console.error('Save error:', e);
      setMessage(`Hata: ${isCreating ? 'ekleme' : 'güncelleme'} başarısız`);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu admini silmek istediğinize emin misiniz?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/content/admin/admins/${id}`);
      setItems(prev => prev.filter(it => it.id !== id));
      setMessage('Admin silindi');
    } catch (e) {
      console.error('Delete error:', e);
      setMessage('Silme sırasında hata');
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingItem(null);
    setFormData({ username: '', email: '', password: '', is_active: true });
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
        <h2 className="section-title">Admin Management</h2>
        <p className="section-description">Sistem admin kullanıcılarını yönetin</p>
      </div>

      {message && (<div className={`alert ${message.startsWith('Hata') ? 'alert-error' : 'alert-success'}`}>{message}</div>)}

      <button className="btn btn-primary add-item-btn" onClick={handleCreate}>+ Yeni Admin Ekle</button>

      <div className="content-grid">
        <div className="sections-list">
          <h3 className="list-title">Mevcut Adminler</h3>
          <div className="items-grid">
            {items.map(item => (
              <div key={item.id} className={`item-card ${!item.is_active ? 'inactive' : ''}`}>
                <div className="item-header">
                  <div className="item-icon">👑</div>
                  <div className="card-status">
                    <span className={`status-badge ${item.is_active ? 'active' : 'inactive'}`}>{item.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
                <h4 className="item-title">{item.username}</h4>
                <p className="item-description">{item.email}</p>
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
            <h3 className="form-title">{isCreating ? 'Yeni Admin Oluştur' : `Düzenle: ${editingItem.username}`}</h3>
            <form onSubmit={handleSubmit} className="edit-form">
              <div className="form-group">
                <label className="form-label" htmlFor="username">Kullanıcı Adı</label>
                <input id="username" name="username" className="form-input" type="text" value={formData.username} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="email">E-posta</label>
                <input id="email" name="email" className="form-input" type="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="password">Şifre</label>
                <input id="password" name="password" className="form-input" type="password" value={formData.password} onChange={handleChange} placeholder="Şifreyi değiştirmek için doldurun" required={isCreating} />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input className="checkbox-input" type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} />
                  <span className="checkbox-text">Active</span>
                </label>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={handleCancel} disabled={saving}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : (isCreating ? 'Create Admin' : 'Save Changes')}</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminsManager;
