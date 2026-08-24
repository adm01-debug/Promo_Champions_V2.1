import { SCENE_VIEWBOX } from '../raceTrackHelpers';

/**
 * Gramado top-down preenchendo toda a cena (SCENE_VIEWBOX 800x1333),
 * para a pista (600x1000 centralizada) ocupar ~75% e ter grama ao redor.
 */
export function TrackGrass() {
  const W = SCENE_VIEWBOX.width;
  const H = SCENE_VIEWBOX.height;

  // Manchas pseudo-aleatórias mas determinísticas (posições fixas em 600x1000).
  const lightBlobs: Array<[number, number, number]> = [
    [60, 80, 90], [220, 40, 70], [380, 70, 95], [520, 50, 85], [560, 180, 90],
    [40, 320, 100], [40, 540, 85], [40, 760, 110], [560, 360, 90], [560, 600, 100],
    [560, 820, 95], [80, 940, 75], [300, 970, 110], [520, 940, 85],
  ];
  const darkBlobs: Array<[number, number, number]> = [
    [140, 200, 60], [460, 240, 70], [120, 460, 65], [480, 480, 50],
    [100, 700, 55], [500, 720, 50], [180, 880, 45], [420, 880, 60],
    [60, 150, 55], [560, 90, 50], [300, 30, 45],
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
