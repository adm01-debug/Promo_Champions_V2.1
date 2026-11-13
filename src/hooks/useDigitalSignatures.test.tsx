import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const update = vi.fn();
const remove = vi.fn();
const toast = vi.fn();
let nextResult: { data: unknown[]; error: { message: string } | null } = {
  data: [],
  error: null,
};

vi.mock('@/integrations/supabase/client', () => {
  const builder = () => {
    const query = {
      select: () => query,
      order: () => query,
      insert: () => query,
      update,
      delete: remove,
      eq: () => query,
      limit: () => query,
      single: () => Promise.resolve({ data: null, error: null }),
      then: (resolve: (value: typeof nextResult) => unknown) =>
        Promise.resolve(nextResult).then(resolve),
    };

    update.mockReturnValue(query);
    remove.mockReturnValue(query);
    return query;
  };

  return {
    supabase: {
      from: () => builder(),
    },
  };
});

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast }),
}));

const { DIGITAL_SIGNATURE_INTEGRATION_MESSAGE, useDigitalSignatures } =
  await import('./useDigitalSignatures');

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  return createElement(QueryClientProvider, { client }, children);
}

describe('useDigitalSignatures sem provedor configurado', () => {
  beforeEach(() => {
    update.mockClear();
    toast.mockClear();
  });

  it('não altera o status ao tentar enviar um documento', async () => {
    const { result } = renderHook(() => useDigitalSignatures(), { wrapper });

    await act(async () => {
      await expect(
        result.current.sendForSignature.mutateAsync('documento-1')
      ).rejects.toThrow(DIGITAL_SIGNATURE_INTEGRATION_MESSAGE);
    });

    expect(update).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Envio para assinatura indisponível',
        variant: 'destructive',
      })
    );
  });

  it('não permite registrar assinatura ou recusa pelo cliente', async () => {
    const { result } = renderHook(() => useDigitalSignatures(), { wrapper });

    await act(async () => {
      await expect(
        result.current.updateSignerStatus.mutateAsync({
          signerId: 'signatario-1',
          status: 'signed',
        })
      ).rejects.toThrow(DIGITAL_SIGNATURE_INTEGRATION_MESSAGE);
    });

    expect(update).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Confirmação de assinatura indisponível',
        variant: 'destructive',
      })
    );
  });
});

describe('useDigitalSignatures — edição e remoção de signatários', () => {
  beforeEach(() => {
    update.mockClear();
    remove.mockClear();
    toast.mockClear();
    nextResult = { data: [], error: null };
  });

  it('atualiza nome e e-mail do signatário', async () => {
    nextResult = { data: [{ id: 'signatario-1' }], error: null };
    const { result } = renderHook(() => useDigitalSignatures(), { wrapper });

    await act(async () => {
      await result.current.updateSigner.mutateAsync({
        signerId: 'signatario-1',
        name: '  Maria  ',
        email: ' maria@exemplo.com ',
      });
    });

    expect(update).toHaveBeenCalledWith({ name: 'Maria', email: 'maria@exemplo.com' });
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Signatário atualizado' })
    );
  });

  it('acusa erro quando o RLS não deixa editar nenhuma linha', async () => {
    const { result } = renderHook(() => useDigitalSignatures(), { wrapper });

    await act(async () => {
      await expect(
        result.current.updateSigner.mutateAsync({
          signerId: 'signatario-1',
          name: 'Maria',
          email: 'maria@exemplo.com',
        })
      ).rejects.toThrow('Você não tem permissão para editar este signatário.');
    });

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Erro ao atualizar signatário',
        variant: 'destructive',
      })
    );
  });

  it('remove o signatário', async () => {
    nextResult = { data: [{ id: 'signatario-1' }], error: null };
    const { result } = renderHook(() => useDigitalSignatures(), { wrapper });

    await act(async () => {
      await result.current.removeSigner.mutateAsync('signatario-1');
    });

    expect(remove).toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Signatário removido' })
    );
  });

  it('acusa erro quando o RLS não deixa remover (não é admin/gestor)', async () => {
    const { result } = renderHook(() => useDigitalSignatures(), { wrapper });

    await act(async () => {
      await expect(
        result.current.removeSigner.mutateAsync('signatario-1')
      ).rejects.toThrow('Apenas administradores e gestores podem remover signatários.');
    });

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Erro ao remover signatário',
        variant: 'destructive',
      })
    );
  });
});
