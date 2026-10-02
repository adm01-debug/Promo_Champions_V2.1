interface RaceLapBadgeProps {
  current: number;
  total: number;
  isFocus: boolean;
}

export function RaceLapBadge({ current, total, isFocus }: RaceLapBadgeProps) {
  return (
    <div
      className="absolute top-3 left-1/2 -translate-x-1/2 z-20 rounded-xl border border-border/50 backdrop-blur-md shadow-lg"
      style={{
        background: 'hsl(var(--background) / 0.78)',
        padding: isFocus ? '6px 14px' : '6px 12px',
      }}
      aria-label={`Volta ${current} de ${total}`}
    >
      <div className="flex items-baseline gap-2">
        <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Lap
        </span>
        <span
          className={`tabular-nums text-foreground ${isFocus ? 'text-[18px] font-black' : 'text-[15px] font-black'}`}
          style={{ fontFamily: 'system-ui, sans-serif', letterSpacing: '-0.02em' }}
        >
          {current}
          <span className="text-muted-foreground/70 font-normal">/{total}</span>
        </span>
      </div>
    </div>
  );
}
