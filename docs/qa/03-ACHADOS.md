# 03 — Achados, agrupados por causa raiz

Cada achado traz: ID, camada, título, evidência (arquivo:linha, trecho ou saída de
comando), causa raiz, impacto no negócio em uma frase, severidade e confiança.

**Severidade** — Crítica: perda ou vazamento de dado, falha de segurança, fluxo
principal quebrado · Alta: função importante falha ou dá resultado errado · Média:
funciona com defeito ou fragilidade · Baixa: acabamento e higiene.

**Confiança** — `confirmado`: a evidência sustenta o achado · `hipótese`: falta uma
verificação, declarada no próprio item.

**Modo** — `EXECUTADO`: foi rodado e o resultado está aqui · `RASTREADO`: o caminho foi
seguido lendo o código que roda · `SNAPSHOT`: medido em
`inventario/estado/banco.json` (2026-11-12), **não ao vivo**.

Um problema com dez ocorrências é **um** achado com dez locais. Achados com a mesma
causa raiz estão sob a mesma seção.

---

## CR-1 — Regra de negócio vive no cliente e o servidor confia nela

### A-07 · [Crítica] Erro de digitação ao cadastrar premiação paga o prêmio a todo vendedor
**Camada:** regras de negócio / hooks · **Modo:** RASTREADO · **Confiança:** confirmado

`src/hooks/useEligibleBonuses.ts:99-100`, último `return` de `evaluateBonus`:
```ts
// Trigger vazio/desconhecido → informativo
return { ...bonus, achieved: true, progress: 1, reason: 'Premiação ativa' };
```
Qualquer bônus ativo cujo `trigger_condition` não contenha exatamente uma das chaves
reconhecidas (`milestone_amount`, `rank_top`, `streak_days`, `first_sale`) cai aí com
`achieved: true`. Quem consome `achieved` **registra o prêmio**:
`src/components/vendedor/EligibleBonusesCard.tsx:94-102` → `useAutoAwardBonuses`
(`src/hooks/useAutoAwardBonuses.ts:46-50`) chama
`supabase.rpc('award_bonus_if_eligible', {...})` para cada item. A RPC vigente
(`supabase/migrations/20261027210000_r3_db_kpis_fixes.sql:306-367`) valida `auth.uid()`,
`is_active`, escopo e idempotência por `(bonus_id, salesperson_id, period_month)` — mas
**em nenhum ponto lê `trigger_condition`**. O formulário do admin aceita JSON livre,
validando só se é parseável (`src/pages/AdminPremiacoes.tsx:432-452`).

**Causa raiz:** a condição de elegibilidade só existe no cliente, com fallback
permissivo, e o servidor aceita a afirmação do cliente. (A migration `20261027210000:19-24`
mostra que o *valor* arbitrário vindo do cliente já foi corrigido; a *condição* não.)

**Impacto:** um `{}` ou uma chave digitada errada no cadastro de uma premiação faz o
sistema registrar o prêmio, no valor cheio, para todo vendedor que abrir o painel — e
entra como `status='pending'` em `commission_bonus_awards`, ou seja, na fila de pagamento.

### A-08 · [Alta] Premiação por ranking nunca é paga
**Camada:** regras de negócio / hooks · **Modo:** RASTREADO · **Confiança:** confirmado

`src/hooks/useEligibleBonuses.ts:149-155`, dentro do `queryFn` de produção:
```ts
const ctx: EvaluationContext = { salespersonId, mtdRevenue, totalSalesCount,
  currentStreak, monthlyRank: null /* pode ser injetado depois via prop */ };
```
e a avaliação em `:59-62` exige `rank !== null && rank <= rankTop`.
EXECUTADO: `grep -rn "monthlyRank" src/` devolve apenas a interface (`:18`), o uso
(`:61`), o literal `null` (`:154`) e o teste — **nenhum caminho de produção injeta o
rank**. A própria UI do admin ensina a usar a chave: `src/pages/AdminPremiacoes.tsx:450`
mostra `{"rank_top": 3}` como exemplo.

**Causa raiz:** dependência do cálculo (rank mensal) nunca foi ligada; o `null`
hardcoded com comentário "pode ser injetado depois" foi para produção.

**Impacto:** "Top 3 do mês" cadastrado pelo admin aparece sempre como não atingido e
nunca é pago, mesmo para o 1º colocado — a empresa promete e não entrega.

### A-03 · [Alta] Comissão cai para 5% fixo, em silêncio, quando nenhuma regra casa
**Camada:** regras de negócio / banco · **Modo:** RASTREADO · **Confiança:** confirmado

`supabase/migrations/20261013130000_comissao_regras_e_split_sdr.sql:68`:
```sql
IF v_rule_percentage IS NULL THEN v_rule_percentage := 5.0; END IF;
```
O mesmo fallback vale para a comissão do SDR (`:88-96`). A comissão é gravada com
`rule_id` **NULL** e 5% (`:72-76`), sem aviso, sem log e sem bloqueio.
A busca de regra (`:55-66`) exige `is_active = true`, categoria compatível e
`NEW.amount` dentro de `[min_amount, max_amount]`. Como `NEW.amount >= COALESCE(min_amount,0)`
com `amount` NULL não é verdadeiro, venda sem valor também cai no fallback.

**Causa raiz:** percentual de negócio embutido no banco como valor de reserva, em vez de
recusar a operação ou sinalizar que a regra não foi encontrada.

**Impacto:** se uma regra de comissão for desativada, sair da faixa de valor ou a
categoria da venda mudar, o sistema passa a pagar 5% sem que ninguém perceba — e a linha
gravada não indica que nenhuma regra foi aplicada.

### A-20 · [Média] Parceiro externo grava status de venda sem passar pela máquina de estado
**Camada:** regras de negócio / backend · **Modo:** RASTREADO · **Confiança:** confirmado

`supabase/migrations/20261001213000_status_transitions_state_machine.sql:15-18` e `:35-43`
declaram que o trigger `enforce_status_transition` "rejeita transição inválida feita por
usuário do app (PostgREST authenticated/anon)" e que "writes de service_role/crons/
migrations passam direto". O próprio arquivo lista como pendência:
`bitrix24-sync`, `receive-quote-webhook` e o trigger `sync_quote_to_sale_status`
"devem preferir as RPCs quando evoluírem".

**Causa raiz:** a validação é por trigger sensível ao papel do chamador, e os
integradores usam service_role.

**Impacto:** um parceiro externo pode levar uma venda a um status que a regra interna
proíbe, sem erro, e os relatórios passam a contar essa venda de forma errada.

---

## CR-2 — Gravação derivada sem tolerância a repetição

### A-02 · [Alta] Reabrir e refechar uma venda trava a venda
**Camada:** banco / regras de negócio · **Modo:** RASTREADO · **Confiança:** confirmado

Duas regras do próprio repositório se contradizem:
- `supabase/migrations/20261001213000_status_transitions_state_machine.sql:28-29`:
  "won/completed (e aliases) só saem para closed/cancelled e entre si; **lost e closed
  podem reabrir** para lead/qualified/proposal/negotiation" — logo o ciclo
  `completed → closed → negotiation → completed` é **permitido**.
- `supabase/migrations/20261013130000_comissao_regras_e_split_sdr.sql:72-76` e `:97-101`:
  `INSERT INTO public.commissions (...) VALUES (...)` **sem `ON CONFLICT`**, com a
  UNIQUE `commissions_sale_salesperson_key (sale_id, salesperson_id)` criada no mesmo
  arquivo (`:14`).

