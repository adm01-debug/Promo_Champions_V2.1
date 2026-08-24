import React from "react";
import { cn } from "@/lib/utils";
import { Clock, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SLACountdownProps {
  updatedAt: string;
  stage: string;
  className?: string;
}

export const SLACountdown = ({ updatedAt, stage, className }: SLACountdownProps) => {
  const getSLADuration = (s: string) => {
    switch (s) {
      case 'lead': return 2; // 2 days
      case 'qualified': return 5;
      case 'proposal': return 7;
      default: return 10;
    }
  };

  const slaDays = getSLADuration(stage);
  const diffDays = Math.floor((Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24));
  const remainingDays = slaDays - diffDays;
  const isExpired = remainingDays <= 0;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(
          "flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter border transition-all duration-300",
          isExpired 
            ? "bg-destructive/10 text-destructive border-destructive/20 animate-pulse" 
            : remainingDays <= 1 
              ? "bg-amber-500/10 text-amber-500 border-amber-500/20" 
              : "bg-muted/50 text-muted-foreground border-border/40",
          className
        )}>
          <Clock className="h-2.5 w-2.5" />
          {isExpired ? (
            <span className="flex items-center gap-1">SLA ESTOURADO <AlertCircle className="h-2 w-2" /></span>
          ) : (
            <span>SLA: {remainingDays}D restantes</span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-[10px] p-2">
        <p className="font-bold border-b border-border/10 pb-1 mb-1">Políticas de SLA</p>
        <p>Estágio: <span className="text-primary font-bold uppercase">{stage}</span></p>
        <p>Tempo Limite: <span className="font-bold">{slaDays} dias</span></p>
        <p>Inatividade: <span className="font-bold">{diffDays} dias</span></p>
      </TooltipContent>
    </Tooltip>
  );
};
