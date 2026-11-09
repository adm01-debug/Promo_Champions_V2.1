# public.pipeline_stages

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 6 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `pipeline_id` | `uuid` | não |  |  |  |
| 3 | `name` | `text` | não |  |  |  |
| 4 | `label` | `text` | não |  |  |  |
| 5 | `color` | `text` | não | `'bg-blue-500'::text` |  |  |
| 6 | `stage_order` | `integer` | não | `0` |  |  |
| 7 | `probability` | `integer` | não | `0` |  |  |
| 8 | `is_final` | `boolean` | não | `false` |  |  |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| pipeline_stages_pipeline_id_fkey | FOREIGN KEY | `FOREIGN KEY (pipeline_id) REFERENCES pipelines(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| pipeline_stages_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_pipeline_stages_pipeline_id | btree | pipeline_id | não | sim |  | `CREATE INDEX idx_pipeline_stages_pipeline_id ON public.pipeline_stages USING btree (pipeline_id)` |
| pipeline_stages_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX pipeline_stages_pkey ON public.pipeline_stages USING btree (id)` |


## Policies (RLS)

### `Authenticated users can view pipeline stages`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `Only admins can manage pipeline stages`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `pipeline_stages_delete_admin_manager`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `pipeline_stages_insert_admin_manager`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `pipeline_stages_select_authenticated`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `pipeline_stages_update_admin_manager`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
