import React, { useEffect } from 'react';
import HomeLayout from '../components/home/HomeLayout';
import HeroParallax from '../components/home/HeroParallax';
import HeroParallaxMen from '../components/home/HeroParallaxMen';
import ExperienceGallery from '../components/home/ExperienceGallery';
import ExperienceGalleryMen from '../components/home/ExperienceGalleryMen';
import WhatsTheOccasion from '../components/home/WhatsTheOccasion';
import GiftQuizModule from '../components/home/GiftQuizModule';
import HomeFooter from '../components/home/HomeFooter';
import { useBrand } from '../context/BrandContext';
import '../styles/home.css';
import SEO from '../components/seo/SEO';

const Home = () => {
  const { brandMode } = useBrand();

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => { document.title = 'Rizara Luxe'; }, []);

  return (
    <>
      <SEO
        title="Luxury Jewelry & Curated Gift Bundles"
        description="Discover Rizara Luxe's handpicked collection of luxury jewelry and premium gift bundles. Crafted with elegance for unforgettable moments."
        canonical="https://www.rizara.in/"
        keywords="luxury jewelry, gift bundles, premium gifts, curated jewelry"
      />
      <HomeLayout>

        {/* Hero: switches based on brand mode */}
        {brandMode === 'masculine' ? <HeroParallaxMen /> : <HeroParallax />}

        {brandMode === 'masculine' ? <ExperienceGalleryMen /> : <ExperienceGallery />}
        {brandMode === 'masculine' ? '' : <WhatsTheOccasion />}
        <GiftQuizModule />

      </HomeLayout>
    </>
  );
};

export default Home;