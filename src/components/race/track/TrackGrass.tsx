import { TRACK_CENTER, TRACK_RX_OUTER, TRACK_RY_OUTER, TRACK_VIEWBOX } from '../raceTrackHelpers';

/**
 * Gramado premium: base + mowing stripes radiais alternadas + textura granulada.
 * Renderizado abaixo da pista; o miolo aparece pelo "hole" da elipse interna do asfalto.
 */
export function TrackGrass() {
  const W = TRACK_VIEWBOX.width;
  const H = TRACK_VIEWBOX.height;
  const cx = TRACK_CENTER.x;
  const cy = TRACK_CENTER.y;

  // mowing stripes: setores alternados ao redor do centro
  const stripes = Array.from({ length: 24 }).map((_, i) => {
    const a0 = (i / 24) * Math.PI * 2;
    const a1 = ((i + 1) / 24) * Math.PI * 2;
    const r = Math.max(W, H);
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const fill = i % 2 === 0 ? '#5fa358' : '#4f8e4a';
    return <path key={i} d={`M${cx} ${cy} L${x0} ${y0} L${x1} ${y1} Z`} fill={fill} />;
  });

  return (
    <g aria-hidden>
      {/* base gramado abaixo do skybox (a partir de y=220) */}
      <rect y={220} width={W} height={H - 220} fill="#4f8e4a" />

      {/* mowing stripes radiais */}
      <g style={{ mixBlendMode: 'multiply' }} opacity={0.55}>
        {stripes}
      </g>

      {/* textura granulada via filter */}
      <rect
        y={220} width={W} height={H - 220}
        fill="#000"
        opacity={0.18}
        filter="url(#grassGrain)"
      />

      {/* sombra projetada do contorno externo da pista no gramado */}
      <ellipse
        cx={cx} cy={cy + 6}
        rx={TRACK_RX_OUTER + 8} ry={TRACK_RY_OUTER + 8}
        fill="#000"
        opacity={0.22}
        filter="url(#trackShadow)"
      />
    </g>
  );
}
