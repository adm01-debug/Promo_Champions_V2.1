import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";
import { useCoachingProgress } from "@/hooks/conversational/useCoachingProgress";
import { CATEGORY_LABELS, STATUS_LABELS, type CoachingCategory, type CoachingStatus } from "./coachingHelpers";

interface Props {
  salespersonId: string;
  days?: number;
}

const STATUS_COLORS: Record<CoachingStatus, string> = {
  pending: "bg-muted",
  accepted: "bg-info",
  practiced: "bg-success",
  dismissed: "bg-muted-foreground/40",
};

export const CoachingProgressCard = ({ salespersonId, days = 30 }: Props) => {
  const { data, isLoading } = useCoachingProgress(salespersonId, days);

  const stats = useMemo(() => {
    const rows = data ?? [];
    const total = rows.reduce((s, r) => s + Number(r.count), 0);
    const byStatus: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    rows.forEach((r) => {
      byStatus[r.status] = (byStatus[r.status] ?? 0) + Number(r.count);
      byCategory[r.category] = (byCategory[r.category] ?? 0) + Number(r.count);
    });
    return { total, byStatus, byCategory };
  }, [data]);

  if (isLoading) return <Skeleton className="h-48" />;

  if (stats.total === 0) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Coaching IA — últimos {days} dias</h3>
        </div>
        <p className="text-xs text-muted-foreground">Nenhuma ação de coaching no período.</p>
      </Card>
    );
  }

  const maxCat = Math.max(...Object.values(stats.byCategory), 1);

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Coaching IA — últimos {days} dias</h3>
        </div>
        <span className="text-xs text-muted-foreground">{stats.total} ações</span>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">Por status</p>
        <div className="flex h-3 rounded-full overflow-hidden bg-muted">
          {(["practiced", "accepted", "pending", "dismissed"] as CoachingStatus[]).map((st) => {
            const v = stats.byStatus[st] ?? 0;
            const pct = (v / stats.total) * 100;
            if (pct === 0) return null;
            return <div key={st} className={STATUS_COLORS[st]} style={{ width: `${pct}%` }} />;
          })}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
          {(["practiced", "accepted", "pending", "dismissed"] as CoachingStatus[]).map((st) => (
            <span key={st} className="flex items-center gap-1">
              <span className={`h-2 w-2 rounded-full ${STATUS_COLORS[st]}`} />
              {STATUS_LABELS[st]} ({stats.byStatus[st] ?? 0})
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">Por categoria</p>
        <div className="space-y-1">
          {Object.entries(stats.byCategory)
            .sort((a, b) => b[1] - a[1])
            .map(([cat, count]) => (
              <div key={cat} className="flex items-center gap-2">
                <span className="text-xs w-24 shrink-0 text-muted-foreground">
                  {CATEGORY_LABELS[cat as CoachingCategory] ?? cat}
                </span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${(count / maxCat) * 100}%` }}
                  />
                </div>
                <span className="text-xs tabular-nums w-6 text-right">{count}</span>
              </div>
            ))}
        </div>
      </div>
    </Card>
  );
};
