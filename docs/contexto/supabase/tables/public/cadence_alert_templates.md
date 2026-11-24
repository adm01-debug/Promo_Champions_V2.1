# public.cadence_alert_templates

> Tabela public.cadence_alert_templates. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), name text NOT NULL, type text NOT NULL, subject text NULLABLE, content text NOT NULL, is_default boolean NULLABLE DEFAULT false, created_at timestamp with time zone NULLABLE DEFAULT now(), updated_at timestamp with time zone NULLABLE DEFAULT now(), start_time time without time zone NULLABLE DEFAULT '09:00:00'::time without time zone, end_time time without time zone NULLABLE DEFAULT '18:00:00'::time without time zone, days_of_week text[] NULLABLE DEFAULT ARRAY['Monday'::text, 'Tuesday'::text, 'Wednesday'::text, 'Thursday'::text, 'Friday'::text], timezone text NULLABLE DEFAULT 'America/Sao_Paulo'::text.

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 1 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.cadence_alert_templates. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `name` | `text` | não |  |  | Coluna name da tabela public.cadence_alert_templates. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `type` | `text` | não |  |  | Coluna type da tabela public.cadence_alert_templates. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (type = ANY (ARRAY['push'::text, 'email'::text])). |
| 4 | `subject` | `text` | sim |  |  | Coluna subject da tabela public.cadence_alert_templates. Tipo PostgreSQL: text. Aceita NULL. |
| 5 | `content` | `text` | não |  |  | Coluna content da tabela public.cadence_alert_templates. Tipo PostgreSQL: text. Não aceita NULL. |
| 6 | `is_default` | `boolean` | sim | `false` |  | Coluna is_default da tabela public.cadence_alert_templates. Tipo PostgreSQL: boolean. Aceita NULL. Valor padrão: false. |
| 7 | `created_at` | `timestamp with time zone` | sim | `now()` |  | Coluna created_at da tabela public.cadence_alert_templates. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |
| 8 | `updated_at` | `timestamp with time zone` | sim | `now()` |  | Coluna updated_at da tabela public.cadence_alert_templates. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |
| 9 | `start_time` | `time without time zone` | sim | `'09:00:00'::time without time zone` |  | Coluna start_time da tabela public.cadence_alert_templates. Tipo PostgreSQL: time without time zone. Aceita NULL. Valor padrão: '09:00:00'::time without time zone. |
| 10 | `end_time` | `time without time zone` | sim | `'18:00:00'::time without time zone` |  | Coluna end_time da tabela public.cadence_alert_templates. Tipo PostgreSQL: time without time zone. Aceita NULL. Valor padrão: '18:00:00'::time without time zone. |
| 11 | `days_of_week` | `text[]` | sim | `ARRAY['Monday'::text, 'Tuesday'::text, 'Wednesday'::text, 'Thursday'::text, 'Friday'::text]` |  | Coluna days_of_week da tabela public.cadence_alert_templates. Tipo PostgreSQL: text[]. Aceita NULL. Valor padrão: ARRAY['Monday'::text, 'Tuesday'::text, 'Wednesday'::text, 'Thursday'::text, 'Friday'::text]. |
| 12 | `timezone` | `text` | sim | `'America/Sao_Paulo'::text` |  | Coluna timezone da tabela public.cadence_alert_templates. Tipo PostgreSQL: text. Aceita NULL. Valor padrão: 'America/Sao_Paulo'::text. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| cadence_alert_templates_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| cadence_alert_templates_type_check | CHECK | `CHECK (type = ANY (ARRAY['push'::text, 'email'::text]))` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.cadence_outcome_rules | cadence_outcome_rules_email_template_id_fkey | email_template_id | SET NULL |
| public.cadence_outcome_rules | cadence_outcome_rules_push_template_id_fkey | push_template_id | SET NULL |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| cadence_alert_templates_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX cadence_alert_templates_pkey ON public.cadence_alert_templates USING btree (id)` |


## Policies (RLS)

### `Authenticated read for alert templates`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
