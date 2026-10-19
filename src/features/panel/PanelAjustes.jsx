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
  Building,
  HelpCircle,
  Sliders,
  Eye,
  Camera,
  Clock
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
          <span className="text-[11px] uppercase tracking-[0.25em] text-sand block mb-1">
            Configuración del Sistema
          </span>
          <h1 className="font-serif text-3xl font-normal text-champagne">
            Ajustes de Operación & Catálogo
          </h1>
          <p className="text-sm text-stone font-light">
            Control de parámetros del negocio, graduaciones, cuentas bancarias y tarifas de entrega.
          </p>
        </div>

        <button
          type="button"
          onClick={resetearDemo}
          className="px-4 py-2 rounded-full text-xs text-rose-300 border border-rose-500/30 hover:bg-rose-500/10 flex items-center gap-1.5 self-start sm:self-auto transition-colors"
          title="Borrar cambios y restaurar datos de fábrica"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Resetear Toda la Demo</span>
        </button>
      </div>

      <form onSubmit={guardarCambios} className="space-y-6 text-sm">
        {/* BLOQUE DESTACADO: PARÁMETROS DEL NEGOCIO (PREGUNTAS ABIERTAS DE ARACELI) */}
        <div className="bg-espresso border border-brass/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-cocoa pb-4">
            <h3 className="font-serif text-xl text-champagne flex items-center gap-2">
              <Sliders className="w-5 h-5 text-brass" />
              Parámetros Clave del Negocio (Configurables)
            </h3>
            <span className="text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-brass/10 text-gilt border border-brass/20">
              Personalizable en 1 clic
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Paso de graduación */}
            <div className="p-4 rounded-2xl bg-ink/70 border border-cocoa/80 space-y-2">
              <label className="text-xs uppercase tracking-wider text-sand block font-medium">
                1. Paso de Graduación para Miopía:
              </label>
              <select
                value={formData.pasoGraduacion ?? 0.25}
                onChange={(e) => setFormData({ ...formData, pasoGraduacion: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-espresso border border-cocoa text-champagne focus:border-brass focus:outline-none"
              >
                <option value={0.25}>Pasos de 0.25 (-0.50, -0.75, -1.00... recomendado)</option>
                <option value={0.50}>Pasos de 0.50 (-0.50, -1.00, -1.50... simplificado)</option>
              </select>
              <p className="text-[11px] text-stone">
                Define las opciones visibles en el selector de graduación independiente OD/OI.
              </p>
            </div>

            {/* 2. Tipo de graduados */}
            <div className="p-4 rounded-2xl bg-ink/70 border border-cocoa/80 space-y-2">
              <label className="text-xs uppercase tracking-wider text-sand block font-medium">
                2. Oferta de Pupilentes Graduados:
              </label>
              <select
                value={formData.tipoGraduadosDisponibles ?? 'color'}
                onChange={(e) => setFormData({ ...formData, tipoGraduadosDisponibles: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-espresso border border-cocoa text-champagne focus:border-brass focus:outline-none"
              >
                <option value="color">Solo pupilentes de color con graduación</option>
                <option value="transparentes">Solo lentes de contacto transparentes</option>
                <option value="ambos">Ambos (de color y transparentes)</option>
              </select>
              <p className="text-[11px] text-stone">
                Determina si se despliegan líneas transparentes o exclusivamente cosméticas graduadas.
              </p>
            </div>

            {/* 3. Graduación en estéticos y fantasía */}
            <div className="p-4 rounded-2xl bg-ink/70 border border-cocoa/80 space-y-2">
              <label className="text-xs uppercase tracking-wider text-sand block font-medium">
                3. ¿Lentes Estéticos y Fantasía también se gradúan?
              </label>
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-stone hover:text-champagne">
                  <input
                    type="radio"
                    name="gradEsteticos"
                    checked={!formData.permitirGraduacionEsteticosFantasia}
                    onChange={() => setFormData({ ...formData, permitirGraduacionEsteticosFantasia: false })}
                    className="accent-brass"
                  />
                  <span>No, solo plano (0.00)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-stone hover:text-champagne">
                  <input
                    type="radio"
                    name="gradEsteticos"
                    checked={!!formData.permitirGraduacionEsteticosFantasia}
                    onChange={() => setFormData({ ...formData, permitirGraduacionEsteticosFantasia: true })}
                    className="accent-brass"
                  />
                  <span>Sí, también graduables</span>
                </label>
              </div>
              <p className="text-[11px] text-stone">
                Si se desactiva, los modelos de fantasía y cosméticos simples se venden únicamente sin aumento.
              </p>
            </div>

            {/* 4. Costo Pantitlán / Tepalcates */}
            <div className="p-4 rounded-2xl bg-ink/70 border border-cocoa/80 space-y-2">
              <label className="text-xs uppercase tracking-wider text-sand block font-medium">
                4. Costo Entrega Personal en Metro Pantitlán / Tepalcates:
              </label>
              <div className="flex items-center gap-3">
                <span className="text-stone">$</span>
                <input
                  type="number"
                  step="5"
                  value={formData.costoEntregaPantitlanTepalcates ?? 0}
                  onChange={(e) => setFormData({ ...formData, costoEntregaPantitlanTepalcates: parseFloat(e.target.value) || 0 })}
                  className="w-32 px-3 py-1.5 rounded-lg bg-espresso border border-cocoa text-champagne font-mono focus:border-brass focus:outline-none"
                />
                <span className="text-stone text-xs">MXN ({formData.costoEntregaPantitlanTepalcates === 0 ? 'Entrega Gratuita $0' : 'Con cobro de entrega'})</span>
              </div>
              <p className="text-[11px] text-stone">
                Actualmente configurado como cortesía sin costo ($0) en beneficio de clientas de zona oriente.
              </p>
            </div>

            {/* 5. Origen de Fotografías */}
            <div className="p-4 rounded-2xl bg-ink/70 border border-cocoa/80 space-y-2 md:col-span-2">
              <label className="text-xs uppercase tracking-wider text-sand block font-medium">
                5. Origen y Curaduría de Fotografías de Catálogo:
              </label>
              <select
                value={formData.origenFotosCatalogo ?? 'mixto'}
                onChange={(e) => setFormData({ ...formData, origenFotosCatalogo: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-espresso border border-cocoa text-champagne focus:border-brass focus:outline-none"
              >
                <option value="propias">Fotografías 100% propias de Araceli y clientas autorizadas</option>
                <option value="proveedores">Catálogo oficial provisto por fabricantes certificados</option>
                <option value="mixto">Mixto (Fotos propias de producto real + arte editorial certificado)</option>
              </select>
              <p className="text-[11px] text-stone">
                Permite mantener la trazabilidad de derechos de autor y avisos de privacidad conforme a las normas de imagen.
              </p>
            </div>
          </div>
        </div>

        {/* BLOQUE 1: DATOS GENERALES */}
        <div className="bg-espresso border border-cocoa rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <h3 className="font-serif text-xl text-champagne flex items-center gap-2">
            <Building className="w-5 h-5 text-brass" />
            Datos de la Marca y Contacto
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-stone block mb-1 text-xs">Nombre Comercial:</label>
              <input
                type="text"
                value={formData.nombreNegocio}
                onChange={(e) => setFormData({ ...formData, nombreNegocio: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-ink border border-cocoa text-champagne focus:border-brass focus:outline-none"
              />
            </div>

            <div>
              <label className="text-stone block mb-1 text-xs">Fundadora:</label>
              <input
                type="text"
                value={formData.fundadora}
                onChange={(e) => setFormData({ ...formData, fundadora: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-ink border border-cocoa text-champagne focus:border-brass focus:outline-none"
              />
            </div>

            <div>
              <label className="text-stone block mb-1 text-xs">Teléfono WhatsApp de Venta:</label>
              <input
                type="text"
                value={formData.telefonoWhatsApp}
                onChange={(e) => setFormData({ ...formData, telefonoWhatsApp: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-ink border border-cocoa text-champagne font-mono focus:border-brass focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* BLOQUE 2: CUENTAS BANCARIAS */}
        <div className="bg-espresso border border-cocoa rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <h3 className="font-serif text-xl text-champagne flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-brass" />
            Cuentas para Transferencias SPEI (Visibles en Checkout)
          </h3>

          <div className="space-y-3">
            {formData.cuentasPago.map((cuenta, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-ink border border-cocoa/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-stone block mb-0.5">Banco / Plataforma:</label>
                  <strong className="text-champagne block">{cuenta.banco}</strong>
                  <span className="text-stone text-[11px]">{cuenta.tipo}</span>
                </div>
                <div>
                  <label className="text-[10px] text-stone block mb-0.5">CLABE / Número:</label>
                  <span className="font-mono text-sand font-bold">{cuenta.numero}</span>
                </div>
                <div>
                  <label className="text-[10px] text-stone block mb-0.5">Titular de la cuenta:</label>
                  <span className="text-stone">{cuenta.titular}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BLOQUE 3: ENTREGAS EN METRO CDMX */}
        <div className="bg-espresso border border-cocoa rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <h3 className="font-serif text-xl text-champagne flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brass" />
            Tarifas de Entrega Personal en Metro CDMX
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-ink border border-cocoa/80">
              <span className="text-stone block mb-1">Estaciones Gratuitas ($0 MXN):</span>
              <strong className="text-emerald-400 block mb-1">Metro Pantitlán & Metro Tepalcates</strong>
              <p className="text-stone text-[11px]">
                Puntos estratégicos para entrega personal sin cargo.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-ink border border-cocoa/80">
              <label className="text-stone block mb-1">Costo extra por otra estación de la red:</label>
              <div className="flex items-center gap-2">
                <span className="text-stone">$</span>
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
                  className="w-32 px-3 py-1.5 rounded-lg bg-espresso border border-cocoa text-champagne font-mono focus:border-brass focus:outline-none"
                />
                <span className="text-stone">MXN</span>
              </div>
            </div>
          </div>
        </div>

        {/* BLOQUE 4: HORARIOS DE ENTREGA (EDITABLES POR MÉTODO) */}
        <div className="bg-espresso border border-cocoa rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <h3 className="font-serif text-xl text-champagne flex items-center gap-2">
            <Clock className="w-5 h-5 text-brass" />
            Horarios de Entrega Configurables
          </h3>
          <p className="text-xs text-stone font-light">
            Textos de horario mostrados a las clientas en el Checkout según el método de entrega seleccionado.
          </p>

          <div className="space-y-4 pt-2">
            {(formData.horariosEntrega || [
              { id: 'metro', label: 'Metro Pantitlán / Tepalcates', horarios: ['10:00–14:00', '15:00–19:00'] },
              { id: 'didi', label: 'DiDi Express', horarios: ['Cualquier hora con 2h de aviso'] },
              { id: 'paqueteria', label: 'Paquetería', horarios: ['Lunes a viernes, recolección antes de 13:00'] }
            ]).map((metodo, idx) => (
              <div key={metodo.id} className="p-4 rounded-xl bg-ink border border-cocoa/80 space-y-2">
                <label className="text-xs uppercase tracking-wider text-sand block font-medium">
                  {metodo.label}:
                </label>
                <input
                  type="text"
                  value={Array.isArray(metodo.horarios) ? metodo.horarios.join(', ') : metodo.horarios || ''}
                  onChange={(e) => {
                    const nuevoArray = [...(formData.horariosEntrega || [
                      { id: 'metro', label: 'Metro Pantitlán / Tepalcates', horarios: ['10:00–14:00', '15:00–19:00'] },
                      { id: 'didi', label: 'DiDi Express', horarios: ['Cualquier hora con 2h de aviso'] },
                      { id: 'paqueteria', label: 'Paquetería', horarios: ['Lunes a viernes, recolección antes de 13:00'] }
                    ])];
                    nuevoArray[idx] = {
                      ...nuevoArray[idx],
                      horarios: e.target.value.split(',').map((s) => s.trim())
                    };
                    setFormData({ ...formData, horariosEntrega: nuevoArray });
                  }}
                  placeholder="Ej. 10:00–14:00, 15:00–19:00"
                  className="w-full px-3 py-2 rounded-lg bg-espresso border border-cocoa text-champagne text-xs font-mono focus:border-brass focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* BOTÓN GUARDAR AJUSTES */}
        <div className="flex justify-end pt-4">
          <button type="submit" className="btn-brass px-8 py-3 flex items-center gap-2 shadow-lg">
            <Save className="w-4 h-4" />
            <span>Guardar Todos los Ajustes</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default PanelAjustes;

