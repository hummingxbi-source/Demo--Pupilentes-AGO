import React, { useState } from 'react';
import { obtenerIrisProducto } from '../../data/imagenes';

/**
 * IrisRenderer
 * Muestra prioritariamente la fotografía macro del iris (WebP 1400x1400),
 * y utiliza render SVG procedimental determinista como fallback si falla.
 * Cero re-renders en hover (se controla exclusivamente con CSS).
 */
export const IrisRenderer = ({
  producto = null,
  irisKey = null,
  src = null,
  colorPrincipal = '#D4A345',
  colorSecundario = '#8F641B',
  colorAcento = '#F5E09A',
  anilloLimbal = true,
  densidadFibras = 0.85,
  size = 140,
  hoverDilate = true,
  pupilRatio = 0.35,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  // Determinar la ruta de la imagen macro
  let imageSource = src;
  if (!imageSource && irisKey) {
    imageSource = `/img/iris/${irisKey}.webp`;
  } else if (!imageSource && producto) {
    const iris = obtenerIrisProducto(producto);
    imageSource = iris ? iris.img : null;
  }

  // Renderizado prioritario: Foto real de Iris Macro
  if (imageSource && !imgError) {
    return (
      <div
        className={`relative inline-block select-none overflow-hidden rounded-full ${
          hoverDilate ? 'transition-transform duration-500 ease-out group-hover:scale-105' : ''
        } ${className}`}
        style={{ width: size, height: size }}
      >
        <img
          src={imageSource}
          alt={producto?.nombre || 'Iris Pupilentes AGO'}
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover rounded-full"
        />
        {/* Sombra sutil de profundidad corneal */}
        <div className="absolute inset-0 rounded-full pointer-events-none ring-1 ring-inset ring-white/10 shadow-inner" />
      </div>
    );
  }

  // Renderizado Fallback: SVG Procedimental
  const center = 100;
  const radius = 94;
  const limbalThickness = anilloLimbal ? 7 : 2;
  const pupilRadius = radius * pupilRatio;

  const numFibers = Math.floor(48 * densidadFibras);
  const fibers = [];
  for (let i = 0; i < numFibers; i++) {
    const angle = (i / numFibers) * 360;
    const rad = (angle * Math.PI) / 180;
    const lengthMult = 0.75 + ((i % 5) * 0.05);
    const startX = center + Math.cos(rad) * (pupilRadius + 3);
    const startY = center + Math.sin(rad) * (pupilRadius + 3);
    const endX = center + Math.cos(rad) * (radius * lengthMult);
    const endY = center + Math.sin(rad) * (radius * lengthMult);
    const opacity = 0.35 + ((i % 4) * 0.15);
    const strokeWidth = i % 3 === 0 ? 1.6 : 1.0;

    fibers.push({
      key: i,
      startX,
      startY,
      endX,
      endY,
      opacity,
      strokeWidth,
      isAccent: i % 4 === 0,
    });
  }

  const uniqueId = `iris-${colorPrincipal.replace('#', '')}-${colorSecundario.replace('#', '')}-${Math.floor(size)}`;

  return (
    <div
      className={`relative inline-block select-none ${
        hoverDilate ? 'transition-transform duration-500 ease-out group-hover:scale-105' : ''
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]"
      >
        <defs>
          <radialGradient id={`grad-base-${uniqueId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={colorAcento} stopOpacity="0.95" />
            <stop offset="35%" stopColor={colorPrincipal} stopOpacity="1" />
            <stop offset="75%" stopColor={colorSecundario} stopOpacity="1" />
            <stop offset="100%" stopColor="#0E0D0C" stopOpacity="1" />
          </radialGradient>

          <linearGradient id={`specular-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
            <stop offset="40%" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          <radialGradient id={`shadow-cornea-${uniqueId}`} cx="45%" cy="40%" r="55%">
            <stop offset="70%" stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.4)" />
          </radialGradient>
        </defs>

        <circle cx={center} cy={center} r={radius} fill={`url(#grad-base-${uniqueId})`} />

        <g style={{ mixBlendMode: 'screen' }}>
          {fibers.map((f) => (
            <line
              key={f.key}
              x1={f.startX}
              y1={f.startY}
              x2={f.endX}
              y2={f.endY}
              stroke={f.isAccent ? colorAcento : '#FFFFFF'}
              strokeWidth={f.strokeWidth}
              strokeOpacity={f.opacity}
              strokeLinecap="round"
            />
          ))}
        </g>

        {anilloLimbal && (
          <circle
            cx={center}
            cy={center}
            r={radius - limbalThickness / 2}
            fill="none"
            stroke="#0E0D0C"
            strokeWidth={limbalThickness}
            strokeOpacity="0.9"
          />
        )}

        <circle cx={center} cy={center} r={pupilRadius} fill="#050505" />

        <ellipse
          cx={center - 28}
          cy={center - 32}
          rx="12"
          ry="7"
          transform={`rotate(-35 ${center - 28} ${center - 32})`}
          fill={`url(#specular-${uniqueId})`}
        />

        <circle
          cx={center}
          cy={center}
          r={radius}
          fill={`url(#shadow-cornea-${uniqueId})`}
          pointerEvents="none"
        />
      </svg>
    </div>
  );
};

export default IrisRenderer;
