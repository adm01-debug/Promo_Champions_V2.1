import { Button } from '@/components/ui/button';
import { Trash2, Edit, Copy, Download } from 'lucide-react';

export function BulkActionsToolbar({
  selectedCount,
  onDelete,
  onEdit,
  onDuplicate,
  onExport,
  onClear,
}: {
  selectedCount: number;
  onDelete?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onExport?: () => void;
  onClear: () => void;
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-muted p-3 rounded-lg flex items-center justify-between">
      <span className="text-sm font-medium">{selectedCount} selecionado(s)</span>
      <div className="flex gap-2">
        {onEdit && (
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        )}
        {onDuplicate && (
          <Button variant="outline" size="sm" onClick={onDuplicate}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicar
          </Button>
        )}
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        )}
        {onDelete && (
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Deletar
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onClear}>
          Limpar
        </Button>
      </div>
    </div>
  );
}
