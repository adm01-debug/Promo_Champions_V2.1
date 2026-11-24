import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Download, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { exportToCSV } from '@/utils/csvExport';
import { getLocalISODate } from '@/utils/dateHelpers';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type StatusFilter = 'all' | 'blocked' | 'review';

export const DuplicateBlockAudit = () => {
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const {
    data: logs,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['duplicate-block-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('duplicate_block_logs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const normalizedSearch = search.trim().toLowerCase();
  const filteredLogs = useMemo(() => {
    const rows = logs ?? [];
    return rows.filter(log => {
      const isBlocked = log.status === 'Blocked';
      if (statusFilter === 'blocked' && !isBlocked) return false;
      if (statusFilter === 'review' && isBlocked) return false;
      if (!normalizedSearch) return true;
      return (
        (log.entity_name ?? '').toLowerCase().includes(normalizedSearch) ||
        (log.block_type ?? '').toLowerCase().includes(normalizedSearch)
      );
    });
  }, [logs, normalizedSearch, statusFilter]);

  const handleExport = () => {
    exportToCSV(
      filteredLogs.map(log => ({
        'Data/Hora': format(new Date(log.created_at), 'dd/MM/yyyy HH:mm'),
        Entidade: log.entity_name ?? '',
        'Tipo de Bloqueio': log.block_type ?? '',
        Status: log.status === 'Blocked' ? 'Bloqueado' : 'Em Revisão',
        Auditor: log.auditor ?? '',
        'Confianca IA (%)': Number(((log.confidence_score ?? 0) * 100).toFixed(1)),
      })),
      `auditoria_bloqueios_${getLocalISODate()}`
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por entidade ou tipo..."
            className="pl-9 bg-black/20 border-white/10"
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="sm"
            className="gap-2 border-white/10 bg-black/20"
            onClick={() => setShowFilters(value => !value)}
            aria-pressed={showFilters}
          >
            <Filter className="h-4 w-4" /> Filtros
            {statusFilter !== 'all' && (
              <Badge variant="secondary" className="text-[9px] h-4 py-0 px-1">
                {statusFilter === 'blocked' ? 'Bloqueado' : 'Em Revisão'}
              </Badge>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-white/10 bg-black/20"
            onClick={handleExport}
            disabled={filteredLogs.length === 0}
          >
            <Download className="h-4 w-4" /> Exportar
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-white/10 bg-black/20 p-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Status
          </span>
          <Select
            value={statusFilter}
            onValueChange={value => setStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger className="h-8 w-44 text-xs" aria-label="Filtrar por status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="blocked">Bloqueado</SelectItem>
              <SelectItem value="review">Em Revisão</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-[10px] font-mono text-muted-foreground">
            {filteredLogs.length} de {logs?.length ?? 0} registros
          </span>
        </div>
      )}

      <Card className="border-white/5 bg-black/40 backdrop-blur-xl overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-sm text-destructive">
            Erro ao carregar a auditoria de bloqueios:{' '}
            {error instanceof Error ? error.message : 'desconhecido'}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-10 text-center">
            <Search className="mx-auto h-10 w-10 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">
              {normalizedSearch || statusFilter !== 'all'
                ? 'Nenhum bloqueio encontrado para a busca ou filtro.'
                : 'Nenhum bloqueio registrado.'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-white/2">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-[10px] font-mono font-bold uppercase tracking-wider">
                  Data / Hora
                </TableHead>
                <TableHead className="text-[10px] font-mono font-bold uppercase tracking-wider">
                  Entidade
                </TableHead>
                <TableHead className="text-[10px] font-mono font-bold uppercase tracking-wider">
                  Tipo de Bloqueio
                </TableHead>
                <TableHead className="text-[10px] font-mono font-bold uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="text-[10px] font-mono font-bold uppercase tracking-wider">
                  Agente / Auditor
                </TableHead>
                <TableHead className="text-[10px] font-mono font-bold uppercase tracking-wider text-right">
                  Confiança IA
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map(log => (
                <TableRow
                  key={log.id}
                  className="border-white/5 hover:bg-white/2 transition-colors group"
                >
                  <TableCell className="font-mono text-[11px] text-muted-foreground">
                    {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell className="font-bold text-xs">{log.entity_name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-[9px] font-mono bg-primary/5 text-primary border-primary/20"
                    >
                      {log.block_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {log.status === 'Blocked' ? (
                        <XCircle className="h-3 w-3 text-destructive" />
                      ) : (
                        <CheckCircle2 className="h-3 w-3 text-warning" />
                      )}
                      <span
                        className={cn(
                          'text-[10px] font-bold uppercase tracking-wider',
                          log.status === 'Blocked' ? 'text-destructive' : 'text-warning'
                        )}
                      >
                        {log.status === 'Blocked' ? 'Bloqueado' : 'Em Revisão'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {log.auditor}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-primary">
                    {(log.confidence_score * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};
