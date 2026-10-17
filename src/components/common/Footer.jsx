import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, MapPin, Sparkles, Shield, Clock, ExternalLink } from 'lucide-react';
import { useStore } from '../../store/useStore';

export const Footer = () => {
  const ajustes = useStore((state) => state.ajustes);

  return (
    <footer className="bg-neutral-950 border-t border-amber-500/20 text-neutral-400 pt-16 pb-24 relative overflow-hidden">
      {/* Luz dorada de fondo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-amber-500/5 blur-[80px] pointer-events-none" />

      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          {/* Columna 1: Marca */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div style={{ width: '40px', height: '40px', minWidth: '40px' }} className="w-10 h-10 rounded-full border border-amber-400/40 p-0.5 bg-neutral-900">
                <img src="/logo-pupilentes-ago-512.png" alt="Logo Pupilentes AGO" className="logo-footer w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-serif text-lg font-bold text-amber-200 block leading-tight">
                  PUPILENTES AGO
                </span>
                <span className="text-[9px] uppercase tracking-widest text-stone-400">
                  CDMX · México
                </span>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-stone-400 mb-5">
              Boutique especializada en lentes de contacto de color de alta gama con graduación personalizada por ojo. Envíos seguros y entregas personales en la Ciudad de México.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://wa.me/525571113508"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-neutral-900 border border-amber-500/30 flex items-center justify-center text-amber-300 hover:border-amber-400 hover:text-white transition-colors"
                title="WhatsApp Atención Directa"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-neutral-900 border border-amber-500/30 flex items-center justify-center text-amber-300 hover:border-amber-400 hover:text-white transition-colors"
                title="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <span className="text-xs text-stone-400 font-mono">WA: +52 55 7111 3508</span>
            </div>
          </div>

          {/* Columna 2: Entregas CDMX */}
          <div>
            <h4 className="font-serif text-base font-semibold text-amber-200 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              Entregas Personales CDMX
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                <span><strong className="text-stone-200">Metro Pantitlán</strong> (Líneas 1, 5, 9, A) — Sin costo adicional</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                <span><strong className="text-stone-200">Metro Tepalcates</strong> (Línea A) — Sin costo adicional</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 shrink-0" />
                <span>Otras estaciones del Metro CDMX con costo extra de $45</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1 shrink-0" />
                <span>Envíos express por <strong>DiDi</strong> y Paqueterías a todo México</span>
              </li>
            </ul>
          </div>

          {/* Columna 3: Horarios y Garantía */}
          <div>
            <h4 className="font-serif text-base font-semibold text-amber-200 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Horarios y Compromiso
            </h4>
            <div className="space-y-2 text-xs text-stone-400 mb-4">
              <p>Lunes a Viernes: 10:00 – 20:00 hrs</p>
              <p>Sábados: 11:00 – 17:00 hrs</p>
              <p className="text-emerald-400/90 font-medium pt-1">
                ✓ Productos 100% estériles en empaque sellado
              </p>
              <p className="text-amber-300/90 font-medium">
                ✓ Graduación independiente por ojo (OD / OI)
              </p>
            </div>
          </div>

          {/* Columna 4: Navegación Rápida */}
          <div>
            <h4 className="font-serif text-base font-semibold text-amber-200 mb-4">
              Navegación Boutique
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/probador" className="text-stone-400 hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Eye Lab: Probador en vivo
                </Link>
              </li>
              <li>
                <Link to="/cuenta" className="text-stone-400 hover:text-amber-300 transition-colors">
                  Programa de Puntos AGO & Renovaciones
                </Link>
              </li>
              <li>
                <Link to="/seguimiento/AGO-1062" className="text-stone-400 hover:text-amber-300 transition-colors">
                  Rastrear mi pedido
                </Link>
              </li>
              <li>
                <Link to="/panel" className="text-amber-400/80 hover:text-amber-300 transition-colors flex items-center gap-1 font-medium">
                  <Shield className="w-3.5 h-3.5" />
                  Panel Operativo de Araceli
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
          <p>© 2026 Pupilentes AGO · Todos los derechos reservados. Diseñado para Araceli Garrido.</p>
          <p className="text-stone-400">
            Demo interactiva desarrollada por <span className="text-amber-300 font-medium">HummingX BI</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
