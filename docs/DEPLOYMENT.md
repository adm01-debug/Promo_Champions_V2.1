# Deploy — Promo Champions V2.1

> Como o sistema realmente vai para produção hoje. Não existe pipeline de
> deploy próprio (PM2, scripts/deploy.sh, servidor dedicado): o frontend é
> publicado pelo **Lovable Cloud** e o backend é o **Supabase Cloud**.

## 1. Componentes de produção

| Componente | Onde roda | Como é atualizado |
|------------|-----------|-------------------|
| Frontend (SPA Vite) | Lovable Cloud — `championgifts.lovable.app` | Botão **Publish** no Lovable (build a partir da `main` do GitHub) |
| Banco Postgres + Auth + PostgREST | Supabase Cloud — projeto `usyxfpqlsspldubptrdl` | Migrations aplicadas **manualmente** via SQL (ver §3) |
| Edge Functions (169, Deno) | Supabase Edge Runtime do mesmo projeto | Deploy **manual** (ver §4) |
| Cron jobs | `pg_cron` no próprio Postgres | Criados/alterados por migration |

## 2. Deploy do frontend (Lovable)

1. Merge do PR na `main` (checks obrigatórios do `pr-checks.yml` verdes).
2. O Lovable sincroniza o repositório e monta a nova versão.
3. No painel do Lovable, clicar **Publish** — só então o build vai ao ar em
   `championgifts.lovable.app`.
4. Rollback instantâneo: no histórico de versões do Lovable, restaurar a
   versão anterior (detalhes em `docs/RUNBOOK.md` → Rollback).

> **Atenção**: o Lovable injeta `VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY`
> da integração configurada **no painel do Lovable**, não do `.env` do repo.
> Se o app publicado estiver falando com o projeto errado, é lá que se corrige
> (a identidade do banco está documentada em
> `docs/estado/IDENTIDADE_BANCO_2026-09-13.md`).

## 3. Migrations (manual — não automático)

As migrations em `supabase/migrations/` **não são aplicadas por nenhum
pipeline**. O processo real:

1. Gerar arquivo com timestamp `YYYYMMDDHHMMSS_descricao.sql`, estritamente
   maior que todas as versões existentes, com comentário descritivo no topo e
   guards (`to_regclass`, `IF NOT EXISTS`) para idempotência.
2. Aplicar o DDL **manualmente** no banco `usyxfpqlsspldubptrdl` — via
   `db_query` no MCP "LOVABLE CLOUD - PROMO CHAMPIONS V2" ou SQL Editor do
   dashboard Supabase. Não usar `supabase db push` nem `supabase migration`.
3. `CREATE INDEX CONCURRENTLY` falha (conexão transacional do pooler) — usar
   `CREATE INDEX` simples.
4. Toda migration nova deve seguir a disciplina expand-contract de
   `docs/ZERO_DOWNTIME_MIGRATIONS.md`.

## 4. Edge Functions

A integração Lovable→Supabase publica functions junto com o Publish, mas a
cobertura **não é garantida** (há functions no repo sem deploy — ex.:
`elevenlabs-stt` responde 404). Depois de cada publish que altera
functions, confirme com `curl` no endpoint; se estiver ausente, deploy
manual:

```bash
supabase functions deploy <nome> --project-ref usyxfpqlsspldubptrdl
```

Antes de mexer numa function:

- `deno lint supabase/functions/<nome>/` e `deno check
  --node-modules-dir=none supabase/functions/<nome>/index.ts` precisam
  passar (o CI `edge-functions-*` cobre isso).
- Toda function passa pelo wrapper `withRequestId` e pelos headers
  compartilhados de `_shared/` — manter o padrão.
- `verify_jwt` só pode ser `false` (em `supabase/config.toml`) para webhooks
  com verificação de assinatura no handler — ver `docs/API.md`.

> Funções listadas no repo podem **não estar deployadas** — o catálogo de
> `docs/API.md` reflete o código, não a publicação. Confirme com um `curl`
> de health no endpoint antes de assumir que existe em produção.

## 5. Secrets e variáveis (configuração manual)

| Onde | O que | Exemplos |
|------|-------|----------|
| Supabase → Edge Functions → Secrets | Chaves usadas pelas functions | `RESEND_API_KEY`, `ELEVENLABS_API_KEY`, `TWILIO_AUTH_TOKEN`, `BITRIX24_*`, `LOVABLE_API_KEY`, `SLACK_WEBHOOK_URL`, `V4_CALLBACK_*`, `*_WEBHOOK_SECRET` |
| Lovable → integração Supabase | Vars do frontend (`VITE_*`) | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` |
| GitHub → Settings → Secrets | Credenciais de CI | `VITE_SUPABASE_*`, `E2E_*`, `SUPABASE_ACCESS_TOKEN` |
| Tabela `provider_credentials` / `integration_connections` | Conectores configurados na UI admin `/admin/conexoes` | Meta Cloud, Z-API, Twilio, n8n, bancos externos |

Referência de envs do frontend em `.env.example` (só o que o código lê).

## 6. Checklist de deploy completo

- [ ] PR mergeado com checks obrigatórios verdes
- [ ] Migrations do pacote aplicadas manualmente no banco canônico
- [ ] Edge functions alteradas deployadas e respondendo (`curl` de smoke)
- [ ] Secrets novos criados no Supabase/Lovable/GitHub conforme o caso
- [ ] **Publish** no Lovable disparado
- [ ] Smoke pós-deploy: login, `/pipeline`, `/admin/platform-slo`
- [ ] Entrada no `CHANGELOG.md` (ver `RELEASE_NOTES.md` → disciplina)

## 7. Rollback

- **Frontend**: restaurar versão anterior no painel Lovable (< 2 min).
- **Migration**: migrations são forward-only — reverter = nova migration
  com o DDL inverso. Nunca editar/apagar migration já aplicada.
- **Edge function**: fazer redeploy da versão anterior a partir do git
  (`git checkout <tag/commit> -- supabase/functions/<nome>` e deploy).
- Detalhes operacionais: `docs/RUNBOOK.md`, hotfix: `docs/HOTFIX.md`.

## 8. Monitoramento pós-deploy

- `/admin/platform-slo` — SLOs 30d (webhooks, callbacks, error-free).
- `/admin/web-vitals` — Web Vitals P75 por rota.
- Uptime externo: ver `docs/RUNBOOK.md` → Monitoramento Externo de Uptime.
- Logs das functions: Supabase Dashboard → Edge Functions → Logs.
