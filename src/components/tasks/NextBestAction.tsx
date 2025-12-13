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
  high: { label: 'Alta', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
  medium: { label: 'Média', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  low: { label: 'Baixa', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
};

const actionTypeConfig = {
  call: { label: 'Ligação', icon: Phone, color: 'text-blue-400' },
  meeting: { label: 'Reunião', icon: Users, color: 'text-purple-400' },
  email: { label: 'E-mail', icon: Mail, color: 'text-cyan-400' },
  follow_up: { label: 'Follow-up', icon: Clock, color: 'text-orange-400' },
  proposal: { label: 'Proposta', icon: FileText, color: 'text-pink-400' },
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
    <Card className="bg-gradient-to-br from-primary/5 via-card/50 to-purple-500/5 border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Next Best Action
          <Badge variant="outline" className="ml-2 text-xs bg-primary/10 border-primary/30">
            IA
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Salesperson Selection */}
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
                      <AvatarFallback className="text-xs">
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
            className="gap-2"
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
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">{nextBestAction.data.insight}</p>
            </div>

            {/* Suggestions */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                Próximas ações recomendadas para {selectedPerson?.name}:
              </h4>
              
              {nextBestAction.data.suggestions.map((suggestion, index) => {
                const actionType = actionTypeConfig[suggestion.actionType] || actionTypeConfig.other;
                const ActionIcon = actionType.icon;
                const priority = priorityConfig[suggestion.priority];

                return (
                  <div
                    key={index}
                    className="p-4 rounded-lg border border-border/50 bg-card/50 hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <ActionIcon className={cn("h-4 w-4", actionType.color)} />
                          <span className={cn("text-xs", actionType.color)}>{actionType.label}</span>
                          <Badge variant="outline" className={cn("text-xs", priority.className)}>
                            {priority.label}
                          </Badge>
                          {suggestion.dealClient && (
                            <span className="text-xs text-muted-foreground">
                              • {suggestion.dealClient}
                            </span>
                          )}
                        </div>
                        
                        <h5 className="font-medium">{suggestion.title}</h5>
                        <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
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
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>Selecione um vendedor e clique em "Gerar Sugestões"</p>
            <p className="text-sm">A IA analisará o pipeline e sugerirá as melhores ações</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
