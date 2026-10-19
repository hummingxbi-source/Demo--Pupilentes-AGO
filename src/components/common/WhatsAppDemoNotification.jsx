import React, { useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { gsap } from '../../lib/gsap';
import { MessageCircle, X } from 'lucide-react';

// Simula la notificación que la clienta recibiría en su celular.
// En producción este mensaje lo envía el backend con la WhatsApp Cloud API
// desde el número verificado de Pupilentes AGO; la web nunca conoce el código.
export const WhatsAppDemoNotification = ({ onAutocompletar }) => {
  const msg = useStore((s) => s.mensajeWhatsappDemo);
  const cerrar = useStore((s) => s.cerrarMensajeWhatsappDemo);
  const ref = useRef(null);

  useEffect(() => {
    if (msg && ref.current) {
      gsap.fromTo(ref.current, { y: -40, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.55, ease: 'back.out(1.6)', delay: 0.6 });
    }
  }, [msg?.id]);

  if (!msg) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[10000] w-[min(92vw,380px)]" role="status" aria-live="polite">
      <div ref={ref} style={{ opacity: 0 }} className="rounded-2xl bg-neutral-900/95 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-xl p-3.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-[11px] text-neutral-400">
            <span className="w-5 h-5 rounded-md bg-[#25D366] flex items-center justify-center">
              <MessageCircle className="w-3 h-3 text-white" />
            </span>
            <span className="uppercase tracking-wider">WhatsApp · ahora</span>
            <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] tracking-wider">SIMULADO</span>
          </div>
          <button onClick={cerrar} className="text-neutral-500 hover:text-white" aria-label="Cerrar notificación">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[13px] text-white font-semibold">{msg.de}</p>
        <p className="text-[13px] text-neutral-300 leading-snug mt-0.5">{msg.texto}</p>
        {onAutocompletar && (
          <button
            onClick={() => onAutocompletar(msg.codigo)}
            className="mt-3 w-full py-2 rounded-xl bg-[#25D366]/15 border border-[#25D366]/40 text-[#7EE2A8] text-xs font-semibold hover:bg-[#25D366]/25 transition-colors"
          >
            Copiar código {msg.codigo}
          </button>
        )}
      </div>
    </div>
  );
};

export default WhatsAppDemoNotification;
