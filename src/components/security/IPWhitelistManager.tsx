import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Shield, Plus, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { IPWhitelistTable, type WhitelistedIP } from "./IPWhitelistTable";

const ipSchema = z.object({
  ip_address: z.string().trim().min(7, "IP inválido").max(45, "IP muito longo")
    .regex(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/(?:[0-9]|[1-2][0-9]|3[0-2]))?$|^(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}$/, "Formato de IP inválido. Use IPv4 (ex: 192.168.1.1) ou CIDR (ex: 192.168.1.0/24)"),
  description: z.string().trim().max(500, "Descrição muito longa").optional(),
});

export function IPWhitelistManager() {
  const { isAdmin } = useUserRoles();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newIP, setNewIP] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const { data: whitelistedIPs, isLoading } = useQuery({
    queryKey: ["ip-whitelist"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ip_whitelist").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const addIPMutation = useMutation({
    mutationFn: async ({ ip_address, description }: { ip_address: string; description?: string }) => {
      const { error } = await supabase.from("ip_whitelist").insert({ ip_address, description: description || null });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ip-whitelist"] });
      toast.success("IP adicionado ao whitelist");
      setIsAddDialogOpen(false);
      setNewIP("");
      setNewDescription("");
      setValidationError(null);
    },
    onError: (error: Error & { code?: string }) => {
      console.error("Error adding IP:", error);
      toast.error(error.code === "23505" ? "Este IP já está no whitelist" : "Erro ao adicionar IP");
    },
  });

  const removeIPMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ip_whitelist").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["ip-whitelist"] }); toast.success("IP removido do whitelist"); },
    onError: (error) => { console.error("Error removing IP:", error); toast.error("Erro ao remover IP"); },
  });

  const handleAddIP = () => {
    setValidationError(null);
    const result = ipSchema.safeParse({ ip_address: newIP, description: newDescription });
    if (!result.success) { setValidationError(result.error.errors[0].message); return; }
    addIPMutation.mutate({ ip_address: result.data.ip_address, description: result.data.description });
  };

  if (!isAdmin) {
    return (<Card><CardContent className="flex flex-col items-center justify-center py-12"><Shield className="h-12 w-12 text-muted-foreground mb-4" /><p className="text-muted-foreground">Acesso restrito a administradores</p></CardContent></Card>);
  }

  if (isLoading) {
    return (<Card><CardHeader><Skeleton className="h-6 w-48" /><Skeleton className="h-4 w-64" /></CardHeader><CardContent><div className="space-y-2">{[1, 2, 3].map((i) => (<Skeleton key={i} className="h-12 w-full" />))}</div></CardContent></Card>);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Whitelist de IPs</CardTitle>
              <CardDescription>IPs autorizados a acessar o sistema sem restrições</CardDescription>
            </div>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-2" />Adicionar IP</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar IP ao Whitelist</DialogTitle>
                <DialogDescription>Este IP terá acesso irrestrito ao sistema</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="ip">Endereço IP</Label>
                  <Input id="ip" placeholder="Ex: 192.168.1.1 ou 10.0.0.0/24" value={newIP}
                    onChange={(e) => { setNewIP(e.target.value); setValidationError(null); }}
                    className={validationError ? "border-destructive" : ""} />
                  {validationError && <p className="text-xs text-destructive">{validationError}</p>}
                  <p className="text-xs text-muted-foreground">Suporta IPv4 e notação CIDR (ex: 192.168.1.0/24)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea id="description" placeholder="Ex: Escritório principal, VPN corporativa..." value={newDescription} onChange={(e) => setNewDescription(e.target.value)} maxLength={500} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); setNewIP(""); setNewDescription(""); setValidationError(null); }}>Cancelar</Button>
                <Button onClick={handleAddIP} disabled={!newIP.trim() || addIPMutation.isPending}>{addIPMutation.isPending ? "Adicionando..." : "Adicionar"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {whitelistedIPs && whitelistedIPs.length > 0 ? (
          <IPWhitelistTable whitelistedIPs={whitelistedIPs as WhitelistedIP[]} onRemove={(id) => removeIPMutation.mutate(id)} />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ShieldCheck className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium mb-1">Nenhum IP no whitelist</h3>
            <p className="text-sm text-muted-foreground mb-4">Adicione IPs confiáveis para acesso irrestrito ao sistema</p>
            <Button size="sm" onClick={() => setIsAddDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Adicionar primeiro IP</Button>
          </div>
        )}
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2"><Shield className="h-4 w-4" />Como funciona o Whitelist</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• IPs no whitelist não são afetados por rate limiting</li>
            <li>• Acessos de IPs whitelisted não disparam alertas de segurança</li>
            <li>• Use notação CIDR para whitelistar ranges (ex: 192.168.1.0/24)</li>
            <li>• Recomendado para IPs de escritórios e VPNs corporativas</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
