import { useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

interface UseKanbanShortcutsProps {
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onOpenDeal?: () => void;
  onRefresh?: () => void;
  onNewDeal?: () => void;
  enabled?: boolean;
}

export function useKanbanShortcuts({
  onMoveLeft,
  onMoveRight,
  onOpenDeal,
  onRefresh,
  onNewDeal,
  enabled = true,
}: UseKanbanShortcutsProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger if typing in an input
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Arrow Left - Move deal to previous stage
      if (e.key === "ArrowLeft" && e.shiftKey && onMoveLeft) {
        e.preventDefault();
        onMoveLeft();
      }

      // Arrow Right - Move deal to next stage
      if (e.key === "ArrowRight" && e.shiftKey && onMoveRight) {
        e.preventDefault();
        onMoveRight();
      }

      // Enter - Open deal details
      if (e.key === "Enter" && onOpenDeal) {
        e.preventDefault();
        onOpenDeal();
      }

      // R - Refresh
      if (e.key === "r" && !e.metaKey && !e.ctrlKey && onRefresh) {
        e.preventDefault();
        onRefresh();
        toast({
          title: "Atualizado",
          description: "Pipeline atualizado com sucesso",
        });
      }

      // N - New deal
      if (e.key === "n" && !e.metaKey && !e.ctrlKey && onNewDeal) {
        e.preventDefault();
        onNewDeal();
      }

      // ? - Show shortcuts help
      if (e.key === "?" && e.shiftKey) {
        e.preventDefault();
        toast({
          title: "Atalhos do Kanban",
          description: "Shift+← →: Mover deal | R: Atualizar | N: Novo deal | Enter: Abrir deal",
          duration: 5000,
        });
      }
    },
    [enabled, onMoveLeft, onMoveRight, onOpenDeal, onRefresh, onNewDeal]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
