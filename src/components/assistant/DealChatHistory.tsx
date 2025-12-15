import React from 'react';
import { MessageSquare, Trash2, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useDealChatHistory } from '@/hooks/useDealChatHistory';

interface DealChatHistoryProps {
  dealId: string;
  clientName: string;
  onSelectQuestion: (question: string) => void;
}

export function DealChatHistory({ dealId, clientName, onSelectQuestion }: DealChatHistoryProps) {
  const { history, isLoading, deleteEntry } = useDealChatHistory(dealId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-4 text-xs text-muted-foreground">
        <MessageSquare className="h-4 w-4 mx-auto mb-1 opacity-50" />
        Nenhuma pergunta registrada para este deal
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 mb-2">
        <Clock className="h-3 w-3 text-muted-foreground" />
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Histórico de Perguntas ({history.length})
        </span>
      </div>
      <ScrollArea className="max-h-[120px]">
        <div className="space-y-1.5">
          {history.map((entry) => (
            <div
              key={entry.id}
              className={cn(
                "group relative p-2 rounded-md border border-border/40 bg-muted/30",
                "hover:bg-muted/50 transition-colors cursor-pointer"
              )}
              onClick={() => onSelectQuestion(entry.question)}
            >
              <p className="text-xs line-clamp-2 pr-6">{entry.question}</p>
              <span className="text-[10px] text-muted-foreground mt-1 block">
                {formatDistanceToNow(new Date(entry.created_at), { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "absolute right-1 top-1 h-5 w-5",
                        "opacity-0 group-hover:opacity-100 transition-opacity",
                        "hover:bg-destructive/10 hover:text-destructive"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteEntry.mutate(entry.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Remover do histórico</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
