import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { formatMXN } from '../../data/productos';
import { FLUJO_PEDIDO } from '../../lib/estados';
import {
  ventanas, ventasPorDia, porCanal, topModelos, conteoPorEstado, alertasStock, variacion,
} from './metricas';
import {
  ReceiptText, PackageCheck, MapPin, Wallet, AlertTriangle, RotateCw, ArrowRight, ArrowUpRight,
  ArrowDownRight, Plus, ExternalLink, Check, User, Zap,
} from 'lucide-react';

const pct = (v) => `${Math.round(v * 100)}%`;

const Delta = ({ v }) => {
  if (v == null) return <span className="text-[11px] text-stone">sin periodo previo</span>;
  const up = v >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] ${up ? 'text-emerald-300' : 'text-rose-300'}`}>
      <Icon className="w-3.5 h-3.5" />{Math.abs(Math.round(v * 100))}% vs 30 días previos
    </span>
  );
};

// Tarjeta de pendiente: número grande + qué hacer + a dónde ir
const Pendiente = ({ n, titulo, detalle, to, Icon, tono }) => {
  const tonos = {
    alto: 'border-l-amber-400 text-amber-300',
    medio: 'border-l-brass text-gilt',
    bajo: 'border-l-stone/40 text-stone',
  };
  const t = n === 0 ? 'bajo' : tono;
  return (
    <Link to={to} className={`group rounded-2xl bg-espresso border border-cocoa border-l-4 ${tonos[t]} p-4 flex flex-col gap-3 hover:bg-cocoa/40 transition-colors`}>
      <div className="flex items-center justify-between">
        <Icon className="w-4 h-4" />
        <ArrowRight className="w-3.5 h-3.5 text-stone group-hover:translate-x-0.5 transition-transform" />
      </div>
      <div>
        <div className={`font-serif text-4xl font-light leading-none ${n === 0 ? 'text-stone' : 'text-champagne'}`}>{n}</div>
        <div className="text-[13px] text-champagne mt-2 leading-tight">{titulo}</div>
        <div className="text-[11px] text-stone mt-1 leading-snug">{n === 0 ? 'Todo al día' : detalle}</div>
      </div>
    </Link>
  );
};

const Kpi = ({ label, valor, delta, nota }) => (
  <div className="rounded-2xl bg-espresso border border-cocoa p-4 sm:p-5 space-y-1.5 min-w-0">
    <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.12em] sm:tracking-[0.18em] text-sand">{label}</span>
    <div className="font-serif text-[26px] sm:text-3xl font-light text-champagne leading-tight">{valor}</div>
    {nota ? <span className="text-[11px] text-stone">{nota}</span> : <Delta v={delta} />}
  </div>
);

// Barras de ventas diarias con tooltip al pasar el cursor
const GraficaDiaria = ({ serie }) => {
  const [hover, setHover] = useState(null);
  const max = Math.max(1, ...serie.map((d) => d.total));
  const W = 600, H = 180, pad = 2, bw = W / serie.length;
  const ticks = [0, max / 2, max];
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H + 22}`} className="w-full h-auto" role="img" aria-label="Ventas por día, últimos 30 días">
        {ticks.map((t, i) => (
          <line key={i} x1="0" x2={W} y1={H - (t / max) * H} y2={H - (t / max) * H} stroke="#2A231D" strokeWidth="1" />
        ))}
        {serie.map((d, i) => {
          const h = (d.total / max) * H;
          return (
            <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={i * bw} y="0" width={bw} height={H} fill="transparent" />
              {h > 0 && <rect x={i * bw + pad} y={H - h} width={bw - pad * 2} height={h} rx="3" fill={hover === i ? '#D9BE85' : '#B08D57'} />}
            </g>
          );
        })}
        {serie.map((d, i) => (i % 7 === 0 || (i === serie.length - 1 && i % 7 > 3)) && (
          <text key={i} x={i * bw + bw / 2} y={H + 16} textAnchor="middle" fontSize="10" fill="#9A8F82">
            {d.fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
          </text>
        ))}
      </svg>
      {hover != null && (
        <div className="absolute -top-2 pointer-events-none px-3 py-2 rounded-lg bg-ink border border-cocoa text-[11px] shadow-xl"
          style={{ left: `${((hover + 0.5) / serie.length) * 100}%`, transform: 'translate(-50%,-100%)' }}>
          <div className="text-stone">{serie[hover].fecha.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
          <div className="text-champagne font-medium">{formatMXN(serie[hover].total)}</div>
          <div className="text-stone">{serie[hover].pedidos} pedido(s)</div>
        </div>
      )}
    </div>
  );
};

