// frontend/src/components/home/UnboxingReel.jsx

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { useRevealOnScroll } from '../../hooks/useIntersectionObserver';

/**
 * UnboxingReel Component
 * 
 * Features:
 * - Video showcase with custom controls
 * - Play/Pause overlay
 * - Mute toggle
 * - Fullscreen option
 * - Elegant reveal animation
 */
const UnboxingReel = () => {
  const { ref, style, isVisible } = useRevealOnScroll({
    threshold: 0.3,
    delay: 400,
    duration: 800,
  });

  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      } else if (videoRef.current.msRequestFullscreen) {
        videoRef.current.msRequestFullscreen();
      }
    }
  };

  return (
    <section
      ref={ref}
      style={style}
      className="home-section bg-white py-24"
    >
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="home-section-title">
            The Unboxing Experience
          </h2>
          <p className="home-section-subtitle">
            Watch the magic unfold. Every detail is designed to delight.
          </p>
        </motion.div>

        {/* Video Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="unboxing-reel-container"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => isPlaying && setShowControls(false)}
        >
          <div className="unboxing-video-wrapper">
            
            {/* Video Element */}
            <video
              ref={videoRef}
              className="unboxing-video"
              loop
              muted={isMuted}
              playsInline
              poster="/assets/video-thumbnail.jpg"
              onEnded={() => setIsPlaying(false)}
            >
              <source src="/assets/unboxing-video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Play/Pause Overlay */}
            {(!isPlaying || showControls) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="unboxing-play-overlay"
                onClick={togglePlay}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="unboxing-play-button"
                >
                  {isPlaying ? (
                    <Pause size={32} className="text-tpppink" />
                  ) : (
                    <Play size={32} className="text-tpppink ml-1" />
                  )}
                </motion.div>
              </motion.div>
            )}

            {/* Video Controls Bar */}
            {showControls && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4"
              >
                <div className="flex items-center justify-between max-w-5xl mx-auto">
                  
                  {/* Left Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors"
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? (
                        <Pause size={18} className="text-white" />
                      ) : (
                        <Play size={18} className="text-white ml-0.5" />
                      )}
                    </button>
                  </div>

                  {/* Right Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={toggleMute}
                      className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors"
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? (
                        <VolumeX size={18} className="text-white" />
                      ) : (
                        <Volume2 size={18} className="text-white" />
                      )}
                    </button>

                    <button
                      onClick={toggleFullscreen}
                      className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors"
                      aria-label="Fullscreen"
                    >
                      <Maximize size={18} className="text-white" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Social Proof / Instagram Feed Tease */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16"
        >
          <div className="text-center mb-8">
            <h3 className="text-xl md:text-2xl font-bold text-tppslate mb-2">
              Seen on Instagram
            </h3>
            <p className="font-inter text-slate-600">
              Join our community of gift-givers spreading joy
            </p>
          </div>

          {/* Mock Instagram Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <motion.div
                key={item}
                whileHover={{ scale: 1.05 }}
                className="aspect-square rounded-lg overflow-hidden bg-tpppeach/20 cursor-pointer group"
              >
                <div className="w-full h-full relative">
                  <img
                    src={`/assets/instagram-${item}.jpg`}
                    alt={`Customer unboxing ${item}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                  
                  {/* Instagram-style overlay on hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="text-white flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                        <span className="font-semibold">{Math.floor(Math.random() * 200) + 50}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                        <span className="font-semibold">{Math.floor(Math.random() * 50) + 10}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Follow CTA */}
          <div className="text-center mt-8">
            <a
              href="https://instagram.com/rizara"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white font-semibold rounded-full hover:scale-105 transition-transform shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Follow @rizara
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default UnboxingReel;