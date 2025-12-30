// Melhoria 120 - Offline Support
class OfflineManager {
  private queue: Array<{operation: string; data: any}> = [];
  
  constructor() {
    window.addEventListener('online', () => this.sync());
    window.addEventListener('offline', () => this.handleOffline());
  }

  async sync() {
    if (!navigator.onLine) return;
    
    console.log('🔄 Syncing queued operations...');
    
    while (this.queue.length > 0) {
      const operation = this.queue.shift();
      try {
        await this.executeOperation(operation);
      } catch (error) {
        this.queue.unshift(operation); // Re-queue on failure
        break;
      }
    }
  }

  private async executeOperation(op: any) {
    // Execute queued database operations
    await supabase.from(op.table).insert(op.data);
  }

  private handleOffline() {
    console.log('📴 Offline mode activated');
    toast.warning('You are offline. Changes will sync when online.');
  }

  queueOperation(operation: any) {
    this.queue.push(operation);
  }
}

export const offlineManager = new OfflineManager();
