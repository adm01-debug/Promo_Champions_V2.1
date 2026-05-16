import { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, ArrowRight } from 'lucide-react';

interface NavigationHudProps {
  isVisible: boolean;
  baseKey: string;
}

/**
 * NavigationHud - A subtle HUD shown when a sequence key is pressed.
 * Elevates the "Pro" navigation experience.
 */
export const NavigationHud: FC<NavigationHudProps> = ({ isVisible, baseKey }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100]"
        >
          <div className="bg-background/80 backdrop-blur-xl border border-primary/20 shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <kbd className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-bold text-lg shadow-lg shadow-primary/20 uppercase">
                {baseKey}
              </kbd>
              <ArrowRight className="h-5 w-5 text-muted-foreground animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-primary uppercase tracking-widest">Sequência Iniciada</span>
              <span className="text-[10px] text-muted-foreground font-medium">Pressione a próxima tecla para navegar</span>
            </div>
            <div className="h-8 w-px bg-border/20 mx-2" />
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
              <span className="flex items-center gap-1"><kbd className="bg-muted px-1.5 py-0.5 rounded">D</kbd> Dash</span>
              <span className="flex items-center gap-1"><kbd className="bg-muted px-1.5 py-0.5 rounded">V</kbd> Vendas</span>
              <span className="flex items-center gap-1"><kbd className="bg-muted px-1.5 py-0.5 rounded">C</kbd> Clientes</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
