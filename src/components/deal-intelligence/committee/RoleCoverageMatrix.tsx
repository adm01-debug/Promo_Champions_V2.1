import { useDealStakeholders } from "@/hooks/deal-intelligence/useDealStakeholders";
import { dmuRoleIcon, dmuRoleLabel, dmuRoleColor, type DMURole } from "../committeeHelpers";
import { Check, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

const ROLES: DMURole[] = ["decision_maker", "economic_buyer", "champion", "influencer", "user", "blocker"];

interface Props {
  saleId: string;
}

export function RoleCoverageMatrix({ saleId }: Props) {
  const { data: stakeholders, isLoading } = useDealStakeholders(saleId);

  if (isLoading) return <Skeleton className="h-24 w-full" />;
  const list = stakeholders ?? [];

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground">Cobertura por papel DMU</div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {ROLES.map((role) => {
            const matches = list.filter((s) => s.dmu_role === role);
            const has = matches.length > 0;
            const Icon = dmuRoleIcon(role);
            const colorCls = dmuRoleColor(role);
            const names = matches.map((m) => m.name).join(", ");
            return (
              <Tooltip key={role}>
                <TooltipTrigger asChild>
                  <div
                    className={`relative flex flex-col items-center gap-1 rounded-lg border p-2 transition-colors ${
                      has ? "border-emerald-500/30 bg-emerald-500/5" : "border-dashed border-border bg-muted/20"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${has ? colorCls : "text-muted-foreground/50"}`} />
                    <span className={`text-[10px] text-center leading-tight ${has ? "font-medium" : "text-muted-foreground"}`}>
                      {dmuRoleLabel(role)}
                    </span>
                    <span
                      className={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] ${
                        has ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {has ? matches.length > 1 ? matches.length : <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {has ? names : `Nenhum ${dmuRoleLabel(role).toLowerCase()} mapeado`}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
