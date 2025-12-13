import { Volume2, VolumeX, Play } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useSoundSettings, SoundType, soundOptions } from "@/hooks/useSoundSettings";

export function SoundSettings() {
  const { selectedSound, setSelectedSound, previewSound } = useSoundSettings();

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-primary" />
          Som de Celebração
        </CardTitle>
        <CardDescription>
          Escolha o som que toca quando um vendedor atinge 100% da meta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedSound}
          onValueChange={(value) => setSelectedSound(value as SoundType)}
          className="space-y-3"
        >
          {soundOptions.map((option) => (
            <div
              key={option.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                selectedSound === option.id
                  ? "border-primary bg-primary/10"
                  : "border-border/40 hover:border-border/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <RadioGroupItem value={option.id} id={option.id} />
                <div className="flex items-center gap-2">
                  {option.id === 'none' ? (
                    <VolumeX className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-primary" />
                  )}
                  <Label htmlFor={option.id} className="cursor-pointer">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-muted-foreground text-sm ml-2">
                      — {option.description}
                    </span>
                  </Label>
                </div>
              </div>
              {option.id !== 'none' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    previewSound(option.id);
                  }}
                  className="gap-1.5"
                >
                  <Play className="h-3 w-3" />
                  Ouvir
                </Button>
              )}
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
