import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import './AdminComponents.css';

const UsersManager = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const [editingItem, setEditingItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    is_active: true
  });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/content/admin/users`);
      setItems(res.data);
    } catch (e) {
      console.error('Error fetching users:', e);
      setMessage('Error fetching users');
    } finally { setLoading(false); }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingItem(null);
    setFormData({ username: '', email: '', password: '', role: 'user', is_active: true });
    setMessage('');
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsCreating(false);
    setFormData({ username: item.username || '', email: item.email || '', password: '', role: item.role || 'user', is_active: !!item.is_active });
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
        await axios.post('/api/content/admin/users', formData);
        await fetchItems();
        setMessage('Kullanıcı eklendi');
      } else if (editingItem) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        await axios.put(`/api/content/admin/users/${editingItem.id}`, payload);
        await fetchItems();
        setMessage('Kullanıcı güncellendi');
      }
      handleCancel();
    } catch (e) {
      console.error('Save error:', e);
      setMessage(`Hata: ${isCreating ? 'ekleme' : 'güncelleme'} başarısız`);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
    try {
      await axios.delete(`/api/content/admin/users/${id}`);
      setItems(prev => prev.filter(it => it.id !== id));
      setMessage('Kullanıcı silindi');
    } catch (e) {
      console.error('Delete error:', e);
      setMessage('Silme sırasında hata');
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingItem(null);
    setFormData({ username: '', email: '', password: '', role: 'user', is_active: true });
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
        <h2 className="section-title">User Management</h2>
        <p className="section-description">Sistem kullanıcılarını yönetin</p>
      </div>

      {message && (<div className={`alert ${message.startsWith('Hata') ? 'alert-error' : 'alert-success'}`}>{message}</div>)}

      <button className="btn btn-primary add-item-btn" onClick={handleCreate}>+ Yeni Kullanıcı Ekle</button>

      <div className="content-grid">
        <div className="sections-list">
          <h3 className="list-title">Mevcut Kullanıcılar</h3>
          <div className="items-grid">
            {items.map(item => (
              <div key={item.id} className={`item-card ${!item.is_active ? 'inactive' : ''}`}>
                <div className="item-header">
                  <div className="item-icon">👥</div>
                  <div className="card-status">
                    <span className={`status-badge ${item.is_active ? 'active' : 'inactive'}`}>{item.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
                <h4 className="item-title">{item.username} <span className={`user-role ${item.role}`}>{item.role}</span></h4>
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
            <h3 className="form-title">{isCreating ? 'Yeni Kullanıcı Oluştur' : `Düzenle: ${editingItem.username}`}</h3>
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
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="role">Rol</label>
                  <select id="role" name="role" className="form-input" value={formData.role} onChange={handleChange}>
                    <option value="user">Kullanıcı</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input className="checkbox-input" type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} />
                  <span className="checkbox-text">Active</span>
                </label>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={handleCancel} disabled={saving}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : (isCreating ? 'Create User' : 'Save Changes')}</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersManager;
