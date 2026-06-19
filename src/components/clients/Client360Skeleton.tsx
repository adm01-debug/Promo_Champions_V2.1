import { Skeleton } from '@/components/ui/skeleton';

export function Client360Skeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-12 w-full mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-2 h-[300px]" />
        <Skeleton className="h-[300px]" />
      </div>
    </div>
  );
}
