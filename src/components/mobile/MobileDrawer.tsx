import { FC } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, LayoutDashboard, Users, ShoppingBag, BarChart3, Settings, Target, Zap, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: ShoppingBag, label: 'Vendas', href: '/vendas' },
  { icon: Users, label: 'Clientes', href: '/clientes' },
  { icon: Target, label: 'Metas', href: '/metas-atividades' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
  { icon: Trophy, label: 'Ranking', href: '/ranking' },
  { icon: Zap, label: 'Desafios', href: '/desafios' },
  { icon: Settings, label: 'Configurações', href: '/configuracoes' },
];

export const MobileDrawer: FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetHeader className="p-4 border-b border-border">
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>
        
        <nav className="flex flex-col p-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg",
                  "transition-colors text-sm font-medium",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
};
