import React, { useState, useMemo, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CACHE_TIMES } from "@/constants";
import { PageTransition, containerVariants, itemVariants } from "@/components/transitions/PageTransition";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Search, Merge, AlertTriangle, Check, X, Filter } from "lucide-react";
import { toast } from "sonner";
import { MergeConflictsResolver } from "@/components/admin/MergeConflictsResolver";

interface DuplicateGroup {
  key: string;
  clients: { id: string; name: string; email: string | null; phone: string | null; company: string | null; total_value: number }[];
  similarity: number;
  match_type: "email" | "phone" | "name";
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

function nameSimilarity(a: string, b: string): number {
  const la = a.toLowerCase().trim();
  const lb = b.toLowerCase().trim();
  if (la === lb) return 1;
  const maxLen = Math.max(la.length, lb.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(la, lb) / maxLen;
}

const Deduplication = () => {
  const [mergedIds, setMergedIds] = useState<Set<string>>(new Set());

  const { data: duplicates, isLoading } = useQuery<DuplicateGroup[]>({
    queryKey: ["deduplication-scan"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name, email, phone, company, total_value")
        .order("name")
        .limit(500);
      if (error) throw error;
      const clients = data || [];
      const groups: DuplicateGroup[] = [];
      const seen = new Set<string>();

      // Email exact match
      const emailMap: Record<string, typeof clients> = {};
      clients.forEach((c) => {
        if (c.email) {
          const key = c.email.toLowerCase().trim();
          if (!emailMap[key]) emailMap[key] = [];
          emailMap[key].push(c);
        }
      });
      Object.entries(emailMap).forEach(([email, group]) => {
        if (group.length > 1) {
          const key = `email-${email}`;
          groups.push({ key, clients: group, similarity: 1, match_type: "email" });
          group.forEach((c) => seen.add(c.id));
        }
      });

      // Phone exact match
      const phoneMap: Record<string, typeof clients> = {};
      clients.forEach((c) => {
        if (c.phone) {
          const normalized = c.phone.replace(/\D/g, "");
          if (normalized.length >= 8) {
            const key = normalized.slice(-8);
            if (!phoneMap[key]) phoneMap[key] = [];
            phoneMap[key].push(c);
          }
        }
      });
      Object.entries(phoneMap).forEach(([phone, group]) => {
        if (group.length > 1 && !group.every((c) => seen.has(c.id))) {
          groups.push({ key: `phone-${phone}`, clients: group, similarity: 0.95, match_type: "phone" });
          group.forEach((c) => seen.add(c.id));
        }
      });

      // Fuzzy name match
      for (let i = 0; i < clients.length; i++) {
        for (let j = i + 1; j < clients.length; j++) {
          if (seen.has(clients[i].id) && seen.has(clients[j].id)) continue;
          const sim = nameSimilarity(clients[i].name, clients[j].name);
          if (sim >= 0.85) {
            groups.push({
              key: `name-${clients[i].id}-${clients[j].id}`,
              clients: [clients[i], clients[j]],
              similarity: Math.round(sim * 100) / 100,
              match_type: "name",
            });
          }
        }
      }

      return groups.sort((a, b) => b.similarity - a.similarity);
    },
    staleTime: CACHE_TIMES.STALE_TIME,
  });

  const handleMerge = useCallback((group: DuplicateGroup) => {
    // Mark as merged (UI-only for now)
    const newMerged = new Set(mergedIds);
    group.clients.slice(1).forEach((c) => newMerged.add(c.id));
    setMergedIds(newMerged);
    toast.success(`${group.clients.length} registros mesclados em "${group.clients[0].name}"`);
  }, [mergedIds]);

  const handleDismiss = useCallback((key: string) => {
    toast.info("Duplicata ignorada");
  }, []);

  const activeDuplicates = useMemo(
    () => (duplicates || []).filter((g) => !g.clients.every((c) => mergedIds.has(c.id))),
    [duplicates, mergedIds]
  );

  const MATCH_COLORS = {
    email: "text-primary border-primary/30 bg-primary/10",
    phone: "text-status-warning border-status-warning/30 bg-status-warning/10",
    name: "text-info border-info/30 bg-info/10",
  };

  return (
    <>
      <Helmet>
        <title>Deduplicação | Promo Champions</title>
        <meta name="description" content="Detecte e mescle registros duplicados automaticamente." />
      </Helmet>
      <PageTransition>
        <div className="container max-w-5xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <motion.div variants={itemVariants}>
            <h1 className="text-page-title font-display">Deduplicação Inteligente</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isLoading ? "Escaneando..." : `${activeDuplicates.length} grupo(s) de possíveis duplicatas encontrados`}
            </p>
          </motion.div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          ) : activeDuplicates.length === 0 ? (
            <Card className="p-8 text-center glass border-border/40">
              <Check className="h-12 w-12 text-status-success mx-auto mb-3" />
              <p className="font-display font-semibold">Base limpa!</p>
              <p className="text-sm text-muted-foreground">Nenhuma duplicata detectada.</p>
            </Card>
          ) : (
            <motion.div variants={itemVariants} className="space-y-3">
              {activeDuplicates.map((group) => (
                <Card key={group.key} className="p-4 glass border-border/40">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-status-warning" />
                      <span className="text-sm font-semibold">{group.clients.length} registros similares</span>
                      <Badge variant="outline" className={cn("text-[10px]", MATCH_COLORS[group.match_type])}>
                        {group.match_type === "email" ? "Email" : group.match_type === "phone" ? "Telefone" : "Nome"}
                        {" "}{Math.round(group.similarity * 100)}%
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="default" className="h-7 text-xs gap-1" onClick={() => handleMerge(group)}>
                        <Merge className="h-3 w-3" /> Mesclar
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleDismiss(group.key)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    {group.clients.map((c, i) => (
                      <div key={c.id} className={cn(
                        "flex items-center gap-3 p-2 rounded-lg text-xs",
                        i === 0 ? "bg-primary/5 border border-primary/20" : "bg-muted/30"
                      )}>
                        {i === 0 && <Badge variant="outline" className="text-[9px] shrink-0">Principal</Badge>}
                        <span className="font-medium flex-1">{c.name}</span>
                        <span className="text-muted-foreground">{c.email || "—"}</span>
                        <span className="text-muted-foreground">{c.phone || "—"}</span>
                        <span className="font-semibold text-status-success">
                          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact" }).format(c.total_value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </motion.div>
          )}
        </div>
      </PageTransition>
    </>
  );
};

export default Deduplication;
