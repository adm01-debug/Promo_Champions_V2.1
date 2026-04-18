import { TRACK_VIEWBOX } from '../raceTrackHelpers';

/**
 * Gramado top-down com variação de tom — base + manchas claras/escuras
 * espalhadas para sair do verde chapado e sugerir relevo natural.
 */
export function TrackGrass() {
  const W = TRACK_VIEWBOX.width;
  const H = TRACK_VIEWBOX.height;

  // Manchas pseudo-aleatórias mas determinísticas (posições fixas).
  const lightBlobs: Array<[number, number, number]> = [
    [80, 40, 90], [320, 25, 70], [560, 50, 110], [820, 30, 80], [950, 90, 95],
    [40, 280, 100], [180, 590, 85], [420, 580, 120], [680, 590, 90], [920, 540, 110],
    [60, 430, 75], [380, 360, 60], [620, 380, 70], [870, 360, 55],
  ];
  const darkBlobs: Array<[number, number, number]> = [
    [200, 150, 60], [500, 140, 70], [780, 160, 65], [950, 250, 50],
    [50, 200, 55], [340, 580, 50], [600, 90, 45], [880, 480, 60],
    [150, 380, 55], [700, 460, 50], [480, 60, 45],
  ];

  return (
    <g aria-hidden>
      {/* base sólida */}
      <rect width={W} height={H} fill="hsl(var(--race-grass))" />

      {/* manchas claras (luz solar) */}
      {lightBlobs.map(([cx, cy, r], i) => (
        <ellipse
          key={`l${i}`}
          cx={cx}
          cy={cy}
          rx={r}
          ry={r * 0.6}
          fill="hsl(var(--race-grass-light))"
          opacity={0.55}
        />
      ))}

      {/* manchas escuras (sombra) */}
      {darkBlobs.map(([cx, cy, r], i) => (
        <ellipse
          key={`d${i}`}
          cx={cx}
          cy={cy}
          rx={r}
          ry={r * 0.55}
          fill="hsl(var(--race-grass-dark))"
          opacity={0.45}
        />
      ))}

      {/* leve vinheta nas bordas */}
      <rect width={W} height={H} fill="url(#grassVignette)" />
    </g>
  );
}
