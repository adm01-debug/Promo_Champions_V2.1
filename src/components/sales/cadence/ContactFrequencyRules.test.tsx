import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ContactFrequencyConfig } from '@/types/sales';

const hookState = {
  hasSalesperson: true,
  savedRules: null as ContactFrequencyConfig | null,
  isLoading: false,
  isError: false,
  saveRules: vi.fn(),
  isSaving: false,
};

vi.mock('@/hooks/sales/useContactFrequencyRules', async importOriginal => ({
  ...(await importOriginal<typeof import('@/hooks/sales/useContactFrequencyRules')>()),
  useContactFrequencyRules: () => hookState,
}));

const toastSuccess = vi.fn();
const toastError = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    success: (...a: unknown[]) => toastSuccess(...a),
    error: (...a: unknown[]) => toastError(...a),
  },
}));

import { ContactFrequencyRules } from './ContactFrequencyRules';
import { DEFAULT_CONTACT_FREQUENCY } from '@/hooks/sales/useContactFrequencyRules';

const saved: ContactFrequencyConfig = {
  quiet_hours_start: '21:00',
  quiet_hours_end: '07:30',
  max_calls_per_day: 1,
  max_messages_per_day: 5,
  min_interval_minutes: 120,
  prioritize_human: false,
};

const saveButton = () => screen.getByRole('button', { name: /salvar configurações/i });

describe('ContactFrequencyRules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(hookState, {
      hasSalesperson: true,
      savedRules: null,
      isLoading: false,
      isError: false,
      isSaving: false,
    });
    hookState.saveRules = vi.fn().mockResolvedValue(undefined);
  });

  it('avisa que as regras ainda não são aplicadas automaticamente', () => {
    render(<ContactFrequencyRules />);
    expect(
      screen.getByText(/ainda não são aplicadas automaticamente no envio das cadências/i)
    ).toBeInTheDocument();
    expect(screen.queryByText(/serão enviadas automaticamente/i)).not.toBeInTheDocument();
  });

  it('marca os valores como padrão quando nada foi salvo', () => {
    render(<ContactFrequencyRules />);
    expect(screen.getByText('Padrão — ainda não salvo')).toBeInTheDocument();
    expect(
      screen.getByDisplayValue(DEFAULT_CONTACT_FREQUENCY.quiet_hours_start)
    ).toBeVisible();
  });

  it('mostra as regras salvas no banco', () => {
    hookState.savedRules = saved;
    render(<ContactFrequencyRules />);
    expect(screen.queryByText('Padrão — ainda não salvo')).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('21:00')).toBeInTheDocument();
    expect(screen.getByDisplayValue('07:30')).toBeInTheDocument();
    expect(screen.getByText('120 min')).toBeInTheDocument();
  });

  it('salva de verdade e só então confirma', async () => {
    hookState.savedRules = saved;
    render(<ContactFrequencyRules />);
    fireEvent.change(screen.getByDisplayValue('21:00'), { target: { value: '22:00' } });
    fireEvent.click(saveButton());

    await waitFor(() =>
      expect(hookState.saveRules).toHaveBeenCalledWith({
        ...saved,
        quiet_hours_start: '22:00',
      })
    );
    await waitFor(() =>
      expect(toastSuccess).toHaveBeenCalledWith('Regras de frequência salvas.')
    );
    expect(toastError).not.toHaveBeenCalled();
  });

  it('mostra erro e não confirma quando o banco recusa', async () => {
    hookState.saveRules = vi
      .fn()
      .mockRejectedValue(new Error('violates row-level security'));
    render(<ContactFrequencyRules />);
    fireEvent.click(saveButton());

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(
        'Erro ao salvar regras de frequência: violates row-level security'
      )
    );
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  it('desabilita salvar sem perfil de vendedor', () => {
    hookState.hasSalesperson = false;
    render(<ContactFrequencyRules />);
    expect(screen.getByText(/perfil de vendedor não encontrado/i)).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('desabilita salvar e avisa quando a leitura falha', () => {
    hookState.isError = true;
    render(<ContactFrequencyRules />);
    expect(
      screen.getByText(/não foi possível carregar as regras salvas/i)
    ).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });
});
