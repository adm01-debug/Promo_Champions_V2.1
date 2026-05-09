import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NextStep } from "./meetingSummaryHelpers";

interface Props {
  steps: NextStep[];
}

export const NextStepsTimeline = ({ steps }: Props) => {
  if (!steps?.length) return null;
  return (
    <Card className="glass overflow-hidden border-l-4 border-l-primary/40">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2 font-bold">
            <div className="size-6 rounded-md bg-primary/10 flex items-center justify-center text-primary">
              <ArrowRight className="size-4" />
            </div>
            Próximos Passos Detectados
          </CardTitle>
          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
            {steps.length} Itens
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-6 before:absolute before:inset-0 before:ml-2 before:h-full before:w-0.5 before:-translate-x-1/2 before:bg-gradient-to-b before:from-primary/50 before:via-primary/20 before:to-transparent">
          {steps.map((s, i) => (
            <div key={i} className="relative pl-6 group">
              <span className="absolute left-0 top-1.5 size-4 rounded-full bg-primary border-4 border-background shadow-sm transition-transform group-hover:scale-125 group-hover:bg-primary" />
              <div className="flex items-start justify-between gap-4 bg-muted/20 p-3 rounded-lg border border-border/50 hover:bg-muted/40 transition-colors hover:border-primary/20">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-relaxed text-card-foreground group-hover:text-primary transition-colors">
                    {s.text}
                  </p>
                  {s.deadline_hint && (
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                      <Calendar className="size-3 text-primary/70" />
                      Prazo sugerido: <span className="text-card-foreground">{s.deadline_hint}</span>
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="icon" className="size-8 rounded-full shrink-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
