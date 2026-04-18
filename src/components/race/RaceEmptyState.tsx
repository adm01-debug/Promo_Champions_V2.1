import { FC } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flag, Sparkles, History } from 'lucide-react';
import { CheckeredFlag } from './CheckeredFlag';
import { RaceGhostDemo } from './RaceGhostDemo';
import type { RoleType } from '@/hooks/race/useRaceSeasonByRole';

interface Props {
  roleType: RoleType;
  isAdmin: boolean;
  onStartSeason: () => void;
}

/**
 * Empty state cinematográfico para Race Arena sem season ativa.
 * Pista vazia em perspectiva + bandeira ondulando + CTAs por papel.
 */
export const RaceEmptyState: FC<Props> = ({ roleType, isAdmin, onStartSeason }) => {
  const roleLabel = roleType === 'closer' ? 'Closers' : 'SDRs';

  return (
    <Card
      variant="gradient"
      className="relative overflow-hidden border-dashed border-2 border-border/60"
      role="status"
      aria-live="polite"
    >
      {/* Glow radial decorativo */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 30%, hsl(var(--primary) / 0.12), transparent 60%)',
        }}
        aria-hidden
      />

      {/* Padrão xadrez decorativo no rodapé */}
      <div
        className="absolute bottom-0 inset-x-0 h-8 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(45deg, hsl(var(--foreground)) 25%, transparent 25%, transparent 75%, hsl(var(--foreground)) 75%), linear-gradient(45deg, hsl(var(--foreground)) 25%, transparent 25%, transparent 75%, hsl(var(--foreground)) 75%)',
          backgroundSize: '16px 16px',
          backgroundPosition: '0 0, 8px 8px',
        }}
        aria-hidden
      />

      <CardContent className="relative py-12 px-6 flex flex-col items-center text-center gap-6">
        {/* Ilustração: pista em perspectiva + bandeira */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative w-full max-w-md h-44"
        >
          <svg viewBox="0 0 400 180" className="w-full h-full" aria-hidden>
            {/* Pista perspectiva */}
            <defs>
              <linearGradient id="trackGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--muted))" stopOpacity="0.8" />
                <stop offset="100%" stopColor="hsl(var(--muted))" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <polygon points="60,180 340,180 240,40 160,40" fill="url(#trackGrad)" />
            {/* Linhas tracejadas centrais */}
            {[0, 1, 2, 3, 4].map((i) => {
              const t = i / 5;
              const yTop = 180 - t * 140;
              const yBot = 180 - (t + 0.06) * 140;
              const xCenterTop = 200;
              const widthTop = (340 - 60) * (1 - t * 0.78);
              const widthBot = (340 - 60) * (1 - (t + 0.06) * 0.78);
              return (
                <line
                  key={i}
                  x1={xCenterTop}
                  y1={yTop}
                  x2={xCenterTop}
                  y2={yBot}
                  stroke="hsl(var(--foreground))"
                  strokeOpacity="0.3"
                  strokeWidth={Math.max(1, 3 * (1 - t))}
                  strokeDasharray={`${4 * (1 - t * 0.5)} ${3 * (1 - t * 0.5)}`}
                />
              );
            })}
            {/* Carro silhueta pontilhado na largada */}
            <motion.g
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <rect
                x="170"
                y="150"
                width="60"
                height="22"
                rx="6"
                fill="none"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <circle cx="184" cy="174" r="4" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" strokeDasharray="2 2" />
              <circle cx="216" cy="174" r="4" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" strokeDasharray="2 2" />
            </motion.g>
            {/* Partículas de poeira sutis */}
            {[0, 1, 2].map((i) => (
              <motion.circle
                key={i}
                cx={170 + i * 30}
                cy={172}
                r="1.5"
                fill="hsl(var(--muted-foreground))"
                animate={{ opacity: [0, 0.6, 0], y: [0, -8, -16] }}
                transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.6, ease: 'easeOut' }}
              />
            ))}
          </svg>
          {/* Bandeira no horizonte */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0">
            <CheckeredFlag width={72} height={46} />
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="space-y-2"
        >
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
            A pista está silenciosa
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md">
            {isAdmin
              ? `Nenhuma temporada ativa para ${roleLabel}. Solte a bandeira verde e dê a largada na próxima corrida.`
              : `Aguardando o gestor abrir a próxima corrida dos ${roleLabel}. Enquanto isso, revise sua estratégia.`}
          </p>
        </motion.div>

        {/* Demo ghost-race ao vivo */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="w-full max-w-2xl"
        >
          <RaceGhostDemo />
          <p className="text-[11px] text-muted-foreground mt-1.5 text-center">
            👀 Prévia: assim será sua corrida quando a temporada começar
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-2"
        >
          {isAdmin ? (
            <>
              <Button onClick={onStartSeason} variant="glow-pulse" size="lg">
                <Flag className="w-4 h-4 mr-2" />
                Iniciar Nova Temporada
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/admin/race-arena">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Admin Console
                </Link>
              </Button>
            </>
          ) : (
            <Button asChild variant="ghost" size="lg">
              <Link to="/race-arena">
                <History className="w-4 h-4 mr-2" />
                Ver histórico de campeões
              </Link>
            </Button>
          )}
        </motion.div>
      </CardContent>
    </Card>
  );
};
