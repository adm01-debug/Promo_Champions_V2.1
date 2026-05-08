// NextBestAction - AI-powered action suggestions
import { useState } from 'react';
import { useNextBestAction } from '@/hooks/useNextBestAction';
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

interface ActionSuggestion {
  title: string;
  description: string;
  actionType: string;
  priority: 'high' | 'medium' | 'low';
  dealName?: string;
}

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
  discount: { label: 'Desconto', icon: Sparkles, color: 'text-status-success' },
  other: { label: 'Outro', icon: MoreHorizontal, color: 'text-muted-foreground' },
};

export function NextBestAction() {
  const [selectedSalesperson, setSelectedSalesperson] = useState<string>('');
  const { data: salespeople, isLoading: _loadingSalespeople } = useSalespeople();
  const nextBestAction = useNextBestAction();
  const createTask = useCreateTask();

  const handleGenerate = () => {
    if (selectedSalesperson) {
      nextBestAction.mutate(selectedSalesperson);
    }
  };

  const handleCreateTask = (suggestion: ActionSuggestion) => {
    const taskType = ['call', 'email', 'meeting', 'follow_up', 'proposal', 'discount', 'other'].includes(suggestion.actionType)
      ? (suggestion.actionType as 'call' | 'email' | 'meeting' | 'follow_up' | 'proposal' | 'other')
      : 'other';

    createTask.mutate({
      title: suggestion.title,
      description: suggestion.description,
      due_date: new Date().toISOString().split('T')[0],
      task_type: taskType,
      priority: suggestion.priority === 'high' ? 'high' : suggestion.priority === 'medium' ? 'medium' : 'low',
      salesperson_id: selectedSalesperson || undefined,
    });
  };

  const selectedPerson = salespeople?.find(s => s.id === selectedSalesperson);

  return (
    <Card className="glass dark:border-glow card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <Sparkles className="h-5 w-5 text-primary" />
          Próxima Melhor Ação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select value={selectedSalesperson} onValueChange={setSelectedSalesperson}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Selecione um vendedor" />
            </SelectTrigger>
            <SelectContent>
              {salespeople?.map((sp) => (
                <SelectItem key={sp.id} value={sp.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={sp.avatar_url || undefined} />
                      <AvatarFallback className="text-[10px]">{sp.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {sp.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleGenerate} disabled={!selectedSalesperson || nextBestAction.isPending}>
            {nextBestAction.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar Sugestões
              </>
            )}
          </Button>
        </div>

        {nextBestAction.data && (
          <div className="space-y-4 animate-in fade-in-50 duration-500">
            <div className="flex items-start gap-3 p-4 rounded-xl glass border border-primary/30 bg-gradient-to-r from-primary/10 to-transparent">
              <div className="p-1.5 rounded-lg bg-primary/20">
                <Lightbulb className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm text-foreground font-medium">{nextBestAction.data.insight}</p>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-display font-medium text-muted-foreground uppercase tracking-wider">
                Próximas ações recomendadas para <span className="gradient-text">{selectedPerson?.name}</span>:
              </h4>
              
              {nextBestAction.data.suggestions.map((suggestion, index) => {
                const actionType = actionTypeConfig[suggestion.actionType as keyof typeof actionTypeConfig] || actionTypeConfig.other;
                const ActionIcon = actionType.icon;
                const priority = priorityConfig[suggestion.priority];

                return (
                  <div
                    key={index}
                    className="glass rounded-xl p-4 border border-border/40 hover-lift transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={cn("p-2 rounded-lg bg-muted/50", actionType.color)}>
                          <ActionIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium text-sm">{suggestion.title}</h5>
                            <Badge variant="outline" className={cn("text-xs", priority.className)}>
                              {priority.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                          {suggestion.dealName && (
                            <p className="text-xs text-primary mt-1">Deal: {suggestion.dealName}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0"
                        onClick={() => handleCreateTask(suggestion)}
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
      </CardContent>
    </Card>
  );
}
