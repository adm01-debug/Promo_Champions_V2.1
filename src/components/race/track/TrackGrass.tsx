import { TRACK_VIEWBOX } from '../raceTrackHelpers';

/** Gramado top-down — base do cenário usando tokens semânticos. */
export function TrackGrass() {
  return (
    <rect
      width={TRACK_VIEWBOX.width}
      height={TRACK_VIEWBOX.height}
      fill="hsl(var(--race-grass))"
      aria-hidden
    />
  );
}
