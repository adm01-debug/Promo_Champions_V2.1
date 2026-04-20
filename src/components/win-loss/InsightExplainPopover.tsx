import { Sparkles, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useInsightExplanation } from "@/hooks/win-loss/useInsightExplanation";

interface Props {
  insightId: string;
  title: string;
  description: string;
}

/** Renders a small markdown-lite block (bold + line breaks). */
const renderLite = (text: string): JSX.Element => (
  <div className="space-y-1.5">
    {text.split("\n").map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={i} className="text-xs leading-relaxed">
          {parts.map((p, j) =>
            p.startsWith("**") && p.endsWith("**")
              ? <strong key={j}>{p.slice(2, -2)}</strong>
              : <span key={j}>{p}</span>,
          )}
        </p>
      );
    })}
  </div>
);

export function InsightExplainPopover({ insightId, title, description }: Props) {
  const { explain, explanations, loading } = useInsightExplanation();
  const text = explanations[insightId];
  const isLoading = loading === insightId;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 px-2 text-[11px] text-primary hover:text-primary"
          onClick={() => !text && explain(insightId, title, description)}
          aria-label="Explicar com IA"
        >
          <Sparkles className="h-3 w-3 mr-1" />
          Why?
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" side="top" align="end">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium">Explicação IA</span>
          </div>
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground py-3">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Analisando padrão…
            </div>
          )}
          {!isLoading && text && renderLite(text)}
          {!isLoading && !text && (
            <p className="text-xs text-muted-foreground">Clique no botão para gerar.</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
