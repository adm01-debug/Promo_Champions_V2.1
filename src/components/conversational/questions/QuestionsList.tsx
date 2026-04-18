import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { categoryLabel, depthLabel, type CallQuestion, type QuestionCategory } from "./questionHelpers";

interface Props {
  questions: CallQuestion[];
}

function formatTs(sec: number): string {
  if (!sec || sec < 0) return "—";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function badgeVariant(c: QuestionCategory): "destructive" | "warning" | "info" | "high" | "secondary" {
  if (c === "leading") return "destructive";
  if (c === "impact") return "high";
  if (c === "discovery") return "info";
  if (c === "open") return "warning";
  return "secondary";
}

export const QuestionsList = ({ questions }: Props) => {
  const [open, setOpen] = useState(false);

  if (questions.length === 0) {
    return (
      <div className="text-center text-xs text-muted-foreground py-4 border border-dashed rounded">
        Nenhuma pergunta detectada nesta call.
      </div>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-between">
          <span>Ver {questions.length} perguntas detectadas</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 mt-2 max-h-72 overflow-y-auto pr-1">
        {questions.map((q) => (
          <div key={q.id} className="border rounded-md p-2 text-xs space-y-1 bg-muted/30">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1 flex-wrap">
                <Badge variant={badgeVariant(q.category)} className="text-[10px]">
                  {categoryLabel(q.category)}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {depthLabel(q.depth)}
                </Badge>
              </div>
              <span className="text-muted-foreground tabular-nums">{formatTs(q.start_estimate)}</span>
            </div>
            <p className="text-foreground/90 leading-snug">{q.text}</p>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};
