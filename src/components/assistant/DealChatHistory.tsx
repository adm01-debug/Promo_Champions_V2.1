import React from 'react';
import { MessageSquare, Trash2, Clock, Loader2, Filter } from 'lucide-react';
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
import { useDealChatHistory, QUESTION_TYPES, QuestionType } from '@/hooks/useDealChatHistory';
import { Badge } from '@/components/ui/badge';

interface DealChatHistoryProps {
  dealId: string;
  clientName: string;
  onSelectQuestion: (question: string) => void;
}

const TYPE_COLORS: Record<QuestionType, string> = {
  general: 'bg-muted text-muted-foreground',
  analysis: 'bg-blue-500/20 text-blue-500',
  objections: 'bg-orange-500/20 text-orange-500',
  closing: 'bg-green-500/20 text-green-500',
  strategy: 'bg-purple-500/20 text-purple-500',
};

export function DealChatHistory({ dealId, clientName, onSelectQuestion }: DealChatHistoryProps) {
  const { history, allHistory, isLoading, deleteEntry, filterType, setFilterType } = useDealChatHistory(dealId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (allHistory.length === 0) {
    return (
      <div className="text-center py-4 text-xs text-muted-foreground">
        <MessageSquare className="h-4 w-4 mx-auto mb-1 opacity-50" />
        Nenhuma pergunta registrada para este deal
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Histórico ({history.length})
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Filter className="h-3 w-3 text-muted-foreground" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as QuestionType | 'all')}
            className="text-[10px] bg-transparent border-none text-muted-foreground focus:outline-none cursor-pointer"
          >
            <option value="all">Todos</option>
            {QUESTION_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
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
              <div className="flex items-start gap-2 pr-6">
                <Badge 
                  variant="secondary" 
                  className={cn("text-[8px] px-1 py-0 shrink-0", TYPE_COLORS[entry.question_type as QuestionType] || TYPE_COLORS.general)}
                >
                  {QUESTION_TYPES.find(t => t.value === entry.question_type)?.label || 'Geral'}
                </Badge>
                <p className="text-xs line-clamp-2 flex-1">{entry.question}</p>
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 block pl-0">
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
