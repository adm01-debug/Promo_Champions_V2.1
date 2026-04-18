import { FC } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Shimmer } from '@/components/skeletons/SkeletonPrimitives';

/**
 * Skeleton cinematográfico do RaceArenaView.
 * Espelha o layout final (header + track + sidebar + feed) para evitar layout shift.
 */
export const RaceArenaSkeleton: FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
      aria-busy="true"
      aria-label="Carregando Race Arena"
    >
      {/* Header skeleton */}
      <Card className="relative overflow-hidden">
        <CardContent className="p-4 space-y-3">
          <Shimmer className="h-3 w-40 rounded-md" />
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <Shimmer className="h-9 w-9 rounded-md" />
              <div className="space-y-2">
                <Shimmer className="h-7 w-56 rounded-md" />
                <Shimmer className="h-3 w-72 rounded-md" />
              </div>
            </div>
            <div className="flex gap-2">
              <Shimmer className="h-9 w-24 rounded-md" />
              <Shimmer className="h-9 w-28 rounded-md" />
              <Shimmer className="h-9 w-28 rounded-md" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Season meta line */}
      <Shimmer className="h-4 w-2/3 rounded-md" />

      {/* Track + sidebar grid */}
      <div className="grid grid-cols-12 gap-4" style={{ minHeight: '70vh' }}>
        {/* Sidebar skeleton */}
        <div className="col-span-12 lg:col-span-3 order-2 lg:order-1 space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <Shimmer className="h-5 w-40 rounded-md" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  <Shimmer className="h-5 w-5 rounded" />
                  <Shimmer className="h-8 w-8 rounded-full" />
                  <Shimmer className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <div className="flex justify-between">
                      <Shimmer className="h-3 w-20 rounded" />
                      <Shimmer className="h-3 w-8 rounded" />
                    </div>
                    <Shimmer className="h-1.5 w-full rounded-full" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Track skeleton */}
        <div className="col-span-12 lg:col-span-9 order-1 lg:order-2">
          <div className="relative w-full h-full min-h-[60vh] rounded-xl overflow-hidden border-2 border-border bg-muted/20">
            {/* Pista linhas tracejadas */}
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 space-y-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  {Array.from({ length: 20 }).map((_, j) => (
                    <Shimmer key={j} className="h-1 flex-1 rounded-full" />
                  ))}
                </div>
              ))}
            </div>
            {/* Carros shimmer escalonados */}
            {[15, 30, 45, 25, 60, 50].map((x, i) => (
              <Shimmer
                key={i}
                className="absolute h-6 w-14 rounded-md"
                style={{
                  left: `${x}%`,
                  top: `${30 + i * 8}%`,
                }}
              />
            ))}
            {/* Bandeira de chegada */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 space-y-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <Shimmer key={i} className="h-3 w-3 rounded-sm" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Feed flutuante skeleton */}
      <div className="fixed bottom-4 right-4 w-72 hidden lg:block">
        <Card>
          <CardContent className="p-3 space-y-2">
            <Shimmer className="h-4 w-24 rounded-md" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Shimmer key={i} className="h-8 w-full rounded-md" />
            ))}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};
