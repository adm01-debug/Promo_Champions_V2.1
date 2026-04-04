import React from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Globe, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WhitelistedIP {
  id: string;
  ip_address: string;
  description: string | null;
  added_by: string | null;
  created_at: string;
  updated_at: string;
}

interface IPWhitelistTableProps {
  whitelistedIPs: WhitelistedIP[];
  onRemove: (id: string) => void;
}

export const IPWhitelistTable = React.memo(function IPWhitelistTable({ whitelistedIPs, onRemove }: IPWhitelistTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Endereço IP</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Adicionado em</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {whitelistedIPs.map((ip) => (
            <TableRow key={ip.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{ip.ip_address}</code>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">{ip.description || "-"}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {format(new Date(ip.created_at), "dd MMM yyyy, HH:mm", { locale: ptBR })}
                </div>
              </TableCell>
              <TableCell>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover IP do Whitelist?</AlertDialogTitle>
                      <AlertDialogDescription>
                        O IP <code className="font-mono bg-muted px-1 rounded">{ip.ip_address}</code> será removido do whitelist.
                        Acessos deste IP poderão ser bloqueados ou limitados.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onRemove(ip.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Remover
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});
