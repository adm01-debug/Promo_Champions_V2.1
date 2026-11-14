import { useState } from 'react';
import { QuickActionsMenu } from './QuickActionsMenu';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Deal } from '@/hooks/usePipeline';
import { cn } from '@/lib/utils';
import { DICEBEAR_AVATARS_URL, WA_ME_URL } from '@/config/external';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Calendar,
  Zap,
  Users,
  ListTodo,
  UserPlus,
  AlertTriangle,
  Edit2,
  Check,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import type { DealStakeholderSummary } from '@/hooks/pipeline/useDealCardContext';
import {
  dmuRoleLabel,
  sentimentLabel,
} from '@/components/deal-intelligence/committeeHelpers';
import { StagnantDealAlert } from './StagnantDealAlert';
import { DealSummaryCard } from './DealSummaryCard';
import { DealScoreIndicator } from './DealScoreIndicator';
import { SLACountdown } from './SLACountdown';
import { useLeadScoreExplanation } from '@/hooks/scoring/useLeadScoreExplanation';
import { useDealPlaybookProgress, usePlaybooksByStage } from '@/hooks/usePlaybooks';
import { DealPlaybookModal } from './DealPlaybookModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkline } from './Sparkline';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { formatBRLCompact } from '@/lib/money';
interface DealCardProps {
  deal: Deal;
  probability?: {
    probability: number;
    factors: string[];
  };
  leadScore?: {
    score: number;
    category: 'hot' | 'warm' | 'cold';
    factors: string[];
  };
  activeCadence?: {
    cadenceName: string;
    currentStep: number;
    status: 'active' | 'paused';
  };
  icpData?: {
    is_icp_match: boolean;
    grupo_nicho?: string;
  };
  /** Comitê de compra real (public.deal_stakeholders) do deal. */
  stakeholders?: DealStakeholderSummary[];
  /** Telefone cadastrado do cliente (public.clients.phone). */
  clientPhone?: string | null;
}

const SENTIMENT_TEXT_COLOR: Record<DealStakeholderSummary['sentiment'], string> = {
  positive: 'text-emerald-500',
  neutral: 'text-amber-500',
  negative: 'text-destructive',
};

// Sem score real (null) não há faixa de saúde: nada de alerta ou recomendação.
const isHealthBelow = (score: number | null, limit: number) =>
  score !== null && score < limit;

