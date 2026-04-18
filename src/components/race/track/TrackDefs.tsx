/**
 * Definições compartilhadas de gradients, patterns e filters para a pista.
 * Mantém um único lugar para "ativos" SVG, reutilizados pelos subcomponentes.
 */
export function TrackDefs() {
  return (
    <defs>
      {/* céu golden hour */}
      <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1e3a8a" />
        <stop offset="35%" stopColor="#3b82f6" />
        <stop offset="70%" stopColor="#fb923c" />
        <stop offset="100%" stopColor="#fde68a" />
      </linearGradient>

      {/* sun glow */}
      <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fff7ed" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#fff7ed" stopOpacity="0" />
      </radialGradient>

      {/* asfalto: centro mais claro, bordas escuras */}
      <radialGradient id="asphaltGradient" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stopColor="#5b6472" />
        <stop offset="60%" stopColor="#475569" />
        <stop offset="100%" stopColor="#334155" />
      </radialGradient>

      {/* grama miolo */}
      <radialGradient id="grassRadial" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#86efac" />
        <stop offset="100%" stopColor="#4f8e4a" />
      </radialGradient>

      {/* placa do pórtico (metal escovado) */}
      <linearGradient id="gantrySign" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1f2937" />
        <stop offset="50%" stopColor="#374151" />
        <stop offset="100%" stopColor="#111827" />
      </linearGradient>

      {/* finish checkers reutilizado */}
      <pattern id="finishCheckers" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
        <rect width="10" height="10" fill="#ffffff" />
        <rect width="5" height="5" fill="#0f172a" />
        <rect x="5" y="5" width="5" height="5" fill="#0f172a" />
      </pattern>

      {/* trail de boost (mantido para RaceCar) */}
      <linearGradient id="boostTrail" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#fbbf24" stopOpacity="0" />
        <stop offset="50%" stopColor="#f97316" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
      </linearGradient>

      {/* texturas granuladas */}
      <filter id="grassGrain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="5" />
        <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0" />
      </filter>
      <filter id="asphaltGrain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="8" />
        <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0" />
      </filter>

      {/* sombra projetada da pista */}
      <filter id="trackShadow" x="-10%" y="-10%" width="120%" height="130%">
        <feGaussianBlur stdDeviation="6" />
      </filter>

      {/* glow amarelo da linha central */}
      <filter id="yellowGlow" x="-5%" y="-5%" width="110%" height="110%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* vinheta cinematográfica */}
      <radialGradient id="vignette" cx="50%" cy="50%" r="75%">
        <stop offset="60%" stopColor="#000000" stopOpacity="0" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0.45" />
      </radialGradient>

      {/* holofote central suave */}
      <radialGradient id="centerSpotlight" cx="50%" cy="50%" r="40%">
        <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.10" />
        <stop offset="100%" stopColor="#fef3c7" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}
