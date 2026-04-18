import { TRACK_VIEWBOX } from './raceTrackHelpers';
import { TrackDefs } from './track/TrackDefs';
import { TrackGrass } from './track/TrackGrass';
import { TrackPond } from './track/TrackPond';
import { TrackAsphalt } from './track/TrackAsphalt';
import { TrackBarriers } from './track/TrackBarriers';
import { TrackStartGantry } from './track/TrackStartGantry';
import { TrackScenery } from './track/TrackScenery';

/**
 * Pista top-down vetorial flat (estilo ilustração).
 * Camadas: gramado → lago → árvores externas → asfalto → barreiras →
 * linha de chegada → árvores/prédios internos → carros.
 */
export function RaceTrack({ children }: { children?: React.ReactNode }) {
  return (
    <svg
      viewBox={`0 0 ${TRACK_VIEWBOX.width} ${TRACK_VIEWBOX.height}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <TrackDefs />
      <TrackGrass />
      <TrackPond />
      <TrackScenery layer="outer" />
      <TrackAsphalt />
      <TrackBarriers />
      <TrackStartGantry />
      <TrackScenery layer="inner" />
      {children}
    </svg>
  );
}
