import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { apiGet } from '../utils/api';
import './Statistics.css';

const Statistics = () => {
  const [statistics, setStatistics] = useState([]);
  const [mapPoints, setMapPoints] = useState([]);
  const [headerData, setHeaderData] = useState({
    title: 'Global Presence',
    subtitle: 'We Spread Around The World',
    content: 'Leading the way in sustainable energy solutions for a better tomorrow.'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('📊 Statistics component: Loading data...');

        // Fetch statistics + header data from about-stats endpoint
        const statsData = await apiGet('/content/about-stats');
        if (!statsData.error) {
          console.log('✅ About Stats loaded:', statsData);

          // items array varsa onu al
          if (Array.isArray(statsData.items)) {
            setStatistics(statsData.items);
          } else if (Array.isArray(statsData)) {
            setStatistics(statsData);
          } else {
            setStatistics([]);
          }

          // Header verisini al
          setHeaderData({
            title: statsData.title || 'Global Presence',
            subtitle: statsData.subtitle || 'We Spread Around The World',
            content: statsData.content || 'Leading the way in sustainable energy solutions for a better tomorrow.'
          });
        } else {
          console.log('⚠️ About Stats API failed, using fallback data');
          // Fallback data
          setStatistics([
            { id: 1, value: '25+', title: 'Years of Experience' },
            { id: 2, value: '77', title: 'Office Worldwide' },
            { id: 3, value: '38K', title: 'Workers Employed' }
          ]);
          setHeaderData({
            title: 'Global Presence',
            subtitle: 'We Spread Around The World',
            content: 'Leading the way in sustainable energy solutions for a better tomorrow.'
          });
        }

        // Fetch map points
        const mapData = await apiGet('/content/map-points');
        if (!mapData.error) {
          console.log('✅ Map points loaded:', mapData.length, 'items');
          setMapPoints(mapData);
        } else {
          console.log('⚠️ Map points API failed, using fallback data');
          setMapPoints([
            { id: 1, title: 'Istanbul Office', latitude: 41.0082, longitude: 28.9784 },
            { id: 2, title: 'Ankara Office', latitude: 39.9334, longitude: 32.8597 }
          ]);
        }

        setError(null);
      } catch (error) {
        console.error('Statistics component: Veri yükleme hatası:', error);
        setError(error.message);

        // fallback
        setStatistics([
          { id: 1, value: '25+', title: 'Years of Experience' },
          { id: 2, value: '77', title: 'Office Worldwide' },
          { id: 3, value: '38K', title: 'Workers Employed' }
        ]);
        setMapPoints([]);
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
      <section className="statistics section bg-dark">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading statistics...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="statistics section bg-dark">
      <div className="container">
        {error && (
          <div style={{ color: 'red', textAlign: 'center', marginBottom: '20px' }}>
            Error: {error}
          </div>
        )}

        <motion.div
          className="section-header text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="section-subtitle text-white">{headerData.subtitle}</span>
          <h2 className="section-title text-white">{headerData.title}</h2>
          <p className="section-description text-white">
            {headerData.content}
          </p>
        </motion.div>

        <div className="stats-grid">
          {statistics.map((stat, index) => (
            <motion.div
              key={stat.id}
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="stat-content">
                <div className="stat-value">
                  {stat.value && stat.value.includes('+') ? (
                    <CountUp
                      end={parseInt(stat.value.replace(/[^0-9]/g, '')) || 0}
                      duration={2.5}
                      delay={0.5 + (index * 0.2)}
                      suffix="+"
                      useEasing={false}
                      useGrouping={false}
                    />
                  ) : stat.value && stat.value.includes('K') ? (
                    <CountUp
                      end={parseInt(stat.value.replace(/[^0-9]/g, '')) || 0}
                      duration={2.5}
                      delay={0.5 + (index * 0.2)}
                      suffix="K"
                      useEasing={false}
                      useGrouping={false}
                    />
                  ) : (
                    <CountUp
                      end={parseInt(stat.value.replace(/[^0-9]/g, '')) || 0}
                      duration={2.5}
                      delay={0.5 + (index * 0.2)}
                      useEasing={false}
                      useGrouping={false}
                    />
                  )}
                </div>
                <div className="stat-title">{stat.title}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="world-map">
          <motion.div
            className="map-container"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="map-placeholder">
              <div className="map-bg">
                <img
                  src={require('../assets/map.png')}
                  alt="World Map"
                  className="world-map-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.style.background = 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)';
                  }}
                />
              </div>
              <div className="map-points">
                {mapPoints && mapPoints.length > 0 && mapPoints.map((point, index) => {
                  let x, y;

                  if (point.x && point.y) {
                    x = point.x;
                    y = point.y;
                  } else if (point.latitude && point.longitude) {
                    const lat = point.latitude;
                    const lng = point.longitude;
                    x = ((lng + 180) / 360) * 100;
                    y = ((90 - lat) / 180) * 100;
                  } else {
                    const baseX = 10 + (index * 15) % 80;
                    const baseY = 10 + (index * 20) % 80;
                    x = baseX + (Math.random() - 0.5) * 10;
                    y = baseY + (Math.random() - 0.5) * 10;
                    x = Math.max(5, Math.min(95, x));
                    y = Math.max(5, Math.min(95, y));
                  }

                  return (
                    <motion.div
                      key={point.id}
                      className="map-point"
                      style={{
                        position: 'absolute',
                        left: `${x}%`,
                        top: `${y}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: index * 0.2 }}
                      viewport={{ once: true }}
                      title={`${point.title}: ${point.description}`}
                    >
                      <div className="map-point-tooltip">
                        <div className="tooltip-title">{point.title}</div>
                        <div className="tooltip-description">{point.description}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Statistics;
