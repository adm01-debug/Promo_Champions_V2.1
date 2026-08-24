import { useState, type ReactNode } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { GripVertical, Settings2, Check, RotateCcw } from "lucide-react";
import { useUserDashboardLayout, DEFAULT_LAYOUT, type WidgetId } from "@/hooks/win-loss/useUserDashboardLayout";

interface Props {
  widgets: Record<WidgetId, { label: string; node: ReactNode }>;
}

function SortableRow({ id, label }: { id: WidgetId; label: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 };
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 rounded-md border bg-card px-2.5 py-1.5">
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none p-1" aria-label={`Reordenar ${label}`}>
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function DashboardLayoutEditor({ widgets }: Props) {
  const { layout, save, isSaving } = useUserDashboardLayout();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<WidgetId[]>(layout);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const startEditing = () => { setDraft(layout); setEditing(true); };
  const cancelEditing = () => setEditing(false);
  const persist = () => { save(draft); setEditing(false); };
  const resetDraft = () => setDraft([...DEFAULT_LAYOUT]);

  const handleEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = draft.indexOf(active.id as WidgetId);
    const newIdx = draft.indexOf(over.id as WidgetId);
    if (oldIdx < 0 || newIdx < 0) return;
    setDraft(arrayMove(draft, oldIdx, newIdx));
  };

  const draftIsDirty = JSON.stringify(draft) !== JSON.stringify(layout);
  const visibleCount = layout.filter(id => !!widgets[id]).length;

  return (
    <>
      <div className="flex items-center justify-between gap-3 no-print" data-testid="winloss-layout-editor">
        {editing ? (
          <span className="text-xs text-muted-foreground" aria-live="polite">
            {draft.length} widgets · {visibleCount} ativos
          </span>
        ) : <span />}
        {!editing ? (
          <Button size="sm" variant="outline" onClick={startEditing} data-testid="winloss-layout-personalize">
            <Settings2 className="h-3.5 w-3.5 mr-1.5" /> Personalizar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={resetDraft} data-testid="winloss-layout-reset">
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Padrão
            </Button>
            <Button size="sm" variant="ghost" onClick={cancelEditing} data-testid="winloss-layout-cancel">Cancelar</Button>
            <Button
              size="sm"
              onClick={persist}
              disabled={isSaving || !draftIsDirty}
              data-testid="winloss-layout-save"
            >
              <Check className="h-3.5 w-3.5 mr-1.5" /> Salvar
            </Button>
          </div>
        )}
      </div>

      {editing ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleEnd}>
          <SortableContext items={draft} strategy={verticalListSortingStrategy}>
            <div className="space-y-1.5 rounded-lg border bg-muted/30 p-3" data-testid="winloss-layout-edit-list">
              <p className="text-xs text-muted-foreground mb-2">Arraste para reordenar os widgets do seu dashboard.</p>
              {draft.map(id => (
                <SortableRow key={id} id={id} label={widgets[id]?.label ?? id} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <>
          {layout.map(id =>
            widgets[id] ? (
              <div key={id} data-widget-id={id}>
                {widgets[id].node}
              </div>
            ) : null,
          )}
        </>
      )}
    </>
  );
}
