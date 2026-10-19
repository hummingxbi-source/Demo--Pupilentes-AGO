import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from '../../lib/gsap';

export const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    // Only for fine pointers (mouse) and not reduced motion
    const isFine = window.matchMedia('(pointer: fine)').matches;
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isFine || isReduced) return;

    // Hide in panel, checkout, /movil or embedded iframe
    const isPanel = location.pathname.startsWith('/panel');
    const isCheckout = location.pathname.startsWith('/checkout');
    const isMovil = location.pathname === '/movil';
    const isEmbed =
      location.search.includes('embed=1') || window.location.hash.includes('embed=1');

    if (isPanel || isCheckout || isMovil || isEmbed) {
      if (dotRef.current) gsap.set(dotRef.current, { opacity: 0 });
      if (ringRef.current) gsap.set(ringRef.current, { opacity: 0 });
      return;
    }

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // quickTo setters for zero-react-render 60fps tracking
    const dotX = gsap.quickTo(dot, 'x', { duration: 0.04, ease: 'none' });
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.04, ease: 'none' });
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.24, ease: 'power2.out' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.24, ease: 'power2.out' });

    let isVisible = false;

    const onMouseMove = (e) => {
      if (!isVisible) {
        isVisible = true;
        gsap.to([dot, ring], { opacity: 1, duration: 0.3 });
      }
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };

    const onMouseLeave = () => {
      isVisible = false;
      gsap.to([dot, ring], { opacity: 0, duration: 0.2 });
    };

    // Delegated hover detection without mousemove cost
    const onMouseOver = (e) => {
      const target = e.target;
      const isInteractive =
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[data-cursor]') ||
        target.closest('[role="button"]') ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT';

      const isVideoOrIframe = target.tagName === 'VIDEO' || target.tagName === 'IFRAME';

      if (isVideoOrIframe) {
        gsap.to([dot, ring], { opacity: 0, duration: 0.2 });
      } else if (isInteractive) {
        gsap.to(ring, {
          scale: 1.6,
          borderColor: 'rgba(217, 190, 133, 0.65)',
          backgroundColor: 'rgba(176, 141, 87, 0.08)',
          duration: 0.3,
          ease: 'power2.out',
        });
        gsap.to(dot, { scale: 0.5, duration: 0.2 });
      } else {
        gsap.to(ring, {
          scale: 1,
          borderColor: 'rgba(176, 141, 87, 0.35)',
          backgroundColor: 'transparent',
          duration: 0.3,
          ease: 'power2.out',
        });
        gsap.to(dot, { scale: 1, duration: 0.2 });
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseover', onMouseOver, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseover', onMouseOver);
    };
  }, [location.pathname]);

  return (
    <>
      {/* Centro exacto: punto de 6px */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 -ml-[3px] -mt-[3px] rounded-full bg-brass pointer-events-none z-50 opacity-0 will-change-transform"
      />
      {/* Anillo de 34px con retardo suave */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-[34px] h-[34px] -ml-[17px] -mt-[17px] rounded-full border border-brass/35 pointer-events-none z-50 opacity-0 will-change-transform"
      />
    </>
  );
};

export default CustomCursor;
