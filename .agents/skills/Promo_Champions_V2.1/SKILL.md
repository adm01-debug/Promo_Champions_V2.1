---
name: promo-champions-v2-1
description: Convenções de código e commit do Promo_Champions_V2.1 (TypeScript, Conventional Commits). Use ao alterar código, criar testes ou escrever mensagem de commit neste repositório; as regras operacionais ficam em AGENTS.md.
---

# Promo Champions V2.1 — convenções

As regras de trabalho (banco, fluxo Git, PR, comunicação) estão em `AGENTS.md` na raiz — este skill só
resume convenções de código e commit.

## Commits

Padrão Conventional Commits, cobrado pelo hook `commit-msg` (`npx commitlint --edit`, regras em
`commitlint.config.js`): `<tipo>(<escopo>): <assunto>` — assunto em PT-BR, imperativo, sem ponto final.
Tipos: `feat fix docs style refactor perf test chore ci build` (não existe `infra`; branch `infra` →
`chore:` ou `ci:`). Escopo é opcional, mas quando existir precisa ser um de: `auth bi crm gamification
ui hooks services db config deps`.

Exemplo: `fix(db): corrige índice ausente no filtro de propostas`

## Código

- Linguagem: TypeScript (front Vite + React em `src/`, edge functions Deno em `supabase/functions/`).
- Import absoluto pelo alias `@` → `src/` (`vite.config.ts`); caminho relativo só dentro da própria pasta.
- Funções `camelCase`, componentes/classes `PascalCase`, constantes `SCREAMING_SNAKE_CASE`; arquivo de
  componente/página com o nome do componente (`SaleHUDCard.tsx`), hook `useAlgo.ts`.
- `src/components/`: exports nomeados. `src/pages/`: `export default` — `src/routes/lazyPages.ts` carrega
  cada página com `React.lazy`, que exige o default.
- Testes unitários ao lado do módulo (`*.test.ts(x)` ou `__tests__/`); Playwright em `tests/e2e/`, a11y em
  `tests/a11y/`, contratos de migration em `tests/migrations/`. Rode só o que tocou:
  `npx vitest run <caminho>`.
- Siga os padrões já existentes no módulo; não desvie sem motivo registrado na PR.
