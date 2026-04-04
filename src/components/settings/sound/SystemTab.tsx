import { ListTodo, DollarSign, RefreshCw, Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { SystemSoundType } from "@/hooks/useSystemSoundSettings";
import { VolumeControl } from "./VolumeControl";
import { SystemSoundRow } from "./SystemSoundRow";

interface SystemPreference {
  sound: SystemSoundType;
  enabled: boolean;
}

interface SystemTabProps {
  preferences: {
    newTask: SystemPreference;
    newSale: SystemPreference;
    dealUpdate: SystemPreference;
    ready: { enabled: boolean };
  };
  updatePreference: (key: string, patch: Partial<SystemPreference>) => void;
  volume: number;
  setVolume: (v: number) => void;
  previewSound: (s: SystemSoundType) => void;
  soundOptions: { id: string; label: string; description: string }[];
}

export function SystemTab({ preferences, updatePreference, volume, setVolume, previewSound, soundOptions }: SystemTabProps) {
  return (
    <div className="space-y-6">
      <VolumeControl label="Volume Geral" volume={volume} onVolumeChange={setVolume} />
      <div className="space-y-4">
        <Label className="text-sm font-medium">Notificações</Label>
        <SystemSoundRow
          icon={ListTodo} iconColor="text-blue-500" iconBg="bg-blue-500/10"
          label="Nova Tarefa" description="Toca quando uma nova tarefa é criada"
          sound={preferences.newTask.sound} enabled={preferences.newTask.enabled} volume={volume}
          soundOptions={soundOptions}
          onSoundChange={(s) => updatePreference('newTask', { sound: s })}
          onEnabledChange={(e) => updatePreference('newTask', { enabled: e })}
          onPreview={previewSound}
        />
        <SystemSoundRow
          icon={DollarSign} iconColor="text-emerald-500" iconBg="bg-emerald-500/10"
          label="Nova Venda" description="Toca quando uma nova venda é registrada"
          sound={preferences.newSale.sound} enabled={preferences.newSale.enabled} volume={volume}
          soundOptions={soundOptions}
          onSoundChange={(s) => updatePreference('newSale', { sound: s })}
          onEnabledChange={(e) => updatePreference('newSale', { enabled: e })}
          onPreview={previewSound}
        />
        <SystemSoundRow
          icon={RefreshCw} iconColor="text-amber-500" iconBg="bg-amber-500/10"
          label="Atualização de Deal" description="Toca quando um deal muda de estágio"
          sound={preferences.dealUpdate.sound} enabled={preferences.dealUpdate.enabled} volume={volume}
          soundOptions={soundOptions}
          onSoundChange={(s) => updatePreference('dealUpdate', { sound: s })}
          onEnabledChange={(e) => updatePreference('dealUpdate', { enabled: e })}
          onPreview={previewSound}
        />
        <div className="flex items-center justify-between p-4 rounded-lg border border-border/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Check className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Som de "Pronto"</Label>
              <p className="text-xs text-muted-foreground">Toca quando o confetti estiver carregado</p>
            </div>
          </div>
          <Switch
            checked={preferences.ready.enabled}
            onCheckedChange={(checked) => updatePreference('ready', { enabled: checked })}
          />
        </div>
      </div>
    </div>
  );
}
