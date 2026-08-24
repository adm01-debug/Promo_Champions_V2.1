import { cn } from "@/lib/utils";

export const SpeedometerSkeleton = () => (
  <div className="relative rounded-2xl border border-border/50 bg-gradient-to-b from-card/95 via-card to-card/80 p-5 overflow-hidden animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-lg bg-muted/40" />
        <div className="h-3 w-20 rounded bg-muted/40" />
      </div>
      <div className="h-5 w-12 rounded-md bg-muted/40" />
    </div>
    <div className="relative flex items-center justify-center h-[165px]">
      <div className="relative w-[180px] h-[120px] overflow-hidden">
        <div
          className="absolute inset-0 rounded-full border-[10px] border-border/40 border-b-transparent"
          style={{ transform: "rotate(45deg)" }}
        />
        <div className="absolute inset-x-0 bottom-3 flex flex-col items-center gap-1.5">
          <div className="h-6 w-20 rounded bg-muted/50" />
          <div className="h-2 w-14 rounded bg-muted/30" />
        </div>
      </div>
    </div>
  </div>
);

export const ComparativeStripSkeleton = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "rounded-xl border border-border/50 bg-gradient-to-r from-card/80 via-card to-card/80 p-4 animate-pulse",
      className
    )}
  >
    <div className="flex items-center gap-2 mb-3">
      <div className="h-px flex-1 bg-border/40" />
      <div className="h-3 w-40 rounded bg-muted/40" />
      <div className="h-px flex-1 bg-border/40" />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-2.5 w-16 rounded bg-muted/40" />
          <div className="h-4 w-24 rounded bg-muted/50" />
          <div className="h-2.5 w-12 rounded bg-muted/30" />
        </div>
      ))}
    </div>
  </div>
);

export const TrendChartSkeleton = ({ height }: { height?: number }) => (
  <div
    className="relative w-full h-full rounded-xl animate-pulse overflow-hidden"
    style={height ? { height } : undefined}
  >
    {/* Y-axis ticks */}
    <div className="absolute left-3 top-3 bottom-3 flex flex-col justify-between">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-2 w-10 rounded bg-muted/30" />
      ))}
    </div>
    {/* Line placeholder */}
    <svg
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      <path
        d="M5,80 C20,60 30,70 40,50 S60,20 80,40 95,30 100,25"
        fill="none"
        stroke="hsl(var(--muted))"
        strokeWidth="0.6"
        strokeOpacity="0.5"
        strokeDasharray="2 2"
      />
    </svg>
    {/* X-axis ticks */}
    <div className="absolute bottom-1 left-14 right-3 flex justify-between">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-2 w-6 rounded bg-muted/30" />
      ))}
    </div>
  </div>
);
