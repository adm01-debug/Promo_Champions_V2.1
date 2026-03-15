import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Target,
  BarChart3,
  Settings,
  Trophy,
  Calendar,
  MessageSquare,
  Bell,
  FileText,
  Zap,
  Search,
  Plus,
  Moon,
  Sun,
  Keyboard,
} from "lucide-react";
import { useTheme } from "next-themes";

interface CommandItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  action: () => void;
  group: "navigation" | "actions" | "settings";
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  // Keyboard shortcut to open
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  const navigationItems: CommandItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, shortcut: "⌘D", action: () => navigate("/"), group: "navigation" },
    { id: "pipeline", label: "Pipeline", icon: Zap, shortcut: "⌘P", action: () => navigate("/pipeline"), group: "navigation" },
    { id: "vendas", label: "Vendas", icon: ShoppingCart, shortcut: "⌘V", action: () => navigate("/vendas"), group: "navigation" },
    { id: "clientes", label: "Clientes", icon: Users, shortcut: "⌘C", action: () => navigate("/clientes"), group: "navigation" },
    { id: "produtos", label: "Produtos", icon: Package, action: () => navigate("/produtos"), group: "navigation" },
    { id: "metas", label: "Metas", icon: Target, action: () => navigate("/metas"), group: "navigation" },
    { id: "analytics", label: "Analytics", icon: BarChart3, action: () => navigate("/analytics"), group: "navigation" },
    { id: "ranking", label: "Ranking Competitivo", icon: Trophy, action: () => navigate("/ranking"), group: "navigation" },
    { id: "desafios", label: "Desafios Semanais", icon: Trophy, action: () => navigate("/desafios-semanais"), group: "navigation" },
    { id: "atividades", label: "Atividades", icon: Calendar, action: () => navigate("/atividades"), group: "navigation" },
    { id: "assistente", label: "Assistente IA", icon: MessageSquare, action: () => navigate("/assistente"), group: "navigation" },
    { id: "notificacoes", label: "Notificações", icon: Bell, action: () => navigate("/notificacoes"), group: "navigation" },
    { id: "relatorios", label: "Relatórios", icon: FileText, action: () => navigate("/relatorios"), group: "navigation" },
    { id: "configuracoes", label: "Configurações", icon: Settings, action: () => navigate("/configuracoes"), group: "navigation" },
  ];

  const actionItems: CommandItem[] = [
    { id: "new-sale", label: "Nova Venda", icon: Plus, shortcut: "⌘N", action: () => navigate("/vendas?new=true"), group: "actions" },
    { id: "new-client", label: "Novo Cliente", icon: Plus, action: () => navigate("/clientes?new=true"), group: "actions" },
    { id: "search", label: "Busca Global", icon: Search, shortcut: "⌘/", action: () => {}, group: "actions" },
  ];

  const settingsItems: CommandItem[] = [
    { 
      id: "toggle-theme", 
      label: theme === "dark" ? "Modo Claro" : "Modo Escuro", 
      icon: theme === "dark" ? Sun : Moon, 
      shortcut: "⌘T",
      action: () => setTheme(theme === "dark" ? "light" : "dark"), 
      group: "settings" 
    },
    { id: "shortcuts", label: "Atalhos do Teclado", icon: Keyboard, shortcut: "⌘?", action: () => {}, group: "settings" },
  ];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Digite um comando ou busque..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        
        <CommandGroup heading="Navegação">
          {navigationItems.map((item) => (
            <CommandItem
              key={item.id}
              onSelect={() => runCommand(item.action)}
              className="flex items-center gap-3"
            >
              <item.icon className="h-4 w-4 text-muted-foreground" />
              <span>{item.label}</span>
              {item.shortcut && (
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  {item.shortcut}
                </kbd>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
        
        <CommandSeparator />
        
        <CommandGroup heading="Ações Rápidas">
          {actionItems.map((item) => (
            <CommandItem
              key={item.id}
              onSelect={() => runCommand(item.action)}
              className="flex items-center gap-3"
            >
              <item.icon className="h-4 w-4 text-primary" />
              <span>{item.label}</span>
              {item.shortcut && (
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  {item.shortcut}
                </kbd>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
        
        <CommandSeparator />
        
        <CommandGroup heading="Configurações">
          {settingsItems.map((item) => (
            <CommandItem
              key={item.id}
              onSelect={() => runCommand(item.action)}
              className="flex items-center gap-3"
            >
              <item.icon className="h-4 w-4 text-muted-foreground" />
              <span>{item.label}</span>
              {item.shortcut && (
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  {item.shortcut}
                </kbd>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

// Hook to programmatically open command palette
export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  
  const openCommandPalette = useCallback(() => {
    // Dispatch keyboard event to trigger command palette
    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);
  }, []);

  return { openCommandPalette };
}