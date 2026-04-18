import { TRACK_CENTER } from '../raceTrackHelpers';

/**
 * Lago decorativo orgânico no miolo da pista.
 * Path suave azul com borda mais escura + reflexo branco discreto.
 */
export function TrackPond() {
  const cx = TRACK_CENTER.x;
  const cy = TRACK_CENTER.y;

  // path orgânico (forma de lago irregular)
  const d = `
    M ${cx - 110} ${cy + 10}
    C ${cx - 130} ${cy - 30}, ${cx - 70} ${cy - 60}, ${cx - 20} ${cy - 50}
    C ${cx + 30} ${cy - 60}, ${cx + 90} ${cy - 40}, ${cx + 120} ${cy - 5}
    C ${cx + 140} ${cy + 30}, ${cx + 80} ${cy + 55}, ${cx + 20} ${cy + 50}
    C ${cx - 40} ${cy + 55}, ${cx - 100} ${cy + 45}, ${cx - 110} ${cy + 10}
    Z
  `;

  return (
    <g aria-hidden>
      {/* sombra suave do lago */}
      <path d={d} fill="#1e4f70" opacity={0.25} transform="translate(2 3)" />
      {/* corpo do lago */}
      <path d={d} fill="#3b8cc4" stroke="#2a6a96" strokeWidth={2} />
      {/* reflexo branco discreto */}
      <ellipse cx={cx - 40} cy={cy - 20} rx={28} ry={4} fill="#ffffff" opacity={0.35} />
      <ellipse cx={cx + 30} cy={cy + 15} rx={18} ry={3} fill="#ffffff" opacity={0.25} />
    </g>
  );
}
