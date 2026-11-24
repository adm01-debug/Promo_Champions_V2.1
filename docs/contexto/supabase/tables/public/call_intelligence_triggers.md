# public.call_intelligence_triggers

> Tabela public.call_intelligence_triggers. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), trigger_keyword text NOT NULL, action_type text NULLABLE DEFAULT 'battlecard'::text, target_asset_id uuid NULLABLE, is_active boolean NULLABLE DEFAULT true, created_at timestamp with time zone NULLABLE DEFAULT now(). Relacionamentos FK: target_asset_id → public.sales_enablement_assets(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.call_intelligence_triggers. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `trigger_keyword` | `text` | não |  |  | Coluna trigger_keyword da tabela public.call_intelligence_triggers. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `action_type` | `text` | sim | `'battlecard'::text` |  | Coluna action_type da tabela public.call_intelligence_triggers. Tipo PostgreSQL: text. Aceita NULL. Valor padrão: 'battlecard'::text. |
| 4 | `target_asset_id` | `uuid` | sim |  |  | Coluna target_asset_id da tabela public.call_intelligence_triggers. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.sales_enablement_assets(id). |
| 5 | `is_active` | `boolean` | sim | `true` |  | Coluna is_active da tabela public.call_intelligence_triggers. Tipo PostgreSQL: boolean. Aceita NULL. Valor padrão: true. |
| 6 | `created_at` | `timestamp with time zone` | sim | `now()` |  | Coluna created_at da tabela public.call_intelligence_triggers. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| call_intelligence_triggers_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| call_intelligence_triggers_target_asset_id_fkey | FOREIGN KEY | `FOREIGN KEY (target_asset_id) REFERENCES sales_enablement_assets(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| call_intelligence_triggers_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX call_intelligence_triggers_pkey ON public.call_intelligence_triggers USING btree (id)` |
| idx_call_intelligence_triggers_target_asset_id | btree | target_asset_id | não | sim |  | `CREATE INDEX idx_call_intelligence_triggers_target_asset_id ON public.call_intelligence_triggers USING btree (target_asset_id)` |


## Policies (RLS)

### `Allow read for all authenticated users`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.role() = 'authenticated'::text)` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
