import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useEffect } from 'react';
import { act, render } from '@testing-library/react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import {
  registerDirtySource,
  unregisterDirtySource,
  hasDirtySources,
  requestNavigation,
  handleDocumentClick,
  handlePopState,
  setConfirmHandler,
  setNavigateFn,
  setCurrentHref,
} from './navigationGuard';

/**
 * Componente-ponte para o teste de integração: registra o navigate REAL do
 * Router no guard (em vez de mock) e registra cada mudança de location —
 * assim o spec verifica o estado final do histórico, não só as chamadas.
 */
function RouterHarness({
  onLocation,
}: {
  onLocation: (loc: { pathname: string; state: unknown }) => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    setNavigateFn((path, options) => navigate(path, options));
    return () => setNavigateFn(null);
  }, [navigate]);
  useEffect(() => {
    onLocation({ pathname: location.pathname, state: location.state });
  }, [location, onLocation]);
  return null;
}

describe('navigationGuard', () => {
  beforeEach(() => {
    setConfirmHandler(null);
    setNavigateFn(null);
  });
  afterEach(() => {
    unregisterDirtySource('a');
    unregisterDirtySource('b');
    vi.restoreAllMocks();
  });

  it('requestNavigation executa direto sem sujeira', async () => {
    const action = vi.fn();
    await requestNavigation(action);
    expect(action).toHaveBeenCalled();
  });

  it('requestNavigation confirma antes de sair com sujeira', async () => {
    registerDirtySource('a', 'Tem alterações');
    const confirm = vi.fn().mockResolvedValue(true);
    setConfirmHandler(confirm);
    const action = vi.fn();
    await requestNavigation(action);
    expect(confirm).toHaveBeenCalledWith('Tem alterações');
    expect(action).toHaveBeenCalled();
  });

  it('requestNavigation bloqueia quando o usuário cancela', async () => {
    registerDirtySource('a', 'Tem alterações');
    setConfirmHandler(vi.fn().mockResolvedValue(false));
    const action = vi.fn();
    await requestNavigation(action);
    expect(action).not.toHaveBeenCalled();
    expect(hasDirtySources()).toBe(true);
  });

  it('handleDocumentClick intercepta link interno com sujeira', async () => {
    registerDirtySource('a', 'Sujo');
    setConfirmHandler(vi.fn().mockResolvedValue(true));
    const navigate = vi.fn();
    setNavigateFn(navigate);

    const anchor = document.createElement('a');
    anchor.setAttribute('href', '/clientes');
    document.body.appendChild(anchor);
    const event = new MouseEvent('click', { bubbles: true, button: 0 });
    const spy = vi.spyOn(event, 'preventDefault');
    anchor.dispatchEvent(event);
    handleDocumentClick(event);
    await new Promise(r => setTimeout(r, 0));

    expect(spy).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/clientes');
    document.body.removeChild(anchor);
  });

  it('handleDocumentClick ignora links externos', () => {
    registerDirtySource('a', 'Sujo');
    const anchor = document.createElement('a');
    anchor.setAttribute('href', 'https://externo.com/x');
    document.body.appendChild(anchor);
    const event = new MouseEvent('click', { bubbles: true, button: 0 });
    const spy = vi.spyOn(event, 'preventDefault');
    handleDocumentClick(event);
    expect(spy).not.toHaveBeenCalled();
    document.body.removeChild(anchor);
  });

  it('handlePopState restaura a página e sai ao confirmar', async () => {
    registerDirtySource('a', 'Sujo');
    setCurrentHref('http://localhost/pagina-suja');
    setConfirmHandler(vi.fn().mockResolvedValue(true));
    const navigate = vi.fn();
    setNavigateFn(navigate);

    handlePopState();
    // Restaura a página suja via PUSH marcado (pop já havia acontecido).
    // A URL é normalizada para path relativo — navigate() com URL absoluta
    // geraria pathname quebrado no Router.
    expect(navigate).toHaveBeenCalledWith('/pagina-suja', {
      replace: false,
      state: { __pcNavGuardRestore: true },
    });
    await new Promise(r => setTimeout(r, 0));
    // Confirmação → navega para o destino real do pop via replace
    expect(navigate).toHaveBeenLastCalledWith('/', {
      replace: true,
    });
  });

  it('handlePopState fica na página quando o usuário cancela', async () => {
    registerDirtySource('a', 'Sujo');
    setCurrentHref('http://localhost/pagina-suja');
    setConfirmHandler(vi.fn().mockResolvedValue(false));
    const navigate = vi.fn();
    setNavigateFn(navigate);

    handlePopState();
    await new Promise(r => setTimeout(r, 0));
    // Apenas a restauração — nenhuma navegação de saída após o cancelamento
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it('handlePopState ignora sem sujeira', () => {
    const navigate = vi.fn();
    setNavigateFn(navigate);
    handlePopState();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('handlePopState reutiliza a confirmação aberta em pops repetidos', async () => {
    registerDirtySource('a', 'Sujo');
    setCurrentHref('http://localhost/pagina-suja');
    const confirm = vi
      .fn()
      .mockImplementation(() => new Promise<boolean>(r => setTimeout(() => r(true), 10)));
    setConfirmHandler(confirm);
    const navigate = vi.fn();
    setNavigateFn(navigate);

    handlePopState();
    handlePopState();
    expect(confirm).toHaveBeenCalledTimes(1);
    // Segunda restauração também reempurra a página suja
    expect(navigate).toHaveBeenCalledTimes(2);
    await new Promise(r => setTimeout(r, 20));
    // Confirma → sai para o destino do último pop
    expect(navigate).toHaveBeenLastCalledWith('/', {
      replace: true,
    });
  });

  it('integração com Router real: pop restaura, confirma sai p/ destino', async () => {
    registerDirtySource('a', 'Sujo');
    let resolveConfirm: ((confirmed: boolean) => void) | null = null;
    setConfirmHandler(
      () =>
        new Promise<boolean>(resolve => {
          resolveConfirm = resolve;
        })
    );

    const locations: Array<{ pathname: string; state: unknown }> = [];
    render(
      <MemoryRouter initialEntries={['/lista', '/pagina-suja']} initialIndex={1}>
        <RouterHarness onLocation={l => locations.push(l)} />
      </MemoryRouter>
    );

    setCurrentHref('http://localhost/pagina-suja');
    // Simula o pop já consumado pelo browser: URL corrente é o destino real
    window.history.pushState({}, '', '/destino-pop');

    act(() => {
      handlePopState();
    });

    // O PUSH de restauração aconteceu de verdade na pilha do Router
    const restored = locations.at(-1);
    if (!restored) throw new Error('RouterHarness não registrou nenhuma location');
    expect(restored.pathname).toBe('/pagina-suja');
    expect((restored.state as Record<string, unknown>).__pcNavGuardRestore).toBe(true);

    await act(async () => {
      resolveConfirm?.(true);
      await new Promise(r => setTimeout(r, 0));
    });

    // Confirmação resolve com o Router terminando no destino capturado no pop
    expect(locations.at(-1)?.pathname).toBe('/destino-pop');
    window.history.pushState({}, '', '/');
  });
});
