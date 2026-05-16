/* sidebar v3 — grouped submenus */
import React, { useState, useMemo, memo, useEffect, useRef } from "react";
import { ChevronRight, Crown } from "lucide-react";
import { NavLink } from "@/components/navigation/NavLink";
import { UserRoleBadge } from "@/components/layout/UserRoleBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useAlerts } from "@/hooks/useAlerts";
import { useUserRoles } from "@/hooks/useUserRoles";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  type ViewMode, type MenuItem, type MenuGroup,
  getMainItems, getGroupedItems, viewModes, systemItems, adminOnlyItems,
} from "./sidebar/sidebarMenuData";

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
  const { salesperson } = useAuth();
  const { currentUserRole, isLoadingCurrentRole } = useUserRoles();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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
      <SidebarMenuItem key={item.title + item.url}>
        <SidebarMenuButton asChild tooltip={item.title}>
          <NavLink to={item.url} end
            className="relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground transition-all duration-300 hover:text-foreground hover:bg-muted/40 group/item overflow-hidden"
            activeClassName="bg-gradient-to-r from-primary/12 to-primary/6 text-primary font-bold shadow-sm border border-primary/10 [&>.nav-indicator]:opacity-100 [&>.nav-indicator]:scale-y-100"
          >
            <motion.span 
              className="nav-indicator absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-gradient-to-b from-primary to-primary/70 opacity-0 scale-y-0 transition-all duration-300 shadow-sm shadow-primary/30" 
              layoutId="nav-pill"
            />
            <div className="relative z-10">
              <item.icon className={cn("h-[18px] w-[18px] flex-shrink-0 transition-all duration-300 group-hover/item:scale-110", hasAlerts && "text-warning")} />
              {hasAlerts && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground flex items-center justify-center animate-pulse ring-2 ring-sidebar">
                  {alertCount > 9 ? "9+" : alertCount}
                </span>
              )}
            </div>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[13px] font-medium tracking-tight relative z-10"
              >
                {item.title}
              </motion.span>
            )}
            
            {/* Subtle glow effect on hover */}
            <div className="absolute inset-0 bg-primary/0 group-hover/item:bg-primary/[0.03] transition-colors duration-500" />
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  const renderGroupedMenu = (group: MenuGroup) => {
    const currentPath = window.location.pathname;
    const hasActiveChild = group.items.some(item => currentPath === item.url || currentPath.startsWith(item.url + '/'));
    return (
      <Collapsible key={group.label} defaultOpen={hasActiveChild} className="group/collapsible">
        <CollapsibleTrigger className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/20 transition-all duration-300 text-[10px] uppercase tracking-[0.15em] font-black group-data-[state=open]/collapsible:text-foreground/70">
          <div className="p-1.5 rounded-lg bg-muted/40 group-data-[state=open]/collapsible:bg-primary/10 transition-colors">
            <group.icon className="h-3.5 w-3.5 flex-shrink-0 group-data-[state=open]/collapsible:text-primary transition-colors" />
          </div>
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left transition-colors">{group.label}</span>
              <ChevronRight className="h-3.5 w-3.5 transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90 opacity-40 group-hover/collapsible:opacity-100" />
            </>
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
          <SidebarMenu className="space-y-0.5 pl-2 mt-1 ml-[15px] border-l border-primary/10">
            {group.items.map(item => renderMenuItem(item))}
          </SidebarMenu>
        </CollapsibleContent>
      </Collapsible>
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

      <SidebarContent className="px-3 py-2">
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
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
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[250px]">
                <p className="font-medium">{salesperson?.name || "Usuário"}</p>
                <p className="text-xs text-muted-foreground">{salesperson?.email || ""}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </SidebarFooter>
    </Sidebar>
  );
});

AppSidebar.displayName = "AppSidebar";
