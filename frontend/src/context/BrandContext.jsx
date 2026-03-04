// frontend/src/context/BrandContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const BrandContext = createContext(null);

export const BrandProvider = ({ children }) => {
  const [brandMode, setBrandModeState] = useState(() => {
    return localStorage.getItem('brandMode') || 'feminine';
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pendingMode, setPendingMode] = useState(null);
  const [transitionPhase, setTransitionPhase] = useState('idle');

  // Apply dark + brand-masculine class on mount
  useEffect(() => {
    if (brandMode === 'masculine') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.add('brand-masculine');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.remove('brand-masculine');
    }
  }, []);

  const setBrandMode = useCallback((mode) => {
    if (mode !== 'feminine' && mode !== 'masculine') return;
    if (mode === brandMode) return;
    if (isTransitioning) return;

    setPendingMode(mode);
    setIsTransitioning(true);
    setTransitionPhase('closing');
  }, [brandMode, isTransitioning]);

  const applyPendingMode = useCallback(() => {
    if (!pendingMode) return;
    localStorage.setItem('brandMode', pendingMode);
    setBrandModeState(pendingMode);
    if (pendingMode === 'masculine') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.add('brand-masculine');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.remove('brand-masculine');
    }
    setTransitionPhase('open');

    setTimeout(() => {
      setIsTransitioning(false);
      setPendingMode(null);
      setTransitionPhase('idle');
    }, 600);
  }, [pendingMode]);

  return (
    <BrandContext.Provider value={{
      brandMode,
      setBrandMode,
      isTransitioning,
      transitionPhase,
      pendingMode,
      applyPendingMode
    }}>
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => {
  const ctx = useContext(BrandContext);
  if (!ctx) throw new Error('useBrand must be used within BrandProvider');
  return ctx;
};