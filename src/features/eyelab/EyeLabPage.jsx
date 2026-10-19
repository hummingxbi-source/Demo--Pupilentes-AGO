import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { LiveTester } from './LiveTester';
import { InteractiveQuiz } from './InteractiveQuiz';
import { gsap } from '../../lib/gsap';
import { Sparkles, Camera, HelpCircle, ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';

const IRIS_INTRO = ['miel', 'verde', 'azul', 'violeta', 'gris'];

export const EyeLabPage = () => {
  const [searchParams] = useSearchParams();
  const modeloIdQuery = searchParams.get('modelo');
  const productos = useStore((state) => state.productos);

  const [activeTab, setActiveTab] = useState('probador');
  const [modeloPreseleccionado, setModeloPreseleccionado] = useState(null);
  const [mostrarOnboarding, setMostrarOnboarding] = useState(() => {
    // Si viene con un modelo preseleccionado por URL (?modelo=...), entra directo a probar
    // Si entra directamente a /eyelab o /probador, muestra siempre la Bienvenida de Eye Lab
    return !modeloIdQuery;
  });

  const onboardingContainerRef = useRef(null);

  useEffect(() => {
    if (modeloIdQuery) {
      const match = productos.find((p) => p.id === modeloIdQuery);
      if (match) {
        setModeloPreseleccionado(match);
        setActiveTab('probador');
        setMostrarOnboarding(false);
      }
    }
  }, [modeloIdQuery, productos]);

  const introTlRef = useRef(null);

  useEffect(() => {
    const root = onboardingContainerRef.current;
    if (!mostrarOnboarding || !root) return;
    const q = (sel) => root.querySelectorAll(sel);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      // Ciclo continuo de tonos y rotación lenta del iris
      const iris = q('.eyelab-iris');
      const ciclo = gsap.timeline({ repeat: -1 });
      iris.forEach((img, i) => {
        const next = iris[(i + 1) % iris.length];
        ciclo.to(next, { opacity: 1, duration: 1.1, ease: 'sine.inOut' }, `+=1.3`).set(img, { opacity: 0 });
      });
      gsap.to(q('.eyelab-spin'), { rotation: 360, duration: 90, ease: 'none', repeat: -1 });

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => gsap.to(q('.eyelab-skip'), { autoAlpha: 0, duration: 0.3 }) });
      introTlRef.current = tl;
      gsap.set(q('.onboarding-stagger'), { autoAlpha: 0, y: 30 });
      gsap.set(q('.eyelab-char'), { yPercent: 110 });

      tl.to(q('.eyelab-ring'), { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut' })
        .to(q('.eyelab-mask'), { clipPath: 'circle(50% at 50% 50%)', duration: 1.1, ease: 'expo.out' }, '-=0.45')
        .to(q('.eyelab-ring2'), { opacity: 0.8, duration: 0.6 }, '<')
        .to(q('.eyelab-dot'), { opacity: 1, duration: 0.25, stagger: { each: 0.03, from: 'random' } }, '-=0.6')
        .fromTo(q('.eyelab-scan'), { top: '24%', opacity: 1 }, { top: '76%', duration: 0.6, ease: 'sine.inOut' }, '-=0.3')
        .to(q('.eyelab-scan'), { opacity: 0, duration: 0.2 })
        .to(q('.eyelab-dot'), { opacity: 0, duration: 0.3, stagger: 0.01 }, '<')
        .to(q('.eyelab-stage'), { scale: 1.6, opacity: 0.16, duration: 1.0, ease: 'power3.inOut' })
        .to(q('.eyelab-char'), { yPercent: 0, duration: 0.9, stagger: 0.03, ease: 'expo.out' }, '-=0.9')
        .to(q('.onboarding-stagger'), { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.1 }, '-=0.6');

      if (reduce) tl.progress(1);
    }, root);

    return () => ctx.revert();
  }, [mostrarOnboarding]);

  const saltarIntro = () => introTlRef.current?.progress(1);

  const handleElegirOpcion = (modo) => {
    setActiveTab(modo);
    setMostrarOnboarding(false);
  };

  const handleSelectWinner = (modeloGanador) => {
    setModeloPreseleccionado(modeloGanador);
    setActiveTab('probador');
  };

  const toggleModo = () => {
    setActiveTab((prev) => (prev === 'probador' ? 'recomendador' : 'probador'));
  };

  return (
    <div className="bg-ink text-champagne min-h-screen relative overflow-hidden">
      {!mostrarOnboarding && (
        <button
          type="button"
          onClick={toggleModo}
          className="hidden sm:flex fixed bottom-6 left-6 z-40 px-4 py-2.5 rounded-full bg-neutral-900/90 border border-amber-400/50 text-amber-200 hover:text-white shadow-2xl backdrop-blur-md text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all hover:scale-105"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          <span>{activeTab === 'probador' ? 'Ir al diagnóstico' : 'Ir al probador'}</span>
        </button>
      )}

      {mostrarOnboarding ? (
        <div ref={onboardingContainerRef} className="relative w-full min-h-[100svh] flex flex-col justify-between bg-ink py-10 px-6 overflow-hidden">
          {/* Escenario del iris: se dibuja el anillo, se abre el iris, se "detecta" y se retira al fondo */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0">
            <div className="eyelab-stage relative" style={{ width: 'min(78vmin, 720px)', height: 'min(78vmin, 720px)' }}>
              <div className="eyelab-mask absolute inset-[3%] rounded-full overflow-hidden" style={{ clipPath: 'circle(0% at 50% 50%)' }}>
                <div className="eyelab-spin absolute inset-0">
                  {IRIS_INTRO.map((c, i) => (
                    <img key={c} src={`/img/iris/${c}.webp`} alt="" className="eyelab-iris absolute inset-0 w-full h-full object-cover" style={{ opacity: i === 0 ? 1 : 0 }} />
                  ))}
                </div>
                <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, transparent 55%, rgba(14,13,12,0.85) 72%)' }} />
              </div>
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full overflow-visible">
                <circle className="eyelab-ring" cx="50" cy="50" r="24" fill="none" stroke="#B08D57" strokeWidth="0.3" strokeDasharray="151" strokeDashoffset="151" />
                <circle className="eyelab-ring2" cx="50" cy="50" r="27" fill="none" stroke="#D9BE85" strokeWidth="0.15" strokeDasharray="0.8 1.6" opacity="0" />
                {Array.from({ length: 16 }).map((_, i) => {
                  const a = (i / 16) * Math.PI * 2;
                  return <circle key={i} className="eyelab-dot" cx={50 + Math.cos(a) * 31} cy={50 + Math.sin(a) * 31} r="0.45" fill="#D9BE85" opacity="0" />;
                })}
              </svg>
              <div className="eyelab-scan absolute left-[22%] right-[22%] h-px opacity-0" style={{ top: '10%', background: 'linear-gradient(90deg, transparent, #D9BE85, transparent)', boxShadow: '0 0 18px 2px rgba(217,190,133,0.45)' }} />
            </div>
          </div>

          <button type="button" onClick={saltarIntro} className="eyelab-skip absolute bottom-24 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:bottom-auto sm:top-24 sm:right-6 z-20 text-[11px] uppercase tracking-[0.2em] text-stone hover:text-champagne">
            Saltar intro
          </button>

          {/* Cabecera */}
          <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center text-center space-y-3 pt-12 pb-6">
            <span className="onboarding-stagger px-3.5 py-1 rounded-full bg-brass/15 text-gilt border border-brass/40 text-[10px] uppercase tracking-[0.25em] font-semibold">
              Pupilentes AGO · Virtual Studio
            </span>
            <h1 className="font-serif text-5xl sm:text-7xl font-light text-champagne leading-[1.05]" aria-label="Bienvenida a Eye Lab">
              {['Bienvenida', 'a'].map((w) => (
                <span key={w} className="inline-block overflow-hidden align-bottom mr-[0.25em]" aria-hidden="true">
                  {w.split('').map((ch, i) => <span key={i} className="eyelab-char inline-block">{ch}</span>)}
                </span>
              ))}
              <span className="inline-block overflow-hidden align-bottom italic font-normal pr-2" aria-hidden="true">
                {'Eye Lab'.split('').map((ch, i) => <span key={i} className="eyelab-char inline-block text-gold-gradient">{ch === ' ' ? ' ' : ch}</span>)}
              </span>
            </h1>
            <p className="onboarding-stagger text-xs sm:text-sm text-stone font-light max-w-md mx-auto leading-relaxed">
              Mira cómo cambia tu mirada con cada tono antes de elegir. Tu imagen se procesa solo en tu dispositivo.
            </p>
          </div>

          {/* Dos caminos */}
          <div className="relative z-10 w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 my-auto">
            {[
              { modo: 'probador', Icon: Camera, kicker: 'Cámara en vivo o foto', titulo: 'Pruébatelos en vivo', texto: 'Activa tu cámara o sube una foto y cambia de tono al instante con seguimiento facial.', cta: 'Abrir probador', primario: true },
              { modo: 'recomendador', Icon: Sparkles, kicker: 'Asesoría en 3 preguntas', titulo: '¿Qué color es para ti?', texto: 'Según tu color natural y tus ocasiones, te recomendamos los tonos que mejor te van.', cta: 'Hacer diagnóstico', primario: false },
            ].map(({ modo, Icon, kicker, titulo, texto, cta, primario }) => (
              <button
                type="button"
                key={modo}
                onClick={() => handleElegirOpcion(modo)}
                className="onboarding-stagger text-left rounded-[28px] flex flex-col justify-between p-8 sm:p-10 border border-cocoa/80 bg-espresso/70 backdrop-blur-sm hover:bg-espresso hover:border-brass/70 transition-all duration-300 shadow-2xl group hover:-translate-y-1"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-brass/15 border border-brass/40 flex items-center justify-center text-gilt mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-sand block mb-2">{kicker}</span>
                  <h2 className="font-serif text-3xl sm:text-4xl font-light text-champagne mb-3 group-hover:text-gilt transition-colors">{titulo}</h2>
                  <p className="text-xs sm:text-sm text-stone font-light leading-relaxed max-w-sm">{texto}</p>
                </div>
                <span className={`${primario ? 'btn-brass' : 'btn-outline-gold'} mt-8 w-full py-3.5 text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2`}>
                  {cta} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            ))}
          </div>

          <div className="onboarding-stagger relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between pt-6 text-xs text-stone border-t border-cocoa/40">
            <Link to="/" className="inline-flex items-center gap-2 hover:text-champagne transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /><span>Volver a la portada</span>
            </Link>
            <Link to="/catalogo" className="hover:text-champagne transition-colors">Ver catálogo completo</Link>
          </div>
        </div>
      ) : (
        /* Vista de Eye Lab normal */
        <div className="pt-24 pb-16 gutter max-w-[1800px] mx-auto space-y-6">
          {/* Barra superior con volver, botón de bienvenida y selector de pestañas */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cocoa/60 pb-5">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-sand hover:text-gilt transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Volver a la portada</span><span className="sm:hidden">Portada</span>
              </Link>

              <button
                type="button"
                onClick={() => setMostrarOnboarding(true)}
                className="px-3.5 py-1.5 rounded-full bg-espresso border border-cocoa hover:border-brass text-xs text-stone hover:text-champagne transition-all flex items-center gap-1.5"
                title="Volver a la pantalla de Bienvenida de Eye Lab"
              >
                <Sparkles className="w-3.5 h-3.5 text-brass" />
                <span>Bienvenida</span>
              </button>
            </div>

            {/* Selector de modo Probador / Recomendador */}
            <div className="p-1 rounded-full bg-espresso border border-cocoa flex items-center gap-1 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab('probador')}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-xs uppercase tracking-wider transition-all ${
                  activeTab === 'probador'
                    ? 'bg-brass text-ink font-semibold shadow-sm'
                    : 'text-stone hover:text-champagne'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap"><span className="sm:hidden">Probador</span><span className="hidden sm:inline">Probador en vivo</span></span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('recomendador')}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-xs uppercase tracking-wider transition-all ${
                  activeTab === 'recomendador'
                    ? 'bg-brass text-ink font-semibold shadow-sm'
                    : 'text-stone hover:text-champagne'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap"><span className="sm:hidden">¿Qué color?</span><span className="hidden sm:inline">¿Qué color es para ti?</span></span>
              </button>
            </div>
          </div>

          {/* Contenido a sangre */}
          {activeTab === 'probador' ? (
            <LiveTester modeloInicial={modeloPreseleccionado} />
          ) : (
            <div className="max-w-4xl mx-auto py-6">
              <InteractiveQuiz onSelectWinnerForTester={handleSelectWinner} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EyeLabPage;


