# public.custom_reports

> Tabela public.custom_reports. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), owner_id uuid NOT NULL, name text NOT NULL, description text NULLABLE, entity text NOT NULL, config jsonb NOT NULL DEFAULT '{}'::jsonb, is_shared boolean NOT NULL DEFAULT false, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now().

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 2 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.custom_reports. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `owner_id` | `uuid` | não |  |  | Coluna owner_id da tabela public.custom_reports. Tipo PostgreSQL: uuid. Não aceita NULL. |
| 3 | `name` | `text` | não |  |  | Coluna name da tabela public.custom_reports. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `description` | `text` | sim |  |  | Coluna description da tabela public.custom_reports. Tipo PostgreSQL: text. Aceita NULL. |
| 5 | `entity` | `text` | não |  |  | Coluna entity da tabela public.custom_reports. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (entity = ANY (ARRAY['sales'::text, 'accounts'::text, 'activities'::text, 'leads'::text, 'salespeople'::text, 'clients'::text, 'cross'::text])). |
| 6 | `config` | `jsonb` | não | `'{}'::jsonb` |  | Coluna config da tabela public.custom_reports. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '{}'::jsonb. |
| 7 | `is_shared` | `boolean` | não | `false` |  | Coluna is_shared da tabela public.custom_reports. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: false. |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.custom_reports. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 9 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.custom_reports. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| custom_reports_entity_check | CHECK | `CHECK (entity = ANY (ARRAY['sales'::text, 'accounts'::text, 'activities'::text, 'leads'::text, 'salespeople'::text, 'clients'::text, 'cross'::text]))` |  |  | sim |
| custom_reports_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.embedded_report_tokens | embedded_report_tokens_report_id_fkey | report_id | CASCADE |
| public.report_embed_tokens | report_embed_tokens_report_id_fkey | report_id | CASCADE |
| public.report_executions | report_executions_report_id_fkey | report_id | CASCADE |
| public.report_schedules | report_schedules_report_id_fkey | report_id | CASCADE |
| public.scheduled_reports | scheduled_reports_report_id_fkey | report_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| custom_reports_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX custom_reports_pkey ON public.custom_reports USING btree (id)` |
| idx_custom_reports_owner | btree | owner_id | não | sim |  | `CREATE INDEX idx_custom_reports_owner ON public.custom_reports USING btree (owner_id)` |
| idx_custom_reports_shared | btree | is_shared | não | sim | `(is_shared = true)` | `CREATE INDEX idx_custom_reports_shared ON public.custom_reports USING btree (is_shared) WHERE (is_shared = true)` |


## Policies (RLS)

### `owner_full_access`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((owner_id = auth.uid()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK | `((owner_id = auth.uid()) OR is_admin_or_manager(auth.uid()))` |

### `shared_select`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(is_shared = true)` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_custom_reports_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
