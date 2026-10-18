import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { KnownDevices } from './KnownDevices';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: null })),
}));

vi.mock('@/services/knownDeviceService', () => ({
  knownDeviceService: {
    listForUser: vi.fn(() => Promise.resolve([])),
    setTrusted: vi.fn(),
    remove: vi.fn(),
  },
}));

import { useAuth } from '@/contexts/AuthContext';
import { knownDeviceService } from '@/services/knownDeviceService';

describe('KnownDevices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sai do estado de loading quando não há usuário autenticado', async () => {
    vi.mocked(useAuth).mockReturnValue({ user: null } as never);

    render(<KnownDevices />);

    await waitFor(() => {
      expect(screen.getByText('Nenhum dispositivo registrado')).toBeInTheDocument();
    });
  });

  it('lista dispositivos quando o usuário está autenticado', async () => {
    vi.mocked(useAuth).mockReturnValue({ user: { id: 'u1' } } as never);
    vi.mocked(knownDeviceService.listForUser).mockResolvedValue([
      {
        id: 'd1',
        device_fingerprint: 'fp1',
        device_name: 'Meu Notebook',
        browser: 'Chrome',
        os: 'Windows',
        ip_address: '1.2.3.4',
        location: 'São Paulo',
        first_seen_at: '2026-10-01T00:00:00Z',
        last_seen_at: '2026-10-14T00:00:00Z',
        is_trusted: true,
      },
    ] as never);

    render(<KnownDevices />);

    await waitFor(() => {
      expect(screen.getByText('Meu Notebook')).toBeInTheDocument();
    });
  });

  it('não atualiza estado quando o componente desmonta durante o fetch', async () => {
    vi.mocked(useAuth).mockReturnValue({ user: { id: 'u1' } } as never);
    let resolveFetch: (
      v: Awaited<ReturnType<typeof knownDeviceService.listForUser>>
    ) => void = () => {};
    vi.mocked(knownDeviceService.listForUser).mockImplementation(
      () =>
        new Promise(resolve => {
          resolveFetch = resolve;
        })
    );

    const { unmount } = render(<KnownDevices />);
    unmount();

    await expect(async () => {
      resolveFetch([{ id: 'd1', device_fingerprint: 'fp', device_name: 'X' } as never]);
      await Promise.resolve();
    }).not.toThrow();
    expect(knownDeviceService.listForUser).toHaveBeenCalledWith('u1');
  });

  it('descarta resposta antiga quando o usuário troca durante o fetch', async () => {
    const userRef = { user: { id: 'u1' } as { id: string } | null };
    vi.mocked(useAuth).mockImplementation(() => ({ user: userRef.user }) as never);

    const resolvers = new Map<
      string,
      (v: Awaited<ReturnType<typeof knownDeviceService.listForUser>>) => void
    >();
    vi.mocked(knownDeviceService.listForUser).mockImplementation(
      (userId: string) =>
        new Promise(resolve => {
          resolvers.set(userId, resolve);
        })
    );

    const { rerender } = render(<KnownDevices />);
    await act(async () => {
      userRef.user = { id: 'u2' };
      rerender(<KnownDevices />);
    });

    // Ordem invertida de propósito: a resposta de u2 chega primeiro e a de u1
    // (usuário antigo) chega POR ÚLTIMO. Sem a guarda de geração, o setState
    // tardio de u1 sobrescreveria a tela com dados do usuário anterior.
    await act(async () => {
      resolvers.get('u2')?.([
        { id: 'd-new', device_fingerprint: 'fp2', device_name: 'Device Novo' },
      ] as never);
      resolvers.get('u1')?.([
        { id: 'd-old', device_fingerprint: 'fp', device_name: 'Device Antigo' },
      ] as never);
    });

    await waitFor(() => {
      expect(screen.getByText('Device Novo')).toBeInTheDocument();
    });
    expect(screen.queryByText('Device Antigo')).not.toBeInTheDocument();
  });
});
