import React, { useRef, useEffect } from 'react';
import { gsap, ScrollTrigger } from './gsap';

export function RevealText({
  children,
  as: Component = 'h2',
  className = '',
  delay = 0,
  stagger = 0.06,
  duration = 1.2,
  start = 'top 85%',
  once = true,
  italicClass = 'text-gilt italic',
}) {
  const containerRef = useRef(null);

  const text = typeof children === 'string' ? children : '';

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const words = el.querySelectorAll('.reveal-word-inner');
    if (!words.length) return;

    const anim = gsap.fromTo(
      words,
      { yPercent: 110, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration,
        stagger,
        delay,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: el,
          start,
          once,
        },
      }
    );

    return () => {
      anim.kill();
    };
  }, [text, delay, stagger, duration, start, once]);

  // If complex children, render directly
  if (typeof children !== 'string') {
    return <Component ref={containerRef} className={className}>{children}</Component>;
  }

  // Support *emphasis* markdown style syntax in string
  // e.g. "Mira el mundo / en *miel*"
  const tokens = text.split(/(\s+)/);

  return (
    <Component ref={containerRef} className={className}>
      {tokens.map((token, i) => {
        if (/^\s+$/.test(token)) {
          return ' ';
        }
        const isItalic = token.startsWith('*') && token.endsWith('*');
        const cleanWord = isItalic ? token.slice(1, -1) : token;

        return (
          <span key={i} className="inline-block overflow-hidden align-top pb-[0.18em] -mb-[0.18em] pt-[0.04em]">
            <span
              className={`reveal-word-inner inline-block ${isItalic ? italicClass : ''}`}
            >
              {cleanWord}
            </span>
          </span>
        );
      })}
    </Component>
  );
}

export default RevealText;