No segundo fechamento da mesma venda o INSERT viola a unique (23505) e **aborta o UPDATE**.
A migration `20261001220100_sales_status_canonico.sql:60-63` já documenta esse exato modo
de falha para outra tabela ("INSERT duplicado em salesperson_commissions, que tem
UNIQUE(sale_id), abortando a venda") — o repositório conhece o padrão e não o tratou aqui.

**Causa raiz:** o trigger trata o fechamento como evento único, mas o ciclo de vida
permite fechar mais de uma vez.

**Impacto:** venda que precisa ser reaberta e fechada de novo trava com erro técnico, e
o vendedor fica sem a comissão daquela venda.

### A-13 · [Baixa] Contador de visualizações do relatório público perde acessos simultâneos
**Camada:** backend · **Modo:** RASTREADO · **Confiança:** confirmado

`supabase/functions/report-embed-public/index.ts` (bloco "Update view counter"):
`update({ view_count: (tokenRow.view_count ?? 0) + 1, ... })` — leitura, soma e escrita
separadas, disparado sem `await`. Dois acessos ao mesmo tempo gravam o mesmo valor.

**Causa raiz:** incremento no cliente em vez de `increment` atômico no banco.

**Impacto:** a contagem de quantas vezes um relatório compartilhado foi aberto fica menor
que a real.

---

## CR-3 — Controle de acesso anunciado mas não aplicado

### A-10 · [Alta] A lista de domínios do relatório público não impede ninguém de ler
**Camada:** backend / integrações · **Modo:** RASTREADO · **Confiança:** confirmado

`supabase/functions/report-embed-public/index.ts:70-74`:
```ts
function pickCorsOrigin(reqOrigin, allowed) {
  if (!allowed || allowed.length === 0) return "*";
  if (reqOrigin && allowed.includes(reqOrigin)) return reqOrigin;
  return allowed[0];
}
```
O GET valida token, `revoked` e `expires_at`, mas **nunca rejeita por origem**: o corpo
com os dados é enviado e só um navegador respeitaria o cabeçalho CORS. Um `curl` ou
qualquer servidor lê tudo. Com `allowed_origins` vazio, o cabeçalho ainda vira `"*"`.
A UI oferece o campo como se fosse restrição (`src/components/reporting/EmbedTokenManagerDialog.tsx`).
As colunas padrão incluem dado comercial: `clients(name, company, total_value)` e
`sales(client_name, amount)` (`DEFAULT_VISIBLE_FIELDS`).

**Causa raiz:** CORS tratado como controle de acesso. CORS é instrução para o navegador,
não autorização no servidor.

**Impacto:** quem obtiver o link de um relatório vê nomes de clientes e valores de venda
de qualquer lugar, mesmo com a lista de domínios preenchida.

### A-12 · [Média] O token do relatório público viaja na URL
**Camada:** frontend / backend · **Modo:** RASTREADO · **Confiança:** confirmado

`src/hooks/reporting/useEmbeddedReportPreview.ts`: `fetch(`${FN_URL}?token=${...}`, {
headers: { 'X-Embed-Token': token } })` — manda nos dois lugares. O comentário no próprio
arquivo declara a query como transitória, "remover quando o deploy das functions estiver
confirmado"; EXECUTADO: as functions **estão** deployadas (ver A-15/§CR-7), então a
pendência pode ser fechada. A função aceita os dois
(`report-embed-public/index.ts`, `req.headers.get("x-embed-token") ?? url.searchParams.get("token")`).

**Causa raiz:** compatibilidade temporária durante uma migração que já terminou.

**Impacto:** o link de acesso ao relatório fica gravado em log de borda, no histórico do
navegador e no cabeçalho `Referer` — quem ler o log entra no relatório.

### A-11 · [Média] O limite de requisições do relatório público não limita
**Camada:** backend · **Modo:** RASTREADO · **Confiança:** confirmado

`supabase/functions/report-embed-public/index.ts:52-67`: `const rateLimit = new Map()`,
60 requisições por minuto. Cada instância Deno tem o próprio `Map` e perde o estado a
cada cold start. O repositório já tem o padrão persistente para isso
(`public.webhook_dispatch_rate`, `supabase/migrations/20261117050000_webhook_ssrf_e_rate_limit.sql`).

**Causa raiz:** estado de limite guardado na memória de um processo efêmero.

**Impacto:** um link de relatório pode ser varrido sem limite real, puxando as 500 linhas
permitidas quantas vezes quiser.

---

## CR-4 — `REVOKE ... FROM PUBLIC` não revoga de `anon`

### A-04 · [Alta] 400 tabelas concedem leitura **e escrita** ao papel anônimo; só a RLS segura
**Camada:** banco · **Modo:** EXECUTADO + RASTREADO (SCHEMA) · **Confiança:** confirmado

RASTREADO em `supabase/schema.sql` (introspecção do catálogo de **produção**, commit de
2026-11-17, 37.323 linhas) — contagem por parser próprio:
- **400 tabelas** com `GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES, TRIGGER, MAINTAIN
  ON TABLE public.<t> TO anon;` (ex.: `supabase/schema.sql:32192` para
  `public._internal_secrets`, `:32196` para `ab_tests`, `:32200` para `access_denied_logs`);
- de 408 tabelas, apenas **18** tiveram o grant de `anon` revogado — e são exatamente as
  de segurança e auditoria: `audit_log`, `data_access_log`, `edge_call_failures`,
  `entity_versions`, `geocode_cache`, `login_attempts`, `maintenance_log`,
  `password_history`, `plan_rollback_ddl`, `security_events`, `session_activity`,
  `user_2fa`, `user_2fa_backup_codes`, `user_2fa_log`, `webhook_allowed_domains`,
  `webhook_dispatch_rate`, `webhook_events`, `webhook_inbound_dedupe`.

EXECUTADO (sonda própria, PostgREST com a chave publishable, papel `anon`, 30 tabelas
sensíveis — `scratchpad/qa/anon-probe.txt`): 27 responderam HTTP 200 com corpo `[]` e 3
responderam 42501. Ou seja, o grant está lá e **a RLS é a única coisa que filtra**.

**O que me impediu de classificar como Crítica** (verificado, não suposto):
- nenhuma policy permite escrita a `anon`, exceto uma intencional e escopada —
  `supabase/schema.sql:28374`, `"anon can insert error logs"` em `error_logs`, com
  `WITH CHECK (user_id IS NULL OR user_id = auth.uid())`;
- as tabelas mais sensíveis têm negação explícita: `_internal_secrets`
  (`supabase/schema.sql:26426`, `USING (false) WITH CHECK (false)`),
  `daily_challenge_rotations` (`:27843`), `geocode_cache` (`:28636`),
  `sms_verification_codes` (`:30887-30899`), `webhook_inbound_dedupe` (`:31526`,
  `RESTRICTIVE`);
- **0 tabelas sem RLS** nas duas fontes (SNAPSHOT e SCHEMA).

**Causa raiz:** o Supabase concede o conjunto completo de DML a `anon`/`authenticated` no
schema `public` por *default privileges*. Um `REVOKE ALL ... FROM PUBLIC` **não** desfaz
isso, porque `PUBLIC` e `anon` são coisas diferentes. O repositório já descobriu e aplicou
o revoke correto em 18 tabelas
(`supabase/migrations/20261117060000_revoke_grants_tabelas_webhook.sql:30`) e parou ali.

**Impacto:** hoje nada vaza e nada é escrito indevidamente — a RLS está segurando. Mas o
sistema está a uma policy mal escrita de permitir que qualquer visitante da internet leia
ou altere a tabela inteira. Não há segunda tranca em 400 das 408 tabelas, inclusive nas de
venda, cliente, comissão e orçamento.

**Nota de privilégio excessivo:** o grant inclui `TRIGGER`, `REFERENCES` e `MAINTAIN`, que
nenhum cliente de API precisa.

### A-05 · [Média] Uma view de telemetria é legível sem login, contra o que a migration declara
**Camada:** banco · **Modo:** EXECUTADO · **Confiança:** confirmado

EXECUTADO: `GET /rest/v1/v_platform_slo?select=*&limit=1` com a chave publishable →
HTTP 200, `content-range: 0-0/30`.
A migration `supabase/migrations/20260711145130_b2c8eda9-8da9-46fe-aefe-3b950fa412d1.sql:87-88`
declara o oposto:
```sql
REVOKE ALL ON public.v_platform_slo FROM PUBLIC;
GRANT SELECT ON public.v_platform_slo TO service_role;
```
As 30 linhas vêm do `generate_series` de 30 dias com os agregados em `null`/0 (a view é
`security_invoker = true`, então a RLS das tabelas-base segura o dado real). Outras 14
views respondem 200 com 0 linhas — mesma causa, mesmo risco latente
(`scratchpad/qa/anon-views.txt`).

**Causa raiz:** a mesma de A-04. O schema real **diverge** do declarado nas migrations.

**Impacto:** hoje expõe só a estrutura do painel de SLO a qualquer pessoa na internet; se
alguma tabela-base afrouxar a RLS, passa a expor o número.

---

## CR-5 — Falha de leitura é apresentada como "não há nada"

### A-06 · [Alta] Consulta que falha vira lista vazia em telas de dinheiro e de auditoria
**Camada:** frontend / hooks · **Modo:** RASTREADO · **Confiança:** confirmado

Não há tratador global de erro de *query*: `src/App.tsx:33-48` configura apenas `retry`, e
o único `onError` global é o de *mutations* (`:66-67`). As páginas abaixo desestruturam só
`data`/`isLoading`, enquanto o hook lança o erro — **8 locais, mesma causa**:
- `src/pages/AdminComissoes.tsx:71` (render `:208-216` mostra "Nenhuma comissão
  encontrada para os critérios selecionados"); hook lança em `src/hooks/useCommissions.ts:72`
- `src/pages/Comissoes.tsx:33` → `src/hooks/useCommissions.ts:55`
- `src/pages/AuditLogsPage.tsx:45` → `src/hooks/admin/useAuditLogs.ts:45`
- `src/pages/AdminAuditoriaPremiacoes.tsx:105` → `src/hooks/useCommissionBonusAwards.ts:49`
- `src/pages/Deduplication.tsx:28` → `src/hooks/crm/useDeduplicationScan.ts:57`
- `src/pages/FeatureFlagsAdmin.tsx:33`
- `src/pages/AdminSupressaoEmails.tsx:94` → `src/hooks/email/useEmailOptOuts.ts:52`
Contraexemplo correto no mesmo repositório: `src/pages/MinhasPremiacoes.tsx:77,309` e
`src/pages/AdminSolicitacoesTitular.tsx:115` tratam `isError`.

**Causa raiz:** ausência de tratamento de erro padrão para leitura, deixado a cargo de
cada página.

**Impacto:** o gestor conclui que não há comissão pendente, nenhuma premiação para
auditar e nenhum log de auditoria — quando na verdade a consulta falhou.

---

## CR-6 — Ação destrutiva sem confirmação nem rótulo

### A-09 · [Alta] Excluir flag de produção e cancelar prêmio em um clique
**Camada:** frontend · **Modo:** RASTREADO · **Confiança:** confirmado

- `src/pages/FeatureFlagsAdmin.tsx:256-266`:
  `onClick={() => deleteFlag.mutate(flag.id, {...})}` — sem `AlertDialog`, sem `confirm`,
  sem desfazer. EXECUTADO: `grep -c AlertDialog` na página = **0**.
- `src/pages/AdminAuditoriaPremiacoes.tsx:579-590`: cancelar a premiação
  (`updateStatus.mutate({ status: 'cancelled' })`) é botão só de ícone, sem rótulo
  acessível e sem confirmação. Ao lado, `:591-602`, a **exclusão definitiva**
  (`remove.mutate(a.id)`) usa `confirm()` nativo e o ícone
  `<CheckCircle2 className="h-3.5 w-3.5 rotate-45" />` — um "check" girado fazendo as
  vezes de "X", também sem `aria-label`.

**Causa raiz:** ação destrutiva tratada como ação comum, sem o padrão de confirmação que
o repositório já usa em outras telas.

**Impacto:** um toque errado desliga uma funcionalidade em produção para todos, ou apaga
o registro de um bônus de vendedor — e o botão de apagar parece um botão de confirmar.

---

## CR-7 — Configuração de produção fora de sincronia com o código

### A-14 · [Alta] A entrada de cotações do parceiro responde erro 500 em produção
**Camada:** integrações · **Modo:** EXECUTADO · **Confiança:** confirmado (com escopo a confirmar)

EXECUTADO: `POST https://usyxfpqlsspldubptrdl.supabase.co/functions/v1/receive-quote-webhook`
→ **HTTP 500** `{"error":"Server misconfigured: missing QUOTE_SYNC_API_KEY"}`.
Causa no código: `supabase/functions/receive-quote-webhook/index.ts:9`
(`Deno.env.get("QUOTE_SYNC_API_KEY") ?? ""`) e `:94-100` (devolve 500 quando vazio).
O comportamento é **fail-closed** — não aceita cotação sem chave —, então é
disponibilidade, não segurança. `docs/API.md:78` documenta o endpoint como parte da API
e `supabase/config.toml` o marca `verify_jwt=false` com o comentário "Webhook do
gift_store: chave dedicada x-api-key (QUOTE_SYNC_API_KEY)".

**A confirmar antes de agir (muda a severidade):** existe um segundo caminho, **ativo e
funcionando**, para entrada de cotações — `receive-quote-sync`, que atende V4 e PromoGifts
com HMAC (`supabase/functions/receive-quote-sync/index.ts:1-17`) e respondeu 401
corretamente no teste. Se o gift_store ainda aponta para `receive-quote-webhook`, toda
cotação dele se perde (Alta). Se o endpoint foi substituído e ficou publicado sem uso, é
higiene (Média). Verificação: `SELECT max(created_at), origem FROM
public.quote_sync_inbound_log GROUP BY origem;` e confirmação com o dono.

**Impacto:** se o parceiro usa esse endereço, cada orçamento enviado é recusado com erro
de servidor e ninguém no CRM fica sabendo.

### A-15 · [Baixa] Não dá para saber qual versão está no ar
**Camada:** infraestrutura / observabilidade · **Modo:** EXECUTADO · **Confiança:** confirmado

EXECUTADO: `GET /functions/v1/health` → `{"status":"ok","version":"dev","timestamp":"2026-11-23T00:17:07.245Z"}`.
A variável de versão não é injetada no deploy das edge functions.
O front **também** não expõe versão: EXECUTADO — nenhum `<meta>` de versão em
`index.html` servido por produção, nenhum `define`/`__APP_VERSION__` em
`vite.config.ts` e nenhuma string de versão nos chunks baixados. O
`package.json` está em `1.7.4` e o commit auditado é a release 1.7.4, mas isso
não é verificável a partir do que está no ar.

**Impacto:** diante de um problema, ninguém consegue afirmar qual versão do código está
rodando — nem no site, nem nas funções. O diagnóstico começa no escuro.

### A-23 · [Baixa] Bucket de fotos de perfil é público
**Camada:** banco / storage · **Modo:** EXECUTADO · **Confiança:** confirmado

EXECUTADO (teste diferencial, arquivo inexistente em cada bucket): `avatars` responde
`{"error":"not_found","code":"NoSuchKey"}` (bucket **público**), enquanto `quote-pdfs`,
`report-exports`, `call-recordings`, `winloss-reports` e `report-snapshots` respondem
`{"error":"Bucket not found"}` (**privados**).
Observação importante para o executor: a hipótese de que `quote-pdfs` seria público
(ele nasce assim em `supabase/migrations/20260224205444:6`) foi **refutada** — a
migration `20260402110607_58d6a56f-2cbb-4544-9fb4-d66cd4d32ac5.sql:38` já faz
`UPDATE storage.buckets SET public = false WHERE id = 'quote-pdfs'`.

**Impacto:** a foto de perfil de cada funcionário é acessível por qualquer pessoa que
tenha a URL. É prática comum, mas é dado pessoal.

---

## CR-8 — Identidade e cadastro

### A-01 · [Crítica] Qualquer pessoa cria conta no CRM e recebe papel de vendedor
**Camada:** segurança / banco · **Modo:** EXECUTADO + RASTREADO · **Confiança:** confirmado no mecanismo; alcance a medir

EXECUTADO: `GET https://usyxfpqlsspldubptrdl.supabase.co/auth/v1/settings` →
`"disable_signup": false`, `"email": true`, `"mailer_autoconfirm": false`.
RASTREADO: o trigger `on_auth_user_created_role`, `AFTER INSERT ON auth.users`, executa
`handle_new_user_role()`, que faz
`INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'salesperson')` —
`supabase/migrations/20251214103344_640296e4-5119-4bf4-aefe-f0749de6003f.sql:86-103`.
Nenhuma restrição de domínio de e-mail em migrations, edge functions ou `src/`
(EXECUTADO: grep). A migration `20260619143950:15` apenas moveu a função para o schema
`private`; o trigger continua.

**Causa raiz:** o cadastro público do Supabase Auth ficou habilitado num sistema interno,
e o papel inicial é concedido por trigger, sem aprovação.

**Impacto:** qualquer pessoa com um e-mail válido entra no CRM da empresa como vendedor,
sem ninguém aprovar.

**O que falta medir (declarado):** o que um `salesperson` **sem** registro em
`salespeople` enxerga de fato. Várias policies dependem de
`public.get_current_salesperson_id()`, que devolveria `null` — nesse caso o acesso a dado
de terceiro seria vazio, e o impacto cai de "vazamento" para "conta indevida dentro do
app". Medir exige criar um usuário de teste (escrita), fora do escopo desta auditoria.
A etapa de correção não depende dessa medição: fechar o cadastro público é correto de
qualquer forma.

### A-19 · [Baixa] O papel do usuário é escolhido por ordem alfabética
**Camada:** segurança / frontend · **Modo:** RASTREADO · **Confiança:** confirmado

`src/hooks/useUserRoles.ts:42-95`: a consulta a `user_roles` usa
`.order('role').limit(1).maybeSingle()`. Com mais de uma linha, vence a **ordem
alfabética** — `admin` < `manager` < `salesperson` — que por acidente coincide com a
ordem de privilégio. Só um papel é considerado.

**Causa raiz:** precedência de papel implícita na ordenação alfabética, sem ordem
declarada.

**Impacto:** nenhum hoje. Se algum dia entrar um papel cujo nome venha antes de "admin"
no alfabeto, o usuário passa a ser tratado por esse papel — e a quebra é silenciosa.

---

## CR-9 — O portão de qualidade não segura o que promete

### A-24 · [Alta] 26 dos 49 testes de ponta a ponta nunca rodam, inclusive as provas de isolamento por papel
**Camada:** CI / testes · **Modo:** EXECUTADO · **Confiança:** confirmado

Duas condições que se anulam em `.github/workflows/pr-checks.yml`:
1. o job `e2e` só roda em disparo manual — `if: github.event_name == 'workflow_dispatch'` (`:471`);
2. o mesmo job depende de `lint-and-typecheck` (`needs`, `:465`), que por sua vez exige
   `needs.detect-changes.outputs.has-code == 'true'` (`:93`). Em `workflow_dispatch`,
   `detect-changes` (`:44-61`) lê `BASE="${{ github.event.pull_request.base.sha }}"` —
   **vazio** fora de PR — e `git diff --name-only "" "$HEAD" | ... || true` engole o erro,
   devolvendo `has_code=false`.

Logo o job é **inalcançável em qualquer evento**.
EVIDÊNCIA AO VIVO: run **44931311890** (PR Checks #2151, `workflow_dispatch`, branch
`claude/fix-chave-chat-visual-search-261121-1740`, 2026-11-21T17:40Z): **E2E Tests,
Unit Tests, Lint & Type Check, Build Check, Migrations Gate, SQL Suites, Edge Functions
Tests, Security Audit, Types Drift, Bundle Size e Lighthouse = `skipped`**; rodaram
apenas Detect Changes, Agent Instructions Integrity e k6 Load Smoke; e
**CI Gate = `success`**.

Cobertura real, cruzando `playwright.config.ts` com os workflows:
- roda em PR: projeto `quote-to-sale` (23 specs) via `quote-to-sale-e2e.yml:182`; a11y via
  `a11y-sweep.yml`;
- roda semanalmente (`qa-exhaustive.yml`, `cron "0 3 * * 1"`): vitest completo, deno,
  lint, bundle e **a11y** (`:130`, usa `playwright.a11y.config.ts`) — **não** o
  `playwright.config.ts`;
- **nunca roda** (projetos `chromium-desktop`, `page-smoke`, `mobile-ios-safari`,
  `mobile-android-chrome`): 26 specs, entre eles `rls-scope-salesperson.spec.ts`,
  `rls-authorization-edge-cases.spec.ts`, `sales-markup-rls-salesperson.spec.ts`,
  `security-definer-rpc-access.spec.ts`, `core-flows`, `pipeline-flows`, `auth-logout`,
  `auth-navigation`, `dashboard-navigation`, `reset-password-hibp`, `smoke`,
  `win-loss-analysis`, `revenue-forecast-v2`, `v4-callbacks-admin`, `mobile-auth-smoke`
  e os 9 `pages-*`.

**Causa raiz:** `detect-changes` deriva a base do diff de um campo que só existe em
`pull_request`, e o `|| true` esconde a falha; o job de e2e foi amarrado justamente ao
evento em que esse cálculo não funciona.

**Impacto:** `docs/RLS_MATRIX.md` apresenta `rls-scope-salesperson.spec.ts` como prova
executável de que um vendedor não lê dados de outro. A prova existe no repositório e o
CI nunca a executa — a garantia é documental, não verificada.

### A-17 · [Alta] O único check obrigatório cobre 4 jobs de 19
**Camada:** CI · **Modo:** EXECUTADO · **Confiança:** confirmado

EXECUTADO: ruleset **22148182** de `main` — `required_status_checks: [{"context":"CI Gate"}]`
é o único check obrigatório e `required_approving_review_count: 0`.
`.github/workflows/pr-checks.yml:711`: `needs: [lint-and-typecheck, test, build, instrucoes-agentes]`.
Não bloqueiam merge: `migrations-gate` (`:165`), `security-audit` (`:195`),
`edge-functions-lint` (`:290`), `deno-tests` (`:335`), `sql-tests` (`:376`),
`k6-smoke` (`:416`), `e2e` (`:460`), `lighthouse` (`:598`), `bundle-size` (`:636`),
`gen-types-drift` (`:670`). O comentário em `:705-707` declara `security-audit` e
`edge-functions-lint` como informativos de propósito; os demais ficaram fora sem
justificativa escrita.

**Causa raiz:** o agregador `CI Gate` foi mantido com a lista antiga de checks
obrigatórios enquanto novos jobs de verificação foram sendo somados ao workflow.

**Impacto:** uma mudança pode entrar em produção com migration inválida, teste de SQL
vermelho ou `types.ts` fora de sincronia com o banco, sem nada barrar.

### A-18 · [Média] Job cancelado conta como aprovado
**Camada:** CI · **Modo:** RASTREADO · **Confiança:** confirmado

`.github/workflows/pr-checks.yml:714-721`:
```bash
RESULTS='${{ toJSON(needs) }}'
FAILED=$(echo "$RESULTS" | grep -c '"result": "failure"' || true)
if [ "$FAILED" -gt 0 ]; then ... exit 1; fi
```
com `if: always()`. Dos quatro resultados possíveis (`success`, `failure`, `cancelled`,
`skipped`), só `failure` é contado.

**Causa raiz:** o gate interpreta o resultado por busca de texto em vez de exigir
`success` explicitamente.

**Impacto:** um job obrigatório cancelado (cancelamento manual, falha de infraestrutura)
deixa o portão verde e libera o merge.

### A-16 · [Média] Migrations datadas no futuro travam qualquer mudança de banco até 25/11
**Camada:** banco / CI · **Modo:** EXECUTADO · **Confiança:** confirmado

EXECUTADO: `git ls-tree origin/main supabase/migrations/` → a maior versão em `main` é
**20261125110000** (25/11/2026); hoje é 23/11/2026. São 7 arquivos com data futura:
`20261123000100`, `20261124120000`, `20261124130000`, `20261124160000`, `20261125000000`,
`20261125100000`, `20261125110000`.
Regra do gate — `scripts/check-migrations.mjs:157-160`:
`if (BigInt(version) <= maxBaseVersion)` → "versão não é estritamente maior que a maior
versão da base".

**Causa raiz:** migrations geradas com carimbo de tempo adiantado, e o gate compara com o
máximo da base em vez da data real.

**Impacto:** quem precisar mexer no banco nos próximos dois dias é obrigado a datar a
migration no futuro também, perpetuando o desvio e embaralhando a ordem de aplicação.

---

## CR-10 — Crescimento sem retenção

### A-21 · [Média] O histórico de execuções do cron cresce sem limpeza
**Camada:** banco · **Modo:** SNAPSHOT (2026-11-12) · **Confiança:** confirmado

`inventario/estado/banco.json` → `cron.historico`:
`{"bytes":60940288,"linhas":229106,"mais_antigo":"2026-08-04T11:30:00Z","mais_de_7_dias":206142}`
— 60,9 MB e 206 mil linhas com mais de 7 dias, em um banco de 243 MB.
**Caminho que não funciona:** a migration `20261125100000_cron_job_run_details_sem_seq_scan.sql:18`
registra a tentativa e o erro `42501: must be owner of table job_run_details` — no Supabase
gerenciado não dá para apagar nem indexar essa tabela.

**Causa raiz:** `cron.job_run_details` é do Postgres, não da aplicação, e 32 jobs (vários
a cada 5 ou 15 minutos) alimentam o histórico sem retenção possível pelo dono do schema.

**Impacto:** um quarto do banco é histórico de execução de rotina, e a consulta de saúde
do cron fica mais lenta a cada semana.

---

## CR-11 — Defesa de borda incompleta

### A-22 · [Média] A política de segurança do site não protege contra script injetado
**Camada:** infraestrutura · **Modo:** EXECUTADO · **Confiança:** confirmado

EXECUTADO: `curl -D - https://promo-champions-v2-1.vercel.app/` →
`content-security-policy: frame-ancestors 'self'` — **única diretiva**. Não há
`default-src`, `script-src` nem `connect-src`; também faltam `Permissions-Policy` e os
cabeçalhos `Cross-Origin-*`. Origem: `vercel.json`, bloco `headers`. Presentes e corretos:
`Strict-Transport-Security` (1 ano, `includeSubDomains`), `X-Frame-Options: SAMEORIGIN`,
`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.

**Causa raiz:** a CSP foi adicionada para resolver o embutimento em frame e nunca foi
estendida às diretivas de execução de script.

**Impacto:** se um script estranho chegar à página (dependência comprometida, conteúdo
injetado), o navegador não tem instrução para bloquear o envio de dados para fora.

---

## CR-12 — Pendências de higiene

### A-25 · [Baixa] Um componente órfão e dois mapas de prefetch convivendo
**Camada:** frontend · **Modo:** EXECUTADO · **Confiança:** confirmado

EXECUTADO (script próprio cruzando 1942 arquivos `.ts/.tsx` de `src/` contra todos os
imports de `src/`, `tests/` e `supabase/functions/`): apenas **1 órfão real** —
`src/components/ui/level-up-celebration.tsx`. O outro candidato, `src/test/setup.ts`, é
usado por `vitest.config.ts:13`.

**Impacto:** praticamente nulo. Registrado para que o plano **não** gaste etapas
procurando código morto: não há.

---

## CR-13 — `verify_jwt = true` foi confiado como se autenticasse

### A-26 · [Crítica] A chave pública do site satisfaz o portão das funções de backend
**Camada:** backend · **Modo:** EXECUTADO · **Confiança:** confirmado

Este é o fato que muda a leitura de toda a camada de edge functions. A chave publishable é
pública por desenho e vai para o bundle do browser
(`src/integrations/supabase/env.ts:12`). EXECUTADO contra produção, em `get-client-ip`
(função que não tem checagem própria):
```
GET /functions/v1/get-client-ip                                  → 401 UNAUTHORIZED_NO_AUTH_HEADER
GET /functions/v1/get-client-ip  -H "apikey: sb_publishable_…"    → 200 {"ip":"160.79.106.142"}
GET /functions/v1/get-client-ip  -H "Authorization: Bearer sb_publishable_…" → 200
```
(reproduzido de forma independente pelo auditor e pelo revisor da camada).
Confirmação cruzada: `deal-probability` devolve `{"error":"Unauthorized"}` com corpo **do
próprio handler** (`supabase/functions/deal-probability/index.ts:100-101`) — isto é, a
requisição com a chave pública **atravessa o gateway e chega no código**.

**Causa raiz:** `verify_jwt` do gateway aceita qualquer JWT válido do projeto, e a chave
publishable é um deles. Das 171 funções, 149 não aparecem em `supabase/config.toml` e
herdam `verify_jwt = true`; parte delas trata isso como autenticação.

**Impacto:** toda função de backend que não verifique o chamador no próprio código é, na
prática, um endereço aberto na internet.

**Consequência para o plano:** ao corrigir qualquer função desta camada, "o `verify_jwt`
está ligado" **não** é proteção. Os três achados seguintes são casos concretos disso.

### A-27 · [Crítica] `new-device-alert` grava e dispara e-mail sem autenticar ninguém
**Camada:** backend · **Modo:** EXECUTADO + RASTREADO · **Confiança:** confirmado

`supabase/functions/new-device-alert/index.ts:105-205`: o handler trata `OPTIONS` (`:111`),
checa `RESEND_API_KEY` (`:114`), cria client **service_role** (`:126-127`), lê o corpo
(`:129`) e valida só o **formato** de `user_id`/`user_email`/`device_fingerprint`
(`:131-146`). **Não há nenhuma verificação de quem chamou** — nem JWT, nem segredo de cron,
nem HMAC. Em seguida, com service_role: lê e grava `known_devices` (`:150-183`), grava
`login_alerts` (`:190-205`), grava `email_logs` (`:232`), lê `push_subscriptions` e invoca
`send-push-notification` com `Authorization: Bearer <service_role>` (`:246-280`), e envia
e-mail real para o endereço que **o chamador** mandou.
EXECUTADO: `POST` só com a chave pública e corpo `{}` → **503**
`{"error":"RESEND_API_KEY not configured"}` — resposta do **handler** (`:114-120`), não do
gateway: a requisição anônima entrou na função. Não houve 401.

**Causa raiz:** função criada para ser chamada por um hook de login, nunca ganhou gate, e
não está em `config.toml` (A-26).

**Impacto:** hoje contido por acidente, porque `RESEND_API_KEY` não está configurada
(A-39). No instante em que o segredo for configurado, o endereço passa a ser (a) um
remetente público de "alertas de segurança" com o domínio da empresa e (b) um gravador
público de `known_devices` — e registrar o dispositivo de um atacante **suprime** o alerta
do login real dele (`:150-166` devolve 200 "already known" e não alerta).

### A-28 · [Alta] `workflow-executor` consulta o login e ignora a resposta
**Camada:** backend · **Modo:** RASTREADO · **Confiança:** confirmado

`supabase/functions/workflow-executor/index.ts:57-62`:
```ts
const { data: userData } = await userClient.auth.getUser();
const userId = userData?.user?.id ?? null;
```
O erro é descartado e `null` é aceito — **não existe `if (!user) return 401`**. A execução
segue com client **service_role** (`:72`): lê qualquer `workflows` por id (`:73-77`), grava
`workflow_executions` com `triggered_by: null` (`:93-103`), atualiza
`workflows.execution_count`/`last_executed_at` (`:151-170`) e **devolve na resposta** o
`label`, `conditionField`, `conditionOp` e `conditionValue` de cada nó (`:128-134`, `:172-174`).
Mitigação parcial: as ações são simuladas (`:146`), então não há escrita de negócio.
Chamado pelo front em `src/hooks/useWorkflows.ts:136`.

**Impacto:** qualquer pessoa com a chave pública grava histórico de execução e **lê a lógica
das automações** da empresa.

### A-29 · [Alta] `notify-critical-pattern` manda e-mail ao administrador, sem login e sem limite
**Camada:** backend · **Modo:** EXECUTADO + RASTREADO · **Confiança:** confirmado

`supabase/functions/notify-critical-pattern/index.ts` tem 61 linhas, **nenhuma** verificação
de chamador e **nenhum** `enforceRateLimit`. O corpo do e-mail interpola o payload cru:
```ts
// index.ts:28-33
<p><strong>${body.name ?? "Padrão"}</strong> com confiança …</p>
<p>ID: <code>${body.pattern_id ?? "—"}</code></p>
```
O repositório **tem** `_shared/html-escape.ts` e o usa em outras três funções
(`email-unsubscribe`, `new-device-alert`, `send-quote-to-client`) — aqui não é importado.
O destinatário é fixo (`ADMIN_NOTIFICATION_EMAIL`, `:19`).
EXECUTADO: `POST` só com a chave pública e corpo `{}` → **200** `{"ok":false,"skipped":true}`
— caiu no caminho `skipped` de `:21-26`, sem 401.

**Impacto:** injeção de HTML direto na caixa do administrador e envio sem limite (queima da
cota de e-mail), a partir de qualquer lugar.

---

## CR-14 — Autentica que existe um usuário, mas não verifica se *aquele* usuário pode tocar *aquele* registro

Padrão comum a todos: o handler obtém a identidade e depois opera com **service_role**,
usando um id que vem do corpo da requisição. O service_role apaga a RLS que protegeria de
graça. O repositório já tem o antídoto escrito — o comentário de A-30 descreve exatamente a
regra que os outros não seguem.

### A-30 · [Crítica] Qualquer usuário logado move qualquer negócio de estágio
**Camada:** backend / regras de negócio · **Modo:** RASTREADO · **Confiança:** confirmado

`supabase/functions/execute-workflow/index.ts`. A função autentica corretamente
(`:38-50`, `getUserClient` + 401) e o comentário em `:113-115` declara a regra:
*"FK salesperson_id → salespeople.id (não auth.users.id): resolve o vendedor do chamador
pelo JWT — IDOR prevention, nunca pelo payload"*. `create_task` e `log_activity` cumprem,
usando `callerSalespersonId` derivado do JWT (`:116-133`). A terceira ação **não**:
```ts
// index.ts:145-148
supabase.from("sales").update({ stage: u.stage }).eq("id", trigger_payload.sale_id)
```
`trigger_payload.sale_id` vem do corpo (`:65`) e `supabase` é `getServiceClient` (`:69`).
Agrava: o workflow também não é escopado ao chamador — `:71-76` busca `automation_workflows`
só por `id` + `is_active`, sem filtro de dono ou time. E o ramo `update_stage` (`:131-133`)
**não** exige `callerSalespersonId`, ao contrário dos outros dois.

**Impacto:** qualquer usuário autenticado move **qualquer** negócio do CRM para qualquer
estágio, bastando existir um workflow ativo com ação `update_stage`. Corrompe pipeline,
previsão de receita e, se houver comissão por estágio, remuneração.

**Cadeia de ataque completa (este é o pior caminho encontrado na auditoria):** A-01 deixa
qualquer pessoa criar conta e receber `salesperson`; como `update_stage` não exige registro
em `salespeople`, a conta recém-criada já serve. Logo: **qualquer pessoa da internet cria
uma conta e remaneja o pipeline da empresa.**
**Primeira coisa que o executor deve rodar**, porque decide se a cadeia está explorável
hoje ou apenas latente:
```sql
SELECT id, name FROM public.automation_workflows
WHERE is_active AND actions::text ILIKE '%update_stage%';
```
Resultado vazio = latente. Qualquer linha = explorável agora.

### A-31 · [Alta] Transcrição e "insights de IA" falsos em qualquer gravação de chamada
**Camada:** backend · **Modo:** RASTREADO · **Confiança:** confirmado

`supabase/functions/analyze-call/index.ts:28` — `await getUserClient(req);` com o
**resultado descartado**: autentica que alguém está logado, não guarda quem. Em `:41-42`
cria service_role e grava usando `body.recording_id` cru: `update call_recordings SET
status='analyzing'` (`:55`), `insert` em `call_transcripts` com `full_text`
do corpo (`:58-62`), `insert` em `call_insights` (`:114-115`), `update ... status='ready'`
(`:129`). Há validação de **formato** (`:47-54`), nenhuma de **propriedade**.
O padrão "autentica e descarta" aparece em **13 funções** (EXECUTADO, grep por
`^\s*await getUserClient\(req\);`): `semantic-search:53`, `predictive-intelligence:75`,
`behavioral-analysis:58`, `bitrix24-oauth:313`, `visual-search:37`, `analyze-call:28`,
`enrich-lead:27`, `csat-ces-trigger:26`, `simulate-load:29`, `revenue-forecast-ai:54`,
`rotate-daily-challenges:43`, `semantic-index-entity:96`, `lead-scoring:24`.

**Impacto:** em um CRM onde coaching e avaliação de vendedor saem dessas tabelas, é
adulteração de avaliação de desempenho por qualquer colega.

### A-32 · [Alta] Qualquer usuário pausa a cadência de qualquer vendedor e falsifica engajamento
**Camada:** backend · **Modo:** RASTREADO (gate confirmado EXECUTADO) · **Confiança:** confirmado

`supabase/functions/sequence-record-reply/index.ts` autentica bem (`:9-30`: exige `Bearer`,
`getUser(token)`, 401 — EXECUTADO: `POST` só com a chave pública → 401 `Unauthorized`).
Mas depois, com **service_role** (`:43-46`), opera sobre o `enrollment_id` do corpo (`:34`)
sem checar dono nem papel: lê `sequence_step_executions` alheio (`:49-55`), grava
`replied_at` (`:57-61`), chama `rpc('record_engagement_signal')` e
`rpc('recompute_engagement_score')` (`:71-82`) e faz
`update sequence_enrollments SET status='paused', next_action_at=null` (`:84-87`).

**Impacto:** um vendedor interrompe a prospecção de outro e injeta sinal de engajamento
falso nos contatos dele — a fila de trabalho e o score do time ficam mentirosos.

### A-33 · [Média] Envio agendado amarrado a venda de terceiro
**Camada:** backend · **Modo:** RASTREADO · **Confiança:** confirmado

`supabase/functions/schedule-optimal-send/index.ts:29-36` autentica corretamente, mas
`:68-74` grava em `scheduled_sends` com `owner_id: user.id` **e `sale_id` cru do corpo**,
sem verificar que a venda é do chamador; o `payload` (conteúdo da mensagem) também vem cru.
Quem consome a fila é `process-scheduled-sends` (cron), que **envia de verdade**.

### A-34 · [Média] Pesquisa de satisfação e rotação de desafios disparadas por qualquer usuário
**Camada:** backend · **Modo:** RASTREADO · **Confiança:** confirmado

- `csat-ces-trigger/index.ts:26` autentica e descarta; `:39` service_role; `:76` grava
  survey com `account_id`/`contact_email` crus do corpo. Tem dedupe (`:60-63`), então é
  idempotente — mas qualquer usuário dispara pesquisa para um e-mail arbitrário.
- `rotate-daily-challenges/index.ts:41-43` aceita cron **ou**, no `catch`, qualquer usuário
  autenticado (`getUserClient` descartado): qualquer vendedor força a rotação dos desafios
  diários (`:62-117`), afetando a gamificação de todos.

### A-35 · [Média] Recalculo em massa de score de lead por qualquer usuário
**Camada:** backend · **Modo:** RASTREADO · **Confiança:** confirmado

`supabase/functions/lead-scoring/index.ts:24` autentica e descarta; `:214-216` faz `upsert`
em massa de scores. Impacto: a ordem de prioridade dos leads do time pode ser reescrita por
qualquer um de dentro.

---

## CR-15 — Portões de qualidade que existem e não são verificados

### A-36 · [Baixa] A regra do `service_role` é contornada em 90 de 142 funções
**Camada:** backend · **Modo:** EXECUTADO · **Confiança:** confirmado

`supabase/functions/_shared/auth-client.ts:9-12,76-80` institui a regra: bypass de RLS exige
`getServiceClient(reason)` com justificativa escrita (o helper recusa motivo com menos de 10
caracteres). **52** funções obedecem; **90** criam
`createClient(url, SUPABASE_SERVICE_ROLE_KEY)` direto, sem o guard-rail e sem registrar
motivo — inclusive todas as de A-27 a A-32. Não há lint nem teste que verifique a regra.

**Impacto:** a salvaguarda escrita não impediu nenhum dos achados desta auditoria.

### A-37 · [Média] Endpoints de IA pagos são alcançáveis antes de qualquer identificação
**Camada:** backend / custo · **Modo:** RASTREADO · **Confiança:** confirmado

Quatro funções chegam ao gateway de IA antes de qualquer barreira de identidade, protegidas
apenas por limite em memória: `race-commentary/index.ts:58-60` (o comentário admite:
*"endpoint de IA consome créditos (função não autentica chamador)"*, LLM em `:111-128`),
`qbr-generator/index.ts:15-17` (LLM em `:76`, `:98`),
`generate-revenue-forecast/index.ts:63-67` (LLM em `:171`),
`summarize-call-recording/index.ts:108-110` (LLM em `:165`).
Por que o limite não basta, pela evidência do próprio repositório:
`_shared/rate-limit.ts:10-13` — *"Because edge isolates can be scaled horizontally, this is
a per-instance limiter — the effective global limit is (instances × limit)"*; e `:56-60`
deriva o IP de `x-forwarded-for`, que `:28-32` do mesmo arquivo reconhece como spoofável.

**Impacto:** custo de IA pode ser queimado por terceiros, sem conta no sistema.

### A-38 · [Média] `external-db-bridge`: a lista de tabelas é respeitada, a de colunas não existe
**Camada:** backend · **Modo:** RASTREADO · **Confiança:** confirmado

O gate é bom (exige `Bearer`, valida usuário e **exige papel admin/gestor** via RPC,
`index.ts:115-156`, 403) e há allowlist de tabelas (`:82-93`) e de RPCs (`:100-106`, vazia
por padrão). A brecha:
```ts
// index.ts:208
const selectColumns = columns || '*';
// index.ts:215
let query = externalClient.from(table).select(selectColumns, {...});
```
`columns` chega do corpo **sem validação**. A sintaxe de recursos embutidos do PostgREST
(`*, outra_tabela(*)`) alcança tabelas relacionadas **fora** da allowlist, porque a
allowlist só filtra a tabela raiz. Compare com o jeito correto no mesmo repositório:
`report-embed-public/index.ts:81-98` filtra cada coluna por `SAFE_FIELD` e nunca usa `*`.
Exige papel admin/gestor, por isso Média.

### A-42 · [Média] `ranking-api` tem token próprio, mas o portão exige JWT do projeto
**Camada:** backend / integrações · **Modo:** RASTREADO · **Confiança:** hipótese

`supabase/functions/ranking-api/index.ts:50-59` lê o header `authorization` e o trata como
token **da própria API** (`validate_api_token`, `:22`), aceitando token cru ou `Bearer <token>`.
Todas as rotas rodam com service_role, incluindo escrita: `insert` em `salespeople` (`:130`)
e ajuste de score (`:238-264`). Mas `ranking-api` **não** está em `supabase/config.toml`,
então herda `verify_jwt = true`: um cliente externo que mande o token de ranking é barrado
pelo gateway antes do handler. A função responde a `OPTIONS` (está deployada) e não tem
chamador no repositório.

**O que falta para confirmar:** se existe algum consumidor funcionando hoje. Ou a API
externa está quebrada, ou alguém a chama com um JWT do projeto — e nesse caso
`validate_api_token` é a única barreira real.

---

## CR-16 — Configuração ausente deixa funcionalidade inerte, sem alarme

### A-39 · [Alta] Nenhum alerta por e-mail sai do sistema
**Camada:** infraestrutura / integrações · **Modo:** EXECUTADO · **Confiança:** confirmado

Duas funções independentes provam que `RESEND_API_KEY` não está configurada no projeto:
`new-device-alert` → **503** `{"error":"RESEND_API_KEY not configured"}` e
`notify-critical-pattern` → **200** `{"ok":false,"skipped":true}`.
Onze funções leem esse segredo: `access-denied-alerts`, `activity-goal-alerts`,
`broadcast-sale-notification`, `check-lead-sla`, `new-device-alert`,
`notify-critical-pattern`, `sdr-consecutive-alerts`, `send-alert-notifications`,
`send-password-reset`, `send-transactional-email`, `winloss-webhook-health-monitor`.
**Nenhuma falha ruidosamente**: devolvem 200 `skipped` ou 503.

**Delimitação verificada (para não exagerar o impacto):** o "esqueci minha senha" do
usuário final **não** depende disso — `src/hooks/auth/useAuthForm.ts:168` usa
`supabase.auth.resetPasswordForEmail`, que sai pelo Supabase Auth. A edge
`send-password-reset` é usada em um único lugar,
`src/components/security/PasswordResetApproval.tsx:84` (fluxo administrativo de aprovação).

**Impacto:** alerta de SLA de lead estourado, risco de churn, acesso negado, venda fechada,
meta e saúde de webhook — nada disso chega a ninguém, e o sistema não reclama.

---

## CR-17 — O inventário gerado afirma o contrário da realidade

### A-40 · [Alta] O inventário marca 71 funções vivas como "sem deploy"
**Camada:** infraestrutura / documentação · **Modo:** EXECUTADO · **Confiança:** confirmado

`inventario/estado/banco.json` levanta `edge_sem_deploy` (71 funções) e
`edge_limite_do_plano` ("100 publicadas de 100 permitidas"). **As duas afirmações são
falsas hoje.** EXECUTADO, duas sondas independentes com `OPTIONS` (preflight, sem efeito
colateral) e controle negativo:
- auditor: 171 funções do repositório → 167×200, 1×204, 1×400, 2×401, **0 ausentes**;
  nomes inventados (`funcao-que-nao-existe-xyz123`) → 404, validando o método;
- revisor da camada: as 71 listadas como "sem deploy" → **71 deployadas, 0 ausentes**,
  incluindo `new-device-alert`, `workflow-executor`, `sequence-record-reply` e `ranking-api`
  — exatamente as dos achados A-27, A-28, A-32 e A-42.

**Causa raiz:** o campo `edge_functions.publicadas` do inventário só é preenchido com um
token de Management API; sem ele o gerador registra ausência em vez de registrar
"não medido" (`inventario/estado/README.md` documenta `publicadas: null` nesse caso).

**Impacto:** quem lê o inventário trata 71 endereços **vivos e expostos** como código
morto, e o alerta de limite de plano manda otimizar algo que não é problema. A premissa de
`AGENTS.md` §7 ("171 no repo, plano limita a 100 deployadas") não corresponde ao medido —
**não verificado** se o limite do plano mudou ou nunca foi atingido (exigiria a Management
API, que responde 401 para este projeto).

### A-41 · [Baixa] Quatro formatos de erro e uma configuração morta na camada de funções
**Camada:** backend · **Modo:** RASTREADO · **Confiança:** confirmado

- `_shared/http-envelope.ts` existe e é usado por **3 de 171** funções. Convivem ao menos
  quatro formatos: `{error}`, `{ok:false, error}`, `{error, hint}`, `{code, message}` —
  dificulta tratamento no front e correlação de incidente.
- `_shared/rate-limit.ts:24-25` declara `bypassAuthenticated?: boolean`, mas
  `checkRateLimit` (`:97-140`) **nunca lê o campo**; o comentário de cabeçalho (`:5`)
  descreve comportamento inexistente. As 4 funções que passam a opção passam `false`, então
  não há impacto hoje. Sorte: se o bypass funcionasse, a chave pública (A-26) o acionaria.
---

## CR-18 — Policy permissiva anula policy restritiva na mesma tabela

### A-43 · [Crítica] Dados de desempenho, previsão e aprovação comercial são legíveis por qualquer usuário logado
**Camada:** banco · **Modo:** RASTREADO (SCHEMA de produção, 2026-11-17) · **Confiança:** confirmado

No Postgres, policies `PERMISSIVE` se combinam com **OR**: basta uma `USING (true)` para a
tabela inteira ficar visível, por mais restritivas que sejam as outras. O repositório
descobriu isso e corrigiu — em duas tabelas:
```
supabase/migrations/20261119700000_fix_rls_sales_activities_using_true.sql:1-13
-- fix(security): remove policies permissivas de sales/activities (CWE-284)
-- Por OR policy no RLS do Postgres, qualquer policy permissiva expoe a linha. Isso
-- permitia que QUALQUER usuario autenticado lesse custos/margens e inserisse em
-- sales e activities, anulando as policies role-based restritivas
```
O fix dropou 4 policies, **só de `sales` e `activities`**, e parou ali. Parser sobre
`supabase/schema.sql` encontra **116 policies com `USING (true)`/`WITH CHECK (true)`**: 110
para `authenticated` e 6 para `service_role` (estas inofensivas — `service_role` ignora RLS).

O caso mais claro, verificado de forma independente pelo auditor e pelo revisor da camada —
`public.nps_surveys`, pesquisa de satisfação com `salesperson_id`:
```
supabase/schema.sql:29125  "Authenticated users can view nps surveys"  FOR SELECT TO authenticated  USING (true)
supabase/schema.sql:29149  nps_surveys_select_owner_or_manager         FOR SELECT TO authenticated
                             USING (salesperson_id = get_current_salesperson_id() OR is_admin_or_manager(auth.uid()))
```
A segunda é decorativa. E isso **contradiz a documentação**: `docs/RLS_MATRIX.md` declara,
na linha de `nps_surveys`, que `salesperson` vê "próprios".
Mesmo padrão em `public.commercial_approval_requests` (aprovação de desconto e preço):
`supabase/schema.sql:27552` (restritiva, por `requester_id`) × `:27556` ("Ver solicitações",
`USING (true)`).

Outras tabelas sensíveis com `SELECT … USING (true)` para qualquer autenticado:

| Tabela | linha em `schema.sql` | Por que importa |
|---|---|---|
| `entity_versions` | `:28356` | histórico de versões de **qualquer** entidade; a coluna `data jsonb NOT NULL` (`:2485`) guarda o registro inteiro — contorna o escopo de `sales`/`clients` |
| `nps_surveys` | `:29125` | feedback de cliente de terceiros |
| `commercial_approval_requests` | `:27556` | aprovação comercial (dinheiro) |
| `deal_probability_scores`, `deal_health_history`, `deal_stage_transitions`, `forecast_snapshots`, `forecast_accuracy`, `forecast_confidence_scores` | `:28021`, `:27967`, `:28070`, `:28608`, `:28563`, `:28574` | valor e previsão de negócio de todo o time |
| `quota_attainment_forecasts`, `quota_attainment_predictions`, `quota_attainment_alerts`, `quota_attainment_actions` | `:29869`, `:29884`, `:29858`, `:29847` | atingimento de meta individual |
| `call_coaching_scorecards`, `coaching_opportunities`, `call_conversation_metrics`, `skill_assessments`, `salesperson_coaching_aggregates` | `:27020`, `:27453`, `:27031`, `:30828`, `:30483` | avaliação de desempenho individual (dado pessoal) |
| `products` | `:29718` | `price` legível por todos (o custo fica em `default_cost`) |
| `external_seller_map` | `:28457` | mapa de vendedor externo |

**Leitura honesta:** boa parte das 110 é intencional e de baixo risco — tabelas de
referência e configuração (`pipeline_stages`, `products`, `race_*`, `leagues`,
`feature_flags`, `achievements`, `cadences`, `playbooks`). `webhook_inbound_log` (`:31533`)
expõe só metadados, sem payload. O achado **não** é "116 bugs": é que a correção de 19/11
tratou 2 tabelas e não varreu as demais, deixando pelo menos 14 tabelas com dado de
desempenho individual, previsão de receita e aprovação comercial visíveis para qualquer
pessoa logada — inclusive onde já existe a policy restritiva certa.

**Confiança:** confirmado no schema de produção (17/11) e não alterado depois — nenhuma das
19 migrations posteriores a `20261117090000` cita `nps_surveys`,
`commercial_approval_requests`, `entity_versions` ou `intent_audit_logs`.
**Não executado:** sem sessão autenticada, nenhuma linha de terceiro foi lida de fato.

### A-44 · [Média] Qualquer usuário logado forja a trilha de auditoria de intenção
**Camada:** banco · **Modo:** RASTREADO (SCHEMA) · **Confiança:** confirmado

```
supabase/schema.sql:28736  "Authenticated users can insert intent audit logs"  FOR INSERT TO authenticated  WITH CHECK (true)
supabase/schema.sql:28748  "Users can only insert their own intent logs"        FOR INSERT TO PUBLIC         WITH CHECK (auth.uid() IS NOT NULL)
```
A policy de `:28736` não amarra nenhuma coluna ao chamador, e a tabela **não tem coluna de
autor** (`supabase/schema.sql:2868-2874`: `id`, `lead_id`, `event_type`, `details jsonb`,
`created_at`, `rule_applied jsonb`).

**Impacto:** a trilha de auditoria de intenção de lead não serve como prova — qualquer
usuário insere evento arbitrário para qualquer lead, sem deixar autoria.

### A-45 · [Baixa] Defesa em profundidade desigual entre tabelas "negar tudo"
**Camada:** banco · **Modo:** EXECUTADO + RASTREADO · **Confiança:** confirmado

`daily_challenge_rotations` e `_internal_secrets` mantêm o grant para `anon`
(`supabase/schema.sql:32611`, `:32192`) e dependem **só** da policy `USING (false)`;
`geocode_cache` teve o grant revogado e depende de grant **e** RLS (`:32868`, só
`service_role`). EXECUTADO: `daily_challenge_rotations` → HTTP 200 `[]` e
`_internal_secrets` → HTTP 200 `[]` (grant existe, RLS nega as linhas); `geocode_cache` →
HTTP 401 `42501` (sem grant).
Correlato: `webhook_dispatch_rate` tem RLS ligada e **zero policy** no schema de produção —
criada por `20261117050000`, depois da migration que limpou esse lint nas outras duas. Risco
prático nulo (todo acesso passa por `check_webhook_rate_limit`, `SECURITY DEFINER`,
`supabase/schema.sql:12824-12856`, e o grant foi revogado), mas o alerta volta ao painel.

**Impacto:** apagar a policy por acidente abre `daily_challenge_rotations` e
`_internal_secrets` ao público; em `geocode_cache`, não.

---

## CR-19 — A única rede de segurança do schema está desatualizada

### A-46 · [Alta] Restaurar o banco hoje traz de volta um bug conhecido e perde 19 correções
**Camada:** banco / risco de perda de dado · **Modo:** RASTREADO (SCHEMA + LIVE) · **Confiança:** confirmado

O cabeçalho do próprio arquivo explica por que ele é crítico:
```
supabase/schema.sql:7-10
-- Para que serve: reconstruir o schema numa base vazia. As 692 migrations em
-- supabase/migrations/ NAO replayam (271 arquivos falham — ver
-- docs/agentes/replay-do-repo-261117.md), e o projeto nao tem PITR nem backup
-- restauravel listado. Este arquivo e a rede de seguranca do schema.
```
Mas ele foi gerado em 17/11 e ficou parado (último commit `Tue Nov 17 21:19:15 2026`;
ledger termina em `20261117090000`). Duas provas independentes de desatualização:
- `supabase/schema.sql:6821` ainda tem `scheduled_sends_status_check CHECK (status = ANY
  (ARRAY['pending','sent','failed','cancelled']))` — **sem `processing`**. Em produção as
  colunas `attempts`/`next_retry_at` existem (LIVE, HTTP 200), o que só ocorre com
  `20261120000000` aplicada, e essa migration substitui exatamente esse CHECK. Restaurar de
  `schema.sql` recria o bug que ela descreve
  (`20261120000000_t15_multichannel_retry.sql:2-3`: *"o processador grava 'processing' no
  claim, mas o CHECK atual nao inclui esse valor -> 23514 em todo claim"*).
- `grep -c "idx_semantic_index_embedding_hnsw\|cron_job_last_run" supabase/schema.sql` = **0**:
  faltam o índice HNSW (`20261123000000`) e as duas tabelas espelho de cron
  (`20261125100000`), confirmadas vivas por LIVE.

**Causa raiz:** o artefato de recuperação é gerado manualmente e não há gate que o exija
atualizado quando uma migration entra.

**Impacto:** se o banco precisar ser reconstruído, o único artefato restaurável devolve um
bug de produção conhecido e perde 19 correções. **Não verificado** nesta sessão: a
afirmação do repositório de que não há PITR nem backup restaurável (exigiria o painel ou a
Management API).

### A-47 · [Média] O ledger afirma que uma migration rodou, e o objeto não existe
**Camada:** banco · **Modo:** EXECUTADO + RASTREADO · **Confiança:** confirmado

`supabase/migrations/20260104182000_additional_tables.sql` cria `call_tracking`, e **nenhum
arquivo do repositório tem `DROP TABLE … call_tracking`**. A tabela não existe em produção:
LIVE `GET /rest/v1/call_tracking` → HTTP 404 `PGRST205`. Também ausente de `schema.sql` e de
`banco.json`. Mesmo assim a versão foi inserida no ledger por
`20261117090000_marca_594_migrations_como_aplicadas.sql:20-22`, que admite o caso:
*"call_tracking nao tem DROP e nao existe -> divergencia conhecida"*.

**Impacto:** hoje baixo (nada no código usa `call_tracking`; o Twilio usa
`twilio_call_sessions`, `docs/DEAD_TABLES.md`). O risco é um ambiente novo montado pelo
ledger não recriar a tabela e qualquer código que a assuma falhar em silêncio.

---

## CR-20 — Escrita do navegador em tabela que não tem policy de escrita

### A-48 · [Alta] Seis telas gravam em tabelas onde só existe policy de leitura
**Camada:** banco / frontend · **Modo:** RASTREADO · **Confiança:** hipótese forte (não reproduzido com sessão autenticada)

| Tabela | Operação e chamada | Policies existentes |
|---|---|---|
| `cadence_alert_templates` | `UPDATE` `src/components/sales/cadence/CadenceAlertConfig.tsx:90-92`, `INSERT` `:97-98`, `DELETE` `:113-115` | **só** `SELECT TO authenticated USING (true)` (`supabase/schema.sql:26924`) |
| `cadence_outcome_rules` | `INSERT` `src/components/sales/cadence/CadenceOutcomeConfig.tsx:111`, `DELETE` `:123` | **só** `SELECT` (`:26952`) |
| `integration_logs` | `INSERT` `src/components/dashboard/IntegrationStatusPanel.tsx:171` | **só** `SELECT TO PUBLIC USING (is_admin_or_manager(auth.uid()))` (`:28711`) — nem admin insere |
| `lead_score_trends` | `INSERT` `src/components/lead-scoring/LeadScoringDashboard.tsx:176-179` | **só** `SELECT` (`:28918`) |
| `follow_up_audit_logs` | `UPDATE` de `retry_count`/`status` `src/pages/FollowUpAudit.tsx:134-140` | `INSERT` (`:28507`) + `SELECT` (`:28511`), **sem `UPDATE`** |
| `chat_messages` | `DELETE` `src/hooks/sales/useSalesAssistant.ts:302` | `INSERT` (`:27308`) + `SELECT` (`:27314`), **sem `DELETE`** |

Nenhuma das 50 migrations acima do ledger cria policy de escrita para essas tabelas.
Agravante de UX em um dos casos: `src/pages/FollowUpAudit.tsx:141` usa `if (!error)` — o
erro é ignorado e a falha é silenciosa.

**Impacto:** configurar alerta de cadência, configurar regra de desfecho e excluir conversa
do assistente provavelmente não funcionam para ninguém; marcar follow-up como enviado não
persiste e não avisa; o teste de integração do painel e o registro de tendência de lead
falham com erro visível.

**O que falta para confirmar:** reproduzir cada chamada com uma sessão autenticada e
observar o `42501`. O caminho está rastreado de ponta a ponta, mas o erro não foi visto.

---

## CR-21 — A cadeia de dinheiro não tem escala única nem restrições

### A-49 · [Alta] Valores monetários convivem em três escalas e o orçamento usa `numeric` livre
**Camada:** banco · **Modo:** RASTREADO (SCHEMA) · **Confiança:** confirmado

`docs/SCHEMA_CONVENTIONS.md:16-17` manda `NUMERIC(15,2)` para dinheiro. O estado real:
```
supabase/schema.sql:3871-3874  quote_items.unit_price/discount_amount/total_price  numeric(15,2)  ← convenção
supabase/schema.sql:3913,3926-3928  quotes.total_value/subtotal/discount_*          numeric        ← SEM escala
supabase/schema.sql:4296       sales.amount                                         numeric(12,2)  ← legado
supabase/schema.sql:3307-3309  orders.subtotal/shipping/total                       numeric(12,2)
supabase/schema.sql:1748-1750  commissions.base_amount/commission_amount            numeric(12,2)
supabase/schema.sql:1759       commissions.sdr_commission_amount                     numeric        ← SEM escala
supabase/schema.sql:3683       products.price                                        numeric        ← SEM escala
supabase/schema.sql:1552       clients.total_value                                   numeric        ← SEM escala
```
Totais: **53 colunas de dinheiro com `numeric` sem escala**, 27 com `numeric(12,2)`, 7 com
`numeric(14,2)`, 5 com `numeric(5,2)`. `numeric` sem escala aceita qualquer número de casas;
`numeric(12,2)` arredonda na gravação. As duas se encontram no código que roda:
```
supabase/schema.sql:13590-13594  (public.convert_quote_to_order, trigger de quotes)
INSERT INTO public.orders ( … subtotal, shipping, total … )
VALUES ( … COALESCE(NEW.subtotal, NEW.total_value, 0), 0, COALESCE(NEW.total_value, 0) … )
```
`NEW.subtotal`/`NEW.total_value` são `numeric` livre e entram em colunas `numeric(12,2)` —
arredondamento implícito na conversão de orçamento em pedido.
Fora da convenção também: `sdr_alert_configs.threshold_value` é `double precision`
(`supabase/schema.sql:4598`).

**Impacto:** o total do orçamento pode não bater com a soma dos itens nem com o pedido
gerado, na casa dos centavos, e a diferença aparece no relatório sem rastro de origem.

### A-50 · [Média] As três restrições de valor entraram sem validar o histórico, e as tabelas centrais não têm nenhuma
**Camada:** banco · **Modo:** RASTREADO (SCHEMA) · **Confiança:** confirmado

```
supabase/schema.sql:6657  quotes.quotes_total_value_non_negative   CHECK (total_value IS NULL OR total_value >= 0)   NOT VALID
supabase/schema.sql:6530  orders.orders_total_non_negative         CHECK (total IS NULL OR total >= 0)               NOT VALID
supabase/schema.sql:6465  lead_scores.lead_scores_score_range      CHECK (score IS NULL OR score BETWEEN 0 AND 100)  NOT VALID
```
A própria migration previu a segunda metade e ela não foi feita:
`supabase/migrations/20261116223100_constraints_integridade_negocio.sql:30-33` —
*"Os tres CHECK entram como NOT VALID (…) Depois de limpar o historico, validar com
ALTER TABLE public.<t> VALIDATE CONSTRAINT <c>;"*.
Lacunas na mesma cadeia: `commissions` tem PK, `UNIQUE (sale_id, salesperson_id)` e CHECK de
status, mas **nenhum CHECK de valor** — `base_amount`, `percentage` e `commission_amount`
aceitam negativo; `quote_items` tem **somente a PK**, com 1.057 linhas e nenhuma restrição
sobre `unit_price`, `total_price` ou `quantity`. O padrão existe e não foi estendido:
`sales` tem `sales_amount_positive` e `products` tem `products_price_positive`.

**Impacto:** ninguém sabe se há orçamento ou pedido com total negativo no histórico, e nada
impede uma comissão negativa de ser gravada amanhã.

### A-51 · [Baixa] Trilha de conversão orçamento → venda → pedido sem chave estrangeira
**Camada:** banco · **Modo:** RASTREADO (SCHEMA) · **Confiança:** confirmado

Das 420 FKs do schema, nenhuma aponta para tabela inexistente e nenhuma é `NOT VALID`.
O inverso: 27 colunas `*_id uuid` cuja tabela-alvo existe e que não estão em nenhuma FK —
e só 6 em tabela com dado. A que merece atenção é `quote_conversion_audit` (216 linhas,
três ids soltos: `quote_id` `:3849`, `sale_id` `:3850`, `order_id` `:3851`). Nas de log
(`quote_sync_inbound_log.quote_id` `:3888`, `quotes_inbound.quote_id` `:3955`) a ausência é
defensável — devem sobreviver à exclusão do orçamento, e `quotes`/`orders` usam
exclusão lógica.

**Impacto:** nada no banco impede que a trilha de conversão aponte para um registro que não
existe. **Não verificado** se há órfão de fato (exige `SELECT`).

---

## CR-22 — Peso morto acumulado no banco

### A-52 · [Média] Catorze grupos de índice exatamente duplicado
**Camada:** banco · **Modo:** RASTREADO (SCHEMA) · **Confiança:** confirmado

Dos 889 índices do schema de produção, há **14 grupos com definição idêntica** (mesma
tabela, mesmas colunas, mesma ordem). Cada duplicata custa escrita em todo `INSERT`/`UPDATE`
e espaço, sem acelerar leitura nenhuma.

### A-53 · [Média] Cento e onze tabelas carregam dois gatilhos idênticos de `updated_at`
**Camada:** banco · **Modo:** RASTREADO (SCHEMA) · **Confiança:** confirmado

Dos 386 gatilhos, **111 tabelas têm dois gatilhos iguais** de `updated_at` — a mesma função
roda duas vezes em cada atualização de linha, nas tabelas mais escritas do sistema.

### A-54 · [Baixa] Trinta e uma tabelas vazias e sem uso, com 55 policies e 15 gatilhos
**Camada:** banco · **Modo:** RASTREADO (SNAPSHOT + SCHEMA) · **Confiança:** confirmado

31 tabelas com 0 linhas, sem citação em função ou view do banco e sem nenhum `.from()` no
código: 901.120 bytes, **55 policies** e **15 gatilhos** de manutenção morta. Não é prova de
que podem ser apagadas (`inventario/estado/README.md` avisa exatamente isso), mas é
superfície que alguém precisa reler em cada auditoria de RLS.
---

## CR-23 — O caminho até produção não tem freio humano

### A-55 · [Crítica] Deploy de estrutura de banco e de todas as funções roda sem ninguém autorizar
**Camada:** infraestrutura / CI · **Modo:** EXECUTADO (API do GitHub) · **Confiança:** confirmado

`.github/workflows/deploy.yml:9-11` afirma, no cabeçalho, que existe gate humano:
*"O job `deploy` roda no environment 'production': enquanto o ambiente tiver 'Required
reviewers' configurado em Settings → Environments, todo deploy fica pendente até um
aprovador humano liberar (approval gate real do GitHub)."*
A API diz o contrário — EXECUTADO, verificado de forma independente pelo auditor e pelo
revisor da camada:
```
GET /repos/adm01-debug/Promo_Champions_V2.1/environments/Production
→ "protection_rules": [], "deployment_branch_policy": null, "created_at": "2026-09-05T17:15:01Z"
```
Não há aprovador nem restrição de branch. E o job é disparado por `workflow_dispatch` **ou
por push de tag `v*`** (`deploy.yml:38-41`), executando sem aprovação:
```bash
# deploy.yml:144-147  — republica TODAS as funções
for FN in $(find supabase/functions -maxdepth 2 -name index.ts -printf '%h\n' | …); do
  supabase functions deploy "$FN" --yes --project-ref usyxfpqlsspldubptrdl
done
# deploy.yml:159-160  — aplica migrations no banco de produção
supabase link --project-ref usyxfpqlsspldubptrdl
supabase db push --linked
```
As tags `v*` são criadas **automaticamente** pelo `release-please` ao mergear a PR de release
(`release-please.yml:3-6`).

**Causa raiz:** o gate existe apenas no comentário do YAML; o environment foi criado em
2026-09-05 e nunca recebeu `protection_rules`.

**Impacto:** mergear a PR de release pode alterar a estrutura do banco de produção e
republicar as 171 funções do servidor sem ninguém autorizar. Contraria `AGENTS.md` §5.8
("Deixe aberta e chame o dono: DDL/migration em produção") e §7 (que manda aplicar DDL pelo
MCP, não por `supabase db push`).

### A-56 · [Alta] O portão de cobertura reprova apenas se a cobertura cair abaixo de 4,6%
**Camada:** CI / testes · **Modo:** EXECUTADO · **Confiança:** confirmado

O job `test`, que o `CI Gate` exige, roda dois gates de cobertura
(`.github/workflows/pr-checks.yml:282-288`). O piso é o próprio
`coverage-baseline.json` da raiz:
```json
{ "lines": 4.64, "branches": 3.72, "functions": 3.4, "statements": 4.57 }
```
com tolerância `EPSILON = 0.05` pp (`scripts/check-coverage-ratchet.mjs:17`) e reprovação só
quando `delta < -EPSILON` (`:50`). Os thresholds do próprio Vitest são ainda menores —
`vitest.config.ts:64-69`: `lines: 2.5, branches: 2.5, functions: 2.0, statements: 2.5`.

**Causa raiz:** a linha de base foi fixada no valor medido em 2026-09-28 e o mecanismo só
impede regressão, não exige progresso.

**Impacto:** o PR template e o nome do gate ("Coverage ratchet (nunca cai)") sugerem
proteção por teste; na prática, ~95% do código pode quebrar sem que nenhum gate perceba.

### A-57 · [Alta] O verificador de tipos estritos passa verde se o `tsc` não rodar
**Camada:** CI · **Modo:** RASTREADO · **Confiança:** confirmado

`scripts/check-typecheck-baseline.mjs:29-34` executa o `tsc` via `spawnSync` e **nunca**
inspeciona `result.status` nem `result.error`; a única fonte de verdade é um regex sobre o
texto de saída (`:36-44`). Se o `tsc` não existir, se `tsconfig.strict.json` desaparecer, se
o processo estourar o `maxBuffer` ou morrer por falta de memória, a saída não casa o regex,
`regressions` fica vazio e o script imprime sucesso (`:71`).

**Impacto:** uma falha de ambiente no CI é indistinguível de "nenhuma regressão de tipo".

### A-58 · [Alta] A chave que ignora a RLS entra no runner de um job que executa código da própria PR
**Camada:** CI / segurança · **Modo:** RASTREADO · **Confiança:** confirmado

`.github/workflows/pr-checks.yml:339-346` declara, **no nível do job** `deno-tests`:
```yaml
env:
  VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
  VITE_SUPABASE_PUBLISHABLE_KEY: ${{ secrets.VITE_SUPABASE_PUBLISHABLE_KEY }}
  SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```
Estando no job, o segredo está no ambiente de **todos** os steps, incluindo
`deno install --frozen=false` (`:364`) e os dois executores de suítes escritas na branch da
PR (`:367`, `:370`). O repositório tem o guard correto em outro workflow —
`.github/workflows/cron-monitoring.yml:40` —, mas `pr-checks.yml` não o tem.
Forks não recebem segredos (a plataforma bloqueia) e `.github/ENVIRONMENTS.md` chama a
ausência do guard de intencional por esse motivo — o que resolve o fork, **não** o caso
interno: qualquer branch interna, humana ou de agente, recebe a chave `service_role` de
produção no ambiente de um processo cujo código vem da própria PR.
Exposição maior que o necessário: o tier `unit` é declarado "self-contained"
(`pr-checks.yml:331`) e não precisa do segredo.

**Impacto:** a chave que ignora a RLS do banco de produção fica alcançável por código não
revisado. Contraria `AGENTS.md` §2.8.

### A-59 · [Média] Credenciais JWT versionadas em repositório público, e o gate não as detecta
**Camada:** CI / segurança · **Modo:** EXECUTADO · **Confiança:** confirmado · **valores nunca registrados**

EXECUTADO (`git grep` por padrão de JWT, só contagem): **6 arquivos** com uma credencial
cada — `supabase/migrations/20260418124334_…sql:56`, `20260512213243_…sql:74`,
`20260512214007_…sql:37`, `20260726202421_…sql:15`, `20260726202545_…sql:12` e
`scripts/verify-dispatcher-request-id.sh:22`. Todas são JWT com `role=anon` de projetos
Supabase **que não são o oficial** (`saejqkojleeaxzrslzfg`, `rapjswienfhkobhlamxb`).
O gate não pega: `scripts/security/check-no-committed-service-role.ts:38-47` só reporta JWT
cujo payload tem `role === "service_role"`. Também não cobre `sb_publishable_*` nem URLs de
conexão. Confirmado que **não** há `sb_secret_*` versionado (grep vazio).

**Delimitação que eu verifiquei, e que baixa a severidade:** o revisor da camada levantou a
hipótese de haver função `SECURITY DEFINER` em produção chamando
`rapjswienfhkobhlamxb.supabase.co` com a credencial embutida
(`20260726202421_…sql:12-15`). EXECUTADO:
`grep -c "rapjswienfhkobhlamxb\|saejqkojleeaxzrslzfg" supabase/schema.sql` = **0** — essas
funções **não existem** no schema de produção (introspecção de 17/11). O risco é histórico,
não ativo. Chave `anon` é pública por desenho, então o dano direto depende da RLS **daqueles**
projetos, que não são deste sistema.

**Impacto:** o PR template promete "nenhum secret/credencial no código-fonte" e o gate que
deveria garantir isso ignora tudo que não seja `service_role`. O repositório é público.

### A-60 · [Média] O Deploy Pipeline fica verde sem ter feito deploy, e o health check pós-deploy só avisa
**Camada:** CI / deploy · **Modo:** RASTREADO · **Confiança:** confirmado

`.github/workflows/deploy.yml:175-176` coleta o status do health check com
`|| true` e segue. Combinado com A-55 (nenhuma regra de proteção) e com o fato de os passos
de deploy serem condicionais, o workflow pode concluir com sucesso sem ter publicado nada —
e, se o health check falhar depois de publicar, apenas avisa.

**Impacto:** "deploy verde" não é prova de que o sistema está no ar e saudável.

### A-61 · [Média] O teto de complexidade "que só desce" subiu
**Camada:** CI · **Modo:** EXECUTADO · **Confiança:** confirmado

`package.json` → `lint:complexity` usa `--max-warnings 131`; o valor anterior registrado era
126. Um limite cuja regra declarada é "só desce" foi afrouxado para acomodar código novo.

### A-62 · [Baixa] `pull_request_target` com permissão de escrita e checkout do código da PR
**Camada:** CI / segurança · **Modo:** EXECUTADO (leitura integral do workflow) · **Confiança:** confirmado

`.github/workflows/dependabot-fix-lockfile.yml` é o **único** workflow do repositório com
`pull_request_target` (`:6`). Ele combina os três ingredientes do padrão clássico de
escalada: roda com os segredos do repositório base, declara `permissions: contents: write`
(`:15-16`) e faz checkout da branch da PR (`:29`, `ref: github.event.pull_request.head.ref`),
depois executando `deno install --frozen=false` (`:37`) sobre o conteúdo dessa branch.

**O que baixa a severidade (verificado, não suposto):** existe guard de ator —
`:23`, `if: github.actor == 'dependabot[bot]' || github.event_name == 'workflow_dispatch'`.
Só PRs abertas pelo próprio Dependabot e disparos manuais chegam ao job, e o Deno não executa
scripts de pós-instalação como o npm. O risco residual é a cadeia de suprimento: uma PR do
Dependabot que traga dependência comprometida executa `deno install` com `contents: write`.

**Impacto:** baixo hoje. Registrado porque é o único ponto do CI onde código de uma PR roda
com permissão de escrita, e porque qualquer afrouxamento do guard de ator (ou sua remoção em
uma refatoração) transforma isso em escalada direta.

### A-63 · [Média] Auto-merge do Dependabot entra pela mesma porta estreita do portão
**Camada:** CI · **Modo:** RASTREADO · **Confiança:** confirmado

O auto-merge do Dependabot depende do mesmo `CI Gate` de A-17/A-56 — ou seja, atualização de
dependência pode ser mergeada sem `security-audit`, sem e2e e sem `migrations-gate`.

### A-64 · [Média] Variáveis de ambiente lidas pelo código e ausentes do `.env.example`
**Camada:** infraestrutura · **Modo:** RASTREADO · **Confiança:** confirmado

`.env.example` lista apenas `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`, enquanto
o código (front e edge functions) lê outras variáveis e segredos. Quem monta um ambiente novo
seguindo o arquivo sobe um sistema parcialmente inerte — e A-39 (nenhum e-mail sai) é
exatamente esse sintoma em produção.

### A-65 · [Baixa] Mapas de código-fonte são gerados sem remoção garantida — mas não estão expostos
**Camada:** infraestrutura · **Modo:** EXECUTADO · **Confiança:** confirmado (hipótese inicial refutada)

A geração de source maps fica em `dist/` quando `SENTRY_AUTH_TOKEN` não existe, em vez de
ser removida após o upload — o que, publicado, devolveria o código-fonte original da
aplicação a qualquer visitante.
**Verifiquei em produção e a exposição NÃO existe.** EXECUTADO:
```
GET https://promo-champions-v2-1.vercel.app/assets/index-CaluqAC4.js.map            → 403
GET https://promo-champions-v2-1.vercel.app/assets/rolldown-runtime-COiEfhsA.js.map → 403
```

**Impacto:** nenhum hoje. Fica como higiene de build: a remoção do artefato não deve depender
da presença de um token.

### A-66 · [Baixa] `release-please` com `continue-on-error` no job inteiro
**Camada:** CI · **Modo:** EXECUTADO · **Confiança:** confirmado

`.github/workflows/release-please.yml:24` tem `continue-on-error: true` no nível do job: uma
falha na automação de release passa sem alarme.
---

## CR-24 — O menu e a regra de permissão discordam entre si

### A-67 · [Alta] SDR e Closer veem atalhos que sempre terminam em "Acesso Negado"
**Camada:** frontend · **Modo:** RASTREADO · **Confiança:** confirmado

`src/components/layout/sidebarMenuData.ts:165` (grupo "Análises" do SDR) e `:235` (do Closer)
publicam *Business Intelligence → `/ferramentas/bi`*, e a rota exige gestor
(`src/routes/AppRoutes.tsx:718-725`, wrapper `<Manager>`). `sidebarMenuData.ts:176` (grupo
"Vendas" do Closer) publica *Assinatura Digital → `/assinatura-digital`*, que também exige
gestor (`AppRoutes.tsx:407-414`). Nenhum item de menu é filtrado por papel:
`AppSidebar.tsx:113-131` renderiza tudo que a estrutura traz.

**Impacto:** todo SDR e todo Closer tem dois atalhos que só levam a "Acesso Negado", e cada
clique grava uma linha em `access_denied_logs` (`ProtectedRoute.tsx:33-40`), poluindo a
trilha de auditoria de segurança com falso positivo.

### A-68 · [Média] O modo "Gestão" do menu é escolhido pelo navegador, sem checar papel
**Camada:** frontend · **Modo:** RASTREADO · **Confiança:** confirmado

`AppSidebar.tsx:98-104` inicializa `viewMode` lendo `localStorage.sidebar_view_mode` e aceita
qualquer valor de `gestao|sdr|closer` **sem olhar o papel**; o seletor só é desenhado para
admin/gestor/híbrido (`:204`), mas o valor salvo continua valendo. `defaultViewMode`
(`:92-95`) também devolve `gestao` para quem não tem `salespeople.role` em
`sdr|closer|hybrid` (por exemplo `null` ou `dev`).

**Impacto:** para um vendedor nessa condição, metade do menu (26 itens que exigem
admin/gestor: `/metas`, `/vendedores`, `/analytics`, `/relatorios`, `/revops`, `/times`, …)
vira um gerador de "Acesso Negado". A autorização continua íntegra — o defeito é de
interface.

### A-69 · [Média] Nove telas rotuladas "Administração" também aceitam gestor
**Camada:** frontend / segurança · **Modo:** EXECUTADO (cruzamento menu × guard) · **Confiança:** confirmado

`adminOnlyItems` (`sidebarMenuData.ts:353-372`) é renderizado só para `userType === 'admin'`,
mas as rotas `/admin/comissoes`, `/admin/premiacoes`, `/admin/premiacoes/auditoria`,
`/admin/telemetria`, `/audit-logs`, `/sla-tracking`, `/lead-routing`, `/workflows` e
`/webhooks` usam o wrapper `Manager` — admin **ou** gestor (`AppRoutes.tsx:433-555`,
`:1012-1019`). Exclusivas de admin de fato são apenas `/admin`, `/admin/race-arena`,
`/usage-analytics`, `/feature-flags` e `/seguranca`.

**Impacto:** um gestor pode aprovar e pagar comissão, auditar premiação e mexer em webhook
digitando a URL, embora nunca veja o link. A regra de negócio sobre quem mexe em dinheiro
está declarada de dois jeitos diferentes no mesmo sistema — e o executor precisa perguntar ao
dono qual é a correta antes de alinhar.

### A-70 · [Alta] No celular o administrador não alcança nenhuma tela de administração
**Camada:** frontend · **Modo:** RASTREADO · **Confiança:** confirmado

`AppSidebar.tsx:287-301` renderiza o bloco "Administração" (`adminOnlyItems`, 14 itens:
`/admin`, `/seguranca`, `/feature-flags`, `/usage-analytics`, `/audit-logs`,
`/admin/comissoes`, `/admin/premiacoes[/auditoria]`, `/admin/telemetria`, `/webhooks`,
`/sla-tracking`, `/lead-routing`, `/workflows`, `/admin/race-arena`). O menu móvel
(`MobileDrawer.tsx:195-240`, arquivo de 265 linhas) renderiza apenas `mainItems`,
`groupedItems`, Notificações, Configurações e Sair — **não importa nem renderiza
`adminOnlyItems`**.

**Impacto:** administrador no telefone precisa digitar a URL na mão para aprovar comissão,
ver segurança ou mexer em uma chave de funcionalidade.

---

## CR-25 — Controles publicados que não fazem nada

### A-71 · [Média] Vinte botões sem ação em telas de gestão, preço e inteligência
**Camada:** frontend · **Modo:** EXECUTADO (varredura) + RASTREADO (leitura de cada um) · **Confiança:** confirmado

Sem `onClick`, `type="submit"`, `asChild` nem gatilho de diálogo:
`src/pages/WinLossAnalysisPage.tsx:40` ("Exportar Dados") e `:48` ("Filtros Avançados");
`src/pages/admin/AdminComercial.tsx:717` ("Filtrar") e `:724` ("Exportar");
`src/components/pricing/PricingHealthBanner.tsx:68` ("EXPORTAR AUDITORIA");
`src/components/purchase-intelligence/PurchasePredictionCard.tsx:292` ("Agendar"), `:298`
("Proposta"), `:323`; `EmptyStateGuide.tsx:69` ("Começar Configuração"), `:76` ("Ver
Documentação"); `DuplicateBlockAudit.tsx:44` ("Filtros"), `:51` ("Exportar");
`ClientPurchaseHistory.tsx:513`; `PurchaseHeatmapGrid.tsx:210`.

**Impacto:** o usuário clica em "Exportar", "Agendar" ou "Começar Configuração" e nada
acontece — sem erro, sem aviso.

### A-72 · [Média] O diálogo "Configurar IA" não grava nada
**Camada:** frontend · **Modo:** RASTREADO · **Confiança:** confirmado

`src/components/purchase-intelligence/IntelligenceSettings.tsx`: `Slider defaultValue={[75]}`
(`:54`), `Slider defaultValue={[85]}` (`:67`), `Select defaultValue="realtime"` (`:77`) e
`Switch defaultChecked` (`:101`) são todos **não controlados**, sem estado nem mutação;
"Resetar" (`:105`) e "Salvar Alterações" (`:108`) não têm `onClick`. Os percentuais ao lado
dos controles ("75%", "85%") são texto fixo (`:52`, `:65`) e não acompanham o cursor.

**Impacto:** a tela promete ajustar limiar de churn, de upsell e frequência de alerta; o
usuário ajusta, clica em salvar, o diálogo não fecha e nada foi gravado.

### A-73 · [Média] Campo de busca que não busca
**Camada:** frontend · **Modo:** EXECUTADO · **Confiança:** confirmado

Varredura de todos os `<Input>`/`<Textarea>` de `src/`: 52 candidatos, 51 ligados ao
formulário. O único solto é
`src/components/purchase-intelligence/DuplicateBlockAudit.tsx:38` —
`placeholder="Buscar por entidade ou tipo..."` sem `value` nem `onChange`. Na mesma tela, a
consulta (`:21-31`) também não trata erro.

### A-74 · [Média] O painel de Segurança mostra números inventados
**Camada:** frontend · **Modo:** RASTREADO · **Confiança:** confirmado

`src/pages/SecurityDashboard.tsx:139-151`: "Latência de Bloqueio **~12ms**", "Precisão por IP
**99,8%**" e "Proteção DDoS Ativa **L7 Shield**" são literais no JSX, não vêm de medição
nenhuma; o selo "Active Shields" (`:113-118`) também. Logo abaixo, `:153-158`, o botão "Ver
Logs Detalhados" não tem ação.

**Impacto:** a tela que o administrador usa para julgar a postura de segurança apresenta
valores fabricados como se fossem medição — é a pior combinação possível entre A-71 e dado
falso.

### A-75 · [Média] Botões de teste de gamificação publicados em produção
**Camada:** frontend · **Modo:** RASTREADO · **Confiança:** confirmado

`src/pages/Vendedores.tsx:261` renderiza `<CelebrationTestButtons />` sem condição. O
componente (`src/components/gamification/CelebrationTestButtons.tsx:15-46`) dispara animações
com dados falsos (`salespersonId: 'test-id'`, `salespersonName: 'Vendedor Teste'`) e
`triggerStreakMilestone` chega a emitir notificação do navegador
(`useLevelUpCelebration.ts:144-147` → `useCelebration.ts:18-28`). O repositório já tem o
invólucro `DevOnly` (`src/components/auth/DevOnly.tsx`), usado em `MainLayout.tsx:221` e
`App.tsx:113`, e **não** foi aplicado aqui.

---

## CR-26 — Portas de entrada ausentes e páginas de teste publicadas

### A-76 · [Média] Vinte e quatro rotas sem nenhuma porta de entrada, onze delas administrativas
**Camada:** frontend · **Modo:** EXECUTADO · **Confiança:** confirmado

24 rotas não têm item de menu **nem** link/`navigate` em `src/`. As que mais pesam:
`/admin/webhooks-alert-settings` (configurar alerta de webhook) e
`/admin/webhooks-alert-history` — enquanto `/admin/webhooks-timeline` e
`/admin/webhooks-dead-letters` estão no `AdminQuickLinks`; `/admin/solicitacoes-titular`
(pedidos de titular de dados, LGPD) e `/admin/supressao-emails` (opt-out) alcançáveis só
digitando a URL; e `/admin/retry-test-status` — uma página de teste de retentativa —
publicada em produção.
Em contrapartida, a saúde do roteamento é boa: 0 páginas carregadas e não roteadas, 0
imports mortos em `lazyPages.ts`.

**Impacto:** funcionalidade de conformidade (LGPD) e de operação de integração existe, foi
paga, e ninguém encontra.

---

## CR-27 — Estado do navegador aceito sem validação

### A-77 · [Alta] Um endereço errado quebra a página inicial do usuário de forma permanente
**Camada:** frontend · **Modo:** RASTREADO · **Confiança:** confirmado

`src/hooks/dashboard/useDashboardRedirect.ts:43-45` grava em
`localStorage.last_dashboard_section` **qualquer** segmento de `/dashboard/<x>`, sem validar
contra o `SECTION_MAP`. `src/pages/Index.tsx:135` só aceita
`performance|analises|competicao|inteligencia|engajamento|visao-geral`; qualquer outro cai em
`Navigate to="/404"` (`:146-147`) — e o efeito do hook já rodou, deixando o valor inválido
salvo. A partir daí, todo acesso a `/` ou `/dashboard` redireciona para
`/dashboard/<inválido>` (`:35-39`) → tela de não encontrado, até o usuário limpar o navegador.

**Impacto:** um link velho ou digitado errado quebra a página inicial daquele usuário, e ele
não tem como sair sozinho.

---

## CR-28 — Entrada de dados sem validação de conteúdo

### A-78 · [Alta] Importação de clientes embaralha colunas e não valida e-mail
**Camada:** frontend / dados · **Modo:** RASTREADO · **Confiança:** confirmado

`src/pages/ImportExport.tsx:66` e `:68` fazem `lines[0].split(delimiter)` e
`line.split(delimiter)` — divisão ingênua. Um campo entre aspas contendo o delimitador
(`"Empresa, Ltda"`) parte a linha e **desloca todas as colunas seguintes** (telefone cai em
e-mail, e assim por diante). O único filtro antes de gravar é `records.filter(r => r.name)`
(`:114`), e os campos vão direto para `clientService.importClients` (`:116-121`), sem
validação de formato e sem confirmação do volume. A exportação, no mesmo arquivo, é mais
cuidadosa (`sanitizeCsvCell`, `:107`).

**Impacto:** a base de clientes — dado pessoal — é contaminada em silêncio a partir de um CSV
exportado de qualquer outro sistema.

### A-79 · [Baixa] Valor zero de venda é barrado só no navegador
**Camada:** regras de negócio · **Modo:** RASTREADO · **Confiança:** confirmado

`src/components/sales/CreateSaleDialog.tsx:46-52` exige `num > 0`; a inserção vai direto para
a tabela (`src/services/salesService.ts:237-251`) e a restrição do banco é
`CHECK (amount >= 0)`
(`supabase/migrations/20260514211202_a6925846-148b-41a2-a354-f5391d6c5051.sql:53`).
Uma venda com valor `0` criada por qualquer outro caminho é aceita.

---

## CR-29 — Filtros e páginas públicas que escondem dado

### A-80 · [Baixa] Comissão sem nome de vendedor desaparece da tela de aprovação
**Camada:** frontend · **Modo:** RASTREADO · **Confiança:** confirmado

`src/pages/AdminComissoes.tsx:76-80`: o predicado é
`c.salespeople?.name?.toLowerCase().includes(termo) || c.sales?.client_name?.toLowerCase().includes(termo)`.
Com os dois campos nulos o resultado é `undefined` e a linha some — **mesmo com a busca
vazia**. A própria tabela prevê nome ausente (`:66` usa o fallback `'Vendedor'`).

**Impacto:** uma comissão cujo vínculo de vendedor ou de venda não vier preenchido fica
invisível justamente na tela onde se aprova pagamento.

### A-81 · [Média] A página pública da corrida não mostra nada para quem não está logado
**Camada:** frontend · **Modo:** EXECUTADO + RASTREADO · **Confiança:** confirmado

Rota pública `AppRoutes.tsx:235`. `src/pages/RaceSpectator.tsx:32-41` consulta
`race_spectator_view` e **descarta o erro** (`const { data } = await …`), caindo em "Nenhum
piloto na pista." (`:79`). A view é `security_invoker = true`
(`supabase/migrations/20260830000000_fix_race_leaderboard_status.sql:97-118`), então as
policies das tabelas-base valem para o papel `anon` — e
`20260831130000_harden_public_access_and_privileged_rpcs.sql:51-53` removeu as policies
abertas. EXECUTADO: `GET /rest/v1/race_spectator_view?select=car_id` com `Prefer: count=exact`
→ HTTP 200, `content-range: */0`.

**Impacto:** o "modo TV" público nunca exibe a corrida para quem não tem login, e mostra
"nenhum piloto" em vez de dizer que não há acesso.
**Ressalva honesta:** anônimo ver 0 linhas é fato medido; não foi possível confirmar que a
view tem linhas para usuário autenticado (sem SQL ao vivo).

### A-82 · [Média] `/vendedor/:id` não restringe papel e monta o filtro por concatenação
**Camada:** frontend / segurança · **Modo:** RASTREADO · **Confiança:** hipótese quanto ao impacto final

`AppRoutes.tsx:259` registra `/vendedor/:id` apenas como autenticado, sem item de menu. A
página monta o painel financeiro de qualquer vendedor: `VendedorDashboard.tsx:57-63`
(`salespeople.select('*')`), `:78`, `:87`, `:94` (`sales`), mais `EligibleBonusesCard`
(`:324`) e `CoachingProgressCard` (`:326`). As entradas são `VictoryFeedItem.tsx:143` (feed
que está no menu de **todos** os papéis) e `RankingGridItem.tsx:82`.
Dois problemas: (a) um SDR abre o painel de comissão e bônus de um colega pelo feed de
vitórias; (b) `id` vem de `useParams` sem validação de UUID e é interpolado em
`.or(\`salesperson_id.eq.${id},sdr_id.eq.${id},closer_id.eq.${id}\`)` — string de filtro do
PostgREST montada por concatenação.

**O que falta para confirmar:** o que de fato aparece depende das policies de
`sales`/`salespeople`/`commission_bonus_awards`. Confirmado é a ausência de restrição de
papel na rota e a interpolação sem validação.

### A-83 · [Baixa] Assinatura digital: ação principal é um esboço, e quem precisa não abre a página
**Camada:** frontend · **Modo:** RASTREADO · **Confiança:** confirmado

`src/hooks/useDigitalSignatures.ts:123-126` faz `sendForSignature` **sempre lançar** erro. A
página é honesta a respeito: mostra "Envio e assinatura eletrônica desativados"
(`AssinaturaDigital.tsx:269-277`) e deixa os botões desabilitados com rótulo acessível
(`:425-447`). O defeito é de camada: a rota está no menu do **Closer**
(`sidebarMenuData.ts:176`) e exige gestor (`AppRoutes.tsx:407-414`) — ver A-67.

### A-84 · [Baixa] Duas listas manuais de pré-carregamento de rota e um componente órfão
**Camada:** frontend · **Modo:** EXECUTADO · **Confiança:** confirmado

`src/routes/pagePrefetchMap.ts` (26 entradas, usado por `AppSidebar`) e
`src/components/navigation/NavLink.tsx:12-50` (36 entradas) fazem a mesma coisa, mantidas à
mão. Hoje ambas estão corretas; divergem na próxima rota nova.
Código morto real: `src/components/ui/level-up-celebration.tsx` (131 linhas, nunca importado;
o que roda é `LevelUpOverlay`) e `src/lib/orderTracking/stages.ts` (240 linhas, importado só
por teste).
---

## CR-30 — Atualização otimista com chave de cache que não corresponde

### A-85 · [Alta] Arrastar negócio, editar cliente ou produto não dá retorno imediato, e não há desfazer
**Camada:** hooks / estado · **Modo:** EXECUTADO (varredura) + RASTREADO · **Confiança:** confirmado

`setQueryData`/`setQueriesData` aparecem em 15 lugares de `src/`; **10 usam chave exata que
nunca corresponde à chave real da consulta** — e `getQueryData`/`setQueryData` casam por
chave exata, então `['pipeline-deals']` ≠ `['pipeline-deals', undefined]`:

| Consulta (definição) | Chave real | Mutação otimista | Chave usada |
|---|---|---|---|
| `src/hooks/crm/useClients.ts:18` | `['clients', filters]` | `useClients.ts:79,90,105,112` | `['clients']` |
| `src/hooks/usePipeline.ts:105` | `['pipeline-deals', filters]` | `usePipeline.ts:181,203,213` | `['pipeline-deals']` |
| `src/hooks/useProducts.ts:24` | `['products', filters]` | `useProducts.ts:167,180,212,223` | `['products']` |

Os três hooks são chamados **sem argumento** em produção
(`src/components/pipeline/PipelineBoard.tsx:93`, `src/pages/Pipeline.tsx:18`,
`src/components/sales/CreateSaleDialog.tsx:66`, `src/pages/ICP.tsx:34`,
`src/pages/Agenda.tsx:103`). Em `usePipeline.ts:178-214`, o
`getQueryData(['pipeline-deals'])` da linha 181 devolve `undefined`, o bloco
`if (previousDeals)` (`:185-204`) **nunca executa** — o comentário "Optimistic update for
smooth drag & drop" (`:177`) descreve algo que não acontece — e o `onError` (`:213`) grava
`undefined` numa chave que ninguém observa.

**Agravante no mesmo bloco:** o instantâneo é alterado no lugar.
`const newDeals = { ...previousDeals }` (`:186`) é cópia rasa — os arrays por estágio são a
**mesma referência** —, e `newDeals[stageId].splice(dealIndex, 1)` (`:193`) e
`movedDeal.status = newStage` (`:200`) modificam o objeto guardado como "anterior". Mesmo
corrigindo a chave, o desfazer restauraria um estado já corrompido.

**Prova de que é defeito e não escolha:** o padrão certo existe no mesmo repositório —
`src/hooks/tasks/useTaskMutations.ts:108-124` usa
`getQueriesData({ queryKey: ['tasks'] })` + `setQueriesData(...)` + restauração chave a chave
no `onError` (`:121-123`); `src/hooks/sales/useContactFrequencyRules.ts:128` reutiliza a
mesma fábrica de chave da consulta.

**Impacto:** com `refetchOnWindowFocus: false` e `networkMode: 'offlineFirst'`
(`src/App.tsx:38,47`), em rede ruim o quadro fica mostrando um estado que não é nem o antigo
nem o novo até o próximo recarregamento.

---

## CR-31 — Erro de uma consulta paralela é engolido e o número sai errado

### A-86 · [Alta] Previsão de receita e premiações calculam com dados faltando, sem nenhum aviso
**Camada:** hooks / regras de negócio · **Modo:** EXECUTADO (varredura) + RASTREADO · **Confiança:** confirmado

Varredura de `Promise.all` em que **alguns** `.error` são checados e outros não — 5
ocorrências, **todas em tela de número**:
```
src/hooks/dashboard/useGoalsDashboard.ts:60      não checa predictionsResult
src/hooks/gamification/useGamifiedProfile.ts:41  não checa salesRes, streakRes, leagueRes, badgeRes, kudosRes, matchupRes
src/hooks/reports/useSalesReport.ts:49           não checa spRes
src/hooks/useEligibleBonuses.ts:115              não checa salesRes, streakRes, allSalesRes
src/hooks/useWeightedForecast.ts:54              não checa scoresRes, stageHistoryRes, goalsRes, wonSalesRes, stageProbabilities
```
As duas mais caras:
- **`src/hooks/useWeightedForecast.ts:54-62,150-165`** — só `salesRes.error` é lançado
  (`:89`). Se `goalsRes` falhar, `monthlyGoal` vira 0 (`:161-164`) e o `confidenceScore`
  (`:181-190`) calcula `(currentRevenue / Math.max(1, monthlyGoal)) * 20` → com meta 0 o
  termo explode e o resultado é truncado em 100 pelo `Math.min`. **A tela mostra confiança de
  100% justamente quando a consulta de metas falhou.** Se `scoresRes` falhar, some o ajuste
  por score (`:73-76`); se `stageHistoryRes` falhar, some a penalização por estagnação
  (`:79-82`).
- **`src/hooks/useEligibleBonuses.ts:138`** — só `bonusesRes.error` é lançado; se a consulta
  de vendas do mês falhar, `mtdRevenue` = 0 (`:142-145`) e nenhuma premiação por marco é
  considerada atingida. Soma-se a A-07 e A-08.
- `src/hooks/reports/useSalesReport.ts:38-43` — sem `spRes`, o ranking da equipe, o de markup
  e os melhores negócios (`:54-56`) saem vazios ou sem nome, e o relatório parece apenas
  "sem dados".

**Impacto:** previsão de receita, confiança da previsão e ranking de equipe são apresentados
como corretos estando incompletos, e não há como o dono perceber: não há erro, não há aviso —
o número simplesmente sai menor, ou a confiança sai em 100%.

---

## CR-32 — Duas escritas sem transação

### A-87 · [Alta] Orçamento aprovado no banco com o negócio parado no funil
**Camada:** hooks / regras de negócio · **Modo:** RASTREADO · **Confiança:** confirmado

`src/hooks/useQuotes.ts:188-257` (`useUpdateQuoteStatus`): primeiro atualiza `quotes`
(`:209-216`, com trava otimista por `version`), depois, se houver `sale_id`, chama
`supabase.rpc('transition_sale_status', …)` (`:228-235`). Se a RPC falhar, **o orçamento já
está** com o novo status e a venda ficou no estágio antigo. O `onError` (`:246-252`) trata só
o conflito de trava; no ramo `else` não há compensação **nem invalidação de cache**, então a
lista continua exibindo o status antigo, que já não é o do banco.

**Contraste no mesmo arquivo:** `useConvertQuoteToSale` (`:351-431`) faz certo — uma única RPC
transacional (`fn_convert_quote_to_sale`, `:372`), classificação de erro e invalidação de
`quotes`, `quotes-summary`, `sales`, `pipeline-deals` e `orders` no `onSuccess` (`:410-416`).

**Impacto:** orçamento aprovado e negócio parado em "proposta", com a tela mostrando o status
velho. O relatório de pipeline e o de orçamentos divergem, e o usuário só vê "Erro ao
atualizar status".

### A-88 · [Alta] Preferência salva no servidor volta sozinha para o valor antigo
**Camada:** hooks · **Modo:** RASTREADO · **Confiança:** confirmado

`src/hooks/useSyncedSetting.ts:120-166`: `reconcile` é um `useCallback` com dependências
`[opts.key]` e a regra do lint suprimida logo acima (`:165`), mas **lê o estado `value`** em
dois pontos (`:143` e `:160`, `pushToServer(value, …)`). Com `opts.key` constante, a
identidade de `reconcile` nunca muda e o `value` capturado é o da **primeira renderização**.
O caminho do estrago (`:149-161`): depois que o usuário altera a preferência, `update`
(`:192-210`) grava local e faz `pushToServer(merged, ts)`; o servidor passa a ter
`updated_at === ts === localUpdatedAtRef.current`. No `reconcile` seguinte,
`serverNewer = !localUpdatedAt || serverUpdatedAt > localUpdatedAt` é **falso** (igualdade não
é maior), cai no ramo "local mais novo → enviar" e manda o `value` **da montagem**.
E `reconcile` roda com frequência: na montagem (`:170`), em
`SIGNED_IN`/`SIGNED_OUT`/`TOKEN_REFRESHED` (`:171-179` — a renovação de token do Supabase é
automática e periódica) e a cada volta de foco na aba (`:184-190`).
Tabela afetada: `user_app_settings` (`:99-110`). Consumidor hoje:
`src/hooks/win-loss/useAtRiskSettings.ts:111-117` (chave `winloss-at-risk`), usado em
`src/components/win-loss/AtRiskDealsFromPatterns.tsx:49`.

**Impacto:** o usuário ajusta os limiares de risco, a tela continua certa (o cache local
está), mas a cópia no servidor volta ao valor antigo na próxima troca de aba — e em outro
computador as configurações aparecem erradas, sem explicação.

**Nota de disciplina no mesmo arquivo:** `update` (`:192-210`) executa efeitos colaterais
**dentro do atualizador de estado** (`:200`, `:201`, `:203`), e o app roda em
`React.StrictMode` (`src/App.tsx:87`), que invoca atualizadores duas vezes em
desenvolvimento.

---

## CR-33 — Cache que não é invalidado e escrita duplicada

### A-89 · [Média] O contador de tarefas de follow-up cobra trabalho já feito
**Camada:** hooks · **Modo:** EXECUTADO (grep) · **Confiança:** confirmado

A consulta `src/hooks/cadences/useTodaysQuoteCadenceTasks.ts:23` alimenta o contador do topo
(`src/components/organisms/DesktopTopBar.tsx:78`), e nenhuma mutação de cadência de orçamento
invalida essa chave (`src/hooks/cadences/useQuoteCadenceMutations.ts:5-10`,
`useCadenceQueries.ts:173`). Com `refetchOnWindowFocus: false` (`src/App.tsx:38`), o número
não se corrige sozinho.

**Impacto:** o vendedor conclui as tarefas e o contador continua cobrando as mesmas pela
sessão inteira.

### A-90 · [Média] Dois ganchos diferentes marcam a mesma etapa de playbook e invalidam caches distintos
**Camada:** hooks · **Modo:** RASTREADO · **Confiança:** confirmado

`src/hooks/playbooks/usePlaybookMutations.ts:6-50` e
`src/hooks/sales/useSalesEnablement.ts:257-295` escrevem na mesma tabela com convenções
diferentes e invalidam chaves diferentes. Consumidores:
`src/components/pipeline/DealCard.tsx:96`, `DealPlaybookModal.tsx:42` de um lado;
`src/components/enablement/SalesEnablementHub.tsx:396`, `PlaybookExecutionDialog.tsx:16-20`
do outro.

**Impacto:** marcar uma etapa em uma tela não atualiza a outra — o mesmo negócio aparece com
checklist diferente conforme a porta de entrada. Quem consertar corre o risco de trocar a
convenção e inverter marcações em massa.

### A-91 · [Média] O aviso de XP anuncia um valor que pode não ter sido creditado
**Camada:** hooks / gamificação · **Modo:** RASTREADO · **Confiança:** confirmado

`src/hooks/sales/useSalesRealtime.ts:107-128` e `src/hooks/salesRealtimeUtils.ts:86-132`
calculam o XP **no cliente** e exibem o aviso independentemente do resultado da RPC que
credita.

**Impacto:** o vendedor vê "+150 XP" em uma venda que não creditou XP nenhum, ou creditou
outro valor — a gamificação deixa de bater com o ranking.

### A-92 · [Média] Recompensa de cadência é promessa morta: falta o provedor de contexto
**Camada:** hooks / gamificação · **Modo:** RASTREADO · **Confiança:** confirmado

`src/components/cadences/quote/QuoteCadenceDetailDrawer.tsx:36,64,86` usa o
`GamificationContext` para conceder +15 XP ao concluir a tarefa, mas o contexto não tem
provedor montado na árvore (`src/contexts/GamificationContext.tsx:4,23` — o valor padrão é
inerte).

**Impacto:** concluir uma tarefa de cadência de orçamento promete XP no código e não entrega
nem o aviso.

### A-93 · [Média] A conversa do assistente pode não ser gravada, e o usuário não sabe
**Camada:** hooks · **Modo:** RASTREADO · **Confiança:** confirmado

`src/hooks/sales/useSalesAssistant.ts:120-151`: a falha ao persistir a mensagem é engolida.

**Impacto:** a conversa aparece na tela e desaparece ao recarregar, sem aviso — para o
usuário, o sistema perdeu o histórico. (Ligado a A-48: a exclusão de `chat_messages` também
não tem policy.)

### A-94 · [Média] "Probabilidade de fechamento" pode ser a análise do servidor ou um palpite local
**Camada:** hooks / regras de negócio · **Modo:** RASTREADO · **Confiança:** confirmado

`src/hooks/useDealProbability.ts:10-20` cai silenciosamente para a heurística local de
`src/lib/stageProbabilities.ts:39-61` quando a análise do servidor não vem, sem marcar a
diferença na interface.

**Impacto:** decisão de priorização tomada sobre um número cuja origem o usuário não conhece.

### A-95 · [Média] Cinquenta supressões da regra de dependências, todas com a mesma justificativa
**Camada:** hooks · **Modo:** EXECUTADO · **Confiança:** confirmado

50 ocorrências de `// eslint-disable-next-line react-hooks/exhaustive-deps` com o mesmo
comentário genérico ("dependencias intencionais (comportamento pre-existente verificado)"),
por exemplo `src/hooks/useSyncedSetting.ts:165` e `src/hooks/race/useRaceReactions.ts:64`.
A-88 é exatamente o bug que essa regra pegaria.

**Impacto:** a checagem automática que pegaria a classe de defeito mais comum deste tipo de
sistema está desligada atrás de um comentário copiado, e não há como distinguir supressão
examinada de supressão em massa.

### A-96 · [Baixa] Chaves de cache por usuário sem o usuário na chave
**Camada:** hooks · **Modo:** EXECUTADO · **Confiança:** confirmado

`src/hooks/useCommissions.ts:33`, `src/hooks/race/useMyRaceCar.ts:41`,
`src/hooks/cadences/useTodaysQuoteCadenceTasks.ts:23`, `src/hooks/dialer/useClickToCall.ts:18`,
`src/hooks/gamification/useLeagues.ts:153`, `src/hooks/race/useRaceUnlocks.ts:13`.

**Impacto:** nenhum hoje, porque o cache é descartado ao sair. Como dívida: uma mudança de
uma linha na saída do sistema passa a mostrar a comissão de um vendedor para outro.

### A-97 · [Baixa] Vinte e nove assinaturas em tempo real sem filtro, e canais da corrida nunca liberados
**Camada:** hooks / performance · **Modo:** EXECUTADO · **Confiança:** confirmado

29 assinaturas com `event:'*'` e sem `filter`, por exemplo
`src/hooks/dashboard/useDashboardKPIs.ts:61`, `useDashboardKPIsPeriod.ts:338`,
`src/hooks/race/useRaceLeaderboard.ts:69`, `src/pages/RaceSpectator.tsx:46`,
`src/hooks/useMyBonusAwards.ts:130`, `src/pages/AdminAuditoriaPremiacoes.tsx:118`.

**Impacto:** consumo desnecessário de banco e de cota de tempo real, e lentidão percebida em
telas que nada têm a ver com a corrida, proporcional ao volume de vendas.

### A-98 · [Baixa] Duas versões do mesmo indicador de funil convivendo
**Camada:** hooks · **Modo:** RASTREADO · **Confiança:** confirmado

`src/hooks/sdr/useProspectingFunnel.ts:6` e `src/hooks/useSDRMetrics.ts:216-217` calculam o
funil de prospecção com recortes diferentes; o consumidor é
`src/components/sdr/ProspectingFunnel.tsx:1,16`. Colisão semelhante entre
`src/hooks/playbooks/usePlaybookQueries.ts:63` e `src/hooks/sales/useSalesEnablement.ts:72`.

**Impacto:** quem importar a versão errada mostra um número diferente na mesma tela, sem
erro. É dívida pronta para virar divergência de relatório.

### A-99 · [Baixa] Preferência de tema não sobrevive à sessão
**Camada:** hooks · **Modo:** RASTREADO · **Confiança:** confirmado

`src/contexts/DashboardThemeContext.tsx:33-40`: `toggleTheme` não persiste. Correlato:
`src/contexts/RaceCalmContext.tsx:21-25` e `src/hooks/race/useCalmMode.ts:37,49` mantêm estado
duplicado para a mesma preferência.

### A-100 · [Baixa] `useClients` declara na chave um filtro que a consulta ignora
**Camada:** hooks · **Modo:** RASTREADO · **Confiança:** confirmado

`src/hooks/crm/useClients.ts:16-23` inclui `filters` na chave, mas a função de busca
(`src/services/clientService.ts:35-42`) não o usa — cache fragmentado sem efeito.
---

## CR-34 — Segredo de integração tratado como assinatura e exposto ao navegador

### A-101 · [Crítica] O webhook de Win/Loss envia o segredo do assinante como se fosse assinatura
**Camada:** integrações · **Modo:** RASTREADO · **Confiança:** confirmado

`supabase/functions/winloss-webhook-dispatcher/retry.ts:141`:
```ts
...(sub.secret ? { "X-Winloss-Signature": sub.secret } : {}),
```
O valor do cabeçalho é o **próprio segredo compartilhado**, não um HMAC do corpo. Três
consequências: o segredo viaja em toda entrega (qualquer log do receptor o expõe); a
"assinatura" é constante e não está ligada ao conteúdo, então o receptor não detecta
alteração do corpo; e quem receber **uma** entrega pode forjar eventos ilimitados.
O padrão correto existe no outro subsistema de webhook do mesmo repositório:
`supabase/functions/dispatch-webhook/index.ts:42-54` implementa `hmacSign(secret, body)` e
envia `X-Webhook-Signature`.
**Mitigação atual:** `winloss_webhook_subscriptions` tem 1 linha, e o comentário de
`supabase/migrations/20261117050000_webhook_ssrf_e_rate_limit.sql:33-34` indica que é
`test.invalid` com `active = false`.

**Causa raiz:** regressão contra o padrão da casa — assinatura confundida com credencial.

**Impacto:** no dia em que um parceiro real for cadastrado, ele recebe o segredo em todo
pedido e pode se passar pelo sistema.

### A-102 · [Alta] O segredo do webhook chega ao navegador, e a tela nunca cria segredo nenhum
**Camada:** integrações / frontend · **Modo:** RASTREADO · **Confiança:** confirmado

`src/hooks/win-loss/useWebhookSubscriptions.ts:22-27` faz
`.from('winloss_webhook_subscriptions').select('*')`, e a tabela tem a coluna `secret`
(`src/integrations/supabase/types.ts:20313+`). A policy é `FOR ALL` para admin
(`supabase/migrations/20260421101729_9e60825c-1009-48b4-93e3-79030c85f9cd.sql:32`); a RLS não
filtra coluna e não há `REVOKE`/`GRANT` de coluna para essa tabela em nenhuma migration.
Todo admin que abre a tela recebe o segredo no JSON e no cache.
**Pior na prática:** a mutação de criação **não grava segredo**
(`useWebhookSubscriptions.ts:36-42` insere só `url`, `events`, `created_by`), e como
`retry.ts:141` só envia o cabeçalho quando `sub.secret` existe, **toda assinatura criada pela
tela dispara entregas sem assinatura alguma**.

### A-103 · [Alta] Credenciais de Twilio, Meta e Z-API em texto puro, legíveis por qualquer gestor
**Camada:** integrações · **Modo:** RASTREADO · **Confiança:** confirmado

`src/hooks/multichannel/useChannelCredentials.ts:25-27` faz
`.from('channel_credentials').select('*')`, incluindo a coluna `credentials` (jsonb), e a
policy de leitura é
`USING (owner_id = auth.uid() OR public.is_admin_or_manager(auth.uid()))`
(`supabase/migrations/20260417112931_1cd3847f-3cf1-44bb-853f-20cd0066df36.sql:20-22`) — logo
um gestor lê a credencial de **todos** os vendedores. A criação grava o segredo em texto puro
vindo do navegador (`useChannelCredentials.ts:56`).
O mecanismo de proteção existe e é bom — `supabase/functions/_shared/secret-refs.ts:1-12`
(`env:<VAR>` ou `internal:<key>`, com precedência sobre o jsonb legado) —, mas é opcional e
nenhuma tela o usa: `integration_secret_refs` tem 0 linhas.
Contraste correto no mesmo repositório: `src/hooks/dialer/useClickToCall.ts:23-27` seleciona
apenas `id, from_number`.
**Impacto hoje:** latente — `channel_credentials` tem 0 linhas. Vira exposição real no dia em
que alguém conectar o primeiro provedor pela tela.

---

## CR-35 — Falha de integração é invisível

### A-104 · [Alta] O cron nunca vê o resultado da função que chama
**Camada:** integrações / banco · **Modo:** RASTREADO · **Confiança:** confirmado

`public.trigger_internal_edge_job`
(`supabase/migrations/20261112224500_fix_agenda_crons_maquina_vendas.sql:86-98`) faz
`net.http_post(...) INTO v_request_id; RETURN v_request_id;`. O `pg_net` é assíncrono, então
o job do pg_cron termina como `succeeded` **qualquer que seja a resposta HTTP** — 200, 404,
500 ou falha de DNS. Quem deveria alertar não cobre esse caminho:
`supabase/functions/cron-failure-alerter/index.ts:78` lê `fn_admin_get_new_cron_failures`, que
consulta `cron.job_run_details … WHERE jrd.status <> 'succeeded'`
(`supabase/migrations/20260712231501_204c3ba6-97ac-4159-9d75-4785991db844.sql:18-21`).
**Prova circunstancial:** os 10 jobs que passam por essa função têm `falhas_7d = 0` e
`taxa_falha_7d_pct = 0` no snapshot — inclusive `wal-health-alert-5min`, com 2016 execuções em
7 dias, que existe justamente para vigiar a saúde do banco.
O comentário da própria migration afirma o contrário do que o código faz
(`20261112224500…sql:21`: *"nesse caso a chamada responde 404 até o deploy (o
cron-failure-alerter registra)"*). Não registra.
**Correção já escrita no repositório** (`20261124120000_retry_trigger_internal_edge_job.sql:107-116`,
que passa a consultar `net._http_response`), **com aplicação em produção não verificada** — e
com o efeito colateral de A-111.

**Impacto:** o painel diz que todos os 32 crons estão saudáveis enquanto uma função pode estar
devolvendo erro em todas as execuções. Alerta que não alerta é pior do que alerta nenhum —
e isso contamina a leitura de A-21 e do próprio `banco.json`.

### A-105 · [Alta] "Reprocessar" anuncia sucesso e não reenvia o evento esgotado
**Camada:** integrações / frontend · **Modo:** RASTREADO · **Confiança:** confirmado (hipótese quanto às 2 linhas atuais)

A mutação `retry` grava **só** `next_retry_at` (`src/hooks/admin/useV4Callbacks.ts:125-138`),
mas o despachante só busca itens com `attempts < 5`
(`supabase/functions/notify-v4-quote-status/index.ts:121-127`, `MAX_ATTEMPTS = 5` em `:11`).
A tela expõe a aba "Esgotados" (`src/pages/admin/AdminV4CallbacksPage.tsx:220`) e oferece ali
o botão "Reprocessar" (`:249-252` e `:409-418`), e o sucesso é anunciado de qualquer forma:
`toast.success('${n} evento(s) reagendado(s) para agora')` (`useV4Callbacks.ts:140`).
O botão que funcionaria é "Resetar tentativas" (`:253-256`, zera `attempts`), e nada na tela
indica isso.
Há 2 linhas pendentes em `v4_callback_dead_letters` (alerta `dead_letters_pendentes`); não foi
possível ler o `attempts` delas (sem SQL ao vivo).

**Impacto:** o operador tenta recuperar um callback perdido, recebe confirmação na tela, e o
evento nunca é reenviado. (Esta é a correção de uma conclusão anterior desta auditoria, que
havia tratado o fluxo de replay como completo: o caminho existe, mas o botão óbvio não faz o
que diz.)

### A-106 · [Média] Bitrix24 sincroniza de hora em hora e nenhuma falha é alertada
**Camada:** integrações · **Modo:** RASTREADO · **Confiança:** confirmado

Cron `bitrix24-sync-hourly` (`17 * * * *`) ativo, 168 execuções em 7 dias, 0 falhas
registradas — pelo motivo de A-104. `bitrix24_sync_logs` tem **551 linhas**, consistente com
uma linha por execução; ninguém as lê para alertar (`src/hooks/useBitrix24.ts:68` só exibe).

### A-107 · [Média] A escalação de alerta crítico usa o remetente de testes do provedor
**Camada:** integrações · **Modo:** RASTREADO · **Confiança:** confirmado

`supabase/functions/_shared/alert-escalation.ts:33`:
```ts
return Deno.env.get("ALERT_FROM_EMAIL") ?? "Alertas <onboarding@resend.dev>";
```
O comentário do próprio arquivo (`:11-14`) reconhece que esse remetente **só** funciona para
envio ao e-mail da própria conta do provedor. A tela
(`src/pages/Notificacoes.tsx:376`) anuncia a escalação como "Ativo".
Soma-se a A-39: sem `RESEND_API_KEY`, nada sai de qualquer forma.

---

## CR-36 — Entrega de webhook sem reenvio e sem proteção de destino

### A-108 · [Média] Webhook de saída tem entrega única, sem reenvio e sem fila de descarte
**Camada:** integrações · **Modo:** RASTREADO · **Confiança:** confirmado

`supabase/functions/dispatch-webhook/index.ts:166-257`: uma tentativa por destino; a falha
gera linha em `webhook_deliveries` (`:221-230`) e incrementa `failure_count` (`:232-246`), e
**nada reenvia** — o único escritor é a própria função (`:254`) e o único leitor é
`src/hooks/useWebhooks.ts`. A assinatura também não leva timestamp, o que permite reexecução
de um pedido capturado.

### A-109 · [Média] `test-integration-connection` busca qualquer URL que lhe derem
**Camada:** integrações / segurança · **Modo:** RASTREADO · **Confiança:** confirmado

`supabase/functions/test-integration-connection/index.ts` (`probeDatabase:23`, `probeN8n:35`,
`probeMcp:58`, `probeWebhook:66`, `probeBitrix:79`) faz `fetch` para a URL vinda de
`integration_connections.config`, com tempo limite, mas **sem validação de host, esquema ou
faixa de IP** — `http://`, `localhost` e endereços internos passam. O repositório tem a
proteção pronta no outro caminho: `dispatch-webhook/index.ts:23-40` e as RPCs
`is_webhook_host_allowed` / `check_webhook_rate_limit`
(`supabase/migrations/20261117050000_webhook_ssrf_e_rate_limit.sql`).

### A-110 · [Média] `receive-quote-webhook` é o único endpoint público sem limite de taxa
**Camada:** integrações · **Modo:** EXECUTADO (grep) · **Confiança:** confirmado

Todos os demais endpoints públicos chamam `enforceRateLimit`
(`whatsapp-inbound-webhook/index.ts:300`, `multichannel-status-webhook/index.ts:114`,
`twilio-call-status/index.ts:35`, `email-unsubscribe/index.ts:62`,
`geocode-proxy/index.ts:106`, `receive-quote-sync/index.ts:415`); `receive-quote-webhook`
(`supabase/config.toml:46`) não chama. Soma-se a A-14: hoje ele responde 500 por falta de
segredo.

### A-111 · [Média] O novo reenvio do `trigger_internal_edge_job` pode travar os trabalhadores do cron
**Camada:** banco / integrações · **Modo:** RASTREADO · **Confiança:** hipótese

`supabase/migrations/20261124120000_retry_trigger_internal_edge_job.sql:88-116` passa a fazer,
por tentativa, até 4 iterações de `pg_sleep(2)` aguardando a resposta em
`net._http_response`, com até 3 tentativas — pior caso **~24 s de bloqueio dentro do
trabalhador do pg_cron**, por execução. A configuração real do banco é
`cron.max_running_jobs = 32` com `max_worker_processes = 6`
(`inventario/estado/banco.json`), e há jobs a cada 5 minutos.
**O que falta para confirmar:** se essa migration está aplicada em produção e qual o tempo
real de execução dos jobs depois dela. Verifique antes de mexer: a correção de A-104 passa
por aqui, e pode trocar um problema por outro.

### A-112 · [Média] Nenhuma integração fora do caminho de IA trata limite de requisições do terceiro
**Camada:** integrações · **Modo:** RASTREADO · **Confiança:** confirmado

As 12 funções que falam com o gateway de IA tratam `429` corretamente (ex.:
`forecast-narrative/index.ts:187-196`, `semantic-reindex-batch/index.ts:64`,
`elevenlabs-tts/index.ts:154-161`). Fora dele, **nenhuma** trata — Bitrix24
(`bitrix24-sync/index.ts:217-220`), V4 (`notify-v4-quote-status/index.ts:159-169`) e as
demais tratam `429` como erro comum, sem respeitar `Retry-After`.

### A-113 · [Média] `helpdesk-sync` confia no formato do terceiro e corta em 50 sem avisar
**Camada:** integrações · **Modo:** RASTREADO · **Confiança:** confirmado

`supabase/functions/helpdesk-sync/index.ts:22,40,61` consome a resposta sem validar o formato
(`(j.tickets ?? []).map(...)`, `(arr ?? []).map(...)`): se o provedor devolver um objeto em
vez de uma lista, `arr.map` lança. E o corte em 50 itens não é informado a ninguém.

---

## CR-37 — Documentação e configuração que descrevem outro sistema

### A-114 · [Média] O `config.toml` não descreve a superfície pública real: 64 funções a mais sem JWT
**Camada:** backend / infraestrutura · **Modo:** RASTREADO · **Confiança:** confirmado

`supabase/config.toml` declara `verify_jwt = false` para **22** funções. O snapshot da
Management API traz **79 das 100** funções listadas com `verify_jwt: false` — diferença de
**64 slugs sem JWT em produção que o repositório não declara** (nenhum caso inverso).
Some-se a A-26 (o `verify_jwt` não autentica de qualquer modo) e o resultado é: ninguém, lendo
o repositório, consegue saber quais endereços estão abertos.

**Impacto:** o arquivo que deveria ser a fonte de verdade da superfície pública descreve menos
de um terço dela.

### A-115 · [Média] O documento de integrações foi medido em outro banco e afirma o oposto da realidade
**Camada:** documentação · **Modo:** RASTREADO · **Confiança:** confirmado

`docs/estado/13_INTEGRACOES.md:4` declara que foi medido por *"consulta ao banco de produção
`rapjswienfhkobhlamxb`"* — que **não é** o banco deste repositório
(`usyxfpqlsspldubptrdl`, `AGENTS.md` §7: *"Nenhum outro Supabase … é deste repo"*). O veredito
central do documento (`:11-13`, "nenhuma integração externa está configurada") é falso hoje:
há 32 crons ativos, 551 linhas de log do Bitrix24 e webhooks recebendo tráfego.

**Impacto:** é o documento que um agente ou uma pessoa lê para decidir mexer em integração — e
ele descreve outro sistema.

### A-116 · [Baixa] Duas retenções contraditórias para a deduplicação de webhook
**Camada:** banco · **Modo:** RASTREADO · **Confiança:** confirmado

`fn_cleanup_webhook_dedupe` apaga o que passa de **90 dias**
(`supabase/migrations/20260707112143…:14-17`), enquanto o cron
`purge-webhook-inbound-dedupe-30d` apaga o que passa de **30 dias**
(`20260706211149…:48-52`). A janela efetiva é 30 dias e a função de 90 nunca tem o que apagar.

### A-117 · [Baixa] A proteção de `portfolio_settings` é uma lista de nomes proibidos
**Camada:** banco · **Modo:** RASTREADO · **Confiança:** confirmado

`supabase/migrations/20260718000002_fix_portfolio_settings_rls_credential_leak.sql:17-29`
substituiu um `USING (true)` (que expunha tokens) por um filtro sobre o **nome** da chave
(`setting_key NOT ILIKE '%token%' AND … '%secret%' AND … '%api_key%'`). Funciona enquanto
ninguém criar uma chave com outro nome — `credencial`, `senha`, `bearer`.

### A-118 · [Baixa] Duas migrations com marca de ordem de bytes, e o gate não reclama
**Camada:** banco / CI · **Modo:** EXECUTADO · **Confiança:** confirmado

`supabase/migrations/20261120000000_t15_multichannel_retry.sql` e
`20261121000000_fix_search_path_similarity_e_pgvector.sql` começam com BOM UTF-8.
`npm run check:migrations` passa mesmo assim (EXECUTADO: exit 0). BOM em SQL quebra algumas
ferramentas de replay — e o replay já é frágil (A-46).

### A-119 · [Média] A allowlist de destino do webhook de Win/Loss está vazia e não tem tela
**Camada:** integrações · **Modo:** RASTREADO · **Confiança:** confirmado

`supabase/migrations/20261117050000_webhook_ssrf_e_rate_limit.sql:32-36` é explícito:
*"Fail-CLOSED de proposito: allowlist vazia bloqueia tudo."* O despachante checa antes de
qualquer envio (`winloss-webhook-dispatcher/index.ts:332-363`). A tabela
`webhook_allowed_domains` está vazia e **não há nenhuma tela** para preenchê-la.

**Impacto:** o subsistema de webhook de Win/Loss está desligado na prática, e a única forma de
ligá-lo é por SQL manual — o que não está documentado em lugar nenhum.

### A-120 · [Média] A deduplicação de entrada pode não estar gravando
**Camada:** integrações · **Modo:** RASTREADO · **Confiança:** hipótese

No snapshot (contagem exata nos dois casos), `quote_sync_inbound_log` tem **364 linhas** e
`webhook_inbound_dedupe` tem **0** — apesar de a retenção do log ser de 30 dias e a do dedupe
também. Se as entregas passaram pelo caminho com dedupe, as duas tabelas deveriam ter linhas
na mesma janela.
**O que falta para confirmar:** comparar as datas:
```sql
SELECT max(received_at) FROM public.quote_sync_inbound_log;
SELECT count(*), max(created_at) FROM public.webhook_inbound_dedupe;
```
Se o log tiver linhas recentes e o dedupe não, a proteção contra entrega duplicada não está
ativa no caminho usado — o que torna A-110 (sem limite de taxa) mais sério.

### A-121 · [Baixa] Doze crons da máquina de vendas dependem de migrations cuja aplicação não foi confirmada
**Camada:** banco / integrações · **Modo:** RASTREADO · **Confiança:** não verificado

`supabase/migrations/20261112224500_fix_agenda_crons_maquina_vendas.sql:110-130` agenda 12
jobs (`sequence-runner-5min`, `process-cadence-tasks-5min`,
`process-scheduled-sends-15min`, `check-quote-expiration-daily`, `check-lead-sla-15min`,
`sdr-consecutive-alerts-daily`, `activity-goal-alerts-daily`, `challenge-expiration-alerts`,
entre outros), e `20261120000000_t15_multichannel_retry.sql` muda o CHECK de
`scheduled_sends`. O snapshot é anterior e não os mostra.
**Verificação para o executor:**
`SELECT jobname, schedule, active FROM cron.job ORDER BY jobname;` e comparar com a lista da
migration.
---

## CR-38 — "Comissão desta venda" não tem uma definição única

### A-122 · [Crítica] A comissão mostrada ao vendedor usa percentual e base diferentes da que o banco grava
**Camada:** regras de negócio (front + banco) · **Modo:** RASTREADO · **Confiança:** confirmado

Existem **três** taxas de comissão no sistema, e a tela de Metas mostra uma enquanto o valor
devido é calculado com outra:
- **Banco (fonte real):** `supabase/migrations/20261013130000_comissao_regras_e_split_sdr.sql:55-70`
  resolve a regra em `commission_rules` e calcula `NEW.amount * v_rule_percentage / 100`, com
  fallback de **5%** (`:68`).
- **Front (tela "Motor de Comissões"):** `src/hooks/dashboard/useGoalsDashboard.ts:106-108`
  usa `Number(sp.commission_rate) || 10` — a coluna `salespeople.commission_rate`, cujo
  padrão é **10%** (`supabase/schema.sql:4429`). Alimenta
  `src/components/goals/CommissionCalculator.tsx:96,110,168`.
- **Terceira fonte, órfã:** `src/pages/admin/AdminComercial.tsx:236-247` grava
  `salesperson_commission_configs.rate` por mês, e **nenhum consumidor lê essa tabela**
  (grep devolve só a tela, a migration de criação e os tipos gerados).

Os padrões divergem (`commission_rules.percentage DEFAULT 5.00`, `supabase/schema.sql:1733`,
vs `salespeople.commission_rate DEFAULT 10.00`, `:4429`) e o arredondamento também: o banco
grava em `numeric(12,2)` (`:1750`), o front soma em ponto flutuante sem arredondar
(`useGoalsDashboard.ts:107`, `src/services/biService.ts:323`,
`src/hooks/sales/useSalespeople.ts:125`).

**Causa raiz:** não existe uma função única "comissão desta venda"; cada camada
reimplementou a sua, com fonte de percentual diferente.

**Impacto:** o vendedor vê na tela de Metas um valor que pode ser **o dobro** do que vai
receber (10% contra 5% quando não há regra específica), e o gestor vê o custo de comissão da
equipe pela taxa errada. Discussão de pagamento garantida.

**Outros locais com a mesma causa:** `src/hooks/bi/useBICloser.ts:184`,
`src/services/biService.ts:323`, `src/hooks/sales/useSalespeople.ts:125`,
`src/components/vendedor/RunRateProjectionCard.tsx:46`.

### A-123 · [Crítica] O painel de ROI calcula o custo de comissão 100 vezes maior
**Camada:** regras de negócio (front) · **Modo:** RASTREADO · **Confiança:** confirmado (verificado de forma independente)

`src/hooks/dashboard/useROIDashboard.ts:98`:
```ts
const commissionPaid = totalRevenue * (sp.commission_rate || 0.1);
```
**sem dividir por 100.** A coluna é percentual (`5` = 5%), como confirmam
`supabase/schema.sql:4429` e o comentário em
`src/components/vendedor/RunRateProjectionCard.tsx:46`. Todos os outros consumidores dividem:
`src/services/biService.ts:323` (`/ 100`), `src/hooks/sales/useSalespeople.ts:125` (`/ 100`),
`src/hooks/dashboard/useGoalsDashboard.ts:106-107`. O fallback `|| 0.1` mostra que o autor
assumiu fração. A rota está viva: `src/routes/AppRoutes.tsx:672-675` → `/roi`.

**Causa raiz:** a unidade (percentual ou fração) não faz parte do tipo, e cada consumidor
adivinha.

**Impacto:** com taxa de 10%, o custo de comissão aparece como **10× a receita**; o ROI de
todo vendedor fica em torno de −90% e o retorno nunca fecha. Qualquer decisão de contratação
tomada nessa tela usa número inventado.
**Na mesma tela, também fixos no código:** salário base `3500` (`:89`) e LTV = ticket médio ×
2,5 (`:109`).

---

## CR-39 — O vocabulário de status não é o mesmo em todas as camadas

### A-124 · [Crítica] Arrastar o card para "Arquivado" registra a venda como ganha, gera comissão e XP
**Camada:** regras de negócio (front + banco) · **Modo:** RASTREADO · **Confiança:** confirmado

`src/hooks/usePipeline.ts:59` e `src/constants/index.ts:69` tratam a coluna "Arquivado" com
um valor de status que o banco entende como fechamento:
`supabase/migrations/20261001220100_sales_status_canonico.sql:49` o inclui entre os canônicos
de ganho, e o trigger de comissão
(`supabase/migrations/20261013130000_…sql:33`) dispara para ele, junto com XP e probabilidade
de estágio (`20261001220000_stage_probabilities.sql:44`).

**Causa raiz:** o rótulo da interface ("Arquivado") e o significado do valor no banco
("fechado/ganho") divergiram, e nada no caminho recusa a combinação.

**Impacto:** o vendedor arrasta um negócio para o que entende como arquivo morto e o sistema
registra receita, cria comissão a pagar, credita XP e sobe o ranking. Receita e folha de
comissão inflam sem ninguém ter ganhado nada.

### A-125 · [Crítica] Cotação expirada vira venda ganha por um caminho, e venda ganha é rebaixada por outro
**Camada:** regras de negócio / integrações · **Modo:** RASTREADO · **Confiança:** confirmado

`supabase/functions/receive-quote-webhook/index.ts:61-70` mapeia o status da cotação externa
para o status da venda sem tratar "expirada" — que cai no valor que o banco entende como
ganho (`src/constants/index.ts:69`,
`supabase/migrations/20261001220100_…sql:49`), disparando o trigger de comissão
(`20261013130000_…sql:33`). No sentido inverso,
`supabase/migrations/20260718000001_fix_sync_quote_no_status_downgrade.sql:34-41` tenta
impedir rebaixamento, mas o caminho de `20261027140000_…sql:850-852` ainda permite que uma
venda ganha volte a "lead" se a cotação de origem for editada para rascunho no sistema
externo.

**Impacto:** cotação que apenas venceu entra como venda fechada — receita do mês, comissão a
pagar, XP e posição no ranking. E uma venda já ganha pode ser rebaixada por uma edição feita
fora do sistema, com a comissão criada permanecendo pendente de pagamento.

### A-126 · [Média] `quotes.status` é texto livre, fora da máquina de estados
**Camada:** banco / regras de negócio · **Modo:** RASTREADO · **Confiança:** confirmado

`supabase/schema.sql:3914` define `status text` sem CHECK, e as únicas restrições da tabela são
de valor (`:6654-6657`). A máquina de estados
(`supabase/migrations/20261001213000_…sql:178-188`) cobre `sales` e `commissions`, não
`quotes`. O front compara por igualdade (`src/hooks/useQuotes.ts:78-86,126-140`).

**Impacto:** qualquer integração pode gravar um status que nenhuma tela entende, e a cotação
desaparece dos filtros e dos indicadores sem erro.

### A-127 · [Média] Vendas com dois dos status de ganho somem do LTV por segmento
**Camada:** regras de negócio · **Modo:** RASTREADO · **Confiança:** confirmado

`src/components/analytics/LTVBySegment.tsx:43-45` filtra por um subconjunto dos status de
ganho, deixando de fora `won` e `closed` — justamente os que o webhook de cotações grava. Os
demais consumidores usam a lista completa de `src/constants/index.ts:69,84`
(`src/hooks/bi/useABCAnalysis.ts:128`, `src/hooks/useCloserMetrics.ts:104`,
`src/hooks/useCompetencyData.ts:56`).

**Impacto:** segmentação de cliente e priorização comercial saem com a base incompleta, sem
aviso na tela.

---

## CR-40 — Estados terminais que não são terminais

### A-128 · [Alta] Comissão paga volta a pendente e venda cancelada volta a ganha
**Camada:** banco / regras de negócio · **Modo:** RASTREADO · **Confiança:** confirmado

A máquina de estados declara `cancelled` como terminal, mas os pontos que mais importam ficam
de fora: o trigger de comissão
(`supabase/migrations/20261013130000_…sql:72-76`) insere sem verificar o estado anterior da
comissão, e `src/hooks/usePipeline.ts:217` move o card sem passar pela RPC de transição.

**Impacto:** uma comissão já paga pode ser reaberta e paga de novo; uma venda cancelada pode
ser revivida como ganha, gerando receita e tentando gerar comissão. O controle que o pacote de
auditoria anterior prometeu não existe exatamente onde é mais caro.

### A-129 · [Alta] A comissão nunca é revista quando a venda é desfeita, alterada ou excluída
**Camada:** banco / regras de negócio · **Modo:** RASTREADO · **Confiança:** confirmado

Não há gatilho que reavalie `commissions` quando a venda muda de valor
(`20261001213000_…sql:103-107`), é cancelada ou recebe exclusão lógica
(`supabase/migrations/20261001193000_soft_delete_business_tables.sql:27-38`). A tela de
comissões lista tudo que está `pending` (`src/hooks/useCommissions.ts:66-70`).

**Impacto:** comissão a pagar sobre venda cancelada, excluída ou com valor corrigido para
baixo. Ninguém é avisado; o registro segue "pendente de aprovação" como qualquer outro.

### A-130 · [Alta] A exclusão lógica não vale para receita, meta, ranking nem premiação
**Camada:** regras de negócio · **Modo:** RASTREADO · **Confiança:** confirmado

`supabase/migrations/20261001193000_soft_delete_business_tables.sql:1-15` adotou exclusão
lógica, e as views `v_active_*` existem (`supabase/schema.sql:30320-30356`) — mas os
consumidores de número não as usam: `src/hooks/dashboard/useGoalsDashboard.ts:71-75`,
`src/hooks/gamification/useWeeklyRanking.ts:26-31`,
`src/hooks/useEligibleBonuses.ts:122-135` e a função
`check_is_first_activation` (`20261018200000_…sql:97-101`) leem a tabela direto.

**Impacto:** excluir uma venda errada não tira o valor da meta, do ranking, da premiação nem
da projeção de comissão. Pior: em `check_is_first_activation`, uma venda excluída continua
"queimando" a ativação do cliente — o SDR perde a comissão de ativação por causa de um
registro que, para o usuário, não existe mais.

---

## CR-41 — "Quando" e "de quem" mudam de definição entre telas

### A-131 · [Alta] "Quando a venda foi ganha" tem três definições e dois fusos horários
**Camada:** regras de negócio · **Modo:** RASTREADO · **Confiança:** confirmado

Três fontes de data para o mesmo fato: `20261018200000_…sql:97-101` (banco),
`src/hooks/gamification/useWeeklyRanking.ts:21-31` (usa `updated_at`) e
`src/hooks/dashboard/useGoalsDashboard.ts:74-75`. E dois fusos: as edge functions usam
`supabase/functions/_shared/business-date.ts:14-15` (horário de Brasília), enquanto o front
tem dois utilitários próprios (`src/lib/date.ts:10-18`, `src/utils/dateHelpers.ts:8-10`).

**Impacto:** um negócio criado em outubro e fechado em novembro conta para o ranking de
novembro e para a meta de outubro — o mesmo vendedor aparece em primeiro numa tela e em
terceiro na outra. E como o ranking usa `updated_at`, qualquer edição posterior muda a semana
em que a venda aparece.

### A-132 · [Média] Vendedor sem meta lançada aparece com zero numa tela e com a meta antiga em outra
**Camada:** regras de negócio · **Modo:** RASTREADO · **Confiança:** confirmado

`src/hooks/dashboard/useGoalsDashboard.ts:66-69` busca a meta do mês corrente e assume 0 na
ausência; `20261018200000_…sql:144-146`, `supabase/functions/revops-hub/index.ts:124` e
`supabase/functions/revenue-intelligence/index.ts:59` caem para a meta anterior.

**Impacto:** se o gestor esquecer de lançar as metas do mês, a tela de Metas mostra
atingimento 0% e comissão projetada 0 para todos, enquanto a previsão e o RevOps mostram a
meta do mês anterior. Ninguém sabe qual número vale.

### A-133 · [Média] O mesmo vendedor tem dois níveis diferentes no mesmo card
**Camada:** regras de negócio (gamificação) · **Modo:** RASTREADO · **Confiança:** confirmado

Duas tabelas de nível: `src/hooks/gamification/useSalespersonXP.ts:15-36` e
`20261027140000_…sql:897-909` de um lado, `src/lib/gamification.ts:12-33` de outro. O card
monta as duas (`src/components/competitive/GamifiedProfile.tsx:32,54`,
`src/pages/ArenaCompetitiva.tsx:302`).

**Impacto:** o vendedor vê "Nv. 4 Competente" no selo e "Habilidoso" no texto ao lado, no
mesmo card. Qualquer premiação amarrada a nível vira discussão.

---

## CR-42 — Controle que a tela promete e o sistema não aplica

### A-134 · [Alta] Três dos quatro pipelines não movem nenhum card
**Camada:** regras de negócio / frontend · **Modo:** RASTREADO · **Confiança:** confirmado

`supabase/migrations/20260416104458_a8fc916a-0907-4aa4-92a7-42a4bf4ed461.sql:73-94` cria
quatro pipelines, mas os estágios (`20260224142333_…sql:9-10`) e o movimento de card
(`src/hooks/useMultiplePipelines.ts:153-161`,
`src/components/pipeline/PipelineBoard.tsx:117`) só funcionam para o primeiro.

**Impacto:** quem usa Pós-Venda, Renovações ou Parcerias recebe "Erro ao mover deal" em toda
tentativa. A funcionalidade está na tela e não funciona.

### A-135 · [Alta] As regras de aprovação são configuráveis, aparecem na tela e nunca são aplicadas
**Camada:** regras de negócio · **Modo:** RASTREADO · **Confiança:** confirmado

`src/hooks/admin/useApprovalWorkflows.ts:12-15,89,117-133` e
`src/pages/ApprovalWorkflowsPage.tsx:225-226,422-438,543-545` permitem configurar número de
aprovadores, limites por valor e prazo; a tabela guarda tudo
(`supabase/migrations/20260416180351_…sql:8-11,94`). **Nada no caminho de aprovação lê essas
regras:** um clique de um único gestor aprova qualquer valor, e solicitação vencida fica
pendente para sempre.

**Impacto:** um fluxo configurado como "exige 2 aprovadores acima de R$ 10.000" é aprovado por
uma pessoa, em qualquer valor. O controle existe no papel e na tela.

### A-136 · [Alta] Aprovação comercial marca "aprovado" mesmo quando a mudança não foi aplicada
**Camada:** regras de negócio · **Modo:** RASTREADO · **Confiança:** confirmado

No fluxo de aprovação comercial, o registro é marcado como aprovado antes (ou
independentemente) do resultado da escrita que aplica a decisão. Se a RLS, uma restrição ou a
rede bloquearem a gravação, a solicitação fica registrada como aprovada sem efeito.

**Impacto:** o histórico diz que o desconto foi aprovado e aplicado; o preço no sistema
continua o antigo.

### A-137 · [Alta] Funções do banco deixam o vendedor conceder a si mesmo XP, sequência e progresso de meta
**Camada:** banco / gamificação · **Modo:** RASTREADO · **Confiança:** confirmado

`supabase/migrations/20260831130000_harden_public_access_and_privileged_rpcs.sql:667-680`
mantém executável por `authenticated` um conjunto de funções que concedem XP de liga,
sequência, combo e progresso de meta progressiva — exatamente os números que decidem ranking,
ligas e premiações. Nenhuma tela as chama, então o uso seria sempre intencional.

**Impacto:** qualquer vendedor logado pode inflar os próprios números de gamificação, que são
a base de premiação.

---

## CR-43 — Agregados que somam o que não deve ser somado

### A-138 · [Média] "Markup médio" é média simples de percentuais
**Camada:** regras de negócio · **Modo:** RASTREADO · **Confiança:** confirmado

`src/lib/bi/markupOverviewHelpers.ts:62-65` e `src/lib/markupHelpers.ts:151-153` fazem média
aritmética dos percentuais, sem ponderar por receita; consumido em
`src/components/reports/sales/SalesReportKpis.tsx:73,107` e
`SalesMarkupRankingTable.tsx:7,31`.

**Impacto:** uma venda de R$ 200 com 300% de markup e uma de R$ 200.000 com 8% resultam em
"markup médio 154%". O ranking de rentabilidade premia quem fez muitas vendas pequenas. O
alerta de markup crítico por venda continua correto — o defeito é só no agregado.

### A-139 · [Média] O total de premiações soma reais com percentuais
**Camada:** regras de negócio · **Modo:** RASTREADO · **Confiança:** confirmado

`src/hooks/useAutoAwardBonuses.ts:48` envia `bonus_amount` sem considerar o tipo do bônus, e
`supabase/migrations/20260723131706_…sql:60-64` aceita os dois tipos na mesma coluna; a tela
soma tudo (`src/pages/AdminAuditoriaPremiacoes.tsx:538-540`).

**Impacto:** um bônus de "5%" entra como R$ 5,00 no total a pagar. O número que o financeiro lê
no topo da tela de auditoria não é dinheiro.

### A-140 · [Baixa] O "Total Geral" de comissões do vendedor inclui as canceladas
**Camada:** frontend · **Modo:** RASTREADO · **Confiança:** confirmado

`src/pages/Comissoes.tsx:29,36-42` soma todas as linhas devolvidas por
`src/hooks/useCommissions.ts:5`, sem excluir `status = 'cancelled'`.

**Impacto:** o vendedor vê um total maior do que pode receber.

### A-141 · [Média] O simulador de ganhos mostra números inventados com selo de real
**Camada:** frontend · **Modo:** RASTREADO · **Confiança:** confirmado

`src/components/financeiro/CommissionCalculator.tsx:92-106` exibe acumulado e posição no
ranking que não vêm de consulta nenhuma, sob um rótulo que afirma serem dados reais.

**Impacto:** o vendedor toma o número como extrato.
---

## CR-44 — Testes que passam sem provar nada

### A-142 · [Alta] Três casos de teste de fluxo principal passam sem verificar nada
**Camada:** testes · **Modo:** RASTREADO · **Confiança:** confirmado

`tests/e2e/core-flows.spec.ts`: os 3 casos passam sem nenhuma asserção efetiva. O nome
promete cobrir os fluxos centrais; o conteúdo não verifica resultado.
Soma-se a A-24: o arquivo está entre os 26 specs que nunca rodam, então nem o falso positivo
aparece.

### A-143 · [Alta] O teste de navegação de autenticação simula justamente a regra que deveria testar
**Camada:** testes · **Modo:** RASTREADO · **Confiança:** confirmado

`tests/e2e/auth-navigation.spec.ts` substitui por simulação a verificação de papel que é o
objeto do teste. O teste passa independentemente de o guard de rota funcionar.

### A-144 · [Alta] Os testes de "segurança" verificam o texto da migration, não o banco
**Camada:** testes · **Modo:** RASTREADO · **Confiança:** confirmado

Os testes de contrato em `supabase/functions/_shared/*_contract_test.ts` fazem `assertMatch`
sobre o conteúdo de arquivos de `supabase/migrations/` (exemplo citado:
`canonical-hardening_contract_test.ts:11-37`). Eles provam que **o arquivo contém o texto
esperado**, não que o banco está configurado assim — e A-43, A-04 e A-46 mostram justamente
casos em que o repositório diz uma coisa e o banco faz outra.
O único teste de segurança que bate no banco de verdade está desligado no CI
(`src/test/security/fn-cleanup-webhook-dedupe-privileges.test.ts:44`, `describe.skipIf(!canRun)`).

**Impacto:** o conjunto de testes dá a sensação de cobrir segurança de banco e não cobre
nenhuma policy em execução. Nenhum teste afirma "toda função que grava verifica o chamador" —
por isso A-27 a A-35 passaram despercebidos.

### A-145 · [Média] A guarda de `console` não guarda
**Camada:** testes · **Modo:** RASTREADO · **Confiança:** confirmado

A proteção que deveria falhar o teste quando o código emite erro no console não tem efeito
(detalhe em `mapa-08-testes.md` §3.5).

### A-146 · [Baixa] Duplicação de execução por configuração de projetos do Playwright
**Camada:** testes · **Modo:** RASTREADO · **Confiança:** confirmado

A configuração de projetos faz um conjunto de specs rodar mais de uma vez, gastando tempo de
CI sem cobertura adicional.

---

## CR-45 — Módulos de dinheiro sem nenhum teste

### A-147 · [Alta] Comissão não tem nenhum teste
**Camada:** testes · **Modo:** EXECUTADO (inventário) · **Confiança:** confirmado

O cálculo de comissão — trigger do banco, resolução de regra, split de SDR, fallback de 5% e
os quatro consumidores do front — **não tem nenhum teste**, unitário ou de integração. É a
área com mais achados desta auditoria (A-02, A-03, A-122, A-123, A-128, A-129) e a que o
conjunto de testes ignora por completo.
Também sem teste: **upload** (A-78 trata do defeito de importação) e o **pagamento** de
premiação (a elegibilidade tem teste; a concessão, não).

**Impacto:** cada correção de comissão deste plano entra sem rede de proteção, e a próxima
mudança pode desfazê-la sem ninguém notar.

### A-148 · [Média] A prova de isolamento por papel só existe em testes que não rodam
**Camada:** testes · **Modo:** RASTREADO · **Confiança:** confirmado

A verificação de RLS por papel existe apenas nos specs de ponta a ponta inalcançáveis (A-24)
e nos testes que leem texto de migration (A-144). Não há teste executado que prove, contra o
banco, que um vendedor não lê dado de outro — e A-43 mostra 14 tabelas onde isso falha.

---

## CR-46 — O sistema avisa que notificou, e não notificou

### A-149 · [Alta] Erro de JavaScript em produção não chega a ninguém, e a tela diz o contrário
**Camada:** observabilidade · **Modo:** RASTREADO · **Confiança:** confirmado

A captura existe e está ligada: `src/App.tsx:22,25` chama `initErrorTracking()`, e
`src/lib/errorTracking.ts:192-256` instala `window.onerror`, `unhandledrejection` e intercepta
`console.error`/`console.warn`; há cinco limites de erro, incluindo `GlobalErrorBoundary`, que
chama `captureError` com `severity: 'critical'` (`:29-36`).
**Os dois destinos estão cegos:**
1. Sentry desligado — `src/lib/errorTracking.ts:42-43`: `const dsn = import.meta.env.VITE_SENTRY_DSN; if (!dsn) return;`.
   A variável aparece só comentada (`.env.example:23`) e `sentry?.captureException(...)`
   (`:151`) vira operação sem efeito. (Que a variável não exista no projeto Vercel é afirmação
   de `docs/prod-readiness.md:873`, **não verificada** nesta sessão.)
2. `error_logs` sem nenhum alerta — `errorTracking.ts:100` insere na tabela, e os únicos
   leitores são `src/components/atoms/SystemHealthBadge.tsx:52` e
   `src/pages/admin/AdminPlatformSLOPage.tsx:265`. Nenhum cron, nenhuma edge function e nenhum
   script leem `error_logs` para alertar; o único job de cron que toca logs é
   `cleanup-stale-logs-daily`, que **apaga**.

E a tela afirma o contrário ao usuário —
`src/components/shared/GlobalErrorBoundary.tsx:67-68`:
> "A equipe técnica já foi notificada automaticamente via Enterprise Error Monitor."

Isso é falso com a configuração atual.
**Agravante:** se o `INSERT` em `error_logs` for recusado, nem a linha existe
(`errorTracking.ts:113-118`).

**Impacto:** um erro crítico em produção não gera notificação para ninguém, e o usuário é
informado de que a equipe já sabe.

### A-150 · [Média] O histórico de execução de rotina não diminui, e o job de limpeza passa
**Camada:** observabilidade / banco · **Modo:** SNAPSHOT · **Confiança:** hipótese

`cron.job_run_details` tem 206.142 linhas com mais de 7 dias, e existe
`cleanup-stale-logs-daily` rodando com `falhas_7d = 0` — ou seja, o job de limpeza **passa** e
o histórico **não diminui**.
**O que falta para confirmar:** se `fn_cleanup_stale_logs` cobre essa tabela. A hipótese é que
não — e A-21 mostra que, mesmo que cobrisse, o Postgres gerenciado recusa
(`42501: must be owner of table job_run_details`).

### A-151 · [Média] Um quarto do esforço de teste de backend protege as funções erradas
**Camada:** testes · **Modo:** RASTREADO · **Confiança:** confirmado (com uma correção)

12 funções concentram 26 arquivos de teste Deno — `winloss-webhook-dispatcher` sozinha tem 11,
o segundo maior investimento do repositório — enquanto **134 diretórios de função têm 0
teste**, incluindo todos os de A-27 a A-35.
**Correção importante:** o relatório da camada de testes classificou essas 12 como "não
deployadas", apoiando-se no alerta `edge_sem_deploy` de `inventario/estado/banco.json`. Esse
alerta é **falso** (A-40): duas sondas independentes com `OPTIONS` provaram que as 171 funções
estão no ar, `winloss-webhook-dispatcher` incluída. Portanto o problema **não** é "teste de
código que não roda" — é distribuição: o esforço está concentrado em um subsistema que, por
A-119, está desligado por allowlist vazia, enquanto as funções que gravam sem checar papel não
têm nenhum teste.
