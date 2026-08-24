import { Card } from "@/components/ui/card";
import { MessageSquare, Mic, Zap, Activity } from "lucide-react";
import { formatSeconds } from "./diarizationHelpers";

interface Props {
  turnsCount: number | null | undefined;
  longestMonologueSec: number | null | undefined;
  interruptionsCount: number | null | undefined;
  talkRatioSeller: number | null | undefined;
}

export function CallStatsPanel({
  turnsCount,
  longestMonologueSec,
  interruptionsCount,
  talkRatioSeller,
}: Props) {
  const items = [
    { icon: MessageSquare, label: "Turnos", value: turnsCount ?? "—" },
    {
      icon: Mic,
      label: "Maior monólogo",
      value: longestMonologueSec ? formatSeconds(longestMonologueSec) : "—",
    },
    { icon: Zap, label: "Interrupções", value: interruptionsCount ?? "—" },
    {
      icon: Activity,
      label: "Vendedor",
      value: talkRatioSeller != null ? `${Number(talkRatioSeller).toFixed(0)}%` : "—",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
      {items.map((it) => (
        <Card key={it.label} className="p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <it.icon className="h-3.5 w-3.5" />
            {it.label}
          </div>
          <div className="mt-1 text-lg font-semibold text-foreground">{it.value}</div>
        </Card>
      ))}
    </div>
  );
}
