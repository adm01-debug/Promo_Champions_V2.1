import React, {
  FC,
  ReactNode,
  createContext,
  memo,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { motion, AnimatePresence, Variants, useReducedMotion } from 'framer-motion';
import { useLocation, useNavigationType } from 'react-router-dom';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/*  Tipos públicos                                                            */
/* -------------------------------------------------------------------------- */

export type TransitionVariant =
  | 'fade'
  | 'slide-x'
  | 'slide-y'
  | 'zoom'
  | 'flip-x'
  | 'flip-y'
  | 'parallax'
  | 'blur';

export interface PageTransitionConfig {
  variant?: TransitionVariant;
  duration?: number; // segundos
  ease?: number[] | string; // cubic-bezier ou string Framer
  /** distância em px para efeitos slide/parallax */
  distance?: number;
}

const DEFAULTS: Required<PageTransitionConfig> = {
  variant: 'blur',
  duration: 0.35,
  ease: [0.23, 1, 0.32, 1],
  distance: 24,
};

/* -------------------------------------------------------------------------- */
/*  Contexto para configuração dinâmica (ex.: por rota / por usuário)         */
/* -------------------------------------------------------------------------- */

const PageTransitionContext = createContext<PageTransitionConfig>({});

export const PageTransitionProvider: FC<{
  children: ReactNode;
  config?: PageTransitionConfig;
}> = ({ children, config }) => (
  <PageTransitionContext.Provider value={config ?? {}}>{children}</PageTransitionContext.Provider>
);

export const usePageTransitionConfig = (): PageTransitionConfig =>
  useContext(PageTransitionContext);

/* -------------------------------------------------------------------------- */
/*  Builder de variants                                                       */
/* -------------------------------------------------------------------------- */

function buildVariants(
  cfg: Required<PageTransitionConfig>,
  reducedMotion: boolean,
): Variants {
  const { variant, duration, ease, distance } = cfg;
  const inT = { duration, ease };
  const outT = { duration: duration * 0.7, ease };

  if (reducedMotion || variant === 'fade') {
    return {
      initial: { opacity: 0 },
      in: { opacity: 1, transition: inT },
      out: { opacity: 0, transition: outT },
    };
  }

  switch (variant) {
    case 'slide-x':
      return {
        initial: (d: number) => ({ opacity: 0, x: d > 0 ? distance : -distance }),
        in: { opacity: 1, x: 0, transition: inT },
        out: (d: number) => ({ opacity: 0, x: d > 0 ? -distance : distance, transition: outT }),
      };
    case 'slide-y':
      return {
        initial: { opacity: 0, y: distance },
        in: { opacity: 1, y: 0, transition: inT },
        out: { opacity: 0, y: -distance, transition: outT },
      };
    case 'zoom':
      return {
        initial: { opacity: 0, scale: 0.94 },
        in: { opacity: 1, scale: 1, transition: inT },
        out: { opacity: 0, scale: 1.04, transition: outT },
      };
    case 'flip-x':
      return {
        initial: { opacity: 0, rotateX: -12, transformPerspective: 1200 },
        in: { opacity: 1, rotateX: 0, transition: inT },
        out: { opacity: 0, rotateX: 12, transition: outT },
      };
    case 'flip-y':
      return {
        initial: { opacity: 0, rotateY: -12, transformPerspective: 1200 },
        in: { opacity: 1, rotateY: 0, transition: inT },
        out: { opacity: 0, rotateY: 12, transition: outT },
      };
    case 'parallax':
      return {
        initial: (d: number) => ({
          opacity: 0,
          x: d > 0 ? distance * 2 : -distance * 2,
          scale: 0.98,
        }),
        in: { opacity: 1, x: 0, scale: 1, transition: inT },
        out: (d: number) => ({
          opacity: 0,
          x: d > 0 ? -distance * 2 : distance * 2,
          scale: 0.98,
          transition: outT,
        }),
      };
    case 'blur':
    default:
      return {
        initial: (d: number) => ({
          opacity: 0,
          x: d > 0 ? distance * 0.6 : -distance * 0.6,
          scale: 0.99,
          filter: 'blur(4px)',
        }),
        in: {
          opacity: 1,
          x: 0,
          scale: 1,
          filter: 'blur(0px)',
          transition: { ...inT, staggerChildren: 0.05, when: 'beforeChildren' },
        },
        out: (d: number) => ({
          opacity: 0,
          x: d > 0 ? -distance * 0.6 : distance * 0.6,
          scale: 1.01,
          filter: 'blur(4px)',
          transition: outT,
        }),
      };
  }
}

/* -------------------------------------------------------------------------- */
/*  Variants de stagger (re-exportados)                                       */
/* -------------------------------------------------------------------------- */

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.01 },
  },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.99 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

/* -------------------------------------------------------------------------- */
/*  Componente principal                                                      */
/* -------------------------------------------------------------------------- */

interface PageTransitionProps extends PageTransitionConfig {
  children: ReactNode;
  className?: string;
}

export const PageTransition: FC<PageTransitionProps> = memo(
  ({ children, className, variant, duration, ease, distance }) => {
    const location = useLocation();
    const navigationType = useNavigationType();
    const ctx = usePageTransitionConfig();
    const reducedMotion = useReducedMotion() ?? false;

    const [direction, setDirection] = useState(1);
    const prevPathRef = useRef(location.pathname);

    useEffect(() => {
      const currentDepth = location.pathname.split('/').filter(Boolean).length;
      const prevDepth = prevPathRef.current.split('/').filter(Boolean).length;

      if (navigationType === 'POP' || currentDepth < prevDepth) {
        setDirection(-1);
      } else {
        setDirection(1);
      }
      prevPathRef.current = location.pathname;

      if (window.scrollY > 0) {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    }, [location.pathname, navigationType]);

    const cfg: Required<PageTransitionConfig> = useMemo(
      () => ({
        variant: variant ?? ctx.variant ?? DEFAULTS.variant,
        duration: duration ?? ctx.duration ?? DEFAULTS.duration,
        ease: ease ?? ctx.ease ?? DEFAULTS.ease,
        distance: distance ?? ctx.distance ?? DEFAULTS.distance,
      }),
      [variant, duration, ease, distance, ctx],
    );

    const variants = useMemo(() => buildVariants(cfg, reducedMotion), [cfg, reducedMotion]);

    const containerClass = useMemo(
      () => cn('w-full min-h-full will-change-[opacity,transform,filter]', className),
      [className],
    );

    return (
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          key={location.pathname}
          custom={direction}
          initial="initial"
          animate="in"
          exit="out"
          variants={variants}
          className={containerClass}
        >
          {!reducedMotion && (
            <motion.div
              className="absolute top-0 left-0 w-full h-[1px] bg-primary/40 z-[100] pointer-events-none"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: [0, 1, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            />
          )}
          {children}
        </motion.div>
      </AnimatePresence>
    );
  },
);

PageTransition.displayName = 'PageTransition';

/* -------------------------------------------------------------------------- */
/*  StaggeredContainer (mantido)                                              */
/* -------------------------------------------------------------------------- */

export const StaggeredContainer: FC<{
  children: ReactNode;
  className?: string;
  delay?: number;
}> = memo(({ children, className, delay = 0 }) => {
  const variants = useMemo<Variants>(
    () => ({
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05, delayChildren: delay },
      },
    }),
    [delay],
  );

  return (
    <motion.div initial="hidden" animate="visible" variants={variants} className={cn(className)}>
      {children}
    </motion.div>
  );
});

StaggeredContainer.displayName = 'StaggeredContainer';
