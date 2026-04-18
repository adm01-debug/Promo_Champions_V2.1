/**
 * Definições compartilhadas para a pista top-down vetorial flat.
 * Inclui patterns de xadrez, colorblind, gradientes de boost,
 * textura sutil de asfalto, vinheta de grama e gradiente de profundidade do lago.
 */
export function TrackDefs() {
  return (
    <defs>
      {/* xadrez para linha de chegada — tokens semânticos */}
      <pattern id="finishCheckers" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
        <rect width="16" height="16" fill="hsl(var(--race-checkered-light))" />
        <rect width="8" height="8" fill="hsl(var(--race-checkered-dark))" />
        <rect x="8" y="8" width="8" height="8" fill="hsl(var(--race-checkered-dark))" />
      </pattern>

      {/* textura sutil sobre asfalto — pontilhado escuro muito leve */}
      <pattern id="asphaltTexture" patternUnits="userSpaceOnUse" width="6" height="6">
        <rect width="6" height="6" fill="transparent" />
        <circle cx="1.5" cy="1.5" r="0.45" fill="hsl(var(--race-checkered-dark))" opacity="0.5" />
        <circle cx="4.5" cy="4.5" r="0.4" fill="hsl(var(--race-checkered-dark))" opacity="0.4" />
        <circle cx="4.5" cy="1.5" r="0.3" fill="hsl(var(--race-asphalt-edge))" opacity="0.3" />
      </pattern>

      {/* vinheta radial sobre a grama — mais pronunciada nas bordas */}
      <radialGradient id="grassVignette" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="hsl(var(--race-grass))" stopOpacity="0" />
        <stop offset="60%" stopColor="hsl(var(--race-grass-shadow))" stopOpacity="0" />
        <stop offset="100%" stopColor="hsl(var(--race-grass-shadow))" stopOpacity="0.6" />
      </radialGradient>

      {/* gradiente de profundidade sobre o asfalto (centro mais claro, bordas mais escuras) */}
      <linearGradient id="asphaltDepth" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="hsl(0 0% 100%)" stopOpacity="0.08" />
        <stop offset="50%" stopColor="hsl(0 0% 100%)" stopOpacity="0" />
        <stop offset="100%" stopColor="hsl(0 0% 0%)" stopOpacity="0.18" />
      </linearGradient>

      {/* profundidade do lago */}
      <radialGradient id="pondDepth" cx="50%" cy="50%" r="55%">
        <stop offset="0%" stopColor="hsl(var(--race-pond-deep))" stopOpacity="0.7" />
        <stop offset="60%" stopColor="hsl(var(--race-pond-deep))" stopOpacity="0.2" />
        <stop offset="100%" stopColor="hsl(var(--race-pond-deep))" stopOpacity="0" />
      </radialGradient>

      {/* highlight sobre a carroceria do carro */}
      <linearGradient id="carBodyShine" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="hsl(0 0% 100%)" stopOpacity="0.35" />
        <stop offset="50%" stopColor="hsl(0 0% 100%)" stopOpacity="0" />
        <stop offset="100%" stopColor="hsl(0 0% 0%)" stopOpacity="0.18" />
      </linearGradient>

      {/* padrões para colorblind: stripes, dots, checker */}
      <pattern id="cbStripes" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
        <rect width="6" height="6" fill="transparent" />
        <rect width="3" height="6" fill="rgba(255,255,255,0.55)" />
      </pattern>
      <pattern id="cbDots" patternUnits="userSpaceOnUse" width="6" height="6">
        <rect width="6" height="6" fill="transparent" />
        <circle cx="3" cy="3" r="1.4" fill="rgba(255,255,255,0.65)" />
      </pattern>
      <pattern id="cbChecker" patternUnits="userSpaceOnUse" width="6" height="6">
        <rect width="6" height="6" fill="transparent" />
        <rect width="3" height="3" fill="rgba(255,255,255,0.55)" />
        <rect x="3" y="3" width="3" height="3" fill="rgba(255,255,255,0.55)" />
      </pattern>

      {/* sombra suave para elementos de cenário */}
      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2" />
      </filter>

      {/* trail de boost */}
      <linearGradient id="boostTrail" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="hsl(var(--coins))" stopOpacity="0" />
        <stop offset="50%" stopColor="hsl(var(--streak))" stopOpacity="0.85" />
        <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity="0" />
      </linearGradient>

      {/* shimmer animado no capô (estilo diecast lustroso) */}
      <linearGradient id="carShimmer" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="hsl(0 0% 100%)" stopOpacity="0">
          <animate attributeName="offset" values="-0.4;1.4" dur="4s" repeatCount="indefinite" />
        </stop>
        <stop offset="20%" stopColor="hsl(0 0% 100%)" stopOpacity="0.55">
          <animate attributeName="offset" values="-0.2;1.6" dur="4s" repeatCount="indefinite" />
        </stop>
        <stop offset="40%" stopColor="hsl(0 0% 100%)" stopOpacity="0">
          <animate attributeName="offset" values="0;1.8" dur="4s" repeatCount="indefinite" />
        </stop>
      </linearGradient>

      {/* gradient sutil para skid marks */}
      <linearGradient id="skidMark" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="hsl(var(--race-checkered-dark))" stopOpacity="0" />
        <stop offset="100%" stopColor="hsl(var(--race-checkered-dark))" stopOpacity="0.55" />
      </linearGradient>

      {/* spotlight cinematográfico que segue o líder */}
      <radialGradient id="leaderSpotlight" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="hsl(48 100% 70%)" stopOpacity="0.28" />
        <stop offset="55%" stopColor="hsl(48 95% 60%)" stopOpacity="0.10" />
        <stop offset="100%" stopColor="hsl(48 95% 60%)" stopOpacity="0" />
      </radialGradient>

      {/* filtro de blur para fumaça/poeira */}
      <filter id="dustBlur" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.4" />
      </filter>

      {/* gradient da pit lane (cinza claro com leve variação) */}
      <linearGradient id="pitLaneGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="hsl(var(--race-asphalt))" stopOpacity="0.55" />
        <stop offset="100%" stopColor="hsl(var(--race-asphalt))" stopOpacity="0.85" />
      </linearGradient>

      {/* ===== Cycle 41-46: Sol radial (canto superior direito) ===== */}
      <radialGradient id="sunGlow" cx="92%" cy="8%" r="65%">
        <stop offset="0%" stopColor="hsl(48 100% 75%)" stopOpacity="0.32" />
        <stop offset="35%" stopColor="hsl(45 95% 65%)" stopOpacity="0.12" />
        <stop offset="100%" stopColor="hsl(45 90% 55%)" stopOpacity="0" />
      </radialGradient>

      {/* ===== Heat haze: turbulência + displacement ===== */}
      <filter id="heatHaze" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.04" numOctaves="2" seed="3">
          <animate attributeName="baseFrequency" values="0.012 0.04;0.018 0.06;0.012 0.04" dur="6s" repeatCount="indefinite" />
        </feTurbulence>
        <feDisplacementMap in="SourceGraphic" scale="2.4" />
      </filter>

      {/* ===== Sombra elíptica do carro (blur) ===== */}
      <filter id="carShadowBlur" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.6" />
      </filter>
    </defs>
  );
}
