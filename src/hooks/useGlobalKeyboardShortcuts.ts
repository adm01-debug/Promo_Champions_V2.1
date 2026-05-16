import { useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
  global?: boolean;
}

interface UseGlobalKeyboardShortcutsOptions {
  onSearch?: () => void;
  onNewSale?: () => void;
  onNewClient?: () => void;
  onToggleTheme?: () => void;
  onShowShortcuts?: () => void;
  enabled?: boolean;
}

export function useGlobalKeyboardShortcuts({
  onSearch,
  onNewSale,
  onNewClient,
  onToggleTheme,
  onShowShortcuts,
  enabled = true,
}: UseGlobalKeyboardShortcutsOptions = {}) {
  const navigate = useNavigate();
  const shortcutsRef = useRef<KeyboardShortcut[]>([]);

  // Define all shortcuts
  shortcutsRef.current = [
    // Navigation shortcuts
    {
      key: "g",
      description: "Ir para Dashboard",
      action: () => {
        navigate("/");
        toast.info("Dashboard", { description: "Navegando para o dashboard..." });
      },
    },
    {
      key: "v",
      description: "Ir para Vendas",
      action: () => {
        navigate("/vendas");
        toast.info("Vendas", { description: "Navegando para vendas..." });
      },
    },
    {
      key: "c",
      description: "Ir para Clientes",
      action: () => {
        navigate("/clientes");
        toast.info("Clientes", { description: "Navegando para clientes..." });
      },
    },
    {
      key: "p",
      description: "Ir para Pipeline",
      action: () => {
        navigate("/pipeline");
        toast.info("Pipeline", { description: "Navegando para pipeline..." });
      },
    },
    {
      key: "m",
      description: "Ir para Metas",
      action: () => {
        navigate("/metas");
        toast.info("Metas", { description: "Navegando para metas..." });
      },
    },
    
    // Back navigation shortcuts
    {
      key: "Escape",
      description: "Voltar / Fechar",
      action: () => {
        // Only navigate back if not in an input to avoid annoying behavior
        const target = document.activeElement as HTMLElement;
        const isInputElement = 
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable;
        
        if (!isInputElement && window.history.length > 1) {
          navigate(-1);
        }
      },
    },
    {
      key: "ArrowLeft",
      alt: true,
      description: "Voltar",
      action: () => {
        if (window.history.length > 1) {
          navigate(-1);
        }
      },
    },
    
    // Action shortcuts with Ctrl/Cmd
    {
      key: "k",
      ctrl: true,
      meta: true,
      description: "Abrir busca global",
      action: () => onSearch?.(),
      global: true,
    },
    {
      key: "/",
      description: "Abrir busca global",
      action: () => onSearch?.(),
    },
    {
      key: "n",
      ctrl: true,
      meta: true,
      description: "Nova venda",
      action: () => onNewSale?.(),
      global: true,
    },
    {
      key: "j",
      ctrl: true,
      meta: true,
      description: "Novo cliente",
      action: () => onNewClient?.(),
      global: true,
    },
    
    // Utility shortcuts
    {
      key: "\\",
      ctrl: true,
      meta: true,
      description: "Alternar tema",
      action: () => onToggleTheme?.(),
      global: true,
    },
    {
      key: "?",
      shift: true,
      description: "Mostrar atalhos",
      action: () => {
        onShowShortcuts?.();
      },
    },
  ];

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Ignore if user is typing in an input, textarea, or contenteditable
    const target = event.target as HTMLElement;
    const isInputElement = 
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable;

    // For global shortcuts (with Ctrl/Cmd), allow even in inputs
    const isModifierPressed = event.ctrlKey || event.metaKey;
    
    if (isInputElement && !isModifierPressed) return;

    const key = event.key.toLowerCase();
    
    for (const shortcut of shortcutsRef.current) {
      const matchesKey = shortcut.key.toLowerCase() === key;
      const matchesCtrl = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey;
      const matchesShift = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const matchesAlt = shortcut.alt ? event.altKey : !event.altKey;

      // For shortcuts that require Ctrl/Meta
      if (shortcut.ctrl || shortcut.meta) {
        if (matchesKey && (event.ctrlKey || event.metaKey) && matchesShift && matchesAlt) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      } else if (matchesKey && matchesCtrl && matchesShift && matchesAlt) {
        // Only trigger non-modifier shortcuts when not in input
        if (!isInputElement) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, enabled]);

  return {
    shortcuts: shortcutsRef.current,
  };
}

// Hook for showing keyboard shortcut hints
export function useKeyboardShortcutHint() {
  const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  
  const getModifierSymbol = (modifier: "ctrl" | "alt" | "shift" | "meta") => {
    if (isMac) {
      switch (modifier) {
        case "ctrl":
        case "meta":
          return "⌘";
        case "alt":
          return "⌥";
        case "shift":
          return "⇧";
        default:
          return modifier;
      }
    }
    switch (modifier) {
      case "ctrl":
      case "meta":
        return "Ctrl";
      case "alt":
        return "Alt";
      case "shift":
        return "Shift";
      default:
        return modifier;
    }
  };

  const formatShortcut = (key: string, modifiers?: { ctrl?: boolean; alt?: boolean; shift?: boolean }) => {
    const parts: string[] = [];
    if (modifiers?.ctrl) parts.push(getModifierSymbol("ctrl"));
    if (modifiers?.alt) parts.push(getModifierSymbol("alt"));
    if (modifiers?.shift) parts.push(getModifierSymbol("shift"));
    parts.push(key.toUpperCase());
    return parts.join(isMac ? "" : "+");
  };

  return {
    isMac,
    getModifierSymbol,
    formatShortcut,
  };
}
