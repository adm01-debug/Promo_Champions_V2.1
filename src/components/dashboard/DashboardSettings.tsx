import { Settings2, History as HistoryIcon, RefreshCw } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface DashboardSettingsProps {
  isSyncing: boolean;
  minVal: number;
  setMinVal: (v: number) => void;
  customMax: number | null;
  setCustomMax: (v: number | null) => void;
  oppThreshold: number;
  setOppThreshold: (v: number) => void;
  retThreshold: number;
  setRetThreshold: (v: number) => void;
  alertFrequency: "daily" | "weekly" | "realtime";
  setAlertFrequency: (v: "daily" | "weekly" | "realtime") => void;
  ticksCount: number;
  setTicksCount: (v: number) => void;
  gaugeMode: "standard" | "compact" | "kilo";
  setGaugeMode: (v: "standard" | "compact" | "kilo") => void;
  saveSettings: (s: any) => void;
  setIsAlertHistoryOpen: (v: boolean) => void;
}

export const DashboardSettings = memo(({
  isSyncing,
  minVal,
  setMinVal,
  customMax,
  setCustomMax,
  oppThreshold,
  setOppThreshold,
  retThreshold,
  setRetThreshold,
  alertFrequency,
  setAlertFrequency,
  ticksCount,
  setTicksCount,
  gaugeMode,
  setGaugeMode,
  saveSettings,
  setIsAlertHistoryOpen
}: DashboardSettingsProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="h-8 w-8 flex items-center justify-center rounded-lg bg-background/60 border border-border/40 hover:bg-background/80 transition-colors">
          <Settings2 className="h-3.5 w-3.5 text-primary" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-popover/95 backdrop-blur-xl border-primary/20 p-4 shadow-2xl rounded-2xl">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-primary/20 pb-2">
            <h4 className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary">HUD Configuration</h4>
            {isSyncing ? (
              <div className="flex items-center gap-1.5 text-[8px] font-mono text-primary animate-pulse">
                <RefreshCw className="h-2 w-2 animate-spin" /> SYNCING
              </div>
            ) : (
              <div className="text-[8px] font-mono text-success/70">CLOUDSYNC ACTIVE</div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono uppercase text-muted-foreground">Minimo</label>
              <Input 
                type="number" 
                value={minVal} 
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMinVal(val);
                  saveSettings({ minVal: val });
                }}
                className="h-7 text-[10px] bg-background/40 border-border/40 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono uppercase text-muted-foreground">Maximo (Manual)</label>
              <Input 
                type="number" 
                placeholder="Auto"
                value={customMax || ""} 
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : null;
                  setCustomMax(val);
                  saveSettings({ customMax: val });
                }}
                className="h-7 text-[10px] bg-background/40 border-border/40 font-mono"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-primary/10">
            <div className="flex items-center justify-between">
              <h5 className="text-[9px] font-mono font-bold uppercase text-primary/80">Thresholds & Alertas</h5>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-primary hover:text-primary hover:bg-primary/10"
                onClick={() => setIsAlertHistoryOpen(true)}
              >
                <HistoryIcon className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between text-[8px] font-mono uppercase text-muted-foreground">
                <span>Oportunidades</span>
                <span>{oppThreshold}%</span>
              </div>
              <Slider 
                value={[oppThreshold]} 
                max={100} 
                step={1} 
                onValueChange={(v) => {
                  setOppThreshold(v[0]);
                  saveSettings({ oppThreshold: v[0] });
                }}
                className="py-1"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[8px] font-mono uppercase text-muted-foreground">
                <span>Retenção</span>
                <span>{retThreshold}%</span>
              </div>
              <Slider 
                value={[retThreshold]} 
                max={100} 
                step={1} 
                onValueChange={(v) => {
                  setRetThreshold(v[0]);
                  saveSettings({ retThreshold: v[0] });
                }}
                className="py-1"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[8px] font-mono uppercase text-muted-foreground">Frequência</label>
              <Select value={alertFrequency} onValueChange={(v: any) => {
                setAlertFrequency(v);
                saveSettings({ alertFrequency: v });
              }}>
                <SelectTrigger className="h-7 text-[10px] font-mono uppercase bg-background/40 border-border/40">
                  <SelectValue placeholder="Freq" />
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-3xl border-border/40">
                  <SelectItem value="realtime" className="text-[10px] font-mono uppercase">Real-time</SelectItem>
                  <SelectItem value="daily" className="text-[10px] font-mono uppercase">Diário</SelectItem>
                  <SelectItem value="weekly" className="text-[10px] font-mono uppercase">Semanal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-primary/10">
            <h5 className="text-[9px] font-mono font-bold uppercase text-primary/80">Estética do Gauge</h5>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[8px] font-mono uppercase text-muted-foreground">
                <span>Resolução</span>
                <span>{ticksCount} ticks</span>
              </div>
              <Slider 
                value={[ticksCount]} 
                min={10}
                max={100} 
                step={1} 
                onValueChange={(val) => {
                  setTicksCount(val[0]);
                  saveSettings({ ticksCount: val[0] });
                }}
                className="py-1"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[8px] font-mono uppercase text-muted-foreground">Modo de Exibição</label>
              <Select value={gaugeMode} onValueChange={(v: any) => {
                setGaugeMode(v);
                saveSettings({ gaugeMode: v });
              }}>
                <SelectTrigger className="h-7 text-[10px] font-mono uppercase bg-background/40 border-border/40">
                  <SelectValue placeholder="Modo" />
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-3xl border-border/40">
                  <SelectItem value="standard" className="text-[10px] font-mono uppercase">Padrão (Full)</SelectItem>
                  <SelectItem value="compact" className="text-[10px] font-mono uppercase">Compacto</SelectItem>
                  <SelectItem value="kilo" className="text-[10px] font-mono uppercase">Abreviação (k)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
});

DashboardSettings.displayName = "DashboardSettings";
