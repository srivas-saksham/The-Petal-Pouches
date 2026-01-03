// frontend/src/components/home/ExperienceGallery.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CircularGallery from '../reactbits/CircularGallery';

// Interactive Grid Background Component
const GridBackground = ({ gridSize = 40, opacity = 0.05, mousePos }) => {
  const [gridDimensions, setGridDimensions] = useState({ rows: 0, cols: 0 });
  const containerRef = React.useRef(null);

  useEffect(() => {
    const updateGridDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const cols = Math.ceil(rect.width / gridSize);
        const rows = Math.ceil(rect.height / gridSize);
        setGridDimensions({ rows, cols });
      }
    };

    updateGridDimensions();
    window.addEventListener('resize', updateGridDimensions);
    return () => window.removeEventListener('resize', updateGridDimensions);
  }, [gridSize]);

  const getHoveredCell = () => {
    if (!mousePos || !containerRef.current) return null;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = mousePos.x - rect.left;
    const y = mousePos.y - rect.top;
    const col = Math.floor(x / gridSize);
    const row = Math.floor(y / gridSize);
    
    if (col >= 0 && col < gridDimensions.cols && row >= 0 && row < gridDimensions.rows) {
      return { row, col };
    }
    return null;
  };

  const hoveredCell = getHoveredCell();

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 1 }}
    >
      {Array.from({ length: gridDimensions.rows }).map((_, row) =>
        Array.from({ length: gridDimensions.cols }).map((_, col) => {
          const isHovered = hoveredCell && hoveredCell.row === row && hoveredCell.col === col;
          
          return (
            <div
              key={`${row}-${col}`}
              className="absolute border border-tpppink"
              style={{
                left: `${col * gridSize}px`,
                top: `${row * gridSize}px`,
                width: `${gridSize}px`,
                height: `${gridSize}px`,
                opacity: isHovered ? 0.6 : opacity,
                backgroundColor: isHovered ? '#d9566ab7' : 'transparent',
                transition: 'all 0.0s ease',
              }}
            />
          );
        })
      )}
    </div>
  );
};

// Main ExperienceGallery Component
const ExperienceGallery = () => {
  const [mousePos, setMousePos] = useState(null);
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ CUSTOM TEXT FOR EACH IMAGE - EDIT THESE!
    const customTexts = [
      'Romantic Evening',           // img1
      'Birthday Celebration',       // img2
      'Self Care Essentials',       // img3
      'Anniversary Special',        // img4
      'Corporate Gift Set',         // img5
      'Festival Delight',           // img6
      'Wellness & Spa',             // img7
      'New Parents Care',           // img8
      'Graduation Gift',            // img9
      'Thank You Bundle',           // img10
      // Add more custom texts as needed
    ];

    // Load images from public/assets/exp_gallery
    const loadGalleryImages = async () => {
      const items = [];
      let imageIndex = 1;
      let foundAll = false;

      // Try loading images until we can't find any more
      while (!foundAll) {
        try {
          const imagePath = `/assets/exp_gallery/img${imageIndex}.jpeg`;
          
          // Check if image exists by trying to load it
          const img = new Image();
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = imagePath;
          });

          // If we get here, image loaded successfully
          items.push({
            image: imagePath,
            text: customTexts[imageIndex - 1] || `Experience ${imageIndex}` // Use custom text or fallback
          });
          
          imageIndex++;
        } catch (error) {
          // Image doesn't exist, try different extensions
          try {
            const pngPath = `/assets/exp_gallery/img${imageIndex}.png`;
            const img = new Image();
            
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              img.src = pngPath;
            });

            items.push({
              image: pngPath,
              text: customTexts[imageIndex - 1] || `Experience ${imageIndex}` // Use custom text or fallback
            });
            
            imageIndex++;
          } catch (pngError) {
            // Try .jpg extension
            try {
              const jpgPath = `/assets/exp_gallery/img${imageIndex}.jpg`;
              const img = new Image();
              
              await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = jpgPath;
              });

              items.push({
                image: jpgPath,
                text: customTexts[imageIndex - 1] || `Experience ${imageIndex}` // Use custom text or fallback
              });
              
              imageIndex++;
            } catch (jpgError) {
              // No more images found
              foundAll = true;
            }
          }
        }
      }

      console.log(`✅ Found ${items.length} gallery images`);
      setGalleryItems(items);
      setLoading(false);
    };

    loadGalleryImages();
  }, []);

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  if (loading) {
    return (
      <section className="relative py-12 bg-gradient-to-b from-white via-pink-50/30 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-64 mx-auto mb-4"></div>
            <div className="h-12 bg-slate-200 rounded w-96 mx-auto mb-8"></div>
          </div>
          <div style={{ height: '600px' }} className="bg-slate-100 rounded-lg flex items-center justify-center">
            <div className="text-slate-400">Loading gallery...</div>
          </div>
        </div>
      </section>
    );
  }

  if (galleryItems.length === 0) {
    return null;
  }

  return (
    <section 
      className="relative py-12 bg-gradient-to-b from-white via-pink-50/30 to-white overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos(null)}
    >
      {/* Interactive Grid Background */}
      <GridBackground gridSize={45} opacity={0.12} mousePos={mousePos} />

      {/* Section Header */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs tracking-widest text-tppslate/80 mb-2 font-light uppercase"
        >
          Curated Collections
        </motion.p>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl text-tppslate mb-3"
        >
          Featured Gift Experiences
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-sm text-tppslate/90 max-w-xl mx-auto font-light"
        >
          Thoughtfully curated bundles for every special moment
        </motion.p>
      </div>

      {/* Circular Gallery */}
      <div className="relative z-10" style={{ height: '600px' }}>
        <CircularGallery 
          items={galleryItems}
          bend={2} 
          textColor="#2b2d30ff"
          borderRadius={0.05} 
          scrollSpeed={2}
          scrollEase={0.05}
          font="bold 30px serif"
        />
      </div>

      {/* CTA Button */}
      <div className="relative z-10 text-center mt-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-3 bg-tpppink text-white rounded-full text-md font-semibold shadow-lg hover:shadow-xl hover:bg-tpppink/90 transition-all"
        >
          Explore The Shop
        </motion.button>
      </div>
    </section>
  );
};

export default ExperienceGallery;