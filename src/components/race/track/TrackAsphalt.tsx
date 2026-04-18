import { TRACK_PATH_D, CHECKPOINTS, getPositionOnTrack } from '../raceTrackHelpers';

/**
 * Asfalto top-down baseado em path serpenteante — tokens semânticos
 * para asfalto/run-off/borda.
 */
const TRACK_WIDTH = 64;
const RUNOFF_EXTRA = 18;

export function TrackAsphalt() {
  return (
    <g aria-hidden>
      {/* run-off bege */}
      <path
        d={TRACK_PATH_D}
        fill="none"
        stroke="hsl(var(--race-runoff))"
        strokeWidth={TRACK_WIDTH + RUNOFF_EXTRA * 2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* asfalto */}
      <path
        d={TRACK_PATH_D}
        fill="none"
        stroke="hsl(var(--race-asphalt))"
        strokeWidth={TRACK_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* borda branca externa (placeholder transparente) */}
      <path
        d={TRACK_PATH_D}
        fill="none"
        stroke="hsl(var(--race-asphalt-edge))"
        strokeWidth={TRACK_WIDTH + 4}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.001}
      />
      {/* borda fina visível */}
      <path
        d={TRACK_PATH_D}
        fill="none"
        stroke="hsl(var(--race-asphalt-edge))"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* linha central tracejada */}
      <path
        d={TRACK_PATH_D}
        fill="none"
        stroke="hsl(var(--race-asphalt-edge))"
        strokeWidth={2}
        strokeDasharray="14 10"
        strokeLinecap="butt"
        opacity={0.95}
      />

      {/* checkpoints discretos */}
      {CHECKPOINTS.map((p) => {
        const inner = getPositionOnTrack(p, -TRACK_WIDTH / 2);
        const outer = getPositionOnTrack(p, TRACK_WIDTH / 2);
        return (
          <line
            key={p}
            x1={inner.x} y1={inner.y}
            x2={outer.x} y2={outer.y}
            stroke="hsl(var(--race-asphalt-edge))"
            strokeWidth={2}
            strokeDasharray="3 4"
            opacity={0.6}
          />
        );
      })}
    </g>
  );
}
