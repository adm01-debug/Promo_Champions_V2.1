import { FC, ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

/**
 * Wrapper de transição cinematográfica entre o Hub da Race Arena e as pistas.
 * Hub → Pista: zoom-in com leve blur de saída (sensação de "entrar na pista").
 * Pista → Hub: zoom-out com fade (sensação de "afastar").
 * Respeita prefers-reduced-motion (fade simples como fallback).
 */
export const RaceTransitionWrapper: FC<Props> = ({ children }) => {
  const location = useLocation();
  const prefersReduced = useReducedMotion();

  // Chave estável por sub-rota da Race Arena
  const key = location.pathname.startsWith('/race-arena/')
    ? location.pathname
    : '/race-arena';

  const isTrack = location.pathname.startsWith('/race-arena/') &&
    !location.pathname.startsWith('/race-arena/admin');

  const variants = prefersReduced
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: {
          opacity: 0,
          scale: isTrack ? 0.94 : 1.04,
          filter: 'blur(6px)',
        },
        animate: {
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
        },
        exit: {
          opacity: 0,
          scale: isTrack ? 1.04 : 0.96,
          filter: 'blur(4px)',
        },
      };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={key}
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={
          prefersReduced
            ? { duration: 0.2 }
            : { type: 'spring', stiffness: 280, damping: 28, mass: 0.7 }
        }
        style={{ willChange: 'opacity, transform, filter' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
