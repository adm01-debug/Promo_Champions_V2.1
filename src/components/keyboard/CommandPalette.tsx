import { FC, useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Home, 
  Users, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  Plus,
  FileText,
  Calendar,
  Bell,
  LogOut,
  Moon,
  Sun,
  Command
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';

interface CommandItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  shortcut?: string[];
  action: () => void;
  group: string;
  keywords?: string[];
}

interface CommandPaletteContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  registerCommand: (command: CommandItem) => void;
  unregisterCommand: (id: string) => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

export const CommandPaletteProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [commands, setCommands] = useState<CommandItem[]>([]);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  // Default commands
  const defaultCommands: CommandItem[] = [
    // Navigation
    { id: 'nav-home', label: 'Ir para Dashboard', icon: Home, action: () => navigate('/'), group: 'Navegação', keywords: ['home', 'inicio'] },
    { id: 'nav-clients', label: 'Ir para Clientes', icon: Users, action: () => navigate('/clientes'), group: 'Navegação' },
    { id: 'nav-pipeline', label: 'Ir para Pipeline', icon: ShoppingCart, action: () => navigate('/pipeline'), group: 'Navegação' },
    { id: 'nav-analytics', label: 'Ir para Analytics', icon: BarChart3, action: () => navigate('/analytics'), group: 'Navegação' },
    { id: 'nav-tasks', label: 'Ir para Tarefas', icon: Calendar, action: () => navigate('/tarefas'), group: 'Navegação' },
    { id: 'nav-settings', label: 'Ir para Configurações', icon: Settings, action: () => navigate('/configuracoes'), group: 'Navegação' },
    
    // Actions
    { id: 'action-new-deal', label: 'Novo Deal', icon: Plus, shortcut: ['cmd', 'n'], action: () => { /* trigger modal */ }, group: 'Ações', keywords: ['criar', 'adicionar'] },
    { id: 'action-new-client', label: 'Novo Cliente', icon: Plus, action: () => navigate('/clientes?new=true'), group: 'Ações' },
    { id: 'action-new-task', label: 'Nova Tarefa', icon: Plus, action: () => navigate('/tarefas?new=true'), group: 'Ações' },
    
    // Theme
    { id: 'theme-toggle', label: theme === 'dark' ? 'Modo Claro' : 'Modo Escuro', icon: theme === 'dark' ? Sun : Moon, action: () => setTheme(theme === 'dark' ? 'light' : 'dark'), group: 'Preferências' },
  ];

  const allCommands = [...defaultCommands, ...commands];

  const registerCommand = useCallback((command: CommandItem) => {
    setCommands(prev => [...prev.filter(c => c.id !== command.id), command]);
  }, []);

  const unregisterCommand = useCallback((id: string) => {
    setCommands(prev => prev.filter(c => c.id !== id));
  }, []);

  // Keyboard shortcut to open
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(open => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <CommandPaletteContext.Provider
      value={{
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen(o => !o),
        registerCommand,
        unregisterCommand
      }}
    >
      {children}
      <CommandPaletteDialog 
        open={isOpen} 
        onOpenChange={setIsOpen} 
        commands={allCommands}
      />
    </CommandPaletteContext.Provider>
  );
};

export const useCommandPalette = () => {
  const context = useContext(CommandPaletteContext);
  if (!context) {
    throw new Error('useCommandPalette must be used within CommandPaletteProvider');
  }
  return context;
};

// Dialog component
interface CommandPaletteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commands: CommandItem[];
}

const CommandPaletteDialog: FC<CommandPaletteDialogProps> = ({ open, onOpenChange, commands }) => {
  // Group commands
  const groups = commands.reduce((acc, cmd) => {
    if (!acc[cmd.group]) acc[cmd.group] = [];
    acc[cmd.group].push(cmd);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  const runCommand = (command: CommandItem) => {
    command.action();
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Digite um comando ou busque..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        
        {Object.entries(groups).map(([group, items], groupIndex) => (
          <div key={group}>
            {groupIndex > 0 && <CommandSeparator />}
            <CommandGroup heading={group}>
              {items.map((command) => {
                const Icon = command.icon;
                return (
                  <CommandItem
                    key={command.id}
                    value={`${command.label} ${command.keywords?.join(' ') || ''}`}
                    onSelect={() => runCommand(command)}
                  >
                    {Icon && <Icon className="mr-2 h-4 w-4" />}
                    <span>{command.label}</span>
                    {command.shortcut && (
                      <div className="ml-auto flex items-center gap-1">
                        {command.shortcut.map((key, i) => (
                          <kbd
                            key={i}
                            className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono"
                          >
                            {key === 'cmd' ? '⌘' : key.toUpperCase()}
                          </kbd>
                        ))}
                      </div>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  );
};

// Trigger button component
export const CommandPaletteTrigger: FC<{ className?: string }> = ({ className }) => {
  const { open } = useCommandPalette();

  return (
    <button
      onClick={open}
      className={`
        flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground
        bg-muted/50 hover:bg-muted rounded-lg border border-border
        transition-colors ${className}
      `}
    >
      <Search className="w-4 h-4" />
      <span>Buscar...</span>
      <kbd className="ml-auto px-1.5 py-0.5 bg-background rounded text-xs font-mono">
        ⌘K
      </kbd>
    </button>
  );
};
