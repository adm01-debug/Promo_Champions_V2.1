import { FC, ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, ChevronDown, SortAsc, SortDesc } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
  type?: 'single' | 'multiple';
}

interface DataTableToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filterGroups?: FilterGroup[];
  activeFilters?: Record<string, string[]>;
  onFilterChange?: (groupId: string, values: string[]) => void;
  sortOptions?: { label: string; value: string }[];
  currentSort?: string;
  sortDirection?: 'asc' | 'desc';
  onSortChange?: (value: string) => void;
  onSortDirectionChange?: () => void;
  actions?: ReactNode;
  className?: string;
}

export const DataTableToolbar: FC<DataTableToolbarProps> = ({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  filterGroups = [],
  activeFilters = {},
  onFilterChange,
  sortOptions = [],
  currentSort,
  sortDirection = 'asc',
  onSortChange,
  onSortDirectionChange,
  actions,
  className,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const totalActiveFilters = Object.values(activeFilters).flat().length;

  const handleFilterToggle = (groupId: string, value: string, type: 'single' | 'multiple' = 'multiple') => {
    if (!onFilterChange) return;
    
    const currentValues = activeFilters[groupId] || [];
    
    if (type === 'single') {
      onFilterChange(groupId, currentValues.includes(value) ? [] : [value]);
    } else {
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      onFilterChange(groupId, newValues);
    }
  };

  const clearAllFilters = () => {
    if (!onFilterChange) return;
    filterGroups.forEach((group) => onFilterChange(group.id, []));
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        {onSearchChange && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-10"
            />
            {searchValue && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
        )}

        {/* Filter Toggle */}
        {filterGroups.length > 0 && (
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(showFilters && 'bg-muted')}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {totalActiveFilters > 0 && (
              <Badge variant="secondary" className="ml-2">
                {totalActiveFilters}
              </Badge>
            )}
          </Button>
        )}

        {/* Sort */}
        {sortOptions.length > 0 && currentSort !== undefined && (
          <div className="flex items-center gap-1">
            <select
              value={currentSort}
              onChange={(e) => onSortChange?.(e.target.value)}
              className="h-10 px-3 rounded-md border bg-background text-sm"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="icon"
              onClick={onSortDirectionChange}
            >
              {sortDirection === 'asc' ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        {/* Actions */}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-lg border bg-muted/30 space-y-4">
              {filterGroups.map((group) => (
                <div key={group.id}>
                  <p className="text-sm font-medium mb-2">{group.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.options.map((option) => {
                      const isActive = activeFilters[group.id]?.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          onClick={() => handleFilterToggle(group.id, option.value, group.type)}
                          className={cn(
                            'px-3 py-1.5 rounded-full text-sm transition-colors',
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-background border hover:bg-muted'
                          )}
                        >
                          {option.label}
                          {option.count !== undefined && (
                            <span className="ml-1 opacity-60">({option.count})</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {totalActiveFilters > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Limpar filtros
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Display */}
      {totalActiveFilters > 0 && !showFilters && (
        <div className="flex flex-wrap gap-2">
          {filterGroups.map((group) =>
            (activeFilters[group.id] || []).map((value) => {
              const option = group.options.find((o) => o.value === value);
              return (
                <Badge
                  key={`${group.id}-${value}`}
                  variant="secondary"
                  className="gap-1"
                >
                  {option?.label || value}
                  <button
                    onClick={() => handleFilterToggle(group.id, value, group.type)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
