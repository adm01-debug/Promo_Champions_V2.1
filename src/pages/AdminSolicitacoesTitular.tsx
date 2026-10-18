import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  ChevronLeft,
  ChevronRight,
  Eraser,
  Play,
  Plus,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from 'lucide-react';

import { PageTransition } from '@/components/transitions/PageTransition';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

import {
  DataSubjectRequest,
  useAnonymizeDataSubject,
  useCreateDataSubjectRequest,
  useDataSubjectRequests,
  useUpdateDataSubjectRequest,
} from '@/hooks/admin/useDataSubjectRequests';

const PAGE_SIZE = 25;

const REQUEST_TYPE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'Todos os tipos' },
  { value: 'access', label: 'Acesso' },
  { value: 'rectification', label: 'Retificação' },
  { value: 'erasure', label: 'Eliminação' },
  { value: 'portability', label: 'Portabilidade' },
  { value: 'consent_revocation', label: 'Revogação de consentimento' },
  { value: 'information', label: 'Informação' },
];

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'Todos os status' },
  { value: 'pending', label: 'Pendente' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'completed', label: 'Concluída' },
  { value: 'rejected', label: 'Rejeitada' },
];

function typeLabel(type: string): string {
  return REQUEST_TYPE_OPTIONS.find(o => o.value === type)?.label ?? type;
}

function statusLabel(status: string): string {
  return STATUS_OPTIONS.find(o => o.value === status)?.label ?? status;
}

function statusVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'completed') return 'default';
  if (status === 'rejected') return 'destructive';
  if (status === 'in_progress') return 'secondary';
  return 'outline';
}

function isOverdue(request: DataSubjectRequest): boolean {
  return (
    (request.status === 'pending' || request.status === 'in_progress') &&
    new Date(request.due_at).getTime() < Date.now()
  );
}

