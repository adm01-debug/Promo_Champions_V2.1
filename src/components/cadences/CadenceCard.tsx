import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cadence, CadenceStep, ActionType } from "@/hooks/useCadences";
import { Phone, Mail, Linkedin, MessageCircle, Users, MoreHorizontal, Trash2, ChevronDown, ChevronUp, ListTodo, Pencil, Power, CheckSquare } from "lucide-react";
import { useState } from "react";
import { EditCadenceDialog } from "./EditCadenceDialog";
import { DeleteCadenceDialog } from "./DeleteCadenceDialog";

const actionIcons: Record<ActionType, typeof Phone> = {
  call: Phone,
  email: Mail,
  linkedin: Linkedin,
  whatsapp: MessageCircle,
  task: CheckSquare,
  meeting: Users,
  other: MoreHorizontal,
};

const actionLabels: Record<ActionType, string> = {
  call: "Ligação",
  email: "E-mail",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  task: "Tarefa",
  meeting: "Reunião",
  other: "Outro",
};

const actionColors: Record<ActionType, string> = {
  call: "bg-status-info/15 text-status-info border-status-info/30 shadow-sm shadow-status-info/10",
  email: "bg-status-warning/15 text-status-warning border-status-warning/30 shadow-sm shadow-status-warning/10",
  linkedin: "bg-primary/15 text-primary border-primary/30 shadow-sm shadow-primary/10",
  whatsapp: "bg-status-success/15 text-status-success border-status-success/30 shadow-sm shadow-status-success/10",
  task: "bg-status-info/15 text-status-info border-status-info/30 shadow-sm shadow-status-info/10",
  meeting: "bg-status-purple/15 text-status-purple border-status-purple/30 shadow-sm shadow-status-purple/10",
  other: "bg-muted/50 text-muted-foreground border-border/50",
};

interface CadenceCardProps {
  cadence: Cadence;
  steps: CadenceStep[];
  onDelete?: () => void;
  onSelect?: () => void;
  isSelected?: boolean;
  isDeleting?: boolean;
}

function _CadenceCard({ cadence, steps, onDelete, onSelect, isSelected, isDeleting }: CadenceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <Card 
        variant="elevated"
        className={`glass border-border/40 dark:border-glow cursor-pointer transition-all duration-300 card-elevated group animate-fade-in ${
          !cadence.is_active ? "opacity-60" : ""
        } ${
          isSelected 
            ? "border-primary ring-2 ring-primary/30 shadow-lg shadow-primary/20 hover-glow" 
            : "hover-lift hover:border-primary/40"
        }`}
        onClick={onSelect}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
                <div className={`p-1.5 rounded-lg transition-all duration-300 group-hover:scale-110 ${isSelected ? 'bg-gradient-to-br from-primary to-accent shadow-md shadow-primary/30' : 'bg-gradient-to-br from-primary/80 to-accent/80 shadow-sm'}`}>
                  <ListTodo className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <span className={`transition-all duration-300 ${isSelected ? 'gradient-text' : 'group-hover:text-primary'}`}>{cadence.name}</span>
                <Badge variant="outline" className="text-[10px] bg-gradient-to-r from-primary/20 to-primary/10 text-primary border-primary/30 font-medium shadow-sm">
                  {steps.length} etapas
                </Badge>
                {!cadence.is_active && (
                  <Badge variant="outline" className="text-[10px] bg-muted/50 text-muted-foreground border-border/50">
                    <Power className="h-2.5 w-2.5 mr-1" />
                    Inativa
                  </Badge>
                )}
              </CardTitle>
              {cadence.description && (
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{cadence.description}</p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-110"
                aria-label="Editar cadência"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditOpen(true);
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon" aria-label="Editar"
                className="h-7 w-7 hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-110"
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
                  size="icon" aria-label="Expandir"
                  className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200 hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteOpen(true);
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
            {steps.slice(0, 5).map((step, index) => {
              const Icon = actionIcons[step.action_type];
              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] border transition-all duration-200 hover:scale-110 cursor-default animate-fade-in ${actionColors[step.action_type]}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Icon className="h-3 w-3" />
                  <span className="font-medium">D{step.day_number}</span>
                </div>
              );
            })}
            {steps.length > 5 && (
              <div className="px-2 py-1 rounded-md text-[10px] bg-muted/50 text-muted-foreground border border-border/40 font-medium shadow-sm">
                +{steps.length - 5}
              </div>
            )}
          </div>

          {/* Expanded view */}
          {isExpanded && steps.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border/40 space-y-2">
              {steps.map((step, index) => {
                const Icon = actionIcons[step.action_type];
                return (
                  <div
                    key={step.id}
                    className="flex items-start gap-3 p-2.5 rounded-lg glass border border-border/30 hover:border-primary/30 transition-all duration-200 group/step hover-lift animate-fade-in"
                    style={{ animationDelay: `${index * 75}ms` }}
                  >
                    <div className="flex flex-col items-center">
                      <div className={`p-1.5 rounded-lg border transition-all duration-200 group-hover/step:scale-110 group-hover/step:shadow-md ${actionColors[step.action_type]}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      {index < steps.length - 1 && (
                        <div className="w-px h-4 bg-gradient-to-b from-primary/40 to-transparent my-1" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-primary bg-primary/15 px-1.5 py-0.5 rounded shadow-sm border border-primary/20">
                          Dia {step.day_number}
                        </span>
                        <Badge variant="outline" className={`text-[9px] font-medium shadow-sm ${actionColors[step.action_type]}`}>
                          {actionLabels[step.action_type]}
                        </Badge>
                      </div>
                      <p className="text-xs font-display font-medium mt-1 group-hover/step:text-primary transition-colors">{step.title}</p>
                      {step.description && (
                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2 bg-muted/30 rounded px-2 py-1 border border-border/20">
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

      <EditCadenceDialog cadence={cadence} open={editOpen} onOpenChange={setEditOpen} />
      <DeleteCadenceDialog
        cadenceName={cadence.name}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => { onDelete?.(); setDeleteOpen(false); }}
        isPending={isDeleting}
      />
    </>
  );
}

export const CadenceCard = React.memo(_CadenceCard);
