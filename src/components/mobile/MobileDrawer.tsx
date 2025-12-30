import { FC, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  LayoutDashboard, 
  Kanban, 
  ShoppingCart, 
  Users, 
  Package, 
  ClipboardList, 
  Activity, 
  GitBranch, 
  Target, 
  BarChart3, 
  FileText, 
  Trophy, 
  Calendar, 
  UsersRound, 
  BookOpen, 
  Briefcase, 
  Truck, 
  TrendingUp, 
  FileSignature,
  Bot,
  Bell,
  Settings,
  Database,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Principal',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
      { icon: Kanban, label: 'Pipeline', href: '/pipeline' },
      { icon: ShoppingCart, label: 'Vendas', href: '/vendas' },
      { icon: Users, label: 'Clientes', href: '/clientes' },
      { icon: Package, label: 'Produtos', href: '/produtos' },
    ]
  },
  {
    title: 'Atividades',
    items: [
      { icon: ClipboardList, label: 'Tarefas', href: '/tarefas' },
      { icon: Activity, label: 'Atividades', href: '/atividades' },
      { icon: GitBranch, label: 'Cadências', href: '/cadencias' },
    ]
  },
  {
    title: 'Metas & Analytics',
    items: [
      { icon: Target, label: 'Metas', href: '/metas' },
      { icon: BarChart3, label: 'Analytics', href: '/analytics' },
      { icon: FileText, label: 'Relatórios', href: '/relatorios' },
    ]
  },
  {
    title: 'Gamificação',
    items: [
      { icon: Trophy, label: 'Ranking', href: '/ranking' },
      { icon: Calendar, label: 'Desafios', href: '/desafios-semanais' },
    ]
  },
  {
    title: 'Equipe',
    items: [
      { icon: UsersRound, label: 'Times', href: '/times' },
      { icon: UserCheck, label: 'Vendedores', href: '/vendedores' },
      { icon: BookOpen, label: 'Playbooks', href: '/playbooks' },
      { icon: Briefcase, label: 'Portfólio', href: '/portfolio' },
    ]
  },
  {
    title: 'Gestão',
    items: [
      { icon: Truck, label: 'Fornecedores', href: '/fornecedores' },
      { icon: TrendingUp, label: 'Previsão', href: '/previsao-demanda' },
      { icon: FileSignature, label: 'Assinaturas', href: '/assinatura-digital' },
    ]
  },
  {
    title: 'Ferramentas',
    items: [
      { icon: Bot, label: 'Assistente IA', href: '/assistente' },
      { icon: Database, label: 'ICP', href: '/icp' },
      { icon: Bell, label: 'Notificações', href: '/notificacoes' },
      { icon: Settings, label: 'Configurações', href: '/configuracoes' },
    ]
  }
];

export const MobileDrawer: FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
            onClick={onClose}
            aria-hidden="true"
          />
          
          {/* Drawer */}
          <motion.nav
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 w-[280px] bg-card border-r border-border z-[101] flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold gradient-text">Menu</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-muted transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Navigation */}
            <ScrollArea className="flex-1">
              <div className="p-2">
                {navSections.map((section) => (
                  <div key={section.title} className="mb-4">
                    <h3 className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {section.title}
                    </h3>
                    <ul className="space-y-1">
                      {section.items.map((item) => {
                        const isActive = location.pathname === item.href;
                        const Icon = item.icon;
                        
                        return (
                          <li key={item.href}>
                            <Link
                              to={item.href}
                              onClick={onClose}
                              className={cn(
                                "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors min-h-[44px]",
                                isActive 
                                  ? "bg-primary text-primary-foreground"
                                  : "hover:bg-muted"
                              )}
                            >
                              <Icon className="h-5 w-5 flex-shrink-0" />
                              <span className="flex-1 text-sm font-medium">{item.label}</span>
                              {isActive && (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
};
