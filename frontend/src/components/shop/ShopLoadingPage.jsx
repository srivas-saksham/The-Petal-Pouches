// frontend/src/components/shop/ShopLoadingPage.jsx
import React, { useEffect, useState } from 'react';

/**
 * ShopLoadingPage Component
 * 
 * FEATURES:
 * - Animated zebra-style bars (tpppink & white)
 * - Bars slide from left to right with ease-in-out
 * - Shows for exactly 5 seconds
 * - Smooth fade out after 5 seconds
 * - Brand name "The Petal Pouches" displayed
 * - Elegant and professional design
 * 
 * USAGE:
 * ```jsx
 * const [showLoading, setShowLoading] = useState(true);
 * 
 * {showLoading && <ShopLoadingPage onComplete={() => setShowLoading(false)} />}
 * ```
 * 
 * @param {Function} onComplete - Callback when loading completes (after 5s)
 */
const ShopLoadingPage = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out after 4.5 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 4500);

    // Complete and unmount after 5 seconds
    const completeTimer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 5000);

    // Cleanup timers
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-white overflow-hidden transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Zebra Bars Container */}
      <div className="absolute inset-0 flex flex-col justify-center">
        {/* Generate 12 bars for full coverage */}
        {[...Array(12)].map((_, index) => {
          // Alternate between pink and white
          const isPink = index % 2 === 0;
          // Stagger the animation delays for wave effect
          const delay = index * 0.15;
          
          return (
            <div
              key={index}
              className={`h-[8.33%] w-full ${isPink ? 'bg-tpppink' : 'bg-white'}`}
              style={{
                animation: `slideBar 2s ease-in-out ${delay}s infinite`,
                transformOrigin: 'left center',
              }}
            />
          );
        })}
      </div>

      {/* Brand Name Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center px-6">
          {/* Main Brand Name */}
          <h1 
            className="text-7xl md:text-8xl lg:text-9xl font-greyqo text-white drop-shadow-2xl mb-4"
            style={{
              animation: 'fadeInScale 1s ease-out 0.3s both',
              textShadow: '0 4px 20px rgba(236, 72, 153, 0.5), 0 0 40px rgba(236, 72, 153, 0.3)',
            }}
          >
            The Petal Pouches
          </h1>

          {/* Subtitle */}
          <p 
            className="text-xl md:text-2xl font-semibold text-tpppink drop-shadow-lg"
            style={{
              animation: 'fadeInUp 1s ease-out 0.8s both',
              textShadow: '0 2px 10px rgba(255, 255, 255, 0.8)',
            }}
          >
            Curating Your Perfect Bundle
          </p>

          {/* Loading Progress Bar */}
          <div 
            className="mt-8 mx-auto w-64 h-1 bg-white/30 rounded-full overflow-hidden"
            style={{
              animation: 'fadeIn 0.5s ease-out 1.2s both',
            }}
          >
            <div 
              className="h-full bg-white rounded-full shadow-lg"
              style={{
                animation: 'progressBar 4.5s ease-in-out 0.5s both',
              }}
            />
          </div>

          {/* Loading Dots */}
          <div 
            className="mt-6 flex justify-center gap-2"
            style={{
              animation: 'fadeIn 0.5s ease-out 1.5s both',
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-white rounded-full"
                style={{
                  animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        /* Zebra Bar Sliding Animation */
        @keyframes slideBar {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        /* Fade In with Scale */
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Fade In with Upward Motion */
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Simple Fade In */
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        /* Progress Bar Fill */
        @keyframes progressBar {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }

        /* Pulsing Dots */
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        /* Prevent scrolling while loading */
        body {
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default ShopLoadingPage;