import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, RotateCcw, Save, Settings2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

import {
  useWebhookAlertSettings,
  type WebhookAlertSettingsInput,
} from "@/hooks/win-loss/useWebhookAlertSettings";

const DEFAULTS: WebhookAlertSettingsInput = {
  consecutive_failures: 5,
  retry_rate_threshold: 0.5,
  window_minutes: 30,
  min_deliveries: 10,
  suppress_minutes: 60,
  max_attempts: 3,
};

interface FieldDef {
  key: keyof WebhookAlertSettingsInput;
  label: string;
  description: string;
  min: number;
  max: number;
  step: number;
  suffix?: string;
}

const FIELDS: FieldDef[] = [
  {
    key: "consecutive_failures",
    label: "Falhas consecutivas para alertar",
    description:
      "Quantas falhas seguidas dispararão o alerta `consecutive_failures` para uma assinatura.",
    min: 1,
    max: 100,
    step: 1,
  },
  {
    key: "retry_rate_threshold",
    label: "Taxa de retry máxima",
    description:
      "Acima desta proporção (0–1) de tentativas que precisaram de retry, dispara `high_retry_rate`.",
    min: 0,
    max: 1,
    step: 0.05,
  },
  {
    key: "window_minutes",
    label: "Janela de avaliação",
    description:
      "Período (em minutos) considerado ao avaliar entregas recentes. Tudo fora dessa janela é ignorado.",
    min: 5,
    max: 1440,
    step: 5,
    suffix: "min",
  },
  {
    key: "min_deliveries",
    label: "Mínimo de entregas para `high_retry_rate`",
    description:
      "Evita falsos positivos: a taxa de retry só é avaliada se houver pelo menos esse número de entregas na janela.",
    min: 1,
    max: 10000,
    step: 1,
  },
  {
    key: "suppress_minutes",
    label: "Janela de supressão (anti-spam)",
    description:
      "Após disparar um alerta, novos disparos do mesmo tipo para a mesma assinatura ficam suprimidos por este período.",
    min: 1,
    max: 1440,
    step: 1,
    suffix: "min",
  },
  {
    key: "max_attempts",
    label: "Tentativas para `attempts_exhausted`",
    description:
      "Número de tentativas que precisam falhar para o mesmo `requestId` antes do alerta de tentativas esgotadas.",
    min: 1,
    max: 20,
    step: 1,
  },
];

function toInput(
  data:
    | (WebhookAlertSettingsInput & { id?: string; updated_at?: string })
    | null
    | undefined,
): WebhookAlertSettingsInput {
  if (!data) return DEFAULTS;
  return {
    consecutive_failures: data.consecutive_failures,
    retry_rate_threshold: data.retry_rate_threshold,
    window_minutes: data.window_minutes,
    min_deliveries: data.min_deliveries,
    suppress_minutes: data.suppress_minutes,
    max_attempts: data.max_attempts,
  };
}

export default function WebhookAlertSettingsPage() {
  const { query, mutation } = useWebhookAlertSettings();
  const { toast } = useToast();
  const [form, setForm] = useState<WebhookAlertSettingsInput>(DEFAULTS);

  // Sync local form when server data loads/changes
  useEffect(() => {
    if (query.data) setForm(toInput(query.data));
  }, [query.data]);

  const setField = (key: keyof WebhookAlertSettingsInput, value: number) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleReset = () => {
    if (query.data) setForm(toInput(query.data));
  };

  const handleRestoreDefaults = () => {
    setForm(DEFAULTS);
  };

  const handleSave = async () => {
    // Front-end validation mirroring DB CHECK constraints
    for (const f of FIELDS) {
      const v = form[f.key];
      if (Number.isNaN(v) || v < f.min || v > f.max) {
        toast({
          title: "Valor inválido",
          description: `${f.label} deve estar entre ${f.min} e ${f.max}.`,
          variant: "destructive",
        });
        return;
      }
    }
    try {
      await mutation.mutateAsync(form);
      toast({
        title: "Configurações salvas",
        description: "O monitor de saúde usará os novos limites na próxima execução.",
      });
    } catch (e) {
      toast({
        title: "Falha ao salvar",
        description: e instanceof Error ? e.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const dirty = query.data
    ? FIELDS.some((f) => form[f.key] !== (query.data as WebhookAlertSettingsInput)[f.key])
    : false;

  return (
    <>
      <Helmet>
        <title>Configurações de Alertas de Webhooks | Promo Champions</title>
        <meta
          name="description"
          content="Ajuste limites de falhas consecutivas, taxa de retry e janelas de tempo dos alertas de webhooks Win/Loss."
        />
      </Helmet>

      <div className="p-6 space-y-6 max-w-4xl">
        {/* Header */}
        <div className="space-y-1">
          <Button asChild variant="ghost" size="sm" className="h-8 -ml-2">
            <Link to="/admin">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Admin
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Settings2 className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-display font-bold gradient-text">
              Alertas de Webhooks — Configurações
            </h1>
          </div>
          <p className="text-muted-foreground">
            Ajuste os limites usados pelo monitor de saúde sem precisar mexer em variáveis de
            ambiente. Mudanças entram em vigor na próxima execução do monitor.
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Limites do monitor</CardTitle>
            <CardDescription>
              Estes valores controlam quando os alertas{" "}
              <code className="text-xs">consecutive_failures</code>,{" "}
              <code className="text-xs">high_retry_rate</code> e{" "}
              <code className="text-xs">attempts_exhausted</code> disparam.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {query.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : query.isError ? (
              <p className="text-sm text-destructive">
                Falha ao carregar configurações:{" "}
                {query.error instanceof Error ? query.error.message : "erro desconhecido"}
              </p>
            ) : (
              <>
                <div className="grid gap-5 md:grid-cols-2">
                  {FIELDS.map((f) => (
                    <div key={f.key} className="space-y-1.5">
                      <Label htmlFor={f.key} className="text-sm">
                        {f.label}
                      </Label>
                      <div className="relative">
                        <Input
                          id={f.key}
                          type="number"
                          inputMode="decimal"
                          min={f.min}
                          max={f.max}
                          step={f.step}
                          value={form[f.key]}
                          onChange={(e) => setField(f.key, Number(e.target.value))}
                          className={f.suffix ? "pr-12" : undefined}
                        />
                        {f.suffix && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                            {f.suffix}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {f.description}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70">
                        Permitido: {f.min} – {f.max}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    {query.data?.updated_at && (
                      <>
                        Última atualização:{" "}
                        {new Date(query.data.updated_at).toLocaleString("pt-BR")}
                      </>
                    )}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRestoreDefaults}
                      disabled={mutation.isPending}
                      className="gap-1"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Padrões
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      disabled={!dirty || mutation.isPending}
                    >
                      Descartar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={!dirty || mutation.isPending}
                      className="gap-1"
                    >
                      <Save className="h-4 w-4" />
                      {mutation.isPending ? "Salvando..." : "Salvar"}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
