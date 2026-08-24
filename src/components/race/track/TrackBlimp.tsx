/**
 * Dirigível flutuando lentamente no céu (faixa superior da cena),
 * complementando os helicópteros de transmissão.
 */
export function TrackBlimp({
  y = 70,
  duration = 60,
  delay = 0,
  bodyColor = 'hsl(210 60% 55%)',
}: {
  y?: number;
  duration?: number;
  delay?: number;
  bodyColor?: string;
}) {
  return (
    <g
      aria-hidden
      style={{
        animation: `race-blimp-drift ${duration}s linear infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      <g transform={`translate(0 ${y})`} style={{ filter: 'drop-shadow(2px 4px 3px hsl(var(--race-grass-shadow) / 0.45))' }}>
        {/* sombra ao chão */}
        <ellipse cx={0} cy={32} rx={28} ry={5} fill="hsl(0 0% 0% / 0.18)" filter="url(#dustBlur)" />
        {/* fuselagem */}
        <ellipse cx={0} cy={0} rx={28} ry={9} fill={bodyColor} stroke="hsl(var(--race-checkered-dark))" strokeWidth={0.8} />
        {/* faixa central */}
        <rect x={-28} y={-1.2} width={56} height={2.4} fill="hsl(0 0% 100%)" opacity={0.4} />
        {/* logo central */}
        <circle cx={0} cy={0} r={3.5} fill="hsl(0 0% 100%)" opacity={0.85} />
        <text
          y={1.5}
          textAnchor="middle"
          fontSize={4.5}
          fontWeight={900}
          fill={bodyColor}
          style={{ fontFamily: 'system-ui, sans-serif' }}
        >
          F1
        </text>
        {/* gôndola */}
        <rect x={-5} y={7} width={10} height={4} rx={1.2} fill="hsl(var(--race-checkered-dark))" />
        <rect x={-3.5} y={7.8} width={2} height={1.6} fill="hsl(48 100% 65%)" opacity={0.85} />
        <rect x={1.5} y={7.8} width={2} height={1.6} fill="hsl(48 100% 65%)" opacity={0.85} />
        {/* leme traseiro */}
        <polygon points="-28,0 -34,-5 -34,5" fill={bodyColor} stroke="hsl(var(--race-checkered-dark))" strokeWidth={0.6} opacity={0.9} />
        <polygon points="-28,0 -32,-7 -28,-2" fill="hsl(0 0% 100%)" opacity={0.5} />
      </g>
    </g>
  );
}
