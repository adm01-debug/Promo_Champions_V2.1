import { useState, useEffect } from "react";
import { Volume2, VolumeX, Play, PartyPopper, Sparkles, Crown, Trophy, Loader2, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useSoundSettings, SoundType, soundOptions } from "@/hooks/useSoundSettings";
import { useCelebrationEffects } from "@/hooks/useCelebrationEffects";
import { toast } from "sonner";

const READY_SOUND_KEY = 'celebration-ready-sound-enabled';

export function SoundSettings() {
  const { selectedSound, setSelectedSound, volume, setVolume, previewSound, playSound } = useSoundSettings();
  const { activeCelebration, isLoading, isConfettiReady, handleTestMeta, handleTestLevelUp, handleTestStreakRecord } = useCelebrationEffects(playSound);
  const [readySoundEnabled, setReadySoundEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(READY_SOUND_KEY);
      return saved !== 'false';
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem(READY_SOUND_KEY, String(readySoundEnabled));
  }, [readySoundEnabled]);

  const onTestMeta = () => {
    handleTestMeta();
    toast.success("🎉 Celebração de teste!", { description: "Som e confetti disparados com sucesso!" });
  };

  const onTestLevelUp = () => {
    handleTestLevelUp();
    toast.success("🎖️ Level Up de teste!", { description: "Celebração especial com confetti dourado!" });
  };

  const onTestStreakRecord = () => {
    handleTestStreakRecord();
    toast.success("🏆 Novo Recorde Pessoal!", { description: "Celebração de recorde de sequência!" });
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
            <CardDescription>Escolha o som e volume que toca quando um vendedor atinge 100% da meta</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Volume</Label>
          <div className="flex items-center gap-4">
            <VolumeX className="h-4 w-4 text-muted-foreground" />
            <Slider value={[volume * 100]} onValueChange={([value]) => setVolume(value / 100)} max={100} step={5} className="flex-1" />
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground w-12 text-right">{Math.round(volume * 100)}%</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border border-border/40">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">Som de "Pronto"</Label>
            <p className="text-xs text-muted-foreground">Toca um som sutil quando o confetti estiver carregado</p>
          </div>
          <Switch checked={readySoundEnabled} onCheckedChange={setReadySoundEnabled} />
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Tipo de Som</Label>
          <RadioGroup value={selectedSound} onValueChange={(value) => setSelectedSound(value as SoundType)} className="space-y-3">
            {soundOptions.map((option) => (
              <div key={option.id} className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="cursor-pointer">
                    <span className="font-medium">{option.label}</span>
                    <span className="block text-sm text-muted-foreground">{option.description}</span>
                  </Label>
                </div>
                {option.id !== 'none' && (
                  <Button variant="ghost" size="icon" onClick={(e) => { e.preventDefault(); previewSound(option.id); }} className="hover-scale-sm" disabled={volume === 0}>
                    <Play className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="pt-4 border-t border-border/40 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <Button onClick={onTestMeta} variant="outline" size="sm" className={`gap-1.5 transition-all ${activeCelebration === 'meta' ? 'animate-pulse ring-2 ring-primary' : ''}`} disabled={(selectedSound === 'none' && volume === 0) || (activeCelebration !== null && activeCelebration !== 'meta') || isLoading}>
              {isLoading && activeCelebration === 'meta' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} Meta
            </Button>
            <Button onClick={onTestLevelUp} size="sm" className={`gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-primary-foreground transition-all ${activeCelebration === 'levelup' ? 'animate-pulse ring-2 ring-amber-400' : ''}`} disabled={(selectedSound === 'none' && volume === 0) || (activeCelebration !== null && activeCelebration !== 'levelup') || isLoading}>
              {isLoading && activeCelebration === 'levelup' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Crown className="h-3.5 w-3.5" />} Level Up
            </Button>
            <Button onClick={onTestStreakRecord} size="sm" className={`gap-1.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-primary-foreground transition-all ${activeCelebration === 'record' ? 'animate-pulse ring-2 ring-yellow-400' : ''}`} disabled={(selectedSound === 'none' && volume === 0) || (activeCelebration !== null && activeCelebration !== 'record') || isLoading}>
              {isLoading && activeCelebration === 'record' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trophy className="h-3.5 w-3.5" />} Recorde
            </Button>
          </div>
          <div className="flex items-center justify-center gap-2">
            {isConfettiReady ? (
              <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 animate-fade-in"><Check className="h-3 w-3 animate-scale-in" />Pronto</span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" />Carregando...</span>
            )}
            <span className={`text-xs text-muted-foreground transition-opacity duration-300 ${isConfettiReady ? 'opacity-100' : 'opacity-50'}`}>•</span>
            <span className="text-xs text-muted-foreground">Teste os diferentes tipos de celebração</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
