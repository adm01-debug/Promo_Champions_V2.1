# LGPD — Conformidade no Promo Champions V2.1

> Status: implementação de infraestrutura entregue na migration
> `supabase/migrations/20261001150000_lgpd_consent_and_anonymization.sql`.
> **Pendente:** aplicação em produção (passo manual — ver §6).

Este documento é a fonte de verdade para consentimento, retenção e
direitos do titular (Lei 13.709/2018).

## 1. Tabela de retenção por tabela

| Tabela                                                                                                                                   | Conteúdo                     | Base legal                                                          | Retenção                                        | Mecanismo                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------- |
| `website_visitor_logs`                                                                                                                   | IP + empresa desanonimizada  | Legítimo interesse (art. 7º, IX) com opt-out; consentimento estende | **90 dias** ou enquanto consentimento ativo     | `fn_apply_data_retention()` diário + `retention_expires_at` |
| `webhook_inbound_dedupe`                                                                                                                 | chaves de dedupe de webhooks | Execução de contrato                                                | **30 dias**                                     | `fn_apply_data_retention()`                                 |
| `webhook_inbound_log`                                                                                                                    | log de ingresso              | Legítimo interesse/segurança                                        | **30 dias**                                     | idem                                                        |
| `query_telemetry`, `web_vitals_samples`, `salesperson_performance_telemetry`                                                             | telemetria                   | Legítimo interesse                                                  | **90 dias**                                     | idem                                                        |
| `error_logs`, `integration_logs`, `session_activity`, `rate_limit_logs`                                                                  | logs operacionais            | Legítimo interesse/segurança                                        | **30–90 dias**                                  | idem + `fn_cleanup_stale_logs` (ADR-007)                    |
| `login_attempts`, `login_alerts`, `access_denied_logs`                                                                                   | segurança                    | Obrigação legal/segurança (art. 7º, VIII)                           | **180 dias**                                    | `fn_apply_data_retention()`                                 |
| `audit_log`, `audit_logs`, `data_access_log`, `security_events`                                                                          | auditoria                    | Obrigação legal/boa-fé                                              | **12 meses** (decisão — ver §5)                 | `fn_apply_data_retention()`                                 |
| `consent_records`                                                                                                                        | consentimento                | Obrigação legal (prova de consentimento)                            | **5 anos após revogação** (prazo prescricional) | manual                                                      |
| `data_subject_requests`                                                                                                                  | solicitações do titular      | Obrigação legal                                                     | **5 anos**                                      | manual                                                      |
| `clients`, `account_contacts`, `person_intelligence`, `deal_stakeholders`, `buying_committee(_members)`, `document_signers`, `suppliers` | cadastro de contatos         | Execução de contrato / legítimo interesse                           | enquanto relação ativa + prescrição             | `anonymize_data_subject()` sob demanda                      |
| `login_attempts`, logs de segurança (pos-anonimização)                                                                                   | IP/User-Agent                | —                                                                   | zerado por titular                              | `anonymize_data_subject()`                                  |

## 2. Consentimento (`consent_records`)

- `purpose`: finalidade (`marketing`, `analytics`, `visitor_tracking`,
  `voice_recording`, `whatsapp`, ...).
- `legal_basis`: `consent` (padrão), `legitimate_interest`, `contract`,
  `legal_obligation`.
- `revoked_at` preenchido = consentimento revogado (a linha nunca é apagada:
  é a prova legal do consentimento).
- RLS: admin/manager leem e gerenciam tudo (`is_admin_or_manager`);
  o titular (`subject_id = auth.uid()` ou `subject_email` = e-mail do JWT)
  lê, registra e revoga o próprio consentimento.
- `public.has_active_consent(email, purpose)` — checagem reutilizável para
  edge functions e guards.

## 3. Solicitações do titular (`data_subject_requests`)

Fila de pedidos do titular (art. 18): `access`, `rectification`, `erasure`,
`portability`, `consent_revocation`, `information`. SLA legal de 15 dias
(`due_at` default). O titular abre e acompanha a própria solicitação via RLS;
admin/manager processam.

## 4. Fluxo de esquecimento (erasure)

