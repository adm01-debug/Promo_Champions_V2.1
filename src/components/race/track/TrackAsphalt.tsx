import { TRACK_PATH_D, CHECKPOINTS, getPositionOnTrack } from '../raceTrackHelpers';

/**
 * Asfalto top-down flat baseado em path serpenteante:
 * camadas de stroke do mais largo (run-off) ao mais fino (linha central tracejada).
 */
const TRACK_WIDTH = 64;     // largura do asfalto
const RUNOFF_EXTRA = 18;    // run-off bege em volta

export function TrackAsphalt() {
  return (
    <g aria-hidden>
      {/* run-off bege */}
      <path
        d={TRACK_PATH_D}
        fill="none"
        stroke="#d4c5a0"
        strokeWidth={TRACK_WIDTH + RUNOFF_EXTRA * 2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* asfalto cinza */}
      <path
        d={TRACK_PATH_D}
        fill="none"
        stroke="#9ca3af"
        strokeWidth={TRACK_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* borda branca externa */}
      <path
        d={TRACK_PATH_D}
        fill="none"
        stroke="#ffffff"
        strokeWidth={TRACK_WIDTH + 4}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.001}
      />
      {/* duas bordas brancas finas via stroke-only com pintura por cima */}
      <path
        d={TRACK_PATH_D}
        fill="none"
        stroke="#ffffff"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: 'none' }}
        transform="translate(0,0)"
      />
      {/* linha central tracejada */}
      <path
        d={TRACK_PATH_D}
        fill="none"
        stroke="#ffffff"
        strokeWidth={2}
        strokeDasharray="14 10"
        strokeLinecap="butt"
        opacity={0.95}
      />

      {/* checkpoints discretos atravessando a pista */}
      {CHECKPOINTS.map((p) => {
        const inner = getPositionOnTrack(p, -TRACK_WIDTH / 2);
        const outer = getPositionOnTrack(p, TRACK_WIDTH / 2);
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
