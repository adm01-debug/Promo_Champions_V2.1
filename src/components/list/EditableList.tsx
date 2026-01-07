import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { GripVertical, Plus, X, Check, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

interface ListItem {
  id: string;
  content: string;
  completed?: boolean;
}

interface EditableListProps {
  items: ListItem[];
  onItemsChange: (items: ListItem[]) => void;
  placeholder?: string;
  allowReorder?: boolean;
  showCheckbox?: boolean;
  maxItems?: number;
  className?: string;
}

export const EditableList: React.FC<EditableListProps> = ({
  items,
  onItemsChange,
  placeholder = 'Novo item...',
  allowReorder = true,
  showCheckbox = false,
  maxItems = 20,
  className,
}) => {
  const [newItem, setNewItem] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const addItem = useCallback(() => {
    if (!newItem.trim() || items.length >= maxItems) return;
    const item: ListItem = {
      id: crypto.randomUUID(),
      content: newItem.trim(),
      completed: false,
    };
    onItemsChange([...items, item]);
    setNewItem('');
  }, [newItem, items, maxItems, onItemsChange]);

  const removeItem = useCallback(
    (id: string) => {
      onItemsChange(items.filter(item => item.id !== id));
    },
    [items, onItemsChange]
  );

  const toggleComplete = useCallback(
    (id: string) => {
      onItemsChange(
        items.map(item =>
          item.id === id ? { ...item, completed: !item.completed } : item
        )
      );
    },
    [items, onItemsChange]
  );

  const startEdit = (item: ListItem) => {
    setEditingId(item.id);
    setEditValue(item.content);
  };

  const saveEdit = useCallback(() => {
    if (!editValue.trim() || !editingId) return;
    onItemsChange(
      items.map(item =>
        item.id === editingId ? { ...item, content: editValue.trim() } : item
      )
    );
    setEditingId(null);
  }, [editValue, editingId, items, onItemsChange]);

  const ListContainer = allowReorder ? Reorder.Group : 'div';
  const ListItem = allowReorder ? Reorder.Item : motion.div;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex gap-2">
        <Input
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addItem()}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button onClick={addItem} size="icon" disabled={items.length >= maxItems}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ListContainer
        {...(allowReorder
          ? { axis: 'y', values: items, onReorder: onItemsChange }
          : {})}
        className="space-y-2"
      >
        <AnimatePresence mode="popLayout">
          {items.map(item => (
            <ListItem
              key={item.id}
              value={item}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={cn(
                'flex items-center gap-2 p-2 bg-muted/50 rounded-lg group',
                item.completed && 'opacity-60'
              )}
            >
              {allowReorder && (
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
              )}
              {showCheckbox && (
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={() => toggleComplete(item.id)}
                />
              )}
              {editingId === item.id ? (
                <>
                  <Input
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveEdit()}
                    className="flex-1 h-8"
                    autoFocus
                  />
                  <Button variant="ghost" size="sm" onClick={saveEdit} className="h-7 w-7 p-0">
                    <Check className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <span className={cn('flex-1 text-sm', item.completed && 'line-through')}>
                    {item.content}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(item)}
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(item.id)}
                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </ListItem>
          ))}
        </AnimatePresence>
      </ListContainer>

      {items.length >= maxItems && (
        <p className="text-xs text-muted-foreground text-center">
          Limite de {maxItems} itens atingido
        </p>
      )}
    </div>
  );
};
