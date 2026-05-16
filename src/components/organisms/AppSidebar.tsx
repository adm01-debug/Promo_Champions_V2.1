/* sidebar v3 — grouped submenus */
import React, { useState, useMemo, memo, useEffect, useRef } from "react";
import { Crown, LogOut } from "lucide-react";
import { NavItem, NavGroup } from "@/components/navigation";
import { UserRoleBadge } from "@/components/layout/UserRoleBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useAlerts } from "@/hooks/useAlerts";
import { useUserRoles } from "@/hooks/useUserRoles";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  type ViewMode, type MenuItem, type MenuGroup,
  getMainItems, getGroupedItems, viewModes, systemItems, adminOnlyItems,
} from "../layout/sidebar/sidebarMenuData";

const userTypeAccentClasses = {
  sdr: 'bg-info/15 text-info',
  closer: 'bg-success/15 text-success',
  admin: 'bg-destructive/15 text-destructive',
  manager: 'bg-primary/15 text-primary',
  salesperson: 'bg-muted text-muted-foreground',
} as const;

export const AppSidebar = memo(function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { data: alerts } = useAlerts();
  const alertCount = alerts?.length || 0;
  const { salesperson, signOut } = useAuth();
  const { currentUserRole, isLoadingCurrentRole } = useUserRoles();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Auto-scroll to active item for excellence
  useEffect(() => {
    if (scrollAreaRef.current) {
      const activeItem = scrollAreaRef.current.querySelector('[aria-current="page"]');
      if (activeItem) {
        activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [location.pathname]);

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
    const isNotifications = item.title === "Notificações";
    const hasAlerts = isNotifications && alertCount > 0;
    
    return (
      <NavItem
        key={item.title + item.url}
        title={item.title}
        url={item.url}
        icon={item.icon}
        isCollapsed={isCollapsed}
        badgeCount={isNotifications ? alertCount : 0}
        badgeVariant={isNotifications ? "warning" : "default"}
      />
    );
  };

  const renderGroupedMenu = (group: MenuGroup) => {
    const currentPath = window.location.pathname;
    const hasActiveChild = group.items.some(item => 
      currentPath === item.url || currentPath.startsWith(item.url + '/')
    );
    
    return (
      <NavGroup 
        key={group.label} 
        label={group.label} 
        icon={group.icon} 
        isCollapsed={isCollapsed}
        defaultOpen={hasActiveChild}
      >
        {group.items.map(item => renderMenuItem(item))}
      </NavGroup>
    );
  };

  if (isLoadingCurrentRole) {
    return (
      <Sidebar collapsible="icon" className="border-r-0 bg-sidebar">
        <SidebarContent className="flex items-center justify-center">
          <div className="animate-pulse space-y-3 p-4 w-full">
            {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-muted rounded-xl" />)}
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-border/30 bg-sidebar/95 backdrop-blur-sm">
      <SidebarHeader className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-info flex items-center justify-center flex-shrink-0 shadow-lg shadow-info/25">
            <Crown className="h-5 w-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-base font-semibold text-foreground tracking-normal">Promo Champions</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Realize seus sonhos!</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      {isAdminOrManager && !isCollapsed && (
        <div className="px-3 pb-3">
          <div className="flex gap-1 p-1 bg-sidebar-background/80 rounded-xl border border-sidebar-border/50 relative overflow-hidden">
            {viewModes.map((vm) => {
              const isActive = viewMode === vm.mode;
              return (
                <Button 
                  key={vm.mode} 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setViewMode(vm.mode)}
                  className={cn(
                    "flex-1 h-8 text-[11px] font-bold rounded-lg transition-all duration-300 gap-1.5 px-2 relative z-10",
                    isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="active-view-mode"
                        className="absolute inset-0 bg-gradient-to-r from-primary to-primary/90 rounded-lg -z-10 shadow-md shadow-primary/20"
                        initial={false}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </AnimatePresence>
                  <vm.icon className={cn("h-3.5 w-3.5 transition-colors duration-300", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                  <span className="truncate">{vm.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      <Separator className="bg-border/30" />

      <SidebarContent className="px-3 py-2" ref={scrollAreaRef}>
        <ScrollArea className="flex-1">
          <SidebarGroup><SidebarGroupContent><SidebarMenu className="space-y-1">{mainItems.map((item: MenuItem) => renderMenuItem(item))}</SidebarMenu></SidebarGroupContent></SidebarGroup>
          <Separator className="my-2 bg-border/30" />
          <SidebarGroup><div className="space-y-1">{groupedItems.map((group: MenuGroup) => renderGroupedMenu(group))}</div></SidebarGroup>
          <Separator className="my-2 bg-border/30" />
          <SidebarGroup><SidebarGroupContent><SidebarMenu className="space-y-1">{systemItems.map((item: MenuItem) => renderMenuItem(item))}</SidebarMenu></SidebarGroupContent></SidebarGroup>
          {userType === 'admin' && (
            <>
              <Separator className="my-2 bg-border/30" />
              <SidebarGroup>
                <p className="px-3 py-1.5 text-[11px] uppercase tracking-wider text-muted-foreground/60 font-semibold">Administração</p>
                <SidebarGroupContent><SidebarMenu className="space-y-1">{adminOnlyItems.map(item => renderMenuItem(item))}</SidebarMenu></SidebarGroupContent>
              </SidebarGroup>
            </>
          )}
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-border/30">
        <div className="flex flex-col gap-2">
          {isCollapsed ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center mx-auto cursor-default font-bold text-sm", userTypeAccentClasses[userType as keyof typeof userTypeAccentClasses])}>
                    {salesperson?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="font-medium">{salesperson?.name || "Usuário"}</p>
                  <p className="text-xs text-muted-foreground">{salesperson?.email}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors group cursor-default">
              <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm", userTypeAccentClasses[userType as keyof typeof userTypeAccentClasses])}>
                {salesperson?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-center gap-1.5 min-w-0">
                  <p className="text-sm font-semibold truncate max-w-[110px]" title={salesperson?.name || "Usuário"}>{salesperson?.name || "Usuário"}</p>
                  <div className="flex-shrink-0">
                    <UserRoleBadge />
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground truncate">{salesperson?.email || ""}</p>
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            size={isCollapsed ? "icon" : "sm"}
            onClick={() => signOut()}
            className={cn(
              "w-full text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors group",
              isCollapsed ? "justify-center" : "justify-start px-2.5"
            )}
            title="Sair do sistema"
          >
            <LogOut className={cn("h-4 w-4 shrink-0", isCollapsed ? "" : "mr-2")} />
            {!isCollapsed && <span className="text-xs font-semibold">Sair do sistema</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
});

AppSidebar.displayName = "AppSidebar";
