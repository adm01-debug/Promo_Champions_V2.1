import { Badge } from "@/components/ui/badge";
import { Gauge, TrendingUp, Clock, AlertTriangle } from "lucide-react";
import { velocityStatusColor, velocityStatusLabel, type VelocityStatus } from "./velocityHelpers";

const Icon = ({ s }: { s: VelocityStatus }) => {
  if (s === "ahead") return <TrendingUp className="h-3 w-3" />;
  if (s === "on_track") return <Gauge className="h-3 w-3" />;
  if (s === "slow") return <Clock className="h-3 w-3" />;
  return <AlertTriangle className="h-3 w-3" />;
};

export function VelocityStatusBadge({ status, className = "" }: { status: VelocityStatus; className?: string }) {
  return (
    <Badge variant="outline" className={`gap-1 text-[10px] font-medium ${velocityStatusColor(status)} ${className}`}>
      <Icon s={status} />
      {velocityStatusLabel(status)}
    </Badge>
  );
}
