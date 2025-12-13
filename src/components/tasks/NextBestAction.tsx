import { useState } from 'react';
import { useNextBestAction, ActionSuggestion } from '@/hooks/useNextBestAction';
import { useSalespeople } from '@/hooks/useSalespeople';
import { useCreateTask } from '@/hooks/useTasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Sparkles, 
  Loader2, 
  Phone, 
  Users, 
  Mail, 
  Clock, 
  FileText, 
  MoreHorizontal,
  Plus,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';

const priorityConfig = {
  high: { label: 'Alta', className: 'bg-status-error/20 text-status-error border-status-error/30' },
  medium: { label: 'Média', className: 'bg-status-warning/20 text-status-warning border-status-warning/30' },
  low: { label: 'Baixa', className: 'bg-status-success/20 text-status-success border-status-success/30' },
};

const actionTypeConfig = {
  call: { label: 'Ligação', icon: Phone, color: 'text-status-info' },
  meeting: { label: 'Reunião', icon: Users, color: 'text-status-purple' },
  email: { label: 'E-mail', icon: Mail, color: 'text-primary' },
  follow_up: { label: 'Follow-up', icon: Clock, color: 'text-status-warning' },
  proposal: { label: 'Proposta', icon: FileText, color: 'text-accent' },
  other: { label: 'Outro', icon: MoreHorizontal, color: 'text-muted-foreground' },
};

export function NextBestAction() {
  const [selectedSalesperson, setSelectedSalesperson] = useState<string>('');
  const { data: salespeople, isLoading: loadingSalespeople } = useSalespeople();
  const nextBestAction = useNextBestAction();
  const createTask = useCreateTask();

  const handleGenerate = () => {
    if (selectedSalesperson) {
      nextBestAction.mutate(selectedSalesperson);
    }
  };

  const handleCreateTask = (suggestion: ActionSuggestion) => {
    createTask.mutate({
      title: suggestion.title,
      description: suggestion.description,
      salesperson_id: selectedSalesperson,
      priority: suggestion.priority,
      task_type: suggestion.actionType,
      due_date: new Date().toISOString().split('T')[0],
    });
  };

  const selectedPerson = salespeople?.find(sp => sp.id === selectedSalesperson);

  return (
    <Card className="glass border border-primary/30 dark:border-glow card-elevated bg-gradient-to-br from-primary/5 via-card to-accent/5 overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/30">
        <CardTitle className="text-lg font-display font-semibold flex items-center gap-2">
          <div className="p-2 rounded-xl gradient-primary shadow-md">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="gradient-text">Next Best Action</span>
          <Badge variant="outline" className="ml-2 text-xs bg-gradient-to-r from-primary/20 to-accent/20 border-primary/30 text-primary shadow-sm">
            IA
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {/* Salesperson Selection */}
        <div className="flex gap-2">
          <Select value={selectedSalesperson} onValueChange={setSelectedSalesperson}>
            <SelectTrigger className="flex-1 border-border/50 bg-background/50">
              <SelectValue placeholder="Selecione um vendedor" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border/50">
              {salespeople?.map((sp) => (
                <SelectItem key={sp.id} value={sp.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5 border border-background">
                      <AvatarImage src={sp.avatar_url || undefined} />
                      <AvatarFallback className="text-[9px] gradient-primary text-white">
                        {sp.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {sp.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            onClick={handleGenerate}
            disabled={!selectedSalesperson || nextBestAction.isPending}
            className="gap-2 gradient-primary text-white shadow-md hover:shadow-lg transition-all"
          >
            {nextBestAction.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Gerar Sugestões
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        {nextBestAction.data && (
          <div className="space-y-4 animate-in fade-in-50 duration-500">
            {/* Insight */}
            <div className="flex items-start gap-3 p-4 rounded-xl glass border border-primary/30 bg-gradient-to-r from-primary/10 to-transparent">
              <div className="p-1.5 rounded-lg bg-primary/20">
                <Lightbulb className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm text-foreground font-medium">{nextBestAction.data.insight}</p>
            </div>

            {/* Suggestions */}
            <div className="space-y-3">
              <h4 className="text-sm font-display font-medium text-muted-foreground uppercase tracking-wider">
                Próximas ações recomendadas para <span className="gradient-text">{selectedPerson?.name}</span>:
              </h4>
              
              {nextBestAction.data.suggestions.map((suggestion, index) => {
                const actionType = actionTypeConfig[suggestion.actionType] || actionTypeConfig.other;
                const ActionIcon = actionType.icon;
                const priority = priorityConfig[suggestion.priority];

                return (
                  <div
                    key={index}
                    className="p-4 rounded-xl glass border border-border/40 hover:border-primary/40 hover-lift transition-all group cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className={cn("p-1.5 rounded-lg", `bg-current/10`)}>
                            <ActionIcon className={cn("h-4 w-4", actionType.color)} />
                          </div>
                          <span className={cn("text-xs font-medium", actionType.color)}>{actionType.label}</span>
                          <Badge variant="outline" className={cn("text-[10px] shadow-sm", priority.className)}>
                            {priority.label}
                          </Badge>
                          {suggestion.dealClient && (
                            <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                              {suggestion.dealClient}
                            </span>
                          )}
                        </div>
                        
                        <h5 className="font-display font-medium">{suggestion.title}</h5>
                        <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-all border-status-success/30 hover:border-status-success hover:bg-status-success/10 text-status-success"
                        onClick={() => handleCreateTask(suggestion)}
                        disabled={createTask.isPending}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Criar Tarefa
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!nextBestAction.data && !nextBestAction.isPending && (
          <div className="text-center py-10 space-y-3">
            <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto">
              <Sparkles className="h-12 w-12 text-primary/50" />
            </div>
            <div>
              <p className="font-display font-medium text-muted-foreground">Selecione um vendedor e clique em "Gerar Sugestões"</p>
              <p className="text-sm text-muted-foreground/70 mt-1">A IA analisará o pipeline e sugerirá as melhores ações</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
