import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { formatMXN } from '../../data/productos';
import { CheckCircle2, Truck, ArrowLeft, Package, CreditCard, FileText } from 'lucide-react';

export const TrackingPage = () => {
  const { id } = useParams();
  const pedidos = useStore((state) => state.pedidos);

  const pedido = pedidos.find((p) => p.id === id) || pedidos[0];

  if (!pedido) {
    return (
      <div className="gutter py-24 text-center bg-ink text-champagne min-h-screen">
        <h2 className="font-serif text-3xl font-light mb-4">Pedido no encontrado</h2>
        <Link to="/" className="btn-brass">Volver al inicio</Link>
      </div>
    );
  }

  const estadosOrden = [
    { id: 'esperando_pago', label: 'Pedido recibido', desc: 'Registrado en sistema' },
    { id: 'verificar_comprobante', label: 'Comprobante', desc: 'Validación SPEI' },
    { id: 'generar_guia', label: 'En taller', desc: 'Empaque y verificación OD/OI' },
    { id: 'en_camino', label: 'En camino', desc: 'Paquetería o cita en Metro agendada' },
    { id: 'entregado', label: 'Entregado', desc: 'Completado con éxito' },
  ];

  const getPasoIndice = (estado) => {
    switch (estado) {
      case 'cotizando':
      case 'esperando_pago':
        return 0;
      case 'verificar_comprobante':
        return 1;
      case 'generar_guia':
        return 2;
      case 'en_camino':
        return 3;
      case 'entregado':
        return 4;
      default:
        return 1;
    }
  };

  const pasoActual = getPasoIndice(pedido.estado);

  return (
    <div className="bg-ink text-champagne pt-24 pb-20 min-h-screen gutter">
      <div className="w-full max-w-[1400px] mx-auto space-y-12">
        <Link
          to="/"
          className="btn-link-thread text-[12px] uppercase tracking-[0.16em] inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a la Tienda</span>
        </Link>

        <div className="bg-espresso border border-cocoa rounded-[28px] p-8 sm:p-12 shadow-2xl space-y-10">
          {/* Cabecera */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-cocoa pb-8">
            <div>
              <span className="text-[11px] uppercase tracking-[0.24em] text-sand font-medium block mb-2">
                Seguimiento en Vivo
              </span>
              <h1 className="font-serif text-[clamp(2.5rem,4vw,3.5rem)] text-champagne font-light leading-tight">
                Orden <span className="whitespace-nowrap">#{pedido.id}</span>
              </h1>
              <span className="text-[13px] text-stone font-light">
                Fecha: {pedido.fecha} · Cliente: {pedido.clientaNombre}
              </span>
            </div>

            <span className="px-4 py-1.5 rounded-full text-[11px] uppercase tracking-[0.2em] font-medium bg-ink border border-brass/40 text-sand">
              {pedido.estado.replace('_', ' ')}
            </span>
          </div>

          {/* Timeline visual con camioncito activo */}
          <div className="py-6 relative">
            {/* Barra horizontal base */}
            <div className="absolute top-11 left-8 right-8 h-1 bg-cocoa/80 rounded-full hidden sm:block">
              <div
                className="h-full bg-gradient-to-r from-brass via-gilt to-brass rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(217,190,133,0.5)]"
                style={{ width: `${(pasoActual / 4) * 100}%` }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 relative z-10">
              {[
                { id: 'esperando_pago', label: '1. Pedido recibido', desc: 'Registrado en sistema', icon: FileText },
                { id: 'verificar_comprobante', label: '2. Pago Validado', desc: 'Comprobante aprobado', icon: CreditCard },
                { id: 'generar_guia', label: '3. Preparando', desc: 'Empaque estéril boutique', icon: Package },
                { id: 'en_camino', label: '4. En camino', desc: 'En ruta de entrega', icon: Truck },
                { id: 'entregado', label: '5. Entregado', desc: 'Completado con éxito', icon: CheckCircle2 },
              ].map((est, idx) => {
                const completado = idx < pasoActual;
                const esActual = idx === pasoActual;
                const IconComponent = est.icon;

                return (
                  <div key={est.id} className="flex flex-col items-center text-center">
                    <div className="relative mb-3">
                      {esActual && idx === 3 ? (
                        <div className="w-12 h-12 rounded-2xl bg-brass text-ink flex items-center justify-center shadow-[0_0_24px_rgba(217,190,133,0.8)] animate-pulse ring-4 ring-brass/25">
                          <Truck className="w-6 h-6 stroke-[2.2]" />
                        </div>
                      ) : esActual ? (
                        <div className="w-11 h-11 rounded-2xl bg-brass text-ink flex items-center justify-center shadow-[0_0_18px_rgba(217,190,133,0.6)] ring-2 ring-brass/40">
                          <IconComponent className="w-5 h-5 stroke-[2.2]" />
                        </div>
                      ) : completado ? (
                        <div className="w-10 h-10 rounded-2xl bg-espresso border border-brass/60 text-gilt flex items-center justify-center shadow-md">
                          <CheckCircle2 className="w-5 h-5 text-brass" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-2xl bg-ink border border-cocoa text-stone flex items-center justify-center">
                          <IconComponent className="w-4 h-4 opacity-50" />
                        </div>
                      )}
                    </div>

                    <span className={`text-[12px] font-serif font-medium block mb-0.5 ${esActual ? 'text-gilt font-bold' : completado ? 'text-champagne' : 'text-stone'}`}>
                      {est.label}
                    </span>
                    <span className="text-[10px] text-stone/70 leading-tight">
                      {est.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detalles del Envío y Productos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-cocoa text-[13px]">
            <div className="p-5 rounded-2xl bg-ink border border-cocoa/80 space-y-2">
              <span className="text-[11px] uppercase tracking-[0.18em] text-sand font-medium flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-brass" />
                Entrega
              </span>
              <p className="text-stone capitalize">
                <strong>Método:</strong> {pedido.metodoEntrega.replace('_', ' ')}
              </p>
              {pedido.estacionMetro && (
                <p className="text-stone">
                  <strong>Punto de encuentro:</strong> {pedido.estacionMetro}
                </p>
              )}
              {pedido.guiaNumero && (
                <p className="text-sand font-mono">
                  <strong>Guía:</strong> {pedido.guiaNumero} ({pedido.paqueteriaNombre})
                </p>
              )}
            </div>

            <div className="p-5 rounded-2xl bg-ink border border-cocoa/80 space-y-2">
              <span className="text-[11px] uppercase tracking-[0.18em] text-sand font-medium block">
                Resumen de orden
              </span>
              <p className="text-stone">
                {pedido.items.map((i) => `${i.nombre} (x${i.cantidad})`).join(', ')}
              </p>
              <p className="text-sand font-serif text-xl font-light pt-1">
                Total: {formatMXN(pedido.total)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;
