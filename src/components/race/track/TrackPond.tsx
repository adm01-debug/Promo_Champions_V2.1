/**
 * Lago decorativo orgânico em uma área livre do circuito serpenteante.
 * Posicionado em ~ (760, 380) — área interna do loop direito.
 */
export function TrackPond() {
  const cx = 760;
  const cy = 380;
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
      <path d={d} fill="#1e4f70" opacity={0.25} transform="translate(2 3)" />
      <path d={d} fill="#3b8cc4" stroke="#2a6a96" strokeWidth={2} />
      <ellipse cx={cx - 20} cy={cy - 15} rx={22} ry={3.5} fill="#ffffff" opacity={0.35} />
      <ellipse cx={cx + 20} cy={cy + 12} rx={14} ry={2.5} fill="#ffffff" opacity={0.25} />
    </g>
  );
}
