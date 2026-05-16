import React, { FC, memo } from "react";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { NavLink } from "../navigation/NavLink";
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
        <NavLink 
          to={url} 
          end
          className="relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground transition-all duration-300 hover:text-foreground hover:bg-muted/40 group/item overflow-hidden"
          activeClassName="bg-gradient-to-r from-primary/12 to-primary/6 text-primary font-bold shadow-sm border border-primary/10 [&>.nav-indicator]:opacity-100 [&>.nav-indicator]:scale-y-100"
        >
          <motion.span 
            className="nav-indicator absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-gradient-to-b from-primary to-primary/70 opacity-0 scale-y-0 transition-all duration-300 shadow-sm shadow-primary/30" 
            layoutId="nav-pill"
          />
          <div className="relative z-10">
            <Icon className={cn(
              "h-[18px] w-[18px] flex-shrink-0 transition-all duration-300 group-hover/item:scale-110",
              badgeVariant === "warning" && hasBadge && "text-warning"
            )} />
            {hasBadge && (
              <span className={badgeClasses}>
                {badgeCount > 9 ? "9+" : badgeCount}
              </span>
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
          
          {/* Subtle glow effect on hover */}
          <div className="absolute inset-0 bg-primary/0 group-hover/item:bg-primary/[0.03] transition-colors duration-500" />
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
});

NavItem.displayName = "NavItem";
