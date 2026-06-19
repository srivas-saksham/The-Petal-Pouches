// frontend/src/components/home/FeaturedCollectionsMen.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const COLLECTIONS = [
  { name: 'Rings', slug: 'rings' },
  { name: 'Chains', slug: 'chains' },
  { name: 'Pendants', slug: 'pendants' },
  { name: 'Bracelets', slug: 'bracelets' },
];

// Tries jpg -> jpeg -> png -> webp so any extension placed in
// public/assets/collections_mens/<slug>.<ext> just works.
const EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

const CollectionImage = ({ slug, alt }) => {
  const [extIndex, setExtIndex] = useState(0);

  return (
    <img
      src={`/assets/collections_mens/${slug}.${EXTENSIONS[extIndex]}`}
      alt={alt}
      loading="lazy"
      onError={() => setExtIndex((i) => (i < EXTENSIONS.length - 1 ? i + 1 : i))}
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
  );
};

// Interactive Grid Background — pulled directly from ExperienceGalleryMen's
// pattern (border-tppdarkwhite, white hover-fill) to match the men's theme.
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
              className="absolute border border-tppdarkwhite"
              style={{
                left: `${col * gridSize}px`,
                top: `${row * gridSize}px`,
                width: `${gridSize}px`,
                height: `${gridSize}px`,
                opacity: isHovered ? 0.6 : opacity,
                backgroundColor: isHovered ? '#ffffffcf' : 'transparent',
                transition: 'all 0.0s ease',
              }}
            />
          );
        })
      )}
    </div>
  );
};

const FeaturedCollectionsMen = () => {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState(null);

  const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });

  return (
    <section
      className="relative py-12 md:py-16 bg-gradient-to-b from-tppdark via-tppdarkgray/70 to-tppdark overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos(null)}
    >
      {/* Interactive Grid Background */}
      <GridBackground opacity={0.12} mousePos={mousePos} />

      <div className="relative z-10 max-w-7xl mx-auto px-6">

        {/* Section Header */}
        <div className="text-center mb-8 md:mb-10">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs tracking-widest mb-2 font-light uppercase text-tppdarkwhite/60"
          >
            Shop By Category
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl text-tppdarkwhite"
          >
            Men's Collection
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
              className="group relative aspect-square w-full max-w-[260px] mx-auto overflow-hidden rounded-2xl shadow-md ring-1 ring-tppdarkwhite/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-tppdarkwhite"
            >
              <CollectionImage slug={col.slug} alt={col.name} />

              {/* Gradient overlay — base layer, always on */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              {/* Darker layer fades in on hover — opacity is what actually transitions smoothly */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100" />

              <div className="absolute inset-x-0 bottom-0 p-4 text-center">
                <h3 className="text-tppdarkwhite text-lg md:text-xl font-medium tracking-wide">
                  {col.name}
                </h3>
                <span className="text-tppdarkwhite/70 text-[11px] font-light tracking-wider uppercase mt-0.5 inline-block">
                  Shop Now →
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollectionsMen;
