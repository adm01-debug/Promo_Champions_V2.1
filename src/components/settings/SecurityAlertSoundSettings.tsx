import { Play, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useSecurityAlertSoundSettings, SecurityAlertSoundType } from "@/hooks/useSecurityAlertSoundSettings";

export function SecurityAlertSoundSettings() {
  const { selectedSound, setSelectedSound, previewSound, soundOptions } = useSecurityAlertSoundSettings();

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
              Escolha o som para notificações de alertas de segurança
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
                  size="icon"
                  onClick={() => previewSound(option.id)}
                  className="hover-scale-sm"
                >
                  <Play className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
