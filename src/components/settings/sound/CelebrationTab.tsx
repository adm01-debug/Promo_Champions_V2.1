import { useState, useEffect, useRef } from "react";
import { Sparkles, Crown, Trophy, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SoundType, soundOptions } from "@/hooks/useSoundSettings";
import { toast } from "sonner";
import { VolumeControl } from "./VolumeControl";
import { SoundRadioGroup } from "./SoundRadioGroup";

type ConfettiFunction = ((options?: Record<string, unknown>) => Promise<unknown> | null) | null;

interface CelebrationTabProps {
  selectedSound: SoundType;
  setSelectedSound: (s: SoundType) => void;
  volume: number;
  setVolume: (v: number) => void;
  previewSound: (id: SoundType) => void;
  playSound: () => void;
  playReadySound: () => void;
}

export function CelebrationTab({ selectedSound, setSelectedSound, volume, setVolume, previewSound, playSound, playReadySound }: CelebrationTabProps) {
  const [activeCelebration, setActiveCelebration] = useState<'meta' | 'levelup' | 'record' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfettiReady, setIsConfettiReady] = useState(false);
  const confettiRef = useRef<ConfettiFunction>(null);

  useEffect(() => {
    import('canvas-confetti').then((module) => {
      confettiRef.current = module.default;
      setIsConfettiReady(true);
      playReadySound();
    });
  }, [playReadySound]);

  const getConfetti = async () => {
    if (confettiRef.current) return confettiRef.current;
    setIsLoading(true);
    const mod = await import('canvas-confetti');
    confettiRef.current = mod.default;
    setIsLoading(false);
    return mod.default;
  };

  const handleTestCelebration = async () => {
    if (activeCelebration || isLoading) return;
    setActiveCelebration('meta');
    const confetti = await getConfetti();
    playSound();
    const defaults = { origin: { y: 0.7 }, zIndex: 9999 };
    confetti?.({ ...defaults, particleCount: 50, spread: 26, startVelocity: 55, origin: { x: 0.2, y: 0.7 } });
    confetti?.({ ...defaults, particleCount: 70, spread: 100, decay: 0.91, scalar: 0.8, origin: { x: 0.8, y: 0.7 } });
    confetti?.({ ...defaults, particleCount: 80, spread: 120, startVelocity: 45, origin: { x: 0.5, y: 0.7 } });
    toast.success("🎉 Celebração de teste!", { description: "Som e confetti disparados com sucesso!" });
    setTimeout(() => setActiveCelebration(null), 2000);
  };

  const handleTestLevelUp = async () => {
    if (activeCelebration || isLoading) return;
    setActiveCelebration('levelup');
    const confetti = await getConfetti();
    playSound();
    setTimeout(() => playSound(), 300);
    const colors = ['#FFD700', '#FFA500', '#FF6347', '#9400D3', '#00CED1'];
    const animationEnd = Date.now() + 3000;
    const frame = () => {
      confetti?.({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors, zIndex: 9999 });
      confetti?.({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors, zIndex: 9999 });
      if (Date.now() < animationEnd) requestAnimationFrame(frame);
    };
    frame();
    setTimeout(() => confetti?.({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors, zIndex: 9999, scalar: 1.5 }), 500);
    toast.success("🎖️ Level Up de teste!", { description: "Celebração especial com confetti dourado!" });
    setTimeout(() => setActiveCelebration(null), 3500);
  };

  const handleTestStreakRecord = async () => {
    if (activeCelebration || isLoading) return;
    setActiveCelebration('record');
    const confetti = await getConfetti();
    playSound();
    const colors = ['#FFD700', '#FFEC8B', '#FFC125', '#DAA520', '#F0E68C'];
    confetti?.({ particleCount: 80, spread: 70, origin: { x: 0.3, y: 0.6 }, colors, zIndex: 9999 });
    setTimeout(() => confetti?.({ particleCount: 80, spread: 70, origin: { x: 0.7, y: 0.6 }, colors, zIndex: 9999 }), 200);
    setTimeout(() => { playSound(); confetti?.({ particleCount: 120, spread: 100, origin: { x: 0.5, y: 0.5 }, colors, zIndex: 9999, scalar: 1.3 }); }, 400);
    toast.success("🏆 Novo Recorde Pessoal!", { description: "Celebração de recorde de sequência!" });
    setTimeout(() => setActiveCelebration(null), 2500);
  };

  const isDisabled = selectedSound === 'none' && volume === 0;

  return (
    <div className="space-y-6">
      <VolumeControl volume={volume} onVolumeChange={setVolume} />
      <SoundRadioGroup
        value={selectedSound}
        onValueChange={(v) => setSelectedSound(v as SoundType)}
        options={soundOptions}
        onPreview={(id) => previewSound(id as SoundType)}
        disabled={volume === 0}
      />

      <div className="pt-4 border-t border-border/40 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <Button onClick={handleTestCelebration} variant="outline" size="sm"
            className={`gap-1.5 transition-all ${activeCelebration === 'meta' ? 'animate-pulse ring-2 ring-primary' : ''}`}
            disabled={isDisabled || (activeCelebration !== null && activeCelebration !== 'meta') || isLoading}>
            {isLoading && activeCelebration === 'meta' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            Meta
          </Button>
          <Button onClick={handleTestLevelUp} size="sm"
            className={`gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-primary-foreground transition-all ${activeCelebration === 'levelup' ? 'animate-pulse ring-2 ring-amber-400' : ''}`}
            disabled={isDisabled || (activeCelebration !== null && activeCelebration !== 'levelup') || isLoading}>
            {isLoading && activeCelebration === 'levelup' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Crown className="h-3.5 w-3.5" />}
            Level Up
          </Button>
          <Button onClick={handleTestStreakRecord} size="sm"
            className={`gap-1.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-primary-foreground transition-all ${activeCelebration === 'record' ? 'animate-pulse ring-2 ring-yellow-400' : ''}`}
            disabled={isDisabled || (activeCelebration !== null && activeCelebration !== 'record') || isLoading}>
            {isLoading && activeCelebration === 'record' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trophy className="h-3.5 w-3.5" />}
            Recorde
          </Button>
        </div>
        <div className="flex items-center justify-center gap-2">
          {isConfettiReady ? (
            <span className="flex items-center gap-1 text-xs text-success dark:text-success animate-fade-in">
              <Check className="h-3 w-3 animate-scale-in" /> Pronto
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Carregando...
            </span>
          )}
          <span className={`text-xs text-muted-foreground transition-opacity duration-300 ${isConfettiReady ? 'opacity-100' : 'opacity-50'}`}>•</span>
          <span className="text-xs text-muted-foreground">Teste os diferentes tipos de celebração</span>
        </div>
      </div>
    </div>
  );
}
