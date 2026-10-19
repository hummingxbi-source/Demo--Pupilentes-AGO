import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { IrisRenderer } from '../../components/common/IrisRenderer';
import { FAMILIAS_COLOR, GRADUACIONES, formatMXN, calcularStockTotal } from '../../data/productos';
import { Search, Sparkles, Filter, Check, Eye, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export const CatalogoSection = () => {
  const productos = useStore((state) => state.productos);

  // Estados de filtros
  const [familiaSeleccionada, setFamiliaSeleccionada] = useState('todos');
  const [tonalidadSeleccionada, setTonalidadSeleccionada] = useState('todos');
  const [duracionSeleccionada, setDuracionSeleccionada] = useState('todos');
  const [graduacionFiltro, setGraduacionFiltro] = useState('todas');
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState('popularidad');

  // Filtrado y ordenamiento en tiempo real
  const productosFiltrados = useMemo(() => {
    return productos.filter((prod) => {
      // Búsqueda por texto
      if (busqueda.trim() !== '') {
        const query = busqueda.toLowerCase();
        const coincide =
          prod.nombre.toLowerCase().includes(query) ||
          prod.familia.toLowerCase().includes(query) ||
          prod.descripcion.toLowerCase().includes(query);
        if (!coincide) return false;
      }

      // Filtro por familia
      if (familiaSeleccionada !== 'todos' && prod.familia !== familiaSeleccionada) {
        return false;
      }

      // Filtro por tonalidad
      if (tonalidadSeleccionada !== 'todos' && prod.tonalidad !== tonalidadSeleccionada) {
        return false;
      }

      // Filtro por duración
      if (duracionSeleccionada !== 'todos' && prod.duracion !== duracionSeleccionada) {
        return false;
      }

      // Filtro por graduación específica disponible
      if (graduacionFiltro !== 'todas') {
        const stockGrad = prod.stockPorGraduacion?.[graduacionFiltro] || 0;
        if (stockGrad <= 0) return false;
      }

      // Filtro solo disponibles
      if (soloDisponibles) {
        const totalStock = calcularStockTotal(prod);
        if (totalStock <= 0) return false;
      }

      return true;
    }).sort((a, b) => {
      if (orden === 'popularidad') return (b.popularidad || 0) - (a.popularidad || 0);
      if (orden === 'precio_asc') return a.precio - b.precio;
      if (orden === 'precio_desc') return b.precio - a.precio;
      if (orden === 'nombre') return a.nombre.localeCompare(b.nombre);
      return 0;
    });
  }, [productos, busqueda, familiaSeleccionada, tonalidadSeleccionada, duracionSeleccionada, graduacionFiltro, soloDisponibles, orden]);

  return (
    <section id="catalogo" className="py-20 bg-neutral-950 text-neutral-100 relative">
      <div className="container-custom">
        {/* Cabecera de la sección */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold mb-2 block">
            Catálogo Interactivo Boutique
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-amber-100 mb-4">
            Encuentra tu Mirada Ideal
          </h2>
          <p className="text-sm md:text-base text-stone-400 leading-relaxed">
            Explora más de 14 tonos exclusivos con graduación individual por ojo y visualización hiperrealista en tiempo real.
          </p>
        </div>

        {/* Barra de Búsqueda y Filtros Rápidos */}
        <div className="bg-neutral-900/80 border border-amber-500/20 rounded-2xl p-4 sm:p-6 mb-10 backdrop-blur-md shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Input de Búsqueda */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-amber-400/80 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por tono, nombre o color (ej. Miel, Verde, Zafiro)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-neutral-950 border border-neutral-700/80 text-sm text-neutral-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-white"
                >
                  
                </button>
              )}
            </div>

            {/* Selector de Graduación */}
            <div className="md:col-span-3">
              <select
                value={graduacionFiltro}
                onChange={(e) => setGraduacionFiltro(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full bg-neutral-950 border border-neutral-700/80 text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
              >
                <option value="todas">Cualquier graduación</option>
                <option value="0.00">0.00 (Cosméticos / Sin aumento)</option>
                <optgroup label="Miopía con graduación">
                  {GRADUACIONES.filter((g) => g !== "0.00").map((g) => (
                    <option key={g} value={g}>
                      Graduación {g}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Ordenar por */}
            <div className="md:col-span-4 flex items-center gap-2">
              <select
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full bg-neutral-950 border border-neutral-700/80 text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
              >
                <option value="popularidad">Más populares primero</option>
                <option value="precio_asc">Precio: de menor a mayor</option>
                <option value="precio_desc">Precio: de mayor a menor</option>
                <option value="nombre">Orden alfabético A-Z</option>
              </select>

              <button
                type="button"
                onClick={() => setSoloDisponibles(!soloDisponibles)}
                className={`px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  soloDisponibles
                    ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                    : 'bg-neutral-950 border-neutral-700 text-stone-400 hover:border-stone-500'
                }`}
                title="Mostrar solo modelos con stock disponible"
              >
                {soloDisponibles ? ' En stock' : 'Todos'}
              </button>
            </div>
          </div>

          {/* Chips de Familias de Color */}
          <div className="flex items-center gap-2 overflow-x-auto pt-5 pb-2 scrollbar-none">
            {FAMILIAS_COLOR.map((fam) => {
              const isSelected = familiaSeleccionada === fam.id;
              return (
                <button
                  key={fam.id}
                  onClick={() => setFamiliaSeleccionada(fam.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-amber-400 text-neutral-950 shadow-[0_0_12px_rgba(201,162,75,0.4)] font-semibold'
                      : 'bg-neutral-950/80 text-stone-300 border border-neutral-800 hover:border-amber-400/40 hover:text-white'
                  }`}
                >
                  {fam.hex && (
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/30 shrink-0"
                      style={{ backgroundColor: fam.hex }}
                    />
                  )}
                  {fam.label}
                </button>
              );
            })}
          </div>

          {/* Sub-filtros: Tonalidad y Duración */}
          <div className="flex flex-wrap items-center gap-4 pt-3 text-xs text-stone-400 border-t border-neutral-800/80 mt-3">
            <div className="flex items-center gap-1.5">
              <span className="text-stone-500 font-semibold uppercase text-[10px]">Tonalidad:</span>
              {['todos', 'natural', 'intenso', 'cosmetico'].map((ton) => (
                <button
                  key={ton}
                  onClick={() => setTonalidadSeleccionada(ton)}
                  className={`px-2.5 py-0.5 rounded-md capitalize transition-colors ${
                    tonalidadSeleccionada === ton
                      ? 'bg-neutral-800 text-amber-300 font-semibold'
                      : 'hover:text-stone-200'
                  }`}
                >
                  {ton}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-stone-500 font-semibold uppercase text-[10px]">Duración:</span>
              {['todos', 'mensual', 'trimestral', 'anual'].map((dur) => (
                <button
                  key={dur}
                  onClick={() => setDuracionSeleccionada(dur)}
                  className={`px-2.5 py-0.5 rounded-md capitalize transition-colors ${
                    duracionSeleccionada === dur
                      ? 'bg-neutral-800 text-amber-300 font-semibold'
                      : 'hover:text-stone-200'
                  }`}
                >
                  {dur}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Conteo de resultados */}
        <div className="flex items-center justify-between text-xs text-stone-400 mb-6 px-1">
          <span>Mostrando {productosFiltrados.length} modelo(s) disponibles</span>
          {(familiaSeleccionada !== 'todos' || busqueda || soloDisponibles || graduacionFiltro !== 'todas') && (
            <button
              onClick={() => {
                setFamiliaSeleccionada('todos');
                setTonalidadSeleccionada('todos');
                setDuracionSeleccionada('todos');
                setGraduacionFiltro('todas');
                setSoloDisponibles(false);
                setBusqueda('');
              }}
              className="text-amber-400 hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Grid de Productos */}
        {productosFiltrados.length === 0 ? (
          <div className="text-center py-16 bg-neutral-900/40 rounded-2xl border border-neutral-800">
            <Eye className="w-12 h-12 text-stone-600 mx-auto mb-3" />
            <h3 className="font-serif text-xl text-stone-300 mb-1">No encontramos modelos con esos filtros</h3>
            <p className="text-xs text-stone-500 mb-4">Intenta ajustar la búsqueda o seleccionar otra familia de color.</p>
            <button
              onClick={() => {
                setFamiliaSeleccionada('todos');
                setBusqueda('');
                setSoloDisponibles(false);
              }}
              className="btn-outline-gold text-xs py-2 px-4"
            >
              Ver todos los colores
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productosFiltrados.map((producto) => {
              const stockTotal = calcularStockTotal(producto);
              const enStock = stockTotal > 5;
              const bajoStock = stockTotal > 0 && stockTotal <= 5;
              const agotado = stockTotal <= 0;

              return (
                <div
                  key={producto.id}
                  className="group bg-neutral-900/90 border border-neutral-800/90 hover:border-amber-400/40 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col hover:shadow-[0_12px_30px_rgba(0,0,0,0.7),0_0_20px_rgba(201,162,75,0.12)] relative"
                >
                  {/* Badges superiores */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10 pointer-events-none">
                    <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded-full bg-neutral-950/80 border border-neutral-700 text-stone-300 backdrop-blur-sm">
                      {producto.duracion}
                    </span>

                    {enStock && (
                      <span className="badge-stock badge-in-stock">
                        En stock ({stockTotal} pzs)
                      </span>
                    )}
                    {bajoStock && (
                      <span className="badge-stock badge-low-stock animate-pulse">
                        Últimas {stockTotal} piezas
                      </span>
                    )}
                    {agotado && (
                      <span className="badge-stock badge-out-of-stock">
                        Agotado
                      </span>
                    )}
                  </div>

                  {/* Área del Iris interactivo */}
                  <Link
                    to={`/producto/${producto.id}`}
                    className="p-8 flex items-center justify-center bg-gradient-to-b from-neutral-950 to-neutral-900/60 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-radial-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <IrisRenderer
                      colorPrincipal={producto.hexPrincipal}
                      colorSecundario={producto.hexSecundario}
                      colorAcento={producto.hexAcento}
                      anilloLimbal={producto.anilloLimbal}
                      densidadFibras={producto.densidadFibras}
                      size={150}
                      hoverDilate={true}
                    />
                  </Link>

                  {/* Información del Modelo */}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1.5">
                      <span className="capitalize text-amber-400/90 font-medium">
                        Familia {producto.familia} · {producto.tonalidad}
                      </span>
                      <span>{producto.diametro}</span>
                    </div>

                    <Link to={`/producto/${producto.id}`} className="hover:text-amber-300 transition-colors">
                      <h3 className="font-serif text-xl font-bold text-neutral-100 mb-1.5 leading-snug">
                        {producto.nombre}
                      </h3>
                    </Link>

                    <p className="text-xs text-stone-400 leading-relaxed mb-4 line-clamp-2">
                      {producto.descripcion}
                    </p>

                    <div className="mt-auto pt-3 border-t border-neutral-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-stone-500 uppercase block">Par individual</span>
                        <span className="text-base sm:text-lg font-bold text-amber-200 font-sans">
                          {formatMXN(producto.precio)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Link
                          to={`/probador?modelo=${producto.id}`}
                          className="p-2 rounded-full bg-neutral-800 text-stone-300 hover:text-amber-300 hover:bg-neutral-700 transition-colors"
                          title="Probar en vivo con mi cámara en Eye Lab"
                        >
                          <Sparkles className="w-4 h-4" />
                        </Link>

                        <Link
                          to={`/producto/${producto.id}`}
                          className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 text-neutral-950 font-semibold text-xs hover:brightness-110 transition-all shadow-[0_2px_10px_rgba(201,162,75,0.25)]"
                        >
                          Elegir
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
