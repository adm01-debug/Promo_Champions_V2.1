import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GripVertical, 
  Trash2, 
  Pencil, 
  Check, 
  X,
  Circle 
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlaybookItem } from "@/hooks/usePlaybooks";

interface PlaybookItemRowProps {
  item: PlaybookItem;
  onDelete: (id: string) => void;
  onUpdate: (id: string, content: string, isRequired: boolean) => void;
}

export const PlaybookItemRow = ({ item, onDelete, onUpdate }: PlaybookItemRowProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(item.content);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = () => {
    const trimmed = editContent.trim();
    if (trimmed && trimmed !== item.content) {
      onUpdate(item.id, trimmed, item.is_required);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(item.content);
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/20 group",
        "hover:border-primary/30 hover:bg-muted/50 transition-all duration-200",
        isDragging && "opacity-50 shadow-lg scale-[1.02] z-50"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors touch-none"
        aria-label="Arrastar para reordenar"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <Circle className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />

      {isEditing ? (
        <div className="flex-1 flex items-center gap-2">
          <Input
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
            className="flex-1 h-8 text-sm"
            autoFocus
          />
          <Button variant="ghost" size="icon" aria-label="Salvar" className="h-6 w-6" onClick={handleSave}>
            <Check className="h-3 w-3 text-status-success" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Cancelar" className="h-6 w-6" onClick={handleCancel}>
            <X className="h-3 w-3 text-muted-foreground" />
          </Button>
        </div>
      ) : (
        <span
          className="flex-1 text-sm group-hover:text-foreground transition-colors cursor-pointer"
          onDoubleClick={() => setIsEditing(true)}
          title="Clique duplo para editar"
        >
          {item.content}
        </span>
      )}

      {item.is_required && !isEditing && (
        <Badge variant="secondary" className="text-[10px] bg-status-warning/20 text-status-warning border border-status-warning/30 shadow-sm">
          Obrigatório
        </Badge>
      )}

      {!isEditing && (
        <>
          <Button
            variant="ghost"
            size="icon" aria-label="Editar"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-primary/10"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-3 w-3 text-primary" />
          </Button>
          <Button
            variant="ghost"
            size="icon" aria-label="Excluir"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-destructive/10 hover:scale-110"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        </>
      )}
    </div>
  );
};
