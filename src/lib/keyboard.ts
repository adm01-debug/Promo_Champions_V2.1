// Keyboard Shortcuts System
export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  description: string;
  action: () => void;
}

class KeyboardManager {
  private shortcuts: KeyboardShortcut[] = [];
  private isListening = false;
  
  register(shortcut: KeyboardShortcut) {
    this.shortcuts.push(shortcut);
  }
  
  unregister(key: string) {
    this.shortcuts = this.shortcuts.filter(s => s.key !== key);
  }
  
  start() {
    if (this.isListening) return;
    
    this.isListening = true;
    document.addEventListener('keydown', this.handleKeyDown);
  }
  
  stop() {
    this.isListening = false;
    document.removeEventListener('keydown', this.handleKeyDown);
  }
  
  private handleKeyDown = (event: KeyboardEvent) => {
    const matchingShortcut = this.shortcuts.find(shortcut => {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatches = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
      const altMatches = shortcut.alt ? event.altKey : !event.altKey;
      const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
      
      return keyMatches && ctrlMatches && altMatches && shiftMatches;
    });
    
    if (matchingShortcut) {
      event.preventDefault();
      matchingShortcut.action();
    }
  };
  
  getShortcuts(): KeyboardShortcut[] {
    return [...this.shortcuts];
  }
}

export const keyboard = new KeyboardManager();

// React hook for keyboard shortcuts
export const useKeyboardShortcut = (
  shortcut: Omit<KeyboardShortcut, 'description'>,
  dependencies: any[] = []
) => {
  React.useEffect(() => {
    const fullShortcut: KeyboardShortcut = {
      ...shortcut,
      description: '',
    };
    
    keyboard.register(fullShortcut);
    
    return () => {
      keyboard.unregister(shortcut.key);
    };
  }, dependencies);
};

// Default shortcuts
export const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  {
    key: 'k',
    ctrl: true,
    description: 'Open search',
    action: () => console.log('Open search'),
  },
  {
    key: 'n',
    ctrl: true,
    description: 'New item',
    action: () => console.log('New item'),
  },
  {
    key: '/',
    description: 'Focus search',
    action: () => {
      const searchInput = document.querySelector<HTMLInputElement>('[type="search"]');
      searchInput?.focus();
    },
  },
];
