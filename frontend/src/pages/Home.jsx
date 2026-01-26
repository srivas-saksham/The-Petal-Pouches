// frontend/src/pages/Home.jsx

import React, { useEffect } from 'react';
import HomeLayout from '../components/home/HomeLayout';
import HeroParallax from '../components/home/HeroParallax';
import ExperienceGallery from '../components/home/ExperienceGallery';
import WhatsTheOccasion from '../components/home/WhatsTheOccasion';
import GiftQuizModule from '../components/home/GiftQuizModule';
import HomeFooter from '../components/home/HomeFooter';
import '../styles/home.css';
import SEO from '../components/seo/SEO';

/**
 * Home Component - REDESIGNED
 * 
 * Main landing page for Rizara
 * 
 * Layout Philosophy:
 * - Curved sections, NO straight edges
 * - Minimal, premium aesthetic
 * - Motion-first interactions
 * - Controlled whitespace
 * - Emotional storytelling through design
 * 
 * Structure:
 * 1. Hero with curved mask & parallax
 * 2. Experience Gallery (3 bundles with pop-out effect)
 * 3. Gift Quiz (two-column, right-heavy)
 */
const Home = () => {
  
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Set page title
  useEffect(() => {
    document.title = 'Rizara Luxe';
  }, []);

  return (
    <>
      <SEO
        title="Luxury Jewelry & Curated Gift Bundles"
        description="Discover Rizara Luxe's handpicked collection of luxury jewelry and premium gift bundles. Crafted with elegance for unforgettable moments."
        canonical="https://www.rizara.in/"
        keywords="luxury jewelry, gift bundles, premium gifts, curated jewelry"
      />
      <HomeLayout>
        
        {/* 1. Hero Section with Curved Mask & Parallax */}
        <HeroParallax />

        {/* 2. Experience Gallery - 3 Featured Bundles */}
        <ExperienceGallery />
        <WhatsTheOccasion />

        {/* 3. Gift Quiz - Two Column Layout */}
        <GiftQuizModule />

        <HomeFooter />

      </HomeLayout>
    </>
  );
};

export default Home;