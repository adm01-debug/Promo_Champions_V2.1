// Bulk Actions Component
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Trash2, Edit, Send, Archive } from 'lucide-react';

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (selectedIds: string[]) => void;
  variant?: 'default' | 'destructive';
}

interface BulkActionsProps {
  selectedIds: string[];
  actions: BulkAction[];
  onClearSelection: () => void;
}

export const BulkActions: React.FC<BulkActionsProps> = ({
  selectedIds,
  actions,
  onClearSelection,
}) => {
  if (selectedIds.length === 0) return null;
  
  return (
    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <span className="text-sm font-medium">
        {selectedIds.length} item{selectedIds.length > 1 ? 's' : ''} selected
      </span>
      
      <div className="flex gap-1 ml-auto">
        {actions.map(action => (
          <Button
            key={action.id}
            size="sm"
            variant={action.variant || 'outline'}
            onClick={() => action.onClick(selectedIds)}
          >
            {action.icon}
            {action.label}
          </Button>
        ))}
        
        <Button
          size="sm"
          variant="ghost"
          onClick={onClearSelection}
        >
          Clear
        </Button>
      </div>
    </div>
  );
};

// Example usage
export const DEFAULT_BULK_ACTIONS: BulkAction[] = [
  {
    id: 'delete',
    label: 'Delete',
    icon: <Trash2 className="w-4 h-4 mr-1" />,
    onClick: (ids) => console.log('Delete', ids),
    variant: 'destructive',
  },
  {
    id: 'archive',
    label: 'Archive',
    icon: <Archive className="w-4 h-4 mr-1" />,
    onClick: (ids) => console.log('Archive', ids),
  },
  {
    id: 'export',
    label: 'Export',
    icon: <Send className="w-4 h-4 mr-1" />,
    onClick: (ids) => console.log('Export', ids),
  },
];
