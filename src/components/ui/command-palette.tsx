import { FC, useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Search, ArrowUp, ArrowDown, CornerDownLeft, X, Clock, Star, Hash, FileText } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  category: string;
  icon?: React.ReactNode;
  href?: string;
  action?: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  results: SearchResult[];
  recentSearches?: SearchResult[];
  onSearch: (query: string) => void;
  onSelect: (result: SearchResult) => void;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
}

/**
 * CommandPalette - Spotlight-style search command palette
 */
export const CommandPalette: FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  results,
  recentSearches = [],
  onSearch,
  onSelect,
  placeholder = "Buscar...",
  isLoading = false,
  className,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Group results by category
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  // Flatten for navigation
  const allItems = query ? results : recentSearches;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, allItems.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (allItems[selectedIndex]) {
            onSelect(allItems[selectedIndex]);
            onClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    },
    [allItems, selectedIndex, onSelect, onClose]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      setSelectedIndex(0);
      onSearch(value);
    },
    [onSearch]
  );

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedItem = listRef.current.children[selectedIndex] as HTMLElement;
      selectedItem?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className={cn(
              "fixed top-[20%] left-1/2 -translate-x-1/2 z-50",
              "w-full max-w-xl",
              "bg-card rounded-2xl border border-border shadow-2xl overflow-hidden",
              className
            )}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={cn(
                  "flex-1 bg-transparent text-foreground placeholder:text-muted-foreground",
                  "outline-none text-base"
                )}
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery('');
                    onSearch('');
                    inputRef.current?.focus();
                  }}
                  className="p-1 rounded-md hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto" ref={listRef}>
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="inline-block"
                  >
                    <Search className="h-5 w-5" />
                  </motion.div>
                  <p className="mt-2 text-sm">Buscando...</p>
                </div>
              ) : query && results.length === 0 ? (
                <div className="p-8 text-center">
                  <Hash className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum resultado para "{query}"
                  </p>
                </div>
              ) : query ? (
                // Show grouped results
                Object.entries(groupedResults).map(([category, items]) => (
                  <div key={category}>
                    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">
                      {category}
                    </div>
                    {items.map((result, index) => {
                      const globalIndex = results.findIndex((r) => r.id === result.id);
                      const isSelected = globalIndex === selectedIndex;

                      return (
                        <button
                          key={result.id}
                          onClick={() => {
                            onSelect(result);
                            onClose();
                          }}
                          className={cn(
                            "w-full px-4 py-3 flex items-center gap-3 text-left",
                            "transition-colors",
                            isSelected ? "bg-primary/10" : "hover:bg-muted/50"
                          )}
                        >
                          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                            {result.icon || <FileText className="h-4 w-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "font-medium truncate",
                              isSelected ? "text-primary" : "text-foreground"
                            )}>
                              {result.title}
                            </p>
                            {result.description && (
                              <p className="text-sm text-muted-foreground truncate">
                                {result.description}
                              </p>
                            )}
                          </div>
                          {isSelected && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <CornerDownLeft className="h-3 w-3" />
                              <span>para selecionar</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              ) : recentSearches.length > 0 ? (
                // Show recent searches
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30 flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    Recentes
                  </div>
                  {recentSearches.map((result, index) => {
                    const isSelected = index === selectedIndex;

                    return (
                      <button
                        key={result.id}
                        onClick={() => {
                          onSelect(result);
                          onClose();
                        }}
                        className={cn(
                          "w-full px-4 py-3 flex items-center gap-3 text-left",
                          "transition-colors",
                          isSelected ? "bg-primary/10" : "hover:bg-muted/50"
                        )}
                      >
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className={cn(
                          "flex-1",
                          isSelected ? "text-primary" : "text-foreground"
                        )}>
                          {result.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Search className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Digite para buscar</p>
                </div>
              )}
            </div>

            {/* Footer with keyboard hints */}
            <div className="px-4 py-2 border-t border-border bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <ArrowUp className="h-3 w-3" />
                  <ArrowDown className="h-3 w-3" />
                  navegar
                </span>
                <span className="flex items-center gap-1">
                  <CornerDownLeft className="h-3 w-3" />
                  selecionar
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs">esc</kbd>
                  fechar
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
