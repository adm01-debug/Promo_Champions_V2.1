/**
 * Guard de configuração de testes — falha quando um padrão declarado não casa
 * nenhum arquivo, ou quando existe um arquivo de spec "órfão" (presente no
 * disco mas fora de todos os padrões de algum runner).
 *
 * Histórico (docs/estado/12_INFRA_CI_TESTES.md §5.4): specs que nenhum pipeline
 * executava e um vitest.node.config.ts com lista fixa que perdia arquivos
 * novos. Os padrões são extraídos dos próprios arquivos de config por texto
 * (importá-los quebraria o `__dirname`/ESM do vite) — se o formato do config
 * mudar a ponto de a extração não achar nada, o guard falha e pede revisão,
 * nunca aprova em silêncio.
 *
 * Rodar: npm run test:config
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures: string[] = [];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name.startsWith('.')) continue;
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) out.push(...walk(full));
    else if (stat.isFile()) out.push(full);
  }
  return out;
}

const ESCAPE_RE = /[.+^${}()|[\]\\]/g;

/** Traduz glob simples (**, *, {a,b}, ?) para RegExp — sem dependência de glob lib. */
function globToRegExp(glob: string): RegExp {
  let out = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*' && glob[i + 1] === '*') {
      // '**/' casa zero ou mais diretórios; '**' isolado casa qualquer trecho
      const withSlash = glob[i + 2] === '/';
      out += withSlash ? '(?:.*/)?' : '.*';
      i += withSlash ? 2 : 1;
    } else if (c === '*') {
      out += '[^/]*';
    } else if (c === '?') {
      out += '[^/]';
    } else if (c === '{') {
      const end = glob.indexOf('}', i);
      if (end === -1) {
        out += '\\{';
        continue;
      }
      const alts = glob
        .slice(i + 1, end)
        .split(',')
        .map((a) => a.replace(ESCAPE_RE, '\\$&'));
      out += `(?:${alts.join('|')})`;
      i = end;
    } else {
      out += c.replace(ESCAPE_RE, '\\$&');
    }
  }
  return new RegExp(`^${out}$`);
}

const srcFiles = walk(join(ROOT, 'src')).map((f) => relative(ROOT, f));
const readConfig = (name: string) => readFileSync(join(ROOT, name), 'utf-8');

