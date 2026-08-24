import { useEffect } from "react";

interface Handlers {
  onExport?: () => void;
  onRun?: () => void;
  onEscape?: () => void;
}

/**
 * Atalhos globais do módulo Win/Loss.
 * Ctrl/Cmd+E → exportar · Ctrl/Cmd+R → rodar análise · Esc → fechar drawer.
 * Ignora quando o foco está em input/textarea/contenteditable.
 */
export const useWinLossShortcuts = ({ onExport, onRun, onEscape }: Handlers) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const editable = target?.isContentEditable;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || editable) return;

      const meta = e.ctrlKey || e.metaKey;
      if (meta && e.key.toLowerCase() === "e" && onExport) {
        e.preventDefault();
        onExport();
      } else if (meta && e.key.toLowerCase() === "r" && onRun) {
        e.preventDefault();
        onRun();
      } else if (e.key === "Escape" && onEscape) {
        onEscape();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onExport, onRun, onEscape]);
};
