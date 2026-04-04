import React from "react";
import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";

export interface RiskLevel {
  level: 'low' | 'medium' | 'high';
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  reasons: string[];
  action: { text: string; icon: string };
}

export function getRecommendedAction(
  status: string,
  daysWithoutActivity: number | null,
  _daysInStage: number | null,
  riskLevel: 'low' | 'medium' | 'high'
): { text: string; icon: string } {
  const stageActions: Record<string, { low: string; medium: string; high: string }> = {
    lead: { low: 'Continue qualificando o lead com perguntas exploratórias', medium: 'Agende uma ligação para avançar a qualificação', high: 'Entre em contato urgente antes de perder o timing' },
    qualified: { low: 'Prepare uma proposta personalizada para o cliente', medium: 'Envie uma proposta ou agende reunião de apresentação', high: 'Ligue agora para entender bloqueios e avançar' },
    proposal: { low: 'Faça follow-up para verificar se há dúvidas na proposta', medium: 'Agende reunião para discutir a proposta e objeções', high: 'Contato urgente - cliente pode estar avaliando concorrentes' },
    negotiation: { low: 'Trabalhe objeções finais e prepare o fechamento', medium: 'Ofereça condição especial para acelerar decisão', high: 'Ligação urgente para entender impedimentos ao fechamento' },
  };

  const actions = stageActions[status] || stageActions.qualified;
  if (daysWithoutActivity === null || daysWithoutActivity >= 14) return { text: 'Faça contato imediato - muito tempo sem interação', icon: '🚨' };
  if (daysWithoutActivity >= 7) return { text: 'Registre uma atividade - cliente pode esfriar', icon: '⚡' };

  const icons: Record<string, string> = { low: '✨', medium: '⚠️', high: '🔥' };
  return { text: actions[riskLevel], icon: icons[riskLevel] };
}

export function calculateRiskLevel(
  daysWithoutActivity: number | null,
  daysInStage: number | null,
  status: string
): RiskLevel {
  const reasons: string[] = [];
  let riskScore = 0;

  if (status === 'closed_won' || status === 'closed_lost') {
    return {
      level: 'low', label: 'Concluído', color: 'text-muted-foreground', bgColor: 'bg-muted/50',
      icon: React.createElement(CheckCircle, { className: "h-3.5 w-3.5" }),
      reasons: ['Deal já foi concluído'],
      action: { text: 'Deal finalizado - nenhuma ação necessária', icon: '✅' },
    };
  }

  if (daysWithoutActivity !== null) {
    if (daysWithoutActivity >= 14) { riskScore += 3; reasons.push(`${daysWithoutActivity} dias sem atividade`); }
    else if (daysWithoutActivity >= 7) { riskScore += 2; reasons.push(`${daysWithoutActivity} dias sem atividade`); }
    else if (daysWithoutActivity >= 3) { riskScore += 1; reasons.push(`${daysWithoutActivity} dias sem atividade`); }
  } else { riskScore += 2; reasons.push('Nenhuma atividade registrada'); }

  if (daysInStage !== null) {
    const thresholds: Record<string, number> = { lead: 7, qualified: 10, proposal: 14, negotiation: 21 };
    const threshold = thresholds[status] || 14;
    if (daysInStage >= threshold * 2) { riskScore += 3; reasons.push(`${daysInStage} dias neste estágio (limite: ${threshold})`); }
    else if (daysInStage >= threshold) { riskScore += 2; reasons.push(`${daysInStage} dias neste estágio (limite: ${threshold})`); }
    else if (daysInStage >= threshold * 0.7) { riskScore += 1; reasons.push(`Próximo do limite de tempo no estágio`); }
  }

  let level: 'low' | 'medium' | 'high';
  let label: string, color: string, bgColor: string;
  let icon: React.ReactNode;

  if (riskScore >= 4) {
    level = 'high'; label = 'Alto Risco'; color = 'text-destructive'; bgColor = 'bg-destructive/10';
    icon = React.createElement(AlertTriangle, { className: "h-3.5 w-3.5" });
  } else if (riskScore >= 2) {
    level = 'medium'; label = 'Atenção'; color = 'text-rank-gold'; bgColor = 'bg-rank-gold/10';
    icon = React.createElement(AlertCircle, { className: "h-3.5 w-3.5" });
  } else {
    level = 'low'; label = 'Baixo Risco'; color = 'text-success'; bgColor = 'bg-success/10';
    icon = React.createElement(CheckCircle, { className: "h-3.5 w-3.5" });
  }

  const action = getRecommendedAction(status, daysWithoutActivity, daysInStage, level);
  return { level, label, color, bgColor, icon, reasons: reasons.length > 0 ? reasons : ['Deal em bom andamento'], action };
}

export const STATUS_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  lead: { label: 'Lead', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: '🎯' },
  qualified: { label: 'Qualificado', color: 'bg-info/20 text-info border-info/30', icon: '✅' },
  proposal: { label: 'Proposta', color: 'bg-rank-gold/20 text-rank-gold border-rank-gold/30', icon: '📄' },
  negotiation: { label: 'Negociação', color: 'bg-primary/20 text-primary border-primary/30', icon: '🤝' },
  closed_won: { label: 'Fechado', color: 'bg-success/20 text-success border-success/30', icon: '🎉' },
  closed_lost: { label: 'Perdido', color: 'bg-destructive/20 text-destructive border-destructive/30', icon: '❌' },
};

export const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  call: 'Ligação', email: 'E-mail', meeting: 'Reunião',
  linkedin: 'LinkedIn', whatsapp: 'WhatsApp', other: 'Outro',
};
