/**
 * Definições compartilhadas para a pista top-down vetorial flat.
 * Usa tokens semânticos para o padrão xadrez (suporta light/dark/skins).
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
    </defs>
  );
}