export const DealCard = ({
  deal,
  probability,
  leadScore,
  activeCadence,
  icpData,
  stakeholders,
  clientPhone,
}: DealCardProps) => {
  const navigate = useNavigate();
  const whatsappDigits = clientPhone?.replace(/\D/g, '') ?? '';
  const [playbookOpen, setPlaybookOpen] = useState(false);
  useLeadScoreExplanation(leadScore ? deal.id : null);
  const { data: playbooks } = usePlaybooksByStage(deal.status);
  const { data: progress } = useDealPlaybookProgress(deal.id);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const allPlaybookItems = playbooks?.flatMap(pb => pb.items || []) || [];
  const completedCount = progress?.length || 0;
  const totalCount = allPlaybookItems.length;

  // Etapa 8: Bulk Operations Mode
  const [isSelected] = useState(false);
  // Etapa 3: Inline Fast-Edit
  const [isEditing, setIsEditing] = useState(false);
  const [editedAmount, setEditedAmount] = useState(deal.amount.toString());

  // Etapa 2: Dynamic Health Heatmap. Sem score real (deal nem lead) fica null:
  // não inventa 50 nem mostra recomendação/alerta baseado em saúde.
  const healthScore = deal.health_score ?? leadScore?.score ?? null;
  const getHealthGradient = (score: number | null) => {
    if (score === null) return '';
    if (score > 80) return 'from-emerald-500/10 via-transparent';
    if (score < 40) return 'from-red-500/10 via-transparent';
    return 'from-amber-500/10 via-transparent';
  };

  const isHighRisk =
    isHealthBelow(healthScore, 30) ||
    (Date.now() - new Date(deal.updated_at).getTime()) / (1000 * 60 * 60 * 24) > 10;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        'touch-none cursor-grab active:cursor-grabbing relative',
        isDragging && 'opacity-50 z-50',
        leadScore?.category === 'hot' &&
          'ring-1 ring-status-error/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]',
        isSelected && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      <Card
        className={cn(
          'p-3 glass border border-border/40 dark:border-glow transition-all duration-300 group overflow-hidden relative',
          isDragging && 'shadow-2xl rotate-2 scale-105'
        )}
      >
        {/* Etapa 2: Heatmap Overlay */}
        <div
          className={cn(
            'absolute inset-0 bg-linear-to-br opacity-40 transition-opacity duration-700 pointer-events-none',
            getHealthGradient(healthScore)
          )}
        />

        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2 relative">
          {/* Etapa 4: Quick Action Overlay */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-around z-20 rounded-lg">
            {whatsappDigits && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Abrir WhatsApp do cliente"
                    className="h-8 w-8 hover:bg-emerald-500/20 text-emerald-500 group/btn"
                    onClick={e => {
                      e.stopPropagation();
                      window.open(
                        `${WA_ME_URL}/${whatsappDigits}`,
                        '_blank',
                        'noopener,noreferrer'
                      );
                    }}
                  >
                    <MessageCircle className="h-4 w-4 group-hover/btn:scale-125 transition-transform" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="font-bold">
                  Abrir WhatsApp do cliente
                </TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Abrir minhas tarefas"
                  className="h-8 w-8 hover:bg-primary/20 text-primary"
                  onClick={e => {
                    e.stopPropagation();
                    navigate('/tarefas');
                  }}
                >
                  <ListTodo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="font-bold">Abrir minhas tarefas</TooltipContent>
            </Tooltip>
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-display font-semibold text-sm truncate group-hover:text-primary transition-colors flex items-center gap-1.5">
              {deal.client_name}
            </h4>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {deal.product_name}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {leadScore && (
              <DealScoreIndicator score={leadScore.score} factors={leadScore.factors} />
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-1.5 flex items-center gap-1 hover:bg-primary/10 transition-colors"
                  onClick={e => {
                    e.stopPropagation();
                    setPlaybookOpen(true);
                  }}
                >
                  <ListTodo
                    className={cn(
                      'h-3.5 w-3.5',
                      completedCount > 0 ? 'text-emerald-500' : 'text-muted-foreground'
                    )}
                  />
                  {totalCount > 0 && (
                    <span className="text-[9px] font-bold">
                      {completedCount}/{totalCount}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">Abrir Playbook de Execução</p>
              </TooltipContent>
            </Tooltip>
            <QuickActionsMenu deal={deal} />
          </div>
        </div>

        {/* Value & Time & Velocity (Etapa 1, 3, 4) */}
        <div className="flex items-center justify-between mb-2 relative z-10">
          <div
            className="flex items-center gap-1.5 flex-1"
            onClick={e => e.stopPropagation()}
          >
            <DollarSign className="h-3.5 w-3.5 text-status-success" />
            {isEditing ? (
              <div className="flex items-center gap-1">
                <Input
                  value={editedAmount}
                  onChange={e => setEditedAmount(e.target.value)}
                  className="h-6 w-20 text-[11px] px-1 font-bold"
                  autoFocus
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => setIsEditing(false)}
                >
                  <Check className="h-3 w-3 text-emerald-500" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1 group/edit">
                <span className="font-display font-bold text-sm gradient-text">
                  {formatBRLCompact(deal.amount)}
                </span>
                <Edit2
                  className="h-2.5 w-2.5 opacity-0 group-hover/edit:opacity-100 cursor-pointer transition-opacity"
                  onClick={() => setIsEditing(true)}
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Etapa 7: SLA & Interaction Sparkline */}
            <div className="flex flex-col items-end gap-1">
              <Sparkline
                data={deal.interaction_history || [10, 20, 15, 30, 25, 40, 35]}
              />
              <SLACountdown updatedAt={deal.updated_at} stage={deal.status} />
            </div>
          </div>
        </div>

        {/* Etapa 4: Dynamic AI Action Nudge */}
        <AnimatePresence>
          {isHealthBelow(healthScore, 60) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className={cn(
                'mb-2 rounded-lg border p-2 overflow-hidden',
                isHealthBelow(healthScore, 40)
                  ? 'bg-destructive/5 border-destructive/20'
                  : 'bg-primary/5 border-primary/20'
              )}
            >
              <div className="flex items-center gap-2">
                <Sparkles
                  className={cn(
                    'h-3 w-3',
                    isHealthBelow(healthScore, 40) ? 'text-destructive' : 'text-primary'
                  )}
                />
                <p className="text-[10px] font-bold tracking-tight">
                  {isHealthBelow(healthScore, 40) ? 'Ação Reativa: ' : 'Oportunidade: '}
                  <span className="font-medium text-foreground/80 italic">
                    {isHealthBelow(healthScore, 40)
                      ? 'Deal esfriando! Sugerimos envio de case de sucesso via WhatsApp.'
                      : 'Fit alto! O cliente está pronto para uma proposta de valor.'}
                  </span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Etapa 5: Predictive Churn Guard & Revenue Ops Audit */}
        <AnimatePresence>
          {isHealthBelow(healthScore, 30) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mb-2 bg-red-500/10 border border-red-500/30 rounded-lg p-2 flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4 text-red-500 animate-bounce" />
              <div className="flex-1">
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">
                  Alerta de Churn Iminente
                </p>
                <p className="text-[9px] text-foreground/80 font-medium">
                  Inatividade crítica detectada. Reative agora para salvar o deal.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap gap-1.5 text-[10px] text-muted-foreground items-center">
          {probability && (
            <Badge
              variant="outline"
              className={cn(
                'text-[9px] font-black uppercase tracking-tighter px-1.5 py-0 border-none',
                probability.probability > 70
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-primary/10 text-primary'
              )}
            >
              <Zap className="h-2.5 w-2.5 mr-0.5 fill-current" />
              {probability.probability}% CHANCE DE GANHO
            </Badge>
          )}

          {icpData?.is_icp_match && (
            <Badge
              variant="outline"
              className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0 bg-indigo-500/10 text-indigo-500 border-none"
            >
              <Users className="h-2.5 w-2.5 mr-0.5" />
              ICP ALVO
            </Badge>
          )}

          {/* Etapa 5: Stakeholder Influence — comitê real (deal_stakeholders) */}
          {stakeholders && stakeholders.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0 bg-primary/10 text-primary border-none cursor-help"
                >
                  <Users className="h-2.5 w-2.5 mr-0.5" />
                  {stakeholders.length}{' '}
                  {stakeholders.length === 1 ? 'Stakeholder' : 'Stakeholders'}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-[10px] p-2 space-y-1">
                <p className="font-bold border-b border-border/10 pb-1 mb-1">
                  Mapa de Influência
                </p>
                {stakeholders.map(st => (
                  <p key={st.id} className="flex justify-between gap-3">
                    <span>
                      {st.name} ({st.role_title || dmuRoleLabel(st.dmu_role)})
                    </span>
                    <span className={cn('font-bold', SENTIMENT_TEXT_COLOR[st.sentiment])}>
                      {sentimentLabel(st.sentiment)}
                    </span>
                  </p>
                ))}
              </TooltipContent>
            </Tooltip>
          )}

          {deal.sdr_id && !deal.salesperson_id && (
            <Badge
              variant="outline"
              className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0 bg-amber-500/10 text-amber-500 border-none"
            >
              <UserPlus className="h-2.5 w-2.5 mr-0.5" />
              AGUARDANDO CLOSER
            </Badge>
          )}
          {/* Etapa 5: Churn Risk */}
          {isHighRisk && (
            <Badge
              variant="destructive"
              className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0 animate-pulse"
            >
              <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
              Risco de Churn
            </Badge>
          )}

          {/* Etapa 1: Capacity/Closer */}
          <div className="flex items-center gap-1 ml-auto">
            <Tooltip>
              <TooltipTrigger>
                <Avatar className="h-5 w-5 border border-primary/20">
                  <AvatarImage
                    src={`${DICEBEAR_AVATARS_URL}?seed=${deal.salesperson_id || 'unassigned'}`}
                  />
                  <AvatarFallback className="text-[8px]">CL</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>Closer: Responsável Direto (Carga 85%)</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Active Cadence */}
        {activeCadence && (
          <div className="mt-2 pt-2 border-t border-border/30 text-[10px] text-muted-foreground">
            <span className="text-primary font-medium">{activeCadence.cadenceName}</span>
            <span className="ml-1">• Etapa {activeCadence.currentStep}</span>
          </div>
        )}

        {/* AI Copilot - Stagnant Deal Alert */}
        <StagnantDealAlert
          updatedAt={deal.updated_at || deal.created_at}
          clientName={deal.client_name}
          amount={deal.amount}
        />

        {/* AI Deal Summary */}
        <DealSummaryCard
          dealId={deal.id}
          clientName={deal.client_name}
          amount={deal.amount}
          status={deal.status}
          createdAt={deal.created_at}
          updatedAt={deal.updated_at || deal.created_at}
        />

        {/* Date */}
        <div className="mt-2 pt-2 border-t border-border/30 flex items-center gap-1 text-[10px] text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{format(parseISO(deal.created_at), 'dd MMM', { locale: ptBR })}</span>
        </div>

        <DealPlaybookModal
          open={playbookOpen}
          onOpenChange={setPlaybookOpen}
          dealId={deal.id}
          clientName={deal.client_name}
          stageId={deal.status}
        />
      </Card>
    </motion.div>
  );
};
