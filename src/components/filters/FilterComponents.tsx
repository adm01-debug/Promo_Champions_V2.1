import { FC, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Search, X, Filter, SlidersHorizontal } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput: FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Buscar...",
  className
}) => (
  <div className={cn("relative", className)}>
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="pl-9 pr-9"
    />
    {value && (
      <button
        onClick={() => onChange('')}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    )}
  </div>
);

interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  placeholder?: string;
  label?: string;
}

export const FilterSelect: FC<FilterSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Selecione...",
  label
}) => (
  <div className="space-y-1">
    {label && <label className="text-sm text-muted-foreground">{label}</label>}
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

export const FilterChip: FC<FilterChipProps> = ({ label, onRemove }) => (
  <Badge variant="secondary" className="gap-1 pr-1">
    {label}
    <button onClick={onRemove} className="hover:bg-muted rounded p-0.5">
      <X className="h-3 w-3" />
    </button>
  </Badge>
);

interface ActiveFiltersProps {
  filters: Array<{ key: string; label: string }>;
  onRemove: (key: string) => void;
  onClearAll: () => void;
}

export const ActiveFilters: FC<ActiveFiltersProps> = ({ 
  filters, 
  onRemove, 
  onClearAll 
}) => {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Filtros:</span>
      {filters.map((f) => (
        <FilterChip key={f.key} label={f.label} onRemove={() => onRemove(f.key)} />
      ))}
      <button
        onClick={onClearAll}
        className="text-sm text-muted-foreground hover:text-foreground underline"
      >
        Limpar todos
      </button>
    </div>
  );
};

interface FilterToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  children?: React.ReactNode;
  onOpenAdvanced?: () => void;
}

export const FilterToolbar: FC<FilterToolbarProps> = ({
  searchValue,
  onSearchChange,
  children,
  onOpenAdvanced
}) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
    <SearchInput
      value={searchValue}
      onChange={onSearchChange}
      className="sm:w-64"
    />
    <div className="flex items-center gap-2 flex-wrap">
      {children}
      {onOpenAdvanced && (
        <Button variant="outline" size="sm" onClick={onOpenAdvanced}>
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Avançado
        </Button>
      )}
    </div>
  </div>
);
