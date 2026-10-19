import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import {
  TIPOS_PRODUCTO,
  FAMILIAS_COLOR,
  GRADUACIONES,
  formatMXN,
  calcularStockTotal
} from '../../data/productos';
import { guardarImagen } from '../../lib/imageStorage';
import {
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  Eye,
  Check,
  X,
  Upload,
  Crop,
  Layers,
  CircleDot,
  Image as ImageIcon
} from 'lucide-react';

export const PanelCatalogo = () => {
  const productos = useStore((state) => state.productos);
  const agregarProducto = useStore((state) => state.agregarProducto);
  const actualizarProducto = useStore((state) => state.actualizarProducto);
  const eliminarProducto = useStore((state) => state.eliminarProducto);
  const showToast = useStore((state) => state.showToast);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [modalTextura, setModalTextura] = useState(false);
  const [productoParaTextura, setProductoParaTextura] = useState(null);

  // Formulario de modelo con soporte de fotos reales y tipo de producto
  const [formData, setFormData] = useState({
    id: '',
    sku: '',
    nombre: '',
    tipo: 'graduado',
    familia: 'miel',
    tonalidad: 'natural',
    duracion: 'anual',
    precio: 649,
    precioKit: 799,
    descripcion: '',
    imagen: '',
    permiteGraduacion: true,
  });

  // Estados de la herramienta "Textura de Prueba"
  const [fotoLenteOriginal, setFotoLenteOriginal] = useState(null);
  const [centroX, setCentroX] = useState(50); // %
  const [centroY, setCentroY] = useState(50); // %
  const [radioLente, setRadioLente] = useState(40); // %
  const [huecoPupila, setHuecoPupila] = useState(28); // %

  const abrirNuevo = () => {
    const id = `modelo-${Date.now()}`;
    setFormData({
      id,
      sku: `AGO-${Date.now().toString().slice(-4)}`,
      nombre: '',
      tipo: 'graduado',
      familia: 'miel',
      tonalidad: 'natural',
      duracion: 'anual',
      precio: 649,
      precioKit: 799,
      descripcion: '',
      imagen: '/img/iris/miel.webp',
      permiteGraduacion: true,
    });
    setModoEdicion(false);
    setModalAbierto(true);
  };

  const abrirEditar = (prod) => {
    setFormData({ ...prod });
    setModoEdicion(true);
    setModalAbierto(true);
  };

  // Carga y compresión de fotografía del producto a 4:5
  const handleCargarFoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target.result;
      // Guardar en IndexedDB para no saturar los 5 MB de localStorage
      const imgKey = `prod_${formData.id || Date.now()}`;
      await guardarImagen(imgKey, dataUrl);

      setFormData((prev) => ({
        ...prev,
        imagen: dataUrl,
      }));
      showToast('Fotografía procesada y guardada en IndexedDB', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Guardar modelo
  const guardarModelo = (e) => {
    e.preventDefault();
    if (!formData.nombre) return;

    if (modoEdicion) {
      actualizarProducto(formData);
      showToast('Producto actualizado en catálogo', 'success');
    } else {
      const stockInicial = {};
      GRADUACIONES.forEach((g) => {
        stockInicial[g] = g === '0.00' ? 15 : 6;
      });
      agregarProducto({
        ...formData,
        popularidad: 85,
        stockPorGraduacion: stockInicial,
      });
      showToast('Nuevo modelo añadido a la tienda', 'success');
    }

    setModalAbierto(false);
  };

  // Herramienta "Textura de Prueba" (§9.3)
  const abrirGeneradorTextura = (prod) => {
    setProductoParaTextura(prod);
    setFotoLenteOriginal(prod.imagen || `/img/iris/${prod.familia}.webp`);
    setModalTextura(true);
  };

  const generarTexturaTransparente = async () => {
    if (!productoParaTextura) return;

    // Crear canvas RGBA 640x640 con recorte circular y hueco transparente
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = fotoLenteOriginal;

    img.onload = async () => {
      ctx.clearRect(0, 0, 640, 640);

      const cx = (640 * centroX) / 100;
      const cy = (640 * centroY) / 100;
      const r = (640 * radioLente) / 100;

      // 1. Recorte circular exterior con borde difuminado
      ctx.save();
      ctx.beginPath();
      ctx.arc(320, 320, r, 0, Math.PI * 2);
      ctx.clip();

      ctx.drawImage(img, 0, 0, 640, 640);
      ctx.restore();

      // 2. Recorte de pupila transparente al centro
      const rPupila = (r * huecoPupila) / 100;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(320, 320, rPupila, 0, Math.PI * 2);
      ctx.fill();

      // Guardar en IndexedDB
      const dataUrl = canvas.toDataURL('image/png');
      const texturaKey = `tex_${productoParaTextura.id}`;
      await guardarImagen(texturaKey, dataUrl);

      actualizarProducto({
        ...productoParaTextura,
        texturaPrueba: dataUrl,
      });

      showToast(`Textura transparente calibrada para ${productoParaTextura.nombre}`, 'success');
      setModalTextura(false);
    };
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto text-champagne">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cocoa pb-6">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-sand block mb-1">
            Gestión de Catálogo
          </span>
          <h1 className="font-serif text-3xl font-normal text-champagne">
            Modelos de Lentes con Fotografía Real (4:5)
          </h1>
          <p className="text-xs text-stone font-light">
            Alta rápida de productos con fotos reales, recorte a 4:5 y generador de textura para el probador en vivo.
          </p>
        </div>

        <button onClick={abrirNuevo} className="btn-brass text-xs px-5 py-2 flex items-center gap-1.5 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>Añadir Nuevo Producto</span>
        </button>
      </div>

      {/* Grid de Productos con Fotografía Real (4:5) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productos.map((prod) => {
          const totalStock = calcularStockTotal(prod);

          return (
            <div
              key={prod.id}
              className="group bg-espresso/60 border border-cocoa/80 rounded-2xl p-4 flex flex-col justify-between hover:border-brass/40 transition-all shadow-lg"
            >
              <div>
                {/* Imagen del producto en 4:5 */}
                <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-ink flex items-center justify-center p-4 mb-3 border border-cocoa">
                  <img
                    src={prod.imagen || `/img/iris/${prod.familia}.webp`}
                    alt={prod.nombre}
                    className="w-full h-full object-cover rounded-full"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-ink/80 text-[10px] uppercase tracking-wider text-sand">
                    {prod.tipo}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mb-1">
                  <strong className="font-serif text-lg text-champagne">
                    {prod.nombre}
                  </strong>
                  <span className="font-mono text-xs text-sand font-semibold">
                    {formatMXN(prod.precio)}
                  </span>
                </div>

                <p className="text-xs text-stone font-light line-clamp-2 mb-3">
                  {prod.descripcion}
                </p>

                <div className="text-[11px] text-stone flex items-center justify-between pb-2 border-b border-cocoa/40">
                  <span>Familia {prod.familia}</span>
                  <span>{totalStock} pzas en stock</span>
                </div>
              </div>

              {/* Botones de acción rápida: Editar + Generar Textura */}
              <div className="flex items-center gap-2 pt-3">
                <button
                  onClick={() => abrirGeneradorTextura(prod)}
                  className="flex-1 py-1.5 rounded-lg bg-ink border border-cocoa hover:border-brass/50 text-[11px] text-sand flex items-center justify-center gap-1 transition-colors"
                  title="Generar textura transparente para el probador en vivo"
                >
                  <CircleDot className="w-3 h-3 text-brass" />
                  <span>Textura probador</span>
                </button>

                <button
                  onClick={() => abrirEditar(prod)}
                  className="p-1.5 rounded-lg bg-ink border border-cocoa hover:border-brass/50 text-stone hover:text-champagne transition-colors"
                  title="Editar producto"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar ${prod.nombre} del catálogo?`)) {
                      eliminarProducto(prod.id);
                      showToast('Producto eliminado', 'info');
                    }
                  }}
                  className="p-1.5 rounded-lg bg-ink border border-cocoa hover:border-rose-500/50 text-stone hover:text-rose-300 transition-colors"
                  title="Eliminar producto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL ALTA / EDICIÓN DE PRODUCTO EN 1 PANTALLA (§9.3) */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-espresso border border-cocoa rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
            <h2 className="font-serif text-2xl text-champagne font-normal">
              {modoEdicion ? 'Editar Modelo' : 'Alta de Modelo en 1 Pantalla'}
            </h2>

            <form onSubmit={guardarModelo} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-stone block mb-1">Nombre Comercial:</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej. Siri Green"
                    className="w-full px-3 py-2 rounded-xl bg-ink border border-cocoa text-champagne focus:border-brass focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-stone block mb-1">Categoría / Tipo:</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-ink border border-cocoa text-champagne focus:border-brass focus:outline-none"
                  >
                    <option value="graduado">Graduado (Miopía −0.50 a −8.00)</option>
                    <option value="estetico">Estético (Sin aumento / Plano)</option>
                    <option value="fantasia">Fantasía / Caracterización</option>
                    <option value="accesorio">Accesorio / Kit</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-stone block mb-1">Familia de Tono:</label>
                  <select
                    value={formData.familia}
                    onChange={(e) => setFormData({ ...formData, familia: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-ink border border-cocoa text-champagne focus:border-brass focus:outline-none"
                  >
                    {FAMILIAS_COLOR.filter((f) => f.id !== 'todos').map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-stone block mb-1">Precio Par (MXN):</label>
                  <input
                    type="number"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-ink border border-cocoa text-champagne font-mono"
                  />
                </div>
                <div>
                  <label className="text-stone block mb-1">Precio con Kit (MXN):</label>
                  <input
                    type="number"
                    value={formData.precioKit}
                    onChange={(e) => setFormData({ ...formData, precioKit: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-ink border border-cocoa text-champagne font-mono"
                  />
                </div>
              </div>

              {/* Subida de Fotografía Real */}
              <div className="p-4 rounded-xl bg-ink border border-cocoa space-y-2">
                <label className="text-sand uppercase tracking-wider block font-medium">
                  Fotografía Real del Producto (4:5):
                </label>
                <div className="flex items-center gap-4">
                  {formData.imagen && (
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-brass/40 shrink-0">
                      <img src={formData.imagen} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <label className="flex-1 px-4 py-2.5 rounded-xl border border-dashed border-cocoa hover:border-brass/50 cursor-pointer flex items-center justify-center gap-2 text-stone hover:text-champagne transition-colors">
                    <Upload className="w-4 h-4 text-brass" />
                    <span>Seleccionar fotografía del producto (se guarda en IndexedDB)</span>
                    <input type="file" accept="image/*" onChange={handleCargarFoto} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="text-stone block mb-1">Descripción de Estilismo:</label>
                <textarea
                  rows="2"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Detalles sobre cómo realza la mirada..."
                  className="w-full px-3 py-2 rounded-xl bg-ink border border-cocoa text-champagne focus:border-brass focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-5 py-2 rounded-full text-xs text-stone border border-cocoa hover:text-champagne"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-brass text-xs px-6 py-2">
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL HERRAMIENTA 'TEXTURA DE PRUEBA' (§9.3) */}
      {modalTextura && productoParaTextura && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-espresso border border-cocoa rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-cocoa pb-3">
              <h2 className="font-serif text-2xl text-champagne font-normal">
                Generador de Textura para Probador en Vivo
              </h2>
              <span className="text-xs font-mono text-sand">{productoParaTextura.nombre}</span>
            </div>

            <p className="text-xs text-stone font-light">
              Ajusta el radio del lente y el orificio de pupila para generar el PNG RGBA 640×640 que se montará sobre el rostro en el probador en vivo.
            </p>

            {/* Vista previa interactiva con círculos de recorte */}
            <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden bg-ink border border-brass/40 flex items-center justify-center">
              <img
                src={fotoLenteOriginal}
                alt="Original"
                className="w-full h-full object-cover"
              />

              {/* Guía círculo exterior del lente */}
              <div
                className="absolute rounded-full border-2 border-brass pointer-events-none"
                style={{ width: `${radioLente * 2}%`, height: `${radioLente * 2}%` }}
              />

              {/* Guía orificio de pupila */}
              <div
                className="absolute rounded-full border-2 border-dashed border-rose-400 bg-ink/70 pointer-events-none"
                style={{
                  width: `${(radioLente * 2 * huecoPupila) / 100}%`,
                  height: `${(radioLente * 2 * huecoPupila) / 100}%`,
                }}
              />
            </div>

            {/* Controles deslizantes */}
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-stone">
                  <span>Radio Exterior del Lente:</span>
                  <span className="font-mono text-champagne">{radioLente}%</span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="48"
                  value={radioLente}
                  onChange={(e) => setRadioLente(parseFloat(e.target.value))}
                  className="w-full accent-brass cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-stone">
                  <span>Hueco de Pupila Transparente:</span>
                  <span className="font-mono text-champagne">{huecoPupila}%</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="45"
                  value={huecoPupila}
                  onChange={(e) => setHuecoPupila(parseFloat(e.target.value))}
                  className="w-full accent-brass cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setModalTextura(false)}
                className="px-5 py-2 rounded-full text-xs text-stone border border-cocoa hover:text-champagne"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={generarTexturaTransparente}
                className="btn-brass text-xs px-6 py-2"
              >
                Generar y Guardar Textura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PanelCatalogo;
