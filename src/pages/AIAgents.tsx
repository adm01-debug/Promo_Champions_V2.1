import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Sparkles, Plus } from "lucide-react";
import { useAgentRuns } from "@/hooks/agents/useAgentRuns";
import { useAgentRunDetails } from "@/hooks/agents/useAgentRunDetails";
import { AgentLauncherDialog } from "@/components/agents/AgentLauncherDialog";
import { AgentRunCard } from "@/components/agents/AgentRunCard";
import { AgentStepTimeline } from "@/components/agents/AgentStepTimeline";
import { AgentApprovalBar } from "@/components/agents/AgentApprovalBar";
import { AGENT_META, STATUS_META, type AgentRun } from "@/components/agents/agentHelpers";
import { Badge } from "@/components/ui/badge";

export default function AIAgents() {
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [selected, setSelected] = useState<AgentRun | null>(null);
  const { data: runs = [], isLoading } = useAgentRuns();
  const { data: details } = useAgentRunDetails(selected?.id ?? null);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Helmet>
        <title>Agentes IA | Promo Champions</title>
        <meta name="description" content="Agentes autônomos que executam tarefas multi-step no CRM." />
      </Helmet>

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary" />
            Agentes IA
          </h1>
          <p className="text-muted-foreground mt-1">
            Orquestre tarefas multi-step com auditoria e aprovação humana.
          </p>
        </div>
        <Button onClick={() => setLauncherOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Novo agente
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Execuções recentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && <p className="text-muted-foreground text-sm">Carregando…</p>}
          {!isLoading && runs.length === 0 && (
            <div className="text-center py-12 space-y-3">
              <Sparkles className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">Nenhum agente executado ainda.</p>
              <Button onClick={() => setLauncherOpen(true)} variant="outline">
                Iniciar primeiro agente
              </Button>
            </div>
          )}
          {runs.map((r) => (
            <AgentRunCard key={r.id} run={r} onOpen={setSelected} />
          ))}
        </CardContent>
      </Card>

      <AgentLauncherDialog open={launcherOpen} onOpenChange={setLauncherOpen} />

      <Sheet open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {selected && (
                <>
                  {(() => {
                    const Icon = AGENT_META[selected.agent_type].icon;
                    return <Icon className="h-5 w-5 text-primary" />;
                  })()}
                  {AGENT_META[selected.agent_type].label}
                  <Badge variant={STATUS_META[selected.status].variant as never}>
                    {STATUS_META[selected.status].label}
                  </Badge>
                </>
              )}
            </SheetTitle>
          </SheetHeader>

          {details?.run && (
            <div className="space-y-4 mt-4">
              {details.run.goal && (
                <div className="rounded-lg bg-muted/30 p-3 text-sm">
                  <strong>Objetivo:</strong> {details.run.goal}
                </div>
              )}

              {details.run.status === "awaiting_approval" && (
                <AgentApprovalBar runId={details.run.id} />
              )}

              {details.run.result && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Resultado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs whitespace-pre-wrap">
                      {JSON.stringify(details.run.result, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}

              <div>
                <h4 className="font-semibold text-sm mb-3">Linha do tempo</h4>
                <AgentStepTimeline actions={details.actions} />
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
