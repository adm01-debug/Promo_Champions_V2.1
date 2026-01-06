import { Focus, EyeOff, Bell, Gamepad2, Lightbulb, Timer } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useFocusMode } from "@/hooks/useFocusMode";

export function FocusModeSettings() {
  const { config, updateConfig } = useFocusMode();

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Focus className="h-5 w-5 text-primary" />
          Modo Foco
        </CardTitle>
        <CardDescription>
          Configure o ambiente ideal para trabalho concentrado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hide Sidebar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-0.5">
              <Label htmlFor="hide-sidebar" className="text-sm">
                Ocultar Sidebar
              </Label>
              <p className="text-xs text-muted-foreground">
                Remove a navegação lateral durante o foco
              </p>
            </div>
          </div>
          <Switch
            id="hide-sidebar"
            checked={config.hideSidebar}
            onCheckedChange={(checked) => updateConfig({ hideSidebar: checked })}
          />
        </div>

        {/* Hide Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Bell className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-0.5">
              <Label htmlFor="hide-notifications" className="text-sm">
                Silenciar Notificações
              </Label>
              <p className="text-xs text-muted-foreground">
                Pausa notificações e alertas
              </p>
            </div>
          </div>
          <Switch
            id="hide-notifications"
            checked={config.hideNotifications}
            onCheckedChange={(checked) => updateConfig({ hideNotifications: checked })}
          />
        </div>

        {/* Hide Gamification */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Gamepad2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-0.5">
              <Label htmlFor="hide-gamification" className="text-sm">
                Ocultar Gamificação
              </Label>
              <p className="text-xs text-muted-foreground">
                Esconde XP, níveis e conquistas
              </p>
            </div>
          </div>
          <Switch
            id="hide-gamification"
            checked={config.hideGamification}
            onCheckedChange={(checked) => updateConfig({ hideGamification: checked })}
          />
        </div>

        {/* Dim Inactive */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-0.5">
              <Label htmlFor="dim-inactive" className="text-sm">
                Escurecer Elementos Inativos
              </Label>
              <p className="text-xs text-muted-foreground">
                Destaca apenas o conteúdo principal
              </p>
            </div>
          </div>
          <Switch
            id="dim-inactive"
            checked={config.dimInactiveElements}
            onCheckedChange={(checked) => updateConfig({ dimInactiveElements: checked })}
          />
        </div>

        {/* Break Reminder */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Timer className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-0.5">
                <Label htmlFor="break-reminder" className="text-sm">
                  Lembrete de Pausa
                </Label>
                <p className="text-xs text-muted-foreground">
                  Notifica após período contínuo de foco
                </p>
              </div>
            </div>
            <Switch
              id="break-reminder"
              checked={config.autoBreakReminder}
              onCheckedChange={(checked) => updateConfig({ autoBreakReminder: checked })}
            />
          </div>

          {config.autoBreakReminder && (
            <div className="space-y-3 pl-12">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">
                  Intervalo
                </Label>
                <span className="text-sm font-medium">
                  {config.breakIntervalMinutes} min
                </span>
              </div>
              <Slider
                value={[config.breakIntervalMinutes]}
                onValueChange={([value]) => updateConfig({ breakIntervalMinutes: value })}
                min={15}
                max={60}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>15 min</span>
                <span>25 min (Pomodoro)</span>
                <span>60 min</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
