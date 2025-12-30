import { FC, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Kanban, 
  ClipboardList, 
  Trophy,
  Menu
} from 'lucide-react';
import { MobileBottomNav } from './MobileComponents';
import { MobileDrawer } from './MobileDrawer';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useMediaQuery';

interface MobileNavigationProps {
  className?: string;
}

export const MobileNavigation: FC<MobileNavigationProps> = ({ className }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  if (!isMobile) return null;
  
  const navItems = [
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: 'Dashboard',
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
      icon: <Trophy className="h-5 w-5" />,
      label: 'Ranking',
      href: '/ranking',
      isActive: location.pathname === '/ranking'
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
        className={className} 
      />
      <MobileDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </>
  );
};
