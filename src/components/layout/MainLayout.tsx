import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 relative">
          <div className="absolute top-4 left-4 z-50 md:hidden">
            <SidebarTrigger className="glass h-9 w-9" />
          </div>
          <div className="hidden md:block absolute top-4 left-4 z-50">
            <SidebarTrigger className="glass h-9 w-9 hover:bg-muted/50 transition-colors" />
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
