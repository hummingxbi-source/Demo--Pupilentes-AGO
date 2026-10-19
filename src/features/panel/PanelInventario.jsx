import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ConsultaDisponibilidad, ListaResurtido, useImportarExcel } from './InventarioHerramientas';
import { alertasStock, apartados } from './metricas';
import { useStore } from '../../store/useStore';
import {
  GRADUACIONES,
  GRADUACIONES_MIOPIA,
  calcularStockTotal,
  formatMXN,
  TIPOS_PRODUCTO,
  PRODUCTOS_INICIALES
} from '../../data/productos';
import * as XLSX from 'xlsx';
import {
  Boxes,
  FileSpreadsheet,
  Download,
  Upload,
  Search,
  AlertTriangle,
  Check,
  RefreshCw,
  Plus,
  Minus,
  FileText,
  SlidersHorizontal,
  ClipboardList
} from 'lucide-react';

export const PanelInventario = () => {
  const productos = useStore((state) => state.productos);
  const actualizarStock = useStore((state) => state.actualizarStock);
  const importarProductos = useStore((state) => state.importarProductos);
  const showToast = useStore((state) => state.showToast);

  // Auto-rehidratación si los productos llegan vacíos o sin tipo
  useEffect(() => {
    if (!productos || productos.length === 0 || !productos.some((p) => p.tipo)) {
      importarProductos(PRODUCTOS_INICIALES);
    }
  }, [productos, importarProductos]);

  // Pestañas por tipo según PLAN V3 §9.2
  const [tipoPestana, setTipoPestana] = useState('graduado'); // 'graduado' | 'estetico' | 'fantasia' | 'accesorio'
  const [busqueda, setBusqueda] = useState('');
  const [soloBajoStock, setSoloBajoStock] = useState(false);
  const [modoConteo, setModoConteo] = useState(false);
  const pedidos = useStore((state) => state.pedidos);
  const [params, setParams] = useSearchParams();
  const vista = params.get('vista') || 'matriz';
  const setVista = (v) => setParams(v === 'matriz' ? {} : { vista: v });
  const importarExcel = useImportarExcel();
  const fileRef = useRef(null);

  const resumen = useMemo(() => {
    const ap = apartados(pedidos);
    const piezas = productos.reduce((s, p) => s + calcularStockTotal(p), 0);
    const valor = productos.reduce((s, p) => s + calcularStockTotal(p) * (p.precio || 0), 0);
    const apartadas = Object.values(ap).reduce((s, g) => s + Object.values(g).reduce((a, b) => a + b, 0), 0);
    return { piezas, valor, apartadas, ...alertasStock(productos) };
  }, [productos, pedidos]);

  // Celda en edición rápida
  const [celdaEditando, setCeldaEditando] = useState(null); // { prodId, grad }
  const [valorTemp, setValorTemp] = useState('');

  // Filtrado de productos por tipo
  const productosFiltrados = productos.filter((prod) => {
    if (prod.tipo !== tipoPestana) return false;
    if (busqueda.trim() !== '') {
      const q = busqueda.toLowerCase();
      const match = prod.nombre.toLowerCase().includes(q) || (prod.familia && prod.familia.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (soloBajoStock) {
      const total = calcularStockTotal(prod);
      if (total > 15) return false;
    }
    return true;
  });

  // Guardar edición rápida
  const guardarEdicion = (prodId, grad) => {
    const num = Math.max(0, parseInt(valorTemp, 10) || 0);
    actualizarStock(prodId, grad, num);
    setCeldaEditando(null);
    showToast(`Stock actualizado: ${grad} -> ${num} pzas`, 'success');
  };

  // Modificar stock con stepper (+ / -)
  const modificarStockUnitario = (prodId, grad, delta) => {
    const prod = productos.find((p) => p.id === prodId);
    if (!prod) return;
    const actual = prod.stockPorGraduacion?.[grad] || 0;
    const nuevo = Math.max(0, actual + delta);
    actualizarStock(prodId, grad, nuevo);
  };

  // Color de Heatmap por stock: rojo <=2, ámbar 3-8, verde >8, gris = 0
  const getHeatmapColor = (cantidad) => {
    const n = Number(cantidad) || 0;
    if (n === 0) return 'bg-neutral-800 text-stone-500 border-neutral-700/60 font-medium'; // gris = 0
    if (n <= 2) return 'bg-rose-500/25 text-rose-300 border-rose-500/50 font-bold'; // rojo <= 2
    if (n <= 8) return 'bg-amber-500/25 text-amber-300 border-amber-500/50 font-semibold'; // ámbar 3–8
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-medium'; // verde > 8
  };

  // Exportar a Excel con SheetJS
  const exportarAExcel = () => {
    try {
      const rows = productos.map((p) => {
        const row = {
          ID: p.id,
          SKU: p.sku || p.id,
          Modelo: p.nombre,
          Tipo: p.tipo,
          Familia: p.familia,
          Precio: p.precio,
          Total_Stock: calcularStockTotal(p),
        };
        GRADUACIONES.forEach((g) => {
          row[`Grad_${g}`] = p.stockPorGraduacion?.[g] ?? 0;
        });
        return row;
      });

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Inventario_AGO');
      XLSX.writeFile(wb, `Inventario_Pupilentes_AGO_${new Date().toISOString().substring(0, 10)}.xlsx`);
      showToast('Inventario exportado a Excel exitosamente', 'success');
    } catch (e) {
      showToast('Error al exportar Excel', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-[1800px] mx-auto text-champagne">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cocoa pb-6">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-sand block mb-1">
            Control de Almacén
          </span>
          <h1 className="font-serif text-3xl font-normal text-champagne">
            Inventario & Matriz de Graduaciones
          </h1>
          <p className="text-xs text-stone font-light">
            Edición en vivo por graduación miopía (−0.50 a −8.00), cosméticos planos y accesorios.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setModoConteo(!modoConteo)}
            className={`px-3.5 py-1.5 rounded-full text-xs flex items-center gap-1.5 border transition-all ${
              modoConteo
                ? 'bg-brass text-ink border-brass font-medium'
                : 'bg-espresso text-stone border-cocoa hover:text-champagne'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>{modoConteo ? 'Salir de modo conteo' : 'Modo contar stock'}</span>
          </button>

          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => { if (e.target.files?.[0]) importarExcel(e.target.files[0]); e.target.value = ''; }} />
          <button
            onClick={() => fileRef.current?.click()}
            className="px-3.5 py-1.5 rounded-full text-xs flex items-center gap-1.5 border bg-espresso text-sand border-cocoa hover:border-brass"
            title="Sube tu Excel con las columnas ID y Grad_-0.50 ... Grad_-8.00 (las mismas de la exportación)"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Subir mi Excel</span>
          </button>
          <button
            onClick={exportarAExcel}
            className="btn-brass text-xs px-4 py-1.5 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Excel</span>
          </button>
        </div>
      </div>

      {/* Resumen del almacén */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { l: 'Piezas en almacén', v: resumen.piezas.toLocaleString('es-MX') },
          { l: 'Modelos activos', v: productos.length },
          { l: 'Apartadas en pedidos', v: resumen.apartadas, n: 'pagadas o por pagar, sin entregar' },
          { l: 'Graduaciones agotadas', v: resumen.agotadas, alerta: resumen.agotadas > 0, ir: 'resurtir' },
          { l: 'Con 2 piezas o menos', v: resumen.porAgotarse, ir: 'resurtir' },
        ].map((k) => (
          <button key={k.l} onClick={() => k.ir && setVista(k.ir)} className={`text-left p-4 rounded-2xl bg-espresso border ${k.alerta ? 'border-rose-500/40' : 'border-cocoa'} ${k.ir ? 'hover:border-brass/60 cursor-pointer' : 'cursor-default'}`}>
            <span className="text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.18em] text-sand leading-tight block">{k.l}</span>
            <div className={`font-serif text-3xl font-light ${k.alerta ? 'text-rose-200' : 'text-champagne'}`}>{k.v}</div>
            {k.n && <span className="text-[10px] text-stone">{k.n}</span>}
          </button>
        ))}
      </div>

      {/* Tres formas de usar el inventario */}
      <div className="p-1 rounded-2xl bg-espresso border border-cocoa grid grid-cols-3 gap-1 max-w-3xl">
        {[
          { id: 'matriz', t: 'Matriz de stock', d: 'Ver y ajustar piezas' },
          { id: 'consulta', t: '¿Lo tengo?', d: 'Responder un DM en segundos' },
          { id: 'resurtir', t: 'Resurtir', d: 'Qué pedir al proveedor' },
        ].map((v) => (
          <button key={v.id} onClick={() => setVista(v.id)} className={`px-2 sm:px-4 py-2.5 rounded-xl text-center sm:text-left transition-all ${vista === v.id ? 'bg-brass text-ink' : 'text-stone hover:text-champagne hover:bg-cocoa/40'}`}>
            <span className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider whitespace-nowrap">{v.t}</span>
            <span className={`hidden sm:block text-[11px] ${vista === v.id ? 'text-ink/70' : 'text-stone'}`}>{v.d}</span>
          </button>
        ))}
      </div>

      {vista === 'consulta' && <ConsultaDisponibilidad />}
      {vista === 'resurtir' && <ListaResurtido />}

      {vista === 'matriz' && (<>
      {/* Pestañas de Navegación por Tipo (§9.2) */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-espresso/60 p-3 rounded-2xl border border-cocoa">
        <div className="flex items-center gap-2">
          {[
            { id: 'graduado', label: 'Graduados (−0.50 a −8.00)' },
            { id: 'estetico', label: 'Estéticos (Plano)' },
            { id: 'fantasia', label: 'Fantasía' },
            { id: 'accesorio', label: 'Accesorios' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTipoPestana(tab.id)}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider transition-all ${
                tipoPestana === tab.id
                  ? 'bg-brass text-ink font-semibold shadow-md'
                  : 'text-stone hover:text-champagne'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar modelo..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-ink border border-cocoa text-champagne text-xs focus:border-brass focus:outline-none w-44"
            />
          </div>

          <button
            onClick={() => setSoloBajoStock(!soloBajoStock)}
            className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 border transition-all ${
              soloBajoStock
                ? 'bg-amber-500/20 text-amber-200 border-amber-500/40 font-medium'
                : 'bg-ink text-stone border-cocoa hover:text-champagne'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Solo bajo stock</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          PESTAÑA 1: MATRIZ DE GRADUADOS (−0.50 a −8.00) A TODO EL ANCHO
          ======================================================== */}
      {tipoPestana === 'graduado' && (
        <div className="w-full overflow-x-auto rounded-2xl border border-cocoa shadow-2xl bg-espresso/40">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-espresso text-stone uppercase tracking-wider text-[11px] border-b border-cocoa sticky top-0 z-20">
                <th className="p-3.5 sticky left-0 bg-espresso z-30 min-w-[200px] border-r border-cocoa">
                  Modelo / Tono
                </th>
                <th className="p-3.5 text-center min-w-[80px] bg-espresso/90 border-r border-cocoa">
                  Total
                </th>
                {GRADUACIONES_MIOPIA.map((grad) => (
                  <th key={grad} className="p-3 text-center min-w-[58px] border-r border-cocoa/40 font-mono">
                    {grad}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map((prod) => {
                const total = calcularStockTotal(prod);

                return (
                  <tr key={prod.id} className="border-b border-cocoa/40 hover:bg-ink/50 transition-colors">
                    {/* Columna Modelo Sticky */}
                    <td className="p-3.5 sticky left-0 bg-ink z-10 border-r border-cocoa">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-espresso shrink-0 border border-cocoa">
                          <img
                            src={prod.imagen || `/img/iris/${prod.familia}.webp`}
                            alt={prod.nombre}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <strong className="text-champagne block font-serif text-sm">
                            {prod.nombre}
                          </strong>
                          <span className="text-[10px] text-stone uppercase tracking-wider">
                            {formatMXN(prod.precio)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Total Stock */}
                    <td className="p-3.5 text-center font-mono font-medium border-r border-cocoa bg-ink/70">
                      <span className={`px-2 py-0.5 rounded-full ${total <= 15 ? 'text-amber-400 bg-amber-500/10' : 'text-emerald-400'}`}>
                        {total}
                      </span>
                    </td>

                    {/* Celdas de Graduación */}
                    {GRADUACIONES_MIOPIA.map((grad) => {
                      const cant = prod.stockPorGraduacion?.[grad] ?? 0;
                      const estaEditando = celdaEditando?.prodId === prod.id && celdaEditando?.grad === grad;

                      return (
                        <td
                          key={grad}
                          className="p-1 text-center border-r border-cocoa/30 relative"
                        >
                          {estaEditando ? (
                            <div className="flex items-center justify-center gap-0.5 bg-ink p-0.5 rounded-lg border-2 border-brass z-20 shadow-xl min-w-[72px]">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const n = Math.max(0, (parseInt(valorTemp, 10) || 0) - 1);
                                  setValorTemp(n.toString());
                                  actualizarStock(prod.id, grad, n);
                                }}
                                className="w-5 h-7 bg-espresso hover:bg-cocoa text-stone hover:text-champagne rounded flex items-center justify-center text-xs font-bold transition-colors"
                                title="Restar (-)"
                              >
                                −
                              </button>
                              <input
                                type="number"
                                autoFocus
                                value={valorTemp}
                                onChange={(e) => setValorTemp(e.target.value)}
                                onBlur={() => guardarEdicion(prod.id, grad)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') guardarEdicion(prod.id, grad);
                                  if (e.key === 'Escape') setCeldaEditando(null);
                                }}
                                className="w-7 h-7 text-center bg-transparent text-champagne font-mono text-xs focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const n = (parseInt(valorTemp, 10) || 0) + 1;
                                  setValorTemp(n.toString());
                                  actualizarStock(prod.id, grad, n);
                                }}
                                className="w-5 h-7 bg-espresso hover:bg-cocoa text-stone hover:text-champagne rounded flex items-center justify-center text-xs font-bold transition-colors"
                                title="Sumar (+)"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <div
                              onClick={() => {
                                setCeldaEditando({ prodId: prod.id, grad });
                                setValorTemp(cant.toString());
                              }}
                              className={`h-9 flex items-center justify-center rounded-lg border cursor-pointer select-none transition-all hover:scale-105 ${getHeatmapColor(
                                cant
                              )}`}
                              title={`Grad ${grad}: ${cant} pzas (Clic para edición rápida +/-)`}
                            >
                              <span className="font-mono">{cant}</span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================
          PESTAÑAS 2, 3 & 4: TABLA SIMPLE PARA ESTÉTICOS, FANTASÍA Y ACCESORIOS
          ======================================================== */}
      {tipoPestana !== 'graduado' && (
        <div className="w-full rounded-2xl border border-cocoa shadow-2xl bg-espresso/40 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs border-collapse">
            <thead>
              <tr className="bg-espresso text-stone uppercase tracking-wider text-[11px] border-b border-cocoa">
                <th className="p-4">SKU / Modelo</th>
                <th className="p-4">Categoría</th>
                <th className="p-4">Precio Público</th>
                <th className="p-4">Existencia Actual</th>
                <th className="p-4 text-center">Ajuste Rápido (+ / −)</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map((prod) => {
                const stock = prod.stockPorGraduacion?.['0.00'] || 0;

                return (
                  <tr key={prod.id} className="border-b border-cocoa/40 hover:bg-ink/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-espresso shrink-0 border border-cocoa">
                          <img
                            src={prod.imagen || `/img/iris/${prod.familia || 'miel'}.webp`}
                            alt={prod.nombre}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <strong className="text-champagne block font-serif text-sm">
                            {prod.nombre}
                          </strong>
                          <span className="text-[11px] font-mono text-stone">
                            {prod.sku || prod.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 capitalize text-stone">
                      {prod.tipo} ({prod.duracion || 'Anual'})
                    </td>

                    <td className="p-4 font-mono text-sand font-medium">
                      {formatMXN(prod.precio)}
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-medium ${stock <= 5 ? 'bg-amber-500/15 text-amber-300' : 'bg-emerald-500/15 text-emerald-300'}`}>
                        {stock} piezas
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => modificarStockUnitario(prod.id, '0.00', -1)}
                          className="w-8 h-8 rounded-lg bg-ink border border-cocoa hover:border-brass/50 text-stone hover:text-champagne flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => modificarStockUnitario(prod.id, '0.00', 1)}
                          className="w-8 h-8 rounded-lg bg-ink border border-cocoa hover:border-brass/50 text-stone hover:text-champagne flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-4 text-[11px] text-stone">
        <span>Clic en una celda para ajustar.</span>
        {[['bg-neutral-800 border-neutral-700', '0 agotado'], ['bg-rose-500/25 border-rose-500/50', '1-2'], ['bg-amber-500/25 border-amber-500/50', '3-8'], ['bg-emerald-500/20 border-emerald-500/40', '9 o más']].map(([c, l]) => (
          <span key={l} className="flex items-center gap-1.5"><span className={`w-3.5 h-3.5 rounded border ${c}`} />{l}</span>
        ))}
      </div>
      </>)}
    </div>
  );
};

export default PanelInventario;
