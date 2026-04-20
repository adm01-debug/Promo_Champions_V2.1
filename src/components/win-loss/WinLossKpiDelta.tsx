import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: number; // % delta with sign
  invert?: boolean; // when true, negative is good (e.g. ciclo)
  label?: string;
}

export function WinLossKpiDelta({ value, invert = false, label }: Props) {
  if (!isFinite(value) || Math.abs(value) < 0.5) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground" title={label}>
        <Minus className="h-2.5 w-2.5" /> 0%
      </span>
    );
  }
  const positive = invert ? value < 0 : value > 0;
  const Icon = value > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[10px] font-medium tabular-nums",
        positive ? "text-emerald-600" : "text-rose-600",
      )}
      title={label ?? `Variação: ${value.toFixed(1)}%`}
      aria-label={label ?? `Variação ${value.toFixed(1)}%`}
    >
      <Icon className="h-2.5 w-2.5" />
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}
