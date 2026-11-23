# 04 — Plano de correção em etapas

> Auditoria de QA somente-leitura executada em 2026-11-22/23 no commit `17e5d6d`
> (`chore(main): release 1.7.4`). Nenhum arquivo de código, migration, dado ou
> serviço foi alterado durante a auditoria.

## Instruções para o agente executor

Você vai executar este plano sem acesso a quem o escreveu e sem a conversa que o
gerou. Tudo o que você precisa está neste arquivo, em `03-ACHADOS.md` (evidência
de cada achado) e em `01-INVENTARIO.md` (mapa do sistema). Siga estas regras:

1. **Uma etapa por vez, na ordem**, respeitando o campo `Depende de`. Cada etapa
   nasce em sua própria branch e termina em sua própria PR. Nunca agrupe etapas
   "porque são parecidas" — o plano já agrupou o que podia ser agrupado.
2. **Antes de mudar qualquer coisa, releia a evidência da etapa no código atual.**
   O repositório tem vários agentes trabalhando em paralelo; o código pode já ter
   mudado. Se o que a etapa descreve não corresponde mais ao que está lá, **pare,
   registre em `05-PROGRESSO.md` (`[~] NNN — divergente: <o que você encontrou>`)
   e siga para a próxima etapa independente.** Não adapte a etapa por conta
   própria.
3. **Corrija a causa raiz com a menor mudança possível.** Não refatore, não
   renomeie, não reorganize, não "melhore" o que a etapa não pede. Diff mínimo.
   O campo `Não tocar / armadilhas` existe para isso — leia antes de começar.
4. **Problema novo encontrado no caminho não é corrigido na hora.** Anote em
   `05-PROGRESSO.md`, na seção "Achados novos (não planejados)", com
   arquivo:linha. Expandir escopo é o erro mais caro aqui.
5. **Etapa marcada `Precisa de aprovação humana: sim` termina com a PR aberta**,
   com o corpo preenchido e o dono avisado. Não faça merge, mesmo com CI verde.
6. **Uma etapa só é concluída com a verificação executada e a evidência anotada**
   (saída do comando, resultado da consulta, status HTTP). "Deveria funcionar"
   não conclui etapa. Se a verificação não puder ser executada no seu ambiente,
   registre isso explicitamente em vez de marcar a etapa como pronta.
7. **Antes de abrir a PR**, rode `npm run typecheck`, `npm run lint` e
   `npm run test` e confirme que os arquivos que você tocou passam. Erro herdado
   do `main` não é seu: anote e siga.
8. Commits e PRs em **PT-BR**, com prefixo convencional
   (`fix:`, `feat:`, `chore:`, `ci:`, `refactor:`, `test:`, `docs:`, `perf:`).
   `infra` **não** é tipo de commit aceito pelo commitlint deste repo — use
   `chore:` ou `ci:`.
9. Ao terminar cada etapa, marque a linha dela em `05-PROGRESSO.md` e anote o
   link da PR.

### Convenções deste repositório que você deve seguir

| Assunto | Regra | Referência |
|---|---|---|
| Branch | `claude/<fix\|feat\|chore\|infra>-<slug>-<AAMMDD-HHMM>`, a partir de `main` atualizado | `AGENTS.md` §5.4 |
| Escrita no GitHub | MCP **`GITHUB - MCP - FOREVER`** (o conector padrão responde 403 em write) | `AGENTS.md` §5 |
| PRs abertas | Antes de começar, liste as PRs abertas com `github_graphql`; PR aberta nos mesmos arquivos → pare e avise o dono | `AGENTS.md` §5.3 |
| Migration | DDL direto por `db_query` no MCP (nunca `supabase_apply_migration`); versão = timestamp `YYYYMMDDHHmmss` estritamente crescente (`SELECT max(version)` antes); toda DDL vira arquivo em `supabase/migrations/`; `CREATE INDEX CONCURRENTLY` falha no gateway — use `CREATE INDEX` | `AGENTS.md` §7 |
| RLS/schema | RLS + `updated_at` obrigatórios; dinheiro em `NUMERIC(15,2)`; datas em `TIMESTAMPTZ`; funções `SECURITY INVOKER` salvo necessidade justificada, com `SET search_path` | `docs/SCHEMA_CONVENTIONS.md` |
| Segredos | Nunca em código, commit, PR ou resposta — só em secret do serviço. **O repositório é público.** | `AGENTS.md` §2.8 |
| Merge | Você pode fazer squash-merge das suas PRs prontas (CI verde, sem conflito, escopo comum) e apagar a branch, **exceto** as etapas marcadas com aprovação humana | `AGENTS.md` §5.7 e §5.8 |
| Deploy | Merge em `main` = produção (deploy automático na Vercel). Confirme o deploy e reporte | `AGENTS.md` §5.10, `docs/agentes/vercel-deploy.md` |

### Limitações do ambiente desta auditoria (importantes para você)

- **SQL arbitrário no banco de produção não estava disponível** nesta sessão. O
  conector MCP `SUPABASE PROMO CHAMPIONS V2 1` respondeu
  `Management API 401: Invalid access token`, e o gateway
  `supabase-promo-champions-v2-mcp.adm01.workers.dev` responde `GET /health` com
  200 mas devolve 404 em todo caminho POST testado (`/mcp`, `/rpc`, `/query`,
  `/sql`, `/tools/call`, ...). Por isso, **todo achado de banco está marcado como
  `SNAPSHOT`** (medido em `inventario/estado/banco.json`, 2026-11-12T14:07:03Z)
  **ou `MIGRATION`** (schema declarado no repo) — nunca como medição ao vivo.
  **Sua primeira ação ao pegar uma etapa de banco é reconfirmar o estado real
  com SQL**, porque 10 dias separam o snapshot da auditoria, e mais tempo
  separará do seu trabalho.
- O que **funcionou ao vivo** e você pode reproduzir: PostgREST com a chave
  publishable (`https://usyxfpqlsspldubptrdl.supabase.co/rest/v1/...` com header
  `apikey: <VITE_SUPABASE_PUBLISHABLE_KEY>`), `/auth/v1/settings`, e requisições
  à produção na Vercel (`https://promo-champions-v2-1.vercel.app`).
- `npm run typecheck`, `npm run lint` e `npm run test` passavam (exit 0) no
  commit auditado. Qualquer falha nova é sua.

### Como ler cada etapa

`Onda` dá a ordem macro (1 = segurança e risco de perda de dado … 8 = higiene).
`Severidade` é o impacto do problema, não a urgência da etapa.
`Modo` da evidência: **EXECUTADO** = alguém rodou e viu o resultado;
**RASTREADO** = alguém seguiu o caminho lendo o código. Etapa cuja evidência é
RASTREADO merece um teste de reprodução antes do patch.

### Padrões de referência do repositório (use estes, não invente)

O repositório já tem a peça certa para quase todo problema deste plano. O erro mais caro
que você pode cometer é escrever uma solução nova onde já existe um padrão adotado.

| Problema | Use | Arquivo de referência | Exemplo de uso correto |
|---|---|---|---|
| Autenticar usuário em edge function | `getUserClient(req)` → `ctx.client` (respeita RLS), `ctx.userId` | `supabase/functions/_shared/auth-client.ts:34` | `supabase/functions/execute-workflow/index.ts:40-50` |
| Exigir papel admin | `requireAdmin(ctx)` | `supabase/functions/_shared/auth-client.ts:93` | `supabase/functions/start-race-season/index.ts` (só 2 funções usam — é padrão subutilizado, não padrão novo) |
| Exigir admin **ou** gestor | RPC de papel no handler, com 403 | — | `supabase/functions/external-db-bridge/index.ts:142-156` |
| Bypass de RLS justificado | `getServiceClient('<motivo com 10+ chars>')` | `supabase/functions/_shared/auth-client.ts:76` | o próprio helper recusa motivo trivial |
| Autenticar chamada de cron | segredo em `_internal_secrets` + comparação timing-safe, com fallback para admin/gestor | `supabase/functions/_shared/cron-request-auth.ts`, `_shared/internal-service-auth.ts:26` | `supabase/functions/generate-urgent-client-tasks/index.ts:40-57,100-120` |
| Verificar assinatura de webhook | `_shared/webhook-auth.ts` (Resend/Svix, SendGrid, HMAC genérico), **falha fechada** | `supabase/functions/_shared/webhook-auth.ts:362-422` | `supabase/functions/inbound-email-webhook/index.ts:202-208` |
| Evitar entrega duplicada de webhook | reserva em `public.webhook_inbound_dedupe` antes da escrita | `supabase/functions/receive-quote-sync/index.ts:96-110` | `supabase/functions/twilio-call-status/index.ts:154-163` (dedupe por hash do payload) |
| Limitar requisições de verdade | tabela no banco, não `Map` em memória | `supabase/migrations/20261117050000_webhook_ssrf_e_rate_limit.sql` (`webhook_dispatch_rate`) | o próprio `_shared/rate-limit.ts:10-13` avisa que é por instância |
| Escapar HTML em e-mail | `_shared/html-escape.ts` | `supabase/functions/_shared/html-escape.ts` | `email-unsubscribe`, `new-device-alert`, `send-quote-to-client` |
| Allowlist de colunas em consulta dinâmica | regex `SAFE_FIELD` por coluna, nunca `select('*')` | `supabase/functions/report-embed-public/index.ts:44-52,81-98` | o mesmo arquivo, `:247` |
| Passar do teto de ~1000 linhas do PostgREST | `fetchAllRows` ou contagem por `HEAD + count exact` | `src/lib/supabase/fetchAllRows.ts` | `src/hooks/useQuotes.ts:100`, `src/hooks/cadences/useCadenceChannelStats.ts:36` |
| Tratar erro de leitura na página | desestruturar `isError` e renderizar estado de erro | — | `src/pages/MinhasPremiacoes.tsx:77,309`, `src/pages/AdminSolicitacoesTitular.tsx:115` |
| Confirmar ação destrutiva | `AlertDialog` do shadcn | `src/components/ui/alert-dialog.tsx` | páginas que já usam `AlertDialog` (a de feature flags **não** usa — ver A-09) |
| Revogar grant de `anon` numa tabela | `REVOKE ALL ON TABLE ... FROM anon;` (**`FROM PUBLIC` não basta**) | `supabase/migrations/20261117060000_revoke_grants_tabelas_webhook.sql:30` | o mesmo arquivo documenta por que `authenticated` precisa continuar com os grants |
| View que deve respeitar RLS | `WITH (security_invoker = true)` | `supabase/migrations/20260711145130_...sql:2-3` | `v_platform_slo`, `race_spectator_view` |
| Função de banco com privilégio | `SECURITY DEFINER` + `SET search_path` + checagem de papel no corpo + `REVOKE ... FROM PUBLIC, anon` | `supabase/migrations/20260711145130_...sql:90-106` (`fn_admin_platform_slo`) | `supabase/migrations/20260831130000_harden_public_access_and_privileged_rpcs.sql` |
| Idempotência em concessão de prêmio | chave natural `(bonus_id, salesperson_id, period_month)` | `supabase/migrations/20261027210000_r3_db_kpis_fixes.sql:306-367` | `award_bonus_if_eligible` |
| Transição de status | RPC `transition_sale_status` / `transition_commission_status` + `is_valid_status_transition` | `supabase/migrations/20261001213000_status_transitions_state_machine.sql:120-137` | a tabela `public.status_transitions` é a fonte de verdade |

### Armadilha geral desta base de código

**`verify_jwt = true` não autentica ninguém.** A chave publishable é pública por desenho
(`src/integrations/supabase/env.ts:12`, vai para o bundle do browser) e **satisfaz o
gateway**. EXECUTADO contra produção:

```
GET /functions/v1/get-client-ip                              → 401 UNAUTHORIZED_NO_AUTH_HEADER
GET /functions/v1/get-client-ip  -H "apikey: sb_publishable_…" → 200 {"ip":"…"}
```

Portanto, toda edge function que não faça verificação própria no handler é, na prática,
um endpoint público — independentemente de `config.toml`. Ao corrigir qualquer função
desta camada, **não** aceite "mas o `verify_jwt` está ligado" como proteção.

---

# Etapas

## Onda 1 — Segurança e risco de perda de dado

### Etapa 001 — Fechar o cadastro público do Supabase Auth
**Onda / Severidade / Camada:** 1 / Crítica / Segurança (Auth)
**Achados resolvidos:** A-01
**Problema hoje:** qualquer pessoa com um e-mail válido cria conta no CRM da empresa e
recebe o papel `salesperson` automaticamente. EXECUTADO:
`GET https://usyxfpqlsspldubptrdl.supabase.co/auth/v1/settings` →
`"disable_signup": false, "email": true, "mailer_autoconfirm": false`. O trigger
`on_auth_user_created_role` concede o papel
(`supabase/migrations/20251214103344_640296e4-5119-4bf4-aefe-f0749de6003f.sql:86-103`).
Não há restrição de domínio de e-mail em nenhuma camada.
**Causa raiz:** o cadastro aberto do Supabase Auth, que é o padrão do produto, nunca foi
desligado num sistema interno; o papel inicial é dado por trigger, sem aprovação.
**Caminho recomendado:**
1. No painel do Supabase (Authentication → Sign In / Providers → Email), desmarcar
   "Allow new users to sign up". Não há como fazer isso por migration — é configuração de
   projeto, não de banco.
2. Antes de desligar, confirmar com o dono **como entram novos vendedores hoje**. Se a
   equipe usa autocadastro, o caminho correto passa a ser convite: a tela de administração
   precisa de um botão que chame `auth.admin.inviteUserByEmail` por edge function com
   `requireAdmin` (padrão de `_shared/auth-client.ts:93`). Nesse caso, esta etapa vira
   duas: desligar o cadastro **e** entregar o convite — não desligue sem a alternativa
   pronta, ou a empresa perde a forma de admitir gente.
3. Não mexa no trigger: ele está correto para quem entra por convite.
**Arquivos e objetos a tocar:** nenhum arquivo do repositório nesta etapa (configuração de
projeto). Se o convite for necessário, abrir etapa separada para a edge function.
**Não tocar / armadilhas:** não apague `on_auth_user_created_role` — sem ele, o usuário
convidado entra sem papel nenhum e nem o próprio perfil carrega
(`src/hooks/useUserRoles.ts:42-95` depende de `user_roles`). Não confunda com
`mailer_autoconfirm`: confirmar e-mail não impede o cadastro, só o atrasa.
**Depende de:** — · **Libera:** 002 (reduz o alcance da cadeia de ataque), 004
**Risco e como reverter:** risco de bloquear a entrada de gente nova; reverter é remarcar a
mesma caixa no painel. Sem risco para dado existente.
**Precisa de aprovação humana antes do merge:** **sim** — é mudança de configuração de
produção que altera como a empresa admite usuários.
**Como verificar:** `curl -s https://usyxfpqlsspldubptrdl.supabase.co/auth/v1/settings -H "apikey: <VITE_SUPABASE_PUBLISHABLE_KEY>" | python3 -m json.tool | grep disable_signup`
→ esperado `"disable_signup": true`.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 002 — Medir se a cadeia de ataque do `update_stage` está explorável hoje
**Onda / Severidade / Camada:** 1 / Crítica / Backend (leitura, sem mudança)
**Achados resolvidos:** A-30 (medição)
**Problema hoje:** `supabase/functions/execute-workflow/index.ts:145-148` faz
`supabase.from("sales").update({ stage: u.stage }).eq("id", trigger_payload.sale_id)` com
client `service_role` (`:69`) e `sale_id` vindo do corpo da requisição, sem checar
propriedade. A exploração depende de existir um workflow ativo com ação `update_stage`, e
isso não foi possível medir nesta auditoria (sem SQL ao vivo).
**Causa raiz:** —  (etapa de medição; a causa é tratada em 003)
**Caminho recomendado:** rode a consulta abaixo pelo MCP do banco e registre o resultado no
arquivo de progresso. **Não mude código nesta etapa.** O resultado decide a urgência de 003:
linha encontrada = explorável agora, trate 003 como incidente; nenhuma linha = latente, 003
segue na ordem normal.
**Arquivos e objetos a tocar:** apenas `docs/qa/05-PROGRESSO.md` (anotação).
**Não tocar / armadilhas:** não desative workflows por iniciativa própria — são
configuração de negócio do dono.
**Depende de:** — · **Libera:** 003
**Risco e como reverter:** nenhum (somente leitura).
**Precisa de aprovação humana antes do merge:** não (não há merge; é medição).
**Como verificar:**
```sql
SELECT id, name, is_active FROM public.automation_workflows
WHERE is_active AND actions::text ILIKE '%update_stage%';
```
Esperado: a saída, qualquer que seja, registrada no progresso com data e hora.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 003 — Escopar o `update_stage` do `execute-workflow` ao dono da venda
**Onda / Severidade / Camada:** 1 / Crítica / Backend
**Achados resolvidos:** A-30
**Problema hoje:** qualquer usuário autenticado move qualquer negócio do CRM para qualquer
estágio. `execute-workflow/index.ts:131-133` aceita a ação `update_stage` exigindo apenas
`trigger_payload.sale_id`, e `:145-148` executa o `update` com `service_role`. As outras duas
ações do mesmo arquivo fazem certo, e o comentário em `:113-115` declara a regra:
*"resolve o vendedor do chamador pelo JWT — IDOR prevention, nunca pelo payload"*.
**Causa raiz:** a terceira ação foi acrescentada sem aplicar a regra que as duas primeiras
seguem; o `service_role` apaga a RLS que protegeria de graça.
**Caminho recomendado:**
1. Siga o padrão do próprio arquivo: antes de montar `stageUpdates`, exija
   `callerSalespersonId` (já resolvido em `:116-121`) e confirme que a venda pertence ao
   chamador — ou que ele é admin/gestor. A forma mais barata e mais segura é **parar de usar
   `service_role` para esta ação**: use `ctx.client` (o client do usuário, devolvido por
   `getUserClient`), e deixe a RLS de `sales` decidir. Se a RLS recusar, a resposta já vem
   com erro e a ação é registrada como falha, sem código de autorização novo.
2. Escope também a busca do workflow (`:71-76`): hoje aceita qualquer `id` ativo. Adicione o
   filtro de dono/time que a tabela permitir.
3. Atalho tentador a evitar: **não** resolva isso validando `sale_id` com uma consulta extra
   em `service_role` ("a venda existe e é do usuário?"). Isso duplica a regra que a RLS já
   tem e vai divergir dela na primeira mudança de policy.
**Arquivos e objetos a tocar:** `supabase/functions/execute-workflow/index.ts`.
**Não tocar / armadilhas:** `create_task` e `log_activity` já estão corretos — não
reescreva. O `getServiceClient` continua necessário para a gravação do log de execução
(`run-log`), que é escrita de auditoria legítima; troque o client **apenas** no `update` de
`sales`. Lembre que `enforce_status_transition` não se aplica a `service_role` (A-20): ao
passar a usar o client do usuário, transições inválidas passam a ser recusadas pelo banco —
isso é o comportamento desejado, mas pode fazer aparecer erro em workflow que antes
"funcionava" gravando estado inválido.
**Depende de:** 002 · **Libera:** 030
**Risco e como reverter:** se a RLS de `sales` for mais restritiva do que o workflow precisa,
automações legítimas passam a falhar. Reverter é um `git revert` da PR. Antes de mergear,
rode a verificação com um usuário real de teste.
**Precisa de aprovação humana antes do merge:** não (escopo comum de edge function), **mas**
se 002 encontrou workflow ativo, avise o dono no mesmo dia.
**Como verificar:** com dois usuários de teste (A e B), A cria uma venda; autenticado como B,
invoque a função pedindo `update_stage` no `sale_id` de A:
```bash
curl -s -X POST "$SUPABASE_URL/functions/v1/execute-workflow" \
  -H "Authorization: Bearer <JWT_DO_USUARIO_B>" -H "Content-Type: application/json" \
  --data '{"workflow_id":"<id_ativo>","trigger_payload":{"sale_id":"<venda_do_A>"}}'
```
Esperado: a ação `update_stage` volta com status de falha (ou 403), e
`SELECT stage FROM public.sales WHERE id = '<venda_do_A>'` continua com o valor anterior.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 004 — Exigir aprovador humano no environment `Production`
**Onda / Severidade / Camada:** 1 / Crítica / Infraestrutura (CI)
**Achados resolvidos:** A-55
**Problema hoje:** o cabeçalho de `.github/workflows/deploy.yml:9-11` afirma que todo deploy
"fica pendente até um aprovador humano liberar". A API diz o contrário. EXECUTADO:
`GET /repos/adm01-debug/Promo_Champions_V2.1/environments/Production` →
`"protection_rules": [], "deployment_branch_policy": null`. O job executa
`supabase functions deploy` para todas as funções (`deploy.yml:144-147`) e
`supabase db push --linked` no banco de produção (`:159-160`), disparado por
`workflow_dispatch` **ou por push de tag `v*`** (`:38-41`) — e as tags são criadas
automaticamente pelo `release-please` ao mergear a PR de release (`release-please.yml:3-6`).
**Causa raiz:** o gate existe apenas no comentário do YAML; o environment foi criado em
2026-09-05 e nunca recebeu regra de proteção.
**Caminho recomendado:**
1. Em Settings → Environments → Production, adicionar **Required reviewers** (o dono) e,
   em Deployment branches, restringir a `main` e a tags `v*`.
2. Só depois disso, considerar separar o `db push` do deploy de funções — hoje um merge de
   release faz as duas coisas. Isso é mudança de arquitetura de deploy: **proponha ao dono,
   não execute**.
3. Atalho a evitar: não "resolva" tirando o `db push` do workflow sem combinar. O caminho de
   migration que `AGENTS.md` §7 manda usar (`apply-migration.yml` / MCP) precisa estar
   funcionando antes, ou a equipe fica sem como aplicar DDL.
**Arquivos e objetos a tocar:** nenhum arquivo; configuração do repositório. Opcionalmente,
corrigir o comentário de `.github/workflows/deploy.yml:9-11` para descrever a realidade.
**Não tocar / armadilhas:** `can_admins_bypass` é irrelevante enquanto não houver regra —
não gaste tempo nisso. Não desative o `deploy.yml`: ele é o caminho de publicação das
funções.
**Depende de:** — · **Libera:** 033
**Risco e como reverter:** deploys passam a exigir um clique humano, o que atrasa correção
urgente; o dono pode se aprovar. Reverter é remover a regra.
**Precisa de aprovação humana antes do merge:** **sim** — é configuração de infraestrutura e
muda o processo de release.
**Como verificar:** `GET /repos/adm01-debug/Promo_Champions_V2.1/environments/Production`
→ esperado `protection_rules` contendo uma entrada `required_reviewers`.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 005 — Autenticar `new-device-alert`
**Onda / Severidade / Camada:** 1 / Crítica / Backend
**Achados resolvidos:** A-27 (e A-26 como causa)
**Problema hoje:** a função grava em `known_devices` (`index.ts:171-183`), `login_alerts`
(`:190-205`) e `email_logs` (`:232`) com `service_role`, lê `push_subscriptions` e dispara
e-mail para o endereço que **o chamador** mandou — sem nenhuma verificação de quem chamou
(`:105-146`). EXECUTADO: `POST` com apenas a chave pública → **503**
`{"error":"RESEND_API_KEY not configured"}`, resposta do handler (`:114-120`), não do
gateway: a requisição anônima entrou na função.
**Causa raiz:** a função foi escrita para ser chamada por um hook de login e nunca ganhou
gate; o autor confiou no `verify_jwt = true`, que a chave pública satisfaz (A-26).
**Caminho recomendado:**
1. Decida **quem** legitimamente chama. Não há chamador no repositório
   (`grep -rl new-device-alert src/` → vazio; `inventario/estado/edges.json` marca
   `sem_chamador`), o que indica que o chamador é (ou seria) um hook de auth ou um cron.
2. Se for serviço interno: use `isInternalServiceRequest` / `isExpectedSharedSecret`
   (`_shared/internal-service-auth.ts:26,44`) com o segredo em `_internal_secrets`, no
   padrão de `generate-urgent-client-tasks/index.ts:40-57`.
3. Se for o próprio usuário: `getUserClient(req)` e **derive `user_id` e `user_email` do
   JWT**, ignorando o que vem no corpo. Esse é o ponto central: hoje o corpo decide para quem
   o e-mail vai.
4. Enquanto a decisão de quem chama não estiver tomada, o mais seguro é devolver 401 para
   todo chamador não interno — a função não tem consumidor hoje.
**Arquivos e objetos a tocar:** `supabase/functions/new-device-alert/index.ts`.
**Não tocar / armadilhas:** não dependa de `RESEND_API_KEY` estar ausente como proteção —
A-39 vai ser corrigido e aí a função passa a enviar e-mail de verdade. Atenção ao efeito de
supressão descrito no achado: registrar um dispositivo faz o alerta real daquele login ser
suprimido (`:150-166` devolve 200 "already known"), então validar o chamador é o que impede
envenenar `known_devices`.
**Depende de:** — · **Libera:** 034
**Risco e como reverter:** se existir um chamador não mapeado (hook de auth configurado no
painel), ele passa a receber 401 e o alerta de novo dispositivo para de funcionar — que é o
estado atual de fato, já que a função não envia e-mail. Reverter é `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:**
```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST \
  "$SUPABASE_URL/functions/v1/new-device-alert" \
  -H "apikey: <PUBLISHABLE_KEY>" -H "Content-Type: application/json" --data '{}'
```
Esperado: **401** (hoje devolve 503). E, com o segredo interno correto no header, 200.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 006 — Fazer `workflow-executor` respeitar o resultado da autenticação
**Onda / Severidade / Camada:** 1 / Alta / Backend
**Achados resolvidos:** A-28
**Problema hoje:** `supabase/functions/workflow-executor/index.ts:57-62` faz
`const { data: userData } = await userClient.auth.getUser();` e aceita `null` — **não existe
`if (!user) return 401`**. A execução segue com `service_role` (`:72`), lê qualquer
`workflows` por id (`:73-77`), grava `workflow_executions` com `triggered_by: null`
(`:93-103`), atualiza contadores (`:151-170`) e **devolve na resposta** `label`,
`conditionField`, `conditionOp` e `conditionValue` de cada nó (`:128-134`, `:172-174`).
**Causa raiz:** o retorno de `auth.getUser()` foi tratado como informativo, não como gate.
**Caminho recomendado:** troque as duas linhas por `getUserClient(req)` dentro de
`try/catch`, devolvendo 401 em `UnauthorizedError` — exatamente como
`execute-workflow/index.ts:38-50` já faz. Com o `userId` garantido, grave `triggered_by` de
verdade. Verifique se a resposta precisa mesmo devolver a configuração dos nós; se for só
para depuração, reduza ao necessário.
**Arquivos e objetos a tocar:** `supabase/functions/workflow-executor/index.ts`.
**Não tocar / armadilhas:** as ações são simuladas (`:146`, *"executada (simulado)"*) — não
"conserte" isso transformando em execução real; é outra decisão, de produto. O front chama
em `src/hooks/useWorkflows.ts:136` com sessão válida, então o 401 não quebra o uso legítimo.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** `POST /functions/v1/workflow-executor` só com `apikey: <PUBLISHABLE_KEY>`
→ esperado **401**; com `Authorization: Bearer <JWT de usuário>` → 200 e
`triggered_by` preenchido na linha gravada em `workflow_executions`.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 007 — Autenticar `notify-critical-pattern` e escapar o HTML do e-mail
**Onda / Severidade / Camada:** 1 / Alta / Backend
**Achados resolvidos:** A-29
**Problema hoje:** 61 linhas, nenhuma verificação de chamador e nenhum limite de taxa; o
corpo do e-mail interpola o payload cru (`index.ts:28-33`), e o destinatário é fixo
(`ADMIN_NOTIFICATION_EMAIL`, `:19`). EXECUTADO: `POST` só com a chave pública → 200
`{"ok":false,"skipped":true}`, sem 401.
**Causa raiz:** função de notificação interna publicada sem gate, confiando no
`verify_jwt` (A-26); o escape de HTML existe no repositório e não foi importado.
**Caminho recomendado:**
1. Gate: é disparada por detecção interna, então use
   `isInternalServiceRequest`/`isExpectedSharedSecret` (`_shared/internal-service-auth.ts`),
   como em `generate-urgent-client-tasks`.
2. Escape: importe `_shared/html-escape.ts` e aplique em `body.name` e `body.pattern_id` —
   é o mesmo helper que `email-unsubscribe`, `new-device-alert` e `send-quote-to-client`
   usam.
3. Limite: `enforceRateLimit` do `_shared/rate-limit.ts` reduz o abuso, mas **não** substitui
   o gate (o próprio arquivo avisa que o limite é por instância, `:10-13`).
**Arquivos e objetos a tocar:** `supabase/functions/notify-critical-pattern/index.ts`.
**Não tocar / armadilhas:** não troque o destinatário fixo por um vindo do corpo — isso
transformaria a função num remetente aberto.
**Depende de:** — · **Libera:** 034
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** `POST` só com `apikey` → **401**; com o segredo interno correto → 200.
E com `{"name":"<b>x</b>"}` autenticado, o e-mail (ou o log) mostra o texto escapado, não
negrito.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 008 — Validar a condição da premiação no servidor
**Onda / Severidade / Camada:** 1 / Crítica / Regras de negócio (banco)
**Achados resolvidos:** A-07
**Problema hoje:** a elegibilidade é decidida no cliente e o servidor aceita a afirmação.
`src/hooks/useEligibleBonuses.ts:99-100` devolve `achieved: true` para qualquer
`trigger_condition` que não contenha uma das chaves conhecidas, e
`src/hooks/useAutoAwardBonuses.ts:46-50` chama `award_bonus_if_eligible` para cada item
`achieved`. A RPC (`supabase/migrations/20261027210000_r3_db_kpis_fixes.sql:306-367`) valida
`auth.uid()`, `is_active`, escopo e idempotência — e **nunca lê `trigger_condition`**.
**Causa raiz:** a regra de elegibilidade mora só no cliente, com fallback permissivo.
**Caminho recomendado:**
1. Mover a avaliação para dentro de `award_bonus_if_eligible`: a função já tem o
   `salesperson_id` do chamador e o `bonus_id`; ela precisa ler `trigger_condition` e
   recusar quando a condição não for atendida **ou não for reconhecida** (recusar, não
   conceder — a inversão do padrão atual é o cerne desta etapa).
2. Mantenha a regra em **um** lugar. O cliente continua podendo mostrar progresso, mas o
   `achieved` do cliente não deve mais ser a autorização.
3. Atalho a evitar: não corrija apenas a linha 99-100 do hook trocando `true` por `false`.
   Isso fecha o buraco visível e deixa a regra no cliente — qualquer chamada direta à RPC
   continua concedendo o prêmio. A etapa 009 cuida do hook; esta é a do servidor.
**Arquivos e objetos a tocar:** nova migration em `supabase/migrations/` substituindo
`public.award_bonus_if_eligible` (`CREATE OR REPLACE FUNCTION`, mantendo `SECURITY DEFINER`
e `SET search_path`), mais o arquivo comentado exigido por `AGENTS.md` §7.
**Não tocar / armadilhas:** não altere a chave de idempotência
`(bonus_id, salesperson_id, period_month)` — é o que impede prêmio duplicado e está correta.
Não mude o tipo de retorno da RPC sem olhar `useAutoAwardBonuses.ts`. Veja a etapa 010 antes
de escolher o timestamp da migration (há migrations datadas no futuro).
**Depende de:** 010 (para conseguir criar a migration) · **Libera:** 009
**Risco e como reverter:** uma condição escrita de forma legítima mas fora do vocabulário
passa a **não** conceder prêmio — o oposto do bug atual, e o lado correto para errar. Avise o
dono: premiações cadastradas com chave errada vão parar de ser pagas (e é isso que se quer).
Reverter é nova migration restaurando a versão anterior da função.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção e mudança de regra
de pagamento.
**Como verificar:** cadastre uma premiação de teste com `trigger_condition = '{}'` e, como
vendedor que não atende a nada, chame:
```sql
SELECT * FROM public.award_bonus_if_eligible('<bonus_id>', 100, '<kind>');
```
Esperado: nenhuma linha inserida em `commission_bonus_awards` e retorno indicando recusa.
Hoje o mesmo teste insere o prêmio.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 009 — Trocar o fallback permissivo de `evaluateBonus` por recusa explícita
**Onda / Severidade / Camada:** 1 / Crítica / Hooks
**Achados resolvidos:** A-07
**Problema hoje:** `src/hooks/useEligibleBonuses.ts:99-100` — `return { ...bonus,
achieved: true, progress: 1, reason: 'Premiação ativa' }` para condição desconhecida.
**Causa raiz:** o caminho "não sei avaliar" foi escrito como "atingido".
**Caminho recomendado:** devolva `achieved: false` com `reason` dizendo que a condição não é
reconhecida, para o vendedor entender a tela, e registre o caso (console/telemetria) para o
admin descobrir o cadastro errado. Não remova o item da lista: esconder o problema é pior.
**Arquivos e objetos a tocar:** `src/hooks/useEligibleBonuses.ts`.
**Não tocar / armadilhas:** o arquivo de teste do hook espera o comportamento atual — ajuste
o teste junto, e no mesmo commit. Não mexa em `monthlyRank` aqui (é a etapa 011).
**Depende de:** 008 · **Libera:** —
**Risco e como reverter:** premiação com condição mal cadastrada passa a aparecer como não
atingida; é o efeito desejado. `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** `npx vitest run src/hooks/useEligibleBonuses.test.ts` com um caso novo de
`trigger_condition` desconhecida → esperado `achieved === false`.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 010 — Desbloquear a criação de migrations (versões datadas no futuro)
**Onda / Severidade / Camada:** 1 / Média / Banco (CI)
**Achados resolvidos:** A-16
**Problema hoje:** a maior versão em `main` é **20261125110000** (25/11/2026), e o gate exige
versão estritamente maior que a da base (`scripts/check-migrations.mjs:157-160`). Qualquer
migration criada com timestamp honesto hoje é **rejeitada**. São 7 arquivos adiantados:
`20261123000100`, `20261124120000`, `20261124130000`, `20261124160000`, `20261125000000`,
`20261125100000`, `20261125110000`.
**Causa raiz:** migrations geradas com carimbo adiantado, e o gate compara com o máximo da
base em vez da data real.
**Caminho recomendado:** **não renomeie as migrations já aplicadas** — o ledger as referencia
por versão e renomear cria divergência pior do que a atual. Em vez disso, escolha para a sua
nova migration a menor versão que satisfaça o gate (`20261125110001` e seguintes) e registre
em `docs/SCHEMA_CONVENTIONS.md` que, até 25/11/2026, a sequência está adiantada e por quê.
Opcional, para evitar recorrência: ajustar `scripts/check-migrations.mjs` para **avisar**
quando a versão nova estiver mais de 24 h à frente do relógio — aviso, não bloqueio, para não
travar o caso legítimo.
**Arquivos e objetos a tocar:** `docs/SCHEMA_CONVENTIONS.md`; opcionalmente
`scripts/check-migrations.mjs`.
**Não tocar / armadilhas:** não mexa em `supabase/migrations/*` já existentes; não altere a
regra de "estritamente crescente" (ela é o que impede ordem ambígua).
**Depende de:** — · **Libera:** 008, 013, 014, 015, 016, 017, e toda etapa com DDL
**Risco e como reverter:** nenhum para dado; se o aviso novo incomodar, remova-o.
**Precisa de aprovação humana antes do merge:** **sim** se você alterar
`scripts/check-migrations.mjs` (é gate de CI); não, se a etapa ficar só na documentação.
**Como verificar:** crie uma migration vazia com versão `20261125110001` e rode
`node scripts/check-migrations.mjs --base origin/main` → esperado sucesso, sem o erro
"versão não é estritamente maior".
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 011 — Ligar o ranking mensal à avaliação de premiação
**Onda / Severidade / Camada:** 1 / Alta / Hooks + regras de negócio
**Achados resolvidos:** A-08
**Problema hoje:** `src/hooks/useEligibleBonuses.ts:154` passa `monthlyRank: null` fixo, e a
avaliação exige `rank !== null && rank <= rankTop` (`:59-62`). EXECUTADO:
`grep -rn "monthlyRank" src/` devolve só a interface (`:18`), o uso (`:61`), o literal
(`:154`) e o teste — nenhum caminho de produção injeta o valor. A UI do admin ensina a usar a
chave (`src/pages/AdminPremiacoes.tsx:450` mostra `{"rank_top": 3}`).
**Causa raiz:** dependência do cálculo nunca ligada; o `null` com o comentário "pode ser
injetado depois" foi para produção.
**Caminho recomendado:** o rank mensal já é calculado para o ranking da equipe — reutilize a
fonte existente em vez de criar outra (procure o hook que alimenta `/ranking`). Injete o
valor no `EvaluationContext`. Melhor ainda: faça o servidor avaliar `rank_top` dentro de
`award_bonus_if_eligible` (etapa 008), e no cliente mostre o progresso. Atalho a evitar:
calcular o rank dentro deste hook a partir de uma consulta nova — vira uma segunda definição
de ranking e divergirá da tela de ranking.
**Arquivos e objetos a tocar:** `src/hooks/useEligibleBonuses.ts` (+ a migration da 008 se o
cálculo for para o servidor).
**Não tocar / armadilhas:** empate de posição e período (mês corrente vs fechado) precisam
seguir a mesma regra da tela de ranking; se divergirem, o vendedor vê "Top 3" na tela e não
recebe o prêmio.
**Depende de:** 008 · **Libera:** —
**Risco e como reverter:** premiações de ranking passam a ser concedidas — é o
comportamento prometido ao vendedor, e o dono deve saber que isso gera pagamento retroativo
ou não, conforme a regra do período. **Confirme com o dono antes de mergear.**
**Precisa de aprovação humana antes do merge:** **sim** — libera pagamento que hoje não
ocorre.
**Como verificar:** com um vendedor que seja o 1º do mês e uma premiação
`{"rank_top": 3}` ativa, abrir o painel do vendedor → o card deve aparecer como atingido, e
`SELECT * FROM public.commission_bonus_awards WHERE bonus_id = '<id>'` deve ter a linha.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 012 — Escopar `analyze-call` ao dono da gravação
**Onda / Severidade / Camada:** 1 / Alta / Backend
**Achados resolvidos:** A-31
**Problema hoje:** `supabase/functions/analyze-call/index.ts:28` — `await getUserClient(req);`
com o resultado **descartado**; `:41-42` cria `service_role` e grava usando
`body.recording_id` cru: `call_recordings.status` (`:55`, `:129`), `call_transcripts`
(`:58-62`), `call_insights` (`:114-115`). Há validação de formato (`:47-54`), nenhuma de
propriedade.
**Causa raiz:** o padrão "autentica e descarta" — presente em 13 funções (ver A-31).
**Caminho recomendado:** guarde o contexto (`const ctx = await getUserClient(req)`) e faça a
leitura de `call_recordings` **pelo client do usuário** (`ctx.client`): se a RLS não devolver
a gravação, responda 403 e pare. Só então use `service_role` para as escritas derivadas. Esse
é o padrão de `collect-race-powerup/index.ts:74-77` e `dialer-queue-builder/index.ts:40-48`.
**Arquivos e objetos a tocar:** `supabase/functions/analyze-call/index.ts`.
**Não tocar / armadilhas:** as policies de `call_recordings` existem e são por pasta do
usuário (`supabase/migrations/20260831130002_harden_storage_buckets.sql:56-80` para o áudio);
não recrie regra de papel no código. Não troque todas as escritas para o client do usuário —
`call_insights` pode legitimamente precisar de `service_role`.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** análise de chamada de terceiro passa a falhar com 403 — correto.
`git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** usuários A e B; com o JWT de B, `POST /functions/v1/analyze-call` com o
`recording_id` de A → esperado **403**, e `SELECT status FROM public.call_recordings WHERE
id = '<de A>'` inalterado.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 013 — Escopar `sequence-record-reply` ao dono da cadência
**Onda / Severidade / Camada:** 1 / Alta / Backend
**Achados resolvidos:** A-32
**Problema hoje:** o gate de JWT existe e funciona (`index.ts:9-30`; EXECUTADO: `POST` só com
a chave pública → 401), mas depois, com `service_role` (`:43-46`), a função opera sobre o
`enrollment_id` do corpo (`:34`) sem checar dono: lê `sequence_step_executions` alheio
(`:49-55`), grava `replied_at` (`:57-61`), chama `record_engagement_signal` e
`recompute_engagement_score` (`:71-82`) e pausa a cadência (`:84-87`).
**Causa raiz:** mesma de 012 — identidade verificada, propriedade não.
**Caminho recomendado:** leia `sequence_enrollments` pelo `ctx.client` antes de qualquer
escrita; sem linha, 403. Use `sequence-enroll/index.ts:49-56` como referência — é a função
irmã e já faz a checagem de dono.
**Arquivos e objetos a tocar:** `supabase/functions/sequence-record-reply/index.ts`.
**Não tocar / armadilhas:** as duas RPCs de engajamento são `SECURITY DEFINER` e recalculam
score agregado; não as chame antes de validar o dono, ou o dado sujo já estará gravado. A
função não tem chamador no repositório (`edges.json` → `sem_chamador`), mas **está
deployada** — não presuma que ninguém a usa.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** com o JWT de B e o `enrollment_id` de A → **403**; e
`SELECT status, next_action_at FROM public.sequence_enrollments WHERE id = '<de A>'`
inalterado.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 014 — Escopar `schedule-optimal-send` à venda do chamador
**Onda / Severidade / Camada:** 1 / Média / Backend
**Achados resolvidos:** A-33
**Problema hoje:** `index.ts:29-36` autentica corretamente, mas `:68-74` grava em
`scheduled_sends` com `owner_id: user.id` **e `sale_id` cru do corpo**, sem verificar que a
venda é do chamador; o `payload` da mensagem também vem cru. Quem consome a fila
(`process-scheduled-sends`, cron) **envia de verdade**.
**Causa raiz:** o `owner_id` correto deu a impressão de que o registro estava escopado.
**Caminho recomendado:** valide a venda pelo `ctx.client` antes do insert (403 se não vier).
Valide também o formato do `payload` com o validador que o repositório já usa
(`_shared/webhook-validator.ts` / `_shared/validation.ts`).
**Arquivos e objetos a tocar:** `supabase/functions/schedule-optimal-send/index.ts`.
**Não tocar / armadilhas:** não altere `process-scheduled-sends` nesta etapa; ele está
corretamente protegido por auth de cron.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** com o JWT de B e `sale_id` de A → **403**; `SELECT count(*) FROM
public.scheduled_sends WHERE sale_id = '<de A>'` não aumenta.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 015 — Escopar `csat-ces-trigger` à conta do chamador
**Onda / Severidade / Camada:** 1 / Média / Backend
**Achados resolvidos:** A-34
**Problema hoje:** `index.ts:26` autentica e descarta; `:39` cria `service_role`; `:76` grava
a pesquisa com `account_id` e `contact_email` crus do corpo. O dedupe existe (`:60-63`), logo
é idempotente — mas qualquer usuário dispara pesquisa de satisfação para um e-mail arbitrário
em uma conta arbitrária.
**Causa raiz:** mesma de 012.
**Caminho recomendado:** guarde o contexto, confirme pelo `ctx.client` que a conta é visível
ao chamador e derive o `contact_email` da conta — não do corpo. Enviar e-mail para endereço
escolhido pelo chamador é o que transforma a função num remetente aberto.
**Arquivos e objetos a tocar:** `supabase/functions/csat-ces-trigger/index.ts`.
**Não tocar / armadilhas:** não remova o dedupe (`:60-63`); ele está correto.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** com o JWT de B e `account_id` de outra carteira → **403**; nenhuma linha
nova na tabela de pesquisas.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 016 — Restringir `rotate-daily-challenges` ao cron e ao administrador
**Onda / Severidade / Camada:** 1 / Média / Backend
**Achados resolvidos:** A-34
**Problema hoje:** `index.ts:41-43` aceita a autenticação de cron **ou**, no `catch`,
qualquer usuário autenticado (`getUserClient` descartado). Qualquer vendedor força a rotação
dos desafios diários (`:62-117`: upsert, insert e `update is_active = false`), mudando a
gamificação de todos.
**Causa raiz:** o `catch` foi usado como caminho alternativo de autorização, não de erro.
**Caminho recomendado:** no `catch`, exija papel admin — `requireAdmin(ctx)`
(`_shared/auth-client.ts:93`), como em `start-race-season`. Mantenha o caminho do cron
intacto.
**Arquivos e objetos a tocar:** `supabase/functions/rotate-daily-challenges/index.ts`.
**Não tocar / armadilhas:** o upsert de `:58-62` fecha a janela de corrida entre checar e
inserir (o comentário explica) — não o troque por `insert`. A tabela
`daily_challenge_rotations` tem RLS com `USING (false)` de propósito (A-45): não crie policy
para ela.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** o botão que hoje dispara a rotação na UI, se existir para
vendedor, passa a dar 403. `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** com JWT de vendedor comum → **403**; com JWT de admin → 200; o cron
continua funcionando (confira a próxima execução em `cron.job_run_details` ou no alerta).
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 017 — Restringir o recálculo em massa de `lead-scoring`
**Onda / Severidade / Camada:** 1 / Média / Backend
**Achados resolvidos:** A-35
**Problema hoje:** `index.ts:24` autentica e descarta; `:214-216` faz `upsert` em massa de
scores de lead. Qualquer usuário reescreve a ordem de prioridade dos leads do time.
**Causa raiz:** mesma de 012.
**Caminho recomendado:** decida o escopo com o dono: se o recálculo é operação de gestão,
exija admin/gestor (padrão de `external-db-bridge/index.ts:142-156`); se é por carteira,
limite o `upsert` aos leads do `callerSalespersonId`.
**Arquivos e objetos a tocar:** `supabase/functions/lead-scoring/index.ts`.
**Não tocar / armadilhas:** o cron que recalcula periodicamente (se houver) usa outro
caminho; não o bloqueie.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** com JWT de vendedor comum → **403** (ou alteração limitada à própria
carteira); `SELECT count(*) FROM public.lead_scores WHERE updated_at > now() - interval '5 min'`
não cresce para leads de terceiros.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 018 — Remover a policy permissiva de `nps_surveys` e de `commercial_approval_requests`
**Onda / Severidade / Camada:** 1 / Crítica / Banco (RLS)
**Achados resolvidos:** A-43
**Problema hoje:** nas duas tabelas existe uma policy restritiva correta **e** uma
`USING (true)` que a anula por OR:
```
supabase/schema.sql:29125  "Authenticated users can view nps surveys"      FOR SELECT TO authenticated USING (true)
supabase/schema.sql:29149  nps_surveys_select_owner_or_manager             FOR SELECT TO authenticated USING (salesperson_id = get_current_salesperson_id() OR is_admin_or_manager(auth.uid()))
supabase/schema.sql:27556  "Ver solicitações"                              FOR SELECT USING (true)
supabase/schema.sql:27552  "Users can view their own approval requests"     FOR SELECT USING (auth.uid() = requester_id OR is_admin_or_manager(auth.uid()))
```
`docs/RLS_MATRIX.md` declara, na linha de `nps_surveys`, que `salesperson` vê "próprios" —
a documentação está errada.
**Causa raiz:** a correção de `20261119700000_fix_rls_sales_activities_using_true.sql` tratou
só `sales` e `activities`.
**Caminho recomendado:** siga exatamente o padrão daquela migration: `DROP POLICY IF EXISTS`
nas duas policies permissivas, mantendo as restritivas. Confirme antes, lendo o schema, que a
restritiva cobre os casos de uso (admin/gestor incluídos) — ela cobre. Atualize a linha
correspondente de `docs/RLS_MATRIX.md` **no mesmo commit**, porque hoje o documento afirma o
contrário do que o banco faz.
**Arquivos e objetos a tocar:** nova migration em `supabase/migrations/`;
`docs/RLS_MATRIX.md`.
**Não tocar / armadilhas:** **não** remova `USING (true)` em tabela de referência ou
configuração (`pipeline_stages`, `products`, `race_*`, `leagues`, `feature_flags`,
`achievements`, `cadences`, `playbooks`) — ali é intencional e remover quebra telas para todo
mundo. Esta etapa é só para as duas tabelas nomeadas. Rode a verificação **antes** do merge:
se a restritiva tiver um erro, você tranca o acesso legítimo.
**Depende de:** 010 · **Libera:** 019, 020, 021, 022
**Risco e como reverter:** se a policy restritiva não cobrir um papel usado, a tela de NPS ou
de aprovação fica vazia para ele. Reverter é recriar a policy permissiva por migration —
tenha o SQL de rollback pronto antes de aplicar.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** como vendedor A (não gestor):
```sql
-- esperado: 0
SELECT count(*) FROM public.nps_surveys WHERE salesperson_id <> public.get_current_salesperson_id();
```
E, como admin, a contagem total continua visível.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 019 — Fechar a leitura irrestrita de `entity_versions`
**Onda / Severidade / Camada:** 1 / Crítica / Banco (RLS)
**Achados resolvidos:** A-43
**Problema hoje:** `supabase/schema.sql:28356` dá `SELECT … USING (true)` a qualquer
autenticado sobre `entity_versions`, cuja coluna `data jsonb NOT NULL` (`:2485`) guarda o
**instantâneo inteiro** do registro versionado. Isso contorna o escopo de `sales` e
`clients`: quem não pode ler a venda lê a versão dela.
**Causa raiz:** tabela genérica de versionamento criada sem policy por entidade.
**Caminho recomendado:** não tente derivar a permissão da entidade original dentro da policy
(join genérico por `entity_type` fica lento e frágil). O caminho barato e correto é restringir
a leitura a admin/gestor — `USING (is_admin_or_manager(auth.uid()))` — e, se alguma tela de
vendedor precisar do histórico, expor por RPC `SECURITY DEFINER` que valide a entidade
específica. Verifique quem lê a tabela hoje (`grep -rn "entity_versions" src/`) antes de
escolher.
**Arquivos e objetos a tocar:** nova migration em `supabase/migrations/`.
**Não tocar / armadilhas:** a tabela **não** tem grant para `anon` (está entre as 18
revogadas), então o risco é só de usuário logado — não gaste etapa revogando grant aqui.
**Depende de:** 010, 018 · **Libera:** —
**Risco e como reverter:** se uma tela de histórico usada por vendedor depender da tabela,
ela esvazia. Confira o `grep` antes. Reverter por migration.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** como vendedor comum, `SELECT count(*) FROM public.entity_versions;` →
esperado 0 (ou só as entidades dele, se você optar pela RPC); como gestor, a contagem real.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 020 — Fechar previsão e saúde de negócio para o time todo
**Onda / Severidade / Camada:** 1 / Alta / Banco (RLS)
**Achados resolvidos:** A-43
**Problema hoje:** seis tabelas de previsão e saúde de negócio têm `SELECT … USING (true)`
para qualquer autenticado: `deal_probability_scores` (`supabase/schema.sql:28021`),
`deal_health_history` (`:27967`), `deal_stage_transitions` (`:28070`), `forecast_snapshots`
(`:28608`), `forecast_accuracy` (`:28563`), `forecast_confidence_scores` (`:28574`).
**Causa raiz:** mesma de 018 — a varredura de policies permissivas não foi concluída.
**Caminho recomendado:** trate as seis em **uma** migration, porque a causa e o critério são
iguais: dono da venda **ou** admin/gestor, usando o mesmo predicado de
`nps_surveys_select_owner_or_manager`. Onde a tabela não tiver coluna de dono, ligue por
`sale_id` à venda. Antes, rode `grep -rn "<tabela>" src/` para cada uma e confirme que as
telas que as consomem são de gestão.
**Arquivos e objetos a tocar:** nova migration em `supabase/migrations/`.
**Não tocar / armadilhas:** `deal_stage_transitions` alimenta cálculo de estagnação em
`useWeightedForecast` — se a policy ficar restritiva demais, a previsão do vendedor perde o
ajuste e cai no caso de A-86. Teste a tela de previsão depois.
**Depende de:** 010, 018 · **Libera:** —
**Risco e como reverter:** telas de previsão podem esvaziar para vendedor. Reverter por
migration.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** como vendedor A, para cada uma das seis tabelas, a contagem de linhas de
**outros** vendedores deve ser 0; a tela de previsão continua mostrando número para ele.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 021 — Fechar atingimento de meta individual
**Onda / Severidade / Camada:** 1 / Alta / Banco (RLS)
**Achados resolvidos:** A-43
**Problema hoje:** quatro tabelas de atingimento de meta têm `SELECT … USING (true)` para
qualquer autenticado: `quota_attainment_forecasts` (`supabase/schema.sql:29869`),
`quota_attainment_predictions` (`:29884`), `quota_attainment_alerts` (`:29858`),
`quota_attainment_actions` (`:29847`). Qualquer vendedor vê se o colega vai bater a meta.
**Causa raiz:** mesma de 018.
**Caminho recomendado:** uma migration para as quatro, predicado dono-ou-gestor como em 018.
Confirme a coluna de dono em cada uma antes (pode ser `salesperson_id` ou `user_id`).
**Arquivos e objetos a tocar:** nova migration em `supabase/migrations/`.
**Não tocar / armadilhas:** o painel de gestão agrega as quatro — teste com perfil de gestor
depois de aplicar, ou o dashboard da gestão esvazia.
**Depende de:** 010, 018 · **Libera:** —
**Risco e como reverter:** telas de meta podem esvaziar para vendedor; reverter por migration.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** como vendedor A, contagem de linhas de outros vendedores = 0 nas quatro;
como gestor, contagem total preservada.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 022 — Fechar avaliação de desempenho individual (coaching)
**Onda / Severidade / Camada:** 1 / Alta / Banco (RLS)
**Achados resolvidos:** A-43
**Problema hoje:** cinco tabelas de avaliação individual legíveis por qualquer autenticado:
`call_coaching_scorecards` (`supabase/schema.sql:27020`), `coaching_opportunities` (`:27453`),
`call_conversation_metrics` (`:27031`), `skill_assessments` (`:30828`),
`salesperson_coaching_aggregates` (`:30483`). É dado pessoal de desempenho.
**Causa raiz:** mesma de 018.
**Caminho recomendado:** uma migration para as cinco, predicado dono-ou-gestor. Este é o
grupo mais sensível do ponto de vista de pessoas: avaliação de um vendedor não deve ser
legível por outro. Verifique com o dono se gestor deve ver tudo ou só o próprio time —
`is_admin_or_manager` não distingue times.
**Arquivos e objetos a tocar:** nova migration em `supabase/migrations/`.
**Não tocar / armadilhas:** `salesperson_coaching_aggregates` pode alimentar comparativo de
equipe ("você vs média") — se for o caso, exponha a média por RPC agregada em vez de abrir a
tabela.
**Depende de:** 010, 018 · **Libera:** —
**Risco e como reverter:** telas de coaching comparativo podem perder o comparativo; reverter
por migration.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção e decisão sobre
visibilidade de avaliação de pessoas.
**Como verificar:** como vendedor A, contagem de linhas de outros vendedores = 0 nas cinco.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 023 — Varrer as 110 policies permissivas restantes e decidir caso a caso
**Onda / Severidade / Camada:** 1 / Alta / Banco (RLS)
**Achados resolvidos:** A-43
**Problema hoje:** depois das etapas 018–022 sobram ~96 policies `USING (true)` /
`WITH CHECK (true)` para `authenticated`. Boa parte é intencional (tabelas de referência e
configuração), mas ninguém listou quais são quais — e foi essa ausência de varredura que
deixou `nps_surveys` aberta por meses.
**Causa raiz:** a correção de 19/11 não produziu inventário do que sobrou.
**Caminho recomendado:** **não saia removendo policies.** Produza primeiro o inventário:
para cada policy permissiva, registre tabela, comando, se a tabela tem coluna de dono, se
guarda dado de pessoa/dinheiro, e a decisão (intencional / corrigir / investigar). Entregue
esse inventário como documento (`docs/qa/` ou `docs/`), com o SQL que o gerou, e só então
abra etapas de correção para o que for "corrigir". Consulta de apoio:
```sql
SELECT schemaname, tablename, policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND (qual = 'true' OR with_check = 'true')
ORDER BY tablename, cmd;
```
**Arquivos e objetos a tocar:** um documento novo em `docs/`; nenhuma migration.
**Não tocar / armadilhas:** 6 dessas policies são para `service_role`, que ignora RLS —
descarte-as do inventário em vez de "corrigir". Tabela de referência com `USING (true)` é
desenho, não defeito.
**Depende de:** 018 · **Libera:** etapas futuras de RLS (backlog)
**Risco e como reverter:** nenhum (documento).
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** o documento existe, a consulta acima foi executada e o número de linhas
classificadas bate com o total devolvido.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 024 — Amarrar a inserção em `intent_audit_logs` ao autor
**Onda / Severidade / Camada:** 1 / Média / Banco (RLS)
**Achados resolvidos:** A-44
**Problema hoje:** `supabase/schema.sql:28736` —
`"Authenticated users can insert intent audit logs" FOR INSERT TO authenticated WITH CHECK (true)`
não amarra nenhuma coluna ao chamador, e a tabela **não tem coluna de autor** (`:2868-2874`).
Qualquer usuário insere evento de intenção arbitrário para qualquer `lead_id`.
**Causa raiz:** tabela de auditoria criada sem autor e com `WITH CHECK (true)`.
**Caminho recomendado:** duas partes, na mesma migration: (1) acrescentar
`created_by uuid NOT NULL DEFAULT auth.uid()` (ou `references auth.users`), (2) trocar o
`WITH CHECK` por `created_by = auth.uid()`. Sem a coluna, não há o que amarrar — por isso as
duas partes andam juntas. Para as linhas antigas, deixe `created_by` nulo e documente o corte
(não invente autor).
**Arquivos e objetos a tocar:** nova migration em `supabase/migrations/`.
**Não tocar / armadilhas:** a segunda policy (`:28748`, `WITH CHECK (auth.uid() IS NOT NULL)`)
também é permissiva demais, mas removê-la sozinha não resolve, porque a de `:28736` continua
valendo por OR — trate as duas.
**Depende de:** 010 · **Libera:** —
**Risco e como reverter:** se algum processo grava nessa tabela com `service_role`, o
`DEFAULT auth.uid()` fica nulo — confirme o `NOT NULL` só depois de checar os gravadores.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** como usuário A, tentar inserir linha com `created_by` de B → erro;
inserir sem informar → linha gravada com `created_by = A`.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 025 — Revogar o DML do papel anônimo nas tabelas de venda, cliente e dinheiro
**Onda / Severidade / Camada:** 1 / Alta / Banco (grants)
**Achados resolvidos:** A-04
**Problema hoje:** **400 das 408 tabelas** concedem
`SELECT, INSERT, UPDATE, DELETE, REFERENCES, TRIGGER, MAINTAIN` ao papel `anon`
(ex.: `supabase/schema.sql:32192` para `_internal_secrets`, `:32196`, `:32200`). Só a RLS
separa a internet do dado. EXECUTADO: `sales`, `clients`, `commissions`, `quotes`, `orders`,
`user_roles` respondem HTTP 200 com `[]` ao papel `anon` — o grant está lá.
**Causa raiz:** *default privileges* do Supabase no schema `public`; `REVOKE ... FROM PUBLIC`
**não** desfaz, porque `PUBLIC` ≠ `anon`.
**Caminho recomendado:** comece pelo núcleo de negócio, em uma migration com o padrão já
usado no repositório (`supabase/migrations/20261117060000_revoke_grants_tabelas_webhook.sql:30`):
```sql
REVOKE ALL ON TABLE public.<tabela> FROM anon;
```
para: `sales`, `clients`, `client_portfolio`, `commissions`, `commission_bonus_awards`,
`salespeople`, `sales_goals`, `user_roles`. **Mantenha os grants de `authenticated`** — a
migration de referência explica por quê: sem eles, as policies de usuário logado param de
funcionar. Trate `anon` apenas.
**Arquivos e objetos a tocar:** nova migration em `supabase/migrations/`.
**Não tocar / armadilhas:** **não** revogue de `authenticated` nem de `service_role`. Não
inclua `error_logs` (tem INSERT anônimo intencional e escopado, `supabase/schema.sql:28374`).
Confirme antes que nenhuma tela pública lê essas tabelas: as quatro rotas públicas são
`/auth`, `/reset-password`, `/embed/report/:token` e `/race-arena/spectator/:seasonId`, e o
embed passa por edge function com `service_role`, não por `anon`.
**Depende de:** 010 · **Libera:** 026, 027, 028, 029
**Risco e como reverter:** se alguma tela pública depender de leitura anônima, ela passa a
receber 42501 em vez de lista vazia. Reverter é `GRANT SELECT ON TABLE … TO anon` por
migration. Aplique fora do horário de pico e verifique logo em seguida.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** para cada tabela,
`curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL/rest/v1/<tabela>?select=id&limit=1" -H "apikey: <PUBLISHABLE_KEY>"`
→ esperado **401** com `"code":"42501"` (hoje devolve 200 com `[]`). E, com um JWT de usuário
comum, a mesma consulta continua devolvendo as linhas dele.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 026 — Revogar o DML anônimo nas tabelas de orçamento, pedido e itens
**Onda / Severidade / Camada:** 1 / Alta / Banco (grants)
**Achados resolvidos:** A-04
**Problema hoje:** mesmo de 025, para a cadeia de orçamento e pedido: `quotes`, `quote_items`,
`quotes_inbound`, `quote_sync_inbound_log`, `quote_conversion_audit`, `orders`, `order_items`,
`order_status_events`, `report_embed_tokens`.
**Causa raiz:** mesma de 025.
**Caminho recomendado:** mesma migration-modelo de 025, com atenção especial a
`report_embed_tokens`: o embed público **não** lê essa tabela como `anon` — quem lê é a edge
function `report-embed-public` com `service_role` (`index.ts:~150`). Portanto revogar de
`anon` não quebra o embed. Confirme isso lendo a função antes.
**Arquivos e objetos a tocar:** nova migration em `supabase/migrations/`.
**Não tocar / armadilhas:** não toque em `webhook_inbound_dedupe` nem nas demais já revogadas
(as 18 listadas em A-04); verificar antes evita migration que não faz nada.
**Depende de:** 010, 025 · **Libera:** —
**Risco e como reverter:** igual a 025.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** mesma sonda de 025 para as nove tabelas → **401/42501**; e o embed
público continua respondendo: `GET /functions/v1/report-embed-public` com um token válido →
200 com linhas.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 027 — Revogar o DML anônimo em segredos e configuração sensível
**Onda / Severidade / Camada:** 1 / Alta / Banco (grants)
**Achados resolvidos:** A-04, A-45
**Problema hoje:** `public._internal_secrets` tem
`GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES, TRIGGER, MAINTAIN … TO anon`
(`supabase/schema.sql:32192`) e EXECUTADO responde HTTP 200 com `[]` ao papel `anon`. A única
barreira é a policy `USING (false) WITH CHECK (false)` (`:26426`). O mesmo vale para
`daily_challenge_rotations` (`:32611`). A tabela guarda os segredos usados pelos crons.
**Causa raiz:** mesma de 025; a proteção ficou só na policy.
**Caminho recomendado:** `REVOKE ALL ON TABLE public._internal_secrets FROM anon, authenticated;`
e o mesmo para `daily_challenge_rotations`. Ambas são acessadas **somente** por
`service_role` (edge functions) — `geocode_cache` já está assim (`:32868`), e é o modelo a
copiar. Aqui, ao contrário de 025, revogar de `authenticated` também é correto: nenhum
usuário logado deve ler segredo.
**Arquivos e objetos a tocar:** nova migration em `supabase/migrations/`.
**Não tocar / armadilhas:** **não** remova a policy `USING (false)` ao adicionar o revoke —
as duas camadas juntas é exatamente o objetivo. Confirme antes, com
`grep -rn "_internal_secrets" supabase/functions/`, que todos os leitores usam `service_role`
(o inventário indica 28 usos em edges e 0 em `src/`).
**Depende de:** 010 · **Libera:** —
**Risco e como reverter:** se alguma função ler a tabela com o client do usuário, ela quebra —
por isso o `grep` antes. Reverter por migration.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção, e a tabela é de
segredos.
**Como verificar:** `GET /rest/v1/_internal_secrets?select=key&limit=1` com a chave
publishable → esperado **401/42501** (hoje 200 `[]`); os crons continuam executando sem erro
(confira a próxima janela em `cron.job_run_details`).
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 028 — Reduzir o grant anônimo nas tabelas restantes, por lote
**Onda / Severidade / Camada:** 1 / Média / Banco (grants)
**Achados resolvidos:** A-04
**Problema hoje:** sobram ~380 tabelas com DML completo para `anon`.
**Causa raiz:** mesma de 025.
**Caminho recomendado:** gere a lista e aplique em lotes temáticos (gamificação, cadências,
relatórios, integrações, administração), **um lote por PR**, cada um com a sonda de
verificação. Consulta para gerar:
```sql
SELECT 'REVOKE ALL ON TABLE public.' || tablename || ' FROM anon;'
FROM pg_tables t
WHERE schemaname = 'public'
  AND EXISTS (SELECT 1 FROM information_schema.role_table_grants g
              WHERE g.table_schema='public' AND g.table_name=t.tablename AND g.grantee='anon')
ORDER BY tablename;
```
**Arquivos e objetos a tocar:** uma migration por lote.
**Não tocar / armadilhas:** preserve `error_logs` (INSERT anônimo intencional). Não faça
`REVOKE ... ON ALL TABLES IN SCHEMA public FROM anon` de uma vez: além de irreversível na
prática, pega tabelas futuras de forma invisível e dificulta o diagnóstico se algo quebrar.
**Depende de:** 025, 026, 027 · **Libera:** 029
**Risco e como reverter:** por lote, o estrago possível é pequeno e o revert é localizado.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** por lote, sonda HTTP em 3 tabelas amostradas → 401/42501; e um passo pela
aplicação com usuário logado, nas telas daquele domínio, sem erro novo.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 029 — Criar o teste que impede o grant anônimo de voltar
**Onda / Severidade / Camada:** 1 / Média / Banco (CI)
**Achados resolvidos:** A-04
**Problema hoje:** a causa raiz é um comportamento padrão do Supabase (*default privileges*),
então toda tabela **nova** nasce com o grant para `anon` outra vez. Sem guarda, as etapas
025–028 se desfazem sozinhas com o tempo.
**Causa raiz:** não há verificação automática de grants.
**Caminho recomendado:** some um teste SQL ao conjunto que o repositório já tem
(`npm run test:sql`, `scripts/run-sql-tests.sh`): a consulta lista as tabelas com grant para
`anon` fora de uma allowlist explícita e falha se a lista não estiver vazia. A allowlist
nomeia as exceções justificadas (hoje, `error_logs`). Melhor ainda: `ALTER DEFAULT PRIVILEGES
IN SCHEMA public REVOKE ALL ON TABLES FROM anon;` para que a próxima tabela já nasça fechada —
**proponha ao dono**, porque muda o comportamento padrão do projeto.
**Arquivos e objetos a tocar:** novo arquivo de teste SQL; eventualmente uma migration com o
`ALTER DEFAULT PRIVILEGES`.
**Não tocar / armadilhas:** o teste SQL **não** está no gate obrigatório hoje (A-17) — por
isso a etapa 039 existe; sem ela, este teste avisa e não barra.
**Depende de:** 025 · **Libera:** —
**Risco e como reverter:** o `ALTER DEFAULT PRIVILEGES` afeta objetos futuros; se atrapalhar,
reverter com o `GRANT` equivalente.
**Precisa de aprovação humana antes do merge:** **sim** se incluir o `ALTER DEFAULT
PRIVILEGES`; não, se ficar só no teste.
**Como verificar:** `npm run test:sql` → o novo teste passa; crie uma tabela de teste em
ambiente de desenvolvimento, rode de novo → o teste **falha** apontando a tabela nova.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 030 — Fazer o relatório público recusar origem fora da lista
**Onda / Severidade / Camada:** 1 / Alta / Backend
**Achados resolvidos:** A-10
**Problema hoje:** `supabase/functions/report-embed-public/index.ts:70-74` usa
`allowed_origins` apenas para escolher o cabeçalho CORS; o GET **nunca rejeita por origem**,
então `curl` ou qualquer servidor lê os dados. Com a lista vazia o cabeçalho vira `"*"`. A UI
(`src/components/reporting/EmbedTokenManagerDialog.tsx`) oferece o campo como se fosse
restrição, e as colunas padrão incluem `clients(name, company, total_value)` e
`sales(client_name, amount)`.
**Causa raiz:** CORS tratado como controle de acesso. CORS é instrução para o navegador, não
autorização no servidor.
**Caminho recomendado:** depois de carregar o token e antes de montar a consulta, se
`allowed_origins` não estiver vazio e o `Origin` da requisição não estiver na lista, responda
**403** e pare. Decida com o dono o caso da lista vazia: o mais seguro é tratar vazio como
"nenhuma origem permitida" para tokens novos, mantendo os antigos funcionando — se preferir
compatibilidade, deixe vazio = qualquer origem, mas então **mude o texto da UI**, que hoje
promete restrição.
**Arquivos e objetos a tocar:** `supabase/functions/report-embed-public/index.ts`;
possivelmente o texto de `src/components/reporting/EmbedTokenManagerDialog.tsx`.
**Não tocar / armadilhas:** requisição `GET` de navegador **sempre** manda `Origin` em
contexto de iframe, mas requisição de servidor pode não mandar — tratar "sem Origin" como
permitido reabre o buraco inteiro; tratar como negado quebra integrações legítimas de
servidor. Essa decisão é do dono, e precisa estar escrita na PR. Não mexa em
`HIDDEN_FIELDS`, `DEFAULT_VISIBLE_FIELDS` nem nas allowlists — estão corretos e são a
referência do repositório.
**Depende de:** 003 (padrão de escopo) · **Libera:** 031
**Risco e como reverter:** embeds em domínios não cadastrados param de funcionar — que é o
objetivo, mas avise o dono antes, porque pode haver link circulando. `git revert`.
**Precisa de aprovação humana antes do merge:** **sim** — pode derrubar relatório
compartilhado em uso.
**Como verificar:** com um token cujo `allowed_origins` seja `["https://exemplo.com"]`:
```bash
curl -s -o /dev/null -w "%{http_code}\n" "$SUPABASE_URL/functions/v1/report-embed-public" \
  -H "X-Embed-Token: <token>" -H "Origin: https://site-nao-autorizado.example"
```
→ esperado **403** (hoje devolve 200 com os dados).
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 031 — Tornar o limite do relatório público realmente efetivo
**Onda / Severidade / Camada:** 1 / Média / Backend
**Achados resolvidos:** A-11
**Problema hoje:** `supabase/functions/report-embed-public/index.ts:52-67` guarda o limite em
`const rateLimit = new Map()` — memória do isolate. Cada instância tem o seu e perde o estado
no primeiro arranque frio. O próprio repositório documenta a limitação em
`_shared/rate-limit.ts:10-13`.
**Causa raiz:** estado de limite guardado em processo efêmero.
**Caminho recomendado:** use a tabela que o repositório já criou para isso —
`public.webhook_dispatch_rate` e a função `check_webhook_rate_limit`
(`supabase/migrations/20261117050000_webhook_ssrf_e_rate_limit.sql`), chaveando por token.
Se o formato não servir, crie uma tabela equivalente seguindo o mesmo desenho; não invente um
terceiro mecanismo.
**Arquivos e objetos a tocar:** `supabase/functions/report-embed-public/index.ts`;
possivelmente uma migration para a chave por token.
**Não tocar / armadilhas:** não limite por IP: `_shared/rate-limit.ts:28-32` registra que o
`x-forwarded-for` é falsificável e compartilhado por NAT. O token é a chave certa aqui.
**Depende de:** 030 · **Libera:** —
**Risco e como reverter:** limite persistente pode recusar um embed legítimo muito acessado —
calibre o valor com o dono. `git revert` + migration de rollback.
**Precisa de aprovação humana antes do merge:** **sim** se criar tabela (DDL).
**Como verificar:** 61 requisições em um minuto com o mesmo token, a partir de duas máquinas
diferentes → a 61ª recebe **429** (hoje, com duas instâncias, passariam 120).
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 032 — Parar de mandar o token do relatório na URL
**Onda / Severidade / Camada:** 1 / Média / Frontend + Backend
**Achados resolvidos:** A-12
**Problema hoje:** `src/hooks/reporting/useEmbeddedReportPreview.ts` envia o token no
cabeçalho **e** na query (`?token=…`). O comentário no próprio arquivo diz que a query é
transitória, "remover quando o deploy das functions estiver confirmado" — e EXECUTADO: as
funções **estão** deployadas (171 de 171 respondem), então a condição já foi satisfeita.
**Causa raiz:** compatibilidade temporária de uma migração que terminou.
**Caminho recomendado:** remova a query string do `fetch` no hook; em seguida, remova o
`?? url.searchParams.get("token")` do handler. **Nessa ordem e em PRs separadas**, com o
deploy da função entre as duas: se você remover do servidor primeiro, todo embed já
distribuído com URL antiga quebra na hora.
**Arquivos e objetos a tocar:** `src/hooks/reporting/useEmbeddedReportPreview.ts` (PR 1);
`supabase/functions/report-embed-public/index.ts` (PR 2).
**Não tocar / armadilhas:** antes da PR 2, confirme com o dono se há embed distribuído por
URL fora do app (num portal, num e-mail). Se houver, a PR 2 espera a troca dos links.
**Depende de:** 030 · **Libera:** —
**Risco e como reverter:** embed antigo com token na URL deixa de funcionar após a PR 2.
`git revert`.
**Precisa de aprovação humana antes do merge:** **sim** na PR 2 (pode quebrar link em uso).
**Como verificar:** no navegador, abrir `/embed/report/<token>` e, na aba de rede, confirmar
que a requisição à função **não** tem `?token=` e devolve 200. Depois da PR 2:
`curl "$SUPABASE_URL/functions/v1/report-embed-public?token=<valido>"` sem cabeçalho →
esperado **400**.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 033 — Tirar a chave de serviço do ambiente do job que roda código da PR
**Onda / Severidade / Camada:** 1 / Alta / CI (segurança)
**Achados resolvidos:** A-58
**Problema hoje:** `.github/workflows/pr-checks.yml:339-346` declara
`SUPABASE_SERVICE_ROLE_KEY` **no nível do job** `deno-tests`, portanto no ambiente de todos os
steps — inclusive `deno install --frozen=false` (`:364`) e os executores de suítes escritas
na branch da PR (`:367`, `:370`). O tier `unit` é declarado "self-contained" (`:331`) e não
precisa do segredo.
**Causa raiz:** o segredo foi declarado no job por conveniência, em vez de no step que o usa.
**Caminho recomendado:** mova a variável do bloco `env:` do job para o `env:` do **step**
`live` apenas. Em seguida, some o guard de origem que o repositório já usa em
`.github/workflows/cron-monitoring.yml:40`
(`github.event.pull_request.head.repo.full_name == github.repository`), para deixar explícito
o que hoje depende só do comportamento da plataforma.
**Arquivos e objetos a tocar:** `.github/workflows/pr-checks.yml`.
**Não tocar / armadilhas:** não remova o segredo do tier `live` — ele existe para testar
contra o banco. Não troque pela chave publishable: o teste `live` precisa ignorar a RLS de
propósito.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** se algum teste `unit` depender do segredo sem declarar, ele passa a
falhar — e isso é informação útil. `git revert`.
**Precisa de aprovação humana antes do merge:** **sim** — altera workflow de CI.
**Como verificar:** abrir uma PR de teste com um passo que imprima
`${SUPABASE_SERVICE_ROLE_KEY:+definida}` no step `unit` → esperado **vazio**; no step `live`,
`definida`.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 034 — Decidir o destino da camada de e-mail: configurar ou desligar
**Onda / Severidade / Camada:** 1 / Alta / Infraestrutura
**Achados resolvidos:** A-39
**Problema hoje:** `RESEND_API_KEY` não está configurada. EXECUTADO: `new-device-alert` →
503 `{"error":"RESEND_API_KEY not configured"}` e `notify-critical-pattern` → 200
`{"ok":false,"skipped":true}`. Onze funções leem o segredo, e **nenhuma falha ruidosamente**:
alerta de SLA de lead, risco de churn, acesso negado, venda fechada, meta e saúde de webhook
não chegam a ninguém.
**Causa raiz:** o segredo nunca foi configurado no projeto, e as funções tratam ausência como
"pular", não como erro.
**Caminho recomendado:** pergunte ao dono qual dos dois caminhos vale:
(a) **configurar** `RESEND_API_KEY` nos secrets das edge functions e verificar cada uma das
11 — nesse caso **as etapas 005 e 007 precisam estar mergeadas antes**, ou você liga um
remetente público; ou
(b) **desligar** explicitamente: manter o segredo ausente, mas trocar o `skipped` silencioso
por registro em `edge_call_failures` (tabela que o repositório já usa para isso) e um alerta
único, para que a ausência apareça em vez de sumir.
Não faça (a) sem 005/007.
**Arquivos e objetos a tocar:** nenhum em (a), além da configuração; em (b), as funções
listadas em A-39.
**Não tocar / armadilhas:** o "esqueci minha senha" do usuário final **não** depende disso —
`src/hooks/auth/useAuthForm.ts:168` usa `supabase.auth.resetPasswordForEmail`. Não "conserte"
o que não está quebrado.
**Depende de:** 005, 007 · **Libera:** —
**Risco e como reverter:** em (a), e-mails voltam a sair — inclusive de funções que hoje
ninguém observa; comece por uma função e verifique. Reverter é remover o segredo.
**Precisa de aprovação humana antes do merge:** **sim** — é configuração de produção com
custo e com envio para clientes.
**Como verificar:** em (a): `POST` autenticado em `send-transactional-email` com um
destinatário interno → e-mail recebido e linha em `email_logs`. Em (b): `POST` em
`notify-critical-pattern` autenticado → linha nova em `edge_call_failures`.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 035 — Dar à política de segurança do site uma diretiva de script
**Onda / Severidade / Camada:** 1 / Média / Infraestrutura
**Achados resolvidos:** A-22
**Problema hoje:** EXECUTADO contra produção, o cabeçalho é
`content-security-policy: frame-ancestors 'self'` — **única diretiva**. Não há
`default-src`, `script-src` nem `connect-src`; faltam também `Permissions-Policy` e os
cabeçalhos `Cross-Origin-*`. Origem: `vercel.json`, bloco `headers`.
**Causa raiz:** a política foi adicionada para resolver o embutimento em frame e nunca foi
estendida.
**Caminho recomendado:** vá em duas etapas, nunca direto para a política final:
1. publique a política em **modo de relatório** (`Content-Security-Policy-Report-Only`) com
   `default-src 'self'`, `connect-src 'self' https://usyxfpqlsspldubptrdl.supabase.co`,
   `img-src 'self' data: blob:`, `style-src 'self' 'unsafe-inline'` e mantenha
   `frame-ancestors 'self'`;
2. navegue pelas telas principais, colete as violações relatadas, ajuste, e só então troque
   para o cabeçalho que bloqueia.
O Vite gera script com hash e o app usa estilo embutido — por isso `script-src` precisa ser
verificado no passo 1, e não adivinhado.
**Arquivos e objetos a tocar:** `vercel.json`.
**Não tocar / armadilhas:** o bloco `/embed/(.*)` **não** deve receber `frame-ancestors` —
ele existe para ser embutido; mas pode receber as demais diretivas. Não acrescente
`upgrade-insecure-requests` junto: dificulta isolar a causa se algo quebrar.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** uma política mal calibrada quebra a aplicação inteira para todos
os usuários — é exatamente por isso que o passo 1 é obrigatório. Reverter é republicar o
`vercel.json` anterior (deploy automático).
**Precisa de aprovação humana antes do merge:** **sim** no passo 2 (pode derrubar o site).
**Como verificar:**
`curl -s -D - -o /dev/null https://promo-champions-v2-1.vercel.app/ | grep -i content-security`
→ no passo 1, aparece `content-security-policy-report-only` com as diretivas; no passo 2,
`content-security-policy` com `script-src`. E o app carrega sem erro no console.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 036 — Ampliar o detector de segredos e tratar as credenciais já versionadas
**Onda / Severidade / Camada:** 1 / Média / CI (segurança)
**Achados resolvidos:** A-59
**Problema hoje:** há 6 arquivos com JWT versionado (5 migrations e
`scripts/verify-dispatcher-request-id.sh:22`), todos `role=anon` de projetos que **não** são o
oficial. O detector só reporta `role === "service_role"`
(`scripts/security/check-no-committed-service-role.ts:38-47`), então eles passam — enquanto o
modelo de PR promete "nenhum secret/credencial no código-fonte". O repositório é público.
**Causa raiz:** o detector foi escrito para um tipo de chave só.
**Caminho recomendado:**
1. Amplie o detector para qualquer JWT com `role` presente (anon incluído), `sb_secret_*`,
   `sb_publishable_*` fora de `src/integrations/supabase/env.ts` (onde é público por desenho,
   com comentário explicando) e URLs de conexão Postgres.
2. Para os arquivos existentes: **não reescreva migrations já aplicadas** (ver etapa 010).
   Substitua o literal por um marcador e documente; e informe o dono para **rotacionar**
   aquelas chaves nos projetos de origem, se eles ainda existirem.
3. `scripts/verify-dispatcher-request-id.sh:22` é script, não migration: lá o valor pode sair
   para variável de ambiente agora.
**Arquivos e objetos a tocar:** `scripts/security/check-no-committed-service-role.ts`;
`scripts/verify-dispatcher-request-id.sh`; allowlist documentada para os históricos.
**Não tocar / armadilhas:** **nunca** registre o valor da chave na PR, no commit ou no
progresso — só o local e o tipo. Verificado nesta auditoria e importante para não perder
tempo: as funções que chamavam `rapjswienfhkobhlamxb` **não existem** no schema de produção
(`grep` = 0), então não há tráfego ativo para outro projeto.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** o detector ampliado pode acusar falso positivo em fixture de
teste; use allowlist por caminho, não desligue a regra.
**Precisa de aprovação humana antes do merge:** não (o script não está no gate obrigatório
hoje; se a etapa 039 já tiver entrado, passa a ser **sim**).
**Como verificar:** `npx tsx scripts/security/check-no-committed-service-role.ts` → deve
**falhar** apontando os 6 arquivos antes do tratamento, e passar depois.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 037 — Atualizar a rede de segurança do schema e garantir que ela não envelheça
**Onda / Severidade / Camada:** 1 / Alta / Banco (recuperação)
**Achados resolvidos:** A-46
**Problema hoje:** `supabase/schema.sql` é, pelo próprio cabeçalho (`:7-10`), o único artefato
capaz de reconstruir o banco — as migrations não replayam (271 falham). Ele está parado em
17/11 e **19 migrations atrás**. Provas: `:6821` ainda traz
`scheduled_sends_status_check` **sem `processing`**, que a migration `20261120000000`
substituiu justamente para corrigir o erro 23514 em todo claim; e
`grep -c "idx_semantic_index_embedding_hnsw\|cron_job_last_run"` = **0**.
**Causa raiz:** o artefato de recuperação é gerado à mão e nada exige que acompanhe as
migrations.
**Caminho recomendado:**
1. Regenere `supabase/schema.sql` a partir do banco de produção, pelo mesmo caminho que gerou
   o atual (a introspecção está descrita no cabeçalho do arquivo).
2. Depois, acrescente a guarda: um passo de CI que falhe quando entrar migration nova e o
   `schema.sql` não tiver sido regenerado no mesmo intervalo. Sem a guarda, esta etapa se
   repete em um mês.
3. Pergunte ao dono sobre PITR/backup: o cabeçalho afirma que não há, e isso **não foi
   verificado** nesta auditoria. Se houver backup restaurável, a severidade deste item cai e
   vale corrigir o comentário.
**Arquivos e objetos a tocar:** `supabase/schema.sql`; um passo novo em
`.github/workflows/pr-checks.yml` ou um script em `scripts/`.
**Não tocar / armadilhas:** não edite o `schema.sql` à mão para "corrigir" o CHECK — ele deve
ser o retrato fiel do banco; editar à mão recria o problema que ele existe para evitar.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** nenhum para produção (é arquivo). A guarda de CI pode incomodar;
calibre para avisar antes de bloquear.
**Precisa de aprovação humana antes do merge:** **sim** se alterar workflow de CI.
**Como verificar:** `grep -c "processing" supabase/schema.sql` na linha do
`scheduled_sends_status_check` → presente; e
`grep -c "idx_semantic_index_embedding_hnsw" supabase/schema.sql` → **1**.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 038 — Fazer o portão de CI exigir sucesso, não ausência de falha
**Onda / Severidade / Camada:** 1 / Média / CI
**Achados resolvidos:** A-18
**Problema hoje:** `.github/workflows/pr-checks.yml:714-721` conta ocorrências de
`"result": "failure"` no JSON de `needs` e aprova se não houver nenhuma, com `if: always()`.
Dos quatro resultados possíveis (`success`, `failure`, `cancelled`, `skipped`), **`cancelled`
não é contado** — um job obrigatório cancelado deixa o portão verde.
**Causa raiz:** o portão interpreta resultado por busca de texto.
**Caminho recomendado:** inverta a lógica: aprove só se **todo** job exigido tiver resultado
`success` **ou** `skipped` — e trate `skipped` explicitamente, porque ele é legítimo para PR
só de documentação (é o caminho que `detect-changes` usa). Qualquer outro valor reprova.
Mantenha a mensagem final dizendo qual job reprovou, para o diagnóstico ser imediato.
**Arquivos e objetos a tocar:** `.github/workflows/pr-checks.yml` (job `ci-gate`).
**Não tocar / armadilhas:** não troque `if: always()` por outra condição — ele é necessário
para o job rodar mesmo com dependência pulada. Cuidado com o caso de PR só de documentação:
se você exigir `success` estrito, toda PR de docs passa a reprovar.
**Depende de:** — · **Libera:** 039, 040
**Risco e como reverter:** PRs que hoje passam com job cancelado passam a reprovar — é o
objetivo. `git revert`.
**Precisa de aprovação humana antes do merge:** **sim** — altera workflow de CI.
**Como verificar:** abra uma PR de teste, cancele manualmente o job `Unit Tests` e observe o
`CI Gate` → esperado **falha** (hoje fica verde). Depois, uma PR só de `docs/` → o gate passa.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 039 — Incluir o gate de migrations e os testes de SQL no portão obrigatório
**Onda / Severidade / Camada:** 1 / Alta / CI
**Achados resolvidos:** A-17
**Problema hoje:** EXECUTADO: o ruleset **22148182** de `main` exige apenas o check
`CI Gate`, e `pr-checks.yml:711` o faz depender só de
`[lint-and-typecheck, test, build, instrucoes-agentes]`. Ficam de fora, entre outros,
`migrations-gate` (`:165`), `sql-tests` (`:376`), `deno-tests` (`:335`) e `gen-types-drift`
(`:670`) — ou seja, uma PR entra em produção com migration inválida, teste de SQL vermelho ou
`types.ts` fora de sincronia.
**Causa raiz:** o agregador manteve a lista antiga enquanto novos jobs foram somados.
**Caminho recomendado:** acrescente ao `needs` do `ci-gate`, **um de cada vez e nesta ordem**:
`migrations-gate` → `sql-tests` → `deno-tests` → `gen-types-drift`. Depois de cada inclusão,
observe algumas PRs reais: se o job for instável, você descobre com um culpado só. Deixe
`security-audit` e `edge-functions-lint` como estão — o comentário de `:705-707` declara que
são informativos de propósito; mudar isso é decisão do dono, não do executor.
**Arquivos e objetos a tocar:** `.github/workflows/pr-checks.yml`.
**Não tocar / armadilhas:** o ruleset do GitHub não precisa mudar — ele aponta para o
`CI Gate`, e é o `needs` que define o alcance. Se adicionar `e2e` aqui antes da etapa 040, o
portão trava: o job é inalcançável hoje.
**Depende de:** 038 · **Libera:** —
**Risco e como reverter:** PRs passam a reprovar por jobs que antes eram ignorados — é o
objetivo, mas pode travar o fluxo no primeiro dia. Reverter é remover do `needs`.
**Precisa de aprovação humana antes do merge:** **sim** — altera workflow de CI.
**Como verificar:** abra uma PR com uma migration propositalmente fora de ordem → esperado
`CI Gate` **vermelho** (hoje fica verde).
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 040 — Tornar os testes de ponta a ponta alcançáveis
**Onda / Severidade / Camada:** 1 / Alta / CI (testes)
**Achados resolvidos:** A-24
**Problema hoje:** o job `e2e` é **inalcançável em qualquer evento**. Ele só roda em
`workflow_dispatch` (`pr-checks.yml:471`), mas depende de `lint-and-typecheck` (`:465`), que
exige `has-code == 'true'` (`:93`) — e em `workflow_dispatch` o `detect-changes` (`:44-61`) lê
`github.event.pull_request.base.sha`, **vazio** fora de PR, e o `|| true` engole o erro,
devolvendo `has_code=false`. EVIDÊNCIA AO VIVO: run **44931311890** (PR Checks #2151,
`workflow_dispatch`, 2026-11-21): `E2E Tests`, `Unit Tests`, `Lint & Type Check`,
`Build Check`, `Migrations Gate`, `SQL Suites` e outros = **skipped**; `CI Gate` =
**success**. Resultado: 26 dos 49 specs nunca rodam, incluindo
`rls-scope-salesperson.spec.ts`, que `docs/RLS_MATRIX.md` apresenta como prova executável do
isolamento por papel.
**Causa raiz:** `detect-changes` deriva a base do diff de um campo que só existe em
`pull_request`, e o `|| true` esconde a falha; o job de e2e foi amarrado justamente ao evento
em que esse cálculo não funciona.
**Caminho recomendado:**
1. Corrija `detect-changes` primeiro: em `workflow_dispatch`, trate como `has_code=true`
   (mesmo caminho do `push`, `:45-48`), em vez de calcular diff sem base. Tire o `|| true`
   de cima do `git diff` ou separe-o do `grep`, para a falha aparecer.
2. Só depois decida onde o e2e roda. A recomendação é mantê-lo fora do caminho de toda PR
   (é caro) e agendá-lo no `qa-exhaustive.yml`, que já roda semanalmente e tem a estrutura
   pronta — adicionando `npx playwright test` (o `playwright.config.ts`, não o de a11y).
3. Atalho a evitar: **não** mude só o `if` do job para `pull_request`. Isso coloca 26 specs
   com login real no caminho de toda PR, e a suíte tem 222 skips condicionais que dependem de
   segredo (A-25): o resultado seria um gate lento e instável, e a reação natural seria
   desligá-lo de novo.
**Arquivos e objetos a tocar:** `.github/workflows/pr-checks.yml` (job `detect-changes` e,
conforme a decisão, o `if` do job `e2e`); `.github/workflows/qa-exhaustive.yml`.
**Não tocar / armadilhas:** o projeto `quote-to-sale` (23 specs) **já roda em PR** por
`quote-to-sale-e2e.yml:182` — não o duplique. A a11y também já roda. O que falta são os
projetos `chromium-desktop`, `page-smoke` e os dois `mobile-*`.
**Depende de:** 038 · **Libera:** 041
**Risco e como reverter:** rodar 26 specs que nunca rodaram vai revelar falhas acumuladas —
conte com isso e trate como descoberta, não como regressão da sua PR. `git revert`.
**Precisa de aprovação humana antes do merge:** **sim** — altera workflow de CI.
**Como verificar:** dispare o `pr-checks.yml` manualmente em uma branch de código → esperado
`Lint & Type Check`, `Unit Tests` e `Build Check` com resultado `success` (hoje `skipped`).
Depois, rode o `qa-exhaustive.yml` e confirme que `rls-scope-salesperson.spec.ts` aparece no
relatório com resultado, qualquer que seja.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

## Onda 2 — Fluxos principais quebrados

### Etapa 041 — Corrigir o custo de comissão do painel de ROI
**Onda / Severidade / Camada:** 2 / Crítica / Frontend
**Achados resolvidos:** A-123
**Problema hoje:** `src/hooks/dashboard/useROIDashboard.ts:98` —
`const commissionPaid = totalRevenue * (sp.commission_rate || 0.1);` **sem dividir por 100**.
A coluna é percentual (`supabase/schema.sql:4429`, padrão `10.00`), e todos os outros
consumidores dividem: `src/services/biService.ts:323`,
`src/hooks/sales/useSalespeople.ts:125`, `src/hooks/dashboard/useGoalsDashboard.ts:106-107`.
**Causa raiz:** a unidade não faz parte do tipo; cada consumidor adivinha.
**Caminho recomendado:** divida por 100 e troque o fallback `|| 0.1` por `|| 10` (percentual),
para que o valor de reserva fique na mesma unidade. Essa troca do fallback é tão importante
quanto a divisão: deixar `0.1` como padrão esconderia o erro em quem não tem taxa cadastrada.
Enquanto estiver no arquivo, **não** mexa no salário base nem no LTV fixos (`:89`, `:109`) —
são decisão de negócio e viram etapa própria (119).
**Arquivos e objetos a tocar:** `src/hooks/dashboard/useROIDashboard.ts`.
**Não tocar / armadilhas:** não "padronize" os outros quatro consumidores nesta etapa; a
unificação é a etapa 042. Aqui só o erro de 100×.
**Depende de:** — · **Libera:** 042
**Risco e como reverter:** o ROI vai mudar de −90% para um valor plausível; avise o dono para
ele não achar que é outro bug. `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** abra `/roi` com um vendedor de taxa 10% e receita conhecida → o custo de
comissão deve ser 10% da receita, não 10×. Teste unitário sugerido: receita 1000, taxa 10 →
`commissionPaid === 100`.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 042 — Unificar "a comissão desta venda" numa única fonte
**Onda / Severidade / Camada:** 2 / Crítica / Regras de negócio
**Achados resolvidos:** A-122
**Problema hoje:** três taxas convivem — `commission_rules.percentage` (o que o banco grava,
padrão 5%), `salespeople.commission_rate` (o que a tela mostra, padrão 10%) e
`salesperson_commission_configs.rate` (gravada por `src/pages/admin/AdminComercial.tsx:236-247`
e **lida por ninguém**). O vendedor vê na tela de Metas um valor que pode ser o dobro do que
recebe.
**Causa raiz:** não existe uma função única "comissão desta venda".
**Caminho recomendado:**
1. Pergunte ao dono **qual** é a taxa válida. Esta é uma decisão de negócio, não técnica, e
   sem ela qualquer unificação escolhe um número arbitrário.
2. Com a resposta, exponha **uma** fonte no banco — o caminho natural é uma função
   `public.fn_commission_rate_for(sale_id)` que aplique a mesma resolução de regra do trigger
   (`20261013130000_…sql:55-66`), e que o front consuma por RPC em vez de recalcular.
3. Converta os consumidores um a um, nesta ordem: `useGoalsDashboard.ts:106-108`,
   `src/components/goals/CommissionCalculator.tsx:96,110,168`,
   `src/hooks/bi/useBICloser.ts:184`, `src/services/biService.ts:323`,
   `src/hooks/sales/useSalespeople.ts:125`,
   `src/components/vendedor/RunRateProjectionCard.tsx:46`.
4. Decida com o dono o destino de `salesperson_commission_configs` — ou passa a ser lida, ou
   a tela que a grava deve sair (a etapa 128 cuida disso).
**Arquivos e objetos a tocar:** uma migration (a função); os seis consumidores listados.
**Não tocar / armadilhas:** o fallback de 5% do trigger é a etapa 100 — não o altere aqui, ou
as duas mudanças se misturam e ninguém sabe qual causou a diferença no valor. Faça o front
**consumir**, não reimplementar: duas implementações "iguais" divergem na primeira regra nova.
**Depende de:** 041 · **Libera:** 100
**Risco e como reverter:** os valores exibidos vão mudar para muitos vendedores. Anuncie antes.
Reverter é `git revert` do front; a função no banco pode ficar.
**Precisa de aprovação humana antes do merge:** **sim** — muda número de comissão exibido.
**Como verificar:** para 5 vendas de perfis diferentes, comparar o valor da tela com
`SELECT commission_amount FROM public.commissions WHERE sale_id = '<id>'` → devem bater
centavo a centavo.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 043 — Separar "Arquivado" de "Ganho"
**Onda / Severidade / Camada:** 2 / Crítica / Regras de negócio
**Achados resolvidos:** A-124
**Problema hoje:** a coluna "Arquivado" do quadro usa um valor de status que o banco entende
como fechamento (`src/hooks/usePipeline.ts:59`, `src/constants/index.ts:69`,
`supabase/migrations/20261001220100_sales_status_canonico.sql:49`), disparando o trigger de
comissão (`20261013130000_…sql:33`), XP e probabilidade de estágio
(`20261001220000_stage_probabilities.sql:44`).
**Causa raiz:** o rótulo da interface e o significado do valor no banco divergiram.
**Caminho recomendado:**
1. Primeiro **meça o estrago** antes de mudar qualquer código:
   `SELECT count(*) FROM public.sales WHERE status = '<valor de arquivado>';` e quantas
   comissões existem para essas vendas. Esse número vai ao dono.
2. Introduza um status próprio para arquivamento, **fora** da lista canônica de ganho, e
   mapeie a coluna do quadro para ele. Acrescente o valor em `public.status_transitions`
   (`20261001213000_…sql`) para a máquina de estados aceitar a transição.
3. **Não** faça correção retroativa de dado por iniciativa própria: reclassificar vendas
   antigas muda receita histórica e comissão já aprovada. Isso é decisão do dono, e vira
   etapa separada com SQL revisado por ele.
**Arquivos e objetos a tocar:** `src/constants/index.ts`, `src/hooks/usePipeline.ts`, uma
migration para o novo status e a transição.
**Não tocar / armadilhas:** o valor atual pode estar em uso legítimo por integração — rode
`grep -rn "<valor>" src/ supabase/` antes. Não remova o valor antigo da lista canônica sem
tratar as linhas existentes, ou relatórios históricos mudam sozinhos.
**Depende de:** 010 · **Libera:** —
**Risco e como reverter:** alto para dado histórico se a correção retroativa for feita junto —
por isso ela fica fora. Reverter o código é `git revert`; o status novo pode ficar.
**Precisa de aprovação humana antes do merge:** **sim** — DDL e mudança de significado de
receita.
**Como verificar:** arraste um negócio de teste para "Arquivado" → `SELECT status FROM
public.sales WHERE id = '<id>'` com o status novo, **nenhuma** linha nova em `commissions`
para essa venda, e nenhum XP creditado.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 044 — Mapear "cotação expirada" para um status que não seja ganho
**Onda / Severidade / Camada:** 2 / Crítica / Integrações + regras de negócio
**Achados resolvidos:** A-125
**Problema hoje:** `supabase/functions/receive-quote-webhook/index.ts:61-70` não trata o
status "expirada" da cotação externa, que termina no valor entendido como ganho
(`src/constants/index.ts:69`, `20261001220100_…sql:49`), disparando comissão
(`20261013130000_…sql:33`). No sentido inverso, o caminho de `20261027140000_…sql:850-852`
ainda permite rebaixar uma venda ganha para "lead" quando a cotação de origem volta a
rascunho, apesar da proteção de
`20260718000001_fix_sync_quote_no_status_downgrade.sql:34-41`.
**Causa raiz:** o mapeamento de status externo → interno é incompleto e tem caminho duplo.
**Caminho recomendado:** torne o mapeamento **explícito e exaustivo**: uma tabela de
correspondência, com um caso padrão que **recusa** o evento e registra, em vez de adivinhar.
"Expirada" deve virar perdida/encerrada, nunca ganha. Para o rebaixamento, consolide num único
caminho — o da migration de 2026-07-18 — e remova o outro.
**Arquivos e objetos a tocar:** `supabase/functions/receive-quote-webhook/index.ts`; migration
para o caminho de rebaixamento.
**Não tocar / armadilhas:** esta função está hoje inoperante por falta de segredo (A-14) —
corrija o mapeamento **antes** de configurar a chave na etapa 048, ou você religa a entrada
com o mapeamento errado. Não confunda com `receive-quote-sync`, que é outro endpoint, ativo e
com HMAC.
**Depende de:** — · **Libera:** 048
**Risco e como reverter:** cotações que hoje entram como ganhas deixam de entrar — é o
objetivo; o dono precisa saber que a receita do mês pode cair. `git revert`.
**Precisa de aprovação humana antes do merge:** **sim** — altera o que conta como receita.
**Como verificar:** envie ao endpoint (autenticado) um evento com status "expirada" → a venda
criada/atualizada **não** deve ficar com status de ganho, e nenhuma linha nova em
`commissions`. Um evento com status desconhecido deve ser recusado e registrado.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 045 — Fazer os outros três pipelines moverem card
**Onda / Severidade / Camada:** 2 / Alta / Frontend + banco
**Achados resolvidos:** A-134
**Problema hoje:** `supabase/migrations/20260416104458_…sql:73-94` cria quatro pipelines, mas
os estágios (`20260224142333_…sql:9-10`) e o movimento de card
(`src/hooks/useMultiplePipelines.ts:153-161`,
`src/components/pipeline/PipelineBoard.tsx:117`) só funcionam para o primeiro. Pós-Venda,
Renovações e Parcerias dão "Erro ao mover deal" em toda tentativa.
**Causa raiz:** o movimento assume o conjunto de estágios do pipeline padrão.
**Caminho recomendado:** verifique primeiro se os três pipelines **são usados**:
`SELECT p.name, count(s.id) FROM public.pipelines p LEFT JOIN public.sales s
ON s.pipeline_id = p.id GROUP BY p.name;`. Se estiverem vazios, a correção mais honesta pode
ser **esconder** os três até alguém precisar deles (uma etapa de UI, barata) em vez de
implementar o movimento genérico. Se houver uso, o caminho é resolver os estágios pelo
`pipeline_id` do card, em vez da lista fixa.
**Arquivos e objetos a tocar:** `src/hooks/useMultiplePipelines.ts`,
`src/components/pipeline/PipelineBoard.tsx`; eventualmente uma migration de estágios.
**Não tocar / armadilhas:** o pipeline padrão funciona — não o refatore junto. A etapa 043
muda o significado de uma coluna; faça-a antes, ou você implementa o movimento para um estágio
cujo significado vai mudar.
**Depende de:** 043 · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** **sim** se a decisão for esconder pipelines
(remove funcionalidade visível).
**Como verificar:** em cada um dos quatro pipelines, arrastar um card de teste entre dois
estágios → sem erro, e `SELECT stage, pipeline_id FROM public.sales WHERE id = '<id>'`
refletindo o destino.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 046 — Aplicar as regras de aprovação que a tela promete
**Onda / Severidade / Camada:** 2 / Alta / Regras de negócio
**Achados resolvidos:** A-135
**Problema hoje:** número de aprovadores, limite por valor e prazo são configuráveis
(`src/hooks/admin/useApprovalWorkflows.ts:12-15,89,117-133`,
`src/pages/ApprovalWorkflowsPage.tsx:225-226,422-438,543-545`) e guardados
(`supabase/migrations/20260416180351_…sql:8-11,94`), mas **nada no caminho de aprovação lê
essas regras**: um clique de um único gestor aprova qualquer valor, e solicitação vencida fica
pendente para sempre.
**Causa raiz:** a configuração foi entregue sem o mecanismo que a consome.
**Caminho recomendado:** ponha a decisão no banco, não no front — uma função
`SECURITY DEFINER` que receba a solicitação e o aprovador, leia a regra aplicável, conte as
aprovações já registradas e só mude o estado quando o quórum for atingido. É o único jeito de
a regra valer para qualquer caminho (tela, integração, script). O prazo pede um cron que marque
as vencidas; o repositório já tem o padrão (`check-quote-expiration`).
**Arquivos e objetos a tocar:** migration com a função (e a tabela de aprovações individuais,
se não existir); `src/hooks/admin/useApprovalWorkflows.ts` para consumir a RPC.
**Não tocar / armadilhas:** antes de exigir quórum, confirme com o dono **quantas** pessoas
existem com papel de aprovador: exigir 2 aprovadores onde só há 1 gestor trava o fluxo de
desconto inteiro. Verifique também se há solicitações pendentes acumuladas — elas passarão a
exigir o quórum novo.
**Depende de:** 010 · **Libera:** 047
**Risco e como reverter:** aprovações passam a exigir mais gente; pode travar operação. Tenha
o SQL de rollback pronto.
**Precisa de aprovação humana antes do merge:** **sim** — DDL e mudança de controle de
desconto.
**Como verificar:** com uma regra "2 aprovadores acima de R$ 10.000", criar solicitação de
R$ 20.000, aprovar com um gestor → estado continua pendente; aprovar com o segundo → aprovada.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 047 — Só marcar "aprovado" depois de a mudança ser aplicada
**Onda / Severidade / Camada:** 2 / Alta / Regras de negócio
**Achados resolvidos:** A-136
**Problema hoje:** no fluxo de aprovação comercial, a solicitação é marcada como aprovada
independentemente do resultado da escrita que aplica a decisão. Se a RLS, uma restrição ou a
rede bloquearem, fica registrado "aprovado" sem efeito — e é exatamente o padrão de A-48
(escrita sem policy) que torna esse bloqueio provável.
**Causa raiz:** duas escritas sem transação, com o estado marcado antes do efeito.
**Caminho recomendado:** uma única RPC transacional que aplique a mudança **e** marque a
aprovação, como `fn_convert_quote_to_sale` já faz para a conversão de cotação
(referência: `src/hooks/useQuotes.ts:351-431`). Se a aplicação falhar, nada é marcado.
**Arquivos e objetos a tocar:** migration com a RPC; a tela/hook de aprovação comercial.
**Não tocar / armadilhas:** não resolva com `try/catch` no front revertendo o estado — se o
navegador fechar entre as duas chamadas, o registro fica inconsistente de novo.
**Depende de:** 046 · **Libera:** —
**Risco e como reverter:** aprovações que "funcionavam" silenciosamente passam a falhar
visivelmente — é o objetivo. Reverter por migration.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** force a falha (por exemplo, revogando temporariamente a permissão em
ambiente de teste) e confirme que a solicitação **não** fica marcada como aprovada.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 048 — Decidir e resolver a entrada de cotações do parceiro
**Onda / Severidade / Camada:** 2 / Alta / Integrações
**Achados resolvidos:** A-14, A-110
**Problema hoje:** EXECUTADO: `POST /functions/v1/receive-quote-webhook` → **500**
`{"error":"Server misconfigured: missing QUOTE_SYNC_API_KEY"}`
(`index.ts:9`, `:94-100`). O comportamento é fail-closed, então é disponibilidade, não
segurança. `docs/API.md:78` documenta o endpoint como parte da API, mas existe um segundo
caminho **ativo** (`receive-quote-sync`, com HMAC, que responde 401 corretamente). A função
também é a única pública sem `enforceRateLimit`.
**Causa raiz:** segredo nunca configurado, e dois caminhos de entrada para a mesma coisa.
**Caminho recomendado:**
1. Descubra qual caminho o parceiro usa:
   `SELECT origem, count(*), max(created_at) FROM public.quote_sync_inbound_log GROUP BY origem;`
   e pergunte ao dono.
2. Se for este endpoint: configure `QUOTE_SYNC_API_KEY` **depois** da etapa 044 (mapeamento de
   status) e acrescente `enforceRateLimit` como nos outros públicos
   (`receive-quote-sync/index.ts:415` é o modelo).
3. Se for `receive-quote-sync`: **remova** este endpoint e a linha de `docs/API.md:78`. Deixar
   um endereço publicado que só devolve 500 é pior que não ter.
4. Troque a mensagem de erro por algo que não revele o nome da variável de ambiente.
**Arquivos e objetos a tocar:** `supabase/functions/receive-quote-webhook/index.ts`;
`docs/API.md`; configuração de segredo (se o caminho (2) for o escolhido).
**Não tocar / armadilhas:** não configure a chave antes de 044 — você religaria a entrada com
o mapeamento que transforma cotação expirada em venda ganha.
**Depende de:** 044 · **Libera:** —
**Risco e como reverter:** em (2), cotações do parceiro voltam a entrar — acompanhe o primeiro
dia. Em (3), se o parceiro ainda usar o endereço, ele passa de 500 para 404; avise antes.
**Precisa de aprovação humana antes do merge:** **sim** — configuração de produção ou remoção
de endpoint documentado.
**Como verificar:** em (2), `POST` com a chave correta e um evento de teste → 200 e linha em
`quote_sync_inbound_log`; sem chave → 401 (não 500). Em (3), `POST` → 404.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 049 — Fazer o botão "Reprocessar" reprocessar
**Onda / Severidade / Camada:** 2 / Alta / Frontend + integrações
**Achados resolvidos:** A-105
**Problema hoje:** a mutação `retry` grava só `next_retry_at`
(`src/hooks/admin/useV4Callbacks.ts:125-138`), e o despachante só busca itens com
`attempts < 5` (`supabase/functions/notify-v4-quote-status/index.ts:121-127`, `:11`). A aba
"Esgotados" (`src/pages/admin/AdminV4CallbacksPage.tsx:220`) oferece justamente esse botão
(`:249-252`, `:409-418`), e o sucesso é anunciado de todo jeito
(`useV4Callbacks.ts:140`: *"evento(s) reagendado(s) para agora"*).
**Causa raiz:** a tela oferece a ação errada para o estado do item, e o aviso de sucesso não
depende do resultado.
**Caminho recomendado:** o conserto mais barato e mais honesto é na tela: na aba "Esgotados",
mostrar **"Resetar tentativas"** (`:253-256`, que zera `attempts`) em vez de "Reprocessar", e
desabilitar "Reprocessar" para itens com `attempts >= 5`, com explicação. Ajuste a mensagem
para dizer o que foi feito. Atalho a evitar: fazer `retry` zerar `attempts` sempre — isso
apaga a diferença entre "tentar de novo agora" e "recomeçar do zero", e remove o limite que
protege o parceiro de ser inundado.
**Arquivos e objetos a tocar:** `src/pages/admin/AdminV4CallbacksPage.tsx`;
`src/hooks/admin/useV4Callbacks.ts` (mensagem).
**Não tocar / armadilhas:** não altere `MAX_ATTEMPTS` nem o despachante.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** com uma linha de `v4_callback_dead_letters` com `attempts >= 5`, abrir a
aba "Esgotados" → "Reprocessar" desabilitado; clicar em "Resetar tentativas" → `attempts = 0`
e o evento é reenviado na próxima execução do despachante.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 050 — Dar policy de escrita a `cadence_alert_templates`
**Onda / Severidade / Camada:** 2 / Alta / Banco (RLS)
**Achados resolvidos:** A-48
**Problema hoje:** a tela grava (`UPDATE`
`src/components/sales/cadence/CadenceAlertConfig.tsx:90-92`, `INSERT` `:97-98`, `DELETE`
`:113-115`) e a tabela só tem policy de `SELECT`
(`supabase/schema.sql:26924`, `TO authenticated USING (true)`). O resultado esperado em
produção é `42501` em toda tentativa.
**Causa raiz:** a tabela foi criada com policy de leitura e a tela de configuração veio depois.
**Caminho recomendado:** antes de criar a policy, **confirme o erro** com uma sessão
autenticada (é a verificação que esta auditoria não pôde fazer). Depois crie `INSERT`,
`UPDATE` e `DELETE` para o papel que deve configurar alertas de cadência — pergunte ao dono se
é gestor ou qualquer vendedor; o padrão do repositório para configuração é admin/gestor
(`is_admin_or_manager(auth.uid())`).
**Arquivos e objetos a tocar:** nova migration em `supabase/migrations/`.
**Não tocar / armadilhas:** a policy de `SELECT` é `USING (true)` — é tabela de configuração,
e isso pode ser intencional (ver A-43). Não a remova nesta etapa.
**Depende de:** 010 · **Libera:** —
**Risco e como reverter:** criar policy abre escrita; se o papel escolhido for amplo demais,
qualquer vendedor altera a configuração de alerta do time. Reverter por migration.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** autenticado com o papel escolhido, criar um template na tela → sucesso e
linha nova; com papel sem permissão → erro visível (não silencioso).
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 051 — Dar policy de escrita a `cadence_outcome_rules`
**Onda / Severidade / Camada:** 2 / Alta / Banco (RLS)
**Achados resolvidos:** A-48
**Problema hoje:** `INSERT` em `src/components/sales/cadence/CadenceOutcomeConfig.tsx:111` e
`DELETE` em `:123`; a tabela só tem `SELECT` (`supabase/schema.sql:26952`).
**Causa raiz:** mesma de 050 — tabela de configuração criada só com leitura.
**Caminho recomendado:** confirme o `42501` com sessão autenticada, depois crie `INSERT` e
`DELETE` para o mesmo papel escolhido em 050 (mantenha a decisão consistente entre as duas
telas de configuração de cadência).
**Arquivos e objetos a tocar:** nova migration.
**Não tocar / armadilhas:** não altere a policy de `SELECT`.
**Depende de:** 050 · **Libera:** —
**Risco e como reverter:** igual a 050; reverter por migration.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** criar e excluir uma regra de desfecho pela tela → sucesso e linhas
refletindo a operação.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 052 — Resolver a gravação de `integration_logs`
**Onda / Severidade / Camada:** 2 / Média / Banco (RLS)
**Achados resolvidos:** A-48
**Problema hoje:** `INSERT` em `src/components/dashboard/IntegrationStatusPanel.tsx:171`, e a
única policy é `SELECT TO PUBLIC USING (is_admin_or_manager(auth.uid()))`
(`supabase/schema.sql:28711`) — **nem admin consegue inserir**.
**Causa raiz:** log de integração projetado para ser escrito pelo servidor e sendo escrito
pelo navegador.
**Caminho recomendado:** a pergunta certa é se o navegador **deve** escrever log de
integração. Provavelmente não: o padrão do repositório é o servidor registrar (veja
`edge_call_failures`). O caminho recomendado é a tela **parar de gravar** e o registro passar
a ser feito pela função que executa o teste de integração. Criar policy de `INSERT` para
`authenticated` aqui abre a porta para qualquer usuário poluir o log de integração.
**Arquivos e objetos a tocar:** `src/components/dashboard/IntegrationStatusPanel.tsx`;
eventualmente a edge function de teste de integração.
**Não tocar / armadilhas:** não crie a policy de `INSERT` sem antes descartar a alternativa —
é o caso em que a correção óbvia é a errada.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** rodar o teste de integração pelo painel → linha aparece em
`integration_logs` (gravada pelo servidor) e nenhum erro no console do navegador.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 053 — Resolver a gravação de `lead_score_trends`
**Onda / Severidade / Camada:** 2 / Média / Banco (RLS)
**Achados resolvidos:** A-48
**Problema hoje:** `INSERT` em
`src/components/lead-scoring/LeadScoringDashboard.tsx:176-179`; a tabela só tem `SELECT`
(`supabase/schema.sql:28918`).
**Causa raiz:** mesma de 052 — série histórica sendo gravada pelo navegador.
**Caminho recomendado:** tendência de score é dado derivado: deve ser gravada pelo processo
que calcula o score (há cron e edge function de `lead-scoring`), não pela tela que o exibe.
Remova a gravação do componente e verifique se o processo servidor já grava; se não, essa é a
etapa 103.
**Arquivos e objetos a tocar:** `src/components/lead-scoring/LeadScoringDashboard.tsx`.
**Não tocar / armadilhas:** confirme antes que a série é alimentada em outro lugar, ou a tela
fica sem histórico — melhor sem histórico falso do que com histórico que falha pela metade.
**Depende de:** — · **Libera:** 103
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** abrir o painel de lead scoring → nenhum erro de permissão no console, e a
tela renderiza a série existente.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 054 — Permitir marcar follow-up como enviado (e parar de engolir o erro)
**Onda / Severidade / Camada:** 2 / Alta / Banco (RLS) + frontend
**Achados resolvidos:** A-48
**Problema hoje:** `src/pages/FollowUpAudit.tsx:134-140` faz `UPDATE` de `retry_count` e
`status` em `follow_up_audit_logs`, que tem `INSERT` (`supabase/schema.sql:28507`) e `SELECT`
(`:28511`) e **nenhuma policy de `UPDATE`**. Pior: `:141` usa `if (!error)` — a falha é
ignorada e o usuário acha que marcou.
**Causa raiz:** policy de escrita incompleta e erro tratado como condição.
**Caminho recomendado:** duas partes na mesma PR: criar a policy de `UPDATE` para o papel
correto **e** trocar `if (!error)` por tratamento explícito com aviso ao usuário. A segunda
parte é a mais importante: sem ela, o próximo bloqueio volta a ser invisível.
**Arquivos e objetos a tocar:** nova migration; `src/pages/FollowUpAudit.tsx`.
**Não tocar / armadilhas:** o `if (!error)` pode estar replicado — rode
`grep -rn "if (!error)" src/` e trate os casos do mesmo arquivo; os de outros arquivos ficam
para a etapa 106.
**Depende de:** 010 · **Libera:** —
**Risco e como reverter:** reverter por migration + `git revert`.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** marcar um follow-up como enviado → `SELECT status, retry_count FROM
public.follow_up_audit_logs WHERE id = '<id>'` refletindo a mudança; e, com permissão
revogada em teste, a tela exibe erro em vez de silêncio.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 055 — Permitir excluir a conversa do assistente
**Onda / Severidade / Camada:** 2 / Média / Banco (RLS)
**Achados resolvidos:** A-48, A-93
**Problema hoje:** `src/hooks/sales/useSalesAssistant.ts:302` faz `DELETE` em `chat_messages`,
que tem `INSERT` (`supabase/schema.sql:27308`) e `SELECT` (`:27314`) e **nenhuma policy de
`DELETE`**. E a gravação da conversa engole o erro (`:120-151`), então o histórico "desaparece"
sem explicação.
**Causa raiz:** policy incompleta somada a erro engolido.
**Caminho recomendado:** criar a policy de `DELETE` escopada ao autor da conversa
(`user_id = auth.uid()`), e tratar o erro de gravação em `:120-151` com aviso ao usuário.
**Arquivos e objetos a tocar:** nova migration; `src/hooks/sales/useSalesAssistant.ts`.
**Não tocar / armadilhas:** não crie `DELETE` para admin/gestor sem perguntar — conversa é
dado do usuário, e exclusão por terceiro é decisão do dono.
**Depende de:** 010 · **Libera:** —
**Risco e como reverter:** reverter por migration + `git revert`.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** excluir uma conversa própria → sucesso; tentar excluir a de outro usuário
(via API) → `42501`.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 056 — Tornar transacional a mudança de status de orçamento
**Onda / Severidade / Camada:** 2 / Alta / Hooks + banco
**Achados resolvidos:** A-87
**Problema hoje:** `src/hooks/useQuotes.ts:188-257` atualiza `quotes` (`:209-216`) e depois
chama `transition_sale_status` (`:228-235`). Se a RPC falhar, o orçamento já mudou e a venda
não; o `onError` (`:246-252`) trata só conflito de trava e, no ramo `else`, **não invalida o
cache** — a lista continua mostrando o status antigo, que já não é o do banco.
**Causa raiz:** duas escritas sem transação, com tratamento de erro parcial.
**Caminho recomendado:** siga o padrão que já existe **no mesmo arquivo**:
`useConvertQuoteToSale` (`:351-431`) usa uma RPC transacional única
(`fn_convert_quote_to_sale`) e invalida as cinco chaves afetadas no `onSuccess` (`:410-416`).
Crie a RPC equivalente para a mudança de status (orçamento + venda em uma transação) e, no
mínimo, invalide `['quotes']` em **todos** os ramos de erro.
**Arquivos e objetos a tocar:** migration com a RPC; `src/hooks/useQuotes.ts`.
**Não tocar / armadilhas:** mantenha a trava otimista por `version` — ela está correta e
protege contra edição concorrente. Não remova o tratamento de conflito.
**Depende de:** 010 · **Libera:** —
**Risco e como reverter:** reverter por migration + `git revert`.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** force a falha da transição (status inválido) → o orçamento **não** muda e
a lista é recarregada mostrando o estado real.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 057 — Consertar a atualização otimista do pipeline
**Onda / Severidade / Camada:** 2 / Alta / Hooks
**Achados resolvidos:** A-85
**Problema hoje:** `src/hooks/usePipeline.ts:181,203,213` usa a chave `['pipeline-deals']`,
mas a consulta é registrada como `['pipeline-deals', filters]` (`:105`) e o hook é chamado sem
argumento em produção (`src/components/pipeline/PipelineBoard.tsx:93`,
`src/pages/Pipeline.tsx:18`). `getQueryData` casa chave exata, então o bloco
`if (previousDeals)` (`:185-204`) **nunca executa**, e o `onError` (`:213`) grava numa chave
que ninguém observa. Além disso, `:186` faz cópia rasa e `:193`/`:200` alteram o instantâneo
guardado como "anterior".
**Causa raiz:** chave exata usada onde era preciso correspondência por prefixo, e cópia rasa
usada como instantâneo.
**Caminho recomendado:** copie o padrão de `src/hooks/tasks/useTaskMutations.ts:108-124`:
`getQueriesData({ queryKey: ['pipeline-deals'] })` + `setQueriesData(...)` + restauração
chave a chave no `onError` (`:121-123`). Para o instantâneo, clone os arrays por estágio
(`Object.fromEntries(Object.entries(prev).map(([k,v]) => [k, [...v]]))`) e não mute o objeto
original.
**Arquivos e objetos a tocar:** `src/hooks/usePipeline.ts`.
**Não tocar / armadilhas:** não troque a chave da **consulta** para `['pipeline-deals']` — ela
precisa dos filtros, e mudar isso quebra o cache de todas as telas que filtram. O ajuste é na
mutação.
**Depende de:** — · **Libera:** 058, 059
**Risco e como reverter:** com a atualização otimista passando a funcionar de verdade, um erro
de escrita agora reverte visivelmente o card — comportamento novo para o usuário, e correto.
`git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** arraste um card com a rede desligada (DevTools → offline) → o card volta
para a coluna de origem e aparece o aviso de erro. Com rede, o card se move na hora, sem
esperar recarregamento.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 058 — Consertar a atualização otimista de clientes
**Onda / Severidade / Camada:** 2 / Alta / Hooks
**Achados resolvidos:** A-85
**Problema hoje:** `src/hooks/crm/useClients.ts:79,90,105,112` usa `['clients']` enquanto a
consulta é `['clients', filters]` (`:18`), e o hook é chamado sem argumento em
`src/components/sales/CreateSaleDialog.tsx:66`, `src/pages/ICP.tsx:34` e
`src/pages/Agenda.tsx:103`.
**Causa raiz:** mesma de 057.
**Caminho recomendado:** mesmo padrão de 057 (`getQueriesData`/`setQueriesData` por prefixo).
Aproveite para resolver A-100 no mesmo arquivo: a chave declara `filters` que o
`queryFn` ignora (`src/services/clientService.ts:35-42`) — ou passe o filtro adiante, ou tire
da chave. As duas coisas vivem no mesmo hook; separá-las em PRs diferentes só gera conflito.
**Arquivos e objetos a tocar:** `src/hooks/crm/useClients.ts`; eventualmente
`src/services/clientService.ts`.
**Não tocar / armadilhas:** três telas chamam sem argumento — teste as três.
**Depende de:** 057 · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** editar um cliente com a rede desligada → a lista reverte e exibe erro.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 059 — Consertar a atualização otimista de produtos
**Onda / Severidade / Camada:** 2 / Média / Hooks
**Achados resolvidos:** A-85
**Problema hoje:** `src/hooks/useProducts.ts:167,180,212,223` usa `['products']` enquanto a
consulta é `['products', filters]` (`:24`).
**Causa raiz:** mesma de 057.
**Caminho recomendado:** mesmo padrão de 057.
**Arquivos e objetos a tocar:** `src/hooks/useProducts.ts`.
**Não tocar / armadilhas:** `products` tem policy `SELECT USING (true)` (A-43) e é tabela de
referência — não mexa nela aqui.
**Depende de:** 057 · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** editar um produto com a rede desligada → a lista reverte e exibe erro.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 060 — Fazer a previsão de receita falhar visivelmente em vez de mentir
**Onda / Severidade / Camada:** 2 / Alta / Hooks
**Achados resolvidos:** A-86
**Problema hoje:** `src/hooks/useWeightedForecast.ts:54-62` só lança `salesRes.error`
(`:89`). Se `goalsRes` falhar, `monthlyGoal` vira 0 (`:161-164`) e o `confidenceScore`
(`:181-190`) calcula `(currentRevenue / Math.max(1, monthlyGoal)) * 20`, que explode e é
truncado em 100 — **a tela mostra confiança de 100% justamente quando a consulta de metas
falhou**. Se `scoresRes` falhar, some o ajuste por score (`:73-76`); se `stageHistoryRes`
falhar, some a penalização por estagnação (`:79-82`).
**Causa raiz:** `Promise.all` com verificação de erro parcial.
**Caminho recomendado:** verifique o erro de **todos** os resultados. Para os que são
essenciais (metas, vendas), lance e deixe a tela mostrar estado de erro. Para os que são
ajustes (score, histórico de estágio), é legítimo seguir sem eles — mas então a tela precisa
dizer que a previsão está em modo reduzido. O que não pode continuar é o número sair
silenciosamente errado. Corrija também o cálculo de confiança: com meta ausente, a confiança
deve ser **indefinida**, não 100%.
**Arquivos e objetos a tocar:** `src/hooks/useWeightedForecast.ts` e o componente que o
consome.
**Não tocar / armadilhas:** não transforme todo erro em exceção sem olhar a tela: se a
previsão virar uma página de erro ao primeiro ajuste indisponível, o usuário perde a
ferramenta inteira. A distinção entre essencial e ajuste é o cerne desta etapa.
**Depende de:** — · **Libera:** 061
**Risco e como reverter:** a tela passa a mostrar erro onde antes mostrava número — é o
objetivo. `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** com o `select` de metas forçado a falhar (nome de coluna inválido em
ambiente de teste) → a tela exibe erro, e **não** confiança de 100%.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 061 — Tratar o erro das consultas paralelas de premiação
**Onda / Severidade / Camada:** 2 / Alta / Hooks
**Achados resolvidos:** A-86
**Problema hoje:** `src/hooks/useEligibleBonuses.ts:115` só lança `bonusesRes.error`; se a consulta de vendas do mês falhar, `mtdRevenue` fica 0 (`:142-145`) e nenhuma premiação por marco é considerada atingida.
**Causa raiz:** `Promise.all` com verificação de erro parcial — a mesma de 060.
**Caminho recomendado:** verifique os quatro resultados. Para `salesRes` (essencial ao cálculo de marco), lance e mostre estado de erro no card de premiações; para `streakRes`/`allSalesRes`, siga com indicação de dado parcial. Isso se soma a 008/009: sem ele, a premiação pode ser avaliada sobre receita zero.
**Arquivos e objetos a tocar:** `src/hooks/useEligibleBonuses.ts` e `src/components/vendedor/EligibleBonusesCard.tsx`.
**Não tocar / armadilhas:** não altere o fallback de `achieved` aqui — é a etapa 009; as duas no mesmo arquivo em PRs diferentes vão conflitar, então faça 009 primeiro.
**Depende de:** 009, 060 · **Libera:** —
**Risco e como reverter:** o card passa a mostrar erro onde antes mostrava "não atingido". `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** com o `select` de vendas forçado a falhar, o card exibe erro em vez de premiação não atingida.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 062 — Tratar o erro das consultas paralelas de metas, perfil e relatório de vendas
**Onda / Severidade / Camada:** 2 / Média / Hooks
**Achados resolvidos:** A-86
**Problema hoje:** três hooks com o mesmo defeito: `src/hooks/dashboard/useGoalsDashboard.ts:60` (não checa `predictionsResult`), `src/hooks/gamification/useGamifiedProfile.ts:41` (não checa seis resultados) e `src/hooks/reports/useSalesReport.ts:49` (não checa `spRes`, e sem ele o ranking da equipe, o de markup e os melhores negócios saem vazios ou sem nome em `:54-56`).
**Causa raiz:** mesma de 060.
**Caminho recomendado:** mesmo tratamento de 060, um hook por PR para o diagnóstico ficar simples. Em `useSalesReport`, a lista de vendedores é essencial: sem ela o relatório parece "sem dados", o que é pior do que um erro.
**Arquivos e objetos a tocar:** os três hooks citados.
**Não tocar / armadilhas:** não unifique os três num helper novo nesta etapa — a tentação é grande e o risco de mudar o comportamento de três telas de uma vez não compensa.
**Depende de:** 060 · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** para cada hook, forçar a falha da consulta não verificada e observar erro na tela em vez de dado incompleto.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 063 — Unificar a data de fechamento de venda em uma definição
**Onda / Severidade / Camada:** 3 / Alta / Regras de negócio
**Achados resolvidos:** A-131
**Problema hoje:** três definições para "quando a venda foi ganha": `supabase/migrations/20261018200000_…sql:97-101` (banco), `src/hooks/gamification/useWeeklyRanking.ts:21-31` (usa `updated_at`) e `src/hooks/dashboard/useGoalsDashboard.ts:74-75`. Um negócio criado em outubro e fechado em novembro conta para o ranking de novembro e para a meta de outubro.
**Causa raiz:** não existe uma coluna única "data em que virou ganho"; cada consumidor escolhe uma data disponível.
**Caminho recomendado:** o problema não se resolve alinhando os `select`: resolve-se criando o fato. Acrescente `won_at timestamptz` a `sales`, preenchido pelo trigger quando a venda entra em status de ganho, e faça todos os consumidores usarem **essa** coluna. Para o histórico, preencha com a melhor aproximação disponível e **registre no commit qual foi** — não invente precisão. Usar `updated_at` como data de fechamento é o erro central a eliminar: qualquer edição posterior muda a semana da venda.
**Arquivos e objetos a tocar:** migration (coluna + trigger + preenchimento histórico); `useWeeklyRanking.ts`, `useGoalsDashboard.ts` e os demais consumidores de data de fechamento.
**Não tocar / armadilhas:** não mexa nos fusos nesta etapa (é a 064). Não apague `updated_at` de lugar nenhum — ele tem outros usos legítimos.
**Depende de:** 010 · **Libera:** 064, 065
**Risco e como reverter:** ranking e metas vão mudar de valor para o período histórico. Avise o dono antes. Reverter por migration + `git revert`.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção e mudança de número de ranking e meta.
**Como verificar:** para 5 vendas fechadas em meses diferentes do de criação, conferir que ranking e meta usam o mesmo mês: `SELECT id, created_at, updated_at, won_at FROM public.sales WHERE id IN (…)` e comparar com as duas telas.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 064 — Unificar o fuso horário de corte de período
**Onda / Severidade / Camada:** 3 / Alta / Regras de negócio
**Achados resolvidos:** A-131
**Problema hoje:** as edge functions usam `supabase/functions/_shared/business-date.ts:14-15` (horário de Brasília) e o front tem dois utilitários próprios (`src/lib/date.ts:10-18`, `src/utils/dateHelpers.ts:8-10`). O mesmo dia termina em horas diferentes em cada camada.
**Causa raiz:** dois utilitários de data no front, nenhum alinhado ao do servidor.
**Caminho recomendado:** eleja `business-date.ts` como fonte e crie o equivalente único no front, consumido por todos. Comece pelos cortes que decidem dinheiro: mês de meta, semana de ranking e janela de premiação. Atalho a evitar: converter tudo para UTC "porque é mais simples" — a empresa opera em horário de Brasília, e o corte do mês em UTC desloca vendas da virada.
**Arquivos e objetos a tocar:** novo utilitário em `src/lib/`; `src/lib/date.ts`, `src/utils/dateHelpers.ts` e os consumidores de corte de período.
**Não tocar / armadilhas:** não remova os dois utilitários antigos de uma vez: migre consumidor por consumidor, ou uma tela esquecida passa a somar outro período sem ninguém notar.
**Depende de:** 063 · **Libera:** 065
**Risco e como reverter:** cortes de período mudam para vendas feitas perto da meia-noite. Reverter é `git revert`.
**Precisa de aprovação humana antes do merge:** **sim** — muda número de meta e ranking.
**Como verificar:** uma venda registrada às 22h de 31/10 (Brasília) deve contar em outubro em **todas** as telas e nas edge functions.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 065 — Fazer meta ausente ser tratada do mesmo jeito em todas as telas
**Onda / Severidade / Camada:** 3 / Média / Regras de negócio
**Achados resolvidos:** A-132
**Problema hoje:** `src/hooks/dashboard/useGoalsDashboard.ts:66-69` assume meta 0 quando não há meta do mês; `supabase/migrations/20261018200000_…sql:144-146`, `supabase/functions/revops-hub/index.ts:124` e `supabase/functions/revenue-intelligence/index.ts:59` caem para a meta anterior. Se o gestor esquecer de lançar as metas, a tela de Metas mostra 0% e o RevOps mostra a meta do mês anterior.
**Causa raiz:** a regra para "mês sem meta" nunca foi decidida, e cada camada escolheu a sua.
**Caminho recomendado:** pergunte ao dono qual é a regra: herdar a meta anterior ou tratar como não definida. Qualquer das duas serve, desde que seja **uma**. Implemente no banco (função ou view) e faça as três camadas consumirem. Se a escolha for "não definida", a tela precisa dizer "meta não lançada", não "0%" — zero por cento é informação errada, não ausência de informação.
**Arquivos e objetos a tocar:** migration (função/view de meta efetiva); `useGoalsDashboard.ts`; `revops-hub/index.ts`; `revenue-intelligence/index.ts`.
**Não tocar / armadilhas:** não altere as metas gravadas; a etapa é sobre o que exibir quando não há meta.
**Depende de:** 063, 064 · **Libera:** —
**Risco e como reverter:** atingimento muda de valor nas telas. Reverter por migration + `git revert`.
**Precisa de aprovação humana antes do merge:** **sim** — decisão de negócio sobre meta.
**Como verificar:** para um vendedor sem meta no mês corrente, as três telas mostram o mesmo (a meta herdada, ou "não lançada" em todas).
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 066 — Impedir que comissão paga volte a pendente
**Onda / Severidade / Camada:** 3 / Alta / Banco
**Achados resolvidos:** A-128
**Problema hoje:** o trigger de comissão (`supabase/migrations/20261013130000_…sql:72-76`) insere sem olhar o estado anterior, e a máquina de estados não cobre o caminho que `src/hooks/usePipeline.ts:217` usa para mover o card. Uma comissão já paga pode ser reaberta e paga de novo.
**Causa raiz:** estados terminais declarados na máquina de estados, mas não aplicados nos pontos de escrita que importam.
**Caminho recomendado:** a transição de comissão já tem RPC própria (`transition_commission_status`, `20261001213000_…sql`): faça **toda** escrita de status de comissão passar por ela, e acrescente a regra de que `paid` e `cancelled` não voltam. No trigger, antes de inserir, verifique se já existe comissão para `(sale_id, salesperson_id)` em estado terminal — e nesse caso não insira (ver etapa 067 para o caso geral de reinserção).
**Arquivos e objetos a tocar:** migration (regra na RPC e guarda no trigger).
**Não tocar / armadilhas:** não use `ON CONFLICT DO UPDATE` para "resolver" — sobrescrever uma comissão paga é pior do que recusar a operação.
**Depende de:** 010 · **Libera:** 067
**Risco e como reverter:** refechar venda cujo pagamento já saiu passa a ser recusado com erro claro. Reverter por migration.
**Precisa de aprovação humana antes do merge:** **sim** — DDL e regra de pagamento.
**Como verificar:** com uma comissão em `paid`, tentar `transition_commission_status` para `pending` → erro; e refechar a venda correspondente não cria linha nova.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 067 — Tornar o trigger de comissão tolerante a refechamento
**Onda / Severidade / Camada:** 3 / Alta / Banco
**Achados resolvidos:** A-02, A-128
**Problema hoje:** `supabase/migrations/20261013130000_comissao_regras_e_split_sdr.sql:72-76` e `:97-101` fazem `INSERT` sem `ON CONFLICT`, com a UNIQUE `commissions_sale_salesperson_key (sale_id, salesperson_id)` criada no mesmo arquivo (`:14`). A máquina de estados permite `completed → closed → negotiation → completed` (`20261001213000_…sql:28-29`), e no segundo fechamento o INSERT viola a unique (23505) e **aborta o UPDATE da venda**.
**Causa raiz:** o trigger trata o fechamento como evento único, mas o ciclo de vida permite fechar mais de uma vez.
**Caminho recomendado:** decida com o dono o que deve acontecer no refechamento: manter a comissão original (mais comum) ou recalcular. Para "manter", use `ON CONFLICT (sale_id, salesperson_id) DO NOTHING`; para "recalcular", `DO UPDATE` **apenas** quando o estado atual não for terminal (etapa 066). Em nenhum caso deixe o `INSERT` nu: a migration `20261001220100_sales_status_canonico.sql:60-63` já documenta esse exato modo de falha para outra tabela — o repositório conhece o padrão.
**Arquivos e objetos a tocar:** migration substituindo `private.handle_sale_commissions`.
**Não tocar / armadilhas:** mantenha a UNIQUE — ela é o que impede comissão duplicada. Não altere o split do SDR nem a resolução de regra nesta etapa.
**Depende de:** 010, 066 · **Libera:** —
**Risco e como reverter:** se a escolha for `DO UPDATE`, uma venda reaberta e refechada com valor diferente passa a ter a comissão recalculada; isso muda dinheiro. Reverter por migration.
**Precisa de aprovação humana antes do merge:** **sim** — DDL e regra de pagamento.
**Como verificar:** com uma venda de teste: fechar, levar a `closed`, reabrir para `negotiation`, fechar de novo → o UPDATE **conclui sem erro** e `SELECT count(*) FROM public.commissions WHERE sale_id = '<id>'` continua 1 (ou 2 com o SDR), nunca erro 23505.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 068 — Revisar a comissão quando a venda muda, é cancelada ou excluída
**Onda / Severidade / Camada:** 3 / Alta / Banco
**Achados resolvidos:** A-129
**Problema hoje:** não há gatilho que reavalie `commissions` quando a venda muda de valor (`20261001213000_…sql:103-107`), é cancelada ou recebe exclusão lógica (`20261001193000_soft_delete_business_tables.sql:27-38`). A tela lista tudo que está `pending` (`src/hooks/useCommissions.ts:66-70`), então comissão sobre venda cancelada aparece como qualquer outra.
**Causa raiz:** a comissão é criada por evento e nunca revista.
**Caminho recomendado:** crie um gatilho em `sales` que, ao mudar `amount`, `status` ou `deleted_at`, marque a comissão associada para revisão — e **não** a apague nem a altere em silêncio. O caminho seguro é um estado `needs_review` (ou uma coluna de sinalização) que faça a linha aparecer destacada na tela de aprovação, com o motivo. Alterar valor de comissão automaticamente é decisão de negócio; sinalizar não é.
**Arquivos e objetos a tocar:** migration (gatilho + estado/coluna); `src/pages/AdminComissoes.tsx` para exibir o destaque.
**Não tocar / armadilhas:** não inclua `cancelled` → apagar a comissão: histórico de comissão é documento financeiro. Respeite 066: comissão paga não volta a pendente nem para revisão.
**Depende de:** 010, 066, 067 · **Libera:** —
**Risco e como reverter:** a tela de aprovação passa a mostrar comissões sinalizadas; o gestor precisa saber o que fazer com elas. Combine o texto com o dono.
**Precisa de aprovação humana antes do merge:** **sim** — DDL e processo de pagamento.
**Como verificar:** alterar o valor de uma venda com comissão pendente → a comissão aparece sinalizada na tela; cancelar a venda → idem; e uma comissão `paid` não é afetada.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 069 — Fazer receita e meta respeitarem a exclusão lógica
**Onda / Severidade / Camada:** 3 / Alta / Regras de negócio
**Achados resolvidos:** A-130
**Problema hoje:** a exclusão lógica foi adotada (`20261001193000_soft_delete_business_tables.sql:1-15`) e as views `v_active_*` existem (`supabase/schema.sql:30320-30356`), mas os consumidores de número leem a tabela direto: `src/hooks/dashboard/useGoalsDashboard.ts:71-75` e `src/hooks/gamification/useWeeklyRanking.ts:26-31`.
**Causa raiz:** a exclusão lógica foi implementada no banco e não propagada aos consumidores.
**Caminho recomendado:** troque a origem desses dois hooks para as views `v_active_*` (ou acrescente `.is('deleted_at', null)`), começando pelos que decidem dinheiro. Preferir a view é melhor: centraliza a regra e não depende de cada consulta lembrar do filtro.
**Arquivos e objetos a tocar:** `useGoalsDashboard.ts`, `useWeeklyRanking.ts`.
**Não tocar / armadilhas:** não varra o repositório inteiro trocando `from('sales')` por view nesta etapa — algumas telas **precisam** ver registro excluído (auditoria). As etapas 070 e 071 tratam os demais casos, um domínio por vez.
**Depende de:** — · **Libera:** 070, 071
**Risco e como reverter:** receita e ranking caem onde havia venda excluída — é a correção. Avise o dono. `git revert`.
**Precisa de aprovação humana antes do merge:** **sim** — muda receita e ranking exibidos.
**Como verificar:** excluir (logicamente) uma venda de teste → o valor sai da meta e do ranking na recarga seguinte.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 070 — Fazer premiação respeitar a exclusão lógica
**Onda / Severidade / Camada:** 3 / Alta / Regras de negócio
**Achados resolvidos:** A-130
**Problema hoje:** `src/hooks/useEligibleBonuses.ts:122-135` lê `sales` sem filtrar exclusão lógica, então uma venda excluída continua contando para marco de premiação.
**Causa raiz:** mesma de 069.
**Caminho recomendado:** mesmo tratamento de 069. Faça depois de 008/009, para não misturar mudança de origem de dado com mudança de regra de elegibilidade.
**Arquivos e objetos a tocar:** `src/hooks/useEligibleBonuses.ts`.
**Não tocar / armadilhas:** se a avaliação migrar para o servidor na etapa 008, aplique o filtro **lá** e não nos dois lugares.
**Depende de:** 008, 069 · **Libera:** —
**Risco e como reverter:** premiações que pareciam atingidas podem deixar de ser. Avise o dono. `git revert`.
**Precisa de aprovação humana antes do merge:** **sim** — muda elegibilidade a prêmio.
**Como verificar:** excluir uma venda que compunha o marco → o card de premiação deixa de mostrar atingido.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 071 — Fazer a ativação de cliente ignorar venda excluída
**Onda / Severidade / Camada:** 3 / Alta / Banco
**Achados resolvidos:** A-130
**Problema hoje:** `check_is_first_activation` (`20261018200000_…sql:97-101`) considera vendas excluídas, então uma venda apagada continua "queimando" a primeira ativação do cliente — e o SDR perde a comissão de ativação por causa de um registro que, para o usuário, não existe mais.
**Causa raiz:** mesma de 069, do lado do banco.
**Caminho recomendado:** acrescente `AND deleted_at IS NULL` à consulta da função. Esta é a ocorrência de maior impacto individual da exclusão lógica, porque tira dinheiro de uma pessoa específica e é invisível.
**Arquivos e objetos a tocar:** migration substituindo `check_is_first_activation` (versão em `private.`, conforme `20260619143950`).
**Não tocar / armadilhas:** a função existe em dois esquemas (`public.` e `private.`) por causa da migration que moveu funções — corrija a que o trigger realmente usa, e confirme com `\\df` ou consulta a `pg_proc`.
**Depende de:** 010, 069 · **Libera:** —
**Risco e como reverter:** vendas de ativação podem passar a gerar comissão de SDR que antes não geravam — correto, e é dinheiro. Avise o dono. Reverter por migration.
**Precisa de aprovação humana antes do merge:** **sim** — DDL e regra de comissão de SDR.
**Como verificar:** com um cliente cuja única venda anterior está excluída, registrar nova venda → `is_first_sale = true` na comissão gerada.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 072 — Revogar as funções de gamificação que o vendedor pode chamar sobre si
**Onda / Severidade / Camada:** 3 / Alta / Banco
**Achados resolvidos:** A-137
**Problema hoje:** `supabase/migrations/20260831130000_harden_public_access_and_privileged_rpcs.sql:667-680` mantém executáveis por `authenticated` funções que concedem XP de liga, sequência, combo e progresso de meta progressiva — os números que decidem ranking, ligas e premiações. Nenhuma tela as chama.
**Causa raiz:** o pacote de hardening revogou a maioria das funções privilegiadas e deixou esse grupo de fora.
**Caminho recomendado:** siga o padrão do próprio arquivo: `REVOKE ALL ON FUNCTION … FROM PUBLIC, anon, authenticated;` e conceda a `service_role` apenas. Antes, confirme com `grep -rn "<nome>" src/ supabase/functions/` que nenhuma tela as chama — o relatório indica que não.
**Arquivos e objetos a tocar:** nova migration em `supabase/migrations/`.
**Não tocar / armadilhas:** se alguma edge function as chamar com o client do usuário (e não com `service_role`), ela quebra — verifique antes. Não altere o corpo das funções, só os privilégios.
**Depende de:** 010 · **Libera:** —
**Risco e como reverter:** se houver chamador legítimo não mapeado, a gamificação dele para. Reverter por migration.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** como usuário comum, `SELECT public.<funcao>(…)` → `42501 permission denied`; e o fluxo normal de XP (por venda) continua creditando.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 073 — Ponderar o markup médio pela receita
**Onda / Severidade / Camada:** 3 / Média / Regras de negócio
**Achados resolvidos:** A-138
**Problema hoje:** `src/lib/bi/markupOverviewHelpers.ts:62-65` e `src/lib/markupHelpers.ts:151-153` fazem média aritmética de percentuais; consumido em `src/components/reports/sales/SalesReportKpis.tsx:73,107` e `SalesMarkupRankingTable.tsx:7,31`. Uma venda de R$ 200 com 300% e uma de R$ 200.000 com 8% dão "markup médio 154%".
**Causa raiz:** média simples aplicada a uma grandeza que precisa de ponderação.
**Caminho recomendado:** calcule o markup agregado a partir dos totais (receita total sobre custo total), não como média dos percentuais. Deixe o nome do indicador explícito na tela ("markup sobre a receita do período") para o gestor saber o que está lendo.
**Arquivos e objetos a tocar:** `src/lib/bi/markupOverviewHelpers.ts`, `src/lib/markupHelpers.ts` e os dois componentes.
**Não tocar / armadilhas:** o alerta de markup crítico **por venda** está correto — não o toque. O defeito é só no agregado.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** o número do ranking de rentabilidade muda bastante; avise o dono. `git revert`.
**Precisa de aprovação humana antes do merge:** **sim** — muda ranking de rentabilidade.
**Como verificar:** com as duas vendas do exemplo, o indicador deve ficar próximo de 8%, não de 154%.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 074 — Separar valor e percentual no total de premiações
**Onda / Severidade / Camada:** 3 / Média / Regras de negócio
**Achados resolvidos:** A-139
**Problema hoje:** `src/hooks/useAutoAwardBonuses.ts:48` envia `bonus_amount` sem considerar o tipo do bônus, `supabase/migrations/20260723131706_…sql:60-64` aceita os dois tipos na mesma coluna e a tela soma tudo (`src/pages/AdminAuditoriaPremiacoes.tsx:538-540`). Um bônus de "5%" entra como R$ 5,00 no total a pagar.
**Causa raiz:** duas grandezas diferentes na mesma coluna, somadas sem olhar o tipo.
**Caminho recomendado:** resolva no servidor: a RPC que concede o prêmio deve calcular o valor em reais a partir do percentual e da base, e gravar **o valor** em `commission_bonus_awards`, mantendo o tipo e o percentual como referência. A tela então soma uma grandeza só. Atalho a evitar: filtrar por tipo apenas na soma da tela — o valor errado continua gravado e vai aparecer em qualquer outro relatório.
**Arquivos e objetos a tocar:** migration (RPC `award_bonus_if_eligible`); `src/pages/AdminAuditoriaPremiacoes.tsx`.
**Não tocar / armadilhas:** cuidado com os registros já gravados: eles têm percentuais na coluna de valor. Não os converta sem o dono revisar — vire etapa própria com a consulta de impacto.
**Depende de:** 008 · **Libera:** —
**Risco e como reverter:** o total da tela de auditoria muda; o financeiro precisa saber. Reverter por migration.
**Precisa de aprovação humana antes do merge:** **sim** — DDL e número que o financeiro usa.
**Como verificar:** conceder um bônus de 5% sobre base conhecida → `commission_bonus_awards` grava o valor em reais, e o total da tela bate com a soma manual.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 075 — Excluir comissões canceladas do total do vendedor
**Onda / Severidade / Camada:** 3 / Baixa / Frontend
**Achados resolvidos:** A-140
**Problema hoje:** `src/pages/Comissoes.tsx:29,36-42` soma todas as linhas de `src/hooks/useCommissions.ts:5` sem excluir `status = 'cancelled'`.
**Causa raiz:** o total foi escrito como soma de tudo que a consulta devolve.
**Caminho recomendado:** exclua as canceladas do "Total Geral" e, se fizer sentido, mostre-as em uma linha separada. Manter as canceladas visíveis na lista é correto; somá-las não.
**Arquivos e objetos a tocar:** `src/pages/Comissoes.tsx`.
**Não tocar / armadilhas:** não filtre na consulta: o vendedor deve continuar vendo as canceladas na lista.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** o total exibido cai. `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** com uma comissão cancelada na lista, o "Total Geral" deve ser igual à soma das não canceladas.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 076 — Tirar os números inventados do simulador de ganhos
**Onda / Severidade / Camada:** 3 / Média / Frontend
**Achados resolvidos:** A-141
**Problema hoje:** `src/components/financeiro/CommissionCalculator.tsx:92-106` exibe acumulado e posição no ranking que não vêm de consulta nenhuma, sob rótulo que afirma serem dados reais.
**Causa raiz:** valores de exemplo ficaram no componente publicado.
**Caminho recomendado:** ou ligue os dois campos aos dados reais (o acumulado existe em `commissions`; a posição, no ranking), ou **remova** os campos e o rótulo de "real". A segunda opção é preferível se o simulador é só projeção: um simulador honesto não precisa fingir extrato.
**Arquivos e objetos a tocar:** `src/components/financeiro/CommissionCalculator.tsx`.
**Não tocar / armadilhas:** não confunda com `src/components/goals/CommissionCalculator.tsx` (outro arquivo, outra tela) — o nome é o mesmo.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** abrir o simulador → nenhum número apresentado como real sem origem; se ligado, o acumulado bate com `SELECT sum(commission_amount) FROM public.commissions WHERE salesperson_id = '<id>' AND status <> 'cancelled'`.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 077 — Dar um CHECK ao status de cotação
**Onda / Severidade / Camada:** 3 / Média / Banco
**Achados resolvidos:** A-126
**Problema hoje:** `supabase/schema.sql:3914` define `quotes.status text` sem CHECK, e a máquina de estados (`20261001213000_…sql:178-188`) cobre `sales` e `commissions`, não `quotes`. O front compara por igualdade (`src/hooks/useQuotes.ts:78-86,126-140`), então um valor inesperado faz a cotação desaparecer dos filtros e dos indicadores.
**Causa raiz:** a tabela nasceu com status livre e a máquina de estados não foi estendida a ela.
**Caminho recomendado:** primeiro **levante os valores existentes** (`SELECT status, count(*) FROM public.quotes GROUP BY status;`) e combine o vocabulário com o dono. Depois acrescente o CHECK como `NOT VALID` (para não travar o histórico) e registre a entidade `quotes` em `public.status_transitions`, seguindo o desenho de `20261001213000`. Validar o CHECK é etapa separada, depois da limpeza do histórico (ver 078).
**Arquivos e objetos a tocar:** nova migration.
**Não tocar / armadilhas:** não acrescente o CHECK validado de uma vez: se houver valor legado fora da lista, a migration falha ou trava a tabela. Não mude valores existentes nesta etapa.
**Depende de:** 010 · **Libera:** 078
**Risco e como reverter:** se o vocabulário escolhido deixar de fora um valor em uso, novas gravações passam a falhar. Reverter por migration.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** `INSERT` de cotação com status fora da lista → erro; `SELECT status, count(*) FROM public.quotes GROUP BY status` sem valores novos aparecendo depois.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 078 — Validar as restrições de valor que entraram sem verificar o histórico
**Onda / Severidade / Camada:** 3 / Média / Banco
**Achados resolvidos:** A-50
**Problema hoje:** três CHECK estão `NOT VALID` desde a criação: `quotes.quotes_total_value_non_negative` (`supabase/schema.sql:6657`), `orders.orders_total_non_negative` (`:6530`) e `lead_scores.lead_scores_score_range` (`:6465`). A própria migration previu a segunda metade e ela não foi feita (`20261116223100_constraints_integridade_negocio.sql:30-33`). Ninguém sabe se há orçamento ou pedido com total negativo no histórico.
**Causa raiz:** `NOT VALID` usado para não travar a migration, sem a etapa de validação posterior.
**Caminho recomendado:** para cada um: primeiro **conte as violações** (`SELECT count(*) FROM public.quotes WHERE total_value < 0;` e equivalentes). Se der zero, `ALTER TABLE … VALIDATE CONSTRAINT …` resolve. Se não, o número vai ao dono **antes** de qualquer correção de dado — corrigir valor financeiro histórico é decisão dele, não sua.
**Arquivos e objetos a tocar:** nova migration (validação); nenhuma correção de dado sem aprovação.
**Não tocar / armadilhas:** `VALIDATE CONSTRAINT` faz varredura completa da tabela e toma lock fraco; em tabela grande, rode fora do horário de pico. Não troque o CHECK por um mais permissivo para "passar".
**Depende de:** 010 · **Libera:** 079
**Risco e como reverter:** se houver violação, a validação falha — e isso é informação, não problema. Reverter é desnecessário (a validação não altera dado).
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** `SELECT convalidated FROM pg_constraint WHERE conname IN ('quotes_total_value_non_negative','orders_total_non_negative','lead_scores_score_range');` → esperado `t` nos três.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 079 — Dar restrições de valor a `commissions` e `quote_items`
**Onda / Severidade / Camada:** 3 / Média / Banco
**Achados resolvidos:** A-50
**Problema hoje:** `commissions` tem PK, UNIQUE e CHECK de status, mas **nenhum CHECK de valor** — `base_amount`, `percentage` e `commission_amount` aceitam negativo. `quote_items` tem **somente a PK**, com 1.057 linhas e nada sobre `unit_price`, `total_price` ou `quantity`. O padrão existe e não foi estendido: `sales` tem `sales_amount_positive` e `products` tem `products_price_positive`.
**Causa raiz:** as restrições foram aplicadas a algumas tabelas da cadeia de dinheiro e não às centrais.
**Caminho recomendado:** conte as violações antes (como em 078), depois acrescente `CHECK (base_amount >= 0)`, `CHECK (commission_amount >= 0)`, `CHECK (percentage >= 0 AND percentage <= 100)` em `commissions` e `CHECK (unit_price >= 0)`, `CHECK (total_price >= 0)`, `CHECK (quantity > 0)` em `quote_items`. Entre como `NOT VALID` e valide na mesma PR se a contagem der zero.
**Arquivos e objetos a tocar:** nova migration.
**Não tocar / armadilhas:** cuidado com `percentage`: se o negócio usa comissão acima de 100% em algum caso (bônus), o teto quebra a operação — confirme antes com o dono.
**Depende de:** 010, 078 · **Libera:** —
**Risco e como reverter:** gravações que hoje passam com valor negativo passam a falhar — é o objetivo. Reverter por migration.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** `INSERT` de comissão com `commission_amount = -1` → erro; `INSERT` de item com `quantity = 0` → erro.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 080 — Padronizar a escala das colunas de dinheiro da cadeia de orçamento
**Onda / Severidade / Camada:** 3 / Alta / Banco
**Achados resolvidos:** A-49
**Problema hoje:** `quotes.total_value`, `subtotal` e `discount_amount` são `numeric` **sem escala** (`supabase/schema.sql:3913,3926-3928`), enquanto `quote_items` usa `numeric(15,2)` (`:3871-3874`) e `orders` usa `numeric(12,2)` (`:3307-3309`). O encontro das escalas está no código que roda: `public.convert_quote_to_order` (`supabase/schema.sql:13590-13594`) insere `NEW.subtotal`/`NEW.total_value` (livres) em colunas `numeric(12,2)`, com arredondamento implícito.
**Causa raiz:** a convenção `NUMERIC(15,2)` (`docs/SCHEMA_CONVENTIONS.md:16-17`) não foi aplicada à tabela de orçamento.
**Caminho recomendado:** comece pela cadeia que converte: `quotes` → `orders`. Meça primeiro quantas linhas têm mais de 2 casas (`SELECT count(*) FROM public.quotes WHERE total_value <> round(total_value, 2);`) e leve o número ao dono — se houver, o `ALTER TYPE` vai arredondar dado existente, e isso é decisão dele. Depois `ALTER TABLE public.quotes ALTER COLUMN total_value TYPE numeric(15,2)` e equivalentes. Não mexa em `sales`/`orders`/`commissions` nesta etapa: são `numeric(12,2)`, divergem da convenção mas são **consistentes entre si**, e mudá-las é a etapa 081.
**Arquivos e objetos a tocar:** nova migration.
**Não tocar / armadilhas:** `ALTER COLUMN … TYPE` reescreve a tabela e toma lock exclusivo — rode fora do horário de pico e confirme o tamanho antes. Não altere `products.price` e `clients.total_value` aqui (etapa 081).
**Depende de:** 010, 078 · **Libera:** 081
**Risco e como reverter:** arredondamento de dado existente é irreversível. Tenha a contagem e a aprovação antes. Reverter o tipo não devolve os centavos.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção com possível alteração de dado financeiro.
**Como verificar:** `SELECT column_name, numeric_precision, numeric_scale FROM information_schema.columns WHERE table_name = 'quotes' AND column_name IN ('total_value','subtotal','discount_amount');` → escala 2 nas três; e converter uma cotação em pedido mantém o total idêntico.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 081 — Alinhar a escala de dinheiro de vendas, pedidos e comissões
**Onda / Severidade / Camada:** 3 / Média / Banco
**Achados resolvidos:** A-49
**Problema hoje:** `sales.amount` (`supabase/schema.sql:4296`), `orders.subtotal/shipping/total` (`:3307-3309`) e `commissions.base_amount/commission_amount` (`:1748-1750`) são `numeric(12,2)`, enquanto a convenção de `docs/SCHEMA_CONVENTIONS.md:16-17` manda `NUMERIC(15,2)`. `commissions.sdr_commission_amount` (`:1759`) é `numeric` sem escala — divergente das colunas vizinhas da mesma tabela.
**Causa raiz:** a convenção foi escrita depois das tabelas e o legado nunca foi migrado; a coluna do SDR entrou sem seguir as vizinhas.
**Caminho recomendado:** a prioridade real é `sdr_commission_amount`: é a única **inconsistente dentro da própria tabela**, e é onde o arredondamento diverge entre as duas comissões da mesma venda. Faça só ela nesta etapa (`ALTER COLUMN … TYPE numeric(12,2)` para igualar as vizinhas, ou `(15,2)` se a etapa 080 já tiver movido a cadeia). Mudar `sales.amount` e `orders.*` de 12,2 para 15,2 é reescrita de tabela grande sem ganho prático (o teto de 12,2 é ~R$ 9,9 bi): proponha ao dono como higiene, não execute por conta.
**Arquivos e objetos a tocar:** nova migration.
**Não tocar / armadilhas:** não mude as três tabelas no mesmo PR: cada `ALTER TYPE` reescreve a tabela e toma lock exclusivo. Meça o tamanho antes (`SELECT pg_size_pretty(pg_total_relation_size('public.sales'));`).
**Depende de:** 010, 080 · **Libera:** —
**Risco e como reverter:** lock de escrita durante a reescrita; rode fora do pico. Reverter por migration (sem recuperar casas decimais perdidas).
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** `SELECT numeric_scale FROM information_schema.columns WHERE table_name='commissions' AND column_name='sdr_commission_amount';` → 2.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 082 — Padronizar `products.price` e `clients.total_value`
**Onda / Severidade / Camada:** 3 / Média / Banco
**Achados resolvidos:** A-49
**Problema hoje:** `products.price` (`supabase/schema.sql:3683`) e `clients.total_value` (`:1552`) são `numeric` sem escala, enquanto `products.default_cost` (`:3693`) é `numeric(12,2)` — a mesma tabela usa duas escalas para preço e custo.
**Causa raiz:** colunas criadas antes da convenção.
**Caminho recomendado:** conte as linhas com mais de duas casas antes (`SELECT count(*) FROM public.products WHERE price <> round(price,2);`) e leve o número ao dono. Depois alinhe `price` com `default_cost`. `clients.total_value` é valor derivado (soma de vendas): confirme quem o grava antes de mudar o tipo — se for recalculado por gatilho, a escala vem do cálculo.
**Arquivos e objetos a tocar:** nova migration.
**Não tocar / armadilhas:** `products.price` aparece no relatório público de embed (`DEFAULT_VISIBLE_FIELDS`), então mudanças de arredondamento ficam visíveis fora do sistema.
**Depende de:** 010, 081 · **Libera:** —
**Risco e como reverter:** arredondamento irreversível em dado existente; aprovação antes.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** escala 2 nas duas colunas e nenhuma diferença no total dos relatórios de produto antes e depois.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 083 — Trocar o limiar de alerta de ponto flutuante para decimal
**Onda / Severidade / Camada:** 3 / Baixa / Banco
**Achados resolvidos:** A-49
**Problema hoje:** `sdr_alert_configs.threshold_value` é `double precision` (`supabase/schema.sql:4598`), e é comparado com valores monetários.
**Causa raiz:** tipo escolhido para um campo numérico genérico que, na prática, guarda dinheiro.
**Caminho recomendado:** `ALTER COLUMN … TYPE numeric(15,2)`. A tabela é pequena (configuração), então o custo é baixo e o risco de comparação com erro de ponto flutuante desaparece.
**Arquivos e objetos a tocar:** nova migration.
**Não tocar / armadilhas:** confirme que nenhum consumidor depende de fração (ex.: limiar 0,5 para percentual) — se depender, a escala 2 não serve.
**Depende de:** 010 · **Libera:** —
**Risco e como reverter:** baixo; reverter por migration.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** `SELECT data_type FROM information_schema.columns WHERE table_name='sdr_alert_configs' AND column_name='threshold_value';` → `numeric`.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 084 — Dar chave estrangeira à trilha de conversão de orçamento
**Onda / Severidade / Camada:** 3 / Baixa / Banco
**Achados resolvidos:** A-51
**Problema hoje:** `quote_conversion_audit` tem três colunas de referência soltas — `quote_id` (`supabase/schema.sql:3849`), `sale_id` (`:3850`) e `order_id` (`:3851`) — e 216 linhas. Nada no banco impede que apontem para registro inexistente.
**Causa raiz:** tabela de auditoria criada sem as chaves, provavelmente para sobreviver a exclusões.
**Caminho recomendado:** antes de criar as FKs, **procure órfãos** (`SELECT count(*) FROM public.quote_conversion_audit a LEFT JOIN public.quotes q ON q.id = a.quote_id WHERE a.quote_id IS NOT NULL AND q.id IS NULL;` e equivalentes). Se houver, o dono decide o que fazer. Com zero órfãos, crie as três FKs com `ON DELETE SET NULL` — nunca `CASCADE`, porque a trilha deve sobreviver à exclusão do orçamento. As FKs de `quote_sync_inbound_log` e `quotes_inbound` ficam de fora de propósito: são log de entrada, e a ausência ali é defensável.
**Arquivos e objetos a tocar:** nova migration.
**Não tocar / armadilhas:** `quotes` e `orders` usam exclusão lógica, então a FK não dispara em exclusão lógica — o que é bom. Não use `CASCADE`.
**Depende de:** 010 · **Libera:** —
**Risco e como reverter:** se houver órfão, a criação da FK falha — e isso é informação. Reverter por migration.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** `SELECT conname FROM pg_constraint WHERE conrelid = 'public.quote_conversion_audit'::regclass AND contype = 'f';` → três entradas.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 085 — Remover os índices exatamente duplicados
**Onda / Severidade / Camada:** 3 / Média / Banco
**Achados resolvidos:** A-52
**Problema hoje:** dos 889 índices do schema de produção, há **14 grupos com definição idêntica** (mesma tabela, mesmas colunas, mesma ordem). Cada duplicata custa escrita em todo `INSERT`/`UPDATE` e espaço, sem acelerar leitura.
**Causa raiz:** índices criados duas vezes por migrations diferentes, com nomes diferentes.
**Caminho recomendado:** liste os grupos e **confirme no banco vivo** antes de apagar, porque o schema pode ter mudado: use a consulta de índices duplicados por `indexdef` normalizado. Para cada grupo, mantenha o de nome mais descritivo e apague os outros, **um grupo por PR** — índice apagado por engano em tabela grande custa caro para recriar. Use `DROP INDEX` simples: `CONCURRENTLY` falha no gateway transacional (`AGENTS.md` §7).
**Arquivos e objetos a tocar:** uma migration por grupo (ou uma com os 14, se a verificação ao vivo confirmar todos).
**Não tocar / armadilhas:** não apague índice que sustenta uma `UNIQUE` ou uma FK — verifique `pg_constraint` antes. Não confunda índice duplicado com índice parcial de mesma coluna (filtros diferentes não são duplicatas).
**Depende de:** 010 · **Libera:** —
**Risco e como reverter:** índice apagado por engano degrada consulta em produção; `CREATE INDEX` de volta resolve, mas leva tempo em tabela grande.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** antes e depois: `SELECT count(*) FROM pg_indexes WHERE schemaname='public';` deve cair exatamente no número de duplicatas removidas, e `EXPLAIN` das consultas da tabela afetada continua usando índice.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 086 — Remover os gatilhos duplicados de `updated_at`
**Onda / Severidade / Camada:** 3 / Média / Banco
**Achados resolvidos:** A-53
**Problema hoje:** **111 tabelas carregam dois gatilhos idênticos** de `updated_at` (dos 386 do schema): a mesma função roda duas vezes em cada atualização de linha, nas tabelas mais escritas do sistema.
**Causa raiz:** o gatilho foi criado por duas migrations diferentes, com nomes diferentes, e nenhuma removeu a anterior.
**Caminho recomendado:** confirme a lista no banco vivo (`SELECT tgrelid::regclass, tgname FROM pg_trigger WHERE NOT tgisinternal AND tgname ILIKE '%updated_at%' ORDER BY 1;`), identifique o par por tabela e apague um de cada par, em lotes temáticos. Comece pelas tabelas de maior volume de escrita (`sales`, `activities`, `notifications`), onde o ganho é real.
**Arquivos e objetos a tocar:** uma migration por lote.
**Não tocar / armadilhas:** confirme que os dois gatilhos são de fato idênticos (mesma função, mesmo evento, mesmo `WHEN`) antes de apagar — um deles pode ter condição diferente. Não apague o gatilho de `updated_at` inteiro: a coluna precisa continuar sendo atualizada (`AGENTS.md` §7 exige `updated_at`).
**Depende de:** 010 · **Libera:** —
**Risco e como reverter:** apagar o gatilho errado para de atualizar `updated_at`, o que afeta cache e ordenação. Reverter por migration recriando.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** para uma tabela do lote: `UPDATE` de uma linha → `updated_at` muda; e `SELECT count(*) FROM pg_trigger WHERE tgrelid='public.<t>'::regclass AND tgname ILIKE '%updated_at%' AND NOT tgisinternal;` → 1.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 087 — Medir se a deduplicação de webhook está realmente gravando
**Onda / Severidade / Camada:** 3 / Média / Integrações
**Achados resolvidos:** A-120
**Problema hoje:** no snapshot, `quote_sync_inbound_log` tem **364 linhas** e `webhook_inbound_dedupe` tem **0**, apesar de as duas retenções serem de 30 dias. Se as entregas passaram pelo caminho com deduplicação, as duas deveriam ter linhas na mesma janela.
**Causa raiz:** — (etapa de medição)
**Caminho recomendado:** rode as duas consultas e registre no progresso. **Não mude código nesta etapa.** `SELECT max(received_at), count(*) FROM public.quote_sync_inbound_log;` e `SELECT count(*), max(created_at) FROM public.webhook_inbound_dedupe;`. Se o log tiver linhas recentes e o dedupe não, a proteção contra entrega duplicada não está ativa no caminho usado — e isso torna A-110 (endpoint sem limite de taxa) mais sério. O resultado decide se existe a etapa 088.
**Arquivos e objetos a tocar:** apenas `docs/qa/05-PROGRESSO.md`.
**Não tocar / armadilhas:** a tabela pode estar vazia por limpeza recente — confira a data do último registro antes de concluir.
**Depende de:** — · **Libera:** 088
**Risco e como reverter:** nenhum (somente leitura).
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** as duas consultas executadas, com as datas anotadas no progresso.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 088 — Religar a deduplicação no caminho de entrada de cotações
**Onda / Severidade / Camada:** 3 / Alta / Integrações
**Achados resolvidos:** A-120
**Problema hoje:** condicional ao resultado de 087: se o log de entrada registra e o dedupe não, uma reentrega do parceiro cria registro duplicado.
**Causa raiz:** a reserva de deduplicação não está sendo criada no caminho efetivamente usado.
**Caminho recomendado:** compare os dois receptores: `receive-quote-sync/index.ts:96-110` faz a reserva em `webhook_inbound_dedupe` **antes** da escrita (padrão correto, com o comentário explicando por quê), e `receive-quote-webhook` não. Aplique o mesmo padrão ao caminho que estiver em uso. Atalho a evitar: deduplicar por chave de negócio (`external_quote_id`) em vez de por entrega — isso rejeita atualização legítima do mesmo orçamento.
**Arquivos e objetos a tocar:** o receptor em uso (`supabase/functions/receive-quote-sync/index.ts` ou `receive-quote-webhook/index.ts`).
**Não tocar / armadilhas:** a reserva precisa ser liberada em caso de falha, como `multichannel-status-webhook/index.ts:164-174` faz — sem isso, uma falha transitória bloqueia a reentrega legítima.
**Depende de:** 087, 048 · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** enviar o mesmo evento duas vezes → a segunda resposta indica duplicata ignorada e nenhuma linha nova de negócio.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 089 — Fazer o cron perceber falha da função que ele chama
**Onda / Severidade / Camada:** 3 / Alta / Banco + integrações
**Achados resolvidos:** A-104
**Problema hoje:** `public.trigger_internal_edge_job` (`supabase/migrations/20261112224500_fix_agenda_crons_maquina_vendas.sql:86-98`) faz `net.http_post(...)` e retorna o id da requisição. O `pg_net` é assíncrono, então o job termina como `succeeded` **qualquer que seja a resposta** — 200, 404, 500 ou falha de DNS. O alertador só olha `cron.job_run_details … WHERE status <> 'succeeded'` (`20260712231501_…sql:18-21`). Os 10 jobs que passam por essa função têm `falhas_7d = 0`, inclusive `wal-health-alert-5min`, com 2016 execuções em 7 dias.
**Causa raiz:** o alerta observa o resultado do job de cron, não o resultado da chamada HTTP.
**Caminho recomendado:** a correção já está escrita no repositório — `20261124120000_retry_trigger_internal_edge_job.sql:107-116` consulta `net._http_response`. **Confirme se está aplicada** (`SELECT prosrc FROM pg_proc WHERE proname='trigger_internal_edge_job';` e procure `_http_response`). Se não estiver, aplique; se estiver, o problema é A-111 (bloqueio no trabalhador) e você precisa ajustar a espera antes de considerar resolvido. Em qualquer caso, o resultado precisa chegar a `edge_call_failures`, que é a tabela que o repositório já usa para isso.
**Arquivos e objetos a tocar:** migration (se não aplicada) ou ajuste da função; eventualmente `cron-failure-alerter`.
**Não tocar / armadilhas:** não troque `pg_net` por chamada síncrona: ela bloquearia o trabalhador do cron por todo o tempo da função. A espera com `pg_sleep` é o meio-termo, e é exatamente o que precisa ser calibrado em 090.
**Depende de:** 010 · **Libera:** 090
**Risco e como reverter:** se a função passar a esperar resposta, os jobs ficam mais lentos — ver A-111. Reverter por migration.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção e mudança de comportamento de 10 crons.
**Como verificar:** force uma função a devolver 500 (em ambiente de teste) e confirme que aparece linha em `edge_call_failures` e que o alerta de cron reporta.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 090 — Calibrar a espera do despachante de cron para não travar os trabalhadores
**Onda / Severidade / Camada:** 3 / Média / Banco
**Achados resolvidos:** A-111
**Problema hoje:** `supabase/migrations/20261124120000_retry_trigger_internal_edge_job.sql:88-116` faz, por tentativa, até 4 iterações de `pg_sleep(2)`, com até 3 tentativas — pior caso **~24 s de bloqueio dentro do trabalhador do pg_cron**, por execução. A configuração real é `cron.max_running_jobs = 32` com `max_worker_processes = 6`, e há jobs a cada 5 minutos.
**Causa raiz:** a espera foi dimensionada pensando na resposta da função, não na contenção de trabalhadores.
**Caminho recomendado:** meça primeiro: `SELECT jobname, max(end_time - start_time) FROM cron.job_run_details jrd JOIN cron.job j USING (jobid) WHERE start_time > now() - interval '24 hours' GROUP BY jobname ORDER BY 2 DESC LIMIT 10;`. Se a duração máxima estiver perto de 20 s, reduza a espera (uma iteração, ou nenhuma) e mova a verificação do resultado para um job separado que varra `net._http_response` em lote — isso tira a espera do caminho crítico sem perder a observabilidade de A-89.
**Arquivos e objetos a tocar:** migration ajustando a função; eventualmente um novo job de varredura.
**Não tocar / armadilhas:** não aumente `max_worker_processes` por conta: é configuração do Postgres gerenciado e tem custo.
**Depende de:** 089 · **Libera:** —
**Risco e como reverter:** trabalhadores esgotados fazem jobs deixarem de rodar — o sintoma é pior que o problema original. Reverter por migration.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** a consulta de duração acima, depois do ajuste, com máximo bem abaixo do intervalo do job mais frequente (5 min).
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 091 — Alertar quando a sincronização do Bitrix24 falhar
**Onda / Severidade / Camada:** 3 / Média / Integrações
**Achados resolvidos:** A-106
**Problema hoje:** o cron `bitrix24-sync-hourly` roda 168 vezes por semana com 0 falhas registradas (por A-104), e `bitrix24_sync_logs` tem **551 linhas** que ninguém lê para alertar — `src/hooks/useBitrix24.ts:68` só exibe.
**Causa raiz:** o log existe e não há consumidor que transforme log em alerta.
**Caminho recomendado:** depois de 089 (que faz a falha aparecer), acrescente a leitura de `bitrix24_sync_logs` ao alertador já existente, em vez de criar um novo caminho: `supabase/functions/cron-failure-alerter` já tem a estrutura de alerta e escalonamento. Defina com o dono o limiar (ex.: 3 execuções seguidas com erro).
**Arquivos e objetos a tocar:** `supabase/functions/cron-failure-alerter/index.ts` (ou a função de alerta equivalente).
**Não tocar / armadilhas:** depende de A-39: sem canal de e-mail configurado, o alerta não chega a ninguém. Faça 034 antes, ou registre o alerta em tabela e combine o canal depois.
**Depende de:** 034, 089 · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** forçar uma falha de sincronização em teste → alerta registrado (e enviado, se o canal estiver ligado).
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 092 — Assinar o webhook de Win/Loss com HMAC do corpo
**Onda / Severidade / Camada:** 3 / Crítica / Integrações
**Achados resolvidos:** A-101
**Problema hoje:** `supabase/functions/winloss-webhook-dispatcher/retry.ts:141` envia `"X-Winloss-Signature": sub.secret` — **o próprio segredo**, não um HMAC. A assinatura é constante, não está ligada ao conteúdo, e quem recebe uma entrega pode forjar eventos ilimitados.
**Causa raiz:** assinatura confundida com credencial.
**Caminho recomendado:** use o que já existe no mesmo repositório: `supabase/functions/dispatch-webhook/index.ts:42-54` implementa `hmacSign(secret, body)` e envia `X-Webhook-Signature`. Reaproveite a função, não reescreva. Inclua timestamp na assinatura para impedir reexecução (é a lacuna de A-108, e vale resolver junto aqui, onde a assinatura está sendo criada).
**Arquivos e objetos a tocar:** `supabase/functions/winloss-webhook-dispatcher/retry.ts` (e o `index.ts`, se assinar em outro ponto).
**Não tocar / armadilhas:** mudar a assinatura quebra qualquer receptor que já valide o formato atual. Hoje há 1 assinatura, inativa e para `test.invalid`, então a janela é segura — confirme com `SELECT url, active FROM public.winloss_webhook_subscriptions;` antes.
**Depende de:** — · **Libera:** 093
**Risco e como reverter:** receptores existentes param de validar; como não há receptor real, o risco é baixo. `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** com um receptor de teste, conferir que `X-Winloss-Signature` muda quando o corpo muda, e que o valor **não** é igual ao segredo gravado.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 093 — Parar de trazer o segredo do webhook para o navegador e passar a gravá-lo
**Onda / Severidade / Camada:** 3 / Alta / Integrações + frontend
**Achados resolvidos:** A-102
**Problema hoje:** `src/hooks/win-loss/useWebhookSubscriptions.ts:22-27` faz `select('*')` numa tabela que tem coluna `secret`, então todo admin recebe o segredo no JSON e no cache. E a criação (`:36-42`) **não grava segredo** — como `retry.ts:141` só envia o cabeçalho quando há segredo, toda assinatura criada pela tela dispara entregas sem assinatura.
**Causa raiz:** `select('*')` numa tabela com segredo, e formulário incompleto.
**Caminho recomendado:** duas mudanças na mesma PR: (1) trocar `select('*')` por lista explícita de colunas **sem** `secret` — o padrão correto está em `src/hooks/dialer/useClickToCall.ts:23-27`; (2) gerar o segredo **no servidor** ao criar a assinatura (RPC ou gatilho), devolvendo-o **uma única vez** para o admin copiar, como qualquer serviço faz. Não peça ao admin que digite o segredo: gerado no servidor, ele nunca precisa transitar de volta.
**Arquivos e objetos a tocar:** `src/hooks/win-loss/useWebhookSubscriptions.ts`; migration com a RPC/gatilho de geração.
**Não tocar / armadilhas:** não exponha o segredo em listagem depois da criação — se o admin perder, o caminho é gerar outro.
**Depende de:** 092 · **Libera:** —
**Risco e como reverter:** assinaturas criadas antes continuam sem segredo; trate-as explicitamente (ou gere para elas). Reverter por migration + `git revert`.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** criar uma assinatura pela tela → `SELECT secret IS NOT NULL FROM public.winloss_webhook_subscriptions WHERE id='<novo>';` → verdadeiro; e a listagem na tela **não** traz o campo.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 094 — Tirar as credenciais de canal do navegador antes do primeiro provedor ser conectado
**Onda / Severidade / Camada:** 3 / Alta / Integrações
**Achados resolvidos:** A-103
**Problema hoje:** `src/hooks/multichannel/useChannelCredentials.ts:25-27` faz `select('*')` em `channel_credentials`, incluindo a coluna `credentials` (jsonb), e a policy permite que **um gestor leia a credencial de todos os vendedores** (`supabase/migrations/20260417112931_…sql:20-22`). A criação grava o segredo em texto puro vindo do navegador (`:56`). A tabela tem 0 linhas — a exposição é latente.
**Causa raiz:** o mecanismo seguro existe e é opcional: `supabase/functions/_shared/secret-refs.ts:1-12` aceita `env:<VAR>` ou `internal:<key>` com precedência sobre o jsonb, e `integration_secret_refs` tem 0 linhas.
**Caminho recomendado:** esta é a etapa mais barata do plano em relação ao risco que remove, **porque a tabela está vazia**: faça agora, antes de existir dado. (1) troque `select('*')` por colunas explícitas sem `credentials`; (2) faça a tela gravar uma **referência** (`internal:<chave>`) e o valor ir para `_internal_secrets` por RPC, usando o caminho que `secret-refs.ts` já entende; (3) restrinja a leitura ao dono (tire `is_admin_or_manager` da policy de leitura da credencial, ou separe a coluna em outra tabela).
**Arquivos e objetos a tocar:** `src/hooks/multichannel/useChannelCredentials.ts`; migration (policy e/ou RPC de gravação).
**Não tocar / armadilhas:** não migre dado (não há). Não remova o suporte ao jsonb legado de `secret-refs.ts` — ele tem precedência definida e serve de compatibilidade.
**Depende de:** 027 · **Libera:** —
**Risco e como reverter:** baixo agora, altíssimo depois de alguém conectar um provedor — é o argumento para fazer já. `git revert` + migration.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** conectar um provedor de teste pela tela → `SELECT credentials FROM public.channel_credentials WHERE id='<novo>';` devolve uma referência (`internal:…`), não o token; e a listagem na tela não traz a coluna.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 095 — Dar uma tela à lista de destinos permitidos de webhook
**Onda / Severidade / Camada:** 3 / Média / Integrações
**Achados resolvidos:** A-119
**Problema hoje:** `supabase/migrations/20261117050000_webhook_ssrf_e_rate_limit.sql:32-36` declara *"Fail-CLOSED de proposito: allowlist vazia bloqueia tudo"*, o despachante checa antes de enviar (`winloss-webhook-dispatcher/index.ts:332-363`), a tabela `webhook_allowed_domains` está **vazia** e **não existe nenhuma tela** para preenchê-la. O subsistema está desligado na prática, e a única forma de ligá-lo é SQL manual.
**Causa raiz:** o controle foi criado com o comportamento seguro e sem a interface que o torna utilizável.
**Caminho recomendado:** acrescente a administração da lista à tela de webhooks que já existe (`/admin/webhooks-*`), com validação de formato igual à da restrição `webhook_allowed_domains_pattern_formato` (`20261117050000_…sql:49`). Enquanto a tela não existir, **documente** o SQL de inclusão em `docs/RUNBOOK.md` — deixar um controle sem caminho de uso é o que gera a próxima gambiarra.
**Arquivos e objetos a tocar:** a tela de administração de webhooks; `docs/RUNBOOK.md`.
**Não tocar / armadilhas:** a tabela teve o grant de `anon` revogado (`20261117060000_…sql:30`) e a policy é só de admin — mantenha assim. Não "resolva" populando a lista com `%` : isso desliga a proteção.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** incluir um domínio pela tela → `SELECT pattern FROM public.webhook_allowed_domains;` com a linha; e uma entrega para domínio fora da lista continua bloqueada.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 096 — Proteger o teste de conexão de integração contra destino interno
**Onda / Severidade / Camada:** 3 / Média / Integrações
**Achados resolvidos:** A-109
**Problema hoje:** `supabase/functions/test-integration-connection/index.ts` (`probeDatabase:23`, `probeN8n:35`, `probeMcp:58`, `probeWebhook:66`, `probeBitrix:79`) busca a URL vinda de `integration_connections.config` com tempo limite, mas **sem validação de host, esquema ou faixa de IP** — `http://`, `localhost` e endereços internos passam.
**Causa raiz:** função de diagnóstico escrita antes do pacote de proteção de destino.
**Caminho recomendado:** use as RPCs que o repositório já tem: `is_webhook_host_allowed` e o validador de destino de `dispatch-webhook/index.ts:23-40`. Exija `https`, recuse nomes locais e faixas privadas, e aplique a mesma lista de domínios permitidos da etapa 095. A função exige papel de administração, então o risco é interno — mas é exatamente o caminho que permite varrer a rede de dentro.
**Arquivos e objetos a tocar:** `supabase/functions/test-integration-connection/index.ts`.
**Não tocar / armadilhas:** não bloqueie por lista de IP no código: resolva o nome e verifique a faixa, ou use o validador existente. Lista fixa fica desatualizada.
**Depende de:** 095 · **Libera:** —
**Risco e como reverter:** testes de conexão para destinos internos legítimos (se houver) param de funcionar; confirme com o dono. `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** `POST` com `http://localhost:54321` → recusado com erro claro; com um domínio permitido → testa normalmente.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 097 — Respeitar o limite de requisições dos terceiros fora do caminho de IA
**Onda / Severidade / Camada:** 3 / Média / Integrações
**Achados resolvidos:** A-112
**Problema hoje:** as 12 funções de IA tratam `429` corretamente (`forecast-narrative/index.ts:187-196`, `semantic-reindex-batch/index.ts:64`, `elevenlabs-tts/index.ts:154-161`), e **nenhuma** das demais trata: Bitrix24 (`bitrix24-sync/index.ts:217-220`) e V4 (`notify-v4-quote-status/index.ts:159-169`) tratam `429` como erro comum, sem respeitar `Retry-After`.
**Causa raiz:** o tratamento de limite foi implementado no caminho de IA e não generalizado.
**Caminho recomendado:** extraia o tratamento que já funciona para `_shared/retry-policy.ts` (o arquivo existe) e aplique nas duas integrações, começando por Bitrix24, que roda de hora em hora e é a mais provável de ser limitada. Respeite o `Retry-After` quando vier; só então use o recuo exponencial.
**Arquivos e objetos a tocar:** `_shared/retry-policy.ts`; `bitrix24-sync/index.ts`; `notify-v4-quote-status/index.ts`.
**Não tocar / armadilhas:** cuidado para não transformar `429` em reenvio imediato — isso é exatamente a amplificação que o limite quer evitar.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** simule um `429` com `Retry-After: 2` em teste → a função espera e tenta de novo, em vez de registrar falha.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 098 — Validar o formato da resposta do sistema de atendimento
**Onda / Severidade / Camada:** 3 / Média / Integrações
**Achados resolvidos:** A-113
**Problema hoje:** `supabase/functions/helpdesk-sync/index.ts:22,40,61` consome a resposta sem validar formato (`(j.tickets ?? []).map(...)`, `(arr ?? []).map(...)`): se o provedor devolver um objeto em vez de lista, `arr.map` lança. O corte em 50 itens também não é informado a ninguém.
**Causa raiz:** contrato do terceiro assumido, não verificado.
**Caminho recomendado:** use `_shared/webhook-validator.ts`, que já existe e é usado nos receptores, para validar a forma da resposta antes de iterar. Para o corte, registre no log quando houver mais itens do que o limite — o padrão está em `bitrix24-sync/index.ts:239-268`.
**Arquivos e objetos a tocar:** `supabase/functions/helpdesk-sync/index.ts`.
**Não tocar / armadilhas:** não aumente o limite de 50 sem medir: pode ser proteção contra resposta enorme.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** responder com um objeto em vez de lista (em teste) → erro tratado e registrado, sem exceção não capturada; com mais de 50 itens, o log registra o corte.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 099 — Unificar a retenção da deduplicação de webhook
**Onda / Severidade / Camada:** 3 / Baixa / Banco
**Achados resolvidos:** A-116
**Problema hoje:** `fn_cleanup_webhook_dedupe` apaga o que passa de **90 dias** (`supabase/migrations/20260707112143…:14-17`), e o cron `purge-webhook-inbound-dedupe-30d` apaga o que passa de **30 dias** (`20260706211149…:48-52`). A janela efetiva é 30 dias e a função de 90 nunca tem o que apagar.
**Causa raiz:** duas retenções criadas em momentos diferentes, sem a segunda remover a primeira.
**Caminho recomendado:** decida a janela com o dono (30 dias é suficiente para deduplicação de entrega) e deixe **um** mecanismo. Se a escolha for 30, remova a função de 90 dias e o job que a chama; se for 90, ajuste o cron.
**Arquivos e objetos a tocar:** nova migration.
**Não tocar / armadilhas:** a janela de deduplicação define por quanto tempo uma reentrega é detectada — encurtar demais reabre a porta para duplicata de parceiro lento.
**Depende de:** 010 · **Libera:** —
**Risco e como reverter:** baixo; reverter por migration.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** `SELECT jobname, schedule FROM cron.job WHERE jobname ILIKE '%dedupe%';` → um único job, e `SELECT prosrc FROM pg_proc WHERE proname='fn_cleanup_webhook_dedupe';` coerente com a janela escolhida.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 100 — Fazer a comissão recusar venda sem regra, em vez de pagar 5%
**Onda / Severidade / Camada:** 3 / Alta / Banco
**Achados resolvidos:** A-03
**Problema hoje:** `supabase/migrations/20261013130000_comissao_regras_e_split_sdr.sql:68` — `IF v_rule_percentage IS NULL THEN v_rule_percentage := 5.0; END IF;` — e o mesmo para o SDR (`:88-96`). A comissão é gravada com `rule_id` NULL e 5%, **sem aviso, sem log e sem bloqueio**. Como `NEW.amount >= COALESCE(min_amount,0)` com `amount` nulo não é verdadeiro, venda sem valor também cai no fallback.
**Causa raiz:** percentual de negócio embutido como valor de reserva, em vez de sinalizar a ausência de regra.
**Caminho recomendado:** pergunte ao dono o que deve acontecer quando nenhuma regra casa. Há duas saídas defensáveis: (a) gravar a comissão com um estado que exija revisão (usando o mecanismo da etapa 068), ou (b) recusar o fechamento com mensagem clara. **Não** mantenha o pagamento silencioso. Em qualquer caso, registre o caso em `edge_call_failures` ou equivalente, para o admin descobrir o cadastro faltante. Faça depois de 042, para que o número do front já venha da mesma fonte.
**Arquivos e objetos a tocar:** migration substituindo `private.handle_sale_commissions`.
**Não tocar / armadilhas:** não mude o cálculo nem a resolução de regra aqui — só o caminho "nenhuma regra casou". Cuidado: se a base de regras estiver incompleta, a opção (b) travaria o fechamento de muitas vendas; meça antes com `SELECT count(*) FROM public.commissions WHERE rule_id IS NULL;`.
**Depende de:** 010, 042, 068 · **Libera:** —
**Risco e como reverter:** a opção (b) pode travar fechamento de venda — por isso a medição antes é obrigatória. Reverter por migration.
**Precisa de aprovação humana antes do merge:** **sim** — DDL e regra de pagamento.
**Como verificar:** fechar uma venda cuja categoria não casa com nenhuma regra ativa → comissão sinalizada para revisão (ou fechamento recusado), e **nunca** uma linha com 5% e `rule_id` NULL sem marca.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

## Onda 4 — Funcionalidades incompletas

### Etapa 101 — Decidir o destino dos botões de exportação de Win/Loss
**Onda / Severidade / Camada:** 4 / Média / Frontend
**Achados resolvidos:** A-71
**Problema hoje:** `src/pages/WinLossAnalysisPage.tsx:40` ("Exportar Dados") e `:48` ("Filtros Avançados") não têm `onClick`, `type="submit"`, `asChild` nem gatilho de diálogo. O usuário clica e nada acontece.
**Causa raiz:** botões desenhados antes da funcionalidade e publicados.
**Caminho recomendado:** a regra para toda esta onda: **um botão sem ação deve ser implementado ou removido, nunca mantido**. Para exportação, o repositório já tem o caminho pronto — `src/pages/ImportExport.tsx:107` usa `sanitizeCsvCell` e monta CSV com cuidado. Reaproveite. Se o dono disser que a exportação não é necessária, remova o botão; um botão removido é melhor experiência que um botão morto.
**Arquivos e objetos a tocar:** `src/pages/WinLossAnalysisPage.tsx`.
**Não tocar / armadilhas:** não copie o parser de **importação** daquele arquivo (A-78 mostra que ele é frágil); o que vale reaproveitar é a **exportação**.
**Depende de:** — · **Libera:** 102, 103, 104, 105
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** clicar em "Exportar Dados" → arquivo baixado com as linhas da tela; ou o botão não existe mais.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 102 — Decidir o destino dos botões de filtro e exportação da auditoria comercial
**Onda / Severidade / Camada:** 4 / Média / Frontend
**Achados resolvidos:** A-71
**Problema hoje:** `src/pages/admin/AdminComercial.tsx:717` ("Filtrar") e `:724` ("Exportar") não têm ação, no card "Histórico de Auditoria".
**Causa raiz:** mesma de 101.
**Caminho recomendado:** implemente o filtro com o estado que a tela já tem (a lista está carregada) e a exportação com o padrão de `ImportExport.tsx:107`; ou remova os dois. Por ser tela de auditoria comercial, a exportação tende a ser útil de verdade — confirme com o dono.
**Arquivos e objetos a tocar:** `src/pages/admin/AdminComercial.tsx`.
**Não tocar / armadilhas:** a mesma tela grava `salesperson_commission_configs` (A-122/etapa 128) — não misture as duas mudanças no mesmo PR.
**Depende de:** 101 · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** filtrar por um termo reduz a lista; exportar baixa o arquivo; ou os botões não existem mais.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 103 — Decidir o destino do botão de exportação de auditoria de preço
**Onda / Severidade / Camada:** 4 / Média / Frontend
**Achados resolvidos:** A-71
**Problema hoje:** `src/components/pricing/PricingHealthBanner.tsx:68` ("EXPORTAR AUDITORIA") não tem ação; o componente é montado em `/pricing-intelligence` por `PricingIntelligenceHub.tsx:80`.
**Causa raiz:** mesma de 101.
**Caminho recomendado:** igual a 101. Atenção: o rótulo em maiúsculas sugere ação importante — se não for implementar, remova, porque esse é o tipo de botão que o gestor tenta usar justamente quando precisa de prova.
**Arquivos e objetos a tocar:** `src/components/pricing/PricingHealthBanner.tsx`.
**Não tocar / armadilhas:** o banner é informativo; não transforme a correção em redesenho da tela.
**Depende de:** 101 · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** clicar exporta, ou o botão não existe mais.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 104 — Decidir o destino dos cinco botões da inteligência de compras
**Onda / Severidade / Camada:** 4 / Média / Frontend
**Achados resolvidos:** A-71
**Problema hoje:** sem ação: `src/components/purchase-intelligence/PurchasePredictionCard.tsx:292` ("Agendar"), `:298` ("Proposta"), `:323`; `DuplicateBlockAudit.tsx:44` ("Filtros"), `:51` ("Exportar"); `ClientPurchaseHistory.tsx:513`; `PurchaseHeatmapGrid.tsx:210`. Todos montados em `/inteligencia-compras` (`PurchaseIntelligenceHub.tsx:97,103,150,243`).
**Causa raiz:** módulo publicado com a interface completa e as ações pendentes.
**Caminho recomendado:** trate o módulo inteiro em uma decisão, com o dono: a inteligência de compras está em uso? Se sim, implemente "Agendar" e "Proposta" ligando ao fluxo que já existe (agenda e cotação); se não, esconda o módulo do menu até estar pronto — é mais honesto que sete botões mortos. Esta é a maior concentração de controles sem ação do sistema, e por isso merece decisão de produto, não remendo.
**Arquivos e objetos a tocar:** os quatro componentes citados e, se a decisão for esconder, `sidebarMenuData.ts`.
**Não tocar / armadilhas:** `DuplicateBlockAudit.tsx:38` tem também o campo de busca morto (etapa 106) e a consulta sem tratamento de erro (`:21-31`) — trate os três juntos, é o mesmo arquivo.
**Depende de:** 101 · **Libera:** 106
**Risco e como reverter:** esconder um módulo remove funcionalidade visível; precisa do dono. `git revert`.
**Precisa de aprovação humana antes do merge:** **sim** se a decisão for esconder o módulo.
**Como verificar:** nenhum botão sem ação permanece na tela (varredura do próprio arquivo) ou o módulo não está mais acessível.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 105 — Decidir o destino dos botões do guia de estado vazio
**Onda / Severidade / Camada:** 4 / Baixa / Frontend
**Achados resolvidos:** A-71
**Problema hoje:** `src/components/purchase-intelligence/EmptyStateGuide.tsx:69` ("Começar Configuração") e `:76` ("Ver Documentação") não têm ação — e são justamente os botões que aparecem para quem ainda não tem dado, ou seja, para o usuário novo.
**Causa raiz:** mesma de 104.
**Caminho recomendado:** "Ver Documentação" é a correção mais barata do plano: um link. "Começar Configuração" deve levar à tela de configuração do módulo (ou sair, se 104 decidir esconder o módulo).
**Arquivos e objetos a tocar:** `src/components/purchase-intelligence/EmptyStateGuide.tsx`.
**Não tocar / armadilhas:** se 104 esconder o módulo, esta etapa some — marque como não aplicável no progresso em vez de "concluída".
**Depende de:** 104 · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** os dois botões navegam para destinos reais; ou o módulo não está mais acessível.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 106 — Fazer o campo de busca da auditoria de duplicados buscar
**Onda / Severidade / Camada:** 4 / Média / Frontend
**Achados resolvidos:** A-73
**Problema hoje:** `src/components/purchase-intelligence/DuplicateBlockAudit.tsx:38` tem `placeholder="Buscar por entidade ou tipo..."` **sem** `value` nem `onChange` — é o único campo de entrada solto em todo o `src/` (varredura de 52 candidatos; os outros 51 estão ligados ao formulário). Na mesma tela, a consulta (`:21-31`) também não trata erro.
**Causa raiz:** campo adicionado ao layout sem estado.
**Caminho recomendado:** ligue o campo a um estado local e filtre a lista em memória (ela já está carregada). Trate o erro da consulta no mesmo PR, com estado de erro visível — é o padrão de `src/pages/MinhasPremiacoes.tsx:77,309`.
**Arquivos e objetos a tocar:** `src/components/purchase-intelligence/DuplicateBlockAudit.tsx`.
**Não tocar / armadilhas:** não filtre no servidor: a lista é pequena e a mudança seria maior que o problema.
**Depende de:** 104 · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** digitar um termo reduz a lista; forçar a falha da consulta mostra erro em vez de lista vazia.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 107 — Fazer o diálogo "Configurar IA" salvar ou sair da tela
**Onda / Severidade / Camada:** 4 / Média / Frontend
**Achados resolvidos:** A-72
**Problema hoje:** `src/components/purchase-intelligence/IntelligenceSettings.tsx`: `Slider defaultValue={[75]}` (`:54`), `Slider defaultValue={[85]}` (`:67`), `Select defaultValue="realtime"` (`:77`) e `Switch defaultChecked` (`:101`) são **não controlados**, sem estado nem mutação; "Resetar" (`:105`) e "Salvar Alterações" (`:108`) não têm ação; e os percentuais exibidos ("75%", "85%") são texto fixo (`:52`, `:65`), que não acompanha o cursor.
**Causa raiz:** diálogo construído como maquete e publicado.
**Caminho recomendado:** a tela promete ajustar limiar de churn, de upsell e frequência de alerta. Decida com o dono se esses limiares existem de fato em algum lugar (procure por tabela de configuração do módulo). Se existirem, controle os quatro campos, ligue "Salvar" à mutação e faça os percentuais refletirem o estado. Se não existirem, **remova o diálogo**: um painel de configuração que não configura nada é pior que a ausência dele.
**Arquivos e objetos a tocar:** `src/components/purchase-intelligence/IntelligenceSettings.tsx`; eventualmente migration para a tabela de configuração.
**Não tocar / armadilhas:** não invente a tabela de configuração sem confirmar: pode já existir com outro nome.
**Depende de:** 104 · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** **sim** se criar tabela (DDL).
**Como verificar:** ajustar um limiar, salvar, recarregar a tela → o valor persiste; ou o diálogo não existe mais.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 108 — Tirar os números fabricados do painel de Segurança
**Onda / Severidade / Camada:** 4 / Média / Frontend
**Achados resolvidos:** A-74
**Problema hoje:** `src/pages/SecurityDashboard.tsx:139-151` traz "Latência de Bloqueio ~12ms", "Precisão por IP 99,8%" e "Proteção DDoS Ativa L7 Shield" como literais no JSX, sem origem em medição; o selo "Active Shields" (`:113-118`) também. E `:153-158` tem o botão "Ver Logs Detalhados" sem ação.
**Causa raiz:** valores de exemplo publicados numa tela de postura de segurança.
**Caminho recomendado:** **remova** os três indicadores fabricados — não os substitua por métricas inventadas de outra fonte. O que o sistema realmente tem para mostrar aqui: contagem de `access_denied_logs`, de `login_attempts` e de `error_logs`, todas com dado real. Ligue o botão à página de logs de auditoria, que existe (`/audit-logs`). Esta é a tela em que dado falso é mais caro: é onde o administrador decide se está protegido.
**Arquivos e objetos a tocar:** `src/pages/SecurityDashboard.tsx`.
**Não tocar / armadilhas:** não use `error_logs` como indicador de segurança sem antes resolver A-149 (ninguém é alertado) — senão a tela volta a dar sensação de proteção que não existe.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** a tela não exibe nenhum número sem origem em consulta, e o botão navega para `/audit-logs`.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 109 — Esconder os botões de teste de gamificação em produção
**Onda / Severidade / Camada:** 4 / Média / Frontend
**Achados resolvidos:** A-75
**Problema hoje:** `src/pages/Vendedores.tsx:261` renderiza `<CelebrationTestButtons />` sem condição. O componente (`src/components/gamification/CelebrationTestButtons.tsx:15-46`) dispara animações com dados falsos (`salespersonId: 'test-id'`, `salespersonName: 'Vendedor Teste'`) e `triggerStreakMilestone` chega a emitir notificação do navegador (`useLevelUpCelebration.ts:144-147` → `useCelebration.ts:18-28`).
**Causa raiz:** componente de desenvolvimento publicado sem guarda.
**Caminho recomendado:** envolva com `DevOnly`, que já existe e já é usado assim em `src/components/layout/MainLayout.tsx:221` e `src/App.tsx:113`. É uma linha, e é a correção mais barata da onda.
**Arquivos e objetos a tocar:** `src/pages/Vendedores.tsx`.
**Não tocar / armadilhas:** não apague o componente: ele é útil em desenvolvimento. `DevOnly` resolve.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** em produção, o card "Testar Celebrações" não aparece para admin nem gestor; em desenvolvimento, continua aparecendo.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 110 — Dar entrada no menu às duas telas de alerta de webhook
**Onda / Severidade / Camada:** 4 / Média / Frontend
**Achados resolvidos:** A-76
**Problema hoje:** `/admin/webhooks-alert-settings` (configurar alerta de webhook) e `/admin/webhooks-alert-history` não têm item de menu nem link em `src/` — enquanto `/admin/webhooks-timeline` e `/admin/webhooks-dead-letters` estão no `AdminQuickLinks`.
**Causa raiz:** telas entregues sem porta de entrada.
**Caminho recomendado:** acrescente as duas ao `src/components/admin/AdminQuickLinks.tsx:32-80`, junto das irmãs. É o lugar onde as outras telas de webhook já estão, então o usuário encontra.
**Arquivos e objetos a tocar:** `src/components/admin/AdminQuickLinks.tsx`.
**Não tocar / armadilhas:** confira que as duas telas funcionam antes de divulgá-las — uma tela quebrada com link é pior que sem link.
**Depende de:** — · **Libera:** 111, 112
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** abrir `/admin` → os dois links aparecem e levam às telas, que carregam sem erro.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 111 — Dar entrada no menu às telas de conformidade (LGPD e opt-out)
**Onda / Severidade / Camada:** 4 / Alta / Frontend
**Achados resolvidos:** A-76
**Problema hoje:** `/admin/solicitacoes-titular` (pedidos de titular de dados) e `/admin/supressao-emails` (descadastro) só são alcançáveis digitando a URL. São obrigações legais com tela pronta e sem caminho.
**Causa raiz:** mesma de 110.
**Caminho recomendado:** acrescente as duas ao bloco de administração (`sidebarMenuData.ts:353-372`) e ao `AdminQuickLinks`. Severidade alta porque o custo de não encontrar a tela não é interno: é prazo legal de resposta ao titular.
**Arquivos e objetos a tocar:** `src/components/layout/sidebar/sidebarMenuData.ts`; `src/components/admin/AdminQuickLinks.tsx`.
**Não tocar / armadilhas:** `/admin/solicitacoes-titular` é uma das telas que trata `isError` corretamente (A-06) — não a "padronize" junto.
**Depende de:** 110 · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** as duas aparecem no menu de administração e carregam.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 112 — Remover a página de teste de retentativa de produção
**Onda / Severidade / Camada:** 4 / Média / Frontend
**Achados resolvidos:** A-76
**Problema hoje:** `/admin/retry-test-status` é uma página de teste publicada em produção, sem porta de entrada.
**Causa raiz:** página de diagnóstico que ficou no roteador.
**Caminho recomendado:** se for útil para operação, envolva com `DevOnly` ou restrinja a admin e dê-lhe entrada no menu; se foi só para validar o retry, remova a rota e a página. A decisão é de uma linha, mas precisa ser tomada: rota órfã de teste é superfície que ninguém revisa.
**Arquivos e objetos a tocar:** `src/routes/AppRoutes.tsx`, `src/routes/lazyPages.ts` e a página.
**Não tocar / armadilhas:** se remover, tire das três listas (rota, lazy e prefetch) — deixar entrada em `lazyPages.ts` gera import morto.
**Depende de:** 110 · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** `/admin/retry-test-status` não existe mais (404) ou está no menu e restrita a admin.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 113 — Varrer as 24 rotas órfãs e decidir cada uma
**Onda / Severidade / Camada:** 4 / Média / Frontend
**Achados resolvidos:** A-76
**Problema hoje:** além das tratadas em 110–112, sobram ~19 rotas sem menu e sem link em `src/`, sendo 11 administrativas.
**Causa raiz:** entregas sucessivas sem revisão de navegação.
**Caminho recomendado:** produza a lista com decisão por rota (dar entrada no menu / restringir / remover), em um documento, e abra etapas só para as que precisarem de mudança. A varredura é barata e evita que a próxima auditoria reencontre o mesmo item. Consulta de apoio: `inventario/estado/rotas.json` tem o campo `fora_do_menu`.
**Arquivos e objetos a tocar:** um documento em `docs/`; nenhuma mudança de código nesta etapa.
**Não tocar / armadilhas:** "fora do menu" não é defeito por si: `/embed/report/:token` e `/meus-pedidos/:id` são deliberadamente alcançados por link. Não transforme a varredura em remoção automática.
**Depende de:** 110 · **Libera:** —
**Risco e como reverter:** nenhum (documento).
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** o documento lista as 24 rotas com uma decisão em cada.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 114 — Fazer a página pública da corrida dizer o que está acontecendo
**Onda / Severidade / Camada:** 4 / Média / Frontend
**Achados resolvidos:** A-81
**Problema hoje:** rota pública (`AppRoutes.tsx:235`), `src/pages/RaceSpectator.tsx:32-41` consulta `race_spectator_view` e **descarta o erro** (`const { data } = await …`), caindo em "Nenhum piloto na pista." (`:79`). EXECUTADO: para o papel anônimo a view devolve 0 linhas (`content-range: */0`), porque é `security_invoker = true` e as policies abertas foram removidas (`20260831130000_…sql:51-53`).
**Causa raiz:** erro engolido somado a uma decisão de RLS que tornou a view inacessível ao anônimo.
**Caminho recomendado:** duas partes: (1) tratar o erro e distinguir "sem dados" de "sem acesso" na tela; (2) decidir com o dono se o modo TV **deve** funcionar sem login. Se deve, o caminho correto é uma view ou RPC pública com os campos mínimos (nome, posição, pontos) — nunca abrir as tabelas-base. Se não deve, a rota deveria exigir login, e aí ela sai da lista de rotas públicas.
**Arquivos e objetos a tocar:** `src/pages/RaceSpectator.tsx`; eventualmente migration para a view/RPC pública.
**Não tocar / armadilhas:** não recrie as policies abertas que o pacote de hardening removeu — era exatamente o vazamento que ele fechou.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** se a decisão for expor, a exposição precisa ser revisada campo a campo. Reverter por migration + `git revert`.
**Precisa de aprovação humana antes do merge:** **sim** se envolver nova exposição pública de dado.
**Como verificar:** sem login, a página mostra a corrida (se a decisão for expor) ou uma mensagem clara de que é necessário entrar — nunca "nenhum piloto" quando há corrida.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 115 — Restringir o painel de vendedor por papel e validar o identificador
**Onda / Severidade / Camada:** 4 / Média / Frontend
**Achados resolvidos:** A-82
**Problema hoje:** `AppRoutes.tsx:259` registra `/vendedor/:id` apenas como autenticado, e a página monta o painel financeiro de qualquer vendedor (`VendedorDashboard.tsx:57-63,78,87,94`, mais `EligibleBonusesCard` em `:324` e `CoachingProgressCard` em `:326`). As entradas são o feed de vitórias (`VictoryFeedItem.tsx:143`, no menu de **todos** os papéis) e `RankingGridItem.tsx:82`. Além disso, `id` vem de `useParams` sem validação e é interpolado em `.or(\`salesperson_id.eq.${id},sdr_id.eq.${id},closer_id.eq.${id}\`)`.
**Causa raiz:** rota de detalhe criada sem papel e com filtro montado por concatenação.
**Caminho recomendado:** duas mudanças: (1) exigir admin/gestor na rota, **ou** permitir que o vendedor veja apenas o próprio id — decida com o dono, porque o feed de vitórias dá o link a todos; (2) validar o `id` como UUID antes de montar o filtro (há validador no repositório: `src/lib/validators/`). A validação não é opcional: string montada por concatenação em filtro de API é a porta de entrada de injeção de filtro.
**Arquivos e objetos a tocar:** `src/routes/AppRoutes.tsx`; `src/pages/VendedorDashboard.tsx`.
**Não tocar / armadilhas:** se restringir a admin/gestor, o link do feed de vitórias passa a dar "Acesso Negado" para vendedor — trate o link também (A-67 é o mesmo tipo de problema).
**Depende de:** — · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** **sim** — muda quem vê dado de comissão de terceiro.
**Como verificar:** como vendedor comum, abrir `/vendedor/<id-de-outro>` → negado (ou só o próprio); com `id` inválido (`'abc'` ou `"1 or 1=1"`), a tela recusa antes de consultar.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 116 — Ligar a recompensa de cadência ao provedor que falta
**Onda / Severidade / Camada:** 4 / Média / Hooks
**Achados resolvidos:** A-92
**Problema hoje:** `src/components/cadences/quote/QuoteCadenceDetailDrawer.tsx:36,64,86` usa o `GamificationContext` para conceder +15 XP ao concluir a tarefa, mas não há provedor montado na árvore — `src/contexts/GamificationContext.tsx:4,23` define um valor padrão inerte. A promessa de XP no código não entrega nem o aviso.
**Causa raiz:** contexto criado com valor padrão silencioso, sem provedor.
**Caminho recomendado:** decida com o dono se a recompensa deve existir. Se sim, monte o provedor e **credite no servidor** — o XP de cadência precisa seguir o mesmo caminho do XP de venda, que já é server-side (`20261014000000_gamificacao_server_side.sql`), ou volta o problema de A-91 (aviso de XP que pode não ter sido creditado). Se não, remova a chamada e o texto de +15 XP.
**Arquivos e objetos a tocar:** `src/components/cadences/quote/QuoteCadenceDetailDrawer.tsx`; `src/contexts/GamificationContext.tsx`; eventualmente migration.
**Não tocar / armadilhas:** o valor padrão inerte do contexto é o que esconde o problema — se mantiver o contexto, faça o padrão **lançar** em desenvolvimento, para o próximo uso sem provedor aparecer no teste.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** se creditar XP de verdade, o ranking muda. Avise o dono. `git revert`.
**Precisa de aprovação humana antes do merge:** **sim** se passar a creditar XP (afeta ranking e premiação).
**Como verificar:** concluir uma tarefa de cadência → XP creditado no banco (`SELECT … FROM xp_history WHERE …`) e aviso na tela; ou nenhuma promessa de XP na interface.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 117 — Marcar quando a probabilidade de fechamento é estimativa local
**Onda / Severidade / Camada:** 4 / Média / Hooks
**Achados resolvidos:** A-94
**Problema hoje:** `src/hooks/useDealProbability.ts:10-20` cai silenciosamente para a heurística de `src/lib/stageProbabilities.ts:39-61` quando a análise do servidor não vem, sem indicar a diferença na interface.
**Causa raiz:** recuo silencioso entre duas fontes de qualidade muito diferentes.
**Caminho recomendado:** devolva junto com o número a sua origem (`source: 'servidor' | 'estimativa'`) e mostre isso na tela — um rótulo discreto basta. Não remova o recuo: ter estimativa é melhor que não ter número; o defeito é não dizer qual é qual.
**Arquivos e objetos a tocar:** `src/hooks/useDealProbability.ts` e o componente que exibe a probabilidade.
**Não tocar / armadilhas:** não transforme a ausência de análise em erro: a heurística existe justamente para o negócio sem análise ainda.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** com a análise do servidor indisponível, a tela mostra o número **e** a marca de estimativa.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 118 — Fazer o contador de visualizações do relatório público ser atômico
**Onda / Severidade / Camada:** 4 / Baixa / Backend
**Achados resolvidos:** A-13
**Problema hoje:** `supabase/functions/report-embed-public/index.ts` incrementa `view_count` lendo, somando e gravando, sem aguardar o resultado. Dois acessos simultâneos gravam o mesmo valor.
**Causa raiz:** incremento feito no cliente da função em vez de no banco.
**Caminho recomendado:** troque por incremento no banco — uma RPC `increment_embed_view(token)` com `UPDATE … SET view_count = view_count + 1`, que é atômica por natureza. Mantenha o disparo sem espera (a contagem não deve atrasar a resposta).
**Arquivos e objetos a tocar:** `supabase/functions/report-embed-public/index.ts`; migration com a RPC.
**Não tocar / armadilhas:** não transforme em espera síncrona: a resposta do relatório ficaria mais lenta por causa de um contador.
**Depende de:** 010 · **Libera:** —
**Risco e como reverter:** baixo; reverter por migration + `git revert`.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** dois acessos simultâneos ao mesmo token → `view_count` aumenta em 2.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 119 — Tirar o salário e o LTV fixos do painel de ROI
**Onda / Severidade / Camada:** 4 / Média / Frontend
**Achados resolvidos:** A-123
**Problema hoje:** `src/hooks/dashboard/useROIDashboard.ts:89` usa `BASE_SALARY_MONTHLY = 3500` e `:109` calcula LTV como ticket médio × 2,5 — os dois fixos no código, numa tela de decisão de contratação.
**Causa raiz:** premissas de negócio embutidas no código.
**Caminho recomendado:** traga os dois para configuração (tabela de parâmetros ou campo por vendedor, conforme o dono preferir) e mostre na tela qual premissa está sendo usada. Faça **depois** de 041: com o erro de 100× no lugar, qualquer discussão sobre premissa é inútil.
**Arquivos e objetos a tocar:** `src/hooks/dashboard/useROIDashboard.ts`; eventualmente migration para os parâmetros.
**Não tocar / armadilhas:** salário por vendedor é dado pessoal sensível — se for por pessoa, a policy precisa restringir a admin, não a gestor.
**Depende de:** 041 · **Libera:** —
**Risco e como reverter:** se virar dado pessoal, exige cuidado de acesso. Reverter por migration + `git revert`.
**Precisa de aprovação humana antes do merge:** **sim** — pode introduzir dado pessoal sensível no banco.
**Como verificar:** alterar a premissa na configuração muda o ROI exibido, e a tela diz qual premissa usou.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 120 — Decidir o destino de `salesperson_commission_configs`
**Onda / Severidade / Camada:** 4 / Média / Regras de negócio
**Achados resolvidos:** A-122
**Problema hoje:** `src/pages/admin/AdminComercial.tsx:236-247` grava `salesperson_commission_configs.rate` por mês, e **nenhum consumidor lê a tabela** (grep devolve só a tela, a migration de criação e os tipos gerados). O gestor configura a taxa mensal e isso não tem efeito em lugar nenhum.
**Causa raiz:** tabela e tela entregues sem o consumidor.
**Caminho recomendado:** com a decisão de 042 em mãos (qual é a taxa válida), há dois caminhos: tornar esta tabela **a** fonte (e então ela entra na função de 042), ou remover a tela e a tabela. O que não pode continuar é o gestor achar que configurou a comissão do mês.
**Arquivos e objetos a tocar:** `src/pages/admin/AdminComercial.tsx`; migration (se remover a tabela ou se ela entrar na função de 042).
**Não tocar / armadilhas:** não remova a tabela sem checar se há linhas — se o gestor usou, o histórico tem valor para a conversa com ele.
**Depende de:** 042 · **Libera:** —
**Risco e como reverter:** remover tela de configuração é visível ao usuário. `git revert` + migration.
**Precisa de aprovação humana antes do merge:** **sim** — decisão de negócio sobre comissão.
**Como verificar:** ou a taxa configurada aqui aparece no cálculo (etapa 042), ou a tela não existe mais.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

## Onda 5 — Robustez: erros, estados e concorrência

### Etapa 121 — Criar o tratamento padrão de erro de leitura
**Onda / Severidade / Camada:** 5 / Alta / Frontend
**Achados resolvidos:** A-06
**Problema hoje:** não há tratador global de erro de consulta: `src/App.tsx:33-48` configura só `retry`, e o único `onError` global é o de mutações (`:66-67`). Cada página precisa tratar `isError` por conta, e oito não tratam — o erro aparece como lista vazia.
**Causa raiz:** a infraestrutura de erro de leitura nunca foi criada; a de escrita existe.
**Caminho recomendado:** antes de corrigir as oito telas (etapas 122–126), crie a peça que elas vão usar: um componente de estado de erro (com mensagem, botão de tentar de novo e, se útil, o identificador do erro) e, se o padrão do repositório permitir, um `onError` global de consultas que registre em `error_logs`. Fazer a peça primeiro evita oito soluções diferentes para o mesmo problema. Use `src/pages/MinhasPremiacoes.tsx:77,309` como referência de como a tela deve se comportar.
**Arquivos e objetos a tocar:** novo componente em `src/components/`; `src/App.tsx` (se for incluir o `onError` global).
**Não tocar / armadilhas:** não transforme todo erro de consulta em tela cheia de erro: lista vazia com aviso discreto é melhor em painel com vários cartões. O componente precisa servir aos dois casos.
**Depende de:** — · **Libera:** 122, 123, 124, 125, 126
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** o componente renderiza em uma tela de teste e o `onError` global (se houver) registra a falha.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 122 — Mostrar erro em vez de "nenhuma comissão"
**Onda / Severidade / Camada:** 5 / Alta / Frontend
**Achados resolvidos:** A-06
**Problema hoje:** `src/pages/AdminComissoes.tsx:71` desestrutura só `data`/`isLoading`, e o render `:208-216` mostra *"Nenhuma comissão encontrada para os critérios selecionados"*; o hook lança em `src/hooks/useCommissions.ts:72`. O mesmo em `src/pages/Comissoes.tsx:33` (hook lança em `useCommissions.ts:55`).
**Causa raiz:** ausência do tratamento padrão (etapa 121).
**Caminho recomendado:** use o componente de 121 nas duas telas. Esta é a primeira da série porque é a tela onde o gestor **aprova pagamento**: concluir que não há comissão pendente quando a consulta falhou é o erro mais caro do conjunto.
**Arquivos e objetos a tocar:** `src/pages/AdminComissoes.tsx`; `src/pages/Comissoes.tsx`.
**Não tocar / armadilhas:** a etapa 075 também mexe em `Comissoes.tsx` (total com canceladas) — faça uma depois da outra, não em paralelo.
**Depende de:** 121 · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** com a consulta forçada a falhar, as duas telas mostram erro e botão de tentar de novo, não "nenhuma comissão".
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 123 — Mostrar erro em vez de "nenhum registro" na trilha de auditoria
**Onda / Severidade / Camada:** 5 / Alta / Frontend
**Achados resolvidos:** A-06
**Problema hoje:** `src/pages/AuditLogsPage.tsx:45` não trata erro; o hook lança em `src/hooks/admin/useAuditLogs.ts:45`. Uma falha de consulta faz a tela dizer que não há registro de auditoria.
**Causa raiz:** mesma de 121.
**Caminho recomendado:** use o componente de 121. Em tela de auditoria, acrescente na mensagem que a ausência **não** deve ser interpretada como "nada aconteceu" — é a diferença entre não haver registro e não ter sido possível ler.
**Arquivos e objetos a tocar:** `src/pages/AuditLogsPage.tsx`.
**Não tocar / armadilhas:** a tabela `audit_log` recusa leitura ao papel anônimo por grant (42501, verificado) — se a tela estiver sem sessão válida, o erro é de autenticação, e a mensagem deve diferenciar.
**Depende de:** 121 · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** consulta forçada a falhar → erro visível; `audit_logs` vazio de verdade → mensagem de lista vazia.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 124 — Mostrar erro em vez de "nenhuma premiação para auditar"
**Onda / Severidade / Camada:** 5 / Alta / Frontend
**Achados resolvidos:** A-06
**Problema hoje:** `src/pages/AdminAuditoriaPremiacoes.tsx:105` não trata erro; o hook lança em `src/hooks/useCommissionBonusAwards.ts:49`.
**Causa raiz:** mesma de 121.
**Caminho recomendado:** use o componente de 121.
**Arquivos e objetos a tocar:** `src/pages/AdminAuditoriaPremiacoes.tsx`.
**Não tocar / armadilhas:** a mesma tela tem os botões destrutivos de A-09 (etapa 150) e o total que soma reais com percentuais de A-139 (etapa 074) — três etapas no mesmo arquivo, faça em sequência.
**Depende de:** 121 · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** consulta forçada a falhar → erro visível em vez de lista vazia.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 125 — Mostrar erro nas telas de deduplicação e de chaves de funcionalidade
**Onda / Severidade / Camada:** 5 / Média / Frontend
**Achados resolvidos:** A-06
**Problema hoje:** `src/pages/Deduplication.tsx:28` (hook lança em `src/hooks/crm/useDeduplicationScan.ts:57`) e `src/pages/FeatureFlagsAdmin.tsx:33` não tratam erro.
**Causa raiz:** mesma de 121.
**Caminho recomendado:** use o componente de 121. Em deduplicação, a confusão é pior do que parece: "nenhum duplicado" é exatamente o resultado que o usuário espera, então a falha é invisível.
**Arquivos e objetos a tocar:** `src/pages/Deduplication.tsx`; `src/pages/FeatureFlagsAdmin.tsx`.
**Não tocar / armadilhas:** `FeatureFlagsAdmin.tsx` também tem a exclusão sem confirmação de A-09 (etapa 149) — faça uma depois da outra.
**Depende de:** 121 · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** consulta forçada a falhar → erro visível nas duas telas.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 126 — Mostrar erro na tela de supressão de e-mails
**Onda / Severidade / Camada:** 5 / Média / Frontend
**Achados resolvidos:** A-06
**Problema hoje:** `src/pages/AdminSupressaoEmails.tsx:94` não trata erro; o hook lança em `src/hooks/email/useEmailOptOuts.ts:52`. Concluir que ninguém pediu descadastro quando a consulta falhou tem consequência legal.
**Causa raiz:** mesma de 121.
**Caminho recomendado:** use o componente de 121.
**Arquivos e objetos a tocar:** `src/pages/AdminSupressaoEmails.tsx`.
**Não tocar / armadilhas:** esta tela é uma das que não têm entrada no menu (etapa 111) — as duas etapas se completam.
**Depende de:** 121 · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** consulta forçada a falhar → erro visível em vez de lista vazia.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 127 — Varrer o repositório por erro de leitura engolido
**Onda / Severidade / Camada:** 5 / Média / Frontend
**Achados resolvidos:** A-06
**Problema hoje:** as oito telas das etapas 122–126 foram encontradas por leitura dirigida das páginas de maior risco. A varredura completa não foi feita, e o padrão (`const { data, isLoading } = useQuery(...)` sem `isError`) é comum.
**Causa raiz:** — (etapa de levantamento)
**Caminho recomendado:** depois de 121–126, varra `src/pages/` e `src/components/` por consultas sem `isError` e produza a lista com prioridade (telas de dinheiro, de dado pessoal e de auditoria primeiro). Entregue como documento e abra etapas só para o que importa — corrigir 150 telas de uma vez é churn, e o plano proíbe.
**Arquivos e objetos a tocar:** um documento em `docs/`.
**Não tocar / armadilhas:** não corrija em massa: muitas telas toleram lista vazia sem prejuízo, e a correção em lote esconderia as que importam.
**Depende de:** 126 · **Libera:** —
**Risco e como reverter:** nenhum (documento).
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** o documento lista as ocorrências com prioridade e critério.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 128 — Impedir que uma seção inválida de painel trave a página inicial
**Onda / Severidade / Camada:** 5 / Alta / Frontend
**Achados resolvidos:** A-77
**Problema hoje:** `src/hooks/dashboard/useDashboardRedirect.ts:43-45` grava em `localStorage.last_dashboard_section` **qualquer** segmento de `/dashboard/<x>`, sem validar contra o `SECTION_MAP`. `src/pages/Index.tsx:135` só aceita seis valores e manda o resto para `/404` (`:146-147`) — e o efeito já gravou o valor inválido. A partir daí todo acesso a `/` redireciona para a seção inválida.
**Causa raiz:** valor vindo da URL gravado sem validação, e o estado persistente passa a controlar a navegação.
**Caminho recomendado:** valide antes de gravar, contra a mesma lista que `Index.tsx` usa — e exporte essa lista de um lugar só, para as duas pontas não divergirem. Acrescente também a limpeza defensiva na leitura: valor inválido no armazenamento deve ser descartado, não propagado. As duas coisas juntas garantem que quem já está com o navegador travado se recupere sozinho na próxima visita.
**Arquivos e objetos a tocar:** `src/hooks/dashboard/useDashboardRedirect.ts`; `src/pages/Index.tsx` (extrair a lista).
**Não tocar / armadilhas:** não resolva só no `Index.tsx`: sem a limpeza na leitura, os usuários já afetados continuam presos.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** com `localStorage.last_dashboard_section = 'xyz'` no navegador, abrir `/` → cai numa seção válida e o valor inválido é removido do armazenamento.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 129 — Tornar a importação de clientes capaz de ler CSV de verdade
**Onda / Severidade / Camada:** 5 / Alta / Frontend
**Achados resolvidos:** A-78
**Problema hoje:** `src/pages/ImportExport.tsx:66,68` fazem `lines[0].split(delimiter)` e `line.split(delimiter)`. Um campo entre aspas contendo o delimitador (`"Empresa, Ltda"`) parte a linha e **desloca todas as colunas seguintes** — telefone cai em e-mail e assim por diante. O único filtro antes de gravar é `records.filter(r => r.name)` (`:114`), e os campos vão direto para `clientService.importClients` (`:116-121`).
**Causa raiz:** divisão por caractere usada no lugar de leitura de CSV.
**Caminho recomendado:** não escreva um parser: use uma biblioteca de CSV estabelecida (o repositório já tem dependências de front suficientes; `papaparse` é o padrão de fato e é pequeno) e **avise na PR** que é dependência nova, como `AGENTS.md` §2.4 exige. Acrescente validação de formato de e-mail e telefone antes de gravar e uma pré-visualização com o número de linhas aceitas e rejeitadas. A exportação do mesmo arquivo (`:107`, `sanitizeCsvCell`) é cuidadosa — é o nível que a importação precisa alcançar.
**Arquivos e objetos a tocar:** `src/pages/ImportExport.tsx`; `package.json` (dependência).
**Não tocar / armadilhas:** não confie no filtro `r.name`: o problema é que o **conteúdo** das colunas está trocado, e o nome continua preenchido. Sem validação de formato, a contaminação passa igual.
**Depende de:** — · **Libera:** 130
**Risco e como reverter:** importações que hoje "funcionam" (com colunas trocadas) passam a ser rejeitadas — é o objetivo. Avise o dono. `git revert`.
**Precisa de aprovação humana antes do merge:** **sim** — dependência nova e mudança no caminho de entrada de dado pessoal.
**Como verificar:** importar um CSV com `"Empresa, Ltda"` no nome → as colunas seguintes permanecem corretas; importar um com e-mail inválido → a linha é rejeitada e reportada.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 130 — Pedir confirmação explícita do volume antes de importar
**Onda / Severidade / Camada:** 5 / Média / Frontend
**Achados resolvidos:** A-78
**Problema hoje:** a importação grava direto, sem confirmação do volume (`src/pages/ImportExport.tsx:114-121`). Um arquivo errado entra inteiro.
**Causa raiz:** mesma de 129.
**Caminho recomendado:** com o leitor de CSV de 129 no lugar, mostre a pré-visualização (primeiras linhas, total aceito, total rejeitado, colunas reconhecidas) e exija confirmação. É a defesa que falta mesmo com o parser correto, porque o usuário pode simplesmente ter escolhido o arquivo errado.
**Arquivos e objetos a tocar:** `src/pages/ImportExport.tsx`.
**Não tocar / armadilhas:** não use `confirm()` nativo — o repositório tem `AlertDialog`, e esta é uma ação de volume.
**Depende de:** 129 · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** escolher um arquivo → a tela mostra a pré-visualização e só grava após confirmação.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 131 — Fazer o aviso de XP refletir o que foi creditado
**Onda / Severidade / Camada:** 5 / Média / Hooks
**Achados resolvidos:** A-91
**Problema hoje:** `src/hooks/sales/useSalesRealtime.ts:107-128` e `src/hooks/salesRealtimeUtils.ts:86-132` calculam o XP **no cliente** e exibem o aviso independentemente do resultado da chamada que credita. O vendedor vê "+150 XP" em uma venda que pode não ter creditado nada.
**Causa raiz:** valor calculado e anunciado no cliente, enquanto a concessão é do servidor.
**Caminho recomendado:** o XP já é concedido no servidor (`20261014000000_gamificacao_server_side.sql`). Faça o aviso usar o valor **devolvido** pelo servidor: se a concessão não retornar valor, o caminho correto é o evento de tempo real trazer o XP creditado, e a tela reagir a ele. Atalho a evitar: manter o cálculo local "só para o aviso" — é exatamente o que produz a divergência com o ranking.
**Arquivos e objetos a tocar:** `src/hooks/sales/useSalesRealtime.ts`; `src/hooks/salesRealtimeUtils.ts`.
**Não tocar / armadilhas:** não remova a animação: o problema é o número, não a celebração.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** fechar uma venda → o valor do aviso é igual ao incremento em `salesperson_xp` (consulta antes e depois).
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 132 — Invalidar o contador de tarefas de follow-up após mutação
**Onda / Severidade / Camada:** 5 / Média / Hooks
**Achados resolvidos:** A-89
**Problema hoje:** a consulta `src/hooks/cadences/useTodaysQuoteCadenceTasks.ts:23` alimenta o contador do topo (`src/components/organisms/DesktopTopBar.tsx:78`), e nenhuma mutação de cadência de orçamento invalida essa chave (`src/hooks/cadences/useQuoteCadenceMutations.ts:5-10`, `useCadenceQueries.ts:173`). Com `refetchOnWindowFocus: false` (`src/App.tsx:38`), o número não se corrige sozinho.
**Causa raiz:** mutação que muda o dado da consulta sem invalidar a chave.
**Caminho recomendado:** acrescente a chave do contador às invalidações das mutações de cadência de orçamento. Aproveite para conferir se a chave inclui o usuário (A-96 lista `useTodaysQuoteCadenceTasks.ts:23` entre as chaves sem usuário) — se for corrigir, faça junto, é o mesmo arquivo.
**Arquivos e objetos a tocar:** `src/hooks/cadences/useQuoteCadenceMutations.ts`; `src/hooks/cadences/useTodaysQuoteCadenceTasks.ts`.
**Não tocar / armadilhas:** não ligue `refetchOnWindowFocus` globalmente para resolver: isso muda o comportamento de todas as consultas do sistema.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** concluir uma tarefa de follow-up → o contador do topo diminui sem recarregar a página.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 133 — Unificar os dois ganchos que marcam etapa de playbook
**Onda / Severidade / Camada:** 5 / Média / Hooks
**Achados resolvidos:** A-90
**Problema hoje:** `src/hooks/playbooks/usePlaybookMutations.ts:6-50` e `src/hooks/sales/useSalesEnablement.ts:257-295` escrevem na mesma tabela com convenções diferentes e invalidam chaves diferentes. Consumidores: `src/components/pipeline/DealCard.tsx:96` e `DealPlaybookModal.tsx:42` de um lado; `src/components/enablement/SalesEnablementHub.tsx:396` e `PlaybookExecutionDialog.tsx:16-20` do outro. Marcar uma etapa em uma tela não atualiza a outra.
**Causa raiz:** duas implementações da mesma mutação, criadas em módulos diferentes.
**Caminho recomendado:** compare as **convenções** antes de unificar: se um gancho grava "concluído = true" e o outro grava um registro de conclusão, escolher a convenção errada **inverte marcações em massa**. Com a convenção confirmada no banco, mantenha um gancho e faça os quatro consumidores usarem; invalide as duas chaves durante a transição.
**Arquivos e objetos a tocar:** `src/hooks/playbooks/usePlaybookMutations.ts`; `src/hooks/sales/useSalesEnablement.ts`; os quatro consumidores.
**Não tocar / armadilhas:** teste as duas telas depois: é o tipo de unificação em que a tela menos usada é esquecida e quebra silenciosamente.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** inversão de marcação em massa, se a convenção for lida errado. Verifique no banco antes. `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** marcar uma etapa em uma tela → a outra tela reflete, e `SELECT` na tabela mostra uma única linha coerente.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 134 — Unificar as duas versões do funil de prospecção
**Onda / Severidade / Camada:** 5 / Baixa / Hooks
**Achados resolvidos:** A-98
**Problema hoje:** `src/hooks/sdr/useProspectingFunnel.ts:6` e `src/hooks/useSDRMetrics.ts:216-217` calculam o funil com recortes diferentes; o consumidor é `src/components/sdr/ProspectingFunnel.tsx:1,16`. Colisão semelhante entre `src/hooks/playbooks/usePlaybookQueries.ts:63` e `src/hooks/sales/useSalesEnablement.ts:72`.
**Causa raiz:** dois cálculos do mesmo indicador, criados em módulos diferentes.
**Caminho recomendado:** decida qual recorte é o correto **com o dono** (a diferença é de definição, não de código), mantenha um e remova o outro. Enquanto houver dois, qualquer pessoa que importe o errado mostra número diferente na mesma tela, sem erro.
**Arquivos e objetos a tocar:** os dois ganchos e o consumidor.
**Não tocar / armadilhas:** não "unifique" fazendo a média dos dois recortes. Escolha um.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** o número exibido muda. Avise o dono. `git revert`.
**Precisa de aprovação humana antes do merge:** **sim** — muda indicador de prospecção.
**Como verificar:** o funil mostra o mesmo número em todas as telas que o exibem.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 135 — Persistir a preferência de tema do painel
**Onda / Severidade / Camada:** 5 / Baixa / Hooks
**Achados resolvidos:** A-99
**Problema hoje:** `src/contexts/DashboardThemeContext.tsx:33-40`: `toggleTheme` não persiste, então a preferência não sobrevive à sessão. Correlato: `src/contexts/RaceCalmContext.tsx:21-25` e `src/hooks/race/useCalmMode.ts:37,49` mantêm estado duplicado para a mesma preferência.
**Causa raiz:** alternância implementada só em memória.
**Caminho recomendado:** grave no armazenamento local e leia na montagem, com validação (A-77 mostra o custo de ler armazenamento sem validar). Para o modo calmo, elimine a duplicação mantendo uma única fonte.
**Arquivos e objetos a tocar:** `src/contexts/DashboardThemeContext.tsx`; `src/contexts/RaceCalmContext.tsx`; `src/hooks/race/useCalmMode.ts`.
**Não tocar / armadilhas:** valide o valor lido: tema inválido no armazenamento não deve quebrar a renderização.
**Depende de:** 128 · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** alternar o tema, recarregar → preferência mantida; com valor inválido no armazenamento, cai no padrão sem erro.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 136 — Remover o filtro declarado e ignorado em `useClients`
**Onda / Severidade / Camada:** 5 / Baixa / Hooks
**Achados resolvidos:** A-100
**Problema hoje:** `src/hooks/crm/useClients.ts:16-23` inclui `filters` na chave de cache, mas `src/services/clientService.ts:35-42` não o usa — o cache fragmenta sem efeito.
**Causa raiz:** chave de cache preparada para um filtro que nunca foi implementado.
**Caminho recomendado:** ou passe o filtro adiante até a consulta, ou tire da chave. Decida pelo uso: se nenhuma tela filtra clientes no servidor, tirar da chave é a mudança menor.
**Arquivos e objetos a tocar:** `src/hooks/crm/useClients.ts`; eventualmente `src/services/clientService.ts`.
**Não tocar / armadilhas:** a etapa 058 corrige a atualização otimista no mesmo arquivo — faça as duas no mesmo PR para não conflitar.
**Depende de:** 058 · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** a chave de cache corresponde ao que a consulta realmente usa (inspeção no devtools do React Query).
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 137 — Filtrar as assinaturas em tempo real dos painéis
**Onda / Severidade / Camada:** 5 / Baixa / Hooks + performance
**Achados resolvidos:** A-97
**Problema hoje:** 29 assinaturas usam `event:'*'` sem `filter`, entre elas `src/hooks/dashboard/useDashboardKPIs.ts:61`, `useDashboardKPIsPeriod.ts:338`, `src/hooks/useMyBonusAwards.ts:130` e `src/pages/AdminAuditoriaPremiacoes.tsx:118`. Cada venda gravada acorda todos os painéis abertos.
**Causa raiz:** assinatura ampla usada por conveniência.
**Caminho recomendado:** comece pelos painéis (os dois `useDashboardKPIs*`), que são as telas mais abertas: restrinja o evento (`INSERT`/`UPDATE`) e acrescente `filter` por vendedor ou por período, conforme o painel. Deixe as da corrida para 138 — lá o problema é o canal não ser liberado, que é outra causa.
**Arquivos e objetos a tocar:** `src/hooks/dashboard/useDashboardKPIs.ts`; `useDashboardKPIsPeriod.ts`; `src/hooks/useMyBonusAwards.ts`; `src/pages/AdminAuditoriaPremiacoes.tsx`.
**Não tocar / armadilhas:** filtro restritivo demais faz o painel parar de atualizar — teste com duas abas e um registro novo.
**Depende de:** — · **Libera:** 138
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** com o painel aberto, gravar uma venda de outro vendedor → o painel do primeiro **não** recebe evento; gravar uma dele → recebe.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 138 — Liberar os canais de tempo real da corrida
**Onda / Severidade / Camada:** 5 / Média / Hooks + performance
**Achados resolvidos:** A-97
**Problema hoje:** `src/hooks/race/useRaceLeaderboard.ts:69` e `src/pages/RaceSpectator.tsx:46` assinam sem liberar o canal na limpeza, então os canais acumulam enquanto a sessão vive.
**Causa raiz:** assinatura sem cancelamento no encerramento do efeito.
**Caminho recomendado:** acrescente o `removeChannel` no retorno do efeito. O padrão correto já existe em outros ganchos do repositório — procure um que faça `return () => { supabase.removeChannel(channel) }` e copie. Canal não liberado é consumo de cota de tempo real e, em sessão longa, lentidão percebida.
**Arquivos e objetos a tocar:** `src/hooks/race/useRaceLeaderboard.ts`; `src/pages/RaceSpectator.tsx`.
**Não tocar / armadilhas:** não troque a assinatura por polling: o custo sobe.
**Depende de:** 137 · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** abrir e fechar a tela da corrida dez vezes → o número de canais ativos volta ao valor inicial (inspeção no painel de tempo real do Supabase, ou contagem no cliente).
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 139 — Acrescentar o usuário às chaves de cache por pessoa
**Onda / Severidade / Camada:** 5 / Baixa / Hooks
**Achados resolvidos:** A-96
**Problema hoje:** seis consultas usam chave sem o identificador do usuário, embora devolvam dado dele: `src/hooks/useCommissions.ts:33`, `src/hooks/race/useMyRaceCar.ts:41`, `src/hooks/cadences/useTodaysQuoteCadenceTasks.ts:23`, `src/hooks/dialer/useClickToCall.ts:18`, `src/hooks/gamification/useLeagues.ts:153`, `src/hooks/race/useRaceUnlocks.ts:13`. Hoje não há vazamento, porque o cache é descartado ao sair.
**Causa raiz:** chave escrita sem a dimensão que separa os dados.
**Caminho recomendado:** acrescente o identificador do usuário à chave das seis. É mudança pequena e remove uma classe inteira de risco: hoje a proteção depende de o encerramento de sessão limpar o cache, e isso é uma linha em outro arquivo. Comece por `useCommissions.ts` — é a que mostra dinheiro.
**Arquivos e objetos a tocar:** os seis ganchos citados.
**Não tocar / armadilhas:** ao mudar a chave, confira quem invalida: uma invalidação que usava a chave antiga para de funcionar. A etapa 132 toca `useTodaysQuoteCadenceTasks.ts` — coordene.
**Depende de:** 132 · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** inspecionar as chaves no devtools do React Query → todas carregam o identificador do usuário.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 140 — Dar justificativa real às supressões da regra de dependências
**Onda / Severidade / Camada:** 5 / Média / Hooks
**Achados resolvidos:** A-95
**Problema hoje:** 50 ocorrências de `// eslint-disable-next-line react-hooks/exhaustive-deps` com a mesma justificativa genérica ("dependencias intencionais (comportamento pre-existente verificado)"), por exemplo `src/hooks/useSyncedSetting.ts:165` e `src/hooks/race/useRaceReactions.ts:64`. A-88 é exatamente o defeito que essa regra pegaria.
**Causa raiz:** supressão aplicada em lote para fazer o lint passar.
**Caminho recomendado:** não remova as 50 de uma vez. O caminho é: (1) corrigir `useSyncedSetting.ts:165` junto com a etapa que corrige A-88 — ali a supressão **esconde** um bug real; (2) para as demais, estabelecer a regra de que cada supressão nova precisa dizer **qual** dependência foi omitida e por quê; (3) revisar as restantes em lotes pequenos, começando pelos ganchos que escrevem no banco. Uma supressão com motivo específico é legítima; cinquenta com o mesmo texto não são revisáveis.
**Arquivos e objetos a tocar:** `src/hooks/useSyncedSetting.ts` nesta etapa; a convenção em `docs/` ou `CONTRIBUTING.md`.
**Não tocar / armadilhas:** não ligue a regra como erro de lint de uma vez: 50 falhas simultâneas levariam a desligá-la de novo.
**Depende de:** — · **Libera:** 141
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** `src/hooks/useSyncedSetting.ts` sem a supressão e com o teste de A-88 passando; a convenção registrada.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 141 — Corrigir o reenvio da preferência antiga em `useSyncedSetting`
**Onda / Severidade / Camada:** 5 / Alta / Hooks
**Achados resolvidos:** A-88
**Problema hoje:** `src/hooks/useSyncedSetting.ts:120-166`: `reconcile` é um `useCallback` com dependências `[opts.key]` (supressão do lint em `:165`), mas **lê o estado `value`** em `:143` e `:160`. Com `opts.key` constante, o `value` capturado é o da primeira renderização. Depois que o usuário altera a preferência, `update` (`:192-210`) grava e o servidor fica com `updated_at === localUpdatedAtRef.current`; no `reconcile` seguinte, `serverNewer = !localUpdatedAt || serverUpdatedAt > localUpdatedAt` é **falso** (igualdade não é maior), cai no ramo "local mais novo" e envia o valor da montagem. E `reconcile` roda na montagem (`:170`), em renovação de token (`:171-179`) e a cada volta de foco (`:184-190`).
**Causa raiz:** fechamento de função com estado capturado, mantido por supressão da regra de dependências; e comparação de recência que trata igualdade como "local mais novo".
**Caminho recomendado:** duas correções, ambas necessárias: (1) leia o valor por referência (`useRef` atualizado a cada mudança) em vez de capturar o estado, e **remova** a supressão do lint; (2) trate a igualdade de carimbo como "em sincronia", não como "local mais novo" — hoje a igualdade é o caso **normal** depois de uma gravação, e é ela que dispara o reenvio. Corrigir só a dependência faz o reenvio mandar o valor certo, mas mantém o reenvio desnecessário a cada troca de aba.
**Arquivos e objetos a tocar:** `src/hooks/useSyncedSetting.ts`.
**Não tocar / armadilhas:** não mexa nos efeitos colaterais dentro do atualizador de estado (`:200-203`) nesta etapa — é higiene, e misturar aumenta o risco. O único consumidor hoje é `src/hooks/win-loss/useAtRiskSettings.ts:111-117`, usado em `AtRiskDealsFromPatterns.tsx:49`: teste por ali.
**Depende de:** 140 · **Libera:** —
**Risco e como reverter:** se a comparação ficar invertida, a preferência local passa a ser sobrescrita pelo servidor — o oposto do bug. Teste os dois sentidos. `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** ajustar o limiar de risco, trocar de aba e voltar, recarregar em outro navegador → o valor ajustado permanece. E `SELECT value, updated_at FROM public.user_app_settings WHERE key='winloss-at-risk'` não muda sozinho a cada troca de foco.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 142 — Avisar quando a conversa do assistente não for gravada
**Onda / Severidade / Camada:** 5 / Média / Hooks
**Achados resolvidos:** A-93
**Problema hoje:** `src/hooks/sales/useSalesAssistant.ts:120-151` engole a falha ao persistir a mensagem: a conversa aparece na tela e desaparece ao recarregar, sem aviso.
**Causa raiz:** erro de gravação tratado como silêncio.
**Caminho recomendado:** trate o erro e avise na própria conversa ("esta mensagem não foi salva"), em vez de um alerta global que o usuário fecha. A etapa 055 cria a policy de exclusão no mesmo arquivo — faça depois dela para não conflitar.
**Arquivos e objetos a tocar:** `src/hooks/sales/useSalesAssistant.ts`.
**Não tocar / armadilhas:** não bloqueie a conversa quando a gravação falhar: o valor imediato é a resposta, não o histórico.
**Depende de:** 055 · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** com a gravação forçada a falhar, a mensagem aparece marcada como não salva.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 143 — Dar asserções aos testes de fluxo principal
**Onda / Severidade / Camada:** 5 / Alta / Testes
**Achados resolvidos:** A-142
**Problema hoje:** `tests/e2e/core-flows.spec.ts`: os 3 casos passam sem asserção efetiva. O nome promete cobrir os fluxos centrais e o conteúdo não verifica resultado. E o arquivo está entre os 26 specs que nunca rodam (A-24), então nem o falso positivo aparece.
**Causa raiz:** testes escritos como roteiro de navegação, sem verificação.
**Caminho recomendado:** faça **depois** de 040 (tornar os specs alcançáveis): escrever asserção para teste que não roda é trabalho que ninguém confere. Com o spec rodando, acrescente verificação de resultado em cada caso — o que foi gravado, o que apareceu na tela. Use `tests/e2e/quote-to-sale*.spec.ts` como referência: são 23 specs com corrida, idempotência e contrato, e é a melhor qualidade de teste do repositório.
**Arquivos e objetos a tocar:** `tests/e2e/core-flows.spec.ts`.
**Não tocar / armadilhas:** não "conserte" aumentando o número de casos: três casos que verificam valem mais que dez que navegam.
**Depende de:** 040 · **Libera:** 144, 145
**Risco e como reverter:** o spec pode passar a falhar — e isso é o objetivo. Trate as falhas como descobertas, não como regressão da sua PR.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** `npx playwright test tests/e2e/core-flows.spec.ts` → os casos verificam resultado, e a falha de uma asserção reprova o teste.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 144 — Tirar o mock que substitui a regra sob teste
**Onda / Severidade / Camada:** 5 / Alta / Testes
**Achados resolvidos:** A-143
**Problema hoje:** `tests/e2e/auth-navigation.spec.ts` simula justamente a verificação de papel que é o objeto do teste: ele passa independentemente de o guard de rota funcionar.
**Causa raiz:** simulação aplicada no ponto que o teste deveria exercitar.
**Caminho recomendado:** use sessão real com usuários de teste de papéis diferentes (o repositório já tem `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD` e o `global-setup.ts`), e verifique o comportamento do guard: vendedor em rota de admin deve cair em `/acesso-negado` e gravar em `access_denied_logs`. Sem sessão real, este teste não prova nada — e é justamente o guard que A-67, A-68 e A-115 mexem.
**Arquivos e objetos a tocar:** `tests/e2e/auth-navigation.spec.ts`.
**Não tocar / armadilhas:** o teste depende de segredo: sem credencial ele deve ser **marcado como pulado explicitamente**, não passar. O job já tem esse tratamento (`pr-checks.yml:489-517`).
**Depende de:** 040, 143 · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** com credencial, o spec verifica negativa e registro; sem credencial, é pulado explicitamente (não verde falso).
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 145 — Criar o teste que verifica policy contra o banco, não contra o arquivo
**Onda / Severidade / Camada:** 5 / Alta / Testes
**Achados resolvidos:** A-144, A-148
**Problema hoje:** os testes de contrato em `supabase/functions/_shared/*_contract_test.ts` fazem `assertMatch` sobre arquivos de `supabase/migrations/` (ex.: `canonical-hardening_contract_test.ts:11-37`): provam que o **arquivo** contém o texto, não que o banco está assim. E A-43, A-04 e A-46 mostram justamente casos em que o repositório diz uma coisa e o banco faz outra. O único teste que bate no banco está desligado (`src/test/security/fn-cleanup-webhook-dedupe-privileges.test.ts:44`, `describe.skipIf(!canRun)`).
**Causa raiz:** a verificação foi feita sobre o texto da migration porque é mais fácil que contra o banco.
**Caminho recomendado:** use o conjunto SQL que já existe (`npm run test:sql`, `scripts/run-sql-tests.sh`), que roda **contra o banco**, e escreva lá as afirmações que hoje são feitas sobre arquivo: para cada tabela sensível, que não há policy permissiva anulando a restritiva; que o grant de `anon` está revogado nas tabelas da etapa 025. Mantenha os testes de contrato de arquivo — eles pegam regressão no repositório —, mas pare de tratá-los como prova de configuração do banco.
**Arquivos e objetos a tocar:** novos arquivos no conjunto de testes SQL.
**Não tocar / armadilhas:** este teste precisa de credencial de banco; garanta que ele **falhe** quando não puder rodar, em vez de passar — é o erro de A-57 em outra forma.
**Depende de:** 029, 039 · **Libera:** 146
**Risco e como reverter:** baixo (teste). Se o teste for ao gate (etapa 039), uma falha passa a bloquear PR.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** `npm run test:sql` com o teste novo → passa; crie uma policy `USING (true)` numa tabela sensível em ambiente de teste → o teste **falha** apontando a tabela.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 146 — Criar os testes que faltam para comissão
**Onda / Severidade / Camada:** 5 / Alta / Testes
**Achados resolvidos:** A-147
**Problema hoje:** o cálculo de comissão — trigger do banco, resolução de regra, split de SDR, fallback de 5% e os quatro consumidores do front — **não tem nenhum teste**. É a área com mais achados desta auditoria (A-02, A-03, A-122, A-123, A-128, A-129) e a que o conjunto de testes ignora inteiramente.
**Causa raiz:** a camada de teste cresceu em domínios puros (validadores, markup, previsão) e não alcançou o trigger de dinheiro.
**Caminho recomendado:** escreva na ordem do risco, um caso por etapa de correção já feita: (1) fechar venda gera uma comissão com o percentual da regra que casou; (2) nenhuma regra casando se comporta como a etapa 100 definiu; (3) refechar venda não aborta e não duplica (etapa 067); (4) venda com SDR gera as duas linhas; (5) o valor que o front mostra é igual ao que o banco gravou (etapa 042). Os três primeiros são teste SQL (`npm run test:sql`); os dois últimos, unitário. Faça **depois** das correções: teste escrito antes da decisão de negócio fixa o comportamento errado.
**Arquivos e objetos a tocar:** novos testes SQL e unitários.
**Não tocar / armadilhas:** não escreva teste que apenas repita a implementação (ler o percentual da regra e conferir que é o percentual da regra). O caso que importa é o de borda: sem regra, com faixa, com SDR, com refechamento.
**Depende de:** 067, 100, 042 · **Libera:** 147
**Risco e como reverter:** baixo (teste).
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** `npm run test:sql` e `npm run test` com os casos novos → passam; e alterar o fallback do trigger faz o caso (2) falhar.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 147 — Criar o teste de concessão de premiação
**Onda / Severidade / Camada:** 5 / Alta / Testes
**Achados resolvidos:** A-147
**Problema hoje:** a elegibilidade de premiação tem teste (`src/hooks/useEligibleBonuses.test.ts`), e a **concessão** não: `award_bonus_if_eligible` não é exercitada por nenhum teste, embora seja o ponto que grava dinheiro na fila de pagamento (A-07).
**Causa raiz:** o teste cobriu a camada pura e parou antes da RPC.
**Caminho recomendado:** escreva teste SQL para a RPC, cobrindo: condição não atendida não concede; condição desconhecida não concede (depois da etapa 008); mesmo prêmio no mesmo mês não duplica (a idempotência que já existe e está correta); e o valor gravado é dinheiro, não percentual (depois da etapa 074).
**Arquivos e objetos a tocar:** novos testes SQL.
**Não tocar / armadilhas:** a idempotência por `(bonus_id, salesperson_id, period_month)` está correta — o teste deve **protegê-la**, não questioná-la.
**Depende de:** 008, 074, 146 · **Libera:** —
**Risco e como reverter:** baixo (teste).
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** `npm run test:sql` com os casos novos → passam; remover a validação de condição da RPC faz o segundo caso falhar.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 148 — Criar o teste do caminho de importação de clientes
**Onda / Severidade / Camada:** 5 / Média / Testes
**Achados resolvidos:** A-147
**Problema hoje:** o upload/importação não tem nenhum teste, e A-78 mostra que o parser desloca colunas silenciosamente — é o tipo de defeito que um teste de uma linha pegaria.
**Causa raiz:** caminho de entrada de dado pessoal sem cobertura.
**Caminho recomendado:** teste unitário sobre a função de leitura do CSV (depois da etapa 129): campo entre aspas com vírgula, campo vazio, linha com colunas a menos, e-mail inválido, arquivo com cabeçalho diferente. É teste puro, rápido, e fixa exatamente o comportamento que a etapa 129 corrige.
**Arquivos e objetos a tocar:** novo arquivo de teste unitário.
**Não tocar / armadilhas:** teste a função de leitura, não a tela: teste de interface para importação é caro e frágil.
**Depende de:** 129 · **Libera:** —
**Risco e como reverter:** baixo (teste).
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** `npm run test` com os casos novos → passam; e reverter a etapa 129 faz o caso do campo entre aspas falhar.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 149 — Fazer a guarda de console realmente reprovar o teste
**Onda / Severidade / Camada:** 5 / Média / Testes
**Achados resolvidos:** A-145
**Problema hoje:** a proteção que deveria falhar o teste quando o código emite erro no console não tem efeito (detalhe em `mapa-08-testes.md` §3.5).
**Causa raiz:** guarda instalada sem ligação com o resultado do teste.
**Caminho recomendado:** faça a guarda acumular as chamadas e verificar no encerramento, reprovando se houver erro não esperado — com lista de exceções declarada por teste, para os casos em que o erro é o objeto do teste. Sem isso, erros de React (chave duplicada, atualização em componente desmontado) continuam invisíveis.
**Arquivos e objetos a tocar:** o arquivo de configuração de teste (`src/test/setup.ts`).
**Não tocar / armadilhas:** espere uma onda de falhas na primeira execução: trate como inventário, corrija em lotes, e não desligue a guarda para "passar".
**Depende de:** — · **Libera:** —
**Risco e como reverter:** muitos testes podem passar a falhar de uma vez. Rode localmente antes de abrir a PR e dimensione.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** um teste que emite `console.error` passa a reprovar; um que declara a exceção continua passando.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 150 — Remover a duplicação de execução dos testes de interface
**Onda / Severidade / Camada:** 5 / Baixa / Testes
**Achados resolvidos:** A-146
**Problema hoje:** a configuração de projetos do Playwright faz um conjunto de specs rodar mais de uma vez, gastando tempo de CI sem cobertura adicional.
**Causa raiz:** projetos com `testMatch`/`testIgnore` sobrepostos.
**Caminho recomendado:** ajuste `playwright.config.ts` para que cada spec pertença a um projeto só, mantendo de propósito as duplicações que testam plataformas diferentes (`mobile-ios-safari` e `mobile-android-chrome` sobre `mobile-auth-smoke` são intencionais).
**Arquivos e objetos a tocar:** `playwright.config.ts`.
**Não tocar / armadilhas:** não unifique os projetos móveis: rodar o mesmo spec nos dois navegadores é o objetivo deles.
**Depende de:** 040 · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** `npx playwright test --list` → cada spec aparece uma vez por projeto pretendido, e o total de casos cai.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 151 — Ligar o destino do registro de erro do front
**Onda / Severidade / Camada:** 5 / Alta / Observabilidade
**Achados resolvidos:** A-149
**Problema hoje:** a captura existe e funciona (`src/App.tsx:22,25` → `initErrorTracking()`; `src/lib/errorTracking.ts:192-256` instala `window.onerror`, `unhandledrejection` e intercepta `console.error`/`console.warn`; cinco limites de erro, incluindo `GlobalErrorBoundary` com `severity: 'critical'`). Mas os dois destinos estão cegos: o Sentry não inicializa sem `VITE_SENTRY_DSN` (`errorTracking.ts:42-43`, e `sentry?.captureException` em `:151` vira operação sem efeito), e `error_logs` (`:100`) **não tem nenhum leitor que alerte** — só a UI (`SystemHealthBadge.tsx:52`, `AdminPlatformSLOPage.tsx:265`).
**Causa raiz:** a instrumentação foi feita e o destino nunca foi configurado.
**Caminho recomendado:** escolha **um** destino com o dono e ligue-o de verdade: (a) configurar o serviço externo (variável no projeto da Vercel), ou (b) um cron que leia `error_logs` e alerte, usando o caminho de alerta que já existe (`cron-failure-alerter`). A opção (b) não depende de serviço novo e aproveita o que o repositório tem, mas depende de A-39 (canal de e-mail). Não deixe os dois caminhos meio-ligados: é o estado atual.
**Arquivos e objetos a tocar:** configuração de ambiente (a) ou nova função/cron (b); `docs/` para registrar a escolha.
**Não tocar / armadilhas:** não ligue o serviço externo sem revisar o que vai no relatório: `errorTracking.ts` intercepta `console.error`, e mensagens de erro frequentemente carregam dado de cliente. Isso é LGPD.
**Depende de:** 034 · **Libera:** 152
**Risco e como reverter:** em (a), custo de serviço externo e possível envio de dado pessoal para fora. Em (b), volume de alerta. Comece com limiar alto.
**Precisa de aprovação humana antes do merge:** **sim** — configuração de produção, custo e possível tratamento de dado pessoal.
**Como verificar:** provocar um erro de JavaScript em produção (em uma tela de teste) → o alerta chega ao destino escolhido em minutos.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 152 — Parar de dizer ao usuário que a equipe foi notificada
**Onda / Severidade / Camada:** 5 / Alta / Frontend
**Achados resolvidos:** A-149
**Problema hoje:** `src/components/shared/GlobalErrorBoundary.tsx:67-68` afirma: *"A equipe técnica já foi notificada automaticamente via Enterprise Error Monitor."* Com a configuração atual, isso é **falso** (A-149).
**Causa raiz:** texto escrito supondo a instrumentação completa.
**Caminho recomendado:** se a etapa 151 ligar o alerta, o texto passa a ser verdadeiro e esta etapa some. Se o dono decidir não ligar, **mude o texto**: diga o que o usuário pode fazer (recarregar, tentar de novo, avisar o responsável) e, se houver identificador do erro, mostre-o para ele citar. Afirmar notificação que não ocorre é pior que não dizer nada, porque impede o usuário de reportar.
**Arquivos e objetos a tocar:** `src/components/shared/GlobalErrorBoundary.tsx`.
**Não tocar / armadilhas:** a mesma frase pode estar em outros limites de erro — rode `grep -rn "notificada" src/`.
**Depende de:** 151 · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** o texto exibido corresponde ao que o sistema faz de fato (teste: provocar erro e verificar se há alerta).
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 153 — Descobrir por que o histórico de execução de rotina não diminui
**Onda / Severidade / Camada:** 5 / Média / Observabilidade
**Achados resolvidos:** A-150, A-21
**Problema hoje:** `cron.job_run_details` tem 206.142 linhas com mais de 7 dias (~60,9 MB, um quarto do banco), e existe `cleanup-stale-logs-daily` rodando com `falhas_7d = 0` — o job de limpeza **passa** e o histórico **não diminui**. A hipótese é que `fn_cleanup_stale_logs` não cobre essa tabela; e `20261125100000_cron_job_run_details_sem_seq_scan.sql:18` registra que a tentativa anterior recebeu `42501: must be owner of table job_run_details`.
**Causa raiz:** — (etapa de diagnóstico)
**Caminho recomendado:** leia o corpo da função (`SELECT prosrc FROM pg_proc WHERE proname='fn_cleanup_stale_logs';`) e registre no progresso **quais** tabelas ela limpa. Se não cobre `cron.job_run_details`, o caminho **não é** tentar apagar: o Postgres gerenciado recusa. As saídas reais são reduzir a origem (menos execuções, schedules espalhados — já feito em `20261125110000`) ou aceitar e monitorar. Decida com o dono e registre a decisão; sem isso, a próxima auditoria reabre o mesmo item.
**Arquivos e objetos a tocar:** `docs/qa/05-PROGRESSO.md` e, se houver decisão, `docs/RUNBOOK.md`.
**Não tocar / armadilhas:** não tente `DELETE FROM cron.job_run_details` — já falhou e está documentado. Não aumente a frequência dos jobs achando que resolve.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** nenhum (diagnóstico).
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** o corpo da função registrado no progresso, com a decisão do dono anotada.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 154 — Fazer o filtro de comissões não descartar linha sem nome
**Onda / Severidade / Camada:** 5 / Baixa / Frontend
**Achados resolvidos:** A-80
**Problema hoje:** `src/pages/AdminComissoes.tsx:76-80`: o predicado é `c.salespeople?.name?.toLowerCase().includes(termo) || c.sales?.client_name?.toLowerCase().includes(termo)`. Com os dois campos nulos o resultado é `undefined` e a linha **desaparece — mesmo com a busca vazia**. A própria tabela prevê nome ausente (`:66` usa o fallback `'Vendedor'`).
**Causa raiz:** predicado que confunde "não casa" com "não tem o campo".
**Caminho recomendado:** trate o caso de busca vazia antes de filtrar (se o termo está vazio, mantenha tudo) e use `?? ''` nos campos antes de comparar. A linha deve aparecer — é justamente a comissão com vínculo incompleto que precisa de atenção do gestor.
**Arquivos e objetos a tocar:** `src/pages/AdminComissoes.tsx`.
**Não tocar / armadilhas:** as etapas 122 (estado de erro) e 075 (total com canceladas) tocam o mesmo arquivo — faça em sequência.
**Depende de:** 122 · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** com uma comissão sem `salespeople.name` e sem `sales.client_name`, a linha aparece na lista com a busca vazia.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 155 — Validar valor de venda no servidor, não só no navegador
**Onda / Severidade / Camada:** 5 / Baixa / Regras de negócio
**Achados resolvidos:** A-79
**Problema hoje:** `src/components/sales/CreateSaleDialog.tsx:46-52` exige `num > 0`, a inserção vai direto para a tabela (`src/services/salesService.ts:237-251`) e a restrição do banco é `CHECK (amount >= 0)` (`supabase/migrations/20260514211202_…sql:53`). Uma venda com valor `0` criada por qualquer outro caminho é aceita.
**Causa raiz:** regra de negócio aplicada só no cliente.
**Caminho recomendado:** decida com o dono se venda com valor zero é legítima (pode ser, em brinde ou amostra). Se não for, mude o `CHECK` para `amount > 0` — depois de contar as linhas existentes com zero (`SELECT count(*) FROM public.sales WHERE amount = 0;`). Se for legítima, **remova** a validação do cliente, que hoje mente sobre a regra.
**Arquivos e objetos a tocar:** nova migration (ou `src/components/sales/CreateSaleDialog.tsx`).
**Não tocar / armadilhas:** não aperte o `CHECK` sem contar as linhas: se houver vendas com zero, a migration falha ou você precisa tratá-las.
**Depende de:** 010, 079 · **Libera:** —
**Risco e como reverter:** se houver vendas com zero legítimas, apertar o CHECK impede correções futuras nelas. Reverter por migration.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** `INSERT` de venda com `amount = 0` pela API → recusado (ou aceito, se a decisão for permitir, e então a tela deixa de barrar).
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 156 — Remover a marca de ordem de bytes das duas migrations
**Onda / Severidade / Camada:** 5 / Baixa / Banco
**Achados resolvidos:** A-118
**Problema hoje:** `supabase/migrations/20261120000000_t15_multichannel_retry.sql` e `20261121000000_fix_search_path_similarity_e_pgvector.sql` começam com BOM UTF-8 (detectado com `head -c3 | od -An -tx1`), e `npm run check:migrations` passa (EXECUTADO: exit 0). BOM em SQL quebra algumas ferramentas de replay — e o replay já é frágil (A-46: 271 arquivos falham).
**Causa raiz:** editor que gravou com BOM.
**Caminho recomendado:** remova os três bytes iniciais dos dois arquivos e acrescente a checagem ao `scripts/check-migrations.mjs`, para não voltar. São migrations já aplicadas, então mudar o arquivo não afeta o banco — mas confirme que o gate não compara conteúdo com o ledger por hash.
**Arquivos e objetos a tocar:** os dois arquivos; `scripts/check-migrations.mjs`.
**Não tocar / armadilhas:** não altere mais nada nos arquivos: migration aplicada deve permanecer idêntica em conteúdo.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** **sim** se alterar `scripts/check-migrations.mjs` (é gate de CI).
**Como verificar:** `head -c3 <arquivo> | od -An -tx1` → sem `ef bb bf`; e o gate acusa se um BOM for reintroduzido.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 157 — Substituir a lista de nomes proibidos de `portfolio_settings`
**Onda / Severidade / Camada:** 5 / Baixa / Banco
**Achados resolvidos:** A-117
**Problema hoje:** `supabase/migrations/20260718000002_fix_portfolio_settings_rls_credential_leak.sql:17-29` substituiu um `USING (true)` (que expunha tokens) por um filtro sobre o **nome** da chave (`setting_key NOT ILIKE '%token%' AND … '%secret%' AND … '%api_key%'`). Funciona enquanto ninguém criar uma chave chamada `credencial`, `senha` ou `bearer`.
**Causa raiz:** lista de proibidos usada onde era preciso uma lista de permitidos.
**Caminho recomendado:** inverta: marque explicitamente quais chaves são públicas (coluna booleana `is_public`, ou uma tabela separada para as sensíveis) e deixe a policy liberar só essas. Lista de permitidos falha fechada; lista de proibidos falha aberta — e o custo de inverter aqui é baixo, porque a tabela é de configuração.
**Arquivos e objetos a tocar:** nova migration.
**Não tocar / armadilhas:** ao inverter, as chaves existentes precisam ser classificadas uma a uma; liste-as antes (`SELECT DISTINCT setting_key FROM public.portfolio_settings;`) e confirme com o dono.
**Depende de:** 010 · **Libera:** —
**Risco e como reverter:** classificação errada esconde configuração legítima da tela. Reverter por migration.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** criar uma chave `credencial_parceiro` com valor sensível → **não** aparece para usuário comum (hoje apareceria).
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 158 — Fazer o `health` informar a versão em produção
**Onda / Severidade / Camada:** 5 / Baixa / Observabilidade
**Achados resolvidos:** A-15
**Problema hoje:** EXECUTADO: `GET /functions/v1/health` → `{"status":"ok","version":"dev",…}`. O front também não expõe versão: nenhum `<meta>` em `index.html` de produção, nenhum `define` em `vite.config.ts`, nenhuma string de versão nos chunks. O `package.json` está em 1.7.4 e o commit auditado é a release 1.7.4, mas isso não é verificável a partir do que está no ar.
**Causa raiz:** a variável de versão não é injetada no deploy, nem nas funções nem no build do front.
**Caminho recomendado:** injete a versão nos dois lugares: no build do front por `define` do Vite (a partir do `package.json` ou do SHA do commit) e nas edge functions por variável de ambiente no `deploy.yml`. Exponha no `health` e num `<meta>`. É a correção mais barata do plano em relação ao que economiza em diagnóstico — hoje, diante de um problema, ninguém sabe qual código está rodando.
**Arquivos e objetos a tocar:** `vite.config.ts`; `index.html`; `supabase/functions/health/index.ts`; `.github/workflows/deploy.yml`.
**Não tocar / armadilhas:** não exponha informação além da versão (nada de nome de branch ou de autor).
**Depende de:** — · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** **sim** — altera workflow de deploy.
**Como verificar:** `curl .../functions/v1/health` → `version` com o número da release; e `curl https://promo-champions-v2-1.vercel.app/ | grep version` encontra a meta.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 159 — Registrar a divergência de `call_tracking` ou remover a migration do ledger
**Onda / Severidade / Camada:** 5 / Baixa / Banco
**Achados resolvidos:** A-47
**Problema hoje:** `supabase/migrations/20260104182000_additional_tables.sql` cria `call_tracking` e **nenhum arquivo tem `DROP TABLE … call_tracking`**. A tabela não existe em produção (EXECUTADO: `GET /rest/v1/call_tracking` → 404 `PGRST205`), e também não está em `supabase/schema.sql` nem em `banco.json`. Ainda assim a versão foi inserida no ledger por `20261117090000_marca_594_migrations_como_aplicadas.sql:20-22`, que admite o caso.
**Causa raiz:** a migration foi marcada como aplicada em bloco, junto com 594 outras, e a divergência foi aceita sem registro visível.
**Caminho recomendado:** o risco prático é baixo (nada no código usa `call_tracking`; o Twilio usa `twilio_call_sessions`, conforme `docs/DEAD_TABLES.md`). O que falta é **registro**: documente a divergência em `docs/SCHEMA_CONVENTIONS.md` ou `docs/DEAD_TABLES.md`, para que um ambiente novo montado pelo ledger não surpreenda. Alternativa, se o dono preferir limpeza: uma migration que faz `DROP TABLE IF EXISTS` (sem efeito em produção, mas alinhando repositório e realidade).
**Arquivos e objetos a tocar:** `docs/DEAD_TABLES.md` ou nova migration.
**Não tocar / armadilhas:** não crie a tabela "para alinhar": ela não é usada, e criar objeto morto é pior.
**Depende de:** 010 · **Libera:** —
**Risco e como reverter:** baixo.
**Precisa de aprovação humana antes do merge:** não, se ficar na documentação.
**Como verificar:** a divergência registrada no documento, ou `DROP TABLE IF EXISTS` aplicado sem erro.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 160 — Alinhar a declaração de funções sem JWT com a realidade
**Onda / Severidade / Camada:** 5 / Média / Backend
**Achados resolvidos:** A-114
**Problema hoje:** `supabase/config.toml` declara `verify_jwt = false` para **22** funções; o snapshot da Management API traz **79 das 100** listadas com `verify_jwt: false` — diferença de **64 slugs sem JWT em produção que o repositório não declara** (nenhum caso inverso). Somado a A-26 (o `verify_jwt` não autentica de qualquer modo), ninguém que leia o repositório sabe quais endereços estão abertos.
**Causa raiz:** a configuração foi mantida à mão enquanto o estado real era alterado por deploys.
**Caminho recomendado:** primeiro **meça ao vivo**: liste as funções e o `verify_jwt` real pela Management API (ou pelo painel) e compare com o `config.toml`. Depois decida, função por função, se o estado real é o desejado — e **declare no `config.toml`** o que ficar. O arquivo precisa voltar a ser a fonte de verdade da superfície pública, com comentário justificando cada caso, como já faz para as 22 atuais. As funções que não deveriam estar abertas entram nas etapas de autenticação (005, 006, 007 e as de IDOR).
**Arquivos e objetos a tocar:** `supabase/config.toml`; um documento com a comparação.
**Não tocar / armadilhas:** não feche as 64 de uma vez: algumas são webhooks e cron legítimos. A medição vem antes da mudança.
**Depende de:** 005, 006, 007 · **Libera:** 161
**Risco e como reverter:** fechar uma função que um parceiro usa derruba a integração. A medição e a declaração vêm antes.
**Precisa de aprovação humana antes do merge:** **sim** — altera a superfície pública.
**Como verificar:** a lista do `config.toml` bate com a lista real da API, item a item.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 161 — Criar a verificação que impede a superfície pública de divergir de novo
**Onda / Severidade / Camada:** 5 / Média / CI
**Achados resolvidos:** A-114
**Problema hoje:** depois de 160, nada impede que a diferença volte: o `config.toml` é editado à mão e o estado real muda por deploy.
**Causa raiz:** ausência de verificação automática da superfície pública.
**Caminho recomendado:** acrescente ao CI um passo que compare o `config.toml` com o estado real (pela Management API, com o segredo que o workflow de deploy já usa) e falhe quando divergirem. Comece como aviso, promova a bloqueio depois de uma semana limpa — é o mesmo cuidado da etapa 039.
**Arquivos e objetos a tocar:** um script em `scripts/`; `.github/workflows/`.
**Não tocar / armadilhas:** o passo precisa de credencial de Management API: respeite A-58 e declare o segredo **no step**, não no job.
**Depende de:** 033, 160 · **Libera:** —
**Risco e como reverter:** baixo; se o passo ficar instável, volte a aviso.
**Precisa de aprovação humana antes do merge:** **sim** — altera workflow de CI.
**Como verificar:** alterar `verify_jwt` de uma função sem atualizar o `config.toml` → o passo acusa a divergência.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

## Onda 6 — Performance e escala
> **Contexto comum a esta onda.** O PostgREST corta respostas de lista em ~1000 linhas.
> O repositório **conhece** o limite e tem o helper `src/lib/supabase/fetchAllRows.ts` (`:4`),
> além de ganchos que já contam por `HEAD + count exact`
> (`src/hooks/cadences/useCadenceChannelStats.ts:36`) ou paginam
> (`src/hooks/useQuotes.ts:100`, `src/hooks/gamification/useAchievements.ts:100`,
> `src/components/dashboard/widgets/ConversionRateWidget.tsx:36`,
> `src/hooks/useLeadSourceAnalysis.ts:204`, `src/hooks/race/useMyCareer.ts:55`).
> Volumes medidos (SNAPSHOT 2026-11-12): `activities` **2.229**, `notifications` 5.641,
> `audit_logs` 30.840, `sales` 957, `commissions` 944, `lead_scores` 900, `quotes` 474,
> `orders` 336, `clients` 101.
> Varredura própria (EXECUTADO): **101 consultas** sem `.limit()`/`.range()` em tabela que
> cresce (`scratchpad/qa/sem-paginacao.txt`).
> **A regra para todas as etapas desta onda:** se a consulta é para **agregar**, conte ou
> agregue no banco (RPC/view) em vez de trazer as linhas; se é para **listar**, pagine.
> Trazer tudo e somar no navegador é o padrão a eliminar, não a paginar.

### Etapa 162 — Corrigir o truncamento do relatório de atividades da equipe
**Onda / Severidade / Camada:** 6 / Alta / Hooks
**Achados resolvidos:** A-24
**Problema hoje:** `src/hooks/sales/useSalespersonActivityReport.ts:70` faz `.from('activities').select('*').is('deleted_at',null).gte(created_at,…).lte(created_at,…)` **sem filtro de vendedor e sem limite** — é a visão de toda a equipe por período. `activities` já tem **2.229 linhas**, então um período amplo é cortado em 1000 e o relatório mostra menos atividade do que houve, sem erro. O mesmo em `:177`, onde o filtro de vendedor só entra quando informado.
**Causa raiz:** consulta de agregação escrita como listagem completa, sem considerar o corte do PostgREST.
**Caminho recomendado:** este relatório **agrega** (conta atividades por vendedor e por tipo): não pagine, agregue no banco. Crie uma RPC que devolva as contagens por vendedor/tipo no período e consuma o resultado — a resposta passa de milhares de linhas para dezenas, e o corte deixa de existir. O `fetchAllRows` resolveria o truncamento, mas trazer 2.229 linhas para contar no navegador é a solução pior.
**Arquivos e objetos a tocar:** `src/hooks/sales/useSalespersonActivityReport.ts`; migration com a RPC.
**Não tocar / armadilhas:** `select('*')` traz todas as colunas de `activities`, inclusive as que a tela não usa — a RPC corrige isso de graça. Não esqueça `deleted_at IS NULL` dentro da RPC (A-130 é o mesmo tipo de erro).
**Depende de:** 010 · **Libera:** 163
**Risco e como reverter:** os números do relatório vão **mudar** (para cima) onde havia corte — é a correção. Avise o dono. Reverter por migration + `git revert`.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção e mudança de número de relatório.
**Como verificar:** para um período com mais de 1000 atividades, comparar o total da tela com `SELECT count(*) FROM public.activities WHERE deleted_at IS NULL AND created_at BETWEEN … AND …` → devem bater (hoje a tela mostra 1000).
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 163 — Auditar as 101 consultas sem limite e classificar por risco
**Onda / Severidade / Camada:** 6 / Média / Hooks
**Achados resolvidos:** A-24
**Problema hoje:** a varredura própria encontrou 101 consultas sem `.limit()`/`.range()` em tabelas que crescem. Algumas já truncam (`activities`, 2.229 linhas); outras estão perto do teto (`sales` 957, `lead_scores` 900); a maioria tem filtro estreito e não corre risco.
**Causa raiz:** — (etapa de levantamento)
**Caminho recomendado:** produza a classificação antes de corrigir: para cada ocorrência, a tabela, o volume atual, se o filtro reduz abaixo de 1000, e se a consulta **agrega** ou **lista**. A lista bruta está em `scratchpad/qa/sem-paginacao.txt` (reproduza a varredura, porque o arquivo é da auditoria). Só as que agregam sobre tabela acima (ou perto) de 1000 linhas precisam de etapa; as demais entram em backlog. Corrigir 101 consultas é churn e o plano proíbe.
**Arquivos e objetos a tocar:** um documento em `docs/`.
**Não tocar / armadilhas:** não corrija em massa nem acrescente `.limit(1000)` em todas: isso **esconde** o truncamento em vez de resolver, e torna o corte silencioso definitivo.
**Depende de:** 162 · **Libera:** 164, 165, 166, 167
**Risco e como reverter:** nenhum (documento).
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** o documento classifica as 101 ocorrências e aponta quantas exigem correção.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 164 — Agregar no banco os indicadores de BI de vendas
**Onda / Severidade / Camada:** 6 / Média / Hooks
**Achados resolvidos:** A-24
**Problema hoje:** os ganchos de BI trazem as vendas inteiras para agregar no navegador, sem limite: `src/hooks/bi/useBICloser.ts:273`, `src/hooks/bi/useBISDR.ts:147`, `src/hooks/bi/useABCAnalysis.ts:126`. Com `sales` em 957 linhas, estão a poucos por cento do corte de 1000.
**Causa raiz:** agregação feita no cliente sobre a tabela inteira.
**Caminho recomendado:** crie (ou reutilize) view/RPC de agregação por período e papel, e faça os três ganchos consumirem. A ordem importa: faça **um** gancho por PR, comparando o número antes e depois — se o valor mudar, você descobriu um truncamento já ativo, e isso vai ao dono.
**Arquivos e objetos a tocar:** os três ganchos; migration com a view/RPC.
**Não tocar / armadilhas:** não unifique os três indicadores numa única RPC genérica: eles têm recortes diferentes (A-98 mostra o custo de confundir recortes). Uma agregação por indicador.
**Depende de:** 163 · **Libera:** 165
**Risco e como reverter:** números de BI podem mudar; avise o dono. Reverter por migration + `git revert`.
**Precisa de aprovação humana antes do merge:** **sim** — muda número de BI.
**Como verificar:** para cada gancho, o total da tela bate com a agregação equivalente em SQL.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 165 — Agregar no banco as métricas de closer e de vendedor
**Onda / Severidade / Camada:** 6 / Média / Hooks
**Achados resolvidos:** A-24
**Problema hoje:** `src/hooks/useCloserMetrics.ts:83,164,219`, `src/hooks/sales/useSalesInsights.ts:59`, `src/hooks/sales/useSalesChartData.ts:23` e `src/hooks/sales/useSalespeople.ts:101` trazem `sales` sem limite para calcular métricas.
**Causa raiz:** mesma de 164.
**Caminho recomendado:** mesmo caminho de 164, por gancho. `useSalespeople.ts:125` também calcula comissão — ao tocar o arquivo, confirme que o cálculo já vem da fonte única da etapa 042, ou você vai agregar sobre a taxa errada.
**Arquivos e objetos a tocar:** os cinco ganchos citados; migration se precisar de nova agregação.
**Não tocar / armadilhas:** `useSalesChartData` alimenta gráfico por período: agregue por dia/semana no banco, não traga as vendas.
**Depende de:** 042, 164 · **Libera:** 166
**Risco e como reverter:** números mudam; avise o dono. Reverter por migration + `git revert`.
**Precisa de aprovação humana antes do merge:** **sim** — muda número exibido.
**Como verificar:** os totais da tela batem com a agregação em SQL para o mesmo período.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 166 — Agregar no banco as análises de cliente
**Onda / Severidade / Camada:** 6 / Média / Hooks
**Achados resolvidos:** A-24
**Problema hoje:** `src/hooks/bi/useClientSearch.ts:9`, `useIndustryTrends.ts:12,49`, `useBITopClients.ts:53`, `useClientVsIndustry.ts:18`, `src/hooks/reporting/useCohortRetention.ts:24`, `src/hooks/crm/useClientPredictions.ts:22` e `src/hooks/crm/useClient360.ts:41,57` trazem `clients`/`sales` sem limite. `clients` tem só 101 linhas hoje — o risco é de crescimento, não atual.
**Causa raiz:** mesma de 164.
**Caminho recomendado:** prioridade baixa dentro da onda, justamente porque `clients` é pequena: faça **depois** de 164 e 165, e só para os que agregam sobre `sales`. Para `useClientSearch`, o certo é buscar no banco com `ilike` e limite, não filtrar 101 linhas no navegador — e isso já prepara a tela para quando a base crescer.
**Arquivos e objetos a tocar:** os ganchos citados.
**Não tocar / armadilhas:** `useClient360` busca por `client_id` e tem filtro estreito — não precisa de mudança; está na lista por varredura mecânica, e corrigi-lo é churn.
**Depende de:** 165 · **Libera:** 167
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** a busca de clientes retorna do servidor com limite, e os agregados batem com SQL.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 167 — Remover a consulta de 957 linhas cujo resultado é descartado
**Onda / Severidade / Camada:** 6 / Baixa / Hooks
**Achados resolvidos:** A-25
**Problema hoje:** `src/hooks/sales/useSalespersonCoaching.ts:67-69`: `const { data: _allTeamSales } = await supabase.from('sales').select('amount, status, salesperson_id');` — EXECUTADO: `grep -n "_allTeamSales"` devolve **só a linha 67**, a variável nunca é lida. É a única consulta do repositório com resultado descartado (varredura própria: 1 ocorrência em todo o `src/`). Cada abertura da tela de coaching puxa as 957 vendas para jogar fora.
**Causa raiz:** consulta deixada no código após a remoção do cálculo que a usava.
**Caminho recomendado:** apague as três linhas. Se a média da equipe era a intenção (o nome sugere), o caminho é uma agregação no banco — mas isso é feature, não correção: confirme com o dono antes de implementar, e não deixe a consulta morta no lugar enquanto decide.
**Arquivos e objetos a tocar:** `src/hooks/sales/useSalespersonCoaching.ts`.
**Não tocar / armadilhas:** o mesmo arquivo consulta `activities` por vendedor (`:61`), que tem filtro estreito e está correta — não mexa.
**Depende de:** 163 · **Libera:** —
**Risco e como reverter:** nenhum (remoção de código morto). `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** abrir a tela de coaching e observar na aba de rede que a requisição a `sales` sem filtro **não** ocorre mais.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 168 — Medir as consultas lentas em produção antes de otimizar mais
**Onda / Severidade / Camada:** 6 / Média / Banco
**Achados resolvidos:** A-24
**Problema hoje:** as etapas 162–167 tratam truncamento e desperdício encontrados por leitura de código. O que **falta** é a medição ao vivo: nesta auditoria não foi possível rodar SQL no banco de produção (conector MCP com 401; gateway sem caminho de POST), então nenhuma consulta lenta real foi identificada.
**Causa raiz:** — (etapa de medição; cobre uma lacuna declarada da auditoria)
**Caminho recomendado:** com acesso ao banco, levante as consultas mais custosas e compare com a lista de 163: `SELECT query, calls, total_exec_time, mean_exec_time, rows FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 30;`. O repositório tem `reset-pg-stat-statements-weekly` no cron, então a janela é de uma semana. Registre o resultado no progresso: ele diz se as próximas etapas de performance valem a pena ou se o gargalo está em outro lugar. Otimizar sem essa medição é adivinhação.
**Arquivos e objetos a tocar:** `docs/qa/05-PROGRESSO.md`.
**Não tocar / armadilhas:** `pg_stat_statements` normaliza a consulta, então você verá o padrão, não os parâmetros — é suficiente para priorizar.
**Depende de:** 163 · **Libera:** 169
**Risco e como reverter:** nenhum (somente leitura).
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** a lista das 30 consultas mais custosas anotada no progresso, com as cinco primeiras cruzadas com a classificação de 163.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 169 — Criar os índices que a medição apontar
**Onda / Severidade / Camada:** 6 / Média / Banco
**Achados resolvidos:** A-24
**Problema hoje:** condicional ao resultado de 168. A auditoria **não** encontrou filtro frequente sem índice com impacto comprovado (o relatório da camada de banco registra isso explicitamente), e os 889 índices existentes cobrem os acessos conhecidos — por isso esta etapa depende de medição, e não de suposição.
**Causa raiz:** — (depende de 168)
**Caminho recomendado:** para cada consulta custosa de 168, rode `EXPLAIN (ANALYZE, BUFFERS)` e crie índice **só** onde houver varredura sequencial em tabela grande com filtro seletivo. Use `CREATE INDEX` simples: `CONCURRENTLY` falha no gateway transacional (`AGENTS.md` §7). Um índice por PR, com o plano antes e depois na descrição.
**Arquivos e objetos a tocar:** uma migration por índice.
**Não tocar / armadilhas:** não crie índice "preventivo": a etapa 085 está removendo 14 duplicados justamente porque índice sem uso custa escrita. Confira `pg_stat_user_indexes` depois de uma semana para saber se o índice novo está sendo usado.
**Depende de:** 010, 085, 168 · **Libera:** —
**Risco e como reverter:** índice novo deixa a escrita mais lenta; se não for usado, remova. Reverter por migration.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** `EXPLAIN (ANALYZE)` da consulta alvo mostrando uso do índice e tempo menor que o medido em 168.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 170 — Reduzir o peso das assinaturas em tempo real nos painéis mais abertos
**Onda / Severidade / Camada:** 6 / Média / Hooks
**Achados resolvidos:** A-97
**Problema hoje:** além do filtro da etapa 137, os painéis assinam várias tabelas ao mesmo tempo e refazem a consulta inteira a cada evento. Com `sales` recebendo gravações durante o dia, todo painel aberto recarrega.
**Causa raiz:** assinatura ligada a recarregamento completo, em vez de atualização pontual.
**Caminho recomendado:** depois de 137 (filtro) e 138 (liberação de canal), faça o evento atualizar **o dado afetado** no cache (`setQueriesData`, com a correção de chave da etapa 057 já aplicada), em vez de invalidar a consulta inteira. Comece pelo painel principal e meça: se a diferença não for perceptível, **pare** — o resto é otimização sem retorno.
**Arquivos e objetos a tocar:** `src/hooks/dashboard/useDashboardKPIs.ts` e o painel principal.
**Não tocar / armadilhas:** atualização pontual exige que o evento traga o registro completo; se o `payload` vier parcial, o cache fica inconsistente — nesse caso, invalidar é o certo.
**Depende de:** 057, 137, 138 · **Libera:** —
**Risco e como reverter:** cache inconsistente é pior que recarregamento. Meça antes de estender. `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** com duas abas abertas, gravar uma venda → o painel atualiza o cartão afetado sem recarregar a lista inteira (observável na aba de rede).
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

## Onda 7 — Experiência de uso e consistência

### Etapa 171 — Filtrar o menu pelo papel do usuário
**Onda / Severidade / Camada:** 7 / Alta / Frontend
**Achados resolvidos:** A-67
**Problema hoje:** `src/components/layout/sidebar/sidebarMenuData.ts:165` e `:235` publicam *Business Intelligence → `/ferramentas/bi`* para SDR e Closer, e a rota exige gestor (`src/routes/AppRoutes.tsx:718-725`); `:176` publica *Assinatura Digital → `/assinatura-digital`* para o Closer, e a rota também exige gestor (`:407-414`). `AppSidebar.tsx:113-131` renderiza tudo que a estrutura traz, sem filtrar. Cada clique termina em "Acesso Negado" e grava uma linha em `access_denied_logs` (`ProtectedRoute.tsx:33-40`).
**Causa raiz:** a estrutura do menu não carrega o nível de acesso da rota, e o render não filtra.
**Caminho recomendado:** a correção estrutural é fazer o item de menu declarar o papel mínimo e o render filtrar — assim o problema não volta na próxima rota. Como o nível já existe no roteador, a fonte mais confiável é derivá-lo de lá (ou de `inventario/estado/rotas.json`, que tem o campo `acesso` conferido como correto). Atalho a evitar: remover só os três itens errados. Eles voltam no próximo menu novo, e o sintoma (auditoria de segurança poluída) permanece.
**Arquivos e objetos a tocar:** `src/components/layout/sidebar/sidebarMenuData.ts`; `src/components/organisms/AppSidebar.tsx`.
**Não tocar / armadilhas:** o mesmo problema existe na paleta de comandos: `src/components/command/CommandPalette.tsx:253,261,309,317` expõe `/metas`, `/analytics`, `/relatorios` e `/bi-gestor` sem nenhum filtro de papel (não há `isAdmin`/`role` no arquivo). Trate junto, ou a correção fica pela metade.
**Depende de:** — · **Libera:** 172, 173
**Risco e como reverter:** se o mapeamento de papel ficar errado, um item legítimo desaparece do menu de quem precisa. Teste com os três perfis. `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** logado como SDR, o menu **não** mostra Business Intelligence; como gestor, mostra. E `SELECT count(*) FROM public.access_denied_logs WHERE created_at > now() - interval '1 day'` para de crescer por esse motivo.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 172 — Corrigir o modo de visualização do menu lido do navegador
**Onda / Severidade / Camada:** 7 / Média / Frontend
**Achados resolvidos:** A-68
**Problema hoje:** `AppSidebar.tsx:98-104` inicializa `viewMode` lendo `localStorage.sidebar_view_mode` e aceita qualquer valor de `gestao|sdr|closer` **sem olhar o papel**; o seletor só é desenhado para admin/gestor/híbrido (`:204`), mas o valor salvo continua valendo. `defaultViewMode` (`:92-95`) também devolve `gestao` para quem não tem `salespeople.role` em `sdr|closer|hybrid` (por exemplo `null` ou `dev`).
**Causa raiz:** estado persistente aceito sem validar contra o papel atual.
**Caminho recomendado:** valide o valor lido contra o papel na montagem e descarte o que não for permitido — o mesmo cuidado da etapa 128. E troque o padrão de `gestao` para o modo compatível com o papel real: hoje, quem não tem `salespeople.role` cai no menu de gestão e recebe 26 itens que não pode abrir.
**Arquivos e objetos a tocar:** `src/components/organisms/AppSidebar.tsx`.
**Não tocar / armadilhas:** a permissão em si está íntegra (o guard nega corretamente) — não mexa no `ProtectedRoute`. Este é um defeito de interface.
**Depende de:** 171 · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** com `localStorage.sidebar_view_mode = 'gestao'` e sessão de vendedor comum, o menu renderiza o modo do vendedor, e o valor inválido é removido.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 173 — Alinhar o rótulo "Administração" com quem realmente pode entrar
**Onda / Severidade / Camada:** 7 / Média / Frontend
**Achados resolvidos:** A-69
**Problema hoje:** `sidebarMenuData.ts:353-372` renderiza `adminOnlyItems` só para `userType === 'admin'`, mas as rotas `/admin/comissoes`, `/admin/premiacoes`, `/admin/premiacoes/auditoria`, `/admin/telemetria`, `/audit-logs`, `/sla-tracking`, `/lead-routing`, `/workflows` e `/webhooks` usam o wrapper `Manager` — admin **ou** gestor (`AppRoutes.tsx:433-555`, `:1012-1019`). Exclusivas de admin de fato são só `/admin`, `/admin/race-arena`, `/usage-analytics`, `/feature-flags` e `/seguranca`.
**Causa raiz:** a intenção de negócio sobre quem mexe em dinheiro está declarada de dois jeitos diferentes.
**Caminho recomendado:** **pergunte ao dono qual é a regra**: gestor pode aprovar e pagar comissão e auditar premiação? A resposta decide a direção. Se pode, os itens saem de `adminOnlyItems` e aparecem para gestor; se não pode, as rotas passam a exigir `admin`. Não escolha por conta: as duas opções são defensáveis e só o dono sabe qual é a dele.
**Arquivos e objetos a tocar:** `sidebarMenuData.ts` **ou** `src/routes/AppRoutes.tsx`, conforme a decisão.
**Não tocar / armadilhas:** não "resolva" mostrando o item e deixando a rota negar — é exatamente o problema de A-67.
**Depende de:** 171 · **Libera:** —
**Risco e como reverter:** se a decisão for restringir, gestores perdem acesso que hoje têm (mesmo sem link). Avise. `git revert`.
**Precisa de aprovação humana antes do merge:** **sim** — define quem pode aprovar pagamento.
**Como verificar:** com sessão de gestor, as nove rotas se comportam conforme a decisão, e o menu reflete o mesmo.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 174 — Dar acesso à administração no celular
**Onda / Severidade / Camada:** 7 / Alta / Frontend
**Achados resolvidos:** A-70
**Problema hoje:** `AppSidebar.tsx:287-301` renderiza o bloco "Administração" com 14 itens (`/admin`, `/seguranca`, `/feature-flags`, `/usage-analytics`, `/audit-logs`, `/admin/comissoes`, `/admin/premiacoes[/auditoria]`, `/admin/telemetria`, `/webhooks`, `/sla-tracking`, `/lead-routing`, `/workflows`, `/admin/race-arena`). O menu móvel (`MobileDrawer.tsx:195-240`) renderiza apenas `mainItems`, `groupedItems`, Notificações, Configurações e Sair — **não importa nem renderiza `adminOnlyItems`**.
**Causa raiz:** o menu móvel foi escrito com a lista de itens comuns e não acompanhou o bloco de administração.
**Caminho recomendado:** importe `adminOnlyItems` no `MobileDrawer` e renderize sob a mesma condição de papel do desktop (depois de 171, com o filtro por papel já centralizado). Com 14 itens, considere um grupo colapsado para não tomar a tela.
**Arquivos e objetos a tocar:** `src/components/layout/MobileDrawer.tsx`.
**Não tocar / armadilhas:** o menu móvel tem 265 linhas e lógica própria de fechamento ao navegar — reaproveite o que está lá, não traga o componente do desktop.
**Depende de:** 171 · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** em viewport de celular, com sessão de admin, o bloco Administração aparece e os itens navegam.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 175 — Pedir confirmação antes de excluir chave de funcionalidade
**Onda / Severidade / Camada:** 7 / Alta / Frontend
**Achados resolvidos:** A-09
**Problema hoje:** `src/pages/FeatureFlagsAdmin.tsx:256-266`: `onClick={() => deleteFlag.mutate(flag.id, {...})}` — sem `AlertDialog`, sem `confirm`, sem desfazer. EXECUTADO: `grep -c AlertDialog` na página = **0**. Um toque remove a chave que liga ou desliga funcionalidade em produção para todos.
**Causa raiz:** ação destrutiva tratada como ação comum.
**Caminho recomendado:** use o `AlertDialog` do repositório (`src/components/ui/alert-dialog.tsx`), com o nome da chave no texto da confirmação — confirmação genérica ("tem certeza?") não evita o erro de clicar na linha errada. Se a tela permitir desativar em vez de excluir, ofereça isso como ação primária: desativar é reversível, excluir não.
**Arquivos e objetos a tocar:** `src/pages/FeatureFlagsAdmin.tsx`.
**Não tocar / armadilhas:** a etapa 125 trata o estado de erro no mesmo arquivo — faça em sequência.
**Depende de:** 125 · **Libera:** 176
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** clicar em excluir abre a confirmação com o nome da chave; cancelar não remove nada.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 176 — Corrigir os dois botões destrutivos da auditoria de premiações
**Onda / Severidade / Camada:** 7 / Alta / Frontend
**Achados resolvidos:** A-09
**Problema hoje:** `src/pages/AdminAuditoriaPremiacoes.tsx:579-590`: cancelar a premiação (`updateStatus.mutate({ status: 'cancelled' })`) é botão só de ícone, **sem rótulo acessível e sem confirmação**. Ao lado, `:591-602`, a **exclusão definitiva** (`remove.mutate(a.id)`) usa `confirm()` nativo e o ícone `<CheckCircle2 className="h-3.5 w-3.5 rotate-45" />` — um "check" girado 45° fazendo as vezes de "X", também sem `aria-label`.
**Causa raiz:** ícones reaproveitados por semelhança visual e confirmação inconsistente entre ações vizinhas.
**Caminho recomendado:** três correções no mesmo lugar: (1) ícone correto para excluir (`X`/`Trash`, não um check girado); (2) `aria-label` nos dois botões; (3) `AlertDialog` nas duas ações, com o nome do vendedor e o valor do prêmio no texto. São dois botões vizinhos, sem rótulo, num registro de bônus — a chance de errar é alta e o efeito é irreversível.
**Arquivos e objetos a tocar:** `src/pages/AdminAuditoriaPremiacoes.tsx`.
**Não tocar / armadilhas:** as etapas 074 (total que soma percentuais) e 124 (estado de erro) tocam o mesmo arquivo — faça as três em sequência, não em paralelo.
**Depende de:** 124, 175 · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** os dois botões têm rótulo acessível, ícones distintos, e ambos pedem confirmação nomeando o registro.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 177 — Varrer as demais ações destrutivas sem confirmação
**Onda / Severidade / Camada:** 7 / Média / Frontend
**Achados resolvidos:** A-09
**Problema hoje:** as duas telas das etapas 175 e 176 foram encontradas por leitura dirigida. A varredura completa de ações destrutivas sem confirmação não foi feita.
**Causa raiz:** — (etapa de levantamento)
**Caminho recomendado:** varra `src/` por `.mutate(` ligado a exclusão (`delete`, `remove`, `cancel`) e classifique: tem `AlertDialog`? tem `confirm()`? tem desfazer? Entregue a lista com prioridade (dinheiro, dado de cliente, configuração de produção) e abra etapas só para o que importa. Padronize em `AlertDialog`: `confirm()` nativo não é acessível e não permite nomear o registro com formatação.
**Arquivos e objetos a tocar:** um documento em `docs/`.
**Não tocar / armadilhas:** não troque todo `confirm()` por `AlertDialog` em massa: em ação reversível e de baixo impacto, a confirmação extra irrita e leva o usuário a clicar sem ler.
**Depende de:** 176 · **Libera:** —
**Risco e como reverter:** nenhum (documento).
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** o documento lista as ações destrutivas com o tipo de confirmação atual e a prioridade.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 178 — Corrigir a rota de assinatura digital no menu do Closer
**Onda / Severidade / Camada:** 7 / Baixa / Frontend
**Achados resolvidos:** A-83
**Problema hoje:** `src/hooks/useDigitalSignatures.ts:123-126` faz `sendForSignature` **sempre lançar** erro, e a página é honesta: mostra "Envio e assinatura eletrônica desativados" (`AssinaturaDigital.tsx:269-277`) e deixa os botões desabilitados com rótulo acessível (`:425-447`). O defeito é de camada: a rota está no menu do **Closer** (`sidebarMenuData.ts:176`) e exige gestor (`AppRoutes.tsx:407-414`).
**Causa raiz:** funcionalidade desativada de propósito, com o item de menu publicado para o papel errado.
**Caminho recomendado:** com o filtro de papel da etapa 171 no lugar, o item deixa de aparecer para o Closer automaticamente. O que resta é decidir com o dono se a funcionalidade volta (e então o esboço de `useDigitalSignatures` vira projeto) ou se o item sai do menu de vez. Por ora, deixar a página acessível a gestor com o aviso honesto é aceitável — é o raro caso em que "incompleto" está bem comunicado.
**Arquivos e objetos a tocar:** `sidebarMenuData.ts` (ou nada, se 171 resolver).
**Não tocar / armadilhas:** não "conserte" fazendo `sendForSignature` falhar em silêncio: o lançamento explícito é o que mantém a tela honesta.
**Depende de:** 171 · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** como Closer, o item não aparece; como gestor, a página abre com o aviso e os botões desabilitados.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 179 — Unificar as duas listas de pré-carregamento de rota
**Onda / Severidade / Camada:** 7 / Baixa / Frontend
**Achados resolvidos:** A-84
**Problema hoje:** `src/routes/pagePrefetchMap.ts` (26 entradas, usado por `AppSidebar`) e `src/components/navigation/NavLink.tsx:12-50` (36 entradas) fazem a mesma coisa, mantidas à mão. Hoje ambas estão corretas; divergem na próxima rota nova.
**Causa raiz:** duas listas manuais para o mesmo fim.
**Caminho recomendado:** mantenha uma: a de `pagePrefetchMap.ts` é a mais natural (fica junto do roteador) e tem o consumidor principal. Faça `NavLink` consumir dela e remova a lista interna. Melhor ainda, se `lazyPages.ts` já mapeia rota → import, derive o pré-carregamento de lá e elimine as duas listas manuais.
**Arquivos e objetos a tocar:** `src/routes/pagePrefetchMap.ts`; `src/components/navigation/NavLink.tsx`.
**Não tocar / armadilhas:** pré-carregamento errado não quebra nada visível — ele só deixa de acelerar. Por isso a divergência passa despercebida, e por isso derivar da fonte é melhor que sincronizar à mão.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** navegar entre rotas continua rápido, e existe uma única lista no repositório (busca por `prefetch` não encontra a segunda).
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 180 — Remover o componente órfão e o módulo usado só por teste
**Onda / Severidade / Camada:** 7 / Baixa / Frontend
**Achados resolvidos:** A-84
**Problema hoje:** EXECUTADO (resolução de todos os imports estáticos e dinâmicos de `src/`): `src/components/ui/level-up-celebration.tsx` (131 linhas) **nunca é importado** — o que roda é `src/components/gamification/LevelUpOverlay.tsx`; e `src/lib/orderTracking/stages.ts` (240 linhas) é importado **só** por teste, sem consumidor em produção.
**Causa raiz:** código substituído sem remoção do antigo.
**Caminho recomendado:** apague `level-up-celebration.tsx`. Para `orderTracking/stages.ts`, confirme antes: a ladder de cobertura exige 100% em `orderTracking/` (`coverage-ladder-baseline.json`), então o módulo pode ter sido escrito para um fluxo que ainda vai existir — pergunte ao dono. Se for para remover, remova também o teste e o piso da ladder, ou o gate quebra.
**Arquivos e objetos a tocar:** `src/components/ui/level-up-celebration.tsx`; eventualmente `src/lib/orderTracking/stages.ts` e `coverage-ladder-baseline.json`.
**Não tocar / armadilhas:** não remova `orderTracking/stages.ts` sem ajustar a ladder: o gate de cobertura vai falhar com piso para um diretório que não existe mais.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** `npm run build` e `npm run test` passam, e a varredura de arquivos não importados devolve zero.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 181 — Fechar o grant de `anon` nas views de telemetria
**Onda / Severidade / Camada:** 7 / Média / Banco
**Achados resolvidos:** A-05
**Problema hoje:** EXECUTADO: `GET /rest/v1/v_platform_slo?select=*&limit=1` com a chave publishable → HTTP 200, `content-range: 0-0/30`. A migration `supabase/migrations/20260711145130_…sql:87-88` declara o oposto: `REVOKE ALL ON public.v_platform_slo FROM PUBLIC;` + `GRANT SELECT … TO service_role;`. As 30 linhas vêm do `generate_series` com agregados nulos (a view é `security_invoker = true`), então hoje não vaza número de negócio — vaza a estrutura do painel de SLO. Outras 14 views respondem 200 com 0 linhas, pela mesma causa (`scratchpad/qa/anon-views.txt`).
**Causa raiz:** `REVOKE … FROM PUBLIC` não revoga de `anon` (são coisas diferentes), e o Supabase concede por *default privileges*.
**Caminho recomendado:** `REVOKE ALL ON public.v_platform_slo FROM anon;` e o mesmo para as outras 14 views que respondem ao papel anônimo. É a mesma correção das etapas 025–028, aplicada a views — e deve entrar no teste da etapa 029, que hoje olha tabelas.
**Arquivos e objetos a tocar:** nova migration; ampliar o teste de 029 para views.
**Não tocar / armadilhas:** as views com `security_invoker = true` já respeitam a RLS das tabelas-base — o revoke é a segunda tranca, não a primeira. Não as transforme em `SECURITY DEFINER` para "resolver": isso faria o oposto.
**Depende de:** 010, 029 · **Libera:** —
**Risco e como reverter:** se alguma view pública legítima estiver na lista (ex.: `salespeople_public`), revogar quebra a tela que a usa. Confira os consumidores antes.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** `GET /rest/v1/v_platform_slo` com a chave publishable → **401/42501** (hoje 200 com 30 linhas).
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 182 — Igualar a defesa das tabelas de negação explícita
**Onda / Severidade / Camada:** 7 / Baixa / Banco
**Achados resolvidos:** A-45
**Problema hoje:** `daily_challenge_rotations` (`supabase/schema.sql:32611`) e `_internal_secrets` (`:32192`) mantêm grant para `anon` e dependem **só** da policy `USING (false)`; `geocode_cache` (`:32868`) teve o grant revogado e depende de grant **e** RLS. EXECUTADO: as duas primeiras respondem HTTP 200 com `[]`; `geocode_cache` responde 401/42501.
**Causa raiz:** a correção de grant foi aplicada a uma das três tabelas equivalentes.
**Caminho recomendado:** a etapa 027 já cobre `_internal_secrets` e `daily_challenge_rotations`. Esta etapa é a conferência final: depois de 027, confirme que as três se comportam igual e registre o padrão (negar por policy **e** por grant) em `docs/SCHEMA_CONVENTIONS.md`, para a próxima tabela de uso exclusivo de serviço nascer assim.
**Arquivos e objetos a tocar:** `docs/SCHEMA_CONVENTIONS.md`.
**Não tocar / armadilhas:** não remova as policies `USING (false)` ao acrescentar o revoke — as duas camadas juntas são o objetivo.
**Depende de:** 027 · **Libera:** —
**Risco e como reverter:** nenhum (documentação).
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** as três tabelas respondem 401/42501 ao papel anônimo, e a convenção está registrada.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 183 — Corrigir o remetente da escalação de alerta
**Onda / Severidade / Camada:** 7 / Média / Integrações
**Achados resolvidos:** A-107
**Problema hoje:** `supabase/functions/_shared/alert-escalation.ts:33`: `return Deno.env.get("ALERT_FROM_EMAIL") ?? "Alertas <onboarding@resend.dev>";`. O comentário do próprio arquivo (`:11-14`) reconhece que esse remetente **só** funciona para envio ao e-mail da própria conta do provedor. E a tela (`src/pages/Notificacoes.tsx:376`) anuncia a escalação como "Ativo".
**Causa raiz:** valor de reserva de ambiente de testes deixado como padrão de produção.
**Caminho recomendado:** configure `ALERT_FROM_EMAIL` com um remetente do domínio da empresa (depende de 034, que decide o destino da camada de e-mail) e **remova o valor de reserva**: sem a variável, a função deve falhar explicitamente, não enviar de um remetente que não entrega. Corrija também o texto da tela para refletir o estado real.
**Arquivos e objetos a tocar:** `supabase/functions/_shared/alert-escalation.ts`; `src/pages/Notificacoes.tsx`; configuração de segredo.
**Não tocar / armadilhas:** remover o valor de reserva faz a função falhar onde antes "funcionava" silenciosamente — é o objetivo, mas combine com 034 para não gerar ruído.
**Depende de:** 034 · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** **sim** — configuração de produção.
**Como verificar:** com a variável configurada, um alerta de teste chega a um endereço externo; sem ela, a função registra erro em vez de enviar.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 184 — Dar reenvio ao webhook genérico de saída
**Onda / Severidade / Camada:** 7 / Média / Integrações
**Achados resolvidos:** A-108
**Problema hoje:** `supabase/functions/dispatch-webhook/index.ts:166-257`: uma tentativa por destino; a falha gera linha em `webhook_deliveries` (`:221-230`) e incrementa `failure_count` (`:232-246`), e **nada reenvia** — o único escritor é a própria função (`:254`) e o único leitor é `src/hooks/useWebhooks.ts`.
**Causa raiz:** entrega única, sem fila de reprocessamento.
**Caminho recomendado:** o repositório já tem o desenho certo no outro subsistema: `notify-v4-quote-status` usa `attempts`, `next_retry_at` e `MAX_ATTEMPTS` com recuo (`index.ts:11,119-127`). Copie esse modelo para `webhook_deliveries` e crie o cron que processa a fila. Faça **depois** de 092 (assinatura HMAC), para não reenviar entregas com a assinatura errada.
**Arquivos e objetos a tocar:** `supabase/functions/dispatch-webhook/index.ts`; migration (colunas de controle); um cron.
**Não tocar / armadilhas:** reenvio sem limite é amplificação: respeite `MAX_ATTEMPTS` e o `Retry-After` da etapa 097.
**Depende de:** 092, 097 · **Libera:** 185
**Risco e como reverter:** reenvio mal calibrado inunda o parceiro. Comece com limite baixo. Reverter por migration + `git revert`.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção e novo cron.
**Como verificar:** derrubar o destino de teste, disparar o webhook → a entrega falha, é reagendada e, com o destino de volta, é entregue sem intervenção.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 185 — Incluir timestamp na assinatura dos webhooks de saída
**Onda / Severidade / Camada:** 7 / Média / Integrações
**Achados resolvidos:** A-108
**Problema hoje:** a assinatura de `dispatch-webhook` (`index.ts:42-54`, `hmacSign(secret, body)`) não leva timestamp, então um pedido capturado pode ser reexecutado pelo receptor sem detecção.
**Causa raiz:** assinatura sobre o corpo apenas.
**Caminho recomendado:** inclua o carimbo de tempo no material assinado e envie-o em cabeçalho próprio, como o padrão de mercado faz — e como `_shared/webhook-auth.ts` já **verifica** no lado de entrada para Resend e SendGrid (`:389-412`). Simetria: o repositório já exige isso de quem lhe envia; deve oferecer o mesmo a quem recebe dele.
**Arquivos e objetos a tocar:** `supabase/functions/dispatch-webhook/index.ts` e `winloss-webhook-dispatcher` (se 092 já tiver unificado a assinatura).
**Não tocar / armadilhas:** documente o formato para os receptores: mudar assinatura sem avisar quebra quem valida.
**Depende de:** 092, 184 · **Libera:** —
**Risco e como reverter:** receptores que validam a assinatura atual param de validar. Avise. `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** o cabeçalho de assinatura muda quando só o timestamp muda, e o receptor de teste valida com a fórmula documentada.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 186 — Corrigir o documento de integrações que descreve outro banco
**Onda / Severidade / Camada:** 7 / Média / Documentação
**Achados resolvidos:** A-115
**Problema hoje:** `docs/estado/13_INTEGRACOES.md:4` declara que foi medido por *"consulta ao banco de produção `rapjswienfhkobhlamxb`"* — que **não é** o banco deste repositório (`usyxfpqlsspldubptrdl`; `AGENTS.md` §7 é explícito: *"Nenhum outro Supabase … é deste repo"*). O veredito central (`:11-13`, "nenhuma integração externa está configurada") é falso hoje: há 32 crons ativos, 551 linhas de log do Bitrix24 e webhooks recebendo tráfego.
**Causa raiz:** documento gerado contra o banco errado e nunca revisado.
**Caminho recomendado:** não corrija número por número: **marque o documento como obsoleto** no topo, com a data e o motivo, e aponte para a fonte viva (`inventario/estado/banco.json` e `edges.json`). Regerar o conteúdo é trabalho de uma sessão com acesso ao banco; declarar que ele não vale é trabalho de cinco minutos e evita que o próximo agente decida com base nele — que é o dano real.
**Arquivos e objetos a tocar:** `docs/estado/13_INTEGRACOES.md`.
**Não tocar / armadilhas:** não apague o documento: o histórico tem valor, e apagar faz o próximo agente procurar a informação que já existia.
**Depende de:** — · **Libera:** 187
**Risco e como reverter:** nenhum.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** o topo do documento diz claramente que está obsoleto, com data e motivo.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 187 — Varrer a documentação de estado por medições feitas fora do banco oficial
**Onda / Severidade / Camada:** 7 / Média / Documentação
**Achados resolvidos:** A-115
**Problema hoje:** `docs/estado/13_INTEGRACOES.md` foi medido em `rapjswienfhkobhlamxb`. Os outros 14 documentos da pasta `docs/estado/` podem ter a mesma origem — e são a referência que agentes leem antes de mexer no sistema.
**Causa raiz:** — (etapa de levantamento)
**Caminho recomendado:** `grep -rn "rapjswienfhkobhlamxb\|saejqkojleeaxzrslzfg" docs/` e marque como obsoleto todo documento medido fora do banco oficial, com data e motivo. Documento que afirma o estado do sistema e foi medido em outro sistema é pior que documento ausente, porque induz decisão errada com aparência de evidência.
**Arquivos e objetos a tocar:** os documentos encontrados em `docs/estado/`.
**Não tocar / armadilhas:** não confunda citação histórica (um documento que **explica** a troca de banco) com medição: `docs/agentes/banco-e-mcp.md` cita o ref antigo de propósito.
**Depende de:** 186 · **Libera:** —
**Risco e como reverter:** nenhum.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** o `grep` não encontra mais documento que **afirme estado atual** com base no banco errado.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 188 — Registrar quais crons da máquina de vendas estão realmente ativos
**Onda / Severidade / Camada:** 7 / Baixa / Banco
**Achados resolvidos:** A-121
**Problema hoje:** `supabase/migrations/20261112224500_fix_agenda_crons_maquina_vendas.sql:110-130` agenda 12 jobs (`sequence-runner-5min`, `process-cadence-tasks-5min`, `process-scheduled-sends-15min`, `check-quote-expiration-daily`, `check-lead-sla-15min`, `sdr-consecutive-alerts-daily`, `activity-goal-alerts-daily`, `challenge-expiration-alerts`, entre outros) e `20261120000000_t15_multichannel_retry.sql` muda o CHECK de `scheduled_sends`. O snapshot é anterior e não os mostra.
**Causa raiz:** — (etapa de verificação)
**Caminho recomendado:** rode `SELECT jobname, schedule, active FROM cron.job ORDER BY jobname;` e compare com a lista da migration; registre o resultado no progresso. Isso fecha uma lacuna declarada da auditoria e é pré-requisito honesto para qualquer etapa que dependa de cron (089, 091, 184).
**Arquivos e objetos a tocar:** `docs/qa/05-PROGRESSO.md`.
**Não tocar / armadilhas:** job existente não significa job funcionando: A-104 mostra que todos aparecem como bem-sucedidos. Verificar existência é o primeiro passo, não o último.
**Depende de:** — · **Libera:** 189
**Risco e como reverter:** nenhum (somente leitura).
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** a comparação entre `cron.job` e a lista da migration anotada no progresso, com os ausentes identificados.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 189 — Reagendar os crons da máquina de vendas que estiverem faltando
**Onda / Severidade / Camada:** 7 / Média / Banco
**Achados resolvidos:** A-121
**Problema hoje:** condicional ao resultado de 188: se algum dos 12 jobs não estiver em `cron.job`, a funcionalidade correspondente (cadência, envio agendado, SLA de lead, alerta de meta) simplesmente não roda — e, por A-104, nada reclama.
**Causa raiz:** migration de agendamento possivelmente não aplicada.
**Caminho recomendado:** reaplique o agendamento **só** dos que faltarem, usando o mesmo bloco da migration de referência (que já tem guarda de existência). Antes, confirme que a edge function correspondente responde — reagendar job que chama função inexistente recria o cenário de A-104.
**Arquivos e objetos a tocar:** nova migration.
**Não tocar / armadilhas:** não recrie todos os 12 por precaução: duplicar agendamento faz a função rodar duas vezes por janela, e várias delas escrevem.
**Depende de:** 188 · **Libera:** —
**Risco e como reverter:** job duplicado gera escrita dobrada. Verifique antes de criar. Reverter por `cron.unschedule`.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção e novos jobs agendados.
**Como verificar:** `SELECT jobname, active FROM cron.job` com os 12 presentes e ativos; e a próxima janela de cada um com execução registrada.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 190 — Padronizar o formato de resposta de erro das funções
**Onda / Severidade / Camada:** 7 / Baixa / Backend
**Achados resolvidos:** A-41
**Problema hoje:** `_shared/http-envelope.ts` existe e é usado por **3 de 171** funções. Convivem ao menos quatro formatos: `{error}`, `{ok:false, error}`, `{error, hint}`, `{code, message}` — o que dificulta o tratamento no front e a correlação de incidente.
**Causa raiz:** helper criado depois da maioria das funções e nunca adotado.
**Caminho recomendado:** não faça uma varredura de 171 arquivos. Adote a regra para **função nova e função tocada**: toda vez que uma etapa deste plano mexer numa função, a resposta de erro passa a usar `http-envelope`. Em seis meses a camada converge sem nenhuma PR dedicada. Registre a regra em `AGENTS.md` ou em `docs/`, que é onde o próximo agente vai ler.
**Arquivos e objetos a tocar:** `docs/` ou `AGENTS.md`.
**Não tocar / armadilhas:** não converta as funções de webhook sem conferir o contrato: o parceiro pode depender do formato atual da resposta de erro.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** nenhum (convenção).
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** a regra registrada, e a próxima função tocada por este plano já usando o helper.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

## Onda 8 — Higiene, CI e observabilidade
> **Sobre os lotes desta onda.** Várias etapas abaixo são lotes do mesmo tipo de correção
> (revogar grant, remover gatilho duplicado, remover índice duplicado). Eles estão separados
> de propósito: cada lote é uma PR pequena, com verificação própria, e um erro fica contido.
> Aplicar tudo de uma vez é o que transforma uma correção de higiene em incidente.

### Etapa 191 — Revogar o grant anônimo — lote de gamificação e corrida
**Onda / Severidade / Camada:** 8 / Média / Banco (grants)
**Achados resolvidos:** A-04
**Problema hoje:** as tabelas de gamificação e corrida (`race_*`, `leagues`, `achievements`, `badges`, `daily_challenges`, `xp_history`, `salesperson_xp`, `available_spins`, `prize_wheel_spins`, `sales_streaks`, `sales_battles`) concedem `SELECT, INSERT, UPDATE, DELETE, REFERENCES, TRIGGER, MAINTAIN` ao papel `anon`, como as outras 400 (ex.: `supabase/schema.sql:32192`, `:32196`, `:32200`). Só a RLS separa a internet do dado.
**Causa raiz:** *default privileges* do Supabase no schema `public`; `REVOKE … FROM PUBLIC` não desfaz, porque `PUBLIC` ≠ `anon`.
**Caminho recomendado:** gere a lista do lote com a consulta da etapa 028, confira que nenhuma das tabelas é lida por rota pública, e aplique `REVOKE ALL ON TABLE public.<t> FROM anon;` seguindo `supabase/migrations/20261117060000_revoke_grants_tabelas_webhook.sql:30`. **Mantenha os grants de `authenticated`** — sem eles as policies de usuário logado param de funcionar, e a própria migration de referência explica isso.
**Arquivos e objetos a tocar:** uma migration para o lote.
**Não tocar / armadilhas:** não inclua `error_logs` (INSERT anônimo intencional e escopado, `supabase/schema.sql:28374`). Não revogue de `authenticated` nem de `service_role`. As quatro rotas públicas são `/auth`, `/reset-password`, `/embed/report/:token` e `/race-arena/spectator/:seasonId` — confira se alguma lê tabela deste lote (a do espectador lê `race_spectator_view`, que é view, mas depende das tabelas-base).
**Depende de:** 025, 028 · **Libera:** 029
**Risco e como reverter:** se uma tela pública depender de leitura anônima do lote, ela passa a receber 42501 em vez de lista vazia. Reverter é `GRANT SELECT … TO anon` por migration.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** para três tabelas amostradas do lote, `curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL/rest/v1/<t>?select=id&limit=1" -H "apikey: <PUBLISHABLE_KEY>"` → **401** com `42501`; e um passo pela aplicação com usuário logado nas telas desse domínio, sem erro novo.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 192 — Revogar o grant anônimo — lote de cadências e sequências
**Onda / Severidade / Camada:** 8 / Média / Banco (grants)
**Achados resolvidos:** A-04
**Problema hoje:** as tabelas de cadências e sequências (`cadences`, `cadence_*`, `sequences`, `sequence_*`, `scheduled_sends`, `follow_up_*`) concedem `SELECT, INSERT, UPDATE, DELETE, REFERENCES, TRIGGER, MAINTAIN` ao papel `anon`, como as outras 400 (ex.: `supabase/schema.sql:32192`, `:32196`, `:32200`). Só a RLS separa a internet do dado.
**Causa raiz:** *default privileges* do Supabase no schema `public`; `REVOKE … FROM PUBLIC` não desfaz, porque `PUBLIC` ≠ `anon`.
**Caminho recomendado:** gere a lista do lote com a consulta da etapa 028, confira que nenhuma das tabelas é lida por rota pública, e aplique `REVOKE ALL ON TABLE public.<t> FROM anon;` seguindo `supabase/migrations/20261117060000_revoke_grants_tabelas_webhook.sql:30`. **Mantenha os grants de `authenticated`** — sem eles as policies de usuário logado param de funcionar, e a própria migration de referência explica isso.
**Arquivos e objetos a tocar:** uma migration para o lote.
**Não tocar / armadilhas:** não inclua `error_logs` (INSERT anônimo intencional e escopado, `supabase/schema.sql:28374`). Não revogue de `authenticated` nem de `service_role`. As quatro rotas públicas são `/auth`, `/reset-password`, `/embed/report/:token` e `/race-arena/spectator/:seasonId` — confira se alguma lê tabela deste lote (a do espectador lê `race_spectator_view`, que é view, mas depende das tabelas-base).
**Depende de:** 025, 028 · **Libera:** —
**Risco e como reverter:** se uma tela pública depender de leitura anônima do lote, ela passa a receber 42501 em vez de lista vazia. Reverter é `GRANT SELECT … TO anon` por migration.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** para três tabelas amostradas do lote, `curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL/rest/v1/<t>?select=id&limit=1" -H "apikey: <PUBLISHABLE_KEY>"` → **401** com `42501`; e um passo pela aplicação com usuário logado nas telas desse domínio, sem erro novo.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 193 — Revogar o grant anônimo — lote de relatórios e BI
**Onda / Severidade / Camada:** 8 / Média / Banco (grants)
**Achados resolvidos:** A-04
**Problema hoje:** as tabelas de relatórios e BI (`custom_reports`, `report_*`, `forecast_*`, `deal_probability_scores`, `deal_health_history`, `cohort_*`, `web_vitals_samples`) concedem `SELECT, INSERT, UPDATE, DELETE, REFERENCES, TRIGGER, MAINTAIN` ao papel `anon`, como as outras 400 (ex.: `supabase/schema.sql:32192`, `:32196`, `:32200`). Só a RLS separa a internet do dado.
**Causa raiz:** *default privileges* do Supabase no schema `public`; `REVOKE … FROM PUBLIC` não desfaz, porque `PUBLIC` ≠ `anon`.
**Caminho recomendado:** gere a lista do lote com a consulta da etapa 028, confira que nenhuma das tabelas é lida por rota pública, e aplique `REVOKE ALL ON TABLE public.<t> FROM anon;` seguindo `supabase/migrations/20261117060000_revoke_grants_tabelas_webhook.sql:30`. **Mantenha os grants de `authenticated`** — sem eles as policies de usuário logado param de funcionar, e a própria migration de referência explica isso.
**Arquivos e objetos a tocar:** uma migration para o lote.
**Não tocar / armadilhas:** não inclua `error_logs` (INSERT anônimo intencional e escopado, `supabase/schema.sql:28374`). Não revogue de `authenticated` nem de `service_role`. As quatro rotas públicas são `/auth`, `/reset-password`, `/embed/report/:token` e `/race-arena/spectator/:seasonId` — confira se alguma lê tabela deste lote (a do espectador lê `race_spectator_view`, que é view, mas depende das tabelas-base).
**Depende de:** 025, 028 · **Libera:** —
**Risco e como reverter:** se uma tela pública depender de leitura anônima do lote, ela passa a receber 42501 em vez de lista vazia. Reverter é `GRANT SELECT … TO anon` por migration.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** para três tabelas amostradas do lote, `curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL/rest/v1/<t>?select=id&limit=1" -H "apikey: <PUBLISHABLE_KEY>"` → **401** com `42501`; e um passo pela aplicação com usuário logado nas telas desse domínio, sem erro novo.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 194 — Revogar o grant anônimo — lote de coaching e avaliação
**Onda / Severidade / Camada:** 8 / Média / Banco (grants)
**Achados resolvidos:** A-04
**Problema hoje:** as tabelas de coaching e avaliação (`call_*`, `coaching_*`, `skill_assessments`, `salesperson_coaching_aggregates`, `conversation_*`) concedem `SELECT, INSERT, UPDATE, DELETE, REFERENCES, TRIGGER, MAINTAIN` ao papel `anon`, como as outras 400 (ex.: `supabase/schema.sql:32192`, `:32196`, `:32200`). Só a RLS separa a internet do dado.
**Causa raiz:** *default privileges* do Supabase no schema `public`; `REVOKE … FROM PUBLIC` não desfaz, porque `PUBLIC` ≠ `anon`.
**Caminho recomendado:** gere a lista do lote com a consulta da etapa 028, confira que nenhuma das tabelas é lida por rota pública, e aplique `REVOKE ALL ON TABLE public.<t> FROM anon;` seguindo `supabase/migrations/20261117060000_revoke_grants_tabelas_webhook.sql:30`. **Mantenha os grants de `authenticated`** — sem eles as policies de usuário logado param de funcionar, e a própria migration de referência explica isso.
**Arquivos e objetos a tocar:** uma migration para o lote.
**Não tocar / armadilhas:** não inclua `error_logs` (INSERT anônimo intencional e escopado, `supabase/schema.sql:28374`). Não revogue de `authenticated` nem de `service_role`. As quatro rotas públicas são `/auth`, `/reset-password`, `/embed/report/:token` e `/race-arena/spectator/:seasonId` — confira se alguma lê tabela deste lote (a do espectador lê `race_spectator_view`, que é view, mas depende das tabelas-base).
**Depende de:** 025, 028 · **Libera:** —
**Risco e como reverter:** se uma tela pública depender de leitura anônima do lote, ela passa a receber 42501 em vez de lista vazia. Reverter é `GRANT SELECT … TO anon` por migration.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** para três tabelas amostradas do lote, `curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL/rest/v1/<t>?select=id&limit=1" -H "apikey: <PUBLISHABLE_KEY>"` → **401** com `42501`; e um passo pela aplicação com usuário logado nas telas desse domínio, sem erro novo.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 195 — Revogar o grant anônimo — lote de integrações e webhooks
**Onda / Severidade / Camada:** 8 / Média / Banco (grants)
**Achados resolvidos:** A-04
**Problema hoje:** as tabelas de integrações e webhooks (`integration_*`, `webhook_*` (as que ainda têm grant), `bitrix24_*`, `v4_callback_*`, `quote_sync_*`, `channel_credentials`) concedem `SELECT, INSERT, UPDATE, DELETE, REFERENCES, TRIGGER, MAINTAIN` ao papel `anon`, como as outras 400 (ex.: `supabase/schema.sql:32192`, `:32196`, `:32200`). Só a RLS separa a internet do dado.
**Causa raiz:** *default privileges* do Supabase no schema `public`; `REVOKE … FROM PUBLIC` não desfaz, porque `PUBLIC` ≠ `anon`.
**Caminho recomendado:** gere a lista do lote com a consulta da etapa 028, confira que nenhuma das tabelas é lida por rota pública, e aplique `REVOKE ALL ON TABLE public.<t> FROM anon;` seguindo `supabase/migrations/20261117060000_revoke_grants_tabelas_webhook.sql:30`. **Mantenha os grants de `authenticated`** — sem eles as policies de usuário logado param de funcionar, e a própria migration de referência explica isso.
**Arquivos e objetos a tocar:** uma migration para o lote.
**Não tocar / armadilhas:** não inclua `error_logs` (INSERT anônimo intencional e escopado, `supabase/schema.sql:28374`). Não revogue de `authenticated` nem de `service_role`. As quatro rotas públicas são `/auth`, `/reset-password`, `/embed/report/:token` e `/race-arena/spectator/:seasonId` — confira se alguma lê tabela deste lote (a do espectador lê `race_spectator_view`, que é view, mas depende das tabelas-base).
**Depende de:** 025, 028 · **Libera:** —
**Risco e como reverter:** se uma tela pública depender de leitura anônima do lote, ela passa a receber 42501 em vez de lista vazia. Reverter é `GRANT SELECT … TO anon` por migration.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** para três tabelas amostradas do lote, `curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL/rest/v1/<t>?select=id&limit=1" -H "apikey: <PUBLISHABLE_KEY>"` → **401** com `42501`; e um passo pela aplicação com usuário logado nas telas desse domínio, sem erro novo.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 196 — Revogar o grant anônimo — lote de administração e configuração
**Onda / Severidade / Camada:** 8 / Média / Banco (grants)
**Achados resolvidos:** A-04
**Problema hoje:** as tabelas de administração e configuração (`feature_flags`, `app_settings`, `user_app_settings`, `portfolio_settings`, `commission_rules`, `approval_*`, `automation_*`, `workflows`) concedem `SELECT, INSERT, UPDATE, DELETE, REFERENCES, TRIGGER, MAINTAIN` ao papel `anon`, como as outras 400 (ex.: `supabase/schema.sql:32192`, `:32196`, `:32200`). Só a RLS separa a internet do dado.
**Causa raiz:** *default privileges* do Supabase no schema `public`; `REVOKE … FROM PUBLIC` não desfaz, porque `PUBLIC` ≠ `anon`.
**Caminho recomendado:** gere a lista do lote com a consulta da etapa 028, confira que nenhuma das tabelas é lida por rota pública, e aplique `REVOKE ALL ON TABLE public.<t> FROM anon;` seguindo `supabase/migrations/20261117060000_revoke_grants_tabelas_webhook.sql:30`. **Mantenha os grants de `authenticated`** — sem eles as policies de usuário logado param de funcionar, e a própria migration de referência explica isso.
**Arquivos e objetos a tocar:** uma migration para o lote.
**Não tocar / armadilhas:** não inclua `error_logs` (INSERT anônimo intencional e escopado, `supabase/schema.sql:28374`). Não revogue de `authenticated` nem de `service_role`. As quatro rotas públicas são `/auth`, `/reset-password`, `/embed/report/:token` e `/race-arena/spectator/:seasonId` — confira se alguma lê tabela deste lote (a do espectador lê `race_spectator_view`, que é view, mas depende das tabelas-base).
**Depende de:** 025, 028 · **Libera:** —
**Risco e como reverter:** se uma tela pública depender de leitura anônima do lote, ela passa a receber 42501 em vez de lista vazia. Reverter é `GRANT SELECT … TO anon` por migration.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** para três tabelas amostradas do lote, `curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL/rest/v1/<t>?select=id&limit=1" -H "apikey: <PUBLISHABLE_KEY>"` → **401** com `42501`; e um passo pela aplicação com usuário logado nas telas desse domínio, sem erro novo.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 197 — Revogar o grant anônimo — lote de atividades, agenda e notificações
**Onda / Severidade / Camada:** 8 / Média / Banco (grants)
**Achados resolvidos:** A-04
**Problema hoje:** as tabelas de atividades, agenda e notificações (`activities`, `agenda_events`, `tasks`, `notifications`, `chat_messages`, `email_*`) concedem `SELECT, INSERT, UPDATE, DELETE, REFERENCES, TRIGGER, MAINTAIN` ao papel `anon`, como as outras 400 (ex.: `supabase/schema.sql:32192`, `:32196`, `:32200`). Só a RLS separa a internet do dado.
**Causa raiz:** *default privileges* do Supabase no schema `public`; `REVOKE … FROM PUBLIC` não desfaz, porque `PUBLIC` ≠ `anon`.
**Caminho recomendado:** gere a lista do lote com a consulta da etapa 028, confira que nenhuma das tabelas é lida por rota pública, e aplique `REVOKE ALL ON TABLE public.<t> FROM anon;` seguindo `supabase/migrations/20261117060000_revoke_grants_tabelas_webhook.sql:30`. **Mantenha os grants de `authenticated`** — sem eles as policies de usuário logado param de funcionar, e a própria migration de referência explica isso.
**Arquivos e objetos a tocar:** uma migration para o lote.
**Não tocar / armadilhas:** não inclua `error_logs` (INSERT anônimo intencional e escopado, `supabase/schema.sql:28374`). Não revogue de `authenticated` nem de `service_role`. As quatro rotas públicas são `/auth`, `/reset-password`, `/embed/report/:token` e `/race-arena/spectator/:seasonId` — confira se alguma lê tabela deste lote (a do espectador lê `race_spectator_view`, que é view, mas depende das tabelas-base).
**Depende de:** 025, 028 · **Libera:** —
**Risco e como reverter:** se uma tela pública depender de leitura anônima do lote, ela passa a receber 42501 em vez de lista vazia. Reverter é `GRANT SELECT … TO anon` por migration.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** para três tabelas amostradas do lote, `curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL/rest/v1/<t>?select=id&limit=1" -H "apikey: <PUBLISHABLE_KEY>"` → **401** com `42501`; e um passo pela aplicação com usuário logado nas telas desse domínio, sem erro novo.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 198 — Revogar o grant anônimo — lote de as tabelas restantes
**Onda / Severidade / Camada:** 8 / Média / Banco (grants)
**Achados resolvidos:** A-04
**Problema hoje:** as tabelas de as tabelas restantes (todas as que sobrarem na consulta de verificação) concedem `SELECT, INSERT, UPDATE, DELETE, REFERENCES, TRIGGER, MAINTAIN` ao papel `anon`, como as outras 400 (ex.: `supabase/schema.sql:32192`, `:32196`, `:32200`). Só a RLS separa a internet do dado.
**Causa raiz:** *default privileges* do Supabase no schema `public`; `REVOKE … FROM PUBLIC` não desfaz, porque `PUBLIC` ≠ `anon`.
**Caminho recomendado:** gere a lista do lote com a consulta da etapa 028, confira que nenhuma das tabelas é lida por rota pública, e aplique `REVOKE ALL ON TABLE public.<t> FROM anon;` seguindo `supabase/migrations/20261117060000_revoke_grants_tabelas_webhook.sql:30`. **Mantenha os grants de `authenticated`** — sem eles as policies de usuário logado param de funcionar, e a própria migration de referência explica isso.
**Arquivos e objetos a tocar:** uma migration para o lote.
**Não tocar / armadilhas:** não inclua `error_logs` (INSERT anônimo intencional e escopado, `supabase/schema.sql:28374`). Não revogue de `authenticated` nem de `service_role`. As quatro rotas públicas são `/auth`, `/reset-password`, `/embed/report/:token` e `/race-arena/spectator/:seasonId` — confira se alguma lê tabela deste lote (a do espectador lê `race_spectator_view`, que é view, mas depende das tabelas-base).
**Depende de:** 025, 028 · **Libera:** —
**Risco e como reverter:** se uma tela pública depender de leitura anônima do lote, ela passa a receber 42501 em vez de lista vazia. Reverter é `GRANT SELECT … TO anon` por migration.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** para três tabelas amostradas do lote, `curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL/rest/v1/<t>?select=id&limit=1" -H "apikey: <PUBLISHABLE_KEY>"` → **401** com `42501`; e um passo pela aplicação com usuário logado nas telas desse domínio, sem erro novo.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 199 — Remover gatilhos duplicados de `updated_at` — as 25 tabelas de maior volume de escrita
**Onda / Severidade / Camada:** 8 / Média / Banco
**Achados resolvidos:** A-53
**Problema hoje:** **111 tabelas carregam dois gatilhos idênticos** de `updated_at` (dos 386 do schema de produção): a mesma função roda duas vezes em cada atualização de linha.
**Causa raiz:** o gatilho foi criado por duas migrations diferentes, com nomes diferentes, e nenhuma removeu a anterior.
**Caminho recomendado:** confirme a lista no banco vivo (`SELECT tgrelid::regclass AS tabela, tgname FROM pg_trigger WHERE NOT tgisinternal AND tgname ILIKE '%updated_at%' ORDER BY 1;`), identifique o par por tabela e apague **um** de cada par neste lote. Comece pelas tabelas mais escritas (`sales`, `activities`, `notifications`, `commissions`), onde o ganho é real e mensurável.
**Arquivos e objetos a tocar:** uma migration para o lote.
**Não tocar / armadilhas:** antes de apagar, confirme que os dois gatilhos são **de fato** idênticos (mesma função, mesmo evento, mesmo `WHEN`): um deles pode ter condição diferente. Não apague o gatilho de `updated_at` inteiro — a coluna precisa continuar sendo atualizada (`AGENTS.md` §7 a exige).
**Depende de:** 010 · **Libera:** 200
**Risco e como reverter:** apagar o gatilho errado para de atualizar `updated_at`, o que afeta cache, ordenação e as comparações de recência (A-88 mostra o custo disso). Reverter por migration recriando.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** para duas tabelas do lote: `UPDATE` de uma linha → `updated_at` muda; e `SELECT count(*) FROM pg_trigger WHERE tgrelid='public.<t>'::regclass AND tgname ILIKE '%updated_at%' AND NOT tgisinternal;` → **1**.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 200 — Remover gatilhos duplicados de `updated_at` — as 30 seguintes
**Onda / Severidade / Camada:** 8 / Média / Banco
**Achados resolvidos:** A-53
**Problema hoje:** **111 tabelas carregam dois gatilhos idênticos** de `updated_at` (dos 386 do schema de produção): a mesma função roda duas vezes em cada atualização de linha.
**Causa raiz:** o gatilho foi criado por duas migrations diferentes, com nomes diferentes, e nenhuma removeu a anterior.
**Caminho recomendado:** confirme a lista no banco vivo (`SELECT tgrelid::regclass AS tabela, tgname FROM pg_trigger WHERE NOT tgisinternal AND tgname ILIKE '%updated_at%' ORDER BY 1;`), identifique o par por tabela e apague **um** de cada par neste lote. Siga a ordem de volume de escrita; o ganho por tabela cai conforme a lista avança.
**Arquivos e objetos a tocar:** uma migration para o lote.
**Não tocar / armadilhas:** antes de apagar, confirme que os dois gatilhos são **de fato** idênticos (mesma função, mesmo evento, mesmo `WHEN`): um deles pode ter condição diferente. Não apague o gatilho de `updated_at` inteiro — a coluna precisa continuar sendo atualizada (`AGENTS.md` §7 a exige).
**Depende de:** 010, 086 · **Libera:** —
**Risco e como reverter:** apagar o gatilho errado para de atualizar `updated_at`, o que afeta cache, ordenação e as comparações de recência (A-88 mostra o custo disso). Reverter por migration recriando.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** para duas tabelas do lote: `UPDATE` de uma linha → `updated_at` muda; e `SELECT count(*) FROM pg_trigger WHERE tgrelid='public.<t>'::regclass AND tgname ILIKE '%updated_at%' AND NOT tgisinternal;` → **1**.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 201 — Remover gatilhos duplicados de `updated_at` — as 30 seguintes
**Onda / Severidade / Camada:** 8 / Média / Banco
**Achados resolvidos:** A-53
**Problema hoje:** **111 tabelas carregam dois gatilhos idênticos** de `updated_at` (dos 386 do schema de produção): a mesma função roda duas vezes em cada atualização de linha.
**Causa raiz:** o gatilho foi criado por duas migrations diferentes, com nomes diferentes, e nenhuma removeu a anterior.
**Caminho recomendado:** confirme a lista no banco vivo (`SELECT tgrelid::regclass AS tabela, tgname FROM pg_trigger WHERE NOT tgisinternal AND tgname ILIKE '%updated_at%' ORDER BY 1;`), identifique o par por tabela e apague **um** de cada par neste lote. Siga a ordem de volume de escrita; o ganho por tabela cai conforme a lista avança.
**Arquivos e objetos a tocar:** uma migration para o lote.
**Não tocar / armadilhas:** antes de apagar, confirme que os dois gatilhos são **de fato** idênticos (mesma função, mesmo evento, mesmo `WHEN`): um deles pode ter condição diferente. Não apague o gatilho de `updated_at` inteiro — a coluna precisa continuar sendo atualizada (`AGENTS.md` §7 a exige).
**Depende de:** 010, 086 · **Libera:** —
**Risco e como reverter:** apagar o gatilho errado para de atualizar `updated_at`, o que afeta cache, ordenação e as comparações de recência (A-88 mostra o custo disso). Reverter por migration recriando.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** para duas tabelas do lote: `UPDATE` de uma linha → `updated_at` muda; e `SELECT count(*) FROM pg_trigger WHERE tgrelid='public.<t>'::regclass AND tgname ILIKE '%updated_at%' AND NOT tgisinternal;` → **1**.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 202 — Remover gatilhos duplicados de `updated_at` — as restantes
**Onda / Severidade / Camada:** 8 / Média / Banco
**Achados resolvidos:** A-53
**Problema hoje:** **111 tabelas carregam dois gatilhos idênticos** de `updated_at` (dos 386 do schema de produção): a mesma função roda duas vezes em cada atualização de linha.
**Causa raiz:** o gatilho foi criado por duas migrations diferentes, com nomes diferentes, e nenhuma removeu a anterior.
**Caminho recomendado:** confirme a lista no banco vivo (`SELECT tgrelid::regclass AS tabela, tgname FROM pg_trigger WHERE NOT tgisinternal AND tgname ILIKE '%updated_at%' ORDER BY 1;`), identifique o par por tabela e apague **um** de cada par neste lote. Siga a ordem de volume de escrita; o ganho por tabela cai conforme a lista avança.
**Arquivos e objetos a tocar:** uma migration para o lote.
**Não tocar / armadilhas:** antes de apagar, confirme que os dois gatilhos são **de fato** idênticos (mesma função, mesmo evento, mesmo `WHEN`): um deles pode ter condição diferente. Não apague o gatilho de `updated_at` inteiro — a coluna precisa continuar sendo atualizada (`AGENTS.md` §7 a exige).
**Depende de:** 010, 086 · **Libera:** —
**Risco e como reverter:** apagar o gatilho errado para de atualizar `updated_at`, o que afeta cache, ordenação e as comparações de recência (A-88 mostra o custo disso). Reverter por migration recriando.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** para duas tabelas do lote: `UPDATE` de uma linha → `updated_at` muda; e `SELECT count(*) FROM pg_trigger WHERE tgrelid='public.<t>'::regclass AND tgname ILIKE '%updated_at%' AND NOT tgisinternal;` → **1**.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 203 — Remover índices exatamente duplicados — primeiros 5 grupos
**Onda / Severidade / Camada:** 8 / Média / Banco
**Achados resolvidos:** A-52
**Problema hoje:** dos 889 índices do schema de produção, há **14 grupos com definição idêntica** (mesma tabela, mesmas colunas, mesma ordem). Cada duplicata custa escrita em todo `INSERT`/`UPDATE` e ocupa espaço, sem acelerar nenhuma leitura.
**Causa raiz:** índices criados duas vezes por migrations diferentes, com nomes diferentes.
**Caminho recomendado:** confirme os grupos no banco vivo antes de apagar (o schema pode ter mudado): compare `indexdef` normalizado por tabela. Para cada grupo, mantenha o de nome mais descritivo e apague os outros. Use `DROP INDEX` simples — `CONCURRENTLY` falha no gateway transacional (`AGENTS.md` §7).
**Arquivos e objetos a tocar:** uma migration para o lote.
**Não tocar / armadilhas:** não apague índice que sustenta uma restrição `UNIQUE` ou uma chave estrangeira — confira `pg_constraint` antes. Índice parcial com o mesmo conjunto de colunas mas filtro diferente **não** é duplicata.
**Depende de:** 010 · **Libera:** 204
**Risco e como reverter:** índice removido por engano degrada consulta em produção; recriar leva tempo em tabela grande. Reverter por migration com o `CREATE INDEX` original.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** `SELECT count(*) FROM pg_indexes WHERE schemaname='public';` cai exatamente no número removido, e `EXPLAIN` das consultas das tabelas afetadas continua usando índice.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 204 — Remover índices exatamente duplicados — grupos 6 a 10
**Onda / Severidade / Camada:** 8 / Média / Banco
**Achados resolvidos:** A-52
**Problema hoje:** dos 889 índices do schema de produção, há **14 grupos com definição idêntica** (mesma tabela, mesmas colunas, mesma ordem). Cada duplicata custa escrita em todo `INSERT`/`UPDATE` e ocupa espaço, sem acelerar nenhuma leitura.
**Causa raiz:** índices criados duas vezes por migrations diferentes, com nomes diferentes.
**Caminho recomendado:** confirme os grupos no banco vivo antes de apagar (o schema pode ter mudado): compare `indexdef` normalizado por tabela. Para cada grupo, mantenha o de nome mais descritivo e apague os outros. Use `DROP INDEX` simples — `CONCURRENTLY` falha no gateway transacional (`AGENTS.md` §7).
**Arquivos e objetos a tocar:** uma migration para o lote.
**Não tocar / armadilhas:** não apague índice que sustenta uma restrição `UNIQUE` ou uma chave estrangeira — confira `pg_constraint` antes. Índice parcial com o mesmo conjunto de colunas mas filtro diferente **não** é duplicata.
**Depende de:** 010, 085 · **Libera:** —
**Risco e como reverter:** índice removido por engano degrada consulta em produção; recriar leva tempo em tabela grande. Reverter por migration com o `CREATE INDEX` original.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** `SELECT count(*) FROM pg_indexes WHERE schemaname='public';` cai exatamente no número removido, e `EXPLAIN` das consultas das tabelas afetadas continua usando índice.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 205 — Remover índices exatamente duplicados — grupos 11 a 14
**Onda / Severidade / Camada:** 8 / Média / Banco
**Achados resolvidos:** A-52
**Problema hoje:** dos 889 índices do schema de produção, há **14 grupos com definição idêntica** (mesma tabela, mesmas colunas, mesma ordem). Cada duplicata custa escrita em todo `INSERT`/`UPDATE` e ocupa espaço, sem acelerar nenhuma leitura.
**Causa raiz:** índices criados duas vezes por migrations diferentes, com nomes diferentes.
**Caminho recomendado:** confirme os grupos no banco vivo antes de apagar (o schema pode ter mudado): compare `indexdef` normalizado por tabela. Para cada grupo, mantenha o de nome mais descritivo e apague os outros. Use `DROP INDEX` simples — `CONCURRENTLY` falha no gateway transacional (`AGENTS.md` §7).
**Arquivos e objetos a tocar:** uma migration para o lote.
**Não tocar / armadilhas:** não apague índice que sustenta uma restrição `UNIQUE` ou uma chave estrangeira — confira `pg_constraint` antes. Índice parcial com o mesmo conjunto de colunas mas filtro diferente **não** é duplicata.
**Depende de:** 010, 085 · **Libera:** —
**Risco e como reverter:** índice removido por engano degrada consulta em produção; recriar leva tempo em tabela grande. Reverter por migration com o `CREATE INDEX` original.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** `SELECT count(*) FROM pg_indexes WHERE schemaname='public';` cai exatamente no número removido, e `EXPLAIN` das consultas das tabelas afetadas continua usando índice.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 206 — Classificar as 31 tabelas órfãs
**Onda / Severidade / Camada:** 8 / Baixa / Banco
**Achados resolvidos:** A-54
**Problema hoje:** 31 tabelas têm 0 linhas, não são citadas em função ou view do banco e não têm nenhum `.from()` no código: 901.120 bytes, **55 policies** e **15 gatilhos** de manutenção morta. `inventario/estado/README.md` avisa que isso **não** é prova de que podem ser apagadas.
**Causa raiz:** — (etapa de levantamento)
**Caminho recomendado:** para cada uma, registre: quando foi criada, por qual migration, se aparece em documentação como funcionalidade planejada e se o nome sugere uso futuro. Entregue a lista com três categorias — apagar, manter (planejada), investigar — e leve ao dono. Apagar tabela é irreversível; classificar custa uma sessão.
**Arquivos e objetos a tocar:** um documento em `docs/`.
**Não tocar / armadilhas:** `.from(variavel)` não é resolvido pela varredura — uma tabela acessada por nome dinâmico apareceria como órfã. Procure o nome em string no código antes de classificar como "apagar".
**Depende de:** — · **Libera:** 207
**Risco e como reverter:** nenhum (documento).
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** o documento lista as 31 com categoria e justificativa.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 207 — Remover as policies e gatilhos das tabelas órfãs confirmadas
**Onda / Severidade / Camada:** 8 / Baixa / Banco
**Achados resolvidos:** A-54
**Problema hoje:** as 31 tabelas órfãs carregam **55 policies** e **15 gatilhos** que ninguém revisa e que aparecem em toda auditoria de RLS, aumentando o custo de cada revisão.
**Causa raiz:** objetos de manutenção criados junto com tabelas que nunca foram usadas.
**Caminho recomendado:** para as tabelas classificadas como "apagar" em 206, remova primeiro policies e gatilhos — é reversível e reduz o ruído imediatamente, sem tocar em estrutura. A tabela em si fica para 208, com aprovação do dono.
**Arquivos e objetos a tocar:** uma migration.
**Não tocar / armadilhas:** não remova policy de tabela classificada como "planejada": ela nasceu com a policy certa, e remover faria a tabela voltar insegura quando alguém começar a usá-la.
**Depende de:** 206 · **Libera:** 208
**Risco e como reverter:** baixo (tabelas vazias e sem uso). Reverter por migration.
**Precisa de aprovação humana antes do merge:** **sim** — DDL em produção.
**Como verificar:** `SELECT count(*) FROM pg_policies WHERE schemaname='public';` cai no número removido, e as tabelas continuam existindo.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 208 — Remover as tabelas órfãs aprovadas pelo dono
**Onda / Severidade / Camada:** 8 / Baixa / Banco
**Achados resolvidos:** A-54
**Problema hoje:** depois de 206 e 207, as tabelas aprovadas para remoção continuam existindo, vazias.
**Causa raiz:** acúmulo de estrutura não usada.
**Caminho recomendado:** `DROP TABLE` apenas das aprovadas **explicitamente pelo dono**, uma migration por lote pequeno, com o `CREATE TABLE` original anotado na descrição da PR para facilitar a volta. Esta é a única etapa do plano que apaga estrutura: trate com o cuidado correspondente.
**Arquivos e objetos a tocar:** uma migration por lote.
**Não tocar / armadilhas:** confirme de novo a contagem de linhas **no momento da remoção** (`SELECT count(*)`), não confie no snapshot: 15 dias separam a auditoria do executor, e uma tabela "vazia" pode ter começado a receber dado.
**Depende de:** 207 · **Libera:** —
**Risco e como reverter:** irreversível em termos de dado (embora as tabelas estejam vazias). Guarde o DDL de volta na PR.
**Precisa de aprovação humana antes do merge:** **sim** — DDL destrutiva em produção, com aprovação nominal por tabela.
**Como verificar:** `SELECT count(*) FROM information_schema.tables WHERE table_schema='public';` cai no número removido, e a aplicação continua funcionando (passo pelas telas principais).
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 209 — Revisar supressões da regra de dependências — os 10 ganchos que escrevem no banco
**Onda / Severidade / Camada:** 8 / Média / Hooks
**Achados resolvidos:** A-95
**Problema hoje:** 50 ocorrências de `// eslint-disable-next-line react-hooks/exhaustive-deps` com a mesma justificativa genérica ("dependencias intencionais (comportamento pre-existente verificado)"), por exemplo `src/hooks/useSyncedSetting.ts:165` e `src/hooks/race/useRaceReactions.ts:64`. A-88 é exatamente o defeito que a regra pegaria — e estava atrás de uma dessas supressões.
**Causa raiz:** supressão aplicada em lote para o lint passar, sem revisão individual.
**Caminho recomendado:** para cada ocorrência do lote: ou acrescente a dependência (e verifique que não cria laço de renderização), ou **troque a justificativa genérica por uma específica** dizendo qual dependência foi omitida e por quê. Comece pelos ganchos que escrevem: ali uma dependência omitida grava dado errado, como em A-88.
**Arquivos e objetos a tocar:** os ganchos do lote.
**Não tocar / armadilhas:** não remova a supressão sem olhar o efeito: acrescentar uma dependência que muda a cada render cria laço infinito, que é pior que o bug original. Teste a tela depois de cada mudança.
**Depende de:** 140 · **Libera:** 210
**Risco e como reverter:** laço de renderização é o risco real; teste cada gancho. `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** `npm run lint` continua em 0 avisos, e cada supressão restante do lote tem justificativa específica (revisão por leitura do diff).
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 210 — Revisar supressões da regra de dependências — os 15 de leitura de dado de negócio
**Onda / Severidade / Camada:** 8 / Média / Hooks
**Achados resolvidos:** A-95
**Problema hoje:** 50 ocorrências de `// eslint-disable-next-line react-hooks/exhaustive-deps` com a mesma justificativa genérica ("dependencias intencionais (comportamento pre-existente verificado)"), por exemplo `src/hooks/useSyncedSetting.ts:165` e `src/hooks/race/useRaceReactions.ts:64`. A-88 é exatamente o defeito que a regra pegaria — e estava atrás de uma dessas supressões.
**Causa raiz:** supressão aplicada em lote para o lint passar, sem revisão individual.
**Caminho recomendado:** para cada ocorrência do lote: ou acrescente a dependência (e verifique que não cria laço de renderização), ou **troque a justificativa genérica por uma específica** dizendo qual dependência foi omitida e por quê. Este lote é de menor risco; o valor está em tornar as supressões revisáveis.
**Arquivos e objetos a tocar:** os ganchos do lote.
**Não tocar / armadilhas:** não remova a supressão sem olhar o efeito: acrescentar uma dependência que muda a cada render cria laço infinito, que é pior que o bug original. Teste a tela depois de cada mudança.
**Depende de:** 140, 209 · **Libera:** —
**Risco e como reverter:** laço de renderização é o risco real; teste cada gancho. `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** `npm run lint` continua em 0 avisos, e cada supressão restante do lote tem justificativa específica (revisão por leitura do diff).
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 211 — Revisar supressões da regra de dependências — os 15 de interface e gamificação
**Onda / Severidade / Camada:** 8 / Média / Hooks
**Achados resolvidos:** A-95
**Problema hoje:** 50 ocorrências de `// eslint-disable-next-line react-hooks/exhaustive-deps` com a mesma justificativa genérica ("dependencias intencionais (comportamento pre-existente verificado)"), por exemplo `src/hooks/useSyncedSetting.ts:165` e `src/hooks/race/useRaceReactions.ts:64`. A-88 é exatamente o defeito que a regra pegaria — e estava atrás de uma dessas supressões.
**Causa raiz:** supressão aplicada em lote para o lint passar, sem revisão individual.
**Caminho recomendado:** para cada ocorrência do lote: ou acrescente a dependência (e verifique que não cria laço de renderização), ou **troque a justificativa genérica por uma específica** dizendo qual dependência foi omitida e por quê. Este lote é de menor risco; o valor está em tornar as supressões revisáveis.
**Arquivos e objetos a tocar:** os ganchos do lote.
**Não tocar / armadilhas:** não remova a supressão sem olhar o efeito: acrescentar uma dependência que muda a cada render cria laço infinito, que é pior que o bug original. Teste a tela depois de cada mudança.
**Depende de:** 140, 209 · **Libera:** —
**Risco e como reverter:** laço de renderização é o risco real; teste cada gancho. `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** `npm run lint` continua em 0 avisos, e cada supressão restante do lote tem justificativa específica (revisão por leitura do diff).
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 212 — Revisar supressões da regra de dependências — os restantes
**Onda / Severidade / Camada:** 8 / Média / Hooks
**Achados resolvidos:** A-95
**Problema hoje:** 50 ocorrências de `// eslint-disable-next-line react-hooks/exhaustive-deps` com a mesma justificativa genérica ("dependencias intencionais (comportamento pre-existente verificado)"), por exemplo `src/hooks/useSyncedSetting.ts:165` e `src/hooks/race/useRaceReactions.ts:64`. A-88 é exatamente o defeito que a regra pegaria — e estava atrás de uma dessas supressões.
**Causa raiz:** supressão aplicada em lote para o lint passar, sem revisão individual.
**Caminho recomendado:** para cada ocorrência do lote: ou acrescente a dependência (e verifique que não cria laço de renderização), ou **troque a justificativa genérica por uma específica** dizendo qual dependência foi omitida e por quê. Este lote é de menor risco; o valor está em tornar as supressões revisáveis.
**Arquivos e objetos a tocar:** os ganchos do lote.
**Não tocar / armadilhas:** não remova a supressão sem olhar o efeito: acrescentar uma dependência que muda a cada render cria laço infinito, que é pior que o bug original. Teste a tela depois de cada mudança.
**Depende de:** 140, 209 · **Libera:** —
**Risco e como reverter:** laço de renderização é o risco real; teste cada gancho. `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** `npm run lint` continua em 0 avisos, e cada supressão restante do lote tem justificativa específica (revisão por leitura do diff).
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 213 — Escopar as funções que autenticam e descartam — busca semântica e busca visual
**Onda / Severidade / Camada:** 8 / Média / Backend
**Achados resolvidos:** A-31
**Problema hoje:** o padrão `await getUserClient(req);` **sem guardar o resultado** aparece em 13 funções (EXECUTADO, grep por `^\s*await getUserClient\(req\);`). Neste lote: `semantic-search:53`, `visual-search:37`, `semantic-index-entity:96`. as três consultam embeddings e índice semântico. O risco é de consumo e de vazamento de resultado entre escopos: a busca devolve o que o índice tem, e o índice cobre entidades de todos os vendedores.
**Causa raiz:** a chamada de autenticação foi usada como porteiro ("existe alguém logado?") e não como identidade ("quem é, e pode isso?").
**Caminho recomendado:** para cada função: guarde o contexto (`const ctx = await getUserClient(req)`) e **use `ctx.client`** nas leituras, deixando a RLS decidir o escopo; use `service_role` só onde o bypass for necessário e justificado (o helper `getServiceClient(reason)` exige o motivo escrito, `_shared/auth-client.ts:76-80`). Onde a função opera sobre um registro vindo do corpo, valide a propriedade antes — é o mesmo caminho das etapas 012 a 017, e as referências são `collect-race-powerup/index.ts:74-77` e `dialer-queue-builder/index.ts:40-48`.
**Arquivos e objetos a tocar:** as funções do lote: `semantic-search:53`, `visual-search:37`, `semantic-index-entity:96`.
**Não tocar / armadilhas:** não troque todas as escritas para o client do usuário sem pensar: algumas (auditoria, log de execução) precisam de `service_role` legitimamente. E lembre que `verify_jwt = true` não protege nada (A-26): o gate tem de estar no handler.
**Depende de:** 012, 013 · **Libera:** 214
**Risco e como reverter:** escopo mais estreito pode fazer uma tela legítima receber menos dado. Teste as telas que chamam cada função antes de mergear. `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** com os usuários A e B: operação de B sobre registro de A → 403 (ou resultado vazio, se o caminho for leitura por RLS); operação de B sobre registro próprio → funciona.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 214 — Escopar as funções que autenticam e descartam — inteligência preditiva e análise comportamental
**Onda / Severidade / Camada:** 8 / Média / Backend
**Achados resolvidos:** A-31
**Problema hoje:** o padrão `await getUserClient(req);` **sem guardar o resultado** aparece em 13 funções (EXECUTADO, grep por `^\s*await getUserClient\(req\);`). Neste lote: `predictive-intelligence:75`, `behavioral-analysis:58`, `revenue-forecast-ai:54`. as três chamam o gateway de IA sobre dado de negócio e devolvem análise. Sem o chamador guardado, a análise é feita sobre o escopo que o `service_role` alcança — ou seja, todo o sistema.
**Causa raiz:** a chamada de autenticação foi usada como porteiro ("existe alguém logado?") e não como identidade ("quem é, e pode isso?").
**Caminho recomendado:** para cada função: guarde o contexto (`const ctx = await getUserClient(req)`) e **use `ctx.client`** nas leituras, deixando a RLS decidir o escopo; use `service_role` só onde o bypass for necessário e justificado (o helper `getServiceClient(reason)` exige o motivo escrito, `_shared/auth-client.ts:76-80`). Onde a função opera sobre um registro vindo do corpo, valide a propriedade antes — é o mesmo caminho das etapas 012 a 017, e as referências são `collect-race-powerup/index.ts:74-77` e `dialer-queue-builder/index.ts:40-48`.
**Arquivos e objetos a tocar:** as funções do lote: `predictive-intelligence:75`, `behavioral-analysis:58`, `revenue-forecast-ai:54`.
**Não tocar / armadilhas:** não troque todas as escritas para o client do usuário sem pensar: algumas (auditoria, log de execução) precisam de `service_role` legitimamente. E lembre que `verify_jwt = true` não protege nada (A-26): o gate tem de estar no handler.
**Depende de:** 012, 013 · **Libera:** —
**Risco e como reverter:** escopo mais estreito pode fazer uma tela legítima receber menos dado. Teste as telas que chamam cada função antes de mergear. `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** com os usuários A e B: operação de B sobre registro de A → 403 (ou resultado vazio, se o caminho for leitura por RLS); operação de B sobre registro próprio → funciona.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 215 — Escopar as funções que autenticam e descartam — enriquecimento de lead
**Onda / Severidade / Camada:** 8 / Média / Backend
**Achados resolvidos:** A-31
**Problema hoje:** o padrão `await getUserClient(req);` **sem guardar o resultado** aparece em 13 funções (EXECUTADO, grep por `^\s*await getUserClient\(req\);`). Neste lote: `enrich-lead:27`. grava enriquecimento no lead informado no corpo, sem checar de quem é o lead.
**Causa raiz:** a chamada de autenticação foi usada como porteiro ("existe alguém logado?") e não como identidade ("quem é, e pode isso?").
**Caminho recomendado:** para cada função: guarde o contexto (`const ctx = await getUserClient(req)`) e **use `ctx.client`** nas leituras, deixando a RLS decidir o escopo; use `service_role` só onde o bypass for necessário e justificado (o helper `getServiceClient(reason)` exige o motivo escrito, `_shared/auth-client.ts:76-80`). Onde a função opera sobre um registro vindo do corpo, valide a propriedade antes — é o mesmo caminho das etapas 012 a 017, e as referências são `collect-race-powerup/index.ts:74-77` e `dialer-queue-builder/index.ts:40-48`.
**Arquivos e objetos a tocar:** as funções do lote: `enrich-lead:27`.
**Não tocar / armadilhas:** não troque todas as escritas para o client do usuário sem pensar: algumas (auditoria, log de execução) precisam de `service_role` legitimamente. E lembre que `verify_jwt = true` não protege nada (A-26): o gate tem de estar no handler.
**Depende de:** 012, 013 · **Libera:** —
**Risco e como reverter:** escopo mais estreito pode fazer uma tela legítima receber menos dado. Teste as telas que chamam cada função antes de mergear. `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** com os usuários A e B: operação de B sobre registro de A → 403 (ou resultado vazio, se o caminho for leitura por RLS); operação de B sobre registro próprio → funciona.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 216 — Escopar as funções que autenticam e descartam — OAuth do Bitrix24 e simulação de carga
**Onda / Severidade / Camada:** 8 / Média / Backend
**Achados resolvidos:** A-31
**Problema hoje:** o padrão `await getUserClient(req);` **sem guardar o resultado** aparece em 13 funções (EXECUTADO, grep por `^\s*await getUserClient\(req\);`). Neste lote: `bitrix24-oauth:313`, `simulate-load:29`. `bitrix24-oauth` lida com credencial de integração; `simulate-load` gera carga artificial — nenhuma das duas deveria ser alcançável por qualquer usuário autenticado.
**Causa raiz:** a chamada de autenticação foi usada como porteiro ("existe alguém logado?") e não como identidade ("quem é, e pode isso?").
**Caminho recomendado:** para cada função: guarde o contexto (`const ctx = await getUserClient(req)`) e **use `ctx.client`** nas leituras, deixando a RLS decidir o escopo; use `service_role` só onde o bypass for necessário e justificado (o helper `getServiceClient(reason)` exige o motivo escrito, `_shared/auth-client.ts:76-80`). Onde a função opera sobre um registro vindo do corpo, valide a propriedade antes — é o mesmo caminho das etapas 012 a 017, e as referências são `collect-race-powerup/index.ts:74-77` e `dialer-queue-builder/index.ts:40-48`.
**Arquivos e objetos a tocar:** as funções do lote: `bitrix24-oauth:313`, `simulate-load:29`.
**Não tocar / armadilhas:** não troque todas as escritas para o client do usuário sem pensar: algumas (auditoria, log de execução) precisam de `service_role` legitimamente. E lembre que `verify_jwt = true` não protege nada (A-26): o gate tem de estar no handler.
**Depende de:** 012, 013 · **Libera:** —
**Risco e como reverter:** escopo mais estreito pode fazer uma tela legítima receber menos dado. Teste as telas que chamam cada função antes de mergear. `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** com os usuários A e B: operação de B sobre registro de A → 403 (ou resultado vazio, se o caminho for leitura por RLS); operação de B sobre registro próprio → funciona.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 217 — Pôr barreira de identidade antes dos endpoints de IA pagos
**Onda / Severidade / Camada:** 8 / Média / Backend / custo
**Achados resolvidos:** A-37
**Problema hoje:** quatro funções chegam ao gateway de IA **antes** de qualquer identificação, protegidas apenas por limite em memória: `race-commentary/index.ts:58-60` (o comentário admite: *"endpoint de IA consome créditos (função não autentica chamador)"*, LLM em `:111-128`), `qbr-generator/index.ts:15-17` (LLM em `:76`, `:98`), `generate-revenue-forecast/index.ts:63-67` (LLM em `:171`), `summarize-call-recording/index.ts:108-110` (LLM em `:165`). E o próprio `_shared/rate-limit.ts:10-13` registra que o limite é por instância (*"the effective global limit is (instances × limit)"*), com o IP vindo de `x-forwarded-for`, que `:28-32` reconhece como falsificável.
**Causa raiz:** proteção de custo baseada em limite de taxa por instância, em endpoint sem identidade.
**Caminho recomendado:** exija autenticação nas quatro — `getUserClient(req)` com 401 — **antes** da chamada ao gateway. O limite de taxa continua útil, mas como segunda camada e chaveado pelo usuário, não pelo IP. Comece por `race-commentary`, que é a mais barata de testar e a que o comentário já identifica como aberta.
**Arquivos e objetos a tocar:** as quatro funções citadas.
**Não tocar / armadilhas:** `generate-revenue-forecast` usa client anônimo com o cabeçalho do chamador (`:63-67`) — ao exigir JWT, confirme que a tela que a chama envia a sessão. Não remova o limite de taxa ao acrescentar o gate.
**Depende de:** 012 · **Libera:** 218
**Risco e como reverter:** se alguma tela chamar essas funções sem sessão, ela quebra. Confira os chamadores antes (`grep -rn "race-commentary\|qbr-generator" src/`). `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** `POST` só com a chave publishable → **401** nas quatro; com JWT de usuário → 200, e o crédito de IA é consumido apenas aí.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 218 — Medir o consumo de IA antes e depois do fechamento dos endpoints
**Onda / Severidade / Camada:** 8 / Baixa / Observabilidade / custo
**Achados resolvidos:** A-37
**Problema hoje:** a auditoria não mediu o consumo real do gateway de IA, então não há como afirmar que houve abuso — apenas que o caminho está aberto.
**Causa raiz:** — (etapa de medição)
**Caminho recomendado:** registre o consumo do período anterior e do seguinte ao fechamento (etapa 217), pelo painel do provedor ou pela tabela de uso que o repositório tiver (`ai_*` em `banco.json`). Se o consumo cair de forma perceptível, houve abuso e vale avisar o dono; se não mudar, o risco era latente e a etapa 217 continua correta de qualquer forma. Medir depois de fechar é a única forma honesta de responder a essa pergunta.
**Arquivos e objetos a tocar:** `docs/qa/05-PROGRESSO.md`.
**Não tocar / armadilhas:** não conclua abuso por variação pequena: uso de IA tem sazonalidade de operação.
**Depende de:** 217 · **Libera:** —
**Risco e como reverter:** nenhum (medição).
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** os dois números anotados no progresso, com o período de cada um.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 219 — Validar a lista de colunas no `external-db-bridge`
**Onda / Severidade / Camada:** 8 / Média / Backend
**Achados resolvidos:** A-38
**Problema hoje:** o gate é bom (exige `Bearer`, valida o usuário e **exige papel admin/gestor** via RPC, `index.ts:115-156`, com 403) e há allowlist de tabelas (`:82-93`) e de RPCs (`:100-106`, vazia por padrão, decisão correta e documentada). A brecha: `const selectColumns = columns || '*';` (`:208`) e `externalClient.from(table).select(selectColumns, {...})` (`:215`) — `columns` chega do corpo **sem validação**, e a sintaxe de recursos embutidos do PostgREST (`*, outra_tabela(*)`) alcança tabelas relacionadas **fora** da allowlist, porque a allowlist só filtra a tabela raiz.
**Causa raiz:** validação aplicada à tabela e não às colunas.
**Caminho recomendado:** copie o que o mesmo repositório faz certo: `report-embed-public/index.ts:81-98` filtra cada coluna por `SAFE_FIELD` e **nunca** usa `*` — tem até `DEFAULT_VISIBLE_FIELDS` por entidade, com o motivo escrito (`:44-52`). Aplique o mesmo aqui: lista explícita por tabela permitida e recusa de qualquer coluna fora dela.
**Arquivos e objetos a tocar:** `supabase/functions/external-db-bridge/index.ts`.
**Não tocar / armadilhas:** exige papel admin/gestor, então a severidade é média — não é porta aberta na internet. Mas é o caminho para ler tabela fora da allowlist no banco externo, e o padrão correto já existe a dois arquivos de distância.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** consultas legítimas que usavam `*` param de funcionar; confirme os consumidores. `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** `POST` pedindo `columns: "*, outra_tabela(*)"` → recusado; pedindo colunas da lista → funciona.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 220 — Redistribuir o esforço de teste de backend
**Onda / Severidade / Camada:** 8 / Média / Testes
**Achados resolvidos:** A-151
**Problema hoje:** 12 funções concentram 26 arquivos de teste Deno — `winloss-webhook-dispatcher` sozinha tem 11, o segundo maior investimento do repositório — enquanto **134 diretórios de função têm 0 teste**, incluindo todos os de A-27 a A-35. E o subsistema mais testado está desligado na prática, por allowlist vazia (A-119).
**Causa raiz:** o esforço de teste seguiu o subsistema mais recente, não o mais arriscado.
**Caminho recomendado:** não remova os testes existentes. Acrescente, na ordem do risco, **um** teste por função corrigida neste plano: que o gate de autenticação devolve 401 sem credencial e 403 para registro de terceiro. É o teste que faltava para A-27 a A-35 serem pegos, e é curto — a asserção é o código de status. Comece pelas funções das etapas 005, 006, 007, 012 e 013.
**Arquivos e objetos a tocar:** novos arquivos de teste Deno nas funções corrigidas.
**Não tocar / armadilhas:** `npm run ci` **não** inclui `test:deno` (`package.json:58` contra `:42`) — então esses testes só rodam no job `deno-tests`, que não está no gate obrigatório. A etapa 039 resolve isso; sem ela, o teste existe e não protege.
**Depende de:** 039 · **Libera:** 221
**Risco e como reverter:** baixo (teste).
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** `npm run test:deno` com os casos novos → passam; remover o gate de uma das funções faz o teste falhar.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 221 — Incluir os testes de backend no comando de integração contínua local
**Onda / Severidade / Camada:** 8 / Baixa / Testes / CI
**Achados resolvidos:** A-151
**Problema hoje:** `package.json:58` define `ci` como `lint && typecheck && security:secrets && graphify:test && test:coverage && build && check-bundle-budget` — **sem** `test:deno` (`:42`) e sem `test:sql`. Quem roda `npm run ci` antes de abrir PR não exercita os testes de backend nem os de banco.
**Causa raiz:** o comando agregador foi montado antes de os dois conjuntos existirem.
**Caminho recomendado:** acrescente `test:deno` e `test:sql` ao `ci`, nessa ordem, **avisando que exigem credencial** — o `test:sql` precisa de acesso ao banco e o `test:deno` do Deno instalado. Se a dependência de credencial for incômoda, crie `ci:full` com os dois e mantenha o `ci` atual para o caminho sem segredo; o que não serve é o agregador parecer completo sem ser.
**Arquivos e objetos a tocar:** `package.json`.
**Não tocar / armadilhas:** não faça o `ci` falhar por falta de credencial: isso treina a equipe a ignorar o comando. Falha por ausência de dependência deve ser mensagem clara, não erro genérico.
**Depende de:** 220 · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** `npm run ci` (ou `ci:full`) executa os cinco conjuntos e reporta cada um.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 222 — Devolver o teto de complexidade ao valor anterior
**Onda / Severidade / Camada:** 8 / Média / CI
**Achados resolvidos:** A-61
**Problema hoje:** `package.json` → `lint:complexity` usa `--max-warnings 131`; o valor anterior registrado era **126**. Um limite cuja regra declarada é "só desce" foi afrouxado para acomodar código novo.
**Causa raiz:** o teto foi elevado em vez de o código ser simplificado.
**Caminho recomendado:** identifique as cinco ocorrências que empurraram o número (`npm run lint:complexity` lista os arquivos), simplifique as que forem simplificáveis sem reescrita — e **só então** baixe o teto. Se nenhuma for simplificável com diff pequeno, deixe o teto e registre no `docs/TECH_DEBT.md` quais são e por quê: teto honesto com dívida registrada é melhor que teto apertado que ninguém consegue respeitar.
**Arquivos e objetos a tocar:** `package.json`; `docs/TECH_DEBT.md`.
**Não tocar / armadilhas:** não refatore função complexa só para baixar o número — é churn, e o plano proíbe. A regra aqui é simplificar o que é fácil e documentar o resto.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** `npm run lint:complexity` passa com o teto novo, ou o `docs/TECH_DEBT.md` lista as ocorrências que o sustentam.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 223 — Tirar o `continue-on-error` do job de release
**Onda / Severidade / Camada:** 8 / Baixa / CI
**Achados resolvidos:** A-66
**Problema hoje:** `.github/workflows/release-please.yml:24` tem `continue-on-error: true` **no nível do job**: uma falha na automação de release passa sem alarme.
**Causa raiz:** tolerância aplicada ao job inteiro em vez do passo que pode falhar legitimamente.
**Caminho recomendado:** identifique qual passo precisa tolerar falha (provavelmente a criação de PR quando não há nada a liberar) e mova o `continue-on-error` para ele. O job em si deve falhar quando a automação de release falhar — é ela que cria a tag que dispara o deploy (A-55), então uma falha silenciosa aqui tem consequência.
**Arquivos e objetos a tocar:** .github/workflows/release-please.yml`.
**Não tocar / armadilhas:** não remova a tolerância sem identificar o passo: o job pode passar a falhar em toda PR que não gere release.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** alarme falso recorrente treina a equipe a ignorar o CI. Calibre. `git revert`.
**Precisa de aprovação humana antes do merge:** **sim** — altera workflow de CI.
**Como verificar:** uma PR sem mudança versionável → o job conclui sem erro; uma falha real na automação → o job falha.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 224 — Fazer o auto-merge do Dependabot respeitar os checks que importam
**Onda / Severidade / Camada:** 8 / Média / CI
**Achados resolvidos:** A-63
**Problema hoje:** o auto-merge do Dependabot depende do mesmo `CI Gate` de A-17 — ou seja, atualização de dependência pode entrar em produção sem `security-audit`, sem teste de ponta a ponta e sem `migrations-gate`.
**Causa raiz:** o auto-merge herdou a porta estreita do agregador.
**Caminho recomendado:** depois de 039 (que amplia o `needs` do gate), o auto-merge passa a exigir os jobs novos automaticamente — e esta etapa é a conferência. Acrescente explicitamente `security-audit` como exigência para o auto-merge, mesmo que ele continue informativo para PR humana: atualização automática de dependência é exatamente o caso em que a auditoria de vulnerabilidade precisa bloquear.
**Arquivos e objetos a tocar:** `.github/workflows/dependabot-automerge.yml`.
**Não tocar / armadilhas:** não deixe o auto-merge esperar o job `e2e`: ele é inalcançável até a etapa 040 e travaria todas as atualizações.
**Depende de:** 039 · **Libera:** —
**Risco e como reverter:** atualizações passam a demorar mais; é o preço. `git revert`.
**Precisa de aprovação humana antes do merge:** **sim** — altera workflow de CI.
**Como verificar:** abrir uma PR do Dependabot com vulnerabilidade conhecida em dependência de produção → o auto-merge **não** ocorre.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 225 — Rodar a varredura de acessibilidade e registrar a linha de base
**Onda / Severidade / Camada:** 8 / Média / Acessibilidade
**Achados resolvidos:** A-09
**Problema hoje:** a auditoria não conseguiu rodar `npm run a11y:sweep`: ele exige servidor de pré-visualização com sessão autenticada, fora do escopo somente-leitura. O que foi observado por leitura são botões de ação destrutiva **sem rótulo acessível** (`AdminAuditoriaPremiacoes.tsx:579-602`, tratados na etapa 176). A cobertura real de acessibilidade é, portanto, desconhecida.
**Causa raiz:** — (etapa de medição; cobre uma lacuna declarada da auditoria)
**Caminho recomendado:** rode `npm run a11y:report` (modo somente relatório, `A11Y_REPORT_ONLY=1`) com as credenciais de teste e registre a linha de base: quantas violações, de quais tipos, em quais telas. O workflow `a11y-sweep.yml` já existe e roda em PR, então a infraestrutura está pronta — falta o retrato inicial para priorizar. Sem ele, qualquer etapa de acessibilidade é adivinhação.
**Arquivos e objetos a tocar:** `docs/qa/05-PROGRESSO.md` ou um documento em `docs/`.
**Não tocar / armadilhas:** não trate o número como meta imediata: a varredura costuma achar centenas de violações em sistema grande, e a reação natural é desligá-la. O objetivo é priorizar, não zerar.
**Depende de:** — · **Libera:** 226
**Risco e como reverter:** nenhum (relatório).
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** o relatório gerado e a contagem por tipo de violação registrada.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 226 — Corrigir as violações de acessibilidade nos fluxos de dinheiro
**Onda / Severidade / Camada:** 8 / Média / Acessibilidade
**Achados resolvidos:** A-09
**Problema hoje:** condicional ao resultado de 225. Os botões sem rótulo da etapa 176 são a ponta visível; a varredura dirá se o padrão se repete nas telas de comissão, premiação e aprovação.
**Causa raiz:** componentes de ação construídos com ícone sem rótulo.
**Caminho recomendado:** corrija primeiro as telas que decidem dinheiro (comissões, premiações, aprovações) — são as que um usuário com leitor de tela precisa operar com certeza do que está clicando, e são as que a etapa 176 mostrou terem ícones ambíguos. Trate por tela, não por tipo de violação: uma tela acessível vale mais que cem rótulos espalhados.
**Arquivos e objetos a tocar:** os componentes apontados pelo relatório nas telas de dinheiro.
**Não tocar / armadilhas:** não acrescente `aria-label` genérico ("botão"): rótulo que não diz a ação é pior que ausência, porque passa na varredura.
**Depende de:** 176, 225 · **Libera:** 227
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** `npm run a11y:sweep` sem violações nas telas tratadas, e navegação por teclado completa em uma delas.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 227 — Definir o piso de acessibilidade que o CI vai exigir
**Onda / Severidade / Camada:** 8 / Baixa / Acessibilidade / CI
**Achados resolvidos:** A-09
**Problema hoje:** `a11y-sweep.yml` roda em PR, mas sem um piso definido a varredura é informativa — e o número de violações pode crescer sem que ninguém perceba.
**Causa raiz:** ausência de linha de base acordada.
**Caminho recomendado:** com o retrato de 225 e as correções de 226, fixe o número atual como piso (o mesmo mecanismo de ratchet que o repositório já usa para cobertura, `scripts/check-coverage-ratchet.mjs`) e faça o job falhar se piorar. Piso que só desce é o que impede a regressão silenciosa — e, ao contrário do piso de cobertura (A-56), aqui ele começa num valor honesto porque acabou de ser medido.
**Arquivos e objetos a tocar:** `.github/workflows/a11y-sweep.yml`; um arquivo de linha de base.
**Não tocar / armadilhas:** não exija melhoria contínua automática: piso que precisa cair a cada PR trava o trabalho. O compromisso é não piorar.
**Depende de:** 226 · **Libera:** —
**Risco e como reverter:** PRs passam a reprovar por acessibilidade. Avise a equipe. `git revert`.
**Precisa de aprovação humana antes do merge:** **sim** — altera workflow de CI.
**Como verificar:** abrir uma PR que introduz um botão sem rótulo → o job falha apontando a violação nova.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 228 — Unificar as duas tabelas de nível do vendedor
**Onda / Severidade / Camada:** 8 / Média / Regras de negócio
**Achados resolvidos:** A-133
**Problema hoje:** duas tabelas de nível convivem: `src/hooks/gamification/useSalespersonXP.ts:15-36` com `20261027140000_…sql:897-909` de um lado, e `src/lib/gamification.ts:12-33` de outro. O card monta as duas (`src/components/competitive/GamifiedProfile.tsx:32,54`, `src/pages/ArenaCompetitiva.tsx:302`), então o vendedor vê "Nv. 4 Competente" no selo e "Habilhoso" no texto ao lado, no mesmo card.
**Causa raiz:** duas definições de faixa de nível, criadas em momentos diferentes.
**Caminho recomendado:** a fonte deve ser o banco (`20261027140000_…sql:897-909`), porque é ela que decide liga e premiação. Faça `src/lib/gamification.ts` consumir a mesma tabela — ou, se for necessário cálculo no cliente, derive dos mesmos limites, expostos por uma única constante compartilhada. Atalho a evitar: ajustar os rótulos para "parecerem" iguais; as faixas são diferentes, não só os nomes.
**Arquivos e objetos a tocar:** `src/lib/gamification.ts`; `src/hooks/gamification/useSalespersonXP.ts`; os dois componentes.
**Não tocar / armadilhas:** `src/lib/gamification.ts` tem piso de 100% na ladder de cobertura (`coverage-ladder-baseline.json`) — mudanças ali exigem atualizar os testes, e isso é bom: use-os para fixar as faixas.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** o nível exibido muda para parte dos vendedores; se houver premiação por nível, isso é dinheiro. Avise o dono.
**Precisa de aprovação humana antes do merge:** **sim** — pode afetar premiação por nível.
**Como verificar:** para cinco vendedores de XP diferente, o selo e o texto do card mostram o mesmo nível, e ele bate com `SELECT` da função do banco.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 229 — Corrigir o alerta de inventário que marca funções vivas como sem deploy
**Onda / Severidade / Camada:** 8 / Alta / Documentação / infraestrutura
**Achados resolvidos:** A-40
**Problema hoje:** `inventario/estado/banco.json` levanta `edge_sem_deploy` (71 funções) e `edge_limite_do_plano` ("100 publicadas de 100 permitidas"). **As duas afirmações são falsas.** EXECUTADO, duas sondas independentes com `OPTIONS` e controle negativo: as 171 funções estão no ar, 0 ausentes; nomes inventados devolvem 404, validando o método; e `ai-copilot` e `admin-conversion-trail`, listadas como sem deploy, respondem 200/401. A causa está documentada: `inventario/estado/README.md` diz que `publicadas` só é preenchido com token de Management API — sem ele, o gerador registra ausência em vez de "não medido".
**Causa raiz:** o gerador trata dado ausente como dado negativo.
**Caminho recomendado:** corrija `scripts/inventario/gerar-banco.mjs` para registrar `publicadas: null` e **não** levantar os alertas quando a medição não foi possível — é o que o próprio README descreve como comportamento esperado. Enquanto a correção não entrar, acrescente uma nota no topo de `inventario/estado/banco.json`… não: arquivo gerado não se edita à mão. A nota vai no README, dizendo que os dois alertas do snapshot atual são falsos e por quê.
**Arquivos e objetos a tocar:** `scripts/inventario/gerar-banco.mjs`; `inventario/estado/README.md`.
**Não tocar / armadilhas:** não "conserte" o JSON à mão: ele é gerado, e a próxima execução sobrescreve. O defeito é no gerador.
**Depende de:** — · **Libera:** 230
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** rodar o gerador sem token → `publicadas: null` e **nenhum** alerta de deploy; com token → a lista real.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 230 — Alinhar a premissa de limite de edge functions na documentação de agentes
**Onda / Severidade / Camada:** 8 / Média / Documentação
**Achados resolvidos:** A-40
**Problema hoje:** `AGENTS.md` §7 afirma: *"171 no repo, plano limita a 100 deployadas"*. A medição ao vivo mostra **171 funções respondendo**, o que contradiz a premissa. Não foi possível verificar o limite atual do plano (a Management API responde 401 para este projeto).
**Causa raiz:** premissa escrita a partir do alerta do inventário, que é falso (A-40).
**Caminho recomendado:** confirme o limite real do plano com o dono (é informação de conta, não de código) e corrija a frase. Enquanto não houver confirmação, troque a afirmação por uma observação honesta: que há 171 funções publicadas e que o limite do plano precisa ser verificado. `AGENTS.md` é o arquivo que **todo** agente carrega em cada sessão — uma premissa errada ali se propaga para todas as decisões.
**Arquivos e objetos a tocar:** `AGENTS.md`.
**Não tocar / armadilhas:** `AGENTS.md` tem guarda de integridade no CI (`instrucoes-agentes`, que barra encolhimento de mais de 30%) — mudança pontual passa, mas não reescreva a seção.
**Depende de:** 229 · **Libera:** —
**Risco e como reverter:** nenhum.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** a frase de `AGENTS.md` §7 corresponde ao medido, ou declara explicitamente que o limite não está verificado.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 231 — Corrigir a matriz de RLS da documentação
**Onda / Severidade / Camada:** 8 / Alta / Documentação
**Achados resolvidos:** A-43
**Problema hoje:** `docs/RLS_MATRIX.md` declara, na linha de `nps_surveys`, que `salesperson` vê "próprios" — e `supabase/schema.sql:29125` mostra uma policy `USING (true)` que torna a tabela visível a qualquer autenticado. O documento também apresenta `tests/e2e/rls-scope-salesperson.spec.ts` como "cobertura executável", e esse spec **nunca roda** (A-24).
**Causa raiz:** a matriz foi escrita a partir da intenção das migrations, não do estado do banco.
**Caminho recomendado:** corrija as linhas afetadas (as 14 tabelas da etapa 023 e as tratadas em 018–022) **depois** de cada correção de policy, não antes — documento que descreve o futuro é o que criou este problema. E troque a seção de "cobertura executável" por uma declaração honesta: quais specs existem, quais rodam no CI e onde. Esse documento é o que um agente lê antes de mexer em RLS; errado, ele induz exatamente o tipo de decisão que esta auditoria encontrou.
**Arquivos e objetos a tocar:** `docs/RLS_MATRIX.md`.
**Não tocar / armadilhas:** não reescreva a matriz inteira de memória: corrija linha por linha, com a consulta a `pg_policies` como fonte, e cite a data da medição no topo.
**Depende de:** 018, 019, 020, 021, 022, 040 · **Libera:** 232
**Risco e como reverter:** nenhum (documentação). O risco é o inverso: deixar como está.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** para três tabelas da matriz, a linha do documento corresponde ao resultado de `SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = '<t>';`.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 232 — Criar o procedimento que mantém a matriz de RLS verdadeira
**Onda / Severidade / Camada:** 8 / Média / Documentação / CI
**Achados resolvidos:** A-43
**Problema hoje:** a matriz de RLS divergiu do banco sem que nada acusasse. O mesmo vale para `docs/DATA_DICTIONARY.md`, `docs/ER.md` e os outros documentos que descrevem o schema.
**Causa raiz:** documentação de schema mantida à mão, sem verificação.
**Caminho recomendado:** gere a matriz a partir de `pg_policies`, como o repositório já faz com o inventário (`scripts/inventario/gerar-banco.mjs`). Documento gerado não divergir é a única garantia que escala; revisão manual não sobrevive a 1017 policies. Mantenha a parte interpretativa (quem **deveria** ver o quê) separada da gerada (quem **vê**), e deixe a comparação entre as duas visível — é exatamente o que teria mostrado A-43 há meses.
**Arquivos e objetos a tocar:** um script em `scripts/`; `docs/RLS_MATRIX.md` passa a ter seção gerada.
**Não tocar / armadilhas:** não gere o documento inteiro: a parte de intenção de negócio é o que dá valor à matriz, e não pode sair do banco.
**Depende de:** 231 · **Libera:** —
**Risco e como reverter:** nenhum.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** rodar o gerador produz a seção de policies efetivas, e a comparação com a intenção aponta as divergências (zero, depois das etapas 018–022).
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 233 — Atualizar a documentação da API com a realidade dos endpoints
**Onda / Severidade / Camada:** 8 / Média / Documentação
**Achados resolvidos:** A-14, A-114
**Problema hoje:** `docs/API.md:78` documenta `receive-quote-webhook` como parte da API (API key, recebe `pdf_base64`), e EXECUTADO ele responde **500** por falta de segredo. `:77` documenta `receive-quote-sync`, que funciona. E o `config.toml` declara 22 funções sem JWT contra 79 reais (A-114), então a documentação de superfície pública também está incompleta.
**Causa raiz:** documentação escrita no momento da entrega e não revisada depois.
**Caminho recomendado:** depois de 048 (que decide o destino do endpoint) e 160 (que mede a superfície real), atualize `docs/API.md` com: o que está ativo, o que exige qual credencial e o que foi descontinuado. Um endpoint documentado que devolve 500 custa mais que um endpoint não documentado, porque alguém integra contra ele.
**Arquivos e objetos a tocar:** `docs/API.md`.
**Não tocar / armadilhas:** não documente os 64 endpoints sem JWT como "públicos" sem antes passar por 160: parte deles **não deveria** estar aberta, e documentar legitima.
**Depende de:** 048, 160 · **Libera:** —
**Risco e como reverter:** nenhum.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** para cada endpoint listado em `docs/API.md`, uma requisição de teste devolve o que o documento promete (ou o endpoint não está mais listado).
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 234 — Registrar no runbook o que fazer quando um alerta de cron disparar
**Onda / Severidade / Camada:** 8 / Média / Observabilidade
**Achados resolvidos:** A-104
**Problema hoje:** depois de 089, os alertas de cron passam a disparar de verdade — e hoje `docs/RUNBOOK.md` não tem o procedimento: quem recebe, o que verifica, quando escala. Alerta sem procedimento é alerta que vira ruído e depois é desligado.
**Causa raiz:** instrumentação planejada sem o procedimento operacional.
**Caminho recomendado:** escreva o procedimento junto com a etapa 089, não depois: para cada alerta (cron falhando, cron parado, dead letter acumulando, erro no front), o que olhar primeiro (`cron.job_run_details`, `edge_call_failures`, `error_logs`), qual a ação típica e quando chamar o dono. Use o formato que `docs/RUNBOOK.md` já tem.
**Arquivos e objetos a tocar:** `docs/RUNBOOK.md`.
**Não tocar / armadilhas:** não escreva procedimento para alerta que ainda não existe: a etapa 089 e a 151 definem quais serão.
**Depende de:** 089, 151 · **Libera:** —
**Risco e como reverter:** nenhum.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** o runbook tem uma entrada por alerta ativo, e um teste de mesa (ler o procedimento e seguir os passos) chega a uma conclusão.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 235 — Criar o teste de RLS por papel para as tabelas de desempenho
**Onda / Severidade / Camada:** 8 / Alta / Testes
**Achados resolvidos:** A-148, A-43
**Problema hoje:** a prova de isolamento por papel existe só em specs que não rodam (A-24) e em testes que leem texto de migration (A-144). Para as 14 tabelas de A-43, nenhum teste afirma, contra o banco, que um vendedor não lê dado de outro.
**Causa raiz:** a verificação foi escrita na camada mais frágil (texto de arquivo) e na que não executa (ponta a ponta).
**Caminho recomendado:** escreva no conjunto SQL (`npm run test:sql`), que roda contra o banco: para cada tabela corrigida nas etapas 018–022, uma afirmação de que, assumindo o papel de um vendedor, a contagem de linhas de **outros** vendedores é zero. É o teste que fecha o ciclo das correções de RLS e o que impede a regressão — que já aconteceu uma vez (`20261119700000` corrigiu `sales`/`activities` e o resto ficou).
**Arquivos e objetos a tocar:** novos arquivos no conjunto de testes SQL.
**Não tocar / armadilhas:** o teste precisa assumir o papel (`SET LOCAL ROLE` / `set_config` do `request.jwt.claims`), não usar `service_role` — com `service_role` tudo passa, e o teste não prova nada.
**Depende de:** 022, 039, 145 · **Libera:** 236
**Risco e como reverter:** baixo (teste). Se entrar no gate (039), uma regressão de policy passa a bloquear PR.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** `npm run test:sql` com os casos novos → passam; recriar uma policy `USING (true)` numa das tabelas → o teste **falha** apontando-a.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 236 — Criar o teste de RLS por papel para a cadeia de dinheiro
**Onda / Severidade / Camada:** 8 / Alta / Testes
**Achados resolvidos:** A-148
**Problema hoje:** as tabelas que decidem pagamento — `commissions`, `commission_bonus_awards`, `sales`, `quotes`, `orders` — não têm teste executado que prove o escopo por papel. A `docs/RLS_MATRIX.md` descreve a intenção ("salesperson: só as próprias"), e A-43 mostrou que descrição não é garantia.
**Causa raiz:** mesma de 235.
**Caminho recomendado:** mesmo padrão de 235, para a cadeia de dinheiro, cobrindo os três papéis: `salesperson` vê só o próprio; `manager` vê tudo; e a escrita cruzada (inserir comissão com `salesperson_id` de outro) **falha** no `WITH CHECK`. Esse último caso é o mais importante e o que nenhum teste cobre hoje.
**Arquivos e objetos a tocar:** novos arquivos no conjunto de testes SQL.
**Não tocar / armadilhas:** não teste com um usuário que tenha papel de admin por acidente: confirme o papel efetivo (`SELECT public.get_user_role(auth.uid())`) dentro do próprio teste.
**Depende de:** 235 · **Libera:** 237
**Risco e como reverter:** baixo (teste).
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** `npm run test:sql` com os casos novos → passam; e a tentativa de inserir comissão para outro vendedor falha com erro de policy.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 237 — Criar o teste do fluxo de aprovação com quórum
**Onda / Severidade / Camada:** 8 / Média / Testes
**Achados resolvidos:** A-135
**Problema hoje:** a etapa 046 implementa o quórum de aprovação; sem teste, a próxima mudança no fluxo desfaz a regra sem ninguém notar — e foi exatamente assim que a configuração ficou sem efeito (A-135).
**Causa raiz:** regra de negócio implementada sem teste que a fixe.
**Caminho recomendado:** teste SQL sobre a função de aprovação: com regra de 2 aprovadores, uma aprovação não muda o estado; duas mudam; o mesmo aprovador duas vezes **não** conta como duas; e a solicitação vencida é marcada. Os dois últimos casos são os que a implementação tende a esquecer.
**Arquivos e objetos a tocar:** novos arquivos no conjunto de testes SQL.
**Não tocar / armadilhas:** não teste pela interface: o quórum é regra de servidor, e teste de tela aqui seria lento e frágil.
**Depende de:** 046 · **Libera:** 238
**Risco e como reverter:** baixo (teste).
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** `npm run test:sql` com os quatro casos → passam.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 238 — Criar o teste do mapeamento de status de cotação externa
**Onda / Severidade / Camada:** 8 / Alta / Testes
**Achados resolvidos:** A-125
**Problema hoje:** a etapa 044 corrige o mapeamento que transforma cotação expirada em venda ganha. Sem teste, a próxima alteração do contrato do parceiro reabre o problema — que custa receita inflada e comissão indevida.
**Causa raiz:** mapeamento de contrato externo sem teste.
**Caminho recomendado:** teste Deno sobre a função de mapeamento (extraia-a para módulo testável, se ainda não estiver): para cada status que o parceiro pode enviar, o status interno esperado; e para status desconhecido, **recusa** — não um valor padrão. O caso de status desconhecido é o mais valioso: é ele que impede o próximo valor novo de virar venda ganha.
**Arquivos e objetos a tocar:** novo teste Deno; eventualmente extrair o mapeamento de `receive-quote-webhook/index.ts`.
**Não tocar / armadilhas:** `npm run ci` não inclui `test:deno` (ver etapa 221) — garanta que o teste entra no caminho que roda.
**Depende de:** 044, 221 · **Libera:** 239
**Risco e como reverter:** baixo (teste).
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** `npm run test:deno` com os casos → passam; acrescentar um status novo sem mapeamento faz o caso de recusa falhar se o padrão permissivo voltar.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 239 — Criar o teste do ciclo de reabertura de venda
**Onda / Severidade / Camada:** 8 / Alta / Testes
**Achados resolvidos:** A-02
**Problema hoje:** a etapa 067 torna o trigger de comissão tolerante a refechamento. O cenário (`completed → closed → negotiation → completed`) é o que hoje aborta o `UPDATE` com erro 23505, e é exatamente o tipo de caso que ninguém testa manualmente.
**Causa raiz:** caminho de ciclo de vida sem teste.
**Caminho recomendado:** teste SQL que percorre o ciclo completo e verifica: o `UPDATE` conclui sem erro; a contagem de comissões da venda permanece a esperada (1, ou 2 com SDR); e o estado da comissão respeita a regra de 066 (paga não volta). É o teste que fecha A-02, A-128 e A-129 de uma vez.
**Arquivos e objetos a tocar:** novo arquivo no conjunto de testes SQL.
**Não tocar / armadilhas:** use uma venda criada pelo próprio teste e limpe no final — não teste sobre dado real de produção.
**Depende de:** 066, 067, 068 · **Libera:** 240
**Risco e como reverter:** baixo (teste).
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** `npm run test:sql` com o caso → passa; reverter a etapa 067 faz o teste falhar com 23505.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 240 — Verificar e registrar o fechamento da Onda 1
**Onda / Severidade / Camada:** 8 / Alta / Verificação
**Achados resolvidos:** A-01, A-04, A-26, A-27, A-30, A-43, A-55
**Problema hoje:** as etapas 001 a 040 tratam segurança e risco de perda de dado. Sem uma verificação consolidada, o dono não tem como saber se a onda foi concluída de fato — e várias etapas dependem de configuração fora do repositório (painel do Supabase, environment do GitHub), que não aparece em nenhum diff.
**Causa raiz:** — (etapa de verificação)
**Caminho recomendado:** reexecute as sondas que esta auditoria usou e registre o resultado lado a lado com o estado inicial: `/auth/v1/settings` (`disable_signup` deve ser `true`); as 30 tabelas sensíveis no PostgREST anônimo (as da etapa 025 devem devolver 42501); `GET /functions/v1/get-client-ip` com a chave publishable (continua 200 — isso é esperado, A-26 é sobre o gateway, não sobre esta função); `POST` sem credencial em `new-device-alert` e `notify-critical-pattern` (401); o environment `Production` (com `protection_rules` preenchido); e o ruleset de `main` (com os checks novos). Entregue como seção em `docs/qa/05-PROGRESSO.md`, com data e saída de cada comando.
**Arquivos e objetos a tocar:** `docs/qa/05-PROGRESSO.md`.
**Não tocar / armadilhas:** não marque a onda como concluída se alguma etapa ficou com PR aberta aguardando o dono — registre o estado real, que é o objetivo desta etapa.
**Depende de:** 001, 025, 040 · **Libera:** 241
**Risco e como reverter:** nenhum (verificação).
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** a seção existe, com uma linha por sonda, o resultado anterior e o atual.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 241 — Verificar e registrar o fechamento da Onda 2
**Onda / Severidade / Camada:** 8 / Alta / Verificação
**Achados resolvidos:** A-14, A-48, A-85, A-122, A-123, A-124
**Problema hoje:** as etapas 041 a 060 tratam fluxos principais quebrados — comissão divergente, ROI 100× maior, "Arquivado" gerando receita, escritas sem policy, atualização otimista morta.
**Causa raiz:** — (etapa de verificação)
**Caminho recomendado:** percorra os fluxos de ponta a ponta com um usuário real de teste e registre: criar venda → conferir comissão na tela **e** no banco (devem bater, etapa 042); abrir `/roi` (custo de comissão plausível, etapa 041); arrastar card para "Arquivado" (sem comissão nem XP, etapa 043); salvar configuração de alerta de cadência (persiste, etapa 050); arrastar card com a rede desligada (reverte, etapa 057). Cada um com a evidência (consulta ou captura).
**Arquivos e objetos a tocar:** `docs/qa/05-PROGRESSO.md`.
**Não tocar / armadilhas:** use ambiente de teste ou dado de teste identificável em produção — e limpe depois. Não feche a onda com "deveria funcionar".
**Depende de:** 042, 043, 057 · **Libera:** 242
**Risco e como reverter:** nenhum (verificação).
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** a seção com os cinco fluxos percorridos e a evidência de cada um.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 242 — Verificar e registrar o fechamento da Onda 3
**Onda / Severidade / Camada:** 8 / Alta / Verificação
**Achados resolvidos:** A-02, A-03, A-49, A-128, A-130, A-131
**Problema hoje:** as etapas 061 a 110 tratam integridade de dados e regras de negócio — ciclo de reabertura, fallback de comissão, escalas de dinheiro, exclusão lógica, data de fechamento.
**Causa raiz:** — (etapa de verificação)
**Caminho recomendado:** além dos testes automatizados (etapas 235–239), rode as consultas de consistência e registre: `SELECT count(*) FROM public.commissions WHERE rule_id IS NULL;` (deve parar de crescer, etapa 100); comissão com valor negativo (zero, etapa 079); venda excluída logicamente fora da meta e do ranking (etapa 069); e a mesma venda aparecendo no mesmo mês em todas as telas (etapa 063). Esta é a onda em que os números do dono mudam — a verificação é o que dá a ele confiança no novo valor.
**Arquivos e objetos a tocar:** `docs/qa/05-PROGRESSO.md`.
**Não tocar / armadilhas:** registre os números **antes** de cada etapa da onda, não só depois: sem o valor anterior, ninguém sabe se a mudança foi a esperada.
**Depende de:** 069, 079, 100 · **Libera:** 243
**Risco e como reverter:** nenhum (verificação).
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** a seção com as quatro consultas, o valor anterior e o atual.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 243 — Verificar e registrar o fechamento das Ondas 4 a 8
**Onda / Severidade / Camada:** 8 / Média / Verificação
**Achados resolvidos:** diversos
**Problema hoje:** as etapas 111 a 239 tratam funcionalidades incompletas, robustez, performance, experiência de uso e higiene. São muitas etapas pequenas, e o risco é o progresso virar uma lista de caixas marcadas sem leitura de conjunto.
**Causa raiz:** — (etapa de verificação)
**Caminho recomendado:** faça uma passagem por onda, registrando o que mudou para o usuário: nenhuma tela com botão sem ação (varredura da etapa 101, repetida); nenhuma tela de dinheiro mostrando lista vazia em erro (etapas 121–127); `npm run a11y:sweep` dentro do piso (etapa 227); `npm run ci` completo verde (etapa 221); e o inventário regenerado sem os alertas falsos (etapa 229). Fechar com a contagem de etapas concluídas, abertas e divergentes, para o dono ter o retrato em uma linha.
**Arquivos e objetos a tocar:** `docs/qa/05-PROGRESSO.md`.
**Não tocar / armadilhas:** não refaça a auditoria inteira: a verificação é sobre o que as etapas prometeram, não sobre encontrar coisa nova (o que aparecer vai para "achados novos" no progresso).
**Depende de:** 221, 227, 229 · **Libera:** —
**Risco e como reverter:** nenhum (verificação).
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** a seção de fechamento com a contagem por estado e as cinco verificações acima.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 244 — Tornar o portão de cobertura honesto sobre o que protege
**Onda / Severidade / Camada:** 8 / Alta / CI / testes
**Achados resolvidos:** A-56
**Problema hoje:** o job `test`, exigido pelo `CI Gate`, roda dois gates de cobertura (`.github/workflows/pr-checks.yml:282-288`), e o piso é o próprio `coverage-baseline.json` da raiz: `{"lines": 4.64, "branches": 3.72, "functions": 3.4, "statements": 4.57}`, com tolerância `EPSILON = 0.05` pp (`scripts/check-coverage-ratchet.mjs:17`) e reprovação só quando `delta < -EPSILON` (`:50`). Os limiares do próprio Vitest são menores ainda (`vitest.config.ts:64-69`: `lines: 2.5`). O nome do gate ("Coverage ratchet (nunca cai)") e o modelo de PR sugerem proteção por teste; na prática, ~95% do código pode quebrar sem que nada perceba.
**Causa raiz:** a linha de base foi fixada no valor medido e o mecanismo só impede regressão, nunca exige progresso.
**Caminho recomendado:** não suba o piso de uma vez — isso reprovaria toda PR e o gate seria desligado. O caminho honesto tem duas partes: (1) **renomear** o gate e corrigir o texto do modelo de PR, para parar de prometer o que não entrega; (2) usar a ladder por módulo, que já existe (`coverage-ladder-baseline.json`, com pisos de 100% em `validators/`, `markupHelpers`, `gamification.ts`, `orderTracking/`, `revenueForecast/`), e acrescentar os módulos que este plano passa a cobrir — comissão (etapa 146), premiação (147) e importação (148). Piso alto onde há teste vale mais que piso global simbólico.
**Arquivos e objetos a tocar:** `coverage-ladder-baseline.json`; `.github/pull_request_template.md`; eventualmente o nome do passo em `pr-checks.yml`.
**Não tocar / armadilhas:** não mexa em `coverage-baseline.json` para baixo — o comentário do arquivo proíbe explicitamente, e com razão. E não ligue limiar global alto: a suíte não sustenta.
**Depende de:** 146, 147, 148 · **Libera:** —
**Risco e como reverter:** piso por módulo pode reprovar PR que toca módulo coberto; é o objetivo. Reverter é ajustar a ladder.
**Precisa de aprovação humana antes do merge:** **sim** — altera workflow de CI.
**Como verificar:** `npm run coverage:ladder` com os módulos novos → passa; remover um teste de comissão → o gate falha apontando o módulo.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 245 — Fazer o verificador de tipos estritos falhar quando não conseguir rodar
**Onda / Severidade / Camada:** 8 / Alta / CI
**Achados resolvidos:** A-57
**Problema hoje:** `scripts/check-typecheck-baseline.mjs:29-34` executa o `tsc` via `spawnSync` e **nunca** inspeciona `result.status` nem `result.error`; a única fonte de verdade é um regex sobre o texto de saída (`:36-44`). Se o `tsc` não existir, se `tsconfig.strict.json` desaparecer, se o processo estourar o `maxBuffer` ou morrer por falta de memória, a saída não casa o regex, `regressions` fica vazio e o script imprime sucesso (`:71`).
**Causa raiz:** o script interpreta ausência de saída como ausência de erro.
**Caminho recomendado:** verifique `result.error` e `result.status` antes de qualquer análise de texto: erro de execução deve ser **falha do script**, não silêncio. Confirme também que o `maxBuffer` (64 MB) é suficiente para a saída atual — se estiver perto, trate o truncamento explicitamente. Este é o mesmo padrão de defeito do `CI Gate` (A-18, etapa 038): aprovar por ausência de sinal negativo em vez de exigir sinal positivo.
**Arquivos e objetos a tocar:** `scripts/check-typecheck-baseline.mjs`.
**Não tocar / armadilhas:** não troque o regex por comparação de contagem total: o script existe para pegar **regressão por arquivo**, e a contagem agregada esconde troca de um erro por outro.
**Depende de:** 038 · **Libera:** —
**Risco e como reverter:** o script passa a falhar em ambiente incompleto — é o objetivo, e vai aparecer primeiro no container de quem não tem tudo instalado. Mensagem clara resolve.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** renomeie `tsconfig.strict.json` temporariamente e rode o script → **falha** com mensagem clara (hoje imprime sucesso).
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 246 — Corrigir o filtro de status do LTV por segmento
**Onda / Severidade / Camada:** 8 / Média / Regras de negócio
**Achados resolvidos:** A-127
**Problema hoje:** `src/components/analytics/LTVBySegment.tsx:43-45` filtra por um subconjunto dos status de ganho, deixando de fora `won` e `closed` — justamente os que o webhook de cotações grava. Os demais consumidores usam a lista completa de `src/constants/index.ts:69,84` (`src/hooks/bi/useABCAnalysis.ts:128`, `src/hooks/useCloserMetrics.ts:104`, `src/hooks/useCompetencyData.ts:56`).
**Causa raiz:** lista de status escrita à mão no componente em vez de importada da constante compartilhada.
**Caminho recomendado:** importe a lista de `src/constants/index.ts` — a mesma que os outros três consumidores usam. A correção é de uma linha, e o valor está em eliminar a lista local: é ela que vai divergir de novo no próximo status novo. Faça depois de 043, que introduz o status de arquivamento, para não importar a lista e logo mudá-la.
**Arquivos e objetos a tocar:** `src/components/analytics/LTVBySegment.tsx`.
**Não tocar / armadilhas:** o LTV vai **subir** onde havia vendas `won`/`closed` ignoradas; avise o dono, porque segmentação de cliente muda de faixa.
**Depende de:** 043 · **Libera:** —
**Risco e como reverter:** números de segmentação mudam. `git revert`.
**Precisa de aprovação humana antes do merge:** **sim** — muda segmentação de cliente.
**Como verificar:** para um segmento com vendas `won`, o LTV exibido bate com a soma manual (hoje é menor).
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 247 — Levar as escritas de sistema para a máquina de estados
**Onda / Severidade / Camada:** 8 / Média / Regras de negócio
**Achados resolvidos:** A-20
**Problema hoje:** `supabase/migrations/20261001213000_status_transitions_state_machine.sql:15-18` e `:35-43` declaram que o trigger `enforce_status_transition` "rejeita transição inválida feita por usuário do app" e que "writes de service_role/crons/migrations passam direto". O próprio arquivo lista como pendência: `bitrix24-sync`, `receive-quote-webhook` e o trigger `sync_quote_to_sale_status` "devem preferir as RPCs quando evoluírem". Um parceiro externo pode levar a venda a um status que a regra interna proíbe, sem erro.
**Causa raiz:** validação implementada por trigger sensível ao papel do chamador, enquanto os integradores usam `service_role`.
**Caminho recomendado:** faça as três escritas passarem pela RPC `transition_sale_status`, que valida antes de gravar. A ordem importa: comece por `receive-quote-webhook`, que é o caminho de entrada de terceiro e já está sendo tocado nas etapas 044 e 048 — aproveite a mesma PR se possível. `bitrix24-sync` e o trigger do banco vêm depois, porque mexem em fluxo que hoje funciona.
**Arquivos e objetos a tocar:** `supabase/functions/receive-quote-webhook/index.ts`; `supabase/functions/bitrix24-sync/index.ts`; migration para `sync_quote_to_sale_status`.
**Não tocar / armadilhas:** não remova a exceção de `service_role` do trigger: há escritas de sistema legítimas (migrations, correção operacional) que precisam dela. O caminho é fazer os integradores usarem a RPC, não fechar a porta para todos.
**Depende de:** 044, 048 · **Libera:** —
**Risco e como reverter:** eventos de parceiro com status inválido passam a ser recusados — é o objetivo, mas pode interromper uma integração que depende do comportamento atual. Avise o dono.
**Precisa de aprovação humana antes do merge:** **sim** — pode interromper integração em produção.
**Como verificar:** enviar pelo webhook um evento com transição inválida (ex.: de `cancelled` para `won`) → recusado e registrado, e a venda permanece como estava.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 248 — Resolver a contradição do `ranking-api`
**Onda / Severidade / Camada:** 8 / Média / Backend / integrações
**Achados resolvidos:** A-42
**Problema hoje:** `supabase/functions/ranking-api/index.ts:50-59` lê o cabeçalho `authorization` e o trata como token **da própria API** (`validate_api_token`, `:22`), aceitando token cru ou `Bearer <token>`. Todas as rotas rodam com `service_role`, incluindo escrita: `insert` em `salespeople` (`:130`) e ajuste de score (`:238-264`). Mas `ranking-api` **não** está em `supabase/config.toml`, então herda `verify_jwt = true`: um cliente externo que mande o token de ranking é barrado pelo gateway antes do handler. A função está deployada (responde a `OPTIONS`) e não tem chamador no repositório.
**Causa raiz:** dois esquemas de autenticação empilhados sem decisão: o do gateway e o da própria função.
**Caminho recomendado:** primeiro **descubra se há consumidor**: pergunte ao dono se existe integração de ranking externa e procure tráfego (`SELECT count(*) FROM public.api_tokens` / logs da função). Se não houver, o caminho mais seguro é **remover a função** — ela escreve em `salespeople` com `service_role` e não é usada. Se houver, declare `verify_jwt = false` no `config.toml` (com comentário, como as outras 22) para o token próprio poder chegar ao handler, e confirme que `validate_api_token` é comparação em tempo constante.
**Arquivos e objetos a tocar:** `supabase/config.toml` **ou** remoção da função; `supabase/functions/ranking-api/index.ts`.
**Não tocar / armadilhas:** não abra `verify_jwt = false` antes de confirmar que `validate_api_token` é robusto — hoje o gateway é a única barreira efetiva, por acidente.
**Depende de:** 160 · **Libera:** —
**Risco e como reverter:** abrir o gateway para uma função que escreve com `service_role` é mudança de superfície pública; remover quebra um consumidor que você não encontrou. A descoberta vem antes.
**Precisa de aprovação humana antes do merge:** **sim** — altera superfície pública ou remove endpoint.
**Como verificar:** se mantida: cliente externo com token válido recebe 200, sem token recebe 401 do handler. Se removida: `OPTIONS` devolve 404.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 249 — Fazer o Deploy Pipeline falhar quando não deployar
**Onda / Severidade / Camada:** 8 / Média / CI / deploy
**Achados resolvidos:** A-60
**Problema hoje:** `.github/workflows/deploy.yml:175-176` coleta o status do health check com `|| true` e segue. Combinado com A-55 (nenhuma regra de proteção) e com passos de deploy condicionais, o workflow pode concluir com sucesso **sem ter publicado nada** — e, se o health check falhar depois de publicar, apenas avisa.
**Causa raiz:** verificação pós-deploy tratada como informativa, e ausência de publicação não distinguida de publicação bem-sucedida.
**Caminho recomendado:** duas partes: (1) o health check pós-deploy deve **reprovar** o job quando falhar — é a última barreira antes de o dono considerar o deploy bom; (2) o job deve registrar e falhar quando nenhum passo de deploy executou, em vez de concluir verde. Hoje "deploy verde" não é prova de que o sistema está no ar, e é exatamente isso que `AGENTS.md` §5.10 pede que seja conferido.
**Arquivos e objetos a tocar:** `.github/workflows/deploy.yml`.
**Não tocar / armadilhas:** health check instável vira alarme falso e depois é ignorado — dê a ele uma política de repetição curta antes de reprovar, e não o aponte para uma rota que depende de dado.
**Depende de:** 004, 158 · **Libera:** —
**Risco e como reverter:** deploys passam a falhar quando o health check não responde; calibre a repetição antes de mergear. `git revert`.
**Precisa de aprovação humana antes do merge:** **sim** — altera workflow de deploy.
**Como verificar:** forçar o health check a falhar (apontando para rota inexistente, em teste) → o job **reprova**; e um disparo sem mudança a publicar → falha explicando, em vez de verde.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 250 — Completar o `.env.example` com as variáveis que o sistema realmente lê
**Onda / Severidade / Camada:** 8 / Média / Infraestrutura
**Achados resolvidos:** A-64
**Problema hoje:** `.env.example` lista apenas `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`, enquanto o código lê outras variáveis e segredos — e A-39 (nenhum e-mail sai, por `RESEND_API_KEY` ausente) e A-14 (`QUOTE_SYNC_API_KEY` ausente) são exatamente o sintoma disso em produção.
**Causa raiz:** o arquivo de exemplo acompanhou só as variáveis do front.
**Caminho recomendado:** levante as variáveis lidas de fato (`grep -rhoE "Deno.env.get\(['\"][A-Z_]+" supabase/functions/ | sort -u` e `import.meta.env.VITE_[A-Z_]+` em `src/`) e documente **todas** no `.env.example`, separando as do front (públicas) das de servidor (segredos, com valor vazio e comentário dizendo onde configurar). Isso transforma o arquivo em lista de verificação de ambiente novo — hoje, quem o seguir sobe um sistema parcialmente inerte.
**Arquivos e objetos a tocar:** `.env.example`; eventualmente `.github/ENVIRONMENTS.md`.
**Não tocar / armadilhas:** **nunca** coloque valor real de segredo no arquivo — só o nome e onde configurar. O repositório é público.
**Depende de:** 034 · **Libera:** —
**Risco e como reverter:** nenhum.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** toda variável lida pelo código aparece no `.env.example` (comparação do `grep` com o arquivo), e nenhum valor sensível foi incluído.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 251 — Tornar explícita a ordem de precedência de papéis
**Onda / Severidade / Camada:** 8 / Baixa / Segurança / frontend
**Achados resolvidos:** A-19
**Problema hoje:** `src/hooks/useUserRoles.ts:42-95` resolve o papel com `.order('role').limit(1).maybeSingle()` — **ordem alfabética**. Com mais de uma linha em `user_roles`, vence `admin` < `manager` < `salesperson`, que por acidente coincide com a ordem de privilégio. Só um papel é considerado.
**Causa raiz:** precedência de papel implícita na ordenação alfabética, sem declaração.
**Caminho recomendado:** declare a ordem: traga as linhas e escolha pelo maior privilégio segundo uma lista explícita, ou ordene por uma coluna de precedência. A correção é pequena e elimina uma dependência silenciosa do alfabeto — se um dia entrar um papel cujo nome venha antes de "admin", o usuário passa a ser tratado por ele, sem erro.
**Arquivos e objetos a tocar:** `src/hooks/useUserRoles.ts`.
**Não tocar / armadilhas:** o `fail-closed` em caso de falha da consulta está correto (devolve `null` e o guard nega) — não mexa nisso.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** um usuário com linhas `admin` e `salesperson` em `user_roles` é tratado como admin, e o teste (`src/hooks/rolePermissions.test.ts`) cobre o caso.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 252 — Decidir sobre o bucket público de fotos de perfil
**Onda / Severidade / Camada:** 8 / Baixa / Banco / storage
**Achados resolvidos:** A-23
**Problema hoje:** EXECUTADO (teste diferencial com arquivo inexistente em cada bucket): `avatars` responde `{"error":"not_found","code":"NoSuchKey"}` — bucket **público** —, enquanto `quote-pdfs`, `report-exports`, `call-recordings`, `winloss-reports` e `report-snapshots` respondem `{"error":"Bucket not found"}` (privados). A foto de perfil de cada funcionário é acessível por qualquer pessoa com a URL.
**Causa raiz:** bucket criado público, como é prática comum para avatar.
**Caminho recomendado:** pergunte ao dono. Manter público é aceitável e comum; se ele preferir fechar, o caminho é URL assinada na exibição (o repositório já usa `storage_create_signed_url` em outros fluxos). O hardening de tamanho e tipo já está feito (`20260831130002_harden_storage_buckets.sql:1-9`: 5 MB, só imagem), então o que resta é a decisão sobre visibilidade — é dado pessoal, e por isso vale perguntar em vez de presumir.
**Arquivos e objetos a tocar:** migration (se fechar) e o componente de exibição de avatar.
**Não tocar / armadilhas:** fechar o bucket sem trocar a exibição por URL assinada quebra todas as fotos do sistema. As duas mudanças andam juntas.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** fotos deixam de carregar se a exibição não for ajustada. `git revert` + migration.
**Precisa de aprovação humana antes do merge:** **sim** se a decisão for fechar (afeta exibição em todo o sistema).
**Como verificar:** se fechar: `GET /storage/v1/object/public/avatars/<arquivo>` → erro, e a foto continua aparecendo no app (via URL assinada).
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 253 — Fazer o guard-rail de `service_role` ser verificado
**Onda / Severidade / Camada:** 8 / Baixa / Backend / CI
**Achados resolvidos:** A-36
**Problema hoje:** `supabase/functions/_shared/auth-client.ts:9-12,76-80` institui a regra: bypass de RLS exige `getServiceClient(reason)` com justificativa escrita (o helper recusa motivo com menos de 10 caracteres). **52** funções obedecem; **90** criam `createClient(url, SUPABASE_SERVICE_ROLE_KEY)` direto, sem o guard-rail e sem motivo — inclusive todas as de A-27 a A-35. Não há lint nem teste que verifique.
**Causa raiz:** regra escrita em comentário e em helper, sem verificação automática.
**Caminho recomendado:** acrescente uma regra de lint (ou um script no conjunto de testes) que proíba `createClient(..., SUPABASE_SERVICE_ROLE_KEY)` fora de `_shared/auth-client.ts`. Comece como aviso, com allowlist das 90 ocorrências atuais, e tire da allowlist conforme as etapas deste plano tocarem cada função — assim a regra passa a valer para código novo imediatamente, sem bloquear o existente. Regra sem verificação não impediu nenhum dos achados desta auditoria.
**Arquivos e objetos a tocar:** `eslint.config.js` (regra de restrição) ou um script em `scripts/`; a allowlist.
**Não tocar / armadilhas:** não force as 90 a migrarem de uma vez: é churn, e várias precisam de `service_role` legitimamente — o valor está no motivo escrito, não na troca do construtor.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** baixo; se a regra incomodar, volte a aviso.
**Precisa de aprovação humana antes do merge:** **sim** se entrar no gate de CI.
**Como verificar:** uma função nova com `createClient(..., SERVICE_ROLE)` direto → o lint acusa; com `getServiceClient('motivo claro')` → passa.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 254 — Reduzir o risco do workflow com `pull_request_target`
**Onda / Severidade / Camada:** 8 / Baixa / CI / segurança
**Achados resolvidos:** A-62
**Problema hoje:** `.github/workflows/dependabot-fix-lockfile.yml` é o **único** com `pull_request_target` (`:6`), combinando segredos do repositório base, `permissions: contents: write` (`:15-16`) e checkout da branch da PR (`:29`), com `deno install --frozen=false` (`:37`) sobre o conteúdo dessa branch. Há guard de ator (`:23`, `github.actor == 'dependabot[bot]' || workflow_dispatch`), e o Deno não executa scripts de pós-instalação — o que mantém o risco baixo.
**Causa raiz:** padrão necessário para empurrar correção de lockfile de volta à branch do Dependabot.
**Caminho recomendado:** o guard de ator é a proteção que importa: documente **no próprio arquivo** por que ele é indispensável, para ninguém removê-lo numa refatoração. Se quiser reduzir mais, restrinja `permissions` ao mínimo no nível do job (em vez do workflow) e confirme que o token usado no push é o do `GITHUB_TOKEN`, não um token de usuário.
**Arquivos e objetos a tocar:** `.github/workflows/dependabot-fix-lockfile.yml`.
**Não tocar / armadilhas:** não remova o `pull_request_target`: sem ele o workflow não consegue empurrar para a branch do Dependabot, que é a razão de existir.
**Depende de:** — · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** **sim** — altera workflow de CI.
**Como verificar:** o comentário de aviso está no arquivo, e `permissions` está no menor escopo que ainda permite o push.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

### Etapa 255 — Garantir a remoção dos mapas de código-fonte do pacote publicado
**Onda / Severidade / Camada:** 8 / Baixa / Infraestrutura
**Achados resolvidos:** A-65
**Problema hoje:** a geração de mapas de código-fonte fica em `dist/` quando `SENTRY_AUTH_TOKEN` não existe, em vez de ser removida após o upload. **Verificado em produção e a exposição NÃO existe**: EXECUTADO, `GET /assets/index-CaluqAC4.js.map` e `/assets/rolldown-runtime-COiEfhsA.js.map` → **403** nos dois.
**Causa raiz:** a remoção do artefato depende da presença de um token.
**Caminho recomendado:** torne a remoção incondicional no final do build: gere o mapa, faça o upload se houver token, e apague em qualquer caso. Hoje a proteção vem da plataforma (403), não do processo — e plataforma muda de comportamento sem avisar. É higiene, não urgência.
**Arquivos e objetos a tocar:** `vite.config.ts` ou o passo de build em `.github/workflows/`.
**Não tocar / armadilhas:** não desligue a geração do mapa: sem ele, o registro de erro (etapa 151) perde a pilha legível, que é todo o valor dele.
**Depende de:** 151 · **Libera:** —
**Risco e como reverter:** baixo; `git revert`.
**Precisa de aprovação humana antes do merge:** não.
**Como verificar:** depois do build, `ls dist/assets/*.map` → vazio; e o upload para o serviço de erro (se configurado) continua funcionando.
**Checklist de conclusão:**
- [ ] mudança aplicada só nos arquivos listados
- [ ] typecheck, lint e testes dos arquivos tocados passam
- [ ] verificação acima executada, com a evidência registrada
- [ ] deploy confirmado, quando se aplica
- [ ] etapa marcada no arquivo de progresso

---

# Encerramento do plano

## Por que 255 etapas e não 300

O pedido pedia 300 etapas. Este plano tem **255**, e a diferença é deliberada.

Os 151 achados de `03-ACHADOS.md` sustentam 255 mudanças atômicas, cada uma com evidência e
verificação própria. Para chegar a 300 seria necessário **dividir correções que só fazem
sentido juntas** (separar a policy do `UPDATE` da policy do `INSERT` na mesma tabela, por
exemplo) ou **inventar trabalho sem achado que o sustente**. O enunciado desta auditoria é
explícito quanto a isso, e tem razão: etapa fraca ou duplicada custa o tempo do executor e
contamina a confiança nas etapas que importam.

Onde havia muitas ocorrências do mesmo problema, o plano **já divide em lotes** — porque ali a
divisão protege:
- grants de `anon` em 400 tabelas → etapas 025 a 029 e 191 a 198 (13 etapas);
- 111 tabelas com gatilho duplicado → etapas 086 e 199 a 202 (5 etapas);
- 14 grupos de índice duplicado → etapas 085 e 203 a 205 (4 etapas);
- 116 policies permissivas → etapas 018 a 023 (6 etapas, com inventário);
- 50 supressões da regra de dependências → etapas 140 e 209 a 212 (5 etapas);
- 8 telas que mostram erro como lista vazia → etapas 121 a 127 (7 etapas);
- 13 funções que autenticam e descartam → etapas 012 a 017 e 213 a 216 (10 etapas).

**As 45 etapas que faltariam para 300 virão das nove medições que este plano pede** — etapas
002, 087, 153, 163, 168, 188, 206, 218 e 225. São justamente as perguntas que a auditoria não
pôde responder sem SQL no banco de produção e sem permissão de escrita. Cada uma delas pode
gerar etapas novas, e com evidência: por exemplo, a etapa 168 (consultas mais custosas) pode
gerar várias etapas de índice; a 206 (tabelas órfãs) pode gerar etapas de remoção; a 225
(acessibilidade) deve gerar várias, porque a varredura não foi executada.

## Verificação de integridade deste plano

Conferido antes da entrega:

| Checagem | Resultado |
|---|---|
| Etapas numeradas de 001 a 255, sem lacuna nem repetição | **255 etapas, sem lacunas** |
| Todo achado tem ao menos uma etapa | **0 achados sem etapa** (151 de 151 cobertos) |
| Todo achado Crítico ou Alto tem etapa | **59 de 59 cobertos** |
| Toda etapa aponta para ao menos um achado | **0 etapas sem achado** |
| Toda etapa tem verificação concreta (comando, consulta ou requisição) | sim, no campo `Como verificar` |
| Dependências sem ciclo | **0 ciclos** (verificado por busca em profundidade sobre os 255 nós) |
| Dependências apontando para etapa existente | **0 referências inválidas** |
| Números do resumo batendo com os arquivos | sim — 151 achados (12/47/64/28), 255 etapas, 99 cenários |

Distribuição das etapas:

| Onda | Etapas |
|---|---|
| 1 — Segurança e risco de perda de dado | 40 |
| 2 — Fluxos principais quebrados | 22 |
| 3 — Integridade de dados e regras de negócio | 38 |
| 4 — Funcionalidades incompletas | 20 |
| 5 — Robustez: erros, estados, concorrência | 41 |
| 6 — Performance e escala | 9 |
| 7 — Experiência de uso e consistência | 20 |
| 8 — Higiene, CI e observabilidade | 65 |

Por severidade: 14 Crítica, 77 Alta, 127 Média, 37 Baixa.
Com aprovação humana antes do merge: **121 de 255**.

## Backlog — o que ficou fora das 255

Nada ficou fora por falta de espaço: os 151 achados estão todos cobertos. O que existe de
pendente são as **lacunas de verificação** declaradas em `01-INVENTARIO.md` §10, que as nove
etapas de medição endereçam, e três decisões que dependem só do dono:

1. **Qual é a taxa de comissão válida** (etapa 042) — bloqueia a unificação do cálculo.
2. **Se gestor pode aprovar e pagar comissão** (etapa 173) — o sistema afirma as duas coisas.
3. **Como novos vendedores entram** (etapa 001) — bloqueia o fechamento do cadastro público.

Enquanto essas três não forem respondidas, as etapas correspondentes ficam com a PR aberta —
e é o comportamento correto, não um impedimento.
