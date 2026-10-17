import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { IrisRenderer } from '../../components/common/IrisRenderer';
import { FAMILIAS_COLOR, GRADUACIONES, formatMXN, calcularStockTotal } from '../../data/productos';
import { Plus, Edit2, Trash2, Sparkles, Eye, Check, X } from 'lucide-react';

export const PanelCatalogo = () => {
  const productos = useStore((state) => state.productos);
  const agregarProducto = useStore((state) => state.agregarProducto);
  const actualizarProducto = useStore((state) => state.actualizarProducto);
  const eliminarProducto = useStore((state) => state.eliminarProducto);
  const showToast = useStore((state) => state.showToast);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  // Formulario de modelo
  const [formData, setFormData] = useState({
    id: '',
    nombre: '',
    familia: 'miel',
    tonalidad: 'natural',
    duracion: 'anual',
    precio: 649,
    precioKit: 799,
    descripcion: '',
    hexPrincipal: '#D4A345',
    hexSecundario: '#8F641B',
    hexAcento: '#F5E09A',
    anilloLimbal: true,
    densidadFibras: 0.85,
    diametro: '14.2 mm',
    curvaBase: '8.6 mm'
  });

  const abrirNuevo = () => {
    setFormData({
      id: `modelo-${Date.now()}`,
      nombre: '',
      familia: 'miel',
      tonalidad: 'natural',
      duracion: 'anual',
      precio: 649,
      precioKit: 799,
      descripcion: '',
      hexPrincipal: '#D4A345',
      hexSecundario: '#8F641B',
      hexAcento: '#F5E09A',
      anilloLimbal: true,
      densidadFibras: 0.85,
      diametro: '14.2 mm',
      curvaBase: '8.6 mm'
    });
    setModoEdicion(false);
    setModalAbierto(true);
  };

  const abrirEditar = (prod) => {
    setFormData({ ...prod });
    setModoEdicion(true);
    setModalAbierto(true);
  };

  const guardarModelo = (e) => {
    e.preventDefault();
    if (!formData.nombre) return;

    if (modoEdicion) {
      actualizarProducto(formData);
    } else {
      // Crear stock inicial para graduaciones
      const stockInicial = {};
      GRADUACIONES.forEach((g) => {
        stockInicial[g] = g === '0.00' ? 12 : 5;
      });
      agregarProducto({
        ...formData,
        popularidad: 80,
        stockPorGraduacion: stockInicial
      });
    }

    setModalAbierto(false);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-amber-400 block mb-1">
            Gestión Comercial
          </span>
          <h1 className="font-serif text-3xl font-bold text-amber-100">
            Catálogo de Modelos (CRUD en Vivo)
          </h1>
          <p className="text-xs text-stone-400">
            Cualquier modelo nuevo o cambio de precio se publica instantáneamente en la tienda de las clientas.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirNuevo}
          className="btn-gold text-xs px-5 py-2.5 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Dar de Alta Nuevo Modelo</span>
        </button>
      </div>

      {/* Grid de Modelos con Edición */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {productos.map((prod) => {
          const stockTotal = calcularStockTotal(prod);
          return (
            <div
              key={prod.id}
              className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between hover:border-amber-400/40 transition-all shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-neutral-950 text-stone-300 border border-neutral-700">
                    {prod.duracion}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">
                    {stockTotal} pzs en total
                  </span>
                </div>

                <div className="py-4 flex justify-center">
                  <IrisRenderer
                    colorPrincipal={prod.hexPrincipal}
                    colorSecundario={prod.hexSecundario}
                    colorAcento={prod.hexAcento}
                    anilloLimbal={prod.anilloLimbal}
                    densidadFibras={prod.densidadFibras}
                    size={90}
                    hoverDilate={true}
                  />
                </div>

                <h3 className="font-serif text-lg font-bold text-white mb-1">{prod.nombre}</h3>
                <p className="text-[11px] text-stone-400 capitalize mb-2">
                  Familia {prod.familia} · {prod.tonalidad}
                </p>
                <span className="text-base font-bold text-amber-300 font-sans block mb-4">
                  {formatMXN(prod.precio)}
                </span>
              </div>

              <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => abrirEditar(prod)}
                  className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Editar</span>
                </button>

                <button
                  type="button"
                  onClick={() => eliminarProducto(prod.id)}
                  className="p-2 text-stone-500 hover:text-rose-400 transition-colors"
                  title="Retirar de catálogo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL CREAR / EDITAR MODELO CON PREVIEW EN VIVO */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={guardarModelo}
            className="bg-neutral-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl animate-scale-in text-xs"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-serif text-2xl font-bold text-amber-200">
                {modoEdicion ? `Editar "${formData.nombre}"` : 'Alta de Nuevo Modelo'}
              </h3>
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="text-stone-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            {/* PREVIEW EN VIVO DEL IRIS AL MODIFICAR COLORES */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center gap-6">
              <IrisRenderer
                colorPrincipal={formData.hexPrincipal}
                colorSecundario={formData.hexSecundario}
                colorAcento={formData.hexAcento}
                anilloLimbal={formData.anilloLimbal}
                densidadFibras={formData.densidadFibras}
                size={110}
              />
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 block mb-1">
                  Vista Previa en Tienda
                </span>
                <h4 className="font-serif text-xl font-bold text-white">
                  {formData.nombre || 'Nombre del Modelo'}
                </h4>
                <span className="text-amber-300 font-bold block mt-1">
                  {formatMXN(formData.precio || 0)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-stone-400 block mb-1">Nombre comercial:</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej. Miel Champagne"
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Familia de color:</label>
                <select
                  value={formData.familia}
                  onChange={(e) => setFormData({ ...formData, familia: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-white"
                >
                  {FAMILIAS_COLOR.filter((f) => f.id !== 'todos').map((fam) => (
                    <option key={fam.id} value={fam.id}>
                      {fam.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-stone-400 block mb-1">Tonalidad:</label>
                <select
                  value={formData.tonalidad}
                  onChange={(e) => setFormData({ ...formData, tonalidad: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-white"
                >
                  <option value="natural">Natural</option>
                  <option value="intenso">Intenso</option>
                  <option value="cosmetico">Cosmético</option>
                </select>
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Duración:</label>
                <select
                  value={formData.duracion}
                  onChange={(e) => setFormData({ ...formData, duracion: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-white"
                >
                  <option value="anual">Anual</option>
                  <option value="trimestral">Trimestral</option>
                  <option value="mensual">Mensual</option>
                </select>
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Precio MXN:</label>
                <input
                  type="number"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-white font-mono"
                />
              </div>
            </div>

            {/* Selectores de color del Iris */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <span className="font-bold text-amber-200 block uppercase tracking-wider">
                Generador de Iris en Procedimental:
              </span>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-stone-400 block mb-1">Color Principal:</label>
                  <input
                    type="color"
                    value={formData.hexPrincipal}
                    onChange={(e) => setFormData({ ...formData, hexPrincipal: e.target.value })}
                    className="w-full h-8 rounded cursor-pointer bg-transparent"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-stone-400 block mb-1">Color Secundario:</label>
                  <input
                    type="color"
                    value={formData.hexSecundario}
                    onChange={(e) => setFormData({ ...formData, hexSecundario: e.target.value })}
                    className="w-full h-8 rounded cursor-pointer bg-transparent"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-stone-400 block mb-1">Color Acento:</label>
                  <input
                    type="color"
                    value={formData.hexAcento}
                    onChange={(e) => setFormData({ ...formData, hexAcento: e.target.value })}
                    className="w-full h-8 rounded cursor-pointer bg-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="btn-ghost text-xs px-4 py-2"
              >
                Cancelar
              </button>
              <button type="submit" className="btn-gold text-xs px-6 py-2">
                Publicar en Tienda
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
