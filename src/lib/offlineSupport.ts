import { useEffect, useState } from 'react';

export function useOnlineStatus() {
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

  return isOnline;
}

interface QueuedAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
}

class SyncQueue {
  private queue: QueuedAction[] = [];
  private processing = false;

  async addToQueue(type: string, data: any) {
    const action: QueuedAction = {
      id: crypto.randomUUID(),
      type,
      data,
      timestamp: Date.now(),
    };
    
    this.queue.push(action);
    
    if (navigator.onLine && !this.processing) {
      this.processQueue();
    }
  }

  async processQueue() {
    if (this.queue.length === 0 || this.processing) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const action = this.queue[0];
      
      try {
        // Processar ação
        console.log('Processing queued action:', action);
        
        // Remover da fila após sucesso
        this.queue.shift();
      } catch (error) {
        console.error('Error processing queue:', error);
        break;
      }
    }
    
    this.processing = false;
  }
}

export const syncQueue = new SyncQueue();

// Processar fila quando voltar online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    syncQueue.processQueue();
  });
}
