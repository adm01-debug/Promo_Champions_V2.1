import { Helmet } from "react-helmet-async";
import { TaskQueue } from '@/components/tasks/TaskQueue';
import { NextBestAction } from '@/components/tasks/NextBestAction';
import { Button } from '@/components/ui/button';
import { useCreateStagnantTasks } from '@/hooks/useStagnantTasks';
import { useTodayTasks } from '@/hooks/useTasks';
import { AlertTriangle, Loader2, ListTodo } from 'lucide-react';
import { TarefasLoadingSkeleton } from '@/components/skeletons/PageLoadingSkeleton';
import { SkeletonTransition } from '@/components/skeletons/SkeletonTransition';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/transitions/PageTransition';

export default function Tarefas() {
  const createStagnantTasks = useCreateStagnantTasks();
  const { isLoading } = useTodayTasks();

  return (
    <Helmet>
      <title>Tarefas | Promo Champions</title>
      <meta name="description" content="Gestão de tarefas e atividades pendentes" />
    </Helmet>
    <SkeletonTransition
      isLoading={isLoading}
      skeleton={<TarefasLoadingSkeleton />}
      duration={400}
    >
      <PageTransition>
        <div className="space-y-6">
          {/* Header */}
          <motion.div 
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl gradient-primary">
                <ListTodo className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">Fila de Tarefas</h1>
                <p className="text-muted-foreground">
                  Gerencie as tarefas diárias da sua equipe de vendas
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => createStagnantTasks.mutate()}
              disabled={createStagnantTasks.isPending}
              className="gap-2 border-primary/30 hover:border-primary/50 hover:bg-primary/10"
            >
              {createStagnantTasks.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              Gerar Tarefas de Follow-up
            </Button>
          </motion.div>

          {/* Next Best Action with AI */}
          <NextBestAction />

          {/* Task Queue */}
          <TaskQueue />
        </div>
      </PageTransition>
    </SkeletonTransition>
  );
}
