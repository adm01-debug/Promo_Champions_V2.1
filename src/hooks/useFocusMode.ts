import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";

interface FocusModeConfig {
  enabled: boolean;
  hideSidebar: boolean;
  hideNotifications: boolean;
  hideGamification: boolean;
  dimInactiveElements: boolean;
  autoBreakReminder: boolean;
  breakIntervalMinutes: number;
  startedAt: number | null;
}

const DEFAULT_CONFIG: FocusModeConfig = {
  enabled: false,
  hideSidebar: true,
  hideNotifications: true,
  hideGamification: true,
  dimInactiveElements: true,
  autoBreakReminder: true,
  breakIntervalMinutes: 25, // Pomodoro default
  startedAt: null,
};

export function useFocusMode() {
  const location = useLocation();
  const [config, setConfig] = useState<FocusModeConfig>(() => {
    if (typeof window === "undefined") return DEFAULT_CONFIG;
    
    const stored = localStorage.getItem("focus-mode-config");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Reset enabled state on page load
        return { ...DEFAULT_CONFIG, ...parsed, enabled: false, startedAt: null };
      } catch {
        return DEFAULT_CONFIG;
      }
    }
    return DEFAULT_CONFIG;
  });

  const [timeInFocus, setTimeInFocus] = useState(0);
  const [shouldShowBreakReminder, setShouldShowBreakReminder] = useState(false);

  // Apply focus mode classes
  useEffect(() => {
    const root = document.documentElement;
    
    if (config.enabled) {
      root.classList.add("focus-mode");
      
      if (config.hideSidebar) {
        root.classList.add("focus-hide-sidebar");
      }
      if (config.hideNotifications) {
        root.classList.add("focus-hide-notifications");
      }
      if (config.hideGamification) {
        root.classList.add("focus-hide-gamification");
      }
      if (config.dimInactiveElements) {
        root.classList.add("focus-dim-inactive");
      }
    } else {
      root.classList.remove(
        "focus-mode",
        "focus-hide-sidebar",
        "focus-hide-notifications",
        "focus-hide-gamification",
        "focus-dim-inactive"
      );
    }
  }, [config]);

  // Timer for focus duration
  useEffect(() => {
    if (!config.enabled || !config.startedAt) {
      setTimeInFocus(0);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - config.startedAt!) / 1000);
      setTimeInFocus(elapsed);
      
      // Check for break reminder
      if (config.autoBreakReminder) {
        const breakIntervalSeconds = config.breakIntervalMinutes * 60;
        if (elapsed > 0 && elapsed % breakIntervalSeconds === 0) {
          setShouldShowBreakReminder(true);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [config.enabled, config.startedAt, config.autoBreakReminder, config.breakIntervalMinutes]);

  // Persist config (except enabled state)
  useEffect(() => {
    const { _enabled, _startedAt, ...persistedConfig } = config;
    localStorage.setItem("focus-mode-config", JSON.stringify(persistedConfig));
  }, [config]);

  // Exit focus mode on route change (optional behavior)
  useEffect(() => {
    // Keep focus mode active during navigation
  }, [location]);

  const enableFocusMode = useCallback(() => {
    setConfig(prev => ({ 
      ...prev, 
      enabled: true, 
      startedAt: Date.now() 
    }));
  }, []);

  const disableFocusMode = useCallback(() => {
    setConfig(prev => ({ 
      ...prev, 
      enabled: false, 
      startedAt: null 
    }));
    setTimeInFocus(0);
  }, []);

  const toggleFocusMode = useCallback(() => {
    if (config.enabled) {
      disableFocusMode();
    } else {
      enableFocusMode();
    }
  }, [config.enabled, enableFocusMode, disableFocusMode]);

  const updateConfig = useCallback((updates: Partial<FocusModeConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const dismissBreakReminder = useCallback(() => {
    setShouldShowBreakReminder(false);
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  return {
    isEnabled: config.enabled,
    config,
    timeInFocus,
    formattedTime: formatTime(timeInFocus),
    shouldShowBreakReminder,
    enableFocusMode,
    disableFocusMode,
    toggleFocusMode,
    updateConfig,
    dismissBreakReminder,
  };
}
