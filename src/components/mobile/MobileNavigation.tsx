import { FC } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Kanban, 
  ClipboardList, 
  Trophy,
  User
} from 'lucide-react';
import { MobileBottomNav } from './MobileComponents';
import { cn } from '@/lib/utils';

interface MobileNavigationProps {
  className?: string;
}

export const MobileNavigation: FC<MobileNavigationProps> = ({ className }) => {
  const location = useLocation();
  
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
      icon: <User className="h-5 w-5" />,
      label: 'Perfil',
      href: '/configuracoes',
      isActive: location.pathname === '/configuracoes'
    }
  ];

  return (
    <MobileBottomNav items={navItems} className={className} />
  );
};
