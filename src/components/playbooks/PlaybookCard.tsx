import React from "react";
import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlaybookItemRow } from "./PlaybookItemRow";
import {
  useCreatePlaybookItem,
  useDeletePlaybookItem,
  useUpdatePlaybookItem,
  useReorderPlaybookItems,
  useDuplicatePlaybook,
} from "@/hooks/usePlaybooks";
import type { Playbook } from "@/hooks/usePlaybooks";

interface PlaybookCardProps {
  playbook: Playbook;
  stageColor: string;
  index: number;
}

export const PlaybookCard = ({ playbook, stageColor, index }: PlaybookCardProps) => {
  const createItem = useCreatePlaybookItem();
  const deleteItem = useDeletePlaybookItem();
  const updateItem = useUpdatePlaybookItem();
  const reorderItems = useReorderPlaybookItems();
  const duplicatePlaybook = useDuplicatePlaybook();

  const [newContent, setNewContent] = useState("");
  const [isRequired, setIsRequired] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleAddItem = () => {
    const content = newContent.trim();
    if (!content) return;

    createItem.mutate({
      playbook_id: playbook.id,
      content,
      item_order: (playbook.items?.length || 0) + 1,
      is_required: isRequired,
    });

    setNewContent("");
    setIsRequired(false);
  };

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id || !playbook.items) return;

      const items = [...playbook.items];
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const [moved] = items.splice(oldIndex, 1);
      items.splice(newIndex, 0, moved);

      const reordered = items.map((item, idx) => ({
        id: item.id,
        item_order: idx + 1,
      }));

      reorderItems.mutate(reordered);
    },
    [playbook.items, reorderItems]
  );

  const handleUpdateItem = (id: string, content: string, isReq: boolean) => {
    updateItem.mutate({ id, content, is_required: isReq });
  };

  const itemIds = playbook.items?.map((i) => i.id) || [];

  return (
    <Card
      variant="elevated"
      className="glass border-border/40 dark:border-glow overflow-hidden card-elevated hover-lift transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className={cn("w-1.5 h-full min-h-[2rem] rounded-full shadow-sm", stageColor)} />
          <div className="flex-1">
            <CardTitle className="text-lg font-display">{playbook.title}</CardTitle>
            {playbook.description && (
              <p className="text-sm text-muted-foreground mt-1">{playbook.description}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-primary/10"
            onClick={() => duplicatePlaybook.mutate(playbook.id)}
            title="Duplicar playbook"
          >
            <Copy className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Badge
            variant="outline"
            className="shrink-0 bg-gradient-to-r from-primary/10 to-accent/10 text-primary border-primary/30 shadow-sm"
          >
            {playbook.items?.length || 0} itens
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {playbook.items?.map((item) => (
                <PlaybookItemRow
                  key={item.id}
                  item={item}
                  onDelete={(id) => deleteItem.mutate(id)}
                  onUpdate={handleUpdateItem}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Add New Item */}
        <div className="flex items-center gap-2 pt-3 border-t border-border/40">
          <Input
            placeholder="Adicionar novo item..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddItem();
            }}
            className="flex-1 border-border/40 focus:border-primary/50 transition-colors"
          />
          <div className="flex items-center gap-2">
            <Checkbox
              id={`required-${playbook.id}`}
              checked={isRequired}
              onCheckedChange={(checked) => setIsRequired(checked as boolean)}
              className="border-border/50"
            />
            <label htmlFor={`required-${playbook.id}`} className="text-xs text-muted-foreground whitespace-nowrap">
              Obrigatório
            </label>
          </div>
          <Button
            size="sm"
            variant="glow"
            onClick={handleAddItem}
            disabled={!newContent.trim()}
            className="shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
