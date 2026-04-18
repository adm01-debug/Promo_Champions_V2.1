import { FC, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSkillAssessments } from "@/hooks/coaching/useSkillGapAnalyzer";
import { SKILL_KEYS, SKILL_LABELS, LEVEL_BG_CLASS, LEVEL_LABELS, TREND_ICON, TREND_COLOR, type SkillKey, type SkillLevel, type SkillTrend } from "./skillGapHelpers";

export const SkillMaturityMatrix: FC = () => {
  const { data, isLoading } = useSkillAssessments();

  const matrix = useMemo(() => {
    const bySeller = new Map<string, { name: string; cells: Record<string, { score: number; level: SkillLevel; trend: SkillTrend }> }>();
    (data ?? []).forEach((a) => {
      const e = bySeller.get(a.salesperson_id) ?? { name: a.salesperson_name ?? "—", cells: {} };
      e.cells[a.skill] = { score: Number(a.score), level: a.current_level, trend: a.trend };
      bySeller.set(a.salesperson_id, e);
    });
    return Array.from(bySeller.entries())
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 50);
  }, [data]);

  if (isLoading) return <Skeleton className="h-[400px]" />;

  if (matrix.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Matriz de Maturidade</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
            Sem avaliações ainda.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Matriz de Maturidade</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left py-2 px-2 sticky left-0 bg-card font-medium text-muted-foreground">Vendedor</th>
              {SKILL_KEYS.map((s) => (
                <th key={s} className="text-center py-2 px-2 font-medium text-muted-foreground">{SKILL_LABELS[s]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row) => (
              <tr key={row.id} className="border-t border-border/50">
                <td className="py-2 px-2 sticky left-0 bg-card font-medium truncate max-w-[160px]">{row.name}</td>
                {SKILL_KEYS.map((s: SkillKey) => {
                  const c = row.cells[s];
                  if (!c) return <td key={s} className="py-2 px-1 text-center text-muted-foreground">—</td>;
                  return (
                    <td key={s} className="py-1.5 px-1">
                      <div className={`rounded-md border px-2 py-1 text-center ${LEVEL_BG_CLASS[c.level]}`}>
                        <div className="font-bold">{Math.round(c.score)}</div>
                        <div className="text-[10px] flex items-center justify-center gap-1">
                          <span>{LEVEL_LABELS[c.level]}</span>
                          <span className={TREND_COLOR[c.trend]}>{TREND_ICON[c.trend]}</span>
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};
