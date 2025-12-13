import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function StatCardSkeleton({ highlighted = false }: { highlighted?: boolean }) {
  return (
    <Card className={highlighted ? "glass border-primary/30 bg-primary/5" : "glass border-border/40"}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Skeleton 
            className="h-12 w-12 rounded-xl" 
            variant={highlighted ? "primary" : "default"}
            shimmer={highlighted ? "glow" : "default"}
          />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" shimmer={highlighted ? "intense" : "default"} />
            <Skeleton 
              className="h-8 w-32" 
              variant={highlighted ? "intense" : "default"}
              shimmer={highlighted ? "intense" : "default"}
            />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" shimmer={highlighted ? "glow" : "default"} />
        </div>
      </CardContent>
    </Card>
  );
}

export function ChartSkeleton({ height = "h-[300px]", highlighted = false }: { height?: string; highlighted?: boolean }) {
  return (
    <Card className={highlighted ? "glass border-primary/30" : "glass border-border/40"}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton 
              className="h-5 w-32" 
              variant={highlighted ? "intense" : "default"}
              shimmer={highlighted ? "intense" : "default"}
            />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-8 w-24 rounded-md" shimmer={highlighted ? "glow" : "default"} />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`${height} flex items-end gap-2 pt-4`}>
          {[...Array(7)].map((_, i) => (
            <Skeleton 
              key={i} 
              className="flex-1 rounded-t-md" 
              style={{ height: `${30 + Math.random() * 60}%` }}
              variant={highlighted ? "primary" : "default"}
              shimmer={highlighted ? "glow" : "default"}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function GoalProgressSkeleton({ highlighted = false }: { highlighted?: boolean }) {
  return (
    <Card className={highlighted ? "glass border-primary/30" : "glass border-border/40"}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" shimmer={highlighted ? "intense" : "default"} />
          <Skeleton className="h-6 w-20 rounded-full" shimmer={highlighted ? "glow" : "default"} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <Skeleton 
            className="h-40 w-40 rounded-full" 
            variant={highlighted ? "primary" : "default"}
            shimmer={highlighted ? "glow" : "default"}
          />
        </div>
        <div className="space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" shimmer={highlighted ? "intense" : "default"} />
        </div>
      </CardContent>
    </Card>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card className="glass border-border/40">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[...Array(rows)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/20">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function LeaderboardSkeleton({ rows = 5, highlighted = false }: { rows?: number; highlighted?: boolean }) {
  return (
    <Card className={highlighted ? "glass border-primary/30" : "glass border-border/40 h-full"}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-36" shimmer={highlighted ? "intense" : "default"} />
          <Skeleton className="h-5 w-12 rounded-full" shimmer={highlighted ? "glow" : "default"} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[...Array(rows)].map((_, i) => (
            <div 
              key={i} 
              className={`p-4 rounded-xl border ${i === 0 && highlighted ? "border-primary/30 bg-primary/5" : "border-border/40 bg-muted/10"}`}
            >
              <div className="flex items-center gap-3">
                <Skeleton 
                  className="h-5 w-5 rounded-full" 
                  variant={i === 0 && highlighted ? "primary" : "default"}
                  shimmer={i === 0 && highlighted ? "glow" : "default"}
                />
                <Skeleton 
                  className="h-12 w-12 rounded-full" 
                  variant={i === 0 && highlighted ? "primary" : "default"}
                  shimmer={i === 0 && highlighted ? "glow" : "default"}
                />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-28" shimmer={i === 0 && highlighted ? "intense" : "default"} />
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-12 rounded-full" />
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <Skeleton className="h-6 w-12 ml-auto" shimmer={i === 0 && highlighted ? "intense" : "default"} />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <Skeleton 
                  className="h-2 w-full rounded-full" 
                  variant={i === 0 && highlighted ? "primary" : "default"}
                  shimmer={i === 0 && highlighted ? "glow" : "default"}
                />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function KanbanColumnSkeleton() {
  return (
    <div className="flex-1 min-w-[280px] max-w-[320px]">
      <div className="rounded-xl border border-border/40 bg-muted/10 p-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-8 rounded-full" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border-border/40">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-24" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PipelineBoardSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {[...Array(5)].map((_, i) => (
        <KanbanColumnSkeleton key={i} />
      ))}
    </div>
  );
}

export function FunnelSkeleton() {
  return (
    <Card className="glass border-border/40">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[100, 80, 60, 40, 25].map((width, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 rounded-md" style={{ width: `${width}%` }} />
            <Skeleton className="h-4 w-8" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function GaugeSkeleton() {
  return (
    <Card className="glass border-border/40">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-36" />
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <Skeleton className="h-32 w-32 rounded-full" />
        <div className="mt-4 space-y-2 text-center">
          <Skeleton className="h-8 w-20 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </CardContent>
    </Card>
  );
}

export function AlertsPanelSkeleton() {
  return (
    <Card className="glass border-border/40">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-6 rounded-full" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
              <Skeleton className="h-5 w-5 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function QuickStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="glass border-border/40">
          <CardContent className="p-4 flex items-center gap-4">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
    </div>
  );
}
