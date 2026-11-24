# public.team_custom_fields

> Tabela public.team_custom_fields. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), team_id uuid NOT NULL, field_key text NOT NULL, field_label text NOT NULL, field_type text NOT NULL DEFAULT 'number'::text, is_active boolean NOT NULL DEFAULT true, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: team_id → public.teams(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.team_custom_fields. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `team_id` | `uuid` | não |  |  | Coluna team_id da tabela public.team_custom_fields. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.teams(id). |
| 3 | `field_key` | `text` | não |  |  | Coluna field_key da tabela public.team_custom_fields. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `field_label` | `text` | não |  |  | Coluna field_label da tabela public.team_custom_fields. Tipo PostgreSQL: text. Não aceita NULL. |
| 5 | `field_type` | `text` | não | `'number'::text` |  | Coluna field_type da tabela public.team_custom_fields. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'number'::text. Validação CHECK: CHECK (field_type = ANY (ARRAY['number'::text, 'text'::text, 'boolean'::text])). |
| 6 | `is_active` | `boolean` | não | `true` |  | Coluna is_active da tabela public.team_custom_fields. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: true. |
| 7 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.team_custom_fields. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 8 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.team_custom_fields. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| team_custom_fields_field_type_check | CHECK | `CHECK (field_type = ANY (ARRAY['number'::text, 'text'::text, 'boolean'::text]))` |  |  | sim |
| team_custom_fields_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| team_custom_fields_team_id_field_key_key | UNIQUE | `UNIQUE (team_id, field_key)` |  |  | sim |
| team_custom_fields_team_id_fkey | FOREIGN KEY | `FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.salesperson_custom_field_values | salesperson_custom_field_values_field_id_fkey | field_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_team_custom_fields_team_id | btree | team_id | não | sim |  | `CREATE INDEX idx_team_custom_fields_team_id ON public.team_custom_fields USING btree (team_id)` |
| team_custom_fields_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX team_custom_fields_pkey ON public.team_custom_fields USING btree (id)` |
| team_custom_fields_team_id_field_key_key | btree | team_id, field_key | sim | sim |  | `CREATE UNIQUE INDEX team_custom_fields_team_id_field_key_key ON public.team_custom_fields USING btree (team_id, field_key)` |


## Policies (RLS)

### `Admins can manage custom fields`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK | `has_role(auth.uid(), 'admin'::app_role)` |

### `Authenticated can view custom fields`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_authenticated()` |
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
