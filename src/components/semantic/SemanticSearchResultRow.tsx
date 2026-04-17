import { Badge } from "@/components/ui/badge";
import { ENTITY_META, formatScore, getSnippet, type SemanticResult } from "./semanticSearchHelpers";
import { cn } from "@/lib/utils";

interface Props {
  result: SemanticResult;
  query: string;
  onSelect: (r: SemanticResult) => void;
}

export function SemanticSearchResultRow({ result, query, onSelect }: Props) {
  const meta = ENTITY_META[result.entity_type];
  const Icon = meta.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect(result)}
      className="w-full flex items-start gap-3 px-4 py-3 rounded-lg hover:bg-muted/60 transition-colors text-left"
    >
      <div className={cn("flex-shrink-0 h-9 w-9 rounded-md flex items-center justify-center", meta.color)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="text-[10px] uppercase tracking-wide">{meta.label}</Badge>
          <span className="text-xs text-muted-foreground">{formatScore(result.similarity)} match</span>
        </div>
        <p className="text-sm text-foreground line-clamp-2">{getSnippet(result.content, query)}</p>
      </div>
    </button>
  );
}
