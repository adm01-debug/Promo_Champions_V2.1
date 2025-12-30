import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronDown, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  id: string;
  label: string;
  type: 'select' | 'multi-select' | 'text' | 'date-range' | 'number-range';
  options?: FilterOption[];
  placeholder?: string;
}

interface ActiveFilter {
  id: string;
  value: string | string[];
  label: string;
}

interface FilterBarProps {
  filters: FilterConfig[];
  activeFilters: ActiveFilter[];
  onFilterChange: (filterId: string, value: string | string[] | null) => void;
  onClearAll: () => void;
  className?: string;
}

export const FilterBar: FC<FilterBarProps> = ({
  filters,
  activeFilters,
  onFilterChange,
  onClearAll,
  className
}) => {
  const [openFilter, setOpenFilter] = useState<string | null>(null);

  const getActiveCount = () => activeFilters.length;

  const renderFilterContent = (filter: FilterConfig) => {
    const activeFilter = activeFilters.find(f => f.id === filter.id);

    switch (filter.type) {
      case 'select':
        return (
          <div className="space-y-2 p-2 min-w-[200px]">
            <Label className="text-xs text-muted-foreground">{filter.label}</Label>
            <Select
              value={(activeFilter?.value as string) || ''}
              onValueChange={(value) => onFilterChange(filter.id, value || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder={filter.placeholder || 'Selecione...'} />
              </SelectTrigger>
              <SelectContent>
                {filter.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'multi-select':
        const selectedValues = (activeFilter?.value as string[]) || [];
        return (
          <div className="space-y-2 p-2 min-w-[200px] max-h-[300px] overflow-y-auto">
            <Label className="text-xs text-muted-foreground">{filter.label}</Label>
            {filter.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${filter.id}-${option.value}`}
                  checked={selectedValues.includes(option.value)}
                  onCheckedChange={(checked) => {
                    const newValues = checked
                      ? [...selectedValues, option.value]
                      : selectedValues.filter(v => v !== option.value);
                    onFilterChange(filter.id, newValues.length > 0 ? newValues : null);
                  }}
                />
                <label
                  htmlFor={`${filter.id}-${option.value}`}
                  className="text-sm cursor-pointer"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );

      case 'text':
        return (
          <div className="space-y-2 p-2 min-w-[200px]">
            <Label className="text-xs text-muted-foreground">{filter.label}</Label>
            <Input
              placeholder={filter.placeholder || 'Digite...'}
              value={(activeFilter?.value as string) || ''}
              onChange={(e) => onFilterChange(filter.id, e.target.value || null)}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {/* Filter buttons */}
      {filters.map((filter) => {
        const activeFilter = activeFilters.find(f => f.id === filter.id);
        const isActive = !!activeFilter;

        return (
          <Popover
            key={filter.id}
            open={openFilter === filter.id}
            onOpenChange={(open) => setOpenFilter(open ? filter.id : null)}
          >
            <PopoverTrigger asChild>
              <Button
                variant={isActive ? 'secondary' : 'outline'}
                size="sm"
                className={cn(
                  'h-8 gap-1',
                  isActive && 'border-primary/50'
                )}
              >
                <Filter className="w-3 h-3" />
                {filter.label}
                {isActive && (
                  <Badge variant="secondary" className="ml-1 px-1 min-w-[20px] h-5">
                    {Array.isArray(activeFilter.value) ? activeFilter.value.length : 1}
                  </Badge>
                )}
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="p-0">
              {renderFilterContent(filter)}
            </PopoverContent>
          </Popover>
        );
      })}

      {/* Active filters display */}
      <AnimatePresence>
        {activeFilters.map((filter) => (
          <motion.div
            key={filter.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Badge
              variant="outline"
              className="h-8 gap-1 pr-1 bg-primary/5 border-primary/20"
            >
              <span className="text-xs text-muted-foreground">
                {filters.find(f => f.id === filter.id)?.label}:
              </span>
              <span className="font-medium">
                {Array.isArray(filter.value) 
                  ? `${filter.value.length} selecionados`
                  : filter.label
                }
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 ml-1 hover:bg-destructive/10"
                onClick={() => onFilterChange(filter.id, null)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Clear all */}
      {getActiveCount() > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-muted-foreground hover:text-destructive"
          onClick={onClearAll}
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          Limpar Filtros
        </Button>
      )}
    </div>
  );
};
