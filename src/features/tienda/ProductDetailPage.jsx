import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { IrisRenderer } from '../../components/common/IrisRenderer';
import { GRADUACIONES, formatMXN } from '../../data/productos';
import { ACCESORIOS } from '../../data/accesorios';
import { Sparkles, ArrowLeft, Clock, ShoppingBag } from 'lucide-react';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const productos = useStore((state) => state.productos);
  const agregarAlCarrito = useStore((state) => state.agregarAlCarrito);

  const producto = productos.find((p) => p.id === id) || productos[0];

  // Opciones de configuración
  const [tipoCompra, setTipoCompra] = useState('par');
  const [mismoOjo, setMismoOjo] = useState(true);
  const [od, setOd] = useState('0.00');
  const [oi, setOi] = useState('0.00');
  const [accesoriosSeleccionados, setAccesoriosSeleccionados] = useState([]);

  // Validar disponibilidad de stock en tiempo real para OD y OI
  const stockOD = producto.stockPorGraduacion?.[od] ?? 0;
  const stockOI = mismoOjo ? stockOD : (producto.stockPorGraduacion?.[oi] ?? 0);

  const odSinStock = stockOD <= 0;
  const oiSinStock = stockOI <= 0;
  const hayStockSuficiente = !odSinStock && !oiSinStock;

  // Manejar cambio en OD
  const handleOdChange = (e) => {
    const val = e.target.value;
    setOd(val);
    if (mismoOjo) setOi(val);
  };

  // Manejar toggle accesorio
  const toggleAccesorio = (accId) => {
    setAccesoriosSeleccionados((prev) =>
      prev.includes(accId) ? prev.filter((item) => item !== accId) : [...prev, accId]
    );
  };

  // Calcular precio total
  const totalCalculado = useMemo(() => {
    let base = producto.precio;
    if (tipoCompra === 'kit') base = producto.precioKit || producto.precio + 150;
    if (tipoCompra === 'pack_duo') base = producto.precio * 2 * 0.9;

    const costoAccesorios = accesoriosSeleccionados.reduce((sum, accId) => {
      const acc = ACCESORIOS.find((a) => a.id === accId);
      return sum + (acc ? acc.precio : 0);
    }, 0);

    return base + costoAccesorios;
  }, [producto, tipoCompra, accesoriosSeleccionados]);

  // Agregar al carrito
  const handleAddToCart = () => {
    if (!hayStockSuficiente) return;

    const itemToAdd = {
      productoId: producto.id,
      nombre: producto.nombre,
      tipoCompra: tipoCompra,
      od: od,
      oi: mismoOjo ? od : oi,
      precioUnitario: totalCalculado,
      accesorios: accesoriosSeleccionados.map((accId) => ACCESORIOS.find((a) => a.id === accId)),
      cantidad: 1,
      hexPrincipal: producto.hexPrincipal,
      hexSecundario: producto.hexSecundario,
    };

    agregarAlCarrito(itemToAdd);
    navigate('/checkout');
  };

  const horaActual = new Date().getHours();
  const textoEntrega =
    horaActual < 17
      ? 'Pide antes de las 18:00 y recibe mañana en Metro Pantitlán / Tepalcates o por DiDi en CDMX.'
      : 'Tu orden se preparará a primera hora de mañana para entrega inmediata.';

  const [vistaImagen, setVistaImagen] = useState('lente'); // 'lente' | 'incluye'

  return (
    <div className="bg-ink text-champagne pt-24 pb-20 min-h-screen gutter">
      <div className="w-full max-w-[1600px] mx-auto">
        {/* Enlace para volver */}
        <Link
          to="/"
          className="btn-link-thread text-[12px] uppercase tracking-[0.16em] mb-10 inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Catálogo</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* LADO IZQUIERDO: Visualizador del Iris o del Kit Incluido (Sticky en escritorio) */}
          <div className="lg:col-span-6 lg:sticky lg:top-24 flex flex-col gap-4">
            {/* Selector de Vista: Lente vs Kit Incluido */}
            <div className="flex items-center gap-2 p-1 rounded-xl bg-espresso border border-cocoa self-start">
              <button
                type="button"
                onClick={() => setVistaImagen('lente')}
                className={`px-3.5 py-1.5 rounded-lg text-xs transition-all font-medium ${
                  vistaImagen === 'lente'
                    ? 'bg-brass text-ink shadow-sm'
                    : 'text-stone hover:text-champagne'
                }`}
              >
                Diseño del Lente
              </button>
              <button
                type="button"
                onClick={() => setVistaImagen('incluye')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs transition-all font-medium ${
                  vistaImagen === 'incluye'
                    ? 'bg-brass text-ink shadow-sm'
                    : 'text-sand hover:text-gilt'
                }`}
              >
                <span> Incluye Gratis</span>
              </button>
            </div>

            <div className="w-full aspect-[4/3] sm:aspect-square max-h-[380px] rounded-[24px] overflow-hidden bg-espresso border border-cocoa flex items-center justify-center p-3 relative shadow-2xl">
              <div className="absolute top-4 left-4 z-10">
                <span className="px-3.5 py-1 rounded-full text-[11px] uppercase tracking-[0.2em] font-medium bg-ink/80 text-sand border border-cocoa">
                  {vistaImagen === 'lente' ? producto.duracion : 'Kit Oficial Incluido'}
                </span>
              </div>

              {/* Vista 1: Iris Macro */}
              {vistaImagen === 'lente' ? (
                <div className="w-full h-full flex items-center justify-center">
                  <IrisRenderer
                    producto={producto}
                    size={280}
                    hoverDilate={true}
                    className="w-full max-w-[300px]"
                  />
                  {/* Botón flotante para probar en el Eye Lab */}
                  <Link
                    to={`/probador?modelo=${producto.id}`}
                    className="absolute bottom-4 right-4 px-3.5 py-1.5 rounded-full bg-ink/90 border border-brass/30 text-[11px] text-champagne hover:text-gilt hover:border-brass transition-all flex items-center gap-1.5 backdrop-blur-md"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-brass" />
                    <span>Probar en vivo</span>
                  </Link>
                </div>
              ) : (
                /* Vista 2: Pupilentes AGO Incluye (Estuche + ReNu Fresh) */
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-2 relative">
                  <img
                    src="/img/fotos/empaque/pupilentes-ago-incluye.png"
                    alt="Pupilentes AGO Incluye Estuche y Solución ReNu"
                    className="w-full h-full max-h-[310px] object-contain drop-shadow-2xl"
                  />
                  <div className="absolute bottom-3 inset-x-4 p-2 rounded-xl bg-ink/90 border border-brass/30 text-[11px] text-champagne backdrop-blur-md shadow-lg">
                     Estuche hermético L/R + Solución ReNu Fresh (60ml) incluidos gratis
                  </div>
                </div>
              )}
            </div>

            {/* Ficha técnica mínima */}
            <div className="grid grid-cols-3 gap-4 text-center py-4 px-6 rounded-2xl bg-espresso border border-cocoa text-[12px]">
              <div>
                <span className="text-[10px] uppercase tracking-[0.18em] text-stone block mb-0.5">
                  Diámetro
                </span>
                <span className="font-sans font-medium text-champagne">
                  {producto.diametro || '14.2 mm'}
                </span>
              </div>
              <div className="border-x border-cocoa">
                <span className="text-[10px] uppercase tracking-[0.18em] text-stone block mb-0.5">
                  Curva base
                </span>
                <span className="font-sans font-medium text-champagne">
                  {producto.curvaBase || '8.6 mm'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-[0.18em] text-stone block mb-0.5">
                  Hidratación
                </span>
                <span className="font-sans font-medium text-champagne">
                  {producto.contenidoAgua || '38%'}
                </span>
              </div>
            </div>
          </div>

          {/* LADO DERECHO: Configuración limpia en columna editorial */}
          <div className="lg:col-span-6 flex flex-col gap-8">
            {/* Título y Precio */}
            <div className="border-b border-cocoa pb-6">
              <span className="text-[11px] uppercase tracking-[0.24em] text-sand font-medium block mb-2">
                Colección {producto.familia} · {producto.tonalidad}
              </span>
              <h1 className="font-serif text-[clamp(2.5rem,4.5vw,4.5rem)] text-champagne font-light leading-tight mb-3">
                {producto.nombre}
              </h1>
              <p className="text-[15px] text-stone leading-relaxed font-light mb-4">
                {producto.descripcion}
              </p>
              <div className="text-3xl font-serif text-champagne font-light">
                {formatMXN(totalCalculado)}
              </div>
            </div>

            {/* Configuración de Presentación */}
            <div className="flex flex-col gap-3">
              <span className="text-[11px] uppercase tracking-[0.2em] text-stone font-medium">
                1. Presentación
              </span>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'par', label: 'Par solo', precio: producto.precio },
                  { id: 'kit', label: 'Con kit solución', precio: producto.precioKit || producto.precio + 150 },
                  { id: 'pack_duo', label: 'Pack dúo (-10%)', precio: producto.precio * 2 * 0.9 },
                ].map((tipo) => (
                  <button
                    key={tipo.id}
                    onClick={() => setTipoCompra(tipo.id)}
                    className={`py-3 px-3 rounded-2xl text-[12px] border text-center transition-all ${
                      tipoCompra === tipo.id
                        ? 'bg-espresso border-brass text-champagne font-medium'
                        : 'bg-transparent border-cocoa text-stone hover:border-taupe'
                    }`}
                  >
                    <span className="block mb-0.5">{tipo.label}</span>
                    <span className="text-[11px] text-sand/80 font-mono">
                      {formatMXN(tipo.precio)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Configuración de Graduación por Ojo */}
            {producto.permiteGraduacion ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-sand font-medium">
                    2. Graduación (Miopía −0.50 a −8.00 o Plano)
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer text-[12px] text-sand">
                    <input
                      type="checkbox"
                      checked={mismoOjo}
                      onChange={(e) => {
                        setMismoOjo(e.target.checked);
                        if (e.target.checked) setOi(od);
                      }}
                      className="accent-brass rounded"
                    />
                    <span>Misma graduación en ambos ojos</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Ojo Derecho */}
                  <div className="p-4 rounded-2xl bg-espresso border border-cocoa flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="uppercase tracking-[0.16em] text-sand font-medium">
                        Ojo Derecho (OD)
                      </span>
                      <span className={odSinStock ? 'text-bad' : 'text-stone'}>
                        {odSinStock ? 'Agotado' : `${stockOD} pzs en stock`}
                      </span>
                    </div>
                    <select
                      value={od}
                      onChange={handleOdChange}
                      className="w-full bg-transparent border-b border-cocoa py-1.5 text-[14px] text-champagne focus:outline-none focus:border-brass cursor-pointer"
                    >
                      <option value="0.00" className="bg-espresso text-champagne">
                        0.00 · Sin graduación
                      </option>
                      {GRADUACIONES.filter((g) => g !== '0.00').map((grad) => {
                        const st = producto.stockPorGraduacion?.[grad] ?? 0;
                        return (
                          <option
                            key={grad}
                            value={grad}
                            className="bg-espresso text-champagne"
                          >
                            {grad} — Miopía {st <= 0 ? '(Sin stock)' : `(${st} disponibles)`}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Ojo Izquierdo */}
                  <div className="p-4 rounded-2xl bg-espresso border border-cocoa flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="uppercase tracking-[0.16em] text-sand font-medium">
                        Ojo Izquierdo (OI)
                      </span>
                      <span className={oiSinStock ? 'text-bad' : 'text-stone'}>
                        {oiSinStock ? 'Agotado' : `${stockOI} pzs en stock`}
                      </span>
                    </div>
                    <select
                      value={mismoOjo ? od : oi}
                      disabled={mismoOjo}
                      onChange={(e) => setOi(e.target.value)}
                      className="w-full bg-transparent border-b border-cocoa py-1.5 text-[14px] text-champagne focus:outline-none focus:border-brass cursor-pointer disabled:opacity-40"
                    >
                      <option value="0.00" className="bg-espresso text-champagne">
                        0.00 · Sin graduación
                      </option>
                      {GRADUACIONES.filter((g) => g !== '0.00').map((grad) => {
                        const st = producto.stockPorGraduacion?.[grad] ?? 0;
                        return (
                          <option
                            key={grad}
                            value={grad}
                            className="bg-espresso text-champagne"
                          >
                            {grad} — Miopía {st <= 0 ? '(Sin stock)' : `(${st} disponibles)`}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-espresso border border-cocoa flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-sand font-medium block mb-1">
                    Tipo de Producto
                  </span>
                  <strong className="text-champagne font-serif text-lg">
                    Accesorio de Cuidado Óptico
                  </strong>
                  <p className="text-xs text-stone mt-0.5">
                    Este producto es un kit o accesorio para la conservación de pupilentes.
                  </p>
                </div>
                <span className="px-3.5 py-1 rounded-full bg-brass/15 text-sand text-xs font-medium">
                  Accesorio Oficial
                </span>
              </div>
            )}

            {/* Accesorios opcionales */}
            <div className="flex flex-col gap-3">
              <span className="text-[11px] uppercase tracking-[0.2em] text-stone font-medium">
                3. Cuidados y Accesorios (Opcional)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ACCESORIOS.slice(0, 4).map((acc) => {
                  const isChecked = accesoriosSeleccionados.includes(acc.id);
                  return (
                    <div
                      key={acc.id}
                      onClick={() => toggleAccesorio(acc.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isChecked
                          ? 'bg-espresso border-brass/70 text-champagne'
                          : 'bg-transparent border-cocoa text-stone hover:border-taupe'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                            isChecked ? 'bg-brass border-brass text-ink font-bold' : 'border-stone/40'
                          }`}
                        >
                          {isChecked && ''}
                        </div>
                        <span className="text-[13px]">{acc.nombre}</span>
                      </div>
                      <span className="text-[12px] text-sand font-mono">
                        +{formatMXN(acc.precio)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Aviso de Entrega */}
            <div className="p-4 rounded-2xl bg-espresso border border-cocoa flex items-start gap-3 text-[13px] text-stone">
              <Clock className="w-4 h-4 text-brass shrink-0 mt-0.5" />
              <p className="leading-relaxed">{textoEntrega}</p>
            </div>

            {/* Botón de Agregar a Bolsa */}
            <div className="pt-2">
              <button
                type="button"
                disabled={!hayStockSuficiente}
                onClick={handleAddToCart}
                className="btn-brass w-full py-4 text-[14px] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {hayStockSuficiente
                    ? `Agregar a mi bolsa — ${formatMXN(totalCalculado)}`
                    : 'Graduación sin existencias'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