const BarrasH = ({ filas, valor, etiqueta, formato }) => {
  const max = Math.max(1, ...filas.map(valor));
  return (
    <div className="space-y-3">
      {filas.map((f) => (
        <div key={etiqueta(f)} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-champagne">{etiqueta(f)}</span>
            <span className="text-sand font-mono">{formato(f)}</span>
          </div>
          <div className="h-2 rounded-full bg-ink overflow-hidden">
            <div className="h-full rounded-full bg-brass" style={{ width: `${(valor(f) / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
};

// Cómo la plataforma cubre cada paso del proceso que Araceli describió en el diagnóstico
const PROCESO = [
  { antes: 'Mandar catálogo y precios por mensaje', ahora: 'Catálogo con filtros y precios en la tienda', auto: true },
  { antes: 'Revisar disponibilidad en Excel', ahora: 'La tienda solo ofrece graduaciones con stock, por ojo', auto: true },
  { antes: 'Pedir CP y cotizar envío a mano', ahora: 'La clienta cotiza paquetería, DiDi o metro en el checkout', auto: true },
  { antes: 'Escribir el total y enviar cuentas', ahora: 'Total y datos bancarios en el checkout y en su ticket', auto: true },
  { antes: 'Corroborar el depósito en la banca', ahora: 'Lo validas tú con un clic desde "Por verificar"', auto: false },
  { antes: 'Pedir datos para la guía', ahora: 'La clienta los captura al comprar; tú solo generas la guía', auto: false },
  { antes: 'Monitorear hasta que llegue', ahora: 'La clienta ve el estatus en "Mis pedidos y puntos"', auto: true },
];

export const PanelDashboard = () => {
  const pedidos = useStore((s) => s.pedidos);
  const productos = useStore((s) => s.productos);
  const clientas = useStore((s) => s.clientas);
  const dias = useStore((s) => s.diasOffsetSimulados);

  const m = useMemo(() => {
    const v = ventanas(pedidos);
    return {
      v,
      serie: ventasPorDia(pedidos),
      canales: porCanal(v.pedidosVentana),
      top: topModelos(v.pedidosVentana),
      estados: conteoPorEstado(pedidos),
      stock: alertasStock(productos),
      renovar: clientas.filter((c) => c.proximaRenovacionDias != null && c.proximaRenovacionDias - dias <= 7).length,
      entregasMetro: pedidos.filter((p) => p.estado === 'en_camino' && p.metodoEntrega === 'entrega_personal').length,
    };
  }, [pedidos, productos, clientas, dias]);

  const e = m.estados;
  const hoy = new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
  const totalActivos = FLUJO_PEDIDO.slice(0, 5).reduce((s, f) => s + (e[f.id] || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in max-w-[1400px] mx-auto text-champagne">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-sand block mb-1">{hoy.charAt(0).toUpperCase() + hoy.slice(1)}</span>
          <h1 className="font-serif text-4xl font-light">Hola, Araceli</h1>
          <p className="text-xs text-stone mt-1">
            {totalActivos} pedidos en curso. Empieza por los recuadros dorados: son los que esperan una acción tuya.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/panel/pedidos?nuevo=1" className="btn-brass text-xs px-4 py-2 whitespace-nowrap"><Plus className="w-3.5 h-3.5" /><span className="sm:hidden">Registrar venta</span><span className="hidden sm:inline">Venta de Instagram/WhatsApp</span></Link>
          <Link to="/" className="px-4 py-2 rounded-full border border-cocoa text-xs text-stone hover:text-champagne flex items-center justify-center gap-1.5 whitespace-nowrap"><ExternalLink className="w-3.5 h-3.5" />Ver tienda</Link>
        </div>
      </div>

      {/* 1. Qué hacer hoy */}
      <section className="space-y-3">
        <h2 className="text-[11px] uppercase tracking-[0.2em] text-sand">Qué necesita tu atención</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <Pendiente n={e.verificar_comprobante || 0} titulo="Comprobantes por verificar" detalle="Revisa tu banca y aprueba" to="/panel/pedidos?estado=verificar_comprobante" Icon={ReceiptText} tono="alto" />
          <Pendiente n={e.por_enviar || 0} titulo="Por empacar y generar guía" detalle="Pago aprobado, listos para salir" to="/panel/pedidos?estado=por_enviar" Icon={PackageCheck} tono="alto" />
          <Pendiente n={m.entregasMetro} titulo="Entregas en metro" detalle="Pantitlán, Tepalcates y otras" to="/panel/pedidos?estado=en_camino" Icon={MapPin} tono="medio" />
          <Pendiente n={e.esperando_pago || 0} titulo="Esperando pago" detalle="Manda recordatorio por WhatsApp" to="/panel/pedidos?estado=esperando_pago" Icon={Wallet} tono="medio" />
          <Pendiente n={m.stock.agotadas} titulo="Graduaciones agotadas" detalle={`${m.stock.porAgotarse} más con 2 piezas o menos`} to="/panel/inventario?vista=resurtir" Icon={AlertTriangle} tono="medio" />
          <Pendiente n={m.renovar} titulo="Clientas por renovar" detalle="Vencen en 7 días o menos" to="/panel/clientas" Icon={RotateCw} tono="medio" />
        </div>
      </section>

      {/* 2. Cómo va el negocio */}
      <section className="space-y-3">
        <h2 className="text-[11px] uppercase tracking-[0.2em] text-sand">Últimos 30 días</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi label="Ventas" valor={formatMXN(m.v.actual.ventas)} delta={variacion(m.v.actual.ventas, m.v.previa.ventas)} />
          <Kpi label="Pedidos" valor={m.v.actual.pedidos} delta={variacion(m.v.actual.pedidos, m.v.previa.pedidos)} />
          <Kpi label="Ticket promedio" valor={formatMXN(m.v.actual.ticket)} delta={variacion(m.v.actual.ticket, m.v.previa.ticket)} />
          <Kpi label="Pedidos sin chat" valor={pct(m.v.actual.autoservicio)} nota="Compraron solas en la tienda online" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 rounded-2xl bg-espresso border border-cocoa p-5 space-y-4">
            <div className="flex justify-between items-baseline">
              <h3 className="font-serif text-xl">Ventas por día</h3>
              <span className="text-[11px] text-stone">Pasa el cursor sobre una barra</span>
            </div>
            <GraficaDiaria serie={m.serie} />
          </div>
          <div className="lg:col-span-4 rounded-2xl bg-espresso border border-cocoa p-5 space-y-4">
            <h3 className="font-serif text-xl">De dónde vienen</h3>
            <BarrasH filas={m.canales} valor={(c) => c.total} etiqueta={(c) => c.nombre} formato={(c) => `${formatMXN(c.total)} · ${c.pedidos}`} />
          </div>
        </div>
      </section>

      {/* 3. Flujo y productos */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 rounded-2xl bg-espresso border border-cocoa p-5 space-y-4">
          <div className="flex justify-between items-baseline">
            <h3 className="font-serif text-xl">Pedidos en curso por etapa</h3>
            <Link to="/panel/pedidos" className="text-xs text-sand hover:text-gilt flex items-center gap-1">Abrir tablero <ArrowRight className="w-3.5 h-3.5" /></Link>
          </div>
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {FLUJO_PEDIDO.slice(0, 5).map((f, i) => {
              const n = e[f.id] || 0;
              return (
                <Link key={f.id} to={`/panel/pedidos?estado=${f.id}`} className="relative rounded-xl bg-ink border border-cocoa hover:border-brass/60 px-1 py-3 sm:p-3 text-center transition-colors">
                  <div className="text-[10px] font-mono text-stone">{i + 1}</div>
                  <div className={`font-serif text-3xl font-light ${n ? 'text-champagne' : 'text-stone/60'}`}>{n}</div>
                  <div className="text-[10px] sm:text-[11px] text-sand leading-tight mt-1">{f.corto}</div>
                  {i < 4 && <ArrowRight className="hidden sm:block absolute -right-[11px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cocoa z-10" />}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="lg:col-span-5 rounded-2xl bg-espresso border border-cocoa p-5 space-y-4">
          <h3 className="font-serif text-xl">Modelos más vendidos (30 días)</h3>
          <BarrasH filas={m.top} valor={(t) => t.piezas} etiqueta={(t) => t.nombre} formato={(t) => `${t.piezas} pzas`} />
        </div>
      </section>

      {/* 4. Cómo se resolvió su proceso */}
      <section className="rounded-2xl bg-espresso border border-cocoa p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
          <h3 className="font-serif text-xl flex items-center gap-2"><Zap className="w-4 h-4 text-brass" />Tu proceso de venta, antes y ahora</h3>
          <span className="text-[11px] text-stone">{PROCESO.filter((p) => p.auto).length} de {PROCESO.length} pasos ya no requieren mensajes</span>
        </div>
        <div className="divide-y divide-cocoa/70">
          {PROCESO.map((p, i) => (
            <div key={i} className="py-2.5 grid grid-cols-12 gap-3 items-center text-xs">
              <span className="col-span-1 font-mono text-stone">{i + 1}</span>
              <span className="col-span-11 sm:col-span-4 text-stone line-through decoration-stone/40">{p.antes}</span>
              <span className="col-span-11 col-start-2 sm:col-start-auto sm:col-span-5 text-champagne">{p.ahora}</span>
              <span className={`col-span-11 col-start-2 sm:col-start-auto sm:col-span-2 justify-self-start sm:justify-self-end px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider flex items-center gap-1 ${p.auto ? 'bg-brass/15 text-gilt border border-brass/30' : 'bg-ink text-sand border border-cocoa'}`}>
                {p.auto ? <><Check className="w-3 h-3" />Automático</> : <><User className="w-3 h-3" />Un clic tuyo</>}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PanelDashboard;