/** Extrai valores de um array literal de strings, ex.: ['a', 'b']. */
function stringArray(source: string, key: string): string[] {
  const m = source.match(new RegExp(`${key}:\\s*\\[([^\\]]*)\\]`));
  if (!m) return [];
  return [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
}

/** Extrai literal regex ou string de `key:` num bloco de texto. */
function literalPatterns(block: string, key: string): RegExp[] {
  const out: RegExp[] = [];
  const re = new RegExp(`${key}:\\s*(\\[[^\\]]*\\]|\\/[^\\n]+?\\/[a-z]*|'[^']*'|"[^"]*")`, 'g');
  for (const m of block.matchAll(re)) {
    const raw = m[1];
    const items = raw.startsWith('[')
      ? [...raw.matchAll(/\/[^\n]+?\/[a-z]*|'[^']*'|"[^"]*"/g)].map((x) => x[0])
      : [raw];
    for (const item of items) {
      if (item.startsWith('/')) {
        const lastSlash = item.lastIndexOf('/');
        out.push(new RegExp(item.slice(1, lastSlash), item.slice(lastSlash + 1)));
      } else {
        out.push(new RegExp(item.slice(1, -1)));
      }
    }
  }
  return out;
}

function pathLiteral(source: string, key: string): string | null {
  const m = source.match(new RegExp(`${key}:\\s*'([^']+)'`));
  return m ? m[1] : null;
}

// --- vitest.config.ts ------------------------------------------------------
{
  const source = readConfig('vitest.config.ts');

  // O include de specs é o array que contém '{test,spec}' (o include de
  // coverage vem depois e cobre todo src/**).
  const includeBlocks = [...source.matchAll(/include:\s*\[([^\]]*)\]/g)].map((m) => m[1]);
  const specIncludeRaw = includeBlocks.find((b) => b.includes('{test,spec}'));
  if (!specIncludeRaw) {
    failures.push('vitest.config.ts: guard não encontrou o include de specs (formato mudou?)');
  }
  const include = specIncludeRaw
    ? [...specIncludeRaw.matchAll(/'([^']+)'/g)].map((x) => x[1])
    : [];
  const exclude = stringArray(source, 'exclude');

  for (const pattern of include) {
    if (!srcFiles.some((f) => globToRegExp(pattern).test(f))) {
      failures.push(`vitest.config.ts: include '${pattern}' não casa nenhum arquivo`);
    }
  }

  // Qualquer spec sob src/ precisa estar coberto pelo include declarado —
  // senão entra no disco mas nunca roda.
  const SPEC_RE = /\.(test|spec)\.(ts|tsx|mts|cts|js|jsx|mjs|cjs)$/;
  for (const file of srcFiles.filter((f) => SPEC_RE.test(f))) {
    const covered =
      include.some((g) => globToRegExp(g).test(file)) &&
      !exclude.some((g) => globToRegExp(g).test(file));
    if (!covered) failures.push(`spec órfão do vitest (fora do include): ${file}`);
  }

  for (const setup of stringArray(source, 'setupFiles')) {
    if (!existsSync(join(ROOT, setup.replace(/^\.\//, '')))) {
      failures.push(`vitest.config.ts: setupFiles aponta para arquivo inexistente: ${setup}`);
    }
  }
}

// --- playwright -------------------------------------------------------------
function checkPlaywright(label: string): void {
  const source = readConfig(label);
  const testDir = pathLiteral(source, 'testDir') ?? './tests/e2e';
  const absDir = join(ROOT, testDir);
  if (!existsSync(absDir)) {
    failures.push(`${label}: testDir inexistente: ${testDir}`);
    return;
  }
  const specs = walk(absDir)
    .map((f) => relative(absDir, f))
    .filter((f) => f.endsWith('.spec.ts') || f.endsWith('.spec.tsx'));

  const globalSetup = pathLiteral(source, 'globalSetup');
  if (globalSetup && !existsSync(join(ROOT, globalSetup.replace(/^\.\//, '')))) {
    failures.push(`${label}: globalSetup inexistente: ${globalSetup}`);
  }

  // testMatch top-level (usado pelo config a11y)
  const topLevel = source.split('projects:')[0] ?? source;
  for (const re of literalPatterns(topLevel, 'testMatch')) {
    if (!specs.some((s) => re.test(s))) {
      failures.push(`${label}: testMatch ${re} não casa nenhum spec em ${testDir}`);
    }
  }

  const projectsBlock = source.split('projects:')[1];
  if (!projectsBlock) return;

  const covered = new Set<string>();
  const chunks = projectsBlock.split(/\{[^{}]*name:/).slice(1);
  if (chunks.length === 0) {
    failures.push(`${label}: guard não encontrou projetos (formato mudou?)`);
    return;
  }
  for (const chunk of chunks) {
    const name = chunk.match(/'([^']+)'/)?.[1] ?? '?';
    const match = literalPatterns(chunk, 'testMatch');
    const ignore = literalPatterns(chunk, 'testIgnore');
    const selected = specs.filter(
      (s) =>
        (match.length === 0 || match.some((re) => re.test(s))) &&
        !ignore.some((re) => re.test(s)),
    );
    if (selected.length === 0) {
      failures.push(`${label}: projeto '${name}' seleciona zero specs em ${testDir}`);
    }
    selected.forEach((s) => covered.add(s));
  }
  for (const spec of specs) {
    if (!covered.has(spec)) {
      failures.push(`spec órfão de todos os projetos ${label}: ${testDir}/${spec}`);
    }
  }
}

checkPlaywright('playwright.config.ts');
checkPlaywright('playwright.a11y.config.ts');

// ---------------------------------------------------------------------------
if (failures.length > 0) {
  console.error('\n❌ Drift de configuração de testes detectado:\n');
  for (const f of failures) console.error(`   • ${f}`);
  console.error(
    '\nUm padrão sem arquivos esconde specs mortos; um spec fora de todos os padrões nunca executa.\n',
  );
  process.exit(1);
}

console.log('✅ Todos os padrões de spec declarados casam arquivos e nenhum spec está órfão.');
