import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [contactInfo, setContactInfo] = useState({});

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/content/contact');
        const data = await response.json();
        setContactInfo(data);
      } catch (error) {
        console.error('Error fetching contact info:', error);
      }
    };

    fetchContactInfo();
  }, []);

  // Menü açıkken body scroll'unu engelle
  useEffect(() => {
    if (isMenuOpen) {
      // Scroll pozisyonunu kaydet
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${scrollY}px`;
      document.body.classList.add('menu-open');
    } else {
      // Scroll pozisyonunu geri yükle
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      document.body.classList.remove('menu-open');
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      document.body.classList.remove('menu-open');
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const scrollToSection = (sectionId) => {
    // Önce menüyü kapat
    closeMenu();
    
    // Kısa bir gecikme ile scroll işlemini yap (menü kapanma animasyonu için)
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        // Smooth scroll için offset hesapla
        const headerHeight = window.innerWidth <= 768 ? 70 : 90; // Responsive header yüksekliği
        const elementPosition = element.offsetTop - headerHeight;
        
        window.scrollTo({
          top: elementPosition,
          behavior: 'smooth'
        });
      }
    }, 300); // Menü kapanma animasyonu için 300ms bekle
  };

  return (
    <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <img 
              src="/arna-logo.png" 
              alt="ARNA Energy" 
              className="logo-image-only"
            />
          </div>

          <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
            <ul className="nav-list">
              <li className="nav-item">
                <button 
                  className="nav-link" 
                  onClick={() => scrollToSection('home')}
                >
                  HOME
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className="nav-link" 
                  onClick={() => scrollToSection('about')}
                >
                  ABOUT US
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className="nav-link" 
                  onClick={() => scrollToSection('services')}
                >
                  SERVICES
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className="nav-link" 
                  onClick={() => scrollToSection('contact')}
                >
                  CONTACT
                </button>
              </li>
            </ul>
          </nav>

          <div className="header-actions">
            <div className="contact-info">
              <span className="contact-text">{contactInfo.phone || '+90 555 55 55'}</span>
              <span className="contact-text">{contactInfo.email || 'info@arna.com.tr'}</span>
            </div>
            
            <button className={`menu-toggle ${isMenuOpen ? 'menu-open' : ''}`} onClick={toggleMenu}>
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
