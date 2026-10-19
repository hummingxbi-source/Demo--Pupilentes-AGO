import { useEffect } from 'react';
import { gsap, ScrollTrigger } from './gsap';

export function useReveal(targetRef, options = {}) {
  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }

    const {
      y = 24,
      duration = 1.1,
      ease = 'power3.out',
      start = 'top 85%',
      delay = 0,
    } = options;

    const anim = gsap.fromTo(
      el,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration,
        ease,
        delay,
        scrollTrigger: {
          trigger: el,
          start,
          once: true,
        },
      }
    );

    return () => {
      anim.kill();
    };
  }, [targetRef, options.delay, options.y, options.start]);
}

export default useReveal;
