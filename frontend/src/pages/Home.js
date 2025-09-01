import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import About from '../components/About';
import Services from '../components/Services';
import Statistics from '../components/Statistics';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <div className="home-page">
      <Header />
      <Hero />
      <About />
      <Services />
      <Statistics />
      <Contact />
      <Footer />
    </div>
  );
};

export default Home;
