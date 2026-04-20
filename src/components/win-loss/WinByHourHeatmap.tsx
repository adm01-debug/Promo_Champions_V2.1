import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock } from "lucide-react";
import { useWinByHourMatrix, type HourCell } from "@/hooks/win-loss/useWinByHourMatrix";

interface Props {
  onCellClick?: (dow: number, hour: number) => void;
}

const DOW = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const cellColor = (cell: HourCell): string => {
  if (cell.total === 0) return "bg-muted/20";
  const wr = cell.winRate;
  if (wr >= 70) return "bg-emerald-500/70";
  if (wr >= 50) return "bg-emerald-500/40";
  if (wr >= 30) return "bg-amber-500/40";
  return "bg-rose-500/40";
};

export function WinByHourHeatmap({ onCellClick }: Props) {
  const { data = [], isLoading } = useWinByHourMatrix();

  const grid = useMemo(() => {
    const map = new Map<string, HourCell>();
    data.forEach((c) => map.set(`${c.dow}-${c.hour}`, c));
    return map;
  }, [data]);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4 text-primary" />
          Horário ótimo de fechamento (90d)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[180px]" />
        ) : (
          <div className="overflow-x-auto">
            <div className="inline-grid gap-[2px]" style={{ gridTemplateColumns: `auto repeat(24, minmax(14px, 1fr))` }}>
              <div />
              {HOURS.map((h) => (
                <div key={`h-${h}`} className="text-[8px] text-muted-foreground text-center">
                  {h % 3 === 0 ? h : ""}
                </div>
              ))}
              {DOW.map((label, d) => (
                <>
                  <div key={`d-${d}`} className="text-[10px] text-muted-foreground pr-1 self-center">{label}</div>
                  {HOURS.map((h) => {
                    const cell = grid.get(`${d}-${h}`) ?? { dow: d, hour: h, wins: 0, losses: 0, winRate: 0, total: 0 };
                    return (
                      <button
                        key={`c-${d}-${h}`}
                        type="button"
                        onClick={() => cell.total && onCellClick?.(d, h)}
                        className={`h-4 rounded-sm transition-all hover:scale-125 hover:z-10 ${cellColor(cell)} ${cell.total ? "cursor-pointer" : "cursor-default"}`}
                        title={cell.total ? `${DOW[d]} ${h}h · ${cell.winRate.toFixed(0)}% (${cell.total})` : `${DOW[d]} ${h}h · sem deals`}
                        aria-label={`${DOW[d]} ${h}h: ${cell.winRate.toFixed(0)}% win rate em ${cell.total} deals`}
                      />
                    );
                  })}
                </>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-3 text-[10px] text-muted-foreground">
              <span>0%</span>
              <div className="flex gap-[2px]">
                <div className="h-3 w-4 rounded-sm bg-rose-500/40" />
                <div className="h-3 w-4 rounded-sm bg-amber-500/40" />
                <div className="h-3 w-4 rounded-sm bg-emerald-500/40" />
                <div className="h-3 w-4 rounded-sm bg-emerald-500/70" />
              </div>
              <span>100%</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
