import {
  TRACK_CENTER, TRACK_RX_INNER, TRACK_RX_OUTER, TRACK_RY_INNER, TRACK_RY_OUTER,
  CHECKPOINTS, getPositionOnTrack,
} from '../raceTrackHelpers';

/**
 * Asfalto top-down flat: run-off bege externo + asfalto cinza + bordas brancas
 * + linha central tracejada (separa 2 raias). Estilo ilustração vetorial limpa.
 */
export function TrackAsphalt() {
  const cx = TRACK_CENTER.x;
  const cy = TRACK_CENTER.y;
  const runoff = 18; // largura do run-off bege

  return (
    <g aria-hidden>
      {/* run-off bege externo */}
      <ellipse
        cx={cx} cy={cy}
        rx={TRACK_RX_OUTER + runoff} ry={TRACK_RY_OUTER + runoff}
        fill="#d4c5a0"
      />
      {/* run-off bege interno (espelhado) */}
      <ellipse
        cx={cx} cy={cy}
        rx={TRACK_RX_INNER - runoff} ry={TRACK_RY_INNER - runoff}
        fill="#5fa358"
      />

      {/* asfalto base cinza claro */}
      <ellipse
        cx={cx} cy={cy}
        rx={TRACK_RX_OUTER} ry={TRACK_RY_OUTER}
        fill="#9ca3af"
      />

      {/* miolo verde (revela gramado) */}
      <ellipse
        cx={cx} cy={cy}
        rx={TRACK_RX_INNER} ry={TRACK_RY_INNER}
        fill="#5fa358"
      />

      {/* borda branca externa do asfalto */}
      <ellipse
        cx={cx} cy={cy}
        rx={TRACK_RX_OUTER} ry={TRACK_RY_OUTER}
        fill="none"
        stroke="#ffffff"
        strokeWidth={3}
      />
      {/* borda branca interna do asfalto */}
      <ellipse
        cx={cx} cy={cy}
        rx={TRACK_RX_INNER} ry={TRACK_RY_INNER}
        fill="none"
        stroke="#ffffff"
        strokeWidth={3}
      />

      {/* linha central tracejada branca (separa 2 raias) */}
      <ellipse
        cx={cx} cy={cy}
        rx={(TRACK_RX_OUTER + TRACK_RX_INNER) / 2}
        ry={(TRACK_RY_OUTER + TRACK_RY_INNER) / 2}
        fill="none"
        stroke="#ffffff"
        strokeWidth={2.5}
        strokeDasharray="14 10"
        opacity={0.95}
      />

      {/* checkpoints discretos como marcas brancas atravessando a pista */}
      {CHECKPOINTS.map((p) => {
        const inner = getPositionOnTrack(p, -((TRACK_RY_OUTER - TRACK_RY_INNER) / 2));
        const outer = getPositionOnTrack(p, (TRACK_RY_OUTER - TRACK_RY_INNER) / 2);
        return (
          <line
            key={p}
            x1={inner.x} y1={inner.y}
            x2={outer.x} y2={outer.y}
            stroke="#ffffff"
            strokeWidth={2}
            strokeDasharray="3 4"
            opacity={0.6}
          />
        );
      })}
    </g>
  );
}
