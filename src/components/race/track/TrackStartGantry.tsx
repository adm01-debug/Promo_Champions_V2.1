import { TRACK_RY_INNER, TRACK_RY_OUTER, getPositionOnTrack } from '../raceTrackHelpers';

/**
 * Linha de chegada flat top-down: faixa xadrez preto/branco atravessando a pista.
 * Sem pórtico 3D, sem postes — estilo ilustração vetorial limpa.
 */
export function TrackStartGantry() {
  const inner = getPositionOnTrack(0, -((TRACK_RY_OUTER - TRACK_RY_INNER) / 2));
  const outer = getPositionOnTrack(0, (TRACK_RY_OUTER - TRACK_RY_INNER) / 2);
  const trackHeight = Math.abs(outer.y - inner.y);
  const w = 26;

  return (
    <g aria-hidden>
      <rect
        x={inner.x - w / 2}
        y={Math.min(inner.y, outer.y)}
        width={w}
        height={trackHeight}
        fill="url(#finishCheckers)"
        stroke="#1a1a1a"
        strokeWidth={1.5}
      />
    </g>
  );
}
