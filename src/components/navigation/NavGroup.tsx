import React, { FC, ReactNode, memo } from "react";
import { LucideIcon, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SidebarMenu } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface NavGroupProps {
  label: string;
  icon: LucideIcon;
  children: ReactNode;
  isCollapsed?: boolean;
  defaultOpen?: boolean;
}

export const NavGroup: FC<NavGroupProps> = memo(({ 
  label, 
  icon: Icon, 
  children, 
  isCollapsed = false,
  defaultOpen = false 
}) => {
  return (
    <Collapsible defaultOpen={defaultOpen} className="group/collapsible">
      <CollapsibleTrigger className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/20 transition-all duration-300 text-[10px] uppercase tracking-[0.15em] font-black group-data-[state=open]/collapsible:text-foreground/70 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
        <div className="p-1.5 rounded-lg bg-muted/40 group-data-[state=open]/collapsible:bg-primary/10 transition-colors">
          <Icon className="h-3.5 w-3.5 flex-shrink-0 group-data-[state=open]/collapsible:text-primary transition-colors" />
        </div>
        {!isCollapsed && (
          <>
            <span className="flex-1 text-left transition-colors truncate">{label}</span>
            <ChevronRight className="h-3.5 w-3.5 transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90 opacity-40 group-hover/collapsible:opacity-100" />
          </>
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
        <SidebarMenu className="space-y-0.5 pl-2 mt-1 ml-[15px] border-l border-primary/10">
          {children}
        </SidebarMenu>
      </CollapsibleContent>
    </Collapsible>
  );
});

NavGroup.displayName = "NavGroup";
