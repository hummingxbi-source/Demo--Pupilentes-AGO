import React from 'react';
import { Link } from 'react-router-dom';
import { COPY } from '../../data/copy';

export const Footer = () => {
  return (
    <footer className="bg-ink border-t border-cocoa text-stone pt-20 pb-20 gutter relative overflow-hidden">
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16 pb-16">
        {/* Col 1: Marca */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-espresso border border-stone/20">
              <img
                src="/logo-pupilentes-ago-512.png"
                alt="Pupilentes AGO"
                className="w-full h-full object-contain p-0.5"
              />
            </div>
            <span className="font-sans text-[12px] tracking-[0.24em] uppercase text-champagne font-medium">
              {COPY.brand.name}
            </span>
          </div>
          <p className="text-[13px] leading-relaxed text-stone/90 max-w-sm">
            {COPY.footer.col1Text}
          </p>
          <span className="text-[11px] uppercase tracking-[0.18em] text-sand/70 pt-2">
            {COPY.brand.city}
          </span>
        </div>

        {/* Col 2: Atención y Contacto */}
        <div className="flex flex-col gap-3">
          <span className="text-[11px] uppercase tracking-[0.2em] text-sand font-medium mb-1">
            {COPY.footer.col2Title}
          </span>
          <a
            href="https://wa.me/525571113508"
            target="_blank"
            rel="noreferrer"
            className="text-[13px] text-champagne hover:text-gilt transition-colors"
          >
            {COPY.footer.whatsappLabel}
          </a>
          <span className="text-[13px] text-stone/80">
            {COPY.footer.hours}
          </span>
          <span className="text-[13px] text-stone/80">
            Entregas personales Metro CDMX · DiDi Express · Paquetería
          </span>
        </div>

        {/* Col 3: Navegación */}
        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] uppercase tracking-[0.2em] text-sand font-medium mb-1">
            {COPY.footer.col3Title}
          </span>
          <Link to="/probador" className="text-[13px] text-stone/90 hover:text-gilt transition-colors">
            Eye Lab: Probador virtual
          </Link>
          <Link to="/cuenta" className="text-[13px] text-stone/90 hover:text-gilt transition-colors">
            {COPY.footer.linkAccount}
          </Link>
          <Link to="/seguimiento/AGO-1062" className="text-[13px] text-stone/90 hover:text-gilt transition-colors">
            {COPY.footer.linkTracking}
          </Link>
          <Link to="/panel" className="text-[13px] text-brass hover:text-gilt transition-colors pt-2">
            {COPY.footer.linkPanel}
          </Link>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto pt-8 border-t border-cocoa/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-stone/60">
        <p>{COPY.footer.rights}</p>
        <p className="text-stone/50">
          Demo de boutique visual creada para HummingX BI
        </p>
      </div>
    </footer>
  );
};

export default Footer;
