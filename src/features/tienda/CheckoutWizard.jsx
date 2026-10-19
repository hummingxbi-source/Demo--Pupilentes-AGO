import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { IrisRenderer } from '../../components/common/IrisRenderer';
import { formatMXN, GRADUACIONES } from '../../data/productos';
import { generarEnlaceWhatsApp } from '../../data/plantillas';
import confetti from 'canvas-confetti';
import {
  ShoppingBag,
  Trash2,
  Sparkles,
  MapPin,
  Truck,
  CreditCard,
  CheckCircle2,
  Copy,
  Upload,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
  Printer,
  Download,
  ExternalLink,
  MessageCircle,
  AlertCircle,
  ShieldCheck,
  X
} from 'lucide-react';
import { generarTicketPDF } from '../../lib/generarTicketPDF';

export const CheckoutWizard = () => {
  const navigate = useNavigate();

  // Store Zustand
  const carrito = useStore((state) => state.carrito);
  const actualizarCantidad = useStore((state) => state.actualizarCantidadCarrito);
  const actualizarItemCarrito = useStore((state) => state.actualizarItemCarrito);
  const eliminarItem = useStore((state) => state.eliminarDelCarrito);
  const cuponAplicado = useStore((state) => state.cuponAplicado);
  const aplicarCupon = useStore((state) => state.aplicarCupon);
  const removerCupon = useStore((state) => state.removerCupon);
  const puntosCanjeados = useStore((state) => state.puntosCanjeados);
  const canjearPuntos = useStore((state) => state.canjearPuntos);
  const clientaActual = useStore((state) => state.clientaActual);
  const ajustes = useStore((state) => state.ajustes);
  const crearPedido = useStore((state) => state.crearPedido);
  const showToast = useStore((state) => state.showToast);

  // Modal para ampliar Incluye Gratis
  const [mostrarModalKit, setMostrarModalKit] = useState(false);

  // Paso actual (1: Carrito, 2: Entrega, 3: Datos Guía, 4: Pago, 5: Confirmado)
  const [paso, setPaso] = useState(1);

  // Paso 1: Cupones y Puntos
  const [inputCupon, setInputCupon] = useState('');
  const [puntosAUsar, setPuntosAUsar] = useState(0);

  // Paso 2: Método de Entrega
  const [metodoEntrega, setMetodoEntrega] = useState('entrega_personal'); // 'entrega_personal' | 'didi' | 'paqueteria'
  const [estacionMetro, setEstacionMetro] = useState('Metro Pantitlán');
  const [fechaEntregaMetro, setFechaEntregaMetro] = useState('Mañana sábado 18-oct · 15:30 hrs');
  const [didiDireccion, setDidiDireccion] = useState('Av. Cuauhtémoc 320, Roma Sur, CDMX');
  const [didiCosto, setDidiCosto] = useState(85.00);

  // Paquetería cotizador simulado
  const [cp, setCp] = useState('06700');
  const [colonia, setColonia] = useState('Roma Norte');
  const [cotizandoPaqueteria, setCotizandoPaqueteria] = useState(false);
  const [opcionPaqueteria, setOpcionPaqueteria] = useState({
    nombre: 'Estafeta Estándar (3 a 5 días)',
    costo: 125.00
  });

  // Paso 3: Datos de Guía
  const [nombreRecibe, setNombreRecibe] = useState(clientaActual.nombre || 'Valeria Morales');
  const [telefonoRecibe, setTelefonoRecibe] = useState(clientaActual.telefono || '55 4192 8831');
  const [emailRecibe, setEmailRecibe] = useState(clientaActual.email || 'valeria.morales@gmail.com');
  const [calleNumero, setCalleNumero] = useState('Álvaro Obregón 154, Int 3B');
  const [referencias, setReferencias] = useState('Fachada beige con reja negra, portón derecho');

  // Paso 4: Pago y Comprobante
  const [comprobanteImg, setComprobanteImg] = useState(null);
  const [bancoSeleccionado, setBancoSeleccionado] = useState('BBVA México');
  const [copiadoClabe, setCopiadoClabe] = useState(false);
  const [comprobanteEnviadoPorWa, setComprobanteEnviadoPorWa] = useState(false);

  // Paso 5: Pedido Confirmado
  const [pedidoCreado, setPedidoCreado] = useState(null);

  // Calcular totales
  const subtotalProductos = carrito.reduce(
    (sum, item) => sum + item.precioUnitario * item.cantidad,
    0
  );

  let montoDescuentoCupon = 0;
  if (cuponAplicado) {
    if (cuponAplicado.porcentaje) {
      montoDescuentoCupon = (subtotalProductos * cuponAplicado.porcentaje) / 100;
    } else if (cuponAplicado.valorFijo) {
      montoDescuentoCupon = cuponAplicado.valorFijo;
    }
  }

  const descuentoPuntos = Math.floor(puntosCanjeados / 3); // 300 pts = $100

  let costoEnvio = 0;
  if (metodoEntrega === 'entrega_personal') {
    costoEnvio = estacionMetro.includes('Otra estación') ? 45.00 : 0.00;
  } else if (metodoEntrega === 'didi') {
    costoEnvio = didiCosto;
  } else if (metodoEntrega === 'paqueteria') {
    costoEnvio = opcionPaqueteria.costo;
  }

  const granTotal = Math.max(0, subtotalProductos - montoDescuentoCupon - descuentoPuntos + costoEnvio);

  // Simular cotización de paquetería con delay realista
  const cotizarEnvioPaqueteria = () => {
    if (!cp || cp.length < 5) return;
    setCotizandoPaqueteria(true);
    // SIMULADO — en producción conectar a agregador de paquetería vía API (ej. EnviaYa / Skydropx / 99Minutos)
    setTimeout(() => {
      setCotizandoPaqueteria(false);
      const esCdmx = cp.startsWith('0') || cp.startsWith('1');
      if (esCdmx) {
        setOpcionPaqueteria({ nombre: 'Estafeta Local CDMX (24 a 48 hrs)', costo: 95.00 });
      } else {
        setOpcionPaqueteria({ nombre: 'FedEx Nacional Estándar (3 a 5 días)', costo: 145.00 });
      }
      showToast('Opciones de paquetería actualizadas para tu Código Postal', 'info');
    }, 600);
  };

  // Copiar CLABE
  const copiarClabe = (clabe) => {
    navigator.clipboard.writeText(clabe);
    setCopiadoClabe(true);
    showToast('CLABE copiada al portapapeles ', 'success');
    setTimeout(() => setCopiadoClabe(false), 3000);
  };

  // Subir Comprobante simulado
  const handleSubirComprobante = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setComprobanteImg(event.target.result);
        showToast('Comprobante cargado correctamente', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // Confirmar y Crear Pedido
  const finalizarCompra = () => {
    const nuevoPedido = crearPedido({
      clientaNombre: nombreRecibe,
      telefono: telefonoRecibe,
      email: emailRecibe,
      canal: 'tienda_online',
      metodoEntrega: metodoEntrega,
      estacionMetro: metodoEntrega === 'entrega_personal' ? estacionMetro : undefined,
      horarioPactado: metodoEntrega === 'entrega_personal' ? fechaEntregaMetro : undefined,
      direccionEnvio: {
        calle: calleNumero,
        colonia: colonia,
        cp: cp,
        referencias: referencias
      },
      paqueteriaNombre: metodoEntrega === 'paqueteria' ? opcionPaqueteria.nombre : undefined,
      items: carrito.map((item) => ({
        productoId: item.productoId,
        nombre: item.nombre,
        od: item.od,
        oi: item.oi,
        tipoCompra: item.tipoCompra,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario
      })),
      subtotal: subtotalProductos,
      descuento: montoDescuentoCupon + descuentoPuntos,
      costoEnvio: costoEnvio,
      total: granTotal,
      bancoEmisor: bancoSeleccionado,
      estado: 'verificar_comprobante',
      comprobantePorWhatsApp: true,
      comprobanteUrl: comprobanteImg ? 'comprobante_subido_clienta.jpg' : 'whatsapp_pendiente_revision',
      notas: `Pedido online · Comprobante por WhatsApp · Entrega: ${metodoEntrega}`
    });

    setPedidoCreado(nuevoPedido);
    setPaso(5);

    // Disparar confetti de celebración
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // Ignorar si confetti falla
    }
  };

  // Imprimir ticket o comprobante en PDF
  const imprimirTicket = () => {
    if (pedidoCreado) {
      generarTicketPDF(pedidoCreado);
    } else {
      window.print();
    }
  };

  // Si el carrito está vacío y no estamos en confirmación
  if (carrito.length === 0 && paso !== 5) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-ink text-champagne">
        <div className="w-16 h-16 rounded-full bg-espresso border border-cocoa flex items-center justify-center text-sand mb-4 shadow-xl">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <h2 className="font-serif text-3xl font-light text-champagne mb-2">Tu bolsa está vacía</h2>
        <p className="text-[14px] text-stone max-w-sm mb-6 font-light">
          Aún no has agregado ningún modelo de pupilentes o accesorio a tu orden.
        </p>
        <Link to="/" className="btn-brass text-xs px-6 py-3">
          Ver Catálogo y Elegir Modelo
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-ink text-champagne pt-24 pb-20 min-h-screen gutter">
      <div className="w-full max-w-[1600px] mx-auto">
        {/* Barra de progreso de 5 pasos */}
        <div className="mb-10">
          {/* Móvil: paso actual legible; escritorio: los 5 pasos */}
          <div className="sm:hidden flex items-baseline justify-between mb-3 px-1">
            <span className="font-serif text-xl text-champagne">{['Tu bolsa', 'Entrega', 'Tus datos', 'Pago', 'Listo'][paso - 1]}</span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-stone">Paso {paso} de 5</span>
          </div>
          <div className="hidden sm:flex items-center justify-between text-[11px] uppercase tracking-[0.18em] font-medium text-stone mb-3 px-1">
            {['Bolsa', 'Entrega', 'Datos', 'Pago', 'Listo'].map((l, i) => (
              <span key={l} className={paso >= i + 1 ? 'text-sand' : ''}>{i + 1}. {l}</span>
            ))}
          </div>

          <div className="w-full h-[2px] bg-cocoa overflow-hidden">
            <div
              className="h-full bg-brass transition-all duration-500"
              style={{ width: `${(paso / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* CONTENIDO DEL WIZARD SEGÚN PASO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* COLUMNA PRINCIPAL */}
          <div className="lg:col-span-8">
            {/* PASO 1: CARRITO */}
            {paso === 1 && (
              <div className="bg-espresso border border-cocoa rounded-[24px] p-6 sm:p-8 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                  <h2 className="font-serif text-2xl font-bold text-amber-200">
                    Tu Carrito de Compra ({carrito.length} modelo(s))
                  </h2>
                  <Link to="/" className="text-xs text-amber-400 hover:underline">
                    + Seguir comprando
                  </Link>
                </div>

                <div className="divide-y divide-neutral-800">
                  {carrito.map((item) => {
                    const esDiferente = item.od !== item.oi;

                    return (
                      <div key={item.cartItemId} className="py-5 space-y-3.5">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3.5">
                            <IrisRenderer
                              colorPrincipal={item.hexPrincipal || "#D4A345"}
                              colorSecundario={item.hexSecundario || "#8F641B"}
                              size={56}
                            />
                            <div>
                              <h4 className="text-sm font-bold text-neutral-100">{item.nombre}</h4>
                              <span className="text-[11px] text-stone-400 block font-mono">
                                OD: {item.od || '0.00'} | OI: {item.oi || '0.00'} ({item.tipoCompra})
                              </span>
                              <span className="text-xs font-bold text-amber-300 font-sans">
                                {formatMXN(item.precioUnitario)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Selector de cantidad */}
                            <div className="flex items-center border border-neutral-700 rounded-lg bg-neutral-950">
                              <button
                                type="button"
                                onClick={() => actualizarCantidad(item.cartItemId, item.cantidad - 1)}
                                className="px-2.5 py-1 text-xs text-stone-300 hover:text-white"
                              >
                                −
                              </button>
                              <span className="px-2 text-xs font-mono font-bold">{item.cantidad}</span>
                              <button
                                type="button"
                                onClick={() => actualizarCantidad(item.cartItemId, item.cantidad + 1)}
                                className="px-2.5 py-1 text-xs text-stone-300 hover:text-white"
                              >
                                +
                              </button>
                            </div>

                            {/* Botón eliminar */}
                            <button
                              type="button"
                              onClick={() => eliminarItem(item.cartItemId)}
                              className="p-1.5 text-stone-500 hover:text-rose-400 transition-colors"
                              title="Eliminar del carrito"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Configuración de Graduación: Mismo ojo vs Diferente por ojo */}
                        <div className="p-3 rounded-xl bg-ink/70 border border-cocoa/70 space-y-2.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[11px] uppercase tracking-wider text-sand font-medium">
                              Graduación Óptica:
                            </span>

                            {/* Toggle Mismo / Diferente */}
                            <div className="flex items-center gap-1 bg-espresso p-0.5 rounded-lg border border-cocoa text-[11px]">
                              <button
                                type="button"
                                onClick={() => {
                                  actualizarItemCarrito(item.cartItemId, { oi: item.od || '0.00' });
                                }}
                                className={`px-2.5 py-0.5 rounded transition-all font-medium ${
                                  !esDiferente ? 'bg-brass text-ink font-bold shadow-sm' : 'text-stone hover:text-champagne'
                                }`}
                              >
                                Mismo para ambos ojos
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (!esDiferente) {
                                    actualizarItemCarrito(item.cartItemId, { oi: item.oi || '-1.00' });
                                  }
                                }}
                                className={`px-2.5 py-0.5 rounded transition-all font-medium ${
                                  esDiferente ? 'bg-brass text-ink font-bold shadow-sm' : 'text-stone hover:text-champagne'
                                }`}
                              >
                                Diferente por ojo
                              </button>
                            </div>
                          </div>

                          {/* Selectores OD y OI */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div>
                              <label className="text-[11px] text-stone block mb-1 font-medium">
                                Ojo Derecho (OD):
                              </label>
                              <select
                                value={item.od || '0.00'}
                                onChange={(e) => {
                                  const nuevoOd = e.target.value;
                                  actualizarItemCarrito(item.cartItemId, {
                                    od: nuevoOd,
                                    oi: !esDiferente ? nuevoOd : item.oi
                                  });
                                }}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-espresso border border-cocoa text-champagne text-xs font-mono focus:border-brass focus:outline-none"
                              >
                                <option value="0.00">Sin graduación (estético) 0.00</option>
                                {GRADUACIONES.filter((g) => g !== '0.00').map((grad) => (
                                  <option key={`od-${grad}`} value={grad}>
                                    {grad}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {esDiferente ? (
                              <div>
                                <label className="text-[11px] text-stone block mb-1 font-medium">
                                  Ojo Izquierdo (OI):
                                </label>
                                <select
                                  value={item.oi || '0.00'}
                                  onChange={(e) => {
                                    actualizarItemCarrito(item.cartItemId, { oi: e.target.value });
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-espresso border border-cocoa text-champagne text-xs font-mono focus:border-brass focus:outline-none"
                                >
                                  <option value="0.00">Sin graduación (estético) 0.00</option>
                                  {GRADUACIONES.filter((g) => g !== '0.00').map((grad) => (
                                    <option key={`oi-${grad}`} value={grad}>
                                      {grad}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            ) : (
                              <div className="flex items-center text-[11px] text-emerald-400/90 pt-3">
                                <span> Ambos ojos graduados en {item.od === '0.00' ? 'Plano (Sin graduación)' : item.od}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Banner Oficial: ¡Tu Compra Incluye Sin Costo! (Imagen en proporción vertical 3:4 nítida) */}
                <div className="p-5 rounded-2xl bg-espresso border border-cocoa flex flex-col sm:flex-row items-center gap-5 shadow-lg">
                  <div
                    onClick={() => setMostrarModalKit(true)}
                    className="w-32 sm:w-40 aspect-[3/4] rounded-2xl overflow-hidden bg-black border border-brass/40 shrink-0 flex items-center justify-center p-2 shadow-xl cursor-pointer group hover:border-brass hover:scale-[1.02] transition-all"
                    title="Clic para ver en detalle"
                  >
                    <img
                      src="/img/fotos/empaque/pupilentes-ago-incluye.png"
                      alt="Kit oficial incluido Pupilentes AGO"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
                    />
                  </div>
                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brass/20 text-gilt border border-brass/30">
                         Incluido Gratis con tu Compra
                      </span>
                      <span className="text-xs text-emerald-400 font-semibold">$0 MXN</span>
                    </div>
                    <h5 className="font-serif text-lg text-champagne">
                      Estuche Hermético R/L + Solución ReNu Fresh Bausch & Lomb (60ml)
                    </h5>
                    <p className="text-xs text-stone font-light leading-relaxed">
                      Cada par de pupilentes incluye su kit estéril oficial completo listo para usar desde el primer instante.
                    </p>
                    <button
                      type="button"
                      onClick={() => setMostrarModalKit(true)}
                      className="text-xs text-brass hover:text-champagne transition-colors underline decoration-brass/50 font-medium inline-block"
                    >
                      Ver accesorios en grande 
                    </button>
                  </div>
                </div>

                {/* Cupón y Canje de Puntos */}
                <div className="pt-4 border-t border-neutral-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Cupón */}
                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                    <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block mb-2">
                      ¿Tienes un cupón?
                    </span>
                    {cuponAplicado ? (
                      <div className="flex items-center justify-between text-xs text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/30">
                        <span> Cupón {cuponAplicado.codigo} activo</span>
                        <button onClick={removerCupon} className="text-stone-400 hover:text-white text-xs">
                          Quitar
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={inputCupon}
                          onChange={(e) => setInputCupon(e.target.value)}
                          placeholder="Ej. AGOPRIMERA"
                          className="w-full px-3 py-1.5 text-xs rounded-lg bg-neutral-900 border border-neutral-700 text-white uppercase focus:outline-none focus:border-amber-400"
                        />
                        <button
                          type="button"
                          onClick={() => aplicarCupon(inputCupon)}
                          className="btn-outline-gold text-xs py-1.5 px-3"
                        >
                          Aplicar
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Puntos AGO */}
                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                        Puntos AGO ({clientaActual.puntos} pts)
                      </span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    {puntosCanjeados > 0 ? (
                      <div className="flex items-center justify-between text-xs text-amber-300 bg-amber-500/10 p-2 rounded-lg border border-amber-500/30">
                        <span>{puntosCanjeados} puntos canjeados (-{formatMXN(descuentoPuntos)})</span>
                        <button onClick={() => canjearPuntos(0)} className="text-stone-400 hover:text-white text-xs">
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={clientaActual.puntos < 100}
                        onClick={() => canjearPuntos(Math.min(300, clientaActual.puntos))}
                        className="w-full py-1.5 text-xs rounded-lg bg-neutral-900 border border-neutral-700 hover:border-amber-400 text-amber-300 font-medium transition-colors disabled:opacity-40"
                      >
                        {clientaActual.puntos >= 100 ? "Canjear puntos disponibles (-$100)" : "Acumulas puntos al finalizar"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setPaso(2)}
                    className="btn-brass text-xs px-8 py-3 flex items-center gap-2"
                  >
                    <span>Continuar a Entrega</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* PASO 2: MÉTODO DE ENTREGA */}
            {paso === 2 && (
              <div className="bg-neutral-900/90 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-6">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-amber-200 mb-1">
                    Selecciona tu Método de Entrega
                  </h2>
                  <p className="text-xs text-stone-400">
                    Entregas personales y envíos seguros a toda la República.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Tarjeta 1: Entrega Personal Metro */}
                  <div
                    onClick={() => setMetodoEntrega('entrega_personal')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      metodoEntrega === 'entrega_personal'
                        ? 'bg-amber-400/15 border-amber-400 shadow-[0_0_15px_rgba(201,162,75,0.2)]'
                        : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-emerald-400" />
                        <h4 className="text-sm font-bold text-neutral-100">
                          Entrega Personal en Metro CDMX
                        </h4>
                      </div>
                      <span className="text-xs font-bold text-emerald-400">
                        Pantitlán / Tepalcates: GRATIS ($0)
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mb-1.5">
                      Pacta día y hora para recoger tus pupilentes en torniquetes de Metro Pantitlán o Tepalcates.
                    </p>
                    <p className="text-[11px] text-stone-400 font-light mb-3">
                       Horarios disponibles: {ajustes?.horariosEntrega?.find((h) => h.id === 'metro')?.horarios?.join(' · ') || '10:00–14:00 · 15:00–19:00'}
                    </p>

                    {metodoEntrega === 'entrega_personal' && (
                      <div className="mt-3 pt-3 border-t border-neutral-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-stone-400 block mb-1">Estación de entrega:</label>
                          <select
                            value={estacionMetro}
                            onChange={(e) => setEstacionMetro(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-neutral-100 focus:outline-none focus:border-amber-400"
                          >
                            <option value="Metro Pantitlán">Metro Pantitlán (L1, L5, L9, LA) — $0 MXN</option>
                            <option value="Metro Tepalcates">Metro Tepalcates (Línea A) — $0 MXN</option>
                            <option value="Otra estación (+45 MXN)">Otra estación de la red — +$45 MXN</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] text-stone-400 block mb-1">Horario preferido:</label>
                          <input
                            type="text"
                            value={fechaEntregaMetro}
                            onChange={(e) => setFechaEntregaMetro(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-neutral-100 focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tarjeta 2: DiDi */}
                  <div
                    onClick={() => setMetodoEntrega('didi')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      metodoEntrega === 'didi'
                        ? 'bg-amber-400/15 border-amber-400 shadow-[0_0_15px_rgba(201,162,75,0.2)]'
                        : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Truck className="w-5 h-5 text-blue-400" />
                        <h4 className="text-sm font-bold text-neutral-100">
                          Envío Express por DiDi (Mismo Día en CDMX)
                        </h4>
                      </div>
                      <span className="text-xs font-bold text-blue-400">
                        {formatMXN(didiCosto)} (Estimado)
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mb-1.5">
                      Recibe en tu puerta en menos de 90 minutos.
                    </p>
                    <p className="text-[11px] text-stone-400 font-light mb-2">
                       Horarios disponibles: {ajustes?.horariosEntrega?.find((h) => h.id === 'didi')?.horarios?.join(' · ') || 'Cualquier hora con 2h de aviso'}
                    </p>
                    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300">
                       <strong>Regla del negocio:</strong> El costo del DiDi y los pupilentes se pagan por transferencia antes de solicitar la unidad.
                    </div>
                  </div>

                  {/* Tarjeta 3: Paquetería */}
                  <div
                    onClick={() => setMetodoEntrega('paqueteria')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      metodoEntrega === 'paqueteria'
                        ? 'bg-amber-400/15 border-amber-400 shadow-[0_0_15px_rgba(201,162,75,0.2)]'
                        : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Truck className="w-5 h-5 text-amber-400" />
                        <h4 className="text-sm font-bold text-neutral-100">
                          Paquetería con Guía Rastreada (Todo México)
                        </h4>
                      </div>
                      <span className="text-xs font-bold text-amber-300">
                        {formatMXN(opcionPaqueteria.costo)}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mb-1.5">
                      Estafeta, FedEx o DHL con número de guía oficial y seguro de envío.
                    </p>
                    <p className="text-[11px] text-stone-400 font-light mb-3">
                       Horarios disponibles: {ajustes?.horariosEntrega?.find((h) => h.id === 'paqueteria')?.horarios?.join(' · ') || 'Lunes a viernes, recolección antes de 13:00'}
                    </p>

                    {metodoEntrega === 'paqueteria' && (
                      <div className="mt-3 pt-3 border-t border-neutral-800 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[11px] text-stone-400 block mb-1">Código Postal:</label>
                            <input
                              type="text"
                              value={cp}
                              onChange={(e) => setCp(e.target.value)}
                              placeholder="Ej. 06700"
                              className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-neutral-100"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-stone-400 block mb-1">Colonia:</label>
                            <input
                              type="text"
                              value={colonia}
                              onChange={(e) => setColonia(e.target.value)}
                              placeholder="Colonia"
                              className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-neutral-100"
                            />
                          </div>
                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={cotizarEnvioPaqueteria}
                              className="w-full btn-outline-gold text-xs py-2 px-3"
                            >
                              {cotizandoPaqueteria ? "Cotizando..." : "Cotizar CP"}
                            </button>
                          </div>
                        </div>

                        {/* Opciones disponibles */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div
                            onClick={() => setOpcionPaqueteria({ nombre: 'Estafeta Estándar (3 a 5 días)', costo: 125.00 })}
                            className={`p-2.5 rounded-lg border cursor-pointer ${
                              opcionPaqueteria.costo === 125
                                ? 'bg-amber-400/20 border-amber-400 text-amber-200'
                                : 'bg-neutral-900 border-neutral-800 text-stone-400'
                            }`}
                          >
                            <span className="font-bold block">Estafeta Estándar (3-5 días)</span>
                            <span className="font-mono">$125.00 MXN</span>
                          </div>
                          <div
                            onClick={() => setOpcionPaqueteria({ nombre: 'DHL Express (24 a 48 hrs)', costo: 185.00 })}
                            className={`p-2.5 rounded-lg border cursor-pointer ${
                              opcionPaqueteria.costo === 185
                                ? 'bg-amber-400/20 border-amber-400 text-amber-200'
                                : 'bg-neutral-900 border-neutral-800 text-stone-400'
                            }`}
                          >
                            <span className="font-bold block">DHL Express (24-48 hrs)</span>
                            <span className="font-mono">$185.00 MXN</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setPaso(1)}
                    className="btn-ghost text-xs px-5 py-2.5"
                  >
                    Volver a Carrito
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaso(3)}
                    className="btn-brass text-xs px-8 py-3 flex items-center gap-2"
                  >
                    <span>Continuar a Datos</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* PASO 3: DATOS PARA LA GUÍA */}
            {paso === 3 && (
              <div className="bg-espresso border border-cocoa rounded-[24px] p-6 sm:p-8 shadow-xl space-y-6">
                <div>
                  <h2 className="font-serif text-2xl font-light text-champagne mb-1">
                    Datos de Entrega y Contacto
                  </h2>
                  <p className="text-xs text-stone-400">
                    Información para generar la guía de paquetería o coordinar la entrega personal.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-stone-300 block mb-1 font-medium">
                        Nombre completo de quien recibe:
                      </label>
                      <input
                        type="text"
                        value={nombreRecibe}
                        onChange={(e) => setNombreRecibe(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-700 text-xs text-neutral-100 focus:outline-none focus:border-amber-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs text-stone-300 block mb-1 font-medium">
                        Teléfono / WhatsApp de contacto:
                      </label>
                      <input
                        type="text"
                        value={telefonoRecibe}
                        onChange={(e) => setTelefonoRecibe(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-700 text-xs text-neutral-100 focus:outline-none focus:border-amber-400"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-stone-300 block mb-1 font-medium">
                      Correo electrónico para recibir el folio y tracking:
                    </label>
                    <input
                      type="email"
                      value={emailRecibe}
                      onChange={(e) => setEmailRecibe(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-700 text-xs text-neutral-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {metodoEntrega !== 'entrega_personal' && (
                    <>
                      <div>
                        <label className="text-xs text-stone-300 block mb-1 font-medium">
                          Calle, número exterior e interior:
                        </label>
                        <input
                          type="text"
                          value={calleNumero}
                          onChange={(e) => setCalleNumero(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-700 text-xs text-neutral-100 focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-stone-300 block mb-1 font-medium">
                            Colonia / Fraccionamiento:
                          </label>
                          <input
                            type="text"
                            value={colonia}
                            onChange={(e) => setColonia(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-700 text-xs text-neutral-100 focus:outline-none focus:border-amber-400"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-stone-300 block mb-1 font-medium">
                            Código Postal:
                          </label>
                          <input
                            type="text"
                            value={cp}
                            onChange={(e) => setCp(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-700 text-xs text-neutral-100 focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-stone-300 block mb-1 font-medium">
                          Referencias del domicilio (color de casa, entre calles):
                        </label>
                        <input
                          type="text"
                          value={referencias}
                          onChange={(e) => setReferencias(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-700 text-xs text-neutral-100 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setPaso(2)}
                    className="btn-ghost text-xs px-5 py-2.5"
                  >
                    Volver a Entrega
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaso(4)}
                    className="btn-brass text-xs px-8 py-3 flex items-center gap-2"
                  >
                    <span>Continuar a Pago</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* PASO 4: PAGO Y COMPROBANTE */}
            {paso === 4 && (
              <div className="bg-espresso border border-cocoa rounded-[24px] p-6 sm:p-8 shadow-xl space-y-6">
                <div>
                  <h2 className="font-serif text-2xl font-light text-champagne mb-1">
                    Cuentas de Pago y Envío de Comprobante
                  </h2>
                  <p className="text-xs text-stone-400">
                    Realiza tu transferencia por el monto exacto y comparte tu comprobante por WhatsApp para su validación en menos de 24 horas.
                  </p>
                </div>

                {/* Cuentas bancarias configuradas */}
                <div className="space-y-3">
                  {ajustes.cuentasPago.map((cuenta) => (
                    <div
                      key={cuenta.banco}
                      onClick={() => setBancoSeleccionado(cuenta.banco)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        bancoSeleccionado === cuenta.banco
                          ? 'bg-amber-400/10 border-amber-400 shadow-md'
                          : 'bg-neutral-950 border-neutral-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-amber-300 font-mono">
                          {cuenta.banco} — {cuenta.tipo}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copiarClabe(cuenta.numero);
                          }}
                          className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-white bg-neutral-900 px-2 py-1 rounded border border-neutral-700"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiadoClabe ? "¡Copiada!" : "Copiar CLABE"}</span>
                        </button>
                      </div>

                      <div className="text-xs text-stone-300 font-mono tracking-wider mb-1">
                        CLABE: <span className="font-bold text-white select-all">{cuenta.numero}</span>
                      </div>
                      <div className="text-[11px] text-stone-400">
                        Titular: <strong>{cuenta.titular}</strong> | Concepto: <strong>{nombreRecibe.split(' ')[0]} AGO</strong>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sección de Envío de Comprobante por WhatsApp */}
                <div className="p-6 rounded-2xl bg-neutral-950 border border-brass/40 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366] mx-auto shadow-md">
                    <MessageCircle className="w-6 h-6 fill-current" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-champagne">
                      Envío de Comprobante por WhatsApp
                    </h4>
                    <p className="text-xs text-stone-400 max-w-md mx-auto">
                      Realiza tu transferencia SPEI y envíanos la captura de pantalla por WhatsApp para validar tu pago y apartar tu pedido.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
                    <a
                      href={generarEnlaceWhatsApp(
                        ajustes.telefonoWhatsApp,
                        `¡Hola Pupilentes AGO! Les comparto el comprobante de mi orden por ${formatMXN(granTotal)}. Mi nombre es ${nombreRecibe} (Tel: ${telefonoRecibe}).`
                      )}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setComprobanteEnviadoPorWa(true)}
                      className="btn-brass text-xs px-6 py-3 w-full sm:w-auto flex items-center justify-center gap-2 !bg-[#25D366] !text-black font-semibold shadow-lg hover:brightness-110"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                      <span>Abrir WhatsApp y Enviar Comprobante</span>
                    </a>
                  </div>

                  <label className="flex items-center justify-center gap-2 cursor-pointer pt-2 text-xs text-sand">
                    <input
                      type="checkbox"
                      checked={comprobanteEnviadoPorWa}
                      onChange={(e) => setComprobanteEnviadoPorWa(e.target.checked)}
                      className="accent-brass rounded w-4 h-4"
                    />
                    <span>Confirmo que enviaré o ya envié mi comprobante por WhatsApp</span>
                  </label>

                  <div className="text-[11px] text-stone-500">
                     Validación en menos de 24 horas garantizada por nuestro equipo.
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setPaso(3)}
                    className="btn-ghost text-xs px-5 py-2.5"
                  >
                    Volver a Datos
                  </button>
                  <button
                    type="button"
                    onClick={finalizarCompra}
                    className="btn-brass text-xs px-8 py-3.5 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmar y Finalizar Pedido</span>
                  </button>
                </div>
              </div>
            )}

            {/* PASO 5: CONFIRMACIÓN Y SALA DE ESPERA */}
            {paso === 5 && pedidoCreado && (
              <div className="bg-espresso border border-cocoa rounded-[24px] p-6 sm:p-10 shadow-2xl space-y-6 text-center animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-brass/20 border border-brass/40 flex items-center justify-center text-champagne mx-auto">
                  <CheckCircle2 className="w-8 h-8 stroke-[1.5]" />
                </div>

                <div>
                  <span className="text-xs uppercase tracking-widest text-amber-400 font-bold block mb-1">
                    ¡Orden Registrada con Éxito!
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-amber-100 mb-2">
                    Folio de Pedido: #{pedidoCreado.id}
                  </h2>
                  <div className="inline-block px-4 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium mb-3">
                    Pendiente de Validación · En menos de 24 hrs
                  </div>
                  <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto leading-relaxed">
                    Hemos registrado tu orden y apartado tu stock. Recuerda enviar tu comprobante por WhatsApp para que nuestro equipo valide tu pago y prepare tu entrega.
                  </p>
                </div>

                {/* Ticket descargable / imprimible */}
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 text-left text-xs font-mono max-w-md mx-auto space-y-2">
                  <div className="text-center border-b border-neutral-800 pb-2">
                    <span className="font-bold text-amber-300 block">PUPILENTES AGO · CDMX</span>
                    <span className="text-[10px] text-stone-500">Orden de Compra / Guía #{pedidoCreado.id}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-stone-500">Cliente:</span>
                    <span className="text-white">{pedidoCreado.clientaNombre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Teléfono:</span>
                    <span className="text-white">{pedidoCreado.telefono}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Entrega:</span>
                    <span className="text-amber-300 capitalize">{pedidoCreado.metodoEntrega.replace('_', ' ')}</span>
                  </div>
                  {pedidoCreado.estacionMetro && (
                    <div className="flex justify-between">
                      <span className="text-stone-500">Estación:</span>
                      <span className="text-white">{pedidoCreado.estacionMetro}</span>
                    </div>
                  )}
                  <div className="border-t border-neutral-800 pt-2 flex justify-between font-bold text-sm">
                    <span className="text-white">TOTAL DE ORDEN:</span>
                    <span className="text-amber-300">{formatMXN(pedidoCreado.total)}</span>
                  </div>
                </div>

                {/* Botón WhatsApp de Oro */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <a
                    href={generarEnlaceWhatsApp(
                      ajustes.telefonoWhatsApp,
                      `¡Hola Pupilentes AGO! Acabo de registrar mi pedido #${pedidoCreado.id} por ${formatMXN(pedidoCreado.total)} en la tienda online. Aquí les comparto mi comprobante de pago.`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-brass text-xs px-6 py-3.5 w-full sm:w-auto flex items-center justify-center gap-2 !bg-[#25D366] !text-black font-semibold shadow-lg"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Enviar Comprobante por WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={imprimirTicket}
                    className="btn-brass text-xs px-5 py-3 w-full sm:w-auto flex items-center justify-center gap-2 border border-brass/40 shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar Ticket Boutique PDF</span>
                  </button>
                </div>

                <div className="pt-4 border-t border-cocoa flex items-center justify-center gap-4 text-xs">
                  <Link
                    to={`/cuenta`}
                    className="btn-link-thread text-sand hover:text-gilt flex items-center gap-1 font-medium"
                  >
                    <span>Ir a Mi Pedido & Puntos (Consultar Estatus)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* COLUMNA LATERAL: RESUMEN DE COMPRA */}
          <div className="lg:col-span-4 bg-espresso border border-cocoa rounded-[24px] p-6 sm:p-7 shadow-xl sticky top-28 space-y-4">
            <h3 className="font-serif text-xl font-light text-champagne border-b border-cocoa pb-3">
              Resumen del Pedido
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-stone">
                <span>Subtotal ({carrito.length} productos):</span>
                <span className="font-mono text-champagne">{formatMXN(subtotalProductos)}</span>
              </div>

              {montoDescuentoCupon > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Descuento cupón ({cuponAplicado.codigo}):</span>
                  <span className="font-mono">-{formatMXN(montoDescuentoCupon)}</span>
                </div>
              )}

              {descuentoPuntos > 0 && (
                <div className="flex justify-between text-sand">
                  <span>Canje de Puntos AGO:</span>
                  <span className="font-mono">-{formatMXN(descuentoPuntos)}</span>
                </div>
              )}

              <div className="flex justify-between text-stone">
                <span>Costo de envío:</span>
                <span className="font-mono text-champagne">
                  {costoEnvio === 0 ? 'GRATIS ($0.00)' : formatMXN(costoEnvio)}
                </span>
              </div>

              <div className="border-t border-cocoa pt-3 flex justify-between items-baseline">
                <span className="text-sm font-medium text-champagne">Total:</span>
                <span className="text-2xl font-serif font-light text-champagne">
                  {formatMXN(granTotal)}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-cocoa text-[11px] text-stone space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brass" />
                <span>Garantía de esterilidad y empaque sellado</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brass" />
                <span>Acumulas +{Math.floor(granTotal / 10)} Puntos AGO</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal / Popover Kit Incluido Gratis */}
      {mostrarModalKit && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setMostrarModalKit(false)}
        >
          <div
            className="bg-neutral-900 border border-amber-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl relative text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setMostrarModalKit(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white text-lg font-bold"
            >
              
            </button>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-3">
               Incluido Gratis con tu Compra
            </span>
            <h4 className="font-serif text-xl font-bold text-amber-200 mb-2">
              Kit Oficial de Cuidado y Esterilidad
            </h4>
            <div className="w-full max-w-xs sm:max-w-sm aspect-[3/4] mx-auto my-3 bg-black rounded-2xl border border-brass/40 flex items-center justify-center p-3 shadow-inner">
              <img
                src="/img/fotos/empaque/pupilentes-ago-incluye.png"
                alt="Kit incluido gratis Pupilentes AGO"
                className="w-full h-full object-contain drop-shadow-xl"
              />
            </div>
            <p className="text-xs text-stone-300 leading-relaxed mb-4">
              Incluye estuche hermético con sellado R/L de grado médico y solución limpiadora/humectante ReNu Fresh de Bausch & Lomb (60ml).
            </p>
            <button
              onClick={() => setMostrarModalKit(false)}
              className="w-full py-2.5 rounded-xl bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider hover:bg-amber-300 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

