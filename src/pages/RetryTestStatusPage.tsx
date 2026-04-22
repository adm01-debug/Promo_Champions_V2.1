import { useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock, RefreshCw, FileCode2, AlertTriangle, MinusCircle } from "lucide-react";
import { useRetryTestRun, type RetryTestResult } from "@/hooks/useRetryTestRun";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const formatMs = (ms: number) => {
  if (ms < 1) return `${(ms * 1000).toFixed(0)}µs`;
  if (ms < 1000) return `${ms.toFixed(2)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

function StatusBadge({ status }: { status: RetryTestResult["status"] }) {
  if (status === "passed") {
    return (
      <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-500 gap-1">
        <CheckCircle2 className="h-3 w-3" /> passou
      </Badge>
    );
  }
  if (status === "failed") {
    return (
      <Badge variant="outline" className="border-destructive/40 bg-destructive/10 text-destructive gap-1">
        <XCircle className="h-3 w-3" /> falhou
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="border-muted-foreground/30 bg-muted/30 text-muted-foreground gap-1">
      <MinusCircle className="h-3 w-3" /> ignorado
    </Badge>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: typeof CheckCircle2;
  label: string;
  value: string | number;
  tone?: "default" | "success" | "danger" | "warning";
}) {
  const toneClass =
    tone === "success" ? "text-emerald-500"
      : tone === "danger" ? "text-destructive"
      : tone === "warning" ? "text-amber-500"
      : "text-primary";
  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`p-2.5 rounded-xl bg-muted/40 ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
          <p className="text-2xl font-display font-semibold tabular-nums truncate">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RetryTestStatusPage() {
  const run = useRetryTestRun();

  // Auto-run on mount
  useEffect(() => {
    run.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const data = run.data;

  const sortedTests = useMemo(() => {
    if (!data) return [];
    // Failures first, then by duration desc
    return [...data.tests].sort((a, b) => {
      const order = { failed: 0, passed: 1, ignored: 2 } as const;
      const diff = order[a.status] - order[b.status];
      if (diff !== 0) return diff;
      return b.duration_ms - a.duration_ms;
    });
  }, [data]);

  const passRate = data && data.total > 0 ? Math.round((data.passed / data.total) * 100) : 0;

  return (
    <>
      <Helmet>
        <title>Status dos Testes — retry_test.ts</title>
        <meta name="description" content="Dashboard de pass/fail e tempo de execução dos testes do dispatcher de webhooks." />
        <link rel="canonical" href="/admin/retry-test-status" />
      </Helmet>

      <main className="container max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2.5 rounded-xl gradient-primary shrink-0">
              <FileCode2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-page-title gradient-text">Status dos Testes</h1>
              <p className="text-sm text-muted-foreground mt-1 truncate">
                <code className="text-xs bg-muted/40 px-1.5 py-0.5 rounded">
                  supabase/functions/winloss-webhook-dispatcher/retry_test.ts
                </code>
              </p>
            </div>
          </div>
          <Button
            onClick={() => run.mutate()}
            disabled={run.isPending}
            className="gap-2"
            size="lg"
          >
            <RefreshCw className={`h-4 w-4 ${run.isPending ? "animate-spin" : ""}`} />
            {run.isPending ? "Executando…" : "Rodar testes"}
          </Button>
        </motion.header>

        {/* Error state */}
        {run.isError && (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-destructive">Falha ao executar testes</p>
                <p className="text-muted-foreground mt-1">{run.error?.message ?? "Erro desconhecido"}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* KPIs */}
        {run.isPending && !data ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : data ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <KpiCard icon={CheckCircle2} label="Aprovados" value={`${data.passed} / ${data.total}`} tone="success" />
            <KpiCard icon={XCircle} label="Falhas" value={data.failed} tone={data.failed > 0 ? "danger" : "default"} />
            <KpiCard icon={Clock} label="Duração total" value={formatMs(data.total_duration_ms)} />
            <KpiCard
              icon={data.failed === 0 ? CheckCircle2 : AlertTriangle}
              label="Taxa de sucesso"
              value={`${passRate}%`}
              tone={data.failed === 0 ? "success" : "warning"}
            />
          </motion.div>
        ) : null}

        {/* Meta */}
        {data && (
          <p className="text-xs text-muted-foreground">
            Última execução:{" "}
            <span className="text-foreground font-medium">
              {format(new Date(data.ran_at), "dd 'de' MMM yyyy 'às' HH:mm:ss", { locale: ptBR })}
            </span>
            {data.ignored > 0 && (
              <> · <span className="text-muted-foreground">{data.ignored} ignorado(s)</span></>
            )}
          </p>
        )}

        {/* Tests table */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">
              Testes ({data ? data.total : "—"})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {run.isPending && !data ? (
              <div className="p-6 space-y-3">
                {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10 rounded-md" />)}
              </div>
            ) : data ? (
              <ScrollArea className="h-[560px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-card z-10">
                    <TableRow>
                      <TableHead className="w-[110px]">Status</TableHead>
                      <TableHead>Nome do teste</TableHead>
                      <TableHead className="w-[120px] text-right">Duração</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedTests.map((t) => (
                      <TableRow key={t.name} className={t.status === "failed" ? "bg-destructive/5" : ""}>
                        <TableCell><StatusBadge status={t.status} /></TableCell>
                        <TableCell className="font-mono text-xs">
                          <div className="break-words">{t.name}</div>
                          {t.error && (
                            <div className="mt-1.5 text-destructive text-xs whitespace-pre-wrap">{t.error}</div>
                          )}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-xs text-muted-foreground">
                          {t.status === "ignored" ? "—" : formatMs(t.duration_ms)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Nenhum resultado ainda. Clique em "Rodar testes".
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
