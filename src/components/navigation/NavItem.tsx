import React, { FC, memo } from "react";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { PreloadLink } from "./PreloadLink";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface NavItemProps {
  title: string;
  url: string;
  icon: LucideIcon;
  isCollapsed?: boolean;
  badgeCount?: number;
  badgeVariant?: "default" | "warning" | "destructive";
}

export const NavItem: FC<NavItemProps> = memo(({ 
  title, 
  url, 
  icon: Icon, 
  isCollapsed = false,
  badgeCount = 0,
  badgeVariant = "default"
}) => {
  const hasBadge = badgeCount > 0;
  
  const badgeClasses = cn(
    "absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse ring-2 ring-sidebar",
    badgeVariant === "destructive" ? "bg-destructive text-destructive-foreground" :
    badgeVariant === "warning" ? "bg-warning text-warning-foreground" :
    "bg-primary text-primary-foreground"
  );

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild tooltip={title}>
        <PreloadLink 
          to={url} 
          className={cn(
            "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground transition-all duration-300 hover:text-foreground hover:bg-muted/40 group/item overflow-hidden will-change-transform",
            window.location.pathname === url && "bg-gradient-to-r from-primary/15 to-primary/5 text-primary font-bold shadow-[0_0_15px_rgba(var(--primary),0.1)] border border-primary/20"
          )}
          aria-current={window.location.pathname === url ? "page" : undefined}
        >
          {window.location.pathname === url && (
            <div
              className="absolute inset-0 bg-primary/5 z-0"
            />
          )}
          
          <motion.span 
            className={cn(
              "nav-indicator absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-primary transition-all duration-500 shadow-[0_0_10px_rgba(var(--primary),0.8)]",
              window.location.pathname === url ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"
            )} 
          />
          
          <div className="relative z-10 flex items-center justify-center">
            <Icon className={cn(
              "h-[18px] w-[18px] flex-shrink-0 transition-all duration-500 group-hover/item:scale-125 group-hover/item:rotate-[5deg]",
              window.location.pathname === url ? "text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.6)]" : "text-muted-foreground",
              badgeVariant === "warning" && hasBadge && "text-warning"
            )} />
            {hasBadge && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={badgeClasses}
              >
                {badgeCount > 9 ? "9+" : badgeCount}
              </motion.span>
            )}
          </div>
          
          {!isCollapsed && (
            <motion.span 
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[13px] font-medium tracking-tight relative z-10 truncate"
            >
              {title}
            </motion.span>
          )}
          
          {/* Subtle neon pulse on active */}
          {window.location.pathname === url && (
            <motion.div 
              className="absolute inset-0 border-r-2 border-primary/30 z-0"
              animate={{ opacity: [0.1, 0.4, 0.1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </PreloadLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
});

NavItem.displayName = "NavItem";
