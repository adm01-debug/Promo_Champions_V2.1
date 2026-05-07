import { Volume2, PartyPopper, TrendingDown, ShieldAlert, Bell } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSoundSettings, SoundType } from "@/hooks/useSoundSettings";
import { useSecurityAlertSoundSettings, SecurityAlertSoundType } from "@/hooks/useSecurityAlertSoundSettings";
import { useSDRAlertSoundSettings, SDRAlertSoundType } from "@/hooks/useSDRAlertSoundSettings";
import { useSystemSoundSettings } from "@/hooks/useSystemSoundSettings";
import { CelebrationTab } from "./sound/CelebrationTab";
import { VolumeControl } from "./sound/VolumeControl";
import { SoundRadioGroup } from "./sound/SoundRadioGroup";
import { SystemTab } from "./sound/SystemTab";

export function SoundSettingsTabs() {
  const { selectedSound, setSelectedSound, volume, setVolume, previewSound, playSound } = useSoundSettings();
  const { selectedSound: securitySound, setSelectedSound: setSecuritySound, volume: securityVolume, setVolume: setSecurityVolume, previewSound: previewSecuritySound, soundOptions: securitySoundOptions } = useSecurityAlertSoundSettings();
  const { selectedSound: sdrSound, setSelectedSound: setSDRSound, volume: sdrVolume, setVolume: setSDRVolume, previewSound: previewSDRSound, soundOptions: sdrSoundOptions } = useSDRAlertSoundSettings();
  const { preferences: systemPreferences, updatePreference: updateSystemPreference, volume: systemVolume, setVolume: setSystemVolume, previewSound: previewSystemSound, playReadySound, soundOptions: systemSoundOptions } = useSystemSoundSettings();

  return (
    <div className="bg-gradient-to-br from-card/80 to-card/40 border border-border/20 shadow-2xl backdrop-blur-md rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-border/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Volume2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-black text-lg uppercase tracking-tighter italic">Acoustic Telemetry</h3>
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">
              Configure operational audio feedback and tactical alerts
            </p>
          </div>
        </div>
      </div>
      <div className="p-6">

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

          <TabsContent value="celebration" className="mt-0">
            <CelebrationTab
              selectedSound={selectedSound}
              setSelectedSound={setSelectedSound}
              volume={volume}
              setVolume={setVolume}
              previewSound={previewSound}
              playSound={playSound}
              playReadySound={playReadySound}
            />
          </TabsContent>

          <TabsContent value="sdr" className="space-y-6 mt-0">
            <div className="p-3 rounded-lg bg-accent/30 border border-border/40">
              <p className="text-sm text-muted-foreground">
                <TrendingDown className="h-4 w-4 inline mr-2 text-rank-gold" />
                Sons para alertas de SDRs abaixo da meta por dias consecutivos
              </p>
            </div>
            <VolumeControl volume={sdrVolume} onVolumeChange={setSDRVolume} />
            <SoundRadioGroup
              value={sdrSound}
              onValueChange={(v) => setSDRSound(v as SDRAlertSoundType)}
              options={sdrSoundOptions}
              onPreview={(id) => previewSDRSound(id as SDRAlertSoundType)}
              disabled={sdrVolume === 0}
              idPrefix="sdr-"
            />
          </TabsContent>

          <TabsContent value="security" className="space-y-6 mt-0">
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-muted-foreground">
                <ShieldAlert className="h-4 w-4 inline mr-2 text-destructive" />
                Sons para alertas de segurança e tentativas de acesso negado
              </p>
            </div>
            <VolumeControl volume={securityVolume} onVolumeChange={setSecurityVolume} />
            <SoundRadioGroup
              value={securitySound}
              onValueChange={(v) => setSecuritySound(v as SecurityAlertSoundType)}
              options={securitySoundOptions}
              onPreview={(id) => previewSecuritySound(id as SecurityAlertSoundType)}
              disabled={securityVolume === 0}
              idPrefix="security-"
            />
          </TabsContent>

          <TabsContent value="system" className="mt-0">
            <SystemTab
              preferences={systemPreferences}
              updatePreference={(key: string, patch) => updateSystemPreference(key as 'newTask' | 'newSale' | 'dealUpdate' | 'ready', patch)}
              volume={systemVolume}
              setVolume={setSystemVolume}
              previewSound={previewSystemSound}
              soundOptions={systemSoundOptions}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>

  );
}
