# public.team_custom_fields

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `team_id` | `uuid` | não |  |  |  |
| 3 | `field_key` | `text` | não |  |  |  |
| 4 | `field_label` | `text` | não |  |  |  |
| 5 | `field_type` | `text` | não | `'number'::text` |  |  |
| 6 | `is_active` | `boolean` | não | `true` |  |  |
| 7 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 8 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


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

_nenhum_
