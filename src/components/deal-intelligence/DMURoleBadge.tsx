import { Badge } from "@/components/ui/badge";
import { dmuRoleIcon, dmuRoleLabel, dmuRoleColor, type DMURole } from "./committeeHelpers";

interface Props {
  role: DMURole;
  size?: "xs" | "sm";
}

export function DMURoleBadge({ role, size = "sm" }: Props) {
  const Icon = dmuRoleIcon(role);
  const cls = dmuRoleColor(role);
  return (
    <Badge variant="outline" className={`gap-1 ${size === "xs" ? "text-[10px] px-1.5 py-0" : "text-xs"}`}>
      <Icon className={`h-3 w-3 ${cls}`} />
      <span>{dmuRoleLabel(role)}</span>
    </Badge>
  );
}
