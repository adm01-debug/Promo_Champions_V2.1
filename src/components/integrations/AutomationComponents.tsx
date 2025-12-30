import { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Clock, ArrowRight, 
  Trash2, Copy, MoreVertical, LucideIcon 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface AutomationRuleProps {
  id: string;
  name: string;
  trigger: string;
  action: string;
  isActive: boolean;
  lastRun?: string;
  runCount?: number;
  onToggle: (id: string, active: boolean) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
}

export const AutomationRule: FC<AutomationRuleProps> = ({
  id,
  name,
  trigger,
  action,
  isActive,
  lastRun,
  runCount = 0,
  onToggle,
  onEdit,
  onDelete,
  onDuplicate
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "p-4 rounded-lg border bg-card transition-all",
        isActive ? "border-primary/30" : "opacity-60"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            isActive ? "bg-primary/10" : "bg-muted"
          )}>
            <Zap className={cn(
              "h-5 w-5",
              isActive ? "text-primary" : "text-muted-foreground"
            )} />
          </div>

          <div className="space-y-1">
            <h4 className="font-medium">{name}</h4>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="px-2 py-0.5 rounded bg-muted text-xs">{trigger}</span>
              <ArrowRight className="h-3 w-3" />
              <span className="px-2 py-0.5 rounded bg-muted text-xs">{action}</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
              {lastRun && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Última: {lastRun}
                </span>
              )}
              <span>{runCount} execuções</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={isActive}
            onCheckedChange={(checked) => onToggle(id, checked)}
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(id)}>
                  Editar
                </DropdownMenuItem>
              )}
              {onDuplicate && (
                <DropdownMenuItem onClick={() => onDuplicate(id)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicar
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem 
                  onClick={() => onDelete(id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
};

// Lista de automações
interface AutomationListProps {
  children: ReactNode;
  className?: string;
}

export const AutomationList: FC<AutomationListProps> = ({ children, className }) => (
  <div className={cn("space-y-3", className)}>
    {children}
  </div>
);

// Card de template de automação
interface AutomationTemplateProps {
  name: string;
  description: string;
  icon: LucideIcon;
  category: string;
  onClick: () => void;
}

export const AutomationTemplate: FC<AutomationTemplateProps> = ({
  name,
  description,
  icon: Icon,
  category,
  onClick
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full p-4 rounded-lg border bg-card text-left hover:border-primary/50 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium">{name}</h4>
            <Badge variant="secondary" className="text-xs">{category}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </motion.button>
  );
};
