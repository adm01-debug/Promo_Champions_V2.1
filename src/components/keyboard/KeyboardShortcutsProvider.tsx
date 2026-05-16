import { createContext, useContext, useState, useCallback, ReactNode, useRef, useEffect } from "react";
import { useGlobalKeyboardShortcuts, useKeyboardShortcutHint } from "@/hooks/useGlobalKeyboardShortcuts";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Keyboard, Search, Plus, Moon, Command, ArrowRight } from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";
import { NavigationHud } from "./NavigationHud";

interface KeyboardShortcutsContextType {
  openSearch: () => void;
  openNewSale: () => void;
  openNewClient: () => void;
  showShortcutsDialog: () => void;
  registerSearchHandler: (handler: () => void) => void;
  registerNewSaleHandler: (handler: () => void) => void;
  registerNewClientHandler: (handler: () => void) => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | null>(null);

export function useKeyboardShortcutsContext() {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error("useKeyboardShortcutsContext must be used within KeyboardShortcutsProvider");
  }
  return context;
}

interface KeyboardShortcutsProviderProps {
  children: ReactNode;
}

export function KeyboardShortcutsProvider({ children }: KeyboardShortcutsProviderProps) {
  const [shortcutsDialogOpen, setShortcutsDialogOpen] = useState(false);
  const { setTheme, theme } = useTheme();
  const { formatShortcut, isMac } = useKeyboardShortcutHint();
  const navigate = useNavigate();
  const [isGKeyDown, setIsGKeyDown] = useState(false);
  const gTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handler refs for dynamic registration
  const searchHandlerRef = useRef<(() => void) | null>(null);
  const newSaleHandlerRef = useRef<(() => void) | null>(null);
  const newClientHandlerRef = useRef<(() => void) | null>(null);

  const openSearch = useCallback(() => {
    searchHandlerRef.current?.();
  }, []);

  const openNewSale = useCallback(() => {
    newSaleHandlerRef.current?.();
  }, []);

  const openNewClient = useCallback(() => {
    newClientHandlerRef.current?.();
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  const showShortcutsDialog = useCallback(() => {
    setShortcutsDialogOpen(true);
  }, []);

  const registerSearchHandler = useCallback((handler: () => void) => {
    searchHandlerRef.current = handler;
  }, []);

  const registerNewSaleHandler = useCallback((handler: () => void) => {
    newSaleHandlerRef.current = handler;
  }, []);

  const registerNewClientHandler = useCallback((handler: () => void) => {
    newClientHandlerRef.current = handler;
  }, []);

  // Listen for "G" key sequences
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key.toLowerCase() === 'g') {
        setIsGKeyDown(true);
        if (gTimerRef.current) clearTimeout(gTimerRef.current);
        gTimerRef.current = setTimeout(() => setIsGKeyDown(false), 1500); // 1.5s window
        return;
      }

      if (isGKeyDown) {
        const key = e.key.toLowerCase();
        let targetPath = '';

        switch (key) {
          case 'd': targetPath = '/dashboard'; break;
          case 'v': targetPath = '/vendas'; break;
          case 'c': targetPath = '/clientes'; break;
          case 'p': targetPath = '/pipeline'; break;
          case 'm': targetPath = '/metas'; break;
          case 'a': targetPath = '/atividades'; break;
          case 'r': targetPath = '/ranking'; break;
          case 'i': targetPath = '/assistente'; break;
          case 's': targetPath = '/configuracoes'; break;
        }

        if (targetPath) {
          e.preventDefault();
          triggerHaptic('light');
          navigate(targetPath);
          setIsGKeyDown(false);
          if (gTimerRef.current) clearTimeout(gTimerRef.current);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (gTimerRef.current) clearTimeout(gTimerRef.current);
    };
  }, [isGKeyDown, navigate]);

  // Initialize global keyboard shortcuts
  useGlobalKeyboardShortcuts({
    onSearch: openSearch,
    onNewSale: openNewSale,
    onNewClient: openNewClient,
    onToggleTheme: toggleTheme,
    onShowShortcuts: showShortcutsDialog,
    enabled: true,
  });

  const shortcutGroups = [
    {
      title: "Ir para (Sequência G + ...)",
      shortcuts: [
        { key: "G + D", description: "Dashboard" },
        { key: "G + V", description: "Vendas" },
        { key: "G + C", description: "Clientes" },
        { key: "G + P", description: "Pipeline" },
        { key: "G + M", description: "Metas" },
        { key: "G + A", description: "Atividades" },
        { key: "G + R", description: "Ranking" },
        { key: "G + I", description: "IA Assistente" },
        { key: "G + S", description: "Configurações" },
      ],
    },
    {
      title: "Navegação por Teclado",
      shortcuts: [
        { key: "Alt + ←", description: "Voltar (Smart Back)" },
        { key: "Esc", description: "Fechar modal / Voltar" },
        { key: "?", description: "Mostrar atalhos", icon: Keyboard },
      ],
    },
    {
      title: "Ações Globais",
      shortcuts: [
        { key: formatShortcut("K", { ctrl: true }), description: "Abrir busca global", icon: Search },
        { key: "/", description: "Abrir busca global (alternativo)", icon: Search },
        { key: formatShortcut("N", { ctrl: true }), description: "Nova venda", icon: Plus },
        { key: formatShortcut("J", { ctrl: true }), description: "Novo cliente", icon: Plus },
        { key: formatShortcut("\\", { ctrl: true }), description: "Alternar tema", icon: Moon },
      ],
    },
  ];

  return (
    <KeyboardShortcutsContext.Provider
      value={{
        openSearch,
        openNewSale,
        openNewClient,
        showShortcutsDialog,
        registerSearchHandler,
        registerNewSaleHandler,
        registerNewClientHandler,
      }}
    >
      {children}

      {/* Shortcuts Dialog */}
      <Dialog open={shortcutsDialogOpen} onOpenChange={setShortcutsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Atalhos de Teclado
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {shortcutGroups.map((group) => (
              <div key={group.title}>
                <h4 className="text-sm font-semibold text-muted-foreground mb-3">
                  {group.title}
                </h4>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut) => (
                    <div
                      key={shortcut.key}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm flex items-center gap-2">
                        {shortcut.icon && <shortcut.icon className="h-4 w-4 text-muted-foreground" />}
                        {shortcut.description}
                      </span>
                      <Badge variant="outline" className="font-mono text-xs">
                        {shortcut.key}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {isMac ? (
                  <>
                    <Command className="h-3 w-3" /> = Command (⌘)
                  </>
                ) : (
                  <>
                    Ctrl = Control
                  </>
                )}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </KeyboardShortcutsContext.Provider>
  );
}
