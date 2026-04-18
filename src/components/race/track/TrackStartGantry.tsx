import { TRACK_RY_INNER, TRACK_RY_OUTER, getPositionOnTrack } from '../raceTrackHelpers';

/**
 * Pórtico START / FINISH com arco metálico, placa central, postes laterais e bandeirinhas.
 * Posicionado na linha de chegada (ângulo 0, lado direito da pista).
 */
export function TrackStartGantry() {
  const inner = getPositionOnTrack(0, -((TRACK_RY_OUTER - TRACK_RY_INNER) / 2));
  const outer = getPositionOnTrack(0, (TRACK_RY_OUTER - TRACK_RY_INNER) / 2);
  const trackWidth = Math.abs(outer.y - inner.y);
  const w = 22;

  // linha de chegada quadriculada
  return (
    <g aria-hidden>
      {/* finish checkers */}
      <rect
        x={inner.x - w / 2}
        y={Math.min(inner.y, outer.y)}
        width={w}
        height={trackWidth}
        fill="url(#finishCheckers)"
        stroke="#0f172a"
        strokeWidth={1.5}
      />

      {/* postes laterais */}
      <g>
        {/* poste superior (lado interno) */}
        <rect x={inner.x - 4} y={inner.y - 70} width={8} height={75} fill="#1f2937" />
        <rect x={inner.x - 5} y={inner.y - 73} width={10} height={4} fill="#0f172a" />
        {/* poste inferior (lado externo) */}
        <rect x={outer.x - 4} y={outer.y - 5} width={8} height={75} fill="#1f2937" />
        <rect x={outer.x - 5} y={outer.y + 70} width={10} height={4} fill="#0f172a" />
      </g>

      {/* arco/viga horizontal acima da pista (passa por cima) */}
      <g>
        {/* sombra */}
        <rect
          x={inner.x - 110}
          y={inner.y - 78}
          width={220}
          height={26}
          rx={3}
          fill="#000"
          opacity={0.35}
          transform="translate(2 3)"
        />
        {/* placa principal */}
        <rect
          x={inner.x - 110}
          y={inner.y - 78}
          width={220}
          height={26}
          rx={3}
          fill="url(#gantrySign)"
          stroke="#0f172a"
          strokeWidth={1.8}
        />
        {/* texto */}
        <text
          x={inner.x}
          y={inner.y - 60}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={14}
          fontWeight={900}
          fill="#fafafa"
          style={{ fontFamily: 'system-ui, sans-serif', letterSpacing: 2.5 }}
        >
          START / FINISH
        </text>
        {/* faixa quadriculada lateral na placa */}
        <rect x={inner.x - 110} y={inner.y - 78} width={20} height={26} fill="url(#finishCheckers)" opacity={0.95} />
        <rect x={inner.x + 90} y={inner.y - 78} width={20} height={26} fill="url(#finishCheckers)" opacity={0.95} />
      </g>

      {/* bandeirinhas no topo dos postes */}
      <g>
        {[-1, 1].map((side) => {
          const baseX = side === -1 ? inner.x : outer.x;
          const baseY = side === -1 ? inner.y - 78 : outer.y + 70;
          return (
            <g key={side} transform={`translate(${baseX} ${baseY})`}>
              <rect x={-1} y={side === -1 ? -18 : -10} width={2} height={20} fill="#0f172a" />
              <path
                d={side === -1
                  ? `M1 -18 L18 -14 L1 -10 Z`
                  : `M1 -10 L18 -6 L1 -2 Z`}
                fill="#dc2626"
                stroke="#0f172a"
                strokeWidth={0.8}
              />
            </g>
          );
        })}
      </g>
    </g>
  );
}
