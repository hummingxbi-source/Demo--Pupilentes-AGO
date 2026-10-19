// Cálculos del panel a partir de los datos reales del store (sin cifras inventadas).
import { normalizarEstado, ACTIVOS } from '../../lib/estados';

const DIA = 24 * 60 * 60 * 1000;
export const fechaDe = (p) => new Date((p.fecha || '').replace(' ', 'T'));
export const valido = (p) => normalizarEstado(p.estado) !== 'cancelado';

export const NOMBRE_CANAL = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  whatsapp: 'WhatsApp',
  mercadolibre: 'Mercado Libre',
  tienda_online: 'Tienda online',
  entrega_personal: 'Venta en persona',
};

export function ventanas(pedidos, dias = 30, ahora = Date.now()) {
  const actual = pedidos.filter((p) => valido(p) && ahora - fechaDe(p) <= dias * DIA);
  const previa = pedidos.filter((p) => {
    const d = ahora - fechaDe(p);
    return valido(p) && d > dias * DIA && d <= 2 * dias * DIA;
  });
  const suma = (arr) => arr.reduce((s, p) => s + (Number(p.total) || 0), 0);
  const kpi = (arr) => ({
    ventas: suma(arr),
    pedidos: arr.length,
    ticket: arr.length ? suma(arr) / arr.length : 0,
    autoservicio: arr.length ? arr.filter((p) => p.canal === 'tienda_online').length / arr.length : 0,
  });
  return { actual: kpi(actual), previa: kpi(previa), pedidosVentana: actual };
}

export function ventasPorDia(pedidos, dias = 30, ahora = Date.now()) {
  const hoy = new Date(ahora); hoy.setHours(0, 0, 0, 0);
  const serie = Array.from({ length: dias }, (_, i) => {
    const d = new Date(hoy.getTime() - (dias - 1 - i) * DIA);
    return { fecha: d, total: 0, pedidos: 0 };
  });
  pedidos.filter(valido).forEach((p) => {
    const f = fechaDe(p); f.setHours(0, 0, 0, 0);
    const idx = Math.round((f - serie[0].fecha) / DIA);
    if (idx >= 0 && idx < dias) { serie[idx].total += Number(p.total) || 0; serie[idx].pedidos += 1; }
  });
  return serie;
}

export function porCanal(pedidosVentana) {
  const mapa = {};
  pedidosVentana.forEach((p) => {
    const k = p.canal || 'otro';
    mapa[k] = mapa[k] || { canal: k, nombre: NOMBRE_CANAL[k] || k, total: 0, pedidos: 0 };
    mapa[k].total += Number(p.total) || 0;
    mapa[k].pedidos += 1;
  });
  return Object.values(mapa).sort((a, b) => b.total - a.total);
}

export function topModelos(pedidosVentana, n = 5) {
  const mapa = {};
  pedidosVentana.forEach((p) => (p.items || []).forEach((it) => {
    const k = it.productoId;
    mapa[k] = mapa[k] || { id: k, nombre: it.nombre, piezas: 0 };
    mapa[k].piezas += it.cantidad || 1;
  }));
  return Object.values(mapa).sort((a, b) => b.piezas - a.piezas).slice(0, n);
}

export function conteoPorEstado(pedidos) {
  const c = {};
  pedidos.forEach((p) => { const e = normalizarEstado(p.estado); c[e] = (c[e] || 0) + 1; });
  return c;
}

// Piezas apartadas por pedidos activos (aún no entregados) por producto y graduación
export function apartados(pedidos) {
  const mapa = {};
  pedidos.filter((p) => ACTIVOS.includes(normalizarEstado(p.estado)) && normalizarEstado(p.estado) !== 'en_camino')
    .forEach((p) => (p.items || []).forEach((it) => {
      const cant = it.cantidad || 1;
      mapa[it.productoId] = mapa[it.productoId] || {};
      [it.od, it.oi].forEach((g) => { if (g) mapa[it.productoId][g] = (mapa[it.productoId][g] || 0) + cant; });
    }));
  return mapa;
}

// Demanda: piezas vendidas por producto+graduación en los últimos N días
export function demandaPorGraduacion(pedidos, dias = 60, ahora = Date.now()) {
  const mapa = {};
  pedidos.filter((p) => valido(p) && ahora - fechaDe(p) <= dias * DIA).forEach((p) =>
    (p.items || []).forEach((it) => {
      const cant = it.cantidad || 1;
      [it.od, it.oi].forEach((g) => {
        if (!g) return;
        const k = `${it.productoId}|${g}`;
        mapa[k] = (mapa[k] || 0) + cant;
      });
    })
  );
  return mapa;
}

export function alertasStock(productos) {
  let agotadas = 0, porAgotarse = 0;
  productos.filter((p) => p.tipo === 'graduado').forEach((p) =>
    Object.keys(p.stockPorGraduacion || {}).filter((g) => g !== '0.00').forEach((g) => {
      const n = Number(p.stockPorGraduacion[g] ?? 0);
      if (n === 0) agotadas += 1; else if (n <= 2) porAgotarse += 1;
    })
  );
  return { agotadas, porAgotarse };
}

export const variacion = (a, b) => (b ? (a - b) / b : null);
