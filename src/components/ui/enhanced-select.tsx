import { FC, ReactNode, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import { FocusTrap } from '@/components/accessibility';

interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
  group?: string;
}

interface EnhancedSelectProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
  className?: string;
}

/**
 * EnhancedSelect - Feature-rich select component with search and groups
 */
export const EnhancedSelect: FC<EnhancedSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Selecione...",
  searchable = false,
  clearable = false,
  disabled = false,
  error,
  label,
  helperText,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Filter options based on search
  const filteredOptions = searchQuery
    ? options.filter(opt =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opt.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // Group options
  const groupedOptions = filteredOptions.reduce((acc, opt) => {
    const group = opt.group || '';
    if (!acc[group]) acc[group] = [];
    acc[group].push(opt);
    return acc;
  }, {} as Record<string, SelectOption[]>);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchable) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen, searchable]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (isOpen && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex].value);
        } else {
          setIsOpen(true);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(i => Math.min(i + 1, filteredOptions.length - 1));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchQuery('');
    setHighlightedIndex(0);
  };

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg",
          "border bg-background text-left transition-all",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          error ? "border-destructive" : "border-input",
          disabled && "opacity-50 cursor-not-allowed",
          isOpen && "ring-2 ring-primary ring-offset-2"
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={cn(
          "flex-1 truncate",
          !selectedOption && "text-muted-foreground"
        )}>
          {selectedOption ? (
            <span className="flex items-center gap-2">
              {selectedOption.icon}
              {selectedOption.label}
            </span>
          ) : placeholder}
        </span>

        <div className="flex items-center gap-1">
          {clearable && value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-1 hover:bg-muted rounded-md transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        </div>
      </button>

      {/* Error message */}
      {error && (
        <p className="mt-1.5 text-sm text-destructive">{error}</p>
      )}

      {/* Helper text */}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-muted-foreground">{helperText}</p>
      )}

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-50 w-full mt-1",
              "bg-popover border border-border rounded-lg shadow-lg overflow-hidden"
            )}
          >
            <FocusTrap active={isOpen}>
              {/* Search */}
              {searchable && (
                <div className="p-2 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setHighlightedIndex(0);
                      }}
                      placeholder="Buscar..."
                      className={cn(
                        "w-full pl-9 pr-3 py-2 rounded-md bg-muted/50",
                        "text-sm outline-none focus:ring-2 focus:ring-primary/50"
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Options */}
              <div className="max-h-60 overflow-y-auto py-1" role="listbox">
                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                    Nenhum resultado encontrado
                  </div>
                ) : (
                  Object.entries(groupedOptions).map(([group, groupOpts]) => (
                    <div key={group || 'default'}>
                      {group && (
                        <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {group}
                        </div>
                      )}
                      {groupOpts.map((option, _idx) => {
                        const globalIdx = filteredOptions.findIndex(o => o.value === option.value);
                        const isHighlighted = globalIdx === highlightedIndex;
                        const isSelected = option.value === value;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => !option.disabled && handleSelect(option.value)}
                            disabled={option.disabled}
                            onMouseEnter={() => setHighlightedIndex(globalIdx)}
                            className={cn(
                              "w-full px-3 py-2 flex items-center gap-3 text-left",
                              "transition-colors",
                              isHighlighted && "bg-primary/10",
                              isSelected && "bg-primary/5",
                              option.disabled && "opacity-50 cursor-not-allowed"
                            )}
                            role="option"
                            aria-selected={isSelected}
                          >
                            {option.icon && (
                              <span className="flex-shrink-0">{option.icon}</span>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{option.label}</p>
                              {option.description && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {option.description}
                                </p>
                              )}
                            </div>
                            {isSelected && (
                              <Check className="h-4 w-4 text-primary flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            </FocusTrap>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
