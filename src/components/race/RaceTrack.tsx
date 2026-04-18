import { TRACK_VIEWBOX, TRACK_OFFSET_Y } from './raceTrackHelpers';
import { TrackDefs } from './track/TrackDefs';
import { TrackGrass } from './track/TrackGrass';
import { TrackPond } from './track/TrackPond';
import { TrackAsphalt } from './track/TrackAsphalt';
import { TrackBarriers } from './track/TrackBarriers';
import { TrackStartGantry } from './track/TrackStartGantry';
import { TrackScenery } from './track/TrackScenery';

interface RaceTrackProps {
  children?: React.ReactNode;
  yellowFlag?: boolean;
  waveTrigger?: number;
}

/**
 * Pista top-down vetorial flat (estilo ilustração).
 * A grama cobre todo o viewBox; o restante do circuito é deslocado
 * verticalmente por TRACK_OFFSET_Y para centralizar a pista (75% da área).
 * `getPositionOnTrack` já aplica o offset, então `children` (carros) ficam
 * naturalmente alinhados sem precisar do translate.
 */
export function RaceTrack({ children, yellowFlag = false, waveTrigger = 0 }: RaceTrackProps) {
  return (
    <svg
      viewBox={`0 0 ${TRACK_VIEWBOX.width} ${TRACK_VIEWBOX.height}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <TrackDefs />
      {/* Grama cobre TODO o viewBox estendido */}
      <TrackGrass />
      {/* Conteúdo da pista deslocado para o centro vertical */}
      <g transform={`translate(0 ${TRACK_OFFSET_Y})`}>
        <TrackPond />
        <TrackScenery layer="outer" yellowFlag={yellowFlag} waveTrigger={waveTrigger} />
        <TrackAsphalt />
        <TrackBarriers />
        <TrackStartGantry />
        <TrackScenery layer="inner" />
      </g>
      {children}
    </svg>
  );
}
