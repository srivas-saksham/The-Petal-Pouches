import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const SCROLL_KEY = 'app-scroll-position';

export default function useScrollRestoration() {
  const location = useLocation();
  const isFirstLoad = useRef(true);

  useEffect(() => {
    // FIRST LOAD (refresh / hard reload)
    if (isFirstLoad.current) {
      const savedY = sessionStorage.getItem(SCROLL_KEY);

      if (savedY !== null) {
        window.scrollTo(0, Number(savedY));
      } else {
        window.scrollTo(0, 0);
      }

      isFirstLoad.current = false;
      return;
    }

    // CLIENT-SIDE NAVIGATION → always scroll to top
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  // Save scroll position on reload
  useEffect(() => {
    const saveScroll = () => {
      sessionStorage.setItem(SCROLL_KEY, window.scrollY.toString());
    };

    window.addEventListener('beforeunload', saveScroll);
    return () => window.removeEventListener('beforeunload', saveScroll);
  }, []);
}
