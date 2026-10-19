import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { formatMXN, GRADUACIONES } from '../../data/productos';
import { gsap } from '../../lib/gsap';
import { enmascararTelefono, normalizarTelefono } from '../../lib/auth';
import { normalizarEstado, etiquetaEstado, puntosAPesos, PESOS_POR_PUNTO_GANADO } from '../../lib/estados';
import { WhatsAppDemoNotification } from '../../components/common/WhatsAppDemoNotification';
import {
  Crown, ArrowRight, RotateCw, ShoppingBag, Check, Phone, LogOut, ShieldCheck, Truck, Package,
  CreditCard, CheckCircle2, MapPin, Clock, FileText, MessageCircle, Pencil, Gift, ChevronLeft
} from 'lucide-react';

const WA_TIENDA = '525571113508';

const nivelPorPuntos = (pts) => {
  if (pts >= 500) return { nombre: 'Oro', siguiente: null, meta: 500 };
  if (pts >= 200) return { nombre: 'Plata', siguiente: 'Oro', meta: 500 };
  return { nombre: 'Bronce', siguiente: 'Plata', meta: 200 };
};

const etapaTracking = (estado) => {
  const e = normalizarEstado(estado);
  if (e === 'entregado') return 4;
  if (e === 'en_camino') return 3;
  if (e === 'por_enviar') return 2;
  if (e === 'verificar_comprobante') return 1;
  return 0;
};

const RECOMPENSAS = [
  { id: 'estuche', nombre: 'Estuche joyero dorado', puntos: 150 },
  { id: 'solucion', nombre: 'Solución multiusos 120 ml', puntos: 220 },
  { id: 'envio', nombre: 'Envío gratis en CDMX', puntos: 300 },
];

