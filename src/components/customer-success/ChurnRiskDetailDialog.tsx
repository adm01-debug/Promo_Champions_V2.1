import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  TrendingDown, 
  MessageSquare, 
  Activity, 
  ShieldAlert,
  Zap,
  ArrowRight
} from "lucide-react";
import { type AccountHealth } from "@/hooks/useCustomerSuccess";
import { motion } from "framer-motion";

interface Props {
  account: AccountHealth | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChurnRiskDetailDialog({ account, open, onOpenChange }: Props) {
  if (!account) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] glass border-primary/20 p-0 overflow-hidden">
        <DialogHeader className="p-6 bg-primary/5 border-b border-primary/10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-destructive/10 text-destructive">
              <ShieldAlert className="size-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">{account.account_name}</DialogTitle>
              <DialogDescription className="text-destructive font-semibold">
                Análise de Risco Crítico via IA
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Health Score</span>
              <span className="text-2xl font-black font-display text-destructive">{account.health_score}%</span>
            </div>
            <Progress value={account.health_score} className="h-3 bg-destructive/10" />
            <p className="text-xs text-muted-foreground italic">
              Este score está {100 - account.health_score}% abaixo do benchmark para o tier {account.tier}.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Fatores de Churn Detectados</h4>
            <div className="space-y-2">
              <RiskFactor 
                icon={TrendingDown} 
                label="Engajamento em Queda" 
                value="-42% vs mês anterior" 
                description="O volume de logins e ações principais caiu drasticamente nos últimos 15 dias."
              />
              <RiskFactor 
                icon={MessageSquare} 
                label="Sentimento Negativo" 
                value="Score 0.22" 
                description="IA detectou frustração e menção a concorrentes nas últimas 2 chamadas gravadas."
              />
              <RiskFactor 
                icon={Activity} 
                label="Inatividade Tática" 
                value={account.days_since_last_activity + " dias"} 
                description="Nenhum contato com o Champion da conta por mais de 2 semanas."
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Zap className="size-4" />
              <h4 className="text-xs font-bold uppercase tracking-widest">Plano de Recuperação IA</h4>
            </div>
            <p className="text-sm font-medium leading-relaxed">
              {account.recommended_action}
            </p>
            <button className="w-full py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all">
              Agendar Call de Retenção <ArrowRight className="size-3" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RiskFactor({ icon: Icon, label, value, description }: any) {
  return (
    <div className="flex gap-4 p-3 rounded-xl bg-background/40 border border-border/50 group hover:border-destructive/30 transition-all">
      <div className="p-2 rounded-lg bg-destructive/10 text-destructive h-fit">
        <Icon className="size-4" />
      </div>
      <div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold">{label}</p>
          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">{value}</Badge>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
