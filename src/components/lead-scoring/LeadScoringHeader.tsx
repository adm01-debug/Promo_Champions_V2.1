import { Target, Brain, FileText, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { LeadConnectionStatus } from './scoring-ui';

interface LeadScoringHeaderProps {
  totalLeads: number;
  connectionStatus: LeadConnectionStatus;
  isAnalyzing: boolean;
  isExporting: boolean;
  onNeuralAnalysis: () => void;
  onExportPDF: () => void;
}

export function LeadScoringHeader({
  totalLeads,
  connectionStatus,
  isAnalyzing,
  isExporting,
  onNeuralAnalysis,
  onExportPDF,
}: LeadScoringHeaderProps) {
  return (
    <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/10">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="p-3 rounded-2xl bg-primary/10 ring-1 ring-primary/20">
            <Target className="h-7 w-7 text-primary animate-pulse" />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
        </div>
        <div>
          <h1 className="text-page-title uppercase italic">Lead Intelligence</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">
              Scoring Engine v4.0
            </span>
            <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
            <p className="text-[10px] text-primary font-bold uppercase tracking-wider">
              {totalLeads} COMBATANTS DETECTED
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mr-2 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
          <div className="flex items-center gap-1.5">
            <Wifi
              className={cn(
                'h-3 w-3',
                connectionStatus === 'connected' ? 'text-emerald-500' : 'text-rose-500'
              )}
            />
            <div
              className={cn(
                'h-1.5 w-1.5 rounded-full animate-pulse',
                connectionStatus === 'connected' ? 'bg-emerald-500' : 'bg-rose-500'
              )}
            />
          </div>
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
            {connectionStatus === 'connected' ? 'Neural Link Active' : 'Link Error'}
          </span>
        </div>

        <Button
          variant="outline"
          className="h-12 px-6 rounded-xl border-primary/20 bg-primary/5 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-[0_0_15px_rgba(var(--primary-rgb),0.05)]"
          onClick={onNeuralAnalysis}
          disabled={isAnalyzing}
        >
          <Brain className={cn('h-4 w-4 mr-2', isAnalyzing && 'animate-spin')} />
          Neural Analysis
        </Button>

        <Button
          variant="outline"
          onClick={onExportPDF}
          disabled={isExporting}
          className="h-12 px-6 rounded-xl border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
        >
          <FileText className="h-4 w-4 mr-2" />
          Full Report
        </Button>
      </div>
    </div>
  );
}
