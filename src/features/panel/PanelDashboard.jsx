import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { formatMXN, calcularStockTotal } from '../../data/productos';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  AlertCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Truck,
  Eye,
  CheckSquare,
  Square,
  KanbanSquare
} from 'lucide-react';

export const PanelDashboard = () => {
  const pedidos = useStore((state) => state.pedidos);
  const productos = useStore((state) => state.productos);
  const clientas = useStore((state) => state.clientas);
  const diasOffsetSimulados = useStore((state) => state.diasOffsetSimulados);

  // KPIs
  const totalVentas = pedidos
    .filter((p) => p.estado !== 'cancelado')
    .reduce((sum, p) => sum + (p.total || 0), 0);

  const pedidosCompletados = pedidos.filter((p) => p.estado !== 'cancelado').length;
  const ticketPromedio = pedidosCompletados > 0 ? totalVentas / pedidosCompletados : 0;
  const pedidosPorVerificar = pedidos.filter((p) => p.estado === 'verificar_comprobante').length;

  // Modelos con alguna graduación en stock 0
  const modelosConStockCritico = productos.filter((prod) => {
    return Object.values(prod.stockPorGraduacion || {}).some((v) => Number(v) <= 0);
  }).length;

  // Renovaciones próximas (< 15 días)
  const renovacionesProximas = clientas.filter((c) => {
    const dias = Math.max(0, c.proximaRenovacionDias - diasOffsetSimulados);
    return dias <= 15;
  }).length;

  // Checklist "Acciones de Hoy"
  const [checklist, setChecklist] = useState([
    { id: 1, texto: "Verificar comprobante de transferencia de Valeria Morales (BBVA $867)", completado: false, link: "/panel/pedidos" },
    { id: 2, texto: "Generar guía de envío Estafeta para Fernanda Castillo (Roma Norte)", completado: false, link: "/panel/pedidos" },
    { id: 3, texto: "Reabastecer stock de graduación -3.25 en Miel Satín (0 piezas)", completado: false, link: "/panel/inventario" },
    { id: 4, texto: `Enviar WhatsApp de renovación a ${renovacionesProximas} clientas con lentes por vencer`, completado: false, link: "/panel/mensajes" },
    { id: 5, texto: "Entregar pedido en Metro Pantitlán a las 17:00 hrs", completado: true, link: "/panel/pedidos" }
  ]);

  const toggleCheck = (id) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completado: !item.completado } : item))
    );
  };

  // Top canales
  const canalesData = [
    { canal: "Instagram DM", porcentaje: 35, monto: totalVentas * 0.35, color: "#E1306C" },
    { canal: "WhatsApp Directo", porcentaje: 28, monto: totalVentas * 0.28, color: "#25D366" },
    { canal: "TikTok", porcentaje: 16, monto: totalVentas * 0.16, color: "#00F2FE" },
    { canal: "Mercado Libre", porcentaje: 12, monto: totalVentas * 0.12, color: "#FFE600" },
    { canal: "Tienda Online AGO (Nuevo)", porcentaje: 9, monto: totalVentas * 0.09, color: "#C9A24B" }
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Cabecera del Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-amber-400 block mb-1">
            Resumen Operativo
          </span>
          <h1 className="font-serif text-3xl font-bold text-amber-100">
            Centro de Control · Pupilentes AGO
          </h1>
          <p className="text-xs text-stone-400">
            Métricas reales de los últimos 60 días (~35 pedidos/mes en promedio).
          </p>
        </div>

        <Link
          to="/panel/pedidos"
          className="btn-gold text-xs px-5 py-2.5 inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <KanbanSquare className="w-4 h-4" />
          <span>Ver Tablero Kanban de Pedidos</span>
        </Link>
      </div>

      {/* TARJETAS DE KPIS PRINCIPALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Ventas Totales */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-400 uppercase">Ventas Facturadas</span>
            <div className="p-2 rounded-xl bg-amber-400/10 text-amber-300">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold text-white font-sans block mb-1">
            {formatMXN(totalVentas)}
          </span>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% vs mes anterior</span>
          </span>
        </div>

        {/* KPI 2: Pedidos y Ticket */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-400 uppercase">Pedidos / Ticket Prom.</span>
            <div className="p-2 rounded-xl bg-blue-400/10 text-blue-300">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold text-white font-sans block mb-1">
            {pedidosCompletados} pedidos
          </span>
          <span className="text-[11px] text-stone-400">
            Ticket promedio: <strong className="text-amber-300 font-mono">{formatMXN(ticketPromedio)}</strong>
          </span>
        </div>

        {/* KPI 3: Por Verificar Comprobante */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-amber-500/40 shadow-[0_0_15px_rgba(201,162,75,0.15)] relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-amber-300 uppercase">Por Validar Pago</span>
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 animate-pulse">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold text-amber-200 font-sans block mb-1">
            {pedidosPorVerificar} pendientes
          </span>
          <Link to="/panel/pedidos" className="text-[11px] text-amber-400 hover:underline flex items-center gap-1">
            <span>Revisar transferencias en Kanban</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* KPI 4: Renovaciones Próximas */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-400 uppercase">Renovaciones & Recompra</span>
            <div className="p-2 rounded-xl bg-emerald-400/10 text-emerald-300">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold text-white font-sans block mb-1">
            {renovacionesProximas} clientas
          </span>
          <Link to="/panel/mensajes" className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1">
            <span>Enviar mensaje con 1 clic</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* CHECKLIST: ACCIONES DE HOY */}
      <div className="p-6 rounded-3xl bg-neutral-900/90 border border-amber-500/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h3 className="font-serif text-xl font-bold text-amber-200 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-amber-400" />
            Acciones Prioritarias de Hoy para Araceli
          </h3>
          <span className="text-xs text-stone-400">
            {checklist.filter((c) => c.completado).length} de {checklist.length} completadas
          </span>
        </div>

        <div className="space-y-2.5">
          {checklist.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                item.completado
                  ? 'bg-neutral-950/60 border-neutral-800 text-stone-500 line-through'
                  : 'bg-neutral-950 border-neutral-700/80 text-neutral-100 hover:border-amber-400/50'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.completado ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-stone-500 shrink-0" />
                )}
                <span className="text-xs font-medium">{item.texto}</span>
              </div>

              <Link
                to={item.link}
                onClick={(e) => e.stopPropagation()}
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 shrink-0 ml-4"
              >
                <span>Resolver</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* DOS COLUMNAS: VENTAS POR CANAL Y TOP MODELOS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Ventas por Canal */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
          <h3 className="font-serif text-lg font-bold text-amber-200">
            Ventas por Canal de Captación (Los 5 Canales Declarados)
          </h3>
          <p className="text-xs text-stone-400">
            Muestra el origen de los pedidos para saber dónde enfocar campañas de contenido.
          </p>

          <div className="space-y-3.5 pt-2">
            {canalesData.map((canal) => (
              <div key={canal.canal} className="space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-neutral-200 flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: canal.color }}
                    />
                    {canal.canal}
                  </span>
                  <div className="font-mono text-stone-300">
                    <span className="font-bold text-white">{formatMXN(canal.monto)}</span> ({canal.porcentaje}%)
                  </div>
                </div>
                <div className="w-full h-2 bg-neutral-950 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${canal.porcentaje}%`,
                      backgroundColor: canal.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Modelos Más Vendidos */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
          <h3 className="font-serif text-lg font-bold text-amber-200">
            Top Modelos Estrella
          </h3>
          <p className="text-xs text-stone-400">
            Modelos de mayor rotación y margen en el período.
          </p>

          <div className="divide-y divide-neutral-800 text-xs">
            {productos.slice(0, 5).map((prod, index) => {
              const stockTotal = calcularStockTotal(prod);
              return (
                <div key={prod.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-neutral-800 text-stone-400 font-bold text-[10px] flex items-center justify-center font-mono">
                      {index + 1}
                    </span>
                    <div>
                      <span className="font-bold text-neutral-100 block">{prod.nombre}</span>
                      <span className="text-[10px] text-stone-500 uppercase font-mono">
                        Familia {prod.familia} · {formatMXN(prod.precio)}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-semibold font-mono ${
                      stockTotal <= 5 ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {stockTotal} pzs en stock
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
