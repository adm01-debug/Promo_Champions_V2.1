import { History as HistoryIcon } from 'lucide-react';

interface Client360HeaderProps {
  clientName: string;
  isVip: boolean;
}

export function Client360Header({ clientName, isVip }: Client360HeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h2 className="text-3xl font-black uppercase tracking-tighter text-primary flex items-center gap-3">
          <HistoryIcon className="h-8 w-8 text-primary" />
          Intelligence Hub 360º
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
    </div>
  );
}
