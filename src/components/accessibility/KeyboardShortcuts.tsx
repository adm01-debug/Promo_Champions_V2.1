import { FC, useEffect, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Shortcut {
  keys: string[];
  description: string;
  action: () => void;
  category?: string;
}

interface KeyboardShortcutsProps {
  shortcuts: Shortcut[];
  children?: ReactNode;
}

export const KeyboardShortcuts: FC<KeyboardShortcutsProps> = ({ 
  shortcuts,
  children 
}) => {
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show help with ?
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShowHelp(prev => !prev);
        return;
      }

      // Check for matching shortcuts
      for (const shortcut of shortcuts) {
        const keys = shortcut.keys.map(k => k.toLowerCase());
        const pressedKeys: string[] = [];

        if (e.ctrlKey || e.metaKey) pressedKeys.push('ctrl');
        if (e.shiftKey) pressedKeys.push('shift');
        if (e.altKey) pressedKeys.push('alt');
        pressedKeys.push(e.key.toLowerCase());

        if (
          keys.length === pressedKeys.length &&
          keys.every((k, i) => k === pressedKeys[i])
        ) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || 'Geral';
    if (!acc[category]) acc[category] = [];
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  return (
    <>
      {children}
      
      <AnimatePresence>
        {showHelp && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHelp(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg max-h-[80vh] overflow-y-auto bg-background rounded-xl shadow-2xl"
            >
              <div className="sticky top-0 flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur">
                <div className="flex items-center gap-2">
                  <Keyboard className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold">Atalhos de Teclado</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowHelp(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-4 space-y-6">
                {Object.entries(groupedShortcuts).map(([category, items]) => (
                  <div key={category}>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      {category}
                    </h3>
                    <div className="space-y-2">
                      {items.map((shortcut, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-2"
                        >
                          <span className="text-sm">{shortcut.description}</span>
                          <div className="flex gap-1">
                            {shortcut.keys.map((key, keyIndex) => (
                              <kbd
                                key={keyIndex}
                                className={cn(
                                  "px-2 py-1 text-xs font-mono rounded",
                                  "bg-muted border border-border"
                                )}
                              >
                                {key}
                              </kbd>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground text-center">
                    Pressione <kbd className="px-1 bg-muted rounded">?</kbd> para mostrar/ocultar esta ajuda
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// Common shortcuts hook
export const useCommonShortcuts = () => {
  return [
    {
      keys: ['Ctrl', 'K'],
      description: 'Abrir busca rápida',
      action: () => console.log('Search'),
      category: 'Navegação'
    },
    {
      keys: ['Ctrl', 'N'],
      description: 'Nova venda',
      action: () => console.log('New sale'),
      category: 'Ações'
    },
    {
      keys: ['Ctrl', '/'],
      description: 'Abrir ajuda',
      action: () => console.log('Help'),
      category: 'Navegação'
    },
    {
      keys: ['Escape'],
      description: 'Fechar modal/menu',
      action: () => console.log('Close'),
      category: 'Geral'
    },
  ];
};
