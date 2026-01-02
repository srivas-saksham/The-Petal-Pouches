// frontend/src/pages/Home.jsx

import React, { useEffect } from 'react';
import HomeLayout from '../components/home/HomeLayout';
import HeroParallax from '../components/home/HeroParallax';
import ExperienceGallery from '../components/home/ExperienceGallery';
import GiftQuizModule from '../components/home/GiftQuizModule';
import '../styles/home.css';

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
    document.title = 'Rizara - Gifts That Say More Than Words';
  }, []);

  return (
    <HomeLayout>
      
      {/* 1. Hero Section with Curved Mask & Parallax */}
      <HeroParallax />

      {/* 2. Experience Gallery - 3 Featured Bundles */}
      <ExperienceGallery />

      {/* 3. Gift Quiz - Two Column Layout */}
      <GiftQuizModule />

    </HomeLayout>
  );
};

export default Home;