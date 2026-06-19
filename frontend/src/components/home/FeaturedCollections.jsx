// frontend/src/components/home/FeaturedCollections.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const COLLECTIONS = [
  { name: 'Rings', slug: 'ring' },
  { name: 'Earrings', slug: 'earings' },
  { name: 'Necklaces', slug: 'pendant' },
  { name: 'Bracelets', slug: 'bracelet' },
];

// Tries jpg -> jpeg -> png -> webp so any extension placed in
// public/assets/collections/<slug>.<ext> just works.
const EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

const CollectionImage = ({ slug, alt }) => {
  const [extIndex, setExtIndex] = useState(0);

  return (
    <img
      src={`/assets/collections/${slug}.${EXTENSIONS[extIndex]}`}
      alt={alt}
      loading="lazy"
      onError={() => setExtIndex((i) => (i < EXTENSIONS.length - 1 ? i + 1 : i))}
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
  );
};

// Interactive Grid Background — the base "flowing" layer behind the floating
// card, same white-background pattern used in ExperienceGallery.
const GridBackground = ({ gridSize = 45, opacity = 0.12, mousePos }) => {
  const [gridDimensions, setGridDimensions] = useState({ rows: 0, cols: 0 });
  const containerRef = useRef(null);

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
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
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

// Second grid variant — white borders + white hover-fill, used inside the
// pink card itself where a pink-bordered grid would be invisible.
const GridBackgroundOnPink = ({ gridSize = 45, opacity = 0.12, mousePos }) => {
  const [gridDimensions, setGridDimensions] = useState({ rows: 0, cols: 0 });
  const containerRef = useRef(null);

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
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
      {Array.from({ length: gridDimensions.rows }).map((_, row) =>
        Array.from({ length: gridDimensions.cols }).map((_, col) => {
          const isHovered = hoveredCell && hoveredCell.row === row && hoveredCell.col === col;
          return (
            <div
              key={`${row}-${col}`}
              className="absolute border border-white/35"
              style={{
                left: `${col * gridSize}px`,
                top: `${row * gridSize}px`,
                width: `${gridSize}px`,
                height: `${gridSize}px`,
                opacity: isHovered ? 0.7 : opacity,
                backgroundColor: isHovered ? '#ffffffb7' : 'transparent',
                transition: 'all 0.0s ease',
              }}
            />
          );
        })
      )}
    </div>
  );
};

const FeaturedCollections = () => {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState(null);

  const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });

  return (
    // Base section — continuous white/grid backdrop, matches the rest of the page
    <section
      className="relative py-16 md:py-24 bg-gradient-to-b from-white via-pink-50/30 to-white overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos(null)}
    >
      <GridBackground opacity={0.12} mousePos={mousePos} />

      {/* Side-margin wrapper — keeps the floating card off the viewport edges */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 md:px-12">

        {/* The floating card itself — big radius, realistic elevation shadow */}
        <div
          className="relative bg-tpppink rounded-[28px] sm:rounded-[36px] md:rounded-[48px] ring-1 ring-black/5 px-6 sm:px-10 md:px-14 py-12 md:py-16 overflow-hidden"
          style={{
            boxShadow:
              '0 30px 60px -15px rgba(0,0,0,0.35), 0 10px 24px -6px rgba(217,86,106,0.28)',
          }}
        >
          {/* Grid background inside the card — white-on-pink */}
          <GridBackgroundOnPink opacity={0.12} mousePos={mousePos} />

          <div className="relative z-10">
          {/* Section Header */}
          <div className="text-center mb-8 md:mb-10">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs tracking-widest mb-2 font-light uppercase text-white/70"
            >
              Shop By Category
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl text-white"
            >
              Women's Collection
            </motion.h2>
          </div>

          {/* Collection Cards — 1:1 aspect ratio, small */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
            {COLLECTIONS.map((col, i) => (
              <motion.button
                key={col.slug}
                type="button"
                onClick={() => navigate(`/shop?tags=${col.slug}`)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileTap={{ scale: 0.98 }}
                className="group relative aspect-square w-full max-w-[260px] mx-auto overflow-hidden rounded-2xl shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <CollectionImage slug={col.slug} alt={col.name} />

                {/* Gradient overlay — base layer, always on */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                {/* Darker layer fades in on hover — opacity is what actually transitions smoothly */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100" />

                <div className="absolute inset-x-0 bottom-0 p-1 md:p-2 text-center">
                  <h3 className="text-white text-2xl md:text-4xl font-medium tracking-wide font-italianno translate-y-2.5 md:translate-y-1">
                    {col.name}
                  </h3>
                  <span className="text-white/80 text-[8px] md:text-[11px] font-light tracking-wider uppercase inline-block">
                    Shop Now →
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;