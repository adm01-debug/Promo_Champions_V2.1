/**
 * Lago decorativo orgânico em uma área livre do circuito serpenteante.
 * Usa tokens semânticos de cor para suportar light/dark e skins.
 */
export function TrackPond() {
  const cx = 450;
  const cy = 280;
  const d = `
    M ${cx - 60} ${cy + 5}
    C ${cx - 75} ${cy - 25}, ${cx - 30} ${cy - 45}, ${cx + 5} ${cy - 38}
    C ${cx + 40} ${cy - 45}, ${cx + 70} ${cy - 20}, ${cx + 65} ${cy + 10}
    C ${cx + 60} ${cy + 35}, ${cx + 20} ${cy + 45}, ${cx - 15} ${cy + 40}
    C ${cx - 50} ${cy + 42}, ${cx - 60} ${cy + 25}, ${cx - 60} ${cy + 5}
    Z
  `;
  return (
    <g aria-hidden>
      <path d={d} fill="hsl(var(--race-pond-deep))" opacity={0.45} transform="translate(2 3)" />
      <path d={d} fill="hsl(var(--race-pond))" stroke="hsl(var(--race-pond-shadow))" strokeWidth={2} />
      <ellipse cx={cx - 20} cy={cy - 15} rx={22} ry={3.5} fill="hsl(var(--race-asphalt-edge))" opacity={0.35} />
      <ellipse cx={cx + 20} cy={cy + 12} rx={14} ry={2.5} fill="hsl(var(--race-asphalt-edge))" opacity={0.25} />
    </g>
  );
}
