import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteCadenceDialogProps {
  cadenceName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending?: boolean;
}

export function DeleteCadenceDialog({ cadenceName, open, onOpenChange, onConfirm, isPending }: DeleteCadenceDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="glass border-border/50 dark:border-glow">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display">Excluir Cadência</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a cadência <span className="font-medium text-foreground">"{cadenceName}"</span>?
            <br />
            <span className="text-destructive font-medium">Esta ação é irreversível.</span> Todas as etapas e tarefas associadas serão removidas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="hover:bg-muted/50">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "Excluindo..." : "Excluir Cadência"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
