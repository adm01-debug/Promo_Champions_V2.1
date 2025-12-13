import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTodaysCadenceTasks, useCompleteCadenceTask, useSkipCadenceTask, ActionType } from "@/hooks/useCadences";
import { Phone, Mail, Linkedin, MessageCircle, Users, MoreHorizontal, Check, SkipForward, Clock, ListTodo } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
  call: "bg-status-info/10 text-status-info",
  email: "bg-status-warning/10 text-status-warning",
  linkedin: "bg-primary/10 text-primary",
  whatsapp: "bg-status-success/10 text-status-success",
  meeting: "bg-status-purple/10 text-status-purple",
  other: "bg-muted text-muted-foreground",
};

export function TodaysCadenceTasks() {
  const { data: tasks, isLoading } = useTodaysCadenceTasks();
  const completeTask = useCompleteCadenceTask();
  const skipTask = useSkipCadenceTask();

  if (isLoading) {
    return (
      <Card className="glass border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ListTodo className="h-4 w-4 text-primary" />
            Tarefas de Cadência - Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-border/40">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ListTodo className="h-4 w-4 text-primary" />
            Tarefas de Cadência - Hoje
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {tasks?.length || 0} pendentes
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[350px]">
          <div className="p-4 space-y-3">
            {(!tasks || tasks.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Clock className="h-10 w-10 mb-2 opacity-50" />
                <p className="text-sm">Nenhuma tarefa de cadência para hoje</p>
              </div>
            ) : (
              tasks.map((task: any) => {
                const step = task.cadence_step;
                const prospectCadence = task.prospect_cadence;
                const sale = prospectCadence?.sale;
                const cadence = prospectCadence?.cadence;
                const Icon = actionIcons[step?.action_type as ActionType] || MoreHorizontal;

                return (
                  <div
                    key={task.id}
                    className="p-3 rounded-lg border border-border/40 bg-muted/30 space-y-2"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${actionColors[step?.action_type as ActionType] || "bg-muted"}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">{step?.title}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {actionLabels[step?.action_type as ActionType] || "Ação"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {sale?.client_name} • {cadence?.name}
                        </p>
                        {step?.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {step.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        className="h-7 text-xs gap-1.5 flex-1"
                        onClick={() => completeTask.mutate({ taskId: task.id })}
                        disabled={completeTask.isPending}
                      >
                        <Check className="h-3.5 w-3.5" />
                        Concluir
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1.5"
                        onClick={() => skipTask.mutate({ taskId: task.id })}
                        disabled={skipTask.isPending}
                      >
                        <SkipForward className="h-3.5 w-3.5" />
                        Pular
                      </Button>
                    </div>
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
