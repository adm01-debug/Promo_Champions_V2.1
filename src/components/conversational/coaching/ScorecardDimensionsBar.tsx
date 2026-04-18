import { DIMENSION_LABELS, classifyHealth, healthHsl } from "./coachingHelpers";

interface Props {
  talk: number;
  questions: number;
  objections: number;
  sentiment: number;
  moments: number;
}

export const ScorecardDimensionsBar = ({ talk, questions, objections, sentiment, moments }: Props) => {
  const rows = [
    { key: "talk", score: talk },
    { key: "questions", score: questions },
    { key: "objections", score: objections },
    { key: "sentiment", score: sentiment },
    { key: "moments", score: moments },
  ];
  return (
    <div className="space-y-2">
      {rows.map((r) => {
        const h = classifyHealth(r.score);
        const pct = Math.max(0, Math.min(100, r.score));
        return (
          <div key={r.key} className="flex items-center gap-2">
            <span className="text-xs w-28 shrink-0 text-muted-foreground">
              {DIMENSION_LABELS[r.key]}
            </span>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: healthHsl(h) }} />
            </div>
            <span className="text-xs tabular-nums w-8 text-right font-medium">{Math.round(r.score)}</span>
          </div>
        );
      })}
    </div>
  );
};
