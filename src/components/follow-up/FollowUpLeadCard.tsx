import { memo } from "react";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import { Clock, Mail, Phone, MessageCircle, Send, Zap, CheckCircle2, Snowflake, History, RotateCw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { temperatureConfig, type ColdLead } from './types';

interface FollowUpLeadCardProps {
  lead: ColdLead;
  index: number;
  isSelected: boolean;
  onToggle: (id: string) => void;
  onCreateTask: (lead: ColdLead) => void;
  onWhatsAppClick: (lead: ColdLead) => void;
  isCreating: boolean;
  onOpenAudit: (lead: ColdLead) => void;
  onReactivate: (lead: ColdLead) => void;
}

const channelIcons: Record<string, { icon: typeof Mail; label: string }> = {
  email: { icon: Mail, label: 'E-mail' },
  call: { icon: Phone, label: 'Ligação' },
  whatsapp: { icon: MessageCircle, label: 'WhatsApp' },
};

const statusLabels: Record<string, string> = {
  lead: 'Lead',
  qualified: 'Qualificado',
  proposal: 'Proposta',
  negotiation: 'Negociação',
  open: 'Aberto',
};

const FollowUpLeadCardInner = function FollowUpLeadCard({ 
  lead, 
  index, 
  isSelected, 
  onToggle, 
  onCreateTask, 
  onWhatsAppClick,
  isCreating,
  onOpenAudit,
  onReactivate
}: FollowUpLeadCardProps) {
  const config = temperatureConfig[lead.temperature];
  const channel = channelIcons[lead.suggested_channel] || channelIcons.email;
  const ChannelIcon = channel.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.03 }}
      layout
    >
      <Card className={`transition-all duration-200 ${isSelected ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'hover:border-muted-foreground/30 hover:shadow-sm'}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Checkbox */}
            <button
              onClick={() => onToggle(lead.id)}
              className="mt-1 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              aria-label={isSelected ? 'Desselecionar lead' : 'Selecionar lead'}
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary scale-110' : 'border-muted-foreground/40 hover:border-primary/60'}`}>
                {isSelected && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
              </div>
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-semibold truncate">{lead.client_name}</span>
                {lead.score && lead.score >= 80 && (
                  <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none text-[10px] h-5 px-1.5 animate-pulse">
                    <Zap className="h-3 w-3 mr-0.5 fill-current" />
                    CLASSE A
                  </Badge>
                )}
                <Badge variant="outline" className={`${config.bgClass} ${config.colorClass} border-none text-xs`}>
                  <config.icon className="h-3 w-3 mr-1" />
                  {config.label}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {statusLabels[lead.status] || lead.status}
                </Badge>
                
                {lead.days_inactive >= 3 && lead.days_inactive < 5 && (
                  <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">D+3 Cadence</Badge>
                )}
                {lead.days_inactive >= 5 && (
                  <Badge variant="outline" className="text-[10px] border-destructive/30 text-destructive font-bold">D+5 Priority</Badge>
                )}
                {lead.follow_up_count && lead.follow_up_count > 0 && (
                  <Badge variant="outline" className="text-[10px] border-muted-foreground/30">
                    {lead.follow_up_count}ª tentativa
                  </Badge>
                )}
              </div>

              <div className="text-sm text-muted-foreground mb-1">
                {lead.product_name && <span>{lead.product_name} · </span>}
                <span className="font-medium text-foreground">R$ {(lead.amount || 0).toLocaleString('pt-BR')}</span>
              </div>

              {lead.last_activity && (
                <div className="text-xs text-muted-foreground mb-2 bg-muted/30 p-1.5 rounded border border-dashed border-muted-foreground/20 italic">
                  <span className="font-semibold not-italic capitalize">{lead.last_activity.type?.replace('_', ' ')}:</span> "{lead.last_activity.notes}" ({format(new Date(lead.last_activity.created_at), "dd/MM")})
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span className={lead.days_inactive > 14 ? 'text-destructive font-medium' : ''}>
                    {lead.days_inactive} dias sem atividade
                  </span>
                </span>
                <span>Atualizado: {format(new Date(lead.updated_at), "dd/MM/yyyy", { locale: ptBR })}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => onOpenAudit(lead)}
                      >
                        <History className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Ver histórico de ações</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => onWhatsAppClick(lead)}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Enviar WhatsApp sugerido</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <div className="flex items-center gap-1.5 text-[10px] bg-muted/50 px-2 py-1 rounded-full uppercase font-bold tracking-wider">
                  <ChannelIcon className="h-3 w-3" />
                  <span>{channel.label}</span>
                </div>
              </div>

              <Button
                size="sm"
                variant={lead.has_pending_task ? "ghost" : "outline"}
                onClick={() => onCreateTask(lead)}
                disabled={isCreating || lead.has_pending_task}
                className={lead.has_pending_task ? "text-muted-foreground" : "hover:bg-primary hover:text-primary-foreground transition-colors"}
              >
                {lead.has_pending_task ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Agendado
                  </>
                ) : (
                  <>
                    <Send className="h-3 w-3 mr-1" />
                    Criar Tarefa
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* AI Suggestion */}
          <div className="mt-3 flex flex-col gap-2">
            {lead.temperature === 'frozen' && lead.score && lead.score >= 80 && (
              <div className="p-2 bg-destructive/10 border border-destructive/20 rounded-lg text-[11px] flex items-center justify-between gap-2 text-destructive font-bold animate-pulse">
                <div className="flex items-center gap-2">
                  <Snowflake className="h-3.5 w-3.5" />
                  ALERTA: Lead Classe A congelado! Reativação imediata necessária.
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-6 px-2 text-[10px] bg-destructive/20 hover:bg-destructive/30 text-destructive border-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReactivate(lead);
                  }}
                >
                  <RotateCw className="h-3 w-3 mr-1" />
                  REATIVAR AGORA
                </Button>
              </div>
            )}

            <div className="p-2.5 bg-accent/30 rounded-lg text-xs flex items-start gap-2 border border-accent/20">
              <Zap className="h-3.5 w-3.5 text-status-warning mt-0.5 shrink-0" />
              <div className="flex-1">
                <span className="text-muted-foreground">
                  <strong className="text-foreground">Sugestão IA:</strong> {lead.suggested_action}
                </span>
                {lead.suggested_channel === 'whatsapp' && (
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1 text-green-600 font-medium">
                      <MessageCircle className="h-3 w-3" /> WhatsApp validado
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
export const FollowUpLeadCard = memo(FollowUpLeadCardInner);
