import { FC, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { History, ChevronDown, ChevronRight, Search, Printer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Button } from "@/components/ui/button";
import { useBriefingHistory, BriefingHistoryEntry } from "@/hooks/assistant/useBriefingHistory";
import { cn } from "@/lib/utils";

interface Props {
  salespersonId: string | null;
}

function labelForDate(iso: string): string {
  try {
    const d = parseISO(iso);
    if (isToday(d)) return "Hoje";
    if (isYesterday(d)) return "Ontem";
    return format(d, "EEE, dd 'de' MMM", { locale: ptBR });
  } catch {
    return iso;
  }
}

const Item: FC<{ entry: BriefingHistoryEntry }> = ({ entry }) => {
  const [open, setOpen] = useState(false);
  const preview = (entry.content ?? "").replace(/[#*_`>]/g, "").slice(0, 90);

  return (
    <div className="border rounded-lg overflow-hidden bg-muted/20">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted/40 transition-colors text-left"
        aria-expanded={open}
      >
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-foreground">{labelForDate(entry.briefing_date)}</div>
          {!open && (
            <div className="text-[11px] text-muted-foreground truncate">
              {preview || "Briefing gerado"}
            </div>
          )}
        </div>
      </button>
      {open && (
        <div className={cn("px-4 py-3 bg-background/60 border-t", "prose prose-sm dark:prose-invert max-w-none text-sm max-h-72 overflow-y-auto")}>
          <ReactMarkdown rehypePlugins={[[rehypeSanitize, defaultSchema]]}>{entry.content || "_Sem conteúdo_"}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

/**
 * Escapa string para uso em RegExp — evita ReDoS / erros de sintaxe com input do usuário.
 */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const BriefingHistoryTimeline: FC<Props> = ({ salespersonId }) => {
  const { data, isLoading, error } = useBriefingHistory(salespersonId);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!data) return [] as BriefingHistoryEntry[];
    const q = query.trim();
    if (!q) return data;
    try {
      const re = new RegExp(escapeRegex(q), "i");
      return data.filter((e) => re.test(e.content ?? "") || re.test(labelForDate(e.briefing_date)));
    } catch {
      return data;
    }
  }, [data, query]);

  const handlePrint = () => {
    // Toggle temporário do body para ativar CSS @media print dedicado
    document.body.classList.add("printing-briefings");
    const restore = () => {
      document.body.classList.remove("printing-briefings");
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);
    window.print();
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <History className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex-1">
          Briefings anteriores
        </span>
        {data && data.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 gap-1 text-[11px]"
            onClick={handlePrint}
            aria-label="Exportar histórico em PDF"
          >
            <Printer className="h-3 w-3" />
            PDF
          </Button>
        )}
      </div>

      {data && data.length > 0 && (
        <div className="relative mb-2 no-print">
          <Search className="h-3 w-3 text-muted-foreground absolute left-2 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar nos briefings…"
            className="w-full text-xs pl-6 pr-2 py-1.5 rounded-md bg-muted/40 border focus:border-primary/50 outline-none"
          />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      ) : error ? (
        <p className="text-xs text-destructive">Não foi possível carregar o histórico.</p>
      ) : !data || data.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Seus briefings diários vão aparecer aqui a partir de amanhã.
        </p>
      ) : filtered.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nenhum briefing corresponde a "{query}".</p>
      ) : (
        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 no-print">
          {filtered.map((entry) => (
            <Item key={entry.id} entry={entry} />
          ))}
        </div>
      )}

      {/* Bloco dedicado para impressão: só visível durante print */}
      {data && data.length > 0 && (
        <div className="print-only" aria-hidden>
          <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Histórico de Briefings</h1>
          <p style={{ fontSize: 11, color: "#666", marginBottom: 16 }}>
            Gerado em {format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })} · {filtered.length} briefing(s)
          </p>
          {filtered.map((entry) => (
            <section key={entry.id} style={{ marginBottom: 16, breakInside: "avoid" }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                {labelForDate(entry.briefing_date)} · {format(parseISO(entry.briefing_date), "dd/MM/yyyy")}
              </h2>
              <div className="prose prose-sm max-w-none" style={{ fontSize: 11 }}>
                <ReactMarkdown rehypePlugins={[[rehypeSanitize, defaultSchema]]}>{entry.content || ""}</ReactMarkdown>
              </div>
            </section>
          ))}
        </div>
      )}
    </Card>
  );
};
