import { TRACK_CENTER, TRACK_RX_INNER, TRACK_RX_OUTER, TRACK_RY_INNER, TRACK_RY_OUTER, TRACK_VIEWBOX, CHECKPOINTS, getPositionOnTrack } from './raceTrackHelpers';

/**
 * Pista oval top-down: gramado externo, asfalto, ilha central, faixas tracejadas, linha de chegada quadriculada.
 */
export function RaceTrack({ children }: { children?: React.ReactNode }) {
  const cx = TRACK_CENTER.x;
  const cy = TRACK_CENTER.y;

  return (
    <svg
      viewBox={`0 0 ${TRACK_VIEWBOX.width} ${TRACK_VIEWBOX.height}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="boostTrail" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0" />
          <stop offset="50%" stopColor="#f97316" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="grass" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="100%" stopColor="#22c55e" />
        </radialGradient>
        <pattern id="finishCheckers" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="10" height="10" fill="#ffffff" />
          <rect width="5" height="5" fill="#0f172a" />
          <rect x="5" y="5" width="5" height="5" fill="#0f172a" />
        </pattern>
      </defs>

      {/* gramado externo */}
      <rect width="100%" height="100%" fill="url(#grass)" />

      {/* árvores decorativas nos cantos */}
      {[[60, 60], [940, 60], [60, 540], [940, 540], [120, 100], [880, 100]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <circle r="22" fill="#16a34a" />
          <circle r="16" cx="-8" cy="-6" fill="#22c55e" />
          <rect x="-3" y="14" width="6" height="10" fill="#78350f" />
        </g>
      ))}

      {/* asfalto externo (pista) */}
      <ellipse cx={cx} cy={cy} rx={TRACK_RX_OUTER} ry={TRACK_RY_OUTER} fill="#475569" stroke="#1e293b" strokeWidth="3" />
      {/* zebras vermelho/branco nas bordas */}
      <ellipse cx={cx} cy={cy} rx={TRACK_RX_OUTER - 4} ry={TRACK_RY_OUTER - 4} fill="none" stroke="#fafafa" strokeWidth="2" strokeDasharray="14 14" opacity="0.7" />

      {/* ilha central (gramado) */}
      <ellipse cx={cx} cy={cy} rx={TRACK_RX_INNER} ry={TRACK_RY_INNER} fill="url(#grass)" stroke="#1e293b" strokeWidth="3" />
      <ellipse cx={cx} cy={cy} rx={TRACK_RX_INNER + 4} ry={TRACK_RY_INNER + 4} fill="none" stroke="#fafafa" strokeWidth="2" strokeDasharray="14 14" opacity="0.7" />

      {/* faixas centrais tracejadas (linha do meio da pista) */}
      <ellipse
        cx={cx} cy={cy}
        rx={(TRACK_RX_OUTER + TRACK_RX_INNER) / 2}
        ry={(TRACK_RY_OUTER + TRACK_RY_INNER) / 2}
        fill="none"
        stroke="#fde047"
        strokeWidth="2"
        strokeDasharray="20 18"
        opacity="0.85"
      />

      {/* checkpoints (bandeiras na pista) */}
      {CHECKPOINTS.map((p) => {
        const inner = getPositionOnTrack(p, -((TRACK_RY_OUTER - TRACK_RY_INNER) / 2));
        const outer = getPositionOnTrack(p, (TRACK_RY_OUTER - TRACK_RY_INNER) / 2);
        return (
          <g key={p}>
            <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#fbbf24" strokeWidth="3" strokeDasharray="4 3" />
            <text x={outer.x} y={outer.y - 12} textAnchor="middle" fontSize="14" fontWeight="700" fill="#0f172a" style={{ fontFamily: 'system-ui' }}>
              {Math.round(p * 100)}%
            </text>
          </g>
        );
      })}

      {/* linha de chegada quadriculada (lado direito, ângulo 0) */}
      {(() => {
        const inner = getPositionOnTrack(0, -((TRACK_RY_OUTER - TRACK_RY_INNER) / 2));
        const outer = getPositionOnTrack(0, (TRACK_RY_OUTER - TRACK_RY_INNER) / 2);
        const w = 18;
        return (
          <g>
            <rect
              x={inner.x - w / 2}
              y={Math.min(inner.y, outer.y)}
              width={w}
              height={Math.abs(outer.y - inner.y)}
              fill="url(#finishCheckers)"
              stroke="#0f172a"
              strokeWidth="1.5"
            />
            {/* bandeira pole */}
            <g transform={`translate(${outer.x + 30} ${outer.y - 30})`}>
              <rect x="0" y="0" width="2" height="40" fill="#1f2937" />
              <rect x="2" y="0" width="24" height="14" fill="url(#finishCheckers)" stroke="#0f172a" strokeWidth="0.8" />
            </g>
          </g>
        );
      })()}

      {/* espectadores (pequenos pontos coloridos no gramado externo) */}
      {Array.from({ length: 30 }).map((_, i) => {
        const angle = (i / 30) * Math.PI * 2;
        const r = TRACK_RX_OUTER + 35;
        const x = cx + r * Math.cos(angle);
        const y = cy + (TRACK_RY_OUTER + 25) * Math.sin(angle);
        const colors = ['#ef4444', '#3b82f6', '#eab308', '#22c55e', '#a855f7', '#f97316'];
        return <circle key={i} cx={x} cy={y} r={3.5} fill={colors[i % colors.length]} opacity={0.85} />;
      })}

      {/* carros (renderizados acima) */}
      {children}
    </svg>
  );
}
