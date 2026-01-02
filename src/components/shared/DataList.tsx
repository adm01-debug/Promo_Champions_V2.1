import { ScrollArea } from '@/components/ui/scroll-area';

export function DataList<T extends { id: string }>({
  data,
  renderItem,
  emptyMessage = 'Nenhum item',
}: {
  data: T[];
  renderItem: (item: T) => React.ReactNode;
  emptyMessage?: string;
}) {
  if (data.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        {emptyMessage}
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-2">
        {data.map(item => (
          <div key={item.id}>{renderItem(item)}</div>
        ))}
      </div>
    </ScrollArea>
  );
}
