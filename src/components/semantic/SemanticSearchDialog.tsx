import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Search } from "lucide-react";
import { useSemanticSearch } from "@/hooks/useSemanticSearch";
import { ENTITY_META, type SemanticEntityType, type SemanticResult } from "./semanticSearchHelpers";
import { SemanticSearchResultRow } from "./SemanticSearchResultRow";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TYPES: SemanticEntityType[] = ["client", "lead", "deal", "activity", "call_recording"];

export function SemanticSearchDialog({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Set<SemanticEntityType>>(new Set());
  const { data, loading, search, reset } = useSemanticSearch();

  useEffect(() => {
    if (!open) { setQuery(""); reset(); setActive(new Set()); }
  }, [open, reset]);

  useEffect(() => {
    if (!open) return;
    if (query.trim().length < 3) { reset(); return; }
    search(query, active.size ? Array.from(active) : undefined, true);
  }, [query, active, open, search, reset]);

  const filters = useMemo(() => TYPES.map((t) => ({ type: t, ...ENTITY_META[t] })), []);

  const toggle = (t: SemanticEntityType) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t); else next.add(t);
      return next;
    });
  };

  const onSelect = (r: SemanticResult) => {
    onOpenChange(false);
    navigate(ENTITY_META[r.entity_type].route(r.entity_id));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3 border-b">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            Busca Semântica Universal
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 border-b space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pergunte ou busque qualquer coisa…  ex: clientes que falaram em desconto"
              className="pl-9 h-11 text-base"
            />
            {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => {
              const Icon = f.icon;
              const isActive = active.has(f.type);
              return (
                <Button
                  key={f.type}
                  size="sm"
                  variant={isActive ? "default" : "outline"}
                  onClick={() => toggle(f.type)}
                  className="h-7 px-2.5 text-xs gap-1.5"
                >
                  <Icon className="h-3 w-3" />
                  {f.label}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="max-h-[55vh] overflow-y-auto">
          {data?.answer && (
            <div className="px-5 py-4 bg-primary/5 border-b">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wide text-primary">Resposta IA</span>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap">{data.answer}</p>
            </div>
          )}

          <div className="py-2">
            {!loading && query.trim().length >= 3 && data?.results.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                Nenhum resultado. Tente outras palavras-chave.
              </p>
            )}
            {query.trim().length < 3 && (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                Digite pelo menos 3 caracteres. Use linguagem natural — a IA encontra por significado.
              </p>
            )}
            {data?.results.map((r) => (
              <SemanticSearchResultRow key={r.id} result={r} query={query} onSelect={onSelect} />
            ))}
          </div>
        </div>

        {data && data.count > 0 && (
          <div className={cn("px-4 py-2 border-t bg-muted/30 flex items-center justify-between text-xs text-muted-foreground")}>
            <span>{data.count} resultado{data.count !== 1 ? "s" : ""}</span>
            {data.cached && <Badge variant="outline" className="text-[10px]">cache</Badge>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
