import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTodaysCadenceTasks, useCompleteCadenceTask, useSkipCadenceTask, ActionType, useUpdateLeadStage } from "@/hooks/useCadences";
import { Phone, Mail, Linkedin, MessageCircle, Users, MoreHorizontal, Check, SkipForward, Clock, ListTodo, MessageSquare, X, CheckCircle2, Zap, GitBranch, CheckSquare, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

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
  call: "bg-status-info/15 text-status-info shadow-sm shadow-status-info/10",
  email: "bg-status-warning/15 text-status-warning shadow-sm shadow-status-warning/10",
  linkedin: "bg-primary/15 text-primary shadow-sm shadow-primary/10",
  whatsapp: "bg-status-success/15 text-status-success shadow-sm shadow-status-success/10",
  task: "bg-status-info/15 text-status-info shadow-sm shadow-status-info/10",
  meeting: "bg-status-purple/15 text-status-purple shadow-sm shadow-status-purple/10",
  other: "bg-muted/50 text-muted-foreground",
};

export function TodaysCadenceTasks() {
  const { data: tasks, isLoading } = useTodaysCadenceTasks();
  const completeTask = useCompleteCadenceTask();
  const skipTask = useSkipCadenceTask();
  const updateStage = useUpdateLeadStage();
  const [notesTaskId, setNotesTaskId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [noteAction, setNoteAction] = useState<"complete" | "skip">("complete");
  const [callResult, setCallResult] = useState<string>("nao_atendeu");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleAction = (taskId: string, action: "complete" | "skip") => {
    setNotesTaskId(taskId);
    setNoteAction(action);
    setNoteText("");
    setCallResult("nao_atendeu");
  };

  const applyOutcomeRules = async (outcome: string, saleId: string, prospectCadenceId: string) => {
    try {
      const { data: rules } = await supabase
        .from("cadence_outcome_rules")
        .select("*")
        .eq("outcome", outcome);

      if (rules && rules.length > 0) {
        const rule = rules[0];
        
        // 1. Atualizar etapa do funil
        if (rule.to_stage) {
          await updateStage.mutateAsync({ saleId, stage: rule.to_stage });
        }
        
        // 2. Ações de Cadência (Próximos Passos)
        if (rule.next_action === 'pause') {
          await supabase.from("prospect_cadences").update({ status: 'paused' }).eq("id", prospectCadenceId);
        } else if (rule.next_action === 'retry') {
          // Lógica de retry seria disparada por um cron ou worker baseado no retry_delay_hours
          console.info(`Retry agendado em ${rule.retry_delay_hours}h`);
        }
        
        // 3. Registrar Log de Auditoria
        await supabase.from("intent_audit_logs").insert({
          lead_id: prospectCadenceId,
          event_type: `call_outcome_${outcome}`,
          details: { 
            transitioned: !!rule.to_stage, 
            old_stage: 'current', // Simplified
            new_stage: rule.to_stage,
            reason: `Regra de desfecho: ${outcome}` 
          },
          rule_applied: rule
        });

        toast({
          title: "Regra de Desfecho Aplicada",
          description: `Desfecho "${outcome}" processado com sucesso.`,
        });
      }
    } catch (err) {
      console.error("Erro ao aplicar regras de desfecho:", err);
    }
  };

  const executeAction = async () => {
    if (!notesTaskId) return;
    
    const task = tasks?.find(t => t.id === notesTaskId);
    const step = task?.cadence_step as Record<string, unknown> | null;
    
    const payload = { 
      taskId: notesTaskId, 
      notes: noteText.trim() || undefined 
    };

    if (noteAction === "complete") {
      // Se for ligação, salvar o resultado
      if (step?.action_type === 'call') {
        try {
          await supabase
            .from("cadence_tasks")
            .update({ call_result: callResult })
            .eq("id", notesTaskId);
            
          // Registrar log detalhado
          const prospectCadence = task?.prospect_cadence as Record<string, unknown> | null;
          if (prospectCadence?.sale_id) {
            await applyOutcomeRules(callResult, String(prospectCadence.sale_id), String(prospectCadence.id));
            
            await supabase.from("lead_detailed_logs").insert([{
              client_id: String(prospectCadence.sale_id),
              event_type: 'interaction',
              action: 'Call Logged',
              details: { result: callResult, notes: noteText } as any,
              created_by: (await supabase.auth.getUser()).data.user?.id
            }]);
          }
        } catch (err) {
          console.error("Erro ao salvar resultado da ligação:", err);
        }
      }
      
      completeTask.mutate(payload);
    } else {
      skipTask.mutate(payload);
    }
    setNotesTaskId(null);
    setNoteText("");
  };

  const quickAction = (taskId: string, action: "complete" | "skip") => {
    const payload = { taskId };
    if (action === "complete") {
      completeTask.mutate(payload);
    } else {
      skipTask.mutate(payload);
    }
  };

  if (isLoading) {
    return (
      <Card variant="elevated" className="glass border-border/40 dark:border-glow card-elevated animate-fade-in">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-accent shadow-md animate-pulse">
              <ListTodo className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="gradient-text">Tarefas de Cadência - Hoje</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-3 rounded-lg border border-border/30 bg-muted/20 space-y-2 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg animate-shimmer" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4 animate-shimmer" />
                    <Skeleton className="h-3 w-1/2 animate-shimmer" />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-7 flex-1 animate-shimmer" />
                  <Skeleton className="h-7 w-20 animate-shimmer" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="glass border-border/40 dark:border-glow card-elevated transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-accent shadow-md">
              <ListTodo className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="gradient-text">Tarefas de Cadência - Hoje</span>
          </CardTitle>
          <Badge variant="secondary" className={`text-xs font-medium border transition-all duration-300 ${
            tasks && tasks.length > 0 
              ? "bg-gradient-to-r from-primary/20 to-accent/20 text-primary border-primary/30 animate-pulse" 
              : "bg-muted/50 text-muted-foreground border-border/50"
          }`}>
            {tasks?.length || 0} pendentes
          </Badge>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-all duration-200"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["todays-cadence-tasks"] })}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[350px]">
          <div className="p-4 space-y-3">
            {(!tasks || tasks.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground glass rounded-lg border border-dashed border-border/50">
                <div className="p-3 rounded-full bg-gradient-to-br from-muted/50 to-muted/30 mb-3 shadow-inner">
                  <Clock className="h-8 w-8 opacity-50" />
                </div>
                <p className="text-sm font-display font-medium gradient-text">Nenhuma tarefa de cadência para hoje</p>
                <p className="text-xs text-muted-foreground mt-1">As próximas tarefas aparecerão aqui</p>
              </div>
            ) : (
              tasks.map((task, index: number) => {
                const step = task.cadence_step as Record<string, unknown> | null;
                const prospectCadence = task.prospect_cadence as Record<string, unknown> | null;
                const sale = prospectCadence?.sale as Record<string, unknown> | null;
                const cadence = prospectCadence?.cadence as Record<string, unknown> | null;
                const Icon = actionIcons[step?.action_type as ActionType] || MoreHorizontal;
                const isNotesOpen = notesTaskId === task.id;

                return (
                  <div
                    key={task.id}
                    className="p-3 rounded-lg glass border border-border/30 hover:border-primary/40 transition-all duration-200 space-y-2 hover-lift group animate-fade-in"
                    style={{ animationDelay: `${index * 75}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg border transition-all duration-200 group-hover:scale-110 group-hover:shadow-md ${actionColors[step?.action_type as ActionType] || "bg-muted"}`}>
                        <Icon className="h-4 w-4 transition-transform group-hover:animate-pulse" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-display font-medium group-hover:gradient-text transition-colors">{String(step?.title || '')}</span>
                          <Badge variant="outline" className={`text-[10px] font-medium shadow-sm ${actionColors[step?.action_type as ActionType] || ""}`}>
                            {actionLabels[step?.action_type as ActionType] || "Ação"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          <span className="gradient-text font-medium">{String((sale as Record<string, unknown>)?.client_name || '')}</span> • <span className="text-primary/80 font-medium">{String((cadence as Record<string, unknown>)?.name || '')}</span>
                        </p>
                        {step?.description ? (
                          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 bg-muted/30 rounded-md px-2 py-1.5 border border-border/20 shadow-inner">
                            {String(step.description)}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {/* Notes area */}
                    {isNotesOpen && (
                      <div className="pt-2 space-y-2 border-t border-border/30 animate-fade-in">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {noteAction === "complete" ? "Nota ao concluir" : "Motivo ao pular"}
                          </span>
                          <Button size="icon" aria-label="Fechar notas" variant="ghost" className="h-5 w-5" onClick={() => setNotesTaskId(null)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        {step?.action_type === 'call' && (
                          <div className="space-y-1.5 pt-1">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Resultado da Ligação</Label>
                            <Select value={callResult} onValueChange={setCallResult}>
                              <SelectTrigger className="h-7 text-xs bg-background/50">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="atendeu">Atendeu</SelectItem>
                                <SelectItem value="nao_atendeu">Não Atendeu</SelectItem>
                                <SelectItem value="interessado">Interessado</SelectItem>
                                <SelectItem value="agendado">Agendado</SelectItem>
                                <SelectItem value="rejeitado">Rejeitado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        <Textarea
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder={noteAction === "complete" ? "Adicione observações sobre o contato..." : "Por que está pulando esta tarefa?"}
                          className="min-h-[60px] text-xs resize-none bg-background/50 border-border/50 focus:border-primary"
                        />
                        <Button
                          size="sm"
                          variant={noteAction === "complete" ? "glow" : "outline"}
                          className="w-full h-7 text-xs font-medium"
                          onClick={executeAction}
                          disabled={completeTask.isPending || skipTask.isPending}
                        >
                          {noteAction === "complete" ? "Concluir com Nota" : "Pular com Motivo"}
                        </Button>
                      </div>
                    )}

                    {/* Action buttons */}
                    {!isNotesOpen && (
                      <div className="flex flex-col gap-2 pt-2">
                        {/* Deep Links for Multichannel */}
                        {(step?.action_type === 'whatsapp' || step?.action_type === 'linkedin' || step?.action_type === 'call') && (
                          <div className="flex gap-2 mb-1">
                            {step?.action_type === 'whatsapp' && (sale as any)?.client_phone && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-7 text-[10px] gap-1.5 flex-1 bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/20"
                                onClick={() => window.open(`https://wa.me/${(sale as any).client_phone.replace(/\D/g, '')}`, '_blank')}
                              >
                                <MessageCircle className="h-3 w-3" /> Abrir WhatsApp
                              </Button>
                            )}
                            {step?.action_type === 'linkedin' && (sale as any)?.client_linkedin && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-7 text-[10px] gap-1.5 flex-1 bg-blue-500/10 text-blue-600 border-blue-500/30 hover:bg-blue-500/20"
                                onClick={() => window.open(String((sale as any).client_linkedin), '_blank')}
                              >
                                <Linkedin className="h-3 w-3" /> Ver LinkedIn
                              </Button>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          {(task as any).task_type === 'automatic' ? (
                            <div className="flex-1 flex items-center justify-center p-1.5 rounded-md bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold animate-pulse">
                              <Zap className="h-3 w-3 mr-1" /> EXECUTANDO AUTOMATICAMENTE
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="glow"
                              className="h-7 text-xs gap-1.5 flex-1 font-medium shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                              onClick={() => quickAction(task.id, "complete")}
                              disabled={completeTask.isPending}
                            >
                              <Check className="h-3.5 w-3.5" />
                              Concluir
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1 hover:bg-primary/5 border-border/50 hover:border-primary/40"
                            onClick={() => handleAction(task.id, "complete")}
                            title="Concluir com nota"
                          >
                            <MessageSquare className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1.5 hover:bg-muted/50 border-border/50 hover:border-primary/40 hover:scale-105 transition-all duration-200"
                            onClick={() => handleAction(task.id, "skip")}
                            disabled={skipTask.isPending}
                          >
                            <SkipForward className="h-3.5 w-3.5" />
                            Pular
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
