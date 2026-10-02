import { Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

interface PricingHeaderProps {
  days: 7 | 30 | 90;
  onDaysChange: (days: 7 | 30 | 90) => void;
}

export function PricingHeader({ days, onDaysChange }: PricingHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 border-b border-white/5 pb-10 relative z-20">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 backdrop-blur-xl shadow-inner group transition-all hover:scale-110">
            <Sparkles className="h-5 w-5 text-primary group-hover:animate-spin" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px] font-black tracking-[0.2em] uppercase py-0.5 px-2">
                Revenue Protection
              </Badge>
              <div className="flex items-center gap-1.5 text-[10px] text-success font-black tracking-wider">
                <ShieldCheck className="h-3.5 w-3.5 fill-current" />
                LINK NEURAL ATIVO
              </div>
            </div>
          </div>
        </div>
        <h1 className="text-5xl font-black font-sora tracking-tight bg-gradient-to-br from-foreground via-foreground to-foreground/40 bg-clip-text text-transparent sm:text-6xl">
          Pricing Hub <span className="text-primary/80">10/10</span>
        </h1>
        <p className="text-base text-muted-foreground/80 max-w-3xl font-medium leading-relaxed">
          O cockpit definitivo para proteção de margem de elite. Nossa IA analisa curvas
          de elasticidade e vazamentos de receita em milissegundos para garantir sua
          dominância de mercado.
        </p>
      </div>

      <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl">
        <Tabs
          value={String(days)}
          onValueChange={v => onDaysChange(Number(v) as 7 | 30 | 90)}
          className="bg-transparent border-none"
        >
          <TabsList className="bg-white/5 border-none p-1">
            {([7, 30, 90] as const).map(d => (
              <TabsTrigger
                key={d}
                value={String(d)}
                className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg text-xs font-black px-5 py-2 rounded-lg transition-all"
              >
                {d}D
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="w-px h-8 bg-white/10 mx-1" />
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl border-white/10 bg-white/5 hover:bg-white/15 hover:scale-105 transition-all group"
        >
          <Zap className="h-5 w-5 text-primary group-hover:animate-pulse" />
        </Button>
      </div>
    </header>
  );
}
