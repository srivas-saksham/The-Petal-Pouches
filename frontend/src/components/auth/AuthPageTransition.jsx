// frontend/src/components/auth/AuthPageTransition.jsx

import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

/**
 * AuthPageTransition - Wrapper for RIGHT SECTION ONLY
 * Creates a vertical scroll/reel effect between login and register
 * Both forms visible during transition like Instagram reels
 */
export default function AuthPageTransition({ children }) {
  const location = useLocation();
  
  // Determine direction based on route
  const isRegister = location.pathname === '/register';
  const direction = isRegister ? 'down' : 'up';

  const pageVariants = {
    initial: (custom) => ({
      y: custom === 'down' ? '100vh' : '-100vh', // Start off-screen
      opacity: 1,
    }),
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'tween',
        ease: [0.22, 1, 0.36, 1],
        duration: 1.2, // Slower animation (1.2 seconds)
      }
    },
    exit: (custom) => ({
      y: custom === 'down' ? '-100vh' : '100vh', // Exit off-screen
      opacity: 1,
      transition: {
        type: 'tween',
        ease: [0.22, 1, 0.36, 1],
        duration: 1.2, // Same duration as enter
      }
    })
  };

  return (
    <div className="w-full lg:w-2/5 relative overflow-hidden h-screen">
      <AnimatePresence mode="sync" custom={direction}>
        <motion.div
          key={location.pathname}
          custom={direction}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="absolute inset-0 w-full h-full flex"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}