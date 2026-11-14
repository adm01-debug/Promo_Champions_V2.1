import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Phone, ArrowRight, Inbox } from 'lucide-react';
import {
  type DialerQueue,
  useDeleteQueue,
  useDialerQueues,
  useNextItem,
  useRebuildQueue,
} from '@/hooks/dialer/usePowerDialer';
import { DialerQueueCard } from '@/components/dialer/DialerQueueCard';
import { CurrentCallCard } from '@/components/dialer/CurrentCallCard';
import { CallDispositionForm } from '@/components/dialer/CallDispositionForm';
import { QueueBuilderDialog } from '@/components/dialer/QueueBuilderDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const PowerDialer = () => {
  const [activeQueueId, setActiveQueueId] = useState<string | null>(null);
  const [currentItem, setCurrentItem] = useState<{
    item_id: string;
    sale_id: string;
    score: number;
  } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingQueue, setEditingQueue] = useState<DialerQueue | null>(null);
  const [queueToDelete, setQueueToDelete] = useState<DialerQueue | null>(null);

  const { data: queues, isLoading } = useDialerQueues();
  const nextItem = useNextItem();
  const rebuild = useRebuildQueue();
  const deleteQueue = useDeleteQueue();
  const { user } = useAuth();
  const { isAdmin } = useUserRoles();

  // Espelha a policy ALL de dialer_queues: só o dono ou um admin altera a fila.
  const canManage = (queue: DialerQueue) => isAdmin || queue.owner_id === user?.id;

  const handleEdit = (queue: DialerQueue) => {
    setEditingQueue(queue);
    setEditOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!queueToDelete) return;
    const deletedId = queueToDelete.id;
    try {
      await deleteQueue.mutateAsync(deletedId);
    } catch {
      return; // erro já exibido via toast
    }
    if (activeQueueId === deletedId) {
      setActiveQueueId(null);
      setCurrentItem(null);
    }
    setQueueToDelete(null);
  };

  const handleStart = async (queueId: string) => {
    setActiveQueueId(queueId);
    const next = await nextItem.mutateAsync(queueId);
    if (next) setCurrentItem(next);
  };

  const handleNext = async () => {
    if (!activeQueueId) return;
    setCurrentItem(null);
    const next = await nextItem.mutateAsync(activeQueueId);
    if (next) setCurrentItem(next);
  };

  return (
    <>
      <Helmet>
        <title>Power Dialer · Promo Champions</title>
        <meta
          name="description"
          content="Fila inteligente de chamadas com priorização por score, recência e horário ideal."
        />
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-page-title">Power Dialer</h1>
            <p className="text-muted-foreground">
              Fila inteligente de chamadas com priorização automática
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Nova fila
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase">
              Filas
            </h2>
            {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
            {!isLoading && (queues?.length ?? 0) === 0 && (
              <Card>
                <CardContent className="p-6 text-center space-y-2">
                  <Inbox className="h-10 w-10 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma fila criada ainda
                  </p>
                  <Button size="sm" onClick={() => setDialogOpen(true)}>
                    Criar primeira fila
                  </Button>
                </CardContent>
              </Card>
            )}
            {queues?.map(q => (
              <DialerQueueCard
                key={q.id}
                queue={q}
                isActive={q.id === activeQueueId}
                onSelect={() => setActiveQueueId(q.id)}
                onRebuild={() => rebuild.mutate(q.id)}
                onStart={() => handleStart(q.id)}
                onEdit={canManage(q) ? () => handleEdit(q) : undefined}
                onDelete={canManage(q) ? () => setQueueToDelete(q) : undefined}
                rebuilding={rebuild.isPending && rebuild.variables === q.id}
              />
            ))}
          </div>

          <div className="lg:col-span-2 space-y-4">
            {!currentItem && (
              <Card>
                <CardContent className="p-12 text-center space-y-3">
                  <Phone className="h-16 w-16 mx-auto text-muted-foreground" />
                  <h3 className="text-section-title">Pronto para discar?</h3>
                  <p className="text-sm text-muted-foreground">
                    Selecione uma fila e clique em <strong>Iniciar</strong> para começar.
                  </p>
                  {activeQueueId && (
                    <Button
                      onClick={() => handleStart(activeQueueId)}
                      loading={nextItem.isPending}
                    >
                      <ArrowRight className="h-4 w-4 mr-2" /> Próxima ligação
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {currentItem && (
              <>
                <CurrentCallCard
                  itemId={currentItem.item_id}
                  saleId={currentItem.sale_id}
                  score={currentItem.score}
                  onSkip={handleNext}
                />
                <CallDispositionForm
                  saleId={currentItem.sale_id}
                  queueItemId={currentItem.item_id}
                  onComplete={handleNext}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <QueueBuilderDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <QueueBuilderDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        queue={editingQueue}
      />

      <AlertDialog
        open={!!queueToDelete}
        onOpenChange={open => !open && !deleteQueue.isPending && setQueueToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir fila?</AlertDialogTitle>
            <AlertDialogDescription>
              A fila <strong>{queueToDelete?.name}</strong> e todos os seus itens
              pendentes serão excluídos. O histórico de chamadas já registradas é mantido.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteQueue.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={e => {
                e.preventDefault();
                void handleConfirmDelete();
              }}
              disabled={deleteQueue.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteQueue.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PowerDialer;
