import React, { useState, useEffect, useRef, memo } from 'react';
import { Activity, Zap, Clock, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export const PerformanceMonitor = memo(() => {
  const [fps, setFps] = useState(0);
  const [renderTime, setRenderTime] = useState(0);
  const [transitionTime, setTransitionTime] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [history, setHistory] = useState<number[]>([]);
  
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const requestRef = useRef<number>();
  const lastRenderRef = useRef(performance.now());

  useEffect(() => {
    const updateFps = () => {
      frameCount.current++;
      const now = performance.now();
      const elapsed = now - lastTime.current;

      if (elapsed >= 1000) {
        const currentFps = Math.round((frameCount.current * 1000) / elapsed);
        setFps(currentFps);
        setHistory(prev => [...prev.slice(-20), currentFps]);
        frameCount.current = 0;
        lastTime.current = now;
      }

      // Estimate render time (frame duration)
      const frameDuration = now - lastRenderRef.current;
      if (frameDuration < 100) { // Filter out background tab pauses
         setRenderTime(prev => Number((prev * 0.9 + frameDuration * 0.1).toFixed(2)));
      }
      lastRenderRef.current = now;

      requestRef.current = requestAnimationFrame(updateFps);
    };

    requestRef.current = requestAnimationFrame(updateFps);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Track page transition time via performance entries
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          setTransitionTime(Math.round(entry.duration));
        }
      });
    });

    observer.observe({ entryTypes: ['navigation', 'resource'] });
    return () => observer.disconnect();
  }, []);

  const getStatusColor = (val: number, type: 'fps' | 'render') => {
    if (type === 'fps') {
      if (val >= 55) return 'text-emerald-400';
      if (val >= 30) return 'text-amber-400';
      return 'text-rose-400';
    }
    if (val <= 16.7) return 'text-emerald-400';
    if (val <= 33.3) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] pointer-events-none">
      <motion.div 
        layout
        className={cn(
          "pointer-events-auto bg-background/80 backdrop-blur-xl border border-primary/20 rounded-xl shadow-2xl p-3 flex flex-col gap-3 min-w-[140px]",
          isExpanded ? "w-64" : "w-auto"
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-tighter uppercase text-muted-foreground">System Metrics</span>
          </div>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-primary/10 rounded-md transition-colors"
          >
            {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] font-mono text-muted-foreground">FPS</span>
            </div>
            <span className={cn("text-xs font-mono font-bold", getStatusColor(fps, 'fps'))}>
              {fps}
            </span>
          </div>

          {isExpanded && (
            <div className="h-8 flex items-end gap-0.5 px-1 bg-black/20 rounded border border-white/5">
              {history.map((val, i) => (
                <div 
                  key={i} 
                  className="flex-1 bg-primary/40 rounded-t-sm" 
                  style={{ height: `${Math.min(100, (val / 60) * 100)}%` }}
                />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-blue-400" />
              <span className="text-[10px] font-mono text-muted-foreground">RENDER</span>
            </div>
            <span className={cn("text-xs font-mono font-bold", getStatusColor(renderTime, 'render'))}>
              {renderTime}ms
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full border border-primary/40 border-t-primary animate-spin" />
              <span className="text-[10px] font-mono text-muted-foreground">TRANSITION</span>
            </div>
            <span className="text-xs font-mono font-bold text-primary">
              {transitionTime > 0 ? `${transitionTime}ms` : '--'}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
});

PerformanceMonitor.displayName = 'PerformanceMonitor';