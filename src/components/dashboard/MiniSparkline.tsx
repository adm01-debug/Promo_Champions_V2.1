import React from "react";
import { cn } from "@/lib/utils";
import { useMemo, useId } from "react";

interface MiniSparklineProps {
  data: number[];
  className?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
}

/**
 * A tiny SVG sparkline for inline KPI trend visualization.
 * Renders a smooth polyline + gradient fill area.
 */
export const MiniSparkline = React.memo(function MiniSparkline({
  data,
  className,
  width = 56,
  height = 20,
  strokeWidth = 2.5,
}: MiniSparklineProps) {
  const uniqueId = useId().replace(/:/g, "");
  const pathData = useMemo(() => {
    if (data.length < 2) return { line: "", area: "" };

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = 1;

    const points = data.map((v, i) => ({
      x: padding + (i / (data.length - 1)) * (width - padding * 2),
      y: padding + (1 - (v - min) / range) * (height - padding * 2),
    }));

    const line = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
    const area = `${line} L ${points[points.length - 1].x.toFixed(1)} ${height} L ${points[0].x.toFixed(1)} ${height} Z`;

    return { line, area };
  }, [data, width, height]);

  if (data.length < 2) return null;

  const isPositive = data[data.length - 1] >= data[0];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("shrink-0 opacity-70", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`spark-fill-${uniqueId}-${isPositive ? "up" : "down"}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
          <stop offset="60%" stopColor="currentColor" stopOpacity="0.1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={pathData.area}
        fill={`url(#spark-fill-${uniqueId}-${isPositive ? "up" : "down"})`}
      />
      <path
        d={pathData.line}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});