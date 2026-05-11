import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { usePlaybooksByStage, useDealPlaybookProgress, useTogglePlaybookItem } from "@/hooks/usePlaybooks";
import { cn } from "@/lib/utils";

interface DealPlaybookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealId: string;
  clientName: string;
  stageId: string;
}

export const DealPlaybookModal = ({
  open,
  onOpenChange,
  dealId,
  clientName,
  stageId,
}: DealPlaybookModalProps) => {
  const { data: playbooks, isLoading: loadingPlaybooks } = usePlaybooksByStage(stageId);
  const { data: progress, isLoading: loadingProgress } = useDealPlaybookProgress(dealId);
  const toggleItem = useTogglePlaybookItem();

  const completedItemIds = new Set(progress?.map((p) => p.playbook_item_id) || []);
  
  const allItems = playbooks?.flatMap((pb) => pb.items || []) || [];
  const totalItems = allItems.length;
  const completedCount = allItems.filter((item) => completedItemIds.has(item.id)).length;
  const progressPercentage = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  const handleToggle = (itemId: string, isCompleted: boolean) => {
    toggleItem.mutate({
      itemId,
      saleId: dealId,
      isCompleted,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] glass border-border/40 dark:border-glow p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-display">Playbook de Execução</DialogTitle>
              <DialogDescription>
                Guia estratégico para <span className="text-foreground font-semibold">{clientName}</span> na etapa <span className="text-primary font-medium uppercase tracking-wider text-xs">{stageId}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-4 border-y border-border/20 bg-muted/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Progresso da Etapa</span>
            <span className="text-xs font-bold text-primary">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2 bg-primary/10" />
        </div>

        <ScrollArea className="h-[400px] p-6">
          {loadingPlaybooks || loadingProgress ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Carregando táticas...</p>
            </div>
          ) : playbooks?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
              <AlertCircle className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Nenhum playbook definido para esta etapa.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {playbooks?.map((playbook) => (
                <div key={playbook.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                      <div className="w-1 h-4 bg-primary rounded-full" />
                      {playbook.title}
                    </h3>
                    <Badge variant="outline" className="text-[10px] bg-primary/5 border-primary/20 text-primary">
                      {playbook.items?.length || 0} Ações
                    </Badge>
                  </div>
                  
                  <div className="grid gap-2">
                    {playbook.items?.map((item) => {
                      const isCompleted = completedItemIds.has(item.id);
                      return (
                        <div
                          key={item.id}
                          className={cn(
                            "group flex items-start gap-3 p-3 rounded-xl border transition-all duration-200",
                            isCompleted 
                              ? "bg-emerald-500/5 border-emerald-500/20" 
                              : "bg-card/50 border-border/40 hover:border-primary/30"
                          )}
                        >
                          <Checkbox
                            id={item.id}
                            checked={isCompleted}
                            onCheckedChange={() => handleToggle(item.id, isCompleted)}
                            className="mt-0.5 border-muted-foreground/30 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                          />
                          <div className="flex-1 space-y-1">
                            <label
                              htmlFor={item.id}
                              className={cn(
                                "text-sm font-medium leading-none cursor-pointer transition-colors",
                                isCompleted ? "text-muted-foreground line-through" : "text-foreground group-hover:text-primary"
                              )}
                            >
                              {item.content}
                            </label>
                            {item.is_required && (
                              <div className="flex items-center gap-1 text-[10px] font-bold text-status-warning uppercase">
                                <span>Obrigatório</span>
                              </div>
                            )}
                          </div>
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground/20 shrink-0 group-hover:text-primary/30 transition-colors" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 bg-muted/10 border-t border-border/20 flex justify-end">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-widest px-3">
            Modo de Execução Ativo
          </Badge>
        </div>
      </DialogContent>
    </Dialog>
  );
};