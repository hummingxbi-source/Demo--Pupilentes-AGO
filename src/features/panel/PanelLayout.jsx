import React, { useState, useMemo } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { etiquetaEstado } from '../../lib/estados';
import { useStore } from '../../store/useStore';
import {
  LayoutDashboard,
  Boxes,
  KanbanSquare,
  Sparkles,
  Users,
  MessageSquare,
  Settings,
  ExternalLink,
  Search,
  Bell,
  Clock,
  Menu,
  X,
  RotateCcw,
} from 'lucide-react';

export const PanelLayout = () => {
  const location = useLocation();
  const pedidos = useStore((state) => state.pedidos);
  const avanzarDias = useStore((state) => state.avanzarDiasSimulados);
  const diasOffsetSimulados = useStore((state) => state.diasOffsetSimulados);
  const resetearDemo = useStore((state) => state.resetearDemo);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [busquedaGlobal, setBusquedaGlobal] = useState('');

  // Conteo de pedidos pendientes de verificar comprobante
  const pedidosPorVerificar = pedidos.filter((p) => p.estado === 'verificar_comprobante').length;
  const navigate = useNavigate();
  const clientas = useStore((state) => state.clientas);
  const productos = useStore((state) => state.productos);

  // Búsqueda global: pedidos, clientas y modelos en un solo lugar
  const resultados = useMemo(() => {
    const q = busquedaGlobal.trim().toLowerCase();
    if (q.length < 2) return [];
    const qd = q.replace(/\D/g, '');
    const telOk = (t) => qd.length >= 3 && (t || '').replace(/\D/g, '').includes(qd);
    const ped = pedidos.filter((p) => p.id.toLowerCase().includes(q) || p.clientaNombre?.toLowerCase().includes(q) || telOk(p.telefono)).slice(0, 4)
      .map((p) => ({ k: p.id, tipo: 'Pedido', t: `${p.id} · ${p.clientaNombre}`, d: etiquetaEstado(p.estado), to: `/panel/pedidos?q=${encodeURIComponent(p.id)}` }));
    const cli = clientas.filter((c) => c.nombre?.toLowerCase().includes(q) || telOk(c.telefono)).slice(0, 3)
      .map((c) => ({ k: c.id, tipo: 'Clienta', t: c.nombre || c.telefono, d: `${c.telefono} · ${c.puntos} pts`, to: `/panel/pedidos?q=${encodeURIComponent(c.telefono)}` }));
    const pro = productos.filter((p) => p.nombre.toLowerCase().includes(q)).slice(0, 3)
      .map((p) => ({ k: p.id, tipo: 'Modelo', t: p.nombre, d: 'Ver disponibilidad', to: `/panel/inventario?vista=consulta&modelo=${p.id}` }));
    return [...ped, ...cli, ...pro];
  }, [busquedaGlobal, pedidos, clientas, productos]);

  const irA = (to) => { setBusquedaGlobal(''); navigate(to); };
  React.useEffect(() => { setBusquedaGlobal(''); }, [location.pathname]);

  const porRenovar = clientas.filter((c) => c.proximaRenovacionDias != null && c.proximaRenovacionDias - diasOffsetSimulados <= 7).length;
  const grupos = [
    { titulo: 'Día a día', items: [
      { label: 'Hoy', path: '/panel', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'Pedidos', path: '/panel/pedidos', icon: <KanbanSquare className="w-4 h-4" />, badge: pedidosPorVerificar || null },
      { label: 'Inventario', path: '/panel/inventario', icon: <Boxes className="w-4 h-4" /> },
    ] },
    { titulo: 'Vender más', items: [
      { label: 'Catálogo de la tienda', path: '/panel/catalogo', icon: <Sparkles className="w-4 h-4" /> },
      { label: 'Clientas y renovaciones', path: '/panel/clientas', icon: <Users className="w-4 h-4" />, badge: porRenovar || null },
      { label: 'Mensajes y plantillas', path: '/panel/mensajes', icon: <MessageSquare className="w-4 h-4" /> },
    ] },
    { titulo: 'Configurar', items: [
      { label: 'Ajustes del negocio', path: '/panel/ajustes', icon: <Settings className="w-4 h-4" /> },
    ] },
  ];

  return (
    <div className="min-h-screen bg-ink text-champagne flex flex-col md:flex-row font-sans">
      {/* SIDEBAR FIJA */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-espresso border-r border-cocoa flex flex-col justify-between transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Medallón Oficial */}
          <div className="p-6 border-b border-cocoa flex items-center justify-between">
            <Link to="/panel" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-stone/30 p-0.5 bg-ink">
                <img src="/logo-pupilentes-ago-512.png" alt="Pupilentes AGO" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-serif text-base font-light text-champagne block leading-tight">
                  PUPILENTES AGO
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-sand block font-mono">
                  Panel Araceli
                </span>
              </div>
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-stone hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menú de Navegación del Panel */}
          <nav className="p-4 space-y-5">
            {grupos.map((g) => (
              <div key={g.titulo} className="space-y-1">
                <span className="px-3.5 text-[10px] uppercase tracking-[0.22em] text-stone/70">{g.titulo}</span>
                {g.items.map((item) => {
                  const isActive = item.path === '/panel' ? location.pathname === '/panel' : location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] transition-all ${
                        isActive ? 'bg-cocoa text-sand border border-brass/30 font-medium' : 'text-stone hover:text-champagne hover:bg-cocoa/40 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">{item.icon}<span>{item.label}</span></div>
                      {item.badge && <span className="min-w-[20px] h-5 px-1.5 text-[10px] font-semibold rounded-full bg-brass text-ink flex items-center justify-center">{item.badge}</span>}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Acciones inferiores de la Sidebar */}
        <div className="p-4 border-t border-cocoa space-y-2.5">
          {/* Botón Resetear Demo */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm('¿Reiniciar todos los datos de demostración a valores de fábrica?')) {
                resetearDemo();
                window.location.reload();
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[12px] bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 hover:border-rose-400 transition-colors font-medium"
            title="Borrar persistencia y reiniciar datos semilla de fábrica"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Resetear Demo</span>
          </button>

          {/* Botón de Demo: Avanzar +20 días */}
          <button
            type="button"
            onClick={() => avanzarDias(20)}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-[12px] bg-cocoa/50 border border-cocoa text-sand hover:border-brass/40 transition-colors"
            title="Avanzar 20 días en el reloj demo para ver recordatorios de renovación"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-brass" />
              <span>Avanzar +20 días</span>
            </div>
            {diasOffsetSimulados > 0 && (
              <span className="text-[10px] font-mono text-brass">
                +{diasOffsetSimulados}d
              </span>
            )}
          </button>

          {/* Enlace directo a la tienda */}
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[12px] border border-cocoa text-stone hover:text-champagne hover:border-sand transition-colors"
          >
            <span>Ver Tienda Online</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOPBAR */}
        <header className="h-16 bg-espresso border-b border-cocoa px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
          <div className="flex items-center gap-3 flex-1 min-w-0 mr-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 text-stone hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Búsqueda Global */}
            <div className="relative flex-1 min-w-0 sm:flex-none sm:w-80">
              <Search className="w-3.5 h-3.5 text-stone absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar folio, clienta o modelo"
                value={busquedaGlobal}
                onChange={(e) => setBusquedaGlobal(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && resultados[0]) irA(resultados[0].to); if (e.key === 'Escape') setBusquedaGlobal(''); }}
                className="w-full pl-9 pr-3 py-1.5 rounded-full bg-ink border border-cocoa text-[13px] text-champagne placeholder-stone/60 focus:outline-none focus:border-brass"
              />
              {busquedaGlobal.trim().length >= 2 && (
                <div className="absolute top-full mt-2 left-0 right-0 rounded-xl bg-espresso border border-cocoa shadow-2xl overflow-hidden z-50">
                  {resultados.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-stone">Sin resultados</div>
                  ) : resultados.map((r) => (
                    <button key={r.tipo + r.k} onClick={() => irA(r.to)} className="w-full text-left px-4 py-2.5 hover:bg-cocoa/60 flex items-center gap-3 border-b border-cocoa/50 last:border-0">
                      <span className="text-[9px] uppercase tracking-wider text-brass w-12 shrink-0">{r.tipo}</span>
                      <span className="min-w-0">
                        <span className="block text-[13px] text-champagne truncate">{r.t}</span>
                        <span className="block text-[11px] text-stone truncate">{r.d}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notificaciones de comprobantes pendientes */}
            <Link
              to="/panel/pedidos"
              className="relative p-2 rounded-full bg-ink border border-cocoa text-stone hover:text-champagne transition-colors"
              title="Ver comprobantes pendientes de validación"
            >
              <Bell className="w-4 h-4" />
              {pedidosPorVerificar > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brass text-ink text-[10px] font-bold flex items-center justify-center">
                  {pedidosPorVerificar}
                </span>
              )}
            </Link>

            {/* Perfil de Araceli Garrido */}
            <div className="flex items-center gap-3 pl-3 border-l border-cocoa">
              <div className="w-8 h-8 rounded-full bg-cocoa border border-brass/30 text-sand font-medium text-[12px] flex items-center justify-center">
                AG
              </div>
              <div className="hidden lg:block text-left text-[12px]">
                <span className="font-medium text-champagne block leading-tight">Araceli Garrido</span>
                <span className="text-[10px] text-stone block font-mono">Fundadora & Dueña</span>
              </div>
            </div>
          </div>
        </header>

        {/* VISTA RENDERIZADA */}
        <main className="px-4 pt-5 pb-28 sm:p-6 md:p-8 flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PanelLayout;

