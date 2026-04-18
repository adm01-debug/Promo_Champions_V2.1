import { TRACK_VIEWBOX } from '../raceTrackHelpers';

/** Gramado verde sólido top-down — base do cenário. */
export function TrackGrass() {
  return (
    <rect
      width={TRACK_VIEWBOX.width}
      height={TRACK_VIEWBOX.height}
      fill="#5fa358"
      aria-hidden
    />
  );
}
