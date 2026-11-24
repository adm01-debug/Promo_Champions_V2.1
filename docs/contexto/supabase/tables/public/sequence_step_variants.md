# public.sequence_step_variants

> Tabela public.sequence_step_variants. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), step_id uuid NOT NULL, label text NOT NULL, subject text NULLABLE, body text NULLABLE, traffic_weight integer NOT NULL DEFAULT 50, created_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: step_id → public.sequence_steps(id).

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
| usada por views | public.sequence_variant_performance |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.sequence_step_variants. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `step_id` | `uuid` | não |  |  | Coluna step_id da tabela public.sequence_step_variants. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.sequence_steps(id). |
| 3 | `label` | `text` | não |  |  | Coluna label da tabela public.sequence_step_variants. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (label = ANY (ARRAY['A'::text, 'B'::text])). |
| 4 | `subject` | `text` | sim |  |  | Coluna subject da tabela public.sequence_step_variants. Tipo PostgreSQL: text. Aceita NULL. |
| 5 | `body` | `text` | sim |  |  | Coluna body da tabela public.sequence_step_variants. Tipo PostgreSQL: text. Aceita NULL. |
| 6 | `traffic_weight` | `integer` | não | `50` |  | Coluna traffic_weight da tabela public.sequence_step_variants. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 50. Validação CHECK: CHECK (traffic_weight >= 0 AND traffic_weight <= 100). |
| 7 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.sequence_step_variants. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| sequence_step_variants_label_check | CHECK | `CHECK (label = ANY (ARRAY['A'::text, 'B'::text]))` |  |  | sim |
| sequence_step_variants_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| sequence_step_variants_step_id_fkey | FOREIGN KEY | `FOREIGN KEY (step_id) REFERENCES sequence_steps(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| sequence_step_variants_step_id_label_key | UNIQUE | `UNIQUE (step_id, label)` |  |  | sim |
| sequence_step_variants_traffic_weight_check | CHECK | `CHECK (traffic_weight >= 0 AND traffic_weight <= 100)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.sequence_step_assignments | sequence_step_assignments_variant_id_fkey | variant_id | SET NULL |
| public.sequence_step_executions | sequence_step_executions_variant_id_fkey | variant_id | SET NULL |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_sequence_step_variants_step | btree | step_id | não | sim |  | `CREATE INDEX idx_sequence_step_variants_step ON public.sequence_step_variants USING btree (step_id)` |
| sequence_step_variants_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX sequence_step_variants_pkey ON public.sequence_step_variants USING btree (id)` |
| sequence_step_variants_step_id_label_key | btree | step_id, label | sim | sim |  | `CREATE UNIQUE INDEX sequence_step_variants_step_id_label_key ON public.sequence_step_variants USING btree (step_id, label)` |


## Policies (RLS)

### `delete variants`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `user_owns_sequence_step(step_id)` |
| WITH CHECK |  |

### `insert variants`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `user_owns_sequence_step(step_id)` |

### `update variants`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `user_owns_sequence_step(step_id)` |
| WITH CHECK |  |

### `view variants`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `user_owns_sequence_step(step_id)` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
