import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { etiquetaEstado, normalizarEstado } from '../../lib/estados';
import { useStore } from '../../store/useStore';
import { ESTADOS_PEDIDO, CANALES } from '../../data/pedidos';
import { formatMXN } from '../../data/productos';
import {
  Clock,
  KanbanSquare,
  List,
  Plus,
  Eye,
  CheckCircle2,
  XCircle,
  Truck,
  Copy,
  Printer,
  FileText,
  Search,
  MessageCircle,
  ExternalLink,
  DollarSign,
  Undo2,
  MapPin,
  Send,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

export const PanelPedidos = () => {
  const pedidos = useStore((state) => state.pedidos);
  const productos = useStore((state) => state.productos);
  const actualizarEstadoPedido = useStore((state) => state.actualizarEstadoPedido);
  const actualizarPedido = useStore((state) => state.actualizarPedido);
  const agregarPedidoManual = useStore((state) => state.agregarPedidoManual);
  const showToast = useStore((state) => state.showToast);

  // Vista principal: 'hoy' por defecto (más práctica para Araceli), secundaria 'tablero'
  const [vista, setVista] = useState('hoy'); // 'hoy' | 'tablero'
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [modalNuevoPedido, setModalNuevoPedido] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCanal, setFiltroCanal] = useState('todos');
  const [params, setParams] = useSearchParams();
  const filtroEstado = params.get('estado');
  useEffect(() => { const q = params.get('q'); if (q) { setBusqueda(q); setVista('hoy'); } }, [params]);

  // Accesos directos desde el dashboard: ?estado=... filtra, ?nuevo=1 abre la captura
  useEffect(() => {
    if (params.get('nuevo') === '1') {
      setModalNuevoPedido(true);
      params.delete('nuevo');
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  // Historial para botón Deshacer
  const [ultimoCambio, setUltimoCambio] = useState(null);

  // Formulario nuevo pedido manual
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoTel, setNuevoTel] = useState('');
  const [nuevoCanal, setNuevoCanal] = useState('instagram');
  const [nuevoMetodo, setNuevoMetodo] = useState('entrega_personal');
  const [nuevoEstacion, setNuevoEstacion] = useState('Metro Pantitlán');
  const [nuevoProductoId, setNuevoProductoId] = useState(productos[0]?.id || 'miel-satin');
  const [nuevoOd, setNuevoOd] = useState('-1.50');
  const [nuevoOi, setNuevoOi] = useState('-1.50');
  const [nuevoTotal, setNuevoTotal] = useState(649.00);

  // Avanzar estado del pedido con 1 solo clic y registrar Deshacer
  const avanzarEstado = (pedidoId, estadoActual) => {
    let proximoEstado = '';
    let mensajeAccion = '';

    switch (estadoActual) {
      case 'nuevo':
      case 'esperando_stock':
        proximoEstado = 'esperando_pago';
        mensajeAccion = 'Stock confirmado. Pedido pasó a "Por cobrar"';
        break;
      case 'esperando_pago':
        proximoEstado = 'verificar_comprobante';
        mensajeAccion = 'Comprobante recibido. Pasó a "Por verificar"';
        break;
      case 'verificar_comprobante':
      case 'comprobante_subido':
        proximoEstado = 'por_enviar';
        mensajeAccion = 'Pago aprobado con éxito. Pedido listo para empaque';
        break;
      case 'por_enviar':
        proximoEstado = 'en_camino';
        mensajeAccion = 'Guía generada / En ruta de entrega';
        break;
      case 'en_camino':
        proximoEstado = 'entregado';
        mensajeAccion = 'Pedido marcado como Entregado con éxito';
        break;
      default:
        return;
    }

    setUltimoCambio({ pedidoId, estadoAnterior: estadoActual });
    actualizarEstadoPedido(pedidoId, proximoEstado);
    showToast(mensajeAccion, 'success');

    if (pedidoSeleccionado?.id === pedidoId) {
      setPedidoSeleccionado((prev) => ({ ...prev, estado: proximoEstado }));
    }
  };

  // Función Deshacer
  const deshacerUltimoCambio = () => {
    if (!ultimoCambio) return;
    actualizarEstadoPedido(ultimoCambio.pedidoId, ultimoCambio.estadoAnterior);
    showToast('Acción deshecha correctamente', 'info');
    setUltimoCambio(null);
  };

  // Generar Guía simulada
  const generarGuia = (pedidoId) => {
    const guiaFake = `EST-${Math.floor(10000000 + Math.random() * 90000000)}MX`;
    actualizarPedido(pedidoId, {
      guiaNumero: guiaFake,
      paqueteriaNombre: 'Estafeta Express',
      estado: 'en_camino'
    });
    showToast(`Guía ${guiaFake} generada exitosamente`, 'success');
  };

  // Pedidos filtrados
  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((ped) => {
      if (filtroCanal !== 'todos' && ped.canal !== filtroCanal) return false;
      if (filtroEstado && normalizarEstado(ped.estado) !== filtroEstado) return false;
      if (!filtroEstado && vista === 'hoy' && ['entregado', 'cancelado'].includes(normalizarEstado(ped.estado))) return false;
      if (busqueda.trim() !== '') {
        const q = busqueda.toLowerCase();
        const match =
          ped.id.toLowerCase().includes(q) ||
          ped.clientaNombre.toLowerCase().includes(q) ||
          ped.telefono.includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [pedidos, filtroCanal, busqueda, filtroEstado, vista]);

  // Entregas agrupadas para la franja superior de hoy
  const entregasDeHoy = useMemo(() => {
    const pendientes = pedidos.filter((p) => p.estado === 'por_enviar' || p.estado === 'en_camino');
    const pantitlan = pendientes.filter((p) => p.estacionMetro?.toLowerCase().includes('pantitl'));
    const tepalcates = pendientes.filter((p) => p.estacionMetro?.toLowerCase().includes('tepalcat'));
    const didi = pendientes.filter((p) => p.metodoEntrega === 'didi');
    const paqueteria = pendientes.filter((p) => p.metodoEntrega === 'paqueteria');

    return { pantitlan, tepalcates, didi, paqueteria, total: pendientes.length };
  }, [pedidos]);

  // Columnas para el tablero arreglado (5 columnas fijas)
  const COLUMNAS_TABLERO = [
    { id: 'esperando_stock', titulo: 'Nuevos / Stock', color: 'border-amber-500/40 text-amber-300' },
    { id: 'esperando_pago', titulo: 'Por Cobrar', color: 'border-orange-500/40 text-orange-300' },
    { id: 'comprobante_subido', titulo: 'Por Verificar', color: 'border-sky-500/40 text-sky-300' },
    { id: 'por_enviar', titulo: 'Por Enviar / Empaque', color: 'border-yellow-500/40 text-yellow-300' },
    { id: 'en_camino', titulo: 'En Camino / Entrega', color: 'border-emerald-500/40 text-emerald-300' },
  ];

  return (
    <div className="space-y-6 animate-fade-in text-champagne">
      {/* FRANJA SUPERIOR: ENTREGAS DE HOY */}
      <div className="p-5 rounded-2xl bg-espresso border border-cocoa flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brass/15 border border-brass/30 flex items-center justify-center text-brass">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg text-champagne font-normal">
              Entregas Programadas para Hoy
            </h2>
            <span className="text-xs text-stone">
              {entregasDeHoy.total} pedidos listos para entrega personal o recolección
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="px-3.5 py-1.5 rounded-full bg-ink border border-cocoa flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-stone">Pantitlán:</span>
            <strong className="text-champagne">{entregasDeHoy.pantitlan.length}</strong>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-ink border border-cocoa flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-stone">Tepalcates:</span>
            <strong className="text-champagne">{entregasDeHoy.tepalcates.length}</strong>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-ink border border-cocoa flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span className="text-stone">DiDi Express:</span>
            <strong className="text-champagne">{entregasDeHoy.didi.length}</strong>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-ink border border-cocoa flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-stone">Paquetería:</span>
            <strong className="text-champagne">{entregasDeHoy.paqueteria.length}</strong>
          </div>
        </div>
      </div>

      {/* BARRA DE HERRAMIENTAS: VISTAS + BÚSQUEDA + FILTROS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Toggle de vista: Hoy vs Tablero */}
        <div className="p-1 rounded-full bg-espresso border border-cocoa flex items-center gap-1 self-start sm:self-auto">
          <button
            onClick={() => setVista('hoy')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs uppercase tracking-wider transition-all ${
              vista === 'hoy'
                ? 'bg-brass text-ink font-semibold shadow-sm'
                : 'text-stone hover:text-champagne'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Hoy / Qué Sigue</span>
          </button>

          <button
            onClick={() => setVista('tablero')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs uppercase tracking-wider transition-all ${
              vista === 'tablero'
                ? 'bg-brass text-ink font-semibold shadow-sm'
                : 'text-stone hover:text-champagne'
            }`}
          >
            <KanbanSquare className="w-3.5 h-3.5" />
            <span>Tablero de 5 Etapas</span>
          </button>
        </div>

        {/* Acciones: Deshacer + Búsqueda + Pedido Manual */}
        <div className="flex flex-wrap items-center gap-3">
          {ultimoCambio && (
            <button
              onClick={deshacerUltimoCambio}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-amber-500/15 border border-amber-500/30 text-amber-200 hover:bg-amber-500/25 transition-all animate-pulse"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Deshacer último cambio</span>
            </button>
          )}

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar folio o clienta..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-espresso border border-cocoa text-champagne text-xs focus:border-brass focus:outline-none w-48"
            />
          </div>

          <button
            onClick={() => setModalNuevoPedido(true)}
            className="btn-brass text-xs px-4 py-1.5 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Capturar Pedido</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          VISTA 1: HOY / QUÉ SIGUE (Lista Vertical de Alta Productividad)
          ======================================================== */}
      {filtroEstado && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-brass/10 border border-brass/30 text-xs">
          <span className="text-gilt">Mostrando: {etiquetaEstado(filtroEstado)} ({pedidosFiltrados.length})</span>
          <button onClick={() => { params.delete('estado'); setParams(params); }} className="text-stone hover:text-champagne underline">Ver todos</button>
        </div>
      )}

      {vista === 'hoy' && (
        <div className="space-y-3">
          {pedidosFiltrados.length === 0 && (
            <div className="p-8 rounded-2xl border border-dashed border-cocoa text-center text-sm text-stone">Nada pendiente en esta etapa.</div>
          )}
          {pedidosFiltrados.slice(0, 20).map((pedido) => {
            const prodPrincipal = pedido.items?.[0];
            const estadoInfo = { titulo: etiquetaEstado(pedido.estado), color: normalizarEstado(pedido.estado) === 'verificar_comprobante' ? 'text-amber-300' : 'text-sand' };

            return (
              <div
                key={pedido.id}
                className="p-4 rounded-2xl bg-espresso/60 border border-cocoa/80 hover:border-brass/40 transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-4"
              >
                {/* Info Clienta y Producto */}
                <div className="flex items-center gap-4">
                  {/* Foto miniatura */}
                  <div className="w-12 h-12 rounded-xl bg-ink border border-cocoa overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src={`/img/iris/${prodPrincipal?.productoId?.split('-')[0] || 'miel'}.webp`}
                      alt="Producto"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-serif text-champagne">
                        {pedido.clientaNombre}
                      </strong>
                      <span className="font-mono text-xs text-stone">
                        {pedido.id}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-ink border border-cocoa text-sand">
                        {pedido.canal}
                      </span>
                    </div>
                    <p className="text-xs text-stone font-light">
                      {prodPrincipal?.nombre || 'Pupilentes AGO'} · OD {prodPrincipal?.od || '0.00'} / OI {prodPrincipal?.oi || '0.00'}
                    </p>
                    <span className="text-[11px] text-stone/80">
                      {pedido.metodoEntrega === 'entrega_personal'
                        ? `Entrega: ${pedido.estacionMetro || 'Metro CDMX'}`
                        : pedido.metodoEntrega === 'didi'
                        ? 'Envío DiDi Express'
                        : 'Paquetería Nacional'}
                    </span>
                  </div>
                </div>

                {/* Total + Estado actual + Botón de Siguiente Acción */}
                <div className="flex flex-wrap items-center justify-between xl:justify-end gap-3 sm:gap-5 border-t xl:border-t-0 border-cocoa/40 pt-3 xl:pt-0">
                  <div className="text-right">
                    <span className="font-sans text-sm font-medium text-champagne block">
                      {formatMXN(pedido.total)}
                    </span>
                    <span className={`text-[11px] font-medium ${estadoInfo.color}`}>
                      {estadoInfo.titulo}
                    </span>
                  </div>

                  {/* Botón de Siguiente Acción */}
                  <div>
                    {(pedido.estado === 'esperando_stock' || pedido.estado === 'nuevo') && (
                      <button
                        onClick={() => avanzarEstado(pedido.id, pedido.estado)}
                        className="btn-brass text-xs px-4 py-2 flex items-center gap-1.5 shadow"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirmar stock</span>
                      </button>
                    )}

                    {pedido.estado === 'esperando_pago' && (
                      <button
                        onClick={() => avanzarEstado(pedido.id, pedido.estado)}
                        className="btn-brass text-xs px-4 py-2 flex items-center gap-1.5 shadow"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Enviar cuentas</span>
                      </button>
                    )}

                    {(pedido.estado === 'comprobante_subido' || pedido.estado === 'verificar_comprobante') && (
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={`https://wa.me/52${(pedido.telefono || '').replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/40 hover:bg-[#25D366]/30 flex items-center gap-1 transition-all"
                          title="Abrir WhatsApp para verificar comprobante"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp ({pedido.telefono})</span>
                        </a>

                        <button
                          onClick={() => avanzarEstado(pedido.id, pedido.estado)}
                          className="btn-brass text-xs px-3.5 py-1.5 flex items-center gap-1.5 shadow"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Aprobar pago</span>
                        </button>
                      </div>
                    )}

                    {pedido.estado === 'por_enviar' && (
                      <button
                        onClick={() => {
                          if (pedido.metodoEntrega === 'paqueteria') {
                            generarGuia(pedido.id);
                          } else {
                            avanzarEstado(pedido.id, pedido.estado);
                          }
                        }}
                        className="btn-brass text-xs px-4 py-2 flex items-center gap-1.5 shadow"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>{pedido.metodoEntrega === 'paqueteria' ? 'Generar guía' : 'Entregar hoy'}</span>
                      </button>
                    )}

                    {pedido.estado === 'en_camino' && (
                      <button
                        onClick={() => avanzarEstado(pedido.id, pedido.estado)}
                        className="px-4 py-2 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Marcar entregado</span>
                      </button>
                    )}

                    {pedido.estado === 'entregado' && (
                      <span className="text-xs text-stone flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Completado</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================
          VISTA 2: TABLERO DE 5 ETAPAS (CSS Grid Parejo, Sin Encimarse)
          ======================================================== */}
      {vista === 'tablero' && (
        <div className="w-full overflow-x-auto pb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 min-w-[1100px]">
            {COLUMNAS_TABLERO.map((col) => {
              const itemsCol = pedidosFiltrados.filter((p) => {
                if (col.id === 'esperando_stock') return p.estado === 'esperando_stock' || p.estado === 'nuevo';
                if (col.id === 'comprobante_subido') return p.estado === 'comprobante_subido' || p.estado === 'verificar_comprobante';
                return p.estado === col.id;
              });

              return (
                <div
                  key={col.id}
                  className="bg-espresso/50 border border-cocoa/80 rounded-2xl p-3.5 flex flex-col min-w-0"
                >
                  {/* Encabezado columna */}
                  <div className={`border-b ${col.color} pb-2.5 mb-3 flex items-center justify-between`}>
                    <h3 className="font-serif text-sm font-medium text-champagne truncate">
                      {col.titulo}
                    </h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-ink border border-cocoa text-sand">
                      {itemsCol.length}
                    </span>
                  </div>

                  {/* Tarjetas dentro de la columna */}
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh]">
                    {itemsCol.map((pedido) => {
                      const prod = pedido.items?.[0];

                      return (
                        <div
                          key={pedido.id}
                          className="p-3.5 rounded-xl bg-ink border border-cocoa/70 hover:border-brass/50 transition-all flex flex-col justify-between gap-3 text-xs shadow-md"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-mono text-[11px] text-stone">
                                {pedido.id}
                              </span>
                              <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-espresso text-sand">
                                {pedido.canal}
                              </span>
                            </div>

                            <strong className="text-sm font-serif text-champagne block truncate">
                              {pedido.clientaNombre}
                            </strong>

                            <p className="text-[11px] text-stone truncate mt-0.5">
                              {prod?.nombre || 'Pupilentes'} ({prod?.od || '0.00'})
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-cocoa/40">
                            <span className="font-medium text-sand font-mono">
                              {formatMXN(pedido.total)}
                            </span>

                            <button
                              onClick={() => avanzarEstado(pedido.id, pedido.estado)}
                              className="px-2.5 py-1 rounded-full text-[11px] bg-brass/15 text-gilt border border-brass/30 hover:bg-brass hover:text-ink transition-colors"
                            >
                              Avanzar 
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL CREAR PEDIDO MANUAL */}
      {modalNuevoPedido && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-espresso border border-cocoa rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
            <h2 className="font-serif text-2xl text-champagne font-normal">
              Capturar Pedido Manual (WhatsApp / Instagram)
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-stone block mb-1">Nombre de la Clienta:</label>
                <input
                  type="text"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Ej. Sofía Hernández"
                  className="w-full px-3 py-2 rounded-xl bg-ink border border-cocoa text-champagne focus:border-brass focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone block mb-1">WhatsApp (10 dígitos):</label>
                  <input
                    type="text"
                    value={nuevoTel}
                    onChange={(e) => setNuevoTel(e.target.value)}
                    placeholder="55 1234 5678"
                    className="w-full px-3 py-2 rounded-xl bg-ink border border-cocoa text-champagne focus:border-brass focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-stone block mb-1">Canal de Venta:</label>
                  <select
                    value={nuevoCanal}
                    onChange={(e) => setNuevoCanal(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-ink border border-cocoa text-champagne focus:border-brass focus:outline-none"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="tiktok">TikTok</option>
                    <option value="mercadolibre">Mercado Libre</option>
                    <option value="personal">Entrega Personal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-stone block mb-1">Modelo de Lente:</label>
                <select
                  value={nuevoProductoId}
                  onChange={(e) => setNuevoProductoId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-ink border border-cocoa text-champagne focus:border-brass focus:outline-none"
                >
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} ({formatMXN(p.precio)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone block mb-1">OD (Ojo Derecho):</label>
                  <input
                    type="text"
                    value={nuevoOd}
                    onChange={(e) => setNuevoOd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-ink border border-cocoa text-champagne font-mono"
                  />
                </div>
                <div>
                  <label className="text-stone block mb-1">OI (Ojo Izquierdo):</label>
                  <input
                    type="text"
                    value={nuevoOi}
                    onChange={(e) => setNuevoOi(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-ink border border-cocoa text-champagne font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setModalNuevoPedido(false)}
                className="px-5 py-2 rounded-full text-xs text-stone border border-cocoa hover:text-champagne"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  agregarPedidoManual({
                    clientaNombre: nuevoNombre || 'Clienta Directa',
                    telefono: nuevoTel || '5500000000',
                    canal: nuevoCanal,
                    estado: 'esperando_pago',
                    metodoEntrega: nuevoMetodo,
                    items: [
                      {
                        productoId: nuevoProductoId,
                        nombre: productos.find((p) => p.id === nuevoProductoId)?.nombre || 'Pupilentes AGO',
                        od: nuevoOd,
                        oi: nuevoOi,
                        cantidad: 1,
                        precioUnitario: nuevoTotal,
                      },
                    ],
                    subtotal: nuevoTotal,
                    costoEnvio: 0,
                    total: nuevoTotal,
                  });
                  setModalNuevoPedido(false);
                  showToast('Pedido capturado en el panel', 'success');
                }}
                className="btn-brass text-xs px-6 py-2"
              >
                Crear Pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PanelPedidos;

