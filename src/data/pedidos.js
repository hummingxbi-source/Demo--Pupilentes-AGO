// Datos de pedidos para el demo de Pupilentes AGO
// ~60 pedidos en los últimos 60 días, cubriendo los 5 canales de Araceli:
// Instagram, TikTok, WhatsApp, Mercado Libre, Entrega personal

export const ESTADOS_PEDIDO = [
  { id: "cotizando", label: "Cotizando", color: "#8A857C" },
  { id: "esperando_pago", label: "Esperando pago", color: "#E0A23B" },
  { id: "verificar_comprobante", label: "Verificar comprobante", color: "#E8CE8F" },
  { id: "generar_guia", label: "Generar guía / Preparar", color: "#7AA2F7" },
  { id: "en_camino", label: "En camino / Por entregar", color: "#A88132" },
  { id: "entregado", label: "Entregado", color: "#6FAE8B" },
  { id: "cancelado", label: "Cancelado", color: "#C96A5E" }
];

export const CANALES = [
  { id: "instagram", label: "Instagram", color: "#E1306C" },
  { id: "tiktok", label: "TikTok", color: "#00F2FE" },
  { id: "whatsapp", label: "WhatsApp", color: "#25D366" },
  { id: "mercadolibre", label: "Mercado Libre", color: "#FFE600" },
  { id: "tienda_online", label: "Tienda Online (Nuevo)", color: "#C9A24B" },
  { id: "entrega_personal", label: "Entrega personal", color: "#E6DDCF" }
];

