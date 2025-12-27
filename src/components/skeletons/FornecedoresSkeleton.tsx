import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function FornecedoresSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-4 p-4 border-b">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>

            {/* Table Rows */}
            {[...Array(8)].map((_, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-6 gap-4 p-4 border-b">
                {[...Array(6)].map((_, colIndex) => (
                  <Skeleton key={colIndex} className="h-6 w-full" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
