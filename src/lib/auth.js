// Sistema de Identificación sin Contraseñas por WhatsApp (V3)
// En producción: Conexión con Meta Cloud API para OTP por WhatsApp
// En demo: Genera código demo '123456' y lo presenta en toast

const STORAGE_KEY = 'ago_sesion_clienta';
const DEMO_CODE = '123456';

export function normalizarTelefono(tel) {
  if (!tel) return '';
  const digits = tel.replace(/\D/g, '');
  if (digits.length === 10) return `+52${digits}`;
  if (digits.length === 12 && digits.startsWith('52')) return `+${digits}`;
  return digits;
}

export function enmascararTelefono(tel) {
  if (!tel) return '';
  const clean = tel.replace(/\D/g, '');
  if (clean.length >= 10) {
    const ultimos4 = clean.slice(-4);
    return `•• •••• ${ultimos4}`;
  }
  return tel;
}

export function solicitarCodigo(telefono) {
  const norm = normalizarTelefono(telefono);
  if (!norm || norm.replace(/\D/g, '').length < 10) {
    return { ok: false, error: 'Ingresa un número celular válido a 10 dígitos' };
  }

  // Guardar solicitud temporal con expiración de 5 minutos
  const expiracion = Date.now() + 5 * 60 * 1000;
  localStorage.setItem('ago_otp_pending', JSON.stringify({ telefono: norm, expiracion }));

  return {
    ok: true,
    telefono: norm,
    codigoDemo: DEMO_CODE,
    mensaje: `Código enviado por WhatsApp a ${enmascararTelefono(norm)}`
  };
}

export function verificarCodigo(telefono, codigoIngresado) {
  const norm = normalizarTelefono(telefono);
  const pending = localStorage.getItem('ago_otp_pending');

  if (codigoIngresado.trim() === DEMO_CODE) {
    // Sesión válida recordada por 90 días
    const sesion = {
      telefono: norm,
      inicio: Date.now(),
      expiracion: Date.now() + 90 * 24 * 60 * 60 * 1000,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sesion));
    localStorage.removeItem('ago_otp_pending');
    return { ok: true, sesion };
  }

  return { ok: false, error: 'Código incorrecto. Ingresa el código demo 123456' };
}

export function obtenerSesionActual() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const sesion = JSON.parse(raw);
    if (Date.now() > sesion.expiracion) {
      cerrarSesion();
      return null;
    }
    return sesion;
  } catch (e) {
    return null;
  }
}

export function cerrarSesion() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('ago_otp_pending');
}
