import { TRACK_VIEWBOX } from '../raceTrackHelpers';

/**
 * Gramado top-down com variação de tom — base + manchas claras/escuras
 * espalhadas para sair do verde chapado e sugerir relevo natural.
 * Calibrado para viewBox 600x1000 (vertical).
 */
export function TrackGrass() {
  const W = TRACK_VIEWBOX.width;
  const H = TRACK_VIEWBOX.height;

  // Manchas pseudo-aleatórias mas determinísticas. Coordenadas em viewBox 600x1333.
  // Inclui manchas extras nas faixas superior (0-166) e inferior (1166-1333) que
  // ficaram livres ao reduzir a pista para 75% da área.
  const lightBlobs: Array<[number, number, number]> = [
    // Topo extra (0-166)
    [80, 40, 95], [300, 60, 110], [520, 30, 85], [180, 120, 75], [440, 130, 90],
    // Pista (166..1166) — manchas originais somadas a +166
    [60, 246, 90], [220, 206, 70], [380, 236, 95], [520, 216, 85], [560, 346, 90],
    [40, 486, 100], [40, 706, 85], [40, 926, 110], [560, 526, 90], [560, 766, 100],
    [560, 986, 95], [80, 1106, 75], [300, 1136, 110], [520, 1106, 85],
    // Base extra (1166-1333)
    [120, 1220, 100], [340, 1240, 95], [500, 1210, 80], [220, 1300, 90], [460, 1305, 85],
  ];
  const darkBlobs: Array<[number, number, number]> = [
    // Topo extra
    [220, 90, 55], [400, 50, 65], [120, 30, 45],
    // Pista (originais +166)
    [140, 366, 60], [460, 406, 70], [120, 626, 65], [480, 646, 50],
    [100, 866, 55], [500, 886, 50], [180, 1046, 45], [420, 1046, 60],
    [60, 316, 55], [560, 256, 50], [300, 196, 45],
    // Base extra
    [180, 1230, 55], [380, 1260, 60], [60, 1290, 50], [540, 1280, 55],
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
