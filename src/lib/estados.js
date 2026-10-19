// Flujo canónico de un pedido. Todos los módulos (tienda, panel, cuenta) usan estos ids.
// Los alias cubren nombres usados en versiones anteriores de la demo.
export const FLUJO_PEDIDO = [
  { id: 'nuevo', label: 'Nuevo / confirmar stock', corto: 'Nuevo' },
  { id: 'esperando_pago', label: 'Esperando pago', corto: 'Por cobrar' },
  { id: 'verificar_comprobante', label: 'Verificar comprobante', corto: 'Por verificar' },
  { id: 'por_enviar', label: 'Preparar / generar guía', corto: 'Por enviar' },
  { id: 'en_camino', label: 'En camino / por entregar', corto: 'En camino' },
  { id: 'entregado', label: 'Entregado', corto: 'Entregado' },
];

const ALIAS = {
  esperando_stock: 'nuevo',
  cotizando: 'nuevo',
  comprobante_subido: 'verificar_comprobante',
  generar_guia: 'por_enviar',
  completado: 'entregado',
};

export const normalizarEstado = (estado) => ALIAS[estado] || estado;

export const normalizarPedido = (p) => ({ ...p, estado: normalizarEstado(p.estado) });

export const etiquetaEstado = (estado) =>
  estado === 'cancelado'
    ? 'Cancelado'
    : FLUJO_PEDIDO.find((e) => e.id === normalizarEstado(estado))?.label || estado;

export const ACTIVOS = ['nuevo', 'esperando_pago', 'verificar_comprobante', 'por_enviar', 'en_camino'];

// Programa de puntos: se gana 1 punto por cada $10 pagados; 3 puntos = $1 de descuento.
export const PESOS_POR_PUNTO_GANADO = 10;
export const PUNTOS_POR_PESO_DESCUENTO = 3;
export const puntosAPesos = (pts) => Math.floor((pts || 0) / PUNTOS_POR_PESO_DESCUENTO);
