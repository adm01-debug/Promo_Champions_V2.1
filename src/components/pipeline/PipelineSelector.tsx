import React from "react";
import { cn } from "@/lib/utils";
import { PipelineConfig } from "@/hooks/useMultiplePipelines";
import { ShoppingCart, HeartHandshake, RefreshCw, Users, Kanban } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const ICON_MAP: Record<string, React.ElementType> = {
  'shopping-cart': ShoppingCart,
  'heart-handshake': HeartHandshake,
  'refresh-cw': RefreshCw,
  'users': Users,
  'kanban': Kanban,
};

interface PipelineSelectorProps {
  pipelines: PipelineConfig[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

export const PipelineSelector = React.memo(({ pipelines, selectedId, onSelect, isLoading }: PipelineSelectorProps) => {
  if (isLoading) {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-28 rounded-lg" />)}
      </div>
    );
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {pipelines.map((pipeline) => {
        const Icon = ICON_MAP[pipeline.icon] || Kanban;
        const isSelected = pipeline.id === selectedId;

        return (
          <button
            key={pipeline.id}
            onClick={() => onSelect(pipeline.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border",
              isSelected
                ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-[1.02]"
                : "bg-card/50 text-muted-foreground border-border/50 hover:bg-muted hover:border-border hover:text-foreground"
            )}
            aria-label={`Pipeline ${pipeline.name}`}
            aria-pressed={isSelected}
          >
            <Icon className="h-4 w-4" />
            <span>{pipeline.name}</span>
          </button>
        );
      })}
    </div>
  );
});

PipelineSelector.displayName = 'PipelineSelector';
