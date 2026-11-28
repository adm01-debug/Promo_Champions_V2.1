import {
  Clock,
  Zap,
  ShieldAlert,
  Trophy,
  Flame,
  ListChecks,
  Loader2,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePushPreferences, type PushCategory } from '@/hooks/usePushPreferences';

const CATEGORY_META: Record<
  PushCategory,
  { label: string; description: string; icon: typeof Zap; managerOnly?: boolean }
> = {
  sdr_alerts: {
    label: 'SDR abaixo da meta',
    description: 'Quando um SDR fica abaixo do ritmo esperado',
    icon: Zap,
    managerOnly: true,
  },
  security: {
    label: 'Segurança',
    description: 'Picos de acessos negados e alertas críticos',
    icon: ShieldAlert,
    managerOnly: true,
  },
  milestones: {
    label: 'Celebrações de meta',
    description: 'Meta batida, XP ganho e conquistas',
    icon: Trophy,
  },
  streaks: {
    label: 'Recordes de streak',
    description: 'Sequência pessoal de vendas em risco ou batida',
    icon: Flame,
  },
  urgent_tasks: {
    label: 'Tarefas urgentes',
    description: 'Tarefas vencendo ou já atrasadas',
    icon: ListChecks,
  },
};

export function PushPreferencesCard() {
  const { preferences, toggleCategory, update, reset, syncStatus } = usePushPreferences();
  const isLoading = syncStatus === 'loading';

  return (
    <Card className="glass">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-section-title">Preferências de push</CardTitle>
            <CardDescription>
              Escolha quais alertas chegam como notificação e em que horário
            </CardDescription>
          </div>
          {isLoading ? (
            <Badge className="bg-muted/50 text-muted-foreground border-border">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Carregando
            </Badge>
          ) : syncStatus === 'error' || syncStatus === 'offline' ? (
            <Badge className="bg-warning/20 text-warning border-warning/30">
              Só neste aparelho
            </Badge>
          ) : (
            <Badge className="bg-status-success/20 text-status-success border-status-success/30">
              Sincronizado
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-1">
          <p className="text-sm font-medium">Categorias</p>
          <p className="text-xs text-muted-foreground">
            Desligar uma categoria silencia apenas o push — a notificação continua no sino
            do app.
          </p>
        </div>

        <div className="space-y-3">
          {(Object.keys(CATEGORY_META) as PushCategory[]).map(category => {
            const meta = CATEGORY_META[category];
            const Icon = meta.icon;
            const id = `push-cat-${category}`;
            return (
              <div
                key={category}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div className="flex items-start gap-3">
                  <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <Label htmlFor={id} className="cursor-pointer">
                      {meta.label}
                      {meta.managerOnly && (
                        <span className="ml-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                          gestor
                        </span>
                      )}
                    </Label>
                    <p className="text-xs text-muted-foreground">{meta.description}</p>
                  </div>
                </div>
                <Switch
                  id={id}
                  checked={preferences.categories[category]}
                  onCheckedChange={checked => toggleCategory(category, checked)}
                  disabled={isLoading}
                  aria-label={`Notificação push: ${meta.label}`}
                />
              </div>
            );
          })}
        </div>

        <div className="space-y-3 rounded-lg border border-border p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <Label htmlFor="push-quiet-hours" className="cursor-pointer">
                  Horário de silêncio
                </Label>
                <p className="text-xs text-muted-foreground">
                  Nenhum push é enviado nesta janela
                </p>
              </div>
            </div>
            <Switch
              id="push-quiet-hours"
              checked={preferences.quietHoursEnabled}
              onCheckedChange={checked => update({ quietHoursEnabled: checked })}
              disabled={isLoading}
              aria-label="Ativar horário de silêncio"
            />
          </div>

          {preferences.quietHoursEnabled && (
            <div className="flex items-end gap-3 pl-7">
              <div className="flex-1">
                <Label
                  htmlFor="push-quiet-start"
                  className="text-xs text-muted-foreground"
                >
                  Das
                </Label>
                <Input
                  id="push-quiet-start"
                  type="time"
                  value={preferences.quietHoursStart}
                  onChange={event => update({ quietHoursStart: event.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="push-quiet-end" className="text-xs text-muted-foreground">
                  Até
                </Label>
                <Input
                  id="push-quiet-end"
                  type="time"
                  value={preferences.quietHoursEnd}
                  onChange={event => update({ quietHoursEnd: event.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={reset}
          disabled={isLoading}
          className="text-muted-foreground"
        >
          Restaurar padrão
        </Button>
      </CardContent>
    </Card>
  );
}
