import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiGetAuth } from '../utils/api';
import ContentManager from '../components/admin/ContentManager';
import HeroSlidesManager from '../components/admin/HeroSlidesManager';
import ServicesManager from '../components/admin/ServicesManager';
import ContactManager from '../components/admin/ContactManager';
import ContactMessagesManager from '../components/admin/ContactMessagesManager';
// Removed StaticContentManager per request
import AboutStatsManager from '../components/admin/AboutStatsManager';
import HeroFeaturesManager from '../components/admin/HeroFeaturesManager';
import MapPointsManager from '../components/admin/MapPointsManager';

import FooterBottomLinksManager from '../components/admin/FooterBottomLinksManager';
import BackendTest from '../components/BackendTest';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('backend-test');
  const [stats, setStats] = useState({
    totalSections: 0,
    totalServices: 0,
    totalMessages: 0
  });
  const [loading, setLoading] = useState(true);
  
  const { admin, logout } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [sectionsData, servicesData, messagesData] = await Promise.all([
          apiGetAuth('/content/admin/sections'),
          apiGetAuth('/content/admin/services'),
          apiGetAuth('/content/admin/contact-messages')
        ]);

        setStats({
          totalSections: sectionsData.error ? 0 : sectionsData.length,
          totalServices: servicesData.error ? 0 : servicesData.length,
          totalMessages: messagesData.error ? 0 : messagesData.length
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Set fallback stats
        setStats({
          totalSections: 0,
          totalServices: 0,
          totalMessages: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
  };

  const tabs = [
    { id: 'backend-test', label: 'Backend Test', icon: '🔧' },
    { id: 'content', label: 'Content Sections', icon: '📝' },
    { id: 'hero-slides', label: 'Hero Slides', icon: '🎬' },
    { id: 'hero-features', label: 'Hero Features', icon: '⭐' },
    { id: 'services', label: 'Services', icon: '⚙️' },
    { id: 'about-stats', label: 'About Stats', icon: '📈' },
    { id: 'footer-links', label: 'Footer Links', icon: '📎' },
    { id: 'contact', label: 'Contact Info', icon: '📞' },
    { id: 'map-points', label: 'Map Points', icon: '🗺️' }
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'backend-test':
        return <BackendTest />;
      case 'content':
        return <ContentManager />;
      case 'hero-slides':
        return <HeroSlidesManager />;
      case 'hero-features':
        return <HeroFeaturesManager />;
      case 'services':
        return <ServicesManager />;
      case 'about-stats':
        return <AboutStatsManager />;
      case 'footer-links':
        return <FooterBottomLinksManager />;
      case 'contact':
        return <ContactManager />;
      case 'contact-messages':
        return <ContactMessagesManager />;
      case 'map-points':
        return <MapPointsManager />;
      default:
        return <BackendTest />;
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <img src="/logo.png" alt="ARNA" className="logo-image" />
          </div>
          <h1 className="dashboard-title">Admin Dashboard</h1>
        </div>
        
        <div className="header-right">
          <div className="admin-info">
            <span className="admin-name">Welcome, {admin?.username}</span>
            <span className="admin-email">{admin?.email}</span>
          </div>
          <button className="btn btn-outline logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <aside className="dashboard-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">Overview</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📝</div>
                <div className="stat-info">
                  <div className="stat-value">{loading ? '...' : stats.totalSections}</div>
                  <div className="stat-label">Content Sections</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⚙️</div>
                <div className="stat-info">
                  <div className="stat-value">{loading ? '...' : stats.totalServices}</div>
                  <div className="stat-label">Services</div>
                </div>
              </div>

            </div>
            
            <div className="contact-messages-overview">
              <button 
                className="contact-messages-btn"
                onClick={() => setActiveTab('contact-messages')}
              >
                <span className="btn-icon">💬</span>
                <span className="btn-text">Contact Messages</span>
                <span className="message-count">{loading ? '...' : stats.totalMessages}</span>
              </button>
            </div>
          </div>

          <nav className="sidebar-nav">
            <h3 className="sidebar-title">Management</h3>
            <ul className="nav-list">
              {tabs.map(tab => (
                <li key={tab.id} className="nav-item">
                  <button
                    className={`nav-link1 ${activeTab === tab.id ? 'active' : ''} ${tab.isSpecial ? 'special-nav' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span className="nav-icon">{tab.icon}</span>
                    <span className="nav-label">{tab.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="sidebar-section">
            <h3 className="sidebar-title">Quick Actions</h3>
            <div className="quick-actions">
              <a href="/" target="_blank" className="btn btn-outline btn-sm">
                View Website
              </a>
            </div>
          </div>
        </aside>

        <main className="dashboard-main">
          <div className="main-content">
            {renderActiveTab()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
