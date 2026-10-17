import React, { useState } from 'react';

/**
 * IrisRenderer
 * Genera procedimentalmente un iris hiperrealista con anillo limbal,
 * fibras radiales, halo peripupilar, pupila reactiva y reflejos especulares de luz.
 */
export const IrisRenderer = ({
  colorPrincipal = "#D4A345",
  colorSecundario = "#8F641B",
  colorAcento = "#F5E09A",
  anilloLimbal = true,
  densidadFibras = 0.85,
  size = 140,
  hoverDilate = true,
  pupilRatio = 0.35,
  imagen = null,
  className = "",
  animar = false
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Si existe una foto real subida por Araceli, se muestra la foto con máscara circular
  if (imagen) {
    return (
      <div
        className={`relative rounded-full overflow-hidden border border-amber-500/30 shadow-lg ${className}`}
        style={{ width: size, height: size }}
      >
        <img src={imagen} alt="Pupilente real" className="w-full h-full object-cover" />
      </div>
    );
  }

  // Dimensiones del SVG
  const center = 100;
  const radius = 94;
  const limbalThickness = anilloLimbal ? 7 : 2;

  // Dilatación de pupila interactiva al hacer hover
  const currentPupilRatio = isHovered && hoverDilate ? pupilRatio * 1.25 : pupilRatio;
  const pupilRadius = radius * currentPupilRatio;

  // Generación determinista de fibras radiales estromales
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
    const strokeWidth = (i % 3 === 0) ? 1.6 : 1.0;

    fibers.push({
      key: i,
      startX,
      startY,
      endX,
      endY,
      opacity,
      strokeWidth,
      isAccent: i % 4 === 0
    });
  }

  const uniqueId = `iris-${colorPrincipal.replace('#', '')}-${colorSecundario.replace('#', '')}-${Math.floor(size)}`;

  return (
    <div
      className={`relative inline-block select-none transition-transform duration-300 ${isHovered && hoverDilate ? 'scale-105' : ''} ${className}`}
      style={{ width: size, height: size }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
      >
        <defs>
          {/* Gradiente radial del fondo estromal */}
          <radialGradient id={`grad-base-${uniqueId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={colorAcento} stopOpacity="0.95" />
            <stop offset="35%" stopColor={colorPrincipal} stopOpacity="1" />
            <stop offset="75%" stopColor={colorSecundario} stopOpacity="1" />
            <stop offset="100%" stopColor="#121214" stopOpacity="1" />
          </radialGradient>

          {/* Corona peripupilar dorada suave */}
          <radialGradient id={`grad-halo-${uniqueId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#050505" />
            <stop offset="65%" stopColor="#0B0B0C" stopOpacity="0.9" />
            <stop offset="100%" stopColor={colorPrincipal} stopOpacity="0.4" />
          </radialGradient>

          {/* Reflejo especular esférico */}
          <linearGradient id={`specular-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
            <stop offset="40%" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Sombra de la córnea */}
          <radialGradient id={`shadow-cornea-${uniqueId}`} cx="45%" cy="40%" r="55%">
            <stop offset="70%" stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.4)" />
          </radialGradient>
        </defs>

        {/* Círculo base del iris con gradiente estromal */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill={`url(#grad-base-${uniqueId})`}
        />

        {/* Fibras radiales orgánicas del iris */}
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

        {/* Anillos concéntricos sutiles (surcos de contracción del iris) */}
        <circle
          cx={center}
          cy={center}
          r={radius * 0.62}
          fill="none"
          stroke={colorAcento}
          strokeWidth="1.2"
          strokeOpacity="0.3"
          strokeDasharray="4 6"
        />
        <circle
          cx={center}
          cy={center}
          r={radius * 0.78}
          fill="none"
          stroke={colorSecundario}
          strokeWidth="1.5"
          strokeOpacity="0.45"
          strokeDasharray="6 8"
        />

        {/* Anillo Limbal exterior oscuro (característica distintiva de pupilentes premium) */}
        {anilloLimbal && (
          <circle
            cx={center}
            cy={center}
            r={radius - limbalThickness / 2}
            fill="none"
            stroke="#0B0B0C"
            strokeWidth={limbalThickness}
            strokeOpacity="0.88"
          />
        )}

        {/* Pupila central negra con transición de dilatación */}
        <circle
          cx={center}
          cy={center}
          r={pupilRadius}
          fill="#080809"
          className="transition-all duration-500 ease-out"
        />

        {/* Gradiente de halo sobre la pupila para suavizar el borde */}
        <circle
          cx={center}
          cy={center}
          r={pupilRadius + 4}
          fill="none"
          stroke={colorSecundario}
          strokeWidth="2"
          strokeOpacity="0.5"
          className="transition-all duration-500 ease-out"
        />

        {/* Reflejos especulares naturales de luz (curva de brillo a las 11 en punto) */}
        <ellipse
          cx={center - 28}
          cy={center - 32}
          rx="12"
          ry="7"
          transform={`rotate(-35 ${center - 28} ${center - 32})`}
          fill={`url(#specular-${uniqueId})`}
        />
        <circle
          cx={center + 26}
          cy={center + 28}
          r="3"
          fill="#FFFFFF"
          opacity="0.35"
        />

        {/* Sombra de profundidad de la córnea */}
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
