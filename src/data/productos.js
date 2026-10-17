// Datos de ejemplo para catálogo de Pupilentes AGO
// 14 modelos en familias: Miel, Verde, Azul, Gris, Avellana, Violeta, Café
// Con graduaciones de 0.00 a -8.00 y stock realista

export const GRADUACIONES = [
  "0.00",
  "-0.50", "-0.75", "-1.00", "-1.25", "-1.50", "-1.75",
  "-2.00", "-2.25", "-2.50", "-2.75", "-3.00", "-3.25",
  "-3.50", "-3.75", "-4.00", "-4.50", "-5.00", "-5.50",
  "-6.00", "-6.50", "-7.00", "-7.50", "-8.00"
];

export const FAMILIAS_COLOR = [
  { id: 'todos', label: 'Todos los colores' },
  { id: 'miel', label: 'Miel & Dorado', hex: '#D4A853' },
  { id: 'verde', label: 'Verdes', hex: '#4A7C59' },
  { id: 'azul', label: 'Azules & Aqua', hex: '#427AA1' },
  { id: 'gris', label: 'Gris & Plata', hex: '#9AA0A6' },
  { id: 'avellana', label: 'Avellana & Ámbar', hex: '#A2673B' },
  { id: 'violeta', label: 'Violeta & Lavanda', hex: '#7E5A9B' },
  { id: 'cafe', label: 'Café & Chocolate', hex: '#583623' },
];

