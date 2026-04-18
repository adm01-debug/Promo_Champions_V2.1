/**
 * Lago decorativo orgânico no infield (centro-baixo do oval),
 * com pequena ilha + palmeira estilizada no centro.
 */
export function TrackPond() {
  const cx = 500;
  const cy = 380;
  const d = `
    M ${cx - 95} ${cy + 10}
    C ${cx - 115} ${cy - 32}, ${cx - 40} ${cy - 55}, ${cx + 10} ${cy - 50}
    C ${cx + 70} ${cy - 56}, ${cx + 115} ${cy - 22}, ${cx + 100} ${cy + 14}
    C ${cx + 88} ${cy + 44}, ${cx + 30} ${cy + 56}, ${cx - 25} ${cy + 52}
    C ${cx - 70} ${cy + 52}, ${cx - 105} ${cy + 36}, ${cx - 95} ${cy + 10}
    Z
  `;
  return (
    <g aria-hidden>
      {/* sombra do lago */}
      <path d={d} fill="hsl(var(--race-pond-deep))" opacity={0.5} transform="translate(3 5)" />
      {/* corpo d'água */}
      <path d={d} fill="hsl(var(--race-pond))" stroke="hsl(var(--race-pond-shadow))" strokeWidth={2} />
      {/* gradiente de profundidade interna */}
      <path d={d} fill="url(#pondDepth)" opacity={0.6} />
      {/* reflexos brancos */}
      <ellipse cx={cx - 30} cy={cy - 22} rx={26} ry={3.2} fill="hsl(var(--race-asphalt-edge))" opacity={0.45} />
      <ellipse cx={cx + 22} cy={cy + 8} rx={16} ry={2.4} fill="hsl(var(--race-asphalt-edge))" opacity={0.3} />
      <ellipse cx={cx - 8} cy={cy + 32} rx={9} ry={1.6} fill="hsl(var(--race-asphalt-edge))" opacity={0.25} />

      {/* Ilha pequena com palmeira ao centro */}
      <ellipse cx={cx + 4} cy={cy + 4} rx={20} ry={9} fill="hsl(var(--race-runoff))" opacity={0.95} />
      <ellipse cx={cx + 4} cy={cy + 3} rx={16} ry={6.5} fill="hsl(var(--race-tree-light))" opacity={0.55} />
      {/* tronco */}
      <rect x={cx + 2} y={cy - 10} width={3} height={12} rx={1} fill="hsl(25 35% 28%)" />
      {/* folhas */}
      <ellipse cx={cx - 4} cy={cy - 12} rx={9} ry={3} fill="hsl(var(--race-tree-mid))" transform={`rotate(-25 ${cx - 4} ${cy - 12})`} />
      <ellipse cx={cx + 12} cy={cy - 12} rx={9} ry={3} fill="hsl(var(--race-tree-mid))" transform={`rotate(25 ${cx + 12} ${cy - 12})`} />
      <ellipse cx={cx + 4} cy={cy - 16} rx={3} ry={6} fill="hsl(var(--race-tree-dark))" />
      <circle cx={cx + 4} cy={cy - 10} r={1.6} fill="hsl(var(--race-tree-dark))" />
    </g>
  );
}
