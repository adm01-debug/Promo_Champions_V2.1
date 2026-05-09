import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const ActivityHeatmap: React.FC = () => {
  // Mock data for the heatmap (28 days)
  const days = Array.from({ length: 28 }, (_, i) => ({
    day: i + 1,
    intensity: Math.floor(Math.random() * 5), // 0 to 4
    date: new Date(2024, 4, i + 1).toLocaleDateString('pt-BR')
  }));

  const getIntensityColor = (intensity: number) => {
    switch (intensity) {
      case 0: return "bg-muted/20 border-border/10";
      case 1: return "bg-primary/20 border-primary/10";
      case 2: return "bg-primary/40 border-primary/20";
      case 3: return "bg-primary/70 border-primary/30 shadow-sm shadow-primary/10";
      case 4: return "bg-primary border-primary shadow-glow-primary/20 scale-105 z-10 animate-pulse";
      default: return "bg-muted/20";
    }
  };

  return (
    <Card variant="glass" className="overflow-hidden border-border/40 bg-background/40 backdrop-blur-xl">
      <CardHeader className="pb-3 border-b border-border/10">
        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Consistência na Arena
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3 w-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="glass-morphism border-primary/20 p-2 text-[10px] font-bold">
                Volume diário de atividades entregues
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-7 gap-1.5 justify-items-center">
            {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, i) => (
              <span key={i} className="text-[9px] font-black text-muted-foreground/60 mb-1">{d}</span>
            ))}
            {days.map((day) => (
              <TooltipProvider key={day.day}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className={cn(
                        "w-full aspect-square max-w-[28px] rounded-sm border transition-all duration-500 hover:scale-125 cursor-pointer",
                        getIntensityColor(day.intensity)
                      )}
                    />
                  </TooltipTrigger>
                  <TooltipContent className="glass border-primary/20 p-2">
                    <p className="text-[10px] font-black uppercase">{day.date}</p>
                    <p className="text-[9px] text-muted-foreground font-bold">Nível de Atividade: {day.intensity}/4</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
          
          <div className="flex items-center justify-between mt-2 pt-4 border-t border-border/10">
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Frio</span>
              <div className="flex gap-1">
                <div className="w-2.5 h-2.5 rounded-sm bg-muted/20 border border-border/10" />
                <div className="w-2.5 h-2.5 rounded-sm bg-primary/20 border border-primary/10" />
                <div className="w-2.5 h-2.5 rounded-sm bg-primary/50 border border-primary/20" />
                <div className="w-2.5 h-2.5 rounded-sm bg-primary border border-primary" />
              </div>
              <span className="text-[8px] font-black text-primary uppercase tracking-widest">Fogo</span>
            </div>
            <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic">
              Recorde: 12 dias
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};