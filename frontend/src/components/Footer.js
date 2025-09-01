import React, { useState, useEffect } from 'react';
import './Footer.css';



const Footer = () => {
  const [contactInfo, setContactInfo] = useState({});
  const [missionContent, setMissionContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use fallback data for now
        const fallbackContact = {
          phone: '+90-212-000-0000',
          email: 'info@arna.com',
          address: 'Istanbul, Turkey',
          working_hours: 'Mon-Fri: 9:00 AM - 6:00 PM'
        };
        
        const fallbackMission = {
          content: 'Leading the way in sustainable energy solutions for a better tomorrow.'
        };
        
        setContactInfo(fallbackContact);
        setMissionContent(fallbackMission);
        console.log('Contact info:', fallbackContact);
      } catch (error) {
        console.error('Error fetching footer data:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Auto-refresh her 30 saniyede bir
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <footer className="footer bg-dark">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer id="contact" className="footer bg-dark">
      <div className="footer-main">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="logo">
                <img 
                  src="/arna-logo.png" 
                  alt="ARNA Energy" 
                  className="logo-image-only"
                />
              </div>
              <p className="footer-description">
                {missionContent?.content || 'Leading the way in sustainable energy solutions for a better tomorrow. We are committed to providing clean, reliable, and affordable energy while protecting our environment.'}
              </p>
            </div>

            <div className="footer-section">
              <h3 className="footer-title">Quick Links</h3>
              <ul className="footer-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About Us</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h3 className="footer-title">Services</h3>
              <ul className="footer-links">
                <li><a href="#services">Clean Energy</a></li>
                <li><a href="#about">Sustainable Development</a></li>
                <li><a href="#services">Energy Transition</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h3 className="footer-title">Contact Info</h3>
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <span>{contactInfo.phone || '+90 555 55 55'}</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">✉️</span>
                <span>{contactInfo.email || 'info@arna.com.tr'}</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <span>{contactInfo.address || 'Levent Mahallesi, Büyükdere Caddesi No:201 Şişli/İSTANBUL'}</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">🕒</span>
                <span>{contactInfo.working_hours || 'Pazartesi - Cuma: 09:00 - 18:00'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p>&copy; 2025 ARNA. All rights reserved.</p>
            <div className="footer-bottom-links">
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
