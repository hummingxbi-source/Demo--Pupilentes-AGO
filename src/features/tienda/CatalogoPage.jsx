import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { gsap } from '../../lib/gsap';
import {
  PRODUCTOS_INICIALES,
  TIPOS_PRODUCTO,
  FAMILIAS_COLOR,
  formatMXN,
  calcularStockTotal,
  GRADUACIONES,
  TONOS_POR_CATALOGO
} from '../../data/productos';
import { IrisRenderer } from '../../components/common/IrisRenderer';
import {
  SlidersHorizontal,
  ArrowLeft,
  Search,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Filter,
  Eye,
  RotateCcw
} from 'lucide-react';

// Los 4 Catálogos Oficiales de Pupilentes AGO
const BLOQUES_CATALOGO = [
  {
    id: 'azul',
    nombre: 'Catálogo Azul',
    subtitulo: 'Miradas celestes, zafiro & aqua caribe',
    img: '/img/fotos/clientes/01-azul-angeles-n-blue.jpg',
    hex: '#427AA1',
    badge: 'Colección Azul',
    familias: ['azul'],
    descripcion: 'Tonos zafiro brillante, aqua caribe y azul cielo con efecto cristalino natural.'
  },
  {
    id: 'verde',
    nombre: 'Catálogo Verde',
    subtitulo: 'Breeze green, esmeralda & oliva seda',
    img: '/img/fotos/clientes/02-verde-breeze-green.jpg',
    hex: '#4A7C59',
    badge: 'Colección Verde',
    familias: ['verde'],
    descripcion: 'Matices esmeralda, menta y oliva suave que transforman miradas cafés con sutileza.'
  },
  {
    id: 'cafe',
    nombre: 'Catálogo Café',
    subtitulo: 'Gemini hazel, miel satín & avellana ámbar',
    img: '/img/fotos/clientes/03-cafe-gemini-hazel.jpg',
    hex: '#966A3D',
    badge: 'Colección Café',
    familias: ['cafe', 'miel', 'avellana'],
    descripcion: 'Cálidos destellos miel, castaño claro, chocolate y avellana ámbar de máxima naturalidad.'
  },
  {
    id: 'gris',
    nombre: 'Catálogo Gris',
    subtitulo: 'Cloud gray, gris platino & grafito suave',
    img: '/img/fotos/clientes/04-gris-cloud-gray.jpg',
    hex: '#8A929A',
    badge: 'Colección Gris',
    familias: ['gris'],
    descripcion: 'Gris nube ahumado, destellos plateados y perla lunar para estilismo sofisticado.'
  },
];

