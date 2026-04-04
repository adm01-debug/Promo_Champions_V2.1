import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Briefcase,
  X,
  Search,
  Clock,
  DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Deal {
  id: string;
  client_name: string;
  product_name: string;
  amount: number;
  status: string;
  created_at: string;
}

interface DealContextSelectorProps {
  selectedDeal: Deal | null;
  onSelectDeal: (deal: Deal | null) => void;
  salespersonId: string | null;
  className?: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  lead: { label: 'Lead', color: 'bg-slate-500/20 text-slate-400' },
  qualified: { label: 'Qualificado', color: 'bg-info/20 text-info' },
  proposal: { label: 'Proposta', color: 'bg-amber-500/20 text-amber-400' },
  negotiation: { label: 'Negociação', color: 'bg-primary/20 text-primary' },
  closed_won: { label: 'Fechado', color: 'bg-emerald-500/20 text-emerald-400' },
  closed_lost: { label: 'Perdido', color: 'bg-destructive/20 text-destructive' },
};

export function DealContextSelector({
  selectedDeal,
  onSelectDeal,
  salespersonId,
  className,
}: DealContextSelectorProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [open, setOpen] = React.useState(false);

  // Fetch deals for the salesperson
  const { data: deals, isLoading } = useQuery({
    queryKey: ['deals-for-chat', salespersonId],
    queryFn: async () => {
      if (!salespersonId) return [];
      
      const { data, error } = await supabase
        .from('sales')
        .select('id, client_name, product_name, amount, status, created_at')
        .eq('salesperson_id', salespersonId)
        .order('updated_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as Deal[];
    },
    enabled: !!salespersonId,
  });

  // Filter deals by search
  const filteredDeals = React.useMemo(() => {
    if (!deals) return [];
    if (!searchQuery.trim()) return deals;
    
    const query = searchQuery.toLowerCase();
    return deals.filter(
      deal =>
        deal.client_name.toLowerCase().includes(query) ||
        deal.product_name.toLowerCase().includes(query)
    );
  }, [deals, searchQuery]);

  const handleSelect = (deal: Deal) => {
    onSelectDeal(deal);
    setOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectDeal(null);
  };

  if (!salespersonId) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={selectedDeal ? 'secondary' : 'outline'}
          size="sm"
          className={cn(
            'h-8 gap-2 text-xs',
            selectedDeal && 'bg-primary/10 border-primary/30 hover:bg-primary/20',
            className
          )}
        >
          <Briefcase className="h-3.5 w-3.5" />
          {selectedDeal ? (
            <>
              <span className="max-w-[120px] truncate">{selectedDeal.client_name}</span>
              <X
                className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground"
                onClick={handleClear}
              />
            </>
          ) : (
            <span>Contexto de Deal</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="h-4 w-4 text-primary" />
            <h4 className="font-medium text-sm">Selecionar Deal</h4>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Selecione um deal para análise contextual e recomendações personalizadas
          </p>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente ou produto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>

        <ScrollArea className="max-h-[300px]">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Carregando deals...
            </div>
          ) : filteredDeals.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {searchQuery ? 'Nenhum deal encontrado' : 'Sem deals disponíveis'}
            </div>
          ) : (
            <div className="p-1">
              {filteredDeals.map((deal) => {
                const status = STATUS_LABELS[deal.status] || { label: deal.status, color: 'bg-muted' };
                const isSelected = selectedDeal?.id === deal.id;
                
                return (
                  <button
                    key={deal.id}
                    onClick={() => handleSelect(deal)}
                    className={cn(
                      'w-full text-left p-2.5 rounded-md transition-colors',
                      'hover:bg-muted/50',
                      isSelected && 'bg-primary/10 border border-primary/30'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-medium text-sm truncate">{deal.client_name}</span>
                      <Badge variant="secondary" className={cn('text-[10px] px-1.5 py-0', status.color)}>
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mb-1.5">
                      {deal.product_name}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                          minimumFractionDigits: 0,
                        }).format(deal.amount)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(deal.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {selectedDeal && (
          <div className="p-2 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-7 text-xs text-muted-foreground"
              onClick={() => {
                onSelectDeal(null);
                setOpen(false);
              }}
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Remover contexto
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
