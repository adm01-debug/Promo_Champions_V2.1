import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";
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
  LayoutDashboard, ShoppingCart, Users, Package, Target,
  BarChart3, Settings, Trophy, Calendar, MessageSquare,
  Bell, FileText, Zap, Search, Plus, Moon, Sun, Keyboard,
  Clock, Heart, Brain, Flame, Radar, Shield, Star, Globe,
} from "lucide-react";
import { useTheme } from "next-themes";

interface CommandItemData {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  action: () => void;
  group: "navigation" | "actions" | "settings" | "recent";
  keywords?: string[];
}

const RECENT_KEY = "command-palette-recent";
const MAX_RECENT = 5;

function getRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

function addRecent(id: string) {
  const recent = getRecent().filter((r) => r !== id);
  recent.unshift(id);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useI18n();

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

  const runCommand = useCallback((id: string, command: () => void) => {
    setOpen(false);
    addRecent(id);
    command();
  }, []);

  const navigationItems: CommandItemData[] = useMemo(() => [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, shortcut: "⌘D", action: () => navigate("/"), group: "navigation", keywords: ["home", "início", "painel"] },
    { id: "pipeline", label: "Pipeline", icon: Zap, shortcut: "⌘P", action: () => navigate("/pipeline"), group: "navigation", keywords: ["funil", "kanban"] },
    { id: "vendas", label: "Vendas", icon: ShoppingCart, shortcut: "⌘V", action: () => navigate("/vendas"), group: "navigation", keywords: ["sales", "deals", "negócios"] },
    { id: "clientes", label: "Clientes", icon: Users, shortcut: "⌘C", action: () => navigate("/clientes"), group: "navigation", keywords: ["customers", "contacts"] },
    { id: "produtos", label: "Produtos", icon: Package, action: () => navigate("/produtos"), group: "navigation", keywords: ["products", "catalog"] },
    { id: "metas", label: "Metas", icon: Target, action: () => navigate("/metas"), group: "navigation", keywords: ["goals", "objectives", "targets"] },
    { id: "analytics", label: "Analytics", icon: BarChart3, action: () => navigate("/analytics"), group: "navigation", keywords: ["análise", "relatórios", "gráficos", "heatmap", "radar"] },
    { id: "ranking", label: "Ranking Competitivo", icon: Trophy, action: () => navigate("/ranking"), group: "navigation", keywords: ["leaderboard", "competition"] },
    { id: "desafios", label: "Desafios Semanais", icon: Flame, action: () => navigate("/desafios-semanais"), group: "navigation", keywords: ["challenges", "weekly"] },
    { id: "atividades", label: "Atividades", icon: Calendar, action: () => navigate("/atividades"), group: "navigation", keywords: ["activities", "calls", "meetings"] },
    { id: "assistente", label: "Assistente IA", icon: Brain, action: () => navigate("/assistente"), group: "navigation", keywords: ["ai", "copilot", "chat", "inteligência"] },
    { id: "notificacoes", label: "Notificações", icon: Bell, action: () => navigate("/notificacoes"), group: "navigation", keywords: ["alerts", "avisos"] },
    { id: "relatorios", label: "Relatórios", icon: FileText, action: () => navigate("/relatorios"), group: "navigation", keywords: ["reports", "export"] },
    { id: "bi-gestor", label: "BI Gestão", icon: Radar, action: () => navigate("/bi-gestor"), group: "navigation", keywords: ["business intelligence", "gestão"] },
    { id: "seguranca", label: "Segurança", icon: Shield, action: () => navigate("/configuracoes"), group: "navigation", keywords: ["security", "mfa", "2fa"] },
    { id: "configuracoes", label: "Configurações", icon: Settings, action: () => navigate("/configuracoes"), group: "navigation", keywords: ["settings", "preferences"] },
  ], [navigate]);

  const actionItems: CommandItemData[] = useMemo(() => [
    { id: "new-sale", label: "Nova Venda", icon: Plus, shortcut: "⌘N", action: () => navigate("/vendas?new=true"), group: "actions", keywords: ["create", "add", "nova"] },
    { id: "new-client", label: "Novo Cliente", icon: Plus, action: () => navigate("/clientes?new=true"), group: "actions", keywords: ["create", "add", "novo"] },
    { id: "search", label: "Busca Global", icon: Search, shortcut: "⌘/", action: () => {}, group: "actions" },
  ], [navigate]);

  const settingsItems: CommandItemData[] = useMemo(() => [
    {
      id: "toggle-theme", label: theme === "dark" ? "Modo Claro" : "Modo Escuro",
      icon: theme === "dark" ? Sun : Moon, shortcut: "⌘T",
      action: () => setTheme(theme === "dark" ? "light" : "dark"), group: "settings",
    },
    { id: "shortcuts", label: "Atalhos do Teclado", icon: Keyboard, shortcut: "⌘?", action: () => {}, group: "settings" },
  ], [theme, setTheme]);

  const allItems = useMemo(() => [...navigationItems, ...actionItems, ...settingsItems], [navigationItems, actionItems, settingsItems]);

  const recentIds = getRecent();
  const recentItems = useMemo(() =>
    recentIds.map((id) => allItems.find((item) => item.id === id)).filter(Boolean) as CommandItemData[],
    [recentIds, allItems]
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Digite um comando ou busque... (ex: vendas, pipeline, novo)" />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

        {recentItems.length > 0 && (
          <>
            <CommandGroup heading="Recentes">
              {recentItems.map((item) => (
                <CommandItem
                  key={`recent-${item.id}`}
                  onSelect={() => runCommand(item.id, item.action)}
                  className="flex items-center gap-3"
                  keywords={item.keywords}
                >
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span>{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        <CommandGroup heading="Navegação">
          {navigationItems.map((item) => (
            <CommandItem
              key={item.id}
              onSelect={() => runCommand(item.id, item.action)}
              className="flex items-center gap-3"
              keywords={item.keywords}
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
              onSelect={() => runCommand(item.id, item.action)}
              className="flex items-center gap-3"
              keywords={item.keywords}
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
              onSelect={() => runCommand(item.id, item.action)}
              className="flex items-center gap-3"
              keywords={item.keywords}
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

export function useCommandPalette() {
  const openCommandPalette = useCallback(() => {
    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);
  }, []);

  return { openCommandPalette };
}
