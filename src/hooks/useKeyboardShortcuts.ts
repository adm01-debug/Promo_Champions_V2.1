import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

/**
 * Global keyboard shortcuts for power users.
 * Ctrl/Cmd+K is handled by CommandPalette.
 * This hook adds page navigation and action shortcuts.
 */
export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const shortcuts: ShortcutConfig[] = [
      { key: 'd', ctrl: true, shift: true, action: () => navigate('/'), description: 'Dashboard' },
      { key: 'p', ctrl: true, shift: true, action: () => navigate('/pipeline'), description: 'Pipeline' },
      { key: 'v', ctrl: true, shift: true, action: () => navigate('/vendas'), description: 'Vendas' },
      { key: 'a', ctrl: true, shift: true, action: () => navigate('/atividades'), description: 'Atividades' },
      { key: 'r', ctrl: true, shift: true, action: () => navigate('/ranking'), description: 'Ranking' },
      { key: 'n', ctrl: true, shift: true, action: () => navigate('/notificacoes'), description: 'Notificações' },
    ];

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input/textarea/contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? (e.metaKey || e.ctrlKey) : true;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;

        if (e.key.toLowerCase() === shortcut.key && ctrlMatch && shiftMatch) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
}

/**
 * Returns the list of available shortcuts for display in help dialogs.
 */
export function getShortcutsList() {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
  const mod = isMac ? '⌘' : 'Ctrl';

  return [
    { keys: `${mod}+K`, description: 'Busca rápida (Command Palette)' },
    { keys: `${mod}+Shift+D`, description: 'Ir para Dashboard' },
    { keys: `${mod}+Shift+P`, description: 'Ir para Pipeline' },
    { keys: `${mod}+Shift+V`, description: 'Ir para Vendas' },
    { keys: `${mod}+Shift+A`, description: 'Ir para Atividades' },
    { keys: `${mod}+Shift+R`, description: 'Ir para Ranking' },
    { keys: `${mod}+Shift+N`, description: 'Ir para Notificações' },
  ];
}