export const PRODUCTOS_INICIALES = [
  {
    id: "miel-satin",
    nombre: "Miel Satín",
    familia: "miel",
    tonalidad: "natural",
    duracion: "anual",
    precio: 649.00,
    precioKit: 799.00,
    popularidad: 98,
    esTopVentas: true,
    descripcion: "Tono cálido ámbar con halo dorado brillante y transición suave a pupila. Realza miradas oscuras sin perder naturalidad.",
    hexPrincipal: "#D4A345",
    hexSecundario: "#8F641B",
    hexAcento: "#F5E09A",
    anilloLimbal: true,
    densidadFibras: 0.85,
    diametro: "14.2 mm",
    curvaBase: "8.6 mm",
    contenidoAgua: "38%",
    stockPorGraduacion: {
      "0.00": 18, "-0.50": 6, "-0.75": 8, "-1.00": 14, "-1.25": 10,
      "-1.50": 12, "-1.75": 7, "-2.00": 15, "-2.25": 5, "-2.50": 11,
      "-2.75": 4, "-3.00": 13, "-3.25": 0, "-3.50": 8, "-3.75": 3,
      "-4.00": 6, "-4.50": 4, "-5.00": 2, "-5.50": 1, "-6.00": 2,
      "-6.50": 1, "-7.00": 0, "-7.50": 1, "-8.00": 0
    }
  },
  {
    id: "verde-esmeralda",
    nombre: "Verde Esmeralda",
    familia: "verde",
    tonalidad: "intenso",
    duracion: "anual",
    precio: 689.00,
    precioKit: 839.00,
    popularidad: 94,
    esTopVentas: true,
    descripcion: "Verde joya profundo con reflejos oliva y micro-corona dorada peripupilar. Ideal para eventos y fotos de alto impacto.",
    hexPrincipal: "#3E7B54",
    hexSecundario: "#1B472A",
    hexAcento: "#86C29B",
    anilloLimbal: true,
    densidadFibras: 0.9,
    diametro: "14.2 mm",
    curvaBase: "8.6 mm",
    contenidoAgua: "40%",
    stockPorGraduacion: {
      "0.00": 12, "-0.50": 4, "-0.75": 5, "-1.00": 9, "-1.25": 6,
      "-1.50": 8, "-1.75": 3, "-2.00": 10, "-2.25": 4, "-2.50": 7,
      "-2.75": 2, "-3.00": 9, "-3.25": 4, "-3.50": 5, "-3.75": 2,
      "-4.00": 3, "-4.50": 2, "-5.00": 1, "-5.50": 0, "-6.00": 1,
      "-6.50": 0, "-7.00": 0, "-7.50": 0, "-8.00": 0
    }
  },
  {
    id: "gris-platino",
    nombre: "Gris Platino Sublime",
    familia: "gris",
    tonalidad: "intenso",
    duracion: "anual",
    precio: 699.00,
    precioKit: 849.00,
    popularidad: 92,
    esTopVentas: true,
    descripcion: "Gris plateado cristalino con textura de cuarzo y halo exterior ahumado. Proporciona una mirada misteriosa y penetrante.",
    hexPrincipal: "#B4B9C2",
    hexSecundario: "#5D626C",
    hexAcento: "#E9ECF0",
    anilloLimbal: true,
    densidadFibras: 0.8,
    diametro: "14.2 mm",
    curvaBase: "8.6 mm",
    contenidoAgua: "38%",
    stockPorGraduacion: {
      "0.00": 15, "-0.50": 5, "-0.75": 6, "-1.00": 11, "-1.25": 8,
      "-1.50": 9, "-1.75": 4, "-2.00": 12, "-2.25": 3, "-2.50": 8,
      "-2.75": 3, "-3.00": 10, "-3.25": 2, "-3.50": 6, "-3.75": 1,
      "-4.00": 4, "-4.50": 2, "-5.00": 1, "-5.50": 1, "-6.00": 0,
      "-6.50": 1, "-7.00": 0, "-7.50": 0, "-8.00": 0
    }
  },
  {
    id: "azul-zafiro",
    nombre: "Azul Zafiro Real",
    familia: "azul",
    tonalidad: "intenso",
    duracion: "anual",
    precio: 689.00,
    precioKit: 839.00,
    popularidad: 89,
    esTopVentas: false,
    descripcion: "Azul profundo matizado con tonos marinos y destellos cerúleos. Excelente contraste para pieles medias y claras.",
    hexPrincipal: "#2B588C",
    hexSecundario: "#122A4A",
    hexAcento: "#6B9EE0",
    anilloLimbal: true,
    densidadFibras: 0.88,
    diametro: "14.2 mm",
    curvaBase: "8.6 mm",
    contenidoAgua: "38%",
    stockPorGraduacion: {
      "0.00": 10, "-0.50": 4, "-0.75": 4, "-1.00": 8, "-1.25": 5,
      "-1.50": 7, "-1.75": 3, "-2.00": 9, "-2.25": 2, "-2.50": 6,
      "-2.75": 2, "-3.00": 7, "-3.25": 3, "-3.50": 4, "-3.75": 1,
      "-4.00": 3, "-4.50": 1, "-5.00": 1, "-5.50": 0, "-6.00": 0,
      "-6.50": 0, "-7.00": 0, "-7.50": 0, "-8.00": 0
    }
  },
  {
    id: "avellana-ambar",
    nombre: "Avellana Ámbar Dorado",
    familia: "avellana",
    tonalidad: "natural",
    duracion: "trimestral",
    precio: 589.00,
    precioKit: 739.00,
    popularidad: 91,
    esTopVentas: true,
    descripcion: "Degradado cálido entre canela y avellana mielada. El diseño más indetectable para uso diario profesional o casual.",
    hexPrincipal: "#B5733A",
    hexSecundario: "#6B3C14",
    hexAcento: "#E8B378",
    anilloLimbal: false,
    densidadFibras: 0.75,
    diametro: "14.0 mm",
    curvaBase: "8.5 mm",
    contenidoAgua: "42%",
    stockPorGraduacion: {
      "0.00": 20, "-0.50": 7, "-0.75": 8, "-1.00": 16, "-1.25": 11,
      "-1.50": 14, "-1.75": 6, "-2.00": 18, "-2.25": 5, "-2.50": 12,
      "-2.75": 4, "-3.00": 14, "-3.25": 6, "-3.50": 9, "-3.75": 3,
      "-4.00": 5, "-4.50": 3, "-5.00": 2, "-5.50": 1, "-6.00": 1,
      "-6.50": 0, "-7.00": 0, "-7.50": 0, "-8.00": 0
    }
  },
  {
    id: "verde-oliva",
    nombre: "Verde Oliva Sofisticado",
    familia: "verde",
    tonalidad: "natural",
    duracion: "anual",
    precio: 659.00,
    precioKit: 809.00,
    popularidad: 85,
    esTopVentas: false,
    descripcion: "Fusión orgánica de verde musgo y avellana silvestre. Aporta frescura y un brillo elegante sin estridencias.",
    hexPrincipal: "#5B7543",
    hexSecundario: "#2C3E1E",
    hexAcento: "#9DBE7E",
    anilloLimbal: false,
    densidadFibras: 0.82,
    diametro: "14.2 mm",
    curvaBase: "8.6 mm",
    contenidoAgua: "38%",
    stockPorGraduacion: {
      "0.00": 8, "-0.50": 3, "-0.75": 3, "-1.00": 6, "-1.25": 4,
      "-1.50": 5, "-1.75": 2, "-2.00": 7, "-2.25": 2, "-2.50": 4,
      "-2.75": 1, "-3.00": 5, "-3.25": 2, "-3.50": 3, "-3.75": 1,
      "-4.00": 2, "-4.50": 1, "-5.00": 0, "-5.50": 0, "-6.00": 0,
      "-6.50": 0, "-7.00": 0, "-7.50": 0, "-8.00": 0
    }
  },
  {
    id: "aqua-caribe",
    nombre: "Aqua Caribe Turquesa",
    familia: "azul",
    tonalidad: "cosmetico",
    duracion: "anual",
    precio: 679.00,
    precioKit: 829.00,
    popularidad: 87,
    esTopVentas: false,
    descripcion: "Inspirado en aguas caribeñas; mezcla celeste y esmeralda claro con aro perimetral que agranda la pupila de forma sutil.",
    hexPrincipal: "#3CAEA3",
    hexSecundario: "#175E57",
    hexAcento: "#85E5DC",
    anilloLimbal: true,
    densidadFibras: 0.86,
    diametro: "14.5 mm",
    curvaBase: "8.6 mm",
    contenidoAgua: "38%",
    stockPorGraduacion: {
      "0.00": 14, "-0.50": 4, "-0.75": 4, "-1.00": 7, "-1.25": 5,
      "-1.50": 6, "-1.75": 2, "-2.00": 8, "-2.25": 2, "-2.50": 5,
      "-2.75": 1, "-3.00": 6, "-3.25": 1, "-3.50": 3, "-3.75": 1,
      "-4.00": 2, "-4.50": 1, "-5.00": 0, "-5.50": 0, "-6.00": 0,
      "-6.50": 0, "-7.00": 0, "-7.50": 0, "-8.00": 0
    }
  },
  {
    id: "gris-ceniza",
    nombre: "Gris Ceniza Místico",
    familia: "gris",
    tonalidad: "natural",
    duracion: "trimestral",
    precio: 579.00,
    precioKit: 729.00,
    popularidad: 88,
    esTopVentas: false,
    descripcion: "Tono ceniza aperlado con matriz fina de micro-puntos que mimetizan el estroma natural del ojo latino.",
    hexPrincipal: "#8E939B",
    hexSecundario: "#41454C",
    hexAcento: "#D3D7DE",
    anilloLimbal: false,
    densidadFibras: 0.8,
    diametro: "14.2 mm",
    curvaBase: "8.6 mm",
    contenidoAgua: "40%",
    stockPorGraduacion: {
      "0.00": 11, "-0.50": 3, "-0.75": 5, "-1.00": 8, "-1.25": 6,
      "-1.50": 7, "-1.75": 3, "-2.00": 9, "-2.25": 3, "-2.50": 6,
      "-2.75": 2, "-3.00": 8, "-3.25": 2, "-3.50": 4, "-3.75": 1,
      "-4.00": 3, "-4.50": 1, "-5.00": 1, "-5.50": 0, "-6.00": 0,
      "-6.50": 0, "-7.00": 0, "-7.50": 0, "-8.00": 0
    }
  },
  {
    id: "violeta-lavanda",
    nombre: "Violeta Lavanda Celestial",
    familia: "violeta",
    tonalidad: "cosmetico",
    duracion: "anual",
    precio: 719.00,
    precioKit: 869.00,
    popularidad: 82,
    esTopVentas: false,
    descripcion: "Edición especial con pigmento violeta ahumado y destellos lila. El favorito para looks editoriales, cosplay y makeup artístico.",
    hexPrincipal: "#78588E",
    hexSecundario: "#3B2549",
    hexAcento: "#BFA4D6",
    anilloLimbal: true,
    densidadFibras: 0.84,
    diametro: "14.5 mm",
    curvaBase: "8.6 mm",
    contenidoAgua: "38%",
    stockPorGraduacion: {
      "0.00": 9, "-0.50": 2, "-0.75": 3, "-1.00": 5, "-1.25": 3,
      "-1.50": 4, "-1.75": 1, "-2.00": 6, "-2.25": 1, "-2.50": 3,
      "-2.75": 1, "-3.00": 4, "-3.25": 0, "-3.50": 2, "-3.75": 0,
      "-4.00": 1, "-4.50": 0, "-5.00": 0, "-5.50": 0, "-6.00": 0,
      "-6.50": 0, "-7.00": 0, "-7.50": 0, "-8.00": 0
    }
  },
  {
    id: "cafe-imperial",
    nombre: "Café Imperial Profundo",
    familia: "cafe",
    tonalidad: "natural",
    duracion: "anual",
    precio: 599.00,
    precioKit: 749.00,
    popularidad: 86,
    esTopVentas: false,
    descripcion: "Chocolate moka con efecto ampliador del ojo (efecto muñeca sutil). Agrega brillo húmedo y dulzura inmediata al rostro.",
    hexPrincipal: "#543826",
    hexSecundario: "#27160B",
    hexAcento: "#8C6348",
    anilloLimbal: true,
    densidadFibras: 0.72,
    diametro: "14.5 mm",
    curvaBase: "8.6 mm",
    contenidoAgua: "38%",
    stockPorGraduacion: {
      "0.00": 16, "-0.50": 5, "-0.75": 6, "-1.00": 12, "-1.25": 8,
      "-1.50": 10, "-1.75": 4, "-2.00": 13, "-2.25": 3, "-2.50": 9,
      "-2.75": 3, "-3.00": 11, "-3.25": 4, "-3.50": 6, "-3.75": 2,
      "-4.00": 3, "-4.50": 2, "-5.00": 1, "-5.50": 1, "-6.00": 0,
      "-6.50": 0, "-7.00": 0, "-7.50": 0, "-8.00": 0
    }
  },
  {
    id: "miel-siena",
    nombre: "Miel Siena Glaseado",
    familia: "miel",
    tonalidad: "natural",
    duracion: "mensual",
    precio: 489.00,
    precioKit: 639.00,
    popularidad: 84,
    esTopVentas: false,
    descripcion: "Miel tostada con ligeros destellos ocre. La opción perfecta para probar el color durante 30 días con máxima oxigenación.",
    hexPrincipal: "#C28C38",
    hexSecundario: "#704B14",
    hexAcento: "#F0C785",
    anilloLimbal: false,
    densidadFibras: 0.8,
    diametro: "14.0 mm",
    curvaBase: "8.6 mm",
    contenidoAgua: "45%",
    stockPorGraduacion: {
      "0.00": 15, "-0.50": 6, "-0.75": 7, "-1.00": 13, "-1.25": 9,
      "-1.50": 11, "-1.75": 5, "-2.00": 14, "-2.25": 4, "-2.50": 10,
      "-2.75": 3, "-3.00": 12, "-3.25": 5, "-3.50": 7, "-3.75": 2,
      "-4.00": 4, "-4.50": 2, "-5.00": 1, "-5.50": 1, "-6.00": 0,
      "-6.50": 0, "-7.00": 0, "-7.50": 0, "-8.00": 0
    }
  },
  {
    id: "caramelo-toffee",
    nombre: "Caramelo Toffee Suave",
    familia: "avellana",
    tonalidad: "natural",
    duracion: "anual",
    precio: 639.00,
    precioKit: 789.00,
    popularidad: 83,
    esTopVentas: false,
    descripcion: "Tono caramelo con degradado cremoso. Otorga luminosidad radiante sin que se perciba que llevas pupilentes.",
    hexPrincipal: "#A86D33",
    hexSecundario: "#573310",
    hexAcento: "#E0A86E",
    anilloLimbal: false,
    densidadFibras: 0.78,
    diametro: "14.2 mm",
    curvaBase: "8.6 mm",
    contenidoAgua: "38%",
    stockPorGraduacion: {
      "0.00": 10, "-0.50": 3, "-0.75": 4, "-1.00": 8, "-1.25": 5,
      "-1.50": 6, "-1.75": 2, "-2.00": 8, "-2.25": 2, "-2.50": 5,
      "-2.75": 1, "-3.00": 6, "-3.25": 2, "-3.50": 4, "-3.75": 1,
      "-4.00": 2, "-4.50": 1, "-5.00": 0, "-5.50": 0, "-6.00": 0,
      "-6.50": 0, "-7.00": 0, "-7.50": 0, "-8.00": 0
    }
  },
  {
    id: "perla-ahumada",
    nombre: "Perla Ahumada Glam",
    familia: "gris",
    tonalidad: "cosmetico",
    duracion: "anual",
    precio: 729.00,
    precioKit: 879.00,
    popularidad: 80,
    esTopVentas: false,
    descripcion: "Gris glaciar con reflejos nacarados y aro contrastado. Da una impresión de ojos claros hipnóticos de pasarela.",
    hexPrincipal: "#D1D6DE",
    hexSecundario: "#4D535F",
    hexAcento: "#FFFFFF",
    anilloLimbal: true,
    densidadFibras: 0.92,
    diametro: "14.5 mm",
    curvaBase: "8.6 mm",
    contenidoAgua: "38%",
    stockPorGraduacion: {
      "0.00": 7, "-0.50": 2, "-0.75": 2, "-1.00": 4, "-1.25": 3,
      "-1.50": 4, "-1.75": 1, "-2.00": 5, "-2.25": 1, "-2.50": 3,
      "-2.75": 0, "-3.00": 4, "-3.25": 0, "-3.50": 2, "-3.75": 0,
      "-4.00": 1, "-4.50": 0, "-5.00": 0, "-5.50": 0, "-6.00": 0,
      "-6.50": 0, "-7.00": 0, "-7.50": 0, "-8.00": 0
    }
  },
  {
    id: "ocre-mistico",
    nombre: "Ocre Místico Ámbar",
    familia: "miel",
    tonalidad: "intenso",
    duracion: "trimestral",
    precio: 599.00,
    precioKit: 749.00,
    popularidad: 79,
    esTopVentas: false,
    descripcion: "Ocre vibrante que ilumina intensamente cualquier mirada, diseñado con tecnología de pigmentación multicapa.",
    hexPrincipal: "#E5A029",
    hexSecundario: "#7D4E08",
    hexAcento: "#FCE59F",
    anilloLimbal: true,
    densidadFibras: 0.88,
    diametro: "14.2 mm",
    curvaBase: "8.6 mm",
    contenidoAgua: "40%",
    stockPorGraduacion: {
      "0.00": 6, "-0.50": 2, "-0.75": 2, "-1.00": 4, "-1.25": 2,
      "-1.50": 3, "-1.75": 1, "-2.00": 4, "-2.25": 1, "-2.50": 2,
      "-2.75": 0, "-3.00": 3, "-3.25": 1, "-3.50": 1, "-3.75": 0,
      "-4.00": 1, "-4.50": 0, "-5.00": 0, "-5.50": 0, "-6.00": 0,
      "-6.50": 0, "-7.00": 0, "-7.50": 0, "-8.00": 0
    }
  }
];

// Helper para calcular stock total de un producto
export const calcularStockTotal = (producto) => {
  if (!producto || !producto.stockPorGraduacion) return 0;
  return Object.values(producto.stockPorGraduacion).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
};

// Formato de moneda mexicana $1,299.00
export const formatMXN = (amount) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2
  }).format(amount);
};
