import { useNextBestAction, NextBestAction } from '@/hooks/useNextBestAction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Phone, Mail, Users, ArrowRight, MessageSquare, FileText, Loader2, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface NextBestActionCardProps {
  salespersonId?: string;
}

const actionIcons: Record<string, React.ReactNode> = {
  call: <Phone className="h-4 w-4" />,
  meeting: <Users className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  follow_up: <ArrowRight className="h-4 w-4" />,
  proposal: <FileText className="h-4 w-4" />,
  other: <MessageSquare className="h-4 w-4" />,
};

const priorityColors: Record<string, string> = {
  high: 'bg-destructive/10 text-destructive border-destructive/20',
  medium: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  low: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
};

const priorityLabels: Record<string, string> = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
};

export function NextBestActionCard({ salespersonId }: NextBestActionCardProps) {
  const { data, isLoading, error } = useNextBestAction(salespersonId);

  if (!salespersonId) return null;

  return (
    <Card className="border-primary/20 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Lightbulb className="h-4 w-4 text-primary" />
          </div>
          Próximas Melhores Ações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analisando com IA...
            </div>
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Não foi possível carregar as sugestões.
          </div>
        )}

        {data && (
          <>
            {data.insight && (
              <p className="text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-3 mb-4">
                {data.insight}
              </p>
            )}

            {data.suggestions?.map((action, idx) => (
              <ActionItem key={idx} action={action} index={idx} />
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ActionItem({ action, index }: { action: NextBestAction; index: number }) {
  return (
    <div className="flex gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex-shrink-0 mt-0.5">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          {actionIcons[action.actionType] || actionIcons.other}
        </div>
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{action.title}</span>
          <Badge variant="outline" className={`text-xs ${priorityColors[action.priority] || ''}`}>
            {priorityLabels[action.priority] || action.priority}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {action.description}
        </p>
        {action.dealClient && (
          <span className="text-xs text-primary/80">
            Cliente: {action.dealClient}
          </span>
        )}
      </div>
    </div>
  );
}
