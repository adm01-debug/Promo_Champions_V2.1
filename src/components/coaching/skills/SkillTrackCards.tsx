import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Target, Calendar } from "lucide-react";
import { useSkillTracks } from "@/hooks/coaching/useSkillGapAnalyzer";
import { SKILL_LABELS, LEVEL_LABELS, LEVEL_BADGE, type SkillKey } from "./skillGapHelpers";

export const SkillTrackCards: FC = () => {
  const { data, isLoading } = useSkillTracks();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72" />)}
      </div>
    );
  }

  const tracks = (data ?? []).slice(0, 12);

  if (tracks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          Nenhuma trilha de desenvolvimento gerada ainda. Rode "Reavaliar agora".
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tracks.map((t) => (
        <Card key={t.id} variant="elevated">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base truncate">{t.salesperson_name ?? "—"}</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{SKILL_LABELS[t.skill as SkillKey] ?? t.skill}</p>
              </div>
              <Badge variant={LEVEL_BADGE[t.current_level]}>P{t.priority}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-xs">
              <Target className="h-3.5 w-3.5 text-primary" />
              <span className="text-muted-foreground">
                {LEVEL_LABELS[t.current_level]} → <span className="text-foreground font-medium">{LEVEL_LABELS[t.target_level]}</span>
              </span>
              <span className="ml-auto flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3 w-3" /> {t.estimated_weeks}sem
              </span>
            </div>

            {t.ai_plan && (
              <div className="rounded-md bg-primary/5 border border-primary/20 p-2.5 flex gap-2">
                <Sparkles className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">{t.ai_plan}</p>
              </div>
            )}

            <ol className="space-y-1.5 text-xs">
              {t.milestones.map((m, i) => (
                <li key={i} className="flex gap-2">
                  <span className="font-mono text-muted-foreground flex-shrink-0">S{m.week}</span>
                  <span>{m.title}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
