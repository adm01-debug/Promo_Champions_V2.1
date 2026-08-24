import React, { useMemo } from "react";
import type { TrendPoint } from "@/hooks/scoring/useScoreTrend";

interface Props {
  points: TrendPoint[];
  width?: number;
  height?: number;
}

export const ScoreSparkline = React.memo(({ points, width = 160, height = 40 }: Props) => {
  const path = useMemo(() => {
    if (points.length < 2) return "";
    const min = Math.min(...points.map((p) => p.score));
    const max = Math.max(...points.map((p) => p.score));
    const range = max - min || 1;
    const stepX = width / (points.length - 1);
    return points
      .map((p, i) => {
        const x = i * stepX;
        const y = height - ((p.score - min) / range) * (height - 4) - 2;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [points, width, height]);

  if (points.length < 2) {
    return <div className="text-[10px] text-muted-foreground">Sem histórico suficiente</div>;
  }

  const last = points[points.length - 1].score;
  const first = points[0].score;
  const trendUp = last >= first;

  return (
    <svg width={width} height={height} className="overflow-visible" aria-label="Tendência do score">
      <path
        d={path}
        fill="none"
        stroke={trendUp ? "hsl(var(--status-success))" : "hsl(var(--destructive))"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});
ScoreSparkline.displayName = "ScoreSparkline";
