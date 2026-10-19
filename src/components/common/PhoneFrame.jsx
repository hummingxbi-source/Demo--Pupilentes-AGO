import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Monitor,
  RotateCw,
  ShoppingBag,
  Sparkles,
  User,
  CreditCard,
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';

export const PhoneFrame = () => {
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  const [currentRoute, setCurrentRoute] = useState('/#/?embed=1');
  const [isLandscape, setIsLandscape] = useState(false);
  const [scale, setScale] = useState(1);

  // Calcular escala para que quepa perfectamente en la altura de cualquier pantalla
  useEffect(() => {
    const handleResize = () => {
      const targetHeight = isLandscape ? 450 : 880;
      const availableHeight = window.innerHeight - 120;
      const targetWidth = isLandscape ? 880 : 420;
      const availableWidth = window.innerWidth - 40;

      const scaleH = availableHeight / targetHeight;
      const scaleW = availableWidth / targetWidth;
      const fit = Math.min(1, Math.min(scaleH, scaleW));
      setScale(Math.max(0.45, fit));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isLandscape]);

  const cambiarRutaIframe = (path) => {
    const fullPath = `/#${path}${path.includes('?') ? '&' : '?'}embed=1`;
    setCurrentRoute(fullPath);
    if (iframeRef.current) {
      iframeRef.current.src = fullPath;
    }
  };

  const navItems = [
    { label: 'Tienda', path: '/', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { label: 'Eye Lab', path: '/eyelab', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { label: 'Mi pedido', path: '/cuenta', icon: <User className="w-3.5 h-3.5" /> },
    { label: 'Checkout', path: '/checkout', icon: <CreditCard className="w-3.5 h-3.5" /> },
    { label: 'Panel Dueña', path: '/panel', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  ];

  const phoneW = isLandscape ? 844 : 390;
  const phoneH = isLandscape ? 390 : 844;

  return (
    <div className="min-h-screen bg-[#0A0908] text-champagne flex flex-col items-center justify-center p-3 sm:p-6 relative overflow-hidden select-none font-sans">
      {/* Halo dorado boutique de fondo */}
      <div className="absolute w-[650px] h-[950px] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.18)_0%,rgba(176,141,87,0.06)_45%,transparent_70%)] pointer-events-none blur-3xl -z-0" />

      {/* Barra superior de control y atajos de demostración */}
      <header className="relative z-20 w-full max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3 bg-neutral-900/90 border border-amber-500/30 rounded-2xl px-4 py-2.5 shadow-2xl backdrop-blur-md mb-4 sm:mb-6">
        <button
          onClick={() => navigate('/')}
          className="btn-ghost text-xs py-1.5 px-3 rounded-xl inline-flex items-center gap-1.5 text-stone hover:text-champagne transition-colors"
          title="Regresar a la vista normal de escritorio"
        >
          <ChevronLeft className="w-4 h-4 text-brass" />
          <span>Volver a escritorio</span>
        </button>

        {/* Atajos de cambio de ruta rápida dentro del iPhone */}
        <div className="flex flex-wrap items-center gap-1 bg-black/50 p-1 rounded-xl border border-cocoa/50">
          {navItems.map((item) => {
            const isActive = currentRoute.startsWith(`/#${item.path}`);
            return (
              <button
                key={item.label}
                onClick={() => cambiarRutaIframe(item.path)}
                className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-brass text-ink font-semibold shadow-sm'
                    : 'text-stone hover:text-champagne hover:bg-neutral-800'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Botón Girar Pantalla */}
        <button
          onClick={() => setIsLandscape(!isLandscape)}
          className="btn-ghost text-xs py-1.5 px-3 rounded-xl inline-flex items-center gap-1.5 text-sand hover:text-gilt transition-colors"
          title="Alternar entre modo vertical y horizontal"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>{isLandscape ? 'Vertical' : 'Girar'}</span>
        </button>
      </header>

      {/* Contenedor con escala automática para adaptarse a la pantalla */}
      <div
        className="relative z-10 flex items-center justify-center transition-all duration-500 ease-out"
        style={{
          width: phoneW + 28,
          height: phoneH + 28,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        {/* BOTONES FÍSICOS EXTERIORES DEL IPHONE */}
        {/* Botón de encendido (derecha) */}
        {!isLandscape ? (
          <div className="absolute -right-[6px] top-[170px] w-[5px] h-[64px] bg-[#2E2823] rounded-r-sm border border-stone-700/60 shadow-md" />
        ) : null}

        {/* Botones de volumen y switch de silencio (izquierda) */}
        {!isLandscape ? (
          <>
            <div className="absolute -left-[6px] top-[115px] w-[5px] h-[28px] bg-[#2E2823] rounded-l-sm border border-stone-700/60 shadow-md" />
            <div className="absolute -left-[6px] top-[160px] w-[5px] h-[50px] bg-[#2E2823] rounded-l-sm border border-stone-700/60 shadow-md" />
            <div className="absolute -left-[6px] top-[225px] w-[5px] h-[50px] bg-[#2E2823] rounded-l-sm border border-stone-700/60 shadow-md" />
          </>
        ) : null}

        {/* CHASIS PRINCIPAL DEL IPHONE (12px de bisel, esquinas 54px, borde titanio pulido) */}
        <div
          className="relative bg-black rounded-[54px] p-[12px] shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(212,175,55,0.22)] border-[3px] border-[#3D352E] flex items-center justify-center transition-all duration-500"
          style={{
            width: phoneW + 24,
            height: phoneH + 24,
          }}
        >
          {/* PANTALLA OLED DEL IPHONE (390 x 844 con esquinas 42px) */}
          <div
            className="relative bg-black overflow-hidden rounded-[42px] transition-all duration-500 shadow-inner"
            style={{
              width: phoneW,
              height: phoneH,
            }}
          >
            {/* DYNAMIC ISLAND */}
            {!isLandscape ? (
              <div className="absolute top-[11px] left-1/2 -translate-x-1/2 w-[124px] h-[34px] bg-black rounded-full z-40 flex items-center justify-between px-3 shadow-lg pointer-events-none border border-neutral-900">
                {/* Lente de cámara TrueDepth */}
                <div className="w-3 h-3 rounded-full bg-[#0a0f1d] border border-neutral-800 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0d1b33]" />
                </div>
                {/* Sensor FaceID */}
                <div className="w-2.5 h-2.5 rounded-full bg-[#0d0d0d]" />
              </div>
            ) : null}

            {/* HOME INDICATOR INFERIOR */}
            <div className="absolute bottom-[9px] left-1/2 -translate-x-1/2 w-[136px] h-[5px] bg-white/50 rounded-full z-40 pointer-events-none shadow-sm" />

            {/* IFRAME MISMO ORIGEN CON EMBED=1 */}
            <iframe
              ref={iframeRef}
              src={currentRoute}
              title="Demostración Móvil de Pupilentes AGO"
              allow="camera; microphone; display-capture"
              className="w-full h-full border-0 select-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneFrame;
