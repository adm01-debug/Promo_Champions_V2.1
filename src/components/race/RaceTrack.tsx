import { TRACK_VIEWBOX } from './raceTrackHelpers';
import { TrackDefs } from './track/TrackDefs';
import { TrackGrass } from './track/TrackGrass';
import { TrackPond } from './track/TrackPond';
import { TrackAsphalt } from './track/TrackAsphalt';
import { TrackBarriers } from './track/TrackBarriers';
import { TrackStartGantry } from './track/TrackStartGantry';
import { TrackScenery } from './track/TrackScenery';

interface RaceTrackProps {
  children?: React.ReactNode;
  /** Quando true, todos os marshals trocam para bandeira amarela. */
  yellowFlag?: boolean;
  /** Incrementa para disparar uma onda mexicana (la ola) na arquibancada. */
  waveTrigger?: number;
}

/**
 * Pista top-down vetorial flat (estilo ilustração).
 */
export function RaceTrack({ children, yellowFlag = false, waveTrigger = 0 }: RaceTrackProps) {
  return (
    <svg
      viewBox={`0 0 ${TRACK_VIEWBOX.width} ${TRACK_VIEWBOX.height}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <TrackDefs />
      <TrackGrass />
      <TrackPond />
      <TrackScenery layer="outer" yellowFlag={yellowFlag} waveTrigger={waveTrigger} />
      <TrackAsphalt />
      <TrackBarriers />
      <TrackStartGantry />
      <TrackScenery layer="inner" />
      {children}
    </svg>
  );
}
