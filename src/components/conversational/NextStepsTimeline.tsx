import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Calendar } from "lucide-react";
import type { NextStep } from "./meetingSummaryHelpers";

interface Props {
  steps: NextStep[];
}

export const NextStepsTimeline = ({ steps }: Props) => {
  if (!steps?.length) return null;
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ArrowRight className="size-4 text-primary" />
          Próximos passos ({steps.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative border-l-2 border-primary/30 ml-2 space-y-4">
          {steps.map((s, i) => (
            <li key={i} className="ml-4">
              <span className="absolute -left-[9px] size-4 rounded-full bg-primary border-2 border-background" />
              <p className="text-sm font-medium leading-snug">{s.text}</p>
              {s.deadline_hint && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Calendar className="size-3" />
                  {s.deadline_hint}
                </p>
              )}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
};
