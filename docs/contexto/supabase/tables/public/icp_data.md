# public.icp_data

> Dados de perfil de cliente ideal (ICP) associados a clientes.

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 3 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Identificador único do registro ICP. |
| 2 | `client_id` | `uuid` | não |  |  | Cliente ao qual os dados ICP pertencem. |
| 3 | `ramo_atividade` | `text` | sim |  |  | Ramo de atividade do cliente, quando informado. |
| 4 | `grupo_nicho` | `text` | sim |  |  | Grupo ou nicho de mercado do cliente, quando informado. |
| 5 | `capital_social` | `numeric(15,2)` | sim |  |  | Capital social declarado pelo cliente, em BRL. |
| 6 | `num_colaboradores` | `integer` | sim |  |  | Número de colaboradores declarado ou estimado. |
| 7 | `is_icp_match` | `boolean` | sim | `false` |  | Indica se o cliente corresponde aos critérios de perfil de cliente ideal. |
| 8 | `bitrix_id` | `text` | sim |  |  | Identificador do cliente no Bitrix24, quando disponível. |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  | Data e hora de criação do registro ICP. |
| 10 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Data e hora da última atualização do registro ICP. |
| 11 | `icp_score` | `integer` | sim | `0` |  | Pontuação de aderência do cliente ao perfil ICP; a escala é definida pela aplicação. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| icp_data_client_id_fkey | FOREIGN KEY | `FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| icp_data_client_id_key | UNIQUE | `UNIQUE (client_id)` |  |  | sim |
| icp_data_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| icp_data_client_id_key | btree | client_id | sim | sim |  | `CREATE UNIQUE INDEX icp_data_client_id_key ON public.icp_data USING btree (client_id)` |
| icp_data_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX icp_data_pkey ON public.icp_data USING btree (id)` |
| idx_icp_data_bitrix_id | btree | bitrix_id | não | sim |  | `CREATE INDEX idx_icp_data_bitrix_id ON public.icp_data USING btree (bitrix_id)` |
| idx_icp_data_client_id | btree | client_id | não | sim |  | `CREATE INDEX idx_icp_data_client_id ON public.icp_data USING btree (client_id)` |
| idx_icp_data_grupo | btree | grupo_nicho | não | sim |  | `CREATE INDEX idx_icp_data_grupo ON public.icp_data USING btree (grupo_nicho)` |
| idx_icp_data_ramo | btree | ramo_atividade | não | sim |  | `CREATE INDEX idx_icp_data_ramo ON public.icp_data USING btree (ramo_atividade)` |
| ux_icp_data_bitrix_id | btree | bitrix_id | sim | sim |  | `CREATE UNIQUE INDEX ux_icp_data_bitrix_id ON public.icp_data USING btree (bitrix_id)` |


## Policies (RLS)

### `Admins can insert icp_data`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Admins can update icp_data`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Users can read own client icp_data`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((client_id IN ( SELECT client_portfolio.client_id    FROM client_portfolio   WHERE (client_portfolio.salesperson_id = get_current_salesperson_id()))) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trig_update_icp_score | BEFORE | INSERT OR UPDATE | ROW | enabled | public.fn_calculate_icp_score |
| update_icp_data_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
