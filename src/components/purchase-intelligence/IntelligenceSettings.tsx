import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Settings2, Bell, Zap, BrainCircuit } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const IntelligenceSettings = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-primary/5 border-primary/20 hover:bg-primary/10">
          <Settings2 className="h-4 w-4" /> Configurar IA
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-black/90 border-white/10 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <BrainCircuit className="h-5 w-5" /> Parâmetros de Inteligência
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Ajuste os limiares de detecção e a frequência dos alertas preditivos.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex flex-col gap-1">
                <span>Sensibilidade de Churn</span>
                <span className="text-[10px] text-muted-foreground font-normal">Disparar alerta acima de:</span>
              </Label>
              <span className="text-xs font-mono font-bold text-primary">75%</span>
            </div>
            <Slider defaultValue={[75]} max={100} step={1} className="py-2" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex flex-col gap-1">
                <span>Limiar de Upsell</span>
                <span className="text-[10px] text-muted-foreground font-normal">Confiança mínima para sugerir:</span>
              </Label>
              <span className="text-xs font-mono font-bold text-primary">85%</span>
            </div>
            <Slider defaultValue={[85]} max={100} step={1} className="py-2" />
          </div>

          <div className="space-y-4">
            <Label className="flex flex-col gap-1">
              <span>Frequência de Notificações</span>
              <span className="text-[10px] text-muted-foreground font-normal">Intervalo de varredura:</span>
            </Label>
            <Select defaultValue="realtime">
              <SelectTrigger className="bg-white/5 border-white/10 h-8 text-xs">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent className="bg-black/95 border-white/10">
                <SelectItem value="realtime">Tempo Real (High Load)</SelectItem>
                <SelectItem value="hourly">A cada 1 hora</SelectItem>
                <SelectItem value="daily">Diário (Resumo)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20 text-primary">
                <Bell className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold">Push Notifications</p>
                <p className="text-[10px] text-muted-foreground">Alertas críticos no browser</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" size="sm" className="text-xs">Resetar</Button>
          <Button size="sm" className="text-xs font-bold">Salvar Alterações</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
