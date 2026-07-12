import { describe, it, expect } from 'vitest';
import { applyMergeTags, extractMergeTags, AVAILABLE_MERGE_TAGS } from './mergeTags';

const ctx = {
  sale: { client_name: 'Fallback Cliente', amount: 12500.5, stage: 'qualified', category: 'Premium', source: 'Linkedin' },
  client: { name: 'Ana Souza', company: 'Acme', email: 'ana@acme.com', phone: '(11) 9 8888-7777' },
  salesperson: { name: 'Maria', email: 'maria@ent.com' },
  custom: { 'singu.primeira_frase': 'Vi que vocês cresceram 30%' },
};

describe('applyMergeTags', () => {
  it('substitui tags de cliente', () => {
    expect(applyMergeTags('Olá {{cliente.nome}} da {{cliente.empresa}}', ctx))
      .toBe('Olá Ana Souza da Acme');
  });

  it('faz fallback para sale.client_name se client.name ausente', () => {
    const c = { ...ctx, client: null };
    expect(applyMergeTags('Oi {{cliente.nome}}', c)).toBe('Oi Fallback Cliente');
  });

  it('mostra placeholder [x] quando ausente', () => {
    expect(applyMergeTags('{{cliente.telefone}}', { client: {}, sale: {} }))
      .toBe('[telefone]');
  });

  it('formata valor como BRL', () => {
    const out = applyMergeTags('Total: {{negocio.valor}}', ctx);
    expect(out).toMatch(/Total: R\$\s?12\.500,50/);
  });

  it('retorna [valor] quando amount ausente', () => {
    expect(applyMergeTags('{{negocio.valor}}', { sale: {} })).toBe('[valor]');
  });

  it('resolve data.hoje e data.amanha em pt-BR', () => {
    const hoje = applyMergeTags('{{data.hoje}}', {});
    const amanha = applyMergeTags('{{data.amanha}}', {});
    expect(hoje).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    expect(amanha).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    expect(hoje).not.toBe(amanha);
  });

  it('resolve singu.primeira_frase via custom', () => {
    expect(applyMergeTags('{{singu.primeira_frase}}', ctx)).toBe('Vi que vocês cresceram 30%');
  });

  it('mantém tag desconhecida intacta', () => {
    expect(applyMergeTags('{{tag.inexistente}}', {})).toBe('{{tag.inexistente}}');
  });

  it('resolve tag custom arbitrária', () => {
    expect(applyMergeTags('{{promo}}', { custom: { promo: '20% OFF' } })).toBe('20% OFF');
  });

  it('lida com string vazia', () => {
    expect(applyMergeTags('', ctx)).toBe('');
  });

  it('lida com case-insensitive e espaços dentro das chaves', () => {
    expect(applyMergeTags('{{ Cliente.Nome }}', ctx)).toBe('Ana Souza');
  });

  it('substitui múltiplas ocorrências', () => {
    expect(applyMergeTags('{{vendedor.nome}} — {{vendedor.nome}}', ctx))
      .toBe('Maria — Maria');
  });
});

describe('extractMergeTags', () => {
  it('extrai tags únicas', () => {
    const t = 'Oi {{cliente.nome}}, sou {{vendedor.nome}}. Oi de novo {{cliente.nome}}.';
    expect(extractMergeTags(t).sort()).toEqual(['cliente.nome', 'vendedor.nome']);
  });

  it('retorna [] para string vazia', () => {
    expect(extractMergeTags('')).toEqual([]);
  });

  it('retorna [] quando não há tags', () => {
    expect(extractMergeTags('sem tags aqui')).toEqual([]);
  });
});

describe('AVAILABLE_MERGE_TAGS catálogo', () => {
  it('tem tags únicas', () => {
    const keys = AVAILABLE_MERGE_TAGS.map(t => t.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('todas têm label e example não vazios', () => {
    AVAILABLE_MERGE_TAGS.forEach(t => {
      expect(t.label.length).toBeGreaterThan(0);
      expect(t.example.length).toBeGreaterThan(0);
    });
  });
});
