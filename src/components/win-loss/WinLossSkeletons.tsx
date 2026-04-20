import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function KpiBannerSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="border-border/50">
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-5 rounded-md" />
            </div>
            <Skeleton className="h-6 w-20" />
          </CardContent>
        </Card>
      ))}
      <div className="col-span-2 md:col-span-3 lg:col-span-6">
        <Card className="border-border/50">
          <CardContent className="p-3">
            <Skeleton className="h-2 w-full rounded-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function ChartSkeleton({ height = 260 }: { height?: number }) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2"><Skeleton className="h-5 w-48" /></CardHeader>
      <CardContent>
        <Skeleton className="w-full" style={{ height }} />
      </CardContent>
    </Card>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2"><Skeleton className="h-5 w-44" /></CardHeader>
      <CardContent className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}

export function CompetitorGridSkeleton() {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2"><Skeleton className="h-5 w-44" /></CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </CardContent>
    </Card>
  );
}
