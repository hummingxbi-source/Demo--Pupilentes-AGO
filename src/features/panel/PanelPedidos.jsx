import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { ESTADOS_PEDIDO, CANALES } from '../../data/pedidos';
import { formatMXN } from '../../data/productos';
import {
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
  DollarSign
} from 'lucide-react';

export const PanelPedidos = () => {
  const pedidos = useStore((state) => state.pedidos);
  const productos = useStore((state) => state.productos);
  const actualizarEstadoPedido = useStore((state) => state.actualizarEstadoPedido);
  const actualizarPedido = useStore((state) => state.actualizarPedido);
  const agregarPedidoManual = useStore((state) => state.agregarPedidoManual);
  const showToast = useStore((state) => state.showToast);

  const [vista, setVista] = useState('kanban'); // 'kanban' | 'tabla'
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [modalNuevoPedido, setModalNuevoPedido] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  // Formulario nuevo pedido manual
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoTel, setNuevoTel] = useState('');
  const [nuevoCanal, setNuevoCanal] = useState('instagram');
  const [nuevoMetodo, setNuevoMetodo] = useState('entrega_personal');
  const [nuevoEstacion, setNuevoEstacion] = useState('Metro Pantitlán');
  const [nuevoProductoId, setNuevoProductoId] = useState(productos[0]?.id || 'miel-satin');
  const [nuevoOd, setNuevoOd] = useState('0.00');
  const [nuevoOi, setNuevoOi] = useState('0.00');
  const [nuevoTotal, setNuevoTotal] = useState(649.00);

  // Mover tarjeta a otra columna
  const moverPedido = (pedidoId, nuevoEstado) => {
    actualizarEstadoPedido(pedidoId, nuevoEstado);
    if (pedidoSeleccionado?.id === pedidoId) {
      setPedidoSeleccionado((prev) => ({ ...prev, estado: nuevoEstado }));
    }
  };

  // Generar Guía simulada
  const generarGuia = (pedidoId) => {
    const guiaFake = `EST-${Math.floor(10000000 + Math.random() * 90000000)}MX`;
    actualizarPedido(pedidoId, {
      guiaNumero: guiaFake,
      paqueteriaNombre: 'Estafeta Express',
      estado: 'en_camino'
    });
    showToast(`Guía ${guiaFake} generada exitosamente. Pedido en camino.`, "success");
    if (pedidoSeleccionado?.id === pedidoId) {
      setPedidoSeleccionado((prev) => ({
        ...prev,
        guiaNumero: guiaFake,
        paqueteriaNombre: 'Estafeta Express',
        estado: 'en_camino'
      }));
    }
  };

  // Crear Pedido Manual (ventas de IG/WA/ML)
  const handleCrearPedidoManual = (e) => {
    e.preventDefault();
    const prod = productos.find((p) => p.id === nuevoProductoId);
    agregarPedidoManual({
      clientaNombre: nuevoNombre || 'Clienta Instagram',
      telefono: nuevoTel || '55 1234 5678',
      canal: nuevoCanal,
      estado: 'esperando_pago',
      metodoEntrega: nuevoMetodo,
      estacionMetro: nuevoMetodo === 'entrega_personal' ? nuevoEstacion : undefined,
      items: [
        {
          productoId: prod.id,
          nombre: prod.nombre,
          od: nuevoOd,
          oi: nuevoOi,
          cantidad: 1,
          precioUnitario: nuevoTotal
        }
      ],
      subtotal: nuevoTotal,
      costoEnvio: 0,
      total: nuevoTotal,
      notas: `Venta manual capturada desde ${nuevoCanal.toUpperCase()}`
    });

    setModalNuevoPedido(false);
    setNuevoNombre('');
    setNuevoTel('');
  };

  // Filtrar pedidos
  const pedidosFiltrados = pedidos.filter((p) => {
    if (!busqueda) return true;
    const q = busqueda.toLowerCase();
    return (
      p.id.toLowerCase().includes(q) ||
      p.clientaNombre.toLowerCase().includes(q) ||
      p.canal.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Cabecera y Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-amber-400 block mb-1">
            Flujo de Órdenes
          </span>
          <h1 className="font-serif text-3xl font-bold text-amber-100">
            Tablero de Pedidos (Kanban)
          </h1>
          <p className="text-xs text-stone-400">
            Control de 6 etapas: desde cotización y comprobante hasta entrega en metro o guía de paquetería.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle Vista */}
          <div className="p-1 rounded-full bg-neutral-900 border border-neutral-800 flex items-center">
            <button
              onClick={() => setVista('kanban')}
              className={`p-1.5 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                vista === 'kanban' ? 'bg-amber-400 text-neutral-950' : 'text-stone-400 hover:text-white'
              }`}
            >
              <KanbanSquare className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setVista('tabla')}
              className={`p-1.5 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                vista === 'tabla' ? 'bg-amber-400 text-neutral-950' : 'text-stone-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Tabla</span>
            </button>
          </div>

          {/* Botón Nuevo Pedido Manual */}
          <button
            type="button"
            onClick={() => setModalNuevoPedido(true)}
            className="btn-gold text-xs px-4 py-2 flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nuevo Pedido Manual</span>
          </button>
        </div>
      </div>

      {/* VISTA KANBAN DRAG & DROP INTERACTIVO */}
      {vista === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 items-start overflow-x-auto pb-6">
          {ESTADOS_PEDIDO.filter((e) => e.id !== 'cancelado').map((columna) => {
            const pedidosEnColumna = pedidosFiltrados.filter((p) => p.estado === columna.id);

            return (
              <div
                key={columna.id}
                className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-3 flex flex-col min-w-[260px] max-h-[750px]"
              >
                {/* Cabecera de Columna */}
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: columna.color }}
                    />
                    <h3 className="text-xs font-bold text-neutral-200">{columna.label}</h3>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-neutral-950 border border-neutral-800 text-[10px] font-mono font-bold flex items-center justify-center text-stone-300">
                    {pedidosEnColumna.length}
                  </span>
                </div>

                {/* Tarjetas de Pedidos en la Columna */}
                <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                  {pedidosEnColumna.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-stone-600 font-mono">
                      Sin órdenes en esta etapa
                    </div>
                  ) : (
                    pedidosEnColumna.map((ped) => {
                      const canalInfo = CANALES.find((c) => c.id === ped.canal) || CANALES[0];

                      return (
                        <div
                          key={ped.id}
                          onClick={() => setPedidoSeleccionado(ped)}
                          className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-400/50 cursor-pointer transition-all hover:shadow-lg space-y-2 group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-amber-300">
                              #{ped.id}
                            </span>
                            <span
                              className="px-2 py-0.5 rounded-full text-[9px] font-bold"
                              style={{
                                backgroundColor: `${canalInfo.color}20`,
                                color: canalInfo.color
                              }}
                            >
                              {canalInfo.label}
                            </span>
                          </div>

                          <div>
                            <span className="text-xs font-bold text-neutral-100 block truncate">
                              {ped.clientaNombre}
                            </span>
                            <span className="text-[10px] text-stone-400 block truncate">
                              {ped.items.map((it) => it.nombre).join(', ')}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-neutral-900 text-[11px]">
                            <span className="text-stone-400 font-mono truncate max-w-[120px]">
                              {ped.metodoEntrega === 'entrega_personal'
                                ? ped.estacionMetro || 'Metro CDMX'
                                : ped.metodoEntrega.toUpperCase()}
                            </span>
                            <span className="font-bold text-white font-mono">
                              {formatMXN(ped.total)}
                            </span>
                          </div>

                          {/* Badge de comprobante cargado */}
                          {ped.estado === 'verificar_comprobante' && (
                            <div className="text-[10px] text-amber-300 bg-amber-500/10 p-1.5 rounded border border-amber-500/30 flex items-center gap-1 font-medium animate-pulse">
                              <span>Comprobante listo para validar</span>
                            </div>
                          )}

                          {/* Select rápido para mover etapa */}
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="pt-1 flex items-center gap-1.5"
                          >
                            <span className="text-[9px] text-stone-500 uppercase font-mono">Mover:</span>
                            <select
                              value={ped.estado}
                              onChange={(e) => moverPedido(ped.id, e.target.value)}
                              className="bg-neutral-900 text-[10px] text-stone-300 border border-neutral-700 rounded px-1.5 py-0.5 w-full focus:outline-none"
                            >
                              {ESTADOS_PEDIDO.map((est) => (
                                <option key={est.id} value={est.id}>
                                  {est.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VISTA TABLA ALTERNA */
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-950 text-stone-400 font-mono uppercase text-[10px] border-b border-neutral-800">
              <tr>
                <th className="py-3 px-4">Folio</th>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Clienta</th>
                <th className="py-3 px-4">Canal</th>
                <th className="py-3 px-4">Entrega</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 font-mono">
              {pedidosFiltrados.map((ped) => (
                <tr
                  key={ped.id}
                  onClick={() => setPedidoSeleccionado(ped)}
                  className="hover:bg-neutral-850 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-bold text-amber-300">#{ped.id}</td>
                  <td className="py-3 px-4 text-stone-400">{ped.fecha}</td>
                  <td className="py-3 px-4 font-sans text-white font-medium">{ped.clientaNombre}</td>
                  <td className="py-3 px-4 capitalize">{ped.canal}</td>
                  <td className="py-3 px-4 text-stone-300">
                    {ped.metodoEntrega.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-neutral-800 text-stone-300 border border-neutral-700">
                      {ped.estado.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-amber-200">
                    {formatMXN(ped.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL DETALLE DE PEDIDO (COMPROBANTE, GUÍA, VALIDACIÓN) */}
      {pedidoSeleccionado && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <span className="text-xs font-mono uppercase text-amber-400 block">
                  Detalle de Orden
                </span>
                <h3 className="font-serif text-2xl font-bold text-white">
                  Pedido #{pedidoSeleccionado.id}
                </h3>
              </div>
              <button
                onClick={() => setPedidoSeleccionado(null)}
                className="text-stone-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            {/* Datos de la clienta */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-neutral-950 p-4 rounded-xl border border-neutral-800">
              <div>
                <span className="text-stone-500 block">Clienta:</span>
                <strong className="text-white text-sm">{pedidoSeleccionado.clientaNombre}</strong>
                <span className="text-stone-400 block">{pedidoSeleccionado.telefono}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Canal de Venta:</span>
                <strong className="text-amber-300 uppercase font-mono">{pedidoSeleccionado.canal}</strong>
                <span className="text-stone-400 block">{pedidoSeleccionado.fecha}</span>
              </div>
            </div>

            {/* Artículos y Graduación OD / OI */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-amber-200 uppercase tracking-wider block">
                Pupilentes y Graduación:
              </span>
              <div className="bg-neutral-950 rounded-xl p-3 border border-neutral-800 space-y-2">
                {pedidoSeleccionado.items.map((it, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white">{it.nombre}</span>
                      <span className="font-mono text-stone-400 block text-[11px]">
                        OD: {it.od} | OI: {it.oi} ({it.cantidad} pieza(s))
                      </span>
                    </div>
                    <span className="font-mono font-bold text-amber-300">
                      {formatMXN(it.precioUnitario)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Comprobante de Transferencia para Verificar */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-amber-200 uppercase tracking-wider block">
                Comprobante de Pago (Transferencia / Depósito):
              </span>
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-amber-400/40 flex items-center justify-center text-amber-300">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">
                      {pedidoSeleccionado.bancoEmisor || "Transferencia SPEI BBVA"}
                    </span>
                    <span className="text-stone-400 text-[11px]">
                      Monto verificado: {formatMXN(pedidoSeleccionado.total)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      moverPedido(pedidoSeleccionado.id, 'generar_guia');
                      showToast(`Comprobante aprobado. Pedido #${pedidoSeleccionado.id} verificado.`, "success");
                    }}
                    className="btn-gold text-xs py-2 px-3 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Aprobar Pago</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      moverPedido(pedidoSeleccionado.id, 'esperando_pago');
                      showToast(`Se solicitó comprobante legible a la clienta`, "warn");
                    }}
                    className="btn-ghost text-xs py-2 px-3"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            </div>

            {/* Generación de Guía de Envío */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-200 uppercase tracking-wider">
                  Logística y Guía de Envío
                </span>
                {pedidoSeleccionado.guiaNumero && (
                  <span className="text-emerald-400 font-mono font-bold">
                    Guía: {pedidoSeleccionado.guiaNumero}
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <p className="text-stone-400 text-xs">
                  {pedidoSeleccionado.metodoEntrega === 'entrega_personal'
                    ? `Entrega en ${pedidoSeleccionado.estacionMetro || 'Metro Pantitlán'}`
                    : `Paquetería: ${pedidoSeleccionado.paqueteriaNombre || 'Estafeta / DHL'}`}
                </p>

                {!pedidoSeleccionado.guiaNumero && pedidoSeleccionado.metodoEntrega !== 'entrega_personal' && (
                  <button
                    type="button"
                    onClick={() => generarGuia(pedidoSeleccionado.id)}
                    className="btn-outline-gold text-xs py-2 px-4 flex items-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Generar Guía de Paquetería</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPedidoSeleccionado(null)}
                className="btn-ghost text-xs px-5 py-2"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUEVO PEDIDO MANUAL (VENTAS POR IG / WHATSAPP) */}
      {modalNuevoPedido && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCrearPedidoManual}
            className="bg-neutral-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl animate-scale-in text-xs"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-serif text-xl font-bold text-amber-200">
                Registrar Venta Externa (IG / WA / TikTok)
              </h3>
              <button
                type="button"
                onClick={() => setModalNuevoPedido(false)}
                className="text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-stone-400 block mb-1">Nombre de la clienta:</label>
              <input
                type="text"
                required
                placeholder="Ej. Diana Castro"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-stone-400 block mb-1">Canal de origen:</label>
                <select
                  value={nuevoCanal}
                  onChange={(e) => setNuevoCanal(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-white"
                >
                  <option value="instagram">Instagram DM</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="tiktok">TikTok</option>
                  <option value="mercadolibre">Mercado Libre</option>
                  <option value="entrega_personal">Personal CDMX</option>
                </select>
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Método de entrega:</label>
                <select
                  value={nuevoMetodo}
                  onChange={(e) => setNuevoMetodo(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-white"
                >
                  <option value="entrega_personal">Metro Pantitlán / Tepalcates</option>
                  <option value="didi">DiDi CDMX</option>
                  <option value="paqueteria">Paquetería</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-stone-400 block mb-1">Modelo de pupilente:</label>
              <select
                value={nuevoProductoId}
                onChange={(e) => setNuevoProductoId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-white"
              >
                {productos.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.nombre} — {formatMXN(prod.precio)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-stone-400 block mb-1">Graduación OD:</label>
                <input
                  type="text"
                  value={nuevoOd}
                  onChange={(e) => setNuevoOd(e.target.value)}
                  placeholder="0.00 a -8.00"
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Graduación OI:</label>
                <input
                  type="text"
                  value={nuevoOi}
                  onChange={(e) => setNuevoOi(e.target.value)}
                  placeholder="0.00 a -8.00"
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setModalNuevoPedido(false)}
                className="btn-ghost text-xs px-4 py-2"
              >
                Cancelar
              </button>
              <button type="submit" className="btn-gold text-xs px-5 py-2">
                Guardar Pedido y Descontar Stock
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
