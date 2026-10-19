import React, { useState } from 'react';

// Arte de respaldo temático para cada tipo de slot si no hay fotografía real colocada
const BACKUP_ART = {
  // Slots de modelos para probador o Eye Lab
  'modelos/modelo-01': '/img/iris/miel.webp',
  'modelos/modelo-02': '/img/iris/verde.webp',
  'modelos/modelo-03': '/img/iris/azul.webp',
  'modelos/modelo-04': '/img/iris/gris.webp',
  'modelos/modelo-05': '/img/iris/avellana.webp',
  'modelos/modelo-06': '/img/iris/violeta.webp',

  // Slots de macro
  'macro/miel-01': '/img/iris/miel.webp',
  'macro/avellana-01': '/img/iris/avellana.webp',
  'macro/verde-01': '/img/iris/verde.webp',
  'macro/azul-01': '/img/iris/azul.webp',
  'macro/gris-01': '/img/iris/gris.webp',
  'macro/violeta-01': '/img/iris/violeta.webp',
  'macro/cafe-01': '/img/iris/cafe.webp',
  'macro/aqua-01': '/img/iris/aqua.webp',

  // Slots editoriales
  heroRetrato: '/img/iris/miel.webp',
  editorial1: '/img/iris/avellana.webp',
  editorial2: '/img/iris/verde.webp',
  editorial3: '/img/iris/azul.webp',
  editorial4: '/img/iris/gris.webp',
  producto1: '/img/iris/miel.webp',
  producto2: '/img/iris/aqua.webp',
  producto3: '/img/iris/violeta.webp',
  entrega1: '/img/iris/cafe.webp',
  cta: '/img/iris/miel.webp',
};

export function Foto({
  slot = 'editorial1',
  src = null,
  ratio = '4/5',
  className = '',
  alt = 'Pupilentes AGO — Mirada editorial',
  priority = false,
  overlay = null,
  objectPosition = 'center',
  familia = null,
}) {
  const [useBackup, setUseBackup] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Si se provee `src` directo se usa; si no, se busca bajo `/img/fotos/{slot}.webp`
  const primarySrc = src || (slot.startsWith('/') ? slot : `/img/fotos/${slot}.webp`);
  const isProductSlot = slot.startsWith('producto/') || slot.startsWith('/img/fotos/producto/');

  // Resolver familia de color para el fallback de iris-tex
  const resolveFamilia = () => {
    if (familia) return familia;
    const lower = (slot + ' ' + (src || '') + ' ' + alt).toLowerCase();
    if (lower.includes('verde')) return 'verde';
    if (lower.includes('azul')) return 'azul';
    if (lower.includes('cafe') || lower.includes('café')) return 'cafe';
    if (lower.includes('gris')) return 'gris';
    if (lower.includes('avellana')) return 'avellana';
    if (lower.includes('violeta')) return 'violeta';
    if (lower.includes('aqua')) return 'aqua';
    return 'miel';
  };

  const getFallback = () => {
    if (BACKUP_ART[slot]) return BACKUP_ART[slot];
    const fam = resolveFamilia();
    return `/img/iris-tex/${fam}.webp`;
  };

  const backupSrc = getFallback();
  const currentSrc = useBackup ? backupSrc : primarySrc;
  const resolvedFamilia = resolveFamilia();

  // Si es slot de producto y no hay foto real colocada, renderiza iris-tex en un círculo
  // sobre fondo espresso, con halo dorado sutil y reflejo especular (radial-gradient)
  if (useBackup && isProductSlot) {
    return (
      <div
        className={`relative overflow-hidden bg-espresso flex items-center justify-center p-4 ${className}`}
        style={{ aspectRatio: ratio !== 'auto' ? ratio : undefined }}
      >
        <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full shadow-[0_0_32px_rgba(212,175,55,0.24)] border border-brass/25 flex items-center justify-center overflow-hidden transition-transform duration-700 ease-out group-hover:scale-105">
          <img
            src={`/img/iris-tex/${resolvedFamilia}.webp`}
            alt={alt}
            className="w-full h-full object-cover rounded-full"
            loading={priority ? 'eager' : 'lazy'}
          />
          {/* Reflejo especular con radial-gradient */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 35% 26%, rgba(255,255,255,0.48) 0%, rgba(255,255,255,0.12) 28%, transparent 62%)',
            }}
          />
          {/* Profundidad limbal perimetral */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, transparent 66%, rgba(0,0,0,0.52) 100%)',
            }}
          />
        </div>

        {/* Viñeta sutil de integración Quiet Luxury */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-ink/60 via-transparent to-ink/15" />

        {overlay}
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-espresso ${className}`}
      style={{ aspectRatio: ratio !== 'auto' ? ratio : undefined }}
    >
      <img
        src={currentSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onError={() => {
          if (!useBackup) {
            setUseBackup(true);
          }
        }}
        onLoad={() => setLoaded(true)}
        style={{ objectPosition }}
        className={`w-full h-full object-cover transition-all duration-700 ease-out ${
          loaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-sm'
        }`}
      />

      {/* Sutil viñeta para integrar el arte con la estética Quiet Luxury */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-ink/60 via-transparent to-ink/15" />

      {overlay}
    </div>
  );
}

export default Foto;
