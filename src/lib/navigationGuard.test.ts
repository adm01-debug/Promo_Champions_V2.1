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

  it('handlePopState re-empurra a página e sai ao confirmar', async () => {
    registerDirtySource('a', 'Sujo');
    setCurrentHref(window.location.href);
    setConfirmHandler(vi.fn().mockResolvedValue(true));
    const pushState = vi.spyOn(window.history, 'pushState');
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});

    handlePopState();
    expect(pushState).toHaveBeenCalled();
    await new Promise(r => setTimeout(r, 0));
    expect(back).toHaveBeenCalled();
  });

  it('handlePopState não sai quando o usuário cancela', async () => {
    registerDirtySource('a', 'Sujo');
    setCurrentHref(window.location.href);
    setConfirmHandler(vi.fn().mockResolvedValue(false));
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});

    handlePopState();
    await new Promise(r => setTimeout(r, 0));
    expect(back).not.toHaveBeenCalled();
  });

  it('handlePopState ignora sem sujeira', () => {
    const pushState = vi.spyOn(window.history, 'pushState');
    handlePopState();
    expect(pushState).not.toHaveBeenCalled();
  });
});
