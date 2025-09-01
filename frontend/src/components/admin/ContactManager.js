import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import './AdminComponents.css';

const ContactManager = () => {
  const [contactInfo, setContactInfo] = useState({
    phone: '',
    email: '',
    address: '',
    working_hours: '',
    map_lat: '',
    map_lng: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/content/contact`);
      setContactInfo({
        phone: response.data.phone || '',
        email: response.data.email || '',
        address: response.data.address || '',
        working_hours: response.data.working_hours || '',
        map_lat: response.data.map_lat || '41.0781',
        map_lng: response.data.map_lng || '29.0173'
      });
    } catch (error) {
      console.error('Error fetching contact info:', error);
      setMessage('Error fetching contact information');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await axios.put(`${API_BASE_URL}/content/admin/contact`, contactInfo);
      setMessage('Contact information updated successfully!');
    } catch (error) {
      console.error('Error updating contact info:', error);
      setMessage('Error updating contact information');
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
        <h2 className="section-title">Contact Information</h2>
        <p className="section-description">
          Manage your company contact details displayed on the website
        </p>
      </div>

      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
          {message}
        </div>
      )}

      <div className="contact-form-container">
        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                📞 Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-input"
                value={contactInfo.phone}
                onChange={handleChange}
                placeholder="+90 555 55 55"
                required
              />
            </div>



            <div className="form-group">
              <label htmlFor="email" className="form-label">
                ✉️ Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                value={contactInfo.email}
                onChange={handleChange}
                placeholder="info@arna.com.tr"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="address" className="form-label">
                📍 Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                className="form-input"
                value={contactInfo.address}
                onChange={handleChange}
                placeholder="Levent Mahallesi, Büyükdere Caddesi No:201 Şişli/İSTANBUL"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="working_hours" className="form-label">
                🕒 Working Hours
              </label>
              <input
                type="text"
                id="working_hours"
                name="working_hours"
                className="form-input"
                value={contactInfo.working_hours}
                onChange={handleChange}
                placeholder="Pazartesi - Cuma: 09:00 - 18:00"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="map_lat" className="form-label">
                🗺️ Map Latitude
              </label>
              <input
                type="number"
                step="0.0001"
                id="map_lat"
                name="map_lat"
                className="form-input"
                value={contactInfo.map_lat}
                onChange={handleChange}
                placeholder="41.0781"
              />
            </div>

            <div className="form-group">
              <label htmlFor="map_lng" className="form-label">
                🗺️ Map Longitude
              </label>
              <input
                type="number"
                step="0.0001"
                id="map_lng"
                name="map_lng"
                className="form-input"
                value={contactInfo.map_lng}
                onChange={handleChange}
                placeholder="29.0173"
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary save-btn"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Contact Information'}
            </button>
            <div className="map-info">
              <p className="map-note">
                💡 <strong>Harita Güncelleme:</strong> Koordinatları değiştirdikten sonra "Save" butonuna tıklayın. 
                Harita otomatik olarak güncellenecektir.
              </p>
              <div className="coordinate-examples">
                <strong>Örnek Koordinatlar:</strong>
                <ul>
                  <li>İstanbul (Levent): 41.0781, 29.0173</li>
                  <li>Ankara (Kızılay): 39.9334, 32.8597</li>
                  <li>İzmir (Konak): 38.4192, 27.1287</li>
                </ul>
              </div>
            </div>
          </div>
        </form>

        <div className="contact-preview">
          <h3 className="preview-title">Preview</h3>
          <div className="preview-card">
            <div className="preview-item">
              <span className="preview-icon">📞</span>
              <span className="preview-text">{contactInfo.phone || 'Phone number not set'}</span>
            </div>

            <div className="preview-item">
              <span className="preview-icon">✉️</span>
              <span className="preview-text">{contactInfo.email || 'Email not set'}</span>
            </div>
            <div className="preview-item">
              <span className="preview-icon">📍</span>
              <span className="preview-text">{contactInfo.address || 'Address not set'}</span>
            </div>
            <div className="preview-item">
              <span className="preview-icon">🕒</span>
              <span className="preview-text">{contactInfo.working_hours || 'Working hours not set'}</span>
            </div>
            <div className="preview-item">
              <span className="preview-icon">🗺️</span>
              <span className="preview-text">Map: {contactInfo.map_lat || 'Not set'}, {contactInfo.map_lng || 'Not set'}</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .contact-form-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }
        
        .contact-form {
          background: var(--white);
          border-radius: 12px;
          padding: 25px;
          border: 2px solid var(--border-light);
        }
        
        .form-grid {
          display: grid;
          gap: 20px;
        }
        
        .save-btn {
          width: 100%;
          padding: 15px 20px;
          font-size: 1.1rem;
          font-weight: 600;
          margin-top: 20px;
        }
        
        .contact-preview {
          background: var(--secondary-gray);
          border-radius: 12px;
          padding: 25px;
        }
        
        .preview-title {
          color: var(--text-dark);
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid var(--primary-gold);
        }
        
        .preview-card {
          background: var(--white);
          border-radius: 10px;
          padding: 20px;
          border: 1px solid var(--border-light);
        }
        
        .preview-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid var(--border-light);
        }
        
        .preview-item:last-child {
          border-bottom: none;
        }
        
        .preview-icon {
          font-size: 1.2rem;
          min-width: 24px;
        }
        
        .preview-text {
          color: var(--text-dark);
          font-size: 0.9rem;
          font-weight: 500;
        }
        
        .map-info {
          margin-top: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid var(--primary-gold);
        }
        
        .map-note {
          margin: 0 0 15px 0;
          color: var(--text-dark);
          font-size: 0.9rem;
        }
        
        .coordinate-examples {
          font-size: 0.85rem;
        }
        
        .coordinate-examples ul {
          margin: 8px 0 0 0;
          padding-left: 20px;
        }
        
        .coordinate-examples li {
          margin: 4px 0;
          color: var(--text-secondary);
        }
        
        @media (max-width: 768px) {
          .contact-form-container {
            grid-template-columns: 1fr;
            gap: 25px;
          }
          
          .contact-form,
          .contact-preview {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default ContactManager;
