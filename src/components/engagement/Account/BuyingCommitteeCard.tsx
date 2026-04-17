import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Crown, Shield, MessageCircle, User, AlertTriangle } from "lucide-react";
import { useAccountContacts } from "@/hooks/engagement/useAccountEngagement";
import { Skeleton } from "@/components/ui/skeleton";

const ROLE_META: Record<string, { label: string; icon: typeof Users; variant: "won" | "qualified" | "info" | "low" | "destructive" }> = {
  champion: { label: "Champion", icon: Crown, variant: "won" },
  decision_maker: { label: "Decisor", icon: Shield, variant: "qualified" },
  influencer: { label: "Influenciador", icon: MessageCircle, variant: "info" },
  user: { label: "Usuário", icon: User, variant: "low" },
  technical: { label: "Técnico", icon: Users, variant: "info" },
  blocker: { label: "Bloqueador", icon: AlertTriangle, variant: "destructive" },
};

const SENIORITY_LABEL: Record<string, string> = {
  c_level: "C-Level", vp: "VP", director: "Diretor", manager: "Gerente", ic: "Colaborador",
};

interface Props {
  accountId: string;
}

export function BuyingCommitteeCard({ accountId }: Props) {
  const { data: contacts = [], isLoading } = useAccountContacts(accountId);

  return (
    <Card variant="modern">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4 text-primary" />
          Buying Committee
          <Badge variant="outline" size="sm" className="ml-auto">{contacts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6 text-center">
            Nenhum contato mapeado nesta conta.
          </div>
        ) : (
          <div className="space-y-2">
            {contacts.map((c) => {
              const role = ROLE_META[c.buying_role as string] ?? ROLE_META.user;
              const Icon = role.icon;
              return (
                <div
                  key={c.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/40 hover:border-primary/30 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{c.name}</span>
                      {c.is_primary && (
                        <Badge variant="info" size="sm">Principal</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {c.job_title ?? "—"} · {SENIORITY_LABEL[c.seniority as string] ?? "—"}
                    </div>
                  </div>
                  <Badge variant={role.variant} size="sm" className="gap-1">
                    <Icon className="h-3 w-3" />
                    {role.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
