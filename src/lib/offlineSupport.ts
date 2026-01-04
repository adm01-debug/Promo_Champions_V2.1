// Offline Support System
import { useEffect, useState } from 'react';

export interface OfflineConfig {
  enableSync: boolean;
  syncInterval: number;
  cacheDuration: number;
}

class OfflineManager {
  private syncQueue: Array<{ action: string; data: any; timestamp: number }> = [];
  private isOnline: boolean = navigator.onLine;
  
  constructor() {
    this.initializeListeners();
    this.registerServiceWorker();
  }
  
  private initializeListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }
  
  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered');
      } catch (error) {
        console.error('SW registration failed:', error);
      }
    }
  }
  
  queueAction(action: string, data: any) {
    this.syncQueue.push({
      action,
      data,
      timestamp: Date.now(),
    });
    
    localStorage.setItem('offlineQueue', JSON.stringify(this.syncQueue));
    
    if (this.isOnline) {
      this.processSyncQueue();
    }
  }
  
  private async processSyncQueue() {
    const queue = [...this.syncQueue];
    this.syncQueue = [];
    
    for (const item of queue) {
      try {
        // Process each queued action
        await this.executeAction(item);
      } catch (error) {
        // Re-queue if failed
        this.syncQueue.push(item);
      }
    }
    
    localStorage.setItem('offlineQueue', JSON.stringify(this.syncQueue));
  }
  
  private async executeAction(item: any) {
    // Implementation of action execution
    console.log('Executing offline action:', item);
  }
  
  getStatus() {
    return {
      isOnline: this.isOnline,
      queuedActions: this.syncQueue.length,
    };
  }
}

export const offlineManager = new OfflineManager();

export const useOfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return { isOnline, queuedActions: offlineManager.getStatus().queuedActions };
};
