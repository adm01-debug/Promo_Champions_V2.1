import { FC, useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, History, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  debounceMs?: number;
  showHistory?: boolean;
  recentSearches?: string[];
  suggestions?: string[];
  onClearHistory?: () => void;
  className?: string;
  autoFocus?: boolean;
}

export const SearchInput: FC<SearchInputProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Buscar...',
  loading = false,
  debounceMs = 300,
  showHistory = true,
  recentSearches = [],
  suggestions = [],
  onClearHistory,
  className,
  autoFocus = false
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    if (!onSearch) return;
    const timer = setTimeout(() => {
      if (value.trim()) {
        onSearch(value);
      }
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [value, debounceMs, onSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = useCallback(() => {
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  const handleSelectItem = useCallback((item: string) => {
    onChange(item);
    onSearch?.(item);
    setShowDropdown(false);
  }, [onChange, onSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
      inputRef.current?.blur();
    }
    if (e.key === 'Enter' && value.trim()) {
      onSearch?.(value);
      setShowDropdown(false);
    }
  };

  const hasDropdownContent = showHistory && (recentSearches.length > 0 || suggestions.length > 0);

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search 
          className={cn(
            'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors',
            isFocused ? 'text-primary' : 'text-muted-foreground'
          )} 
        />
        
        <Input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            if (hasDropdownContent) setShowDropdown(true);
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={cn(
            'pl-10 pr-10 transition-all duration-200',
            isFocused && 'ring-2 ring-primary/20'
          )}
          aria-label="Campo de busca"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
        />

        {/* Right side - loading/clear */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
              </motion.div>
            ) : value ? (
              <motion.button
                key="clear"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleClear}
                className="p-1 hover:bg-muted rounded-full transition-colors"
                aria-label="Limpar busca"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </motion.button>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && hasDropdownContent && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden"
            role="listbox"
          >
            {/* Recent searches */}
            {recentSearches.length > 0 && (
              <div className="p-2">
                <div className="flex items-center justify-between px-2 mb-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Buscas Recentes
                  </span>
                  {onClearHistory && (
                    <button
                      onClick={onClearHistory}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Limpar
                    </button>
                  )}
                </div>
                {recentSearches.slice(0, 5).map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectItem(item)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
                  >
                    <History className="w-4 h-4 text-muted-foreground" />
                    {item}
                  </button>
                ))}
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-2 border-t border-border">
                <span className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Sugestões
                </span>
                {suggestions.slice(0, 5).map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectItem(item)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-foreground hover:bg-muted rounded-md transition-colors mt-1"
                  >
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    {item}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
