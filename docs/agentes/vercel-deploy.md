# Vercel e deploy — referência para agentes

Ler quando for confirmar um deploy ou mexer em env vars/domínio do frontend. Processo completo e
checklist: `docs/DEPLOYMENT.md` (revisado 2026-10-18) — este arquivo é só o atalho rápido.

| O que | Valor |
|---|---|
| Projeto Vercel | `promo-champions-v2-1` (conta/team `juca1`) |
| Domínio de produção | `https://promo-champions-v2-1.vercel.app` |
| Domínio legado | `championgifts.lovable.app` ainda responde um bundle antigo — **não é** produção |
| Preview URL pattern | `promo-champions-v2-1-git-<branch-slug>-juca1.vercel.app` |
| Deploy do frontend | automático: integração Vercel↔GitHub builda e publica a `main` a cada push; cada PR gera preview próprio |
| Framework / build / output | Vite + React · `npm run build` · `dist/` |
| `vercel.json` | só `rewrites` (SPA fallback) e headers de segurança (`CSP`, `HSTS`, `X-Frame-Options`); não define build command |
| Env vars do frontend | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` — **nunca podem ficar vazias** no painel da Vercel: `src/integrations/supabase/env.ts` tem fallback público, mas env **vazia** (não ausente) sobrescreve o fallback e o app morre no boot (incidente de 2026-10-12, ver `docs/DEPLOYMENT.md` §2) |
| Edge Functions / migrations | **não** saem pela Vercel — deploy manual via Supabase CLI, ver `docs/DEPLOYMENT.md` §3–4 e `docs/agentes/banco-e-mcp.md` |

## Como confirmar que um merge virou deploy de verdade

O MCP `Vercel` desta sessão **não lista nem lê este projeto** (`list_projects`/`get_project` voltam
vazio/404 para `team_QyN41X0q8hrqhW80AwokbFLv`, mesmo listando o team `juca1` em `list_teams`) —
token sem acesso a este projeto específico. Não dá para confirmar deploy por `mcp__Vercel__*` aqui.
A confirmação real:

1. Status check `Vercel` no commit/PR (`github_get_commit`, campo `status.contexts`, ou
   `statusCheckRollup` por GraphQL) — `state: SUCCESS` com `description: "Deployment has completed"`
   e `targetUrl` apontando para `vercel.com/juca1/promo-champions-v2-1/<deployment>`.
2. O bot `vercel[bot]` comenta na PR com a tabela Preview/Production e o status (`Building` →
   `Ready`/`Error`) — mesmo comentário é editado a cada atualização, não cria um novo.
3. Sem acesso a nenhum dos dois, pedir ao dono para confirmar no painel
   `vercel.com/juca1/promo-champions-v2-1`.

## Discrepância conhecida (não corrigida aqui)

`.github/workflows/deploy.yml` descreve o deploy do frontend como "Lovable Cloud" e diz que "não há
CLI" — isso é texto desatualizado de antes da migração para Vercel. `docs/DEPLOYMENT.md` (mais
recente, revisado 2026-10-18) e o status check `Vercel` observado em PRs reais confirmam que o
mecanismo atual é a integração Vercel↔GitHub. `deploy.yml` nunca foi atualizado para refletir isso;
ele continua útil para o que de fato faz (revalidar antes de taguear release, e tentar deploy de
edge functions/migrations se os secrets `SUPABASE_ACCESS_TOKEN`/`SUPABASE_DB_PASSWORD` existirem).

## Env vars — regras

- `VITE_*` vai para o bundle e é público — nunca segredo com prefixo `VITE_` no Vercel.
- Chaves de servidor (Resend, ElevenLabs, Twilio, Bitrix24, Slack, LOVABLE_API_KEY) são secret de
  **Edge Function** (Supabase), nunca do Vercel — não há serverless neste projeto na Vercel.
- Lista completa de onde cada secret mora: `docs/DEPLOYMENT.md` §5.
