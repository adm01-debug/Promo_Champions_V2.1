import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { BellOff, ChevronLeft, ChevronRight, Download, Plus, RefreshCw, Trash2 } from 'lucide-react';

import { PageTransition } from '@/components/transitions/PageTransition';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { CampaignDeliveryLatencyCard } from '@/components/email/CampaignDeliveryLatencyCard';
import { CampaignHealthAlertsCard } from '@/components/email/CampaignHealthAlertsCard';
import { CampaignOptOutRateCard } from '@/components/email/CampaignOptOutRateCard';
import { EmailSuppressionMetricsCard } from '@/components/email/EmailSuppressionMetricsCard';
import { FailedDraftsCard } from '@/components/email/FailedDraftsCard';
import { RecoveryRateCard } from '@/components/email/RecoveryRateCard';

import { supabase } from '@/integrations/supabase/client';
import {
  useAddEmailOptOut,
  useEmailOptOuts,
  useRemoveEmailOptOut,
} from '@/hooks/email/useEmailOptOuts';

const PAGE_SIZE = 25;

const SOURCE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'Todas as origens' },
  { value: 'unsubscribe_link', label: 'Link de descadastro' },
  { value: 'one_click', label: 'One-click (RFC 8058)' },
  { value: 'hard_bounce', label: 'Hard bounce' },
  { value: 'complaint', label: 'Reclamação de spam' },
  { value: 'provider_unsubscribe', label: 'Descadastro no provedor' },
  { value: 'manual_admin', label: 'Adicionado manualmente' },
];

function sourceLabel(source: string): string {
  return SOURCE_OPTIONS.find((o) => o.value === source)?.label ?? source;
}

function sourceVariant(source: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (source === 'hard_bounce' || source === 'complaint') return 'destructive';
  if (source === 'manual_admin') return 'secondary';
  return 'outline';
}

function csvCell(value: unknown): string {
  const raw = value === null || value === undefined ? '' : String(value);
  // Prefixo protege contra CSV injection em planilhas.
  const safe = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

function AdminSupressaoEmails() {
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('all');
  const [page, setPage] = useState(0);
  const [newEmail, setNewEmail] = useState('');
  const [newReason, setNewReason] = useState('');
  const [exporting, setExporting] = useState(false);

  const filters = useMemo(
    () => ({ search, source, page, pageSize: PAGE_SIZE }),
    [search, source, page],
  );

  const { data, isLoading, isFetching, refetch } = useEmailOptOuts(filters);
  const addMutation = useAddEmailOptOut();
  const removeMutation = useRemoveEmailOptOut();

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleAdd = async () => {
    try {
      await addMutation.mutateAsync({ email: newEmail, reason: newReason });
      setNewEmail('');
      setNewReason('');
      toast.success('E-mail adicionado à lista de supressão.');
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleRemove = async (id: string, email: string) => {
    try {
      await removeMutation.mutateAsync(id);
      toast.success(`${email} removido da supressão. Envios voltam a ser permitidos.`);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      let query = supabase
        .from('email_opt_outs')
        .select('email, source, reason, created_at')
        .order('created_at', { ascending: false })
        .limit(10000);
      const term = search.trim().replace(/[%,_]/g, (m) => `\\${m}`);
      if (term) query = query.ilike('email', `%${term}%`);
      if (source !== 'all') query = query.eq('source', source);

      const { data: all, error } = await query;
      if (error) throw new Error(error.message);

      const header = ['email', 'origem', 'motivo', 'data'].join(',');
      const lines = (all ?? []).map((r) =>
        [
          csvCell(r.email),
          csvCell(sourceLabel(r.source)),
          csvCell(r.reason ?? ''),
          csvCell(format(new Date(r.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })),
        ].join(','),
      );
      const blob = new Blob([`\uFEFF${[header, ...lines].join('\n')}`], {
        type: 'text/csv;charset=utf-8;',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `supressao-emails-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(`${lines.length} registro(s) exportado(s).`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <PageTransition>
      <Helmet>
        <title>Supressão de e-mails | Administração</title>
        <meta
          name="description"
          content="Gerencie a lista de descadastro e supressão de e-mails: bounces, reclamações e opt-outs."
        />
        <link rel="canonical" href={`${window.location.origin}/admin/supressao-emails`} />
      </Helmet>

      <div className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-page-title flex items-center gap-2">
              <BellOff className="h-6 w-6 text-primary" aria-hidden />
              Supressão de e-mails
            </h1>
            <p className="text-sm text-muted-foreground">
              Endereços bloqueados para qualquer envio: descadastros, hard bounces e reclamações de
              spam.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isFetching}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button variant="outline" size="sm" onClick={() => void handleExport()} disabled={exporting}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </header>

        <EmailSuppressionMetricsCard />

        <CampaignOptOutRateCard />

        <CampaignDeliveryLatencyCard />

        <CampaignHealthAlertsCard />

        <FailedDraftsCard />

        <RecoveryRateCard />




        <Card>
          <CardHeader>
            <CardTitle className="text-base">Adicionar manualmente</CardTitle>
            <CardDescription>
              Use para atender pedidos recebidos por outros canais (telefone, WhatsApp, e-mail direto).
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-[2fr_2fr_auto] gap-3 items-end">
            <div className="space-y-1">
              <Label htmlFor="optout-email">E-mail</Label>
              <Input
                id="optout-email"
                type="email"
                placeholder="cliente@empresa.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="optout-reason">Motivo (opcional)</Label>
              <Input
                id="optout-reason"
                placeholder="Solicitou por telefone"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
              />
            </div>
            <Button onClick={() => void handleAdd()} disabled={addMutation.isPending || !newEmail}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="gap-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <CardTitle className="text-base">
                {total} endereço(s) na lista
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Buscar por e-mail…"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                  className="sm:w-64"
                  aria-label="Buscar por e-mail"
                />
                <Select
                  value={source}
                  onValueChange={(v) => {
                    setSource(v);
                    setPage(0);
                  }}
                >
                  <SelectTrigger className="sm:w-56" aria-label="Filtrar por origem">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCE_OPTIONS.map((o) => (
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
            ) : rows.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Nenhum endereço suprimido com os filtros atuais.
              </p>
            ) : (
              rows.map((row) => (
                <div
                  key={row.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-border bg-card/60 p-3"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="truncate font-medium">{row.email}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant={sourceVariant(row.source)}>{sourceLabel(row.source)}</Badge>
                      <span>
                        {format(new Date(row.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                      {row.reason ? <span className="truncate">· {row.reason}</span> : null}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void handleRemove(row.id, row.email)}
                    disabled={removeMutation.isPending}
                    aria-label={`Remover ${row.email} da supressão`}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remover
                  </Button>
                </div>
              ))
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
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
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
    </PageTransition>
  );
}

export default AdminSupressaoEmails;
