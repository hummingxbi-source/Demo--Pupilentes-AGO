// Accesorios y Kits de Pupilentes AGO

export const ACCESORIOS = [
  {
    id: "estuche-espejo-dorado",
    nombre: "Estuche Joyero con Espejo y Pinzas",
    categoria: "estuches",
    precio: 89.00,
    descripcion: "Estuche compacto acabado negro y aro dorado con espejo interior, frasco dosificador y pinzas suaves.",
    icono: "Sparkles",
    stock: 45
  },
  {
    id: "solucion-120ml",
    nombre: "Solución Multiusos Hidratante 120 ml",
    categoria: "soluciones",
    precio: 129.00,
    descripcion: "Desinfecta, limpia, enjuaga y humecta. Tamaño ideal para bolso y viajes.",
    icono: "Droplets",
    stock: 38
  },
  {
    id: "solucion-360ml",
    nombre: "Solución Multipropósito Max 360 ml",
    categoria: "soluciones",
    precio: 219.00,
    descripcion: "Fórmula avanzada con hialuronato de sodio para máxima frescura todo el día.",
    icono: "Droplet",
    stock: 25
  },
  {
    id: "gotas-lubricantes",
    nombre: "Gotas Lubricantes Confort 15 ml",
    categoria: "cuidado",
    precio: 149.00,
    descripcion: "Alivio inmediato para ojos secos o cansados frente a pantallas o aire acondicionado.",
    icono: "HeartHandshake",
    stock: 30
  },
  {
    id: "kit-aplicador-ventosa",
    nombre: "Kit Aplicador Ergonómico + Ventosa",
    categoria: "herramientas",
    precio: 79.00,
    descripcion: "Para ponerte y quitarte los pupilentes sin tocar el lente con los dedos ni maltratar uñas largas.",
    icono: "Fingerprint",
    stock: 50
  },
  {
    id: "estuche-macarron",
    nombre: "Estuche Macarrón Antibacterial",
    categoria: "estuches",
    precio: 69.00,
    descripcion: "Hermético, divertido y seguro con tratamiento de iones de plata antimicrobianos.",
    icono: "ShieldCheck",
    stock: 40
  }
];

export const KITS_OFERTA = [
  {
    id: "kit-inicio-total",
    nombre: "Kit Esencial AGO",
    incluye: "1 Par de pupilentes + Estuche Dorado + Solución 120 ml",
    ahorro: 69.00,
    badge: "Más vendido"
  },
  {
    id: "kit-glam-duo",
    nombre: "Pack Dúo Miradas",
    incluye: "2 Pares a elección + 2 Estuches + Solución 360 ml",
    ahorro: 220.00,
    badge: "15% de ahorro"
  },
  {
    id: "kit-anual-vip",
    nombre: "Colección Cuarteto Anual",
    incluye: "4 Pares a elección + Kit Limpieza Profesional + Gotas + Envío Gratis",
    ahorro: 480.00,
    badge: "Edición VIP"
  }
];

export const REGLAS_DESCUENTO = {
  dosPares: { cantidad: 2, porcentaje: 10, descripcion: "10% de descuento en el 2º par" },
  tresPares: { cantidad: 3, porcentaje: 15, descripcion: "15% de descuento + Estuche Dorado gratis" }
};
