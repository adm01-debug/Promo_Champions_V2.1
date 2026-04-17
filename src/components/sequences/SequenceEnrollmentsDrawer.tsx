import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSequenceEnrollments } from "@/hooks/sequences/useSequenceEnrollments";
import { statusBadgeVariant, STATUS_LABEL } from "./sequenceHelpers";
import { formatOptimizedFor } from "./sendTimeHelpers";
import { Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  sequenceId: string | null;
}

export function SequenceEnrollmentsDrawer({ open, onOpenChange, sequenceId }: Props) {
  const { data, isLoading } = useSequenceEnrollments(sequenceId ?? undefined);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>Contatos inscritos ({data?.length ?? 0})</DrawerTitle>
        </DrawerHeader>
        <ScrollArea className="px-4 pb-4 max-h-[70vh]">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : (data?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum contato inscrito ainda
            </p>
          ) : (
            <div className="space-y-2">
              {data?.map((e) => (
                <div key={e.id} className="border rounded-lg p-3 hover:bg-accent/5 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-xs font-mono text-muted-foreground truncate">{e.contact_id}</code>
                    <Badge variant={statusBadgeVariant(e.status)}>{STATUS_LABEL[e.status] ?? e.status}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>Passo {e.current_step}</span>
                    <span>•</span>
                    <span>Iniciado {format(new Date(e.started_at), "dd MMM HH:mm", { locale: ptBR })}</span>
                    {e.next_action_at && (
                      <>
                        <span>•</span>
                        <span>Próximo: {format(new Date(e.next_action_at), "dd MMM HH:mm", { locale: ptBR })}</span>
                      </>
                    )}
                    {e.optimized_for_at && (
                      <Badge variant="outline" className="gap-1 text-[10px] py-0 h-4">
                        <Clock className="h-2.5 w-2.5" />
                        Otimizado para {formatOptimizedFor(e.optimized_for_at)}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
