import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronDown, Check, X, Search, LucideIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Option {
  value: string;
  label: string;
  icon?: LucideIcon;
  description?: string;
  disabled?: boolean;
}

interface SmartSelectProps {
  options: Option[];
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  multiple?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  className?: string;
}

export const SmartSelect: React.FC<SmartSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Selecione...',
  searchable = false,
  multiple = false,
  clearable = false,
  disabled = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];
  
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOptions = options.filter((opt) => selectedValues.includes(opt.value));

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      onChange(newValues);
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(multiple ? [] : '');
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <motion.button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          'flex items-center justify-between w-full px-3 py-2',
          'border rounded-md bg-background text-left',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-primary',
          disabled && 'opacity-50 cursor-not-allowed',
          isOpen && 'ring-2 ring-primary'
        )}
        whileTap={!disabled ? { scale: 0.98 } : undefined}
      >
        <span className={cn('flex-1 truncate', !selectedOptions.length && 'text-muted-foreground')}>
          {selectedOptions.length > 0 ? (
            multiple ? (
              <span className="flex flex-wrap gap-1">
                {selectedOptions.slice(0, 2).map((opt) => (
                  <span
                    key={opt.value}
                    className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-sm"
                  >
                    {opt.label}
                  </span>
                ))}
                {selectedOptions.length > 2 && (
                  <span className="text-muted-foreground text-sm">
                    +{selectedOptions.length - 2}
                  </span>
                )}
              </span>
            ) : (
              selectedOptions[0].label
            )
          ) : (
            placeholder
          )}
        </span>

        <div className="flex items-center gap-1 ml-2">
          {clearable && selectedValues.length > 0 && (
            <X
              className="h-4 w-4 text-muted-foreground hover:text-foreground"
              onClick={handleClear}
            />
          )}
          <ChevronDown
            className={cn(
              'h-4 w-4 text-muted-foreground transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'absolute z-50 w-full mt-1 py-1',
              'bg-popover border rounded-md shadow-lg',
              'max-h-60 overflow-auto'
            )}
          >
            {searchable && (
              <div className="px-2 pb-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar..."
                    className="pl-8 h-8"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                Nenhum resultado encontrado
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                const Icon = option.icon;

                return (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => !option.disabled && handleSelect(option.value)}
                    className={cn(
                      'flex items-center w-full px-3 py-2 text-left',
                      'hover:bg-accent transition-colors',
                      isSelected && 'bg-accent',
                      option.disabled && 'opacity-50 cursor-not-allowed'
                    )}
                    whileHover={{ x: 2 }}
                  >
                    {multiple && (
                      <div
                        className={cn(
                          'w-4 h-4 mr-2 rounded border flex items-center justify-center',
                          isSelected && 'bg-primary border-primary'
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                    )}
                    {Icon && <Icon className="h-4 w-4 mr-2 text-muted-foreground" />}
                    <div className="flex-1">
                      <span className="block">{option.label}</span>
                      {option.description && (
                        <span className="block text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      )}
                    </div>
                    {!multiple && isSelected && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </motion.button>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
