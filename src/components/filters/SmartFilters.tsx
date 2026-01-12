import { FC, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, X, ChevronDown, ChevronUp, 
  Calendar, Tag, User, ArrowUpDown, Check,
  SlidersHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

interface FilterOption {
  id: string;
  label: string;
  value: string;
  icon?: FC<{ className?: string }>;
}

interface FilterGroup {
  id: string;
  label: string;
  type: 'select' | 'multiselect' | 'date-range' | 'search';
  options?: FilterOption[];
  icon?: FC<{ className?: string }>;
}

interface ActiveFilter {
  groupId: string;
  values: string[];
}

interface SmartFiltersProps {
  groups: FilterGroup[];
  activeFilters?: ActiveFilter[];
  onFilterChange: (filters: ActiveFilter[]) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  showSaveFilters?: boolean;
  onSaveFilters?: (name: string, filters: ActiveFilter[]) => void;
  savedFilters?: { name: string; filters: ActiveFilter[] }[];
  className?: string;
}

export const SmartFilters: FC<SmartFiltersProps> = ({
  groups,
  activeFilters = [],
  onFilterChange,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  showSaveFilters = false,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [openPopover, setOpenPopover] = useState<string | null>(null);

  const getActiveFilterValues = useCallback((groupId: string): string[] => {
    const filter = activeFilters.find(f => f.groupId === groupId);
    return filter?.values || [];
  }, [activeFilters]);

  const updateFilter = useCallback((groupId: string, values: string[]) => {
    const newFilters = activeFilters.filter(f => f.groupId !== groupId);
    if (values.length > 0) {
      newFilters.push({ groupId, values });
    }
    onFilterChange(newFilters);
  }, [activeFilters, onFilterChange]);

  const removeFilter = useCallback((groupId: string, value?: string) => {
    if (value) {
      const currentValues = getActiveFilterValues(groupId);
      updateFilter(groupId, currentValues.filter(v => v !== value));
    } else {
      onFilterChange(activeFilters.filter(f => f.groupId !== groupId));
    }
  }, [activeFilters, getActiveFilterValues, updateFilter, onFilterChange]);

  const clearAllFilters = useCallback(() => {
    onFilterChange([]);
    if (onSearchChange) onSearchChange('');
  }, [onFilterChange, onSearchChange]);

  const totalActiveFilters = useMemo(() => 
    activeFilters.reduce((acc, f) => acc + f.values.length, 0),
  [activeFilters]);

  const getOptionLabel = (groupId: string, value: string): string => {
    const group = groups.find(g => g.id === groupId);
    const option = group?.options?.find(o => o.value === value);
    return option?.label || value;
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Main filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search input */}
        {onSearchChange && (
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-8"
            />
            {searchValue && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={() => onSearchChange('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}

        {/* Quick filter buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {groups.slice(0, 3).map((group) => {
            const activeValues = getActiveFilterValues(group.id);
            const GroupIcon = group.icon || Filter;

            return (
              <Popover
                key={group.id}
                open={openPopover === group.id}
                onOpenChange={(open) => setOpenPopover(open ? group.id : null)}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant={activeValues.length > 0 ? 'secondary' : 'outline'}
                    size="sm"
                    className="h-9"
                  >
                    <GroupIcon className="h-4 w-4 mr-2" />
                    {group.label}
                    {activeValues.length > 0 && (
                      <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                        {activeValues.length}
                      </Badge>
                    )}
                    <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder={`Buscar ${group.label.toLowerCase()}...`} />
                    <CommandList>
                      <CommandEmpty>Nenhum resultado.</CommandEmpty>
                      <CommandGroup>
                        {group.options?.map((option) => {
                          const isSelected = activeValues.includes(option.value);
                          const OptionIcon = option.icon;

                          return (
                            <CommandItem
                              key={option.id}
                              onSelect={() => {
                                if (group.type === 'multiselect') {
                                  const newValues = isSelected
                                    ? activeValues.filter(v => v !== option.value)
                                    : [...activeValues, option.value];
                                  updateFilter(group.id, newValues);
                                } else {
                                  updateFilter(group.id, isSelected ? [] : [option.value]);
                                  setOpenPopover(null);
                                }
                              }}
                              className="flex items-center gap-2"
                            >
                              <div className={cn(
                                'flex h-4 w-4 items-center justify-center rounded-sm border',
                                isSelected
                                  ? 'bg-primary border-primary text-primary-foreground'
                                  : 'border-muted-foreground/30'
                              )}>
                                {isSelected && <Check className="h-3 w-3" />}
                              </div>
                              {OptionIcon && <OptionIcon className="h-4 w-4" />}
                              <span>{option.label}</span>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                    {activeValues.length > 0 && (
                      <>
                        <CommandSeparator />
                        <div className="p-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              removeFilter(group.id);
                              setOpenPopover(null);
                            }}
                          >
                            Limpar filtro
                          </Button>
                        </div>
                      </>
                    )}
                  </Command>
                </PopoverContent>
              </Popover>
            );
          })}

          {/* More filters button */}
          {groups.length > 3 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-9"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Mais filtros
              {isExpanded ? (
                <ChevronUp className="h-3 w-3 ml-1" />
              ) : (
                <ChevronDown className="h-3 w-3 ml-1" />
              )}
            </Button>
          )}

          {/* Clear all button */}
          {(totalActiveFilters > 0 || searchValue) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-9 text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar tudo ({totalActiveFilters + (searchValue ? 1 : 0)})
            </Button>
          )}
        </div>
      </div>

      {/* Expanded filters */}
      <AnimatePresence>
        {isExpanded && groups.length > 3 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 pt-2 border-t"
          >
            {groups.slice(3).map((group) => {
              const activeValues = getActiveFilterValues(group.id);
              const GroupIcon = group.icon || Filter;

              return (
                <Popover
                  key={group.id}
                  open={openPopover === group.id}
                  onOpenChange={(open) => setOpenPopover(open ? group.id : null)}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant={activeValues.length > 0 ? 'secondary' : 'outline'}
                      size="sm"
                      className="h-9"
                    >
                      <GroupIcon className="h-4 w-4 mr-2" />
                      {group.label}
                      {activeValues.length > 0 && (
                        <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                          {activeValues.length}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[250px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder={`Buscar ${group.label.toLowerCase()}...`} />
                      <CommandList>
                        <CommandEmpty>Nenhum resultado.</CommandEmpty>
                        <CommandGroup>
                          {group.options?.map((option) => {
                            const isSelected = activeValues.includes(option.value);
                            return (
                              <CommandItem
                                key={option.id}
                                onSelect={() => {
                                  if (group.type === 'multiselect') {
                                    const newValues = isSelected
                                      ? activeValues.filter(v => v !== option.value)
                                      : [...activeValues, option.value];
                                    updateFilter(group.id, newValues);
                                  } else {
                                    updateFilter(group.id, isSelected ? [] : [option.value]);
                                    setOpenPopover(null);
                                  }
                                }}
                              >
                                <div className={cn(
                                  'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                                  isSelected
                                    ? 'bg-primary border-primary text-primary-foreground'
                                    : 'border-muted-foreground/30'
                                )}>
                                  {isSelected && <Check className="h-3 w-3" />}
                                </div>
                                {option.label}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active filter badges */}
      <AnimatePresence>
        {totalActiveFilters > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-wrap gap-2"
          >
            {activeFilters.map((filter) =>
              filter.values.map((value) => {
                const group = groups.find(g => g.id === filter.groupId);
                return (
                  <motion.div
                    key={`${filter.groupId}-${value}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Badge
                      variant="secondary"
                      className="pr-1 gap-1"
                    >
                      <span className="text-muted-foreground">{group?.label}:</span>
                      <span>{getOptionLabel(filter.groupId, value)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 hover:bg-destructive/20"
                        onClick={() => removeFilter(filter.groupId, value)}
                      >
                        <X className="h-2.5 w-2.5" />
                      </Button>
                    </Badge>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
