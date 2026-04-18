import { Lightbulb } from "lucide-react";
import { DIMENSION_LABELS } from "./coachingHelpers";

interface Props {
  recommendations: Array<{ category: string; tip: string; priority: number }>;
}

export const RecommendationsList = ({ recommendations }: Props) => {
  if (!recommendations?.length) {
    return <p className="text-xs text-muted-foreground">Nenhuma recomendação ainda.</p>;
  }
  const sorted = [...recommendations].sort((a, b) => a.priority - b.priority);
  return (
    <ul className="space-y-2">
      {sorted.map((r, i) => (
        <li key={i} className="flex gap-2 items-start p-2 rounded-md bg-muted/40 border border-border/40">
          <Lightbulb className="h-4 w-4 text-warning shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
              {DIMENSION_LABELS[r.category] ?? r.category}
            </div>
            <p className="text-sm leading-snug">{r.tip}</p>
          </div>
        </li>
      ))}
    </ul>
  );
};
