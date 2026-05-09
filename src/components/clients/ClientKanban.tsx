import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Building2, Mail, Phone, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useCountUp } from '@/hooks/useCountUp';
import { motion, AnimatePresence } from 'framer-motion';

interface Client {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  total_value: number;
}

interface PortfolioEntry {
  id: string;
  client_id: string;
  status: string;
  clients: Client;
}

const STAGES = [
  { id: 'active', label: 'Ativo', color: 'bg-success/10 border-success/30 text-success' },
  { id: 'nurturing', label: 'Nutrição', color: 'bg-info/10 border-info/30 text-info' },
  { id: 'at_risk', label: 'Em Risco', color: 'bg-rank-gold/10 border-rank-gold/30 text-rank-gold dark:text-rank-gold' },
  { id: 'inactive', label: 'Inativo', color: 'bg-destructive/10 border-destructive/30 text-destructive' },
  { id: 'churned', label: 'Perdido', color: 'bg-muted border-border text-muted-foreground' },
];

const StageValue = ({ value }: { value: number }) => {
  const animated = useCountUp(value, { duration: 1200 });
  return (
    <span className="text-xs font-bold text-primary tracking-tight">
      R$ {animated.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
    </span>
  );
};

export function ClientKanban() {
  const queryClient = useQueryClient();
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const { data: portfolio = [], isLoading } = useQuery({
    queryKey: ['client-kanban'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_portfolio')
        .select('id, client_id, status, clients(id, name, company, email, phone, total_value)')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return (data as unknown as PortfolioEntry[]) || [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ portfolioId, newStatus }: { portfolioId: string; newStatus: string }) => {
      const { error } = await supabase
        .from('client_portfolio')
        .update({ status: newStatus })
        .eq('id', portfolioId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-kanban'] });
      toast.success('Status do cliente atualizado');
    },
  });

  const groupedByStage = useMemo(() => {
    const grouped: Record<string, PortfolioEntry[]> = {};
    STAGES.forEach(s => { grouped[s.id] = []; });
    portfolio.forEach(entry => {
      const stage = grouped[entry.status] ? entry.status : 'active';
      grouped[stage].push(entry);
    });
    return grouped;
  }, [portfolio]);

  const handleDragStart = (portfolioId: string) => {
    setDraggedItem(portfolioId);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverStage(stageId);
  };

  const handleDrop = (stageId: string) => {
    if (draggedItem) {
      updateStatus.mutate({ portfolioId: draggedItem, newStatus: stageId });
    }
    setDraggedItem(null);
    setDragOverStage(null);
  };

  const formatValue = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);

  if (isLoading) {
    return <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {STAGES.map(s => <Card key={s.id} className="h-60 md:h-96 animate-pulse bg-muted/30" />)}
    </div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 overflow-x-auto pb-2">
      {STAGES.map(stage => {
        const entries = groupedByStage[stage.id] || [];
        const totalValue = entries.reduce((sum, e) => sum + (e.clients?.total_value || 0), 0);
        return (
          <div
            key={stage.id}
            className={cn(
              "rounded-xl border-2 border-dashed p-2 transition-all min-h-[300px] lg:min-h-[400px]",
              dragOverStage === stage.id ? "border-primary bg-primary/5" : "border-transparent"
            )}
            onDragOver={(e) => handleDragOver(e, stage.id)}
            onDragLeave={() => setDragOverStage(null)}
            onDrop={() => handleDrop(stage.id)}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn("text-xs", stage.color)}>
                  {stage.label}
                </Badge>
                <span className="text-xs text-muted-foreground">{entries.length}</span>
              </div>
              <span className="text-xs font-medium text-muted-foreground">{formatValue(totalValue)}</span>
            </div>

            <ScrollArea className="h-[calc(100vh-380px)] lg:h-[calc(100vh-320px)]">
              <div className="space-y-2">
                {entries.map(entry => (
                  <Card
                    key={entry.id}
                    draggable
                    onDragStart={() => handleDragStart(entry.id)}
                    className={cn(
                      "cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow border",
                      draggedItem === entry.id && "opacity-50"
                    )}
                  >
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{entry.clients?.name}</p>
                          {entry.clients?.company && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {entry.clients.company}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-primary">
                          {formatValue(entry.clients?.total_value || 0)}
                        </span>
                        <div className="flex gap-1">
                          {entry.clients?.email && <Mail className="h-3 w-3 text-muted-foreground" />}
                          {entry.clients?.phone && <Phone className="h-3 w-3 text-muted-foreground" />}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {entries.length === 0 && (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    <Users className="h-6 w-6 mx-auto mb-2 opacity-30" />
                    Arraste clientes aqui
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        );
      })}
    </div>
  );
}
