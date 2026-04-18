import { TRACK_VIEWBOX } from './raceTrackHelpers';
import { TrackDefs } from './track/TrackDefs';
import { TrackSky } from './track/TrackSky';
import { TrackGrass } from './track/TrackGrass';
import { TrackAsphalt } from './track/TrackAsphalt';
import { TrackStartGantry } from './track/TrackStartGantry';

/**
 * Pista oval cinematográfica (visual AAA): skybox + gramado com mowing stripes +
 * asfalto com gradient e rumble strips + pórtico start/finish + holofote central + vinheta.
 * Composição em camadas via subcomponentes (≤200L cada).
 */
export function RaceTrack({ children }: { children?: React.ReactNode }) {
  return (
    <svg
      viewBox={`0 0 ${TRACK_VIEWBOX.width} ${TRACK_VIEWBOX.height}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <TrackDefs />

      {/* camada 1: skybox */}
      <TrackSky />

      {/* camada 2: gramado externo */}
      <TrackGrass />

      {/* camada 3: asfalto + miolo + rumble strips + checkpoints */}
      <TrackAsphalt />

      {/* camada 4: pórtico start/finish */}
      <TrackStartGantry />

      {/* holofote central suave */}
      <rect width="100%" height="100%" fill="url(#centerSpotlight)" pointerEvents="none" />

      {/* carros (renderizados acima de tudo) */}
      {children}

      {/* vinheta cinematográfica no topo de tudo */}
      <rect width="100%" height="100%" fill="url(#vignette)" pointerEvents="none" />
    </svg>
  );
}
