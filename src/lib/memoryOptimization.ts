// Memory Leak Prevention
export class MemoryManager {
  private listeners: Map<string, Function[]> = new Map();
  
  addEventListener(event: string, handler: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(handler);
  }
  
  removeEventListener(event: string, handler: Function) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }
  
  cleanup() {
    this.listeners.clear();
  }
}

// Hook para cleanup automático
export function useCleanup(cleanup: () => void) {
  React.useEffect(() => {
    return cleanup;
  }, []);
}
