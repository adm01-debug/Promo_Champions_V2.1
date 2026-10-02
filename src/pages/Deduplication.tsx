import React, { useState, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useDeduplicationScan,
  type DuplicateGroup,
} from '@/hooks/crm/useDeduplicationScan';
import { clientService } from '@/services/clientService';
import { PageTransition, itemVariants } from '@/components/transitions/PageTransition';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Merge, AlertTriangle, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { MergeConflictsResolver } from '@/components/admin/MergeConflictsResolver';

import { formatBRLCompact } from '@/lib/money';

const Deduplication = () => {
  const queryClient = useQueryClient();
  const [selectedGroup, setSelectedGroup] = useState<DuplicateGroup | null>(null);
  const [isResolverOpen, setIsResolverOpen] = useState(false);
  const [ignoredKeys, setIgnoredKeys] = useState<Set<string>>(new Set());

  const { data: duplicates, isLoading } = useDeduplicationScan();

  const mergeMutation = useMutation({
    mutationFn: clientService.mergeClients,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deduplication-scan'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Registros mesclados com sucesso!');
      setIsResolverOpen(false);
      setSelectedGroup(null);
    },
    onError: error => {
      toast.error(`Erro ao mesclar: ${error.message}`);
    },
  });

  const handleOpenMerge = useCallback((group: DuplicateGroup) => {
    setSelectedGroup(group);
    setIsResolverOpen(true);
  }, []);

  const handleDismiss = useCallback((key: string) => {
    setIgnoredKeys(prev => new Set([...prev, key]));
    toast.info('Sugestão ignorada temporariamente');
  }, []);

  const activeDuplicates = useMemo(
    () => (duplicates || []).filter(g => !ignoredKeys.has(g.key)),
    [duplicates, ignoredKeys]
  );

  const MATCH_COLORS = {
    email: 'text-primary border-primary/30 bg-primary/10',
    phone: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
    name: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
  };

  return (
    <>
      <Helmet>
        <title>Deduplicação | Promo Champions</title>
        <meta
          name="description"
          content="Detecte e mescle registros duplicados automaticamente."
        />
      </Helmet>
      <PageTransition>
        <div className="container max-w-5xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <motion.div variants={itemVariants}>
            <h1 className="text-page-title font-display">Deduplicação Inteligente</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isLoading
                ? 'Escaneando...'
                : `${activeDuplicates.length} grupo(s) de possíveis duplicatas encontrados`}
            </p>
          </motion.div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : activeDuplicates.length === 0 ? (
            <Card className="p-8 text-center glass border-border/40">
              <Check className="h-12 w-12 text-status-success mx-auto mb-3" />
              <p className="font-display font-semibold">Base limpa!</p>
              <p className="text-sm text-muted-foreground">
                Nenhuma duplicata detectada.
              </p>
            </Card>
          ) : (
            <motion.div variants={itemVariants} className="space-y-3">
              {activeDuplicates.map(group => (
                <Card key={group.key} className="p-4 glass border-border/40">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-status-warning" />
                      <span className="text-sm font-semibold">
                        {group.clients.length} registros similares
                      </span>
                      <Badge
                        variant="outline"
                        className={cn('text-[10px]', MATCH_COLORS[group.match_type])}
                      >
                        {group.match_type === 'email'
                          ? 'Email'
                          : group.match_type === 'phone'
                            ? 'Telefone'
                            : 'Nome'}{' '}
                        {Math.round(group.similarity * 100)}%
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="default"
                        className="h-7 text-xs gap-1 gradient-primary"
                        onClick={() => handleOpenMerge(group)}
                      >
                        <Merge className="h-3 w-3" /> Mesclar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => handleDismiss(group.key)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    {group.clients.map((c, i) => (
                      <div
                        key={c.id}
                        className={cn(
                          'flex items-center gap-3 p-2 rounded-lg text-xs transition-all',
                          i === 0
                            ? 'bg-primary/5 border border-primary/20'
                            : 'bg-white/5 border border-transparent'
                        )}
                      >
                        {i === 0 && (
                          <Badge
                            variant="outline"
                            className="text-[9px] shrink-0 bg-primary/10 text-primary border-primary/20"
                          >
                            Principal
                          </Badge>
                        )}
                        <span className="font-medium flex-1 truncate">{c.name}</span>
                        <span className="text-muted-foreground truncate hidden md:block">
                          {c.email || '—'}
                        </span>
                        <span className="text-muted-foreground truncate hidden md:block">
                          {c.phone || '—'}
                        </span>
                        <span className="font-semibold text-primary/80">
                          {formatBRLCompact(c.total_value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </motion.div>
          )}
        </div>

        {selectedGroup && (
          <MergeConflictsResolver
            open={isResolverOpen}
            onOpenChange={setIsResolverOpen}
            clients={selectedGroup.clients}
            onMerge={(targetId, duplicateIds, preferredFields) =>
              mergeMutation.mutate({ targetId, duplicateIds, preferredFields })
            }
            isMerging={mergeMutation.isPending}
          />
        )}
      </PageTransition>
    </>
  );
};

export default Deduplication;
