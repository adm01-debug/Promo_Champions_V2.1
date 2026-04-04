import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Fuse from "fuse.js";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { KeyRound, Check, Clock, Search, Shield, AlertTriangle, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { PasswordResetRequestList } from "./password/PasswordResetRequestList";

interface PasswordResetRequest {
  id: string; user_email: string; user_id: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'expired';
  requested_at: string; reviewed_at: string | null; reviewed_by: string | null;
  rejection_reason: string | null; expires_at: string; ip_address: string | null; user_agent: string | null;
}

export function PasswordResetApproval() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PasswordResetRequest | null>(null);
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ["password-reset-requests"],
    queryFn: async () => { const { data, error } = await supabase.from("password_reset_requests").select("*").order("requested_at", { ascending: false }); if (error) throw error; return data as PasswordResetRequest[]; },
    refetchInterval: 30000,
  });

  const approveMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error: updateError } = await supabase.from("password_reset_requests").update({ status: "approved", reviewed_at: new Date().toISOString(), reviewed_by: user?.id }).eq("id", requestId);
      if (updateError) throw updateError;
      const request = requests?.find(r => r.id === requestId);
      if (request) { const { error: fnError } = await supabase.functions.invoke("send-password-reset", { body: { email: request.user_email, requestId } }); if (fnError) throw fnError; }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["password-reset-requests"] }); toast.success("Solicitação aprovada! Email de reset enviado."); },
    onError: (error: Error) => { toast.error("Erro ao aprovar: " + error.message); },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("password_reset_requests").update({ status: "rejected", reviewed_at: new Date().toISOString(), reviewed_by: user?.id, rejection_reason: reason }).eq("id", requestId);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["password-reset-requests"] }); toast.success("Solicitação rejeitada."); setRejectDialogOpen(false); setRejectionReason(""); setSelectedRequest(null); },
    onError: (error: Error) => { toast.error("Erro ao rejeitar: " + error.message); },
  });

  const pendingRequests = requests?.filter(r => r.status === "pending") || [];
  const approvedRequests = requests?.filter(r => r.status === "approved") || [];
  const rejectedRequests = requests?.filter(r => r.status === "rejected") || [];

  const fuse = useMemo(() => {
    if (!requests || requests.length === 0) return null;
    return new Fuse(requests, { keys: ['user_email', 'ip_address'], threshold: 0.4, ignoreLocation: true, minMatchCharLength: 1 });
  }, [requests]);

  const filteredRequests = useMemo(() => {
    if (!requests) return [];
    let filtered = searchTerm.trim() && fuse ? fuse.search(searchTerm).map(r => r.item) : requests;
    if (statusFilter !== "all") filtered = filtered.filter(r => r.status === statusFilter);
    return filtered;
  }, [requests, fuse, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="outline" className="bg-rank-gold/10 text-rank-gold border-rank-gold/30"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case "approved": return <Badge variant="outline" className="bg-success/10 text-success border-success/30"><CheckCircle className="h-3 w-3 mr-1" />Aprovado</Badge>;
      case "rejected": return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30"><XCircle className="h-3 w-3 mr-1" />Rejeitado</Badge>;
      case "completed": return <Badge variant="outline" className="bg-info/10 text-info border-info/30"><Check className="h-3 w-3 mr-1" />Concluído</Badge>;
      case "expired": return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Expirado</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Pendentes", value: pendingRequests.length, icon: Clock, color: "amber" },
          { label: "Aprovados", value: approvedRequests.length, icon: CheckCircle, color: "emerald" },
          { label: "Rejeitados", value: rejectedRequests.length, icon: XCircle, color: "destructive" },
          { label: "Total", value: requests?.length || 0, icon: KeyRound, color: "primary" },
        ].map(({ label, value, icon: Icon, color }) => {
          const isDestructive = color === "destructive";
          const isPrimary = color === "primary";
          return (
            <Card key={label} className={`bg-gradient-to-br ${isDestructive ? 'from-destructive/10 to-destructive/5 border-destructive/20' : isPrimary ? 'from-primary/10 to-primary/5 border-primary/20' : `from-${color}-500/10 to-${color}-600/5 border-${color}-500/20`}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm text-muted-foreground">{label}</p><p className={`text-2xl font-bold ${isDestructive ? 'text-destructive' : isPrimary ? 'text-primary' : `text-${color}-600`}`}>{value}</p></div>
                  <div className={`p-3 rounded-full ${isDestructive ? 'bg-destructive/10' : isPrimary ? 'bg-primary/10' : `bg-${color}-500/10`}`}><Icon className={`h-6 w-6 ${isDestructive ? 'text-destructive' : isPrimary ? 'text-primary' : `text-${color}-600`}`} /></div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {pendingRequests.length > 0 && (
        <Card className="border-rank-gold/50 bg-rank-gold/5"><CardContent className="pt-6"><div className="flex items-center gap-3"><AlertTriangle className="h-5 w-5 text-rank-gold" /><span className="text-rank-gold dark:text-rank-gold">Você tem <strong>{pendingRequests.length}</strong> solicitação(ões) de reset de senha aguardando aprovação.</span></div></CardContent></Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10"><Shield className="h-5 w-5 text-primary" /></div>
              <div><CardTitle>Solicitações de Reset de Senha</CardTitle><CardDescription>Aprove ou rejeite solicitações de recuperação de senha</CardDescription></div>
            </div>
            <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ["password-reset-requests"] })}><RefreshCw className="h-4 w-4 mr-2" />Atualizar</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar por email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" /></div>
            <div className="flex gap-2">
              {["all", "pending", "approved", "rejected"].map(s => (
                <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s)}>
                  {s === "all" ? "Todos" : s === "pending" ? "Pendentes" : s === "approved" ? "Aprovados" : "Rejeitados"}
                </Button>
              ))}
            </div>
          </div>
          <PasswordResetRequestList
            filteredRequests={filteredRequests}
            isExpired={isExpired}
            getStatusBadge={getStatusBadge}
            approveMutation={approveMutation}
            rejectDialogOpen={rejectDialogOpen}
            setRejectDialogOpen={setRejectDialogOpen}
            selectedRequest={selectedRequest}
            setSelectedRequest={setSelectedRequest}
            rejectionReason={rejectionReason}
            setRejectionReason={setRejectionReason}
            rejectMutation={rejectMutation}
          />
        </CardContent>
      </Card>
    </div>
  );
}
