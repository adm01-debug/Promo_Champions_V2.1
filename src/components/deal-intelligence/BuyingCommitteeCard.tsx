import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Sparkles, Users, AlertTriangle, RefreshCw } from "lucide-react";
import { useDealStakeholders, useDeleteStakeholder, useExtractStakeholders, type DealStakeholder } from "@/hooks/deal-intelligence/useDealStakeholders";
import { useCommitteeCoverage, useRecalculateCoverage } from "@/hooks/deal-intelligence/useCommitteeCoverage";
import { CommitteeCoverageRing } from "./CommitteeCoverageRing";
import { StakeholderListItem } from "./StakeholderListItem";
import { StakeholderFormDialog } from "./StakeholderFormDialog";
import { dmuRoleLabel, tierBadgeClass, tierLabel, type DMURole } from "./committeeHelpers";

interface Props {
  saleId: string;
  ownerId: string;
  latestRecordingId?: string | null;
}

const ROLE_ORDER: DMURole[] = ["decision_maker", "economic_buyer", "champion", "influencer", "user", "blocker", "unknown"];

export function BuyingCommitteeCard({ saleId, ownerId, latestRecordingId }: Props) {
  const { data: stakeholders, isLoading } = useDealStakeholders(saleId);
  const { data: coverage } = useCommitteeCoverage(saleId);
  const del = useDeleteStakeholder();
  const extract = useExtractStakeholders();
  const recalc = useRecalculateCoverage();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DealStakeholder | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<DMURole, DealStakeholder[]>();
    (stakeholders || []).forEach((s) => {
      const list = map.get(s.dmu_role) || [];
      list.push(s);
      map.set(s.dmu_role, list);
    });
    return ROLE_ORDER.filter((r) => map.has(r)).map((r) => ({ role: r, items: map.get(r)! }));
  }, [stakeholders]);

  const handleEdit = (s: DealStakeholder) => { setEditing(s); setDialogOpen(true); };
  const handleNew = () => { setEditing(null); setDialogOpen(true); };
  const handleDelete = (id: string) => del.mutate({ id, sale_id: saleId });

  return (
    <Card variant="elevated" className="glass border-border/40 dark:border-glow card-elevated animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="gradient-text">Comitê de Compra (DMU)</span>
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0"
            onClick={() => recalc.mutate(saleId)} disabled={recalc.isPending}
            aria-label="Recalcular cobertura">
            <RefreshCw className={`h-3.5 w-3.5 ${recalc.isPending ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Coverage header */}
        <div className="flex items-center gap-4">
          <CommitteeCoverageRing
            score={coverage?.coverage_score ?? 0}
            tier={coverage?.tier ?? "weak"}
          />
          <div className="flex-1 space-y-1">
            <Badge variant="outline" className={tierBadgeClass(coverage?.tier ?? "weak")}>
              {tierLabel(coverage?.tier ?? "weak")}
            </Badge>
            <p className="text-xs text-muted-foreground">
              {coverage?.stakeholder_count ?? stakeholders?.length ?? 0} stakeholder(s) mapeado(s)
            </p>
            {(coverage?.gaps?.length ?? 0) > 0 && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400">
                Falta: {coverage!.gaps.map((g) => dmuRoleLabel(g as DMURole)).join(", ")}
              </p>
            )}
          </div>
        </div>

        {/* Risks */}
        {(coverage?.risks?.length ?? 0) > 0 && (
          <div className="space-y-1">
            {coverage!.risks.map((r, i) => (
              <div key={i} className="flex items-start gap-1.5 text-[11px] text-destructive p-2 rounded-md bg-destructive/5 border border-destructive/20">
                <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                <span>{r}</span>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={handleNew} className="gap-1">
            <Plus className="h-3.5 w-3.5" /> Adicionar
          </Button>
          {latestRecordingId && (
            <Button size="sm" variant="outline" onClick={() => extract.mutate({ recording_id: latestRecordingId })}
              disabled={extract.isPending} className="gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              {extract.isPending ? "Extraindo..." : "Extrair da última call"}
            </Button>
          )}
        </div>

        {/* Stakeholder list grouped */}
        {isLoading ? (
          <div className="space-y-2"><Skeleton className="h-16" /><Skeleton className="h-16" /></div>
        ) : grouped.length === 0 ? (
          <div className="text-center py-6 border border-dashed rounded-lg">
            <p className="text-sm text-muted-foreground">Nenhum stakeholder mapeado.</p>
            <p className="text-xs text-muted-foreground mt-1">Adicione manualmente ou extraia de uma call.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {grouped.map(({ role, items }) => (
              <div key={role}>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                  {dmuRoleLabel(role)} ({items.length})
                </p>
                <div className="space-y-1.5">
                  {items.map((s) => (
                    <StakeholderListItem key={s.id} stakeholder={s} onEdit={handleEdit} onDelete={handleDelete} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <StakeholderFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        saleId={saleId}
        ownerId={ownerId}
        initial={editing}
      />
    </Card>
  );
}
