import { useEffect } from 'react';
import { gsap, ScrollTrigger } from './gsap';

export function useParallax(targetRef, speed = 15) {
  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const anim = gsap.to(el, {
      yPercent: speed,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.8,
      },
    });

    return () => {
      anim.kill();
    };
  }, [targetRef, speed]);
}

export default useParallax;
