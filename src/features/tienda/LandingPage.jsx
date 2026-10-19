import React, { useRef, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { useLenis } from '../../lib/smoothScroll';
import { RevealText } from '../../lib/RevealText';
import { LISTA_IRIS } from '../../data/imagenes';
import {
  PRODUCTOS_INICIALES,
  TIPOS_PRODUCTO,
  formatMXN,
  calcularStockTotal
} from '../../data/productos';
import { COPY } from '../../data/copy';
import { Foto } from '../../components/common/Foto';
import { IrisRenderer } from '../../components/common/IrisRenderer';
import {
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
  CheckCircle2,
  Truck,
  ShieldCheck,
  PackageCheck,
  ChevronRight,
  Eye
} from 'lucide-react';

const HERO_COLORS = [
  { key: 'miel', label: 'miel', hex: '#D4A853' },
  { key: 'verde', label: 'verde', hex: '#4A7C59' },
  { key: 'azul', label: 'azul', hex: '#427AA1' },
  { key: 'gris', label: 'gris', hex: '#9AA0A6' },
  { key: 'violeta', label: 'violeta', hex: '#7E5A9B' },
];

export const LandingPage = () => {
  const containerRef = useRef(null);
  const heroPinRef = useRef(null);
  const irisStackRef = useRef(null);
  const heroTextRef = useRef(null);
  const heroPortalRef = useRef(null);
  const portalContentRef = useRef(null);
  const pupilOverlayRef = useRef(null);
  const activeWordRef = useRef(null);

  const coleccionesPinRef = useRef(null);
  const coleccionesTrackRef = useRef(null);
  const eyeLabSectionRef = useRef(null);
  const eyeLabCompareRef = useRef(null);
  const catalogoRef = useRef(null);

  const storyboardPinRef = useRef(null);
  const stepLineRef = useRef(null);
  const stepPanelsRef = useRef(null);
  const odCounterRef = useRef(null);
  const oiCounterRef = useRef(null);

  const { scrollToId } = useLenis();
  const navigate = useNavigate();

  // Estados del catálogo
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  const [colorFiltro, setColorFiltro] = useState('todos');

  // Estado del paso storyboard activo
  const [pasoActivo, setPasoActivo] = useState(0);

  // Demostrador interactivo de cómo elegir con graduación
  const [demoGradTipo, setDemoGradTipo] = useState('graduado'); // 'plano' | 'graduado'
  const [demoOD, setDemoOD] = useState('-1.75');
  const [demoOI, setDemoOI] = useState('-2.25');

  // Estado del comparador antes/después en Eye Lab
  const [eyeLabSliderPos, setEyeLabSliderPos] = useState(50);
  const [eyeLabTono, setEyeLabTono] = useState({ id: 'miel', nombre: 'Miel Satín', hex: '#D4A345', src: '/img/iris/miel.webp' });
  const [isDraggingEyeLab, setIsDraggingEyeLab] = useState(false);
  const eyeLabCardRef = useRef(null);

  const handleEyeLabMove = (clientX) => {
    if (!eyeLabCardRef.current || clientX === undefined) return;
    const rect = eyeLabCardRef.current.getBoundingClientRect();
    const percent = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
    setEyeLabSliderPos(percent);
  };

  // GSAP Animations Setup V3
  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const mm = gsap.matchMedia();

      if (!prefersReducedMotion) {
        // ==========================================
        // 1 & 2. HERO + MANIFIESTO FUSIONADOS (Pin + Scrub)
        // ==========================================
        const entranceTl = gsap.timeline({ delay: 0.15 });
        entranceTl.fromTo(
          irisStackRef.current,
          { scale: 1.3, opacity: 0, filter: 'blur(10px)' },
          { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.8, ease: 'power3.out' }
        );

        // ESCRITORIO (>= 1024px)
        mm.add('(min-width: 1024px)', () => {
          const irisImgs = irisStackRef.current.querySelectorAll('.hero-iris-img');
          const portalWords = portalContentRef.current?.querySelectorAll('.portal-word');

          // Cálculo del zoom para que la pupila cubra la pantalla
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          const diagonal = Math.hypot(vw, vh);
          const irisWidth = Math.max(vh * 1.25, vw * 0.95);
          const pupilWidth = irisWidth * 0.24;
          const targetScale = Math.max(4.2, (diagonal / pupilWidth) * 1.2);

          const heroScrub = gsap.timeline({
            scrollTrigger: {
              trigger: heroPinRef.current,
              start: 'top top',
              end: '+=230%',
              pin: true,
              scrub: 0.8,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          // Tramo 1: 0 -> 0.50 (Crossfade de iris + giro suave + cambio de titular)
          heroScrub.to(
            irisStackRef.current,
            { rotation: 24, ease: 'none', duration: 0.5 },
            0
          );

          irisImgs.forEach((img, idx) => {
            if (idx > 0) {
              const startAt = ((idx - 1) / (HERO_COLORS.length - 1)) * 0.46;
              heroScrub.to(
                img,
                { opacity: 1, ease: 'power1.inOut', duration: 0.14 },
                startAt
              );
            }
          });

          HERO_COLORS.forEach((col, idx) => {
            if (idx > 0) {
              const changeTime = (idx / HERO_COLORS.length) * 0.48;
              heroScrub.call(
                () => {
                  if (activeWordRef.current) {
                    activeWordRef.current.textContent = col.label;
                  }
                },
                null,
                changeTime
              );
            }
          });

          // Tramo 2: 0.50 -> 0.74 (Zoom a la pupila + iris se recentra de x:18vw a 0)
          heroScrub.to(
            heroTextRef.current,
            { opacity: 0, y: -40, duration: 0.16, ease: 'power2.out' },
            0.48
          );

          heroScrub.to(
            irisStackRef.current,
            {
              scale: targetScale,
              x: '0vw',
              ease: 'power2.in',
              duration: 0.24,
            },
            0.50
          );

          // Tramo 3: 0.66 -> 0.86 (Portal marfil crece revelando el manifiesto integrado)
          if (heroPortalRef.current) {
            heroScrub.fromTo(
              heroPortalRef.current,
              { clipPath: 'circle(0% at 50% 50%)' },
              { clipPath: 'circle(150% at 50% 50%)', ease: 'power2.inOut', duration: 0.24 },
              0.66
            );
          }

          if (portalWords && portalWords.length > 0) {
            heroScrub.fromTo(
              portalWords,
              { opacity: 0.15, y: 18 },
              {
                opacity: 1,
                y: 0,
                stagger: 0.02,
                ease: 'power2.out',
                duration: 0.22,
              },
              0.70
            );
          }

          // Tramo 4: 0.86 -> 1.0 (Pausa corta para leer el manifiesto antes de soltar el pin)
          // se mantiene estático hasta el 100%

          // Parallax sutil con el mouse en el iris antes del scroll
          const quickIrisX = gsap.quickTo(irisStackRef.current, 'x', { duration: 0.8, ease: 'power3.out' });
          const quickIrisY = gsap.quickTo(irisStackRef.current, 'y', { duration: 0.8, ease: 'power3.out' });

          const handleMouseMove = (e) => {
            if (window.scrollY < 200) {
              const nx = (e.clientX / window.innerWidth - 0.5) * 22;
              const ny = (e.clientY / window.innerHeight - 0.5) * 22;
              quickIrisX(nx + (window.innerWidth >= 1024 ? window.innerWidth * 0.18 : 0));
              quickIrisY(ny);
            }
          };

          window.addEventListener('mousemove', handleMouseMove, { passive: true });

          // Dilatación lenta de pupila
          if (pupilOverlayRef.current) {
            gsap.to(pupilOverlayRef.current, {
              scale: 1.06,
              repeat: -1,
              yoyo: true,
              duration: 3.2,
              ease: 'sine.inOut',
            });
          }

          return () => {
            window.removeEventListener('mousemove', handleMouseMove);
          };
        });

        // MÓVIL (< 1024px)
        mm.add('(max-width: 1023px)', () => {
          const heroScrubMobile = gsap.timeline({
            scrollTrigger: {
              trigger: heroPinRef.current,
              start: 'top top',
              end: '+=170%',
              pin: true,
              scrub: 0.8,
              anticipatePin: 1,
            },
          });

          heroScrubMobile.to(
            irisStackRef.current,
            { scale: 3.2, rotation: 18, ease: 'power2.in', duration: 0.6 },
            0.3
          );
          heroScrubMobile.to(
            heroTextRef.current,
            { opacity: 0, y: -30, duration: 0.3 },
            0.2
          );
          if (heroPortalRef.current) {
            heroScrubMobile.fromTo(
              heroPortalRef.current,
              { clipPath: 'circle(0% at 50% 50%)' },
              { clipPath: 'circle(150% at 50% 50%)', ease: 'power2.inOut', duration: 0.4 },
              0.55
            );
          }
        });

        // ==========================================
        // 3. COLECCIONES HORIZONTAL PINNED GALLERY
        // ==========================================
        if (coleccionesPinRef.current && coleccionesTrackRef.current) {
          mm.add('(min-width: 1024px)', () => {
            const track = coleccionesTrackRef.current;
            const scrollDistance = Math.min(3200, track.scrollWidth - window.innerWidth + 120);

            gsap.to(track, {
              x: -(track.scrollWidth - window.innerWidth),
              ease: 'none',
              scrollTrigger: {
                trigger: coleccionesPinRef.current,
                start: 'top top',
                end: () => `+=${scrollDistance}`,
                pin: true,
                scrub: 0.8,
                anticipatePin: 1,
                invalidateOnRefresh: true,
              },
            });
          });
        }

        // ==========================================
        // 6. STORYBOARD CÓMO FUNCIONA PINNED SCENE
        // ==========================================
        if (storyboardPinRef.current) {
          mm.add('(min-width: 1024px)', () => {
            const st = ScrollTrigger.create({
              trigger: storyboardPinRef.current,
              start: 'top top',
              end: '+=120%',
              pin: true,
              scrub: 0.5,
              anticipatePin: 1,
              onUpdate: (self) => {
                const prog = self.progress;
                // Progreso de la línea vertical
                if (stepLineRef.current) {
                  stepLineRef.current.style.transform = `scaleY(${prog})`;
                }
                // Cambio de paso activo: 0, 1, 2, 3
                const step = Math.min(3, Math.floor(prog * 4));
                setPasoActivo(step);

                // Animar números rodantes en el paso 1 (Graduación)
                if (step === 1) {
                  const odVal = (-0.5 - prog * 2.75).toFixed(2);
                  const oiVal = (-0.5 - prog * 2.25).toFixed(2);
                  if (odCounterRef.current) odCounterRef.current.textContent = `${odVal}`;
                  if (oiCounterRef.current) oiCounterRef.current.textContent = `${oiVal}`;
                }
              },
            });

            return () => st.kill();
          });
        }
      }
    },
    { scope: containerRef, revertOnUpdate: true }
  );

  // Filtrado de modelos destacados para la cuadrícula uniforme (8 modelos)
  const productosDestacados = useMemo(() => {
    let prods = PRODUCTOS_INICIALES.filter((p) => {
      if (tipoFiltro !== 'todos' && p.tipo !== tipoFiltro) return false;
      if (colorFiltro !== 'todos' && p.familia !== colorFiltro) return false;
      return true;
    });

    // Rellenar hasta 8 para no dejar huecos
    if (prods.length < 8) {
      const restantes = PRODUCTOS_INICIALES.filter((p) => !prods.some((item) => item.id === p.id));
      prods = [...prods, ...restantes.slice(0, 8 - prods.length)];
    }

    return prods.slice(0, 8);
  }, [tipoFiltro, colorFiltro]);

  const handleColeccionClick = (colorId) => {
    setColorFiltro(colorId);
    scrollToId('catalogo');
  };

  return (
    <div ref={containerRef} className="bg-ink text-champagne selection:bg-brass selection:text-ink">
      {/* =========================================================================
          1 & 2. HERO + MANIFIESTO FUSIONADOS — "Zoom a la pupila con portal"
          ========================================================================= */}
      <div
        ref={heroPinRef}
        className="relative w-full h-[100svh] overflow-hidden bg-ink"
        data-nav-theme="dark"
      >
        {/* Fondo sutil espresso */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--espresso)_0%,_var(--ink)_80%)] pointer-events-none" />

        {/* Scrim de lectura horizontal para máxima legibilidad del texto en escritorio */}
        <div className="hidden lg:block absolute inset-0 z-[5] pointer-events-none bg-[linear-gradient(90deg,rgba(14,13,12,0.88)_0%,rgba(14,13,12,0.65)_36%,transparent_68%)]" />

        {/* Scrim inferior en móvil: el texto va encima del iris y necesita contraste */}
        <div className="lg:hidden absolute inset-x-0 bottom-0 h-[72%] z-[5] pointer-events-none bg-[linear-gradient(0deg,rgba(14,13,12,0.96)_0%,rgba(14,13,12,0.82)_45%,transparent_100%)]" />

        {/* Iris Macro Apilados (en escritorio posicionado asimétricamente a la derecha x ≈ 66vw) */}
        <div
          ref={irisStackRef}
          className="absolute top-[34%] lg:top-1/2 left-1/2 lg:left-[66%] -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center will-change-transform"
          style={{ width: 'max(120vh, 90vw)', height: 'max(120vh, 90vw)' }}
        >
          {HERO_COLORS.map((col, idx) => (
            <img
              key={col.key}
              src={`/img/iris/${col.key}.webp`}
              alt={`Iris ${col.label}`}
              className={`hero-iris-img absolute inset-0 w-full h-full object-cover rounded-full ${
                idx === 0 ? 'opacity-100' : 'opacity-0'
              }`}
              loading={idx === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
          ))}

          {/* Pupila central */}
          <div
            ref={pupilOverlayRef}
            className="absolute w-[24%] h-[24%] rounded-full bg-ink [background:radial-gradient(circle,_#060606_60%,_#0E0D0C_95%)] pointer-events-none"
          />
        </div>

        {/* Viñeta circular suave */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(14,13,12,0.85)_90%)] pointer-events-none" />

        {/* Bloque de texto Hero a la izquierda (máx 46vw en escritorio) */}
        <div
          ref={heroTextRef}
          className="absolute bottom-24 sm:bottom-24 left-0 gutter w-full lg:max-w-[min(46vw,40rem)] z-10 pointer-events-auto"
        >
          <span className="block text-[11px] uppercase tracking-[0.28em] text-sand font-medium mb-3">
            {COPY.hero.badge}
          </span>

          {/* Titular en exactamente dos líneas */}
          <h1 className="font-serif text-[clamp(2.9rem,min(11vw,10.5svh),6.75rem)] lg:text-[clamp(2.6rem,min(6vw,10.5svh),6.75rem)] text-champagne leading-[0.98] tracking-tight mb-5 [text-shadow:_0_2px_12px_rgba(0,0,0,0.6)]">
            <span className="block">{COPY.hero.headlinePrefix}</span>
            <span className="block">
              en{' '}
              <span
                ref={activeWordRef}
                className="text-gilt italic font-normal inline-block transition-all duration-300"
              >
                miel
              </span>
            </span>
          </h1>

          <p className="font-sans text-[15px] sm:text-[17px] text-champagne/90 font-light max-w-[36ch] leading-relaxed mb-8">
            {COPY.hero.subheadline}
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <button onClick={() => scrollToId('colecciones')} className="btn-brass whitespace-nowrap">
              <span>{COPY.hero.ctaPrimary}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <Link to="/probador" className="btn-link-thread text-[14px]">
              <Sparkles className="w-3.5 h-3.5 text-brass" />
              <span>{COPY.hero.ctaSecondary}</span>
            </Link>
          </div>
        </div>

        {/* Indicador de scroll */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none opacity-60">
          <span className="w-[1px] h-9 bg-gradient-to-b from-brass via-sand to-transparent animate-pulse" />
        </div>

        {/* Capa portal (ivory) con el Manifiesto integrado adentro */}
        <div
          ref={heroPortalRef}
          className="absolute inset-0 bg-ivory text-ink flex items-center justify-center gutter pointer-events-none [clip-path:circle(0%_at_50%_50%)]"
        >
          <div ref={portalContentRef} className="max-w-4xl text-center flex flex-col items-center">
            <span className="portal-word text-[11px] uppercase tracking-[0.28em] text-taupe font-medium mb-6">
              {COPY.manifiesto.origin}
            </span>

            <h2
              aria-label={COPY.manifiesto.quote}
              className="font-serif text-[clamp(2.4rem,5.5vw,5.5rem)] text-ink leading-[1.05] tracking-tight font-light"
            >
              {COPY.manifiesto.quote.split(' ').map((palabra, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className="portal-word inline-block mr-[0.28em]"
                >
                  {palabra}{' '}
                </span>
              ))}
            </h2>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. COLECCIONES — Galería Horizontal Pinned (id "colecciones")
          ========================================================================= */}
      <section
        id="colecciones"
        ref={coleccionesPinRef}
        className="relative bg-ink overflow-hidden py-16 lg:py-0 lg:h-[100svh] flex flex-col justify-center"
        data-nav-theme="dark"
      >
        <div className="gutter mb-8 lg:mb-10 flex items-end justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-[0.26em] text-sand font-medium block mb-2">
              {COPY.colecciones.title}
            </span>
            <h3 className="font-serif text-[clamp(2rem,4vw,3.5rem)] text-champagne font-light">
              Ocho miradas esenciales
            </h3>
          </div>
          <span className="hidden lg:block text-[12px] uppercase tracking-[0.2em] text-stone">
            Desliza para explorar
          </span>
        </div>

        {/* Track de paneles a sangre */}
        <div
          ref={coleccionesTrackRef}
          className="flex gap-6 lg:gap-8 px-[clamp(20px,4.5vw,72px)] overflow-x-auto lg:overflow-visible scroll-snap-x scrollbar-none"
        >
          {LISTA_IRIS.map((iris) => (
            <div
              key={iris.id}
              onClick={() => handleColeccionClick(iris.familia)}
              className="cursor-pointer shrink-0 w-[78vw] sm:w-[48vw] lg:w-[38vw] h-[64vh] lg:h-[72vh] rounded-[24px] overflow-hidden relative group bg-espresso border border-cocoa/60 transition-all duration-500 hover:border-brass/40"
            >
              {/* Foto real macro o fallback iris */}
              <Foto
                slot={`macro/${iris.id}-01`}
                src={`/img/iris/${iris.id}.webp`}
                alt={`Lente de contacto ${iris.nombre}`}
                className="w-full h-full"
                ratio="auto"
              />

              {/* Viñeta inferior */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />

              {/* Contenido mínimo: Nombre + punto de color */}
              <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/40"
                      style={{ backgroundColor: iris.hex }}
                    />
                    <span className="text-[11px] uppercase tracking-[0.2em] text-sand/90">
                      Colección {iris.id}
                    </span>
                  </div>
                  <h4 className="font-serif text-3xl sm:text-4xl text-champagne font-normal group-hover:text-gilt transition-colors">
                    {iris.nombre}
                  </h4>
                </div>

                <div className="w-10 h-10 rounded-full border border-stone/30 flex items-center justify-center text-champagne group-hover:border-brass group-hover:text-gilt transition-colors">
                  <ArrowRight className="w-4 h-4 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          4. EYE LAB — Invitación Editorial con Comparador en Vivo (Sin SVG de óvalos)
          ========================================================================= */}
      <section
        ref={eyeLabSectionRef}
        className="relative bg-espresso py-[clamp(80px,10vw,140px)] gutter border-t border-cocoa/50 overflow-hidden"
        data-nav-theme="dark"
      >
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Columna Izquierda: Mensaje y CTA */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <span className="text-[11px] uppercase tracking-[0.24em] text-sand font-medium">
              Laboratorio Óptico Virtual
            </span>

            <RevealText
              as="h2"
              className="font-serif text-[clamp(2.5rem,5vw,4.5rem)] text-champagne leading-[1.02] font-light"
            >
              Pruébatelos en vivo
            </RevealText>

            <p className="font-sans text-[15px] sm:text-[17px] text-stone leading-relaxed font-light max-w-md">
              Prueba cada tono sobre tu mirada en tiempo real con tu cámara o usando una foto.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <Link to="/probador" className="btn-brass">
                <span>Abrir probador</span>
                <Sparkles className="w-4 h-4 ml-1" />
              </Link>
              <span className="text-xs text-stone/70">
                Simulación visual aproximada
              </span>
            </div>
          </div>

          {/* Columna Derecha: Ojo Macro Real con Comparador Antes / Después Interactivo */}
          <div className="lg:col-span-7 flex flex-col items-center gap-4">
            <div
              onDragStart={(e) => e.preventDefault()}
              className="relative w-full aspect-[4/3] rounded-[24px] overflow-hidden bg-ink border border-cocoa/80 group shadow-2xl select-none"
            >
              {/* Capa Base: Ojo Natural (Izquierda / Antes) */}
              <div className="absolute inset-0 pointer-events-none select-none">
                <img
                  src="/img/iris/cafe.webp"
                  alt="Ojo tono natural"
                  draggable={false}
                  className="w-full h-full object-cover object-center pointer-events-none select-none"
                />
                <span className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-ink/85 backdrop-blur-md text-[11px] uppercase tracking-wider text-sand font-medium border border-cocoa/50 shadow-md z-10">
                  Ojo Natural (Café)
                </span>
              </div>

              {/* Capa Superior con Clip: Con Pupilente de Color (Derecha / Después) */}
              <div
                className="absolute inset-0 pointer-events-none select-none transition-[clip-path] duration-75"
                style={{
                  clipPath: `polygon(${eyeLabSliderPos}% 0, 100% 0, 100% 100%, ${eyeLabSliderPos}% 100%)`,
                }}
              >
                <div className="relative w-full h-full select-none pointer-events-none">
                  <img
                    src={eyeLabTono.src}
                    alt={`Con pupilente ${eyeLabTono.nombre}`}
                    draggable={false}
                    className="w-full h-full object-cover object-center pointer-events-none select-none"
                  />
                  <span className="absolute top-4 right-4 px-3.5 py-1.5 rounded-full bg-brass text-ink font-semibold text-[11px] uppercase tracking-wider shadow-md z-10">
                    Con {eyeLabTono.nombre}
                  </span>
                </div>
              </div>

              {/* Divisor Dorado Interactivo */}
              <div
                className="absolute inset-y-0 w-[3px] bg-gradient-to-b from-brass via-gilt to-brass -translate-x-1/2 z-20 pointer-events-none shadow-[0_0_12px_rgba(176,141,87,0.7)]"
                style={{ left: `${eyeLabSliderPos}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-ink border-2 border-brass flex items-center justify-center text-brass shadow-2xl">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
              </div>

              {/* Control de rango invisible superpuesto para arrastrar suavemente sin agarrar la imagen */}
              <input
                type="range"
                min="0"
                max="100"
                value={eyeLabSliderPos}
                onChange={(e) => setEyeLabSliderPos(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30 touch-none"
                aria-label="Comparar antes y después"
              />

              {/* Indicador inferior */}
              <div className="absolute bottom-4 inset-x-0 flex justify-center z-10 pointer-events-none">
                <span className="px-4 py-1.5 rounded-full bg-ink/90 border border-brass/30 backdrop-blur-md text-[11px] text-champagne/90 tracking-wide flex items-center gap-1.5 shadow-lg">
                  <Sparkles className="w-3 h-3 text-brass" />
                  Arrastra la línea en medio para comparar ambos ojos
                </span>
              </div>
            </div>

            {/* Selector de Tonos Rápido para el Comparador */}
            <div className="w-full flex flex-wrap items-center justify-between gap-3 pt-1">
              <span className="text-[11px] uppercase tracking-wider text-sand font-medium">
                Probar tono de pupilente:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'miel', nombre: 'Miel Satín', hex: '#D4A345' },
                  { id: 'verde', nombre: 'Verde Esmeralda', hex: '#3C6E52' },
                  { id: 'azul', nombre: 'Azul Zafiro', hex: '#2B4C7E' },
                  { id: 'gris', nombre: 'Gris Platino', hex: '#7B8B97' },
                  { id: 'avellana', nombre: 'Avellana Ámbar', hex: '#B87B44' },
                  { id: 'aqua', nombre: 'Aqua Caribe', hex: '#3A9D9B' },
                ].map((tono) => (
                  <button
                    key={tono.id}
                    onClick={() => setEyeLabTono({ ...tono, src: `/img/iris/${tono.id}.webp` })}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border transition-all ${
                      eyeLabTono.id === tono.id
                        ? 'bg-brass text-ink border-brass font-medium shadow-sm scale-105'
                        : 'bg-espresso/80 text-champagne border-cocoa hover:border-brass/40'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/40 shadow-inner"
                      style={{ backgroundColor: tono.hex }}
                    />
                    <span>{tono.nombre.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. CATÁLOGO EDITORIAL — Cuadrícula Uniforme de 8 Modelos (id "catalogo")
          ========================================================================= */}
      <section
        id="catalogo"
        ref={catalogoRef}
        className="relative bg-ivory text-ink py-[clamp(80px,12vw,160px)] gutter"
        data-nav-theme="light"
      >
        <div className="w-full max-w-7xl mx-auto space-y-10">
          {/* Cabecera y Pestañas por Categoría */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-taupe/20 pb-8">
            <div>
              <span className="text-[11px] uppercase tracking-[0.26em] text-taupe font-medium block mb-2">
                Colección Selecta
              </span>
              <h2 className="font-serif text-[clamp(2.5rem,4.5vw,4.5rem)] text-ink font-light leading-tight">
                Modelos Destacados
              </h2>
            </div>

            {/* Pestañas por Tipo de Producto */}
            <div className="flex flex-wrap items-center gap-2">
              {TIPOS_PRODUCTO.map((tipo) => {
                const isActive = tipoFiltro === tipo.id;
                return (
                  <button
                    key={tipo.id}
                    onClick={() => setTipoFiltro(tipo.id)}
                    className={`px-4 py-2 rounded-full text-xs uppercase tracking-[0.14em] transition-all ${
                      isActive
                        ? 'bg-ink text-bone font-medium shadow-sm'
                        : 'bg-bone text-taupe hover:text-ink border border-taupe/20'
                    }`}
                  >
                    {tipo.label.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cuadrícula Uniforme 4:5 (4 columnas en escritorio, 3 en tablet, 2 en móvil) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {productosDestacados.map((producto) => {
              const stockTotal = calcularStockTotal(producto);
              const enStock = stockTotal > 5;
              const bajoStock = stockTotal > 0 && stockTotal <= 5;

              return (
                <div
                  key={producto.id}
                  className="group flex flex-col bg-bone rounded-[20px] p-3 sm:p-4 border border-taupe/15 hover:border-brass/50 transition-all duration-300"
                >
                  <Link
                    to={`/producto/${producto.id}`}
                    className="relative w-full aspect-[4/5] rounded-[16px] overflow-hidden bg-espresso flex items-center justify-center group"
                  >
                    <Foto
                      slot={`producto/${producto.id}`}
                      familia={producto.familia || 'miel'}
                      alt={producto.nombre}
                      className="w-full h-full"
                    />

                    {/* Overlay con nombre del tono */}
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none z-10">
                      <span className="font-serif text-sm text-champagne block truncate font-light">
                        {producto.nombre}
                      </span>
                    </div>

                    {/* Badge tipo */}
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-ink/75 text-[10px] uppercase tracking-wider text-sand z-10">
                      {producto.tipo}
                    </span>

                    {/* Botón flotante al hover */}
                    <div className="hidden lg:flex absolute bottom-3 right-3 px-3.5 py-1 rounded-full bg-brass text-ink font-medium text-xs tracking-wide opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-md z-10">
                      Elegir
                    </div>
                  </Link>

                  <div className="pt-3.5 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5 sm:gap-2">
                    <Link
                      to={`/producto/${producto.id}`}
                      className="font-serif text-[17px] sm:text-lg text-ink hover:text-bronze transition-colors leading-tight line-clamp-2 sm:line-clamp-1"
                    >
                      {producto.nombre}
                    </Link>
                    <span className="font-sans text-xs sm:text-sm text-taupe font-medium whitespace-nowrap">
                      {formatMXN(producto.precio)}
                    </span>
                  </div>

                  {/* Stock */}
                  <div className="flex items-center gap-1.5 pt-1.5 text-[11px] text-taupe">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        enStock ? 'bg-brass' : bajoStock ? 'bg-amber-600' : 'bg-stone'
                      }`}
                    />
                    <span>
                      {enStock
                        ? 'En existencia'
                        : bajoStock
                        ? `Últimas ${stockTotal} pzas`
                        : 'Agotado'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botón Ver Todo el Catálogo */}
          <div className="pt-8 text-center">
            <Link to="/catalogo" className="btn-brass inline-flex items-center gap-2">
              <span>Ver todo el catálogo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. STORYBOARD CÓMO FUNCIONA — Escena Pinned con 4 Pasos y Mini-UI
          ========================================================================= */}
      {/* =========================================================================
          6. PROCESO DE COMPRA BOUTIQUE (4 Pasos Visuales y Resumidos)
          ========================================================================= */}
      <section
        className="relative bg-ink py-16 lg:py-24 border-t border-cocoa/60 overflow-hidden w-full"
        data-nav-theme="dark"
      >
        <div className="w-full max-w-screen-xl mx-auto px-[clamp(20px,4vw,56px)] space-y-12">
          {/* Cabecera resumida */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[11px] uppercase tracking-[0.28em] text-sand font-semibold px-4 py-1.5 rounded-full bg-espresso border border-cocoa/80 inline-block shadow-sm">
              Proceso de Compra Boutique
            </span>
            <h2 className="font-serif text-[clamp(2.2rem,4.5vw,3.6rem)] text-champagne font-light leading-tight">
              Tu mirada ideal en <span className="text-gold-gradient italic font-normal">4 sencillos pasos</span>
            </h2>
            <p className="font-sans text-xs sm:text-sm text-stone font-light leading-relaxed">
              Atención directa sin contraseñas, entrega inmediata y asesoría personalizada en CDMX y todo México.
            </p>
          </div>

          {/* 4 Pasos: En desktop fila horizontal con conector, en móvil apilados */}
          <div className="relative">
            {/* Línea conectora horizontal en desktop */}
            <div className="hidden lg:block absolute top-[44px] left-[10%] right-[10%] h-[2px] border-t-2 border-dashed border-brass/30 -z-0 pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5 relative z-10">
              {[
                {
                  num: '01',
                  icono: Eye,
                  titulo: 'Elige tu modelo',
                  descripcion: 'Explora catálogo y elige color + graduación',
                },
                {
                  num: '02',
                  icono: Truck,
                  titulo: 'Cotiza envío',
                  descripcion: 'Selecciona zona y método de entrega',
                },
                {
                  num: '03',
                  icono: ShieldCheck,
                  titulo: 'Confirma por WhatsApp',
                  descripcion: 'Recibe resumen y confirma con Araceli',
                },
                {
                  num: '04',
                  icono: PackageCheck,
                  titulo: 'Recibe tu pedido',
                  descripcion: 'Metro Pantitlán, DiDi o paquetería',
                },
              ].map((pasoItem) => {
                const IconComponent = pasoItem.icono;
                return (
                  <div
                    key={pasoItem.num}
                    className="group relative rounded-[24px] bg-gradient-to-b from-espresso via-espresso/90 to-ink border border-cocoa/80 p-6 flex flex-col items-center text-center hover:border-brass/50 transition-all duration-300 shadow-xl"
                  >
                    {/* Badge Número */}
                    <div className="w-12 h-12 rounded-full bg-ink border border-brass/40 flex items-center justify-center text-brass font-sans text-xs font-bold mb-4 shadow-md group-hover:scale-110 group-hover:border-brass transition-all duration-300">
                      {pasoItem.num}
                    </div>

                    {/* Ícono grande */}
                    <div className="w-12 h-12 rounded-2xl bg-brass/10 border border-brass/25 flex items-center justify-center text-champagne mb-4 group-hover:bg-brass/20 transition-colors">
                      <IconComponent className="w-6 h-6 text-brass" />
                    </div>

                    {/* Título corto */}
                    <h3 className="font-serif text-xl text-champagne font-light mb-2 group-hover:text-gilt transition-colors">
                      {pasoItem.titulo}
                    </h3>

                    {/* Descripción de 1 línea */}
                    <p className="font-sans text-xs text-stone font-light leading-relaxed">
                      {pasoItem.descripcion}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6.5 LOOKBOOK REAL · ASÍ SE VE EN NUESTRAS CLIENTAS (4 BLOQUES OFICIALES)
          ========================================================================= */}
      <section
        className="relative bg-espresso py-20 lg:py-28 gutter border-t border-cocoa/60 overflow-hidden"
        data-nav-theme="dark"
      >
        <div className="w-full max-w-[1600px] mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <span className="text-[11px] uppercase tracking-[0.28em] text-sand font-semibold px-4 py-1.5 rounded-full bg-ink border border-cocoa/80 inline-block shadow-sm">
                Galería de Clientas Reales
              </span>
              <h2 className="font-serif text-[clamp(2.2rem,4vw,3.6rem)] text-champagne font-light leading-tight">
                Así se les ve a <span className="text-gold-gradient italic font-normal">nuestras clientas</span>
              </h2>
              <p className="font-sans text-sm text-stone font-light leading-relaxed">
                Fotos reales de los 4 catálogos de Pupilentes AGO: <strong>Azul</strong>, <strong>Verde</strong>, <strong>Café</strong> y <strong>Gris</strong>. Observa el resultado auténtico sobre diferentes miradas y tonos de piel.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/probador" className="btn-brass text-xs">
                <span>Probar en mi cámara</span>
                <Sparkles className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>

          {/* Mosaico de Fotos de Clientas Reales en Orden Oficial: Azul, Verde, Café, Gris */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                id: '01-azul',
                colorSlug: 'azul',
                titulo: 'Angeles N Blue',
                familia: 'Catálogo Azul',
                tono: 'Tono Azul Océano Luminoso',
                img: '/img/fotos/clientes/01-azul-angeles-n-blue.jpg',
                badge: '1 · Catálogo Azul',
                borderHover: 'hover:border-[#427AA1]',
                glowHover: 'hover:shadow-[0_12px_32px_rgba(66,122,161,0.25)]',
                accentHex: '#427AA1'
              },
              {
                id: '02-verde',
                colorSlug: 'verde',
                titulo: 'Breeze Green',
                familia: 'Catálogo Verde',
                tono: 'Tono Verde Esmeralda Natural',
                img: '/img/fotos/clientes/02-verde-breeze-green.jpg',
                badge: '2 · Catálogo Verde',
                borderHover: 'hover:border-[#4A7C59]',
                glowHover: 'hover:shadow-[0_12px_32px_rgba(74,124,89,0.25)]',
                accentHex: '#4A7C59'
              },
              {
                id: '03-cafe',
                colorSlug: 'cafe',
                titulo: 'Gemini Hazel',
                familia: 'Catálogo Café',
                tono: 'Tono Miel Avellana Callejón',
                img: '/img/fotos/clientes/03-cafe-gemini-hazel.jpg',
                badge: '3 · Catálogo Café',
                borderHover: 'hover:border-[#966A3D]',
                glowHover: 'hover:shadow-[0_12px_32px_rgba(150,106,61,0.25)]',
                accentHex: '#966A3D'
              },
              {
                id: '04-gris',
                colorSlug: 'gris',
                titulo: 'Cloud Gray',
                familia: 'Catálogo Gris',
                tono: 'Tono Gris Nube Satinado',
                img: '/img/fotos/clientes/04-gris-cloud-gray.jpg',
                badge: '4 · Catálogo Gris',
                borderHover: 'hover:border-[#8A929A]',
                glowHover: 'hover:shadow-[0_12px_32px_rgba(138,146,154,0.25)]',
                accentHex: '#8A929A'
              },
            ].map((cliente) => (
              <Link
                key={cliente.id}
                to={`/catalogo?color=${cliente.colorSlug}`}
                className={`group relative rounded-[24px] overflow-hidden bg-ink border border-cocoa/80 ${cliente.borderHover} ${cliente.glowHover} transition-all duration-300 shadow-xl flex flex-col cursor-pointer hover:-translate-y-1`}
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-espresso">
                  <img
                    src={cliente.img}
                    alt={`Clientas usando ${cliente.titulo} de Pupilentes AGO`}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent opacity-80" />
                  
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-ink/85 backdrop-blur-md text-[10px] uppercase tracking-wider text-sand font-semibold border border-cocoa/50 shadow-md">
                    {cliente.badge}
                  </span>

                  <span className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-ink/90 backdrop-blur-md text-[10px] font-semibold tracking-wider text-sand border border-cocoa/60 flex items-center gap-1 group-hover:border-brass/80 group-hover:text-champagne transition-all shadow-md">
                    <span>Ver colección</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>

                <div className="p-5 flex flex-col justify-between flex-1 bg-ink border-t border-cocoa/40">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-brass font-medium">
                      {cliente.familia}
                    </span>
                    <h3 className="font-serif text-xl text-champagne font-light group-hover:text-gilt transition-colors">
                      {cliente.titulo}
                    </h3>
                    <p className="text-xs text-stone font-light">
                      {cliente.tono}
                    </p>
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-cocoa/30 mt-3">
                    <span className="text-[11px] text-sand/80 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-brass" />
                      Clienta Real AGO
                    </span>
                    <span
                      className="text-xs text-brass group-hover:text-champagne transition-colors font-medium flex items-center gap-1"
                    >
                      <span>Abrir catálogo</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Banner de Catálogo Completo */}
          <div className="rounded-[24px] bg-gradient-to-r from-ink via-espresso to-ink border border-cocoa/80 p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-5 shadow-2xl">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-[11px] uppercase tracking-widest text-sand font-semibold">
                Catálogo Oficial Completo
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-champagne font-light">
                Azules, Verdes, Cafés, Grises y Graduados para Miopía
              </h3>
              <p className="text-xs text-stone font-light max-w-xl">
                Modelos disponibles para entrega inmediata en CDMX y envíos a todo México.
              </p>
            </div>

            <button
              onClick={() => navigate('/catalogo')}
              className="btn-brass whitespace-nowrap shrink-0"
            >
              <span>Explorar Catálogo</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. CIERRE + MARQUEE
          ========================================================================= */}
      <section
        className="relative bg-ink py-[clamp(110px,16vw,220px)] gutter overflow-hidden flex flex-col items-center justify-center text-center border-t border-cocoa/60"
        data-nav-theme="dark"
      >
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <img
            src="/img/iris/miel.webp"
            alt="Cierre Pupilentes AGO"
            className="w-full h-full object-cover filter brightness-50"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-ink/80" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6 max-w-3xl">
          <RevealText
            as="h2"
            className="font-serif text-[clamp(3rem,8vw,6.5rem)] text-champagne leading-[1.15] pb-2 font-light"
          >
            {COPY.cierre.headline}
          </RevealText>

          <p className="font-sans text-[15px] sm:text-[18px] text-stone font-light max-w-md">
            {COPY.cierre.subheadline}
          </p>

          <div className="pt-4">
            <button onClick={() => scrollToId('colecciones')} className="btn-brass">
              <span>{COPY.cierre.cta}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

        {/* Marquee continuo de colores */}
        <div className="absolute bottom-6 w-full overflow-hidden pointer-events-none opacity-40">
          <div className="flex gap-12 whitespace-nowrap animate-[marquee_40s_linear_infinite]">
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i} className="font-serif italic text-stone/40 text-xl tracking-wider">
                Miel Satín · Verde Esmeralda · Azul Zafiro · Gris Platino · Avellana Ámbar · Aqua Caribe · Violeta Lavanda · Café Imperial
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
