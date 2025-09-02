import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { normalizeImageUrl } from '../config/api';
import './Services.css';

import { API_BASE_URL } from '../config/api';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        console.log('Fetching services from:', `${API_BASE_URL}/content/services`);
        const response = await fetch(`${API_BASE_URL}/content/services`);
        console.log('Services response - status:', response.status);
        console.log('Services response - ok:', response.ok);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Services data received:', data);
          setServices(data);
        } else {
          console.error('Services fetch failed:', response.status, response.statusText);
          // Fallback data
          setServices([
            { id: 1, title: 'Clean Energy', description: 'Sustainable energy solutions' },
            { id: 2, title: 'Solar Power', description: 'Renewable solar energy' },
            { id: 3, title: 'Wind Energy', description: 'Clean wind power solutions' }
          ]);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
        // Fallback data
        setServices([
          { id: 1, title: 'Clean Energy', description: 'Sustainable energy solutions' },
          { id: 2, title: 'Solar Power', description: 'Renewable solar energy' },
          { id: 3, title: 'Wind Energy', description: 'Clean wind power solutions' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();

    // Auto-refresh kaldırıldı - gereksiz tekrarları önlemek için
    // const interval = setInterval(fetchServices, 30000);
    // return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <section id="services" className="services section bg-light">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="services section bg-light">
      <div className="container">
        <motion.div 
          className="section-header text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="section-subtitle">Our Services</span>
          <h2 className="section-title">Leading Energy Solutions</h2>
          <p className="section-description">
            We provide comprehensive energy solutions that meet the demands of today while building a sustainable tomorrow.
          </p>
        </motion.div>

        <div className="services-grid">
          {Array.isArray(services) && services.map((service, index) => (
            <motion.div
              key={service.id}
              className="service-card"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              {service.image_url && (
                <div className="service-image">
                  <img src={normalizeImageUrl(service.image_url)} alt={service.title} />
                </div>
              )}
              <div className="service-content">
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
