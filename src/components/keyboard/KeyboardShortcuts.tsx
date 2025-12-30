import { FC, useEffect, useState, createContext, useContext, ReactNode, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, Keyboard, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Shortcut {
  id: string;
  keys: string[];
  description: string;
  category: string;
  action: () => void;
  global?: boolean;
}

interface KeyboardShortcutsContextValue {
  shortcuts: Shortcut[];
  registerShortcut: (shortcut: Shortcut) => void;
  unregisterShortcut: (id: string) => void;
  isHelpOpen: boolean;
  openHelp: () => void;
  closeHelp: () => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextValue | null>(null);

export const KeyboardShortcutsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const registerShortcut = useCallback((shortcut: Shortcut) => {
    setShortcuts(prev => {
      const exists = prev.find(s => s.id === shortcut.id);
      if (exists) return prev;
      return [...prev, shortcut];
    });
  }, []);

  const unregisterShortcut = useCallback((id: string) => {
    setShortcuts(prev => prev.filter(s => s.id !== id));
  }, []);

  // Global keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).contentEditable === 'true'
      ) {
        // Allow Escape in inputs
        if (e.key !== 'Escape') return;
      }

      // Check for shortcut matches
      for (const shortcut of shortcuts) {
        const keys = shortcut.keys.map(k => k.toLowerCase());
        const pressedKeys: string[] = [];
        
        if (e.metaKey || e.ctrlKey) pressedKeys.push('cmd');
        if (e.altKey) pressedKeys.push('alt');
        if (e.shiftKey) pressedKeys.push('shift');
        pressedKeys.push(e.key.toLowerCase());

        const matches = keys.every(k => pressedKeys.includes(k)) && 
                       pressedKeys.length === keys.length;

        if (matches) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }

      // Built-in: ? for help
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        setIsHelpOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  return (
    <KeyboardShortcutsContext.Provider
      value={{
        shortcuts,
        registerShortcut,
        unregisterShortcut,
        isHelpOpen,
        openHelp: () => setIsHelpOpen(true),
        closeHelp: () => setIsHelpOpen(false)
      }}
    >
      {children}
      <ShortcutsHelpDialog />
    </KeyboardShortcutsContext.Provider>
  );
};

export const useKeyboardShortcuts = () => {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within KeyboardShortcutsProvider');
  }
  return context;
};

// Hook to register a shortcut
export const useShortcut = (
  id: string,
  keys: string[],
  description: string,
  category: string,
  action: () => void,
  deps: React.DependencyList = []
) => {
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();

  useEffect(() => {
    registerShortcut({ id, keys, description, category, action });
    return () => unregisterShortcut(id);
  }, [id, ...deps]);
};

// Help dialog component
const ShortcutsHelpDialog: FC = () => {
  const { shortcuts, isHelpOpen, closeHelp } = useKeyboardShortcuts();
  const [search, setSearch] = useState('');

  // Group by category
  const categories = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  const filteredCategories = Object.entries(categories).reduce((acc, [cat, items]) => {
    const filtered = items.filter(
      s => s.description.toLowerCase().includes(search.toLowerCase()) ||
           s.keys.join(' ').toLowerCase().includes(search.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[cat] = filtered;
    }
    return acc;
  }, {} as Record<string, Shortcut[]>);

  const formatKey = (key: string) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const keyMap: Record<string, string> = {
      cmd: isMac ? '⌘' : 'Ctrl',
      alt: isMac ? '⌥' : 'Alt',
      shift: '⇧',
      enter: '↵',
      escape: 'Esc',
      backspace: '⌫',
      delete: '⌦',
      up: '↑',
      down: '↓',
      left: '←',
      right: '→'
    };
    return keyMap[key.toLowerCase()] || key.toUpperCase();
  };

  return (
    <Dialog open={isHelpOpen} onOpenChange={closeHelp}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Atalhos de Teclado
          </DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar atalhos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-6">
          {Object.entries(filteredCategories).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {items.map((shortcut) => (
                  <div
                    key={shortcut.id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, i) => (
                        <span key={i}>
                          <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                            {formatKey(key)}
                          </kbd>
                          {i < shortcut.keys.length - 1 && (
                            <span className="mx-1 text-muted-foreground">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {Object.keys(filteredCategories).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Keyboard className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>Nenhum atalho encontrado</p>
            </div>
          )}
        </div>

        <div className="pt-4 border-t text-center text-sm text-muted-foreground">
          Pressione <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">?</kbd> a qualquer momento para ver esta ajuda
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Keyboard shortcut indicator component
interface ShortcutIndicatorProps {
  keys: string[];
  className?: string;
}

export const ShortcutIndicator: FC<ShortcutIndicatorProps> = ({ keys, className }) => {
  const formatKey = (key: string) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const keyMap: Record<string, string> = {
      cmd: isMac ? '⌘' : 'Ctrl',
      alt: isMac ? '⌥' : 'Alt',
      shift: '⇧'
    };
    return keyMap[key.toLowerCase()] || key.toUpperCase();
  };

  return (
    <span className={cn('inline-flex items-center gap-0.5 text-muted-foreground', className)}>
      {keys.map((key, i) => (
        <span key={i} className="flex items-center">
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
            {formatKey(key)}
          </kbd>
          {i < keys.length - 1 && <span className="mx-0.5">+</span>}
        </span>
      ))}
    </span>
  );
};
