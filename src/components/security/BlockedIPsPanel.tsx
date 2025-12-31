import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { useBlockedIPs } from "@/hooks/useIPBlocking";
import { ShieldOff, ShieldPlus, Trash2, Clock, AlertTriangle, Ban } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { z } from "zod";
import { toast } from "sonner";

const ipSchema = z.string().regex(
  /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  "IP inválido"
);

export function BlockedIPsPanel() {
  const { blockedIPs, activeBlockedIPs, isLoading, blockIP, unblockIP, isBlocking } = useBlockedIPs();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newIP, setNewIP] = useState("");
  const [reason, setReason] = useState("");
  const [isPermanent, setIsPermanent] = useState(false);
  const [expiresIn, setExpiresIn] = useState("24"); // horas

  const handleBlockIP = () => {
    try {
      ipSchema.parse(newIP);
    } catch {
      toast.error("Endereço IP inválido");
      return;
    }

    if (!reason.trim()) {
      toast.error("Informe o motivo do bloqueio");
      return;
    }

    const expiresAt = isPermanent
      ? undefined
      : new Date(Date.now() + parseInt(expiresIn) * 60 * 60 * 1000).toISOString();

    blockIP({
      ip_address: newIP,
      reason: reason.trim(),
      expires_at: expiresAt,
      is_permanent: isPermanent,
    });

    setDialogOpen(false);
    setNewIP("");
    setReason("");
    setIsPermanent(false);
    setExpiresIn("24");
  };

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-red-500" />
              IPs Bloqueados
            </CardTitle>
            <CardDescription>
              {activeBlockedIPs?.length ?? 0} IPs ativamente bloqueados
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <ShieldPlus className="h-4 w-4 mr-2" />
                Bloquear IP
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bloquear IP</DialogTitle>
                <DialogDescription>
                  O IP será bloqueado e não poderá acessar o sistema
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Endereço IP</Label>
                  <Input
                    placeholder="192.168.1.1"
                    value={newIP}
                    onChange={(e) => setNewIP(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Motivo do Bloqueio</Label>
                  <Textarea
                    placeholder="Tentativas de acesso não autorizado..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Bloqueio Permanente</Label>
                    <p className="text-xs text-muted-foreground">O IP ficará bloqueado indefinidamente</p>
                  </div>
                  <Switch checked={isPermanent} onCheckedChange={setIsPermanent} />
                </div>
                {!isPermanent && (
                  <div className="space-y-2">
                    <Label>Expira em (horas)</Label>
                    <Input
                      type="number"
                      value={expiresIn}
                      onChange={(e) => setExpiresIn(e.target.value)}
                      min="1"
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleBlockIP} disabled={isBlocking}>
                  Bloquear
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>IP</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>Bloqueado em</TableHead>
              <TableHead>Expira</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blockedIPs?.map((ip) => {
              const isExpired = !ip.is_permanent && ip.expires_at && new Date(ip.expires_at) < new Date();
              return (
                <TableRow key={ip.id} className={isExpired ? "opacity-50" : ""}>
                  <TableCell className="font-mono">{ip.ip_address}</TableCell>
                  <TableCell className="max-w-48 truncate">{ip.reason}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(ip.blocked_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    {ip.is_permanent ? (
                      <Badge variant="destructive">Permanente</Badge>
                    ) : ip.expires_at ? (
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(ip.expires_at), { locale: ptBR, addSuffix: true })}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={isExpired ? "secondary" : "destructive"}>
                      {isExpired ? "Expirado" : "Bloqueado"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <ShieldOff className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Desbloquear IP?</AlertDialogTitle>
                          <AlertDialogDescription>
                            O IP {ip.ip_address} poderá acessar o sistema novamente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => unblockIP(ip.id)}>
                            Desbloquear
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              );
            })}
            {(!blockedIPs || blockedIPs.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Nenhum IP bloqueado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
