import { FC, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertTriangle,
  TrendingDown,
  Clock,
  UserX,
  Phone,
  Mail,
  Calendar,
  ChevronRight,
  CheckCircle,
  XCircle,
  Target,
  Activity,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AlertType = "underperforming" | "stagnant_deals" | "inactive_clients";
type AlertPriority = "critical" | "high" | "medium";

interface Alert {
  id: string;
  type: AlertType;
  priority: AlertPriority;
  title: string;
  description: string;
  count: number;
  items: AlertItem[];
  actionLabel: string;
}

interface AlertItem {
  id: string;
  name: string;
  subtitle: string;
  value: string;
  status: "critical" | "warning" | "info";
  details: Record<string, string | number>;
}

interface AlertsDrilldownProps {
  className?: string;
}

const mockAlerts: Alert[] = [
  {
    id: "1",
    type: "underperforming",
    priority: "critical",
    title: "Vendedores Abaixo da Meta",
    description: "Precisam de suporte imediato",
    count: 2,
    actionLabel: "Ver Vendedores",
    items: [
      {
        id: "v1",
        name: "Carlos Silva",
        subtitle: "SDR • 35% da meta",
        value: "R$ 12.500",
        status: "critical",
        details: {
          meta: 50000,
          atingido: 12500,
          conversao: "12%",
          atividades: 45,
        },
      },
      {
        id: "v2",
        name: "Ana Martins",
        subtitle: "Closer • 48% da meta",
        value: "R$ 24.000",
        status: "warning",
        details: {
          meta: 50000,
          atingido: 24000,
          conversao: "18%",
          atividades: 32,
        },
      },
    ],
  },
  {
    id: "2",
    type: "stagnant_deals",
    priority: "high",
    title: "Deals Estagnados",
    description: "Sem movimentação há 7+ dias",
    count: 5,
    actionLabel: "Revisar Deals",
    items: [
      {
        id: "d1",
        name: "TechCorp Ltda",
        subtitle: "Proposta • 12 dias parado",
        value: "R$ 45.000",
        status: "warning",
        details: {
          responsavel: "João Pedro",
          ultimaAtividade: "15/01/2026",
          probabilidade: "60%",
        },
      },
      {
        id: "d2",
        name: "InnovateBR",
        subtitle: "Negociação • 9 dias parado",
        value: "R$ 78.000",
        status: "warning",
        details: {
          responsavel: "Maria Santos",
          ultimaAtividade: "18/01/2026",
          probabilidade: "45%",
        },
      },
      {
        id: "d3",
        name: "DataFlow SA",
        subtitle: "Qualificação • 8 dias parado",
        value: "R$ 32.000",
        status: "info",
        details: {
          responsavel: "Pedro Lima",
          ultimaAtividade: "19/01/2026",
          probabilidade: "30%",
        },
      },
    ],
  },
  {
    id: "3",
    type: "inactive_clients",
    priority: "medium",
    title: "Clientes Grandes Sem Contato",
    description: "Follow-up recomendado",
    count: 3,
    actionLabel: "Ver Clientes",
    items: [
      {
        id: "c1",
        name: "MegaCorp Brasil",
        subtitle: "Último contato: 45 dias",
        value: "R$ 250.000 (LTV)",
        status: "warning",
        details: {
          totalCompras: 8,
          ticketMedio: 31250,
          ultimaCompra: "15/11/2025",
        },
      },
      {
        id: "c2",
        name: "GlobalTech",
        subtitle: "Último contato: 30 dias",
        value: "R$ 180.000 (LTV)",
        status: "info",
        details: {
          totalCompras: 5,
          ticketMedio: 36000,
          ultimaCompra: "01/12/2025",
        },
      },
    ],
  },
];

export const AlertsDrilldown: FC<AlertsDrilldownProps> = ({ className }) => {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [selectedItem, setSelectedItem] = useState<AlertItem | null>(null);

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case "underperforming":
        return TrendingDown;
      case "stagnant_deals":
        return Clock;
      case "inactive_clients":
        return UserX;
    }
  };

  const getPriorityColor = (priority: AlertPriority) => {
    switch (priority) {
      case "critical":
        return "bg-destructive/10 border-destructive/20 text-destructive";
      case "high":
        return "bg-warning/10 border-warning/20 text-warning";
      case "medium":
        return "bg-primary/10 border-primary/20 text-primary";
    }
  };

  const getStatusColor = (status: AlertItem["status"]) => {
    switch (status) {
      case "critical":
        return "text-destructive";
      case "warning":
        return "text-warning";
      case "info":
        return "text-primary";
    }
  };

  return (
    <>
      <Card className={cn("glass border-border/40", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Atenção Necessária
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockAlerts.map((alert) => {
            const Icon = getAlertIcon(alert.type);
            return (
              <motion.div
                key={alert.id}
                className={cn(
                  "group p-3 rounded-lg border cursor-pointer transition-all",
                  getPriorityColor(alert.priority),
                  "hover:shadow-md"
                )}
                onClick={() => setSelectedAlert(alert)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        alert.priority === "critical" && "bg-destructive/20",
                        alert.priority === "high" && "bg-warning/20",
                        alert.priority === "medium" && "bg-primary/20"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {alert.count} {alert.title.toLowerCase()}
                      </p>
                      <p className="text-xs opacity-70">{alert.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>

      {/* Alert Drill-down Sheet */}
      <Sheet open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedAlert && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SheetHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-3 rounded-xl",
                      selectedAlert.priority === "critical" && "bg-destructive/20",
                      selectedAlert.priority === "high" && "bg-warning/20",
                      selectedAlert.priority === "medium" && "bg-primary/20"
                    )}
                  >
                    {(() => {
                      const Icon = getAlertIcon(selectedAlert.type);
                      return (
                        <Icon
                          className={cn(
                            "h-6 w-6",
                            selectedAlert.priority === "critical" && "text-destructive",
                            selectedAlert.priority === "high" && "text-warning",
                            selectedAlert.priority === "medium" && "text-primary"
                          )}
                        />
                      );
                    })()}
                  </div>
                  <div>
                    <SheetTitle className="text-xl">{selectedAlert.title}</SheetTitle>
                    <SheetDescription className="flex items-center gap-2 mt-1">
                      <Badge
                        className={cn(
                          selectedAlert.priority === "critical" && "bg-destructive",
                          selectedAlert.priority === "high" && "bg-warning",
                          selectedAlert.priority === "medium" && "bg-primary"
                        )}
                      >
                        {selectedAlert.count} itens
                      </Badge>
                      <span className="text-xs">{selectedAlert.description}</span>
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <ScrollArea className="h-[calc(100vh-200px)] mt-4">
                <div className="space-y-3 pr-4">
                  <AnimatePresence>
                    {selectedAlert.items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "group p-4 rounded-lg border bg-card/50 cursor-pointer",
                          "hover:bg-accent/50 hover:border-border transition-all"
                        )}
                        onClick={() => setSelectedItem(item)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                          </div>
                          <span className={cn("font-bold", getStatusColor(item.status))}>
                            {item.value}
                          </span>
                        </div>

                        {/* Item Details */}
                        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border/50">
                          {Object.entries(item.details).map(([key, value]) => (
                            <div key={key} className="text-xs">
                              <span className="text-muted-foreground capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}:
                              </span>{" "}
                              <span className="font-medium">
                                {typeof value === "number"
                                  ? value.toLocaleString("pt-BR")
                                  : value}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-2 mt-3">
                          {selectedAlert.type === "underperforming" && (
                            <>
                              <Button size="sm" variant="outline" className="flex-1 h-8">
                                <Calendar className="h-3 w-3 mr-1" />
                                Agendar 1:1
                              </Button>
                              <Button size="sm" className="flex-1 h-8">
                                <Activity className="h-3 w-3 mr-1" />
                                Ver Métricas
                              </Button>
                            </>
                          )}
                          {selectedAlert.type === "stagnant_deals" && (
                            <>
                              <Button size="sm" variant="outline" className="flex-1 h-8">
                                <Phone className="h-3 w-3 mr-1" />
                                Ligar
                              </Button>
                              <Button size="sm" className="flex-1 h-8">
                                <Target className="h-3 w-3 mr-1" />
                                Atualizar Deal
                              </Button>
                            </>
                          )}
                          {selectedAlert.type === "inactive_clients" && (
                            <>
                              <Button size="sm" variant="outline" className="flex-1 h-8">
                                <Mail className="h-3 w-3 mr-1" />
                                Email
                              </Button>
                              <Button size="sm" className="flex-1 h-8">
                                <Phone className="h-3 w-3 mr-1" />
                                Ligar
                              </Button>
                            </>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>

              {/* Bulk Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Button variant="outline" className="flex-1">
                  <XCircle className="h-4 w-4 mr-2" />
                  Ignorar Todos
                </Button>
                <Button className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Resolver Todos
                </Button>
              </div>
            </motion.div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
