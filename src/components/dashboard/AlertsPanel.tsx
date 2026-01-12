import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Bell } from "lucide-react";

const alerts = [
  { type: "warning", message: "3 deals sem atividade há 5+ dias" },
  { type: "info", message: "Meta 85% atingida" },
];

export const AlertsPanel = () => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          Alertas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.length > 0 ? (
          alerts.map((alert, index) => (
            <div
              key={index}
              className={`flex items-start gap-2 p-2 rounded-lg ${
                alert.type === "warning"
                  ? "bg-warning/10 border border-warning/20"
                  : "bg-primary/10 border border-primary/20"
              }`}
            >
              <AlertTriangle
                className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                  alert.type === "warning" ? "text-warning" : "text-primary"
                }`}
              />
              <p className="text-xs">{alert.message}</p>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">
            Nenhum alerta no momento
          </p>
        )}
      </CardContent>
    </Card>
  );
};
