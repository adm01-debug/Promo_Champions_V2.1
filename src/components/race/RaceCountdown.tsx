import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RaceCountdownProps {
  trigger: number; // increment to re-trigger
  onComplete?: () => void;
  onTick?: (n: number | 'GO') => void;
}

export function RaceCountdown({ trigger, onComplete, onTick }: RaceCountdownProps) {
  const [step, setStep] = useState<number | 'GO' | null>(null);

  useEffect(() => {
    if (trigger === 0) return;
    const seq: Array<number | 'GO'> = [3, 2, 1, 'GO'];
    let i = 0;
    setStep(seq[0]);
    onTick?.(seq[0]);
    const id = setInterval(() => {
      i++;
      if (i >= seq.length) {
        clearInterval(id);
        setTimeout(() => { setStep(null); onComplete?.(); }, 600);
        return;
      }
      setStep(seq[i]);
      onTick?.(seq[i]);
    }, 900);
    return () => clearInterval(id);
  }, [trigger, onComplete, onTick]);

  return (
    <AnimatePresence>
      {step !== null && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 backdrop-blur-sm pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            key={String(step)}
            initial={{ scale: 0.3, opacity: 0, rotate: -15 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 1.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 14 }}
            className="text-[12rem] font-black leading-none drop-shadow-2xl"
            style={{
              color: step === 'GO' ? 'hsl(var(--success))' : 'hsl(var(--primary))',
              textShadow: '0 8px 30px rgba(0,0,0,0.4)',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            {step}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
