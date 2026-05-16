import { FC, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { PreloadLink } from '@/components/navigation/PreloadLink';
import { 
  ChevronRight, 
  Crown,
  Settings,
  Bell,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  getMainItems, 
  getGroupedItems, 
  viewModes, 
  type ViewMode,
  type MenuItem,
  type MenuGroup
} from '@/components/layout/sidebar/sidebarMenuData';
import { UserRoleBadge } from '@/components/layout/UserRoleBadge';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '@/lib/haptics';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { salesperson, signOut } = useAuth();
  const { currentUserRole } = useUserRoles();

  const userType = useMemo((): 'admin' | 'manager' | 'sdr' | 'closer' | 'salesperson' => {
    const role = currentUserRole?.role;
    if (role === 'admin') return 'admin';
    if (role === 'manager') return 'manager';
    const name = salesperson?.name?.toLowerCase() || '';
    if (name.includes('sdr')) return 'sdr';
    if (name.includes('closer')) return 'closer';
    return 'salesperson';
  }, [currentUserRole, salesperson]);

  const isAdminOrManager = useMemo(() => ['admin', 'manager'].includes(userType), [userType]);

  const defaultViewMode = useMemo((): ViewMode => {
    if (userType === 'sdr') return 'sdr';
    if (userType === 'closer') return 'closer';
    return 'gestao';
  }, [userType]);

  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode);
  
  const mainItems = useMemo(() => getMainItems(viewMode), [viewMode]);
  const groupedItems = useMemo(() => getGroupedItems(viewMode), [viewMode]);

  const renderMenuItem = (item: MenuItem) => {
    const isActive = location.pathname === item.url || (item.url !== '/' && location.pathname.startsWith(item.url));
    
    return (
      <PreloadLink
        key={item.url}
        to={item.url}
        onClick={() => {
          triggerHaptic('light');
          onClose();
        }}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
          isActive 
            ? "bg-primary/10 text-primary font-bold border border-primary/20 shadow-sm" 
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        )}
      >
        <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
        <span className="text-sm tracking-tight">{item.title}</span>
        {isActive && (
          <motion.div 
            layoutId="mobile-active-indicator"
            className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
          />
        )}
      </Link>
    );
  };

  const renderGroupedMenu = (group: MenuGroup) => {
    const hasActiveChild = group.items.some(item => location.pathname === item.url || location.pathname.startsWith(item.url + '/'));
    
    return (
      <Collapsible key={group.label} defaultOpen={hasActiveChild} className="w-full">
        <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 text-muted-foreground/60 hover:text-foreground transition-colors group">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-muted/40 group-data-[state=open]:bg-primary/10 transition-colors">
              <group.icon className="h-4 w-4 group-data-[state=open]:text-primary" />
            </div>
            <span className="text-[11px] uppercase tracking-[0.15em] font-black">{group.label}</span>
          </div>
          <ChevronRight className="h-4 w-4 transition-transform duration-300 group-data-[state=open]:rotate-90" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1 pl-4 mb-2">
          {group.items.map(item => renderMenuItem(item))}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[300px] p-0 flex flex-col glass border-r-primary/10">
        <SheetHeader className="p-6 pb-4 flex flex-row items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg shadow-primary/10 border border-primary/20">
            <Crown className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <div className="text-left">
            <SheetTitle className="text-lg font-black tracking-tighter uppercase italic leading-none">Promo Champions</SheetTitle>
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mt-1">Realize seus sonhos!</p>
          </div>
        </SheetHeader>

        <Separator className="bg-primary/5" />

        {isAdminOrManager && (
          <div className="px-4 py-4">
            <div className="flex gap-1 p-1 bg-muted/30 rounded-2xl border border-border/50 relative overflow-hidden">
              {viewModes.map((vm) => {
                const isActive = viewMode === vm.mode;
                return (
                  <Button 
                    key={vm.mode} 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      triggerHaptic('medium');
                      setViewMode(vm.mode);
                    }}
                    className={cn(
                      "flex-1 h-9 text-[10px] font-black rounded-xl transition-all duration-300 gap-1.5 px-2 relative z-10",
                      isActive ? "text-primary-foreground" : "text-muted-foreground"
                    )}
                  >
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          layoutId="mobile-view-mode-pill"
                          className="absolute inset-0 bg-gradient-to-br from-primary to-primary-glow rounded-xl -z-10 shadow-lg shadow-primary/20"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                    </AnimatePresence>
                    <vm.icon className={cn("h-3.5 w-3.5", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                    <span className="truncate uppercase tracking-tight">{vm.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1 py-2">
            <div className="px-2 mb-2">
              <p className="px-2 py-2 text-[10px] font-black uppercase tracking-widest text-primary opacity-60">Menu Principal</p>
              {mainItems.map(item => renderMenuItem(item))}
            </div>
            
            <Separator className="mx-4 my-4 bg-primary/5" />
            
            <div className="px-2">
              {groupedItems.map(group => renderGroupedMenu(group))}
            </div>

            <Separator className="mx-4 my-4 bg-primary/5" />

            <div className="px-2 pb-6">
              <Link
                to="/notificacoes"
                onClick={() => { triggerHaptic('light'); onClose(); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted/50 transition-all"
              >
                <Bell className="h-5 w-5" />
                <span className="text-sm font-medium">Notificações</span>
              </Link>
              <Link
                to="/configuracoes"
                onClick={() => { triggerHaptic('light'); onClose(); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted/50 transition-all"
              >
                <Settings className="h-5 w-5" />
                <span className="text-sm font-medium">Configurações</span>
              </Link>
              <button
                onClick={() => {
                  triggerHaptic('error');
                  signOut();
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-sm font-medium">Sair</span>
              </button>
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="p-6 border-t border-primary/5 bg-primary/[0.02]">
          <div className="flex items-center gap-4 w-full">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary text-xl shadow-inner border border-primary/10">
              {salesperson?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-bold text-sm truncate">{salesperson?.name || "Usuário"}</p>
                <UserRoleBadge />
              </div>
              <p className="text-[10px] text-muted-foreground truncate opacity-70">{salesperson?.email}</p>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
