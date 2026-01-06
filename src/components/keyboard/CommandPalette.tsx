import { FC, useState, useEffect, useCallback, createContext, useContext, ReactNode, useMemo } from 'react';
import { 
  Search, 
  Home, 
  Users, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  Plus,
  Calendar,
  Moon,
  Sun,
  Command,
  Zap,
  Target,
  Trophy,
  Clock,
  Star,
  TrendingUp,
  Phone,
  Mail,
  MessageSquare
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
import { Badge } from '@/components/ui/badge';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  shortcut?: string[];
  action: () => void;
  group: string;
  keywords?: string[];
  priority?: number;
}

interface RecentItem {
  id: string;
  label: string;
  path: string;
  timestamp: number;
}

interface CommandPaletteContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  registerCommand: (command: CommandItem) => void;
  unregisterCommand: (id: string) => void;
  addRecent: (item: Omit<RecentItem, 'timestamp'>) => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

const RECENT_KEY = 'command-palette-recent';
const MAX_RECENT = 5;

export const CommandPaletteProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [commands, setCommands] = useState<CommandItem[]>([]);
  const [recents, setRecents] = useState<RecentItem[]>([]);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  // Load recents from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_KEY);
    if (stored) {
      try {
        setRecents(JSON.parse(stored));
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  const addRecent = useCallback((item: Omit<RecentItem, 'timestamp'>) => {
    setRecents(prev => {
      const filtered = prev.filter(r => r.id !== item.id);
      const updated = [{ ...item, timestamp: Date.now() }, ...filtered].slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Default commands with enhanced metadata
  const defaultCommands: CommandItem[] = useMemo(() => [
    // Quick Actions (high priority)
    { id: 'action-new-deal', label: 'Criar Deal', description: 'Adicionar novo negócio ao pipeline', icon: Plus, shortcut: ['⌘', 'D'], action: () => { navigate('/pipeline?new=true'); addRecent({ id: 'action-new-deal', label: 'Criar Deal', path: '/pipeline?new=true' }); }, group: 'Ações Rápidas', keywords: ['criar', 'adicionar', 'negocio', 'venda'], priority: 1 },
    { id: 'action-new-task', label: 'Criar Tarefa', description: 'Adicionar nova tarefa', icon: Calendar, shortcut: ['⌘', 'T'], action: () => { navigate('/tarefas?new=true'); addRecent({ id: 'action-new-task', label: 'Criar Tarefa', path: '/tarefas?new=true' }); }, group: 'Ações Rápidas', keywords: ['tarefa', 'todo', 'atividade'], priority: 1 },
    { id: 'action-log-call', label: 'Registrar Ligação', description: 'Registrar atividade de ligação', icon: Phone, action: () => { navigate('/atividades?type=call'); }, group: 'Ações Rápidas', keywords: ['ligacao', 'telefone', 'call'], priority: 1 },
    { id: 'action-log-email', label: 'Registrar E-mail', description: 'Registrar atividade de e-mail', icon: Mail, action: () => { navigate('/atividades?type=email'); }, group: 'Ações Rápidas', keywords: ['email', 'mensagem'], priority: 1 },
    { id: 'action-log-meeting', label: 'Registrar Reunião', description: 'Registrar atividade de reunião', icon: MessageSquare, action: () => { navigate('/atividades?type=meeting'); }, group: 'Ações Rápidas', keywords: ['reuniao', 'meeting'], priority: 1 },
    
    // Navigation
    { id: 'nav-home', label: 'Dashboard', description: 'Visão geral do seu desempenho', icon: Home, action: () => { navigate('/'); addRecent({ id: 'nav-home', label: 'Dashboard', path: '/' }); }, group: 'Navegação', keywords: ['home', 'inicio', 'principal'] },
    { id: 'nav-pipeline', label: 'Pipeline', description: 'Gerenciar deals e oportunidades', icon: ShoppingCart, action: () => { navigate('/pipeline'); addRecent({ id: 'nav-pipeline', label: 'Pipeline', path: '/pipeline' }); }, group: 'Navegação', keywords: ['kanban', 'deals', 'vendas'] },
    { id: 'nav-clients', label: 'Clientes', description: 'Base de clientes e contatos', icon: Users, action: () => { navigate('/clientes'); addRecent({ id: 'nav-clients', label: 'Clientes', path: '/clientes' }); }, group: 'Navegação' },
    { id: 'nav-tasks', label: 'Tarefas', description: 'Gerenciar suas atividades', icon: Calendar, action: () => { navigate('/tarefas'); addRecent({ id: 'nav-tasks', label: 'Tarefas', path: '/tarefas' }); }, group: 'Navegação' },
    { id: 'nav-analytics', label: 'Analytics', description: 'Relatórios e métricas', icon: BarChart3, action: () => { navigate('/analytics'); addRecent({ id: 'nav-analytics', label: 'Analytics', path: '/analytics' }); }, group: 'Navegação' },
    { id: 'nav-ranking', label: 'Ranking', description: 'Competição e gamificação', icon: Trophy, action: () => { navigate('/ranking'); addRecent({ id: 'nav-ranking', label: 'Ranking', path: '/ranking' }); }, group: 'Navegação', keywords: ['competicao', 'leaderboard'] },
    { id: 'nav-goals', label: 'Metas', description: 'Acompanhar objetivos', icon: Target, action: () => { navigate('/metas'); }, group: 'Navegação' },
    { id: 'nav-settings', label: 'Configurações', description: 'Preferências do sistema', icon: Settings, action: () => { navigate('/configuracoes'); }, group: 'Navegação' },
    
    // Gamification
    { id: 'game-challenges', label: 'Desafios', description: 'Ver desafios diários e semanais', icon: Zap, action: () => { navigate('/desafios'); }, group: 'Gamificação', keywords: ['missao', 'xp', 'pontos'] },
    { id: 'game-achievements', label: 'Conquistas', description: 'Ver suas conquistas', icon: Star, action: () => { navigate('/conquistas'); }, group: 'Gamificação', keywords: ['medalhas', 'badges'] },
    { id: 'game-rewards', label: 'Recompensas', description: 'Loja de recompensas', icon: TrendingUp, action: () => { navigate('/loja-recompensas'); }, group: 'Gamificação' },
    
    // Preferences
    { id: 'theme-toggle', label: theme === 'dark' ? 'Ativar Modo Claro' : 'Ativar Modo Escuro', description: 'Alternar tema do sistema', icon: theme === 'dark' ? Sun : Moon, shortcut: ['⌘', 'J'], action: () => setTheme(theme === 'dark' ? 'light' : 'dark'), group: 'Preferências' },
  ], [navigate, theme, setTheme, addRecent]);

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
        unregisterCommand,
        addRecent,
      }}
    >
      {children}
      <CommandPaletteDialog 
        open={isOpen} 
        onOpenChange={setIsOpen} 
        commands={allCommands}
        recents={recents}
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
  recents: RecentItem[];
}

const CommandPaletteDialog: FC<CommandPaletteDialogProps> = ({ open, onOpenChange, commands, recents }) => {
  const navigate = useNavigate();

  // Group commands
  const groups = commands.reduce((acc, cmd) => {
    if (!acc[cmd.group]) acc[cmd.group] = [];
    acc[cmd.group].push(cmd);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  // Sort groups by priority
  const groupOrder = ['Ações Rápidas', 'Navegação', 'Gamificação', 'Preferências'];
  const sortedGroups = Object.entries(groups).sort(([a], [b]) => {
    const aIndex = groupOrder.indexOf(a);
    const bIndex = groupOrder.indexOf(b);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });

  const runCommand = (command: CommandItem) => {
    command.action();
    onOpenChange(false);
  };

  const runRecent = (recent: RecentItem) => {
    navigate(recent.path);
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="O que você quer fazer? Busque comandos, páginas..." />
      <CommandList className="max-h-[400px]">
        <CommandEmpty>
          <div className="flex flex-col items-center py-6 text-muted-foreground">
            <Search className="h-8 w-8 mb-2 opacity-50" />
            <p>Nenhum resultado encontrado</p>
            <p className="text-xs mt-1">Tente buscar por "deal", "tarefa" ou "pipeline"</p>
          </div>
        </CommandEmpty>
        
        {/* Recents */}
        {recents.length > 0 && (
          <>
            <CommandGroup heading="Recentes">
              {recents.map((recent) => (
                <CommandItem
                  key={recent.id}
                  value={recent.label}
                  onSelect={() => runRecent(recent)}
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{recent.label}</span>
                  <Badge variant="secondary" className="ml-auto text-[10px]">
                    recente
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}
        
        {sortedGroups.map(([group, items], groupIndex) => (
          <div key={group}>
            {groupIndex > 0 && <CommandSeparator />}
            <CommandGroup heading={group}>
              {items.map((command) => {
                const Icon = command.icon;
                return (
                  <CommandItem
                    key={command.id}
                    value={`${command.label} ${command.description || ''} ${command.keywords?.join(' ') || ''}`}
                    onSelect={() => runCommand(command)}
                    className="flex items-center gap-3 py-3"
                  >
                    {Icon && (
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/50">
                        <Icon className="h-4 w-4" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="font-medium">{command.label}</span>
                      {command.description && (
                        <p className="text-xs text-muted-foreground truncate">{command.description}</p>
                      )}
                    </div>
                    {command.shortcut && (
                      <div className="flex items-center gap-1">
                        {command.shortcut.map((key, i) => (
                          <kbd
                            key={i}
                            className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono border border-border/50"
                          >
                            {key}
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
      
      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-border/50 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-muted rounded font-mono">↑↓</kbd> navegar
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-muted rounded font-mono">↵</kbd> selecionar
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-muted rounded font-mono">esc</kbd> fechar
          </span>
        </div>
        <span className="flex items-center gap-1">
          <Command className="h-3 w-3" />
          Sales Arena
        </span>
      </div>
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
        transition-all hover:border-primary/30 hover:shadow-sm ${className}
      `}
    >
      <Search className="w-4 h-4" />
      <span className="hidden sm:inline">Buscar...</span>
      <kbd className="ml-auto px-1.5 py-0.5 bg-background rounded text-xs font-mono border border-border/50">
        ⌘K
      </kbd>
    </button>
  );
};
