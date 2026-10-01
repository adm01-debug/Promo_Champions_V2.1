import {
  Calendar,
  CreditCard,
  DollarSign,
  Download,
  Info,
  Package,
  ShoppingBag,
  User,
  Zap,
  History as HistoryIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { formatCurrency, type SelectedOrder } from './Client360ViewHelpers';

interface OrderDetailsDialogProps {
  order: SelectedOrder | null;
  onClose: () => void;
}

export function OrderDetailsDialog({ order, onClose }: OrderDetailsDialogProps) {
  return (
    <Dialog open={!!order} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-black/90 backdrop-blur-2xl border-white/10 rounded-3xl overflow-hidden p-0 shadow-2xl">
        <div className="h-1 bg-gradient-to-r from-primary via-indigo-500 to-emerald-500" />
        <DialogHeader className="p-8 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-section-title font-black uppercase tracking-tighter">
                Detalhes da Transação
              </DialogTitle>
              <DialogDescription className="text-[10px] font-bold uppercase tracking-widest mt-1">
                ID: {order?.id}
              </DialogDescription>
            </div>
            <Badge
              className={cn(
                'font-black h-6 border-none',
                order?.status === 'completed'
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : order?.status === 'pending'
                    ? 'bg-amber-500/10 text-amber-500'
                    : 'bg-rose-500/10 text-rose-500'
              )}
            >
              {order?.status === 'completed'
                ? 'PEDIDO FINALIZADO'
                : order?.status?.toUpperCase() || 'PROCESSANDO'}
            </Badge>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-colors">
              <div className="text-[10px] font-black text-muted-foreground uppercase mb-3 tracking-widest flex items-center gap-2">
                <User className="h-3 w-3 text-primary" />
                Responsáveis Comercial
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">
                    SDR (Prospecção)
                  </span>
                  <span className="text-xs font-black uppercase truncate max-w-[120px]">
                    {order?.sdr?.name || order?.salesperson?.name || 'Sistema'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">
                    Closer (Fechamento)
                  </span>
                  <span className="text-xs font-black uppercase truncate max-w-[120px]">
                    {order?.closer?.name || 'Venda Direta'}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-colors">
              <div className="text-[10px] font-black text-muted-foreground uppercase mb-3 tracking-widest flex items-center gap-2">
                <Info className="h-3 w-3 text-primary" />
                Atributos de Venda
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">
                    Origem/Canal:
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[9px] font-black uppercase h-5 bg-white/5"
                  >
                    {order?.source || 'Orgânico'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">
                    Novo Cliente?
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[9px] font-black uppercase h-5',
                      order?.is_first_sale
                        ? 'bg-primary/10 text-primary border-primary/20'
                        : 'bg-white/5 opacity-60'
                    )}
                  >
                    {order?.is_first_sale ? 'SIM (CAC)' : 'RECOMPRA (LTV)'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                Fluxo Logístico & Pagamento
              </span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="flex justify-between px-2">
              {[
                {
                  label: 'Criação',
                  date: order?.created_at,
                  icon: Calendar,
                  done: true,
                },
                {
                  label: 'Pagamento',
                  date: order?.status === 'completed' ? order?.created_at : null,
                  icon: CreditCard,
                  done: order?.status === 'completed',
                },
                {
                  label: 'Faturamento',
                  date: order?.status === 'completed' ? order?.created_at : null,
                  icon: DollarSign,
                  done: order?.status === 'completed',
                },
                { label: 'Entrega', date: null, icon: Package, done: false },
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center gap-2 group/step">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center border transition-all',
                      step.done
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                        : 'bg-white/5 border-white/10 text-muted-foreground'
                    )}
                  >
                    <step.icon className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        'text-[8px] font-black uppercase',
                        step.done ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {step.label}
                    </span>
                    {step.date && (
                      <span className="text-[7px] font-bold text-muted-foreground/60">
                        {new Date(step.date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/5 p-6 hover:bg-white/[0.07] transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <ShoppingBag className="h-24 w-24 text-primary" />
            </div>

            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Discriminação de Itens
                </span>
              </div>
              <Badge
                variant="outline"
                className="text-[9px] font-mono border-white/10 uppercase"
              >
                v.{order?.version || '1.0'}
              </Badge>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-start group">
                <div className="flex flex-col">
                  <span className="text-sm font-black uppercase group-hover:text-primary transition-colors">
                    {order?.product_name}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                      SKU: {order?.sku || 'N/A'}
                    </span>
                    <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                    <span className="text-[10px] font-bold text-primary uppercase">
                      Garantia Vitalícia
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-foreground">
                    {formatCurrency(Number(order?.amount))}
                  </span>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase">
                    unid: 1.0
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2.5">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span className="text-[10px] font-bold uppercase">
                    Subtotal Bruto:
                  </span>
                  <span className="text-xs font-bold">
                    {formatCurrency(Number(order?.amount))}
                  </span>
                </div>
                <div className="flex justify-between items-center text-emerald-500">
                  <span className="text-[10px] font-bold uppercase flex items-center gap-1.5">
                    <Zap className="h-3 w-3 fill-emerald-500" />
                    Desconto de Campanha:
                  </span>
                  <span className="text-xs font-bold">- R$ 0,00</span>
                </div>
                <div className="flex justify-between items-center pt-4 mt-2 border-t border-white/20">
                  <span className="text-xs font-black uppercase tracking-widest">
                    Investimento Final:
                  </span>
                  <div className="text-right">
                    <span className="text-xl font-black text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]">
                      {formatCurrency(Number(order?.amount))}
                    </span>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase mt-0.5">
                      IVA Inc. / Faturado
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button className="flex-1 py-4 px-6 rounded-2xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2">
              <Download className="h-3.5 w-3.5" />
              Gerar Comprovante
            </button>
            <button className="flex-1 py-4 px-6 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
              <HistoryIcon className="h-3.5 w-3.5" />
              Histórico de Alterações
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
