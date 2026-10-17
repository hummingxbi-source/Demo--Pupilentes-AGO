import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { formatMXN } from '../../data/productos';
import { CheckCircle2, Clock, Truck, Package, MapPin, ArrowLeft, MessageCircle, AlertCircle } from 'lucide-react';

export const TrackingPage = () => {
  const { id } = useParams();
  const pedidos = useStore((state) => state.pedidos);
  const ajustes = useStore((state) => state.ajustes);

  const pedido = pedidos.find((p) => p.id === id) || pedidos[0];

  if (!pedido) {
    return (
      <div className="container-custom py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Pedido no encontrado</h2>
        <Link to="/" className="btn-gold text-xs px-6 py-2">Volver al inicio</Link>
      </div>
    );
  }

  // Mapeo del estado Kanban a pasos del timeline
  const estadosOrden = [
    { id: "esperando_pago", label: "Pedido Recibido", desc: "Datos de orden registrados" },
    { id: "verificar_comprobante", label: "Comprobante en Revisión", desc: "Validando transferencia bancaria" },
    { id: "generar_guia", label: "Pago Verificado & Empaque", desc: "Preparando lentes en taller boutique" },
    { id: "en_camino", label: "En Camino / Por Entregar", desc: "Paquetería o cita en Metro agendada" },
    { id: "entregado", label: "Entregado", desc: "Pedido completado con éxito" }
  ];

  const getPasoIndice = (estado) => {
    switch (estado) {
      case "cotizando":
      case "esperando_pago":
        return 0;
      case "verificar_comprobante":
        return 1;
      case "generar_guia":
        return 2;
      case "en_camino":
        return 3;
      case "entregado":
        return 4;
      default:
        return 1;
    }
  };

  const pasoActual = getPasoIndice(pedido.estado);

  return (
    <div className="bg-neutral-950 text-neutral-100 py-12 min-h-screen">
      <div className="container-custom max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-xs text-stone-400 hover:text-amber-300 mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la Tienda</span>
        </Link>

        <div className="bg-neutral-900/90 border border-amber-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          {/* Cabecera del Tracking */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
            <div>
              <span className="text-xs uppercase font-mono tracking-widest text-amber-400 block mb-1">
                Seguimiento en Vivo
              </span>
              <h1 className="font-serif text-3xl font-bold text-amber-100">
                Orden #{pedido.id}
              </h1>
              <span className="text-xs text-stone-400">
                Fecha: {pedido.fecha} · Cliente: <strong>{pedido.clientaNombre}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/40">
                {pedido.estado.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Timeline animado conectado al Kanban */}
          <div className="py-6">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
              {estadosOrden.map((est, idx) => {
                const completado = idx <= pasoActual;
                const esActual = idx === pasoActual;

                return (
                  <div key={est.id} className="flex flex-col items-center text-center relative z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs mb-3 transition-all duration-300 ${
                        completado
                          ? 'bg-amber-400 text-neutral-950 shadow-[0_0_15px_rgba(201,162,75,0.6)]'
                          : 'bg-neutral-800 text-stone-500 border border-neutral-700'
                      } ${esActual ? 'ring-4 ring-amber-400/30 scale-110' : ''}`}
                    >
                      {completado ? <CheckCircle2 className="w-5 h-5 stroke-[2.5]" /> : idx + 1}
                    </div>
                    <span className={`text-xs font-bold block mb-1 ${completado ? 'text-amber-200' : 'text-stone-500'}`}>
                      {est.label}
                    </span>
                    <span className="text-[10px] text-stone-400 leading-tight">
                      {est.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detalles del Envío y Productos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-neutral-800 text-xs">
            {/* Detalles de Entrega */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <h4 className="font-bold text-amber-300 flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Método de Entrega
              </h4>
              <p className="text-stone-300 capitalize">
                <strong>Tipo:</strong> {pedido.metodoEntrega.replace('_', ' ')}
              </p>
              {pedido.estacionMetro && (
                <p className="text-stone-300">
                  <strong>Punto de encuentro:</strong> {pedido.estacionMetro}
                </p>
              )}
              {pedido.guiaNumero && (
                <p className="text-emerald-300 font-mono">
                  <strong>Guía de Paquetería:</strong> {pedido.guiaNumero} ({pedido.paqueteriaNombre})
                </p>
              )}
              {pedido.horarioPactado && (
                <p className="text-stone-300">
                  <strong>Horario:</strong> {pedido.horarioPactado}
                </p>
              )}
            </div>

            {/* Total e Items */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <h4 className="font-bold text-amber-300 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Artículos en la Orden
              </h4>
              <ul className="space-y-1 text-stone-300">
                {pedido.items.map((it, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{it.nombre} (OD: {it.od} / OI: {it.oi}) × {it.cantidad}</span>
                    <span className="font-mono text-amber-200">{formatMXN(it.precioUnitario)}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-neutral-800 pt-2 flex justify-between font-bold text-sm text-white">
                <span>Total pagado:</span>
                <span className="text-amber-300">{formatMXN(pedido.total)}</span>
              </div>
            </div>
          </div>

          <div className="text-center pt-4">
            <a
              href={`https://wa.me/525571113508?text=Hola%20Araceli,%20tengo%20una%20duda%20sobre%20mi%20pedido%20%23${pedido.id}`}
              target="_blank"
              rel="noreferrer"
              className="btn-outline-gold text-xs py-2.5 px-6 inline-flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Contactar a Araceli por WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
