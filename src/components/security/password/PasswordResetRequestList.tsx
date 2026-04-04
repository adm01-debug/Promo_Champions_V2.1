import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { KeyRound, Check, X, Clock, Search, Mail, Shield, AlertTriangle, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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

interface RequestListProps {
  filteredRequests: PasswordResetRequest[];
  isExpired: (expiresAt: string) => boolean;
  getStatusBadge: (status: string) => React.ReactNode;
  approveMutation: { mutate: (id: string) => void };
  rejectDialogOpen: boolean;
  setRejectDialogOpen: (open: boolean) => void;
  selectedRequest: PasswordResetRequest | null;
  setSelectedRequest: (req: PasswordResetRequest | null) => void;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  rejectMutation: { mutate: (params: { requestId: string; reason: string }) => void };
}

export const PasswordResetRequestList = React.memo(function PasswordResetRequestList({
  filteredRequests, isExpired, getStatusBadge, approveMutation,
  rejectDialogOpen, setRejectDialogOpen, selectedRequest, setSelectedRequest,
  rejectionReason, setRejectionReason, rejectMutation,
}: RequestListProps) {
  if (filteredRequests.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Nenhuma solicitação encontrada</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-3">
        {filteredRequests.map((request) => (
          <div key={request.id} className={`p-4 rounded-lg border transition-colors ${request.status === "pending" && !isExpired(request.expires_at) ? "bg-rank-gold/5 border-rank-gold/20" : "bg-muted/30 border-border"}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{request.user_email}</span>
                  {getStatusBadge(isExpired(request.expires_at) && request.status === "pending" ? "expired" : request.status)}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                  <div><span className="text-xs uppercase tracking-wide">Solicitado</span><p className="font-medium text-foreground">{formatDistanceToNow(new Date(request.requested_at), { addSuffix: true, locale: ptBR })}</p></div>
                  <div><span className="text-xs uppercase tracking-wide">Expira</span><p className={`font-medium ${isExpired(request.expires_at) ? "text-destructive" : "text-foreground"}`}>{formatDistanceToNow(new Date(request.expires_at), { addSuffix: true, locale: ptBR })}</p></div>
                  {request.ip_address && <div><span className="text-xs uppercase tracking-wide">IP</span><p className="font-mono text-foreground">{request.ip_address}</p></div>}
                  {request.rejection_reason && <div className="col-span-2"><span className="text-xs uppercase tracking-wide">Motivo da Rejeição</span><p className="text-destructive">{request.rejection_reason}</p></div>}
                </div>
              </div>
              {request.status === "pending" && !isExpired(request.expires_at) && (
                <div className="flex gap-2 ml-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button size="sm" variant="default" className="bg-success hover:bg-success/90"><Check className="h-4 w-4 mr-1" />Aprovar</Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Aprovar Reset de Senha?</AlertDialogTitle><AlertDialogDescription>Um email de reset de senha será enviado para <strong>{request.user_email}</strong>.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => approveMutation.mutate(request.id)} className="bg-success hover:bg-success/90">Aprovar e Enviar Email</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Dialog open={rejectDialogOpen && selectedRequest?.id === request.id} onOpenChange={(open) => { setRejectDialogOpen(open); if (!open) { setSelectedRequest(null); setRejectionReason(""); } }}>
                    <DialogTrigger asChild><Button size="sm" variant="destructive" onClick={() => setSelectedRequest(request)}><X className="h-4 w-4 mr-1" />Rejeitar</Button></DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Rejeitar Solicitação</DialogTitle><DialogDescription>Informe o motivo da rejeição para <strong>{request.user_email}</strong>.</DialogDescription></DialogHeader>
                      <div className="space-y-4 py-4"><div className="space-y-2"><Label htmlFor="reason">Motivo da Rejeição</Label><Textarea id="reason" placeholder="Ex: Email não corresponde a nenhum usuário cadastrado..." value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={3} /></div></div>
                      <DialogFooter><Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancelar</Button><Button variant="destructive" onClick={() => rejectMutation.mutate({ requestId: request.id, reason: rejectionReason })} disabled={!rejectionReason.trim()}>Rejeitar Solicitação</Button></DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
});
