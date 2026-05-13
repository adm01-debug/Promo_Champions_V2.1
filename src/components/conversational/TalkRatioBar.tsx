import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Props {
  seller: number | null | undefined;
  client: number | null | undefined;
}

export function TalkRatioBar({ seller, client }: Props) {
  const s = Math.max(0, Math.min(100, Number(seller) || 0));
  const c = Math.max(0, Math.min(100, Number(client) || 0));
  const total = s + c || 1;
  const sPct = (s / total) * 100;
  const cPct = (c / total) * 100;
  const idealZone = s >= 40 && s <= 55;
  const tooMuch = s > 65;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Neural Talk Balance</span>
          {tooMuch ? (
            <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[8px] font-black py-0 h-4">OVER-TALKING DETECTED</Badge>
          ) : idealZone ? (
            <Badge className="bg-success/10 text-success border-success/20 text-[8px] font-black py-0 h-4">OPTIMAL ENGAGEMENT</Badge>
          ) : (
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] font-black py-0 h-4">UNBALANCED</Badge>
          )}
        </div>
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ideal: 40–55%</span>
      </div>
      
      <div className="relative h-6 w-full overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-1 group/ratio">
        {/* Progress tracks */}
        <div className="flex h-full w-full rounded-xl overflow-hidden relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${sPct}%` }}
            className="h-full bg-primary relative group-hover/ratio:brightness-110 transition-all"
            title={`Vendedor ${s.toFixed(1)}%`}
          >
             <div className="absolute inset-y-0 right-0 w-px bg-white/20" />
          </motion.div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${cPct}%` }}
            className="h-full bg-accent relative group-hover/ratio:brightness-110 transition-all"
            title={`Cliente ${c.toFixed(1)}%`}
          />
          
          {/* Ideal Zone Overlay */}
          <div
            className="pointer-events-none absolute top-0 h-full border-x border-success/40 bg-success/5 z-10"
            style={{ left: "40%", width: "15%" }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-success" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] font-black tracking-tight uppercase">
        <div className="flex items-center gap-1.5 text-primary">
          <div className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
          Vendedor <span className="tabular-nums font-black opacity-80">{s.toFixed(1)}%</span>
        </div>
        <div className="flex items-center gap-1.5 text-accent">
          Cliente <span className="tabular-nums font-black opacity-80">{c.toFixed(1)}%</span>
          <div className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_8px_rgba(var(--accent-rgb),0.5)]" />
        </div>
      </div>
    </div>
  );
}
