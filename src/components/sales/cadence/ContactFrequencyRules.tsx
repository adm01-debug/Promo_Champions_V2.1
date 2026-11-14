import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, ShieldAlert, Zap, Save, Loader2 } from 'lucide-react';
import type { ContactFrequencyConfig } from '@/types/sales';
import { toast } from 'sonner';
import {
  DEFAULT_CONTACT_FREQUENCY,
  useContactFrequencyRules,
} from '@/hooks/sales/useContactFrequencyRules';

export function ContactFrequencyRules() {
  const { hasSalesperson, savedRules, isLoading, isError, saveRules, isSaving } =
    useContactFrequencyRules();
  const [config, setConfig] = useState<ContactFrequencyConfig>(DEFAULT_CONTACT_FREQUENCY);

  useEffect(() => {
    if (savedRules) setConfig(savedRules);
  }, [savedRules]);

  const canSave = hasSalesperson && !isLoading && !isError && !isSaving;

  const handleSave = async () => {
    try {
      await saveRules(config);
      toast.success('Regras de frequência salvas.');
    } catch (e) {
      toast.error(
        `Erro ao salvar regras de frequência: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <CardTitle>Regras de Frequência e Janelas</CardTitle>
            {hasSalesperson && !isLoading && !isError && !savedRules && (
              <Badge variant="outline" className="text-xs">
                Padrão — ainda não salvo
              </Badge>
            )}
          </div>
          <CardDescription>
            Evite incomodar o lead e garanta que mensagens humanas tenham prioridade.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Estas regras ficam salvas no seu perfil, mas ainda não são aplicadas
              automaticamente no envio das cadências.
            </AlertDescription>
          </Alert>
          {!hasSalesperson && (
            <p className="text-sm text-muted-foreground">
              Perfil de vendedor não encontrado — não é possível salvar regras.
            </p>
          )}
          {isError && (
            <p className="text-sm text-destructive">
              Não foi possível carregar as regras salvas. Recarregue a página para tentar
              novamente.
            </p>
          )}
          {/* Quiet Hours */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">Janelas de Silêncio (Quiet Hours)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-muted/20">
              <div className="space-y-2">
                <Label>Início (Pausar envios)</Label>
                <Input
                  type="time"
                  value={config.quiet_hours_start}
                  onChange={e =>
                    setConfig(prev => ({ ...prev, quiet_hours_start: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Fim (Retomar envios)</Label>
                <Input
                  type="time"
                  value={config.quiet_hours_end}
                  onChange={e =>
                    setConfig(prev => ({ ...prev, quiet_hours_end: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Limits */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">Limites Diários por Lead</h3>
            </div>

            <div className="space-y-6 px-2">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label>Máximo de ligações por dia</Label>
                  <span className="text-sm font-medium">{config.max_calls_per_day}</span>
                </div>
                <Slider
                  value={[config.max_calls_per_day]}
                  max={5}
                  step={1}
                  onValueChange={([v]) =>
                    setConfig(prev => ({ ...prev, max_calls_per_day: v }))
                  }
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label>Máximo de mensagens (WhatsApp/Email) por dia</Label>
                  <span className="text-sm font-medium">
                    {config.max_messages_per_day}
                  </span>
                </div>
                <Slider
                  value={[config.max_messages_per_day]}
                  max={10}
                  step={1}
                  onValueChange={([v]) =>
                    setConfig(prev => ({ ...prev, max_messages_per_day: v }))
                  }
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label>Intervalo mínimo entre contatos (minutos)</Label>
                  <span className="text-sm font-medium">
                    {config.min_interval_minutes} min
                  </span>
                </div>
                <Slider
                  value={[config.min_interval_minutes]}
                  max={1440}
                  step={30}
                  onValueChange={([v]) =>
                    setConfig(prev => ({ ...prev, min_interval_minutes: v }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Human Priority */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-primary/5 border-primary/20">
            <div className="space-y-0.5">
              <Label className="text-base">Priorizar Mensagens Humanas</Label>
              <p className="text-sm text-muted-foreground">
                Se o lead responder ou mostrar alto interesse, pausar fluxos automáticos
                para permitir intervenção humana.
              </p>
            </div>
            <Switch
              checked={config.prioritize_human}
              onCheckedChange={v => setConfig(prev => ({ ...prev, prioritize_human: v }))}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={() => void handleSave()}
              disabled={!canSave}
              className="w-full md:w-auto"
            >
              {isSaving || isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSaving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}
