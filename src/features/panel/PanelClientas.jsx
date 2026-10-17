import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { formatMXN } from '../../data/productos';
import {
  Users,
  Sparkles,
  TrendingUp,
  Gift,
  Clock,
  Search,
  MessageCircle,
  Plus,
  Minus
} from 'lucide-react';

export const PanelClientas = () => {
  const clientas = useStore((state) => state.clientas);
  const ajustarPuntos = useStore((state) => state.ajustarPuntosClienta);
  const diasOffsetSimulados = useStore((state) => state.diasOffsetSimulados);
  const showToast = useStore((state) => state.showToast);

  const [busqueda, setBusqueda] = useState('');
  const [modalPuntos, setModalPuntos] = useState(null); // clienta
  const [puntosDelta, setPuntosDelta] = useState(50);

  const clientasFiltradas = clientas.filter((c) => {
    if (!busqueda) return true;
    const q = busqueda.toLowerCase();
    return (
      c.nombre.toLowerCase().includes(q) ||
      c.ciudad.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  const aplicarAjustePuntos = () => {
    if (modalPuntos) {
      ajustarPuntos(modalPuntos.id, puntosDelta);
      setModalPuntos(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-amber-400 block mb-1">
            Comunidad y Fidelización
          </span>
          <h1 className="font-serif text-3xl font-bold text-amber-100">
            Clientas y Tendencias de Color
          </h1>
          <p className="text-xs text-stone-400">
            Directorio de clientas frecuentes, saldo de Puntos AGO y analítica predictiva de demanda de color.
          </p>
        </div>
      </div>

      {/* BLOQUE TENDENCIAS DE COLOR (INTELIGENCIA DE COMPRA PARA ARACELI) */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-amber-500/30 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h3 className="font-serif text-xl font-bold text-amber-200 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            Tendencias de Color (Basado en Eye Lab y Recomendador)
          </h3>
          <span className="text-[11px] font-mono text-emerald-400 font-bold">
            Miel Satín +28% esta semana
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-stone-400 block mb-1">Color Más Probado en Eye Lab</span>
            <strong className="text-amber-300 text-sm block">1. Miel Satín (34% del interés)</strong>
            <p className="text-stone-400 text-[11px] mt-1">
              Recomendación para Araceli: Reabastecer 15 piezas en graduaciones -1.50 a -3.00.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-stone-400 block mb-1">Mayor Crecimiento en Búsquedas</span>
            <strong className="text-emerald-300 text-sm block">2. Verde Esmeralda (+22%)</strong>
            <p className="text-stone-400 text-[11px] mt-1">
              Fuerte demanda en clientas que eligen entrega express por DiDi para fines de semana.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-stone-400 block mb-1">Tono Preferido en Fotos/TikTok</span>
            <strong className="text-blue-300 text-sm block">3. Gris Platino Sublime</strong>
            <p className="text-stone-400 text-[11px] mt-1">
              Alta conversión en cosméticos 0.00 para creadoras de contenido en CDMX.
            </p>
          </div>
        </div>
      </div>

      {/* LISTA DE CLIENTAS */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl space-y-4 p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="font-serif text-xl font-bold text-white">
            Directorio de Clientas ({clientas.length})
          </h3>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, ciudad o correo..."
              className="w-full pl-9 pr-3 py-1.5 rounded-full bg-neutral-950 border border-neutral-700 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-950 text-stone-400 font-mono uppercase text-[10px] border-b border-neutral-800">
              <tr>
                <th className="py-3 px-4">Clienta</th>
                <th className="py-3 px-4">Ubicación</th>
                <th className="py-3 px-4">Nivel & Puntos</th>
                <th className="py-3 px-4">Modelo Favorito</th>
                <th className="py-3 px-4">Próxima Renovación</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {clientasFiltradas.map((cli) => {
                const diasRestantes = Math.max(0, cli.proximaRenovacionDias - diasOffsetSimulados);

                return (
                  <tr key={cli.id} className="hover:bg-neutral-850 transition-colors">
                    <td className="py-3.5 px-4">
                      <strong className="text-white block font-sans">{cli.nombre}</strong>
                      <span className="text-[11px] text-stone-400 font-mono">{cli.telefono}</span>
                    </td>

                    <td className="py-3.5 px-4 text-stone-300">
                      {cli.ciudad}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        {cli.nivel} ({cli.puntos} pts)
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-stone-300">
                      {cli.colorFavorito}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`font-mono text-xs font-semibold ${
                          diasRestantes <= 5
                            ? 'text-rose-400 animate-pulse'
                            : diasRestantes <= 15
                            ? 'text-amber-400'
                            : 'text-stone-400'
                        }`}
                      >
                        En {diasRestantes} días ({cli.productoPorRenovar})
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setModalPuntos(cli);
                          setPuntosDelta(50);
                        }}
                        className="btn-ghost text-[11px] py-1 px-2.5 inline-flex items-center gap-1 text-amber-300"
                        title="Ajustar o regalar puntos"
                      >
                        <Gift className="w-3 h-3" />
                        <span>Ajustar Puntos</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL AJUSTAR PUNTOS */}
      {modalPuntos && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-amber-500/40 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-scale-in text-xs">
            <h3 className="font-serif text-lg font-bold text-amber-200">
              Ajustar Puntos AGO a {modalPuntos.nombre}
            </h3>
            <p className="text-stone-400">
              Saldo actual: <strong>{modalPuntos.puntos} puntos</strong>
            </p>

            <div>
              <label className="text-stone-300 block mb-1">Puntos a sumar o restar:</label>
              <input
                type="number"
                value={puntosDelta}
                onChange={(e) => setPuntosDelta(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-white font-mono text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalPuntos(null)}
                className="btn-ghost text-xs px-3 py-1.5"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={aplicarAjustePuntos}
                className="btn-gold text-xs px-4 py-1.5"
              >
                Guardar Ajuste
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
