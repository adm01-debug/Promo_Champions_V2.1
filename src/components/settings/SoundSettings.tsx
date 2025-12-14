import { Volume2, VolumeX, Play, PartyPopper, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useSoundSettings, SoundType, soundOptions } from "@/hooks/useSoundSettings";
import { useCelebration } from "@/hooks/useCelebration";
import { toast } from "sonner";

export function SoundSettings() {
  const { selectedSound, setSelectedSound, volume, setVolume, previewSound, playSound } = useSoundSettings();
  const { triggerLevelUpConfetti } = useCelebration();

  const handleTestCelebration = async () => {
    const confetti = (await import('canvas-confetti')).default;
    
    // Play sound
    playSound();
    
    // Trigger confetti burst
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    confetti({
      ...defaults,
      particleCount: Math.floor(count * 0.25),
      spread: 26,
      startVelocity: 55,
      origin: { x: 0.2, y: 0.7 },
    });

    confetti({
      ...defaults,
      particleCount: Math.floor(count * 0.35),
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      origin: { x: 0.8, y: 0.7 },
    });

    confetti({
      ...defaults,
      particleCount: Math.floor(count * 0.4),
      spread: 120,
      startVelocity: 45,
      origin: { x: 0.5, y: 0.7 },
    });

    toast.success("🎉 Celebração de teste!", {
      description: "Som e confetti disparados com sucesso!",
    });
  };

  return (
    <Card className="card-elevated">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <PartyPopper className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="font-display">Som de Celebração</CardTitle>
            <CardDescription>
              Escolha o som e volume que toca quando um vendedor atinge 100% da meta
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
            onValueChange={(value) => setSelectedSound(value as SoundType)}
            className="space-y-3"
          >
            {soundOptions.map((option) => (
              <div
                key={option.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="cursor-pointer">
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
                    onClick={(e) => {
                      e.preventDefault();
                      previewSound(option.id);
                    }}
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

        {/* Test Celebration Button */}
        <div className="pt-4 border-t border-border/40">
          <Button
            onClick={handleTestCelebration}
            className="w-full gap-2"
            disabled={selectedSound === 'none' && volume === 0}
          >
            <Sparkles className="h-4 w-4" />
            Testar Celebração Completa
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Dispara confetti e o som selecionado
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
