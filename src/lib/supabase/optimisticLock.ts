/**
 * Optimistic locking helper (pacote OPTLOCK).
 *
 * UPDATEs críticos aplicam `.eq('version', versaoLida)`; quando nenhuma linha
 * casa, o registro foi alterado por outro usuário — conflito lógico 409.
 * O caller trata via `isOptimisticLockConflict` e dispara refetch + toast.
 */

export class OptimisticLockConflictError extends Error {
  constructor() {
    super('Registro alterado por outro usuário');
    this.name = 'OptimisticLockConflictError';
  }
}

export function isOptimisticLockConflict(
  err: unknown
): err is OptimisticLockConflictError {
  return err instanceof OptimisticLockConflictError;
}