export const PEDIDOS_INICIALES = [
  {
    id: "AGO-1062",
    fecha: "2026-10-16 19:40",
    clientaNombre: "Valeria Morales Sánchez",
    telefono: "55 4192 8831",
    email: "valeria.morales@gmail.com",
    canal: "tienda_online",
    estado: "verificar_comprobante",
    metodoEntrega: "entrega_personal",
    estacionMetro: "Metro Tepalcates",
    horarioPactado: "Sábado 18-oct · 15:30 hrs",
    items: [
      { productoId: "miel-satin", nombre: "Miel Satín", od: "-1.50", oi: "-1.75", cantidad: 1, precioUnitario: 649.00 }
    ],
    accesorios: [
      { id: "estuche-espejo-dorado", nombre: "Estuche Joyero con Espejo", cantidad: 1, precioUnitario: 89.00 },
      { id: "solucion-120ml", nombre: "Solución Multiusos 120 ml", cantidad: 1, precioUnitario: 129.00 }
    ],
    subtotal: 867.00,
    costoEnvio: 0.00,
    descuento: 0.00,
    total: 867.00,
    comprobanteUrl: "comprobante_valeria_bbva.jpg",
    bancoEmisor: "BBVA México · Transf. 9812",
    montoComprobante: 867.00,
    notas: "Clienta frecuente, ya mandó comprobante. Lista para confirmar entrega en torniquetes dirección Pantitlán."
  },
  {
    id: "AGO-1061",
    fecha: "2026-10-16 16:15",
    clientaNombre: "Camila Ruiz Albarrán",
    telefono: "55 6677 8811",
    email: "camila.ruiz@hotmail.com",
    canal: "instagram",
    estado: "verificar_comprobante",
    metodoEntrega: "didi",
    direccionEnvio: {
      calle: "C. Morelos 142, Int 4",
      colonia: "Peñón de los Baños",
      alcaldia: "Venustiano Carranza",
      cp: "15520",
      referencias: "Portón blanco junto a la farmacia"
    },
    items: [
      { productoId: "violeta-lavanda", nombre: "Violeta Lavanda Celestial", od: "0.00", oi: "0.00", cantidad: 1, precioUnitario: 719.00 }
    ],
    accesorios: [
      { id: "estuche-macarron", nombre: "Estuche Macarrón Antibacterial", cantidad: 1, precioUnitario: 69.00 }
    ],
    subtotal: 788.00,
    costoEnvio: 85.00,
    descuento: 0.00,
    total: 873.00,
    comprobanteUrl: "comprobante_camila_mercado_pago.jpg",
    bancoEmisor: "Mercado Pago · Folio 4491",
    montoComprobante: 873.00,
    notas: "Pidió envío express por DiDi antes de las 18:00 hrs."
  },
  {
    id: "AGO-1060",
    fecha: "2026-10-16 14:05",
    clientaNombre: "Fernanda Castillo Rivas",
    telefono: "55 8301 2940",
    email: "fer.castillo.r@outlook.com",
    canal: "whatsapp",
    estado: "generar_guia",
    metodoEntrega: "paqueteria",
    paqueteriaNombre: "Estafeta Express",
    guiaNumero: "EST-8812903MX",
    direccionEnvio: {
      calle: "Álvaro Obregón 88, Depto 302",
      colonia: "Roma Norte",
      alcaldia: "Cuauhtémoc",
      cp: "06700",
      referencias: "Edificio antiguo con reja verde"
    },
    items: [
      { productoId: "verde-esmeralda", nombre: "Verde Esmeralda", od: "-2.00", oi: "-2.00", cantidad: 1, precioUnitario: 689.00 }
    ],
    accesorios: [
      { id: "solucion-360ml", nombre: "Solución Multipropósito Max 360 ml", cantidad: 1, precioUnitario: 219.00 }
    ],
    subtotal: 908.00,
    costoEnvio: 135.00,
    descuento: 50.00,
    total: 993.00,
    comprobanteUrl: "comprobante_fer_banamex.jpg",
    bancoEmisor: "Citibanamex · Aut 001928",
    montoComprobante: 993.00,
    notas: "Pago verificado. Falta imprimir etiqueta y llevar a sucursal."
  },
  {
    id: "AGO-1059",
    fecha: "2026-10-16 11:20",
    clientaNombre: "Sofía Hernández Gómez",
    telefono: "55 9283 7410",
    email: "sofi.hgomez@gmail.com",
    canal: "tiktok",
    estado: "esperando_pago",
    metodoEntrega: "entrega_personal",
    estacionMetro: "Metro Pantitlán",
    horarioPactado: "Viernes 17-oct · 17:00 hrs",
    items: [
      { productoId: "avellana-ambar", nombre: "Avellana Ámbar Dorado", od: "-0.75", oi: "-1.00", cantidad: 1, precioUnitario: 589.00 }
    ],
    accesorios: [],
    subtotal: 589.00,
    costoEnvio: 0.00,
    descuento: 0.00,
    total: 589.00,
    notas: "Se le enviaron cuentas BBVA y Banco Azteca por mensaje."
  },
  {
    id: "AGO-1058",
    fecha: "2026-10-15 18:30",
    clientaNombre: "Ximena Lozano Ortiz",
    telefono: "55 3344 5566",
    email: "ximena.lozano@gmail.com",
    canal: "tienda_online",
    estado: "en_camino",
    metodoEntrega: "paqueteria",
    paqueteriaNombre: "DHL Express",
    guiaNumero: "DHL-9921827460",
    direccionEnvio: {
      calle: "Av. Universidad 1900",
      colonia: "Copilco Universidad",
      alcaldia: "Coyoacán",
      cp: "04360",
      referencias: "Frente al metro Copilco"
    },
    items: [
      { productoId: "aqua-caribe", nombre: "Aqua Caribe Turquesa", od: "-3.00", oi: "-3.25", cantidad: 1, precioUnitario: 679.00 },
      { productoId: "gris-platino", nombre: "Gris Platino Sublime", od: "-3.00", oi: "-3.25", cantidad: 1, precioUnitario: 699.00 }
    ],
    accesorios: [
      { id: "estuche-espejo-dorado", nombre: "Estuche Joyero con Espejo", cantidad: 2, precioUnitario: 89.00 }
    ],
    subtotal: 1556.00,
    costoEnvio: 145.00,
    descuento: 155.60,
    total: 1545.40,
    notas: "En tránsito. Recolección realizada 16-oct 10:00 hrs."
  },
  {
    id: "AGO-1057",
    fecha: "2026-10-15 12:10",
    clientaNombre: "Daniela Bautista Reyes",
    telefono: "55 7788 9900",
    email: "dani.bautista@gmail.com",
    canal: "mercadolibre",
    estado: "entregado",
    metodoEntrega: "paqueteria",
    paqueteriaNombre: "Mercado Envíos",
    guiaNumero: "ML-772615291",
    direccionEnvio: {
      calle: "C. 5 de Mayo 310",
      colonia: "Centro Histórico",
      ciudad: "Puebla",
      cp: "72000"
    },
    items: [
      { productoId: "miel-siena", nombre: "Miel Siena Glaseado", od: "-2.50", oi: "-2.50", cantidad: 1, precioUnitario: 489.00 }
    ],
    accesorios: [],
    subtotal: 489.00,
    costoEnvio: 120.00,
    descuento: 0.00,
    total: 609.00,
    notas: "Entregado con éxito. Clienta calificó 5 estrellas."
  },
  {
    id: "AGO-1056",
    fecha: "2026-10-14 20:45",
    clientaNombre: "Andrea Ramos Cisneros",
    telefono: "55 5544 3322",
    email: "andrea.ramos@yahoo.com.mx",
    canal: "instagram",
    estado: "entregado",
    metodoEntrega: "entrega_personal",
    estacionMetro: "Metro Pantitlán",
    items: [
      { productoId: "verde-oliva", nombre: "Verde Oliva Sofisticado", od: "-0.50", oi: "-0.50", cantidad: 1, precioUnitario: 659.00 }
    ],
    accesorios: [
      { id: "estuche-macarron", nombre: "Estuche Macarrón Antibacterial", cantidad: 1, precioUnitario: 69.00 }
    ],
    subtotal: 728.00,
    costoEnvio: 0.00,
    descuento: 0.00,
    total: 728.00,
    notas: "Entregado personalmente por Araceli."
  },
  {
    id: "AGO-1055",
    fecha: "2026-10-14 15:30",
    clientaNombre: "Mariana Delgado Trejo",
    telefono: "55 1928 3746",
    email: "mariana.delgado@yahoo.com",
    canal: "whatsapp",
    estado: "entregado",
    metodoEntrega: "entrega_personal",
    estacionMetro: "Metro Bellas Artes",
    items: [
      { productoId: "gris-platino", nombre: "Gris Platino Sublime", od: "0.00", oi: "0.00", cantidad: 1, precioUnitario: 699.00 }
    ],
    accesorios: [],
    subtotal: 699.00,
    costoEnvio: 45.00,
    descuento: 0.00,
    total: 744.00,
    notas: "Otra estación (+45 MXN costo extra pactado)."
  },
  {
    id: "AGO-1054",
    fecha: "2026-10-13 17:00",
    clientaNombre: "Lucía Villalobos Cruz",
    telefono: "55 8899 0011",
    canal: "tiktok",
    estado: "entregado",
    metodoEntrega: "didi",
    subtotal: 579.00,
    costoEnvio: 95.00,
    total: 674.00,
    items: [
      { productoId: "gris-ceniza", nombre: "Gris Ceniza Místico", od: "-2.25", oi: "-2.50", cantidad: 1, precioUnitario: 579.00 }
    ],
    notas: "DiDi entregado."
  },
  {
    id: "AGO-1053",
    fecha: "2026-10-12 11:00",
    clientaNombre: "Renata Mendoza Estrada",
    canal: "instagram",
    estado: "entregado",
    metodoEntrega: "paqueteria",
    subtotal: 689.00,
    costoEnvio: 150.00,
    total: 839.00,
    items: [
      { productoId: "azul-zafiro", nombre: "Azul Zafiro Real", od: "-1.25", oi: "-1.50", cantidad: 1, precioUnitario: 689.00 }
    ],
    notas: "Envío a Querétaro entregado por FedEx."
  },
  {
    id: "AGO-1052",
    fecha: "2026-10-11 14:20",
    clientaNombre: "Paola Navarrete Soto",
    canal: "tienda_online",
    estado: "entregado",
    metodoEntrega: "paqueteria",
    subtotal: 639.00,
    costoEnvio: 155.00,
    total: 794.00,
    items: [
      { productoId: "caramelo-toffee", nombre: "Caramelo Toffee Suave", od: "-1.00", oi: "-1.00", cantidad: 1, precioUnitario: 639.00 }
    ],
    notas: "Envío a Guadalajara."
  },
  {
    id: "AGO-1051",
    fecha: "2026-10-10 16:40",
    clientaNombre: "Natalia Vega Pineda",
    canal: "whatsapp",
    estado: "entregado",
    metodoEntrega: "entrega_personal",
    estacionMetro: "Metro Pantitlán",
    subtotal: 599.00,
    costoEnvio: 0.00,
    total: 599.00,
    items: [
      { productoId: "cafe-imperial", nombre: "Café Imperial Profundo", od: "-3.50", oi: "-4.00", cantidad: 1, precioUnitario: 599.00 }
    ],
    notas: "Entregado puntual."
  }
];