export const CatalogoPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const colorParam = searchParams.get('color');

  // Estado para el bloque de catálogo seleccionado
  const [bloqueActivo, setBloqueActivo] = useState(null); // 'azul' | 'verde' | 'cafe' | 'gris' | null
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  const [graduacionFiltro, setGraduacionFiltro] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState('destacados');

  // Si viene color en URL (?color=azul), seleccionarlo automáticamente
  useEffect(() => {
    if (colorParam) {
      const normalizado = colorParam.toLowerCase().trim();
      if (['azul', 'verde', 'cafe', 'gris'].includes(normalizado)) {
        setBloqueActivo(normalizado);
      }
    }
  }, [colorParam]);

  // Filtrado de productos según bloque de catálogo, graduación, búsqueda y tipo
  const productosFiltrados = useMemo(() => {
    let prods = PRODUCTOS_INICIALES.filter((prod) => {
      // Filtro por bloque de catálogo activo
      if (bloqueActivo) {
        const bloqueInfo = BLOQUES_CATALOGO.find((b) => b.id === bloqueActivo);
        if (bloqueInfo && !bloqueInfo.familias.includes(prod.familia)) {
          return false;
        }
      }

      // Filtro por búsqueda
      if (busqueda.trim() !== '') {
        const q = busqueda.toLowerCase();
        const match =
          prod.nombre.toLowerCase().includes(q) ||
          prod.familia.toLowerCase().includes(q) ||
          prod.descripcion.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Filtro por tipo (graduado, estético, accesorio)
      if (tipoFiltro !== 'todos' && prod.tipo !== tipoFiltro) {
        return false;
      }

      // Filtro por graduación
      if (graduacionFiltro !== 'todas' && prod.permiteGraduacion) {
        const stockGrad = prod.stockPorGraduacion?.[graduacionFiltro] || 0;
        if (stockGrad <= 0) return false;
      }

      return true;
    });

    // Ordenamiento
    if (orden === 'precio-menor') {
      prods.sort((a, b) => a.precio - b.precio);
    } else if (orden === 'precio-mayor') {
      prods.sort((a, b) => b.precio - a.precio);
    } else if (orden === 'popularidad') {
      prods.sort((a, b) => (b.popularidad || 0) - (a.popularidad || 0));
    }

    return prods;
  }, [bloqueActivo, tipoFiltro, graduacionFiltro, busqueda, orden]);

// Helper para obtener el acento cromático de cada bloque/familia
const getColorFamilia = (familia) => {
  switch (familia) {
    case 'azul':
      return {
        hex: '#427AA1',
        badgeClass: 'bg-[#427AA1]/20 text-[#7BB4E0] border-[#427AA1]/40',
        hoverBorder: 'hover:border-[#427AA1]/60'
      };
    case 'verde':
      return {
        hex: '#4A7C59',
        badgeClass: 'bg-[#4A7C59]/20 text-[#82BD94] border-[#4A7C59]/40',
        hoverBorder: 'hover:border-[#4A7C59]/60'
      };
    case 'cafe':
    case 'miel':
    case 'avellana':
      return {
        hex: '#966A3D',
        badgeClass: 'bg-[#966A3D]/20 text-[#D4AA77] border-[#966A3D]/40',
        hoverBorder: 'hover:border-[#966A3D]/60'
      };
    case 'gris':
      return {
        hex: '#8A929A',
        badgeClass: 'bg-[#8A929A]/20 text-[#CBD5E1] border-[#8A929A]/40',
        hoverBorder: 'hover:border-[#8A929A]/60'
      };
    default:
      return {
        hex: '#B08D57',
        badgeClass: 'bg-brass/20 text-gilt border-brass/30',
        hoverBorder: 'hover:border-brass/50'
      };
  }
};

  // Animación sutil de tarjetas al filtrar por bloque o búsqueda
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      document.querySelectorAll('.catalogo-card-stagger').forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.catalogo-card-stagger',
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
          stagger: 0.03,
          ease: 'power2.out',
          immediateRender: false,
          clearProps: 'opacity,transform'
        }
      );
    });

    const fallbackTimer = setTimeout(() => {
      document.querySelectorAll('.catalogo-card-stagger').forEach((el) => {
        if (window.getComputedStyle(el).opacity === '0') {
          el.style.opacity = '1';
          el.style.transform = 'none';
        }
      });
    }, 700);

    return () => {
      ctx.revert();
      clearTimeout(fallbackTimer);
    };
  }, [bloqueActivo, productosFiltrados.length]);

  const bloqueActualInfo = BLOQUES_CATALOGO.find((b) => b.id === bloqueActivo);

  return (
    <div className="min-h-screen bg-ink text-champagne pt-24 pb-24 gutter">
      <div className="w-full max-w-7xl mx-auto space-y-10">
        {/* Cabecera y botón volver */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-cocoa pb-6">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-sand hover:text-gilt mb-3 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a la portada</span>
            </Link>
            <h1 className="font-serif text-[clamp(2.5rem,5vw,4.2rem)] text-champagne font-light leading-tight">
              Catálogo de Pupilentes AGO
            </h1>
            <p className="text-sm text-stone font-light max-w-xl mt-2">
              Elige entre nuestros 4 catálogos de color oficiales. Todos los tonos disponibles con graduación para miopía (−0.50 a −8.00) o cosméticos sin aumento.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-stone">
            <span>Mostrando {productosFiltrados.length} modelos</span>
          </div>
        </div>

        {/* ========================================================
            LOS 4 BLOQUES DE CATÁLOGO (AZUL, VERDE, CAFÉ, GRIS)
            ======================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.2em] text-sand font-medium">
              {bloqueActivo
                ? `Colección Seleccionada: ${bloqueActualInfo?.nombre}`
                : 'Selecciona una Colección de Color:'}
            </span>

            {bloqueActivo && (
              <button
                type="button"
                onClick={() => {
                  setBloqueActivo(null);
                  setSearchParams({});
                }}
                className="text-xs text-brass hover:text-champagne flex items-center gap-1.5 transition-colors font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span> Ver todos los colores</span>
              </button>
            )}
          </div>

          {/* SELECTOR DE LOS 4 CATÁLOGOS CON ALTURA AMPLIA Y ELEGANTE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BLOQUES_CATALOGO.map((bloque) => {
              const esActivo = bloqueActivo === bloque.id;

              return (
                <div
                  key={bloque.id}
                  onClick={() => {
                    const nuevo = esActivo ? null : bloque.id;
                    setBloqueActivo(nuevo);
                    if (nuevo) {
                      setSearchParams({ color: nuevo });
                    } else {
                      setSearchParams({});
                    }
                  }}
                  style={{
                    borderColor: esActivo ? bloque.hex : undefined,
                    boxShadow: esActivo ? `0 12px 32px -4px ${bloque.hex}55` : undefined
                  }}
                  className={`group relative rounded-[22px] overflow-hidden bg-espresso border cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                    esActivo
                      ? 'scale-[1.02] border-2 ring-1 ring-brass/40 shadow-2xl'
                      : bloqueActivo
                      ? 'border-cocoa opacity-60 hover:opacity-100 hover:scale-[1.01]'
                      : 'border-cocoa hover:border-brass/50 hover:scale-[1.01]'
                  }`}
                >
                  <div className="relative w-full aspect-[4/5] overflow-hidden bg-ink">
                    <img
                      src={bloque.img}
                      alt={bloque.nombre}
                      className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-espresso via-black/20 to-black/30" />

                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-ink/85 backdrop-blur-md border border-cocoa text-[11px] font-medium text-sand shadow-md">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: bloque.hex }}
                      />
                      <span>{bloque.badge}</span>
                    </div>

                    {esActivo ? (
                      <span
                        className="absolute top-3 right-3 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider text-ink shadow-lg"
                        style={{ backgroundColor: bloque.hex }}
                      >
                         ACTIVO
                      </span>
                    ) : (
                      <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-ink/85 backdrop-blur-md border border-cocoa text-sand text-xs font-medium opacity-90 group-hover:opacity-100 group-hover:border-brass/70 group-hover:text-champagne transition-all shadow-md">
                        Ver tonos 
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-lg text-champagne font-medium">
                        {bloque.nombre}
                      </h3>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform duration-300 ${
                          esActivo ? 'rotate-90 text-brass' : 'text-stone group-hover:translate-x-0.5'
                        }`}
                      />
                    </div>
                    <p className="text-xs text-stone font-light line-clamp-2 leading-relaxed">
                      {bloque.subtitulo}
                    </p>
                    <div className="pt-2 flex items-center justify-between border-t border-cocoa/40 text-[11px]">
                      <span className="text-sand/70 font-mono">
                        {PRODUCTOS_INICIALES.filter((p) => bloque.familias.includes(p.familia)).length} modelos
                      </span>
                      <span
                        className="font-medium hover:underline"
                        style={{ color: bloque.hex }}
                      >
                        {esActivo ? 'Colección activa' : 'Filtrar colección'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================
            BARRA DE FILTROS ADICIONALES (BÚSQUEDA, GRADUACIÓN, ORDEN)
            ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-espresso/60 p-4 rounded-2xl border border-cocoa">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar modelo o tono..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-ink border border-cocoa text-champagne text-xs focus:border-brass focus:outline-none"
            />
          </div>

          {/* Graduación */}
          <div>
            <select
              value={graduacionFiltro}
              onChange={(e) => setGraduacionFiltro(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-ink border border-cocoa text-champagne text-xs focus:border-brass focus:outline-none"
            >
              <option value="todas">Graduación: Todas las dioptrías</option>
              <option value="0.00">0.00 (Plano / Uso Cosmético)</option>
              {GRADUACIONES.filter((g) => g !== '0.00').map((g) => (
                <option key={g} value={g}>
                  Graduación {g} (Miopía)
                </option>
              ))}
            </select>
          </div>

          {/* Orden */}
          <div>
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-ink border border-cocoa text-champagne text-xs focus:border-brass focus:outline-none"
            >
              <option value="destacados">Ordenar: Destacados</option>
              <option value="precio-menor">Precio: Menor a mayor</option>
              <option value="precio-mayor">Precio: Mayor a menor</option>
              <option value="popularidad">Más populares</option>
            </select>
          </div>
        </div>

        {/* ========================================================
            CUADRÍCULA PRINCIPAL DE MODELOS (CON ACENTO DEL BLOQUE)
            ======================================================== */}
        {bloqueActivo && (
          <div className="flex items-center justify-between px-2 pt-2 text-xs">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: bloqueActualInfo?.hex }}
              />
              <span className="text-sand font-medium uppercase tracking-wider text-[11px]">
                Colección {bloqueActualInfo?.nombre}: {productosFiltrados.length} modelos disponibles
              </span>
            </div>
            <button
              onClick={() => setBloqueActivo(null)}
              className="text-stone hover:text-champagne transition-colors underline text-[11px]"
            >
              Ver todos los colores
            </button>
          </div>
        )}

        {productosFiltrados.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-espresso/30 rounded-3xl border border-cocoa/50">
            <p className="text-stone font-light text-base">
              No encontramos modelos con los filtros seleccionados.
            </p>
            <button
              onClick={() => {
                setBloqueActivo(null);
                setTipoFiltro('todos');
                setGraduacionFiltro('todas');
                setBusqueda('');
              }}
              className="btn-brass text-xs px-6 py-2"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {productosFiltrados.map((producto) => {
              const stockTotal = calcularStockTotal(producto);
              const enStock = stockTotal > 5;
              const bajoStock = stockTotal > 0 && stockTotal <= 5;
              const colorInfo = getColorFamilia(producto.familia);

              return (
                <div
                  key={producto.id}
                  className={`catalogo-card-stagger group flex flex-col bg-espresso/40 rounded-[22px] border border-cocoa/60 p-4 ${colorInfo.hoverBorder} hover:bg-espresso/70 transition-all duration-300 shadow-sm`}
                >
                  <Link
                    to={`/producto/${producto.id}`}
                    className="relative w-full aspect-[4/5] rounded-[18px] overflow-hidden bg-ink flex items-center justify-center p-4 group"
                  >
                    <img
                      src={producto.imagen || `/img/iris/${producto.familia}.webp`}
                      alt={producto.nombre}
                      className="w-full h-full object-cover rounded-2xl transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Badge de Colección / Tipo con color del bloque */}
                    <span
                      className={`absolute top-3 left-3 px-2.5 py-1 rounded-full backdrop-blur-md border text-[10px] uppercase tracking-wider font-medium ${colorInfo.badgeClass}`}
                    >
                      {producto.familia}
                    </span>

                    {/* Botón flotante Configurar */}
                    <div className="hidden lg:flex absolute bottom-4 px-5 py-2 rounded-full bg-brass text-ink font-semibold text-xs tracking-wide opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                      Configurar Graduación
                    </div>
                  </Link>

                  <div className="pt-4 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5 sm:gap-2">
                    <Link
                      to={`/producto/${producto.id}`}
                      className="font-serif text-[17px] sm:text-lg text-champagne hover:text-gilt transition-colors leading-tight line-clamp-2 sm:line-clamp-1"
                    >
                      {producto.nombre}
                    </Link>
                    <span className="font-sans text-sm text-sand font-medium whitespace-nowrap">
                      {formatMXN(producto.precio)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 text-[11px] text-stone">
                    <span className="capitalize">{producto.duracion || 'Anual'}</span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: enStock ? colorInfo.hex : bajoStock ? '#F59E0B' : '#78716C'
                        }}
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogoPage;
