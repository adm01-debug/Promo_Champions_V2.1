import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: string;
}

interface FloatingActionButtonProps {
  actions: FloatingAction[];
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  mainIcon?: React.ReactNode;
  haptic?: boolean;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  actions,
  className,
  position = 'bottom-right',
  mainIcon,
  haptic = true,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const positionClasses = {
    'bottom-right': 'right-4 bottom-20 sm:bottom-6',
    'bottom-left': 'left-4 bottom-20 sm:bottom-6',
    'bottom-center': 'left-1/2 -translate-x-1/2 bottom-20 sm:bottom-6',
  };

  const handleToggle = () => {
    if (haptic && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
    setIsOpen(!isOpen);
  };

  const handleAction = (action: FloatingAction) => {
    if (haptic && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
    action.onClick();
    setIsOpen(false);
  };

  return (
    <div className={cn("fixed z-50", positionClasses[position], className)}>
      {/* Action buttons */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-16 right-0 flex flex-col-reverse gap-3 mb-2"
          >
            {actions.map((action, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, scale: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  y: 0,
                  transition: { delay: index * 0.05 }
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 0, 
                  y: 20,
                  transition: { delay: (actions.length - index) * 0.03 }
                }}
                onClick={() => handleAction(action)}
                className={cn(
                  "flex items-center gap-3 pl-4 pr-5 py-3 rounded-full",
                  "bg-card border border-border shadow-lg",
                  "hover:bg-accent/10 active:scale-95 transition-all",
                  "text-sm font-medium whitespace-nowrap"
                )}
              >
                <span className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  action.color || "bg-primary text-primary-foreground"
                )}>
                  {action.icon}
                </span>
                {action.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm -z-10"
          />
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        onClick={handleToggle}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center",
          "bg-primary text-primary-foreground shadow-lg",
          "hover:bg-primary/90 active:scale-95 transition-all",
          "shadow-glow-primary"
        )}
      >
        {mainIcon || (isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />)}
      </motion.button>
    </div>
  );
};
