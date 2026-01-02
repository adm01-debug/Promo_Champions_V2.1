import { cn } from '@/lib/utils';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date: string;
  icon?: React.ReactNode;
}

export function Timeline({ items, className }: { items: TimelineItem[]; className?: string }) {
  return (
    <div className={cn('space-y-4', className)}>
      {items.map((item, index) => (
        <div key={item.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background">
              {item.icon || <div className="h-2 w-2 rounded-full bg-primary" />}
            </div>
            {index < items.length - 1 && (
              <div className="h-full w-px bg-border my-2" />
            )}
          </div>
          <div className="flex-1 pb-4">
            <p className="font-semibold">{item.title}</p>
            {item.description && (
              <p className="text-sm text-muted-foreground">{item.description}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">{item.date}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
