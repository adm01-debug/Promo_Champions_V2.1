# public.pipeline_stages

> Tabela public.pipeline_stages. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), pipeline_id uuid NOT NULL, name text NOT NULL, label text NOT NULL, color text NOT NULL DEFAULT 'bg-blue-500'::text, stage_order integer NOT NULL DEFAULT 0, probability integer NOT NULL DEFAULT 0, is_final boolean NOT NULL DEFAULT false, created_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: pipeline_id → public.pipelines(id).

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 5 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.pipeline_stages. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `pipeline_id` | `uuid` | não |  |  | Coluna pipeline_id da tabela public.pipeline_stages. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.pipelines(id). |
| 3 | `name` | `text` | não |  |  | Coluna name da tabela public.pipeline_stages. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `label` | `text` | não |  |  | Coluna label da tabela public.pipeline_stages. Tipo PostgreSQL: text. Não aceita NULL. |
| 5 | `color` | `text` | não | `'bg-blue-500'::text` |  | Coluna color da tabela public.pipeline_stages. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'bg-blue-500'::text. |
| 6 | `stage_order` | `integer` | não | `0` |  | Coluna stage_order da tabela public.pipeline_stages. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. Validação CHECK: CHECK (stage_order IS NULL OR stage_order >= 0). |
| 7 | `probability` | `integer` | não | `0` |  | Coluna probability da tabela public.pipeline_stages. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 8 | `is_final` | `boolean` | não | `false` |  | Coluna is_final da tabela public.pipeline_stages. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: false. |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.pipeline_stages. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| pipeline_stage_order_positive | CHECK | `CHECK (stage_order IS NULL OR stage_order >= 0)` |  |  | sim |
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
