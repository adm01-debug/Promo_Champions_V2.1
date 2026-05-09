import { Helmet } from 'react-helmet-async';
import { ClientKanban } from '@/components/clients/ClientKanban';
import { PageTransition } from '@/components/transitions/PageTransition';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateTaskForm } from "@/components/tasks/CreateTaskForm";

export default function KanbanClientes() {
  const [taskModal, setTaskModal] = useState<{ open: boolean; clientId?: string; clientName?: string }>({ open: false });

  useEffect(() => {
    const handleCreateTask = (e: any) => {
      setTaskModal({ open: true, clientId: e.detail.clientId, clientName: e.detail.clientName });
    };
    window.addEventListener('create-task-modal', handleCreateTask);
    return () => window.removeEventListener('create-task-modal', handleCreateTask);
  }, []);

  return (
    <>
      <Helmet>
        <title>Kanban de Clientes | PROMO CHAMPIONS</title>
        <meta name="description" content="Visualize e gerencie seus clientes por estágio de relacionamento" />
      </Helmet>
      <PageTransition>
        <div className="space-y-4 sm:space-y-6 px-3 py-4 sm:px-4 sm:py-6 lg:px-8 lg:py-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Kanban de Clientes</h1>
            <p className="text-sm text-muted-foreground">Gerencie o relacionamento arrastando clientes entre estágios</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <ClientKanban />
          </motion.div>
        </div>
      </PageTransition>

      <Dialog open={taskModal.open} onOpenChange={(open) => setTaskModal(prev => ({ ...prev, open }))}>
        <DialogContent className="max-w-md bg-background/95 backdrop-blur-xl border-primary/20 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter italic">Create Task for {taskModal.clientName}</DialogTitle>
          </DialogHeader>
          <CreateTaskForm 
            clientId={taskModal.clientId} 
            onSuccess={() => setTaskModal({ open: false })} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
