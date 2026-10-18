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

  it('recordLoginAttempt atrasado nao desloca o marcador do e-mail atual', async () => {
    // Cenario: falha de login com A dispara recordLoginAttempt; antes de
    // terminar, o usuario digita B (checkLoginAttempts(B)). O refresh de A
    // que viria depois nao pode voltar o marcador nem limpar o status de B.
    const resolvers = new Map<string, (v: { data: unknown; error: null }) => void>();
    rpc.mockImplementation(
      (fn: string, args: Record<string, unknown>) =>
        new Promise(resolve => {
          if (fn === 'get_login_lockout_status') {
            resolvers.set(String(args.p_email), resolve);
          } else {
            resolve({ data: null, error: null });
          }
        })
    );

    const { result } = renderHook(() => useLoginRateLimiter());

    // Usuario falha com A e depois consulta B antes da resposta de A.
    act(() => {
      void result.current.recordLoginAttempt('a@example.com', false);
      void result.current.checkLoginAttempts('b@example.com');
    });

    // B responde bloqueado.
    await act(async () => {
      resolvers.get('b@example.com')?.({
        data: [
          { attempts: 5, lockout_until: new Date(Date.now() + 60_000).toISOString() },
        ],
        error: null,
      });
    });
    expect(result.current.lockoutStatus.isLocked).toBe(true);

    // A resposta tardia do refresh de A nao pode sobrescrever o status de B.
    // Sem a guarda, checkLoginAttempts(A) rodaria e setaria o status de A.
    await act(async () => {
      // recordLoginAttempt ainda nao chamou checkLoginAttempts(A) porque a
      // guarda de lastQueriedEmail o bloqueou — mas a RPC pode ter sido
      // emitida antes; resolvemos para garantir.
      resolvers.get('a@example.com')?.({
        data: [{ attempts: 0, lockout_until: null }],
        error: null,
      });
    });

    expect(result.current.lockoutStatus.isLocked).toBe(true);
    expect(result.current.lockoutStatus.attempts).toBe(5);
  });

  it('descarta resposta atrasada do MESMO e-mail consultado duas vezes (A→B→A)', async () => {
    // Cenário: consulta A1; o campo muda para B e volta para A, disparando
    // A2. A1 responde depois de A2 — sem o seq counter, a resposta antiga
    // (livre) sobrescreveria o lockout real de A2.
    const resolvers: Array<(v: { data: unknown; error: null }) => void> = [];
    rpc.mockImplementation(
      (_fn: string, _args: { p_email: string }) =>
        new Promise(resolve => {
          resolvers.push(resolve);
        })
    );

    const { result } = renderHook(() => useLoginRateLimiter());

    act(() => {
      void result.current.checkLoginAttempts('a@example.com'); // A1 = resolvers[0]
      void result.current.checkLoginAttempts('b@example.com'); // B  = resolvers[1]
      void result.current.checkLoginAttempts('a@example.com'); // A2 = resolvers[2]
    });

    // A2 responde bloqueado — este é o estado correto da tela.
    await act(async () => {
      resolvers[2]?.({
        data: [
          { attempts: 5, lockout_until: new Date(Date.now() + 60_000).toISOString() },
        ],
        error: null,
      });
    });
    expect(result.current.lockoutStatus.isLocked).toBe(true);

    // A1 chega por último com estado livre — não pode sobrescrever.
    await act(async () => {
      resolvers[0]?.({
        data: [{ attempts: 0, lockout_until: null }],
        error: null,
      });
    });

    expect(result.current.lockoutStatus.isLocked).toBe(true);
    expect(result.current.lockoutStatus.attempts).toBe(5);
  });
});
