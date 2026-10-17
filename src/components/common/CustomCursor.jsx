import React, { useEffect, useState } from 'react';

export const CustomCursor = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Solo activar en dispositivos con puntero fino (mouse de escritorio)
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.getAttribute('role') === 'button' ||
        target.classList.contains('cursor-pointer') ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT'
      ) {
        setIsPointer(true);
      } else {
        setIsPointer(false);
      }
    };

    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed pointer-events-none z-[99999] transition-transform duration-75 ease-out"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div
        className={`rounded-full border border-amber-400/70 transition-all duration-300 ease-out flex items-center justify-center ${
          isPointer
            ? 'w-10 h-10 bg-amber-400/15 shadow-[0_0_15px_rgba(201,162,75,0.4)] scale-110'
            : 'w-5 h-5 bg-transparent'
        }`}
      >
        <div className={`rounded-full bg-amber-300 transition-all duration-200 ${isPointer ? 'w-1.5 h-1.5' : 'w-1 h-1'}`} />
      </div>
    </div>
  );
};
