// Advanced Notification System
import { toast } from 'sonner';

export interface NotificationOptions {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
}

class NotificationSystem {
  private queue: NotificationOptions[] = [];
  private isProcessing = false;
  
  show(options: NotificationOptions) {
    this.queue.push(options);
    this.processQueue();
  }
  
  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;
    const notification = this.queue.shift()!;
    
    this.displayNotification(notification);
    
    await new Promise(resolve => setTimeout(resolve, notification.duration || 3000));
    this.isProcessing = false;
    this.processQueue();
  }
  
  private displayNotification(options: NotificationOptions) {
    const toastFn = toast[options.type] || toast;
    
    toastFn(options.title, {
      description: options.message,
      duration: options.duration,
      action: options.actionLabel && options.onAction ? {
        label: options.actionLabel,
        onClick: options.onAction,
      } : undefined,
    });
  }
  
  success(title: string, message: string) {
    this.show({ title, message, type: 'success' });
  }
  
  error(title: string, message: string) {
    this.show({ title, message, type: 'error' });
  }
  
  warning(title: string, message: string) {
    this.show({ title, message, type: 'warning' });
  }
  
  info(title: string, message: string) {
    this.show({ title, message, type: 'info' });
  }
}

export const notifications = new NotificationSystem();
