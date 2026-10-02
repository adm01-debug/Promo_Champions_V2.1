import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  useMarkupMinSamplePreference,
  MIN_SAMPLE_OPTIONS,
} from './useMarkupMinSamplePreference';

const STORAGE_KEY = 'reports.markupMinSample';

beforeEach(() => {
  window.localStorage.clear();
});

describe('useMarkupMinSamplePreference', () => {
  it('começa com a amostra padrão 1 e expõe as opções', () => {
    const { result } = renderHook(() => useMarkupMinSamplePreference());
    expect(result.current.minSample).toBe(1);
    expect(result.current.options).toEqual(MIN_SAMPLE_OPTIONS);
  });

  it('lê valor válido persistido no localStorage', () => {
    window.localStorage.setItem(STORAGE_KEY, '5');
    const { result } = renderHook(() => useMarkupMinSamplePreference());
    expect(result.current.minSample).toBe(5);
  });

  it('ignora valor inválido persistido e volta ao padrão', () => {
    window.localStorage.setItem(STORAGE_KEY, '42');
    const { result } = renderHook(() => useMarkupMinSamplePreference());
    expect(result.current.minSample).toBe(1);
  });

  it('setMinSample persiste valor válido e normaliza inválido', () => {
    const { result } = renderHook(() => useMarkupMinSamplePreference());

    act(() => result.current.setMinSample(3));
    expect(result.current.minSample).toBe(3);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('3');

    act(() => result.current.setMinSample(99));
    expect(result.current.minSample).toBe(1);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('1');
  });

  it('sincroniza via CustomEvent entre componentes na mesma aba', () => {
    const a = renderHook(() => useMarkupMinSamplePreference());
    const b = renderHook(() => useMarkupMinSamplePreference());

    act(() => a.result.current.setMinSample(5));
    expect(b.result.current.minSample).toBe(5);
  });
});
