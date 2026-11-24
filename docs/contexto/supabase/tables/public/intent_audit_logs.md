# public.intent_audit_logs

> Tabela public.intent_audit_logs. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), lead_id uuid NULLABLE, event_type text NOT NULL, details jsonb NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(), rule_applied jsonb NULLABLE.

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 4 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.intent_audit_logs. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `lead_id` | `uuid` | sim |  |  | Coluna lead_id da tabela public.intent_audit_logs. Tipo PostgreSQL: uuid. Aceita NULL. |
| 3 | `event_type` | `text` | não |  |  | Coluna event_type da tabela public.intent_audit_logs. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `details` | `jsonb` | sim |  |  | Coluna details da tabela public.intent_audit_logs. Tipo PostgreSQL: jsonb. Aceita NULL. |
| 5 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.intent_audit_logs. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 6 | `rule_applied` | `jsonb` | sim |  |  | JSON containing the rule that triggered this log entry |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| intent_audit_logs_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_intent_audit_logs_lead_id | btree | lead_id | não | sim |  | `CREATE INDEX idx_intent_audit_logs_lead_id ON public.intent_audit_logs USING btree (lead_id)` |
| intent_audit_logs_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX intent_audit_logs_pkey ON public.intent_audit_logs USING btree (id)` |


## Policies (RLS)

### `Authenticated users can insert intent audit logs`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `true` |

### `Authenticated users can view intent audit logs`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `Permitir leitura para todos autenticados`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.role() = 'authenticated'::text)` |
| WITH CHECK |  |

### `Users can only insert their own intent logs`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(auth.uid() IS NOT NULL)` |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
