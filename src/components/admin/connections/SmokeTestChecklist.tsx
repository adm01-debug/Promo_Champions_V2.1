import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2, XCircle, Loader2, PlayCircle, Play, ClipboardCopy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useIntegrationConnections, useTestConnection } from "@/hooks/admin/useIntegrationConnections";
import { useCredentialsSource } from "./CredentialsSourceFilterContext";
import {
  buildMarkdownReport,
  loadSnapshot,
  saveSnapshot,
  truncate,
  type SmokeItemResult,
} from "./smokeTestHelpers";

export function SmokeTestChecklist() {
  const { data: conns = [] } = useIntegrationConnections();
  const test = useTestConnection();
  const { source } = useCredentialsSource();

  const [results, setResults] = useState<Record<string, SmokeItemResult>>({});
  const [includeDisabled, setIncludeDisabled] = useState(false);
  const [running, setRunning] = useState<"all" | string | null>(null);
  const [hasRun, setHasRun] = useState(false);

  // Hidrata snapshot ao montar
  useEffect(() => {
    const snap = loadSnapshot();
    if (snap) {
      setResults(snap.results);
      setHasRun(true);
    }
  }, []);

  const visible = useMemo(() => {
    return conns
      .filter((c) => (includeDisabled ? true : c.enabled))
      .filter((c) => (source === "all" ? true : c.source === source));
  }, [conns, includeDisabled, source]);

  const stats = useMemo(() => {
    const total = visible.length;
    let passed = 0;
    let failed = 0;
    let ran = 0;
    for (const c of visible) {
      const r = results[c.id];
      if (r?.status === "ok") {
        passed += 1;
        ran += 1;
      } else if (r?.status === "fail") {
        failed += 1;
        ran += 1;
      }
    }
    return { total, passed, failed, ran };
  }, [visible, results]);

  const updateResult = (id: string, patch: SmokeItemResult) => {
    setResults((prev) => {
      const next = { ...prev, [id]: patch };
      saveSnapshot(next);
      return next;
    });
  };

  const runOne = async (id: string) => {
    setResults((prev) => ({ ...prev, [id]: { status: "running" } }));
    try {
      const res = await test.mutateAsync(id);
      updateResult(id, {
        status: res?.ok ? "ok" : "fail",
        latency_ms: res?.latency_ms,
        error: res?.error ?? undefined,
        ran_at: new Date().toISOString(),
      });
    } catch (e) {
      updateResult(id, {
        status: "fail",
        error: e instanceof Error ? e.message : "Erro desconhecido",
        ran_at: new Date().toISOString(),
      });
    }
    setHasRun(true);
  };

  const runAll = async () => {
    if (visible.length === 0) return;
    setRunning("all");
    for (const c of visible) {
      setRunning(c.id);
      await runOne(c.id);
    }
    setRunning(null);
  };

  const handleRunOne = async (id: string) => {
    setRunning(id);
    await runOne(id);
    setRunning(null);
  };

  const copyReport = async () => {
    const md = buildMarkdownReport(
      visible.map((c) => ({ id: c.id, label: c.label, result: results[c.id] })),
    );
    try {
      await navigator.clipboard.writeText(md);
      toast.success("Relatório copiado");
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  const isRunningAll = running === "all" || (running !== null && running !== null && visible.some((c) => c.id === running));
  const progressValue = stats.total > 0 ? Math.round((stats.ran / stats.total) * 100) : 0;

  return (
    <Card className="glass border-border/40">
      <CardHeader className="space-y-3">
        <div className="flex flex-row items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <CardTitle className="font-display text-lg">Smoke test</CardTitle>
            {hasRun && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                  {stats.passed}/{stats.total} passaram
                </Badge>
                {stats.failed > 0 && (
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                    {stats.failed} falharam
                  </Badge>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <Switch checked={includeDisabled} onCheckedChange={setIncludeDisabled} />
              Incluir desativadas
            </label>
            <Button
              size="sm"
              onClick={runAll}
              disabled={running !== null || visible.length === 0}
              className="gap-2"
              aria-label="Rodar smoke test em todas as conexões visíveis"
            >
              {isRunningAll ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <PlayCircle className="h-4 w-4" aria-hidden="true" />
              )}
              Rodar todos
            </Button>
          </div>
        </div>
        {running !== null && stats.total > 0 && (
          <Progress
            value={progressValue}
            className="h-1.5"
            aria-label={`Progresso do smoke test: ${stats.ran} de ${stats.total} executados`}
          />
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {visible.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {conns.length === 0
              ? "Cadastre conexões para rodar o smoke test."
              : "Nenhuma conexão para os filtros atuais."}
          </p>
        ) : (
          <TooltipProvider delayDuration={200}>
            <ul className="space-y-2">
              {visible.map((c) => {
                const r = results[c.id];
                const status = r?.status ?? "idle";
                const isDisabled = !c.enabled;
                return (
                  <li
                    key={c.id}
                    className={`flex items-center justify-between gap-3 border border-border/40 rounded-lg px-3 py-2 ${
                      isDisabled ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {status === "running" && <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />}
                      {status === "ok" && <CheckCircle2 className="h-4 w-4 text-success shrink-0" />}
                      {status === "fail" && <XCircle className="h-4 w-4 text-destructive shrink-0" />}
                      {status === "idle" && <div className="h-2 w-2 rounded-full bg-muted-foreground/40 shrink-0 ml-1" />}
                      <span className="text-sm font-medium truncate">{c.label}</span>
                      <span className="text-xs text-muted-foreground uppercase shrink-0">{c.kind}</span>
                      {isDisabled && (
                        <Badge variant="outline" className="text-[10px] shrink-0">Desativada</Badge>
                      )}
                      {status === "fail" && r?.error && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs text-destructive truncate cursor-help">
                              {truncate(r.error, 80)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-md">
                            <p className="text-xs whitespace-pre-wrap break-words">{r.error}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {r?.latency_ms !== undefined && (
                        <span className="text-xs text-muted-foreground tabular-nums">{r.latency_ms}ms</span>
                      )}
                      {r?.ran_at && (
                        <span className="text-xs text-muted-foreground hidden md:inline">
                          {formatDistanceToNow(new Date(r.ran_at), { addSuffix: true, locale: ptBR })}
                        </span>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 gap-1"
                        onClick={() => handleRunOne(c.id)}
                        disabled={running !== null}
                      >
                        <Play className="h-3 w-3" />
                        <span className="text-xs">Rodar</span>
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </TooltipProvider>
        )}
        {hasRun && visible.length > 0 && (
          <div className="flex justify-end pt-2 border-t border-border/40">
            <Button size="sm" variant="outline" className="gap-2" onClick={copyReport}>
              <ClipboardCopy className="h-3 w-3" />
              Copiar relatório
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
