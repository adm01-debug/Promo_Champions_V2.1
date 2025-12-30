import { FC, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ShortcutItem {
  keys: string[];
  description: string;
  action?: () => void;
}

interface KeyboardShortcutsProps {
  shortcuts: ShortcutItem[];
  className?: string;
}

export const KeyboardShortcuts: FC<KeyboardShortcutsProps> = ({ shortcuts, className }) => {
  return (
    <div className={cn("space-y-2", className)}>
      {shortcuts.map((shortcut, index) => (
        <div
          key={index}
          className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <span className="text-sm text-muted-foreground">{shortcut.description}</span>
          <div className="flex items-center gap-1">
            {shortcut.keys.map((key, i) => (
              <kbd
                key={i}
                className="min-w-[24px] h-6 flex items-center justify-center px-1.5 rounded bg-muted text-xs font-medium"
              >
                {key}
              </kbd>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Botão de ajuda de atalhos
interface ShortcutsHelpButtonProps {
  shortcuts: ShortcutItem[];
}

export const ShortcutsHelpButton: FC<ShortcutsHelpButtonProps> = ({ shortcuts }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2 text-muted-foreground"
      >
        <Command className="h-4 w-4" />
        <span className="hidden sm:inline">Atalhos</span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2"
            >
              <div className="bg-card border rounded-xl shadow-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Command className="h-5 w-5" />
                  Atalhos de Teclado
                </h3>
                <KeyboardShortcuts shortcuts={shortcuts} />
                <div className="mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    className="w-full"
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// Hook para registrar atalhos
export const useKeyboardShortcut = (
  keys: string[],
  callback: () => void,
  options: { ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean } = {}
) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyMatch = keys.some(key => 
        e.key.toLowerCase() === key.toLowerCase()
      );

      if (
        keyMatch &&
        (!options.ctrlKey || e.ctrlKey || e.metaKey) &&
        (!options.shiftKey || e.shiftKey) &&
        (!options.altKey || e.altKey)
      ) {
        e.preventDefault();
        callback();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [keys, callback, options]);
};
