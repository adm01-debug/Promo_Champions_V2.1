import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Play, PartyPopper, Sparkles, Crown, Trophy, Loader2, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useSoundSettings, SoundType, soundOptions } from "@/hooks/useSoundSettings";
import { toast } from "sonner";

// Preload confetti module
type ConfettiFunction = typeof import('canvas-confetti').default;

const READY_SOUND_KEY = 'celebration-ready-sound-enabled';

export function SoundSettings() {
  const { selectedSound, setSelectedSound, volume, setVolume, previewSound, playSound } = useSoundSettings();
  const [activeCelebration, setActiveCelebration] = useState<'meta' | 'levelup' | 'record' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfettiReady, setIsConfettiReady] = useState(false);
  const [readySoundEnabled, setReadySoundEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(READY_SOUND_KEY);
      return saved !== 'false'; // Default to true
    }
    return true;
  });
  const confettiRef = useRef<ConfettiFunction | null>(null);

  // Save ready sound preference
  useEffect(() => {
    localStorage.setItem(READY_SOUND_KEY, String(readySoundEnabled));
  }, [readySoundEnabled]);

  // Play subtle ding sound
  const playReadyDing = () => {
    if (!readySoundEnabled) return;
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 1200;
      oscillator.type = 'sine';
      
      const now = audioContext.currentTime;
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      
      oscillator.start(now);
      oscillator.stop(now + 0.2);
    } catch (e) {
      // Silently fail if audio context not available
    }
  };

  // Preload confetti on mount
  useEffect(() => {
    import('canvas-confetti').then((module) => {
      confettiRef.current = module.default;
      setIsConfettiReady(true);
      playReadyDing();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTestCelebration = async () => {
    if (activeCelebration || isLoading) return;
    
    let confetti = confettiRef.current;
    if (!confetti) {
      setIsLoading(true);
      setActiveCelebration('meta');
      confetti = (await import('canvas-confetti')).default;
      confettiRef.current = confetti;
      setIsLoading(false);
    } else {
      setActiveCelebration('meta');
    }
    
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
    if (activeCelebration || isLoading) return;
    
    let confetti = confettiRef.current;
    if (!confetti) {
      setIsLoading(true);
      setActiveCelebration('levelup');
      confetti = (await import('canvas-confetti')).default;
      confettiRef.current = confetti;
      setIsLoading(false);
    } else {
      setActiveCelebration('levelup');
    }
    
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
    if (activeCelebration || isLoading) return;
    
    let confetti = confettiRef.current;
    if (!confetti) {
      setIsLoading(true);
      setActiveCelebration('record');
      confetti = (await import('canvas-confetti')).default;
      confettiRef.current = confetti;
      setIsLoading(false);
    } else {
      setActiveCelebration('record');
    }
    
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

        {/* Ready Sound Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-border/40">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">Som de "Pronto"</Label>
            <p className="text-xs text-muted-foreground">
              Toca um som sutil quando o confetti estiver carregado
            </p>
          </div>
          <Switch
            checked={readySoundEnabled}
            onCheckedChange={setReadySoundEnabled}
          />
        </div>

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
              disabled={(selectedSound === 'none' && volume === 0) || (activeCelebration !== null && activeCelebration !== 'meta') || isLoading}
            >
              {isLoading && activeCelebration === 'meta' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              Meta
            </Button>
            <Button
              onClick={handleTestLevelUp}
              size="sm"
              className={`gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white transition-all ${activeCelebration === 'levelup' ? 'animate-pulse ring-2 ring-amber-400' : ''}`}
              disabled={(selectedSound === 'none' && volume === 0) || (activeCelebration !== null && activeCelebration !== 'levelup') || isLoading}
            >
              {isLoading && activeCelebration === 'levelup' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Crown className="h-3.5 w-3.5" />
              )}
              Level Up
            </Button>
            <Button
              onClick={handleTestStreakRecord}
              size="sm"
              className={`gap-1.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white transition-all ${activeCelebration === 'record' ? 'animate-pulse ring-2 ring-yellow-400' : ''}`}
              disabled={(selectedSound === 'none' && volume === 0) || (activeCelebration !== null && activeCelebration !== 'record') || isLoading}
            >
              {isLoading && activeCelebration === 'record' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trophy className="h-3.5 w-3.5" />
              )}
              Recorde
            </Button>
          </div>
          <div className="flex items-center justify-center gap-2">
            {isConfettiReady ? (
              <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 animate-fade-in">
                <Check className="h-3 w-3 animate-scale-in" />
                Pronto
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Carregando...
              </span>
            )}
            <span className={`text-xs text-muted-foreground transition-opacity duration-300 ${isConfettiReady ? 'opacity-100' : 'opacity-50'}`}>•</span>
            <span className="text-xs text-muted-foreground">
              Teste os diferentes tipos de celebração
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
