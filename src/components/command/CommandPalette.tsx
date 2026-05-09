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
  BarChart3, Settings, Trophy, Calendar,
  Bell, FileText, Zap, Search, Plus, Moon, Sun, Keyboard,
  Clock, Brain, Flame, Radar, Shield, Globe, Sparkles, Loader2,
  Gauge, HeartPulse, LineChart, MessageSquare, Briefcase, TrendingUp,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useSemanticSearch } from "@/hooks/semantic/useSemanticSearch";
import { ENTITY_META, type SemanticEntityType } from "@/components/semantic/semanticSearchHelpers";

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
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useI18n();
  const { data: semanticData, loading: semanticLoading, search: semanticSearch, reset: resetSemantic } = useSemanticSearch();

  useEffect(() => {
    if (!open) { setQuery(""); resetSemantic(); }
  }, [open, resetSemantic]);

  useEffect(() => {
    if (!open) return;
    if (query.trim().length >= 4) semanticSearch(query, undefined, false);
    else resetSemantic();
  }, [query, open, semanticSearch, resetSemantic]);

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
    { id: "dashboard-overview", label: "Visão Geral", icon: LayoutDashboard, shortcut: "⌘D", action: () => navigate("/dashboard/visao-geral"), group: "navigation", keywords: ["home", "início", "painel", "overview"] },
    { id: "dashboard-performance", label: "Performance", icon: Gauge, action: () => navigate("/dashboard/performance"), group: "navigation", keywords: ["speedometer", "velocidade", "metas"] },
    { id: "dashboard-analytics", label: "Dashboard Analytics", icon: BarChart3, action: () => navigate("/dashboard/analises"), group: "navigation", keywords: ["análises", "gráficos", "data"] },
    { id: "dashboard-competition", label: "Competição", icon: Trophy, action: () => navigate("/dashboard/competicao"), group: "navigation", keywords: ["ranking", "arena", "leaderboard"] },
    { id: "dashboard-intelligence", label: "Inteligência", icon: Zap, action: () => navigate("/dashboard/inteligencia"), group: "navigation", keywords: ["ai", "insight", "preditivo"] },
    { id: "dashboard-engagement", label: "Engajamento", icon: HeartPulse, action: () => navigate("/dashboard/engajamento"), group: "navigation", keywords: ["mood", "pulse", "feedback"] },
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
    {
      id: "toggle-language", label: locale === "pt-BR" ? "Switch to English" : "Mudar para Português",
      icon: Globe,
      action: () => setLocale(locale === "pt-BR" ? "en" : "pt-BR"), group: "settings",
      keywords: ["idioma", "language", "english", "português"],
    },
    { id: "shortcuts", label: "Atalhos do Teclado", icon: Keyboard, shortcut: "⌘?", action: () => {}, group: "settings" },
  ], [theme, setTheme, locale, setLocale]);

  const allItems = useMemo(() => [...navigationItems, ...actionItems, ...settingsItems], [navigationItems, actionItems, settingsItems]);

  const recentIds = getRecent();
  const recentItems = useMemo(() =>
    recentIds.map((id) => allItems.find((item) => item.id === id)).filter(Boolean) as CommandItemData[],
    [recentIds, allItems]
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Digite um comando ou pergunte em linguagem natural… (ex: clientes que falaram em desconto)"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {semanticLoading ? (
            <span className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Buscando…
            </span>
          ) : "Nenhum resultado encontrado."}
        </CommandEmpty>

        {semanticData && semanticData.results.length > 0 && (
          <>
            <CommandGroup heading={
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-primary" />
                Busca Semântica IA
              </span>
            }>
              {semanticData.results.slice(0, 5).map((r) => {
                const meta = ENTITY_META[r.entity_type as SemanticEntityType];
                const Icon = meta?.icon ?? Search;
                return (
                  <CommandItem
                    key={r.id}
                    onSelect={() => {
                      setOpen(false);
                      if (meta) navigate(meta.route(r.entity_id));
                    }}
                    className="flex items-start gap-3"
                  >
                    <Icon className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {meta?.label ?? r.entity_type}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {Math.round(r.similarity * 100)}%
                        </span>
                      </div>
                      <p className="text-sm truncate">{r.content.slice(0, 110)}</p>
                    </div>
                  </CommandItem>
                );
              })}
              <CommandItem
                onSelect={() => { setOpen(false); navigate("/busca"); }}
                className="flex items-center gap-3 text-primary"
              >
                <Sparkles className="h-4 w-4" />
                <span>Ver todos os resultados semânticos</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
          </>
        )}
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
