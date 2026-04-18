import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Brain, TrendingUp, AlertTriangle, Award } from "lucide-react";
import { useSkillSummary, useAnalyzeSkillGaps } from "@/hooks/coaching/useSkillGapAnalyzer";
import { SKILL_LABELS, type SkillKey } from "./skillGapHelpers";

export const SkillGapSummary: FC = () => {
  const { data, isLoading } = useSkillSummary();
  const analyze = useAnalyzeSkillGaps();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
      </div>
    );
  }

  const weakestLabel = data?.weakest_skill ? SKILL_LABELS[data.weakest_skill.skill as SkillKey] ?? data.weakest_skill.skill : "—";
  const strongestLabel = data?.strongest_skill ? SKILL_LABELS[data.strongest_skill.skill as SkillKey] ?? data.strongest_skill.skill : "—";

  const cards = [
    {
      title: "Skill mais fraca",
      value: weakestLabel,
      sub: data?.weakest_skill ? `Média ${Math.round(data.weakest_skill.avg)}/100` : "—",
      icon: AlertTriangle,
      tone: "text-destructive",
    },
    {
      title: "Vendedores em iniciante",
      value: String(data?.reps_at_beginner ?? 0),
      sub: `${data?.beginner_assessments ?? 0} avaliações`,
      icon: Brain,
      tone: "text-warning",
    },
    {
      title: "Em melhoria",
      value: String(data?.improving_count ?? 0),
      sub: "tendência ascendente",
      icon: TrendingUp,
      tone: "text-success",
    },
    {
      title: "Skill mais forte",
      value: strongestLabel,
      sub: data?.strongest_skill ? `Média ${Math.round(data.strongest_skill.avg)}/100` : "—",
      icon: Award,
      tone: "text-primary",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display">Skill Gap Analyzer</h2>
          <p className="text-sm text-muted-foreground">Maturidade longitudinal de skills da equipe</p>
        </div>
        <Button onClick={() => analyze.mutate()} disabled={analyze.isPending} size="sm">
          <RefreshCw className={`mr-2 h-4 w-4 ${analyze.isPending ? "animate-spin" : ""}`} />
          {analyze.isPending ? "Analisando…" : "Reavaliar agora"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm text-muted-foreground">{c.title}</CardTitle>
                <Icon className={`h-4 w-4 ${c.tone}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{c.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{c.sub}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
