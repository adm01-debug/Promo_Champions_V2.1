import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoveRight, TrendingDown, TrendingUp, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MatrixShift {
  name: string;
  from: "A" | "B" | "C";
  to: "A" | "B" | "C";
  change: number;
  reason: string;
}

interface ABCMatrixShiftProps {
  shifts: MatrixShift[];
}

export function ABCMatrixShift({ shifts }: ABCMatrixShiftProps) {
  const getShiftColor = (from: string, to: string) => {
    if (from > to) return "text-status-success"; // C -> B or B -> A
    if (from < to) return "text-status-error";   // A -> B or B -> C
    return "text-muted-foreground";
  };

  return (
    <Card className="glass border-border/40 overflow-hidden">
      <CardHeader className="border-b border-border/10 bg-muted/5">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <MoveRight className="h-4 w-4 text-primary" />
          Matrix Shift Analytics
          <Badge variant="outline" className="ml-auto text-[10px] border-primary/30 text-primary">
            Últimos 30 dias
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/10">
          {shifts.map((shift, index) => (
            <div key={index} className="p-4 flex items-center justify-between hover:bg-primary/5 transition-colors group">
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-sm group-hover:text-primary transition-colors">{shift.name}</span>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                  <Badge variant="outline" className="h-5 px-1.5">{shift.from}</Badge>
                  <MoveRight className="h-3 w-3" />
                  <Badge className={`h-5 px-1.5 ${
                    shift.to === "A" ? "bg-status-success" : 
                    shift.to === "B" ? "bg-status-warning" : 
                    "bg-status-error"
                  }`}>{shift.to}</Badge>
                  <span className="ml-2 italic normal-case font-medium text-muted-foreground/80">{shift.reason}</span>
                </div>
              </div>
              <div className="text-right">
                <div className={`flex items-center justify-end gap-1 font-bold ${getShiftColor(shift.from, shift.to)}`}>
                  {shift.from > shift.to ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {Math.abs(shift.change)}%
                </div>
                <div className="flex items-center gap-1 text-muted-foreground/60">
                  <AlertCircle className="h-3 w-3" />
                  <span className="text-[10px]">Delta Analítico</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
