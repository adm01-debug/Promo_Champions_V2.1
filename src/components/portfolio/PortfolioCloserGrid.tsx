import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Closer {
  id: string;
  name: string;
  role: string;
}

interface PortfolioItem {
  salesperson_id: string;
  status: string;
}

interface PortfolioCloserGridProps {
  closers: Closer[];
  portfolio: PortfolioItem[];
}

export const PortfolioCloserGrid = React.memo(function PortfolioCloserGrid({ closers, portfolio }: PortfolioCloserGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {closers.map((closer) => {
        const closerPortfolio = portfolio.filter((p) => p.salesperson_id === closer.id);
        const activeCount = closerPortfolio.filter((p) => p.status === "active").length;
        const inactiveCount = closerPortfolio.filter((p) => p.status === "inactive").length;

        return (
          <Card key={closer.id} className="glass hover-lift">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{closer.name.charAt(0)}</span>
                </div>
                <div>
                  <CardTitle className="text-base">{closer.name}</CardTitle>
                  <p className="text-xs text-muted-foreground capitalize">{closer.role}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-status-success/10">
                  <p className="text-2xl font-bold text-status-success">{activeCount}</p>
                  <p className="text-xs text-muted-foreground">Ativos</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-status-warning/10">
                  <p className="text-2xl font-bold text-status-warning">{inactiveCount}</p>
                  <p className="text-xs text-muted-foreground">Inativos</p>
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-3">
                Total: {closerPortfolio.length} clientes
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});