// ==========================================================================
// ACCESO POR WHATSAPP (paso 1: número, paso 2: código de 6 dígitos)
// ==========================================================================
const AccesoWhatsApp = () => {
  const solicitarOtp = useStore((s) => s.solicitarOtp);
  const verificarOtp = useStore((s) => s.verificarOtp);
  const otpPendiente = useStore((s) => s.otpPendiente);
  const showToast = useStore((s) => s.showToast);

  const [tel, setTel] = useState('');
  const [paso, setPaso] = useState(otpPendiente ? 2 : 1);
  const [digitos, setDigitos] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [espera, setEspera] = useState(0);
  const inputsRef = useRef([]);
  const cardRef = useRef(null);

  useEffect(() => {
    if (espera <= 0) return;
    const t = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  useEffect(() => {
    if (cardRef.current) gsap.fromTo(cardRef.current, { opacity: 0, x: 16 }, { opacity: 1, x: 0, duration: 0.45, ease: 'power2.out' });
    if (paso === 2) setTimeout(() => inputsRef.current[0]?.focus(), 80);
  }, [paso]);

  const enviar = (e) => {
    e?.preventDefault();
    const r = solicitarOtp(tel);
    if (!r.ok) return setError(r.error);
    setError('');
    setDigitos(['', '', '', '', '', '']);
    setPaso(2);
    setEspera(30);
  };

  const validar = (codigo) => {
    const r = verificarOtp(codigo);
    if (!r.ok) {
      setError(r.error);
      setDigitos(['', '', '', '', '', '']);
      inputsRef.current[0]?.focus();
      return;
    }
    showToast('Listo, ya puedes ver tus pedidos y puntos', 'success');
  };

  const setDigito = (i, v) => {
    const limpio = v.replace(/\D/g, '');
    if (limpio.length > 1) return pegar(limpio);
    const nuevos = [...digitos];
    nuevos[i] = limpio;
    setDigitos(nuevos);
    setError('');
    if (limpio && i < 5) inputsRef.current[i + 1]?.focus();
    if (nuevos.every((d) => d)) validar(nuevos.join(''));
  };

  const pegar = (texto) => {
    const arr = texto.replace(/\D/g, '').slice(0, 6).split('');
    const nuevos = [0, 1, 2, 3, 4, 5].map((i) => arr[i] || '');
    setDigitos(nuevos);
    if (arr.length === 6) validar(arr.join(''));
  };

  const telMostrado = otpPendiente?.telefono || tel;

  return (
    <div className="bg-ink text-champagne pt-28 pb-20 min-h-screen gutter flex items-center justify-center">
      <WhatsAppDemoNotification onAutocompletar={pegar} />
      <div className="w-full min-w-0 max-w-4xl grid md:grid-cols-5 gap-4 sm:gap-6 items-stretch">
        {/* Formulario */}
        <div ref={cardRef} className="md:col-span-3 min-w-0 bg-espresso border border-cocoa rounded-[28px] p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.24em] text-sand">Mis pedidos y puntos</span>
            <h1 className="font-serif text-3xl sm:text-4xl font-light">
              {paso === 1 ? 'Entra con tu WhatsApp' : 'Escribe tu código'}
            </h1>
            <p className="text-xs text-stone leading-relaxed">
              {paso === 1
                ? 'Sin contraseñas. Te enviamos un código de 6 dígitos por WhatsApp al número con el que haces tus pedidos.'
                : `Lo enviamos por WhatsApp a ${enmascararTelefono(telMostrado)}. Vence en 5 minutos.`}
            </p>
          </div>

          {paso === 1 ? (
            <form onSubmit={enviar} className="space-y-4">
              <label className="text-xs uppercase tracking-wider text-sand block">Número de WhatsApp</label>
              <div className="flex items-stretch rounded-xl bg-ink border border-cocoa focus-within:border-brass overflow-hidden">
                <span className="px-3.5 flex items-center gap-1.5 text-sm text-stone border-r border-cocoa font-mono">
                  <Phone className="w-4 h-4" /> +52
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoFocus
                  maxLength={10}
                  placeholder="10 dígitos"
                  value={tel}
                  onChange={(e) => { setTel(e.target.value.replace(/\D/g, '')); setError(''); }}
                  className="flex-1 min-w-0 px-4 py-3.5 bg-transparent text-champagne text-base font-mono tracking-wider focus:outline-none"
                />
              </div>
              {error && <p className="text-xs text-rose-300">{error}</p>}
              <button type="submit" disabled={tel.length !== 10} className="w-full btn-brass py-3.5 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                <MessageCircle className="w-4 h-4" />
                <span>Enviarme el código por WhatsApp</span>
              </button>
              <div className="rounded-xl border border-dashed border-cocoa p-3 text-[11px] text-stone leading-relaxed">
                Para la demo: usa <button type="button" onClick={() => setTel('5541928831')} className="text-gilt underline font-mono">55 4192 8831</button> (clienta con historial) o cualquier número para ver el alta de una clienta nueva.
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-6 gap-2" onPaste={(e) => { e.preventDefault(); pegar(e.clipboardData.getData('text')); }}>
                {digitos.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputsRef.current[i] = el)}
                    value={d}
                    inputMode="numeric"
                    maxLength={6}
                    aria-label={`Dígito ${i + 1}`}
                    onChange={(e) => setDigito(i, e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Backspace' && !d && i > 0) inputsRef.current[i - 1]?.focus(); }}
                    className={`w-full min-w-0 aspect-square max-w-[60px] text-center text-2xl font-mono rounded-xl bg-ink border ${error ? 'border-rose-500/60' : d ? 'border-brass' : 'border-cocoa'} text-champagne focus:border-gilt focus:outline-none transition-colors`}
                  />
                ))}
              </div>
              {error && <p className="text-xs text-rose-300">{error}</p>}
              <div className="flex items-center justify-between text-xs">
                <button onClick={() => { setPaso(1); setError(''); }} className="flex items-center gap-1 text-stone hover:text-champagne">
                  <ChevronLeft className="w-3.5 h-3.5" /> Cambiar número
                </button>
                <button onClick={enviar} disabled={espera > 0} className="text-gilt disabled:text-stone/60">
                  {espera > 0 ? `Reenviar en ${espera}s` : 'Reenviar código'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cómo funciona */}
        <div className="md:col-span-2 min-w-0 rounded-[28px] border border-cocoa/70 bg-ink p-6 sm:p-7 space-y-5">
          <span className="text-[11px] uppercase tracking-[0.24em] text-sand">Cómo funciona</span>
          {[
            { n: 1, t: 'Escribes tu WhatsApp', d: 'El mismo número que usas para pedir.' },
            { n: 2, t: 'Pupilentes AGO te envía un código', d: 'Llega como mensaje del número oficial de la tienda.' },
            { n: 3, t: 'Ves todo en un lugar', d: 'Estatus del pedido, guía, puntos, graduación y recompra.' },
          ].map((s) => (
            <div key={s.n} className="flex gap-3">
              <span className={`w-7 h-7 shrink-0 rounded-full border flex items-center justify-center text-xs font-mono ${paso >= s.n ? 'border-brass text-gilt bg-brass/10' : 'border-cocoa text-stone'}`}>{s.n}</span>
              <div>
                <p className="text-sm text-champagne">{s.t}</p>
                <p className="text-[11px] text-stone">{s.d}</p>
              </div>
            </div>
          ))}
          <div className="pt-4 border-t border-cocoa/60 flex items-center gap-2 text-[11px] text-stone">
            <ShieldCheck className="w-4 h-4 text-brass shrink-0" />
            Tu sesión se recuerda en este dispositivo. Nunca te pediremos contraseña.
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================================================
// SEGUIMIENTO DEL PEDIDO ACTIVO
// ==========================================================================
const Seguimiento = ({ pedido }) => {
  const etapa = etapaTracking(pedido.estado);
  const estado = normalizarEstado(pedido.estado);
  const pasos = [
    { label: 'Confirmado', desc: estado === 'esperando_pago' ? 'Esperando tu pago' : 'Folio emitido', icon: FileText },
    { label: 'Pago validado', desc: etapa === 1 ? 'Revisión en curso' : 'Aprobado', icon: CreditCard },
    { label: 'Preparando', desc: 'Empaque y guía', icon: Package },
    { label: pedido.metodoEntrega === 'entrega_personal' ? 'Por entregar' : 'En camino', desc: pedido.estacionMetro || pedido.guiaNumero || 'En ruta', icon: Truck },
    { label: 'Entregado', desc: 'Disfrútalos', icon: CheckCircle2 },
  ];

  return (
    <div className="rounded-[28px] bg-espresso border border-brass/40 p-6 sm:p-8 space-y-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cocoa/80">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-brass/20 text-gilt border border-brass/40 text-xs font-mono font-bold">#{pedido.id}</span>
            <span className="px-3 py-1 rounded-full bg-ink border border-cocoa text-xs text-sand">{etiquetaEstado(pedido.estado)}</span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-light">{pedido.items?.map((i) => i.nombre).join(', ')}</h3>
          <span className="text-xs text-stone block">
            {pedido.metodoEntrega === 'entrega_personal' ? `Entrega personal · ${pedido.estacionMetro || 'Metro CDMX'}` : pedido.metodoEntrega === 'didi' ? 'Envío por DiDi' : 'Paquetería'}
            {pedido.horarioPactado ? ` · ${pedido.horarioPactado}` : ''} · {formatMXN(pedido.total)}
          </span>
        </div>
        <Link to={`/seguimiento/${pedido.id}`} className="btn-brass text-xs flex items-center gap-2 self-start sm:self-auto">
          <span>Ver detalle y guía</span><ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {estado === 'verificar_comprobante' && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          Recibimos tu comprobante. Araceli lo valida en su banca y aquí verás el cambio en cuanto se apruebe.
        </div>
      )}

      <div className="relative pt-2">
        <div className="absolute top-7 left-[10%] right-[10%] h-[2px] bg-cocoa hidden sm:block">
          <div className="h-full bg-brass transition-all duration-700" style={{ width: `${(etapa / 4) * 100}%` }} />
        </div>
        <div className="grid grid-cols-5 gap-2 relative">
          {pasos.map((p, i) => {
            const Icon = p.icon;
            const hecho = i < etapa, actual = i === etapa;
            return (
              <div key={p.label} className="flex flex-col items-center text-center">
                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center mb-2 ${actual ? 'bg-brass text-ink ring-4 ring-brass/20' : hecho ? 'bg-ink border border-brass/60 text-brass' : 'bg-ink border border-cocoa text-stone/50'}`}>
                  {hecho ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />}
                </div>
                <span className={`text-[11px] sm:text-xs font-medium leading-tight ${actual ? 'text-gilt' : hecho ? 'text-champagne' : 'text-stone'}`}>{p.label}</span>
                <span className="text-[10px] text-stone hidden sm:block mt-0.5 truncate max-w-full">{p.desc}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ==========================================================================
// PÁGINA
// ==========================================================================
export const CuentaPage = () => {
  const navigate = useNavigate();
  const telefono = useStore((s) => s.telefono);
  const clienta = useStore((s) => s.clientaActual);
  const pedidos = useStore((s) => s.pedidos);
  const productos = useStore((s) => s.productos);
  const cerrarSesionCliente = useStore((s) => s.cerrarSesionCliente);
  const actualizarPerfilClienta = useStore((s) => s.actualizarPerfilClienta);
  const canjearRecompensa = useStore((s) => s.canjearRecompensa);
  const agregarAlCarrito = useStore((s) => s.agregarAlCarrito);
  const diasOffsetSimulados = useStore((s) => s.diasOffsetSimulados);
  const showToast = useStore((s) => s.showToast);

  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({});
  const wrapRef = useRef(null);
  const cardRef = useRef(null);
  const glareRef = useRef(null);

  const misPedidos = useMemo(() => {
    if (!telefono) return [];
    const t = normalizarTelefono(telefono);
    return pedidos.filter((p) => normalizarTelefono(p.telefono) === t);
  }, [pedidos, telefono]);

  const pedidoActivo = misPedidos.find((p) => !['entregado', 'cancelado'].includes(normalizarEstado(p.estado)));
  const puntos = clienta?.puntos || 0;
  const nivel = nivelPorPuntos(puntos);
  const esNueva = !clienta?.nombre;

  // Producto a renovar: el del último pedido entregado o el registrado en su ficha
  const ultimoEntregado = misPedidos.find((p) => normalizarEstado(p.estado) === 'entregado');
  const itemRenovar = ultimoEntregado?.items?.[0];
  const productoRenovar = productos.find((p) => p.id === (itemRenovar?.productoId || 'miel-satin'));
  const gradOD = clienta?.graduacionHabitual?.od || itemRenovar?.od;
  const gradOI = clienta?.graduacionHabitual?.oi || itemRenovar?.oi;
  const diasRestantes = clienta?.proximaRenovacionDias != null ? Math.max(0, clienta.proximaRenovacionDias - diasOffsetSimulados) : null;

  useEffect(() => {
    if (esNueva && telefono) { setEditando(true); setForm({ nombre: '', email: '', od: '', oi: '', entrega: 'Metro Pantitlán' }); }
  }, [esNueva, telefono]);

  // Tarjeta 3D (listener en contenedor estático para evitar el flicker)
  useEffect(() => {
    const wrap = wrapRef.current, card = cardRef.current, glare = glareRef.current;
    if (!telefono || !wrap || !card) return;
    if (!window.matchMedia('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rotX = gsap.quickTo(card, 'rotationX', { duration: 0.7, ease: 'power3.out' });
    const rotY = gsap.quickTo(card, 'rotationY', { duration: 0.7, ease: 'power3.out' });
    const move = (e) => {
      const r = wrap.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      rotY((x - 0.5) * 16); rotX(-(y - 0.5) * 16);
      if (glare) { glare.style.setProperty('--gx', `${x * 100}%`); glare.style.setProperty('--gy', `${y * 100}%`); glare.style.opacity = '0.35'; }
    };
    const leave = () => { gsap.to(card, { rotationX: 0, rotationY: 0, duration: 0.9, ease: 'power3.out' }); if (glare) glare.style.opacity = '0'; };
    wrap.addEventListener('pointermove', move);
    wrap.addEventListener('pointerleave', leave);
    return () => { wrap.removeEventListener('pointermove', move); wrap.removeEventListener('pointerleave', leave); };
  }, [telefono, editando]);

  if (!telefono) return <AccesoWhatsApp />;

  const abrirEdicion = () => {
    setForm({ nombre: clienta.nombre || '', email: clienta.email || '', od: gradOD || '', oi: gradOI || '', entrega: clienta.entregaPreferida || 'Metro Pantitlán' });
    setEditando(true);
  };

  const guardarPerfil = (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return showToast('Escribe tu nombre', 'warn');
    actualizarPerfilClienta({
      nombre: form.nombre.trim(),
      email: form.email.trim(),
      graduacionHabitual: form.od || form.oi ? { od: form.od || form.oi, oi: form.oi || form.od } : clienta.graduacionHabitual,
      entregaPreferida: form.entrega,
    });
    setEditando(false);
    showToast('Datos guardados. Se usarán para llenar tu próximo pedido.', 'success');
  };

  const renovar = () => {
    if (!productoRenovar) return navigate('/catalogo');
    agregarAlCarrito({
      productoId: productoRenovar.id, nombre: productoRenovar.nombre, tipoCompra: 'par',
      od: gradOD || '0.00', oi: gradOI || '0.00', precioUnitario: productoRenovar.precio, cantidad: 1,
    });
    navigate('/checkout');
  };

  const selectGrad = (campo) => (
    <select value={form[campo]} onChange={(e) => setForm({ ...form, [campo]: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-ink border border-cocoa text-champagne text-sm font-mono focus:border-brass focus:outline-none">
      <option value="">Sin dato</option>
      {GRADUACIONES.map((g) => <option key={g} value={g}>{g === '0.00' ? '0.00 (sin graduación)' : g}</option>)}
    </select>
  );

  return (
    <div className="bg-ink text-champagne pt-24 pb-20 min-h-screen gutter">
      <div className="w-full max-w-[1400px] mx-auto space-y-8">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-cocoa pb-6">
          <div>
            <span className="text-[11px] uppercase tracking-[0.24em] text-sand block mb-1">Mis pedidos y puntos</span>
            <h1 className="font-serif text-[clamp(2.2rem,4vw,3.25rem)] font-light leading-tight">
              {esNueva ? 'Bienvenida a Pupilentes AGO' : `Hola, ${clienta.nombre.split(' ')[0]}`}
            </h1>
            <p className="text-xs text-stone pt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-brass" /> Verificada por WhatsApp · {enmascararTelefono(telefono)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={abrirEdicion} className="px-4 py-2 rounded-full border border-cocoa hover:border-brass text-xs text-sand flex items-center gap-2">
              <Pencil className="w-3.5 h-3.5" /> Mis datos
            </button>
            <button onClick={() => { cerrarSesionCliente(); showToast('Sesión cerrada', 'info'); }} className="px-4 py-2 rounded-full border border-cocoa hover:border-rose-500/40 text-xs text-stone hover:text-rose-300 flex items-center gap-2">
              <LogOut className="w-3.5 h-3.5" /> Salir
            </button>
          </div>
        </div>

        {/* Mis datos: sirven para prellenar checkout y recompra */}
        {editando && (
          <form onSubmit={guardarPerfil} className="rounded-[28px] bg-espresso border border-brass/30 p-6 sm:p-8 space-y-5">
            <div>
              <h2 className="font-serif text-2xl font-light">{esNueva ? 'Completa tu perfil en 20 segundos' : 'Mis datos'}</h2>
              <p className="text-xs text-stone">Con esto llenamos tu próximo pedido automáticamente y confirmamos tu graduación por ojo sin preguntarte otra vez.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
              <label className="space-y-1.5 lg:col-span-2"><span className="text-sand uppercase tracking-wider">Nombre</span>
                <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre y apellido" className="w-full px-3 py-2.5 rounded-xl bg-ink border border-cocoa text-champagne text-sm focus:border-brass focus:outline-none" />
              </label>
              <label className="space-y-1.5 lg:col-span-3"><span className="text-sand uppercase tracking-wider">Correo (opcional)</span>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="para recibir tu ticket" className="w-full px-3 py-2.5 rounded-xl bg-ink border border-cocoa text-champagne text-sm focus:border-brass focus:outline-none" />
              </label>
              <label className="space-y-1.5"><span className="text-sand uppercase tracking-wider">Ojo derecho (OD)</span>{selectGrad('od')}</label>
              <label className="space-y-1.5"><span className="text-sand uppercase tracking-wider">Ojo izquierdo (OI)</span>{selectGrad('oi')}</label>
              <label className="space-y-1.5 lg:col-span-3"><span className="text-sand uppercase tracking-wider">Entrega preferida</span>
                <select value={form.entrega} onChange={(e) => setForm({ ...form, entrega: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-ink border border-cocoa text-champagne text-sm focus:border-brass focus:outline-none">
                  {['Metro Pantitlán', 'Metro Tepalcates', 'Otra estación (costo extra)', 'DiDi a domicilio', 'Paquetería'].map((o) => <option key={o}>{o}</option>)}
                </select>
              </label>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-brass text-xs flex items-center gap-2"><Check className="w-4 h-4" /> Guardar</button>
              {!esNueva && <button type="button" onClick={() => setEditando(false)} className="px-4 py-2 text-xs text-stone hover:text-champagne">Cancelar</button>}
            </div>
          </form>
        )}

        {/* Pedido activo */}
        {pedidoActivo ? (
          <Seguimiento pedido={pedidoActivo} />
        ) : (
          <div className="rounded-[28px] border border-dashed border-cocoa p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-2xl font-light">{misPedidos.length ? 'No tienes pedidos en curso' : 'Aún no tienes pedidos con este número'}</h3>
              <p className="text-xs text-stone">Cuando compres, aquí verás el estatus en tiempo real: pago, empaque, guía y entrega.</p>
            </div>
            <Link to="/catalogo" className="btn-brass text-xs flex items-center gap-2 shrink-0"><ShoppingBag className="w-4 h-4" /> Ver catálogo</Link>
          </div>
        )}

        {/* Puntos */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 flex justify-center">
            <div ref={wrapRef} className="[perspective:1100px] w-full max-w-md select-none">
              <div ref={cardRef} style={{ transformStyle: 'preserve-3d', aspectRatio: '1.586 / 1' }} className="relative w-full rounded-[24px] p-7 overflow-hidden bg-gradient-to-br from-espresso via-ink to-espresso border border-brass/25 shadow-2xl flex flex-col justify-between">
                <div ref={glareRef} style={{ opacity: 0, transition: 'opacity 0.4s ease', background: 'radial-gradient(circle at var(--gx, 50%) var(--gy, 50%), rgba(217,190,133,0.3) 0%, transparent 60%)' }} className="absolute inset-0 pointer-events-none" />
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-ink border border-brass/30 p-0.5"><img src="/logo-pupilentes-ago-512.png" alt="" className="w-full h-full object-contain" /></div>
                    <span className="font-serif text-[13px] tracking-[0.2em] text-sand uppercase">AGO Privilège</span>
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.16em] text-gilt flex items-center gap-1"><Crown className="w-3 h-3" />{nivel.nombre}</span>
                </div>
                <div className="relative z-10">
                  <span className="text-[10px] text-stone uppercase tracking-[0.22em] block mb-1">Puntos disponibles</span>
                  <span className="font-serif text-5xl font-light">{puntos}<span className="text-sm font-sans text-stone ml-1">pts</span></span>
                  <span className="text-[11px] text-brass block mt-1">Equivalen a {formatMXN(puntosAPesos(puntos))} de descuento</span>
                </div>
                <div className="flex items-end justify-between relative z-10 text-[12px]">
                  <span className="font-medium tracking-wide">{clienta.nombre || 'Clienta AGO'}</span>
                  <span className="text-[10px] text-brass tracking-widest font-mono">{(telefono || '').replace(/\D/g, '').slice(-4)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-espresso/60 border border-cocoa rounded-[28px] p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-light">Programa de puntos</h2>
              <p className="text-sm text-stone leading-relaxed">
                Ganas 1 punto por cada ${PESOS_POR_PUNTO_GANADO} de compra. {nivel.siguiente
                  ? <>Te faltan <strong className="text-sand">{nivel.meta - puntos} puntos</strong> para nivel <strong className="text-champagne">{nivel.siguiente}</strong>.</>
                  : <>Estás en el nivel más alto: envíos gratis en CDMX y preventa de nuevos tonos.</>}
              </p>
            </div>
            <div>
              <div className="flex justify-between text-xs uppercase tracking-wider text-stone mb-2"><span>Progreso a {nivel.siguiente || 'Oro'}</span><span className="font-mono text-champagne">{puntos} / {nivel.meta}</span></div>
              <div className="w-full h-2 rounded-full bg-ink border border-cocoa overflow-hidden"><div className="h-full bg-brass rounded-full transition-all duration-700" style={{ width: `${Math.min(100, (puntos / nivel.meta) * 100)}%` }} /></div>
            </div>
            <div className="pt-2 border-t border-cocoa/50 grid sm:grid-cols-3 gap-3 text-xs">
              {RECOMPENSAS.map((r) => {
                const alcanza = puntos >= r.puntos;
                return (
                  <div key={r.id} className={`p-3 rounded-xl border flex flex-col gap-2 ${alcanza ? 'bg-ink border-brass/40' : 'bg-ink/50 border-cocoa'}`}>
                    <Gift className={`w-4 h-4 ${alcanza ? 'text-gilt' : 'text-stone/60'}`} />
                    <strong className="text-champagne font-medium leading-tight">{r.nombre}</strong>
                    <span className="text-stone text-[11px]">{r.puntos} pts</span>
                    <button disabled={!alcanza} onClick={() => canjearRecompensa(r.puntos, r.nombre)} className="mt-auto py-1.5 rounded-full border border-brass/30 text-gilt hover:bg-brass hover:text-ink transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gilt">
                      {alcanza ? 'Canjear' : `Faltan ${r.puntos - puntos}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Renovación */}
        {productoRenovar && (gradOD || ultimoEntregado) && (
          <div className="bg-espresso rounded-[28px] border border-cocoa p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex flex-col gap-2 max-w-xl">
              <div className="flex items-center gap-2 text-brass text-[11px] uppercase tracking-[0.2em]"><RotateCw className="w-3.5 h-3.5" />Recordatorio de renovación</div>
              <h3 className="font-serif text-2xl font-light">
                {diasRestantes != null
                  ? diasRestantes === 0 ? `Es momento de renovar tus ${productoRenovar.nombre}` : `A tus ${productoRenovar.nombre} les quedan ${diasRestantes} días de uso recomendado`
                  : `Vuelve a pedir tus ${productoRenovar.nombre}`}
              </h3>
              <p className="text-xs text-stone">Graduación guardada: <strong className="text-sand font-mono">OD {gradOD || '—'}</strong> · <strong className="text-sand font-mono">OI {gradOI || '—'}</strong>. Te enviaremos un aviso por WhatsApp antes de que venzan.</p>
            </div>
            <button onClick={renovar} className="btn-brass shrink-0 flex items-center gap-2"><ShoppingBag className="w-4 h-4" />Renovar en 1 clic ({formatMXN(productoRenovar.precio)})</button>
          </div>
        )}

        {/* Historial */}
        {misPedidos.length > 0 && (
          <div className="bg-espresso rounded-[28px] border border-cocoa p-6 sm:p-8 space-y-4">
            <h3 className="font-serif text-2xl font-light">Mi historial ({misPedidos.length})</h3>
            <div className="divide-y divide-cocoa text-xs">
              {misPedidos.map((p) => (
                <div key={p.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2"><span className="font-mono text-champagne">#{p.id}</span><span className="text-stone">· {p.fecha}</span></div>
                    <span className="text-stone block">{p.items.map((i) => `${i.nombre} (OD ${i.od} / OI ${i.oi})`).join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-5">
                    <span className="px-2.5 py-1 rounded-full bg-ink border border-cocoa text-[11px] text-sand">{etiquetaEstado(p.estado)}</span>
                    <span className="text-sand font-medium text-sm">{formatMXN(p.total)}</span>
                    <Link to={`/seguimiento/${p.id}`} className="btn-link-thread text-xs flex items-center gap-1">Rastrear <ArrowRight className="w-3.5 h-3.5" /></Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center text-xs text-stone">
          ¿Dudas con tu pedido? <a href={`https://wa.me/${WA_TIENDA}?text=${encodeURIComponent(`Hola, tengo una duda con mi pedido${pedidoActivo ? ` #${pedidoActivo.id}` : ''}`)}`} target="_blank" rel="noreferrer" className="text-gilt underline inline-flex items-center gap-1">Escríbenos por WhatsApp</a>
        </div>
      </div>
    </div>
  );
};

export default CuentaPage;
