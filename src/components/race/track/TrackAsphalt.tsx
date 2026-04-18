import {
  TRACK_CENTER, TRACK_RX_INNER, TRACK_RX_OUTER, TRACK_RY_INNER, TRACK_RY_OUTER,
  CHECKPOINTS, getPositionOnTrack,
} from '../raceTrackHelpers';

/**
 * Asfalto cinematográfico: pista oval com gradiente radial,
 * rumble strips zebrados (vermelho/branco) reais nas bordas interna e externa,
 * linha central tracejada amarela com glow, highlight especular e faixa central.
 */
export function TrackAsphalt() {
  const cx = TRACK_CENTER.x;
  const cy = TRACK_CENTER.y;

  // Gera segmentos curtos ao longo de uma elipse para formar zebras alternadas
  const buildRumble = (rx: number, ry: number, count = 80, alt = ['#dc2626', '#fafafa']) => {
    const segs = [];
    const inset = 5;
    for (let i = 0; i < count; i++) {
      const a0 = (i / count) * Math.PI * 2;
      const a1 = ((i + 0.95) / count) * Math.PI * 2;
      const aMid = (a0 + a1) / 2;
      const x0 = cx + rx * Math.cos(a0);
      const y0 = cy + ry * Math.sin(a0);
      const x1 = cx + rx * Math.cos(a1);
      const y1 = cy + ry * Math.sin(a1);
      // direção radial
      const nx = Math.cos(aMid);
      const ny = Math.sin(aMid);
      const x0i = x0 - nx * inset;
      const y0i = y0 - ny * inset;
      const x1i = x1 - nx * inset;
      const y1i = y1 - ny * inset;
      segs.push(
        <path
          key={i}
          d={`M${x0} ${y0} L${x1} ${y1} L${x1i} ${y1i} L${x0i} ${y0i} Z`}
          fill={alt[i % 2]}
        />,
      );
    }
    return segs;
  };

  return (
    <g aria-hidden>
      {/* asfalto base com gradiente radial */}
      <ellipse
        cx={cx} cy={cy}
        rx={TRACK_RX_OUTER} ry={TRACK_RY_OUTER}
        fill="url(#asphaltGradient)"
        stroke="#1e293b" strokeWidth={3}
      />

      {/* textura granulada do asfalto */}
      <ellipse
        cx={cx} cy={cy}
        rx={TRACK_RX_OUTER - 1} ry={TRACK_RY_OUTER - 1}
        fill="#000"
        opacity={0.10}
        filter="url(#asphaltGrain)"
      />

      {/* rumble strips externo */}
      <g>{buildRumble(TRACK_RX_OUTER - 2, TRACK_RY_OUTER - 2, 96)}</g>

      {/* miolo (gramado interno revelado) */}
      <ellipse
        cx={cx} cy={cy}
        rx={TRACK_RX_INNER} ry={TRACK_RY_INNER}
        fill="#5fa358"
        stroke="#1e293b" strokeWidth={3}
      />
      {/* textura grama interna */}
      <ellipse
        cx={cx} cy={cy}
        rx={TRACK_RX_INNER - 1} ry={TRACK_RY_INNER - 1}
        fill="#000"
        opacity={0.18}
        filter="url(#grassGrain)"
      />

      {/* rumble strips interno */}
      <g>{buildRumble(TRACK_RX_INNER + 2, TRACK_RY_INNER + 2, 64)}</g>

      {/* linha central tracejada amarela com glow */}
      <ellipse
        cx={cx} cy={cy}
        rx={(TRACK_RX_OUTER + TRACK_RX_INNER) / 2}
        ry={(TRACK_RY_OUTER + TRACK_RY_INNER) / 2}
        fill="none"
        stroke="#fde047"
        strokeWidth={3}
        strokeDasharray="22 18"
        opacity={0.95}
        filter="url(#yellowGlow)"
      />

      {/* highlight especular: arco branco fino no topo do asfalto */}
      <path
        d={`M ${cx - TRACK_RX_OUTER + 20} ${cy - 10}
            A ${TRACK_RX_OUTER - 20} ${TRACK_RY_OUTER - 20} 0 0 1
            ${cx + TRACK_RX_OUTER - 20} ${cy - 10}`}
        fill="none"
        stroke="#ffffff"
        strokeWidth={2}
        opacity={0.18}
      />

      {/* skid marks sutis em duas curvas */}
      {[Math.PI * 0.85, Math.PI * 1.85].map((a, i) => {
        const rxMid = (TRACK_RX_OUTER + TRACK_RX_INNER) / 2;
        const ryMid = (TRACK_RY_OUTER + TRACK_RY_INNER) / 2;
        return (
          <path
            key={i}
            d={`M ${cx + (rxMid + 10) * Math.cos(a)} ${cy + (ryMid + 10) * Math.sin(a)}
                Q ${cx + rxMid * Math.cos(a + 0.15)} ${cy + ryMid * Math.sin(a + 0.15)}
                ${cx + (rxMid - 10) * Math.cos(a + 0.3)} ${cy + (ryMid - 10) * Math.sin(a + 0.3)}`}
            stroke="#0f172a"
            strokeWidth={2.5}
            fill="none"
            opacity={0.18}
          />
        );
      })}

      {/* checkpoints como placas-pórtico douradas */}
      {CHECKPOINTS.map((p, idx) => {
        const inner = getPositionOnTrack(p, -((TRACK_RY_OUTER - TRACK_RY_INNER) / 2));
        const outer = getPositionOnTrack(p, (TRACK_RY_OUTER - TRACK_RY_INNER) / 2);
        return (
          <g key={p}>
            <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#fbbf24" strokeWidth={2.5} strokeDasharray="4 3" />
            {/* placa amarela com sombra */}
            <g transform={`translate(${outer.x} ${outer.y - 24})`}>
              <rect x={-22} y={-12} width={44} height={18} rx={3} fill="#0f172a" opacity={0.35} transform="translate(1.5 1.5)" />
              <rect x={-22} y={-12} width={44} height={18} rx={3} fill="#fbbf24" stroke="#0f172a" strokeWidth={1.5} />
              <text
                x={0} y={1} textAnchor="middle" dominantBaseline="middle"
                fontSize={10} fontWeight={900} fill="#0f172a"
                style={{ fontFamily: 'system-ui, sans-serif', letterSpacing: 0.5 }}
              >
                CP{idx + 1} {Math.round(p * 100)}%
              </text>
            </g>
          </g>
        );
      })}
    </g>
  );
}
