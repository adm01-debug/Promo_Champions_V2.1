import { Clock, Trash2, Wallet, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatBRL } from '@/lib/money';
import type { AwardWithRefs } from '@/hooks/useCommissionBonusAwards';

/** Nome legivel do premio, com o valor, para os textos de confirmacao. */
function describeAward(a: AwardWithRefs | null): string {
  if (!a) return '';
  const valor =
    a.bonus_kind === 'fixed'
      ? formatBRL(Number(a.computed_amount), { decimals: 2 })
      : `${Number(a.computed_amount).toFixed(2)}%`;
  return `${a.bonus_name ?? 'Premiação'} de ${a.salesperson_name ?? 'vendedor'} (${valor})`;
}

interface AwardRowActionsProps {
  award: AwardWithRefs;
  isPaid: boolean;
  isCancelled: boolean;
  pending: boolean;
  removing: boolean;
  onMarkPaid: (id: string) => void;
  onReopen: (id: string) => void;
  onAskCancel: (award: AwardWithRefs) => void;
  onAskDelete: (award: AwardWithRefs) => void;
}

export function AwardRowActions({
  award,
  isPaid,
  isCancelled,
  pending,
  removing,
  onMarkPaid,
  onReopen,
  onAskCancel,
  onAskDelete,
}: AwardRowActionsProps) {
  const quem = award.salesperson_name ?? 'vendedor';
  const premio = award.bonus_name ?? 'premiação';
  return (
    <div className="flex justify-end gap-1">
      {!isPaid && !isCancelled && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onMarkPaid(award.id)}
          disabled={pending}
        >
          <Wallet className="h-3.5 w-3.5 mr-1" /> Marcar pago
        </Button>
      )}
      {isPaid && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onReopen(award.id)}
          disabled={pending}
        >
          <Clock className="h-3.5 w-3.5 mr-1" /> Reabrir
        </Button>
      )}
      {!isCancelled && (
        <Button
          size="sm"
          variant="ghost"
          aria-label={`Cancelar a premiação ${premio} de ${quem}`}
          onClick={() => onAskCancel(award)}
          disabled={pending}
        >
          <XCircle className="h-3.5 w-3.5" />
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        aria-label={`Excluir definitivamente a premiação ${premio} de ${quem}`}
        onClick={() => onAskDelete(award)}
        disabled={removing}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

interface AwardDestructiveDialogsProps {
  awardToCancel: AwardWithRefs | null;
  awardToDelete: AwardWithRefs | null;
  onCloseCancel: () => void;
  onCloseDelete: () => void;
  onCancelConfirmed: (id: string) => void;
  onDeleteConfirmed: (id: string) => void;
}

/**
 * Confirmacoes das duas acoes destrutivas da auditoria de premiacoes.
 * Ficam juntas e nomeiam o registro: sao botoes vizinhos num registro de
 * bonus, e o efeito de clicar no errado e irreversivel.
 */
export function AwardDestructiveDialogs({
  awardToCancel,
  awardToDelete,
  onCloseCancel,
  onCloseDelete,
  onCancelConfirmed,
  onDeleteConfirmed,
}: AwardDestructiveDialogsProps) {
  return (
    <>
      <AlertDialog open={!!awardToCancel} onOpenChange={open => !open && onCloseCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar a premiação?</AlertDialogTitle>
            <AlertDialogDescription>
              {awardToCancel
                ? `${describeAward(awardToCancel)}. O registro continua na auditoria, marcado como cancelado.`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => awardToCancel && onCancelConfirmed(awardToCancel.id)}
            >
              Cancelar premiação
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!awardToDelete} onOpenChange={open => !open && onCloseDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir a premiação definitivamente?</AlertDialogTitle>
            <AlertDialogDescription>
              {awardToDelete
                ? `${describeAward(awardToDelete)} será apagada da auditoria, sem volta. Prefira cancelar se quiser manter o histórico.`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => awardToDelete && onDeleteConfirmed(awardToDelete.id)}
            >
              Excluir definitivamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
