import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, type SelectedOrder } from './Client360ViewHelpers';

interface OrdersTableProps {
  orders: SelectedOrder[];
  onSelectOrder: (order: SelectedOrder) => void;
}

export function OrdersTable({ orders, onSelectOrder }: OrdersTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-accent/10">
          <TableRow className="border-border/10 hover:bg-transparent">
            <TableHead className="text-[10px] font-black uppercase tracking-widest">
              Data
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest">
              Produto / SKU
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">
              Valor
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">
              Status
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length > 0 ? (
            orders.map(order => (
              <TableRow
                key={order.id}
                className="border-border/10 group transition-colors hover:bg-white/5"
              >
                <TableCell className="text-xs font-medium py-4">
                  {new Date(order.created_at).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase group-hover:text-primary transition-colors">
                      {order.product_name}
                    </span>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">
                      SKU: {order.sku || 'N/A'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-sm font-black text-primary">
                    {formatCurrency(Number(order.amount))}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[9px] font-black border-none h-5',
                      order.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : order.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-rose-500/10 text-rose-500'
                    )}
                  >
                    {order.status?.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => onSelectOrder(order)}
                    className="p-2 rounded-lg bg-accent/20 border border-white/5 hover:bg-primary/20 hover:border-primary/50 transition-all"
                  >
                    <Eye className="h-3.5 w-3.5 text-primary" />
                  </button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12">
                <p className="text-xs font-bold text-muted-foreground uppercase">
                  Nenhum pedido encontrado com estes filtros
                </p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
