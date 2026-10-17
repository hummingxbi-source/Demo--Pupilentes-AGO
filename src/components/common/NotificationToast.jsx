import React from 'react';
import { useStore } from '../../store/useStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const NotificationToast = () => {
  const toast = useStore((state) => state.toast);
  const hideToast = useStore((state) => state.hideToast);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    warn: <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-amber-300 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
  };

  return (
    <div className="fixed top-5 right-5 z-[9999] max-w-sm animate-bounce-in">
      <div className="flex items-center gap-3 p-3.5 px-4 rounded-xl bg-neutral-900/95 border border-amber-500/30 text-neutral-100 shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_15px_rgba(201,162,75,0.2)] backdrop-blur-md">
        {icons[toast.tipo] || icons.info}
        <p className="text-xs md:text-sm font-medium leading-snug">{toast.mensaje}</p>
        <button
          onClick={hideToast}
          className="ml-auto text-neutral-400 hover:text-neutral-100 transition-colors p-1"
          aria-label="Cerrar notificación"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
