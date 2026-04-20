import { useEffect } from "react";

interface ShortcutHandlers {
  onExport: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onCloseDrawer: () => void;
  hasSelection: boolean;
  drawerOpen: boolean;
}

/**
 * Keyboard shortcuts for Quote Cadences page:
 * - Ctrl+E → Export CSV
 * - Ctrl+A → Select/deselect all visible cards
 * - Escape → Clear selection or close drawer
 */
export function useQuoteCadenceShortcuts({
  onExport,
  onSelectAll,
  onClearSelection,
  onCloseDrawer,
  hasSelection,
  drawerOpen,
}: ShortcutHandlers) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "Escape") {
        if (drawerOpen) {
          onCloseDrawer();
        } else if (hasSelection) {
          onClearSelection();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "e") {
        e.preventDefault();
        onExport();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
        e.preventDefault();
        onSelectAll();
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onExport, onSelectAll, onClearSelection, onCloseDrawer, hasSelection, drawerOpen]);
}
