import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

const recentDeals = [
  { client: "Tech Corp", value: 15000, status: "won" },
  { client: "StartUp XYZ", value: 8500, status: "pending" },
  { client: "Corp ABC", value: 22000, status: "won" },
];

export const RecentDeals = () => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Recentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {recentDeals.map((deal, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{deal.client}</p>
              <p className="text-xs text-muted-foreground">
                R$ {deal.value.toLocaleString("pt-BR")}
              </p>
            </div>
            <Badge
              variant="outline"
              className={
                deal.status === "won"
                  ? "bg-success/10 text-success border-success/30"
                  : "bg-warning/10 text-warning border-warning/30"
              }
            >
              {deal.status === "won" ? "Ganho" : "Pendente"}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
