/**
 * Lago decorativo orgânico em uma área livre do circuito serpenteante.
 * Usa tokens semânticos de cor para suportar light/dark e skins.
 */
export function TrackPond() {
  // Posicionado em pequena área central entre voltas da serpentina.
  const cx = 500;
  const cy = 405;
  const d = `
    M ${cx - 40} ${cy + 4}
    C ${cx - 50} ${cy - 18}, ${cx - 18} ${cy - 30}, ${cx + 4} ${cy - 26}
    C ${cx + 28} ${cy - 30}, ${cx + 48} ${cy - 12}, ${cx + 44} ${cy + 6}
    C ${cx + 40} ${cy + 22}, ${cx + 12} ${cy + 28}, ${cx - 12} ${cy + 26}
    C ${cx - 36} ${cy + 26}, ${cx - 42} ${cy + 16}, ${cx - 40} ${cy + 4}
    Z
  `;
  return (
    <g aria-hidden>
      <path d={d} fill="hsl(var(--race-pond-deep))" opacity={0.45} transform="translate(2 3)" />
      <path d={d} fill="hsl(var(--race-pond))" stroke="hsl(var(--race-pond-shadow))" strokeWidth={1.5} />
      <ellipse cx={cx - 12} cy={cy - 10} rx={14} ry={2.5} fill="hsl(var(--race-asphalt-edge))" opacity={0.35} />
      <ellipse cx={cx + 12} cy={cy + 8} rx={9} ry={1.8} fill="hsl(var(--race-asphalt-edge))" opacity={0.25} />
    </g>
  );
}
