// Mapeo oficial de imágenes y texturas de Iris — V2 Pupilentes AGO

export const MAPA_IRIS = {
  miel: {
    id: 'miel',
    nombre: 'Miel Satín',
    familia: 'miel',
    hex: '#D4A853',
    img: '/img/iris/miel.webp',
    tex: '/img/iris-tex/miel.webp',
    descripcion: 'Tono ámbar cálido y luminoso con sutil halo peripupilar.',
  },
  avellana: {
    id: 'avellana',
    nombre: 'Avellana Ámbar',
    familia: 'avellana',
    hex: '#A2673B',
    img: '/img/iris/avellana.webp',
    tex: '/img/iris-tex/avellana.webp',
    descripcion: 'Canela y avellana mielada con integración natural.',
  },
  verde: {
    id: 'verde',
    nombre: 'Verde Esmeralda',
    familia: 'verde',
    hex: '#4A7C59',
    img: '/img/iris/verde.webp',
    tex: '/img/iris-tex/verde.webp',
    descripcion: 'Verde joya profundo con reflejos oliva y micro-corona.',
  },
  azul: {
    id: 'azul',
    nombre: 'Azul Zafiro',
    familia: 'azul',
    hex: '#427AA1',
    img: '/img/iris/azul.webp',
    tex: '/img/iris-tex/azul.webp',
    descripcion: 'Azul profundo matizado con tonos marinos y destellos cerúleos.',
  },
  aqua: {
    id: 'aqua',
    nombre: 'Aqua Caribe',
    familia: 'aqua',
    hex: '#3CAEA3',
    img: '/img/iris/aqua.webp',
    tex: '/img/iris-tex/aqua.webp',
    descripcion: 'Celeste turquesa cristalino de luminosidad caribeña.',
  },
  gris: {
    id: 'gris',
    nombre: 'Gris Platino',
    familia: 'gris',
    hex: '#9AA0A6',
    img: '/img/iris/gris.webp',
    tex: '/img/iris-tex/gris.webp',
    descripcion: 'Gris plateado cristalino con textura de cuarzo.',
  },
  violeta: {
    id: 'violeta',
    nombre: 'Violeta Lavanda',
    familia: 'violeta',
    hex: '#7E5A9B',
    img: '/img/iris/violeta.webp',
    tex: '/img/iris-tex/violeta.webp',
    descripcion: 'Pigmento lavanda ahumado para miradas hipnóticas.',
  },
  cafe: {
    id: 'cafe',
    nombre: 'Café Imperial',
    familia: 'cafe',
    hex: '#583623',
    img: '/img/iris/cafe.webp',
    tex: '/img/iris-tex/cafe.webp',
    descripcion: 'Chocolate moka profundo que amplía la calidez de la mirada.',
  },
};

export const LISTA_IRIS = [
  MAPA_IRIS.miel,
  MAPA_IRIS.avellana,
  MAPA_IRIS.verde,
  MAPA_IRIS.azul,
  MAPA_IRIS.aqua,
  MAPA_IRIS.gris,
  MAPA_IRIS.violeta,
  MAPA_IRIS.cafe,
];

// Helper para obtener imagen de iris a partir de un producto o id
export function obtenerIrisProducto(producto) {
  if (!producto) return MAPA_IRIS.miel;

  // Si se pasa string directo (ej: 'verde' o 'azul')
  if (typeof producto === 'string') {
    const key = producto.toLowerCase();
    if (MAPA_IRIS[key]) return MAPA_IRIS[key];
    if (key.includes('aqua')) return MAPA_IRIS.aqua;
    return MAPA_IRIS.miel;
  }

  // Si tiene asignada clave explícita de iris
  if (producto.irisKey && MAPA_IRIS[producto.irisKey]) {
    return MAPA_IRIS[producto.irisKey];
  }

  // Si su id o nombre coincide con algún color (ej: aqua-caribe)
  const idStr = `${producto.id || ''} ${producto.nombre || ''}`.toLowerCase();
  for (const k of Object.keys(MAPA_IRIS)) {
    if (idStr.includes(k)) return MAPA_IRIS[k];
  }

  // Por familia
  const fam = (producto.familia || '').toLowerCase();
  if (MAPA_IRIS[fam]) {
    return MAPA_IRIS[fam];
  }

  return MAPA_IRIS.miel;
}

export default MAPA_IRIS;
