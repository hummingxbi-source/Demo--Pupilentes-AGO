import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { formatMXN } from '../../data/productos';
import { Sparkles, Crown, Clock, ArrowRight, RotateCw, Gift, ShieldCheck, ShoppingBag, Check } from 'lucide-react';

export const CuentaPage = () => {
  const navigate = useNavigate();
  const clientaActual = useStore((state) => state.clientaActual);
  const ajustes = useStore((state) => state.ajustes);
  const pedidos = useStore((state) => state.pedidos);
  const agregarAlCarrito = useStore((state) => state.agregarAlCarrito);
  const diasOffsetSimulados = useStore((state) => state.diasOffsetSimulados);
  const showToast = useStore((state) => state.showToast);

  // Efecto holográfico 3D de la tarjeta según mouse
  const [cardRotate, setCardRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const card = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - card.left - card.width / 2;
    const y = e.clientY - card.top - card.height / 2;
    setCardRotate({ x: -(y / 15), y: x / 15 });
  };

  const handleMouseLeave = () => {
    setCardRotate({ x: 0, y: 0 });
  };

  // Recompra en 1 clic: precarga el carrito con el mismo producto y graduación
  const recomprarEnUnClic = (modeloNombre, od, oi, productoId) => {
    const item = {
      productoId: productoId || "miel-satin",
      nombre: modeloNombre,
      tipoCompra: "par",
      od: od || "-1.50",
      oi: oi || "-1.75",
      precioUnitario: 649.00,
      cantidad: 1
    };
    agregarAlCarrito(item);
    showToast(`¡"${modeloNombre}" listo en tu carrito con tu graduación habitual!`, "success");
    navigate('/checkout');
  };

  // Días restantes calculados considerando el simulador de tiempo
  const diasBase = 12;
  const diasRestantes = Math.max(0, diasBase - diasOffsetSimulados);

  return (
    <div className="bg-neutral-950 text-neutral-100 py-12 min-h-screen">
      <div className="container-custom max-w-5xl space-y-12">
        {/* Cabecera del Perfil */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <span className="text-xs uppercase font-mono tracking-widest text-amber-400 block mb-1">
              Mi Cuenta Boutique
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-amber-100">
              Hola, {clientaActual.nombre}
            </h1>
            <p className="text-xs text-stone-400">
              Miembro desde agosto 2026 · {clientaActual.email} · {clientaActual.telefono}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>Nivel {clientaActual.nivel} VIP</span>
            </span>
          </div>
        </div>

        {/* SECCIÓN 1: TARJETA DE MEMBRESÍA HOLOGRÁFICA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 flex justify-center">
            {/* Tarjeta Holográfica con Tilt 3D */}
            <div
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                transform: `perspective(1000px) rotateX(${cardRotate.x}deg) rotateY(${cardRotate.y}deg)`,
                transition: 'transform 0.15s ease-out'
              }}
              className="w-full max-w-sm h-56 rounded-3xl p-6 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(201,162,75,0.3)] border border-amber-400/60 flex flex-col justify-between cursor-pointer select-none bg-gradient-to-br from-neutral-900 via-neutral-950 to-amber-950/40"
            >
              {/* Brillo reflectante que sigue el ángulo */}
              <div
                className="absolute inset-0 opacity-30 pointer-events-none bg-gradient-to-tr from-transparent via-amber-200/40 to-transparent"
                style={{
                  transform: `translateX(${cardRotate.y * 5}px) translateY(${cardRotate.x * 5}px)`
                }}
              />

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full border border-amber-400/50 p-0.5 bg-neutral-900">
                    <img src="/logo-pupilentes-ago-512.png" alt="Logo" className="w-full h-full object-contain" />
                  </div>
                  <span className="font-serif text-sm font-bold text-amber-200 tracking-wider">
                    AGO PRIVILÈGE
                  </span>
                </div>
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>

              <div className="relative z-10">
                <span className="text-[10px] text-stone-400 uppercase tracking-widest block">
                  Puntos Acumulados
                </span>
                <span className="text-3xl font-serif font-bold text-amber-200 block">
                  {clientaActual.puntos} <span className="text-sm font-sans font-normal text-stone-300">pts</span>
                </span>
              </div>

              <div className="flex items-end justify-between relative z-10 text-xs">
                <div>
                  <span className="text-[10px] text-stone-400 block uppercase">Titular</span>
                  <span className="font-semibold text-white tracking-wider">
                    {clientaActual.nombre}
                  </span>
                </div>
                <span className="font-mono text-amber-300 font-bold uppercase tracking-widest">
                  {clientaActual.nivel}
                </span>
              </div>
            </div>
          </div>

          {/* Beneficios y Barra de Progreso */}
          <div className="lg:col-span-6 space-y-4">
            <h3 className="font-serif text-2xl font-bold text-amber-100">
              Tu Estatus de Lealtad
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Estás a solo <strong>{Math.max(0, 600 - clientaActual.puntos)} puntos</strong> de alcanzar el nivel <strong>Oro VIP</strong> (envíos locales gratis y 10% permanente en todas tus órdenes).
            </p>

            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-stone-400">Progreso a Oro VIP</span>
                <span className="text-amber-300 font-mono">{clientaActual.puntos} / 600 pts</span>
              </div>
              <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-amber-300 rounded-full"
                  style={{ width: `${Math.min(100, (clientaActual.puntos / 600) * 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 text-xs">
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                <span className="text-amber-400 font-bold block mb-1">Beneficio Activo</span>
                <span className="text-stone-300">5% desc. extra en kits + estuche de cortesía</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                <span className="text-amber-400 font-bold block mb-1">Próximo Nivel</span>
                <span className="text-stone-300">Envíos gratis en CDMX y regalos sorpresa</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: RECORDATORIOS DE RENOVACIÓN DE LENTES */}
        <div className="bg-neutral-900/80 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-4">
            <div>
              <span className="text-xs uppercase font-mono tracking-widest text-amber-400 block mb-1">
                Salud Visual Ocular
              </span>
              <h3 className="font-serif text-2xl font-bold text-amber-100">
                Tus Pupilentes Actuales
              </h3>
            </div>
            <span className="text-xs text-stone-400">
              Duración recomendada para evitar fatiga corneal
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-950 border border-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {/* Contador circular simulado */}
              <div className="relative w-20 h-20 rounded-full border-4 border-amber-400/30 flex items-center justify-center shrink-0">
                <div className="text-center">
                  <span className="text-xl font-bold text-amber-300 font-mono block leading-none">
                    {diasRestantes}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-stone-400">
                    días
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-neutral-100 block">
                  Miel Satín (Uso Anual)
                </span>
                <span className="text-xs text-stone-400 block font-mono">
                  Tu graduación guardada: OD -1.50 | OI -1.75
                </span>
                <p className="text-[11px] text-amber-300/90 mt-1">
                  {diasRestantes <= 5
                    ? "⚠️ Es momento de renovar para mantener la oxigenación óptima de tus ojos."
                    : "Tus pupilentes están en período de vida útil recomendado."}
                </p>
              </div>
            </div>

            {/* Botón Recomprar en 1 clic */}
            <button
              type="button"
              onClick={() => recomprarEnUnClic("Miel Satín", "-1.50", "-1.75", "miel-satin")}
              className="btn-gold text-xs px-6 py-3 whitespace-nowrap flex items-center gap-2 w-full md:w-auto justify-center"
            >
              <RotateCw className="w-4 h-4" />
              <span>Recomprar en 1 Clic con mi Graduación</span>
            </button>
          </div>
        </div>

        {/* SECCIÓN 3: CATÁLOGO DE CANJES DE PUNTOS */}
        <div className="space-y-6">
          <div>
            <h3 className="font-serif text-2xl font-bold text-amber-100 mb-1">
              Catálogo de Canjes con tus Puntos AGO
            </h3>
            <p className="text-xs text-stone-400">
              Canjea tus puntos por productos de cuidado o saldo a favor en tu próximo pedido.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ajustes.lealtad.catalogoCanjes.map((canje) => {
              const puedeCanjear = clientaActual.puntos >= canje.puntos;
              return (
                <div
                  key={canje.id}
                  className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-amber-400 font-mono block mb-2">
                      {canje.puntos} Puntos
                    </span>
                    <h4 className="font-serif text-base font-bold text-neutral-100 mb-1">
                      {canje.titulo}
                    </h4>
                    <span className="text-xs text-stone-500 block">
                      Valor comercial: {formatMXN(canje.valorPesos)}
                    </span>
                  </div>

                  <div className="mt-5 pt-3 border-t border-neutral-800">
                    <button
                      type="button"
                      disabled={!puedeCanjear}
                      onClick={() => showToast(`Canje solicitado en caja al pagar. Tienes saldo suficiente.`, "success")}
                      className={`w-full py-2 rounded-xl text-xs font-semibold transition-all ${
                        puedeCanjear
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400 hover:bg-amber-400 hover:text-black'
                          : 'bg-neutral-950 text-stone-600 border border-neutral-800 cursor-not-allowed'
                      }`}
                    >
                      {puedeCanjear ? "Disponible para canje" : `Faltan ${canje.puntos - clientaActual.puntos} pts`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECCIÓN 4: HISTORIAL DE PEDIDOS */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <h3 className="font-serif text-xl font-bold text-amber-200">
            Historial de Pedidos Recientes
          </h3>

          <div className="divide-y divide-neutral-800 text-xs">
            {pedidos.slice(0, 3).map((ped) => (
              <div key={ped.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-mono font-bold text-amber-300 block">
                    #{ped.id} · {ped.fecha}
                  </span>
                  <span className="text-stone-400">
                    {ped.items.map((i) => i.nombre).join(', ')} — {ped.metodoEntrega.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-bold text-white font-mono">{formatMXN(ped.total)}</span>
                  <Link
                    to={`/seguimiento/${ped.id}`}
                    className="text-amber-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>Rastrear</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
