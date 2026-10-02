import { Flame, Thermometer, Snowflake } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export type LeadConnectionStatus = 'connected' | 'connecting' | 'error';

export const LEAD_CATEGORY_CONFIG = {
  Hot: {
    icon: Flame,
    color: 'text-status-error',
    bg: 'bg-status-error/10 border-status-error/20',
    label: 'ELITE',
  },
  Warm: {
    icon: Thermometer,
    color: 'text-status-warning',
    bg: 'bg-status-warning/10 border-status-warning/20',
    label: 'ACTIVE',
  },
  Cold: {
    icon: Snowflake,
    color: 'text-info',
    bg: 'bg-info/10 border-info/20',
    label: 'STAGNANT',
  },
} as const;

export function ScoreRing({ score, size = 56 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80
      ? 'stroke-status-error'
      : score >= 50
        ? 'stroke-status-warning'
        : 'stroke-blue-500';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={4}
          className="text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(color, 'transition-all duration-700')}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display font-bold text-sm">
        {score}
      </span>
    </div>
  );
}

export function FactorBar({
  label,
  value,
  maxValue,
}: {
  label: string;
  value: number;
  maxValue: number;
}) {
  const pct = Math.round((value / maxValue) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {value}/{maxValue}
        </span>
      </div>
      <Progress value={pct} className="h-1.5" />
    </div>
  );
}
