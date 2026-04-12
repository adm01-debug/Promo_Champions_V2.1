import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowRight, Trash2, Play, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TRIGGER_OPTIONS, ACTION_OPTIONS } from "@/hooks/useWorkflowRules";

interface WorkflowRule {
  id: string;
  name: string;
  description: string | null;
  trigger_type: string;
  trigger_config: unknown;
  action_type: string;
  action_config: unknown;
  is_active: boolean;
  executions_count: number;
  last_executed_at: string | null;
}

interface WorkflowRuleCardProps {
  rule: WorkflowRule;
  onToggle: (params: { id: string; is_active: boolean }) => void;
  onDelete: (id: string) => void;
}

export const WorkflowRuleCard = React.memo(function WorkflowRuleCard({ rule, onToggle, onDelete }: WorkflowRuleCardProps) {
  const trigger = TRIGGER_OPTIONS.find(t => t.value === rule.trigger_type);
  const action = ACTION_OPTIONS.find(a => a.value === rule.action_type);

  return (
    <Card className={cn("transition-all", !rule.is_active && "opacity-60")}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display font-semibold truncate">{rule.name}</h3>
              <Badge variant={rule.is_active ? "default" : "secondary"} className="text-[10px]">
                {rule.is_active ? "Ativa" : "Inativa"}
              </Badge>
            </div>
            {rule.description && (
              <p className="text-xs text-muted-foreground mb-2">{rule.description}</p>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 text-xs font-medium">
                <span>{(trigger as { icon?: React.ReactNode })?.icon}</span>
                <span className="text-primary">{trigger?.label}</span>
                {(rule.trigger_config as Record<string, unknown>)?.days && (
                  <Badge variant="outline" className="text-[9px] h-4 px-1">
                    {String((rule.trigger_config as Record<string, unknown>).days)}d
                  </Badge>
                )}
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-status-success/10 text-xs font-medium">
                <span>{action?.icon as React.ReactNode}</span>
                <span className="text-status-success">{action?.label}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Play className="h-2.5 w-2.5" />
                {rule.executions_count} execuções
              </span>
              {rule.last_executed_at && (
                <span className="flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" />
                  {formatDistanceToNow(new Date(rule.last_executed_at), { addSuffix: true, locale: ptBR })}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Switch
              checked={rule.is_active}
              onCheckedChange={(checked) => onToggle({ id: rule.id, is_active: checked })}
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Excluir regra" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remover automação?</AlertDialogTitle>
                  <AlertDialogDescription>
                    A automação "{rule.name}" será removida permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(rule.id)}>
                    Remover
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
