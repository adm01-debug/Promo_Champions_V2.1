import { Play, ShieldAlert, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useSecurityAlertSoundSettings, SecurityAlertSoundType } from "@/hooks/useSecurityAlertSoundSettings";

export function SecurityAlertSoundSettings() {
  const { selectedSound, setSelectedSound, volume, setVolume, previewSound, soundOptions } = useSecurityAlertSoundSettings();

  return (
    <Card className="card-elevated">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-destructive/10">
            <ShieldAlert className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <CardTitle className="font-display">Som de Alerta de Segurança</CardTitle>
            <CardDescription>
              Escolha o som e volume para notificações de alertas de segurança
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Volume Control */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Volume</Label>
          <div className="flex items-center gap-4">
            <VolumeX className="h-4 w-4 text-muted-foreground" />
            <Slider
              value={[volume * 100]}
              onValueChange={([value]) => setVolume(value / 100)}
              max={100}
              step={5}
              className="flex-1"
            />
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground w-12 text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>

        {/* Sound Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Tipo de Som</Label>
          <RadioGroup
            value={selectedSound}
            onValueChange={(value) => setSelectedSound(value as SecurityAlertSoundType)}
            className="space-y-3"
          >
            {soundOptions.map((option) => (
              <div
                key={option.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value={option.id} id={`security-${option.id}`} />
                  <Label htmlFor={`security-${option.id}`} className="cursor-pointer">
                    <span className="font-medium">{option.label}</span>
                    <span className="block text-sm text-muted-foreground">
                      {option.description}
                    </span>
                  </Label>
                </div>
                {option.id !== 'none' && (
                  <Button
                    variant="ghost"
                    size="icon" aria-label="Reproduzir"
                    onClick={() => previewSound(option.id)}
                    className="hover-scale-sm"
                    disabled={volume === 0}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
