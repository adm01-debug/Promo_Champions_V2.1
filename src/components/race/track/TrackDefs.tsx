/**
 * Definições compartilhadas para a pista top-down vetorial flat.
 * Mínimas: padrão xadrez para linha de chegada + sombra suave para árvores/estruturas.
 */
export function TrackDefs() {
  return (
    <defs>
      {/* xadrez preto/branco para linha de chegada */}
      <pattern id="finishCheckers" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
        <rect width="16" height="16" fill="#ffffff" />
        <rect width="8" height="8" fill="#1a1a1a" />
        <rect x="8" y="8" width="8" height="8" fill="#1a1a1a" />
      </pattern>

      {/* sombra suave para elementos de cenário */}
      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2" />
      </filter>

      {/* trail de boost (mantido para RaceCar) */}
      <linearGradient id="boostTrail" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#fbbf24" stopOpacity="0" />
        <stop offset="50%" stopColor="#f97316" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
      </linearGradient>
    </defs>
  );
}
