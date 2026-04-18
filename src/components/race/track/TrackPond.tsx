/**
 * Lago decorativo orgânico no infield (centro do oval).
 * Usa tokens semânticos de cor para suportar light/dark e skins.
 */
export function TrackPond() {
  // Centro do infield (entre as duas retas verticais imaginárias da pista).
  const cx = 500;
  const cy = 320;
  const d = `
    M ${cx - 70} ${cy + 8}
    C ${cx - 90} ${cy - 30}, ${cx - 30} ${cy - 50}, ${cx + 10} ${cy - 44}
    C ${cx + 60} ${cy - 50}, ${cx + 95} ${cy - 18}, ${cx + 80} ${cy + 12}
    C ${cx + 70} ${cy + 38}, ${cx + 20} ${cy + 48}, ${cx - 20} ${cy + 44}
    C ${cx - 60} ${cy + 44}, ${cx - 80} ${cy + 28}, ${cx - 70} ${cy + 8}
    Z
  `;
  return (
    <g aria-hidden>
      {/* sombra projetada */}
      <path d={d} fill="hsl(var(--race-pond-deep))" opacity={0.5} transform="translate(3 5)" />
      {/* corpo d'água */}
      <path d={d} fill="hsl(var(--race-pond))" stroke="hsl(var(--race-pond-shadow))" strokeWidth={2} />
      {/* gradiente de profundidade interna */}
      <path d={d} fill="url(#pondDepth)" opacity={0.6} />
      {/* reflexos brancos */}
      <ellipse cx={cx - 22} cy={cy - 18} rx={22} ry={3} fill="hsl(var(--race-asphalt-edge))" opacity={0.45} />
      <ellipse cx={cx + 18} cy={cy + 12} rx={14} ry={2.2} fill="hsl(var(--race-asphalt-edge))" opacity={0.3} />
      <ellipse cx={cx - 5} cy={cy + 28} rx={8} ry={1.5} fill="hsl(var(--race-asphalt-edge))" opacity={0.25} />
    </g>
  );
}
