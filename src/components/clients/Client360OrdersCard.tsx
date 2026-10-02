import { Search, Filter, Package, History as HistoryIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OrdersTable } from './OrdersTable';
import { OrdersTimeline } from './OrdersTimeline';
import type { SelectedOrder } from './Client360ViewHelpers';

interface Client360OrdersCardProps {
  orders: SelectedOrder[];
  averageTicket: number;
  categories: string[];
  viewMode: 'table' | 'timeline';
  onViewModeChange: (mode: 'table' | 'timeline') => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  onValueRangeChange: (range: [number, number]) => void;
  onClearFilters: () => void;
  onSelectOrder: (order: SelectedOrder) => void;
}

export function Client360OrdersCard({
  orders,
  averageTicket,
  categories,
  viewMode,
  onViewModeChange,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  onValueRangeChange,
  onClearFilters,
  onSelectOrder,
}: Client360OrdersCardProps) {
  return (
    <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-border/10 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-section-title flex items-center gap-2 uppercase font-black tracking-tighter">
              <HistoryIcon className="h-5 w-5 text-primary" />
              Livro de Transações Detalhado
            </CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest mt-1">
              Gestão granular do histórico comercial
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-muted/50 p-1 rounded-xl border border-white/5 mr-2">
              <button
                onClick={() => onViewModeChange('timeline')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                  viewMode === 'timeline'
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Timeline
              </button>
              <button
                onClick={() => onViewModeChange('table')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                  viewMode === 'table'
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Tabela
              </button>
            </div>
            <div className="relative w-full md:w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                className="pl-10 h-10 bg-muted/50 border-white/5 rounded-xl text-xs"
                value={searchTerm}
                onChange={e => onSearchChange(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
              <SelectTrigger className="w-[130px] h-10 bg-muted/50 border-white/5 rounded-xl text-xs">
                <Package className="h-3.5 w-3.5 mr-2" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Categorias</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-[120px] h-10 bg-muted/50 border-white/5 rounded-xl text-xs">
                <Filter className="h-3.5 w-3.5 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Status</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-4 px-1">
          <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mr-2">
            Filtros Rápidos:
          </span>
          {[
            {
              label: 'Ticket Alto',
              filter: () => {
                onStatusFilterChange('all');
                onValueRangeChange([5000, 100000]);
              },
            },
            {
              label: 'Pendente',
              filter: () => {
                onStatusFilterChange('pending');
                onValueRangeChange([0, 100000]);
              },
            },
            {
              label: 'Últimos 30 dias',
              filter: () => {
                onStatusFilterChange('all');
                onValueRangeChange([0, 100000]);
              },
            },
          ].map(chip => (
            <button
              key={chip.label}
              onClick={chip.filter}
              className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold uppercase hover:bg-primary/20 hover:border-primary/30 transition-all"
            >
              {chip.label}
            </button>
          ))}
          <button
            onClick={onClearFilters}
            className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-[9px] font-bold uppercase text-rose-500 hover:bg-rose-500/20 transition-all ml-auto"
          >
            Limpar Tudo
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {viewMode === 'table' ? (
          <OrdersTable orders={orders} onSelectOrder={onSelectOrder} />
        ) : (
          <OrdersTimeline
            orders={orders}
            averageTicket={averageTicket}
            onSelectOrder={onSelectOrder}
          />
        )}
      </CardContent>
    </Card>
  );
}
