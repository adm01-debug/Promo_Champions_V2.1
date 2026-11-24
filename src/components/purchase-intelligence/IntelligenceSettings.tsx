import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Settings2, Bell, BrainCircuit } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSyncedSetting } from '@/hooks/useSyncedSetting';

type NotificationFrequency = 'realtime' | 'hourly' | 'daily';

interface IntelligenceThresholds {
  churnSensitivity: number;
  upsellThreshold: number;
  notificationFrequency: NotificationFrequency;
  pushNotifications: boolean;
}

const SETTINGS_KEY = 'purchase-intelligence.thresholds';
const FREQUENCIES: NotificationFrequency[] = ['realtime', 'hourly', 'daily'];

const DEFAULT_THRESHOLDS: IntelligenceThresholds = {
  churnSensitivity: 75,
  upsellThreshold: 85,
  notificationFrequency: 'realtime',
  pushNotifications: true,
};

const clampPercent = (raw: unknown, fallback: number) => {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(100, Math.max(0, Math.round(parsed)));
};

export function sanitizeThresholds(raw: unknown): IntelligenceThresholds {
  const source = (raw ?? {}) as Partial<Record<keyof IntelligenceThresholds, unknown>>;
  const frequency = source.notificationFrequency;
  return {
    churnSensitivity: clampPercent(
      source.churnSensitivity,
      DEFAULT_THRESHOLDS.churnSensitivity
    ),
    upsellThreshold: clampPercent(
      source.upsellThreshold,
      DEFAULT_THRESHOLDS.upsellThreshold
    ),
    notificationFrequency:
      typeof frequency === 'string' &&
      FREQUENCIES.includes(frequency as NotificationFrequency)
        ? (frequency as NotificationFrequency)
        : DEFAULT_THRESHOLDS.notificationFrequency,
    pushNotifications:
      typeof source.pushNotifications === 'boolean'
        ? source.pushNotifications
        : DEFAULT_THRESHOLDS.pushNotifications,
  };
}

export const IntelligenceSettings = () => {
  const [open, setOpen] = useState(false);
  const { value, update, reset, syncStatus } = useSyncedSetting<IntelligenceThresholds>({
    key: SETTINGS_KEY,
    defaults: DEFAULT_THRESHOLDS,
    storageKey: 'purchase_intelligence_thresholds',
    schemaVersion: 1,
    sanitize: sanitizeThresholds,
  });

  const handleSave = () => {
    setOpen(false);
    toast.success('Parâmetros de inteligência salvos');
  };

  const handleReset = () => {
    void reset();
    toast.success('Parâmetros restaurados para o padrão');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-primary/5 border-primary/20 hover:bg-primary/10"
        >
          <Settings2 className="h-4 w-4" /> Configurar IA
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-black/90 border-white/10 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-section-title flex items-center gap-2 text-primary">
            <BrainCircuit className="h-5 w-5" /> Parâmetros de Inteligência
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Ajuste os limiares de detecção e a frequência dos alertas preditivos.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex flex-col gap-1" htmlFor="churn-sensitivity">
                <span>Sensibilidade de Churn</span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  Disparar alerta acima de:
                </span>
              </Label>
              <span className="text-xs font-mono font-bold text-primary">
                {value.churnSensitivity}%
              </span>
            </div>
            <Slider
              id="churn-sensitivity"
              value={[value.churnSensitivity]}
              max={100}
              step={1}
              className="py-2"
              aria-label="Sensibilidade de Churn"
              onValueChange={values => update({ churnSensitivity: values[0] ?? 0 })}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex flex-col gap-1" htmlFor="upsell-threshold">
                <span>Limiar de Upsell</span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  Confiança mínima para sugerir:
                </span>
              </Label>
              <span className="text-xs font-mono font-bold text-primary">
                {value.upsellThreshold}%
              </span>
            </div>
            <Slider
              id="upsell-threshold"
              value={[value.upsellThreshold]}
              max={100}
              step={1}
              className="py-2"
              aria-label="Limiar de Upsell"
              onValueChange={values => update({ upsellThreshold: values[0] ?? 0 })}
            />
          </div>

          <div className="space-y-4">
            <Label className="flex flex-col gap-1">
              <span>Frequência de Notificações</span>
              <span className="text-[10px] text-muted-foreground font-normal">
                Intervalo de varredura:
              </span>
            </Label>
            <Select
              value={value.notificationFrequency}
              onValueChange={next =>
                update({ notificationFrequency: next as NotificationFrequency })
              }
            >
              <SelectTrigger className="bg-white/5 border-white/10 h-8 text-xs">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent className="bg-black/95 border-white/10">
                <SelectItem value="realtime">Tempo Real (High Load)</SelectItem>
                <SelectItem value="hourly">A cada 1 hora</SelectItem>
                <SelectItem value="daily">Diário (Resumo)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20 text-primary">
                <Bell className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold">Push Notifications</p>
                <p className="text-[10px] text-muted-foreground">
                  Alertas críticos no browser
                </p>
              </div>
            </div>
            <Switch
              checked={value.pushNotifications}
              aria-label="Push Notifications"
              onCheckedChange={checked => update({ pushNotifications: checked })}
            />
          </div>

          {syncStatus === 'offline' && (
            <p className="text-[10px] text-muted-foreground">
              Sem conexão com o servidor: as alterações ficam salvas neste dispositivo.
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" size="sm" className="text-xs" onClick={handleReset}>
            Resetar
          </Button>
          <Button size="sm" className="text-xs font-bold" onClick={handleSave}>
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
