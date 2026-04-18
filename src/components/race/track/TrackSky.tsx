import { TRACK_VIEWBOX } from '../raceTrackHelpers';

/**
 * Skybox cinematográfico: gradiente golden hour + montanhas distantes + sun flare.
 * Cobre o topo do viewBox (0..220).
 */
export function TrackSky() {
  const W = TRACK_VIEWBOX.width;

  return (
    <g aria-hidden>
      {/* céu gradiente */}
      <rect width={W} height={220} fill="url(#skyGradient)" />

      {/* sun flare */}
      <g opacity={0.9}>
        <circle cx={W - 140} cy={70} r={28} fill="#fff7ed" opacity={0.9} />
        <circle cx={W - 140} cy={70} r={50} fill="url(#sunGlow)" />
      </g>

      {/* nuvens leves */}
      {[
        [180, 60, 38], [320, 90, 26], [560, 50, 32], [780, 95, 22],
      ].map(([cx, cy, r], i) => (
        <g key={i} opacity={0.7}>
          <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.5} fill="#ffffff" />
          <ellipse cx={cx + r * 0.6} cy={cy + 4} rx={r * 0.7} ry={r * 0.4} fill="#ffffff" />
          <ellipse cx={cx - r * 0.5} cy={cy + 5} rx={r * 0.6} ry={r * 0.35} fill="#ffffff" />
        </g>
      ))}

      {/* montanhas distantes (camada 1, mais clara) */}
      <path
        d={`M0 200 L120 130 L200 165 L300 110 L400 160 L520 120 L640 155 L760 100 L880 150 L${W} 130 L${W} 220 L0 220 Z`}
        fill="#a5b4cf"
        opacity={0.55}
      />
      {/* montanhas próximas (camada 2, mais escura) */}
      <path
        d={`M0 215 L90 175 L180 200 L270 165 L380 195 L500 170 L620 200 L740 175 L860 195 L${W} 180 L${W} 220 L0 220 Z`}
        fill="#7d8fab"
        opacity={0.7}
      />

      {/* linha do horizonte / faixa terra */}
      <rect y={215} width={W} height={10} fill="#5b7148" opacity={0.85} />
    </g>
  );
}
