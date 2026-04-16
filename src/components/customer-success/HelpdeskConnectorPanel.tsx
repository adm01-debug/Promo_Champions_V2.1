import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plug, RefreshCw, Calendar, Sparkles, Rocket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Provider = "zendesk" | "intercom" | "freshdesk";

const PROVIDERS: { id: Provider; label: string; secrets: string[] }[] = [
  { id: "zendesk", label: "Zendesk", secrets: ["ZENDESK_DOMAIN", "ZENDESK_EMAIL", "ZENDESK_API_TOKEN"] },
  { id: "intercom", label: "Intercom", secrets: ["INTERCOM_ACCESS_TOKEN"] },
  { id: "freshdesk", label: "Freshdesk", secrets: ["FRESHDESK_DOMAIN", "FRESHDESK_API_KEY"] },
];

export function HelpdeskConnectorPanel() {
  const [syncing, setSyncing] = useState<Provider | null>(null);
  const [renewalRunning, setRenewalRunning] = useState(false);
  const [expansionRunning, setExpansionRunning] = useState(false);
  const [onboardingRunning, setOnboardingRunning] = useState(false);

  async function handleSync(provider: Provider) {
    setSyncing(provider);
    try {
      const { data, error } = await supabase.functions.invoke("helpdesk-sync", { body: { provider } });
      if (error) throw error;
      const d = data as { fetched: number; upserted: number; error?: string };
      if (d.error) throw new Error(d.error);
      toast.success(`${provider} sincronizado: ${d.upserted} tickets`);
    } catch (err) {
      toast.error(`Falha em ${provider}: ${err instanceof Error ? err.message : "erro"}`);
    } finally {
      setSyncing(null);
    }
  }

  async function handleRenewalCron() {
    setRenewalRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("renewal-automation", { body: {} });
      if (error) throw error;
      const d = data as { renewals_inspected: number; tasks_created: number; notifications_created: number };
      toast.success(`Renovações: ${d.renewals_inspected} inspecionadas • ${d.tasks_created} tarefas • ${d.notifications_created} alertas`);
    } catch (err) {
      toast.error(`Falha: ${err instanceof Error ? err.message : "erro"}`);
    } finally {
      setRenewalRunning(false);
    }
  }

  async function handleOnboardingAuto() {
    setOnboardingRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("onboarding-launcher", { body: { action: "auto_launch_new_accounts" } });
      if (error) throw error;
      const d = data as { accounts_evaluated: number; journeys_launched: number };
      toast.success(`Onboarding: ${d.accounts_evaluated} contas avaliadas • ${d.journeys_launched} jornadas iniciadas`);
    } catch (err) {
      toast.error(`Falha: ${err instanceof Error ? err.message : "erro"}`);
    } finally {
      setOnboardingRunning(false);
    }
  }

  async function handleExpansion() {
    setExpansionRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("expansion-detector", { body: {} });
      if (error) throw error;
      const d = data as { opportunities_created: number; skipped_existing: number; playbooks: number; error?: string };
      if (d.error) throw new Error(d.error);
      toast.success(`Expansion: ${d.playbooks} playbooks • ${d.opportunities_created} novas oportunidades • ${d.skipped_existing} já existiam`);
    } catch (err) {
      toast.error(`Falha: ${err instanceof Error ? err.message : "erro"}`);
    } finally {
      setExpansionRunning(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Plug className="h-4 w-4" />Conectores de Helpdesk</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {PROVIDERS.map((p) => (
            <div key={p.id} className="flex items-center justify-between border border-border/40 rounded-lg p-3">
              <div>
                <div className="font-semibold capitalize">{p.label}</div>
                <div className="text-xs text-muted-foreground">Secrets: {p.secrets.join(", ")}</div>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleSync(p.id)} disabled={syncing === p.id}>
                {syncing === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                <span className="ml-2">Sincronizar</span>
              </Button>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Configure as secrets em <Badge variant="outline" className="text-[10px]">Lovable Cloud → Secrets</Badge> antes de sincronizar.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Calendar className="h-4 w-4" />Automação de Renovações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Roda <code className="text-xs">detect_renewal_risks</code>, gera tarefas e notificações para renovações em 90/60/30/7 dias.
          </p>
          <Button onClick={handleRenewalCron} disabled={renewalRunning} className="w-full">
            {renewalRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-2">Executar agora</span>
          </Button>
          <p className="text-xs text-muted-foreground">
            Recomendado agendar via cron diário no painel de Lovable Cloud.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-4 w-4" />Expansion Detector</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Avalia playbooks ativos contra contas e gera oportunidades de upsell/cross-sell com confidence score.
          </p>
          <Button onClick={handleExpansion} disabled={expansionRunning} className="w-full">
            {expansionRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span className="ml-2">Detectar oportunidades</span>
          </Button>
          <p className="text-xs text-muted-foreground">
            Usa <code className="text-xs">trigger_type</code> (tier, health_score, usage_threshold) para casar contas a playbooks.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Rocket className="h-4 w-4" />Onboarding Automático</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Cria jornadas de onboarding (standard / enterprise) para contas novas dos últimos 7 dias sem journey ativa.
          </p>
          <Button onClick={handleOnboardingAuto} disabled={onboardingRunning} className="w-full">
            {onboardingRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
            <span className="ml-2">Lançar jornadas</span>
          </Button>
          <p className="text-xs text-muted-foreground">
            Templates: <code className="text-xs">standard</code> (6 etapas), <code className="text-xs">enterprise</code> (7 etapas), <code className="text-xs">selfserve</code> (4 etapas).
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
