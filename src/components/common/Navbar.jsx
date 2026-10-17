import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { ShoppingBag, Sparkles, User, ShieldCheck, Menu, X, ArrowUpRight } from 'lucide-react';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const carrito = useStore((state) => state.carrito);
  const clientaActual = useStore((state) => state.clientaActual);

  const totalItemsEnCarrito = carrito.reduce((acc, item) => acc + (item.cantidad || 1), 0);

  const navLinks = [
    { label: "Catálogo", path: "/#catalogo" },
    { label: "Eye Lab (Probador)", path: "/probador", badge: "WOW" },
    { label: "Puntos AGO", path: "/cuenta" },
    { label: "Rastreo", path: "/seguimiento/AGO-1062" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-neutral-950/85 backdrop-blur-md border-b border-amber-500/20 transition-all duration-300">
      <div className="container-custom flex items-center justify-between h-20">
        {/* Logo oficial circular con medallón */}
        <Link to="/" className="flex items-center gap-3.5 group">
          <div style={{ width: '48px', height: '48px', minWidth: '48px' }} className="relative w-12 h-12 rounded-full overflow-hidden border border-amber-400/40 p-0.5 bg-neutral-900 shadow-[0_0_15px_rgba(201,162,75,0.25)] group-hover:border-amber-400 group-hover:shadow-[0_0_20px_rgba(201,162,75,0.45)] transition-all">
            <img
              src="/logo-pupilentes-ago-512.png"
              alt="Logo Pupilentes AGO"
              className="logo-nav w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div>
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-amber-200 block leading-tight">
              PUPILENTES AGO
            </span>
            <span className="text-[10px] tracking-[0.2em] uppercase text-stone-400 font-sans block">
              Tienda Online CDMX
            </span>
          </div>
        </Link>

        {/* Links de escritorio */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.label}
                to={link.path}
                className={`text-sm font-medium tracking-wide transition-colors relative py-1 flex items-center gap-1.5 ${
                  isActive ? 'text-amber-300' : 'text-neutral-300 hover:text-amber-200'
                }`}
              >
                {link.label}
                {link.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 animate-pulse">
                    {link.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-amber-500 to-amber-300" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Acciones de la derecha: Puntos, Carrito y Mobile Toggle */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Badge de Puntos de la clienta */}
          <Link
            to="/cuenta"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:border-amber-400/60 transition-colors"
            title="Ver mis Puntos AGO acumulados"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{clientaActual.puntos} pts</span>
          </Link>

          {/* Botón Carrito con contador interactivo */}
          <Link
            to="/checkout"
            className="relative p-2.5 rounded-full bg-neutral-900/90 border border-amber-500/30 text-neutral-200 hover:text-amber-300 hover:border-amber-400 transition-all"
            aria-label="Ver carrito y finalizar compra"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItemsEnCarrito > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-[20px] px-1 text-[11px] font-bold rounded-full bg-amber-400 text-neutral-950 shadow-[0_0_10px_rgba(201,162,75,0.7)] animate-scale-in">
                {totalItemsEnCarrito}
              </span>
            )}
          </Link>

          {/* Botón rápido a Panel */}
          <Link
            to="/panel"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-stone-300 border border-neutral-700 hover:border-amber-400/50 hover:text-amber-300 transition-colors bg-neutral-900/40"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Panel Araceli</span>
          </Link>

          {/* Botón Menú Móvil */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-300 hover:text-amber-300"
            aria-label="Abrir menú de navegación"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Menú Móvil Desplegable */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-neutral-950/98 border-b border-amber-500/30 px-6 py-6 animate-fade-in">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-neutral-200 hover:text-amber-300 flex items-center justify-between py-2 border-b border-neutral-800"
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
            <Link
              to="/cuenta"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-amber-300 flex items-center justify-between py-2 border-b border-neutral-800"
            >
              <span>Mi Cuenta & Puntos AGO ({clientaActual.puntos} pts)</span>
              <Sparkles className="w-4 h-4" />
            </Link>
            <Link
              to="/panel"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-neutral-400 hover:text-amber-300 flex items-center gap-2 pt-2"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Acceder al Panel de Operación</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
