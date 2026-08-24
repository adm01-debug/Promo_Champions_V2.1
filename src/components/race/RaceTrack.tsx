import { SCENE_VIEWBOX, TRACK_OFFSET } from './raceTrackHelpers';
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
  leaderName?: string;
  leaderGap?: string;
}

/**
 * Pista top-down vetorial flat. A pista (600x1000) é renderizada dentro de uma
 * cena ampliada (800x1333) para ocupar ~75% da área visível, com grama nas bordas.
 */
export function RaceTrack({
  children, yellowFlag = false, waveTrigger = 0, leaderName, leaderGap,
}: RaceTrackProps) {
  return (
    <svg
      viewBox={`0 0 ${SCENE_VIEWBOX.width} ${SCENE_VIEWBOX.height}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <TrackDefs />
      {/* Grama cobre toda a cena */}
      <TrackGrass />
      {/* Pista + cenário relativos à pista, deslocados para o centro da cena */}
      <g transform={`translate(${TRACK_OFFSET.x} ${TRACK_OFFSET.y})`}>
        <TrackPond />
        <TrackScenery layer="outer" yellowFlag={yellowFlag} waveTrigger={waveTrigger} leaderName={leaderName} leaderGap={leaderGap} />
        <TrackAsphalt />
        <TrackBarriers />
        <TrackStartGantry />
        <TrackScenery layer="inner" />
        {children}
      </g>
    </svg>
  );
}

