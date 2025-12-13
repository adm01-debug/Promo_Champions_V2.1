import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cadence, CadenceStep, ActionType } from "@/hooks/useCadences";
import { Phone, Mail, Linkedin, MessageCircle, Users, MoreHorizontal, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const actionIcons: Record<ActionType, typeof Phone> = {
  call: Phone,
  email: Mail,
  linkedin: Linkedin,
  whatsapp: MessageCircle,
  meeting: Users,
  other: MoreHorizontal,
};

const actionLabels: Record<ActionType, string> = {
  call: "Ligação",
  email: "E-mail",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  meeting: "Reunião",
  other: "Outro",
};

const actionColors: Record<ActionType, string> = {
  call: "bg-status-info/10 text-status-info border-status-info/20",
  email: "bg-status-warning/10 text-status-warning border-status-warning/20",
  linkedin: "bg-primary/10 text-primary border-primary/20",
  whatsapp: "bg-status-success/10 text-status-success border-status-success/20",
  meeting: "bg-status-purple/10 text-status-purple border-status-purple/20",
  other: "bg-muted text-muted-foreground border-border",
};

interface CadenceCardProps {
  cadence: Cadence;
  steps: CadenceStep[];
  onDelete?: () => void;
  onSelect?: () => void;
  isSelected?: boolean;
}

export function CadenceCard({ cadence, steps, onDelete, onSelect, isSelected }: CadenceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card 
      variant="elevated"
      className={`glass border-border/40 dark:border-glow hover-lift cursor-pointer transition-all duration-300 card-elevated ${
        isSelected ? "border-primary ring-2 ring-primary/20 shadow-lg shadow-primary/10" : "hover:border-primary/40"
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
              <span className="gradient-text">{cadence.name}</span>
              <Badge variant="outline" className="text-[10px] bg-gradient-to-r from-primary/20 to-primary/10 text-primary border-primary/30">
                {steps.length} etapas
              </Badge>
            </CardTitle>
            {cadence.description && (
              <p className="text-xs text-muted-foreground mt-1.5">{cadence.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Step summary */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {steps.slice(0, 5).map((step) => {
            const Icon = actionIcons[step.action_type];
            return (
              <div
                key={step.id}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] border transition-all hover:scale-105 ${actionColors[step.action_type]}`}
              >
                <Icon className="h-3 w-3" />
                D{step.day_number}
              </div>
            );
          })}
          {steps.length > 5 && (
            <div className="px-2 py-1 rounded-md text-[10px] bg-muted/50 text-muted-foreground border border-border/30">
              +{steps.length - 5}
            </div>
          )}
        </div>

        {/* Expanded view */}
        {isExpanded && steps.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/30 space-y-2 animate-fade-in">
            {steps.map((step, index) => {
              const Icon = actionIcons[step.action_type];
              return (
                <div
                  key={step.id}
                  className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 border border-border/20 hover:border-border/40 transition-all duration-200"
                >
                  <div className="flex flex-col items-center">
                    <div className={`p-1.5 rounded-md shadow-sm ${actionColors[step.action_type]}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-px h-4 bg-border/60 my-1" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        Dia {step.day_number}
                      </span>
                      <Badge variant="outline" className={`text-[9px] ${actionColors[step.action_type]}`}>
                        {actionLabels[step.action_type]}
                      </Badge>
                    </div>
                    <p className="text-xs font-display font-medium mt-0.5">{step.title}</p>
                    {step.description && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
