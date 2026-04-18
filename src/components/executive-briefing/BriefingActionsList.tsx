import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";
import type { BriefingAction } from "./briefingHelpers";

interface Props {
  actions: BriefingAction[];
}

export function BriefingActionsList({ actions }: Props) {
  const [done, setDone] = useState<Set<number>>(new Set());
  const toggle = (i: number) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-4 w-4 text-primary" />
        <h3 className="text-base font-semibold text-foreground font-sora">Ações para Hoje</h3>
      </div>
      {actions.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhuma ação recomendada.</p>
      )}
      <ul className="space-y-3">
        {actions.map((a, i) => {
          const isDone = done.has(i);
          return (
            <li key={i} className={`flex items-start gap-3 p-3 rounded-lg border bg-card transition-all ${isDone ? "opacity-60" : ""}`}>
              <Checkbox checked={isDone} onCheckedChange={() => toggle(i)} className="mt-0.5" />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>{a.title}</span>
                  {a.module && <Badge variant="outline" className="text-xs">{a.module}</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{a.rationale}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
