import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { useLenis } from '../../lib/smoothScroll';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { ShoppingBag, User } from 'lucide-react';
import { COPY } from '../../data/copy';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLightTheme, setIsLightTheme] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  const navRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { lenis, scrollToId } = useLenis();

  const carrito = useStore((state) => state.carrito);
  const clientaActual = useStore((state) => state.clientaActual);
  const telefonoSesion = useStore((state) => state.telefono);
  const totalItemsEnCarrito = carrito.reduce((acc, item) => acc + (item.cantidad || 1), 0);

  // Entrance animation
  useEffect(() => {
    if (!navRef.current) return;
    gsap.fromTo(
      navRef.current,
      { yPercent: -100, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 0.9, delay: 0.4, ease: 'power3.out' }
    );
  }, []);

  // Bloquear el scroll de fondo con el menú abierto
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  // Scroll direction detection: hide on scroll down, show on scroll up
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    let lastScrollY = window.pageYOffset;

    const onScroll = () => {
      const currentScrollY = window.pageYOffset;
      setIsScrolled(currentScrollY > 70);

      if (mobileMenuOpen) return;

      if (currentScrollY > 150 && currentScrollY > lastScrollY) {
        gsap.to(el, { yPercent: -100, duration: 0.45, ease: 'power3.out', overwrite: 'auto' });
      } else {
        gsap.to(el, { yPercent: 0, duration: 0.45, ease: 'power3.out', overwrite: 'auto' });
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [mobileMenuOpen]);

  // Section theme detection (light sections like manifiesto or catalog)
  useEffect(() => {
    const checkTheme = () => {
      const sections = document.querySelectorAll('[data-nav-theme]');
      const navCenter = 36;
      let lightActive = false;
      let activeId = '';

      sections.forEach((sec) => {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= navCenter && rect.bottom >= navCenter) {
          if (sec.getAttribute('data-nav-theme') === 'light') {
            lightActive = true;
          }
          if (sec.id) activeId = sec.id;
        }
      });

      setIsLightTheme(lightActive);
      setActiveSection(activeId);
    };

    window.addEventListener('scroll', checkTheme, { passive: true });
    checkTheme();
    return () => window.removeEventListener('scroll', checkTheme);
  }, [location.pathname]);

  // Mobile menu open / close animations & scroll locking
  useEffect(() => {
    if (mobileMenuOpen) {
      if (lenis) lenis.stop();
      document.body.style.overflow = 'hidden';

      const ctx = gsap.context(() => {
        gsap.fromTo(
          mobileMenuRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.35, ease: 'power2.out' }
        );
        gsap.fromTo(
          '.mobile-nav-link-inner',
          { yPercent: 100, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out', delay: 0.1 }
        );
      }, mobileMenuRef);

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setMobileMenuOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        ctx.revert();
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      if (lenis) lenis.start();
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen, lenis]);

  // Handler for Colecciones link
  const handleColeccionesClick = (e) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      scrollToId('colecciones');
    } else {
      navigate('/');
      setTimeout(() => {
        scrollToId('colecciones');
      }, 350);
    }
  };

  const isColeccionesActive = location.pathname === '/' && activeSection === 'colecciones';
  const isCatalogoActive = location.pathname === '/catalogo';
  const isEyeLabActive = location.pathname === '/probador';
  const isCuentaActive = location.pathname === '/cuenta';

  // Text colors depending on light/dark section
  const textColor = isLightTheme ? 'text-[#1a1a1a]' : 'text-champagne';
  const textMuted = isLightTheme ? 'text-[#5C5247]' : 'text-stone';
  const logoBorder = isLightTheme ? 'border-[#5C5247]/30' : 'border-stone/20';

  return (
    <>
      <header
        ref={navRef}
        style={{ transition: 'background-color 300ms ease, color 300ms ease, border-color 300ms ease' }}
        className={`fixed top-0 left-0 w-full z-40 gutter flex items-center justify-between h-[64px] lg:h-[72px] ${
          isScrolled
            ? isLightTheme
              ? 'bg-[#F5EFE4]/90 backdrop-blur-xl border-b border-[#5C5247]/20 shadow-sm'
              : 'bg-ink/75 backdrop-blur-xl border-b border-brass/15 shadow-sm'
            : isLightTheme
            ? 'bg-[#F5EFE4]/80 backdrop-blur-md border-b border-[#5C5247]/15'
            : 'bg-ink/80 backdrop-blur-xl border-b border-brass/10 lg:bg-transparent lg:backdrop-blur-none lg:border-transparent'
        } ${mobileMenuOpen ? '!bg-ink !border-brass/15' : ''}`}
      >
        {/* Left: Medallón Logo (36px) & Wordmark */}
        <Link to="/" className="flex items-center gap-3 group focus-visible:outline-none" aria-label="Pupilentes AGO Inicio">
          <div className={`relative w-9 h-9 rounded-full overflow-hidden bg-espresso border ${logoBorder} transition-all duration-300 group-hover:scale-105`}>
            <img
              src="/logo-pupilentes-ago-512.png"
              alt="Pupilentes AGO"
              className="w-full h-full object-contain p-0.5"
            />
          </div>
          <span className={`hidden sm:inline-block font-sans text-[12px] tracking-[0.28em] font-medium uppercase transition-colors group-hover:text-gilt ${textColor}`}>
            {COPY.brand.name}
          </span>
        </Link>

        {/* Center: Desktop Links (>= 1024px) */}
        <nav className="hidden lg:flex items-center gap-8 xl:gap-10" aria-label="Navegación principal">
          <a
            href="#colecciones"
            onClick={handleColeccionesClick}
            className={`btn-link-thread text-[13px] tracking-[0.14em] uppercase transition-colors ${
              isColeccionesActive ? 'is-active text-gilt font-medium' : textColor
            }`}
          >
            {COPY.nav.collections}
          </a>

          <Link
            to="/catalogo"
            className={`btn-link-thread text-[13px] tracking-[0.14em] uppercase transition-colors ${
              isCatalogoActive ? 'is-active text-gilt font-medium' : textColor
            }`}
          >
            {COPY.nav.catalog}
          </Link>

          <Link
            to="/probador"
            className={`btn-link-thread text-[13px] tracking-[0.14em] uppercase transition-colors ${
              isEyeLabActive ? 'is-active text-gilt font-medium' : textColor
            }`}
          >
            {COPY.nav.eyeLab}
          </Link>

          <Link
            to="/cuenta"
            className={`btn-link-thread text-[13px] tracking-[0.14em] uppercase transition-colors ${
              isCuentaActive ? 'is-active text-gilt font-medium' : textColor
            }`}
          >
            {COPY.nav.points}
          </Link>
        </nav>

        {/* Right: Cart & My Account */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Indicador de sesión: solo aparece cuando la clienta ya entró con su WhatsApp */}
          {telefonoSesion && (
            <Link
              to="/cuenta"
              className={`hidden sm:flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-brass/30 text-[12px] transition-colors ${textColor} hover:border-brass`}
              aria-label="Ver mis pedidos y puntos"
            >
              <span className="w-6 h-6 rounded-full bg-brass text-ink text-[10px] font-semibold flex items-center justify-center">
                {(clientaActual?.nombre || 'AG').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
              </span>
              <span className="font-mono">{clientaActual?.puntos || 0} pts</span>
            </Link>
          )}

          <Link
            to="/checkout"
            className={`relative p-2 rounded-full transition-colors ${textColor} hover:text-gilt`}
            aria-label={`Ver bolsa con ${totalItemsEnCarrito} artículos`}
          >
            <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
            {totalItemsEnCarrito > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold rounded-full bg-brass text-ink">
                {totalItemsEnCarrito}
              </span>
            )}
          </Link>

          {/* Mobile Menu Button: Minimal crossing lines */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden relative w-8 h-8 flex flex-col justify-center items-center gap-1.5 focus-visible:outline-none"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            <span
              className={`w-5 h-[1.5px] bg-current transition-transform duration-300 ${
                textColor
              } ${mobileMenuOpen ? 'rotate-45 translate-y-[4.5px]' : ''}`}
            />
            <span
              className={`w-5 h-[1.5px] bg-current transition-transform duration-300 ${
                textColor
              } ${mobileMenuOpen ? '-rotate-45 -translate-y-[4.5px]' : ''}`}
            />
          </button>
        </div>
      </header>

      {/* Menú móvil a pantalla completa */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="fixed inset-0 z-30 bg-ink flex flex-col justify-between px-6 pt-[88px] pb-24 lg:hidden overflow-y-auto"
        >
          <div className="pointer-events-none absolute -right-24 top-24 w-72 h-72 rounded-full opacity-[0.07] bg-[url('/img/iris/miel.webp')] bg-cover" />
          <nav className="relative flex flex-col" aria-label="Menú móvil">
            {[
              { label: COPY.nav.collections, onClick: handleColeccionesClick, href: '#colecciones' },
              { label: COPY.nav.catalog, to: '/catalogo' },
              { label: COPY.nav.eyeLab, to: '/probador' },
              { label: COPY.nav.points, to: '/cuenta' },
              { label: `${COPY.nav.cart}${totalItemsEnCarrito ? ` (${totalItemsEnCarrito})` : ''}`, to: '/checkout' },
            ].map((item, idx) => {
              const activo = item.to && location.pathname === item.to;
              const cls = `mobile-nav-link-inner flex items-baseline gap-4 py-4 border-b border-cocoa/70 font-serif text-[clamp(1.9rem,8.5vw,2.6rem)] leading-none transition-colors ${activo ? 'text-gilt' : 'text-champagne hover:text-gilt'}`;
              const num = <span className="font-sans text-[11px] tracking-[0.2em] text-brass w-6 shrink-0">{String(idx + 1).padStart(2, '0')}</span>;
              return (
                <div key={item.label} className="overflow-hidden">
                  {item.to ? (
                    <Link to={item.to} onClick={() => setMobileMenuOpen(false)} className={cls}>{num}{item.label}</Link>
                  ) : (
                    <a href={item.href} onClick={item.onClick} className={cls}>{num}{item.label}</a>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="relative pt-8 flex flex-col gap-4">
            <a
              href="https://wa.me/525571113508"
              target="_blank"
              rel="noreferrer"
              className="btn-brass w-full"
            >
              Escribir por WhatsApp
            </a>
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-stone">
              <span>{COPY.brand.city}</span>
              <span className="font-mono normal-case tracking-normal text-sand">{COPY.brand.whatsapp}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
