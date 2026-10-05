import {
  Brain,
  TrendingUp,
  Zap,
  CalendarPlus,
  Clock,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export function Client360PredictiveCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-1 border-primary/30 bg-primary/5 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden group hover:bg-primary/10 transition-all border-dashed border-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-section-title flex items-center gap-2 text-xs uppercase font-black tracking-widest text-primary">
            <Brain className="h-4 w-4" /> Next Best Purchase
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block mb-2">
              Previsão Preditiva (24m)
            </span>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black uppercase text-foreground">
                  Linha Industrial X
                </h4>
                <p className="text-[9px] font-bold text-emerald-500 uppercase mt-0.5">
                  92% Probabilidade
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
          <button
            onClick={() => toast.success('Oportunidade adicionada ao pipeline!')}
            className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            <Zap className="h-3.5 w-3.5 fill-current" />
            Criar Oportunidade
          </button>
        </CardContent>
      </Card>

      <Card className="md:col-span-1 border-indigo-500/30 bg-indigo-500/5 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden group hover:bg-indigo-500/10 transition-all border-dashed border-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-section-title flex items-center gap-2 text-xs uppercase font-black tracking-widest text-indigo-400">
            <CalendarPlus className="h-4 w-4" /> Smart Follow-up
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="flex-1">
              <p className="text-[10px] font-bold text-foreground leading-tight">
                Momento ideal de reposição detectado para{' '}
                <span className="text-indigo-400 font-black">Próximos 12 dias</span>.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => toast.success('Lembrete agendado!')}
              className="py-3 px-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-[9px] font-black uppercase tracking-widest hover:bg-indigo-500/40 transition-all flex items-center justify-center gap-1.5"
            >
              <Clock className="h-3.5 w-3.5" />
              Agendar
            </button>
            <button
              onClick={() => toast.info('Canal de atendimento aberto.')}
              className="py-3 px-2 rounded-xl bg-white/5 border border-white/10 text-foreground text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              WhatsApp
            </button>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-1 border-emerald-500/30 bg-emerald-500/5 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden group hover:bg-emerald-500/10 transition-all border-dashed border-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-section-title flex items-center gap-2 text-xs uppercase font-black tracking-widest text-emerald-400">
            <ShieldCheck className="h-4 w-4" /> 10/10 Quality Assurance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: 'Glassmorphism UI', status: 'Active' },
              { label: 'Neural Predictions', status: 'Active' },
              { label: 'Glass Micro-interactions', status: 'Active' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-1 border-b border-white/5 last:border-0"
              >
                <span className="text-[9px] font-bold text-muted-foreground uppercase">
                  {item.label}
                </span>
                <Badge className="bg-emerald-500/20 text-emerald-500 border-none text-[7px] h-4">
                  OK
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
