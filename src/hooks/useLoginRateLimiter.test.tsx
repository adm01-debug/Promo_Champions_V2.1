import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const rpc = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { rpc },
}));

const { useLoginRateLimiter } = await import('./useLoginRateLimiter');

describe('useLoginRateLimiter', () => {
  beforeEach(() => {
    rpc.mockReset();
  });

  it('consome somente o resumo agregado e normaliza o e-mail', async () => {
    rpc.mockResolvedValueOnce({
      data: [
        { attempts: 2, last_failed_at: new Date().toISOString(), lockout_until: null },
      ],
      error: null,
    });
    const { result } = renderHook(() => useLoginRateLimiter());

    const output: {
      response?: Awaited<ReturnType<typeof result.current.checkLoginAttempts>>;
    } = {};
    await act(async () => {
      output.response = await result.current.checkLoginAttempts('  USER@Example.COM ');
    });

    expect(rpc).toHaveBeenCalledWith('get_login_lockout_status', {
      p_email: 'user@example.com',
    });
    expect(output.response).toEqual({
      canAttempt: true,
      lockoutStatus: { isLocked: false, remainingSeconds: 0, attempts: 2 },
    });
  });

  it('bloqueia enquanto lockout_until estiver no futuro', async () => {
    rpc.mockResolvedValueOnce({
      data: [
        {
          attempts: 5,
          last_failed_at: new Date().toISOString(),
          lockout_until: new Date(Date.now() + 30_000).toISOString(),
        },
      ],
      error: null,
    });
    const { result } = renderHook(() => useLoginRateLimiter());

    const output: {
      response?: Awaited<ReturnType<typeof result.current.checkLoginAttempts>>;
    } = {};
    await act(async () => {
      output.response = await result.current.checkLoginAttempts('user@example.com');
    });

    expect(output.response?.canAttempt).toBe(false);
    expect(output.response?.lockoutStatus.isLocked).toBe(true);
    expect(output.response?.lockoutStatus.remainingSeconds).toBeGreaterThan(0);
  });

  it('falha aberta quando o resumo não está disponível', async () => {
    rpc.mockResolvedValueOnce({
      data: null,
      error: { message: 'indisponível' },
    });
    const { result } = renderHook(() => useLoginRateLimiter());

    const output: {
      response?: Awaited<ReturnType<typeof result.current.checkLoginAttempts>>;
    } = {};
    await act(async () => {
      output.response = await result.current.checkLoginAttempts('user@example.com');
    });

    expect(output.response).toEqual({
      canAttempt: true,
      lockoutStatus: { isLocked: false, remainingSeconds: 0, attempts: 0 },
    });
  });

  it('registra falha pela RPC limitada e atualiza o resumo', async () => {
    rpc.mockResolvedValueOnce({ data: null, error: null }).mockResolvedValueOnce({
      data: [
        { attempts: 1, last_failed_at: new Date().toISOString(), lockout_until: null },
      ],
      error: null,
    });
    const { result } = renderHook(() => useLoginRateLimiter());

    await act(async () => {
      await result.current.recordLoginAttempt(
        ' USER@example.com ',
        false,
        'invalid_credentials'
      );
    });

    expect(rpc).toHaveBeenNthCalledWith(1, 'record_failed_login_attempt', {
      p_email: 'user@example.com',
      p_failure_reason: 'invalid_credentials',
      p_user_agent: navigator.userAgent,
    });
    expect(rpc).toHaveBeenNthCalledWith(2, 'get_login_lockout_status', {
      p_email: 'user@example.com',
    });
  });

  it('registra sucesso sem aceitar e-mail fornecido pelo cliente', async () => {
    rpc.mockResolvedValueOnce({ data: null, error: null });
    const { result } = renderHook(() => useLoginRateLimiter());

    await act(async () => {
      await result.current.recordLoginAttempt('user@example.com', true);
    });

    expect(rpc).toHaveBeenCalledWith('record_successful_login_attempt', {
      p_user_agent: navigator.userAgent,
    });
    expect(result.current.lockoutStatus).toEqual({
      isLocked: false,
      remainingSeconds: 0,
      attempts: 0,
    });
  });

  it('descarta resposta atrasada de um e-mail anterior', async () => {
    // Resposta do e-mail A chega DEPOIS da do e-mail B: o lockout mostrado
    // deve ser o de B — sem a guarda, a resposta tardia de A sobrescreve.
    const resolvers = new Map<string, (v: { data: unknown; error: null }) => void>();
    rpc.mockImplementation(
      (_fn: string, args: { p_email: string }) =>
        new Promise(resolve => {
          resolvers.set(args.p_email, resolve);
        })
    );

    const { result } = renderHook(() => useLoginRateLimiter());

    act(() => {
      void result.current.checkLoginAttempts('a@example.com');
      void result.current.checkLoginAttempts('b@example.com');
    });

    await act(async () => {
      resolvers.get('b@example.com')?.({
        data: [
          { attempts: 5, lockout_until: new Date(Date.now() + 60_000).toISOString() },
        ],
        error: null,
      });
      resolvers.get('a@example.com')?.({
        data: [{ attempts: 0, lockout_until: null }],
        error: null,
      });
    });

    // O status na tela é o de B (bloqueado), não o de A (livre, chegou depois).
    expect(result.current.lockoutStatus.isLocked).toBe(true);
    expect(result.current.lockoutStatus.attempts).toBe(5);
  });
});
