import { useState, useEffect, useCallback, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, X, Cpu, Database, Wifi, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

interface PerfMetrics {
  fps: number;
  memory: number | null;
  domNodes: number;
  queryCount: number;
  networkLatency: number | null;
}

function usePerfMetrics(enabled: boolean) {
  const [metrics, setMetrics] = useState<PerfMetrics>({
    fps: 60,
    memory: null,
    domNodes: 0,
    queryCount: 0,
    networkLatency: null,
  });

  useEffect(() => {
    if (!enabled) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const measureFps = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        const fps = Math.round(frameCount * 1000 / (now - lastTime));
        const memInfo = (performance as any).memory;
        const memory = memInfo ? Math.round(memInfo.usedJSHeapSize / 1048576) : null;

        setMetrics(prev => ({
          ...prev,
          fps,
          memory,
          domNodes: document.querySelectorAll('*').length,
        }));

        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(measureFps);
    };

    animId = requestAnimationFrame(measureFps);
    return () => cancelAnimationFrame(animId);
  }, [enabled]);

  return metrics;
}

function getFpsColor(fps: number): string {
  if (fps >= 55) return 'text-success';
  if (fps >= 30) return 'text-warning';
  return 'text-destructive';
}

function getMemoryColor(mb: number | null): string {
  if (mb === null) return 'text-muted-foreground';
  if (mb < 100) return 'text-success';
  if (mb < 250) return 'text-warning';
  return 'text-destructive';
}

interface PerformanceMonitorProps {
  isAdmin?: boolean;
}

export const PerformanceMonitor = memo(function PerformanceMonitor({ isAdmin = false }: PerformanceMonitorProps) {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const metrics = usePerfMetrics(visible);

  // Only render for admin users in DEV mode or when explicitly shown
  if (!isAdmin && !import.meta.env.DEV) return null;

  if (!visible) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-20 right-4 z-50 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border shadow-sm opacity-40 hover:opacity-100 transition-opacity"
        onClick={() => setVisible(true)}
        title="Performance Monitor"
      >
        <Activity className="h-3.5 w-3.5" />
      </Button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        className="fixed bottom-20 right-4 z-50 rounded-xl border bg-background/95 backdrop-blur-md shadow-lg text-xs font-mono"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-3 py-1.5 border-b">
          <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
            <Cpu className="h-3 w-3" /> Perf Monitor
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={() => setExpanded(e => !e)}
            >
              {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={() => setVisible(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Compact view */}
        <div className="flex items-center gap-3 px-3 py-1.5">
          <span className={`tabular-nums ${getFpsColor(metrics.fps)}`}>
            {metrics.fps} FPS
          </span>
          {metrics.memory !== null && (
            <span className={`tabular-nums ${getMemoryColor(metrics.memory)}`}>
              {metrics.memory} MB
            </span>
          )}
          <span className="text-muted-foreground tabular-nums">
            {metrics.domNodes} DOM
          </span>
        </div>

        {/* Expanded details */}
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t px-3 py-2 space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <Activity className="h-3 w-3" /> FPS
              </span>
              <Badge variant={metrics.fps >= 55 ? 'default' : 'destructive'} className="text-[10px] h-4 px-1.5">
                {metrics.fps >= 55 ? 'Bom' : metrics.fps >= 30 ? 'Médio' : 'Lento'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <Database className="h-3 w-3" /> Heap
              </span>
              <span className="tabular-nums">{metrics.memory ? `${metrics.memory} MB` : 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <Wifi className="h-3 w-3" /> DOM Nodes
              </span>
              <span className="tabular-nums">{metrics.domNodes.toLocaleString()}</span>
            </div>
            <div className="pt-1 border-t mt-1">
              <p className="text-[10px] text-muted-foreground">
                React {import.meta.env.DEV ? 'DEV' : 'PROD'} • Vite {import.meta.env.MODE}
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
});
