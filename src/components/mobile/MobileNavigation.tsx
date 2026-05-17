import React, { FC, useState, memo, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Kanban, 
  ClipboardList,
  Menu,
  Bot,
  Home,
} from 'lucide-react';
import { MobileBottomNav } from './MobileComponents';
import { MobileDrawer } from './MobileDrawer';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useUnreadNotificationsCount } from '@/hooks/useUnreadNotificationsCount';

interface MobileNavigationProps {
  className?: string;
}

export const MobileNavigation: FC<MobileNavigationProps> = memo(({ className }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  
  if (!isMobile) return null;
  
  const navItems = useMemo(() => [
    {
      icon: <Home className="h-5 w-5" />,
      filledIcon: <Home className="h-5 w-5 fill-current" />,
      label: 'Home',
      href: '/',
      isActive: location.pathname === '/',
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      icon: <Kanban className="h-5 w-5" />,
      filledIcon: <Kanban className="h-5 w-5 fill-current" />,
      label: 'Pipeline',
      href: '/pipeline',
      isActive: location.pathname === '/pipeline',
    },
    {
      icon: <ClipboardList className="h-5 w-5" />,
      filledIcon: <ClipboardList className="h-5 w-5 fill-current" />,
      label: 'Tarefas',
      href: '/tarefas',
      isActive: location.pathname === '/tarefas',
    },
    {
      icon: <Bot className="h-5 w-5" />,
      filledIcon: <Bot className="h-5 w-5 fill-current" />,
      label: 'IA',
      href: '/assistente',
      isActive: location.pathname === '/assistente',
    },
    {
      icon: <Menu className="h-5 w-5" />,
      filledIcon: <Menu className="h-5 w-5" />,
      label: 'Menu',
      href: '#menu',
      isActive: false,
      onClick: () => setIsDrawerOpen(true),
    }
  ], [location.pathname, unreadCount]);

  return (
    <>
      <MobileBottomNav 
        items={navItems} 
        className={cn("safe-area-inset-bottom", className)} 
        aria-label="Navegação móvel"
      />
      <MobileDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </>
  );
});

MobileNavigation.displayName = "MobileNavigation";
