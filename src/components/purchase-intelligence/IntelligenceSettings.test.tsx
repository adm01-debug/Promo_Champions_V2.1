import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const update = vi.fn();
const reset = vi.fn();
const toastSuccess = vi.fn();
let settingValue = {
  churnSensitivity: 40,
  upsellThreshold: 60,
  notificationFrequency: 'realtime' as const,
  pushNotifications: true,
};
let syncStatus = 'synced';

vi.mock('sonner', () => ({
  toast: { success: (...args: unknown[]) => toastSuccess(...args) },
}));

vi.mock('@/hooks/useSyncedSetting', () => ({
  useSyncedSetting: () => ({ value: settingValue, update, reset, syncStatus }),
}));

// Radix Slider/Select dependem de APIs de ponteiro ausentes no jsdom.
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.releasePointerCapture = () => {};
  Element.prototype.scrollIntoView = () => {};
}

import { IntelligenceSettings, sanitizeThresholds } from './IntelligenceSettings';

async function openDialog() {
  render(<IntelligenceSettings />);
  await userEvent.click(screen.getByRole('button', { name: /Configurar IA/i }));
}

describe('IntelligenceSettings — diálogo que persiste parâmetros (etapa 107)', () => {
  beforeEach(() => {
    update.mockClear();
    reset.mockClear();
    toastSuccess.mockClear();
    syncStatus = 'synced';
    settingValue = {
      churnSensitivity: 40,
      upsellThreshold: 60,
      notificationFrequency: 'realtime',
      pushNotifications: true,
    };
  });

  it('exibe os percentuais atuais em vez de texto fixo', async () => {
    await openDialog();
    expect(screen.getByText('40%')).toBeTruthy();
    expect(screen.getByText('60%')).toBeTruthy();
  });

  it('salva o novo limiar de churn ao mover o slider', async () => {
    await openDialog();
    const [churnSlider] = screen.getAllByRole('slider') as [HTMLElement, HTMLElement];
    churnSlider.focus();
    await userEvent.keyboard('{ArrowRight}');

    expect(update).toHaveBeenCalledWith({ churnSensitivity: 41 });
  });

  it('salva a frequência escolhida no seletor', async () => {
    await openDialog();
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: 'A cada 1 hora' }));

    expect(update).toHaveBeenCalledWith({ notificationFrequency: 'hourly' });
  });

  it('restaura os padrões no botão Resetar', async () => {
    await openDialog();
    await userEvent.click(screen.getByRole('button', { name: /Resetar/i }));

    expect(reset).toHaveBeenCalledTimes(1);
    expect(toastSuccess).toHaveBeenCalledWith('Parâmetros restaurados para o padrão');
  });

  it('confirma e fecha o diálogo no botão Salvar Alterações', async () => {
    await openDialog();
    await userEvent.click(screen.getByRole('button', { name: /Salvar Alterações/i }));

    expect(toastSuccess).toHaveBeenCalledWith('Parâmetros de inteligência salvos');
    expect(screen.queryByText('Parâmetros de Inteligência')).toBeNull();
  });

  it('avisa quando as alterações ficam só neste dispositivo', async () => {
    syncStatus = 'offline';
    await openDialog();
    expect(
      screen.getByText(/as alterações ficam salvas neste dispositivo/i)
    ).toBeTruthy();
  });

  it('normaliza valores inválidos vindos do cache ou do servidor', () => {
    expect(sanitizeThresholds({ churnSensitivity: 130, upsellThreshold: -8 })).toEqual({
      churnSensitivity: 100,
      upsellThreshold: 0,
      notificationFrequency: 'realtime',
      pushNotifications: true,
    });
    expect(
      sanitizeThresholds({ notificationFrequency: 'weekly', pushNotifications: false })
    ).toEqual({
      churnSensitivity: 75,
      upsellThreshold: 85,
      notificationFrequency: 'realtime',
      pushNotifications: false,
    });
  });
});
