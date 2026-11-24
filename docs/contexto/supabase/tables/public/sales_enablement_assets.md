# public.sales_enablement_assets

> Tabela public.sales_enablement_assets. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), title text NOT NULL, description text NULLABLE, category text NOT NULL DEFAULT 'general'::text, asset_type text NOT NULL DEFAULT 'document'::text, file_url text NULLABLE, thumbnail_url text NULLABLE, tags text[] NULLABLE DEFAULT ARRAY[]::text[], funnel_stage text NULLABLE, is_active boolean NOT NULL DEFAULT true, view_count integer NOT NULL DEFAULT 0, created_by uuid NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now().

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.sales_enablement_assets. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `title` | `text` | não |  |  | Coluna title da tabela public.sales_enablement_assets. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `description` | `text` | sim |  |  | Coluna description da tabela public.sales_enablement_assets. Tipo PostgreSQL: text. Aceita NULL. |
| 4 | `category` | `text` | não | `'general'::text` |  | Coluna category da tabela public.sales_enablement_assets. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'general'::text. |
| 5 | `asset_type` | `text` | não | `'document'::text` |  | Coluna asset_type da tabela public.sales_enablement_assets. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'document'::text. |
| 6 | `file_url` | `text` | sim |  |  | Coluna file_url da tabela public.sales_enablement_assets. Tipo PostgreSQL: text. Aceita NULL. |
| 7 | `thumbnail_url` | `text` | sim |  |  | Coluna thumbnail_url da tabela public.sales_enablement_assets. Tipo PostgreSQL: text. Aceita NULL. |
| 8 | `tags` | `text[]` | sim | `ARRAY[]::text[]` |  | Coluna tags da tabela public.sales_enablement_assets. Tipo PostgreSQL: text[]. Aceita NULL. Valor padrão: ARRAY[]::text[]. |
| 9 | `funnel_stage` | `text` | sim |  |  | Coluna funnel_stage da tabela public.sales_enablement_assets. Tipo PostgreSQL: text. Aceita NULL. |
| 10 | `is_active` | `boolean` | não | `true` |  | Coluna is_active da tabela public.sales_enablement_assets. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: true. |
| 11 | `view_count` | `integer` | não | `0` |  | Coluna view_count da tabela public.sales_enablement_assets. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 12 | `created_by` | `uuid` | sim |  |  | Coluna created_by da tabela public.sales_enablement_assets. Tipo PostgreSQL: uuid. Aceita NULL. |
| 13 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.sales_enablement_assets. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 14 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.sales_enablement_assets. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| sales_enablement_assets_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.asset_usage_logs | asset_usage_logs_asset_id_fkey | asset_id | CASCADE |
| public.call_intelligence_triggers | call_intelligence_triggers_target_asset_id_fkey | target_asset_id | SET NULL |
| public.playbook_items | playbook_items_asset_id_fkey | asset_id | SET NULL |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_sea_category | btree | category | não | sim | `(is_active = true)` | `CREATE INDEX idx_sea_category ON public.sales_enablement_assets USING btree (category) WHERE (is_active = true)` |
| idx_sea_funnel_stage | btree | funnel_stage | não | sim | `(is_active = true)` | `CREATE INDEX idx_sea_funnel_stage ON public.sales_enablement_assets USING btree (funnel_stage) WHERE (is_active = true)` |
| sales_enablement_assets_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX sales_enablement_assets_pkey ON public.sales_enablement_assets USING btree (id)` |


## Policies (RLS)

### `Authenticated users can view active assets`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((is_active = true) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |

### `Managers can manage assets`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| on_asset_ai_activation | AFTER | UPDATE | ROW | enabled | public.notify_asset_ai_status |
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_sea_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
