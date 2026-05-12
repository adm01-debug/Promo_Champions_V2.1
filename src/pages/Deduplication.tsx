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
  const queryClient = useQueryClient();
  const [selectedGroup, setSelectedGroup] = useState<DuplicateGroup | null>(null);
  const [isResolverOpen, setIsResolverOpen] = useState(false);
  const [ignoredKeys, setIgnoredKeys] = useState<Set<string>>(new Set());

  const { data: duplicates, isLoading } = useQuery<DuplicateGroup[]>({
    queryKey: ["deduplication-scan"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name, email, phone, company, total_value")
        .order("name")
        .limit(1000);
      
      if (error) throw error;
      const clients = data || [];
      const groups: DuplicateGroup[] = [];
      const seen = new Set<string>();

      // Exact matches first (Email/Phone)
      const emailMap: Record<string, typeof clients> = {};
      const phoneMap: Record<string, typeof clients> = {};

      clients.forEach((c) => {
        if (c.email) {
          const key = c.email.toLowerCase().trim();
          if (!emailMap[key]) emailMap[key] = [];
          emailMap[key].push(c);
        }
        if (c.phone) {
          const normalized = c.phone.replace(/\D/g, "");
          if (normalized.length >= 8) {
            const key = normalized.slice(-8);
            if (!phoneMap[key]) phoneMap[key] = [];
            phoneMap[key].push(c);
          }
        }
      });

      Object.entries(emailMap).forEach(([email, group]) => {
        if (group.length > 1) {
          groups.push({ key: `email-${email}`, clients: group, similarity: 1, match_type: "email" });
          group.forEach(c => seen.add(c.id));
        }
      });

      Object.entries(phoneMap).forEach(([phone, group]) => {
        if (group.length > 1) {
          const key = `phone-${phone}`;
          if (!groups.some(g => g.key.includes(phone))) {
             groups.push({ key, clients: group, similarity: 0.98, match_type: "phone" });
             group.forEach(c => seen.add(c.id));
          }
        }
      });

      // Fuzzy Name Matching (only for those not already in exact groups)
      const remainingClients = clients.filter(c => !seen.has(c.id));
      for (let i = 0; i < remainingClients.length; i++) {
        for (let j = i + 1; j < remainingClients.length; j++) {
          const sim = nameSimilarity(remainingClients[i].name, remainingClients[j].name);
          if (sim >= 0.88) {
            groups.push({
              key: `fuzzy-${remainingClients[i].id}-${remainingClients[j].id}`,
              clients: [remainingClients[i], remainingClients[j]],
              similarity: Math.round(sim * 100) / 100,
              match_type: "name",
            });
          }
        }
      }

      return groups.sort((a, b) => b.similarity - a.similarity);
    },
    staleTime: 0, // Always fresh
  });

  const mergeMutation = useMutation({
    mutationFn: async ({ targetId, duplicateIds, preferredFields }: { targetId: string; duplicateIds: string[]; preferredFields: Record<string, string> }) => {
      const { error } = await supabase.rpc('merge_clients', {
        target_id: targetId,
        duplicate_ids: duplicateIds,
        preferred_fields: preferredFields
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deduplication-scan"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Registros mesclados com sucesso!");
      setIsResolverOpen(false);
      setSelectedGroup(null);
    },
    onError: (error) => {
      toast.error(`Erro ao mesclar: ${error.message}`);
    }
  });

  const handleOpenMerge = useCallback((group: DuplicateGroup) => {
    setSelectedGroup(group);
    setIsResolverOpen(true);
  }, []);

  const handleDismiss = useCallback((key: string) => {
    setIgnoredKeys(prev => new Set([...prev, key]));
    toast.info("Sugestão ignorada temporariamente");
  }, []);

  const activeDuplicates = useMemo(
    () => (duplicates || []).filter((g) => !ignoredKeys.has(g.key)),
    [duplicates, ignoredKeys]
  );

  const MATCH_COLORS = {
    email: "text-primary border-primary/30 bg-primary/10",
    phone: "text-amber-400 border-amber-400/30 bg-amber-400/10",
    name: "text-blue-400 border-blue-400/30 bg-blue-400/10",
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
