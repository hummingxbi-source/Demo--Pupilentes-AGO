import React, { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
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
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Menu,
  X
} from 'lucide-react';

export const PanelLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pedidos = useStore((state) => state.pedidos);
  const avanzarDias = useStore((state) => state.avanzarDiasSimulados);
  const resetearDemo = useStore((state) => state.resetearDemo);
  const diasOffsetSimulados = useStore((state) => state.diasOffsetSimulados);
  const showToast = useStore((state) => state.showToast);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [busquedaGlobal, setBusquedaGlobal] = useState('');

  // Conteo de pedidos pendientes de verificar comprobante
  const pedidosPorVerificar = pedidos.filter((p) => p.estado === 'verificar_comprobante').length;

  const menuItems = [
    { label: "Dashboard", path: "/panel", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Inventario", path: "/panel/inventario", icon: <Boxes className="w-4 h-4" /> },
    {
      label: "Pedidos (Kanban)",
      path: "/panel/pedidos",
      icon: <KanbanSquare className="w-4 h-4" />,
      badge: pedidosPorVerificar > 0 ? `${pedidosPorVerificar} por validar` : null
    },
    { label: "Catálogo", path: "/panel/catalogo", icon: <Sparkles className="w-4 h-4" /> },
    { label: "Clientas & Tendencias", path: "/panel/clientas", icon: <Users className="w-4 h-4" /> },
    { label: "Mensajes & Plantillas", path: "/panel/mensajes", icon: <MessageSquare className="w-4 h-4" /> },
    { label: "Ajustes del Negocio", path: "/panel/ajustes", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-neutral-100 flex flex-col md:flex-row font-sans">
      {/* SIDEBAR FIJA */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-[#121214] border-r border-amber-500/20 flex flex-col justify-between transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Medallón Oficial */}
          <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
            <Link to="/panel" className="flex items-center gap-3">
              <div style={{ width: '40px', height: '40px', minWidth: '40px' }} className="w-10 h-10 rounded-full border border-amber-400/50 p-0.5 bg-neutral-900 shadow-[0_0_15px_rgba(201,162,75,0.25)]">
                <img src="/logo-pupilentes-ago-512.png" alt="Pupilentes AGO" className="logo-footer w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-serif text-lg font-bold text-amber-200 block leading-tight">
                  PUPILENTES AGO
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400/80 block">
                  Panel de Araceli
                </span>
              </div>
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menú de Navegación del Panel */}
          <nav className="p-4 space-y-1.5">
            {menuItems.map((item) => {
              const isActive =
                item.path === '/panel'
                  ? location.pathname === '/panel'
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-amber-400/15 text-amber-200 border border-amber-400/40 shadow-sm font-semibold'
                      : 'text-stone-400 hover:text-neutral-100 hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-amber-400 text-neutral-950 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Acciones inferiores de la Sidebar */}
        <div className="p-4 border-t border-neutral-800 space-y-3">
          {/* Botón de Demo: Avanzar +20 días */}
          <button
            type="button"
            onClick={() => avanzarDias(20)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-colors"
            title="Avanzar 20 días en el reloj demo para ver recordatorios de renovación"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Avanzar +20 días</span>
            </div>
            {diasOffsetSimulados > 0 && (
              <span className="text-[10px] font-mono font-bold text-amber-400">
                +{diasOffsetSimulados}d
              </span>
            )}
          </button>

          {/* Enlace directo a la tienda */}
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs border border-neutral-700 text-stone-300 hover:text-white hover:border-amber-400 transition-colors"
          >
            <span>Ver Tienda Online</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOPBAR */}
        <header className="h-16 bg-[#121214]/90 border-b border-neutral-800 px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 text-stone-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Búsqueda Global */}
            <div className="relative hidden sm:block w-72">
              <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar pedido, clienta o modelo..."
                value={busquedaGlobal}
                onChange={(e) => setBusquedaGlobal(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-700 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notificaciones de comprobantes pendientes */}
            <Link
              to="/panel/pedidos"
              className="relative p-2 rounded-full bg-neutral-900 border border-neutral-700 text-stone-300 hover:text-amber-300 transition-colors"
              title="Ver comprobantes pendientes de validación"
            >
              <Bell className="w-4 h-4" />
              {pedidosPorVerificar > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-neutral-950 text-[10px] font-bold flex items-center justify-center">
                  {pedidosPorVerificar}
                </span>
              )}
            </Link>

            {/* Perfil de Araceli Garrido */}
            <div className="flex items-center gap-3 pl-2 border-l border-neutral-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 text-neutral-950 font-bold text-xs flex items-center justify-center shadow-md">
                AG
              </div>
              <div className="hidden lg:block text-left text-xs">
                <span className="font-bold text-white block leading-tight">Araceli Garrido</span>
                <span className="text-[10px] text-stone-400 block font-mono">Fundadora & Dueña</span>
              </div>
            </div>
          </div>
        </header>

        {/* VISTA RENDERIZADA */}
        <main className="p-6 md:p-8 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
