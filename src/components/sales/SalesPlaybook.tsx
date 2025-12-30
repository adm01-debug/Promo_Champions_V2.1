import { FC, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Circle, 
  ChevronDown, 
  ChevronUp,
  BookOpen,
  Target,
  MessageSquare,
  FileText,
  Phone 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface PlaybookItem {
  id: string;
  type: 'task' | 'question' | 'tip' | 'script';
  title: string;
  description?: string;
  isRequired: boolean;
  isCompleted: boolean;
  content?: string;
}

interface Playbook {
  id: string;
  stage: string;
  title: string;
  description?: string;
  items: PlaybookItem[];
}

interface SalesPlaybookProps {
  playbook: Playbook;
  onItemComplete?: (itemId: string, completed: boolean) => void;
  className?: string;
}

const itemTypeConfig = {
  task: { icon: CheckCircle2, label: 'Tarefa', color: 'text-blue-500' },
  question: { icon: MessageSquare, label: 'Pergunta', color: 'text-green-500' },
  tip: { icon: Target, label: 'Dica', color: 'text-yellow-500' },
  script: { icon: FileText, label: 'Script', color: 'text-purple-500' },
};

export const SalesPlaybook: FC<SalesPlaybookProps> = ({
  playbook,
  onItemComplete,
  className,
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  
  const completedCount = playbook.items.filter(i => i.isCompleted).length;
  const progress = (completedCount / playbook.items.length) * 100;

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen size={20} className="text-primary" />
          <div>
            <h3 className="font-semibold">{playbook.title}</h3>
            <p className="text-xs text-muted-foreground">
              Estágio: {playbook.stage}
            </p>
          </div>
        </div>
        <Badge variant="outline">
          {completedCount}/{playbook.items.length}
        </Badge>
      </div>

      <Progress value={progress} className="h-2 mb-4" />

      <div className="space-y-2">
        {playbook.items.map(item => {
          const config = itemTypeConfig[item.type];
          const Icon = config.icon;
          const isExpanded = expandedItems.has(item.id);

          return (
            <Collapsible key={item.id} open={isExpanded}>
              <div
                className={cn(
                  'rounded-lg border transition-colors',
                  item.isCompleted && 'bg-muted/50'
                )}
              >
                <div className="flex items-center gap-3 p-3">
                  <Checkbox
                    checked={item.isCompleted}
                    onCheckedChange={checked => 
                      onItemComplete?.(item.id, checked as boolean)
                    }
                  />
                  
                  <Icon size={16} className={config.color} />
                  
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm font-medium',
                      item.isCompleted && 'line-through text-muted-foreground'
                    )}>
                      {item.title}
                    </p>
                    {item.description && !isExpanded && (
                      <p className="text-xs text-muted-foreground truncate">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {item.isRequired && (
                      <Badge variant="outline" className="text-xs">
                        Obrigatório
                      </Badge>
                    )}
                    {item.content && (
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => toggleExpand(item.id)}
                        >
                          {isExpanded ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    )}
                  </div>
                </div>

                <CollapsibleContent>
                  <div className="px-3 pb-3 pt-0">
                    <div className="p-3 rounded bg-muted/50 text-sm">
                      {item.description && (
                        <p className="text-muted-foreground mb-2">
                          {item.description}
                        </p>
                      )}
                      {item.content && (
                        <p className="whitespace-pre-wrap">{item.content}</p>
                      )}
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}
      </div>
    </Card>
  );
};

interface PlaybookSelectorProps {
  playbooks: Playbook[];
  selectedId?: string;
  onSelect?: (playbook: Playbook) => void;
}

export const PlaybookSelector: FC<PlaybookSelectorProps> = ({
  playbooks,
  selectedId,
  onSelect,
}) => (
  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
    {playbooks.map(playbook => {
      const completedCount = playbook.items.filter(i => i.isCompleted).length;
      const progress = (completedCount / playbook.items.length) * 100;

      return (
        <Card
          key={playbook.id}
          className={cn(
            'p-4 cursor-pointer transition-all hover:border-primary/50',
            selectedId === playbook.id && 'border-primary'
          )}
          onClick={() => onSelect?.(playbook)}
        >
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={16} className="text-primary" />
            <h4 className="font-medium">{playbook.title}</h4>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {playbook.stage}
          </p>
          <div className="flex items-center justify-between text-xs">
            <Progress value={progress} className="h-1 flex-1 mr-2" />
            <span className="text-muted-foreground">
              {completedCount}/{playbook.items.length}
            </span>
          </div>
        </Card>
      );
    })}
  </div>
);
