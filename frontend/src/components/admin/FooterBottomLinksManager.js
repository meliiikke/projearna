import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminComponents.css';

const FooterBottomLinksManager = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const [editingItem, setEditingItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ title: '' });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get('/api/content/admin/footer-bottom-links');
      setItems(res.data);
    } catch (e) {
      console.error('Error fetching footer-bottom-links:', e);
      setMessage('Error fetching links');
    } finally { setLoading(false); }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingItem(null);
    setFormData({ title: '' });
    setMessage('');
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsCreating(false);
    setFormData({ title: item.title || '' });
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
        const payload = { title: formData.title, link: '', order_index: items.length, is_active: true };
        const res = await axios.post('/api/content/admin/footer-bottom-links', payload);
        const newLink = { ...payload, id: res.data.id };
        setItems(prev => [...prev, newLink]);
        setMessage('Link eklendi');
      } else if (editingItem) {
        const payload = { title: formData.title, link: editingItem.link || '', order_index: editingItem.order_index || 0, is_active: editingItem.is_active !== undefined ? editingItem.is_active : true };
        await axios.put(`/api/content/admin/footer-bottom-links/${editingItem.id}`, payload);
        setItems(prev => prev.map(it => it.id === editingItem.id ? { ...it, title: formData.title } : it));
        setMessage('Link güncellendi');
      }
      handleCancel();
    } catch (e) {
      console.error('Save error:', e);
      setMessage(`Hata: ${isCreating ? 'ekleme' : 'güncelleme'} başarısız`);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu linki silmek istediğinize emin misiniz?')) return;
    try {
      await axios.delete(`/api/content/admin/footer-bottom-links/${id}`);
      setItems(prev => prev.filter(it => it.id !== id));
      setMessage('Link silindi');
    } catch (e) {
      console.error('Delete error:', e);
      setMessage('Silme sırasında hata');
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingItem(null);
    setFormData({ title: '' });
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
        <h2 className="section-title">Footer Links Management</h2>
        <p className="section-description">Footer alt bağlantılarını yönetin</p>
      </div>

      {message && (<div className={`alert ${message.startsWith('Hata') ? 'alert-error' : 'alert-success'}`}>{message}</div>)}

      <button className="btn btn-primary add-item-btn" onClick={handleCreate}>+ Yeni Link Ekle</button>

      <div className="content-grid">
        <div className="sections-list">
          <h3 className="list-title">Mevcut Linkler</h3>
          <div className="items-grid">
            {items.map(item => (
              <div key={item.id} className={`item-card ${!item.is_active ? 'inactive' : ''}`}>
                <div className="item-header">
                  <div className="item-icon">📎</div>
                  <div className="card-status">
                    <span className={`status-badge ${item.is_active ? 'active' : 'inactive'}`}>{item.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
                <h4 className="item-title">{item.title}</h4>
                
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
            <h3 className="form-title">{isCreating ? 'Yeni Link Oluştur' : `Düzenle: ${editingItem.title}`}</h3>
            <form onSubmit={handleSubmit} className="edit-form">
              <div className="form-group">
                <label className="form-label" htmlFor="title">Başlık</label>
                <input id="title" name="title" className="form-input" type="text" value={formData.title} onChange={handleChange} required />
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={handleCancel} disabled={saving}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : (isCreating ? 'Create Link' : 'Save Changes')}</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default FooterBottomLinksManager;
