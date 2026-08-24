import { memo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Variant = "kpi" | "chart" | "table" | "insight";

interface Props {
  variant: Variant;
  height?: number;
  rows?: number;
}

/**
 * Skeleton unificado do módulo Win/Loss.
 * Animação `shimmer` (já no <Skeleton>) consistente em toda a UI.
 */
export const WinLossSectionSkeleton = memo(function WinLossSectionSkeleton({
  variant,
  height,
  rows = 5,
}: Props) {
  if (variant === "kpi") {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-3">
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-6 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  if (variant === "chart") {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-2"><Skeleton className="h-4 w-40" /></CardHeader>
        <CardContent><Skeleton className="w-full" style={{ height: height ?? 240 }} /></CardContent>
      </Card>
    );
  }
  if (variant === "table") {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-2"><Skeleton className="h-4 w-48" /></CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2"><Skeleton className="h-4 w-32" /></CardHeader>
      <CardContent className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
});
