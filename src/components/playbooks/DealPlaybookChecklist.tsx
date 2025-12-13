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
      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (!playbooks || playbooks.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
        Nenhum playbook para esta etapa
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Progresso do Checklist</span>
          <span className="text-muted-foreground">
            {stats.completed}/{stats.total} completos
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" />
        {stats.required > 0 && (
          <p className="text-xs text-muted-foreground">
            {stats.requiredCompleted}/{stats.required} obrigatórios completados
          </p>
        )}
      </div>

      {/* Playbook Items */}
      {playbooks.map((playbook) => (
        <div key={playbook.id} className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            {playbook.title}
          </h4>
          <div className="space-y-1 pl-1">
            {playbook.items?.map((item) => {
              const isCompleted = completedItemIds.has(item.id);
              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-md transition-colors",
                    isCompleted ? "bg-primary/5" : "hover:bg-muted/50"
                  )}
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
                  />
                  <label
                    htmlFor={`item-${item.id}`}
                    className={cn(
                      "flex-1 text-sm cursor-pointer",
                      isCompleted && "line-through text-muted-foreground"
                    )}
                  >
                    {item.content}
                  </label>
                  {item.is_required && !isCompleted && (
                    <Badge variant="destructive" className="text-[10px]">
                      Obrigatório
                    </Badge>
                  )}
                  {isCompleted && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
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
