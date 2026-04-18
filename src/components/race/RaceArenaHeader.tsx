import { FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { CheckeredFlag } from './CheckeredFlag';
import { cn } from '@/lib/utils';

interface Props {
  /** Título principal do header (ex: "Pista dos Closers") */
  title: string;
  /** Subtítulo curto descritivo */
  subtitle?: string;
  /** Emoji ou ícone para reforçar contexto */
  emoji?: string;
  /** Nome da página atual no breadcrumb (depois de "Race Arena") */
  breadcrumbCurrent: string;
  /** Mostra badge "Season Ativa" pulsante */
  hasActiveSeason?: boolean;
  /** Nome da season ativa (renderizado dentro do badge) */
  seasonName?: string;
  /** Botões/ações no canto direito */
  actions?: ReactNode;
  /** Conteúdo extra abaixo do header (ex: mini-podium) */
  belowChildren?: ReactNode;
  className?: string;
}

/**
 * Cabeçalho unificado da Race Arena.
 * Inclui bandeira quadriculada como assinatura visual, breadcrumb hierárquico,
 * badge de season ativa pulsante e slot para ações + conteúdo adicional.
 */
export const RaceArenaHeader: FC<Props> = ({
  title,
  subtitle,
  emoji,
  breadcrumbCurrent,
  hasActiveSeason,
  seasonName,
  actions,
  belowChildren,
  className,
}) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        'relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-card via-card to-muted/30 p-4 shadow-sm',
        className,
      )}
    >
      {/* Bandeira quadriculada decorativa no canto */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-4 opacity-30 dark:opacity-20"
      >
        <CheckeredFlag width={180} height={110} />
      </div>

      <div className="relative z-10 flex flex-col gap-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/race-arena">Race Arena</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{breadcrumbCurrent}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button asChild size="icon" variant="ghost" className="shrink-0">
              <Link to="/race-arena" aria-label="Voltar ao Hub da Race Arena">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="min-w-0">
              <motion.h1
                layoutId="race-arena-title"
                className="flex items-center gap-2 font-display text-2xl font-black sm:text-3xl"
              >
                <Flag className="h-6 w-6 text-primary sm:h-7 sm:w-7" aria-hidden />
                {emoji && <span aria-hidden>{emoji}</span>}
                <span className="truncate">{title}</span>
                {hasActiveSeason && (
                  <Badge
                    variant="default"
                    className="ml-1 gap-1.5 bg-primary/15 text-primary hover:bg-primary/20 border-primary/30"
                  >
                    <span className="relative flex h-2 w-2" aria-hidden>
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                    </span>
                    <span className="text-xs font-semibold">
                      {seasonName ? `Season ativa: ${seasonName}` : 'Season ativa'}
                    </span>
                  </Badge>
                )}
              </motion.h1>
              {subtitle && (
                <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>

          {actions && (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          )}
        </div>

        {belowChildren && <div className="pt-1">{belowChildren}</div>}
      </div>
    </motion.header>
  );
};
