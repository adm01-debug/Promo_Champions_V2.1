# Identidade do banco de produção — prova reproduzível (2026-09-13)

**Fecha a Etapa 1 do plano de 50 etapas.** Toda afirmação abaixo tem o comando
que a produz. Nada aqui foi inferido de documento anterior — três documentos
deste repositório já afirmaram identidade "confirmada" com provas que não se
reproduziam (ver `docs/execucao/HARDENING_CANONICO_2026-08-31.md` e a nota de
02/09 em `CLAUDE.md`, corrigida nesta mesma PR).

## Veredito

| Projeto                | Papel real                                                                                                                                    | Evidência   |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `usyxfpqlsspldubptrdl` | **Banco canônico.** É o que o gateway MCP acessa, o que o CI usa, e o único com o schema + dados.                                             | Ver §1 e §2 |
| `rapjswienfhkobhlamxb` | Projeto **antigo**. Ainda tem todas as edge functions publicadas e respondendo; os crons do banco canônico o chamavam por meses (cruzamento). | Ver §3      |
| `saejqkojleeaxzrslzfg` | Supabase **do Lovable**, compilado no app publicado em `championgifts.lovable.app`. Sem edge functions (404).                                 | Ver §4      |

## §1 — O gateway MCP aponta para usyxf (prova direta)

```
$ curl -s https://supabase-promo-champions-v2-mcp.adm01.workers.dev/health
{"ok":true,"service":"supabase-mcp-gateway","project":"https://usyxfpqlsspldubptrdl.supabase.co","tools":90,...}
```

O conector deste gateway aparece no Claude com o rótulo **"MCP - SUPABASE
LOVABLE CLOUD - PROMO CHAMPIONS V2"**. O "LOVABLE CLOUD" no nome é enganoso —
ele aponta para o projeto Supabase direto, não para o Lovable Cloud. O
conector `SUPABASE_PROMO_CHAMPIONS_-_V2_MCP` citado no `CLAUDE.md` responde
`Management API 401: Unauthorized` e está inutilizável.

## §2 — Laço completo: escrever pela API pública, ler pelo MCP

```
$ curl -X POST https://usyxfpqlsspldubptrdl.supabase.co/functions/v1/log-web-vitals \
    -H 'apikey: <anon>' -d '{"route":"/__probe","metric":"TTFB","value":1,"rating":"good"}'
{"inserted":1,"request_id":"7f8d7e75-2798-44a6-84de-31052fb31e52"}

-- via MCP, 20 minutos depois:
SELECT count(*) FROM public.web_vitals_samples WHERE route='/__probe' AND created_at > now()-interval '30 minutes';
→ 1
```

A linha gravada pela edge function de usyxf apareceu no banco lido pelo MCP.
Não há outra explicação possível.

## §3 — O cruzamento com o projeto antigo

```sql
SELECT jobid, command FROM cron.job_run_details GROUP BY 1,2;
-- 10 dos 25 jobs: net.http_post(url := 'https://rapjswienfhkobhlamxb.supabase.co/functions/v1/…',
--                                headers := '{"apikey":"eyJ…"}')   -- JWT com "ref":"rapjswienfhkobhlamxb"

SELECT proname FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND pg_get_functiondef(p.oid) LIKE '%rapjswienfhkobhlamxb%';
-- broadcast_sale_completed, trigger_campaign_health_alert,
-- trigger_auto_coaching_on_recording, trg_recording_generate_coaching
```

```
$ curl -X POST https://rapjswienfhkobhlamxb.supabase.co/functions/v1/cron-failure-alerter -H 'apikey: <anon rapjs>'  → 200
$ curl -X POST https://usyxfpqlsspldubptrdl.supabase.co/functions/v1/cron-failure-alerter                           → 404
```

Até 2026-08-30 14:44 UTC, o pg_cron **de usyxf** disparava functions **de rapjs**,
que operavam **no banco de rapjs**. Os 140.713 registros em `job_run_details`
e as 417 respostas em `net._http_response` são desse cruzamento. As migrations
foram escritas quando rapjs era o projeto, e o banco novo herdou os comandos.
A migration `20260903000002_fix_cron_project_ref.sql` diagnosticou isso
corretamente, mas nunca foi aplicada — e `cron.job` já estava vazio.

## §4 — Frontends publicados

| URL                                      | Estado                                                                       | Supabase compilado                           |
| ---------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------- |
| `championgifts.lovable.app`              | funciona (título "Dashboard", chama a API)                                   | `saejqkojleeaxzrslzfg` — sem functions (404) |
| `pixels-with-personality-09.lovable.app` | HTML responde, nenhum ref supabase nos chunks                                | —                                            |
| `promo-champions-v2-1.vercel.app` (main) | **quebrado**: `VITE_SUPABASE_URL is not set`                                 | nenhum (env não configurado no Vercel)       |
| CI (E2E Playwright)                      | usa `VITE_SUPABASE_URL` secret → usyxf; traces mostram 82× usyxf e 27× rapjs | usyxf                                        |

**Nenhum frontend publicado aponta corretamente para o banco canônico.** O
único tráfego que usyxf recebe é o E2E do CI (100% dos web vitals dos últimos
14 dias têm viewports 1280/390/412 — os perfis Playwright — e rotas `/auth`,
`/reset-password`). Há 2 usuários em `auth.users` (o real, último login
2026-07-23; o de E2E, criado 2026-09-03, nunca logou com sucesso). **O sistema
está em pré-lançamento.**

## Consequências para o plano de 50 etapas

- Etapa 1: **concluída** por este documento.
- Etapa 2 (token de Management API para usyxf) continua sendo o gargalo: sem
  ela não há como publicar as 170 functions em usyxf (etapa 10) nem reagendar
  os 10 crons HTTP apontando para o lugar certo (etapa 7, parte 2).
- Etapa 7, parte 1 (12 crons SQL): migration em PR #144, aguardando aplicação.
- As 4 funções SQL com ref antigo (§3) precisam de migration própria lendo
  `_internal_secrets.functions_base_url`, que ainda não existe na tabela (só
  `coaching_cron_secret`). Depende de `anon_key` de usyxf, que não está no
  repositório nem no banco — está no secret `VITE_SUPABASE_PUBLISHABLE_KEY` do
  GitHub e no secret `ANON_KEY` do worker.
- Vercel: configurar `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` no
  projeto `promo-champions-v2-1` transforma o deploy quebrado no frontend
  canônico. Decisão do operador.
