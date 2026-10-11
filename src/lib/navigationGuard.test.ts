import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
    // Restaura a página suja via PUSH marcado (pop já havia acontecido)
    expect(navigate).toHaveBeenCalledWith('http://localhost/pagina-suja', {
      replace: false,
      state: { __pcNavGuardRestore: true },
    });
    await new Promise(r => setTimeout(r, 0));
    // Confirmação → navega para o destino real do pop via replace
    expect(navigate).toHaveBeenLastCalledWith(window.location.href, {
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
    expect(navigate).toHaveBeenLastCalledWith(window.location.href, {
      replace: true,
    });
  });
});