function AdminSolicitacoesTitular() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [requestType, setRequestType] = useState('all');
  const [page, setPage] = useState(0);
  const [newEmail, setNewEmail] = useState('');
  const [newType, setNewType] = useState('access');
  const [newNotes, setNewNotes] = useState('');
  const [erasureTarget, setErasureTarget] = useState<DataSubjectRequest | null>(null);

  const filters = useMemo(
    () => ({ search, status, requestType, page, pageSize: PAGE_SIZE }),
    [search, status, requestType, page]
  );

  const { data, isLoading, isFetching, isError, error, refetch } =
    useDataSubjectRequests(filters);
  const createMutation = useCreateDataSubjectRequest();
  const updateMutation = useUpdateDataSubjectRequest();
  const anonymizeMutation = useAnonymizeDataSubject();

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Mutações e filtros podem esvaziar a última página — volta para a última válida.
  useEffect(() => {
    if (page > totalPages - 1) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync({
        subject_email: newEmail,
        request_type: newType,
        notes: newNotes,
      });
      setNewEmail('');
      setNewNotes('');
      toast.success('Solicitação registrada na fila do titular.');
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleStatus = async (id: string, nextStatus: string) => {
    try {
      await updateMutation.mutateAsync({ id, status: nextStatus });
      toast.success(
        nextStatus === 'in_progress'
          ? 'Solicitação em andamento.'
          : `Solicitação ${statusLabel(nextStatus).toLowerCase()}.`
      );
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleAnonymize = async () => {
    if (!erasureTarget) return;
    try {
      await anonymizeMutation.mutateAsync(erasureTarget);
      toast.success(
        `Anonimização de ${erasureTarget.subject_email} concluída e registrada.`
      );
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setErasureTarget(null);
    }
  };

  return (
    <PageTransition>
      <Helmet>
        <title>Solicitações do titular | Administração</title>
        <meta
          name="description"
          content="Fila de solicitações do titular (LGPD art. 18): acesso, retificação, eliminação, portabilidade e revogação."
        />
        <link rel="canonical" href={`${window.location.origin}/admin/solicitacoes-titular`} />
      </Helmet>

      <div className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-page-title flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" aria-hidden />
              Solicitações do titular
            </h1>
            <p className="text-sm text-muted-foreground">
              Direitos do titular (LGPD art. 18) com SLA legal de 15 dias por
              solicitação.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Registrar solicitação</CardTitle>
            <CardDescription>
              Use para pedidos recebidos por outros canais (telefone, WhatsApp,
              e-mail direto). O titular também pode abrir a própria solicitação.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-[2fr_2fr_2fr_auto] gap-3 items-end">
            <div className="space-y-1">
              <Label htmlFor="dsr-email">E-mail do titular</Label>
              <Input
                id="dsr-email"
                type="email"
                placeholder="titular@empresa.com"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="dsr-type">Tipo</Label>
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger id="dsr-type" aria-label="Tipo de solicitação">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REQUEST_TYPE_OPTIONS.filter(o => o.value !== 'all').map(o => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="dsr-notes">Observações (opcional)</Label>
              <Input
                id="dsr-notes"
                placeholder="Recebido por telefone"
                value={newNotes}
                onChange={e => setNewNotes(e.target.value)}
              />
            </div>
            <Button
              onClick={() => void handleCreate()}
              disabled={createMutation.isPending || !newEmail}
            >
              <Plus className="h-4 w-4 mr-2" />
              Registrar
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="gap-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <CardTitle className="text-base">
                {total} solicitação(ões) na fila
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Buscar por e-mail…"
                  value={search}
                  onChange={e => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                  className="sm:w-64"
                  aria-label="Buscar por e-mail"
                />
                <Select
                  value={status}
                  onValueChange={v => {
                    setStatus(v);
                    setPage(0);
                  }}
                >
                  <SelectTrigger className="sm:w-48" aria-label="Filtrar por status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={requestType}
                  onValueChange={v => {
                    setRequestType(v);
                    setPage(0);
                  }}
                >
                  <SelectTrigger className="sm:w-56" aria-label="Filtrar por tipo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REQUEST_TYPE_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={`sk-${i}`} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : isError ? (
              <div className="py-10 text-center space-y-3">
                <p className="text-sm text-destructive">
                  Falha ao carregar a fila do titular
                  {error ? `: ${error.message}` : '.'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void refetch()}
                  disabled={isFetching}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`}
                  />
                  Tentar novamente
                </Button>
              </div>
            ) : rows.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Nenhuma solicitação com os filtros atuais.
              </p>
            ) : (
              rows.map(row => {
                const open = row.status === 'pending' || row.status === 'in_progress';
                return (
                  <div
                    key={row.id}
                    className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 rounded-lg border border-border bg-card/60 p-3"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="truncate font-medium">{row.subject_email}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant={isOverdue(row) ? 'destructive' : 'outline'}>
                          {typeLabel(row.request_type)}
                        </Badge>
                        <Badge variant={statusVariant(row.status)}>
                          {statusLabel(row.status)}
                        </Badge>
                        <span>
                          {format(new Date(row.requested_at), 'dd/MM/yyyy', {
                            locale: ptBR,
                          })}
                        </span>
                        <span>
                          · prazo{' '}
                          {format(new Date(row.due_at), 'dd/MM/yyyy', {
                            locale: ptBR,
                          })}
                          {isOverdue(row) ? ' (vencido)' : ''}
                        </span>
                        {row.notes ? (
                          <span className="truncate">· {row.notes}</span>
                        ) : null}
                      </div>
                    </div>
                    {open && (
                      <div className="flex flex-wrap gap-2">
                        {row.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void handleStatus(row.id, 'in_progress')}
                            disabled={updateMutation.isPending}
                            aria-label={`Processar solicitação de ${row.subject_email}`}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Processar
                          </Button>
                        )}
                        {row.request_type === 'erasure' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setErasureTarget(row)}
                            disabled={anonymizeMutation.isPending}
                            aria-label={`Anonimizar dados de ${row.subject_email}`}
                          >
                            <Eraser className="h-4 w-4 mr-2" />
                            Anonimizar
                          </Button>
                        )}
                        {row.request_type !== 'erasure' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void handleStatus(row.id, 'completed')}
                            disabled={updateMutation.isPending}
                            aria-label={`Concluir solicitação de ${row.subject_email}`}
                          >
                            <ShieldCheck className="h-4 w-4 mr-2" />
                            Concluir
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void handleStatus(row.id, 'rejected')}
                          disabled={updateMutation.isPending}
                          aria-label={`Rejeitar solicitação de ${row.subject_email}`}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Rejeitar
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">
                  Página {page + 1} de {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!erasureTarget} onOpenChange={open => !open && setErasureTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anonimizar dados do titular?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é irreversível: os dados pessoais de{' '}
              <strong>{erasureTarget?.subject_email}</strong> (nome, e-mail,
              telefone, IP e user-agent) serão substituídos por um tombstone
              hash em todas as tabelas, e os consentimentos ativos serão
              revogados. A solicitação será marcada como concluída com o
              resultado da anonimização.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={anonymizeMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={e => {
                e.preventDefault();
                void handleAnonymize();
              }}
              disabled={anonymizeMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {anonymizeMutation.isPending ? 'Anonimizando…' : 'Anonimizar agora'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTransition>
  );
}

export default AdminSolicitacoesTitular;
