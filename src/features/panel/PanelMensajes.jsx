import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { PLANTILLAS_MENSAJES, procesarPlantilla, generarEnlaceWhatsApp } from '../../data/plantillas';
import { formatMXN } from '../../data/productos';
import {
  MessageSquare,
  Copy,
  ExternalLink,
  Check,
  Send,
  Sparkles,
  User,
  ShoppingBag
} from 'lucide-react';

export const PanelMensajes = () => {
  const pedidos = useStore((state) => state.pedidos);
  const clientas = useStore((state) => state.clientas);
  const ajustes = useStore((state) => state.ajustes);
  const showToast = useStore((state) => state.showToast);

  const [pedidoSeleccionadoId, setPedidoSeleccionadoId] = useState(pedidos[0]?.id || '');
  const [plantillaActivaId, setPlantillaActivaId] = useState('recordatorio_renovacion');
  const [textoEditado, setTextoEditado] = useState('');
  const [copiado, setCopiado] = useState(false);

  const pedidoActual = pedidos.find((p) => p.id === pedidoSeleccionadoId) || pedidos[0];
  const plantillaActual = PLANTILLAS_MENSAJES.find((p) => p.id === plantillaActivaId) || PLANTILLAS_MENSAJES[0];

  // Construir variables dinámicas para reemplazo
  const variables = {
    nombre: pedidoActual?.clientaNombre?.split(' ')[0] || 'Clienta',
    modelo: pedidoActual?.items?.[0]?.nombre || 'Miel Satín',
    total: formatMXN(pedidoActual?.total || 649),
    guia: pedidoActual?.guiaNumero || 'EST-8812903MX',
    paqueteria: pedidoActual?.paqueteriaNombre || 'Estafeta Express',
    pedido_id: pedidoActual?.id || 'AGO-1062',
    estacion: pedidoActual?.estacionMetro || 'Metro Pantitlán',
    dias: '5',
    puntos: '120',
    link_catalogo: 'https://pupilentesago.mx/#/catalogo',
    link_tracking: `https://pupilentesago.mx/#/seguimiento/${pedidoActual?.id || 'AGO-1062'}`,
    clabe_bbva: ajustes.cuentasPago[0]?.numero || '012 180 01548291029 3',
    clabe_mp: ajustes.cuentasPago[1]?.numero || '0000003100098471625341'
  };

  const textoGenerado = textoEditado || procesarPlantilla(plantillaActual.texto, variables);

  const copiarMensaje = () => {
    navigator.clipboard.writeText(textoGenerado);
    setCopiado(true);
    showToast('Mensaje copiado al portapapeles 📋', 'success');
    setTimeout(() => setCopiado(false), 2500);
  };

  const abrirWhatsApp = () => {
    const telefono = pedidoActual?.telefono || ajustes.telefonoWhatsApp;
    const url = generarEnlaceWhatsApp(telefono, textoGenerado);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Cabecera */}
      <div>
        <span className="text-xs uppercase font-mono tracking-widest text-amber-400 block mb-1">
          Automatización de Mensajería
        </span>
        <h1 className="font-serif text-3xl font-bold text-amber-100">
          Plantillas de Respuesta Rápida (WhatsApp & Instagram)
        </h1>
        <p className="text-xs text-stone-400">
          Reemplaza las respuestas que hoy escribes a mano. Inserta automáticamente nombre, total, número de guía o recordatorio de renovación.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna Izquierda: Lista de Plantillas */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
            Selecciona una plantilla:
          </span>

          <div className="space-y-2">
            {PLANTILLAS_MENSAJES.map((pl) => {
              const isSelected = pl.id === plantillaActivaId;
              return (
                <div
                  key={pl.id}
                  onClick={() => {
                    setPlantillaActivaId(pl.id);
                    setTextoEditado('');
                  }}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-400/15 border-amber-400 shadow-md text-white'
                      : 'bg-neutral-900 border-neutral-800 text-stone-400 hover:border-neutral-700'
                  }`}
                >
                  <span className="text-xs font-bold block">{pl.titulo}</span>
                  <span className="text-[10px] text-stone-500 uppercase font-mono">
                    Categoría: {pl.categoria}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Columna Derecha: Vista Previa, Selector de Pedido y Envío */}
        <div className="lg:col-span-7 bg-neutral-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* Selector de Pedido para alimentar variables */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-neutral-950 p-4 rounded-2xl border border-neutral-800 text-xs">
            <span className="text-stone-400 font-medium">Insertar datos del pedido:</span>
            <select
              value={pedidoSeleccionadoId}
              onChange={(e) => {
                setPedidoSeleccionadoId(e.target.value);
                setTextoEditado('');
              }}
              className="px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white font-mono text-xs w-full sm:w-auto"
            >
              {pedidos.slice(0, 8).map((p) => (
                <option key={p.id} value={p.id}>
                  #{p.id} — {p.clientaNombre} ({formatMXN(p.total)})
                </option>
              ))}
            </select>
          </div>

          {/* Caja del Mensaje Generado con Estilo WhatsApp */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-400 px-1">
              <span className="font-bold text-amber-200">Mensaje con datos listos:</span>
              <span className="font-mono text-[10px]">Destino: {pedidoActual?.telefono}</span>
            </div>

            <div className="relative">
              <textarea
                rows={9}
                value={textoGenerado}
                onChange={(e) => setTextoEditado(e.target.value)}
                className="w-full p-4 rounded-2xl bg-[#0B0B0C] border border-neutral-700/80 text-xs text-stone-200 leading-relaxed font-sans focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>
          </div>

          {/* Botones de Acción: Copiar y Abrir WhatsApp */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={copiarMensaje}
              className="btn-outline-gold text-xs py-3 px-5 w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              <span>{copiado ? "¡Copiado al Portapapeles!" : "Copiar Texto"}</span>
            </button>

            <button
              type="button"
              onClick={abrirWhatsApp}
              className="btn-gold text-xs py-3 px-6 w-full sm:w-auto flex items-center justify-center gap-2 bg-[#25D366] text-black font-bold shadow-lg"
            >
              <Send className="w-4 h-4 fill-current" />
              <span>Abrir Directo en WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
