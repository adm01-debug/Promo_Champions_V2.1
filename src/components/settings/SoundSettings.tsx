import { useState } from "react";
import { Volume2, VolumeX, Play, PartyPopper, Sparkles, Crown, Trophy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useSoundSettings, SoundType, soundOptions } from "@/hooks/useSoundSettings";
import { toast } from "sonner";

export function SoundSettings() {
  const { selectedSound, setSelectedSound, volume, setVolume, previewSound, playSound } = useSoundSettings();
  const [activeCelebration, setActiveCelebration] = useState<'meta' | 'levelup' | 'record' | null>(null);

  const handleTestCelebration = async () => {
    if (activeCelebration) return;
    setActiveCelebration('meta');
    
    const confetti = (await import('canvas-confetti')).default;
    
    playSound();
    
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

    setTimeout(() => setActiveCelebration(null), 2000);
  };

  const handleTestLevelUp = async () => {
    if (activeCelebration) return;
    setActiveCelebration('levelup');
    
    const confetti = (await import('canvas-confetti')).default;
    
    playSound();
    setTimeout(() => playSound(), 300);
    
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const colors = ['#FFD700', '#FFA500', '#FF6347', '#9400D3', '#00CED1'];

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
        zIndex: 9999,
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
        zIndex: 9999,
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: colors,
        zIndex: 9999,
        scalar: 1.5,
      });
    }, 500);

    toast.success("🎖️ Level Up de teste!", {
      description: "Celebração especial com confetti dourado!",
    });

    setTimeout(() => setActiveCelebration(null), 3500);
  };

  const handleTestStreakRecord = async () => {
    if (activeCelebration) return;
    setActiveCelebration('record');
    
    const confetti = (await import('canvas-confetti')).default;
    
    playSound();
    
    const colors = ['#FFD700', '#FFEC8B', '#FFC125', '#DAA520', '#F0E68C'];
    
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { x: 0.3, y: 0.6 },
      colors: colors,
      zIndex: 9999,
    });

    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { x: 0.7, y: 0.6 },
        colors: colors,
        zIndex: 9999,
      });
    }, 200);

    setTimeout(() => {
      playSound();
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { x: 0.5, y: 0.5 },
        colors: colors,
        zIndex: 9999,
        scalar: 1.3,
      });
    }, 400);

    toast.success("🏆 Novo Recorde Pessoal!", {
      description: "Celebração de recorde de sequência!",
    });

    setTimeout(() => setActiveCelebration(null), 2500);
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

        {/* Test Celebration Buttons */}
        <div className="pt-4 border-t border-border/40 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={handleTestCelebration}
              variant="outline"
              size="sm"
              className={`gap-1.5 transition-all ${activeCelebration === 'meta' ? 'animate-pulse ring-2 ring-primary' : ''}`}
              disabled={(selectedSound === 'none' && volume === 0) || (activeCelebration !== null && activeCelebration !== 'meta')}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Meta
            </Button>
            <Button
              onClick={handleTestLevelUp}
              size="sm"
              className={`gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white transition-all ${activeCelebration === 'levelup' ? 'animate-pulse ring-2 ring-amber-400' : ''}`}
              disabled={(selectedSound === 'none' && volume === 0) || (activeCelebration !== null && activeCelebration !== 'levelup')}
            >
              <Crown className="h-3.5 w-3.5" />
              Level Up
            </Button>
            <Button
              onClick={handleTestStreakRecord}
              size="sm"
              className={`gap-1.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white transition-all ${activeCelebration === 'record' ? 'animate-pulse ring-2 ring-yellow-400' : ''}`}
              disabled={(selectedSound === 'none' && volume === 0) || (activeCelebration !== null && activeCelebration !== 'record')}
            >
              <Trophy className="h-3.5 w-3.5" />
              Recorde
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Teste os diferentes tipos de celebração
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
