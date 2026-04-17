import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame } from "lucide-react";
import { useEngagementLeaderboard } from "@/hooks/engagement/useEngagementScore";
import { EngagementScoreBadge } from "./EngagementScoreBadge";

interface Props {
  limit?: number;
}

export function EngagementLeaderboardWidget({ limit = 10 }: Props) {
  const { data, isLoading } = useEngagementLeaderboard(limit);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Flame className="h-4 w-4 text-destructive" />
          Top Contatos Quentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (data?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhum contato com engajamento recente
          </p>
        ) : (
          <ul className="space-y-1.5">
            {data?.map((entry, idx) => (
              <li
                key={entry.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent/40 transition-colors"
              >
                <span className="text-xs font-mono text-muted-foreground w-5 text-right">
                  {idx + 1}.
                </span>
                <span className="text-sm flex-1 truncate font-medium">
                  {entry.contact_name ?? "Sem nome"}
                </span>
                <span className="text-[10px] text-muted-foreground capitalize">
                  {entry.contact_type === "lead" ? "Lead" : "Cliente"}
                </span>
                <EngagementScoreBadge score={entry.score} tier={entry.tier} size="sm" />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
