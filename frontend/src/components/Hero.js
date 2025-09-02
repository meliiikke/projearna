import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { normalizeImageUrl, API_BASE_URL } from '../config/api';
import './Hero.css';

const Hero = () => {
  const [heroFeatures, setHeroFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState({});
  
  // Demo slider verileri (admin panelinden güncellenebilir)
  const [sliderData, setSliderData] = useState([
    {
      id: 1,
      title: "Meeting Future Demand In A Sustainable Way",
      subtitle: "We're doing our part in that regard with greener practices that don't harm the environment.",
      content: "Leading the way in sustainable energy solutions for a better tomorrow",
      button_text: "DISCOVER MORE",
      button_link: "#services",
      image_url: ""
    },
    {
      id: 2,
      title: "Advanced Energy Solutions",
      subtitle: "Cutting-edge technology meets environmental responsibility for a cleaner future.",
      content: "Innovative approaches to carbon capture and sustainable energy production",
      button_text: "LEARN MORE",
      button_link: "#about",
      image_url: ""
    }
  ]);

  // Preload image function - Sadece Cloudinary için
  const preloadImage = useCallback((imageUrl) => {
    if (!imageUrl) return Promise.resolve();
    
    const normalizedUrl = normalizeImageUrl(imageUrl);
    
    // Eski resim URL'si ise yükleme
    if (!normalizedUrl) {
      console.warn('Eski resim URL\'si, yüklenmeyecek:', imageUrl);
      return Promise.resolve();
    }
    
    // Check if image is already loaded
    if (imagesLoaded[normalizedUrl] !== undefined) {
      return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        setImagesLoaded(prev => ({ ...prev, [normalizedUrl]: true }));
        resolve();
      };
      img.onerror = () => {
        console.warn('Failed to load Cloudinary image:', normalizedUrl);
        setImagesLoaded(prev => ({ ...prev, [normalizedUrl]: false }));
        resolve(); // Resolve anyway to not block loading
      };
      img.src = normalizedUrl;
    });
  }, [imagesLoaded]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First check if backend is running
        console.log('Checking backend health...');
        try {
          const healthRes = await fetch(`${API_BASE_URL}/health`);
          const healthData = await healthRes.json();
          console.log('Backend health check:', healthData);
        } catch (healthError) {
          console.error('Backend health check failed:', healthError);
          // Don't return, continue with hero features anyway
        }
        
        // Fetch hero slides (try both endpoints)
        let slidesRes = null;
        try {
          const slidesResponse = await fetch(`${API_BASE_URL}/hero-slides/slides`);
          const slidesData = await slidesResponse.json();
          if (slidesData && slidesData.length > 0) {
            // Eski resimleri filtrele, sadece Cloudinary resimlerini kullan
            const filteredSlides = slidesData.filter(slide => {
              const normalizedUrl = normalizeImageUrl(slide.image_url);
              if (!normalizedUrl && slide.image_url) {
                console.warn(`Hero slide "${slide.title}" eski resim URL'si kullanıyor, filtrelendi:`, slide.image_url);
                return false;
              }
              return true;
            });
            
            console.log(`Hero slides: ${slidesData.length} toplam, ${filteredSlides.length} geçerli (Cloudinary)`);
            setSliderData(filteredSlides);
            slidesRes = { data: filteredSlides };
          }
        } catch (slidesError) {
          console.log('Hero slides endpoint failed, using default data');
        }
        
        // Skip hero content for now, focus on features
        
        // Fetch hero features
        console.log('Requesting hero features from:', '/api/content/hero-features');
        console.log('Full URL will be:', window.location.origin + '/api/content/hero-features');
        
        // Try direct backend URL
        let featuresRes;
        try {
          const featuresResponse = await fetch(`${API_BASE_URL}/content/hero-features`);
          const featuresData = await featuresResponse.json();
          featuresRes = { data: featuresData, status: featuresResponse.status };
          console.log('Hero features response - status:', featuresResponse.status);
        } catch (error) {
          console.log('Hero features endpoint failed:', error);
          featuresRes = { data: [], status: 500 };
        }
        
        console.log('Hero features response data:', featuresRes.data);
        
        // If no features returned, try fetching all (including inactive)
        if (!featuresRes.data || featuresRes.data.length === 0) {
          console.log('No active hero features found, trying admin endpoint...');
          try {
            const adminResponse = await fetch(`${API_BASE_URL}/content/admin/hero-features`);
            const adminData = await adminResponse.json();
            console.log('Admin hero features response:', adminData);
          } catch (adminError) {
            console.log('Admin endpoint failed:', adminError);
          }
        }
        
        setHeroFeatures(featuresRes.data || []);
        
        // Preload slider images - use the updated sliderData
        const currentSliderData = slidesRes && slidesRes.data && slidesRes.data.length > 0 ? slidesRes.data : (sliderData || []);
        const imagePromises = currentSliderData
          .filter(slide => slide && slide.image_url)
          .map(slide => preloadImage(slide.image_url));
        
        await Promise.all(imagePromises);
      } catch (error) {
        console.error('Error fetching hero data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [sliderData, preloadImage]); // Include sliderData and preloadImage dependencies

  // Otomatik slider geçişi
  useEffect(() => {
    if (sliderData.length > 0) {
      const slideInterval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % sliderData.length);
      }, 6000); // 6 saniyede bir değiş

      return () => clearInterval(slideInterval);
    }
  }, [sliderData.length]);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % sliderData.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + sliderData.length) % sliderData.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId.replace('#', ''));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <section className="hero">
        <div className="hero-background">
          <div className="hero-overlay"></div>
          <div className="hero-image hero-loading-image"></div>
        </div>
        <div className="hero-loading">
          <div className="loading-content">
            <div className="loading-logo">
              <div className="logo-placeholder"></div>
            </div>
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
            </div>
            <div className="loading-text">Yükleniyor...</div>
          </div>
        </div>
      </section>
    );
  }

  const currentSlideData = sliderData[currentSlide];

  return (
    <section id="home" className="hero hero-slider">
      <div className="hero-background">
        <div className="hero-overlay"></div>
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentSlide}
            className={`hero-image ${currentSlideData?.image_url && imagesLoaded[normalizeImageUrl(currentSlideData.image_url)] ? 'image-loaded' : 'image-placeholder'}`}
            style={{
              backgroundImage: (() => {
                if (!currentSlideData?.image_url) return undefined;
                const normalizedUrl = normalizeImageUrl(currentSlideData.image_url);
                if (!normalizedUrl) return undefined;
                if (imagesLoaded[normalizedUrl] === false) return undefined;
                return `linear-gradient(135deg, rgba(26, 26, 26, 0.7) 0%, rgba(197, 165, 114, 0.1) 50%, rgba(26, 26, 26, 0.8) 100%), url(${normalizedUrl})`;
              })()
            }}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          ></motion.div>
        </AnimatePresence>
      </div>

      {/* Slider Controls */}
      <div className="slider-controls">
        <button className="slider-btn slider-btn-prev" onClick={prevSlide}>
          ‹
        </button>
        <button className="slider-btn slider-btn-next" onClick={nextSlide}>
          ›
        </button>
      </div>

      {/* Slider Dots */}
      {/* Slider Controls */}
      <div className="slider-controls">
        <button className="slider-btn" onClick={prevSlide}>
          ‹
        </button>
        <button className="slider-btn" onClick={nextSlide}>
          ›
        </button>
      </div>

      {/* Slider Dots */}
      <div className="slider-dots">
        {sliderData.map((_, index) => (
          <button
            key={index}
            className={`slider-dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          ></button>
        ))}
      </div>

      <div className="container">
        <div className="hero-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              className="hero-text"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1 
                className="hero-title"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {currentSlideData?.title || 'Meeting Future Demand In A Sustainable Way'}
              </motion.h1>
              
              <motion.p 
                className="hero-subtitle"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                {currentSlideData?.subtitle || "We're doing our part in that regard with greener practices that don't harm the environment."}
              </motion.p>

              {currentSlideData?.content && (
                <motion.p 
                  className="hero-description"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  {currentSlideData.content}
                </motion.p>
              )}

              <motion.div 
                className="hero-actions"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                {currentSlideData?.button_text && currentSlideData?.button_link && (
                  <button 
                    className="btn btn-primary hero-btn"
                    onClick={() => scrollToSection(currentSlideData.button_link)}
                  >
                    {currentSlideData.button_text}
                  </button>
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>

          <div className="hero-features">
            {console.log('Rendering hero features, count:', heroFeatures?.length)}
            {console.log('Hero features data:', heroFeatures)}
            {heroFeatures && heroFeatures.length > 0 ? (
              heroFeatures.map((feature, index) => (
                <motion.div 
                  key={feature.id}
                  className="feature-item"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 1 + (index * 0.2) }}
                >
                  <div className="feature-icon">✓</div>
                  <span className="feature-text">{feature.title}</span>
                </motion.div>
              ))
            ) : (
              <div className="feature-item">
                <div className="feature-icon">⭐</div>
                <span className="feature-text">No Hero Features (Add via Admin)</span>
              </div>
            )}
          </div>
        </div>
      </div>


    </section>
  );
};

export default Hero;
