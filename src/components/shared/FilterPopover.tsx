import { Filter, ArrowUpDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { triggerHaptic } from "@/lib/haptics";

export interface SortOption {
  label: string;
  value: string;
  direction: "asc" | "desc";
}

export interface FilterOption {
  label: string;
  value: string;
}

interface FilterPopoverProps {
  sortOptions: SortOption[];
  filterOptions?: {
    label: string;
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
  }[];
  currentSort: string;
  onSortChange: (value: string) => void;
}

export const FilterPopover = ({
  sortOptions,
  filterOptions,
  currentSort,
  onSortChange,
}: FilterPopoverProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="glass">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 glass border-border/40" align="end">
        <div className="space-y-4">
          {/* Sorting Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Ordenar por</span>
            </div>
            <div className="space-y-1">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onSortChange(option.value)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors",
                    currentSort === option.value
                      ? "bg-primary/20 text-primary"
                      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>{option.label}</span>
                  {currentSort === option.value && (
                    <Check className="h-4 w-4" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Sections */}
          {filterOptions?.map((filter, index) => (
            <div key={index}>
              <Separator className="my-3" />
              <div className="mb-3">
                <span className="text-sm font-medium">{filter.label}</span>
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => filter.onChange("")}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors",
                    filter.value === ""
                      ? "bg-primary/20 text-primary"
                      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>Todos</span>
                  {filter.value === "" && <Check className="h-4 w-4" />}
                </button>
                {filter.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => filter.onChange(option.value)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors",
                      filter.value === option.value
                        ? "bg-primary/20 text-primary"
                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span>{option.label}</span>
                    {filter.value === option.value && (
                      <Check className="h-4 w-4" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
