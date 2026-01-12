import { useState, useCallback, useRef, useEffect } from 'react';

interface Position {
  x: number;
  y: number;
}

interface UseDragAndDropReturn<T> {
  isDragging: boolean;
  draggedItem: T | null;
  dragPosition: Position;
  dragHandlers: {
    onDragStart: (item: T, event: React.DragEvent) => void;
    onDragEnd: () => void;
    onDragOver: (event: React.DragEvent) => void;
    onDrop: (dropZoneId: string, event: React.DragEvent) => void;
  };
  setDraggedItem: (item: T | null) => void;
}

interface UseDragAndDropOptions<T> {
  onDrop?: (item: T, dropZoneId: string) => void;
  onDragStart?: (item: T) => void;
  onDragEnd?: (item: T | null) => void;
}

export const useDragAndDrop = <T>(
  options?: UseDragAndDropOptions<T>
): UseDragAndDropReturn<T> => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<T | null>(null);
  const [dragPosition, setDragPosition] = useState<Position>({ x: 0, y: 0 });
  
  const { onDrop: onDropCallback, onDragStart: onDragStartCallback, onDragEnd: onDragEndCallback } = options || {};

  const handleDragStart = useCallback((item: T, event: React.DragEvent) => {
    setIsDragging(true);
    setDraggedItem(item);
    setDragPosition({ x: event.clientX, y: event.clientY });
    
    // Set drag image (optional, browser handles by default)
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', JSON.stringify(item));
    
    onDragStartCallback?.(item);
  }, [onDragStartCallback]);

  const handleDragEnd = useCallback(() => {
    onDragEndCallback?.(draggedItem);
    setIsDragging(false);
    setDraggedItem(null);
  }, [draggedItem, onDragEndCallback]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDragPosition({ x: event.clientX, y: event.clientY });
  }, []);

  const handleDrop = useCallback((dropZoneId: string, event: React.DragEvent) => {
    event.preventDefault();
    
    if (draggedItem) {
      onDropCallback?.(draggedItem, dropZoneId);
    }
    
    setIsDragging(false);
    setDraggedItem(null);
  }, [draggedItem, onDropCallback]);

  return {
    isDragging,
    draggedItem,
    dragPosition,
    dragHandlers: {
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    },
    setDraggedItem,
  };
};

// Hook for sortable lists
interface UseSortableListReturn<T> {
  items: T[];
  isDragging: boolean;
  draggedIndex: number | null;
  hoverIndex: number | null;
  sortableHandlers: {
    onDragStart: (index: number) => (event: React.DragEvent) => void;
    onDragEnter: (index: number) => () => void;
    onDragEnd: () => void;
    onDragOver: (event: React.DragEvent) => void;
  };
  moveItem: (fromIndex: number, toIndex: number) => void;
  setItems: (items: T[]) => void;
}

export const useSortableList = <T>(
  initialItems: T[],
  onReorder?: (items: T[]) => void
): UseSortableListReturn<T> => {
  const [items, setItems] = useState<T[]>(initialItems);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Sync with external changes
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const moveItem = useCallback((fromIndex: number, toIndex: number) => {
    setItems(prev => {
      const newItems = [...prev];
      const [removed] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, removed);
      onReorder?.(newItems);
      return newItems;
    });
  }, [onReorder]);

  const handleDragStart = useCallback((index: number) => (event: React.DragEvent) => {
    setIsDragging(true);
    setDraggedIndex(index);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(index));
  }, []);

  const handleDragEnter = useCallback((index: number) => () => {
    setHoverIndex(index);
    
    if (draggedIndex !== null && draggedIndex !== index) {
      moveItem(draggedIndex, index);
      setDraggedIndex(index);
    }
  }, [draggedIndex, moveItem]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDraggedIndex(null);
    setHoverIndex(null);
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return {
    items,
    isDragging,
    draggedIndex,
    hoverIndex,
    sortableHandlers: {
      onDragStart: handleDragStart,
      onDragEnter: handleDragEnter,
      onDragEnd: handleDragEnd,
      onDragOver: handleDragOver,
    },
    moveItem,
    setItems,
  };
};
