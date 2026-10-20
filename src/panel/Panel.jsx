import { useMemo, useRef, useState } from 'react';
import { NavLink, Route, Routes, Link, useNavigate, useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Sun, Truck, Boxes, LayoutGrid, Users, Wallet, Package, Train, MessageCircle, FileText, Download, ArrowUpRight, Copy, Search, X } from 'lucide-react';
import { useStore } from '../lib/store';
import { ESTADOS, PASOS, mxn, familia, GRADS } from '../lib/catalog';
import { LOGO, Iris } from '../ui';
import { Inventario, Catalogo, Clientas, clientasDe } from './Gestion';

export const waTo = (tel, txt) => `https://wa.me/52${String(tel).replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(txt)}`;
const hoyStr = new Date().toDateString();
const esHoy = (iso) => new Date(iso).toDateString() === hoyStr;
const nombre1 = (n) => n.split(' ')[0];

export const MSG = {
  pagado: (p) => `Hola ${nombre1(p.clienta)} 💛 Ya confirmamos tu pago del pedido ${p.folio}. ${p.entrega.tipo === 'metro' ? `Te vemos en ${p.entrega.detalle}${p.entrega.cita ? ' · ' + p.entrega.cita : ''}.` : 'En cuanto generemos tu guía te la enviamos.'}`,
  guia: (p) => `Hola ${nombre1(p.clienta)}, tu pedido ${p.folio} ya va en camino 📦\nPaquetería: ${p.entrega.paq}\nGuía: ${p.guia}\nPuedes rastrearlo también en nuestra página.`,
  entregado: (p) => `¡Gracias por tu compra, ${nombre1(p.clienta)}! Sumaste ${Math.floor(p.subtotal / 10)} puntos AGO. Cuéntanos cómo te quedaron 🤍`,
};

function useConteos() {
  const pedidos = useStore((s) => s.pedidos);
  return useMemo(() => ({
    revision: pedidos.filter((p) => p.estado === 'revision'),
    enviar: pedidos.filter((p) => p.estado === 'pagado' && p.entrega.tipo !== 'metro'),
    metro: pedidos.filter((p) => p.estado === 'pagado' && p.entrega.tipo === 'metro'),
    camino: pedidos.filter((p) => p.estado === 'enviado'),
  }), [pedidos]);
}

