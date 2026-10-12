import { describe, it, expect, beforeEach } from 'vitest';
import { migrateLegacyDraft } from './draftMigration';

const LEGACY = 'draft:legacy';
const NEW_KEY = 'draft:new';

// Baseline de exemplo: form com todos os campos vazios e sem itens.
const destIsBaseline = (d: { form?: Record<string, unknown>; items?: unknown[] }) =>
  d?.form !== undefined &&
  Object.values(d.form).every(v => v === '' || v === '0') &&
  (d?.items?.length ?? 0) === 0;

const EMPTY_DRAFT = JSON.stringify({
  form: { name: '', total: '0' },
  items: [],
});
const LEGACY_DRAFT = JSON.stringify({
  form: { name: 'Cliente Legado', total: '8000' },
  items: [],
});
const REAL_DRAFT = JSON.stringify({
  form: { name: 'Novo Rascunho', total: '0' },
  items: [],
});

describe('migrateLegacyDraft', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('retorna none quando não há legado', () => {
    expect(migrateLegacyDraft(LEGACY, NEW_KEY, destIsBaseline)).toBe('none');
  });

  it('migra quando o destino não existe', () => {
    localStorage.setItem(LEGACY, LEGACY_DRAFT);
    expect(migrateLegacyDraft(LEGACY, NEW_KEY, destIsBaseline)).toBe('migrated');
    expect(localStorage.getItem(NEW_KEY)).toBe(LEGACY_DRAFT);
    expect(localStorage.getItem(LEGACY)).toBeNull();
  });

  it('migra por cima de destino que é só baseline vazio', () => {
    localStorage.setItem(LEGACY, LEGACY_DRAFT);
    localStorage.setItem(NEW_KEY, EMPTY_DRAFT);
    expect(migrateLegacyDraft(LEGACY, NEW_KEY, destIsBaseline)).toBe('migrated');
    expect(localStorage.getItem(NEW_KEY)).toBe(LEGACY_DRAFT);
    expect(localStorage.getItem(LEGACY)).toBeNull();
  });

  it('preserva os dois quando o destino tem conteúdo real', () => {
    localStorage.setItem(LEGACY, LEGACY_DRAFT);
    localStorage.setItem(NEW_KEY, REAL_DRAFT);
    expect(migrateLegacyDraft(LEGACY, NEW_KEY, destIsBaseline)).toBe('kept');
    expect(localStorage.getItem(NEW_KEY)).toBe(REAL_DRAFT);
    expect(localStorage.getItem(LEGACY)).toBe(LEGACY_DRAFT);
  });

  it('campo secundário editado conta como conteúdo real', () => {
    localStorage.setItem(LEGACY, LEGACY_DRAFT);
    localStorage.setItem(
      NEW_KEY,
      JSON.stringify({ form: { name: '', total: '0', currency: 'USD' }, items: [] })
    );
    expect(migrateLegacyDraft(LEGACY, NEW_KEY, destIsBaseline)).toBe('kept');
    expect(localStorage.getItem(LEGACY)).toBe(LEGACY_DRAFT);
  });

  it('itens no destino contam como conteúdo real', () => {
    localStorage.setItem(LEGACY, LEGACY_DRAFT);
    localStorage.setItem(
      NEW_KEY,
      JSON.stringify({ form: { name: '', total: '0' }, items: [{ qty: 1 }] })
    );
    expect(migrateLegacyDraft(LEGACY, NEW_KEY, destIsBaseline)).toBe('kept');
  });

  it('destino corrompido não impede a migração', () => {
    localStorage.setItem(LEGACY, LEGACY_DRAFT);
    localStorage.setItem(NEW_KEY, '{invalido');
    expect(migrateLegacyDraft(LEGACY, NEW_KEY, destIsBaseline)).toBe('migrated');
    expect(localStorage.getItem(NEW_KEY)).toBe(LEGACY_DRAFT);
  });
});
