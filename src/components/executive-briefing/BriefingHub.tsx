import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RefreshCw, TrendingUp, AlertTriangle } from "lucide-react";
import { useLatestBriefing } from "@/hooks/executive-briefing/useLatestBriefing";
import { useBriefingHistory } from "@/hooks/executive-briefing/useBriefingHistory";
import { useGenerateBriefing } from "@/hooks/executive-briefing/useGenerateBriefing";
import { usePermissions } from "@/hooks/usePermissions";
import { BriefingCard } from "./BriefingCard";
import { BriefingNarrative } from "./BriefingNarrative";
import { BriefingActionsList } from "./BriefingActionsList";
import { BriefingHistoryRail } from "./BriefingHistoryRail";
import { severityToken, type ExecutiveBriefing } from "./briefingHelpers";

export function BriefingHub() {
  const { data: latest, isLoading: latestLoading } = useLatestBriefing();
  const { data: history, isLoading: historyLoading } = useBriefingHistory(14);
  const generate = useGenerateBriefing();
  const { isAdmin, isManager } = usePermissions();
  const canGenerate = isAdmin || isManager;

  const [selected, setSelected] = useState<ExecutiveBriefing | null>(null);
  useEffect(() => { if (latest && !selected) setSelected(latest); }, [latest, selected]);

  const briefing = selected ?? latest;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-sora text-foreground flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Briefing Executivo
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Análise diária do pipeline gerada por IA — seu raio-x estratégico do dia.
          </p>
        </div>
        {canGenerate && (
          <Button
            onClick={() => generate.mutate({ force: true })}
            loading={generate.isPending}
            loadingText="Gerando..."
            variant="glow"
          >
            <RefreshCw className="h-4 w-4" /> Gerar agora
          </Button>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-6 min-w-0">
          {latestLoading && <Skeleton className="h-48 w-full" />}
          {!latestLoading && !briefing && (
            <Card className="p-12 text-center space-y-3">
              <Sparkles className="h-10 w-10 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-semibold text-foreground">Nenhum briefing ainda</h3>
              <p className="text-sm text-muted-foreground">
                {canGenerate ? "Clique em \"Gerar agora\" para criar o primeiro briefing." : "Aguarde o gestor gerar o primeiro briefing."}
              </p>
            </Card>
          )}
          {briefing && (
            <>
              <BriefingCard briefing={briefing} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-status-success" />
                    <h3 className="text-sm font-semibold text-foreground font-sora">Vitórias-chave</h3>
                  </div>
                  <ul className="space-y-2">
                    {briefing.key_wins.length === 0 && <li className="text-xs text-muted-foreground">—</li>}
                    {briefing.key_wins.map((w, i) => (
                      <li key={i} className="text-sm">
                        <span className="font-medium text-foreground">{w.title}</span>
                        <p className="text-xs text-muted-foreground mt-0.5">{w.detail}</p>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4 text-status-warning" />
                    <h3 className="text-sm font-semibold text-foreground font-sora">Riscos críticos</h3>
                  </div>
                  <ul className="space-y-2">
                    {briefing.key_risks.length === 0 && <li className="text-xs text-muted-foreground">—</li>}
                    {briefing.key_risks.map((r, i) => {
                      const t = severityToken(r.severity);
                      return (
                        <li key={i} className="text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-xs ${t.color}`}>{t.label}</Badge>
                            <span className="font-medium text-foreground">{r.title}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{r.detail}</p>
                        </li>
                      );
                    })}
                  </ul>
                </Card>
              </div>

              <BriefingActionsList actions={briefing.recommended_actions} />
              <BriefingNarrative narrative={briefing.narrative} />
            </>
          )}
        </div>

        <div className="lg:sticky lg:top-4 lg:self-start">
          <BriefingHistoryRail
            history={history}
            isLoading={historyLoading}
            selectedId={selected?.id}
            onSelect={setSelected}
          />
        </div>
      </div>
    </div>
  );
}
