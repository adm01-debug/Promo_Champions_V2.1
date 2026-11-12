import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Regressão da PR #439: a troca de domínio ficou só em `APP_URL`, mas
 * canonical, og:url, twitter:url, og:image, JSON-LD, robots.txt e sitemap.xml
 * continuavam apontando para apps legados da Lovable — links compartilhados e
 * buscadores levavam para fora da produção.
 */
const PRODUCAO = 'https://promo-champions-v2-1.vercel.app';
const raiz = path.resolve(__dirname, '../..');
const ler = (arquivo: string) => readFileSync(path.join(raiz, arquivo), 'utf8');

const ARQUIVOS_PUBLICOS = ['index.html', 'public/robots.txt', 'public/sitemap.xml'];

describe('domínio público do app', () => {
  it.each(ARQUIVOS_PUBLICOS)('%s não referencia domínio legado da Lovable', arquivo => {
    expect(ler(arquivo)).not.toMatch(/lovable\.app/);
  });

  it('APP_URL padrão é o domínio de produção', async () => {
    const { APP_URL } = await import('./external');
    expect(APP_URL).toBe(import.meta.env.VITE_APP_URL ?? PRODUCAO);
  });

  it('canonical, og:url, twitter:url e imagens do index.html usam o domínio de produção', () => {
    const html = ler('index.html');
    expect(html).toContain(`<link rel="canonical" href="${PRODUCAO}/" />`);
    expect(html).toContain(`<meta property="og:url" content="${PRODUCAO}/" />`);
    expect(html).toContain(`<meta name="twitter:url" content="${PRODUCAO}/" />`);
    expect(html).toContain(
      `<meta property="og:image" content="${PRODUCAO}/icon-512.png">`
    );
    expect(html).toContain(
      `<meta name="twitter:image" content="${PRODUCAO}/icon-512.png">`
    );
    expect(html).toContain(`"url": "${PRODUCAO}/"`);
  });

  it('robots.txt aponta o sitemap do domínio de produção', () => {
    expect(ler('public/robots.txt')).toContain(`Sitemap: ${PRODUCAO}/sitemap.xml`);
  });
});
