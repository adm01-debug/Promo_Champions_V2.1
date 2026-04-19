import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  rows?: number;
}

/**
 * Skeleton fiel ao layout do RaceLeaderboardSidebar.
 * Respeita prefers-reduced-motion via Skeleton (shimmer suave).
 */
export function RaceSidebarSkeleton({ rows = 8 }: Props) {
  return (
    <Card className="h-full flex flex-col" aria-busy="true" aria-label="Carregando ranking">
      <CardHeader className="pb-3 space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent className="flex-1 space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-8" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
