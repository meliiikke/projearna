import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { normalizeImageUrl } from '../config/api';
import './About.css';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://projearna-production.up.railway.app';

const About = () => {
  const [aboutContent, setAboutContent] = useState(null);
  const [aboutFeatures, setAboutFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch about content
        const contentResponse = await fetch(`${API_BASE_URL}/api/content/sections/about`);
        const contentData = await contentResponse.json();
        setAboutContent(contentData);
        
        // Fetch about features
        const featuresResponse = await fetch(`${API_BASE_URL}/api/content/about-features`);
        const featuresData = await featuresResponse.json();
        setAboutFeatures(featuresData);
        

      } catch (error) {
        console.error('Error fetching about data:', error);
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
      <section id="about" className="about section">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="about section">
      <div className="container">
        <div className="about-content">
          <motion.div 
            className="about-text"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="section-header">
              <span className="section-subtitle">
                {aboutContent?.subtitle || 'Who We Are'}
              </span>
              <h2 className="section-title">
                {aboutContent?.title || 'Providing affordable and reliable energy'}
              </h2>
            </div>

            <div className="about-description">
              <p>{aboutContent?.content || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.'}</p>
            </div>

            <div className="about-features">
              <div className="feature-list">
                {Array.isArray(aboutFeatures) && aboutFeatures.length > 0 ? (
                  aboutFeatures.map((feature) => (
                    <div key={feature.id} className="feature-item">
                      <div className="feature-icon">✓</div>
                      <span>{feature.title}</span>
                    </div>
                  ))
                ) : (
                  <div className="feature-item">
                    <div className="feature-icon">✓</div>
                    <span>Clean energy for a bright future</span>
                  </div>
                )}
              </div>
            </div>



            {aboutContent?.button_text && (
              <div className="about-actions">
                <button className="btn btn-primary">
                  {aboutContent.button_text}
                </button>
              </div>
            )}
          </motion.div>

          <motion.div 
            className="about-image"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="image-container">
              <div className="main-image">
                <div className="image-placeholder">
                  <div 
                    className="industrial-bg"
                    style={{
                      backgroundImage: aboutContent?.image_url 
                        ? (() => {
                            const normalizedUrl = normalizeImageUrl(aboutContent.image_url);
                            if (!normalizedUrl) {
                              console.warn('About section eski resim URL\'si kullanıyor:', aboutContent.image_url);
                              return 'linear-gradient(135deg, rgba(197, 165, 114, 0.8) 0%, rgba(26, 26, 26, 0.6) 50%, rgba(197, 165, 114, 0.8) 100%)';
                            }
                            return `linear-gradient(135deg, rgba(197, 165, 114, 0.8) 0%, rgba(26, 26, 26, 0.6) 50%, rgba(197, 165, 114, 0.8) 100%), url(${normalizedUrl})`;
                          })()
                        : undefined
                    }}
                    onError={(e) => {
                      // Cloudinary URL'si başarısız olursa placeholder göster
                      e.target.style.backgroundImage = 'linear-gradient(135deg, rgba(197, 165, 114, 0.8) 0%, rgba(26, 26, 26, 0.6) 50%, rgba(197, 165, 114, 0.8) 100%)';
                    }}
                  ></div>
                </div>
                <div className="play-button">
                  <div className="play-icon">▶</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
