import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { normalizeImageUrl } from '../config/api';
import { apiGet } from '../utils/api';
import './About.css';

const About = () => {
  const [aboutContent, setAboutContent] = useState(null);
  const [aboutFeatures, setAboutFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch about content
        console.log('Fetching about content from: /content/sections/about');
        const contentData = await apiGet('/content/sections/about');
        if (!contentData.error) {
          console.log('About content data received:', contentData);
          setAboutContent(contentData);
        } else {
          console.error('About content fetch failed:', contentData.error);
        }
        
        // Fetch about features
        console.log('Fetching about features from: /content/about-features');
        const featuresData = await apiGet('/content/about-features');
        if (!featuresData.error) {
          console.log('About features data received:', featuresData);
          setAboutFeatures(featuresData);
        } else {
          console.error('About features fetch failed:', featuresData.error);
        }

      } catch (error) {
        console.error('Error fetching about data:', error);
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Only run once on mount

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
