import { Zap, Download, Sparkles } from 'lucide-react';
import { History as HistoryIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Client360HeaderProps {
  clientName: string;
  isVip: boolean;
  isExporting: boolean;
  onExport: () => void;
}

export function Client360Header({
  clientName,
  isVip,
  isExporting,
  onExport,
}: Client360HeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h2 className="text-3xl font-black uppercase tracking-tighter text-primary flex items-center gap-3">
          <HistoryIcon className="h-8 w-8 text-primary" />
          Intelligence Hub 360º
          <Badge
            variant="outline"
            className="text-[10px] bg-primary/10 border-primary/20 animate-pulse flex items-center gap-1"
          >
            <Sparkles className="h-2.5 w-2.5" /> Neural Engine 10/10
          </Badge>
        </h2>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Análise comportamental profunda de {clientName}
          </p>
          <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
          <span className="text-[10px] font-black text-emerald-500 uppercase">
            Perﬁl: {isVip ? 'VIP Diamond' : 'Standard'}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 w-full md:w-auto">
        <button
          onClick={() => toast.info('Sincronizando com o ERP...')}
          className="flex-1 md:flex-none flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
        >
          <Zap className="h-3.5 w-3.5 text-primary" />
          Sincronizar
        </button>
        <button
          onClick={onExport}
          disabled={isExporting}
          className="flex-1 md:flex-none flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest hover:scale-[1.05] transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:scale-100"
        >
          {isExporting ? (
            <Zap className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
          Dossiê PDF
        </button>
      </div>
    </div>
  );
}
