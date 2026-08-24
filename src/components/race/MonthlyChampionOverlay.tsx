import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Share2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckeredFlag } from './CheckeredFlag';
import { useMonthlyChampion } from '@/hooks/race/useMonthlyChampion';
import type { RoleType } from '@/hooks/race/useRaceSeasonByRole';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface Props {
  roleType: RoleType;
  onPlaySound?: () => void;
}

const ROLE_LABEL: Record<RoleType, string> = { closer: 'Closer', sdr: 'SDR' };

export function MonthlyChampionOverlay({ roleType, onPlaySound }: Props) {
  const { champion, shouldShow, dismiss } = useMonthlyChampion(roleType);
  const playedRef = useRef(false);

  useEffect(() => {
    if (shouldShow && !playedRef.current) {
      onPlaySound?.();
      playedRef.current = true;
    }
    if (!shouldShow) playedRef.current = false;
  }, [shouldShow, onPlaySound]);

  const handleShare = async () => {
    if (!champion) return;
    const text = `🏆 ${champion.winner_name} é o Campeão ${ROLE_LABEL[roleType]} do mês na Race Arena! ${champion.deals_count} vendas · ${Number(champion.score).toLocaleString('pt-BR')} pts`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Campeão da Race Arena', text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success('Conquista copiada!');
      }
    } catch {
      /* user cancelled */
    }
  };

  if (!champion) return null;
  const monthLabel = format(new Date(champion.finalized_at), "MMMM yyyy", { locale: ptBR });

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-background/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          {/* confete dourado */}
          {Array.from({ length: 60 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -50, x: Math.random() * window.innerWidth, opacity: 1, rotate: 0 }}
              animate={{ y: window.innerHeight + 50, rotate: 720 }}
              transition={{ duration: 3 + Math.random() * 2, delay: Math.random() * 1.5, repeat: Infinity, repeatDelay: 0.5 }}
              className="absolute w-2 h-3 rounded-sm"
              style={{ background: ['#fbbf24', '#f59e0b', '#fcd34d', '#d97706', '#fde68a'][i % 5] }}
            />
          ))}

          <motion.div
            initial={{ scale: 0.6, y: 60, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 18 }}
            className="relative bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl border-4 border-amber-200"
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 text-amber-900 hover:bg-amber-200/60"
              onClick={dismiss}
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Header */}
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="flex items-center justify-center gap-2 text-amber-950"
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-xs font-bold tracking-widest uppercase">Cerimônia oficial · Race Arena {ROLE_LABEL[roleType]}</span>
              <Sparkles className="w-5 h-5" />
            </motion.div>

            <motion.h2
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="font-display text-3xl md:text-4xl font-black text-amber-950 mt-2"
            >
              🏆 CAMPEÃO DO MÊS 🏆
            </motion.h2>
            <p className="text-amber-900 font-semibold capitalize mt-1">{monthLabel}</p>

            {/* Bandeira + troféu */}
            <div className="flex items-center justify-center gap-3 mt-5">
              <motion.div
                animate={{ rotate: [0, -8, 8, -8, 0], scale: [1, 1.12, 1] }}
                transition={{ duration: 1, repeat: 2, delay: 0.4 }}
              >
                <Trophy className="w-20 h-20 text-amber-900 drop-shadow-lg" />
              </motion.div>
              <CheckeredFlag width={140} height={90} />
            </div>

            {/* Vencedor */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-5 flex flex-col items-center gap-2"
            >
              <Avatar className="w-20 h-20 ring-4 ring-amber-100 shadow-lg">
                <AvatarImage src={champion.avatar_url ?? undefined} alt={champion.winner_name} />
                <AvatarFallback className="bg-amber-700 text-amber-50 font-bold text-xl">
                  {champion.winner_name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="text-2xl font-black text-amber-950">{champion.winner_name}</p>
              <p className="text-xs text-amber-900/80 font-medium">{champion.season_name}</p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-3 gap-2 mt-5 text-amber-950"
            >
              <div className="bg-amber-100/70 rounded-lg p-3">
                <div className="text-2xl font-black tabular-nums">{champion.deals_count}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wide">Vendas</div>
              </div>
              <div className="bg-amber-100/70 rounded-lg p-3">
                <div className="text-2xl font-black tabular-nums">
                  {Number(champion.total_sales).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-wide">Faturado</div>
              </div>
              <div className="bg-amber-100/70 rounded-lg p-3">
                <div className="text-2xl font-black tabular-nums">
                  {Number(champion.score).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-wide">Pontos</div>
              </div>
            </motion.div>

            {/* Top 5 mini */}
            {champion.top5.length > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="mt-4 text-left text-amber-950 bg-amber-100/40 rounded-lg p-3"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1">Pódio Final</p>
                <ol className="space-y-0.5 text-sm">
                  {champion.top5.slice(0, 5).map((p, i) => (
                    <li key={i} className="flex justify-between gap-2">
                      <span className="font-semibold">{i + 1}º {p.salesperson_name}</span>
                      <span className="tabular-nums opacity-80">{Number(p.progress).toFixed(0)}%</span>
                    </li>
                  ))}
                </ol>
              </motion.div>
            )}

            <div className="flex gap-2 mt-6">
              <Button onClick={handleShare} variant="outline" className="flex-1 border-amber-900/30 text-amber-950 hover:bg-amber-100">
                <Share2 className="w-4 h-4 mr-2" /> Compartilhar
              </Button>
              <Button onClick={dismiss} className="flex-1 bg-amber-900 text-amber-50 hover:bg-amber-800">
                Fechar cerimônia
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
