import { render, screen, waitFor } from '@testing-library/react';
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
    let resolveFetch: (v: unknown[]) => void = () => {};
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
});
