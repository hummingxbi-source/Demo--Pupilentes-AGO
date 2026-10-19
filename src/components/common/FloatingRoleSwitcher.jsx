import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { User, ShieldCheck, ArrowRight, RotateCcw } from 'lucide-react';

export const FloatingRoleSwitcher = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const rolActual = useStore((state) => state.rolActual);
  const setRol = useStore((state) => state.setRol);
  const resetearDemo = useStore((state) => state.resetearDemo);

  const esPanel = location.pathname.startsWith('/panel');

  const cambiarARol = (nuevoRol) => {
    setRol(nuevoRol);
    if (nuevoRol === 'duena' && !esPanel) {
      navigate('/panel');
    } else if (nuevoRol === 'clienta' && esPanel) {
      navigate('/');
    }
  };

  return (
    <aside 
      aria-label="Controles de demostración"
      className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-50 flex items-center gap-1 sm:gap-2 p-1 sm:p-1.5 rounded-full bg-neutral-900/90 border border-amber-500/40 shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_15px_rgba(201,162,75,0.25)] backdrop-blur-md transition-all duration-300"
    >
      <div className="hidden sm:flex items-center text-[11px] font-semibold tracking-wider text-neutral-400 pl-3 pr-1 uppercase whitespace-nowrap">
        Ver como:
      </div>

      <button
        type="button"
        onClick={() => cambiarARol('clienta')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
          !esPanel && rolActual === 'clienta'
            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50 shadow-[0_0_10px_rgba(201,162,75,0.3)]'
            : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
        }`}
        title="Ver la tienda desde la perspectiva de la clienta"
      >
        <User className="w-3.5 h-3.5" />
        <span>Clienta</span>
      </button>

      <button
        type="button"
        onClick={() => cambiarARol('duena')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
          esPanel || rolActual === 'duena'
            ? 'bg-gradient-to-r from-amber-600/40 to-amber-400/30 text-amber-200 border border-amber-400/60 shadow-[0_0_12px_rgba(201,162,75,0.4)]'
            : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
        }`}
        title="Abrir el panel administrativo de Araceli"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
        <span className="whitespace-nowrap"><span className="sm:hidden">Dueña</span><span className="hidden sm:inline">Dueña (Araceli)</span></span>
      </button>

      <div className="w-[1px] h-4 bg-neutral-700/60 mx-0.5" />

      <button
        type="button"
        onClick={resetearDemo}
        className="p-1.5 text-neutral-400 hover:text-amber-300 hover:bg-neutral-800/60 rounded-full transition-colors"
        title="Resetear datos de la demo a fábrica"
        aria-label="Resetear datos demo"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </aside>
  );
};
