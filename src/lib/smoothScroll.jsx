import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap';

const SmoothScrollContext = createContext({
  lenis: null,
  scrollToId: () => {},
});

export const useLenis = () => useContext(SmoothScrollContext);

export function SmoothScrollProvider({ children }) {
  const [lenisInstance, setLenisInstance] = useState(null);
  const location = useLocation();
  const lenisRef = useRef(null);

  useEffect(() => {
    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isPanel = location.pathname.startsWith('/panel');

    if (prefersReducedMotion || isPanel) {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
        setLenisInstance(null);
      }
      return;
    }

    if (!lenisRef.current) {
      const lenis = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
      });

      lenisRef.current = lenis;
      setLenisInstance(lenis);

      lenis.on('scroll', ScrollTrigger.update);

      const tickerFn = (time) => {
        lenis.raf(time * 1000);
      };

      gsap.ticker.add(tickerFn);
      gsap.ticker.lagSmoothing(0);

      // Refresh on fonts loaded
      if (document.fonts) {
        document.fonts.ready.then(() => {
          ScrollTrigger.refresh();
        }).catch(() => {});
      }

      return () => {
        gsap.ticker.remove(tickerFn);
        lenis.destroy();
        lenisRef.current = null;
        setLenisInstance(null);
      };
    }
  }, [location.pathname]);

  // Route change scroll reset and refresh
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
    // Give DOM a frame to settle before refreshing triggers
    const timeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  const scrollToId = (id) => {
    const cleanId = id.replace(/^#/, '');
    const element = document.getElementById(cleanId);
    if (!element) return;

    if (lenisRef.current) {
      lenisRef.current.scrollTo(element, { offset: -72, duration: 1.2 });
    } else {
      const y = element.getBoundingClientRect().top + window.pageYOffset - 72;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <SmoothScrollContext.Provider value={{ lenis: lenisInstance, scrollToId }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

export default SmoothScrollProvider;
