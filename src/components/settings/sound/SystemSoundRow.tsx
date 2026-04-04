import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SystemSoundType } from "@/hooks/useSystemSoundSettings";
import { LucideIcon } from "lucide-react";

interface SystemSoundRowProps {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  label: string;
  description: string;
  sound: SystemSoundType;
  enabled: boolean;
  volume: number;
  soundOptions: { id: string; label: string }[];
  onSoundChange: (sound: SystemSoundType) => void;
  onEnabledChange: (enabled: boolean) => void;
  onPreview: (sound: SystemSoundType) => void;
  showSoundSelect?: boolean;
}

export function SystemSoundRow({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  description,
  sound,
  enabled,
  volume,
  soundOptions,
  onSoundChange,
  onEnabledChange,
  onPreview,
  showSoundSelect = true,
}: SystemSoundRowProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-border/40">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${iconBg}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <div className="space-y-0.5">
          <Label className="text-sm font-medium">{label}</Label>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {showSoundSelect && (
          <>
            <Select
              value={sound}
              onValueChange={(v) => onSoundChange(v as SystemSoundType)}
              disabled={!enabled}
            >
              <SelectTrigger className="w-28 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {soundOptions.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon" aria-label="Reproduzir"
              className="h-8 w-8"
              onClick={() => onPreview(sound)}
              disabled={!enabled || sound === 'none' || volume === 0}
            >
              <Play className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
        <Switch checked={enabled} onCheckedChange={onEnabledChange} />
      </div>
    </div>
  );
}
