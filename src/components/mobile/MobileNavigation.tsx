import { forwardRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Kanban, 
  ClipboardList, 
  Trophy,
  Menu,
  Bot
} from 'lucide-react';
import { MobileBottomNav } from './MobileComponents';
import { MobileDrawer } from './MobileDrawer';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useMediaQuery';

interface MobileNavigationProps {
  className?: string;
}

export const MobileNavigation = forwardRef<HTMLDivElement, MobileNavigationProps>(
  function MobileNavigation({ className }, _ref) {
    const location = useLocation();
    const isMobile = useIsMobile();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    
    if (!isMobile) return null;
    
    const navItems = [
      {
        icon: <LayoutDashboard className="h-5 w-5" />,
        label: 'Home',
        href: '/',
        isActive: location.pathname === '/'
      },
      {
        icon: <Kanban className="h-5 w-5" />,
        label: 'Pipeline',
        href: '/pipeline',
        isActive: location.pathname === '/pipeline'
      },
      {
        icon: <ClipboardList className="h-5 w-5" />,
        label: 'Tarefas',
        href: '/tarefas',
        isActive: location.pathname === '/tarefas'
      },
      {
        icon: <Bot className="h-5 w-5" />,
        label: 'IA',
        href: '/assistente',
        isActive: location.pathname === '/assistente'
      },
      {
        icon: <Menu className="h-5 w-5" />,
        label: 'Menu',
        href: '#menu',
        isActive: false,
        onClick: () => setIsDrawerOpen(true)
      }
    ];

    return (
      <>
        <MobileBottomNav 
          items={navItems} 
          className={cn("safe-area-inset-bottom", className)} 
        />
        <MobileDrawer 
          isOpen={isDrawerOpen} 
          onClose={() => setIsDrawerOpen(false)} 
        />
      </>
    );
  }
);
MobileNavigation.displayName = "MobileNavigation";
