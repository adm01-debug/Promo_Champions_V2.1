import { useMemo } from "react";
import { usePlaybooksByStage, useDealPlaybookProgress, useTogglePlaybookItem } from "@/hooks/usePlaybooks";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DealPlaybookChecklistProps {
  saleId: string;
  stage: string;
}

export const DealPlaybookChecklist = ({ saleId, stage }: DealPlaybookChecklistProps) => {
  const { data: playbooks, isLoading: loadingPlaybooks } = usePlaybooksByStage(stage);
  const { data: progress, isLoading: loadingProgress } = useDealPlaybookProgress(saleId);
  const toggleItem = useTogglePlaybookItem();

  const completedItemIds = useMemo(() => {
    return new Set((progress || []).map((p) => p.playbook_item_id));
  }, [progress]);

  const stats = useMemo(() => {
    if (!playbooks) return { total: 0, completed: 0, required: 0, requiredCompleted: 0 };

    let total = 0;
    let completed = 0;
    let required = 0;
    let requiredCompleted = 0;

    playbooks.forEach((playbook) => {
      playbook.items?.forEach((item) => {
        total++;
        if (completedItemIds.has(item.id)) completed++;
        if (item.is_required) {
          required++;
          if (completedItemIds.has(item.id)) requiredCompleted++;
        }
      });
    });

    return { total, completed, required, requiredCompleted };
  }, [playbooks, completedItemIds]);

  const progressPercent = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  if (loadingPlaybooks || loadingProgress) {
    return (
      <div className="space-y-3 animate-fade-in">
        <Skeleton className="h-6 w-32 animate-shimmer" />
        <Skeleton className="h-4 w-full animate-shimmer" style={{ animationDelay: '50ms' }} />
        <Skeleton className="h-8 w-full animate-shimmer" style={{ animationDelay: '100ms' }} />
        <Skeleton className="h-8 w-full animate-shimmer" style={{ animationDelay: '150ms' }} />
      </div>
    );
  }

  if (!playbooks || playbooks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-muted-foreground text-sm glass rounded-lg border border-dashed border-border/50 animate-fade-in">
        <div className="p-3 rounded-full bg-gradient-to-br from-muted/50 to-muted/30 mb-3 shadow-inner">
          <BookOpen className="h-8 w-8 opacity-50" />
        </div>
        <span className="font-medium">Nenhum playbook para esta etapa</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Progress Header */}
      <div className="space-y-2 p-3 rounded-lg glass border border-border/30">
        <div className="flex items-center justify-between text-sm">
          <span className="font-display font-medium gradient-text">Progresso do Checklist</span>
          <span className="text-muted-foreground font-medium">
            <span className="text-primary">{stats.completed}</span>/{stats.total} completos
          </span>
        </div>
        <div className="relative">
          <Progress value={progressPercent} className="h-2.5 shadow-inner" />
          {progressPercent === 100 && (
            <div className="absolute inset-0 bg-gradient-to-r from-status-success/20 to-transparent rounded-full animate-pulse" />
          )}
        </div>
        {stats.required > 0 && (
          <p className="text-xs text-muted-foreground">
            <span className={stats.requiredCompleted === stats.required ? "text-status-success font-medium" : ""}>
              {stats.requiredCompleted}/{stats.required}
            </span> obrigatórios completados
          </p>
        )}
      </div>

      {/* Playbook Items */}
      {playbooks.map((playbook, playbookIndex) => (
        <div 
          key={playbook.id} 
          className="space-y-2 animate-fade-in"
          style={{ animationDelay: `${playbookIndex * 100}ms` }}
        >
          <h4 className="text-sm font-display font-medium flex items-center gap-2 group">
            <div className="p-1 rounded-md bg-gradient-to-br from-primary/20 to-accent/20 transition-all duration-200 group-hover:scale-110">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <span className="group-hover:text-primary transition-colors">{playbook.title}</span>
          </h4>
          <div className="space-y-1.5 pl-1">
            {playbook.items?.map((item, itemIndex) => {
              const isCompleted = completedItemIds.has(item.id);
              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-200 group animate-fade-in",
                    isCompleted 
                      ? "bg-status-success/10 border-status-success/30 shadow-sm" 
                      : "bg-muted/20 border-border/30 hover:bg-muted/40 hover:border-primary/30"
                  )}
                  style={{ animationDelay: `${itemIndex * 50}ms` }}
                >
                  <Checkbox
                    id={`item-${item.id}`}
                    checked={isCompleted}
                    onCheckedChange={() => {
                      toggleItem.mutate({
                        itemId: item.id,
                        saleId,
                        isCompleted,
                      });
                    }}
                    disabled={toggleItem.isPending}
                    className={cn(
                      "transition-all duration-200",
                      isCompleted && "border-status-success bg-status-success/20"
                    )}
                  />
                  <label
                    htmlFor={`item-${item.id}`}
                    className={cn(
                      "flex-1 text-sm cursor-pointer transition-all duration-200",
                      isCompleted && "line-through text-muted-foreground"
                    )}
                  >
                    {item.content}
                  </label>
                  {item.is_required && !isCompleted && (
                    <Badge variant="destructive" className="text-[10px] shadow-sm animate-pulse">
                      Obrigatório
                    </Badge>
                  )}
                  {isCompleted && (
                    <CheckCircle2 className="h-4 w-4 text-status-success animate-fade-in" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
