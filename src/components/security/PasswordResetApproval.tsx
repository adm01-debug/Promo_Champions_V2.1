import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Fuse from "fuse.js";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { 
  KeyRound, 
  Check, 
  X, 
  Clock, 
  Search,
  Mail,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PasswordResetRequest {
  id: string;
  user_email: string;
  user_id: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'expired';
  requested_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  rejection_reason: string | null;
  expires_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

export function PasswordResetApproval() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PasswordResetRequest | null>(null);
  const queryClient = useQueryClient();

  // Buscar solicitações
  const { data: requests, isLoading } = useQuery({
    queryKey: ["password-reset-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("password_reset_requests")
        .select("*")
        .order("requested_at", { ascending: false });

      if (error) throw error;
      return data as PasswordResetRequest[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Aprovar solicitação
  const approveMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Atualizar status
      const { error: updateError } = await supabase
        .from("password_reset_requests")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
        })
        .eq("id", requestId);

      if (updateError) throw updateError;

      // Chamar edge function para enviar email de reset
      const request = requests?.find(r => r.id === requestId);
      if (request) {
        const { error: fnError } = await supabase.functions.invoke("send-password-reset", {
          body: { email: request.user_email, requestId },
        });
        
        if (fnError) throw fnError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["password-reset-requests"] });
      toast.success("Solicitação aprovada! Email de reset enviado.");
    },
    onError: (error: Error) => {
      toast.error("Erro ao aprovar: " + error.message);
    },
  });

  // Rejeitar solicitação
  const rejectMutation = useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("password_reset_requests")
        .update({
          status: "rejected",
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          rejection_reason: reason,
        })
        .eq("id", requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["password-reset-requests"] });
      toast.success("Solicitação rejeitada.");
      setRejectDialogOpen(false);
      setRejectionReason("");
      setSelectedRequest(null);
    },
    onError: (error: Error) => {
      toast.error("Erro ao rejeitar: " + error.message);
    },
  });

  const pendingRequests = requests?.filter(r => r.status === "pending") || [];
  const approvedRequests = requests?.filter(r => r.status === "approved") || [];
  const rejectedRequests = requests?.filter(r => r.status === "rejected") || [];

  // Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    if (!requests || requests.length === 0) return null;
    return new Fuse(requests, {
      keys: ['user_email', 'ip_address'],
      threshold: 0.4,
      ignoreLocation: true,
      minMatchCharLength: 1,
    });
  }, [requests]);

  const filteredRequests = useMemo(() => {
    if (!requests) return [];
    
    let filtered = searchTerm.trim() && fuse
      ? fuse.search(searchTerm).map(result => result.item)
      : requests;
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    
    return filtered;
  }, [requests, fuse, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30"><CheckCircle className="h-3 w-3 mr-1" />Aprovado</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30"><XCircle className="h-3 w-3 mr-1" />Rejeitado</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30"><Check className="h-3 w-3 mr-1" />Concluído</Badge>;
      case "expired":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Expirado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-amber-600">{pendingRequests.length}</p>
              </div>
              <div className="p-3 rounded-full bg-amber-500/10">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aprovados</p>
                <p className="text-2xl font-bold text-emerald-600">{approvedRequests.length}</p>
              </div>
              <div className="p-3 rounded-full bg-emerald-500/10">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejeitados</p>
                <p className="text-2xl font-bold text-destructive">{rejectedRequests.length}</p>
              </div>
              <div className="p-3 rounded-full bg-destructive/10">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-primary">{requests?.length || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <KeyRound className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerta para pendentes */}
      {pendingRequests.length > 0 && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <span className="text-amber-700 dark:text-amber-400">
                Você tem <strong>{pendingRequests.length}</strong> solicitação(ões) de reset de senha aguardando aprovação.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Solicitações de Reset de Senha</CardTitle>
                <CardDescription>
                  Aprove ou rejeite solicitações de recuperação de senha
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["password-reset-requests"] })}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
              >
                Todos
              </Button>
              <Button
                variant={statusFilter === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("pending")}
              >
                Pendentes
              </Button>
              <Button
                variant={statusFilter === "approved" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("approved")}
              >
                Aprovados
              </Button>
              <Button
                variant={statusFilter === "rejected" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("rejected")}
              >
                Rejeitados
              </Button>
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma solicitação encontrada</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      request.status === "pending" && !isExpired(request.expires_at)
                        ? "bg-amber-500/5 border-amber-500/20"
                        : "bg-muted/30 border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{request.user_email}</span>
                          {getStatusBadge(isExpired(request.expires_at) && request.status === "pending" ? "expired" : request.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="text-xs uppercase tracking-wide">Solicitado</span>
                            <p className="font-medium text-foreground">
                              {formatDistanceToNow(new Date(request.requested_at), { 
                                addSuffix: true, 
                                locale: ptBR 
                              })}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs uppercase tracking-wide">Expira</span>
                            <p className={`font-medium ${isExpired(request.expires_at) ? "text-destructive" : "text-foreground"}`}>
                              {formatDistanceToNow(new Date(request.expires_at), { 
                                addSuffix: true, 
                                locale: ptBR 
                              })}
                            </p>
                          </div>
                          {request.ip_address && (
                            <div>
                              <span className="text-xs uppercase tracking-wide">IP</span>
                              <p className="font-mono text-foreground">{request.ip_address}</p>
                            </div>
                          )}
                          {request.rejection_reason && (
                            <div className="col-span-2">
                              <span className="text-xs uppercase tracking-wide">Motivo da Rejeição</span>
                              <p className="text-destructive">{request.rejection_reason}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {request.status === "pending" && !isExpired(request.expires_at) && (
                        <div className="flex gap-2 ml-4">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="default" className="bg-emerald-600 hover:bg-emerald-700">
                                <Check className="h-4 w-4 mr-1" />
                                Aprovar
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Aprovar Reset de Senha?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Um email de reset de senha será enviado para <strong>{request.user_email}</strong>.
                                  O usuário poderá definir uma nova senha.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => approveMutation.mutate(request.id)}
                                  className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                  Aprovar e Enviar Email
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <Dialog open={rejectDialogOpen && selectedRequest?.id === request.id} onOpenChange={(open) => {
                            setRejectDialogOpen(open);
                            if (!open) {
                              setSelectedRequest(null);
                              setRejectionReason("");
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => setSelectedRequest(request)}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Rejeitar
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Rejeitar Solicitação</DialogTitle>
                                <DialogDescription>
                                  Informe o motivo da rejeição para <strong>{request.user_email}</strong>.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="reason">Motivo da Rejeição</Label>
                                  <Textarea
                                    id="reason"
                                    placeholder="Ex: Email não corresponde a nenhum usuário cadastrado..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    rows={3}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                                  Cancelar
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => rejectMutation.mutate({ 
                                    requestId: request.id, 
                                    reason: rejectionReason 
                                  })}
                                  disabled={!rejectionReason.trim()}
                                >
                                  Rejeitar Solicitação
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
