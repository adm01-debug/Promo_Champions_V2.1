import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Play, PartyPopper, Sparkles, Crown, Trophy, Loader2, Check, ShieldAlert, Bell, ListTodo, DollarSign, RefreshCw, TrendingDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSoundSettings, SoundType, soundOptions } from "@/hooks/useSoundSettings";
import { useSecurityAlertSoundSettings, SecurityAlertSoundType } from "@/hooks/useSecurityAlertSoundSettings";
import { useSDRAlertSoundSettings, SDRAlertSoundType } from "@/hooks/useSDRAlertSoundSettings";
import { useSystemSoundSettings, SystemSoundType } from "@/hooks/useSystemSoundSettings";
import { toast } from "sonner";

// Preload confetti module
type ConfettiFunction = ((options?: Record<string, unknown>) => Promise<unknown> | null) | null;

export function SoundSettingsTabs() {
  // Celebration sound settings
  const { selectedSound, setSelectedSound, volume, setVolume, previewSound, playSound } = useSoundSettings();
  const [activeCelebration, setActiveCelebration] = useState<'meta' | 'levelup' | 'record' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfettiReady, setIsConfettiReady] = useState(false);
  const confettiRef = useRef<ConfettiFunction | null>(null);

  // Security alert sound settings
  const { 
    selectedSound: securitySound, 
    setSelectedSound: setSecuritySound, 
    volume: securityVolume, 
    setVolume: setSecurityVolume, 
    previewSound: previewSecuritySound, 
    soundOptions: securitySoundOptions 
  } = useSecurityAlertSoundSettings();

  // SDR alert sound settings
  const { 
    selectedSound: sdrSound, 
    setSelectedSound: setSDRSound, 
    volume: sdrVolume, 
    setVolume: setSDRVolume, 
    previewSound: previewSDRSound, 
    soundOptions: sdrSoundOptions 
  } = useSDRAlertSoundSettings();

  // System sound settings
  const {
    preferences: systemPreferences,
    updatePreference: updateSystemPreference,
    volume: systemVolume,
    setVolume: setSystemVolume,
    previewSound: previewSystemSound,
    playReadySound,
    soundOptions: systemSoundOptions
  } = useSystemSoundSettings();

  // Preload confetti on mount
  useEffect(() => {
    import('canvas-confetti').then((module) => {
      confettiRef.current = module.default;
      setIsConfettiReady(true);
      playReadySound();
    });
  }, [playReadySound]);


  const handleTestCelebration = async () => {
    if (activeCelebration || isLoading) return;
    
    let confetti = confettiRef.current;
    if (!confetti) {
      setIsLoading(true);
      setActiveCelebration('meta');
      confetti = (await import('canvas-confetti')).default;
      confettiRef.current = confetti as unknown as ConfettiFunction;
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
      confettiRef.current = confetti as unknown as ConfettiFunction;
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
      confettiRef.current = confetti as unknown as ConfettiFunction;
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
            <Volume2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="font-display">Configurações de Som</CardTitle>
            <CardDescription>
              Gerencie todos os sons do sistema
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="celebration" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="celebration" className="flex items-center gap-2">
              <PartyPopper className="h-4 w-4" />
              <span className="hidden sm:inline">Celebração</span>
            </TabsTrigger>
            <TabsTrigger value="sdr" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              <span className="hidden sm:inline">SDR</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              <span className="hidden sm:inline">Segurança</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Sistema</span>
            </TabsTrigger>
          </TabsList>

          {/* Celebration Tab */}
          <TabsContent value="celebration" className="space-y-6 mt-0">
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
          </TabsContent>

          {/* SDR Alerts Tab */}
          <TabsContent value="sdr" className="space-y-6 mt-0">
            <div className="p-3 rounded-lg bg-accent/30 border border-border/40">
              <p className="text-sm text-muted-foreground">
                <TrendingDown className="h-4 w-4 inline mr-2 text-amber-500" />
                Sons para alertas de SDRs abaixo da meta por dias consecutivos
              </p>
            </div>

            {/* Volume Control */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Volume</Label>
              <div className="flex items-center gap-4">
                <VolumeX className="h-4 w-4 text-muted-foreground" />
                <Slider
                  value={[sdrVolume * 100]}
                  onValueChange={([value]) => setSDRVolume(value / 100)}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {Math.round(sdrVolume * 100)}%
                </span>
              </div>
            </div>

            {/* Sound Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Tipo de Som</Label>
              <RadioGroup
                value={sdrSound}
                onValueChange={(value) => setSDRSound(value as SDRAlertSoundType)}
                className="space-y-3"
              >
                {sdrSoundOptions.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value={option.id} id={`sdr-${option.id}`} />
                      <Label htmlFor={`sdr-${option.id}`} className="cursor-pointer">
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
                        onClick={() => previewSDRSound(option.id)}
                        className="hover-scale-sm"
                        disabled={sdrVolume === 0}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </RadioGroup>
            </div>
          </TabsContent>

          {/* Security Alerts Tab */}
          <TabsContent value="security" className="space-y-6 mt-0">
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-muted-foreground">
                <ShieldAlert className="h-4 w-4 inline mr-2 text-destructive" />
                Sons para alertas de segurança e tentativas de acesso negado
              </p>
            </div>

            {/* Volume Control */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Volume</Label>
              <div className="flex items-center gap-4">
                <VolumeX className="h-4 w-4 text-muted-foreground" />
                <Slider
                  value={[securityVolume * 100]}
                  onValueChange={([value]) => setSecurityVolume(value / 100)}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {Math.round(securityVolume * 100)}%
                </span>
              </div>
            </div>

            {/* Sound Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Tipo de Som</Label>
              <RadioGroup
                value={securitySound}
                onValueChange={(value) => setSecuritySound(value as SecurityAlertSoundType)}
                className="space-y-3"
              >
                {securitySoundOptions.map((option) => (
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
                        onClick={() => previewSecuritySound(option.id)}
                        className="hover-scale-sm"
                        disabled={securityVolume === 0}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </RadioGroup>
            </div>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6 mt-0">
            {/* Volume Control */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Volume Geral</Label>
              <div className="flex items-center gap-4">
                <VolumeX className="h-4 w-4 text-muted-foreground" />
                <Slider
                  value={[systemVolume * 100]}
                  onValueChange={([value]) => setSystemVolume(value / 100)}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {Math.round(systemVolume * 100)}%
                </span>
              </div>
            </div>

            {/* Sound Categories */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Notificações</Label>
              
              {/* New Task Sound */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-border/40">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <ListTodo className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Nova Tarefa</Label>
                    <p className="text-xs text-muted-foreground">
                      Toca quando uma nova tarefa é criada
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={systemPreferences.newTask.sound}
                    onValueChange={(value) => updateSystemPreference('newTask', { sound: value as SystemSoundType })}
                    disabled={!systemPreferences.newTask.enabled}
                  >
                    <SelectTrigger className="w-28 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {systemSoundOptions.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => previewSystemSound(systemPreferences.newTask.sound)}
                    disabled={!systemPreferences.newTask.enabled || systemPreferences.newTask.sound === 'none' || systemVolume === 0}
                  >
                    <Play className="h-3.5 w-3.5" />
                  </Button>
                  <Switch
                    checked={systemPreferences.newTask.enabled}
                    onCheckedChange={(checked) => updateSystemPreference('newTask', { enabled: checked })}
                  />
                </div>
              </div>

              {/* New Sale Sound */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-border/40">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Nova Venda</Label>
                    <p className="text-xs text-muted-foreground">
                      Toca quando uma nova venda é registrada
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={systemPreferences.newSale.sound}
                    onValueChange={(value) => updateSystemPreference('newSale', { sound: value as SystemSoundType })}
                    disabled={!systemPreferences.newSale.enabled}
                  >
                    <SelectTrigger className="w-28 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {systemSoundOptions.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => previewSystemSound(systemPreferences.newSale.sound)}
                    disabled={!systemPreferences.newSale.enabled || systemPreferences.newSale.sound === 'none' || systemVolume === 0}
                  >
                    <Play className="h-3.5 w-3.5" />
                  </Button>
                  <Switch
                    checked={systemPreferences.newSale.enabled}
                    onCheckedChange={(checked) => updateSystemPreference('newSale', { enabled: checked })}
                  />
                </div>
              </div>

              {/* Deal Update Sound */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-border/40">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <RefreshCw className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Atualização de Deal</Label>
                    <p className="text-xs text-muted-foreground">
                      Toca quando um deal muda de estágio
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={systemPreferences.dealUpdate.sound}
                    onValueChange={(value) => updateSystemPreference('dealUpdate', { sound: value as SystemSoundType })}
                    disabled={!systemPreferences.dealUpdate.enabled}
                  >
                    <SelectTrigger className="w-28 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {systemSoundOptions.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => previewSystemSound(systemPreferences.dealUpdate.sound)}
                    disabled={!systemPreferences.dealUpdate.enabled || systemPreferences.dealUpdate.sound === 'none' || systemVolume === 0}
                  >
                    <Play className="h-3.5 w-3.5" />
                  </Button>
                  <Switch
                    checked={systemPreferences.dealUpdate.enabled}
                    onCheckedChange={(checked) => updateSystemPreference('dealUpdate', { enabled: checked })}
                  />
                </div>
              </div>

              {/* Ready Sound */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-border/40">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Som de "Pronto"</Label>
                    <p className="text-xs text-muted-foreground">
                      Toca quando o confetti estiver carregado
                    </p>
                  </div>
                </div>
                <Switch
                  checked={systemPreferences.ready.enabled}
                  onCheckedChange={(checked) => updateSystemPreference('ready', { enabled: checked })}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
