import React, { useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { PageTransition, itemVariants } from "@/components/transitions/PageTransition";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Flag, Plus, Trash2, Settings2, Users, Percent, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const FeatureFlagsAdmin = () => {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const { flags, isLoading } = useFeatureFlags();

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_enabled }: { id: string; is_enabled: boolean }) => {
      const { error } = await supabase.from("feature_flags").update({ is_enabled, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-flags"] });
      toast.success("Flag atualizada");
    },
  });

  const rolloutMutation = useMutation({
    mutationFn: async ({ id, rollout_percentage }: { id: string; rollout_percentage: number }) => {
      const { error } = await supabase.from("feature_flags").update({ rollout_percentage, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-flags"] });
      toast.success("Rollout atualizado");
    },
  });

  const rolesMutation = useMutation({
    mutationFn: async ({ id, allowed_roles }: { id: string; allowed_roles: string[] }) => {
      const { error } = await supabase.from("feature_flags").update({ allowed_roles, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-flags"] });
      toast.success("Regras de acesso atualizadas");
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!newKey.trim()) throw new Error("Key obrigatória");
      const { error } = await supabase.from("feature_flags").insert({
        key: newKey.trim().toLowerCase().replace(/\s+/g, "_"),
        description: newDesc || null,
        is_enabled: false,
        rollout_percentage: 100,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-flags"] });
      setNewKey("");
      setNewDesc("");
      setShowAdd(false);
      toast.success("Feature flag criada");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("feature_flags").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-flags"] });
      toast.success("Feature flag removida");
    },
  });

  return (
    <>
      <Helmet>
        <title>Feature Flags | Promo Champions</title>
        <meta name="description" content="Gerencie feature flags e rollout progressivo." />
      </Helmet>
      <PageTransition>
        <div className="container max-w-4xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div>
              <h1 className="text-page-title font-display">Feature Flags</h1>
              <p className="text-sm text-muted-foreground mt-1">Controle de funcionalidades com rollout progressivo</p>
            </div>
            <Button onClick={() => setShowAdd(!showAdd)} size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Nova Flag
            </Button>
          </motion.div>

          {showAdd && (
            <motion.div variants={itemVariants}>
              <Card className="p-4 glass border-border/40 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input placeholder="key_da_feature" value={newKey} onChange={(e) => setNewKey(e.target.value)} />
                  <Input placeholder="Descrição (opcional)" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setShowAdd(false)}>Cancelar</Button>
                  <Button size="sm" onClick={() => createMutation.mutate()}>Criar</Button>
                </div>
              </Card>
            </motion.div>
          )}

          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
          ) : !flags?.length ? (
            <Card className="p-8 text-center glass border-border/40">
              <Flag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-display font-semibold">Nenhuma feature flag</p>
            </Card>
          ) : (
            <motion.div variants={itemVariants} className="space-y-3">
              {flags.map((flag) => (
                <Card key={flag.id} className={cn("p-4 glass border-border/40", !flag.is_enabled && "opacity-60")}>
                  <div className="flex items-center gap-4">
                    <div className={cn("p-2 rounded-lg", flag.is_enabled ? "bg-status-success/10" : "bg-muted")}>
                      <Flag className={cn("h-4 w-4", flag.is_enabled ? "text-status-success" : "text-muted-foreground")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono font-semibold">{flag.key}</code>
                        <Badge variant={flag.is_enabled ? "default" : "secondary"} className="text-[10px]">
                          {flag.is_enabled ? "ON" : "OFF"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {flag.description && <p className="text-xs text-muted-foreground mr-2">{flag.description}</p>}
                        {flag.allowed_roles?.map((role: string) => (
                          <Badge key={role} variant="outline" className="text-[9px] py-0 h-4 uppercase">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 min-w-[140px]">
                        <Percent className="h-3 w-3 text-muted-foreground" />
                        <Slider
                          value={[flag.rollout_percentage]}
                          onValueCommit={(v) => rolloutMutation.mutate({ id: flag.id, rollout_percentage: v[0] })}
                          max={100}
                          step={5}
                          className="w-20"
                        />
                        <span className="text-xs font-mono w-8 text-right">{flag.rollout_percentage}%</span>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => {
                                const roles = prompt("Cargos permitidos (separados por vírgula):", flag.allowed_roles?.join(", ") || "");
                                if (roles !== null) {
                                  rolesMutation.mutate({ 
                                    id: flag.id, 
                                    allowed_roles: roles.split(",").map(r => r.trim()).filter(Boolean) 
                                  });
                                }
                              }}
                            >
                              <Users className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Restringir por Cargo</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Switch
                        checked={flag.is_enabled}
                        onCheckedChange={(checked) => toggleMutation.mutate({ id: flag.id, is_enabled: checked })}
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(flag.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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

export default FeatureFlagsAdmin;