export default function Panel() {
  const c = useConteos();
  const tabs = [
    ['', 'Hoy', Sun, c.revision.length + c.enviar.length],
    ['pedidos', 'Pedidos', Truck],
    ['inventario', 'Inventario', Boxes],
    ['catalogo', 'Catálogo', LayoutGrid],
    ['clientas', 'Clientas', Users],
  ];
  return (
    <div className="pn">
      <aside className="pn-side">
        <Link to="/" className="brand"><img src={LOGO} alt="" />AGO · PANEL</Link>
        {tabs.map(([to, l, I, n]) => <NavLink key={to} end to={to ? `/panel/${to}` : '/panel'} className={({ isActive }) => 'it ' + (isActive ? 'on' : '')}><I size={18} strokeWidth={1.5} />{l}{n > 0 && <span className="ct">{n}</span>}</NavLink>)}
        <div className="bottom"><Link to="/" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>Ver tienda <ArrowUpRight size={14} /></Link><button style={{ marginTop: 10, color: 'inherit', fontSize: 12 }} onClick={() => { if (confirm('¿Reiniciar los datos de la demo?')) useStore.getState().reiniciarDemo(); }}>Reiniciar demo</button></div>
      </aside>
      <nav className="pn-tabs">{tabs.map(([to, l, I, n]) => <NavLink key={to} end to={to ? `/panel/${to}` : '/panel'} className={({ isActive }) => (isActive ? 'on' : '')}><I size={20} strokeWidth={1.5} />{l}{n > 0 && <span className="ct">{n}</span>}</NavLink>)}</nav>
      <main className="pn-main">
        <Routes>
          <Route index element={<Hoy />} />
          <Route path="pedidos" element={<Pedidos />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="catalogo" element={<Catalogo />} />
          <Route path="clientas" element={<Clientas />} />
        </Routes>
      </main>
    </div>
  );
}

function useEntrada(dep) {
  const ref = useRef();
  useGSAP(() => { gsap.from(ref.current.querySelectorAll('[data-in]'), { y: 24, opacity: 0, stagger: 0.05, duration: 0.8, ease: 'expo.out' }); }, { scope: ref, dependencies: dep || [] });
  return ref;
}

/* ---------------- HOY ---------------- */
function Hoy() {
  const pedidos = useStore((s) => s.pedidos);
  const productos = useStore((s) => s.productos);
  const c = useConteos();
  const nav = useNavigate();
  const [abierto, setAbierto] = useState(null);
  const ref = useEntrada();
  const h = new Date().getHours();
  const saludo = h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';

  const mes = useMemo(() => {
    const now = new Date(); const ini = new Date(now.getFullYear(), now.getMonth(), 1);
    const iniPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1); const finPrev = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate(), 23, 59);
    const val = pedidos.filter((p) => p.estado !== 'revision');
    const este = val.filter((p) => new Date(p.fecha) >= ini);
    const prev = val.filter((p) => { const f = new Date(p.fecha); return f >= iniPrev && f <= finPrev; });
    const tot = (a) => a.reduce((s, p) => s + p.total, 0);
    const canales = {}; este.forEach((p) => (canales[p.canal] = (canales[p.canal] || 0) + 1));
    const tonos = {}; este.forEach((p) => p.items.forEach((i) => { const pr = productos.find((x) => x.id === i.id); if (pr?.tipo === 'lente') tonos[i.id] = (tonos[i.id] || 0) + i.cant; }));
    const dias = Array.from({ length: 30 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 29 + i); return tot(val.filter((p) => new Date(p.fecha).toDateString() === d.toDateString())); });
    return { total: tot(este), prev: tot(prev), n: este.length, ticket: este.length ? tot(este) / este.length : 0, canales: Object.entries(canales).sort((a, b) => b[1] - a[1]), tonos: Object.entries(tonos).sort((a, b) => b[1] - a[1]).slice(0, 3), dias };
  }, [pedidos, productos]);

  const bajos = useMemo(() => {
    const out = [];
    productos.filter((p) => p.tipo === 'lente').forEach((p) => GRADS.slice(0, 12).forEach((g) => { if ((p.stock[g] ?? 0) <= 1) out.push({ p, g, n: p.stock[g] ?? 0 }); }));
    return out.sort((a, b) => a.n - b.n);
  }, [productos]);

  const tareas = [
    ...c.revision.map((p) => ({ p, ic: <Wallet size={18} />, t: `Validar pago de ${p.clienta}`, s: `${p.folio} · ${mxn(p.total)} · ${p.canal}`, b: 'Revisar' })),
    ...c.metro.filter((p) => p.entrega.cita).map((p) => ({ p, ic: <Train size={18} />, t: `Entrega a ${nombre1(p.clienta)} · ${p.entrega.detalle}`, s: p.entrega.cita, b: 'Abrir' })),
    ...c.enviar.map((p) => ({ p, ic: <Package size={18} />, t: `Generar guía para ${p.clienta}`, s: `${p.entrega.detalle} · ${p.entrega.ciudad || 'CDMX'}`, b: 'Generar' })),
  ];
  const delta = mes.prev ? Math.round((mes.total / mes.prev - 1) * 100) : 0;
  const max = Math.max(...mes.dias, 1);
  const path = mes.dias.map((v, i) => `${(i / 29) * 300},${66 - (v / max) * 60}`).join(' L');
  const listaProv = 'Pedido para proveedor:\n' + bajos.slice(0, 12).map((b) => `• ${b.p.nombre} ${b.g === '0.00' ? 'plano' : b.g} — quedan ${b.n}`).join('\n');

  return (
    <div ref={ref}>
      <div className="pn-h" data-in>
        <div><p className="eyebrow">{new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</p><h1>{saludo}, <span className="it">equipo AGO</span></h1><p>{tareas.length ? `Tienes ${tareas.length} pendientes. Empieza por los pagos.` : 'Todo al día. 🤍'}</p></div>
      </div>
      <div className="kpis">
        {[
          ['revision', c.revision.length, 'Pagos por validar', 'Comprobantes nuevos', true],
          ['pagado', c.enviar.length, 'Por enviar', 'Guías por generar'],
          ['pagado', c.metro.length, 'Entregas en Metro', `${c.metro.filter((p) => p.entrega.cita?.startsWith('Hoy')).length} hoy`],
          ['enviado', c.camino.length, 'En camino', 'Con guía activa'],
        ].map(([f, n, l, s, hot], i) => (
          <button key={i} data-in className={'kpi ' + (hot && n ? 'hot' : '')} onClick={() => nav(`/panel/pedidos?e=${f}`)}><span className="n">{n}</span><span className="l">{l}</span><span className="s">{s}</span></button>
        ))}
      </div>
      <div className="pn-cols">
        <div>
          <section className="panel-card" data-in>
            <h3>Lo que sigue <small>en orden de prioridad</small></h3>
            {tareas.length === 0 && <p className="mute">Sin pendientes.</p>}
            {tareas.slice(0, 7).map((t) => (
              <div className="task" key={t.p.folio}><span className="ic">{t.ic}</span><div><b>{t.t}</b><small>{t.s}</small></div><button className="btn sm ghost" onClick={() => setAbierto(t.p.folio)}>{t.b}</button></div>
            ))}
            {tareas.length > 7 && <Link to="/panel/pedidos" className="link" style={{ fontSize: 14, display: 'inline-block', marginTop: 10 }}>Ver {tareas.length - 7} más</Link>}
          </section>
          <section className="panel-card" data-in>
            <h3>Se están acabando <small>1 pieza o menos</small></h3>
            {bajos.slice(0, 6).map((b) => (
              <div className="alert-row" key={b.p.id + b.g}><span style={{ display: 'flex', gap: 10, alignItems: 'center' }}><Iris p={b.p} glint={false} />{b.p.nombre}</span><span className="mono">{b.g === '0.00' ? 'Plano' : b.g} · <b style={{ color: b.n ? 'var(--gold-d)' : 'var(--bad)' }}>{b.n}</b></span></div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
              <button className="btn sm" onClick={() => { navigator.clipboard?.writeText(listaProv); useStore.getState().notificar('Lista copiada para tu proveedor'); }}><Copy size={15} /> Copiar lista para proveedor</button>
              <Link to="/panel/inventario" className="btn sm ghost">Abrir inventario</Link>
            </div>
          </section>
        </div>
        <div>
          <section className="panel-card" data-in>
            <h3>Este mes <small>pagos validados</small></h3>
            <div className="big-n">{mxn(mes.total)}</div>
            <div style={{ display: 'flex', gap: 14, marginTop: 6, fontSize: 13.5, color: 'var(--mute)', flexWrap: 'wrap' }}>
              <span className={'delta ' + (delta < 0 ? 'neg' : '')}>{delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}% vs mes pasado</span><span>{mes.n} pedidos</span><span>Ticket {mxn(mes.ticket)}</span>
            </div>
            <svg className="spark" viewBox="0 0 300 70" preserveAspectRatio="none" aria-label="Ventas de los últimos 30 días"><path d={`M${path}`} fill="none" stroke="var(--ink)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" /></svg>
            <p className="mute" style={{ fontSize: 12 }}>Últimos 30 días</p>
          </section>
          <section className="panel-card" data-in>
            <h3>¿De dónde vienen? <small>pedidos del mes</small></h3>
            <div className="bars">{mes.canales.map(([k, v]) => <div className="bar" key={k}><span>{k}</span><span className="tr"><b style={{ width: `${(v / mes.canales[0][1]) * 100}%` }} /></span><span className="v">{v}</span></div>)}</div>
          </section>
          <section className="panel-card" data-in>
            <h3>Lo más vendido</h3>
            {mes.tonos.map(([id, n], i) => { const p = productos.find((x) => x.id === id); return <div className="alert-row" key={id}><span style={{ display: 'flex', gap: 10, alignItems: 'center' }}><span className="mono mute">{i + 1}</span><Iris p={p} glint={false} />{p?.nombre}</span><span className="mono">{n} pares</span></div>; })}
          </section>
        </div>
      </div>
      {abierto && <OrderModal folio={abierto} onClose={() => setAbierto(null)} />}
    </div>
  );
}

/* ---------------- PEDIDOS ---------------- */
function Pedidos() {
  const pedidos = useStore((s) => s.pedidos);
  const [qs, setQs] = useSearchParams();
  const f = qs.get('e') || 'activos';
  const [q, setQ] = useState('');
  const [abierto, setAbierto] = useState(null);
  const ref = useEntrada([f]);
  const filtros = [['activos', 'Activos'], ...PASOS.map((s) => [s, ESTADOS[s].corto]), ['todos', 'Todos']];
  const lista = pedidos.filter((p) => (f === 'todos' ? true : f === 'activos' ? p.estado !== 'entregado' : p.estado === f) && (!q || (p.clienta + p.folio + (p.guia || '')).toLowerCase().includes(q.toLowerCase())));
  return (
    <div ref={ref}>
      <div className="pn-h" data-in><div><h1>Pedidos</h1><p>Cada pedido avanza con un toque: validar → guía → entregado.</p></div>
        <label className="fsel" style={{ width: 'min(100%,280px)' }}><Search size={16} /><input className="inp" style={{ border: 0, height: 36, background: 'transparent' }} placeholder="Nombre, folio o guía" value={q} onChange={(e) => setQ(e.target.value)} /></label>
      </div>
      <div className="frow" style={{ marginBottom: 18 }} data-in>{filtros.map(([k, l]) => <button key={k} className={'chip ' + (f === k ? 'on' : '')} onClick={() => setQs({ e: k })}>{l} <span className="mono" style={{ opacity: 0.6 }}>{pedidos.filter((p) => (k === 'todos' ? true : k === 'activos' ? p.estado !== 'entregado' : p.estado === k)).length}</span></button>)}</div>
      <div className="orders">{lista.slice(0, 60).map((p) => (
        <button className="order order-h" key={p.folio} data-in onClick={() => setAbierto(p.folio)}>
          <div><div className="who">{p.clienta}</div><div className="sub"><span className="mono">{p.folio}</span><span>{new Date(p.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</span><span>{p.entrega.detalle}</span><span>{p.canal}</span></div></div>
          <div style={{ textAlign: 'right' }}><span className={'pill-st ' + p.estado}>{p.entrega.tipo === 'metro' && p.estado === 'pagado' ? 'Por entregar' : ESTADOS[p.estado].corto}</span><div className="mono" style={{ marginTop: 8 }}>{mxn(p.total)}</div></div>
        </button>))}
        {!lista.length && <p className="empty">No hay pedidos aquí.</p>}
      </div>
      {abierto && <OrderModal folio={abierto} onClose={() => setAbierto(null)} />}
    </div>
  );
}

/* ---------- Modal de pedido (validar, generar guía, entregar) ---------- */
export function OrderModal({ folio, onClose }) {
  const p = useStore((s) => s.pedidos.find((x) => x.folio === folio));
  const { actualizarPedido, notificar } = useStore();
  const box = useRef();
  const [guiaPaso, setGuiaPaso] = useState(false);
  useGSAP(() => { gsap.from(box.current, { y: 40, opacity: 0, duration: 0.5, ease: 'expo.out' }); }, { scope: box });
  if (!p) return null;
  const paq = p.entrega.tipo === 'paqueteria';
  const avanzar = (estado, extra = {}) => { actualizarPedido(p.folio, { estado, ...extra }); notificar(`${p.folio}: ${ESTADOS[estado].label}`); };
  const generarGuia = () => {
    const guia = String(Math.floor(1e9 + Math.random() * 8e9)) + 'MX';
    actualizarPedido(p.folio, { guia, estado: 'enviado' });
    notificar(`Guía ${guia} generada con ${p.entrega.paq}`);
  };
  const pdf = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'mm', format: [102, 152] });
    doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.text(p.entrega.paq.toUpperCase(), 8, 14);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.text(`${p.entrega.servicio} · ${p.folio}`, 8, 20);
    doc.setLineWidth(0.4); doc.line(8, 24, 94, 24);
    doc.text('REMITENTE', 8, 31); doc.text('Pupilentes AGO · CDMX · 55 7111 3508', 8, 36, { maxWidth: 86 });
    doc.text('DESTINATARIO', 8, 48); doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.text(p.clienta, 8, 55);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.text(p.entrega.dir || `${p.entrega.ciudad || ''} CP ${p.entrega.cp || ''}`, 8, 61, { maxWidth: 86 }); doc.text(`Tel. ${p.tel}`, 8, 74);
    let x = 10; let s = 7; while (x < 92) { s = (s * 31 + 7) % 97; const w = 0.4 + (s % 4) * 0.35; doc.rect(x, 86, w, 26, 'F'); x += w + 0.5 + (s % 3) * 0.3; }
    doc.setFontSize(14); doc.setFont('courier', 'bold'); doc.text(p.guia, 51, 120, { align: 'center' });
    doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.text('Etiqueta de demostración · en producción la emite la paquetería vía API', 51, 145, { align: 'center' });
    doc.save(`guia-${p.folio}.pdf`);
  };
  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="scrim" onClick={onClose} />
      <div className="mbox" ref={box}>
        <button className="icon-btn" style={{ position: 'absolute', right: 12, top: 12 }} onClick={onClose} aria-label="Cerrar"><X size={20} /></button>
        <p className="eyebrow">{p.folio} · {p.canal}</p>
        <h2 className="h-s" style={{ fontSize: 26, margin: '6px 0 4px' }}>{p.clienta}</h2>
        <span className={'pill-st ' + p.estado}>{ESTADOS[p.estado].label}</span>
        <div className="order-b" style={{ padding: 0, border: 0 }}>
          <div className="lines">
            {p.items.map((i, k) => <div key={k} className="sum" style={{ fontSize: 14 }}><span>{i.cant}× {i.nombre}{i.od !== '0.00' || i.oi !== '0.00' ? <span className="mono mute" style={{ display: 'block', fontSize: 12.5 }}>OD {i.od} · OI {i.oi}{i.od !== i.oi && ' · mixta'}</span> : null}</span><span className="mono">{mxn(i.precio * i.cant)}</span></div>)}
            <div className="sum" style={{ fontSize: 14 }}><span>{p.entrega.detalle}{p.entrega.cita && ` · ${p.entrega.cita}`}</span><span className="mono">{p.entrega.costo ? mxn(p.entrega.costo) : 'Gratis'}</span></div>
            <div className="sum t"><span>Total</span><span className="mono">{mxn(p.total)}</span></div>
            {p.entrega.dir && <p className="mute" style={{ fontSize: 13.5 }}>{p.entrega.dir}</p>}
          </div>
          {p.estado === 'revision' && (<>
            <p className="eyebrow">Comprobante</p>
            {p.comprobante && p.comprobante !== 'whatsapp' ? <img className="proof" src={p.comprobante} alt="Comprobante de pago" /> : <p className="note" style={{ marginTop: 8 }}>{p.comprobante === 'whatsapp' ? 'La clienta mandó su comprobante por WhatsApp.' : `Comprobante recibido por ${p.canal}.`} Revisa en tu banca móvil un depósito de <b className="mono">{mxn(p.total)}</b>{p.puntosUsados ? ` (usó ${p.puntosUsados} puntos)` : ''}. <a className="link" href={waTo(p.tel, '')} target="_blank" rel="noreferrer">Abrir chat</a></p>}
            <div className="acts" style={{ marginTop: 14 }}><button className="btn" onClick={() => avanzar('pagado')}>Pago correcto · validar</button><a className="btn ghost" href={waTo(p.tel, `Hola ${nombre1(p.clienta)}, no vemos reflejado tu depósito del pedido ${p.folio}. ¿Nos reenvías el comprobante?`)} target="_blank" rel="noreferrer">No llegó</a></div>
          </>)}
          {p.estado === 'pagado' && paq && (!guiaPaso ? (
            <div className="acts"><button className="btn" onClick={() => setGuiaPaso(true)}><FileText size={16} /> Generar guía {p.entrega.paq}</button><a className="btn ghost" href={waTo(p.tel, MSG.pagado(p))} target="_blank" rel="noreferrer"><MessageCircle size={16} /> Avisar pago</a></div>
          ) : (
            <><div className="label-prev"><b>{p.entrega.paq} · {p.entrega.servicio}</b><br />Para: {p.clienta}<br />{p.entrega.dir || `${p.entrega.ciudad} · CP ${p.entrega.cp}`}<br />Paquete: sobre acolchado · 0.2 kg<div className="bc" /></div>
              <button className="btn full" onClick={generarGuia}>Confirmar y generar guía · {mxn(p.entrega.costo)}</button>
              <p className="mute" style={{ fontSize: 12.5, marginTop: 8 }}>En producción esto llama a la API del cotizador (Skydropx / Envia.com) y descuenta el saldo de tu cuenta.</p></>
          ))}
          {p.estado === 'pagado' && !paq && (<div className="acts"><button className="btn" onClick={() => avanzar(p.entrega.tipo === 'didi' ? 'enviado' : 'entregado')}>{p.entrega.tipo === 'didi' ? 'DiDi pedido · en camino' : 'Marcar entregado'}</button><a className="btn ghost" href={waTo(p.tel, MSG.pagado(p))} target="_blank" rel="noreferrer"><MessageCircle size={16} /> Confirmar cita</a></div>)}
          {p.estado === 'enviado' && (<div className="acts">
            {p.guia && <><button className="btn ghost" onClick={pdf}><Download size={16} /> Etiqueta PDF</button><a className="btn ghost" href={waTo(p.tel, MSG.guia(p))} target="_blank" rel="noreferrer"><MessageCircle size={16} /> Enviar guía</a></>}
            <button className="btn" onClick={() => avanzar('entregado')}>Marcar entregado</button>
          </div>)}
          {p.estado === 'entregado' && <div className="acts"><a className="btn ghost" href={waTo(p.tel, MSG.entregado(p))} target="_blank" rel="noreferrer"><MessageCircle size={16} /> Agradecer y avisar puntos</a></div>}
          {p.guia && <p className="mono" style={{ fontSize: 13, marginTop: 14 }}>Guía {p.guia}</p>}
        </div>
      </div>
    </div>
  );
}
