import React, { forwardRef, memo } from "react";
import { Search } from "lucide-react";

export const SearchTrigger = memo(forwardRef<HTMLButtonElement, { onClick: () => void }>(
  function SearchTrigger({ onClick }, ref) {
    return (
      <button
        ref={ref}
        onClick={onClick}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground rounded-lg border border-border/50 bg-muted/50 hover:bg-muted hover-scale"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Buscar...</span>
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border/50 bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
    );
  }
}));

SearchTrigger.displayName = "SearchTrigger";