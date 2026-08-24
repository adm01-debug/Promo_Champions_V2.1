import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BulkComposerWizard } from "@/components/engagement/BulkComposer/BulkComposerWizard";
import { useBulkJobs } from "@/hooks/engagement/useBulkComposer";
import { STATUS_LABEL, STATUS_TONE, truncate } from "@/components/engagement/BulkComposer/bulkComposerHelpers";

export default function BulkComposerPage() {
  const [params, setParams] = useSearchParams();
  const initialJobId = params.get("job") ?? undefined;
  const initialLeads = useMemo(() => {
    const raw = params.get("leads");
    if (!raw) return [];
    return raw.split(",").map((id) => ({ id }));
  }, [params]);

  const [showWizard, setShowWizard] = useState<boolean>(!!initialJobId || initialLeads.length > 0);
  const [activeJobId, setActiveJobId] = useState<string | undefined>(initialJobId);
  const { data: jobs, isLoading } = useBulkJobs();

  const openJob = (id: string) => {
    setActiveJobId(id);
    setShowWizard(true);
    setParams({ job: id });
  };

  const newJob = () => {
    setActiveJobId(undefined);
    setShowWizard(true);
    setParams({});
  };

  return (
    <>
      <Helmet>
        <title>Composer IA em massa | Promo Champions</title>
        <meta name="description" content="Gere e envie e-mails personalizados em massa com IA, mantendo personalização individual por destinatário." />
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-page-title flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" /> Composer IA em massa
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gere até 50 e-mails personalizados por lote, revise individualmente e envie apenas os aprovados.
            </p>
          </div>
          <Button onClick={newJob}>
            <Plus className="h-4 w-4" /> Novo lote
          </Button>
        </div>

        {showWizard && (
          <BulkComposerWizard
            initialLeads={initialLeads}
            jobId={activeJobId}
            onJobCreated={(id) => {
              setActiveJobId(id);
              setParams({ job: id });
            }}
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle>Histórico de lotes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading && <div className="text-sm text-muted-foreground">Carregando…</div>}
            {!isLoading && (jobs?.length ?? 0) === 0 && (
              <div className="text-sm text-muted-foreground">Nenhum lote ainda. Crie o primeiro acima.</div>
            )}
            {jobs?.map((job) => (
              <button
                key={job.id}
                onClick={() => openJob(job.id)}
                className="w-full text-left flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/10 transition-colors"
              >
                <div className="space-y-1">
                  <div className="text-sm font-medium">{truncate(job.prompt, 96)}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(job.created_at).toLocaleString()} · {job.target_count} alvos · {job.tone}
                  </div>
                </div>
                <Badge variant={STATUS_TONE[job.status] ?? "outline"}>
                  {STATUS_LABEL[job.status] ?? job.status}
                </Badge>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
