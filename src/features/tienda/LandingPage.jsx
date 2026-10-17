import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CatalogoSection } from './CatalogoSection';
import { IrisRenderer } from '../../components/common/IrisRenderer';
import { Sparkles, ArrowRight, ShieldCheck, Truck, Clock, CheckCircle2, Eye, MapPin, Heart, ChevronRight } from 'lucide-react';

export const LandingPage = () => {
  // Paleta de colores para el ciclo del Hero
  const heroPaleta = [
    { nombre: "Miel Satín", palabra: "miel", hexP: "#D4A345", hexS: "#8F641B", hexA: "#F5E09A" },
    { nombre: "Verde Esmeralda", palabra: "verde", hexP: "#3E7B54", hexS: "#1B472A", hexA: "#86C29B" },
    { nombre: "Gris Platino", palabra: "platino", hexP: "#B4B9C2", hexS: "#5D626C", hexA: "#E9ECF0" },
    { nombre: "Azul Zafiro", palabra: "zafiro", hexP: "#2B588C", hexS: "#122A4A", hexA: "#6B9EE0" },
    { nombre: "Avellana Dorado", palabra: "avellana", hexP: "#B5733A", hexS: "#6B3C14", hexA: "#E8B378" },
    { nombre: "Violeta Celestial", palabra: "violeta", hexP: "#78588E", hexS: "#3B2549", hexA: "#BFA4D6" }
  ];

  const [indiceColor, setIndiceColor] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndiceColor((prev) => (prev + 1) % heroPaleta.length);
    }, 3800);
    return () => clearInterval(intervalo);
  }, [heroPaleta.length]);

  const colorActivo = heroPaleta[indiceColor];

  return (
    <div className="bg-neutral-950 text-neutral-100 overflow-hidden">
      {/* 1. HERO CINEMATOGRÁFICO */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-8 pb-16 px-4 overflow-hidden border-b border-amber-500/15">
        {/* Glow dorado ambiental */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-[140px] opacity-20 pointer-events-none transition-colors duration-1000 -top-20"
          style={{ backgroundColor: colorActivo.hexP }}
        />

        <div className="container-custom relative z-10 flex flex-col items-center text-center">
          {/* Medallón del Logo Reveal */}
          <div className="relative mb-6">
            <div style={{ width: '100px', height: '100px' }} className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-amber-400/50 p-1 bg-neutral-900 shadow-[0_0_35px_rgba(201,162,75,0.4)] animate-scale-in">
              <img
                src="/logo-pupilentes-ago-512.png"
                alt="Pupilentes AGO Medallón"
                className="logo-hero w-full h-full object-contain"
              />
            </div>
            <div className="absolute -inset-2 rounded-full border border-amber-400/20 animate-ping opacity-25" />
          </div>

          {/* Badge boutique */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900/90 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-6 shadow-md backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Colección 2026 · Graduación Mixta por Ojo</span>
          </div>

          {/* Título cambiante de alto impacto */}
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight max-w-4xl leading-[1.08] mb-6">
            Mira el mundo en{' '}
            <span
              className="text-gold-gradient underline decoration-amber-400/30 underline-offset-8 transition-all duration-700 inline-block italic font-normal"
            >
              {colorActivo.palabra}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-stone-300 max-w-2xl font-sans font-light leading-relaxed mb-8">
            Lentes de contacto de color de grado estético y óptico en CDMX.
            Selecciona tu modelo, gradúa cada ojo por separado y recibe hoy mismo.
          </p>

          {/* Ojo interactivo central con transición suave de color */}
          <div className="my-4 p-4 relative group">
            <div className="absolute inset-0 bg-amber-400/10 rounded-full blur-2xl group-hover:bg-amber-400/25 transition-all duration-500" />
            <IrisRenderer
              colorPrincipal={colorActivo.hexP}
              colorSecundario={colorActivo.hexS}
              colorAcento={colorActivo.hexA}
              size={230}
              hoverDilate={true}
              className="relative z-10 transition-transform duration-500 transform group-hover:scale-105"
            />
            <div className="text-[11px] font-mono text-amber-300/80 mt-3 tracking-widest uppercase">
              Tono actual: {colorActivo.nombre}
            </div>
          </div>

          {/* Botones de Acción Hero */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
            <a href="#catalogo" className="btn-gold w-full sm:w-auto text-sm px-8 py-3.5">
              Explorar Catálogo ({heroPaleta.length * 2}+ tonos)
              <ArrowRight className="w-4 h-4 ml-1" />
            </a>

            <Link
              to="/probador"
              className="btn-outline-gold w-full sm:w-auto text-sm px-7 py-3.5 flex items-center justify-center gap-2 group"
            >
              <Sparkles className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span>Eye Lab: Pruébatelos en vivo</span>
            </Link>
          </div>

          {/* Indicadores rápidos de confianza */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 mt-14 pt-8 border-t border-neutral-800/80 text-xs text-stone-400 max-w-3xl">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>Graduación 0.00 a -8.00</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Metro Pantitlán / Tepalcates $0</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Truck className="w-4 h-4 text-blue-400" />
              <span>DiDi & Paquetería nacional</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Productos sellados y estériles</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MANIFIESTO EDITORIAL (SCRUB REVEAL) */}
      <section className="py-20 bg-neutral-900/60 border-b border-amber-500/10 relative">
        <div className="container-custom max-w-4xl text-center">
          <span className="text-[11px] uppercase tracking-[0.3em] text-amber-400 font-semibold mb-3 block">
            El Adiós a los Procesos Manuales
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-normal text-stone-200 leading-snug mb-6">
            "Elige tu mirada. <span className="text-amber-300 italic font-semibold">Gradúa cada ojo.</span> Cotiza tu envío en segundos y recíbelo sin esperas por mensaje."
          </h2>
          <p className="text-sm md:text-base text-stone-400 max-w-2xl mx-auto font-light leading-relaxed">
            Eliminamos las cotizaciones a mano y las preguntas de stock caso por caso. Aquí ves existencias reales, graduación personalizada y tus opciones de envío al instante.
          </p>
        </div>
      </section>

      {/* 3. CÓMO COMPRAR EN 4 PASOS */}
      <section className="py-20 bg-neutral-950 border-b border-amber-500/10">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-[0.2em] text-amber-400 font-semibold mb-2 block">
              Sistematizado & Transparente
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-amber-100 mb-3">
              Cómo Comprar en Pupilentes AGO
            </h2>
            <p className="text-xs sm:text-sm text-stone-400">
              Diseñado para que tengas el control total de tu compra en menos de 2 minutos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                num: "01",
                titulo: "Elige tu Modelo",
                desc: "Explora fotos, tonos naturales o intensos y duraciones anuales o trimestrales.",
                icon: "👁️"
              },
              {
                num: "02",
                titulo: "Gradúa Cada Ojo (OD/OI)",
                desc: "Configura ojo derecho e izquierdo por separado de 0.00 a -8.00 con stock verificado en vivo.",
                icon: "🔬"
              },
              {
                num: "03",
                titulo: "Cotiza tu Envío",
                desc: "Elige entrega gratuita en Metro CDMX (Pantitlán / Tepalcates), envío express por DiDi o paquetería con tu CP.",
                icon: "📍"
              },
              {
                num: "04",
                titulo: "Paga y Recibe tu Guía",
                desc: "Transfiere vía SPEI, sube tu comprobante y recibe tu orden descargable y confirmación de WhatsApp.",
                icon: "✨"
              }
            ].map((paso) => (
              <div
                key={paso.num}
                className="bg-neutral-900/70 border border-neutral-800 p-6 rounded-2xl relative group hover:border-amber-400/40 hover:bg-neutral-900 transition-all duration-300"
              >
                <div className="text-3xl mb-4">{paso.icon}</div>
                <span className="font-mono text-xs font-bold text-amber-400/70 tracking-widest block mb-2">
                  PASO {paso.num}
                </span>
                <h3 className="font-serif text-xl font-bold text-neutral-100 mb-2">
                  {paso.titulo}
                </h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  {paso.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CATÁLOGO INTERACTIVO COMPLETO */}
      <CatalogoSection />

      {/* 5. EYE LAB TEASER */}
      <section className="py-20 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 border-y border-amber-500/20 relative">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Exclusivo de Pupilentes AGO</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-neutral-100 mb-5 leading-tight">
                Eye Lab: Pruébate los Lentes <span className="text-gold-gradient italic font-normal">en Vivo</span> con tu Cámara
              </h2>
              <p className="text-sm sm:text-base text-stone-300 leading-relaxed mb-6">
                Descubre cómo luce cada color en tus propios ojos en tiempo real. Ajusta intensidad, compara antes y después con barra deslizante y captura tu foto con marco dorado para compartir en Instagram.
              </p>
              <div className="space-y-3 mb-8 text-xs sm:text-sm text-stone-400">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Detección de iris en tiempo real directamente en tu dispositivo</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Recomendador interactivo de 5 preguntas según tu tono de piel y ojos</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100% privado: tu imagen no se guarda ni se envía a ningún servidor</span>
                </div>
              </div>
              <Link to="/probador" className="btn-gold text-sm px-7 py-3.5 inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Abrir Probador en Vivo (Eye Lab)</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm rounded-3xl p-6 bg-neutral-900 border border-amber-500/30 shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(201,162,75,0.2)] text-center">
                <div className="w-36 h-36 mx-auto mb-4 relative">
                  <IrisRenderer
                    colorPrincipal="#3CAEA3"
                    colorSecundario="#175E57"
                    colorAcento="#85E5DC"
                    size={144}
                    hoverDilate={true}
                  />
                </div>
                <h4 className="font-serif text-lg font-bold text-amber-200 mb-1">
                  Aqua Caribe Turquesa
                </h4>
                <p className="text-xs text-stone-400 mb-4">
                  Match 96% con tonos trigueños y ojos castaño oscuro
                </p>
                <div className="flex items-center justify-center gap-2 text-xs font-mono text-amber-300 bg-neutral-950 py-2 px-3 rounded-xl border border-neutral-800">
                  <span>Modo Cámara Activo</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. MAPA ESQUEMÁTICO METRO CDMX Y ENTREGAS */}
      <section className="py-20 bg-neutral-950 border-b border-amber-500/10">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-[0.2em] text-amber-400 font-semibold mb-2 block">
              Logística CDMX
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-amber-100 mb-3">
              Entregas Personales y Envíos
            </h2>
            <p className="text-xs sm:text-sm text-stone-400">
              Puntos fijos en Metro Pantitlán y Tepalcates sin costo extra, DiDi directo a tu puerta o paquetería a todo el país.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-neutral-900/60 border border-amber-500/20 rounded-3xl p-6 sm:p-10">
            {/* Mapa Metro SVG estilizado */}
            <div className="lg:col-span-7 bg-neutral-950/90 rounded-2xl border border-neutral-800 p-6 flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-full max-w-md">
                <svg viewBox="0 0 500 240" className="w-full h-auto">
                  {/* Línea A morada */}
                  <path d="M 50 120 L 450 120" stroke="#782F8E" strokeWidth="8" strokeLinecap="round" />
                  
                  {/* Línea 9 café */}
                  <path d="M 50 60 L 260 120" stroke="#875638" strokeWidth="6" strokeLinecap="round" strokeOpacity="0.7" />
                  
                  {/* Línea 1 rosa */}
                  <path d="M 50 180 L 260 120" stroke="#F18BB8" strokeWidth="6" strokeLinecap="round" strokeOpacity="0.7" />

                  {/* Estación Pantitlán Resaltada */}
                  <g className="cursor-pointer">
                    <circle cx="260" cy="120" r="16" fill="#C9A24B" className="animate-pulse" />
                    <circle cx="260" cy="120" r="9" fill="#0B0B0C" />
                    <text x="260" y="90" textAnchor="middle" fill="#E8CE8F" fontSize="13" fontWeight="bold" fontFamily="sans-serif">
                      Metro Pantitlán
                    </text>
                    <text x="260" y="150" textAnchor="middle" fill="#6FAE8B" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
                      GRATIS (L1, L5, L9, LA)
                    </text>
                  </g>

                  {/* Estación Tepalcates Resaltada */}
                  <g className="cursor-pointer">
                    <circle cx="410" cy="120" r="14" fill="#C9A24B" />
                    <circle cx="410" cy="120" r="8" fill="#0B0B0C" />
                    <text x="410" y="90" textAnchor="middle" fill="#E8CE8F" fontSize="13" fontWeight="bold" fontFamily="sans-serif">
                      Metro Tepalcates
                    </text>
                    <text x="410" y="150" textAnchor="middle" fill="#6FAE8B" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
                      GRATIS (Línea A)
                    </text>
                  </g>

                  {/* Otras estaciones nodo */}
                  <circle cx="120" cy="120" r="6" fill="#C9C2B6" />
                  <text x="120" y="145" textAnchor="middle" fill="#8A857C" fontSize="9">Otras estaciones (+$45)</text>
                </svg>
              </div>
              <p className="text-[11px] font-mono text-stone-400 mt-4 text-center">
                * Entregas personales coordinadas directamente con Araceli en torniquetes.
              </p>
            </div>

            {/* Opciones de entrega */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 rounded-xl bg-neutral-950 border border-emerald-500/30">
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Entrega Personal Metro CDMX
                  </h4>
                  <span className="text-xs font-bold text-emerald-400">Sin Costo ($0)</span>
                </div>
                <p className="text-xs text-stone-400">
                  En Metro <strong>Pantitlán</strong> o <strong>Tepalcates</strong>. Agenda día y hora en checkout. Otras estaciones disponibles por +$45.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950 border border-blue-500/30">
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-sm font-bold text-blue-300 flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Envío Express por DiDi
                  </h4>
                  <span className="text-xs font-semibold text-blue-400">Cotización en vivo</span>
                </div>
                <p className="text-xs text-stone-400">
                  Llega el mismo día a tu domicilio en CDMX. El pago se realiza antes de solicitar el DiDi.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950 border border-amber-500/30">
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Paquetería con Guía a todo México
                  </h4>
                  <span className="text-xs font-semibold text-amber-400">FedEx / Estafeta / DHL</span>
                </div>
                <p className="text-xs text-stone-400">
                  Ingresa tu Código Postal y colonia para ver opciones económicas y express con número de guía rastreable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PROGRAMA DE LEALTAD TEASER */}
      <section className="py-20 bg-neutral-900/40">
        <div className="container-custom max-w-4xl text-center">
          <div className="inline-flex p-3 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-300 mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-amber-100 mb-3">
            Programa de Puntos AGO
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 max-w-xl mx-auto mb-8 leading-relaxed">
            Acumula 1 punto por cada $10 de compra. Sube a niveles Plata y Oro, recibe estuches de cortesía, descuentos exclusivos y recordatorios oportunos para renovar tus lentes.
          </p>
          <Link to="/cuenta" className="btn-gold text-xs px-6 py-3">
            Ver Mi Tarjeta de Membresía y Canjes
          </Link>
        </div>
      </section>
    </div>
  );
};
