/**
 * ROLE-PRECEDENCE — trava a escolha do papel quando o usuario tem mais de uma
 * linha em `user_roles` (etapa 251 / achado A-19).
 *
 * Antes a escolha vinha de `.order('role').limit(1)`: ordem alfabetica, que
 * coincide com privilegio so por acidente. O mock de `maybeSingle` reproduz
 * exatamente aquela resposta do servidor (primeira linha em ordem alfabetica),
 * de modo que o caso abaixo falha no codigo antigo.
 */
import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppRole } from './useUserRoles';

interface RoleRow {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  updated_at: string;
}

let roleRows: RoleRow[] = [];
let salespersonRow: { role: string } | null = null;
let queryError: { message: string } | null = null;

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-1' }, salesperson: null }),
}));

vi.mock('@/integrations/supabase/client', () => {
  const builder = (table: string) => {
    const query = {
      select: () => query,
      eq: () => query,
      order: () => query,
      limit: () => query,
      maybeSingle: () =>
        Promise.resolve({
          data:
            table === 'salespeople'
              ? salespersonRow
              : ([...roleRows].sort((a, b) => a.role.localeCompare(b.role))[0] ?? null),
          error: queryError,
        }),
      then: (resolve: (value: unknown) => unknown) =>
        Promise.resolve({
          data: table === 'salespeople' ? salespersonRow : roleRows,
          error: queryError,
        }).then(resolve),
    };
    return query;
  };

  return { supabase: { from: (table: string) => builder(table) } };
});

const { pickHighestRole, useUserRoles } = await import('./useUserRoles');

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

function role<T extends string>(value: T): RoleRow & { role: T } {
  return {
    id: `id-${value}`,
    user_id: 'user-1',
    role: value,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  };
}

describe('pickHighestRole', () => {
  // O pressuposto que dá poder de detecção ao caso "papel desconhecido": ele
  // precisa vir ANTES de 'admin' na ordenação do servidor, senão a resposta
  // antiga (`.order('role').limit(1)`) acertaria por acidente.
  it('o papel desconhecido do caso vem antes de admin na ordenacao', () => {
    expect('account_owner'.localeCompare('admin')).toBeLessThan(0);
    expect('coordenador'.localeCompare('admin')).toBeGreaterThan(0);
  });

  it('escolhe admin entre admin e salesperson', () => {
    expect(pickHighestRole([role('salesperson'), role('admin')])?.role).toBe('admin');
  });

  it('ignora papel fora da lista conhecida que viria antes de admin no alfabeto', () => {
    expect(pickHighestRole([role('account_owner' as AppRole), role('admin')])?.role).toBe(
      'admin'
    );
  });

  it('escolhe manager quando nao ha admin', () => {
    expect(pickHighestRole([role('salesperson'), role('manager')])?.role).toBe('manager');
  });

  it('devolve null sem linhas', () => {
    expect(pickHighestRole([])).toBeNull();
    expect(pickHighestRole(null)).toBeNull();
    expect(pickHighestRole(undefined)).toBeNull();
  });

  it('devolve null para papel desconhecido (fail-closed)', () => {
    expect(pickHighestRole([role('account_owner' as AppRole)])).toBeNull();
  });
});

describe('useUserRoles', () => {
  beforeEach(() => {
    roleRows = [];
    salespersonRow = null;
    queryError = null;
  });

  it('trata como admin quem tem admin e salesperson', async () => {
    roleRows = [role('salesperson'), role('admin')];

    const { result } = renderHook(() => useUserRoles(), { wrapper });

    await waitFor(() => expect(result.current.isAdmin).toBe(true));
    expect(result.current.currentUserRole?.role).toBe('admin');
    expect(result.current.isManager).toBe(false);
  });

  it('nao perde o admin quando existe papel desconhecido antes no alfabeto', async () => {
    roleRows = [role('account_owner' as AppRole), role('admin')];

    const { result } = renderHook(() => useUserRoles(), { wrapper });

    await waitFor(() => expect(result.current.isAdmin).toBe(true));
    expect(result.current.currentUserRole?.role).toBe('admin');
  });

  it('mantem o fallback de vendedor quando nao ha linha em user_roles', async () => {
    salespersonRow = { role: 'closer' };

    const { result } = renderHook(() => useUserRoles(), { wrapper });

    await waitFor(() => expect(result.current.currentUserRole?.role).toBe('salesperson'));
    expect(result.current.isAdmin).toBe(false);
  });

  it('nao concede papel quando a consulta falha', async () => {
    queryError = { message: 'boom' };

    const { result } = renderHook(() => useUserRoles(), { wrapper });

    await waitFor(() => expect(result.current.isLoadingCurrentRole).toBe(false));
    expect(result.current.currentUserRole).toBeNull();
    expect(result.current.isAdmin).toBe(false);
  });
});
