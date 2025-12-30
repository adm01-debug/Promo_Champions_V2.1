import { FC, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FABAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: string;
}

interface FloatingActionButtonProps {
  actions: FABAction[];
  className?: string;
}

export const FloatingActionButton: FC<FloatingActionButtonProps> = ({ 
  actions,
  className 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className={cn("fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2", className)}>
      <AnimatePresence>
        {isOpen && (
          <>
            {actions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ 
                  duration: 0.2, 
                  delay: (actions.length - index - 1) * 0.05 
                }}
                className="flex items-center gap-2"
              >
                <span className="px-3 py-1.5 rounded-lg bg-card text-sm font-medium shadow-lg border border-border">
                  {action.label}
                </span>
                <button
                  onClick={() => {
                    action.onClick();
                    setIsOpen(false);
                  }}
                  className={cn(
                    "h-12 w-12 rounded-full shadow-lg flex items-center justify-center transition-transform active:scale-95",
                    action.color || "bg-primary text-primary-foreground"
                  )}
                  aria-label={action.label}
                >
                  {action.icon}
                </button>
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
      
      <motion.button
        onClick={toggleOpen}
        className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ duration: 0.2 }}
        aria-label={isOpen ? "Fechar ações rápidas" : "Abrir ações rápidas"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </motion.button>
    </div>
  );
};