```
titular solicita → INSERT em data_subject_requests (request_type='erasure')
admin aprova    → UPDATE status='in_progress'
execução        → SELECT public.anonymize_data_subject(
                     p_subject_email := 'titular@ex.com',
                     p_subject_id    := '<uuid opcional>',
                     p_phone         := '+55... opcional',
                     p_ip            := 'x.x.x.x opcional',
                     p_request_id    := '<id da solicitação>');
                  → reescreve PII p/ tombstone hash (md5) e marca a
                    solicitação como completed com o resultado em `result`
```

`anonymize_data_subject` é `SECURITY DEFINER`, exige admin/manager ou
`service_role`, e retorna `jsonb` com a contagem de linhas alteradas por
tabela. Cobertura de PII (enumerada por grep do schema):

- **identidade**: `clients`, `account_contacts`, `person_intelligence`,
  `deal_stakeholders`, `buying_committee`, `buying_committee_members`,
  `document_signers`, `csat_ces_surveys`, `channel_interactions`,
  `activities`, `suppliers`, `salespeople`
- **opt-out/preferência**: `email_opt_outs`, `notification_preferences`
- **telefone**: `sms_verification_codes`, `user_mfa_settings`,
  `twilio_call_sessions`, `outbound_messages`, `integration_logs`
- **IP/User-Agent em logs**: `website_visitor_logs`, `audit_log`,
  `audit_logs`, `login_attempts`, `session_activity`, `active_sessions`,
  `known_devices`, `security_events`, `login_alerts`,
  `mfa_verification_attempts`, `password_reset_requests`,
  `reauthentication_requests`, `user_2fa_log`, `access_denied_logs`,
  `error_logs`, `web_vitals_samples`
- **consentimento**: revoga todos os `consent_records` ativos do titular.

Limitações conhecidas (verdade acima de validação):

- Colunas só com **nome** (`activities.contact_name`,
  `buying_committee.contact_name`, `channel_interactions.contact_name`) são
  casadas pelo nome atual em `clients`. Se o titular não existir em
  `clients`, essas colunas ficam intactas — a query de verificação do §6
  lista ocorrências residuais para revisão manual.
- `email_opt_outs` tem o e-mail substituído pelo tombstone: o endereço
  anonimizado deixa de suprimir envios futuros para o e-mail real (efeito
  aceitável — o titular pediu eliminação; novos opt-outs recriam a linha).
- PII embutida em JSONB livre (`metadata`, `payload`, `notes` de tabelas
  fora da lista) não é varrida — revisão manual quando apontada.

## 5. Base legal resumida

- **Cadastro de clientes/contatos**: execução de contrato (art. 7º, V).
- **Visitor logs (IP/empresa)**: legítimo interesse (art. 7º, IX) com
  purge de 90d e opt-out via revogação de `consent_records`/`erasure`.
- **Telemetria e logs operacionais**: legítimo interesse/segurança.
- **Logs de segurança e auditoria**: obrigação legal/boa-fé — retenção
  maior, mas PII (IP/UA) é anonimizado por titular sob pedido.
- **Gravação de chamadas**: exige `consent_records` com
  `purpose='voice_recording'` antes da coleta (TODO de produto — pendente
  de UI, fora do escopo desta migration).

## 6. Passo manual de aplicação e verificação (produção)

Sem acesso ao Supabase a partir do repo: aplicar as migrations via `db_query`
no MCP (gateway `supabase-promo-champions-v2-mcp.adm01.workers.dev`) ou
Supabase SQL Editor, na ordem:

```sql
-- 1) aplicar o conteúdo de:
--    supabase/migrations/20261001150000_lgpd_consent_and_anonymization.sql
--    supabase/migrations/20261001151000_log_retention_indexes_and_purge.sql

-- 2) verificação pós-aplicação (literais):

SELECT max(version::bigint) FROM supabase_migrations.schema_migrations;
SELECT count(*) FROM public.consent_records;
SELECT count(*) FROM public.data_retention_policies WHERE enabled;
SELECT jobname, schedule FROM cron.job
 WHERE jobname IN ('data-retention-purge-daily','cleanup-stale-logs-daily');

-- 3) smoke da RPC (deve retornar jsonb de contagens, sem estourar):
SELECT public.anonymize_data_subject(
  p_subject_email := 'nao-existe@exemplo.invalid');

-- 4) residual de colunas só-nome após um erasure (revisão manual):
SELECT id, contact_name FROM public.activities
 WHERE contact_name = '<nome do titular eliminado>';
```