// Generador de pedidos históricos para completar los ~60 pedidos en 60 días
// Asegura datos ricos para las analíticas y dashboards
const generarPedidosHistoricos = () => {
  const canales = ["instagram", "tiktok", "whatsapp", "mercadolibre", "entrega_personal"];
  const nombres = [
    "Gabriela Morales", "Jessica Pérez", "Diana Laura Castro", "Paulina Jiménez",
    "Alejandra Ortiz", "Monserrat Cruz", "Karla Vanessa Ríos", "Lorena Domínguez",
    "Estefanía Salgado", "Beatriz Alarcón", "Monica Silva", "Tania Berenice Luna",
    "Berenice Rangel", "Claudia Elena Solís", "Itzel Guadalupe Lara", "Brenda Paola Díaz"
  ];
  const productosIds = ["miel-satin", "verde-esmeralda", "gris-platino", "azul-zafiro", "avellana-ambar", "aqua-caribe"];

  const pedidosExtra = [];
  for (let i = 50; i >= 1; i--) {
    const diaOffset = Math.floor((50 - i) * 1.1) + 2;
    const fecha = new Date(Date.now() - diaOffset * 24 * 60 * 60 * 1000);
    const canal = canales[i % canales.length];
    const clienta = nombres[i % nombres.length];
    const prodId = productosIds[i % productosIds.length];
    const total = 599 + (i % 4) * 80;

    pedidosExtra.push({
      id: `AGO-10${i < 10 ? '0' + i : i}`,
      fecha: fecha.toISOString().replace('T', ' ').substring(0, 16),
      clientaNombre: clienta,
      telefono: `55 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`,
      email: `${clienta.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      canal: canal,
      estado: i % 18 === 0 ? "cancelado" : "entregado",
      metodoEntrega: i % 2 === 0 ? "entrega_personal" : "paqueteria",
      estacionMetro: i % 2 === 0 ? (i % 4 === 0 ? "Metro Tepalcates" : "Metro Pantitlán") : undefined,
      items: [
        { productoId: prodId, nombre: prodId.replace('-', ' ').toUpperCase(), od: "-1.50", oi: "-1.50", cantidad: 1, precioUnitario: total }
      ],
      accesorios: [],
      subtotal: total,
      costoEnvio: i % 2 === 0 ? 0 : 130,
      descuento: 0,
      total: i % 2 === 0 ? total : total + 130,
      notas: "Pedido histórico procesado satisfactoriamente."
    });
  }
  return pedidosExtra;
};

export const TODOS_LOS_PEDIDOS_DEMO = [
  ...PEDIDOS_INICIALES,
  ...generarPedidosHistoricos()
];
