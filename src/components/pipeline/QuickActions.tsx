import React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Zap, PhoneCall, Mail, Calendar, ArrowRight, CheckCircle, XCircle, FileText } from "lucide-react";
import { toast } from "sonner";

interface QuickActionsProps {
  dealId: string;
  dealName: string;
  currentStage: string;
  onStageChange?: (newStage: string) => void;
  className?: string;
}

const STAGE_ORDER = ["lead", "prospecting", "qualified", "proposal", "negotiation", "won"];

function QuickActionsComponent({ dealId, dealName, currentStage, onStageChange, className }: QuickActionsProps) {
  const currentIndex = STAGE_ORDER.indexOf(currentStage.toLowerCase());
  const nextStage = currentIndex >= 0 && currentIndex < STAGE_ORDER.length - 1
    ? STAGE_ORDER[currentIndex + 1]
    : null;

  const stageLabels: Record<string, string> = {
    lead: "Lead",
    prospecting: "Prospecção",
    qualified: "Qualificado",
    proposal: "Proposta",
    negotiation: "Negociação",
    won: "Ganho",
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "advance":
        if (nextStage && onStageChange) {
          onStageChange(nextStage);
          toast.success(`Deal avançado para ${stageLabels[nextStage] || nextStage}`);
        }
        break;
      case "qualify":
        if (onStageChange) {
          onStageChange("qualified");
          toast.success("Lead qualificado!");
        }
        break;
      case "won":
        if (onStageChange) {
          onStageChange("won");
          toast.success("🎉 Deal ganho!");
        }
        break;
      case "lost":
        if (onStageChange) {
          onStageChange("lost");
          toast.info("Deal marcado como perdido");
        }
        break;
      default:
        toast.info(`Ação "${action}" registrada para ${dealName}`);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 hover:bg-primary/10 hover:text-primary"
          title="Ações rápidas"
          aria-label="Ações rápidas"
        >
          <Zap className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {nextStage && (
          <DropdownMenuItem onClick={() => handleQuickAction("advance")} className="gap-2 text-xs">
            <ArrowRight className="h-3.5 w-3.5 text-primary" />
            Avançar → {stageLabels[nextStage]}
          </DropdownMenuItem>
        )}
        {currentStage.toLowerCase() === "lead" && (
          <DropdownMenuItem onClick={() => handleQuickAction("qualify")} className="gap-2 text-xs">
            <CheckCircle className="h-3.5 w-3.5 text-status-success" />
            Qualificar Lead
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleQuickAction("call")} className="gap-2 text-xs">
          <PhoneCall className="h-3.5 w-3.5 text-status-info" />
          Registrar Ligação
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleQuickAction("email")} className="gap-2 text-xs">
          <Mail className="h-3.5 w-3.5 text-status-warning" />
          Enviar Email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleQuickAction("meeting")} className="gap-2 text-xs">
          <Calendar className="h-3.5 w-3.5 text-status-purple" />
          Agendar Reunião
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleQuickAction("proposal")} className="gap-2 text-xs">
          <FileText className="h-3.5 w-3.5 text-accent" />
          Gerar Proposta
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleQuickAction("won")} className="gap-2 text-xs text-status-success">
          <CheckCircle className="h-3.5 w-3.5" />
          Marcar como Ganho
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleQuickAction("lost")} className="gap-2 text-xs text-destructive">
          <XCircle className="h-3.5 w-3.5" />
          Marcar como Perdido
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const QuickActions = React.memo(QuickActionsComponent);
