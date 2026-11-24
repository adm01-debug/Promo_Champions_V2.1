import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { DashboardThemeProvider, useDashboardTheme } from './DashboardThemeContext';

const STORAGE_KEY = 'dashboard-style-theme';

function Probe() {
  const { theme, toggleTheme } = useDashboardTheme();
  return (
    <button type="button" onClick={toggleTheme}>
      {theme}
    </button>
  );
}

function renderProbe() {
  return render(
    <DashboardThemeProvider>
      <Probe />
    </DashboardThemeProvider>
  );
}

describe('DashboardThemeContext', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.document.documentElement.className = '';
  });

  it('usa cyber como padrão quando não há preferência salva', () => {
    renderProbe();

    expect(screen.getByRole('button').textContent).toBe('cyber');
    expect(window.document.documentElement.classList.contains('cyber-mode')).toBe(true);
  });

  it('respeita a preferência salva ao montar', () => {
    window.localStorage.setItem(STORAGE_KEY, 'standard');

    renderProbe();

    expect(screen.getByRole('button').textContent).toBe('standard');
    expect(window.document.documentElement.classList.contains('standard-mode')).toBe(
      true
    );
  });

  it('alterna, aplica a classe e grava a preferência para a próxima sessão', () => {
    renderProbe();

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByRole('button').textContent).toBe('standard');
    expect(window.document.documentElement.classList.contains('standard-mode')).toBe(
      true
    );
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('standard');

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByRole('button').textContent).toBe('cyber');
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('cyber');
  });

  it('cai no padrão sem quebrar quando o valor salvo é inválido', () => {
    window.localStorage.setItem(STORAGE_KEY, 'neon');

    renderProbe();

    expect(screen.getByRole('button').textContent).toBe('cyber');
  });
});
