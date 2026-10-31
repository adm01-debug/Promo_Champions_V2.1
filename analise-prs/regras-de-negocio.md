# Regras de Negocio — Promo Champions V2.1

> Extraido de: migrations, edge functions, schema, testes, UI e historico de PRs.
> SHA de referencia: `7e7ca4342ce9e96ed74f277f7027101b9ff9cdf9` (main, 2026-10-31)

## 1. Multi-tenancy

- Toda tabela com dados de negocio possui coluna `tenant_id UUID NOT NULL`.
- RLS ativa em todas as tabelas publicas: acesso limitado ao `tenant_id` do JWT do usuario.
- Portfolio settings: acesso restrito por padrao de chave (`key LIKE 'portfolio.%'`), nao por `tenant_id` direto — migration `20260718000002`.

## 2. Campanhas e Status

- Status validos para quote/pedido: `draft → pending → confirmed → fulfilled → cancelled`.
- Estados terminais: `fulfilled`, `cancelled`. Nenhuma transicao pode sair de um estado terminal.
- Regra de integridade: migration `20260718000001` bloqueia downgrade de `fulfilled`/`cancelled` por trigger.
- Regra de negocio: um pedido cancelado nao pode ser reaberto; um pedido cumprido nao pode ser cancelado.

## 3. Tarefas de Cadencia (claim_pending_cadence_tasks)

- Workers concorrentes usam `FOR UPDATE SKIP LOCKED` para evitar processamento duplo.
- Apenas tasks com `status = 'active'` sao elegiveis para claim — migration `20260718000003`.
- Idempotencia garantida: claim falha silenciosamente se task ja foi assumida.

## 4. Autenticacao e Acesso

- Suporte a WebAuthn/passkeys: fluxo em `supabase/functions/webauthn/index.ts`.
- Protecao contra account takeover: validacao de `credential.user.id` vs `user.id` (linhas 309-350).
- Mensagens multicanal exigem autenticacao: `send-multichannel-message` verifica JWT antes de despachar (linhas 231-242, 274).

## 5. Exportacao de Dados

- CSV exportado por `scheduled-reports-runner/index.ts`: funcao `toCSV()` neutraliza formulas com prefixo de apostrofo.
- Relatorios via `src/utils/reportDownload.ts`: sanitizacao aplicada na linha 75.
- Regra: nenhum campo exportado pode iniciar com `=`, `+`, `-`, `@` sem escape.

## 6. Dependencias e Stack

- React 18.3.x (nao migrado para 19 — decisao humana pendente, PR #252).
- TypeScript 5.x (nao migrado para 6 — decisao humana pendente, PR #254).
- Supabase como BaaS: Auth, Database (PostgreSQL), Edge Functions (Deno), Storage.
- Build: Vite + vite-plugin-pwa (versao atual; upgrade para 2.x e decisao humana, PR #254).

## 7. CI/CD

- CI Gate obrigatorio: bloqueia merge se falhar.
- E2E Tests: executam em cada PR mas nao sao gate obrigatorio (C3 — DECISAO HUMANA).
- Deploy automatico via Vercel: merge em `main` = producao imediata.
- Regra: nenhuma PR com falha de Lint, TypeCheck ou Build deve ser mergeada.

## 8. Seguranca

- Segredos nunca em codigo: apenas em variaveis de ambiente do servico.
- RLS habilitada e verificada para todas as tabelas criticas.
- Dependabot ativo: PRs de atualizacao geradas automaticamente.
