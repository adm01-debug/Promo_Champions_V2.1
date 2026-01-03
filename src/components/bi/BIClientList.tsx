import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { User, Building, ShoppingBag, TrendingUp, Clock, Star } from "lucide-react";
import { motion } from "framer-motion";

interface ClientInfo {
  name: string;
  company?: string;
  totalValue: number;
  dealsCount?: number;
  avgTicket?: number;
  daysInPipeline?: number;
}

interface BIClientListProps {
  title: string;
  clients: ClientInfo[];
  type?: "top-value" | "top-ticket" | "prospects" | "recent";
  maxItems?: number;
  className?: string;
}

const formatCurrency = (value: number) => 
  `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;

export const BIClientList: FC<BIClientListProps> = ({
  title,
  clients,
  type = "top-value",
  maxItems = 5,
  className
}) => {
  const displayClients = clients.slice(0, maxItems);

  const getIcon = () => {
    switch (type) {
      case "top-value": return Star;
      case "top-ticket": return TrendingUp;
      case "prospects": return Clock;
      default: return User;
    }
  };

  const Icon = getIcon();

  return (
    <Card className={cn("glass-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[280px]">
          <div className="space-y-3">
            {displayClients.map((client, index) => (
              <motion.div
                key={`${client.name}-${index}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
              >
                {/* Rank */}
                {type === "top-value" && (
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                    index === 0 ? "bg-rank-gold text-rank-gold-foreground" :
                    index === 1 ? "bg-rank-silver text-rank-silver-foreground" :
                    index === 2 ? "bg-rank-bronze text-rank-bronze-foreground" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {index + 1}
                  </div>
                )}

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                    {client.name}
                  </p>
                  {client.company && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Building className="h-3 w-3" />
                      <span className="truncate">{client.company}</span>
                    </div>
                  )}
                </div>

                {/* Value/Metric */}
                <div className="text-right shrink-0">
                  <p className="font-bold text-sm">
                    {type === "top-ticket" && client.avgTicket
                      ? formatCurrency(client.avgTicket)
                      : formatCurrency(client.totalValue)
                    }
                  </p>
                  {client.dealsCount !== undefined && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                      <ShoppingBag className="h-3 w-3" />
                      <span>{client.dealsCount} vendas</span>
                    </div>
                  )}
                  {client.daysInPipeline !== undefined && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                      <Clock className="h-3 w-3" />
                      <span>{client.daysInPipeline}d no pipeline</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {displayClients.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum cliente encontrado</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

// Purchase History Component
interface PurchaseHistoryProps {
  clientName: string;
  purchases: { date: string; value: number; category: string }[];
}

export const BIPurchaseHistory: FC<{ 
  data: PurchaseHistoryProps[];
  className?: string;
}> = ({ data, className }) => {
  if (data.length === 0) {
    return null;
  }

  return (
    <Card className={cn("glass-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <ShoppingBag className="h-4 w-4 text-primary" />
          </div>
          Histórico de Compras
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {data.map((client, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium text-sm">{client.clientName}</span>
                  <Badge variant="secondary" className="ml-auto">
                    {client.purchases.length} compras
                  </Badge>
                </div>
                <div className="ml-10 space-y-1.5">
                  {client.purchases.slice(0, 5).map((purchase, pIdx) => (
                    <div 
                      key={pIdx} 
                      className="flex items-center justify-between text-sm p-2 rounded bg-muted/30"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs">{purchase.date}</span>
                        <Badge variant="outline" className="text-xs">{purchase.category}</Badge>
                      </div>
                      <span className="font-medium">{formatCurrency(purchase.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
