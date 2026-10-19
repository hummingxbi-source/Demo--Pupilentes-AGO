import React, { useMemo, useState } from 'react';
import { useStore } from '../../store/useStore';
import { GRADUACIONES, GRADUACIONES_MIOPIA, formatMXN } from '../../data/productos';
import { apartados, demandaPorGraduacion } from './metricas';
import * as XLSX from 'xlsx';
import { CheckCircle2, XCircle, Copy, MessageCircle, Download, PackagePlus, Info } from 'lucide-react';

const disponibleDe = (prod, grad, apart) =>
  Math.max(0, (Number(prod?.stockPorGraduacion?.[grad]) || 0) - (apart[prod?.id]?.[grad] || 0));

// ==========================================================================
// Consulta rápida: sustituye el "checar en el Excel" cuando escriben por DM
// ==========================================================================
export const ConsultaDisponibilidad = () => {
  const productos = useStore((s) => s.productos);
  const pedidos = useStore((s) => s.pedidos);
  const showToast = useStore((s) => s.showToast);
  const vendibles = productos.filter((p) => p.tipo !== 'accesorio');

  const [prodId, setProdId] = useState(() => new URLSearchParams(window.location.hash.split('?')[1] || '').get('modelo') || vendibles[0]?.id);
  const [od, setOd] = useState('-1.50');
  const [oi, setOi] = useState('-1.75');
  const [pares, setPares] = useState(1);

  const apart = useMemo(() => apartados(pedidos), [pedidos]);
  const prod = productos.find((p) => p.id === prodId);
  const esPlano = prod && !prod.permiteGraduacion;
  const gOD = esPlano ? '0.00' : od;
  const gOI = esPlano ? '0.00' : oi;

  const base = gOD === gOI
    ? [{ ojo: 'Ambos ojos', g: gOD, req: 2 * pares }]
    : [{ ojo: 'Ojo derecho (OD)', g: gOD, req: pares }, { ojo: 'Ojo izquierdo (OI)', g: gOI, req: pares }];
  const ojos = base.map((o) => {
    const disp = disponibleDe(prod, o.g, apart);
    return { ...o, stock: Number(prod?.stockPorGraduacion?.[o.g]) || 0, apartadas: apart[prod?.id]?.[o.g] || 0, disp, ok: disp >= o.req };
  });

  const ok = ojos.every((o) => o.ok);

  const alternativas = useMemo(() => {
    if (ok || !prod) return [];
    return vendibles
      .filter((p) => p.id !== prod.id && p.permiteGraduacion === prod.permiteGraduacion)
      .filter((p) => {
        const req = gOD === gOI ? 2 * pares : pares;
        return disponibleDe(p, gOD, apart) >= req && disponibleDe(p, gOI, apart) >= req;
      })
      .sort((a, b) => (b.familia === prod.familia) - (a.familia === prod.familia) || (b.popularidad || 0) - (a.popularidad || 0))
      .slice(0, 4);
  }, [ok, prod, gOD, gOI, pares, apart]);

  const link = `${window.location.origin}/#/producto/${prodId}`;
  const mensaje = ok
    ? `Hola, sí tenemos ${prod?.nombre} ${esPlano ? '(sin graduación)' : `en OD ${gOD} / OI ${gOI}`}. Precio: ${formatMXN(prod?.precio)} el par. Puedes elegir tu entrega y pagar aquí: ${link}`
    : `Hola, por ahora no tenemos ${prod?.nombre} en ${esPlano ? 'existencia' : `OD ${gOD} / OI ${gOI}`}.${alternativas.length ? ` Te puedo ofrecer en tu misma graduación: ${alternativas.map((a) => a.nombre).join(', ')}.` : ' Te aviso en cuanto llegue.'}`;

  const copiar = () => { navigator.clipboard?.writeText(mensaje); showToast('Respuesta copiada. Pégala en el chat.', 'success'); };
  const sel = 'w-full px-3 py-2.5 rounded-xl bg-ink border border-cocoa text-champagne text-sm focus:border-brass focus:outline-none';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-5 rounded-2xl bg-espresso border border-cocoa p-5 space-y-4">
        <div>
          <h3 className="font-serif text-xl">¿Lo tengo?</h3>
          <p className="text-xs text-stone">Cuando te pregunten por DM: elige modelo y graduación de cada ojo. Ya descuenta lo apartado en pedidos sin entregar.</p>
        </div>
        <label className="block space-y-1.5 text-xs"><span className="text-sand uppercase tracking-wider">Modelo</span>
          <select value={prodId} onChange={(e) => setProdId(e.target.value)} className={sel}>
            {['graduado', 'estetico', 'fantasia'].map((t) => (
              <optgroup key={t} label={t === 'graduado' ? 'Graduados' : t === 'estetico' ? 'Estéticos (plano)' : 'Fantasía'}>
                {vendibles.filter((p) => p.tipo === t).map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </optgroup>
            ))}
          </select>
        </label>
        {!esPlano && (
          <div className="grid grid-cols-2 gap-3 text-xs">
            <label className="space-y-1.5"><span className="text-sand uppercase tracking-wider">OD</span>
              <select value={od} onChange={(e) => setOd(e.target.value)} className={`${sel} font-mono`}>{GRADUACIONES_MIOPIA.map((g) => <option key={g}>{g}</option>)}</select>
            </label>
            <label className="space-y-1.5"><span className="text-sand uppercase tracking-wider">OI</span>
              <select value={oi} onChange={(e) => setOi(e.target.value)} className={`${sel} font-mono`}>{GRADUACIONES_MIOPIA.map((g) => <option key={g}>{g}</option>)}</select>
            </label>
          </div>
        )}
        <label className="block space-y-1.5 text-xs"><span className="text-sand uppercase tracking-wider">Pares</span>
          <input type="number" min={1} max={10} value={pares} onChange={(e) => setPares(Math.max(1, +e.target.value || 1))} className="w-24 px-3 py-2.5 rounded-xl bg-ink border border-cocoa text-champagne text-sm font-mono focus:border-brass focus:outline-none" />
        </label>
      </div>

      <div className="lg:col-span-7 rounded-2xl bg-espresso border border-cocoa p-5 space-y-4">
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${ok ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
          {ok ? <CheckCircle2 className="w-6 h-6 text-emerald-300" /> : <XCircle className="w-6 h-6 text-rose-300" />}
          <div>
            <div className="font-serif text-2xl">{ok ? 'Sí hay' : 'No alcanza'}</div>
            <div className="text-xs text-stone">{prod?.nombre} · {esPlano ? 'sin graduación' : `OD ${gOD} / OI ${gOI}`} · {pares} par(es)</div>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 text-xs">
          {ojos.map((o) => (
            <div key={o.ojo} className="p-3 rounded-xl bg-ink border border-cocoa">
              <div className="flex justify-between"><span className="text-sand">{o.ojo}</span><span className="font-mono text-stone">{o.g}</span></div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className={`font-serif text-3xl ${o.ok ? 'text-champagne' : 'text-rose-300'}`}>{o.disp}</span>
                <span className="text-stone">disponibles de {o.stock} ({o.apartadas} apartadas) · necesitas {o.req}</span>
              </div>
            </div>
          ))}
        </div>
        {!ok && alternativas.length > 0 && (
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-wider text-sand">Con stock en esa misma graduación</span>
            <div className="flex flex-wrap gap-2">
              {alternativas.map((a) => (
                <button key={a.id} onClick={() => setProdId(a.id)} className="px-3 py-1.5 rounded-full bg-ink border border-cocoa hover:border-brass text-xs flex items-center gap-2">
                  <img src={a.imagen} alt="" className="w-5 h-5 rounded-full object-cover" />{a.nombre}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-2">
          <span className="text-[11px] uppercase tracking-wider text-sand">Respuesta lista para el chat</span>
          <p className="p-3 rounded-xl bg-ink border border-cocoa text-xs text-champagne leading-relaxed">{mensaje}</p>
          <div className="flex gap-2">
            <button onClick={copiar} className="btn-brass text-xs px-4 py-2"><Copy className="w-3.5 h-3.5" />Copiar</button>
            <a href={`https://wa.me/?text=${encodeURIComponent(mensaje)}`} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-full border border-cocoa text-xs text-sand hover:border-brass flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" />Abrir en WhatsApp</a>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================================================
// Lista de resurtido: qué pedirle al proveedor, priorizado por demanda real
// ==========================================================================
export const ListaResurtido = () => {
  const productos = useStore((s) => s.productos);
  const pedidos = useStore((s) => s.pedidos);
  const actualizarStock = useStore((s) => s.actualizarStock);
  const showToast = useStore((s) => s.showToast);
  const [umbral, setUmbral] = useState(2);

  const filas = useMemo(() => {
    const apart = apartados(pedidos);
    const dem = demandaPorGraduacion(pedidos, 60);
    const out = [];
    productos.filter((p) => p.tipo === 'graduado').forEach((p) =>
      Object.keys(p.stockPorGraduacion || {}).filter((g) => g !== '0.00').forEach((g) => {
        const stock = Number(p.stockPorGraduacion?.[g]) || 0;
        const ap = apart[p.id]?.[g] || 0;
        const disp = Math.max(0, stock - ap);
        if (disp > umbral) return;
        const vendidas = dem[`${p.id}|${g}`] || 0;
        const objetivo = Math.max(4, Math.ceil(vendidas * 1.5));
        out.push({ id: `${p.id}|${g}`, prod: p, g, stock, ap, disp, vendidas, sugerido: Math.max(1, objetivo - disp) });
      })
    );
    return out.sort((a, b) => b.vendidas - a.vendidas || a.disp - b.disp);
  }, [productos, pedidos, umbral]);

  const piezas = filas.reduce((s, f) => s + f.sugerido, 0);

  const texto = () => {
    const porModelo = {};
    filas.forEach((f) => { (porModelo[f.prod.nombre] = porModelo[f.prod.nombre] || []).push(`${f.g} x${f.sugerido}`); });
    return `Pedido Pupilentes AGO ${new Date().toLocaleDateString('es-MX')}\n` +
      Object.entries(porModelo).map(([m, gs]) => `${m}: ${gs.join(', ')}`).join('\n') + `\nTotal: ${piezas} piezas`;
  };

  const exportar = () => {
    const ws = XLSX.utils.json_to_sheet(filas.map((f) => ({ Modelo: f.prod.nombre, SKU: f.prod.sku, Graduacion: f.g, Stock: f.stock, Apartadas: f.ap, Vendidas_60d: f.vendidas, Pedir: f.sugerido })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Resurtido');
    XLSX.writeFile(wb, `Resurtido_AGO_${new Date().toISOString().substring(0, 10)}.xlsx`);
  };

  const recibir = (f) => {
    actualizarStock(f.prod.id, f.g, f.stock + f.sugerido);
    showToast(`${f.prod.nombre} ${f.g}: +${f.sugerido} piezas recibidas`, 'success');
  };

  return (
    <div className="rounded-2xl bg-espresso border border-cocoa p-5 space-y-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h3 className="font-serif text-xl">Qué pedirle al proveedor</h3>
          <p className="text-xs text-stone flex items-start gap-1.5 max-w-2xl">
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-brass" />
            Graduaciones con {umbral} piezas disponibles o menos. Arriba van las que más se vendieron en 60 días. Sugerido = cubrir 1.5 veces lo vendido (mínimo 4) menos lo disponible.
          </p>
        </div>
        <div className="flex flex-wrap md:flex-nowrap items-center gap-2 text-xs shrink-0">
          <label className="flex items-center gap-2 text-stone">Umbral
            <select value={umbral} onChange={(e) => setUmbral(+e.target.value)} className="px-2 py-1.5 rounded-lg bg-ink border border-cocoa text-champagne">
              {[0, 1, 2, 3, 5].map((n) => <option key={n} value={n}>{n === 0 ? 'Solo agotadas' : `≤ ${n}`}</option>)}
            </select>
          </label>
          <button onClick={() => { navigator.clipboard?.writeText(texto()); showToast('Pedido copiado para el proveedor', 'success'); }} className="px-3 py-1.5 rounded-full border border-cocoa text-sand hover:border-brass flex items-center gap-1.5"><Copy className="w-3.5 h-3.5" />Copiar pedido</button>
          <button onClick={exportar} className="btn-brass text-xs px-4 py-1.5"><Download className="w-3.5 h-3.5" />Excel</button>
        </div>
      </div>
      <div className="flex gap-6 text-xs border-y border-cocoa py-3">
        <span><strong className="font-serif text-2xl text-champagne font-light mr-1">{filas.length}</strong><span className="text-stone">graduaciones</span></span>
        <span><strong className="font-serif text-2xl text-champagne font-light mr-1">{filas.filter((f) => f.disp === 0).length}</strong><span className="text-stone">agotadas</span></span>
        <span><strong className="font-serif text-2xl text-champagne font-light mr-1">{piezas}</strong><span className="text-stone">piezas sugeridas</span></span>
      </div>
      <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
        <table className="w-full min-w-[640px] text-xs">
          <thead className="sticky top-0 bg-espresso">
            <tr className="text-left text-[11px] uppercase tracking-wider text-stone border-b border-cocoa">
              <th className="py-2 pr-3">Modelo</th><th className="py-2 pr-3">Graduación</th><th className="py-2 pr-3 text-right">Disponible</th>
              <th className="py-2 pr-3 text-right">Apartadas</th><th className="py-2 pr-3 text-right">Vendidas 60d</th><th className="py-2 pr-3 text-right">Pedir</th><th />
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.id} className="border-b border-cocoa/50 hover:bg-ink/50">
                <td className="py-2 pr-3"><span className="flex items-center gap-2"><img src={f.prod.imagen} alt="" className="w-6 h-6 rounded-full object-cover" />{f.prod.nombre}</span></td>
                <td className="py-2 pr-3 font-mono text-sand">{f.g}</td>
                <td className="py-2 pr-3 text-right font-mono"><span className={f.disp === 0 ? 'text-rose-300' : 'text-amber-300'}>{f.disp}</span></td>
                <td className="py-2 pr-3 text-right font-mono text-stone">{f.ap}</td>
                <td className="py-2 pr-3 text-right font-mono text-champagne">{f.vendidas}</td>
                <td className="py-2 pr-3 text-right font-mono text-gilt font-semibold">{f.sugerido}</td>
                <td className="py-2 text-right">
                  <button onClick={() => recibir(f)} className="px-2.5 py-1 rounded-full border border-cocoa hover:border-brass text-[11px] text-sand inline-flex items-center gap-1" title="Sumar al stock las piezas sugeridas"><PackagePlus className="w-3 h-3" />Recibí</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filas.length === 0 && <p className="text-center text-sm text-stone py-8">No hay graduaciones bajo el umbral.</p>}
      </div>
    </div>
  );
};

// Importar el Excel que ya usa (mismas columnas que la exportación: ID y Grad_-1.50, etc.)
export const useImportarExcel = () => {
  const productos = useStore((s) => s.productos);
  const importarProductos = useStore((s) => s.importarProductos);
  const showToast = useStore((s) => s.showToast);
  return (file) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: 'array' });
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        let cambios = 0;
        const nuevos = productos.map((p) => {
          const row = rows.find((r) => r.ID === p.id || r.SKU === p.sku);
          if (!row) return p;
          const stock = { ...p.stockPorGraduacion };
          GRADUACIONES.forEach((g) => { if (row[`Grad_${g}`] !== undefined) { stock[g] = Math.max(0, Number(row[`Grad_${g}`]) || 0); } });
          cambios += 1;
          return { ...p, stockPorGraduacion: stock, precio: row.Precio ? Number(row.Precio) : p.precio };
        });
        if (!cambios) return showToast('No encontré columnas ID/SKU que coincidan. Usa la plantilla exportada.', 'warn');
        importarProductos(nuevos);
        showToast(`${cambios} modelos actualizados desde tu Excel`, 'success');
      } catch {
        showToast('No se pudo leer el archivo', 'error');
      }
    };
    reader.readAsArrayBuffer(file);
  };
};
