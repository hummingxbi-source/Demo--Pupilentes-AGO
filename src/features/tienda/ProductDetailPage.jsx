import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { IrisRenderer } from '../../components/common/IrisRenderer';
import { GRADUACIONES, formatMXN, calcularStockTotal } from '../../data/productos';
import { ACCESORIOS } from '../../data/accesorios';
import { Sparkles, Check, AlertCircle, ShoppingBag, Truck, ShieldCheck, Heart, ArrowLeft, Clock } from 'lucide-react';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const productos = useStore((state) => state.productos);
  const agregarAlCarrito = useStore((state) => state.agregarAlCarrito);

  const producto = productos.find((p) => p.id === id) || productos[0];

  // Opciones de configuración
  const [tipoCompra, setTipoCompra] = useState('par'); // 'par' | 'kit' | 'pack_duo'
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
    if (tipoCompra === 'pack_duo') base = producto.precio * 2 * 0.9; // 10% desc

    // Sumar add-ons
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
      hexSecundario: producto.hexSecundario
    };

    agregarAlCarrito(itemToAdd);
    navigate('/checkout');
  };

  // Estimador de entrega según hora local
  const horaActual = new Date().getHours();
  const textoEntrega =
    horaActual < 17
      ? "¡Pide hoy antes de las 18:00 y recibe mañana en Metro Pantitlán / Tepalcates o por DiDi!"
      : "Tu pedido se preparará a primera hora de mañana para entrega inmediata.";

  return (
    <div className="bg-neutral-950 text-neutral-100 py-10 min-h-screen">
      <div className="container-custom">
        {/* Enlace para volver */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs text-stone-400 hover:text-amber-300 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Catálogo</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* LADO IZQUIERDO: Visualizador del Iris y Detalles Técnicos */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full bg-neutral-900/80 border border-amber-500/30 rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center relative shadow-2xl backdrop-blur-md">
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  {producto.duracion}
                </span>
              </div>

              {/* Iris interactivo ampliado */}
              <div className="my-6">
                <IrisRenderer
                  colorPrincipal={producto.hexPrincipal}
                  colorSecundario={producto.hexSecundario}
                  colorAcento={producto.hexAcento}
                  anilloLimbal={producto.anilloLimbal}
                  densidadFibras={producto.densidadFibras}
                  size={240}
                  hoverDilate={true}
                />
              </div>

              <div className="text-center">
                <h3 className="font-serif text-2xl font-bold text-amber-100 mb-1">
                  {producto.nombre}
                </h3>
                <p className="text-xs text-stone-400 font-mono tracking-wider uppercase">
                  Familia {producto.familia} · Tonalidad {producto.tonalidad}
                </p>
              </div>

              <div className="w-full mt-6 pt-6 border-t border-neutral-800 flex items-center justify-center gap-3">
                <Link
                  to={`/probador?modelo=${producto.id}`}
                  className="btn-outline-gold text-xs py-2 px-5 w-full flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Probar en mi rostro (Eye Lab)</span>
                </Link>
              </div>
            </div>

            {/* Ficha técnica */}
            <div className="w-full mt-6 bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5 text-xs text-stone-300 space-y-2.5">
              <div className="flex justify-between border-b border-neutral-800/80 pb-2">
                <span className="text-stone-500">Diámetro total:</span>
                <span className="font-mono font-medium">{producto.diametro || "14.2 mm"}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-800/80 pb-2">
                <span className="text-stone-500">Curva base:</span>
                <span className="font-mono font-medium">{producto.curvaBase || "8.6 mm"}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-800/80 pb-2">
                <span className="text-stone-500">Contenido en agua:</span>
                <span className="font-mono font-medium">{producto.contenidoAgua || "38%"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Anillo limbal:</span>
                <span className="font-medium text-amber-300">
                  {producto.anilloLimbal ? "Sí (Definición y aumento suave)" : "No (Ultra natural translúcido)"}
                </span>
              </div>
            </div>
          </div>

          {/* LADO DERECHO: Configurador de Graduación OD/OI, Accesorios y Compra */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <span className="text-xs uppercase tracking-widest text-amber-400 font-bold block mb-2">
                Configurador Sistematizado
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-100 mb-3">
                {producto.nombre}
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                {producto.descripcion}
              </p>
            </div>

            {/* Selector de Tipo de Compra */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider block">
                1. Selecciona tu presentación:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTipoCompra('par')}
                  className={`p-4 rounded-xl text-left border transition-all ${
                    tipoCompra === 'par'
                      ? 'bg-amber-400/15 border-amber-400 text-white shadow-[0_0_15px_rgba(201,162,75,0.2)]'
                      : 'bg-neutral-900 border-neutral-800 text-stone-400 hover:border-neutral-700'
                  }`}
                >
                  <span className="text-xs font-bold block text-neutral-100">Par Individual</span>
                  <span className="text-sm font-bold text-amber-300 font-sans block mt-1">
                    {formatMXN(producto.precio)}
                  </span>
                  <span className="text-[10px] text-stone-500 block">Incluye estuche básico</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTipoCompra('kit')}
                  className={`p-4 rounded-xl text-left border transition-all relative ${
                    tipoCompra === 'kit'
                      ? 'bg-amber-400/15 border-amber-400 text-white shadow-[0_0_15px_rgba(201,162,75,0.2)]'
                      : 'bg-neutral-900 border-neutral-800 text-stone-400 hover:border-neutral-700'
                  }`}
                >
                  <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-400 text-neutral-950">
                    Recomendado
                  </span>
                  <span className="text-xs font-bold block text-neutral-100">Kit Completo</span>
                  <span className="text-sm font-bold text-amber-300 font-sans block mt-1">
                    {formatMXN(producto.precioKit || producto.precio + 150)}
                  </span>
                  <span className="text-[10px] text-stone-400 block">+ Estuche joyero + Solución</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTipoCompra('pack_duo')}
                  className={`p-4 rounded-xl text-left border transition-all relative ${
                    tipoCompra === 'pack_duo'
                      ? 'bg-amber-400/15 border-amber-400 text-white shadow-[0_0_15px_rgba(201,162,75,0.2)]'
                      : 'bg-neutral-900 border-neutral-800 text-stone-400 hover:border-neutral-700'
                  }`}
                >
                  <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-400 text-neutral-950">
                    -10% Ahorro
                  </span>
                  <span className="text-xs font-bold block text-neutral-100">Pack Dúo (2 Pares)</span>
                  <span className="text-sm font-bold text-amber-300 font-sans block mt-1">
                    {formatMXN(producto.precio * 2 * 0.9)}
                  </span>
                  <span className="text-[10px] text-stone-400 block">Dos pares a tu medida</span>
                </button>
              </div>
            </div>

            {/* SELECCIÓN DE GRADUACIÓN INDEPENDIENTE OD / OI */}
            <div className="bg-neutral-900/80 border border-amber-500/20 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-amber-200">
                    2. Graduación por ojo (Miopía o Cosmético)
                  </h4>
                  <p className="text-xs text-stone-400">
                    Resuelve graduaciones distintas sin necesidad de confirmar por mensaje.
                  </p>
                </div>

                {/* Toggle mismo ojo */}
                <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-300 bg-neutral-950 px-3 py-1.5 rounded-full border border-neutral-800">
                  <input
                    type="checkbox"
                    checked={mismoOjo}
                    onChange={(e) => {
                      setMismoOjo(e.target.checked);
                      if (e.target.checked) setOi(od);
                    }}
                    className="accent-amber-400 cursor-pointer"
                  />
                  <span>Misma graduación en ambos ojos</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Ojo Derecho */}
                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-neutral-200">Ojo Derecho (OD)</span>
                    <span
                      className={`text-[11px] font-semibold ${
                        odSinStock ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {odSinStock ? 'Agotado' : `En stock (${stockOD} pzs)`}
                    </span>
                  </div>
                  <select
                    value={od}
                    onChange={handleOdChange}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-xs font-semibold text-neutral-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="0.00">0.00 (Cosmético / Sin aumento)</option>
                    {GRADUACIONES.filter((g) => g !== '0.00').map((grad) => {
                      const st = producto.stockPorGraduacion?.[grad] ?? 0;
                      return (
                        <option key={grad} value={grad}>
                          {grad} {st <= 0 ? '— (Sin stock)' : `— (${st} disponibles)`}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Ojo Izquierdo */}
                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-neutral-200">Ojo Izquierdo (OI)</span>
                    <span
                      className={`text-[11px] font-semibold ${
                        oiSinStock ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {oiSinStock ? 'Agotado' : `En stock (${stockOI} pzs)`}
                    </span>
                  </div>
                  <select
                    value={mismoOjo ? od : oi}
                    disabled={mismoOjo}
                    onChange={(e) => setOi(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-xs font-semibold text-neutral-100 focus:outline-none focus:border-amber-400 disabled:opacity-50"
                  >
                    <option value="0.00">0.00 (Cosmético / Sin aumento)</option>
                    {GRADUACIONES.filter((g) => g !== '0.00').map((grad) => {
                      const st = producto.stockPorGraduacion?.[grad] ?? 0;
                      return (
                        <option key={grad} value={grad}>
                          {grad} {st <= 0 ? '— (Sin stock)' : `— (${st} disponibles)`}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Alerta si no hay stock */}
              {!hayStockSuficiente && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    La graduación seleccionada no tiene piezas disponibles actualmente. Por favor elige otro valor cercano o contáctanos para reabasto urgente.
                  </span>
                </div>
              )}
            </div>

            {/* ACCESORIOS ADD-ONS */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider block">
                3. Añadir accesorios y cuidado (Opcional):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ACCESORIOS.slice(0, 4).map((acc) => {
                  const isChecked = accesoriosSeleccionados.includes(acc.id);
                  return (
                    <div
                      key={acc.id}
                      onClick={() => toggleAccesorio(acc.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isChecked
                          ? 'bg-amber-400/10 border-amber-400 text-white'
                          : 'bg-neutral-900/80 border-neutral-800 text-stone-400 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isChecked ? 'bg-amber-400 border-amber-400 text-black' : 'border-neutral-600'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <span className="text-xs font-semibold block text-neutral-200">
                            {acc.nombre}
                          </span>
                          <span className="text-[10px] text-stone-500">
                            {acc.categoria}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-300 font-sans">
                        +{formatMXN(acc.precio)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AVISO DE DISPONIBILIDAD DE ENTREGA */}
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-start gap-3 text-xs text-stone-300">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-200 mb-0.5">Disponibilidad para entrega hoy:</p>
                <p className="text-stone-400 leading-relaxed">{textoEntrega}</p>
              </div>
            </div>

            {/* RESUMEN Y BOTÓN AGREGAR */}
            <div className="p-5 rounded-2xl bg-neutral-900 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-stone-400 uppercase tracking-wider block">
                  Total configurado:
                </span>
                <span className="text-2xl font-bold text-amber-300 font-sans">
                  {formatMXN(totalCalculado)}
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={!hayStockSuficiente}
                  onClick={handleAddToCart}
                  className="btn-gold w-full sm:w-auto text-sm px-8 py-3.5 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(201,162,75,0.3)]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{hayStockSuficiente ? "Agregar al Carrito" : "Sin Stock para esa Graduación"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
