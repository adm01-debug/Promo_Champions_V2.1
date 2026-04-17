import { cn } from "@/lib/utils";
import {
  MOMENT_ICONS,
  MOMENT_LABELS,
  SEVERITY_LABELS,
  SEVERITY_TONE,
  type MomentSeverity,
  type MomentType,
} from "./criticalMomentsHelpers";

interface Props {
  type: MomentType;
  severity: MomentSeverity;
  className?: string;
  compact?: boolean;
}

export const CriticalMomentBadge = ({ type, severity, className, compact }: Props) => {
  const Icon = MOMENT_ICONS[type];
  const tone = SEVERITY_TONE[severity];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        tone.bg,
        tone.text,
        tone.border,
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      <span>{MOMENT_LABELS[type]}</span>
      {!compact && (
        <span className={cn("ml-1 inline-block h-1.5 w-1.5 rounded-full", tone.dot)} aria-hidden />
      )}
      {!compact && <span className="opacity-80">{SEVERITY_LABELS[severity]}</span>}
    </span>
  );
};
