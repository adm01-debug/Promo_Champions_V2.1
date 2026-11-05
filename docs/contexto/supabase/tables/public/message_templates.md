# public.message_templates

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `salesperson_id` | `uuid` | não |  |  |  |
| 3 | `name` | `text` | não |  |  |  |
| 4 | `channel` | `text` | não | `'whatsapp'::text` |  |  |
| 5 | `subject` | `text` | sim |  |  |  |
| 6 | `body` | `text` | não |  |  |  |
| 7 | `variables` | `text[]` | sim | `'{}'::text[]` |  |  |
| 8 | `category` | `text` | sim | `'geral'::text` |  |  |
| 9 | `is_active` | `boolean` | sim | `true` |  |  |
| 10 | `usage_count` | `integer` | sim | `0` |  |  |
| 11 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 12 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 13 | `pipeline_stage` | `text` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| message_templates_channel_check | CHECK | `CHECK (channel = ANY (ARRAY['whatsapp'::text, 'email'::text, 'linkedin'::text, 'sms'::text]))` |  |  | sim |
| message_templates_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| message_templates_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.channel_interactions | channel_interactions_template_id_fkey | template_id | SET NULL |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_message_templates_channel | btree | channel | não | sim |  | `CREATE INDEX idx_message_templates_channel ON public.message_templates USING btree (channel)` |
| idx_message_templates_salesperson | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_message_templates_salesperson ON public.message_templates USING btree (salesperson_id)` |
| idx_message_templates_stage | btree | pipeline_stage | não | sim | `(pipeline_stage IS NOT NULL)` | `CREATE INDEX idx_message_templates_stage ON public.message_templates USING btree (pipeline_stage) WHERE (pipeline_stage IS NOT NULL)` |
| message_templates_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX message_templates_pkey ON public.message_templates USING btree (id)` |


## Policies (RLS)

### `Users can create own templates`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(salesperson_id = get_current_salesperson_id())` |

### `Users can delete own templates`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(salesperson_id = get_current_salesperson_id())` |
| WITH CHECK |  |

### `Users can update own templates`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(salesperson_id = get_current_salesperson_id())` |
| WITH CHECK |  |

### `Users can view own templates`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(salesperson_id = get_current_salesperson_id())` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_message_templates_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

_nenhum_
