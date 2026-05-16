import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { Activity, Zap, Clock, Maximize2, Minimize2, AlertTriangle, Settings2, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Configurable thresholds defaults
const DEFAULT_FPS_THRESHOLD = 45;
const DEFAULT_RENDER_THRESHOLD = 32; // ~2 frames at 60fps

export const PerformanceMonitor = memo(() => {
  const [fps, setFps] = useState(0);
  const [renderTime, setRenderTime] = useState(0);
  const [transitionTime, setTransitionTime] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [history, setHistory] = useState<number[]>([]);
  const [hasAlert, setHasAlert] = useState(false);
  
  // Custom thresholds
  const [fpsThreshold, setFpsThreshold] = useState(DEFAULT_FPS_THRESHOLD);
  const [renderThreshold, setRenderThreshold] = useState(DEFAULT_RENDER_THRESHOLD);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const requestRef = useRef<number>();
  const lastRenderRef = useRef(performance.now());
  const lastAlertTime = useRef(0);

  useEffect(() => {
    const updateFps = () => {
      frameCount.current++;
      const now = performance.now();
      const elapsed = now - lastTime.current;

      if (elapsed >= 1000) {
        const currentFps = Math.round((frameCount.current * 1000) / elapsed);
        setFps(currentFps);
        setHistory(prev => [...prev.slice(-20), currentFps]);
        
        // Performance Alert Logic
        if (notificationsEnabled && currentFps < fpsThreshold && now - lastAlertTime.current > 15000) {
          setHasAlert(true);
          toast.warning("Performance Drop Detected", {
            description: `System running at ${currentFps} FPS. Threshold is ${fpsThreshold}.`,
            duration: 4000
          });
          lastAlertTime.current = now;
          setTimeout(() => setHasAlert(false), 3000);
        }

        frameCount.current = 0;
        lastTime.current = now;
      }

      // Estimate render time (frame duration)
      const frameDuration = now - lastRenderRef.current;
      if (frameDuration < 100) { // Filter out background tab pauses
         const smoothedRenderTime = Number((renderTime * 0.9 + frameDuration * 0.1).toFixed(2));
         setRenderTime(smoothedRenderTime);

         // Render time alert
         if (notificationsEnabled && smoothedRenderTime > renderThreshold && now - lastAlertTime.current > 15000) {
            setHasAlert(true);
            toast.error("High Render Latency", {
              description: `Frame took ${smoothedRenderTime}ms. Threshold is ${renderThreshold}ms.`,
              duration: 4000
            });
            lastAlertTime.current = now;
            setTimeout(() => setHasAlert(false), 3000);
         }
      }
      lastRenderRef.current = now;

      requestRef.current = requestAnimationFrame(updateFps);
    };

    requestRef.current = requestAnimationFrame(updateFps);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [renderTime, fpsThreshold, renderThreshold, notificationsEnabled]);

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
      if (val >= fpsThreshold) return 'text-amber-400';
      return 'text-rose-400';
    }
    if (val <= 16.7) return 'text-emerald-400';
    if (val <= renderThreshold) return 'text-amber-400';
    return 'text-rose-400';
  };

  const toggleSettings = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSettings(!showSettings);
  }, [showSettings]);

  return (
    <div className="fixed bottom-4 right-4 z-[9999] pointer-events-none">
      <motion.div 
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          scale: hasAlert ? [1, 1.05] : 1,
          borderColor: hasAlert ? "#ef4444" : "rgba(34, 211, 238, 0.3)"
        }}
        className={cn(
          "pointer-events-auto bg-background/90 backdrop-blur-2xl border rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-4 flex flex-col gap-4 min-w-[160px] transition-all duration-500",
          isExpanded ? "w-72" : "w-auto",
          hasAlert ? "border-rose-500/50 shadow-rose-500/20" : "border-primary/30"
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              {hasAlert ? (
                <AlertTriangle className="w-4 h-4 text-rose-500 animate-bounce" />
              ) : (
                <Activity className="w-4 h-4 text-primary" />
              )}
              <motion.div 
                className={cn("absolute inset-0 rounded-full", hasAlert ? "bg-rose-500/20" : "bg-primary/20")}
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-muted-foreground/80">Engine Health 2.1</span>
          </div>
          <div className="flex items-center gap-1 pointer-events-auto">
            <button 
              onClick={toggleSettings}
              className={cn(
                "p-1.5 hover:bg-primary/10 rounded-lg transition-all duration-300",
                showSettings && "bg-primary/20 text-primary"
              )}
              title="Settings"
            >
              <Settings2 className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 hover:bg-primary/10 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5 text-primary/70" /> : <Maximize2 className="w-3.5 h-3.5 text-primary/70" />}
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {showSettings ? (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-muted-foreground">Alerts</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn("h-6 w-6 rounded-md", notificationsEnabled ? "text-primary bg-primary/10" : "text-muted-foreground")}
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                >
                  <Bell className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono uppercase text-muted-foreground block">FPS Threshold</label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    value={fpsThreshold} 
                    onChange={(e) => setFpsThreshold(Number(e.target.value))}
                    className="h-7 text-[10px] font-mono bg-black/40 border-white/10"
                  />
                  <span className="text-[10px] font-mono text-muted-foreground">MIN</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono uppercase text-muted-foreground block">Render Threshold (ms)</label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    value={renderThreshold} 
                    onChange={(e) => setRenderThreshold(Number(e.target.value))}
                    className="h-7 text-[10px] font-mono bg-black/40 border-white/10"
                  />
                  <span className="text-[10px] font-mono text-muted-foreground">MAX</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                className="w-full h-7 text-[10px] uppercase font-bold tracking-widest border-primary/20 hover:bg-primary/10"
                onClick={() => setShowSettings(false)}
              >
                Close Settings
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="metrics"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 gap-3"
            >
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <Zap className={cn("w-3.5 h-3.5 group-hover:animate-pulse", fps < fpsThreshold ? "text-rose-500" : "text-amber-400")} />
                  <span className="text-[11px] font-mono font-medium text-muted-foreground">FPS</span>
                </div>
                <div className="flex items-center gap-2">
                  {fps < fpsThreshold && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" 
                    />
                  )}
                  <span className={cn("text-sm font-mono font-black tabular-nums tracking-tighter", getStatusColor(fps, 'fps'))}>
                    {fps}
                  </span>
                </div>
              </div>

              {isExpanded && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="space-y-3"
                >
                  <div className="h-12 flex items-end gap-0.5 px-1.5 py-1 bg-black/40 rounded-lg border border-white/5 overflow-hidden">
                    {history.map((val, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        className={cn(
                          "flex-1 rounded-t-[1px] transition-colors duration-300",
                          val >= 55 ? "bg-emerald-500/50" : val >= fpsThreshold ? "bg-amber-500/50" : "bg-rose-500/50"
                        )} 
                        style={{ height: `${Math.max(5, (val / 60) * 100)}%` }}
                      />
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                      <div className="text-[9px] font-mono text-muted-foreground uppercase mb-1">Stability</div>
                      <div className={cn("text-xs font-mono font-bold", fps >= 58 ? 'text-emerald-400' : fps >= fpsThreshold ? 'text-amber-400' : 'text-rose-400')}>
                        {fps >= 58 ? 'ULTRA' : fps >= fpsThreshold ? 'STABLE' : 'JITTER'}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                      <div className="text-[9px] font-mono text-muted-foreground uppercase mb-1">Load</div>
                      <div className={cn("text-xs font-mono font-bold", renderTime < 8 ? 'text-blue-400' : renderTime < renderThreshold ? 'text-amber-400' : 'text-rose-400')}>
                        {renderTime < 8 ? 'LIGHT' : renderTime < renderThreshold ? 'OPTIMAL' : 'CRITICAL'}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <Clock className={cn("w-3.5 h-3.5 group-hover:rotate-12 transition-transform", renderTime > renderThreshold ? "text-rose-500" : "text-blue-400")} />
                  <span className="text-[11px] font-mono font-medium text-muted-foreground">LATENCY</span>
                </div>
                <span className={cn("text-sm font-mono font-black tabular-nums tracking-tighter", getStatusColor(renderTime, 'render'))}>
                  {renderTime}<span className="text-[10px] ml-0.5 opacity-70">ms</span>
                </span>
              </div>

              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <div className="relative w-3.5 h-3.5">
                    <div className="absolute inset-0 rounded-full border border-primary/20" />
                    <div className="absolute inset-0 rounded-full border border-t-primary animate-spin" />
                  </div>
                  <span className="text-[11px] font-mono font-medium text-muted-foreground">ROUTE</span>
                </div>
                <span className="text-sm font-mono font-black tabular-nums tracking-tighter text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.4)]">
                  {transitionTime > 0 ? `${transitionTime}` : '--'}<span className="text-[10px] ml-0.5 opacity-70">ms</span>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
});

PerformanceMonitor.displayName = 'PerformanceMonitor';