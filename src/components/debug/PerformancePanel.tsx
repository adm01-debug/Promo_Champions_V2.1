import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Cpu, HardDrive, Timer, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useWebVitals } from '@/hooks/useWebVitals';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PerformancePanelProps {
  defaultExpanded?: boolean;
  showInProduction?: boolean;
}

export const PerformancePanel: FC<PerformancePanelProps> = ({
  defaultExpanded = false,
  showInProduction = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isVisible, setIsVisible] = useState(true);
  const { metrics, getVitalRating, formatBytes } = useWebVitals();

  // Only show in development by default
  if (!showInProduction && import.meta.env.PROD) {
    return null;
  }

  if (!isVisible) {
    return (
      <Button
        size="sm"
        variant="outline"
        className="fixed bottom-4 left-4 z-50"
        onClick={() => setIsVisible(true)}
      >
        <Activity className="h-4 w-4" />
      </Button>
    );
  }

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'text-green-500';
      case 'needs-improvement':
        return 'text-yellow-500';
      case 'poor':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const webVitals = [
    { key: 'lcp', label: 'LCP', value: metrics.lcp, unit: 'ms', description: 'Largest Contentful Paint' },
    { key: 'fid', label: 'FID', value: metrics.fid, unit: 'ms', description: 'First Input Delay' },
    { key: 'cls', label: 'CLS', value: metrics.cls, unit: '', description: 'Cumulative Layout Shift' },
    { key: 'fcp', label: 'FCP', value: metrics.fcp, unit: 'ms', description: 'First Contentful Paint' },
    { key: 'ttfb', label: 'TTFB', value: metrics.ttfb, unit: 'ms', description: 'Time to First Byte' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 left-4 z-50 max-w-sm"
    >
      <Card className="glass border shadow-lg overflow-hidden">
        <div className="p-3 flex items-center justify-between border-b bg-muted/50">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Performance</span>
            {metrics.fps !== null && (
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded",
                metrics.fps >= 50 ? "bg-green-500/20 text-green-500" :
                metrics.fps >= 30 ? "bg-yellow-500/20 text-yellow-500" :
                "bg-red-500/20 text-red-500"
              )}>
                {metrics.fps} FPS
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => setIsVisible(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-3 space-y-4">
                {/* Web Vitals */}
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <Timer className="h-3 w-3" />
                    Core Web Vitals
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {webVitals.map(vital => {
                      const rating = getVitalRating(vital.key as keyof typeof metrics, vital.value);
                      return (
                        <div key={vital.key} className="text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">{vital.label}</span>
                            <span className={cn("font-mono", getRatingColor(rating))}>
                              {vital.value !== null 
                                ? `${vital.key === 'cls' ? vital.value.toFixed(3) : Math.round(vital.value)}${vital.unit}`
                                : 'N/A'
                              }
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Memory */}
                {metrics.usedJSHeapSize !== null && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <HardDrive className="h-3 w-3" />
                      Memory
                    </h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Used</span>
                        <span className="font-mono">{formatBytes(metrics.usedJSHeapSize)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-mono">{formatBytes(metrics.totalJSHeapSize)}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all"
                          style={{ 
                            width: `${((metrics.usedJSHeapSize || 0) / (metrics.totalJSHeapSize || 1)) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* CPU/Load */}
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <Cpu className="h-3 w-3" />
                    Page Load
                  </h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">DOM Loaded</span>
                      <span className="font-mono">
                        {metrics.domContentLoaded !== null ? `${metrics.domContentLoaded}ms` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Load Complete</span>
                      <span className="font-mono">
                        {metrics.loadComplete !== null ? `${metrics.loadComplete}ms` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};
