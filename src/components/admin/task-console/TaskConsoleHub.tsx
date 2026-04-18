import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { ListChecks, Users, ClipboardCheck, Sparkles } from 'lucide-react';
import { TaskCatalogManager } from './TaskCatalogManager';
import { TaskAssignmentDialog } from './TaskAssignmentDialog';
import { PendingApprovalsQueue } from './PendingApprovalsQueue';
import { XpAdjustmentPanel } from './XpAdjustmentPanel';
import { useTaskAssignments } from '@/hooks/admin-tasks/useTaskAssignments';
import { Badge } from '@/components/ui/badge';
import { STATUS_LABELS, STATUS_TONES } from './taskConsoleHelpers';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function TaskConsoleHub() {
  const { data: assignments, isLoading } = useTaskAssignments();
  const pendingCount = (assignments || []).filter((a) => a.status === 'submitted').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl">Console de Tarefas & XP</h1>
        <p className="text-muted-foreground">
          Gestão centralizada de tarefas, atribuições e pontuação dos vendedores.
        </p>
      </div>

      <Tabs defaultValue="catalog" className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="catalog"><ListChecks className="mr-2 h-4 w-4" />Catálogo</TabsTrigger>
          <TabsTrigger value="assignments"><Users className="mr-2 h-4 w-4" />Atribuições</TabsTrigger>
          <TabsTrigger value="approvals">
            <ClipboardCheck className="mr-2 h-4 w-4" />Aprovações
            {pendingCount > 0 && <Badge variant="destructive" className="ml-2">{pendingCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="xp"><Sparkles className="mr-2 h-4 w-4" />Ajustes XP</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="mt-6">
          <Card className="p-6"><TaskCatalogManager /></Card>
        </TabsContent>

        <TabsContent value="assignments" className="mt-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg">Atribuições ativas</h3>
                <p className="text-sm text-muted-foreground">Veja e atribua novas tarefas aos vendedores.</p>
              </div>
              <TaskAssignmentDialog />
            </div>
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <div className="space-y-2">
                {(assignments || []).slice(0, 30).map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded border">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{a.catalog?.title || 'Tarefa'}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.due_date ? `Entrega: ${format(new Date(a.due_date), "dd/MM/yyyy", { locale: ptBR })}` : 'Sem prazo'}
                      </p>
                    </div>
                    <Badge variant="outline" className={STATUS_TONES[a.status]}>{STATUS_LABELS[a.status]}</Badge>
                  </div>
                ))}
                {!assignments?.length && <p className="text-sm text-muted-foreground text-center py-6">Nenhuma atribuição</p>}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="mt-6">
          <Card className="p-6"><PendingApprovalsQueue /></Card>
        </TabsContent>

        <TabsContent value="xp" className="mt-6">
          <XpAdjustmentPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
