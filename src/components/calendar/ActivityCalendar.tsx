import { useState, useMemo, useCallback } from "react";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  format, isSameMonth, isToday, addMonths, subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTasks, useUpdateTask, TaskRecord } from "@/hooks/useTasks";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  Phone, Mail, Users, Reply, FileText, CheckCircle2,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TASK_ICONS: Record<string, React.ReactNode> = {
  call: <Phone className="h-3 w-3" />,
  email: <Mail className="h-3 w-3" />,
  meeting: <Users className="h-3 w-3" />,
  follow_up: <Reply className="h-3 w-3" />,
  proposal: <FileText className="h-3 w-3" />,
  other: <CheckCircle2 className="h-3 w-3" />,
};

const PRIORITY_STYLES: Record<string, string> = {
  high: "border-l-2 border-l-status-error bg-status-error/5",
  medium: "border-l-2 border-l-status-warning bg-status-warning/5",
  low: "border-l-2 border-l-status-info bg-status-info/5",
};

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface CalendarTaskProps {
  task: TaskRecord;
  onDragStart: (taskId: string) => void;
  compact?: boolean;
}

function CalendarTask({ task, onDragStart, compact }: CalendarTaskProps) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("taskId", task.id);
        onDragStart(task.id);
      }}
      className={cn(
        "group flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] cursor-grab active:cursor-grabbing transition-all hover:shadow-sm",
        PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium,
        task.status === "completed" && "opacity-50 line-through"
      )}
      title={`${task.title} - ${task.due_time || ""}`}
    >
      <span className="shrink-0 text-muted-foreground">{TASK_ICONS[task.task_type] || TASK_ICONS.other}</span>
      {!compact && (
        <>
          {task.due_time && <span className="text-muted-foreground shrink-0">{task.due_time.slice(0, 5)}</span>}
          <span className="truncate font-medium">{task.title}</span>
        </>
      )}
    </div>
  );
}

export function ActivityCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const { salesperson } = useAuth();
  const { data: tasks, isLoading } = useTasks(salesperson?.id);
  const updateTask = useUpdateTask();

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd_ = endOfMonth(monthStart);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd_);
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, TaskRecord[]>();
    if (!tasks) return map;
    for (const task of tasks) {
      const key = task.due_date;
      const existing = map.get(key) || [];
      existing.push(task);
      map.set(key, existing);
    }
    return map;
  }, [tasks]);

  const handleDrop = useCallback((dateStr: string) => {
    if (!draggingTaskId) return;
    
    updateTask.mutate(
      { id: draggingTaskId, due_date: dateStr },
      {
        onSuccess: () => {
          toast.success("Tarefa reagendada!");
        },
      }
    );
    
    setDraggingTaskId(null);
    setDragOverDate(null);
  }, [draggingTaskId, updateTask]);

  const handleDragOver = useCallback((e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    setDragOverDate(dateStr);
  }, []);

  const todayStats = useMemo(() => {
    if (!tasks) return { total: 0, completed: 0, pending: 0 };
    const todayKey = format(new Date(), "yyyy-MM-dd");
    const todayTasks = tasks.filter(t => t.due_date === todayKey);
    return {
      total: todayTasks.length,
      completed: todayTasks.filter(t => t.status === "completed").length,
      pending: todayTasks.filter(t => t.status !== "completed").length,
    };
  }, [tasks]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[500px] w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-primary/20">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-primary">{todayStats.total}</p>
            <p className="text-[10px] text-muted-foreground">Hoje</p>
          </CardContent>
        </Card>
        <Card className="border-status-success/20">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-status-success">{todayStats.completed}</p>
            <p className="text-[10px] text-muted-foreground">Concluídas</p>
          </CardContent>
        </Card>
        <Card className="border-status-warning/20">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-status-warning">{todayStats.pending}</p>
            <p className="text-[10px] text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-display flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary" />
              Calendário de Atividades
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs font-medium min-w-[120px]" onClick={() => setCurrentMonth(new Date())}>
                {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-px mb-1">
            {WEEKDAYS.map(day => (
              <div key={day} className="text-center text-[10px] font-semibold text-muted-foreground py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-px bg-border/30 rounded-lg overflow-hidden">
            {calendarDays.map(day => {
              const dateStr = format(day, "yyyy-MM-dd");
              const dayTasks = tasksByDate.get(dateStr) || [];
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isDragOver = dragOverDate === dateStr;

              return (
                <div
                  key={dateStr}
                  className={cn(
                    "min-h-[80px] lg:min-h-[100px] p-1 bg-card transition-colors",
                    !isCurrentMonth && "bg-muted/20",
                    isToday(day) && "ring-1 ring-primary ring-inset",
                    isDragOver && "bg-primary/10 ring-2 ring-primary ring-inset",
                  )}
                  onDragOver={(e) => handleDragOver(e, dateStr)}
                  onDragLeave={() => setDragOverDate(null)}
                  onDrop={() => handleDrop(dateStr)}
                >
                  <div className={cn(
                    "text-[11px] font-medium mb-0.5",
                    isToday(day) ? "text-primary font-bold" : !isCurrentMonth ? "text-muted-foreground/50" : "text-foreground",
                  )}>
                    {format(day, "d")}
                    {dayTasks.length > 0 && (
                      <Badge variant="secondary" className="h-3.5 px-1 text-[8px] ml-1">{dayTasks.length}</Badge>
                    )}
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    {dayTasks.slice(0, 3).map(task => (
                      <CalendarTask
                        key={task.id}
                        task={task}
                        onDragStart={setDraggingTaskId}
                        compact={dayTasks.length > 2}
                      />
                    ))}
                    {dayTasks.length > 3 && (
                      <p className="text-[9px] text-muted-foreground text-center">+{dayTasks.length - 3} mais</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-sm bg-status-error" />
              Alta
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-sm bg-status-warning" />
              Média
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-sm bg-status-info" />
              Baixa
            </div>
            <div className="flex items-center gap-1 ml-auto">
              <GripVertical className="h-3 w-3" />
              Arraste para reagendar
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
