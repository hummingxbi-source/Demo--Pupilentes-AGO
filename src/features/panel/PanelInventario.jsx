import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { GRADUACIONES, calcularStockTotal, formatMXN } from '../../data/productos';
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
  FileText
} from 'lucide-react';

export const PanelInventario = () => {
  const productos = useStore((state) => state.productos);
  const actualizarStock = useStore((state) => state.actualizarStock);
  const importarProductos = useStore((state) => state.importarProductos);
  const showToast = useStore((state) => state.showToast);

  const [busqueda, setBusqueda] = useState('');
  const [graduacionFiltro, setGraduacionFiltro] = useState('todas');
  const [soloBajoStock, setSoloBajoStock] = useState(false);

  // Celda en edición rápida
  const [celdaEditando, setCeldaEditando] = useState(null); // { prodId, grad }
  const [valorTemp, setValorTemp] = useState('');

  // Filtrado de productos
  const productosFiltrados = productos.filter((prod) => {
    if (busqueda.trim() !== '') {
      const match = prod.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                    prod.familia.toLowerCase().includes(busqueda.toLowerCase());
      if (!match) return false;
    }
    if (soloBajoStock) {
      const total = calcularStockTotal(prod);
      if (total > 15) return false;
    }
    return true;
  });

  // Guardar edición rápida de stock
  const guardarEdicion = (prodId, grad) => {
    const num = Math.max(0, parseInt(valorTemp, 10) || 0);
    actualizarStock(prodId, grad, num);
    setCeldaEditando(null);
    showToast(`Stock actualizado: ${grad} -> ${num} pzs`, "success");
  };

  // Color de Heatmap según cantidad de piezas
  const getHeatmapColor = (cantidad) => {
    const n = Number(cantidad) || 0;
    if (n === 0) return 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold';
    if (n <= 3) return 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold';
    if (n <= 7) return 'bg-neutral-800 text-neutral-200 border-neutral-700';
    return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-medium';
  };

  // Exportar a Excel con SheetJS
  const exportarAExcel = () => {
    try {
      const rows = productos.map((p) => {
        const row = {
          ID: p.id,
          Modelo: p.nombre,
          Familia: p.familia,
          Tonalidad: p.tonalidad,
          Duracion: p.duracion,
          Precio: p.precio,
          Total_Stock: calcularStockTotal(p)
        };
        GRADUACIONES.forEach((g) => {
          row[`Grad_${g}`] = p.stockPorGraduacion?.[g] ?? 0;
        });
        return row;
      });

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Inventario_AGO");
      XLSX.writeFile(wb, `Inventario_Pupilentes_AGO_${new Date().toISOString().substring(0, 10)}.xlsx`);
      showToast("Excel exportado exitosamente con todas las graduaciones 📊", "success");
    } catch (e) {
      showToast("Error al exportar Excel", "error");
    }
  };

  // Importar desde Excel
  const handleImportarExcel = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (rows.length > 0) {
          // Reconstruir estructura
          const productosNuevos = rows.map((r, index) => {
            const stockMap = {};
            GRADUACIONES.forEach((g) => {
              stockMap[g] = Number(r[`Grad_${g}`]) || 0;
            });

            return {
              id: r.ID || `modelo-importado-${index}`,
              nombre: r.Modelo || `Modelo ${index + 1}`,
              familia: r.Familia || "miel",
              tonalidad: r.Tonalidad || "natural",
              duracion: r.Duracion || "anual",
              precio: Number(r.Precio) || 649.00,
              popularidad: 85,
              hexPrincipal: "#D4A345",
              hexSecundario: "#8F641B",
              hexAcento: "#F5E09A",
              anilloLimbal: true,
              stockPorGraduacion: stockMap
            };
          });

          importarProductos(productosNuevos);
        }
      } catch (err) {
        showToast("Error al leer archivo de Excel. Verifica el formato.", "error");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Descargar plantilla
  const descargarPlantilla = () => {
    const plantilla = [
      {
        ID: "ejemplo-miel",
        Modelo: "Miel Satín Ejemplo",
        Familia: "miel",
        Tonalidad: "natural",
        Duracion: "anual",
        Precio: 649,
        "Grad_0.00": 15,
        "Grad_-1.00": 10,
        "Grad_-1.50": 8,
        "Grad_-2.00": 12,
        "Grad_-3.00": 6
      }
    ];
    const ws = XLSX.utils.json_to_sheet(plantilla);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla_Inventario");
    XLSX.writeFile(wb, "Plantilla_Inventario_Pupilentes_AGO.xlsx");
    showToast("Plantilla descargada", "info");
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Cabecera de la Vista */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-amber-400 block mb-1">
            Gestión Centralizada
          </span>
          <h1 className="font-serif text-3xl font-bold text-amber-100">
            Matriz de Inventario en Tiempo Real
          </h1>
          <p className="text-xs text-stone-400">
            Reemplaza tu Google Sheets o Excel manual. Edita celdas directamente o importa/exporta en un clic.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={descargarPlantilla}
            className="btn-ghost text-xs py-2 px-3 flex items-center gap-1.5"
            title="Descargar plantilla de Excel"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Plantilla</span>
          </button>

          <label className="btn-outline-gold text-xs py-2 px-3 cursor-pointer flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" />
            <span>Importar Excel</span>
            <input type="file" accept=".xlsx, .xls, .csv" onChange={handleImportarExcel} className="hidden" />
          </label>

          <button
            type="button"
            onClick={exportarAExcel}
            className="btn-gold text-xs py-2 px-4 flex items-center gap-1.5 shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Todo a Excel</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros de Inventario */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Filtrar por modelo o familia..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Leyenda Heatmap */}
          <div className="hidden lg:flex items-center gap-3 text-[11px] text-stone-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500/50" /> Agotado (0)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/50" /> Crítico (1-3)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/50" /> En Stock (4+)
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSoloBajoStock(!soloBajoStock)}
            className={`px-3 py-2 rounded-lg border text-xs font-semibold whitespace-nowrap transition-all ${
              soloBajoStock
                ? 'bg-amber-400/20 text-amber-300 border-amber-400'
                : 'bg-neutral-950 border-neutral-700 text-stone-400'
            }`}
          >
            {soloBajoStock ? "✓ Solo Stock Crítico" : "Mostrar Todo"}
          </button>
        </div>
      </div>

      {/* MATRIZ TIPO HOJA DE CÁLCULO (SCROLL HORIZONTAL) */}
      <div className="bg-neutral-900 border border-amber-500/30 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto max-h-[600px] scrollbar-thin">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-neutral-950 text-stone-400 font-mono uppercase text-[10px] sticky top-0 z-20 border-b border-neutral-800">
              <tr>
                <th className="py-3 px-4 font-bold text-amber-200 sticky left-0 bg-neutral-950 z-30 min-w-[180px] border-r border-neutral-800">
                  Modelo
                </th>
                <th className="py-3 px-3 text-center min-w-[70px] border-r border-neutral-800">
                  Total
                </th>
                <th className="py-3 px-3 text-center min-w-[70px] border-r border-neutral-800">
                  Precio
                </th>
                {GRADUACIONES.map((grad) => (
                  <th key={grad} className="py-3 px-2 text-center min-w-[55px] font-bold">
                    {grad}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-800 font-mono text-[11px]">
              {productosFiltrados.map((prod) => {
                const stockTotal = calcularStockTotal(prod);
                return (
                  <tr key={prod.id} className="hover:bg-neutral-850/60 transition-colors">
                    {/* Columna Modelo fija */}
                    <td className="py-2.5 px-4 font-sans font-bold text-neutral-100 sticky left-0 bg-neutral-900 z-10 border-r border-neutral-800 flex items-center justify-between">
                      <span>{prod.nombre}</span>
                      <span className="text-[9px] uppercase font-mono text-stone-500 ml-2">
                        {prod.duracion}
                      </span>
                    </td>

                    {/* Stock Total */}
                    <td className="py-2.5 px-3 text-center font-bold text-white border-r border-neutral-800">
                      {stockTotal}
                    </td>

                    {/* Precio */}
                    <td className="py-2.5 px-3 text-center text-amber-300 font-sans border-r border-neutral-800">
                      {formatMXN(prod.precio)}
                    </td>

                    {/* Celdas de Graduación con Heatmap y Edición Rápida */}
                    {GRADUACIONES.map((grad) => {
                      const cantidad = prod.stockPorGraduacion?.[grad] ?? 0;
                      const estaEditando =
                        celdaEditando?.prodId === prod.id && celdaEditando?.grad === grad;

                      return (
                        <td key={grad} className="py-1 px-1 text-center">
                          {estaEditando ? (
                            <div className="flex items-center gap-1 justify-center">
                              <input
                                type="number"
                                autoFocus
                                value={valorTemp}
                                onChange={(e) => setValorTemp(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') guardarEdicion(prod.id, grad);
                                  if (e.key === 'Escape') setCeldaEditando(null);
                                }}
                                onBlur={() => guardarEdicion(prod.id, grad)}
                                className="w-12 py-1 px-1 text-center rounded bg-amber-400 text-black font-bold text-xs focus:outline-none"
                              />
                            </div>
                          ) : (
                            <div
                              onClick={() => {
                                setCeldaEditando({ prodId: prod.id, grad });
                                setValorTemp(String(cantidad));
                              }}
                              className={`py-1 rounded border cursor-pointer transition-all hover:scale-105 ${getHeatmapColor(
                                cantidad
                              )}`}
                              title={`Clic para editar stock de ${prod.nombre} (${grad})`}
                            >
                              {cantidad}
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
      </div>
    </div>
  );
};
