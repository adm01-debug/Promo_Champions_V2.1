import { useState } from "react";
import { Search, Clock, Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useSearchCallLibrary } from "@/hooks/conversational/useCallLibrarySearch";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  onSelectRecording?: (recordingId: string) => void;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function HighlightedSnippet({ html }: { html: string }) {
  // ts_headline returns text with <b></b> by default
  return (
    <p
      className="text-sm text-muted-foreground leading-relaxed [&_b]:bg-primary/20 [&_b]:text-foreground [&_b]:font-semibold [&_b]:rounded [&_b]:px-1"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function CallLibrarySearch({ onSelectRecording }: Props) {
  const [query, setQuery] = useState("");
  const { data: results, isLoading } = useSearchCallLibrary(query);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por palavras, objeções, concorrentes nas calls…"
          className="pl-10 h-11"
        />
      </div>

      {query.trim().length > 0 && query.trim().length < 2 && (
        <p className="text-xs text-muted-foreground">Digite ao menos 2 caracteres.</p>
      )}

      {isLoading && (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {!isLoading && results && results.length === 0 && query.trim().length > 1 && (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          Nenhuma call encontrada para "<span className="font-medium">{query}</span>".
        </Card>
      )}

      {!isLoading && results && results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {results.length} resultado{results.length === 1 ? "" : "s"}
          </p>
          {results.map((r) => (
            <Card
              key={r.id}
              className="p-4 hover:border-primary/40 transition-colors cursor-pointer group"
              onClick={() => onSelectRecording?.(r.id)}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                    {r.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(r.duration_seconds)}
                    </span>
                    <span>
                      {formatDistanceToNow(new Date(r.recorded_at), {
                        locale: ptBR,
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="shrink-0 text-[10px]">
                  rank {r.rank.toFixed(2)}
                </Badge>
              </div>
              <HighlightedSnippet html={r.snippet ?? ""} />
              <div className="flex items-center gap-1 text-xs text-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="h-3 w-3" />
                Abrir gravação
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
