import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import {
  Settings,
  CreditCard,
  MapPin,
  Sparkles,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertTriangle,
  Building
} from 'lucide-react';

export const PanelAjustes = () => {
  const ajustes = useStore((state) => state.ajustes);
  const actualizarAjustes = useStore((state) => state.actualizarAjustes);
  const resetearDemo = useStore((state) => state.resetearDemo);
  const showToast = useStore((state) => state.showToast);

  const [formData, setFormData] = useState({ ...ajustes });

  const guardarCambios = (e) => {
    e.preventDefault();
    actualizarAjustes(formData);
    showToast('Ajustes del negocio guardados correctamente', 'success');
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-amber-400 block mb-1">
            Configuración del Sistema
          </span>
          <h1 className="font-serif text-3xl font-bold text-amber-100">
            Ajustes de Operación & Cuentas
          </h1>
          <p className="text-xs text-stone-400">
            Control de cuentas bancarias, tarifas de entrega en metro y reglas de puntos.
          </p>
        </div>

        <button
          type="button"
          onClick={resetearDemo}
          className="btn-ghost text-xs px-4 py-2 text-rose-300 border-rose-500/30 hover:bg-rose-500/10 flex items-center gap-1.5 self-start sm:self-auto"
          title="Borrar cambios y restaurar datos de fábrica"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Resetear Toda la Demo</span>
        </button>
      </div>

      <form onSubmit={guardarCambios} className="space-y-6 text-xs">
        {/* BLOQUE 1: DATOS GENERALES */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="font-serif text-lg font-bold text-amber-200 flex items-center gap-2">
            <Building className="w-4 h-4 text-amber-400" />
            Datos de la Marca y Contacto
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-stone-400 block mb-1">Nombre Comercial:</label>
              <input
                type="text"
                value={formData.nombreNegocio}
                onChange={(e) => setFormData({ ...formData, nombreNegocio: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-white"
              />
            </div>

            <div>
              <label className="text-stone-400 block mb-1">Fundadora:</label>
              <input
                type="text"
                value={formData.fundadora}
                onChange={(e) => setFormData({ ...formData, fundadora: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-white"
              />
            </div>

            <div>
              <label className="text-stone-400 block mb-1">Teléfono WhatsApp de Venta:</label>
              <input
                type="text"
                value={formData.telefonoWhatsApp}
                onChange={(e) => setFormData({ ...formData, telefonoWhatsApp: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* BLOQUE 2: CUENTAS BANCARIAS */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="font-serif text-lg font-bold text-amber-200 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-amber-400" />
            Cuentas para Transferencias SPEI (Visibles en Checkout)
          </h3>

          <div className="space-y-3">
            {formData.cuentasPago.map((cuenta, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-stone-500 block mb-0.5">Banco / Plataforma:</label>
                  <strong className="text-white block">{cuenta.banco}</strong>
                  <span className="text-stone-400 text-[11px]">{cuenta.tipo}</span>
                </div>
                <div>
                  <label className="text-[10px] text-stone-500 block mb-0.5">CLABE / Número:</label>
                  <span className="font-mono text-amber-300 font-bold">{cuenta.numero}</span>
                </div>
                <div>
                  <label className="text-[10px] text-stone-500 block mb-0.5">Titular de la cuenta:</label>
                  <span className="text-stone-300">{cuenta.titular}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BLOQUE 3: ENTREGAS EN METRO CDMX */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="font-serif text-lg font-bold text-amber-200 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            Tarifas de Entrega Personal en Metro CDMX
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-stone-400 block mb-1">Estaciones Gratuitas ($0 MXN):</span>
              <strong className="text-emerald-400 block mb-1">Metro Pantitlán & Metro Tepalcates</strong>
              <p className="text-stone-500 text-[11px]">
                Puntos estratégicos declarados en el diagnóstico para entrega sin costo.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
              <label className="text-stone-400 block mb-1">Costo extra por otra estación de la red:</label>
              <div className="flex items-center gap-2">
                <span className="text-stone-400">$</span>
                <input
                  type="number"
                  value={formData.entregasMetro.costoOtraEstacion}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      entregasMetro: {
                        ...formData.entregasMetro,
                        costoOtraEstacion: parseFloat(e.target.value) || 0
                      }
                    })
                  }
                  className="w-32 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white font-mono"
                />
                <span className="text-stone-400">MXN</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTÓN GUARDAR AJUSTES */}
        <div className="flex justify-end pt-4">
          <button type="submit" className="btn-gold text-xs px-8 py-3 flex items-center gap-2 shadow-lg">
            <Save className="w-4 h-4" />
            <span>Guardar Todos los Ajustes</span>
          </button>
        </div>
      </form>
    </div>
  );
};
