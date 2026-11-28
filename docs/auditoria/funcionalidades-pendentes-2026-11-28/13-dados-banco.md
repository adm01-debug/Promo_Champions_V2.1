# Dados e banco

[Voltar ao índice](README.md)

251 itens não implementados, parciais ou não verificáveis neste domínio.

## Não implementado (106)

### F0110 · Validation Rules declarativas

- **Tipo:** Componente
- **O que os docs afirmam:** Falta regras de validação declarativas.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:150`
- **O que falta:** Tabela de regras de validação (entidade, campo, operador, mensagem, ativo) com RLS e updated_at, hook que as leia e aplique nos formulários (zod dinâmico) e/ou trigger SQL, e tela de administração.
- **Evidência:** ausente: grep -rniE 'validation_rule\|validationRule\|regras_validacao' src/ supabase/ → 0 resultados; snapshot tables.md só tem regras de domínio fixas (cadence_enrollment_rules:47, commission_rules:93, lead_routing_rules:197, pricing_rules:249) — nenhuma tabela genérica de regras de validação; validação atual é zod hardcoded em 21 arquivos de src/ (grep from 'zod'); docs/GAPS_CLASSE_MUNDIAL.md:150 lista como gap.| cético: Confirmado. ausente: grep -rliE 'validation[_ ]?rules?\|ValidationRule\|regras de valida' src supabase/functions → só src/components/activities/ActivityEditDialog.tsx:38 (comentário sobre zod fixo, não regra declarativa). Snapshot tables.md: grep -niE 'valid\|field_rule\|form_rule' → 0 tabelas de regras; team_custom_fields (tables/public/team_custom_fields.md colunas 1-8) só tem field_key/label/type/is_active, sem regra de validação.

### F3243 · Agendamento (cron) refresh-views (2 afirmações nos docs)

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** Migrations têm cron.schedule('refresh-views') e ('reindex-tables'), porém a listagem de cron.job em produção (11 jobs) não os inclui.| O doc lista `refresh-views` entre os 25 jobs pg_cron versionados em migrations (não verificado no banco).
- **Fontes:** `docs/estado/03_DOMINIO_SDR_CADENCIAS.md:15-49`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:5`
- **O que falta:** Agendar refresh-views e reindex-tables apontando para objetos que existem, ou dropar as funções v1 quebradas.
- **Evidência:** nenhum job em pg_cron para "refresh-views" (cron.md, 45 jobs)| cético: Os jobs nunca existiram além de comentário: supabase/migrations/20260104181000_materialized_views_enhanced.sql:100 e 20260104184000_performance_indexes_additional.sql:64 trazem o cron.schedule comentado com '--'. Não estão em snap/cron.md. As funções-alvo estão quebradas no banco real. snap/functions/public/refresh_materialized_views__12ae32cb1ec02d01.sql faz refresh de mv_sales_performance, mv_monthly_revenue, mv_product_performance, mv_client_ltv e mv_pipeline_health, que não existem em snap/views.md (grep → 0). snap/functions/public/reindex_tables__12ae32cb1ec02d01.sql faz REINDEX em deals, tabela ausente de snap/tables.md.

### F0138 · 20260903000002_fix_cron_project_ref.sql marcada como superseded

- **Tipo:** Doc/config
- **O que os docs afirmam:** DIVERGENTE: arquivo ainda contém rapjswienfhkobhlamxb.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:309`
- **O que falta:** Cabeçalho '-- SUPERSEDED por 20260910153000' no arquivo e registro em docs/execucao/MIGRATION_RENAME_MAP.md.
- **Evidência:** supabase/migrations/20260903000002_fix_cron_project_ref.sql:1-6 ainda contém 'rapjswienfhkobhlamxb' (linhas 3,5,6) e nenhuma marcação de superseded; versão registrada no ledger (.../contexto/supabase/migrations.md:610); docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:309 e A_planos_execucao.md:31 ainda apontam 'Marcar como superseded' como pendente; cron.md atual já usa _internal_secrets (cron.md:22-23), confirmando que a migration foi superada por 20260910153000.| cético: supabase/migrations/20260903000002_fix_cron_project_ref.sql:1-6 ainda contém rapjswienfhkobhlamxb e nenhuma marcação; grep -rn 'superseded' supabase/migrations → só 20261112140100 e 20261001193100 (outros objetos); nenhum doc de decisão cita a marcação (só auditorias: C_estado_runbooks.md:309 'Marcar como superseded' pendente; IDENTIDADE_BANCO_2026-09-13.md:67 'nunca foi aplicada'). Ledger reg…

### F0145 · 80 statements destrutivos/manutenção em migrations exigem classificação

- **Tipo:** Doc/config
- **O que os docs afirmam:** 80 statements textualmente destrutivos/de manutenção exigem classificação e gate.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:491-491`
- **O que falta:** Regra no check-migrations (--base) bloqueando DROP/TRUNCATE/DELETE sem WHERE sem marcador de aprovação; classificação dos 80 statements históricos.
- **Evidência:** Nenhum gate de statements destrutivos: grep -niE 'DROP\|TRUNCATE\|destrut\|DELETE FROM' .github/workflows/pr-checks.yml scripts/check-migrations.mjs → 0 resultados; scripts/check-migrations.mjs:1-22 documenta só 6 regras (nome, unicidade, vazio, versão crescente, RLS em CREATE TABLE, literais proibidos); scripts/ci-check-forbidden.sh:4 só bloqueia padrões LGPD/InstallPrompt; único match de TRUNCATE em scripts/ci/inventario-banco.unit.mjs:140 é teste do inventário, não gate.| cético: ausente: grep -rniE 'DROP \|TRUNCATE\|destrut\|destructive' .github/workflows/*.yml scripts/check-migrations.mjs → 0 resultados (os únicos matches em scripts/db-audit/gen-migration-probes.mjs:52-259 são parser de probes, não gate); ls scripts \| grep -iE 'destr\|danger\|drop' → 0.

### F0173 · Critério de drop: 30 dias de observação + confirmação de ausência de escritor externo

- **Tipo:** Doc/config
- **O que os docs afirmam:** Candidata só pode ser dropada após 30 dias de observação em produção (SELECT count(*), max(created_at) mensal) e confirmação de que nenhum job externo (n8n, Bitrix sync, desanonimização) escreve nela.
- **Fontes:** `docs/DEAD_TABLES.md:14-17`
- **O que falta:** Registro mensal datado de count/max(created_at) por candidata da lista A e confirmação dos escritores externos (n8n, Bitrix) antes de qualquer DROP.
- **Evidência:** Critério documentado em docs/DEAD_TABLES.md:14-17 e procedimento em :80-92 (observar 30 dias → _tomb_ → DROP). Não há registro de observação: grep -rn 'max(created_at)' docs/ só acha o próprio DEAD_TABLES.md e a medição única de docs/estado/11_DADOS_BANCO.md:548-593 (filas/dead-letters, agosto). Nenhuma migration dropa candidata da lista A (grep -lE 'DROP TABLE.*<tabela>' supabase/migrations → 0 para as 22); todas continuam no banco real (contexto/supabase/tables.md) exceto call_tracking, que nunca existiu (20261117090000_marca_594_migrations_como_aplicadas.sql:18). Nenhum arquivo _tomb_ nem verificação de escritores externos (n8n/Bitrix) registrada.| cético: docs/DEAD_TABLES.md:14-17 define o critério e :85-95 o procedimento (o passo 1 é observar 30 dias). Não há registro datado de count/max(created_at) por candidata nem verificação de escritores externos: o arquivo só tem o template S…

### F0177 · Decisão sobre 31 relações exclusivas

- **Tipo:** Doc/config
- **O que os docs afirmam:** P029 NI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:133`
- **O que falta:** Listar as 31 relações e decidir cada uma, ou declarar o item obsoleto porque a origem foi rebaixada (IDENTIDADE_BANCO_2026-09-13.md:13).
- **Evidência:** ausente: grep -rn -iE 'rela[çc][õo]es exclusivas' docs → só docs/auditoria/.../A_planos_execucao.md:133 ('NI — ausente'), AUDITORIA_EXAUSTIVA_2026-08-30...:681 e handoff/HANDOFF_CLINE...:315 (checkbox aberto). Nenhum documento de decisão, migration ou lista das 31 relações no repo.| cético: Sem evidência nova. Nenhum documento lista ou decide as 31 relações exclusivas; a fonte A_planos_execucao.md:133 marca NI.

### F0183 · Encerramento declarado da origem (CATALOGO_BANCO_ORIGEM)

- **Tipo:** Doc/config
- **O que os docs afirmam:** NI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:418`
- **O que falta:** Nota de encerramento no topo de docs/auditoria/CATALOGO_BANCO_ORIGEM_2026-08-26.md citando IDENTIDADE_BANCO_2026-09-13.md:13.
- **Evidência:** docs/auditoria/.../A_planos_execucao.md:418 'CATALOGO_BANCO_ORIGEM| Reconciliação com a origem \| NI \| origem rebaixada a projeto antigo \| Declarar o encerramento'. docs/auditoria/CATALOGO_BANCO_ORIGEM_2026-08-26.md:1-16 só tem 'Atualização de fechamento' apontando a MATRIZ_FORENSE, sem declaração de encerramento; docs/estado/IDENTIDADE_BANCO_2026-09-13.md classifica rapjswienfhkobhlamxb como 'projeto antigo' (:13) mas não cita o catálogo (grep -iE 'origem\|CATALOGO\|encerr' → 0). Commit 813f591 'fecha o registro de encerramento' refere-se a branches (docs/agentes/branches-encerradas-261117.md), não à origem. \| cético: docs/auditoria/CATALOGO_BANCO_ORIGEM_2026-08-26.md:1-16 não declara encerramento (só aponta a MATRIZ_FORENSE); A_planos_execucao.md:418 continua 'NI … Declarar o encerramento'. Nenhum doc fora da auditoria declara a origem encerrada.

### F0184 · Entrada `extensions` no catálogo de RPCs (provável falso positivo do gerador)

- **Tipo:** Doc/config
- **O que os docs afirmam:** API.md lista `extensions` como RPC definida em 20251228_move_extensions_to_schema.sql (grants: —). O nome sugere artefato de parsing de scripts/gen-api-catalog.mjs e não uma function real.
- **Fontes:** `docs/API.md:556-556`
- **O que falta:** public.extensions não existe no banco. Corrigir o regex de scripts/gen-api-catalog.mjs:177 para ignorar funções de outros schemas e regenerar docs/API.md.
- **Evidência:** Falso positivo confirmado: docs/API.md:556 lista RPC 'extensions' vinda de '20251228_move_extensions_to_schema.sql' (nome inexistente — arquivo real é supabase/migrations/20251228000003_move_extensions_to_schema.sql, cuja única função é 'extensions.rollback_extension_migration()' em :183). Causa: regex em scripts/gen-api-catalog.mjs:177 /create\s+(?:or\s+replace\s+)?function\s+(?:public\.)?([a-zA-Z_]\w*)/ captura o schema 'extensions' como nome. Banco real: snapshot.json db.functions não tem função chamada 'extensions' (0 resultados); contexto/supabase/functions.md idem.| cético: docs/API.md:556 lista a RPC 'extensions'; o regex de scripts/gen-api-catalog.mjs:177 (?:public\.)?([a-zA-Z_]\w*) captura o schema 'extensions' de 'extensions.rollback_extension_migration'. Ausente: grep 'public.extensions(' contexto/supabase/functions.md → 0.

### F0185 · Entrada `grants` no catálogo de RPCs (provável falso positivo do gerador)

- **Tipo:** Doc/config
- **O que os docs afirmam:** API.md lista `grants` como RPC definida em 20260722112916_c7c2c805-f441-4f27-995c-8c0dada0b675.sql (grants: —). O nome sugere artefato de parsing de scripts/gen-api-catalog.mjs e não uma function real.
- **Fontes:** `docs/API.md:634-634`
- **O que falta:** Função `public.grants` não existe nem deve existir: corrigir o regex de scripts/gen-api-catalog.mjs:177 (tirar comentários `--` e `/* */`, exigir `\s*\(` após o nome) e regenerar docs/API.md para remover a linha 634.
- **Evidência:** Falso positivo confirmado: scripts/gen-api-catalog.mjs:177 usa regex `create\s+(?:or\s+replace\s+)?function\s+(?:public\.)?([a-zA-Z_]\w*)` sem ignorar comentários; supabase/migrations/20260722112916_c7c2c805-f441-4f27-995c-8c0dada0b675.sql:2 é o comentário `-- CREATE FUNCTION grants EXECUTE to PUBLIC...` (a migration só faz REVOKE/GRANT em fn_cleanup_webhook_dedupe, linhas 4-7). Banco real: ausente — `grep -nE '^\\| (grants\|private\|to)\|' contexto/supabase/functions.md` → 0 resultados; `ls contexto/supabase/functions/public \| grep '^grants__'` → 0 resultados. docs/API.md:634 lista a entrada inexistente. \| cético: Confirmado. scripts/gen-api-catalog.mjs:177 regex `create\s+(?:or\s+replace\s+)?function\s+(?:public\.)?([a-zA-Z_]\w*)` roda sobre o SQL sem tirar comentários; supabase/migrations/20260722112916_c7c2c805-...sql:2 é o comentário `-- CREATE FUNCTION grants EXECUTE to PUBLIC..…

### F0186 · Entrada `private` no catálogo de RPCs (provável falso positivo do gerador)

- **Tipo:** Doc/config
- **O que os docs afirmam:** API.md lista `private` como RPC definida em 20260712195109_93d2c7b7-7fbb-4e7c-8a3f-ebae3d404292.sql (grants: —). O nome sugere artefato de parsing de scripts/gen-api-catalog.mjs e não uma function real.
- **Fontes:** `docs/API.md:693-693`
- **O que falta:** Aceitar no regex de gen-api-catalog.mjs:177 qualquer prefixo de schema (`(?:[a-z_]+\.)?`) e regenerar docs/API.md removendo a linha 693.
- **Evidência:** Falso positivo confirmado: supabase/migrations/20260712195109_93d2c7b7-7fbb-4e7c-8a3f-ebae3d404292.sql:2 é `CREATE OR REPLACE FUNCTION private.auto_victory_post()`; o regex de scripts/gen-api-catalog.mjs:177 só descarta o prefixo `public.`, então captura o nome do schema `private`. Banco real: existe schema private (contexto/supabase/functions/private/) mas nenhuma função chamada `private` — `grep -nE '^\\| private\|' contexto/supabase/functions.md` → 0 resultados. docs/API.md:693 lista a entrada inexistente. \| cético: Confirmado. supabase/migrations/20260712195109_93d2c7b7-...sql:1 `CREATE OR REPLACE FUNCTION private.auto_victory_post()`; o regex de scripts/gen-api-catalog.mjs:177 só descarta o prefixo `public.` e por isso pega o nome do schema `private`. docs/API.md:693 lista `private`. O banco real tem o schema private (contexto/supabase/functions/private/) mas nenhuma função chamad…

### F0187 · Entrada `to` no catálogo de RPCs (provável falso positivo do gerador)

- **Tipo:** Doc/config
- **O que os docs afirmam:** API.md lista `to` como RPC definida em 20260511203112_2dd0b918-e14b-411d-bfd7-1c4018d0432d.sql (grants: authenticated, service_role). O nome sugere artefato de parsing de scripts/gen-api-catalog.mjs e não uma function real.
- **Fontes:** `docs/API.md:748-748`
- **O que falta:** Mesma correção do F0185/F0186 em gen-api-catalog.mjs:177 e :181, depois regenerar docs/API.md removendo a linha 748.
- **Evidência:** Falso positivo confirmado: supabase/migrations/20260511203112_2dd0b918-e14b-411d-bfd7-1c4018d0432d.sql:33 é o comentário `-- Create function to calculate ICP score` (a função real é fn_calculate_icp_score, linha 34; a migration não tem GRANT — `grep -ni grant` → 0). O regex de scripts/gen-api-catalog.mjs:177 captura `to`; os grants 'authenticated, service_role' vêm do regex de GRANT em :181 casando `... TO ...;` de outro arquivo. Banco real: `grep -nE '^\\| to\|' contexto/supabase/functions.md` → 0 resultados. docs/API.md:748 lista a entrada inexistente. \| cético: Confirmado. supabase/migrations/20260511203112_2dd0b918-...sql:33 é o comentário `-- Create function to calculate ICP score` e a função real fica em :34 (`public.fn_calculate_icp_score`). O regex de gen-api-catalog.mjs:177 pega `to`. O regex de GRANT em :181 grava os grants de qualquer função que tenha o mesmo nome, e foi ass…

### F0191 · Etapa 21 do plano: Comparar schemas e relações

- **Tipo:** Doc/config
- **O que os docs afirmam:** Classificar cada uma das 564/410 diferenças como intencional, faltante, renomeada ou obsoleta. Saída esperada: matriz assinada por owner. Gate: catálogo destino completo.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:683-683`
- **O que falta:** Gerar a matriz (exige leitura do projeto origem) ou declarar a etapa obsoleta no STATUS:149.
- **Evidência:** Nenhuma matriz de relações 564/410: `grep -rlE '564' docs` só retorna o próprio plano (docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:683), STATUS (docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:149, estado 🔒 'Depende de 11') e docs não relacionados. docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:131 registra etapas 21–27 como 'NI (7)| não há artefato no repo \| Matrizes, ou declarar obsoleto'. Comparação origem/destino envolve outro projeto Supabase, fora do escopo por AGENTS.md §7. \| cético: Não há matriz de relações 564/410. STATUS_100_ETAPAS_2026-08-30.md:149 está em 🔒. docs/auditoria/CATALOGO_BANCO_ORIGEM_2026-08-26.md:111-122 ('Limite atual de reconciliação') diz que o catálogo do destino não pôde ser lido e que não dá para classificar objeto a objeto. Nenhum outro arquivo em docs/auditoria traz essa matriz.

### F0192 · Etapa 22 do plano: Comparar todas as colunas

- **Tipo:** Doc/config
- **O que os docs afirmam:** Tipo, nullable, default, identity, generated, comentário e posição por relação comum. Saída esperada: diff de 386/118 nomes e demais estruturas. Gate: nenhum DDL.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:684-684`
- **O que falta:** Gerar o diff (origem × destino) ou declarar obsoleto no STATUS:150.
- **Evidência:** Nenhum diff de colunas 386/118: `grep -rlE '386' docs` retorna só o plano (AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:684), sua atualização 30/08, STATUS_100_ETAPAS_2026-08-30.md:150 (🔒 'Depende de 11') e docs não relacionados. docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:131: etapas 21–27 'NI (7)| não há artefato no repo'. \| cético: Não há diff de colunas 386/118. STATUS_100_ETAPAS_2026-08-30.md:150 está em 🔒, e CATALOGO_BANCO_ORIGEM_2026-08-26.md:111-122 registra que a reconciliação objeto a objeto não foi feita.

### F0193 · Etapa 23 do plano: Comparar constraints

- **Tipo:** Doc/config
- **O que os docs afirmam:** PK, FK, UNIQUE, CHECK, deferrability, validação e ação referencial. Saída esperada: diff com severidade. Gate: catálogo destino completo.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:685-685`
- **O que falta:** Gerar o diff ou declarar obsoleto no STATUS:151.
- **Evidência:** Nenhum diff de constraints com severidade: `ls docs/auditoria docs/execucao docs/handoff` não contém artefato de comparação de constraints; docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:151 mantém 🔒 'Depende de 11'; docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:131 'NI (7)| não há artefato no repo'. \| cético: Não há diff de constraints com severidade. STATUS_100_ETAPAS_2026-08-30.md:151 está em 🔒; nenhum arquivo em docs/auditoria, docs/execucao ou docs/handoff compara constraints; CATALOGO_BANCO_ORIGEM:111-122 confirma o limite.

### F0194 · Etapa 24 do plano: Comparar índices

- **Tipo:** Doc/config
- **O que os docs afirmam:** Definição normalizada, include, parcial, expressão, validade, tamanho e uso. Saída esperada: matriz de equivalência/perda. Gate: catálogo destino completo.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:686-686`
- **O que falta:** Gerar a matriz de equivalência/perda ou declarar obsoleto no STATUS:152.
- **Evidência:** Nenhuma matriz de equivalência/perda de índices: ausente em docs/auditoria, docs/execucao e docs/handoff; docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:152 🔒 'Depende de 11'; docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:131 'NI (7)| não há artefato no repo'. O snapshot do destino existe (contexto/supabase/indexes.md) mas não há comparação com a origem. \| cético: Não há matriz de índices. STATUS_100_ETAPAS_2026-08-30.md:152 está em 🔒. Existe só o inventário do destino (contexto/supabase/indexes.md), sem comparação com a origem.

### F0195 · Etapa 29 do plano: Comparar enums, extensões e publicações

- **Tipo:** Doc/config
- **O que os docs afirmam:** Valores/ordem, versões, schemas e tabelas Realtime. Saída esperada: diff de infraestrutura. Gate: catálogo destino completo.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:691-691`
- **O que falta:** Gerar o diff de enums, extensões e publicações ou declarar obsoleto no STATUS:157.
- **Evidência:** Nenhum diff de enums/extensões/publicações entre origem e destino: STATUS_100_ETAPAS_2026-08-30.md:157 🔒 'Depende de 11'; A_planos_execucao.md:131 'NI (7)| não há artefato no repo'. Só existe o inventário unilateral do destino (contexto/supabase/extensions.md, types-enums.md, realtime.md) e a lista da origem em docs/auditoria/MATRIZ_FORENSE_BANCOS_E_CONTRATOS_2026-08-26.md:114-117, sem matriz de diferença. \| cético: Não há diff de infraestrutura. STATUS_100_ETAPAS_2026-08-30.md:157 está em 🔒. Só existem listas de cada lado, sem matriz de diferença: origem em CATALOGO_BANCO_ORIGEM_2026-08-26.md:48-52 (16 extensões) e destino em contexto/supabase/extensions.md:5-13 (9 extensões).

### F0197 · Etapa 30 do plano: Comparar privilégios, jobs e ledger

- **Tipo:** Doc/config
- **O que os docs afirmam:** ACL/default ACL, sequences, cron, Vault e checksums de migration. Saída esperada: reconciliação completa, sem aplicar nada. Gate: autorização apenas para leitura.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:692-692`
- **O que falta:** Gerar a reconciliação (só leitura, com acesso à origem) ou declarar obsoleto no STATUS:158.
- **Evidência:** Nenhuma reconciliação ACL/cron/Vault/ledger origem×destino: STATUS_100_ETAPAS_2026-08-30.md:158 🔒 'Depende de 11'; A_planos_execucao.md:131 'NI (7)| não há artefato no repo'. docs/auditoria/RECONCILIACAO_MIGRATIONS_2026-08-26.md cobre só o ledger de migrations (seções :19-104) e docs/agentes/replay-do-repo-261117.md cobre grants/cron do replay local, nenhum compara com a origem. \| cético: Não há reconciliação de ACL, cron, Vault e ledger entre origem e destino. STATUS_100_ETAPAS_2026-08-30.md:158 está em 🔒. CATALOGO_BANCO_ORIGEM_2026-08-26.md:104-109 só lista jobs da origem e diz que não foram comparados; RECONCILIACAO_MIGRATIONS_2026-08-26.md cobre apenas o ledger de migrations.

### F0208 · Handoff P025: Preservar e explicar os 54 conjuntos que cresceram no destino

- **Tipo:** Doc/config
- **O que os docs afirmam:** Fila canônica do handoff (onda 3): Preservar e explicar os 54 conjuntos que cresceram no destino. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:311-311`
- **O que falta:** Documentar a proveniência dos 54 conjuntos ou declarar obsoleto no handoff:311.
- **Evidência:** Nenhuma prova de proveniência dos 54 conjuntos: únicas menções são o plano (docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:526,677) e o handoff (`- [ ] P025`, docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:311); `grep -rliE proveni docs` só retorna usos não relacionados (ex. docs/estado/11_DADOS_BANCO.md:472 sobre regex). docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:131 classifica etapas 21–27 como 'NI (7)| não há artefato no repo'. Tabelas public.sales/accounts existem no destino (contexto/supabase/tables.md), mas a comparação com a origem é outro projeto (AGENTS.md §7). \| cético: Não há documento de proveniência. docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:311 continua `- [ ] P025`; docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:131 diz 'NI (7) \| não há art…

### F0209 · Handoff P026: Classificar cada coluna exclusiva do destino

- **Tipo:** Doc/config
- **O que os docs afirmam:** Fila canônica do handoff (onda 3): Classificar cada coluna exclusiva do destino. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:312-312`
- **O que falta:** Produzir a matriz versionada (exige o catálogo da origem) ou declarar obsoleto no handoff:312.
- **Evidência:** Nenhuma matriz de colunas exclusivas: `grep -rnE 'colunas? exclusiva' docs` só retorna o plano (AUDITORIA 30/08:678), handoff:312 (`- [ ] P026`) e A_planos_execucao.md:131 ('NI (7)| não há artefato no repo'); `grep -nE 'exclusiv\|destino\|origem' docs/SCHEMA_CONVENTIONS.md` → 0 resultados. \| cético: Não há matriz de colunas exclusivas. Handoff:312 continua `- [ ] P026`; A_planos_execucao.md:131 diz 'NI (7) \| não há artefato no repo'; `grep -nE 'exclusiv\|destino\|origem' docs/SCHEMA_CONVENTIONS.md` → 0 resultados.

### F0210 · Handoff P027: Classificar as 137 colunas integralmente nulas

- **Tipo:** Doc/config
- **O que os docs afirmam:** Fila canônica do handoff (onda 3): Classificar as 137 colunas integralmente nulas. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:313-313`
- **O que falta:** Levantar as colunas 100% nulas no banco oficial (pg_stats null_frac=1) e registrar decisão por coluna (manter/dropar/obsoleta) num doc versionado (ex.: docs/DEAD_COLUMNS.md), ou declarar a etapa obsoleta.
- **Evidência:** Nenhum artefato com decisão por coluna. docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:131 marca a etapa como 'NI (7)| não há artefato no repo'. O único material é docs/auditoria/MATRIZ_FORENSE_BANCOS_E_CONTRATOS_2026-08-26.md:497-515 (Apêndice E), anterior ao handoff, que lista 12 tabelas vazias e diz textualmente que null_frac=1 'não prova que um objeto seja lixo' — não classifica as 137 colunas. ausente: grep -rn '137 colunas\|colunas integralmente nulas' docs (excluindo o próprio handoff/auditorias 08-26/08-30) → só a linha NI acima. \| cético: Confirmado. ausente: grep -rlnE 'null_frac\|colunas? (100%\|integralmente) nulas\|DEAD_COLUMNS' docs scripts → só docs/auditoria/MATRIZ_FORENSE_BANCOS_E_CONTRATOS_2026-08-26.md, docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md e o próprio handoff, que constatam o problema e não registram …

### F0212 · Handoff P048: Revisar as 69 tabelas adicionais em Realtime

- **Tipo:** Doc/config
- **O que os docs afirmam:** Fila canônica do handoff (onda 5): Revisar as 69 tabelas adicionais em Realtime. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:344-344`
- **O que falta:** Cruzar as 77 tabelas com os supabase.channel/postgres_changes de src/ e emitir migration ALTER PUBLICATION supabase_realtime DROP TABLE para as que não têm assinante, ou documentar a justificativa de cada uma.
- **Evidência:** Banco real: publicação supabase_realtime com 77 tabelas (snapshot supabase/realtime.md, 'Tabelas publicadas', 77 linhas 'supabase_realtime| public._'). Nenhuma revisão posterior ao handoff: último ALTER PUBLICATION ... DROP está em supabase/migrations/20260402110955__.sql e 20260402111117__.sql (abril), 44 migrations fazem ADD. A_planos_execucao.md:146 registra 'NI \| último ALTER PUBLICATION … DROP em 20260402111117 \| Decisão por tabela'. ausente: grep -rln 'publication' docs → só auditorias/plano, nenhuma decisão por tabela. \| cético: Confirmado. Snapshot supabase/realtime.md: grep -c 'supabase_realtime \| public' → 77 tabelas publicadas. Os últimos DROP da publicação são supabase/migrations/20260402110955__.sql e 20260402111117_*.sql (grep -rliE 'publication[[:space:]]+supabase_realtime[[:space:]]+drop' → só esses dois). grep -rln realtime docs/decisions → 0, ou seja, não há justif…

### F0218 · Handoff P055: Substituir dez usos de CREATE POLICY IF NOT EXISTS

- **Tipo:** Doc/config
- **O que os docs afirmam:** Fila canônica do handoff (onda 6): Substituir dez usos de CREATE POLICY IF NOT EXISTS. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:356-356`
- **O que falta:** Nova migration (versão > 20261119700000) com DROP POLICY IF EXISTS + CREATE POLICY para as 10 policies de sales/activities/etc. se ainda forem necessárias (ou documentar que foram substituídas pelas policies atuais), sem editar o arquivo de 2026-05-30.
- **Evidência:** As 10 ocorrências continuam: grep -c 'CREATE POLICY IF NOT EXISTS' supabase/migrations/20260530000002_enable_rls_and_remove_env_risk.sql → 10 (ex.: :50 sales_select_policy, :53 sales_insert_policy, :57 activities_select_policy) — sintaxe inválida em Postgres. A versão consta no ledger (snapshot migrations.md:443) mas as policies não existem no banco: grep -c sales_select_policy snapshot policies.md → 0 e supabase/schema.sql → 0. Nenhuma migration corretiva: grep -rln 'CREATE POLICY IF NOT EXISTS' supabase/migrations → só esse arquivo.| CONTESTADO pelo cético (PARCIAL): Existe migration corretiva, ao contrário do que disse o verificador: supabase/migrations/20261119700000_fix_rls_sales_activities_using_true.sql:3-7 cita nominalmente as policies de 20260530000002 e :21-24 faz DROP POLICY IF EXISTS em sales_select_policy, sales_insert_policy, activities_select_policy e activities_insert_po…
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F0230 · Matriz origem×destino de schemas/RLS/rotinas (etapas 21-30)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapas 21-30 NI: nenhuma matriz.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:35-36`
- **O que falta:** Doc versionado declarando as etapas 21-30 obsoletas (origem fora de escopo), ou a matriz.
- **Evidência:** Nenhuma matriz origem×destino no repo: docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:35-36 'NI (9 etapas)| não há matriz origem×destino no repo; VALIDACAO_SINCRONIA… compara repo×destino'. docs/auditoria/MATRIZ_FORENSE_BANCOS_E_CONTRATOS_2026-08-26.md (seções :64 'Inventário da origem', :231 'Contrato local versus origem') é inventário da origem, não matriz com o destino. Declaração formal de obsoleto também não existe; o mais próximo é AGENTS.md §7 ('Nenhum outro Supabase ... é deste repo') e A_planos_execucao.md:40 ('origem rebaixada a projeto antigo'). \| cético: Confirmado. Não há matriz nem ADR declarando a origem obsoleta: ls docs/decisions → ADR-001..010 e nenhum sobre a origem. grep -rln rapjswienfhkobhlamxb docs/decisions → 0; só aparecem docs/agentes/banco-e-mcp.md:15 (menção ao ref antigo) e branches-encerradas-261117.md.

### F0231 · Matriz origem×destino×repo (MATRIZ gate 5)

- **Tipo:** Doc/config
- **O que os docs afirmam:** NI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:417`
- **O que falta:** Declarar o gate 5 obsoleto em doc versionado, ou gerar a matriz.
- **Evidência:** A_planos_execucao.md:417 'MATRIZ gate 5 / RECONC 4–5| Matriz origem×destino×repo; baseline aditiva \| NI \| — \| —'. Nenhum arquivo cruza origem×destino×repo (grep -rln 'origem×destino\\|origem x destino' docs → só os planos/auditorias que a declaram ausente). Repo×destino está coberto (migrations-drift.yml, snapshot contexto, schema.sql), origem não — e AGENTS.md §7 exclui a origem do escopo do repo sem declarar o gate obsoleto. \| cético: Confirmado pela mesma busca de F0230: não há matriz origem×destino×repo nem declaração de obsoleto (docs/decisions sem ADR sobre a origem).

### F0239 · Migrations sobre tabelas inexistentes (deals, notes, users, leads)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Há migrations referenciando tabelas inexistentes.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:278-281`
- **O que falta:** Replay limpo não passa. Falta guardar com to_regclass ou neutralizar as migrations que tocam deals, notes, users e leads, ou oficializar que o replay não é suportado.
- **Evidência:** Migrations ainda referenciam tabelas inexistentes sem guarda: supabase/migrations/20251228000001_add_soft_delete.sql:18 (`ALTER TABLE deals`), 20260104165753_comprehensive_rls_policies.sql:5, 20260104210000_soft_delete_enhanced.sql:2, 20260105000003_rls_policies.sql:7, 20260903000001_enable_rls_leads.sql:3 (`public.leads`). Tabelas ausentes no banco real: `ls contexto/supabase/tables/public/| grep -E '^(deals\|notes\|users\|leads)\.md'` → 0. Replay medido 17/11: 271 arquivos falham, 377 erros (docs/agentes/replay-do-repo-261117.md:8-10, 23-28). \| cético: Confirmo: o replay continua falhando. docs/agentes/replay-do-repo-261117.md:130-132 lista as relações fantasmas deals, notes, leads e outras. As tabelas deals e leads não existem no banco real (`ls contexto/supabase/tables/public \| grep -E '^(deals\|leads\|notes)\.md'` → 0). Não há migration de guarda posterior. Não achei evidência no…

### F0241 · Os 100 erros "outro" do replay não foram abertos

- **Tipo:** Doc/config
- **O que os docs afirmam:** NÃO VERIFICADO: provável cascata.
- **Fontes:** `docs/agentes/replay-do-repo-261117.md:133-135`
- **O que falta:** Rodar o replay capturando SQLSTATE e statement de cada erro e versionar a classificação (cascata × defeito real).
- **Evidência:** docs/agentes/replay-do-repo-261117.md:133-135 registra textualmente que os 100 erros 'outro' não foram abertos ('NÃO VERIFICADO: motivo, tempo'). Nenhum script ou artefato de classificação no repo: `find . -iname '*replay*'` fora de node_modules retorna apenas componentes de UI (src/components/race/ReplayButton.tsx, src/components/win-loss/*) e o próprio doc.| cético: docs/agentes/replay-do-repo-261117.md:133-135 diz textualmente que os 100 erros 'outro' não foram abertos ('NÃO VERIFICADO'). Não existe artefato de classificação desses erros no repo.

### F0244 · PITR habilitado (DR_PLAN diz sim, SIZING indica plano Free)

- **Tipo:** Doc/config
- **O que os docs afirmam:** docs/DR_PLAN.md:6,15-16 vs SIZING.md divergem.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:160`
- **O que falta:** Habilitar PITR exige plano pago (decisão de custo do dono). Também falta corrigir o db-backup.yml, que está inoperante (DR_PLAN.md:8-12).
- **Evidência:** PITR não está habilitado: docs/agentes/replay-do-repo-261117.md:143-152 registra resposta da Management API `pitr_enabled:false`, `backups:[]` e plano da organização `free`. A divergência documental foi sanada: docs/DR_PLAN.md:14-17 diz 'PITR não contratado/evidenciado' e docs/SIZING.md:10-11 coloca PITR em Team/Enterprise. Dashboard Supabase não acessível nesta verificação.| cético: docs/agentes/replay-do-repo-261117.md:139-152 registra a Management API com `pitr_enabled:false` e `backups:[]`, e o plano da organização como `free`. docs/DR_PLAN.md:13-16 agora diz 'PITR não contratado/evidenciado', então a divergência documental foi sanada. O PITR em si não existe.

### F0247 · Plano 30/08 etapa 25 (P025): Preservar e explicar os 54 conjuntos que cresceram no destino

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 25 do plano de 100 etapas (auditoria 30/08; = P025 do handoff): Prova de que são dados legítimos, seed ou operação nova, sem sobrescrita pela origem.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:677-677`
- **O que falta:** Documento de proveniência por conjunto, ou declarar a etapa obsoleta.
- **Evidência:** `grep -rniE '54 conjuntos\|proveni[êe]ncia' docs/` → só o plano (docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:677) e o handoff; docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:131 marca etapas 21-27 como 'NI (7) — não há artefato no repo'.| cético: `grep -rliE '54 conjuntos\|colunas exclusivas\|137 colunas' docs/ scripts/ inventario/` → só o plano, o handoff e A_planos_execucao.md. Não há documento de proveniência.

### F0248 · Plano 30/08 etapa 26 (P026): Classificar cada coluna exclusiva do destino

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 26 do plano de 100 etapas (auditoria 30/08; = P026 do handoff): Matriz de coluna, default, nulabilidade, consumidor e owner para colunas exclusivas do destino.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:678-678`
- **O que falta:** Matriz versionada (coluna, default, nulabilidade, consumidor, owner), ou declarar a etapa obsoleta.
- **Evidência:** `grep -niE 'exclusiv' docs/SCHEMA_CONVENTIONS.md` → 0; 'colunas exclusivas' aparece só em docs de plano/handoff (AUDITORIA_EXAUSTIVA_2026-08-30:678, HANDOFF_CLINE...). A_planos_execucao.md:131: NI, sem artefato.| cético: Mesmo grep → nenhuma matriz de colunas exclusivas fora do plano e do handoff. `grep -niE 'exclusiv' docs/SCHEMA_CONVENTIONS.md` → 0, conforme o verificador.

### F0249 · Plano 30/08 etapa 27 (P027): Classificar as 137 colunas integralmente nulas

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 27 do plano de 100 etapas (auditoria 30/08; = P027 do handoff): Decisão manter, implementar, deprecar ou preencher, sem DDL nesta fase.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:679-679`
- **O que falta:** Decisão versionada por coluna (manter, implementar, deprecar ou preencher).
- **Evidência:** As 137 colunas nulas são apenas listadas/descritas em docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:542,595,777 (Apêndice), sem decisão manter/implementar/deprecar/preencher por coluna; A_planos_execucao.md:131 marca NI.| cético: `grep -rliE '137 colunas\|colunas? (integralmente )?nulas' docs/ scripts/ inventario/` → só o plano, o handoff e A_planos_execucao.md. inventario/estado/banco.json não tem chave de colunas nulas (grep de chaves com 'nul' → 0).

### F0251 · Plano 30/08 etapa 48 (P048): Revisar as 69 tabelas adicionais em Realtime

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 48 do plano de 100 etapas (auditoria 30/08; = P048 do handoff): Decisão por tabela baseada em consumidor, volume, privacidade e custo.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:706-706`
- **O que falta:** Revisar as 78 tabelas contra os consumidores reais e reduzir a publication com uma migration justificada.
- **Evidência:** Banco real: 78 tabelas na publication supabase_realtime (`grep -c '^\| supabase_realtime|' contexto/supabase/realtime.md` → 78), mais que as 69 do plano. Últimos ajustes são anteriores ao plano: supabase/migrations/20260402110955__.sql e 20260402111117__.sql (ALTER PUBLICATION ... DROP). Nenhuma decisão por tabela versionada; A_planos_execucao.md:146 marca NI. \| cético: `grep -c '^\| supabase_realtime \|' contexto/supabase/realtime.md` → 78. Nenhuma migration com ALTER PUBLICATION posterior a 30/08: `grep -lE 'ALTER PUBLICATION' supabase/migrations/*.sql`, filtrando versões > 20260830 → 0. Não há decisão por tabela.

### F0257 · Plano 30/08 etapa 55 (P055): Substituir dez usos de CREATE POLICY IF NOT EXISTS

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 55 do plano de 100 etapas (auditoria 30/08; = P055 do handoff): SQL idempotente suportado; replay limpo e repetível.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:716-716`
- **O que falta:** Reescrever as 10 policies de 20260530000002_enable_rls_and_remove_env_risk.sql como DROP POLICY IF EXISTS + CREATE POLICY, ou como DO-block consultando pg_policies, preservando a versão.
- **Evidência:** Nenhuma substituição foi feita. `grep -c 'CREATE POLICY IF NOT EXISTS' supabase/migrations/*.sql| grep -v ':0$'` → só supabase/migrations/20260530000002_enable_rls_and_remove_env_risk.sql:10, exatamente os 10 usos do plano. `git log -S 'CREATE POLICY IF NOT EXISTS' -- supabase/migrations` → um único commit, b722848dd de 24/08 (a introdução). O único commit posterior no arquivo é a renomeação 9ef2c5842 (#198). Nenhum gate em scripts/ ou .github/ detecta o padrão (`grep -rln 'POLICY IF NOT EXISTS' scripts .github` → 0).
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Parcial.

### F0273 · Query de cobertura de índices em colunas de filtro (n_distinct>1000)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Fornece query para verificar colunas com alta cardinalidade sem índice.
- **Fontes:** `docs/reports/BACKEND_DEEP_AUDIT_2026-07-11.md:95-107`
- **O que falta:** Adicionar a query a scripts/db-audit/ (ou ao job de snapshot em scripts/supabase_snapshot/) e publicar o resultado em docs/contexto/supabase/lints.md ou stats.md; indexar as colunas que aparecerem.
- **Evidência:** A query existe só como texto em docs/reports/BACKEND_DEEP_AUDIT_2026-07-11.md:97-105. grep -rln n_distinct scripts supabase .github docs/agentes → 0 resultados (nenhum script, teste, workflow ou sonda executa a verificação). O snapshot lints.md só traz 'fk_without_index' (lints.md:8-12), não cobertura por cardinalidade. Nenhum resultado registrado da query em produção.| CONTESTADO pelo cético (PARCIAL): Há um artefato: a query está escrita em docs/reports/BACKEND_DEEP_AUDIT_2026-07-11.md:99-106 (pg_stats n_distinct>1000 sem pg_index). Ela nunca é executada nem tem resultado registrado: grep -rln n_distinct scripts supabase .github src docs/agentes → 0 resultados. O snapshot só calcula fk_without_index (scripts/supabase_snapshot/snapshot.py:809). Existir o artefato documental tira o item de NAO_IMPLEMENTADO; faltam a execução e o resultado.
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F0285 · RPO e região secundária definidos

- **Tipo:** Doc/config
- **O que os docs afirmam:** DR_PLAN.md:22-25: RPO não definido.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:163`
- **O que falta:** RPO numérico e região secundária nomeada em docs/DR_PLAN.md; backup off-site operante (secret SUPABASE_DB_URL do db-backup.yml) para o RPO ser alcançável.
- **Evidência:** docs/DR_PLAN.md:34 define só RTO de 4 horas; docs/DR_PLAN.md:36 diz 'região secundária (se configurado)' sem nomear região; ausente: grep -n 'RPO' docs/DR_PLAN.md → 0 resultados. DR_PLAN.md:8-16 registra backup off-site inoperante e PITR não contratado, o que impede qualquer RPO real.| cético: docs/DR_PLAN.md:35 define só RTO de 4h; docs/DR_PLAN.md:36 cita 'região secundária (se configurado)' sem nomear região; ausente: grep -n 'RPO' docs/DR_PLAN.md → 0 resultados. DR_PLAN.md:8-15 registra db-backup.yml inoperante e PITR não contratado. Único RPO no repo é condicional de upgrade em docs/SIZING.md:11, não um RPO definido.

### F0287 · S-13 CREATE POLICY IF NOT EXISTS (sintaxe inválida) em migrations

- **Tipo:** Doc/config
- **O que os docs afirmam:** Doc: migrations usam CREATE POLICY IF NOT EXISTS, inválido no PostgreSQL; corrigir antes de replay.
- **Fontes:** `docs/auditoria/SIMULACAO_CENARIOS_ONDA_0_2026-08-26.md:38`
- **O que falta:** Reescrever as 10 policies como DROP POLICY IF EXISTS + CREATE POLICY (ou DO $$ com pg_policies) e regra no check-migrations.mjs que rejeite 'CREATE POLICY IF NOT EXISTS'.
- **Evidência:** supabase/migrations/20260530000002_enable_rls_and_remove_env_risk.sql:50,53,57,60,64,68,72,75,79,82 ainda usam 'CREATE POLICY IF NOT EXISTS' sem DO/DROP POLICY IF EXISTS (sintaxe inexistente no PostgreSQL). Gate não detecta: grep -n -i 'POLICY' scripts/check-migrations.mjs → 0. Ledger de produção (snapshot migrations.md:443) lista a versão 20260530000002 com 0 statements, ou seja, registrada sem efeito.| cético: supabase/migrations/20260530000002_enable_rls_and_remove_env_risk.sql:50,53,57,60,64,68,72,75,79,82 — 10 ocorrências de 'CREATE POLICY IF NOT EXISTS' sem DO/DROP; grep -rc confirma 10 só nesse arquivo. scripts/check-migrations.mjs não tem regra para POLICY (gate de duplicata em :79-85 apenas).

### F0312 · Validação de 1.350 constraints

- **Tipo:** Doc/config
- **O que os docs afirmam:** P042 NI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:141`
- **O que falta:** Migration com ALTER TABLE ... VALIDATE CONSTRAINT para as 3 NOT VALID (lead_scores, orders, quotes), depois de corrigir as linhas que violam, mais um teste SQL que falhe se existir convalidated=false; precisa da aprovação do dono (DDL).
- **Evidência:** docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:141 marca P042 'Validar 1.350 constraints' como NI/ausente; ausente: `ls scripts| grep -i constraint` → 0; `grep -rl pg_constraint scripts supabase/tests` só acha scripts/db-audit/gen-migration-probes.mjs e scripts/supabase_snapshot/snapshot.py (coleta de catálogo, não validação). Nenhum script, teste SQL ou relatório valida constraints. \| cético: Mantido, e o banco real mostra que a validação não foi feita: snapshot.json (db/constraints) tem 1242 constraints validated=true e 3 validated=false — lead_scores_score_range, orders_total_non_negative, quotes_total_value_non_negative, todas 'NOT VALID'. O único coletor que lê convalidated é scripts/supabase_snapshot/snapshot.py:499, e isso é inventário, não validação; supabase/tests/*.sql (6 arquivos) não testa constraints; A_planos_execucao.md:141 P042 continua NI.

### F0318 · Drop de 8 procedures órfãs

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Sprint 2 P: não removidas.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:334`
- **O que falta:** Migration DROP FUNCTION das 8 funções (DDL, aprovação do dono) e regenerar types.ts.
- **Evidência:** docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:254 descreve 8 procedures órfãs referenciando `deals`/`public.users`. No banco real (contexto/supabase/functions/public/*.sql) ainda existem exatamente 8 funções referenciando essas tabelas inexistentes: aggregate_sales_stats, calculate_deal_health_score, calculate_deal_probability, calculate_team_performance, cleanup_deleted_records, generate_sales_forecast, update_client_score, update_lead_score; tables/public sem deals.md/users.md; ausente: `grep -rl 'DROP PROCEDURE' supabase/migrations` → 0; A_planos_execucao.md:334 'procedures não removidas'.| cético: Confirmado no banco real: as 8 funções públicas ainda leem a tabela inexistente deals: aggregate_sales_stats:14, calculate_deal_health_score:14, calculate_deal_probability:24, calculate_team_performance:21, cleanup_deleted_records:6, generate_sales_forecast:23, update_client_sco…

### F0319 · Etapa 27 do plano: Comparar rotinas

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Assinatura, body hash, owner, volatility, parallel, SECURITY DEFINER/INVOKER, search_path e grants. Saída esperada: diff das 965/199 diferenças. Gate: catálogo destino completo.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:689-689`
- **O que falta:** Gerar e versionar o diff de rotinas.
- **Evidência:** docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:155 marca a etapa 27 como 🔒 'Depende de 11'; ausente: `ls docs/execucao docs/auditoria| grep -i 'rotin\|diff'` → 0; `grep -rl 965 docs` só retorna o plano, o status e HARDENING_CANONICO (hash de commit, não o diff). Nenhum artefato 'diff das 965/199 diferenças' existe no repo. \| cético: Sem evidência nova: o diff de rotinas 965/199 continua ausente.

### F0321 · fn_test_* dropadas em prod

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** PARCIAL: REVOKE ALL + GRANT service_role (20260831130000:650-660); funções continuam.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:280`
- **O que falta:** Migration DROP FUNCTION das 5 fn_test_* (aprovação do dono) e lógica movida para supabase/tests.
- **Evidência:** Banco real ainda tem 5 fn_test__: contexto/supabase/functions.md:194-198 (fn_test_backdate_cron_alert, fn_test_cleanup_cron_alerts, fn_test_cleanup_dedupe_privileges, fn_test_mark_cron_failure, fn_test_simulate_stalled_check), EXECUTE restrito a service_role (fn_test_cleanup_dedupe_privileges também authenticated). Critério 'DROP em prod' não cumprido; ausente: `grep -rln 'DROP FUNCTION.*fn_test' supabase/migrations` → 0.| cético: Confirmado: contexto/supabase/functions.md:194-198 lista 5 public.fn_test__ em produção; :196 fn_test_cleanup_dedupe_privileges ainda tem EXECUTE para authenticated, ou seja, nem a mitigação REVOKE está completa. Nenhum DROP foi feito.

### F3268 · RPC de limpeza de cache restrita a service_role

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** A função de limpeza de cache passa a ser executável apenas por service_role.
- **Fontes:** `docs/execucao/HARDENING_CANONICO_2026-08-31.md:65`
- **O que falta:** função "cache" ausente do banco real (functions.md)
- **Evidência:** função "cache" ausente do banco real (functions.md)| CONTESTADO pelo cético (IMPLEMENTADO): A função existe com outro nome: public.cleanup_expired_narrative_cache. No banco real o EXECUTE é só de service_role (snapshot supabase/functions.md:129, coluna 'EXECUTE (roles API)' = service_role). A ACL vem da migration supabase/migrations/20260831130000_harden_public_access_and_privileged_rpcs.sql:645-647 (REVOKE ALL / GRANT EXECUTE). O corpo está em functions/public/cleanup_expired_narrative_cache__12ae32cb1ec02d01.sql. A pré-checagem procurou a palavra 'cache' como nome de função.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3270 · Schemas de extensões qualificados (extensions.digest etc.)

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** P049 P.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:147`
- **O que falta:** função "qualificados" ausente do banco real (functions.md)
- **Evidência:** função "qualificados" ausente do banco real (functions.md)| CONTESTADO pelo cético (PARCIAL): A qualificação foi feita em parte. Já usam o schema 'extensions': snapshot functions/public/detect_slow_queries__f3ccdf2c42372567.sql:36 (extensions.digest), admin_reset_query_stats__12ae32cb1ec02d01.sql:11 e reset_pg_stat_statements_weekly__12ae32cb1ec02d01.sql:8 (extensions.pg_stat_statements_reset). Continuam sem qualificação: hmac( em functions/public/verify_mfa_code__edc236b47ca9fb9f.sql:73 e verify_and_enable_totp__969d36e50afbbc55.sql:76, e similarity( em search_products_semantic__2244ad44d29271b6.sql:26-27. As três têm SET search_path TO 'public' (linha 5 de cada), enquanto pgcrypto e pg_trgm ficam no schema extensions (extensions.md).
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F0327 · Conector SQL somente leitura

- **Tipo:** Integração externa
- **O que os docs afirmam:** Etapa 11 P: gateway MCP tem escrita.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:28`
- **O que falta:** Criar role/credencial Postgres RO auditável e um gateway ou conector RO.
- **Evidência:** A_planos_execucao.md:28 'gateway MCP ... tem escrita'; AGENTS.md §7 prescreve DDL direto via db_query no gateway (escrita por design); o gateway MCP exposto nesta sessão oferece ferramentas de escrita (db_insert, db_update, db_delete, db_alter_table, db_rls_manage, db_apply_migration). Credencial RO auditável: ausente (gateway em supabase-promo-champions-v2-mcp.adm01.workers.dev, fora do repo; `grep -in 'somente leitura\|read-only' docs/agentes/banco-e-mcp.md` → 0).| cético: Mantido: contexto/supabase/roles.md não tem role RO própria do projeto (só a built-in supabase_read_only_user). O gateway MCP tem escrita por design (AGENTS.md §7). O coletor snapshot.py:951 só liga RO por SET de sessão com credencial de escrita.

### F0342 · Etapa canônica 26/08 nº 21: Comparar schemas e relações (564/410)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Etapa canônica 21 (plano 26/08, matriz de status 30/08, estado 🔒): classificar cada diferença: intencional, faltante, renomeada, obsoleta; matriz assinada por owner.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:149-149`
- **O que falta:** Matriz origem×destino classificada e assinada, ou um ADR que declare as etapas 21-30 obsoletas pela decisão de topologia (AGENTS.md §7).
- **Evidência:** ausente: `ls scripts| grep reconcile` → só scripts/graphify/reconcile-catalog.mjs, que reconcilia contratos estáticos do código vs catálogo (reconcile-catalog.mjs:7,27 reconcileStaticContracts), não origem×destino. Nenhuma matriz classificando as 564/410 diferenças: grep '564' em docs → só AUDITORIA_EXAUSTIVA_2026-08-26:588,683 e STATUS_100_ETAPAS:149 (plano). Última comparação foi a forense de 26/08 (docs/auditoria/MATRIZ_FORENSE_BANCOS_E_CONTRATOS_2026-08-26.md §64-§231) sem classificação por owner. Premissa superada: docs/estado/IDENTIDADE_BANCO_2026-09-13.md e AGENTS.md §7 declaram usyxfpqlsspldubptrdl como único banco do repo. \| cético: Ausente: `ls scripts` → nenhum scripts/reconcile*. scripts/db-audit tem só check-migration-drift.mjs, gen-migration-probes.mjs e legacy-ledger-versions.txt (repo×ledger, não origem×destino). docs/auditoria/MATRIZ_FORENSE_BANCOS_E_CONTRATOS_2026-08-…

### F0343 · Etapa canônica 26/08 nº 22: Comparar todas as colunas

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Etapa canônica 22 (plano 26/08, matriz de status 30/08, estado 🔒): tipo, nullable, default, identity, generated, comentário, posição; diff de 386/118 nomes.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:150-150`
- **O que falta:** O mesmo de F0342.
- **Evidência:** ausente: nenhum diff de colunas origem×destino (grep '386._118' em docs → só plano AUDITORIA_EXAUSTIVA_2026-08-26:547,684 e STATUS_100_ETAPAS:150). Colunas do destino catalogadas com tipo/nullable/default/identity/generated/comentário/posição em docs/contexto/supabase/tables/public/<tabela>.md (ex.: deal_stage_transitions.md:14-24) e snapshot.json 'db.columns', mas sem contraparte da origem nem comparação.| cético: Confirmado. Ausente: não há diff de colunas origem×destino em nenhum script ou doc (A_planos_execucao.md:35, etapas 21-29 NI). As colunas do destino estão catalogadas em docs/contexto/supabase/tables/public/_.md (ex.: deal_stage_history.md:17-24), sem contraparte nem comparação.

### F0344 · Etapa canônica 26/08 nº 23: Comparar constraints (inclusive NOT VALID/convalidated)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Etapa canônica 23 (plano 26/08, matriz de status 30/08, estado 🔒): PK, FK, UNIQUE, CHECK, deferrability, ação referencial, validação; diff com severidade.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:151-151`
- **O que falta:** O mesmo de F0342.
- **Evidência:** ausente: nenhum diff de constraints com severidade (grep -rn 'NOT VALID' docs/execucao docs/decisions → 0 relatórios). Destino catalogado: 1.245 constraints PK/FK/UNIQUE/CHECK com colunas on delete/on update/validada em docs/contexto/supabase/tables/public/*.md (3 NOT VALID: lead_scores.md:35, orders.md:47, quotes.md:74). Sem catálogo equivalente da origem desde 26/08.| cético: Confirmado. Ausente: não há diff de constraints com severidade. O destino tem as constraints catalogadas, com 3 NOT VALID: tables/public/quotes.md:74, lead_scores.md:35, orders.md:47. Não há catálogo da origem para comparar (A_planos_execucao.md:35).

### F0345 · Etapa canônica 26/08 nº 24: Comparar índices

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Etapa canônica 24 (plano 26/08, matriz de status 30/08, estado 🔒): definição, include, parcial, expressão, validade, tamanho, uso; matriz de equivalência/perda.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:152-152`
- **O que falta:** O mesmo de F0342.
- **Evidência:** ausente: nenhuma matriz de equivalência/perda de índices. Destino: docs/contexto/supabase/indexes.md e stats.md:427-473 ('Índices nunca usados', 41 índices com tamanho) via snapshot.py:874-876 (pg_stat_user_indexes). Sem origem, sem comparação; A_planos_execucao.md:364 'nenhum DROP INDEX depois de 07/2026'.| cético: Confirmado. Ausente: não há matriz de equivalência ou perda de índices origem×destino. Do destino só existe stats.md:427 'Índices nunca usados', gerado por scripts/supabase_snapshot/snapshot.py (único arquivo em scripts/.github/docs/execucao que consulta pg_stat_user_indexes/idx_scan).

### F0346 · Etapa canônica 26/08 nº 27: Comparar rotinas (965/199 diferenças)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Etapa canônica 27 (plano 26/08, matriz de status 30/08, estado 🔒): assinatura, body hash, owner, volatility, parallel, SECURITY DEFINER/INVOKER, search_path, grants.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:155-155`
- **O que falta:** O mesmo de F0342.
- **Evidência:** ausente: nenhum diff de rotinas 965/199 (grep '965' em docs → só plano). Destino catalogado com assinatura, linguagem, security definer, search_path e grants em docs/contexto/supabase/functions.md (ex.: :72, :357) e corpo em functions/public/_.sql (snapshot.py:558 pg_get_functiondef). Sem body hash comparativo nem origem.| cético: Confirmado. Ausente: não há diff de rotinas nem body hash comparativo. O destino tem functions.md (ex.: :357) e os corpos em functions/public/_.sql, sem contraparte da origem (A_planos_execucao.md:35).

### F0347 · Etapa canônica 26/08 nº 28: Comparar triggers, views e MVs

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Etapa canônica 28 (plano 26/08, matriz de status 30/08, estado 🔒): consumers, security_invoker, dependências, refresh, índices únicos das MVs; grafo de impacto.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:156-156`
- **O que falta:** O mesmo de F0342.
- **Evidência:** ausente: nenhum grafo de impacto origem×destino. Destino: docs/contexto/supabase/triggers.md (ex.: :284), views.md com 'depende de' (ex.: :213 mv_competitive_ranking) e security_invoker (snapshot.py:536). STATUS_100_ETAPAS_2026-08-30.md:156 🔒.| cético: Confirmado. Ausente: não há grafo de impacto origem×destino. Do destino só existem triggers.md (ex.: :284) e views.md (ex.: :398 mv_competitive_ranking).

### F0348 · Etapa canônica 26/08 nº 29: Comparar enums, extensões e publicações

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Etapa canônica 29 (plano 26/08, matriz de status 30/08, estado 🔒): valores/ordem, versões, schemas, tabelas Realtime; diff de infraestrutura.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:157-157`
- **O que falta:** O mesmo de F0342.
- **Evidência:** ausente: nenhum diff de infraestrutura. Destino: docs/contexto/supabase/extensions.md, realtime.md (publicações), enums em tables/*.md (snapshot.py coleta enums/extensões). Sem origem; STATUS_100_ETAPAS_2026-08-30.md:157 🔒.| cético: Confirmado. Ausente: não há diff de enums, extensões e publicações origem×destino. Do destino só existem extensions.md, realtime.md e types-enums.md no snapshot; A_planos_execucao.md:35 marca NI.

### F0354 · Handoff P021: Comparar tabelas comuns por PK, contagem e hash

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Fila canônica do handoff (onda 3): Comparar tabelas comuns por PK, contagem e hash. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:307-307`
- **O que falta:** O mesmo de F0342 (script de comparação por PK, contagem e hash, ou ADR de encerramento).
- **Evidência:** ausente: nenhum scripts/reconcile* de dados (ls scripts → só scripts/graphify/reconcile-catalog.mjs, código×catálogo). Contagens por tabela existem só para o destino (docs/contexto/supabase/stats.md:13-15, aproximadas) sem PK/hash nem origem. HANDOFF_CLINE…:307 mantém pendente; nenhum doc posterior registra execução.| cético: Confirmado. Ausente: `ls scripts` → nenhum script de comparação de dados por PK, contagem e hash entre projetos (scripts/db-audit só tem check-migration-drift.mjs e gen-migration-probes.mjs). Contagens existem só do destino, aproximadas (stats.md:13+).

### F0363 · Plano 30/08 etapa 21 (P021): Comparar tabelas comuns por PK, contagem e hash

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Etapa 21 do plano de 100 etapas (auditoria 30/08; = P021 do handoff): Comparar todas as tabelas comuns por PK, contagem e hash em lotes, sem copiar dados.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:673-673`
- **O que falta:** Script que compare PK, contagem e hash por lote entre origem e destino e gere o catálogo linha a linha, ou registro de que a etapa ficou obsoleta.
- **Evidência:** ausente: ls scripts| grep -iE 'reconcil\|compare\|hash\|diff' → apenas scripts/graphify/reconcile-catalog.mjs (reconcilia catálogo do grafo, não dados origem/destino). Etapa descrita em docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:673 sem artefato correspondente (nenhum catálogo linha a linha em docs/ ou scripts/). \| cético: ausente: ls scripts scripts/db scripts/db-audit scripts/maintenance \| grep -iE 'reconc\|compar\|hash\|diff\|parity' → 0; grep -rliE 'reconcil\|md5' scripts/db scripts/maintenance scripts/load → 0. Só existe scripts/db-audit/check-migration-drift.mjs (drift de migrations, não comparação de dados por PK/hash).

### F0366 · Procedimento de drop: snapshot _tomb_<tabela> + migration nova drop_dead_<tabela>

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Doc prescreve: (1) observar 30 dias; (2) CREATE TABLE public._tomb_<tabela> AS SELECT * antes do drop; (3) DROP em migration NOVA 20261101HHMMSS_drop_dead_<tabela>.sql removendo policies/triggers órfãos. Nenhuma migration drop_dead_* nem tabela _tomb_* existe no repo/snapshot até 2026-11-20.
- **Fontes:** `docs/DEAD_TABLES.md:79-91`
- **O que falta:** Quando houver drop: _tomb_<tabela> + migration <ts>_drop_dead_<tabela>.sql; registrar decisão sobre call_tracking (ausente sem drop_dead).
- **Evidência:** Procedimento prescrito em docs/DEAD_TABLES.md:79-91. ausente: ls supabase/migrations| grep -c drop_dead → 0; grep -c _tomb_ contexto/supabase/snapshot.json → 0; nenhum DROP TABLE em supabase/migrations/202611*.sql. 20 das 21 candidatas ainda existem (contexto/supabase/tables/public/ab_tests.md … webhook_logs.md); call_tracking ausente do banco sem migration de drop (supabase/migrations/20261117090000_marca_594_migrations_como_aplicadas.sql:19-21). \| cético: ausente: ls supabase/migrations \| grep -ci 'drop_dead\|tomb' → 0; grep -c _tomb_ contexto/supabase/tables.md → 0; nenhum DROP TABLE em supabase/migrations/20261[0-2]*.sql. Só o procedimento escrito em docs/DEAD_TABLES.md:79-91.

### F0367 · Profiling do UPDATE lento de sales (388 ms)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** UPDATE de sales por PK leva 388 ms médios; custo está em triggers/RLS e deve ser tratado em profiling próprio, sem índice cosmético.
- **Fontes:** `docs/execucao/HARDENING_CANONICO_2026-08-31.md:85-87`
- **O que falta:** Profiling do UPDATE por PK (EXPLAIN ANALYZE/auto_explain), consolidação dos triggers redundantes e medição antes/depois.
- **Evidência:** public.sales segue com 20 triggers ROW habilitados (contexto/supabase/triggers.md:258-277, incl. refresh_monthly_summary_on_sale, tr_sync_bets_sales, tr_update_client_total_value e tr_update_client_value redundantes). Pendência mantida em docs/execucao/HARDENING_CANONICO_2026-08-31.md:85-87 e docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:384 ('P — Profiling dos triggers'). ausente: rg '388 ms\|profiling._sales' docs/ → só esses dois.| cético: contexto/supabase/triggers.md:258+ mantém os triggers ROW de public.sales; grep -rliE 'profiling._(sales\|trigger)\|388 ?ms\|auto_explain' docs supabase/migrations → só HARDENING_CANONICO_2026-08-31.md e A_planos_execucao.md (as próprias pendências).

### F0369 · Receita dominada por registros de teste (Cliente Demo 10, **aug2026**, E2E Race Approved+UI) — purga pendente

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Três clientes de teste somam 99,9% da receita ganha; decisão do dono entre excluir por flag ou purgar.
- **Fontes:** `docs/agentes/achados-auditoria-261117.md:16-31`
- **O que falta:** Decisão do dono e então soft delete/flag ou purga das vendas de teste, com exclusão em BI, ranking, metas, gamificação e curva ABC.
- **Evidência:** docs/agentes/achados-auditoria-261117.md:16-31 mantém 'Decisão do dono: excluir por flag ou purgar'. Nenhum artefato de purga/flag: contexto/supabase/tables/public/sales.md e clients.md não têm coluna is_test (só deleted_at, sales.md:64, clients.md:28); ausente rg -i 'Cliente Demo 10\|**aug2026**\|E2E Race' supabase/migrations src → 0; scripts/seed-august-sales.ts:52,72 ainda insere client_name='**aug2026**'. Dado por linha não consta no snapshot (NÃO VERIFICADO se já foi apagado via SQL manual).| cético: ausente: grep -rnE '**aug2026**\|Cliente Demo\|E2E Race\|is_test' src supabase/functions → 0 (nenhum filtro/flag de teste); docs/agentes/achados-auditoria-261117.md:16-31 mantém decisão pendente; scripts/seed-august-sales.ts ainda gera '**aug2026**'.

### F0389 · Teste de restore trimestral executado

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** DR_PLAN.md:57-59,64: primeira execução pendente.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:161`
- **O que falta:** Executar restore do dump do db-backup.yml em projeto/instância separada e registrar data, duração e checagens em docs/DR_PLAN.md
- **Evidência:** docs/DR_PLAN.md:79 exige teste de restauração trimestral em staging; docs/DR_PLAN.md:64-66 'primeira execução pendente de agendamento'. grep -rni 'restore executado\|teste de restore' docs → só menções de pendência (docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:120,196 'nenhum teste de restore documentado'; G_infra_ci_integracoes.md:161 NÃO INICIADO). Nenhum registro em docs/postmortems ou docs/runbooks com data de restore. .github/workflows/db-backup.yml:111-125 só valida o dump com 'pg_restore --list' (integridade do arquivo), não restaura em banco.| cético: Confirmado: docs/DR_PLAN.md:79-80 ('teste de restauração... trimestralmente em staging') sem registro de execução; docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:235 etapa 80 'restore drill isolado' = 🔒 'Aguarda ambiente'. .github/workflows/db-backup.yml:116-125 só faz 'pg_restore --list' (integridade do dump), não rest…

### F0393 · Data quality dashboard

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Falta dashboard de qualidade (campos vazios, formato inválido).
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:157`
- **O que falta:** View/RPC com % de preenchimento e inválidos por campo, página, hook, rota em AppRoutes.tsx e entrada no menu
- **Evidência:** ausente: grep -rni 'data_quality\|dataquality\|data-quality\|qualidade de dados\|qualidade dos dados' src supabase/functions supabase/migrations → 0 resultados; grep -i 'quality\|qualidade' src/routes/AppRoutes.tsx src/components/layout/sidebar/sidebarMenuData.ts → 0; grep 'data_quality' /docs/contexto/supabase/tables.md views.md → 0; grep -rni 'completeness\|fill.rate\|campos vazios\|preenchimento' src --include=*.tsx → só src/hooks/sales/useSalesEnablement.test.tsx (não relacionado).| cético: ausente: grep -niE 'hygiene\|higien\|integridade\|completude\|incomplet\|qualidade\|quality' src/routes/AppRoutes.tsx src/components/layout/sidebar/sidebarMenuData.ts → 0; grep -rliE 'DataQuality\|completeness\|missingFields\|camposVazios' src → 0. A tela mais próxima é /deduplicacao (src/routes/AppRoutes.tsx:909-912, src/pages/Deduplication.tsx), que trata duplicados, não % de preenchimento/invá…

### F0405 · Default privileges de supabase_admin ainda concedem TRUNCATE a anon/authenticated

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Doc registra gap da PR #89: defacl de supabase_admin concede TRUNCATE a anon/authenticated para tabelas futuras; SINCRONIA confirma que migration 20260902121000 não usou FOR ROLE supabase_admin.
- **Fontes:** `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:96`
- **O que falta:** Rodar como supabase_admin (dashboard SQL Editor): ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public REVOKE TRUNCATE ON TABLES FROM anon, authenticated; depois validar com supabase/tests/db01_default_acl_assertions.sql
- **Evidência:** Gap confirmado no banco real: /docs/contexto/supabase/grants.md:1366 'public| supabase_admin \| tables \| postgres=arwdDxtm/supabase_admin, anon=arwdDxtm/supabase_admin, authenticated=arwdDxtm/supabase_admin' — 'D' = TRUNCATE ainda concedido a anon/authenticated para tabelas futuras criadas por supabase_admin (idem sequences/functions :1365,1367). Tentativa de correção supabase/migrations/20261116223000_revoke_supabase_admin_default_truncate.sql:1-16 documenta por que não surtiu efeito (usuário postgres sem privilégio; 'RISCO ATUAL: zero' porque tabelas existentes não têm TRUNCATE para anon/authenticated — grants.md awk → 0 linhas). \| CONTESTADO pelo cético (PARCIAL): O gap persiste (grants.md:1368 'public \| supabase_admin \| tables \| ... anon=arwdDxtm/supabase_admin, authenticated=arwdDxtm/supabase_admin'), mas NAO_IMPLEMENTADO exige 'nenhum artefato' e há artefatos da correção em m…
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F0406 · Etapa 25 do plano: Comparar RLS e FORCE RLS

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Cobertura por tabela/partição e efeito por role. Saída esperada: mapa deny/allow real. Gate: catálogo destino completo.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:687-687`
- **O que falta:** Gerar a partir do snapshot um mapa tabela × role × comando (allow/deny efetivo = grant ∧ policy) e versioná-lo em docs/ ou como saída de script em scripts/db-audit/; a comparação com o banco de origem (plano original) só se ainda fizer sentido
- **Evidência:** Etapa 25 segue bloqueada: docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:153 ('🔒 Depende de 11'). Nenhum artefato 'mapa deny/allow por tabela/role': grep -rl 'FORCE RLS\|FORCE ROW LEVEL' docs scripts supabase/tests → só os planos (AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:687, ATUALIZACAO_2026-08-30:150,288 'Todas as 398 tabelas públicas do destino têm RLS, e 2 usam FORCE RLS' — contagem, não mapa). Insumo hoje existe no snapshot: tables/public/<tabela>.md linhas 7-8 ('RLS habilitado' / 'RLS forçado (owner)') e grants por role, mas não há consolidação deny/allow nem teste por role (SET ROLE) além de supabase/tests/rls_test_suite.sql.| CONTESTADO pelo cético (PARCIAL): Existe artefato correspondente parcial: docs/RLS_MATRIX.md:1-30 'Matriz RLS — tabela × papel' (allow/deny por papel para 10 tabelas de maior risco: sales, clients, orders, commissions, quotes, user_mfa_settings et…
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F0407 · Etapa 26 do plano: Comparar policies

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Roles, comando, permissiva/restritiva, USING e WITH CHECK semanticamente normalizados. Saída esperada: diff revisável. Gate: catálogo destino completo.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:688-688`
- **O que falta:** Exportar pg_policies da origem e gerar diff normalizado, ou marcar a etapa como descartada
- **Evidência:** Etapa 26 bloqueada: docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:154 ('🔒 Depende de 11'). Nenhum diff revisável de policies origem×destino: grep -rln 'diff de policies\|policies_diff\|RLS_DIFF' docs scripts → 0 resultados. O snapshot (policies.md) lista as policies do destino normalizadas (roles/cmd/permissive/USING/WITH CHECK) e o CHANGELOG.md registra diffs temporais do próprio banco (ex. 2026-11-20 functions alteradas), mas não há comparação com o banco de origem.| cético: Confirmado: STATUS_100_ETAPAS_2026-08-30.md:154 etapa 26 🔒; nenhum diff de policies origem×destino (grep -rln 'diff de policies\|policies_diff\|RLS_DIFF' docs scripts → 0). RLS_MATRIX.md não é diff.

### F0421 · Policies de 4 tabelas existem em produção mas não no repo (drift)

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** As 4 tabelas apontadas como sem RLS têm RLS + policies em produção, porém essas policies não constam em nenhuma migration.
- **Fontes:** `docs/execucao/VALIDACAO_ADVERSARIAL_E_CORRECOES_2026-09-02.md:129`
- **O que falta:** Criar migration idempotente (CREATE POLICY IF NOT EXISTS / DO $$ guard) com as ~11 policies vivas de experiments, experiment_variants, experiment_assignments, ab_tests, migration_log, webhook_events, security_events, user_2fa_log e error_logs para eliminar o drift.
- **Evidência:** docs/execucao/VALIDACAO_ADVERSARIAL_E_CORRECOES_2026-09-02.md:72 registra o drift sem nomear as tabelas. Cruzamento snapshot.json (1017 policies public) × supabase/migrations/_.sql: 21 policies vivas sem CREATE POLICY textual; 10 são admin_delete__ geradas por format() em supabase/migrations/20261001193000_soft_delete_business_tables.sql:109-110 (versionadas). Restam sem nenhuma migration: 'Admins and managers can manage experiments/experiment_variants/experiment_assignments/ab_tests/migration_log/webhook_events', 'Authenticated users can read experiments/experiment_variants', 'Users can read their own experiment assignments', 'Admins and managers can read security_events' (policies.md:805), 'Users can read their own 2FA log', 'anon can insert error logs' — presentes só no dump supabase/schema.sql (18 ocorrências), que não é migration.| CONTESTADO pelo cético (PARCIAL): Nas migrations n…
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F0424 · Policy USING(true) em leads removida

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Policy USING(true) em leads, tabela que não existe.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:267-270`
- **O que falta:** Tornar 20260903000001 inofensiva com guard to_regclass('public.leads') ou registrar a remoção; hoje um replay do zero falha nessa migration.
- **Evidência:** supabase/migrations/20260903000001_enable_rls_leads.sql:3-10 ainda contém ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY e CREATE POLICY leads_authenticated_all ... USING (true) WITH CHECK (true); tabela leads não existe em produção (grep '[public.leads]' snapshot tables.md → 0; policies.md sem 'leads_authenticated_all'); nenhuma migration faz DROP (grep -rn 'DROP POLICY.*leads\|leads_authenticated_all' supabase/migrations → só o CREATE). A migration foi marcada como aplicada sem rodar em 20261117090000_marca_594_migrations_como_aplicadas.sql:614. docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:269.| cético: supabase/migrations/20260903000001_enable_rls_leads.sql:3-10 continua com ALTER TABLE public.leads ENABLE RLS e a policy leads_authenticated_all USING (true) WITH CHECK (true), sem guard. A tabela public.leads não existe em produção (grep 'public.leads ' tables.md …

### F3273 · 11 FKs sem índice líder compatível

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Existem 11 FKs sem índice líder compatível (activities_deleted_by_fkey, cadence_enrollments__, client_churn_alerts_state_last_task_id_fkey, experiment__, products_deleted_by_fkey, slow_query_alerts_acknowledged_by_fkey, suppliers_deleted_by_fkey, teams_deleted_by_fkey).
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:370-374`
- **O que falta:** tabela/view "activities_deleted_by_fkey" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "activities_deleted_by_fkey" ausente do banco real (tables.md, views.md)| CONTESTADO pelo cético (IMPLEMENTADO): A pré-checagem tratou nome de FK como tabela. Os índices líderes existem no banco real (snapshot indexes.md): idx_activities_deleted_by_fk (:48), idx_client_churn_alerts_state_last_task_id_fk, idx_experiment_assignments_experiment_id_fk, idx_experiment_assignments_variant_id_fk, idx_experiment_variants_experiment_id_fk (:535), idx_products_deleted_by_fk, idx_slow_query_alerts_acknowledged_by_fk, idx_suppliers_deleted_by_fk e idx_teams_deleted_by_fk (:1244). Foram criados em supabase/migrations/20260831130001_repair_cron_and_fk_indexes.sql:7-27. As 2 FKs de cadence_enrollments deixaram de existir: a tabela foi dropada (20261001203300_deny_dead_tables_revoke_anon_grants.sql:37) e está ausente de tables.md.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3274 · 12 tabelas vazias sem FK/trigger/view/job (ai_usage_events, collection_item_reactions, comparison_reactions, magic_up_comments, order_item_personalizations, pr…

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Apêndice E: 131 tabelas com zero linhas estimadas; 12 verificadas sem linhas e sem dependências no catálogo da origem.
- **Fontes:** `docs/auditoria/MATRIZ_FORENSE_BANCOS_E_CONTRATOS_2026-08-26.md:497-519`
- **O que falta:** tabela/view "ai_usage_events" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "ai_usage_events" ausente do banco real (tables.md, views.md)| CONTESTADO pelo cético (NAO_APLICAVEL): O item é inventário de tabelas vazias do projeto ORIGEM (MATRIZ_FORENSE_BANCOS_E_CONTRATOS_2026-08-26.md:497-519). No banco deste repo nenhuma das 9 tabelas nomeadas existe: grep de ai_usage_events, collection_item_reactions, comparison_reactions, magic_up_comments, order_item_personalizations, product_search_logs, product_sync_logs, simulator_wizard_drafts e video_variant_links em tables.md e views.md → 0 resultados.
- **Revisão:** em disputa. O cético propõe Não aplicável e o juiz ainda não decidiu.

### F3275 · 134 relações estimadas vazias na origem (123 tabelas, 9 partições, 2 pais)

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** No public há ~4,9 M linhas: 257 relações com estimativa positiva e 134 com zero (123 tabelas independentes com scans, 9 partições filhas, 2 pais particionados). Observação: o doc refere-se ao projeto ORIGEM rapjswienfhkobhlamxb, que AGENTS.md declara não pertencer a este repo; verificar também o equivalente no destino usyxfpqlsspldubptrdl.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:362-368`
- **O que falta:** tabela/view "magazine_public_view_events" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "magazine_public_view_events" ausente do banco real (tables.md, views.md)| CONTESTADO pelo cético (NAO_APLICAVEL): É contagem estatística (pg_stat) do projeto ORIGEM. As relações citadas não existem no destino: grep magazine_public_view_events\|supplier_products_raw_history em tables.md e views.md → 0 resultados. Também não há tabelas particionadas: todas as 408 linhas de tables.md são do tipo 'table'.
- **Revisão:** em disputa. O cético propõe Não aplicável e o juiz ainda não decidiu.

### F3276 · 159 índices não únicos com idx_scan=0 (~65 MiB), maiores em stock_snapshots e stock_daily_summary

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** 159 índices não únicos/sem constraint registram idx_scan=0 em ~40 dias, somando ~65 MiB. Não é lixo sem janela maior. Observação: o doc refere-se ao projeto ORIGEM rapjswienfhkobhlamxb, que AGENTS.md declara não pertencer a este repo; verificar também o equivalente no destino usyxfpqlsspldubptrdl.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:356-358`
- **O que falta:** tabela/view "stock_snapshots" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "stock_snapshots" ausente do banco real (tables.md, views.md)| CONTESTADO pelo cético (NAO_APLICAVEL): É métrica de uso de índices (idx_scan=0, ~65 MiB) do projeto ORIGEM. stock_snapshots e stock_daily_summary não existem no destino: grep em tables.md e views.md → 0 resultados.
- **Revisão:** em disputa. O cético propõe Não aplicável e o juiz ainda não decidiu.

### F3277 · 182 colunas all-null em 60 tabelas (slots next_date/next_quantity 4–6, campos fiscais/frete/garantia, IA e embalagem)

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Apêndice E lista colunas 100% nulas em tabelas com ≥100 linhas na origem (products.cest/ean/gtin, product_variants.next_date_4..6, price_history.change_reason/changed_by...).
- **Fontes:** `docs/auditoria/MATRIZ_FORENSE_BANCOS_E_CONTRATOS_2026-08-26.md:521-592`
- **O que falta:** coluna ean ausente em tables/public/products.md (tabela existe)
- **Evidência:** coluna ean ausente em tables/public/products.md (tabela existe)| CONTESTADO pelo cético (NAO_APLICAVEL): A lista vem do catálogo da ORIGEM (MATRIZ_FORENSE_BANCOS_E_CONTRATOS_2026-08-26.md:521-530, com relações _archive_* e product_variants). No destino, public.products tem só 18 colunas, sem ean/gtin/cest (tables/public/products.md:20-37). product_variants não existe: grep em tables.md → 0 resultados.
- **Revisão:** em disputa. O cético propõe Não aplicável e o juiz ainda não decidiu.

### F0444 · 36 tabelas e 90 funções abandonadas tratadas

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Inclui 2FA próprio, A/B, procedures da v1 sobre deals, 5 fn_test_*.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:277`
- **O que falta:** Migration de limpeza com DROP das 5 fn_test_* e decisão sobre o 2FA próprio (user_mfa_settings, mfa_verification_attempts) e sobre os A/B (ab_tests, cadence_ab_tests). É DDL em produção e precisa do dono.
- **Evidência:** Objetos 'abandonados' continuam em produção: 5 fn_test_* em docs/contexto/supabase/functions.md:194-198 (fn_test_backdate_cron_alert, fn_test_cleanup_cron_alerts, fn_test_cleanup_dedupe_privileges, fn_test_mark_cron_failure, fn_test_simulate_stalled_check); tabelas do 2FA próprio user_mfa_settings (tables.md:371) e mfa_verification_attempts (tables.md:210); A/B ab_tests (tables.md:8) e cadence_ab_tests (tables.md:44). Nenhum DROP correspondente em supabase/migrations/ (grep 'DROP FUNCTION._fn_test\_' → 0). O doc fonte docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:277 marca como pendente.| cético: Os objetos abandonados continuam em produção. As 5 fn_test__ estão em functions.md:194-198, user_mfa_settings em tables.md:371, mfa_verification_attempts em tables.md:210, ab_tests em tables.md:8 e cadence_ab_tests em tables.md:44. O único tratamento é anterior ao doc de 12/10: 2…

### F3278 · 389 tabelas documentadas existem no banco real

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Das 393 tabelas com seção "### `tabela`" no dicionário, 389 existem no snapshot real (tables.md). Item agregado da comparação mecânica; as 4 ausentes têm itens próprios.
- **Fontes:** `docs/DATA_DICTIONARY.md:406-7104`
- **O que falta:** tabela/view "data_dictionary" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "data_dictionary" ausente do banco real (tables.md, views.md)| CONTESTADO pelo cético (IMPLEMENTADO): A pré-checagem procurou uma tabela 'data_dictionary'. Na reprodução, extraí 393 seções ### `tabela` de docs/DATA_DICTIONARY.md e cruzei com os nomes de tables.md (408 tabelas): 389 resolvem. As 4 ausentes são cadence_enrollments, call_tracking, roles e user_permissions_cache, que têm itens próprios.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F0448 · 497 índices sem uso tratados

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Não tratados.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:285`
- **O que falta:** Parecer por índice e migration com DROP INDEX dos aprovados pelo dono.
- **Evidência:** Snapshot atual: docs/contexto/supabase/stats.md:427-472 lista 41 índices nunca usados (ex.: idx_audit_logs_entity 2.7 MB, stats.md:437; idx_web_vitals_route_metric_created 2.5 MB, stats.md:471) após reset semanal (cron.md:14 reset-pg-stat-statements-weekly). Único DROP INDEX em massa é anterior: supabase/migrations/20260712212637_e88efdd7-647d-4ec7-be79-a45eb193fe46.sql:2-55 (51 índices FK redundantes); depois só drops pontuais (20261013172000:7, 20261018190100:355). Nenhum parecer/DROP sobre a lista de 497 do doc (docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:285).| cético: stats.md:428 abre a seção 'Índices nunca usados (candidatos a remoção)' com entradas ativas (ex.: idx_activities_active, idx_activities_client_date). Não há migration com DROP INDEX em massa depois de 07/2026. docs/execucao/HARDENING_CANONICO_2026-08-31.md:82-83 confirma que a validação nominal ficou…

### F3279 · 8 chaves literais de escrita fora dos tipos (client_interactions.interaction_type/notes, coaching_sessions.related_analysis_id/sentiment/topic, deal_health_sco…

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Doc lista 8 colunas escritas pelo código ausentes do contrato tipado.
- **Fontes:** `docs/auditoria/MATRIZ_FORENSE_BANCOS_E_CONTRATOS_2026-08-26.md:328-334`
- **O que falta:** coluna interaction_type ausente em tables/public/client_interactions.md (tabela existe)
- **Evidência:** coluna interaction_type ausente em tables/public/client_interactions.md (tabela existe)| CONTESTADO pelo cético (PARCIAL): Das 8 chaves, só sales.stage existe no banco real (tables/public/sales.md) e em src/integrations/supabase/types.ts (bloco sales: stage: string \| null). As outras 7 continuam ausentes do banco (grep da coluna em tables/public/{client_interactions,coaching_sessions,deal_health_scores,race_events}.md → 0). O código ainda escreve nelas: supabase/functions/send-quote-to-client/index.ts:244 (interaction_type) e supabase/functions/generate-loss-coaching/index.ts:118 (related_analysis_id).
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F3280 · 9 views públicas sem security_invoker (v_products_public, v_suppliers_public, etc.)

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Catálogo da origem: 9 views *_public selecionáveis por anon/authenticated sem security_invoker; revisar minimização de colunas.
- **Fontes:** `docs/auditoria/CATALOGO_BANCO_ORIGEM_2026-08-26.md:90-102`
- **O que falta:** tabela/view "v_kit_component_media_public" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "v_kit_component_media_public" ausente do banco real (tables.md, views.md)| CONTESTADO pelo cético (NAO_APLICAVEL): O item é sobre o catálogo da ORIGEM (CATALOGO_BANCO_ORIGEM_2026-08-26.md:90-102). O destino tem 36 views e a única _*public é public.salespeople_public (views.md:724). Nenhuma das 9 v*__public existe: grep em views.md → 0 resultados.
- **Revisão:** em disputa. O cético propõe Não aplicável e o juiz ainda não decidiu.

### F0452 · Advisor performance: 811 chamadas RLS não InitPlan, 401 múltiplas policies permissivas, 479 índices não usados

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Doc: Advisor de performance aponta policies com auth.uid() sem (select ...), múltiplas permissivas e índices não usados.
- **Fontes:** `docs/auditoria/VALIDACAO_SINCRONIA_GITHUB_SUPABASE_2026-09-10.md:177-179`
- **O que falta:** Reescrever as policies com (select auth.uid()), consolidar as policies permissivas múltiplas e fazer o relatório de índices. É DDL em produção e precisa do dono.
- **Evidência:** Snapshot atual docs/contexto/supabase/lints.md: 830 ocorrências de policy_auth_fn_not_wrapped ('Policy chama auth.uid()/jwt() sem (select ...)', ex.: lints.md:12-30) — pior que as 811 do doc; policies.md: 50 combinações tabela\|cmd\|roles com mais de uma policy PERMISSIVE (awk); stats.md:427-472: 41 índices nunca usados. Nenhuma migration de reescrita em massa com '(select auth.uid())' (grep -l 'select auth.uid()' supabase/migrations/2026{10,11}*.sql cobre poucos arquivos pontuais).| cético: lints.md tem 830 ocorrências de policy_auth_fn_not_wrapped (grep -c), mais que as 811 do doc. stats.md:428 lista índices nunca usados.

### F3281 · Coluna updated_at em todas as tabelas mutáveis (146 faltando)

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** 234/400 tabelas sem updated_at; excluindo logs/eventos/históricos, 146 tabelas mutáveis violam a regra (ex.: activities, sales_goals, cadence_steps, cadence_tasks, notifications, pipeline_stages, order_items, quote_items, api_tokens, webauthn_credentials, achievements, leagues, tournaments, pricing_rules).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:188`
- **O que falta:** Adicionar updated_at com trigger às 146 tabelas mutáveis citadas e criar a regra correspondente no check:migrations.
- **Evidência:** coluna updated_at ausente em tables/public/activities.md (tabela existe)| cético: No banco real, 235 de 408 tabelas não têm a coluna updated_at (varredura de tables/public/*.md). Exemplos sem a coluna: activities, sales_goals, cadence_steps, notifications, pipeline_stages, order_items, quote_items, api_tokens, webauthn_credentials, achievements, leagues, tournaments e pricing_rules; só cadence_tasks tem. scripts/check-migrations.mjs:5-17 não tem regra de updated_at. A regra existe só no papel, em docs/SCHEMA_CONVENTIONS.md:33.

### F3282 · Colunas TIMESTAMP sem TZ (conforme) e 6 parâmetros/variáveis TIMESTAMP

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** 0 colunas TIMESTAMP sem TZ; 6 ocorrências em parâmetros e variáveis de função (mig/20260104181001:6-7, 20260512144912:130, 20260512163542:70, 20260513192406:102, 20260712194744:9).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:192`
- **O que falta:** tabela/view "calculate_team_performance" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "calculate_team_performance" ausente do banco real (tables.md, views.md)| CONTESTADO pelo cético (PARCIAL): As colunas estão conformes: grep -l 'timestamp without time zone' tables/public/*.md → 0 resultados. Em funções do banco real resta public.calculate_team_performance(p_team_id uuid, p_start_date timestamp without time zone, p_end_date timestamp without time zone), em functions.md:114 e functions/public/calculate_team_performance__e6785a9fe436e436.sql:1.
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F3283 · cron.job_run_details com 140.713 registros e net._http_response com 417 respostas (do cruzamento)

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Histórico do cruzamento de projetos até 2026-08-30 14:44 UTC.
- **Fontes:** `docs/estado/IDENTIDADE_BANCO_2026-09-13.md:63-66`
- **O que falta:** tabela/view "job_run_details" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "job_run_details" ausente do banco real (tables.md, views.md)| CONTESTADO pelo cético (NAO_APLICAVEL): É contagem histórica de linhas (140.713 em cron.job_run_details, 417 em net._http_response) num snapshot do cruzamento de projetos até 30/08 (docs/estado/IDENTIDADE_BANCO_2026-09-13.md:63-66). Não descreve funcionalidade ou artefato.
- **Revisão:** em disputa. O cético propõe Não aplicável e o juiz ainda não decidiu.

### F3284 · Custom Objects

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Falta criar entidades além das pré-definidas.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:147`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:171`
- **O que falta:** Metadados de entidade customizada (tabela de objetos, campos e registros), CRUD genérico, UI e RLS.
- **Evidência:** tabela/view "custom_objects" ausente do banco real (tables.md, views.md)| cético: ausente: grep -rli 'custom_object\|customObject\|CustomObject' src supabase/functions → 0 resultados. Também não há tabela custom_objects/custom_fields em tables.md. Só existem campos customizados de vendedor e time (tables.md:309 salesperson_custom_field_values, :359 team_custom_fields; src/components/settings/CustomFieldsManager.tsx), que não são objetos customizados.

### F0457 · Decisão por tabela das 69 em Realtime

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** P048 NI: último ALTER PUBLICATION DROP em 20260402111117.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:146`
- **O que falta:** Documento de decisão por tabela e migration com ALTER PUBLICATION ... DROP TABLE para as rejeitadas.
- **Evidência:** Publicação supabase_realtime hoje tem 77 tabelas (docs/contexto/supabase/realtime.md:10-86, grep -c = 77; 24 com replica identity full), mais que as 69 do doc. lints.md: 53 ocorrências realtime_replica_identity. Último ALTER PUBLICATION … DROP TABLE em supabase/migrations/20260512144912_b9041e04-0f44-49ce-978a-6f5b9e7acb90.sql; depois só ADD (20260706163053, 20260723131925). Nenhum documento com decisão por tabela (grep -rl 'Decisão por tabela' docs → só o próprio plano A_planos_execucao.md:146 e a auditoria 08-30).| cético: realtime.md tem 77 linhas '\| supabase_realtime \| public.' (grep -c). Nenhuma migration depois de 20260901 contém ALTER PUBLICATION (loop grep -il → 0 arquivos). lints.md tem 53 ocorrências de realtime_replica_identity.

### F3285 · Drop das tabelas mortas (DEAD_TABLES)

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Não há migration _*drop_dead*_; a última é 20261005220000.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:157`
- **O que falta:** tabela/view "dead_tables" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "dead_tables" ausente do banco real (tables.md, views.md)| CONTESTADO pelo cético (PARCIAL): Houve um drop documentado: supabase/migrations/20261001203300_deny_dead_tables_revoke_anon_grants.sql:10-14 e :37 (DROP TABLE IF EXISTS public.cadence_enrollments); a tabela está ausente em tables.md. Das 21 candidatas fortes de docs/DEAD_TABLES.md:25-45, 20 continuam no banco real (ab_tests, ai_sales_insights, buying_committee, pricing_rules, webhook_logs etc.); só call_tracking está ausente.
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F0459 · Drop dos 6 índices duplicados

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** A.8 #6 NI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:364`
- **O que falta:** Migration com DROP INDEX dos duplicados não-PK/UNIQUE, depois de parecer nominal e aval do dono (DDL em produção).
- **Evidência:** Índices duplicados persistem no banco real: em docs/contexto/supabase/indexes.md, 20+ pares com mesma tabela/método/colunas, ex.: public.salespeople (idx_salespeople_auth_user_id × salespeople_auth_user_id_key), public.sales (idx_sales_status_created_at × idx_sales_status_created_at_desc), public.daily_metrics (daily_metrics_date_key × idx_daily_metrics_date), public.semantic_index, public.sales_goals, public.ai_narrative_cache, public.icp_data, public.error_logs. Nenhum DROP INDEX de duplicado após 07/2026: só supabase/migrations/20261013172000_inbound_reply_events_full_unique.sql:7 e 20261018190100_gamificacao_claim_matchups_rotations.sql:355 (pontuais, não os 6). Doc fonte A_planos_execucao.md:364 marca NI.| cético: O awk sobre indexes.md (mesma tabela, método, colunas e predicado) acha 40 ou mais pares duplicados ainda em produção, ex.: public.sales idx_sales_status_created_at × idx…

### F3286 · Enum public.salesperson_role = {sdr, closer, hybrid}

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Função comercial, não RBAC.
- **Fontes:** `docs/estado/08_ADMIN_SEGURANCA.md:89`
- **O que falta:** tabela/view "salesperson_role" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "salesperson_role" ausente do banco real (tables.md, views.md)| CONTESTADO pelo cético (IMPLEMENTADO): O enum existe no banco real: types-enums.md:22 (public.salesperson_role = sdr, closer, hybrid), usado em public.salespeople.role, competitive_ranking.role, mv_competitive_ranking.role e salespeople_public.role. A pré-checagem o procurou como tabela.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F0461 · Etapa 28 do plano: Comparar triggers, views e MVs

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Consumers, security_invoker, dependências, refresh e índices únicos. Saída esperada: grafo de impacto. Gate: catálogo destino completo.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:690-690`
- **O que falta:** Produzir o grafo de impacto de triggers, views e MVs a partir do catálogo do banco oficial (contexto/supabase/triggers.md, views.md e pg_depend).
- **Evidência:** Etapa só existe como plano: docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:690 e docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:156 (estado 🔒, 'Depende de 11'). Ausente: grep -rln 'grafo de impacto\|impact graph' docs scripts excluindo PLANO/STATUS/HANDOFF → 0 resultados. O snapshot tem catálogos brutos (contexto/supabase/triggers.md, views.md) gerados automaticamente, não um grafo de impacto com consumers/dependências/refresh.| cético: ausente: grep -rli 'grafo de impacto' docs scripts → só aparece em documentos de plano (AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md, STATUS_100_ETAPAS_2026-08-30.md, funcionalidades-pendentes-2026-10-12/A_planos_execucao.md). Nenhum artefato com o grafo pedido (consumers, dependências, refresh).

### F0462 · Etapa 75 do plano: Revisar partições e retenção

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Garantir criação futura com RLS/grants herdados, archival e vacuum/analyze. Saída esperada: teste de próxima partição. Gate: autorização DDL/job.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:752-752`
- **O que falta:** Não há partição a testar no banco oficial. Se a etapa continuar no plano, registrar formalmente como descartada (docs/DATA_RETENTION.md já decide por purge) e marcar a etapa 75 como N/A em docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:230.
- **Evidência:** As tabelas particionadas citadas não existem no banco canônico: grep 'supplier_products_raw_history\|magazine_public_view_events' em contexto/supabase/tables.md, snapshot.json e stats.json → 0 resultados; também 0 em supabase/migrations, src e supabase/functions. O plano 26/08 foi levantado na origem rapjs (AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:6 'origem rapjswienfhkobhlamxb; destino usyxfpqlsspldubptrdl'; partições descritas em :366-386). Nenhuma função/cron de criação de partição: grep -i 'partition' contexto/supabase/functions.md e cron.md → 0. docs/DATA_RETENTION.md:9-11 decidiu 'purge periódico em lotes, sem particionamento por ora'.| CONTESTADO pelo cético (NAO_APLICAVEL): As partições citadas são do banco de ORIGEM rapjswienfhkobhlamxb, não do banco deste repo: docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:6 ('origem rapjswienfhkobhlamxb; destino …
- **Revisão:** em disputa. O cético propõe Não aplicável e o juiz ainda não decidiu.

### F3287 · Etapa canônica 26/08 nº 31: Corrigir a partição p2026_11 (RLS, grants, policies do pai)

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Etapa canônica 31 (plano 26/08, matriz de status 30/08, estado 🔒): habilitar RLS e alinhar grants/policies ao pai; teste de acesso direto e pelo pai.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:164-164`
- **O que falta:** tabela/view "p2026_11" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "p2026_11" ausente do banco real (tables.md, views.md)| CONTESTADO pelo cético (NAO_APLICAVEL): Não há partições no banco deste repo: as 408 linhas de tables.md são todas do tipo 'table'; grep -rn 'p2026_11\|PARTITION OF' supabase/migrations → 0 resultados. A partição de novembro com problema de RLS é do projeto ORIGEM (MATRIZ_FORENSE_BANCOS_E_CONTRATOS_2026-08-26.md:521). A etapa 31 (STATUS_100_ETAPAS_2026-08-30.md:164) depende desse catálogo.
- **Revisão:** em disputa. O cético propõe Não aplicável e o juiz ainda não decidiu.

### F0463 · Etapa canônica 26/08 nº 74: Validar índices por workload (159 sem scan)

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Etapa canônica 74 (plano 26/08, matriz de status 30/08, estado 🔒): query plans e sazonalidade; criar/drop individual; parecer por índice.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:229-229`
- **O que falta:** Escrever o parecer por índice (manter ou remover, com justificativa de plano de execução e sazonalidade) para os índices sem scan listados em contexto/supabase/stats.md e, com autorização do dono, criar as migrations de DROP INDEX.
- **Evidência:** docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:229 mantém a etapa 74 em 🔒 ('Exige catálogo/plans do destino'). Ausente: grep -rln 'parecer por índice' docs → só aparece como item de plano (PLANO_100_ETAPAS, STATUS_100_ETAPAS, HANDOFF, A_planos_execucao), nenhum documento com parecer individual. O snapshot lista automaticamente 42 índices nunca usados em contexto/supabase/stats.md:427-470 (lista de candidatos, não parecer). Nenhuma migration de DROP INDEX por workload.| cético: docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:229 mantém a etapa 74 como 🔒 ('Exige catálogo/plans do destino'). docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:75 confirma: 'nenhum DROP INDEX depois de 20260712212637; duplicados mantidos'. ausente: grep -rli 'parecer por índice' docs → só aparece em documentos de plano/status, nenhum parecer individual por índice.

### F0464 · Etapa canônica 26/08 nº 75: Revisar partições e retenção

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Etapa canônica 75 (plano 26/08, matriz de status 30/08, estado 🔒): criação futura com RLS/grants herdados, archival, vacuum/analyze; teste de próxima partição.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:230-230`
- **O que falta:** Não existe 'próxima partição' a criar com RLS no banco oficial. Fechar a etapa como N/A em docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:230 ou, se particionar for desejado, criar o desenho (tabela pai, função de criação mensal, cron, RLS herdada) — hoje a decisão documentada é purge (docs/DATA_RETENTION.md:9).
- **Evidência:** Mesma base de F0462: docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:230 em 🔒; nenhuma partição '_*p2026*_' no banco canônico (grep '_p2026\|_p2025\|partition' em contexto/supabase/tables.md e snapshot.json → 0); nenhuma função/cron de próxima partição (functions.md, cron.md → 0). As partições citadas existiam na origem rapjs (AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:366-386).| CONTESTADO pelo cético (NAO_APLICAVEL): Mesma base de F0462. As partições '_*p2026*_' existem só no banco de origem rapjs: docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:6 e :375,:385-386. AGENTS.md:62 diz que só usyxfpqlsspldubptrdl é deste repo. No banco oficial: grep -ci 'partition' em contexto/supabase/tables.md, functions.md e cron.md → 0 em todos. A decisão de não particionar está em docs/DATA_RETENTION.md:9. docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:230 continua 🔒.
- **Revisão:** em disputa. O cético propõe Não aplicável e o juiz ainda não decidiu.

### F3288 · Índice idx_versions_entity recriado de forma não idempotente

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Recriação de idx_versions_entity falha em replay por não ser idempotente.
- **Fontes:** `docs/execucao/RECONCILIACAO_GITHUB_SUPABASE_2026-08-31.md:68`
- **O que falta:** Tornar a migration 20250102000003_versioning.sql:13 idempotente (IF NOT EXISTS) ou documentar que o replay não é suportado.
- **Evidência:** tabela/view "idx_versions_entity" ausente do banco real (tables.md, views.md)| cético: O bug segue aberto. supabase/migrations/20241231000001_entity_versions.sql:14 cria o índice com IF NOT EXISTS, e supabase/migrations/20250102000003_versioning.sql:13 o recria com 'CREATE INDEX idx_versions_entity ON entity_versions(entity_type, entity_id);' sem IF NOT EXISTS, o que quebra o replay. Em produção o índice existe (indexes.md:515).

### F3289 · Índice ivfflat idx_semantic_index_embedding (pgvector)

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** semantic_index tem 6 índices incluindo ivfflat em embedding; 1256 kB é overhead de índices vazios.
- **Fontes:** `docs/estado/06_DOMINIO_IA_COACHING.md:150-160`
- **O que falta:** tabela/view "idx_semantic_index_embedding" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "idx_semantic_index_embedding" ausente do banco real (tables.md, views.md)| CONTESTADO pelo cético (IMPLEMENTADO): Os 6 índices de public.semantic_index existem no banco real: indexes.md:1108-1113 (idx_semantic_index_content_hash, idx_semantic_index_embedding ivfflat, idx_semantic_index_entity, idx_semantic_index_salesperson, semantic_index_entity_type_entity_id_key e pkey).
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3290 · Índices da origem: 1.170, nenhum inválido; 25 FKs sem índice (errata)

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Texto afirma nenhuma FK sem índice, mas a errata remete à matriz forense que corrige para 25 FKs sem índice com colunas na liderança; 1.170 índices sem inválidos/duplicados. Observação: o doc refere-se ao projeto ORIGEM rapjswienfhkobhlamxb, que AGENTS.md declara não pertencer a este repo; verificar também o equivalente no destino usyxfpqlsspldubptrdl.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:9-16;docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:352-355`
- **O que falta:** tabela/view "matriz_forense_bancos_e_contratos_2026" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "matriz_forense_bancos_e_contratos_2026" ausente do banco real (tables.md, views.md)| CONTESTADO pelo cético (NAO_APLICAVEL): É contagem de índices (1.170) e de FKs sem índice (25) do projeto ORIGEM (AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:9-16, 352-355). O equivalente no destino está coberto por F3273: índices das FKs criados em 20260831130001_repair_cron_and_fk_indexes.sql:7-27 e presentes em indexes.md.
- **Revisão:** em disputa. O cético propõe Não aplicável e o juiz ainda não decidiu.

### F3291 · Índices idx_query_telemetry_created_at / _severity / _table

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Três índices recomendados: created_at DESC, severity e table_name.
- **Fontes:** `docs/TELEMETRY_MODULE_DOCS.md:156-159`
- **O que falta:** tabela/view "idx_query_telemetry_created_at" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "idx_query_telemetry_created_at" ausente do banco real (tables.md, views.md)| CONTESTADO pelo cético (IMPLEMENTADO): Os 3 índices existem sobre public.query_telemetry no banco real: indexes.md:844 (idx_query_telemetry_created_at), :845 (idx_query_telemetry_severity) e :846 (idx_query_telemetry_table, em table_name).
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3292 · Migration 20260715184427 cria policy em _internal_secrets sem tabela criada (BUG_0002)

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** 17 migrations referenciam _internal_secrets e nenhuma a cria antes de 15/07; PR #538 passa a criar, mas datada de novembro. Decisão do dono.
- **Fontes:** `docs/agentes/achados-auditoria-261117.md:63-72`
- **O que falta:** tabela/view "bug_0002" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "bug_0002" ausente do banco real (tables.md, views.md)| CONTESTADO pelo cético (IMPLEMENTADO): O bug foi corrigido. supabase/migrations/20260715184427_8e4ec70a-caf2-4a8d-9042-e26e29fa3a54.sql:3-14 agora cria a tabela (CREATE TABLE IF NOT EXISTS public._internal_secrets e ENABLE RLS) antes da policy da linha 18. Commit cf25752e7 'fix(db): cria _internal_secrets antes de usa-la na migration de 15/07 (#542)'. É o primeiro arquivo (ordem cronológica) que referencia _internal_secrets. A tabela existe no banco com RLS (tables.md: public._internal_secrets, RLS sim, 1 policy).
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F0500 · Parecer e DROP de índices por workload

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Etapa 74 NI: nenhum DROP INDEX após 20260712212637.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:75`
- **O que falta:** Parecer por índice (idx_scan, tamanho, EXPLAIN) e migration DROP INDEX aprovada pelo dono.
- **Evidência:** Status 'NI' confirmado: docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:75. Único DROP INDEX após 20260712212637: supabase/migrations/20261013172000_inbound_reply_events_full_unique.sql:7 e 20261018190100_gamificacao_claim_matchups_rotations.sql:355 (troca de índice único por redesenho de constraint, não parecer por workload); 20261116223100_constraints_integridade_negocio.sql:14 é DROP comentado. Nenhum doc de parecer por índice em docs/; contexto/supabase/stats.md:427 ainda lista 'Índices nunca usados (candidatos a remoção)'.| cético: Arquivos com DROP INDEX: 20260619194330, 20260619195106, 20260619201655, 20260712212637, 20261013172000, 20261018190100 — os dois posteriores a 20260712212637 tratam de redesenho de unicidade, não de parecer por workload; nenhum doc de parecer por índice (grep 'duplicad\|nunca usad' em docs/ só acha os relatórios de auditoria e d…

### F0501 · Plano 30/08 etapa 43 (P043): Medir seis grupos de índices duplicados e propor remoção

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Etapa 43 do plano de 100 etapas (auditoria 30/08; = P043 do handoff): EXPLAIN/uso/tamanho antes de solicitar autorização para cada DROP.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:701-701`
- **O que falta:** Medir cada grupo (idx_scan, pg_relation_size, EXPLAIN) e migration DROP INDEX nominal após aprovação do dono.
- **Evidência:** Etapa planejada em docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:701. Banco real ainda tem índices duplicados: agrupando contexto/supabase/indexes.md por tabela+método+colunas+predicado → 54 grupos com >1 índice (ex.: public.daily_metrics daily_metrics_date_key + idx_daily_metrics_date; public.error_logs idx_error_logs_created + idx_error_logs_created_at; public.blocked_ips blocked_ips_ip_address_key + idx_blocked_ips_address). Nenhuma migration remove duplicado: `grep -l 'DROP INDEX' supabase/migrations/*.sql` → 7 arquivos, nenhum sobre esses pares. Sem doc de medição (EXPLAIN/uso/tamanho) por grupo.| cético: Duplicados seguem no banco: contexto/supabase/indexes.md:388 e :390 (daily_metrics_date_key + idx_daily_metrics_date sobre date), :518-519 (idx_error_logs_created + idx_error_logs_created_at sobre created_at); nenhuma migration remove esses pares (l…

### F0505 · Remoção dos 42 pares de índices duplicados

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** 42 pares de índices duplicados foram identificados mas não removidos; exigem validação nominal separada.
- **Fontes:** `docs/execucao/HARDENING_CANONICO_2026-08-31.md:82-83`
- **O que falta:** Lista nominal validada dos pares + migration DROP INDEX aprovada pelo dono, ou decisão registrada de manter.
- **Evidência:** Pendência confirmada: docs/execucao/HARDENING_CANONICO_2026-08-31.md:82-83 ('nenhum dos 42 pares ... foi removido'). Banco real hoje: 54 grupos de índices com mesma tabela/método/colunas/predicado em contexto/supabase/indexes.md (ex.: public.stage_velocity_baselines idx_svb_stage + uniq_svb_stage_owner; public.engagement_score_history engagement_score_history_contact_id_contact_type_captured_a_key + idx_esh_contact_date). Nenhuma migration de DROP desses pares (7 arquivos com DROP INDEX, todos sobre índices únicos de dedupe/constraint). Nenhuma decisão registrada em docs/ de manter os pares.| cético: Pares duplicados persistem no banco real (contexto/supabase/indexes.md:388/390, :518/519); nenhuma migration de DROP desses pares; nenhum doc com decisão de manter (grep em docs/ só retorna auditorias e docs/execucao/HARDENING_CANONICO_2026-08-31.md:82-83, que registra a não-remoção).

### F0507 · Revisão dos 497 índices nunca usados

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** NÃO INICIADO: sem migration de limpeza.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:285`
- **O que falta:** Revisão nominal de pg_stat_user_indexes (idx_scan=0, sem PK/UNIQUE) e migration DROP INDEX aprovada pelo dono.
- **Evidência:** Status 'NÃO INICIADO' confirmado: docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:285. Nenhuma migration de limpeza: os únicos DROP INDEX após 20260831130001 são supabase/migrations/20261013172000_inbound_reply_events_full_unique.sql:7 e 20261018190100_gamificacao_claim_matchups_rotations.sql:355 (redesenho de unicidade, não limpeza de índices sem uso). Banco real ainda lista candidatos: contexto/supabase/stats.md:427-472 ('Índices nunca usados', 42 linhas listadas, ex. idx_web_vitals_route_metric_created 2,5 MB). O número 497 é métrica histórica, não reproduzível pelo snapshot (stats.md é aproximado).| cético: Nenhuma migration de limpeza de índices sem uso (DROP INDEX posteriores a 20260712212637 só em 20261013172000 e 20261018190100, redesenho de unicidade); docs/estado/11_DADOS_BANCO.md:622,651 ainda listam 497 índices nunca usados como observação; status NÃ…

### F3293 · Schemas de domínio supplier_stricker, cf_recon, prod_audit, classification_audit, analytics, internal na origem

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Origem possui schemas supplier_stricker (17 tabelas), cf_recon (6), prod_audit (5), classification_audit (1), analytics (7 MVs) e internal (1 MV). Observação: o doc refere-se ao projeto ORIGEM rapjswienfhkobhlamxb, que AGENTS.md declara não pertencer a este repo; verificar também o equivalente no destino usyxfpqlsspldubptrdl.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:331-336`
- **O que falta:** tabela/view "supplier_stricker" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "supplier_stricker" ausente do banco real (tables.md, views.md)| CONTESTADO pelo cético (NAO_APLICAVEL): O destino só tem os schemas private e public fora dos internos do Supabase (schemas.md). Nenhum dos schemas supplier_stricker, cf_recon, prod_audit, classification_audit, analytics ou internal existe. A afirmação descreve o projeto ORIGEM (AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:331-336).
- **Revisão:** em disputa. O cético propõe Não aplicável e o juiz ainda não decidiu.

### F3294 · Sequências migration_log_id_seq e plan_rollback_ddl_id_seq exclusivas do destino

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** O destino adiciona as sequências migration_log_id_seq e plan_rollback_ddl_id_seq.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:315-315`
- **O que falta:** tabela/view "migration_log_id_seq" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "migration_log_id_seq" ausente do banco real (tables.md, views.md)| CONTESTADO pelo cético (IMPLEMENTADO): As duas sequências existem no banco real: sequences.md (public.migration_log_id_seq pertence a migration_log.id; public.plan_rollback_ddl_id_seq pertence a plan_rollback_ddl.id). Estão versionadas: migration_log em supabase/migrations/20251228000003_move_extensions_to_schema.sql:257, plan_rollback_ddl (bigserial) em supabase/migrations/20261117070000_reconcilia_objetos_orfaos_producao.sql:72-80, com RLS.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3295 · Tabela categoria_cor_enum (2 afirmações nos docs)

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Doc: enums não usados por coluna nem rotina na origem; podem ser roadmap/legado.| categoria_cor_enum, familia_cor_enum, payment_status, silver_norm_status e tipo_cor_enum não são usados em colunas. Observação: o doc refere-se ao projeto ORIGEM rapjswienfhkobhlamxb, que AGENTS.md declara não pertencer a este repo; verificar também o equivalente no destino usyxfpqlsspldubptrdl.
- **Fontes:** `docs/auditoria/MATRIZ_FORENSE_BANCOS_E_CONTRATOS_2026-08-26.md:226-228`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:424-424`
- **O que falta:** tabela/view "categoria_cor_enum" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "categoria_cor_enum" ausente do banco real (tables.md, views.md)| CONTESTADO pelo cético (NAO_APLICAVEL): Os enums citados não existem no banco deste repo. types-enums.md lista 25 tipos (linhas 5-29), e grep 'categoria_cor\|familia_cor\|payment_status\|silver_norm\|tipo_cor' em types-enums.md → 0 resultados. A afirmação descreve o projeto ORIGEM (MATRIZ_FORENSE_BANCOS_E_CONTRATOS_2026-08-26.md:226-228).
- **Revisão:** em disputa. O cético propõe Não aplicável e o juiz ainda não decidiu.

### F3297 · Tabela fk_indexes (2 afirmações nos docs)

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Fila canônica do handoff (onda 5): Criar índices para as 11 FKs sem cobertura. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.| Etapa 44 do plano de 100 etapas (auditoria 30/08; = P044 do handoff): Avaliar e, se aprovado, criar índices; comparação de planos antes/depois.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:340-340`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:702-702`
- **O que falta:** tabela/view "fk_indexes" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "fk_indexes" ausente do banco real (tables.md, views.md)| CONTESTADO pelo cético (IMPLEMENTADO): Mesma fila de F3273. Os índices das 11 FKs foram criados por migration: supabase/migrations/20260831130001_repair_cron_and_fk_indexes.sql:7-27 (11 CREATE INDEX IF NOT EXISTS ..._fk). 9 estão presentes no banco real (indexes.md:48, :535, :1244 e demais). Os 2 de cadence_enrollments sumiram com a tabela, dropada em 20261001203300_deny_dead_tables_revoke_anon_grants.sql:37. A pré-checagem procurou uma tabela 'fk_indexes'.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3301 · Tabela leads (2 afirmações nos docs)

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Doc: tabela leads não existe no banco canônico; migration não aplicável.| Relação literal leads chamada em sequence-runner e ai-agent-orchestrator, mas ausente nos bancos origem e destino.
- **Fontes:** `docs/auditoria/VALIDACAO_SINCRONIA_GITHUB_SUPABASE_2026-09-10.md:119,127`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:212-219`
- **O que falta:** Decidir e aplicar: criar public.leads com RLS, ou remover a migration 20260903000001_enable_rls_leads.sql e a ação update_lead_score em ai-agent-orchestrator/index.ts:292-297.
- **Evidência:** tabela/view "leads" ausente do banco real (tables.md, views.md)| cético: public.leads continua ausente do banco real: grep leads em tables.md e views.md → só a coluna leads_count e a CTE monthly_leads (views.md:225,418-435). O código ainda escreve na relação inexistente: supabase/functions/ai-agent-orchestrator/index.ts:293-296 faz .from('leads').update({score}). Essa function não está na allowlist ACTIVE (.github/workflows/deploy.yml:144), logo não roda em produção. sequence-runner já não chama .from('leads') (grep → 0). supabase/migrations/20260903000001_enable_rls_leads.sql continua no repo, sem tabela. Nenhuma decisão foi aplicada (nem criar a tabela, nem remover as referências).

### F3302 · Tabela mv_product_leaf_category (2 afirmações nos docs)

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Etapa 38 NI: mv_product_leaf_category não está no repo.| Etapa canônica 38 (plano 26/08, matriz de status 30/08, estado 🔒): testes Realtime/API.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:44`, `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:171-171`
- **O que falta:** A MV não existe em nenhum lugar deste repo nem no banco oficial. A etapa 38 (revisão da MV e auth.users fora do Realtime) não foi executada; talvez nem se aplique ao destino.
- **Evidência:** tabela/view "mv_product_leaf_category" ausente do banco real (tables.md, views.md)| cético: Ausente do código e do banco: grep -rln mv_product_leaf_category (sem node_modules e .git) → só 3 docs de auditoria. Em views.md, a única view materializada é public.mv_competitive_ranking (views.md:398). Pelo próprio doc, a etapa 38 trata de uma MV do projeto origem (schema internal).

### F3304 · Tabela schema_conventions (2 afirmações nos docs)

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** 87 tabelas sem created_at.| 77 colunas de dinheiro fora do padrão.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:190`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:283`
- **O que falta:** Migration que adicione created_at timestamptz default now() às 92 tabelas sem a coluna e corrija o tipo das ~77 colunas de dinheiro fora do padrão.
- **Evidência:** tabela/view "schema_conventions" ausente do banco real (tables.md, views.md)| cético: Não existe tabela schema_conventions: a convenção é o doc docs/SCHEMA_CONVENTIONS.md, que existe. A remediação pedida não foi feita: contando tables/public/*.md do snapshot, 92 de 408 tabelas ainda não têm a coluna created_at (os docs falavam em 87). Nenhuma migration padronizou as colunas de dinheiro.

### F0533 · Etapa 47: job "Migrations apply cleanly" (supabase db reset) em PR que toca supabase/migrations/**

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Verificar sobreposição com #198.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:95`
- **O que falta:** Criar um job de PR com paths supabase/migrations/** que rode supabase start + supabase db reset (ou um service postgres) e falhe se alguma migration não aplicar do zero.
- **Evidência:** ausente: grep -rn 'db reset\|db start\|supabase start' .github/workflows/_.yml → 0 resultados. Único uso do CLI em migrations: deploy.yml:167 'supabase db push --linked' (pós-merge, contra produção) e apply-migration.yml:6; nenhum job aplica migrations em banco efêmero em PR.| cético: ausente: grep -rn 'db reset\|supabase start\|db start' .github/workflows/_.yml → 0. Os únicos usos do supabase/setup-cli são deploy.yml:127 (db push em produção), migrations-drift.yml:54, types-sync.yml:69 e pr-checks.yml:684 (gen types). Nenhum aplica migrations em banco efêmero. scripts/db/simulate-migrations-via-mcp.ts:1-9 simula migrations em transação com rollback, mas só manual, via PROMO_CHAMPIONS_MCP_URL; grep em workflows → 0 chamadores.

### F0535 · Handoff P057: Replay completo em banco efêmero

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Fila canônica do handoff (onda 6): Replay completo em banco efêmero. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:358-358`
- **O que falta:** Criar um job de CI com Postgres/Supabase efêmero (supabase start + db reset, ou service container) que aplique supabase/migrations/ do zero e falhe em erro. Antes disso é preciso sanear as relações fantasmas (deals, semantic_index, call_tracking, notes, leads, geo_access_logs, migration_log) e as 62 divergências de coluna (docs/agentes/replay-do-repo-261117.md:100-109), ou usar supabase/schema.sql como base.
- **Evidência:** Nenhum workflow sobe banco efêmero nem replaya migrations: ausente: grep -rniE 'services:\|image:\s*postgres\|supabase start\|supabase db\|db reset\|pg_prove\|pgtap\|ephemeral' .github/workflows/*.yml → só menções a 'db push --linked' (deploy.yml:23,50,163,167,199) e comentário em apply-migration.yml:6; 0 jobs com Postgres efêmero. O único workflow com 'migrations' no nome é .github/workflows/migrations-drift.yml:1-114, que apenas compara versões do repo com supabase_migrations.schema_migrations do projeto real (linhas 67-114), sem aplicar SQL. scripts/run-sql-tests.sh:4-15 define só os modos static e remote (banco real); case em :94-98 não tem modo replay. Decisão registrada em docs/agentes/replay-do-repo-261117.md:7-10 (replay medido localmente em Postgres 16: 271 de 692 arquivos falham, 377 erros), :100-110 ('Tornar o repo replayável é um projeto com escopo próprio, não um item de fi…

### F0536 · Plano 30/08 etapa 57 (P057): Replay completo em banco efêmero

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Etapa 57 do plano de 100 etapas (auditoria 30/08; = P057 do handoff): Banco criado do zero, migrations verdes e diff final explicado contra o destino.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:718-718`
- **O que falta:** Mesmo de F0535. Falta também um passo que gere o diff entre o schema resultante e supabase/schema.sql (ou o snapshot docs/contexto/supabase) e explique cada diferença.
- **Evidência:** Mesmo artefato de F0535 (etapa 57 = P057). Saída esperada 'banco criado do zero, migrations verdes e diff final explicado contra o destino' (docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:718) não existe no CI: ausente: grep -rniE 'db reset\|supabase start\|image:\s*postgres' .github/workflows/*.yml → 0 resultados. .github/workflows/migrations-drift.yml:58-114 só compara listas de versões (comm -13/-23), não cria banco. A única execução de replay registrada foi manual e FALHOU: docs/agentes/replay-do-repo-261117.md:7-10 ('271 arquivos falham, 377 erros') e :23-29 (tabela de erros por categoria); o 'diff contra o destino' não foi produzido (:131-134: 100 erros em 'outro' NÃO VERIFICADOS). docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:155 já marcava 'NI'.| cético: É o mesmo artefato de F0535 (etapa 57 = P057). ausente: grep -rlniE …

### F0537 · Regra DROP/TRUNCATE/DELETE em check-migrations.mjs

- **Tipo:** Workflow CI
- **O que os docs afirmam:** P056 NI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:154`
- **O que falta:** Adicionar uma regra 7 em scripts/check-migrations.mjs para arquivos novos (modo --base): bloquear DROP TABLE/SCHEMA/COLUMN, TRUNCATE e DELETE/UPDATE sem WHERE, salvo marcador explícito de aprovação. Atualizar o cabeçalho, criar teste unitário e registrar no pr-checks.yml.
- **Evidência:** scripts/check-migrations.mjs:4-16 enumera as 6 regras do gate (padrão de nome, versão única, não vazia, versão crescente, CREATE TABLE exige RLS, literais *.supabase.co/JWT); os únicos regex são NAME_PATTERN, CREATE_TABLE, ENABLE_RLS e FORBIDDEN_LITERALS em :30-36. ausente: grep -niE 'DROP\|TRUNCATE\|DELETE\|destrutiv' scripts/check-migrations.mjs → 0 resultados. Em scripts/ e .github/workflows/ nenhuma outra regra bloqueia DDL destrutiva: grep -rniE 'TRUNCATE\|\bDROP\s+(TABLE\|SCHEMA\|COLUMN)\|destrutiv' só acha testes/fixtures (scripts/db-audit/gen-migration-probes.test.mjs:101,113,141; scripts/ai-context/cenarios.mjs:37,40) e o coletor de DROPs em gen-migration-probes.mjs:10-11, usado apenas para suprimir probes de objetos já dropados (net-state), não como gate. .github/workflows/apply-migration.yml e pr-checks.yml: grep -niE 'drop\|truncate\|delete' → 0 resultados. Chamadores do gat…

### F0538 · Replay de migrations em banco efêmero no CI

- **Tipo:** Workflow CI
- **O que os docs afirmam:** P057 NI: run-sql-tests.sh só static e remote.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:155`
- **O que falta:** Adicionar um modo 'replay' em scripts/run-sql-tests.sh, ou um job dedicado no pr-checks.yml, que suba um Postgres efêmero, aplique as migrations em ordem com ON_ERROR_STOP e rode supabase/tests/ contra ele. Antes é preciso sanear as relações fantasmas e as divergências de coluna, ou usar supabase/schema.sql como bootstrap.
- **Evidência:** scripts/run-sql-tests.sh:4-15 documenta apenas os modos 'static' (check-migrations.mjs + matriz de cobertura, :27-41) e 'remote' (psql contra o banco real via SUPABASE_DB_URL, :49-92); o case em :94-98 aceita static\|remote\|all e rejeita qualquer outro modo. Nenhum passo cria banco, roda `supabase start`/`db reset` ou aplica supabase/migrations/: grep -niE 'db reset\|supabase start\|postgres:\|migrations/' scripts/run-sql-tests.sh → 0 resultados. O job que o chama (.github/workflows/pr-checks.yml:382-400) só instala postgresql-client e executa `scripts/run-sql-tests.sh all`, sem service Postgres (grep -n 'services:' .github/workflows/pr-checks.yml → 0). A alternativa planejada em docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:86,91 (job 'Migrations apply cleanly' com supabase db reset) segue 'NÃO INICIADO' em docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:7…

## Parcial (142)

### F0111 · 10 jobs HTTP de cron restaurados

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** A.9 10/10 #4 NI: 20260913150000:16-18.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:378`
- **O que falta:** Incluir check-v4-callback-alerts e process-call-recording-ingest na allowlist deploy.yml:144 ou desagendar os jobs 37 e 39. Provar o destino com status_code 200 em net._http_response dos últimos disparos.
- **Evidência:** Os 10 jobs HTTP originais estão reagendados em cron.md: 12 campaign-health-alert-30min, 21 deal-risk-digest-daily, 26 email-bulk-retry-15min, 29 auto-task-queue-hourly, 30 detect-client-churn-alerts-hourly, 36 notify-v4-quote-status, 37 check-v4-callback-alerts, 38 cron-failure-alerter, 39 process-call-recording-ingest, 40 edge-retry-threshold-alert; URL vem de public._internal_secrets.functions_base_url (functions/public/trigger_internal_edge_job__f02f045c8b4350ab.sql:44-57; cron.md:21,26); grep rapjsw cron.md → 0; execuções succeeded (cron-runs.md:137-153,173-216). Migrations 20260910153000 e 20260831163000/170000 aplicadas (migrations.md:612). PORÉM check-v4-callback-alerts (job 37) e process-call-recording-ingest (job 39) não estão na allowlist ACTIVE de .github/workflows/deploy.yml:144 → 404 em produção; valor de functions_base_url não é exportado no snapshot (NÃO VERIFICADO se apo…

### F3239 · Agendamento (cron) 007-log-retention (2 afirmações nos docs)

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** Etapa 78 P: ADR-007, DATA_RETENTION.md, 20261001151000.| Nenhuma function ou cron de export de logs.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:79`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:147`
- **O que falta:** Job mensal que exporte os logs para storage frio e registre a execução (ADR-007:22).
- **Evidência:** O purge está agendado e roda: em contexto/docs/contexto/supabase/cron.md, o job 45 data-retention-purge-daily chama fn_apply_data_retention(). Saiu succeeded em 17, 18 e 19/11 (cron-runs.md:245-251). A migration supabase/migrations/20261001151000_log_retention_indexes_and_purge.sql:99-116 popula data_retention_policies. O export mensal não existe: docs/decisions/ADR-007-log-retention.md:22 o declara 'fora do escopo desta ADR', e cron.md não tem job de export.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F3241 · Agendamento (cron) job_run_details (3 afirmações nos docs)

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** 137 jobs: 135 ativos e 2 inativos; 165.154 execuções retidas, 165.151 sucessos e 3 falhas. Observação: o doc refere-se ao projeto ORIGEM rapjswienfhkobhlamxb, que AGENTS.md declara não pertencer a este repo; verificar também o equivalente no destino usyxfpqlsspldubptrdl.| 32 jobs ativos; cron-runs.md (7 dias): 88 execuções, 88 succeeded; HTTP das edges chamadas por net.http_post não verificado (B3). \| Fechamento do incidente exige 25 jobs ativos (ou catálogo revisado), zero command com rapjswienfhkobhlamxb e taxa de falha < 1%.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:448-451`, `docs/prod-readiness.md:884`, `docs/postmortems/2026-08-30_cron_outage.md:86-91`
- **O que falta:** Deployar ou remover os 12 destinos não deployados e monitorar o HTTP real em net._http_response. Falta também owner/SLA por job.
- **Evidência:** contexto/docs/contexto/supabase/cron.md tem 45 jobs, todos ativos ('sim'), e nenhum cita rapjswienfhkobhlamxb; grep -c failed cron-runs.md → 0. Porém 12 jobs chamam, via trigger_internal_edge_job, edges que estão fora da allowlist ACTIVE em .github/workflows/deploy.yml:144 (conferido com grep -qx): check-v4-callback-alerts, process-call-recording-ingest, winloss-webhook-health-monitor, webvitals-regression-alert, rotate-daily-challenges, process-scheduled-sends, check-quote-expiration, check-lead-sla, sdr-consecutive-alerts, challenge-expiration-alerts, send-alert-notifications e scheduled-reports-runner. O status 'succeeded' só cobre o enfileiramento SQL do net.http_post.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F3242 · Agendamento (cron) mv_competitive_ranking (2 afirmações nos docs)

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** Criar job de refresh da matview.| NÃO INICIADO: grep cron.schedule/trigger_internal_edge_job para refresh mv_competitive_ranking = 0.
- **Fontes:** `docs/estado/04_DOMINIO_ANALYTICS_BI.md:496-498`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:143`
- **O que falta:** Job em cron.job, como pede o critério. Hoje a matview só é atualizada quando sales muda.
- **Evidência:** A matview existe: contexto/docs/contexto/supabase/views.md:398 (public.mv_competitive_ranking, materialized). O refresh é feito por trigger: triggers.md:288 (trg_refresh_ranking_on_sale_change) chama public.trg_refresh_ranking_on_sale, que na linha 8 faz PERFORM private.refresh_competitive_ranking(). Essa função roda REFRESH MATERIALIZED VIEW CONCURRENTLY (functions/private/refresh_competitive_ranking__12ae32cb1ec02d01.sql:8). Nenhum job em cron.md faz esse refresh.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F3244 · COST-01: job de arquivamento de logs >90d em audit_logs_archive

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** Criar job pg_cron/edge agendada que arquiva registros >90d em audit_logs_archive e deleta do principal. V2: pendente; cita access_denied_logs, geo_access_logs, rate_limit_logs, email_tracking_events sem TTL.
- **Fontes:** `docs/reports/BACKEND_DEEP_AUDIT_2026-07-11.md:172-174`
- **O que falta:** Tabela public.audit_logs_archive e o passo de arquivar antes de apagar.
- **Evidência:** A deleção de registros com mais de 90 dias existe. Em cron.md, o job 7 chama fn_cleanup_stale_logs(90), cujos alvos incluem access_denied_logs, geo_access_logs, rate_limit_logs e email_tracking_events (functions/public/fn_cleanup_stale_logs__463d4ab7f988f47f.sql:12-15). O job 10 chama enforce_telemetry_retention, com audit_logs em v_ttl_90 (enforce_telemetry_retention__12ae32cb1ec02d01.sql:25). Ambos saíram succeeded (cron-runs.md:40-46 e :65-70). O arquivamento não existe: grep -c audit_logs_archive tables.md → 0, e cron.md não tem job archive-logs.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F0122 · Etapa 7 parte 2: reagendar os 10 crons HTTP apontando para usyxf

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** Crons HTTP com URL correta.
- **Fontes:** `docs/estado/IDENTIDADE_BANCO_2026-09-13.md:95`
- **O que falta:** Provar status 200 em net._http_response para os jobs HTTP, e incluir check-v4-callback-alerts e process-call-recording-ingest na allowlist ou desagendar os jobs 37 e 39.
- **Evidência:** Nenhum comando em cron.job contém URL literal (grep rapjsw/supabase.co cron.md → 0); os 10 jobs HTTP (cron.md ids 12,21,26,29,30,36,37,38,39,40) montam a URL a partir de _internal_secrets.functions_base_url (trigger_internal_edge_job__f02f045c8b4350ab.sql:44-57; trigger_campaign_health_alert/trigger_generate_urgent_client_tasks/trigger_detect_client_churn_alerts linhas 13-16). Valor de functions_base_url não é exportável (tables/public/internal_secrets.md: policy 'Deny all') → destino real NÃO VERIFICADO. check-v4-callback-alerts e process-call-recording-ingest fora da allowlist deploy.yml:144.| cético: Nenhum job tem URL literal: a URL é montada de _internal_secrets.functions_base_url (cron.md:22-23; trigger_internal_edge_job__f02f045c8b4350ab.sql:48-63). O succeeded dos jobs 36-40 (cron-runs.md:173-216) só prova que a chave existe e começa com https (RAISE em :55-60). O valor (usyxf) …

### F0123 · Etapa 76 do plano: Tornar jobs observáveis

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** Owner, SLA, timeout, idempotência, retry e alerta para os 137 jobs. Saída esperada: catálogo e zero falha silenciosa. Gate: mudança de job autorizada.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:753-753`
- **O que falta:** Catálogo por job (45) com owner, SLA, timeout, retry e idempotência. Alerta sobre net._http_response com status diferente de 2xx (falha HTTP silenciosa). Resolver os 12 jobs que chamam functions não deployadas.
- **Evidência:** Alerta existe: detect_stalled_cron_jobs (functions/public/detect_stalled_cron_jobs__12ae32cb1ec02d01.sql, job 17 */15) grava em cron_failure_alerts (RLS sim, ~1.6k linhas — tables.md:107, stats.md:28); cron-failure-alerter (job 38, allowlist deploy.yml:144 SIM) escala via _shared/alert-escalation.ts:22-51 (Slack webhook + Resend); SLA implícito por schedule em fn_cron_expected_interval/fn_cron_stalled_threshold; UI em src/components/admin/AdminSystemStatus.tsx:58 (rpc admin_edge_cron_status) montada em src/pages/AdminDashboard.tsx; .github/workflows/cron-monitoring.yml é só suíte de regressão Deno (não heartbeat). Falta catálogo: nenhuma tabela/doc com owner, timeout, retry e idempotência por job (grep catalog tables.md → só task_catalog; docs/runbooks/cron-failures.md sem tabela por job). '137 jobs' refere-se à origem rapjsw.| cético: Confirmado e agravado. Existe alerta via detect_sta…

### F3245 · Funções SQL de manutenção v1 agendadas (cleanup_old_audit_logs, archive_old_data, refresh_materialized_views, reindex_tables)

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** Funções desenhadas para cron e nunca agendadas; refresh_materialized_views e reindex_tables tinham cron só em comentário (mig/20260104181000:100, mig/20260104184000:64).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:177-178`
- **O que falta:** cron.schedule para as funções válidas ou DROP como legado v1. Três delas falhariam se fossem agendadas.
- **Evidência:** As 4 funções existem em contexto/docs/contexto/supabase/functions.md: archive_old_data (:83), cleanup_old_audit_logs (:130), refresh_materialized_views (:318) e reindex_tables (:322). Nenhuma está em cron.md. Três apontam para objetos inexistentes: archive_old_data__aedadd56f178c3a4.sql:10 faz UPDATE deals; reindex_tables__12ae32cb1ec02d01.sql:6 faz REINDEX TABLE deals; refresh_materialized_views__12ae32cb1ec02d01.sql:6-10 atualiza mv_sales_performance e outras. tables/public/deals.md não existe, e views.md tem só 1 matview.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F0130 · Owner/timeout nos 25 jobs

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** P047 P.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:145`
- **O que falta:** Documentar por job (45) owner, timeout esperado e ação de retry (docs/runbooks/cron-jobs.md ou tabela de catálogo com RLS consumida por detect_stalled_cron_jobs).
- **Evidência:** Timeout/SLA só genérico por schedule: fn_cron_expected_interval e fn_cron_stalled_threshold (functions/public/fn_cron_expected_interval__a8c47d95b43faca6.sql:8-17; fn_cron_stalled_threshold:7-10) usados por detect_stalled_cron_jobs. Owner por job: ausente — grep -rlniE 'owner._(cron\|job)' docs/agentes/_.md docs/runbooks/*.md → 0; docs/runbooks/cron-failures.md sem tabela por job (grep '^\| ' → 0); nenhuma tabela catálogo em tables.md (só task_catalog:356); cron.job não guarda owner. Hoje são 45 jobs, não 25.| cético: Confirmado. Só há limiar genérico por schedule (fn_cron_expected_interval/fn_cron_stalled_threshold, usados por detect_stalled_cron_jobs). Não há owner nem timeout por job: ls docs/runbooks/ não tem catálogo de jobs (só cron-failures.md genérico), tables.md não tem tabela catálogo, e cron.job não guarda owner. Hoje são 45 jobs (cron.md:7-51), não 25.

### F3249 · Particionamento/TTL para activities, webhook_deliveries, query_telemetry, audit_log

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** Tabelas de alto volume sem particionamento ou TTL; recomenda PARTITION BY RANGE e cron delete-old-webhook-deliveries (90 dias).
- **Fontes:** `docs/reports/BACKEND_ANALYSIS_REPORT.md:534-552`
- **O que falta:** TTL ou particionamento para activities. Confirmar no banco a linha de audit_log em data_retention_policies.
- **Evidência:** webhook_deliveries tem TTL em enforce_telemetry_retention__12ae32cb1ec02d01.sql:23 (job 10). query_telemetry tem TTL em purge_telemetry_retention:20-22 (job 8) e em purge_old_telemetry:22 (job 15). audit_log foi semeado com 365 dias em data_retention_policies (supabase/migrations/20261001151000_log_retention_indexes_and_purge.sql:100), e o job 45 fn_apply_data_retention aplica essa política. Não confirmei que a linha está no banco, porque o snapshot não traz o conteúdo da tabela: NÃO VERIFICADO. activities (tables/public/activities.md) não aparece em nenhuma função de retenção agendada (grep nas 4 funções → 0). Nenhuma das quatro tabelas é particionada.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F0132 · 10 ocorrências de CREATE POLICY IF NOT EXISTS (sintaxe inválida)

- **Tipo:** Doc/config
- **O que os docs afirmam:** 10 ocorrências de CREATE POLICY IF NOT EXISTS, sintaxe inválida no PostgreSQL; replay local bloqueado.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:490-492`
- **O que falta:** Marcar o arquivo como legado não replayável (cabeçalho + nota) ou reescrever com DROP POLICY IF EXISTS + CREATE POLICY, e adicionar regra no check-migrations proibindo 'CREATE POLICY IF NOT EXISTS'.
- **Evidência:** As 10 ocorrências persistem: grep -rniE 'CREATE POLICY IF NOT EXISTS' supabase/migrations/ → 10, todas em supabase/migrations/20260530000002_enable_rls_and_remove_env_risk.sql:50,53,57…; o arquivo foi registrado no ledger sem execução (docs/execucao/MIGRATION_RENAME_MAP.md:94-97 INSERT INTO schema_migrations; snapshot migrations.md:443 '0 statements' e migrations/20260530000002_….sql '(sem statements registrados)'), logo não reexecuta em produção; mas não há README/marcação de 'legado não replayável' no arquivo e scripts/check-migrations.mjs não valida sintaxe → replay do zero continua quebrando.| cético: grep -rnic 'CREATE POLICY IF NOT EXISTS' supabase/migrations/ → 10, todas em 20260530000002_enable_rls_and_remove_env_risk.sql. O arquivo entrou no ledger sem execução (MIGRATION_RENAME_MAP.md:94-97; migrations.md:443 '0' statements), sem cabeçalho de legado (head -15 do arquivo). Não …

### F0137 · 20260903000001_enable_rls_leads.sql marcada/removida (tabela leads inexistente)

- **Tipo:** Doc/config
- **O que os docs afirmam:** DIVERGENTE.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:370`
- **O que falta:** Pôr no topo do próprio arquivo um cabeçalho '-- NO-OP/SUPERSEDED: public.leads não existe; registrada no ledger por 20261117090000 sem executar' (ou arquivar o arquivo) e registrar a decisão em docs/execucao/MIGRATION_RENAME_MAP.md.
- **Evidência:** O arquivo continua sem nenhuma marcação: supabase/migrations/20260903000001_enable_rls_leads.sql:1-10 (ALTER TABLE public.leads ... USING (true)). A tabela public.leads não existe no banco real: grep 'public.leads' tables.md → 0 e não há tables/public/leads.md. A neutralização, porém, foi feita e registrada fora do arquivo: docs/execucao/catchup-migrations-2026-10-20/README.md:30-31 diz que ela 'ficou de fora de propósito'; supabase/migrations/20261117090000_marca_594_migrations_como_aplicadas.sql:614 a registra no ledger como aplicada sem executar; o ledger de produção mostra 0 statements para ela (contexto/supabase/migrations.md:609). A fonte (C_estado_runbooks.md:370) exige que o próprio arquivo seja marcado ou removido, e isso não foi feito.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F0146 · ADR definindo se origem é catálogo compartilhado, legado ou fonte canônica

- **Tipo:** Doc/config
- **O que os docs afirmam:** Doc: assinar ADR sobre papel do banco de origem antes de qualquer reconciliação.
- **Fontes:** `docs/auditoria/MATRIZ_FORENSE_BANCOS_E_CONTRATOS_2026-08-26.md:379-380`
- **O que falta:** Criar docs/decisions/ADR-011-banco-canonico.md que formalize o veredito de IDENTIDADE_BANCO_2026-09-13.md (usyxf canônico, rapjs legado, saejq Lovable) e cite AGENTS.md §7. Depois, fechar a pendência em A_planos_execucao.md:31.
- **Evidência:** A decisão já existe em documento, só não como ADR. docs/estado/IDENTIDADE_BANCO_2026-09-13.md:9-15 traz um 'Veredito': usyxfpqlsspldubptrdl é o 'Banco canônico', rapjswienfhkobhlamxb é o 'Projeto antigo' e saejqkojleeaxzrslzfg é o Supabase do Lovable, com prova reproduzível em §1-§4. AGENTS.md §7 reforça a regra. Não há ADR: ls docs/decisions → ADR-001..ADR-010; grep -rln 'rapjswienfhkobhlamxb\|usyxfpqlsspldubptrdl' docs/decisions → 0. docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:31 ainda lista 'ADR formal' como pendente.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F0147 · ARCHITECTURE: política de migrations alinhada ao postmortem

- **Tipo:** Doc/config
- **O que os docs afirmam:** DIVERGENTE com postmortem.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:435`
- **O que falta:** Registrar a decisão final (DDL direto via MCP vs deploy-db com approval) no postmortem item 8 e em ARCHITECTURE.md; atualizar contagens da linha 13.
- **Evidência:** docs/ARCHITECTURE.md:119-122 ainda diz 'Migrations: db_query via gateway MCP com DDL direto' — alinhado a AGENTS.md §7 (DDL direto com db_query) mas divergente de docs/postmortems/2026-08-30_cron_outage.md:83 (ação 8 'deploy-db com approval; revogar DDL manual' = pendente). Doc foi parcialmente atualizado (ARCHITECTURE.md:123-125 corrige Vercel/Sentry em 2026-10-18), porém ARCHITECTURE.md:13,36 ainda cita 173 functions/656 migrations (repo: 172 e 700) e a política de migrations não foi decidida.| cético: docs/ARCHITECTURE.md:120-122 ('Migrations: db_query via gateway MCP com DDL direto') alinha com AGENTS.md §7, mas docs/postmortems/2026-08-30_cron_outage.md (tabela de ações, item 8 'deploy-db com approval; revogar DDL manual' = pendente) continua divergente; ARCHITECTURE.md:13 ainda cita 173 functions/656 migrations.

### F0153 · Baseline da camada de dados (ADR-010) com migração incremental

- **Tipo:** Doc/config
- **O que os docs afirmam:** scripts/baselines/data-layer.txt tem 134 linhas (doc cita 132).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:151`
- **O que falta:** Ligar check:data-layer no pr-checks.yml; extrair as 8 queries diretas para hooks/services; limpar baseline.
- **Evidência:** Artefatos existem: docs/decisions/ADR-010-service-layer.md:55-65 (enforcement), scripts/check-data-layer.mjs, scripts/baselines/data-layer.txt (wc -l → 134; ADR cita 132). Porém o ratchet não está no CI: grep -rn 'data-layer' .github/workflows/*.yml → 0 resultados (pr-checks.yml roda lint/typecheck/migrations etc., linhas 112-189, nunca check:data-layer); execução local falha (exit=1): '8 arquivo(s) com acesso direto ao Supabase fora da camada de dados' (AdminSystemStatus.tsx:57-58, Client360HealthNbaSection.tsx:27-28, ActivityPulse.tsx:14, PerformanceTrends.tsx:29, AIEmailDialog.tsx:55, LeadScoreBreakdown.tsx:63, SDRIntelligenceHighlights.tsx:31, SDRSequenceOrchestrator.tsx:34) e '6 entrada(s) obsoleta(s) na baseline'; git log mostra 1 único commit na baseline (813f591), ou seja, não diminuiu ao longo das PRs.| cético: package.json:37 define check:data-layer, mas não roda em lugar nenh…

### F0155 · Buckets call-recordings/quote-pdfs/report-snapshots com limites e MIME

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 67 P: 20260831130002:19-37; falta antivírus e retenção.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:69`
- **O que falta:** Retenção de objetos (função + cron sobre storage.objects) e decisão/implementação de antivírus.
- **Evidência:** Buckets existem no banco real com limite e MIME: .../contexto/supabase/storage.md:7-11 — call-recordings (100 MB, áudio/vídeo), quote-pdfs (20 MB, application/pdf), report-snapshots (20 MB, json/csv), além de avatars, report-exports, winloss-reports; migration supabase/migrations/20260831130002_harden_storage_buckets.sql aplicada (.../contexto/supabase/migrations.md). Faltas declaradas confirmadas: antivírus → grep -rni 'antiv\\|clamav' supabase/ docs/*.md → 0 resultados; retenção de objetos de storage → nenhum cron toca storage.objects (cron.md:12-34 só purge/enforce_telemetry_retention, fn_apply_data_retention, fn_gc_call_recording_ingest_jobs — nenhuma referencia 'storage' no corpo em .../contexto/supabase/functions/public/).| cético: Buckets com limite e MIME confirmados em .../contexto/supabase/storage.md:7-12 (call-recordings 100 MB, quote-pdfs 20 MB, report-snapshots 20 MB). Sem …

### F0156 · Checklist novas SECURITY DEFINER: COMMENT ON FUNCTION com role esperada

- **Tipo:** Doc/config
- **O que os docs afirmam:** Toda nova função SECURITY DEFINER deve ter SET search_path, REVOKE/GRANT mínimo e COMMENT ON FUNCTION documentando o role.
- **Fontes:** `docs/SECURITY_HARDENING.md:199-206`
- **O que falta:** Regra no check-migrations exigindo SET search_path + COMMENT ON FUNCTION para SECURITY DEFINER novas; retroagir comentários.
- **Evidência:** Checklist existe em docs/SECURITY_HARDENING.md:199-206, mas não é validado: grep -c 'COMMENT ON FUNCTION' scripts/check-migrations.mjs → 0 (regras 1-6 em check-migrations.mjs:1-22 não cobrem). Nas 16 migrations de nov/2026 com SECURITY DEFINER, só 20261117050000_webhook_ssrf_e_rate_limit.sql tem COMMENT ON FUNCTION (2); as outras 15 têm 0 (ex.: 20261117070000_reconcilia_objetos_orfaos_producao.sql SD=5 COMMENT=0; 20261116220000_lost_deals_benchmark.sql SD=3 COMMENT=0); 5 arquivos sem 'search_path' (20261117040000, 20261117060000, 20261117150000, 20261117190000 com SD=1 e SEARCH_PATH=0).| cético: grep -ciE 'COMMENT ON FUNCTION\|search_path\|SECURITY DEFINER' scripts/check-migrations.mjs → 0 (checklist não é validado). Migrations de nov/2026 com SECURITY DEFINER: só 20261117050000_webhook_ssrf_e_rate_limit.sql tem COMMENT ON FUNCTION (2); as outras 15 têm 0 (ex.: 20261117070000_reconcilia…

### F0158 · Colunas selecionadas em .select() não auditadas contra o schema

- **Tipo:** Doc/config
- **O que os docs afirmam:** Classe inteira de fio quebrado não verificada: `.select('coluna_inexistente')` passaria.
- **Fontes:** `docs/estado/09_HOOKS_SERVICES.md:485-487`
- **O que falta:** Criar um script (ex.: scripts/db-audit/check-select-columns.mjs) que extraia as strings de .select() de src/hooks, src/services e src/components e as confronte com types.ts ou com o snapshot tables/public/*.md, ligado ao pr-checks.yml. Também eliminar os 11 casts 'supabase as unknown as' ou cobri-los pelo script.
- **Evidência:** Não existe a auditoria dedicada que o critério pede. grep -rln 'information_schema.columns' scripts → só scripts/db-audit/gen-migration-probes.mjs e scripts/supabase_snapshot/snapshot.py, e nenhum dos dois lê .select() do front. A lacuna está registrada em docs/estado/09_HOOKS_SERVICES.md:485-487. Existe uma proteção parcial na compilação: src/integrations/supabase/client.ts:9 usa createClient<Database> (supabase-js ^2.118.0, package.json:105), cuja tipagem acusa coluna inexistente em .select(); os tipos ficam iguais ao banco oficial (.github/workflows/types-sync.yml:3-4) e o tsc strict roda no gate (pr-checks.yml:122, tsconfig.app.json:14). Essa proteção tem limites: há um baseline de erros tolerados (pr-checks.yml:131-133, scripts/typecheck-baseline.json), e 11 arquivos em src fazem 'supabase as unknown as' e ficam sem checagem (ex.: src/hooks/orders/usePurchaseHistory.ts:54, src/comp…
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F0161 · Convenção de nomes de migrations YYYYMMDDHHMMSS_descricao

- **Tipo:** Doc/config
- **O que os docs afirmam:** 432 migrações com nomes UUID (Lovable); recomenda nome descritivo e scripts de rollback.
- **Fontes:** `docs/reports/BACKEND_ANALYSIS_REPORT.md:476-503`
- **O que falta:** Exigir descrição não-UUID nas migrations novas (NAME_PATTERN em scripts/check-migrations.mjs:30 aplicado com --base); os 539 nomes legados com UUID continuam; não há scripts de rollback.
- **Evidência:** Convenção documentada em docs/SCHEMA_CONVENTIONS.md:46-47 e docs/ZERO_DOWNTIME_MIGRATIONS.md:32-33. Gate scripts/check-migrations.mjs:30 NAME_PATTERN=/^\d{8,14}_.\*\.sql$/ (aceita 8-14 dígitos e qualquer sufixo, inclusive UUID). Diretório: 700 arquivos, 539 ainda com nome UUID Lovable (ls| grep -E '^[0-9]{14}_[0-9a-f-]{36}'), 0 UUID entre as 93 criadas desde 2026-10-01. Renomeações só de 15 arquivos com versão inválida (docs/execucao/MIGRATION_RENAME_MAP.md:3-6). Scripts de rollback: ls supabase/migrations \| grep -ci rollback → 0. \| cético: scripts/check-migrations.mjs:30 NAME_PATTERN=/^\d{8,14}_.*\.sql$/ aceita sufixo UUID; o gate roda no CI (.github/workflows/pr-checks.yml:187 e deploy.yml:109). ls supabase/migrations → 700 arquivos, 539 com sufixo UUID Lovable (grep -cE '^[0-9]{14}_[0-9a-f]{8}-[0-9a-f]{4}'). Nenhum arquivo de rollback.

### F0162 · Convenção: booleans com default explícito

- **Tipo:** Doc/config
- **O que os docs afirmam:** Colunas boolean devem ter default explícito. Regra mecânica — NÃO verificada.
- **Fontes:** `docs/SCHEMA_CONVENTIONS.md:16`
- **O que falta:** DEFAULT nas 3 colunas (migration nova) ou registrá-las como exceção; regra para boolean sem DEFAULT em scripts/check-migrations.mjs.
- **Evidência:** Regra em docs/SCHEMA_CONVENTIONS.md:16. Snapshot real (snapshot.json db.columns, schema public): 146 colunas boolean, 3 sem default: quote_conversion_audit.success, user_2fa_log.success, winloss_webhook_replay_audit.succeeded. Nenhuma regra em scripts/check-migrations.mjs cobre booleans (grep -i boolean → 0).| cético: Banco real (snapshot.json, tabelas public): 3 colunas boolean sem default, as três NOT NULL: quote_conversion_audit.success, user_2fa_log.success, winloss_webhook_replay_audit.succeeded. scripts/check-migrations.mjs:30-36 não tem regra para boolean.

### F0163 · Convenção: created_at/updated_at NOT NULL DEFAULT now() em toda tabela

- **Tipo:** Doc/config
- **O que os docs afirmam:** Toda tabela deve ter created_at e updated_at NOT NULL DEFAULT now(). Regra mecânica — NÃO verificada (snapshot indica 235 tabelas sem coluna updated_at, mas não foi auditado aqui).
- **Fontes:** `docs/SCHEMA_CONVENTIONS.md:12-13`
- **O que falta:** Regra no gate para CREATE TABLE novo (created_at/updated_at NOT NULL DEFAULT now()) e o legado registrado como exceção em docs/SCHEMA_CONVENTIONS.md:12-13.
- **Evidência:** Regra em docs/SCHEMA_CONVENTIONS.md:12-13. Snapshot real (408 tabelas public): 92 sem created_at, 235 sem updated_at, 59 com created_at nullable/sem default, 25 com updated_at nullable/sem default (ex.: ab_tests, activities, audit_logs, api_tokens sem updated_at; app_config, _internal_secrets sem created_at — contexto/supabase/tables/public/app_config.md:18-22). check-migrations.mjs não valida (grep updated_at → 0).| cético: Banco real (snapshot.json): das 408 tabelas public, 235 não têm updated_at e 92 não têm created_at (jq conferido). Ex.: tables/public/app_config.md:18-22 não tem created_at; tables/public/user_2fa.md tem created_at/updated_at nullable. scripts/check-migrations.mjs:31-32 só verifica RLS.

### F0164 · Convenção: dinheiro em NUMERIC(15,2), nunca float/real

- **Tipo:** Doc/config
- **O que os docs afirmam:** Valores monetários usam NUMERIC(15,2); legado usa DECIMAL(12,2) e não se deve aumentar a divergência. Regra mecânica — NÃO verificada.
- **Fontes:** `docs/SCHEMA_CONVENTIONS.md:14-15`
- **O que falta:** 'Nunca float' está cumprido, mas NUMERIC(15,2) é minoria. Falta regra para colunas novas e documentar o legado numeric/(12,2)/(14,2).
- **Evidência:** Regra em docs/SCHEMA_CONVENTIONS.md:14-15. Snapshot real: nenhuma coluna monetária em real/double precision (única double com nome 'value' é sdr_alert_configs.threshold_value, não monetária). Porém colunas monetárias: 47 numeric sem precisão, 24 numeric(12,2), 6 numeric(14,2), 5 numeric(5,2) e só 7 numeric(15,2) (account_plans.revenue_target, accounts.annual_revenue, approval_workflows.min_mrr_threshold, client_renewals.renewal_value, quote_items.unit_price/discount_amount/total_price). Sem gate em scripts/check-migrations.mjs (grep numeric → 0).| cético: Banco real: os 13 double precision em tabelas são coordenadas, scores e ms (clients.lat/lng, slow_query_alerts.*, sales.ai_prediction_score, web_vitals_samples.value…), nenhum monetário. Tipos public: numeric sem precisão 238, numeric(12,2) 32, numeric(14,2) 7, numeric(15,2) só 8. O gate (scripts/check-migrations.mjs:30-36) não olha nu…

### F0165 · Convenção: FKs com ON DELETE explícito (CASCADE filhos, SET NULL opcionais)

- **Tipo:** Doc/config
- **O que os docs afirmam:** FKs `REFERENCES public.<tabela>(id)` com ON DELETE explícito. Regra mecânica — NÃO verificada (relationships.md mostra FKs com NO ACTION).
- **Fontes:** `docs/SCHEMA_CONVENTIONS.md:17-18`
- **O que falta:** Migration nova pondo ON DELETE SET NULL nas 7 FKs NO ACTION; regra 'REFERENCES sem ON DELETE' em scripts/check-migrations.mjs.
- **Evidência:** Regra em docs/SCHEMA_CONVENTIONS.md:17-18. Snapshot real (constraints FOREIGN KEY public): 420 FKs — CASCADE 276, SET NULL 133, RESTRICT 4 (explícito), NO ACTION 7 (implícito): activities/clients/products/suppliers/teams.deleted_by (criadas em supabase/migrations/20261001193000_soft_delete_business_tables.sql:49 'ADD COLUMN IF NOT EXISTS deleted_by UUID' sem ON DELETE), approval_requests.requester_id (20260416180351:33), geo_blocked_regions.blocked_by (20251231120039:42). Sem gate em check-migrations.mjs.| cético: Banco real (snapshot.json db.constraints, FOREIGN KEY public): CASCADE 276, SET NULL 133, RESTRICT 4, NO ACTION 7, confirmado. 5 das NO ACTION são deleted_by de supabase/migrations/20261001193000_soft_delete_business_tables.sql, posterior à convenção.

### F0166 · Convenção: JSONB só para metadados (metadata jsonb DEFAULT '{}'), nunca para dados filtrados

- **Tipo:** Doc/config
- **O que os docs afirmam:** JSONB permitido para metadados com default '{}'; dados consultados por filtro devem virar coluna indexada. Regra mecânica parcial — NÃO verificada.
- **Fontes:** `docs/SCHEMA_CONVENTIONS.md:19-20`
- **O que falta:** Documentar as exceções (payloads de auditoria) em docs/SCHEMA_CONVENTIONS.md:19-20 e, se quiser gate, regra para jsonb sem DEFAULT.
- **Evidência:** Regra em docs/SCHEMA_CONVENTIONS.md:19-20. Snapshot real: 180 colunas jsonb, 38 sem default (ex.: account_plans.action_plan, activity_audit_logs.old_data/new_data, ai_agent_runs.result, app_config.value — contexto/supabase/tables/public/app_config.md:20). 10 índices GIN no public (indexes). Não há verificação de filtros ->> sem índice no CI.| cético: Banco real: 184 colunas jsonb em public, 42 sem default (o número inclui views; o verificador contou 38 só em tabelas). Ex.: tables/public/app_config.md:20 tem value jsonb sem default. Não há checagem no CI.

### F0167 · Convenção: nomes snake_case, plural para entidades

- **Tipo:** Doc/config
- **O que os docs afirmam:** Tabelas em snake_case, plural para entidades (clients, pipeline_stages), singular para mapas/dicionários; feature_flags é exceção histórica. Regra mecânica — NÃO verificada nesta extração.
- **Fontes:** `docs/SCHEMA_CONVENTIONS.md:8-9`
- **O que falta:** Decidir entre registrar as divergências em docs/SCHEMA_CONVENTIONS.md como exceções históricas (client_portfolio, buying_committee, objection_library e objections_library) ou consolidar os pares duplicados: objection_library com objections_library, e buying_committee com buying_committee_members.
- **Evidência:** A regra está documentada em docs/SCHEMA_CONVENTIONS.md:8-9: snake_case, plural para entidades, singular para mapas/dicionários, e feature_flags como única exceção citada. Pelo snapshot, o snake_case é cumprido nas 408 tabelas public. A parte de plural/singular tem divergências que nenhum doc justifica: (1) public.objection_library e public.objections_library convivem no banco (contexto/supabase/tables.md:218-219), têm colunas diferentes (tables/public/objection_library.md: objection_type, pattern_text, frequency_count; tables/public/objections_library.md: objection, response, category) e são consumidas por hooks diferentes (src/hooks/conversational/useObjectionAnalysis.ts:97 usa .from('objection_library'); src/hooks/useObjectionsLibrary.ts:31,54,78,103,111,128 usa .from('objections_library')); (2) public.buying_committee (tables.md:40) guarda uma linha por contato (tables/public/buying_…
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Implementado.

### F0168 · Convenção: PK id uuid DEFAULT gen_random_uuid()

- **Tipo:** Doc/config
- **O que os docs afirmam:** Toda tabela nova tem `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`. Regra mecânica — NÃO verificada.
- **Fontes:** `docs/SCHEMA_CONVENTIONS.md:10`
- **O que falta:** Corrigir churn_alert_settings.id e os 11 defaults uuid_generate_v4(), ou registrá-los como exceção; documentar as PKs naturais aceitas.
- **Evidência:** Regra em docs/SCHEMA_CONVENTIONS.md:10. Snapshot real: 0 tabelas sem PK; 379 colunas id uuid DEFAULT gen_random_uuid(), 11 com uuid_generate_v4(); 3 id não-uuid (migration_log integer, plan_rollback_ddl bigint, churn_alert_settings boolean); 15 PKs que não são 'id' (chaves naturais: app_config.key, _internal_secrets.key, stage_probabilities.stage, data_retention_policies.table_name, squad_members(squad_id,user_id)…, ver contexto/supabase/tables/public/app_config.md:27). Sem gate em check-migrations.mjs.| cético: Banco real: 11 tabelas com id DEFAULT uuid_generate_v4() (jq em snapshot.json); tables/public/churn_alert_settings.md:19 tem id do tipo boolean com DEFAULT true; tables/public/app_config.md:27 tem PK natural (key).

### F0170 · Convenções de schema: TIMESTAMPTZ, NUMERIC(15,2) para dinheiro, RLS + updated_at obrigatórios, SECURITY INVOKER, grants mínimos

- **Tipo:** Doc/config
- **O que os docs afirmam:** Regras em docs/SCHEMA_CONVENTIONS.md; CREATE INDEX CONCURRENTLY falha no gateway transacional.
- **Fontes:** `docs/agentes/banco-e-mcp.md:29-31`
- **O que falta:** Estender o gate para timestamptz, NUMERIC, trigger de updated_at, SECURITY INVOKER/grants e CONCURRENTLY nas migrations novas.
- **Evidência:** docs/SCHEMA_CONVENTIONS.md existe (linhas 8-50: timestamptz, NUMERIC(15,2), RLS, updated_at trigger, SECURITY INVOKER preferido, CONCURRENTLY proibido). scripts/check-migrations.mjs:1-24 só valida nome, versão única/crescente, arquivo vazio, ENABLE ROW LEVEL SECURITY junto de CREATE TABLE e literais supabase.co/JWT; grep -iE 'timestamptz\|numeric\|updated_at\|security\|grant\|concurrently' scripts/check-migrations.mjs → 0.| cético: docs/SCHEMA_CONVENTIONS.md existe e trata de timestamptz, NUMERIC(15,2), RLS e SECURITY. scripts/check-migrations.mjs:4-16 e :30-36 só validam nome, versão, arquivo vazio, RLS junto de CREATE TABLE e literais supabase.co/JWT. grep -i concurrently scripts/check-migrations.mjs → 0.

### F0171 · CREATE INDEX CONCURRENTLY proibido (pooler transacional)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Usar CREATE INDEX simples.
- **Fontes:** `docs/ZERO_DOWNTIME_MIGRATIONS.md:37-39`
- **O que falta:** Adicionar 'CREATE INDEX CONCURRENTLY' às FORBIDDEN_LITERALS de scripts/check-migrations.mjs:33 para arquivos novos.
- **Evidência:** Regra em docs/ZERO_DOWNTIME_MIGRATIONS.md:37-39, docs/SCHEMA_CONVENTIONS.md:49 e AGENTS.md §7. Statements ativos com CONCURRENTLY só em 4 migrations de jan/2026 (20260104144318_performance_indexes.sql:2-10, 20260104144330, 20260104170152, 20260104181000) e 20260517113746; corrigidas por supabase/migrations/20261014000002_fix_concurrently_indexes.sql:1-4 (28 CREATE INDEX simples). Migrations desde 2026-10 só citam CONCURRENTLY em comentário (20261113181500:14). Lint: grep -i concurrently scripts/check-migrations.mjs → 0.| cético: Statements ativos com CONCURRENTLY só em 20260104144318_performance_indexes.sql (18) e 20260104170152_additional_indexes.sql (6); nas migrations de 2026-10 e 2026-11 a palavra só aparece em comentário (0 statements). grep -i concurrently scripts/check-migrations.mjs → 0 resultados (FORBIDDEN_LITERALS em :33-36 não cobre).

### F0172 · CREATE POLICY IF NOT EXISTS corrigido em 20260530000002

- **Tipo:** Doc/config
- **O que os docs afirmam:** P055 P: ainda 1 arquivo.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:153`
- **O que falta:** Migration nova idempotente (DO $$ … pg_policies …) para as policies restantes, ou registrar o arquivo como não-replayável.
- **Evidência:** supabase/migrations/20260530000002_enable_rls_and_remove_env_risk.sql:50-82 ainda tem 10 'CREATE POLICY IF NOT EXISTS' (sintaxe inexistente no Postgres); é o único arquivo com isso (grep -rl → 1). Nenhuma correção do arquivo; migração histórica não pode ser editada (docs/SCHEMA_CONVENTIONS.md:52). A nova supabase/migrations/20261119700000_fix_rls_sales_activities_using_true.sql:3-25 faz DROP POLICY IF EXISTS das 4 policies abertas que ela criou (sales/activities), mas não trata as outras 6 nem o replay do arquivo. docs/auditoria/.../A_planos_execucao.md:153 continua 'P — Corrigir'.| cético: grep -c 'CREATE POLICY IF NOT EXISTS' supabase/migrations/20260530000002_enable_rls_and_remove_env_risk.sql → 10; é o único arquivo com isso (grep -rl → 1). Isso bate com a fonte P055 ('P: ainda 1 arquivo').

### F0175 · Data dictionary com lineage

- **Tipo:** Doc/config
- **O que os docs afirmam:** Falta dicionário de dados com linhagem.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:156`
- **O que falta:** Linhagem (produtor/consumidor por tabela) no dicionário e COMMENT ON sistemático.
- **Evidência:** Gap em docs/GAPS_CLASSE_MUNDIAL.md:156. Existe docs/DATA_DICTIONARY.md (gerado por scripts/gen-data-dict.mjs:3-21 a partir das migrations) com 393 tabelas, mas sem linhagem/origem (grep -iE 'lineage\|linhagem\|origem' docs/DATA_DICTIONARY.md → 0). Comentários no banco real: 35 de 4476 colunas e 7 de 408 tabelas (snapshot.json db.columns/tables comment).| cético: docs/DATA_DICTIONARY.md existe (gerado por scripts/gen-data-dict.mjs), mas grep -ciE 'lineage\|linhagem' docs/DATA_DICTIONARY.md → 0.

### F0176 · Decisão de arquivamento para 302/397 tabelas vazias e views

- **Tipo:** Doc/config
- **O que os docs afirmam:** NÃO VERIFICÁVEL (operacional): 20261001203300 documenta com COMMENT/REVOKE.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:282`
- **O que falta:** Decisão formal (manter/arquivar/dropar, owner e prazo) para as candidatas e views vazias, registrada em docs/DEAD_TABLES.md.
- **Evidência:** supabase/migrations/20261001203300_deny_dead_tables_revoke_anon_grants.sql:1-40 trata só 4 tabelas (1 COMMENT ON TABLE webhook_events, REVOKE, DROP cadence_enrollments); aplicada em produção (contexto/supabase/migrations.md:628). docs/DEAD_TABLES.md:22-50 lista 22 candidatas 'sob observação', sem decisão. docs/auditoria/.../C_estado_runbooks.md:282 mantém 'Decisão de arquivamento' pendente; grep -rn arquivamento docs (fora de auditoria) → só BACKEND_DEEP_AUDIT. Nenhuma decisão para as ~302 tabelas vazias/16 views.| cético: docs/DEAD_TABLES.md:12 diz 'As demais candidatas seguem sob observação'; as 22 da lista A (:19-45) não têm decisão de arquivamento. 20261001203300 trata poucas tabelas.

### F0178 · Dicionário de dados gerado por scripts/gen-data-dict.mjs a partir das migrations

- **Tipo:** Doc/config
- **O que os docs afirmam:** O doc afirma ser gerado por `scripts/gen-data-dict.mjs` varrendo `supabase/migrations/*.sql` em ordem, refletindo o último estado declarado (guards IF EXISTS/to_regclass não avaliados) e regenerável com `node scripts/gen-data-dict.mjs`.
- **Fontes:** `docs/DATA_DICTIONARY.md:1-8`
- **O que falta:** Corrigir o regex de scripts/gen-data-dict.mjs:168 para ignorar ALTER PUBLICATION … DROP TABLE, regenerar e commitar DATA_DICTIONARY.md e ER.md, e adicionar checagem de drift no pr-checks.yml.
- **Evidência:** scripts/gen-data-dict.mjs existe (lê supabase/migrations em :19, escreve docs/DATA_DICTIONARY.md :20/:224 e docs/ER.md :21). Rodou sem erro em cópia: 'DATA_DICTIONARY.md: 407 tabelas · ER.md: 40 entidades, 69 FKs'. Versionado em HEAD: docs/DATA_DICTIONARY.md:8 'Total: **393 tabelas**'; diff regenerado × HEAD = 10727 linhas (DATA_DICTIONARY) e ER.md também difere → drift.| cético: Regenerei numa cópia: 'DATA_DICTIONARY.md: 407 tabelas · ER.md: 40 entidades, 69 FKs', contra docs/DATA_DICTIONARY.md:8 versionado 'Total: **393 tabelas**' (drift). O banco real tem 408 tabelas, e mesmo a regeneração erra: o regex de scripts/gen-data-dict.mjs:168 /DROP\s+TABLE…/ casa 'ALTER PUBLICATION supabase_realtime DROP TABLE public.x' (supabase/migrations/20260402110955_63a1a5c4-4145-43a6-a810-93c6e580e74e.sql:2-3) e apaga do dicionário tabelas que existem. Ausente: grep gen-data-dict .github/workflows → …

### F0179 · Dicionário omite 19 tabelas existentes no banco real

- **Tipo:** Doc/config
- **O que os docs afirmam:** Comparação mecânica: tabelas presentes no snapshot real e ausentes do dicionário: _internal_secrets, app_config, consent_records, daily_challenge_rotations, data_retention_policies, data_subject_requests, edge_call_failures, edge_job_locks, geo_access_logs, geo_blocked_regions, geocode_cache, integration_secret_refs, plan_rollback_ddl, score_change_logs, security_alert_history, stage_probabilities, status_transitions, webhook_allowed_domains, webhook_dispatch_rate. Indica que o gerador não captura DDL dinâmico/EXECUTE ou que migrations recentes não foram processadas.
- **Fontes:** `docs/DATA_DICTIONARY.md:10-404`
- **O que falta:** Corrigir o regex de scripts/gen-data-dict.mjs:168 (exigir início de statement, excluir ALTER PUBLICATION) e só então regenerar e commitar docs/DATA_DICTIONARY.md; regenerar sem corrigir deixa 2 das 19 de fora.
- **Evidência:** Confirmado: as 19 tabelas têm 0 ocorrências em docs/DATA_DICTIONARY.md (HEAD) e existem no banco real (contexto/supabase/tables.md, 19/19) e nas migrations (CREATE TABLE em supabase/migrations, ex.: 20261001214000_app_config_sla_xp.sql:15). Regeneração do dicionário (scripts/gen-data-dict.mjs) já as inclui (app_config, consent_records, edge_job_locks, geocode_cache presentes no output regenerado) — a causa é doc defasado, não DDL dinâmico.| cético: Refuta a causa apontada pelo verificador ('doc defasado; regenerar resolve'). Regenerei com node scripts/gen-data-dict.mjs numa cópia: 17 das 19 tabelas ganham seção '### `<tabela>`', mas score_change_logs e security_alert_history continuam com 0 ocorrências. As duas existem no banco real e em supabase/schema.sql:4581 e :4623, e são criadas em supabase/migrations/20260330135126_2e3c42f1-5cc7-4566-8e0b-2196a312249f.sql:24 e 20251214122159_c7e9…

### F0181 · docs/DEAD_TABLES.md alinhado com estado real das tabelas mortas

- **Tipo:** Doc/config
- **O que os docs afirmam:** O doc diverge de docs/DEAD_TABLES.md (24 candidatas): entram entity_versions, migration_log, active_sessions, user_2fa*, session_activity, deal_risk_signals, report__, embedded_report_tokens, cohort_analyses, call_metric_benchmarks, coaching_scorecard_config, enriched_company_intelligence, person_intelligence, data_subject_requests; saem cadence_ab_assignments, price_protection_rules, website_visitor_logs, webhook_inbound_log, competitors_pricing, webauthn__.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:59-61`
- **O que falta:** Retirar competitors_pricing e call_tracking da lista A e reavaliar as candidatas reais com 0 consumidores (entity_versions, deal_risk_signals, cohort_analyses etc.).
- **Evidência:** docs/DEAD_TABLES.md:1-50 (revisão 2026-10-18) lista 22 candidatas A + webauthn_* marcadas VIVAS. Grep real em src/ e supabase/functions (excluindo types.ts): 21/22 candidatas A com 0 arquivos, mas competitors_pricing é lida em supabase/functions/pricing-intelligence/index.ts:288 (viva, deveria sair). Das que F_banco_dados.md:59-60 diz que 'entram': active_sessions é usada em src/hooks/useSessionManagement.ts:48-224 e data_subject_requests em src/hooks/admin/useDataSubjectRequests.ts:51-113 (não são mortas); entity_versions, migration_log, session_activity, deal_risk_signals, embedded_report_tokens, cohort_analyses, call_metric_benchmarks, coaching_scorecard_config têm 0 arquivos (candidatas reais não listadas em A). call_tracking segue listada mas não existe no banco (tables.md → 0).| cético: docs/DEAD_TABLES.md:19-45 mantém competitors_pricing na lista A, mas ela é lida em supabase/fun…

### F0188 · ER.md gerado pelo mesmo script, mostra as 40 tabelas mais conectadas

- **Tipo:** Doc/config
- **O que os docs afirmam:** O doc afirma ser gerado por scripts/gen-data-dict.mjs, exibir as 40 tabelas com mais FKs e as FKs entre elas (diagrama mermaid erDiagram).
- **Fontes:** `docs/ER.md:1-7`
- **O que falta:** Regenerar e commitar docs/ER.md e docs/DATA_DICTIONARY.md; criar gate de drift no CI (ou script npm). A renderização do mermaid não foi testada.
- **Evidência:** Gerador existe: scripts/gen-data-dict.mjs:21 (OUT_ER), :226-274 (bloco ER, TOP = 40 em :242, `erDiagram` em :250). docs/ER.md:1-7 declara o gerador e :8-9 abre o bloco mermaid; o bloco tem 40 entidades distintas (awk/sort -u). Porém o arquivo versionado está desatualizado: `node scripts/gen-data-dict.mjs` → saída 'ER.md: 40 entidades, 69 FKs' e `git diff --stat docs/ER.md` = 73 linhas alteradas (adiciona TERRITORIES/TERRITORY_HISTORY, remove AGENDA_EVENTS/APPROVAL_REQUESTS/LEAD_ASSIGNMENTS); DATA_DICTIONARY.md diverge em 9.854 linhas. Arquivos restaurados com git checkout após o teste. Renderização mermaid não testada (sem renderizador no ambiente).| cético: O gerador existe: scripts/gen-data-dict.mjs:21 (OUT_ER), :242 (`TOP = 40`), :250 (`erDiagram`), :272 (grava). docs/ER.md:3-5 declara o gerador e :7-8 abrem o bloco mermaid. O critério 'regenerar produz ER.md idêntico' falha: rodei `…

### F0190 · Etapa 15 do plano: Definir fonte de verdade das migrations

- **Tipo:** Doc/config
- **O que os docs afirmam:** Escolher ledger canônico e política para 592 arquivos versus 2.354 entradas. Saída esperada: ADR de migrations. Gate: decisão de arquitetura.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:674-674`
- **O que falta:** Escrever docs/decisions/ADR-011 com a fonte de verdade das migrations (ledger = supabase_migrations.schema_migrations do usyxfpqlsspldubptrdl; supabase/migrations/ = histórico) e referenciá-lo no STATUS:138.
- **Evidência:** ADR de migrations não existe: `ls docs/adr` → diretório ausente; docs/decisions/ tem ADR-001..010 e nenhum trata de ledger/fonte de verdade de migrations (ADR-003/009/010 só citam a palavra 'migration'). docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:138 mantém a etapa 15 em 🔶 pendente. A política existe de fato, mas fora de ADR: AGENTS.md §7 (DDL via db_query, arquivo em supabase/migrations/, versão crescente, `npm run check:migrations`), docs/ZERO_DOWNTIME_MIGRATIONS.md:33-37 e scripts/check-migrations.mjs (nome, versão duplicada/não crescente, RLS, literais proibidos). O par '592 arquivos vs 2.354 entradas' refere-se ao ledger da origem (outro projeto), fora do escopo deste repo por AGENTS.md §7.| cético: Não existe ADR de migrations: `ls docs/adr` → diretório ausente; docs/decisions/ tem só ADR-001..010 sem ledger/fonte de verdade; `grep -rliE 'ledger can[oô]nico\|fonte de verdade.*…

### F0196 · Etapa 3 do plano: Confirmar a função de cada projeto

- **Tipo:** Doc/config
- **O que os docs afirmam:** Decidir formalmente se origem é catálogo compartilhado e destino é CRM separado ou se deveria haver réplica/migração. Saída esperada: ADR de topologia. Gate: decisão do proprietário.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:659-659`
- **O que falta:** Formalizar o ADR de topologia (destino = único banco do CRM; papel do banco externo acessado por external-db-bridge) e atualizar o STATUS:121.
- **Evidência:** ADR de topologia ausente: `grep -rliE topologia docs` só retorna o plano (AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:659), STATUS_100_ETAPAS_2026-08-30.md:121 (🔶 'Aguarda decisão') e A_planos_execucao.md; docs/decisions/ADR-001..010 não tratam de topologia. A decisão foi tomada de fato em AGENTS.md §7: 'Supabase Cloud usyxfpqlsspldubptrdl... Nenhum outro Supabase (VPS AtomicaBR etc.) é deste repo', mas sem ADR formal.| cético: Não existe ADR de topologia: `grep -rliE topologia docs` → só o plano, STATUS_100_ETAPAS_2026-08-30.md:121 (🔶 'Aguarda decisão'), A_planos_execucao.md e SECURITY_HARDENING.md (sem ADR). docs/decisions/ADR-001..010 não tratam do assunto. A decisão existe de fato em AGENTS.md §7 ('Nenhum outro Supabase ... é deste repo'), mas o código ainda tem ponte para um banco externo: supabase/functions/external-db-bridge/index.ts:196-197 (EXTERNAL_SUPABASE_URL), func…

### F0198 · Etapa canônica 26/08 nº 15: Definir fonte de verdade das migrations (ADR)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa canônica 15 (plano 26/08, matriz de status 30/08, estado 🔶): ledger canônico; 592 arquivos vs 2.354 entradas citados em 26/08; insumo atual 595/586.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:138-138`
- **O que falta:** Criar o ADR em docs/decisions/ e referenciá-lo em check-migrations.mjs e no STATUS:138.
- **Evidência:** Mesmo artefato do F0190: `ls docs/adr` → ausente; docs/decisions/ sem ADR de migrations; docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:138 em 🔶. check:migrations (scripts/check-migrations.mjs) aplica regras de nome, versão estritamente crescente contra a base, RLS em CREATE TABLE e literais proibidos (fail() em :74-179), mas não codifica 'ledger canônico'. A política operacional está em AGENTS.md §7 e docs/ZERO_DOWNTIME_MIGRATIONS.md:33-37.| cético: Mesmo artefato do F0190: `ls docs/adr` → diretório ausente; nenhum ADR de migrations em docs/decisions/; STATUS_100_ETAPAS_2026-08-30.md:138 em 🔶 ('Insumo repo-local pronto: 595 arquivos / 586 versões'). scripts/check-migrations.mjs aplica regras de nome, versão, RLS e literais, mas não tem regra de ledger canônico: `grep -nE 'schema_migrations\|ledger' scripts/check-migrations.mjs` → 0 resultados.

### F0205 · Guards de idempotência obrigatórios (to_regclass, IF NOT EXISTS, IF EXISTS, ON CONFLICT)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Toda migration reexecutável sem erro.
- **Fontes:** `docs/ZERO_DOWNTIME_MIGRATIONS.md:35-36`
- **O que falta:** Lint em scripts/check-migrations.mjs que reprove CREATE sem IF NOT EXISTS ou OR REPLACE e DROP sem IF EXISTS nas migrations novas.
- **Evidência:** Regra documentada em docs/ZERO_DOWNTIME_MIGRATIONS.md:35-36. Migrations recentes seguem (contagem de `if not exists\|if exists\|to_regclass\|on conflict\|or replace` nas 8 últimas: 3,4,2,3,3,1,1,6; as com 1 são só `CREATE OR REPLACE FUNCTION`, idempotente — 20261117200000_...sql:32, 20261117210000_...sql:20). Porém não há lint automatizado: `grep -nE 'IF NOT EXISTS\|IF EXISTS\|to_regclass\|ON CONFLICT\|idempot\|guard' scripts/check-migrations.mjs` → 0 resultados; o script só valida nome/versão/duplicata/RLS/literais proibidos (fail() em :74-179).| cético: A regra está em docs/ZERO_DOWNTIME_MIGRATIONS.md:35-36, mas não há gate: `grep -nEi 'IF NOT EXISTS\|IF EXISTS\|to_regclass\|ON CONFLICT\|idempot\|guard' scripts/check-migrations.mjs` → 0 resultados; nenhum outro script de migrations em scripts/ (`ls scripts \| grep -iE 'migra\|idemp'` → só check-migrations.mjs); `grep -rnEi idempot .gi…

### F0206 · Handoff P010: Baseline imutável de código, schemas, grants, policies, jobs e contagens

- **Tipo:** Doc/config
- **O que os docs afirmam:** Fila canônica do handoff (onda 1): Baseline imutável de código, schemas, grants, policies, jobs e contagens. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:286-286`
- **O que falta:** Designar um commit da branch contexto como baseline P010 (registrar o SHA no handoff:286), com contagens exatas (count(*)) das tabelas.
- **Evidência:** Não existe baseline imutável com hash: `ls docs/auditoria| grep -i baseline` → 0 resultados; `grep -oE '"(sha\|hash\|commit\|...)"' inventario/estado/banco.json` → 0 resultados; handoff mantém `- [ ] P010` (docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:286). Existe inventário versionado e regenerável: inventario/estado/{banco,rotas,edges}.json gerados por scripts/inventario/gerar-*.mjs via .github/workflows/inventario-estado-semanal.yml:24,70,74 (semanal), mais snapshot da branch contexto (policies.md, grants.md, cron.md, stats.md) — cobre código/schemas/grants/policies/jobs/contagens, mas é mutável e sem hash/data congelada. \| cético: O snapshot existe e é mais versionado do que o verificador disse. A branch `contexto` tem 514 commits sem force-push (.github/workflows/contexto.yml:426, `git push` simples) com schemas, grants, policies, cron e stats (contexto/supab…

### F0207 · Handoff P024: Validar retenção dos sete conjuntos históricos menores no destino

- **Tipo:** Doc/config
- **O que os docs afirmam:** Fila canônica do handoff (onda 3): Validar retenção dos sete conjuntos históricos menores no destino. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:310-310`
- **O que falta:** Política e job de retenção para public.notifications e public.cron_failure_alerts (ou exclusão consciente registrada em docs/DATA_RETENTION.md), mais evidência por conjunto.
- **Evidência:** Retenção existe para parte dos conjuntos: docs/DATA_RETENTION.md:30-43 + tabela public.data_retention_policies (contexto/supabase/tables.md:118, RLS sim) + cron 45 `data-retention-purge-daily` → fn_apply_data_retention (cron.md:34; corpo lê data_retention_policies, functions/public/fn_apply_data_retention__12ae32cb1ec02d01.sql:16-17); rollback via cron 14 `purge-rollback-snapshots-daily` (cron.md:18); error_logs no 90d (DATA_RETENTION.md:37); maintenance_log excluído de propósito (DATA_RETENTION.md:43). Faltam: public.cron_failure_alerts (~1.6k linhas, stats.md:28) e public.notifications sem política nem job — `grep -rnE 'cron_failure_alerts\|notifications'` em cron.md e functions/public/fn__purge_/cleanup* → 0 resultados; nenhuma 'política e evidência por conjunto' (saída da etapa 24, AUDITORIA 30/08:676); handoff:310 continua `- [ ]`.| cético: Retenção parcial confirmada. Jobs de purg…

### F0211 · Handoff P028: Owner às 304 tabelas vazias

- **Tipo:** Doc/config
- **O que os docs afirmam:** Fila canônica do handoff (onda 3): Owner às 304 tabelas vazias. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:314-314`
- **O que falta:** Catálogo com owner (e prazo) por tabela vazia: acrescentar a coluna em docs/DEAD_TABLES.md ou criar doc novo cobrindo as tabelas com 0 linhas (stats.md do snapshot).
- **Evidência:** docs/DEAD_TABLES.md:1-26 existe (gerado 2026-10-01; 397 tabelas, 54 sem referência, lista A de candidatas) e migration supabase/migrations/20261001203300_deny_dead_tables_revoke_anon_grants.sql documenta tabelas mortas. Porém não há coluna/atribuição de owner: grep -in 'owner\|respons' docs/DEAD_TABLES.md → 0 resultados. A_planos_execucao.md:132 confirma 'P ... falta Owner e prazo'.| cético: Confirmado. docs/DEAD_TABLES.md:1-17 existe, mas o critério dele é 'sem referência no código' (54 tabelas), não 'tabelas vazias' (304), e grep -niE 'owner\|respons' docs/DEAD_TABLES.md → 0. Não há catálogo com owner por tabela.

### F0213 · Handoff P050: Runbook de manutenção, refresh de MVs, vacuum/analyze e limites de queries

- **Tipo:** Doc/config
- **O que os docs afirmam:** Fila canônica do handoff (onda 5): Runbook de manutenção, refresh de MVs, vacuum/analyze e limites de queries. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:346-346`
- **O que falta:** Criar docs/runbooks/manutencao-banco.md (refresh de mv_competitive_ranking, vacuum/analyze, limites de query) e corrigir ou aposentar refresh_materialized_views/reindex_tables, que apontam para MVs inexistentes; criar cron se a manutenção for desejada.
- **Evidência:** Funções existem no banco: public.refresh_materialized_views (snapshot functions.md:318) e public.reindex_tables (functions.md:322). Mas (a) nenhum cron as chama: snapshot cron.md (45 jobs) → grep -ci 'mv_\|materialized\|vacuum\|reindex' → 0; (b) refresh_materialized_views referencia mv_sales_performance, mv_monthly_revenue, mv_product_performance, mv_client_ltv, mv_pipeline_health (functions/public/refresh_materialized_views__12ae32cb1ec02d01.sql:6-10) e a única MV no banco é public.mv_competitive_ranking (views.md:398) — a função falharia; (c) não há runbook: docs/runbooks/ não tem arquivo de manutenção e grep -rn 'refresh_materialized_views\|vacuum\|reindex' docs/runbooks docs/agentes → 0; docs/RUNBOOK.md só menciona 'refresh token' (:151). A_planos_execucao.md:148 marca 'P ... Refresh de MV e vacuum medidos' pendente.| cético: Confirmado. snapshot functions/public/refresh_materialize…

### F0221 · Justificativa por função das 30 SECURITY DEFINER anon

- **Tipo:** Doc/config
- **O que os docs afirmam:** P035 P: ADR-008.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:136`
- **O que falta:** Reescrever ADR-008 com a lista real das 9 funções (justificar ou revogar EXECUTE de anon via migration) e remover as já revogadas.
- **Evidência:** docs/decisions/ADR-008-anon-executable-security-definer.md:11-19 justifica ~12 funções e :22 fala em '11 funções' — não 30. O ADR está defasado em relação ao banco: as funções que ele justifica já não têm EXECUTE para anon (snapshot functions.md: check_rate_limit, is_ip_blocked, get_embedded_report_by_token, count_failed_login_attempts, generate_device_fingerprint → grants 'authenticated, service_role'), enquanto as 9 SECURITY DEFINER hoje executáveis por anon (snapshot lints.md, código rpc_anon_executable: get_current_salesperson_id, get_login_lockout_status, get_user_role, has_role, is_admin_or_manager ×2, is_country_blocked, is_email_opted_out, record_failed_login_attempt) só têm is_country_blocked coberta pelo ADR.| cético: Confirmado. docs/decisions/ADR-008-anon-executable-security-definer.md:9 fala em '11 funções' e :11-19 lista check_rate_limit, count_failed_login_attempts, is_ip…

### F0223 · Ledger remoto: 256 entradas, 252 com SQL local correspondente, 133 sem nome; 4 entradas recentes sem SQL integral

- **Tipo:** Doc/config
- **O que os docs afirmam:** Doc: 608 arquivos locais, 595 versões únicas; ledger remoto 256; entradas 20260902120000/121000/180000 e 20260904190000 sem statements.
- **Fontes:** `docs/auditoria/VALIDACAO_SINCRONIA_GITHUB_SUPABASE_2026-09-10.md:93-110`
- **O que falta:** Registrar em doc a decisão de não guardar statements (ou passar a gravá-los) e marcar as 4 entradas citadas como resolvidas por decisão.
- **Evidência:** Reconciliação ledger×repo feita e documentada: snapshot supabase/migrations.md 700 versões = 700 arquivos (0 divergências); migrations 20261117080000_remove_versoes_orfas_do_ledger.sql e 20261117090000_marca_594_migrations_como_aplicadas.sql explicam a reconstrução. Porém a coluna statements continua vazia: 686/700 entradas com 'statements = 0' no snapshot (grep -cE '\\| 0\|$'), incluindo 20260902121000, 20260902180000, 20260904190000 e todas as 20261117* (só 20261119700000 tem 2). docs/agentes/replay-do-repo-261117.md:356-358 e supabase/schema.sql:36592-36594 declaram a omissão de statements como intencional ('a CLI casa por version'). \| cético: Confirmado. Snapshot migrations.md: grep -cE '\\| 0 \\|$' → 686 de 700 entradas com statements=0. Os 700 registros do ledger batem com os 700 arquivos (comm -3 → 0). A omissão de statements só aparece justificada em comentário de supabase/sche…

### F0226 · Ledger vivo com 242 versões (20260511141832..20260802150910) vs 595 SQLs locais

- **Tipo:** Doc/config
- **O que os docs afirmam:** Ledgers vivos idênticos: 242 versões; repositório contém 595 SQLs; diretório local não é sequência replayável equivalente.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:475-484`
- **O que falta:** Declarar formalmente que o replay do diretório não é objetivo, ou tornar as migrations replayáveis e criar job de replay no CI; falta também a classificação por arquivo (aplicado/preparatório/legado).
- **Evidência:** O estado '242 vs 595' foi superado: snapshot supabase/migrations.md tem 700 versões, iguais aos 700 arquivos (comm → 0); as 241 versões legadas estão em scripts/db-audit/legacy-ledger-versions.txt e foram removidas por 20261117080000_remove_versoes_orfas_do_ledger.sql. Mas o critério 'replay em banco efêmero verde' não é atendido: docs/agentes/replay-do-repo-261117.md:9 '271 arquivos falham, 377 erros', :109 'Tornar o repo replayável é um projeto com escopo próprio'; supabase/schema.sql:6-9 confirma 'as 692 migrations ... NAO replayam'. ausente: classificação por arquivo (aplicado/preparatório/legado) — grep -rn 'preparat' docs/agentes docs/execucao → 0.| cético: Confirmado. supabase/schema.sql:6-9 diz que as migrations 'NAO replayam (271 arquivos falham)'. Não há job de replay em Postgres efêmero no CI: grep -rn 'schema.sql' .github/workflows → só o comentário de contexto.yml:187. O le…

### F0228 · MAINT-01 V2: migrations acumulam 19.493 arquivos — consolidar baseline

- **Tipo:** Doc/config
- **O que os docs afirmam:** Afirma 19.493 arquivos em supabase/migrations/ (número inconsistente com 432 do relatório anterior) e pede baseline para reduzir CI ~30%.
- **Fontes:** `docs/reports/BACKEND_DEEP_AUDIT_V2_2026-07-11.md:73-73`
- **O que falta:** Corrigir o número no relatório e registrar a decisão sobre consolidar (ou não) as migrations.
- **Evidência:** A contagem afirmada é falsa: ls supabase/migrations| wc -l → 700 arquivos .sql (não 19.493); docs/reports/BACKEND_DEEP_AUDIT_V2_2026-07-11.md:73 só registra a intenção. Baseline existe como supabase/schema.sql (commit da0c2a1 2026-11-17, #548), mas não consolidou nada: os 700 arquivos permanecem (do 20241231000000 ao 20261119700000) e o CI (pr-checks.yml:187, deploy.yml:106) continua varrendo o diretório inteiro; não há supabase/migrations/baseline* (ls → 0). \| cético: Confirmado. ls supabase/migrations \| wc -l → 700 (não 19.493). Não existe supabase/migrations/baseline*. supabase/schema.sql existe, mas não consolidou nada: os 700 arquivos continuam lá, e ele está defasado (F0214).

### F0229 · MAINT-03: baseline.sql consolidando migrations antigas

- **Tipo:** Doc/config
- **O que os docs afirmam:** Consolidar migrations pré-2026 em baseline.sql via pg_dump --schema-only.
- **Fontes:** `docs/reports/BACKEND_DEEP_AUDIT_2026-07-11.md:160-162`
- **O que falta:** Arquivar as migrations antigas com baseline registrada no ledger, ou marcar MAINT-03 como substituído por supabase/schema.sql.
- **Evidência:** ausente: ls supabase/migrations| grep -i baseline → 0; não existe supabase/migrations/baseline.sql. O que existe é supabase/schema.sql (37.323 linhas, montado por introspecção de catálogo, não por pg_dump — cabeçalho :2-4), versionado em da0c2a1 (#548). Migrations pré-2026 continuam no diretório (20241231000000_saved_filters.sql, 20250102000001..3) — nada foi removido/arquivado (700 arquivos). \| cético: Confirmado. Não existe supabase/migrations/baseline.sql. O mais próximo é supabase/schema.sql, montado por introspecção (:2-4) e não por pg_dump; as migrations pré-2026 continuam no diretório (o snapshot migrations.md começa em 20241231000000).

### F0233 · Migrations forward-only (nunca editar/apagar aplicada)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Correções em arquivo novo.
- **Fontes:** `docs/ZERO_DOWNTIME_MIGRATIONS.md:42-43`
- **O que falta:** Adicionar ao check-migrations.mjs --base uma regra que falhe quando um arquivo já presente na base for modificado ou apagado (status M/D no diff) e registrar as exceções históricas em docs/ZERO_DOWNTIME_MIGRATIONS.md.
- **Evidência:** Regra documentada em docs/ZERO_DOWNTIME_MIGRATIONS.md:42-43 e o histórico é quase todo aditivo, mas há uma violação: git log --diff-filter=M -- supabase/migrations → 1 arquivo, commit cf25752 2026-11-17 'fix(db): cria _internal_secrets antes de usa-la na migration de 15/07 (#542)' editou supabase/migrations/20260715184427_8e4ec70a-caf2-4a8d-9042-e26e29fa3a54.sql (+13 linhas), versão que consta no ledger como aplicada (snapshot migrations.md). A mensagem justifica ('No-op em producao', replay cronológico), mas contraria 'nunca editar aplicada'. Além disso 15 arquivos foram renomeados em 2026-10-01 (docs/execucao/MIGRATION_RENAME_MAP.md).| cético: Veredito mantido, mas a evidência do verificador ('1 arquivo editado') está errada; a violação é bem maior. git log --diff-filter=M --name-only -- supabase/migrations \| sort -u → 12 arquivos editados em 19 commits (ex.: cf25752e7 2026-11-17, 89…

### F0234 · Migrations forward-only sem rollback de schema

- **Tipo:** Doc/config
- **O que os docs afirmam:** Doc aponta zero migrations down; só docs/ROLLBACK.md genérico e snapshots de dados.
- **Fontes:** `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:115`
- **O que falta:** Definir procedimento testado de rollback de schema: exigir no template de PR (.github/pull_request_template.md) um bloco 'reversão' com SQL para DDL crítica, ou adotar migrations down (ex.: supabase/migrations_down/<versao>.sql) e um teste em Postgres efêmero; atualizar docs/ROLLBACK.md §2 apontando para supabase/schema.sql e para a ausência de PITR.
- **Evidência:** Não há migrations down: ls supabase/migrations| grep -iE 'down\|rollback\|revert' → só nomes não relacionados (fix_sync_quote_no_status_downgrade, agent_runs_r3_rls_lockdown). docs/ROLLBACK.md:11-18 é genérico (apontar para Dashboard→Backups ou 'fix migration'). O que existe de concreto é snapshot de DADOS, não de schema: tabela public.db_rollback_snapshots (snapshot tables/public/db_rollback_snapshots.md, RLS sim, 1 policy) alimentada pelo cron id 13 capture-rollback-snapshot-5min → public.admin_capture_rollback_snapshot() e purgada por id 14 (cron.md). supabase/schema.sql:7-8 afirma que 'o projeto nao tem PITR nem backup restauravel listado' e se posiciona como rede de segurança do schema (restauração testada em docs/agentes/replay-do-repo-261117.md), mas isso não é rollback de uma alteração específica. \| CONTESTADO pelo cético (NAO_IMPLEMENTADO): Não há rollback de schema, nem de da…
- **Revisão:** em disputa. O cético propõe Não implementado e o juiz ainda não decidiu.

### F0240 · Migrations sobre tabelas nunca criadas (deals, notes, users, leads) e reconstrução do banco do zero

- **Tipo:** Doc/config
- **O que os docs afirmam:** Migrations alteram deals, notes, users, leads inexistentes (mig/20251228000001:18, 20260104165753:5, 20260104210000:2, 20260105000003, 20260903000001:3); o repo não reconstrói o banco.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:267,307-311`
- **O que falta:** Faltam três coisas: `supabase db reset` sem erro, ou baseline oficial; schema.sql regenerado automaticamente; e as migrations fantasmas neutralizadas.
- **Evidência:** Problema confirmado: supabase/migrations/20251228000001_add_soft_delete.sql:18, 20260903000001_enable_rls_leads.sql:3 alteram deals/leads inexistentes; replay falha em 271 arquivos (docs/agentes/replay-do-repo-261117.md:8-10). Reconstrução do zero passou a existir por outro caminho: supabase/schema.sql (37323 linhas, introspecção do banco oficial, cabeçalho linhas 1-8, commit da0c2a116 PR #548 em 17/11) com restauração testada: 5329 objetos em produção = 5329 restaurados (replay-do-repo-261117.md:162-176). `grep -ciE 'INSERT INTO\|COPY '` no schema.sql → 0.| cético: Confirmo PARCIAL. Hoje a reconstrução depende só de supabase/schema.sql (cabeçalho, linhas 6-9: 'As 692 migrations ... NAO replayam'). Agravante: schema.sql é de 17/11 (commit da0c2a116) e já diverge da produção. schema.sql:31543-31546 ainda cria 'Admins can view webhook logs' lendo auth.users, enquanto produção tem a versão…

### F0242 · Owner e prazo das 304 tabelas vazias (DEAD_TABLES)

- **Tipo:** Doc/config
- **O que os docs afirmam:** P028 P: DEAD_TABLES.md; 20261001203300.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:132`
- **O que falta:** Owner e prazo por tabela, cobrindo as 304 tabelas vazias e não só as candidatas sem referência.
- **Evidência:** docs/DEAD_TABLES.md existe (91 linhas, gerado 2026-10-01, 54 candidatas sem referência, linhas 1-16 e tabela A) e a migration supabase/migrations/20261001203300_deny_dead_tables_revoke_anon_grants.sql existe e está aplicada (contexto/supabase/migrations.md:628). Porém sem owner nem prazo por tabela: `grep -ciE 'owner\|respons' docs/DEAD_TABLES.md` → 0; `grep -niE 'prazo'` → só o critério genérico de 30 dias (linha 13-16). docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:132 marca P.| cético: docs/DEAD_TABLES.md existe. A migration 20261001203300 está no ledger (contexto/supabase/migrations.md:628). Mas `grep -ciE 'owner\|respons' docs/DEAD_TABLES.md` → 0, ou seja, não há owner por tabela.

### F0246 · Plano 30/08 etapa 24 (P024): Validar retenção dos sete conjuntos históricos menores no destino

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 24 do plano de 100 etapas (auditoria 30/08; = P024 do handoff): Validar retenção de cron, rollback, erros, manutenção e notificações; política e evidência por conjunto.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:676-676`
- **O que falta:** Faltam a política e o job para notifications, cron_failure_alerts e cron.job_run_details, e a evidência por conjunto em docs/DATA_RETENTION.md.
- **Evidência:** Conjuntos com job: rollback → cron 14 purge-rollback-snapshots-daily (contexto/supabase/cron.md:18, fn_purge_rollback_snapshots deleta db_rollback_snapshots); erros → error_logs 90d em data_retention_policies (supabase/migrations/20261001151000_log_retention_indexes_and_purge.sql:109) aplicado pelo cron 45 data-retention-purge-daily (cron.md:34, fn_apply_data_retention). Sem política: histórico de cron (nenhum job purga cron.job_run_details; inventario/estado/banco.json alerta `historico_cron_sem_limpeza: 206142 linhas com mais de 7 dias`), notifications (`grep -n notifications 20261001151000*.sql` → 0; sem cron), cron_failure_alerts (sem retenção em cron.md/funções). maintenance_log excluído por decisão (docs/DATA_RETENTION.md:41-43).| cético: Confirmo. Rollback tem o cron 14 (contexto/supabase/cron.md:18). Erros têm o cron 45 fn_apply_data_retention (cron.md:34) e o cron 7 (cron.md:11…

### F0250 · Plano 30/08 etapa 28 (P028): Owner às 304 tabelas vazias

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 28 do plano de 100 etapas (auditoria 30/08; = P028 do handoff): Atribuir owner e prazo às tabelas vazias; catálogo vazio intencional × não conectado × abandonado.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:680-680`
- **O que falta:** Owner, prazo e classe (intencional, não conectado ou abandonado) para cada uma das tabelas vazias.
- **Evidência:** Catálogo parcial: docs/DEAD_TABLES.md (54 candidatas sem referência, classe A/B, critério de drop em 30 dias, linhas 1-16) e migration 20261001203300_deny_dead_tables_revoke_anon_grants.sql aplicada (contexto/supabase/migrations.md:628). Não cobre as 304 tabelas vazias nem traz owner (`grep -ciE 'owner\|respons'` → 0) ou prazo por tabela; classificação 'vazio intencional × não conectado × abandonado' ausente. A_planos_execucao.md:132 marca P.| cético: docs/DEAD_TABLES.md existe, mas `grep -ciE 'owner\|respons'` → 0. A migration 20261001203300 está no ledger (migrations.md:628). Não há catálogo com owner por tabela.

### F0252 · Plano 30/08 etapa 50 (P050): Runbook de manutenção, refresh de MVs, vacuum/analyze e limites de queries

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 50 do plano de 100 etapas (auditoria 30/08; = P050 do handoff): Runbook medido, sem jobs genéricos que falhem silenciosamente.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:708-708`
- **O que falta:** Falta o runbook medido (docs/runbooks/manutencao-banco.md). As funções refresh_materialized_views e reindex_tables precisam ser corrigidas ou dropadas, porque falhariam se executadas. Falta refresh agendado para mv_competitive_ranking, se ele for necessário.
- **Evidência:** docs/runbooks/ existe com 16 runbooks (cron-failures.md, wal-health.md, on-call.md etc.) e docs/RUNBOOK.md, mas nenhum cobre refresh de MV/vacuum/analyze: `grep -niE 'vacuum\|materialized\|refresh\|reindex\|analyze' docs/RUNBOOK.md docs/runbooks/*.md` → só 2 linhas irrelevantes (RUNBOOK.md:151 refresh token; race-arena.md:133 EXPLAIN ANALYZE). Funções refresh_materialized_views/reindex_tables só nas migrations 20260104144330/20260104181000, ausentes no banco real (`grep -niE 'refresh_materialized\|reindex\|vacuum' contexto/supabase/functions.md` → 0 relevantes). Nenhum cron de manutenção (grep em cron.md → 0). A_planos_execucao.md:148 marca P.| cético: Mantenho PARCIAL, mas corrijo a evidência: refresh_materialized_views e reindex_tables EXISTEM no banco real (contexto/supabase/functions.md:318 e :322, executáveis por anon e authenticated). Só que estão quebradas. refresh_materialized_v…

### F0253 · Plano 30/08 etapa 51 (P051): Baseline canônico do banco vivo

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 51 do plano de 100 etapas (auditoria 30/08; = P051 do handoff): Gerar baseline canônico após contenções; schema reproduzível sem dados sensíveis.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:712-712`
- **O que falta:** Regenerar o supabase/schema.sql a partir da produção atual. Automatizar essa regeneração, por job agendado ou por um gate que compare o arquivo com o snapshot da branch contexto, para o baseline não ficar para trás a cada migration.
- **Evidência:** O baseline versionado existe: supabase/schema.sql:1-8 foi montado por introspecção do banco oficial no commit da0c2a116 de 17/11/2026, e depois disso o arquivo não teve commit. Ele já divergiu da produção. (1) Em supabase/schema.sql:31543-31544, 'Admins can view webhook logs' vai TO PUBLIC lendo auth.users, mas a produção tem has_role(auth.uid(),'admin') para authenticated (contexto/supabase/policies.md:975), alterada por supabase/migrations/20261117190000_fix_403_policies_lendo_auth_users.sql:30-31. (2) supabase/schema.sql:31560-31561 recria 'Admins can manage webhooks', que supabase/migrations/20261117150000_fix_403_webhooks_policy_morta.sql:52 dropou e que não existe em produção (grep em policies.md → 0). (3) O cabeçalho diz 692 migrations, mas há 700 hoje (`ls supabase/migrations| wc -l` → 700). (4) A regeneração não é automática: .github/workflows/contexto.yml:187-188 mantém PGDUMP…
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Implementado.

### F0254 · Plano 30/08 etapa 52 (P052): Reconciliar 242 entradas do ledger com 595 arquivos SQL

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 52 do plano de 100 etapas (auditoria 30/08; = P052 do handoff): Cada arquivo marcado aplicado, preparatório, legado, inválido ou operacional.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:713-713`
- **O que falta:** Classificação versionada de cada arquivo (aplicado, preparatório, legado, inválido ou operacional).
- **Evidência:** Reconciliação de versões concluída: ledger do banco (contexto/supabase/migrations.md) tem 700 versões e supabase/migrations/ tem 700 arquivos, `comm` → 0 só-ledger e 0 só-arquivo. Artefatos: docs/execucao/MIGRATION_RENAME_MAP.md (15 renomeações, 3 remoções, linhas 1-25), scripts/db-audit/legacy-ledger-versions.txt (241 versões legadas), scripts/db-audit/check-migration-drift.mjs. Não há classificação por arquivo (aplicado/preparatório/legado/inválido/operacional): `ls docs/| grep -i ledger` → 0; grep dos termos em MIGRATION_RENAME_MAP.md → só menções incidentais. A_planos_execucao.md:150 marca P. \| cético: Confirmo: ledger e arquivos estão reconciliados (700 × 700, contexto/supabase/migrations.md). Falta a classificação por arquivo. Há versões com 0 statements no ledger, registradas sem execução, por exemplo migrations.md:443 (20260530000002) e :617, :628. Não existe docs/migrations-le…

### F0259 · Policy 180d: login_attempts, login_alerts, access_denied_logs

- **Tipo:** Doc/config
- **O que os docs afirmam:** Investigação de segurança.
- **Fontes:** `docs/DATA_RETENTION.md:35`
- **O que falta:** Tirar login_attempts e access_denied_logs dos _targets de fn_cleanup_stale_logs (ou desativar o cron 7) e confirmar as 3 linhas com retention_days=180.
- **Evidência:** Linhas 180d semeadas em supabase/migrations/20261001151000_log_retention_indexes_and_purge.sql:112-116 (login_attempts, login_alerts, access_denied_logs), migration aplicada (contexto/supabase/migrations.md:617), tabela com ~20 linhas (contexto/supabase/stats.md:267) e cron 45 data-retention-purge-daily executa fn_apply_data_retention (cron.md:34). Porém o cron 7 cleanup-stale-logs-daily (cron.md:11) chama fn_cleanup_stale_logs(90), que apaga `created_at < now()-90d` em login_attempts e access_denied_logs (corpo da função: _targets linhas 11-21, DELETE linha 27), anulando os 180d em 2 das 3 tabelas. Conteúdo das linhas não visível no snapshot.| cético: Confirmo. As linhas de 180 dias estão semeadas em supabase/migrations/20261001151000_log_retention_indexes_and_purge.sql:112-116. Mas o cron 7 (contexto/supabase/cron.md:11) executa fn_cleanup_stale_logs(90), e o corpo da função (function…

### F0262 · Policy 90d telemetria: query_telemetry, web_vitals_samples, salesperson_performance_telemetry, error_logs, integration_logs, session_activity

- **Tipo:** Doc/config
- **O que os docs afirmam:** Telemetria operacional 90 dias.
- **Fontes:** `docs/DATA_RETENTION.md:37`
- **O que falta:** UPDATE public.data_retention_policies SET ts_column='captured_at' WHERE table_name='salesperson_performance_telemetry' (migration nova) e validar a saída de fn_apply_data_retention().
- **Evidência:** Seed das 6 linhas com 90 dias: supabase/migrations/20261001151000_log_retention_indexes_and_purge.sql:106-111 (aplicada: snapshot migrations.md:617). Porém salesperson_performance_telemetry foi semeada com ts_column='created_at' (:108) e a tabela real NÃO tem essa coluna — só captured_at (snapshot tables/public/salesperson_performance_telemetry.md colunas 1-5). fn_apply_data_retention pula a política quando a coluna não existe ('skipped:missing', functions/public/fn_apply_data_retention__12ae32cb1ec02d01.sql, bloco IF to_regclass/information_schema.columns). Nenhuma outra função de purge cobre essa tabela (purge_old_telemetry targets, purge_telemetry_retention: page_analytics/query_telemetry/web_vitals_samples, enforce_telemetry_retention: sem ela). As outras 5 (query_telemetry, web_vitals_samples, error_logs created_at; integration_logs timestamp; session_activity created_at) têm colun…

### F0268 · Processo de deprecação antes de remover objetos

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 96 NI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:95`
- **O que falta:** Documentar o processo de deprecação para módulos, hooks, edge functions e tabelas: marcação, janela de observação com métrica de uso e lote de remoção aprovado pelo dono (docs/SCHEMA_CONVENTIONS.md ou docs/agentes/).
- **Evidência:** Para DDL existe a disciplina expand-contract: docs/ZERO_DOWNTIME_MIGRATIONS.md:1,6,24-29 ('Contract (remoção)… primeiro parar de escrever/ler, observar, só então dropar'). Não há processo de deprecação para os demais objetos (módulos, hooks, edge functions, tabelas mortas) com janela de observação e aprovação nominal: grep -rni 'deprecia\|deprecação\|deprecat' docs/SCHEMA_CONVENTIONS.md docs/agentes/*.md AGENTS.md → 0 resultados relevantes (único acerto é docs/agentes/migrations-arquivadas-veredicto-261117.md:130, sobre schema 'deprecated'). docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:96-97 mantém etapas 96/97 como NI.| cético: Só há quarentena para DDL: docs/ZERO_DOWNTIME_MIGRATIONS.md:24-29 ('primeiro parar de escrever/ler, observar, só então dropar') e :44-45. Para os demais objetos não há processo: grep -rli 'processo de depreca\|política de depreca\|DEP…

### F0271 · Publicação Realtime com 77 tabelas (69 adicionais ao destino)

- **Tipo:** Doc/config
- **O que os docs afirmam:** A publicação funcional public passa de 8 tabelas na origem para 77 no destino (IA, coaching, forecast, gamificação, pipeline, cadências, Win/Loss); exige owner e medição.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:440-444`
- **O que falta:** Alinhar a publicação aos consumidores reais (adicionar as assinadas, remover ou justificar as que não têm consumidor) e versionar a lista com owner.
- **Evidência:** Publicação real tem 77 tabelas: grep -c '^\| supabase_realtime| public\.' docs/contexto/supabase/realtime.md → 77. Porém não está revisada por consumidor real: 36 tabelas publicadas sem nenhum postgres_changes no front (comm entre tabelas de realtime.md e 'table:' em src → ex.: approval_requests, forecast_snapshots, sales_battles, tournament_matches, v4_callback_dead_letters…) e 13 tabelas assinadas em src que NÃO estão na publicação (ai_agent_actions, approval_workflows, call_recording_ingest_jobs, daily_metrics, email_bulk_drafts, email_bulk_jobs, intent_audit_logs, lead_churn_risk, lead_score_trends, leagues, scheduled_sends, sdr_alert_history, security_alert_history) — essas assinaturas nunca recebem eventos. Versionamento: só 45 migrations com 'ADD TABLE' em supabase/migrations (grep -l) e nenhum doc lista as 77; docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_E…

### F0276 · Regras de migrations: timestamp 14 dígitos, sem CREATE POLICY IF NOT EXISTS, replay em banco limpo, tipos da fonte viva

- **Tipo:** Doc/config
- **O que os docs afirmam:** Protocolo de migrations: timestamp único de 14 dígitos; não usar CREATE POLICY IF NOT EXISTS; não renomear aplicadas; reversão segura; replay completo antes do merge; regenerar tipos da fonte viva.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:209-218`
- **O que falta:** Exigir 14 dígitos nos arquivos novos, rejeitar CREATE POLICY IF NOT EXISTS no check-migrations, criar job de replay em Postgres limpo no pr-checks.yml e documentar as regras em SCHEMA_CONVENTIONS.md.
- **Evidência:** check:migrations existe e roda no CI: package.json:49, .github/workflows/pr-checks.yml:184-189; regras implementadas em scripts/check-migrations.mjs:4-16 (nome ^\d{8,14}_, versão única, não vazia, versão crescente vs base, CREATE TABLE exige RLS, sem literais supabase.co/JWT). Lacunas vs HANDOFF_CLINE…:209-218: (1) NAME_PATTERN aceita 8-14 dígitos (scripts/check-migrations.mjs:30), não exige 14; (2) nenhuma regra proíbe 'CREATE POLICY IF NOT EXISTS' (grep no script → 0) e supabase/migrations/20260530000002_enable_rls_and_remove_env_risk.sql ainda contém a construção; (3) não há replay em banco limpo antes do merge — grep -rli replay .github/workflows → 0; db-probe.yml e migrations-drift.yml só comparam versões/sondas contra produção; (4) tipos da fonte viva: .github/workflows/types-sync.yml existe. docs/SCHEMA_CONVENTIONS.md não menciona POLICY IF NOT EXISTS nem 14 dígitos.| cético: Con…

### F0281 · Retenção de telemetria 90 dias (query_telemetry, web_vitals_samples, salesperson_performance_telemetry)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Tabelas de telemetria purgadas aos 90 dias.
- **Fontes:** `docs/LGPD.md:17`
- **O que falta:** Corrigir ts_column para captured_at em data_retention_policies (migration) e validar.
- **Evidência:** Linhas 90d semeadas: supabase/migrations/20261001151000_log_retention_indexes_and_purge.sql:106-108 (aplicada: snapshot migrations.md:617); tabelas existem com RLS (tables/public/query_telemetry.md, web_vitals_samples.md, salesperson_performance_telemetry.md). query_telemetry e web_vitals_samples são purgadas por fn_apply_data_retention (cron.md:34) e também por purge_telemetry_retention (cron.md:12, job 8) e purge_old_telemetry(90) (cron.md:19, job 15). salesperson_performance_telemetry NÃO é purgada: a política aponta ts_column='created_at' mas a tabela só tem captured_at (tables/public/salesperson_performance_telemetry.md colunas 1-5), e fn_apply_data_retention pula a política ('skipped:missing'); nenhuma das outras funções de purge a inclui (purge_old_telemetry targets; enforce_telemetry_retention; fn_cleanup_stale_logs).| cético: query_telemetry e web_vitals_samples são purgadas po…

### F0283 · Rollback de banco via Dashboard → Backups (depende de plano) ou fix migration

- **Tipo:** Doc/config
- **O que os docs afirmam:** Migration destrutiva → restaurar backup; não destrutiva → migration de correção. DR_PLAN alerta que backup gerenciado depende do plano.
- **Fontes:** `docs/ROLLBACK.md:11-17`
- **O que falta:** Confirmar no dashboard (Database → Backups) o tier e o PITR do projeto e registrar em docs/DR_PLAN.md.
- **Evidência:** Procedimento documentado: docs/ROLLBACK.md:11-17. Backup gerenciado do Supabase: não verificável — snapshot project-config.md: '_Management API desabilitada._' (sem PITR/tier); docs/DR_PLAN.md:3-12 diz 'Confirmar o tier vigente no dashboard' e PITR 'não contratado/evidenciado'. Backup off-site próprio existe e roda: .github/workflows/db-backup.yml (cron 0 3 * * *, :17-18), run 44665111215 de 2026-11-20 03:03 UTC com passos 'pg_dump → artifact' e 'Validar restauração do dump' success (gh api …/actions/runs/44665111215/jobs); passo S3 skipped. DR_PLAN.md:8-11 ('inoperante') está desatualizado.| cético: Procedimento em docs/ROLLBACK.md:11-17. O backup gerenciado e o PITR dependem do painel (project-config.md: Management API desabilitada). Existe backup próprio em .github/workflows/db-backup.yml. Sem evidência nova.

### F0284 · RPCs alteradas mantêm assinatura (parâmetros novos com DEFAULT)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Compatibilidade com código antigo durante janela de deploy.
- **Fontes:** `docs/ZERO_DOWNTIME_MIGRATIONS.md:46-47`
- **O que falta:** Adicionar ao scripts/check-migrations.mjs (regra para arquivo novo) a detecção de CREATE OR REPLACE FUNCTION que acrescente parâmetro sem DEFAULT quando a função já existe na base; ou checklist explícito em .github/pull_request_template.md.
- **Evidência:** Regra documentada: docs/ZERO_DOWNTIME_MIGRATIONS.md:46-47. Amostra recente respeita: supabase/migrations/20261117010000_fix_seasonality_total_value.sql:26,48 e 20261117030000_…:33,55 (mantêm '_months integer DEFAULT 24'); 20261117200000_…:32-34 e 20261117210000_…:20-22 (match_reply_to_enrollment com '_received_at … DEFAULT now()'); 20261027120100_edge_job_lock_lease.sql:34-37 (_request_id text DEFAULT NULL). Porém não há gate automático (scripts/check-migrations.mjs:4-16 não verifica assinaturas) e houve quebra documentada: docs/prod-readiness.md:884 registra PGRST202 em try_edge_job_lock, sync_challenge_progress, award_sale_xp, match_whatsapp_reply_to_enrollment, is_salesperson_active por descompasso entre assinatura do código e do banco até 2026-11-14.| CONTESTADO pelo cético (IMPLEMENTADO): O critério ('amostra de migrations recentes respeita a regra') é atendido. supabase/migrations…
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F0286 · Runbook de manutenção com refresh de MV e vacuum medidos

- **Tipo:** Doc/config
- **O que os docs afirmam:** P050 P: docs/RUNBOOK.md, runbooks/cron-failures.md.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:148`
- **O que falta:** Runbook de manutenção (refresh de mv_competitive_ranking, VACUUM/ANALYZE) com medições de duração/linhas, e cron pg_cron chamando refresh_materialized_views.
- **Evidência:** docs/RUNBOOK.md e docs/runbooks/cron-failures.md existem, mas ausente: grep -n -i 'refresh\|materializ\|vacuum\|matview' docs/RUNBOOK.md docs/runbooks/_.md → 0 resultados (único hit é EXPLAIN ANALYZE em race-arena.md:133, não relacionado). Snapshot cron.md: nenhum job de refresh/vacuum/reindex — só reset-pg-stat-statements-weekly (cron.md:13). functions.md: public.refresh_materialized_views e reindex_tables existem no banco mas sem cron nem trigger chamador (colunas cron/triggers vazias). Tabela public.maintenance_log existe no snapshot (tables/public/maintenance_log.md). A_planos_execucao.md:148 mantém P050 como P.| cético: docs/RUNBOOK.md e docs/runbooks/cron-failures.md existem, mas grep -n -i 'vacuum\|refresh\|materializ' docs/RUNBOOK.md docs/runbooks/_.md → só docs/RUNBOOK.md:151 ('refresh token', não relacionado). Banco real: functions.md:318 public.refresh_materialized_views e :3…

### F0291 · schema.sql seção 10 emite CREATE EXTENSION sem guarda (defeito declarado)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Extensão indisponível no alvo mata o psql na linha 89 com ON_ERROR_STOP=1 — não consertado.
- **Fontes:** `docs/agentes/replay-do-repo-261117.md:435-438`
- **O que falta:** Envolver os CREATE EXTENSION de schema.sql:89-97 (ao menos pg_net e supabase_vault) em DO $$ BEGIN ... EXCEPTION WHEN OTHERS THEN RAISE WARNING ... END $$.
- **Evidência:** supabase/schema.sql:89-97 emite 9x 'CREATE EXTENSION IF NOT EXISTS ... WITH SCHEMA' fora de qualquer BEGIN ... EXCEPTION (ao contrário das seções 92/settings); defeito declarado em docs/agentes/replay-do-repo-261117.md:435-438 ('permanece, declarado e não consertado'). IF NOT EXISTS existe, mas não protege contra extensão indisponível no alvo (pg_net, supabase_vault).| cético: supabase/schema.sql:89-97 emite 9x 'CREATE EXTENSION IF NOT EXISTS ... WITH SCHEMA' fora de BEGIN...EXCEPTION (contraste com :56 e :25666 que têm guarda); defeito declarado e documentado como não consertado em docs/agentes/replay-do-repo-261117.md:435-438.

### F0294 · Snapshot de baseline imutável com hash

- **Tipo:** Doc/config
- **O que os docs afirmam:** P010 P: inventário em VALIDACAO_SINCRONIA §3.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:121`
- **O que falta:** Manifesto versionado com sha256 de supabase/schema.sql e do snapshot completo, congelado como baseline imutável (tag/arquivo).
- **Evidência:** Baseline existe mas sem hash: supabase/schema.sql (dump versionado, commit da0c2a116 #548) não traz hash/manifesto; inventario/estado/ contém banco.json, edges.json, rotas.json (grep -i 'hash\|sha256' inventario/estado/*.json → 0); snapshot da branch contexto docs/contexto/supabase/manifest.json tem apenas gerado_em/gerador/produtor (sem hash). A_planos_execucao.md:121 mantém P010 como P ('Snapshot versionado com hash').| cético: Baseline existe (supabase/schema.sql, commit da0c2a116 #548; snapshot docs/contexto/supabase/snapshot.json). Hash só por objeto para diff interno: scripts/supabase_snapshot/snapshot.py:250-251 (sha256[:16]) e fingerprints em :1228,:1816-1818; docs/contexto/supabase/manifest.json tem apenas gerado_em/gerador/produtor/erros, sem hash do baseline; snapshot é regenerado (não imutável).

### F0295 · Snapshots de catálogo origem+destino

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 12 P: scripts/graphify/catalog-adapter.mjs só banco descartável.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:29`
- **O que falta:** Gerar e versionar catálogos normalizados de origem e destino com digest e assinatura, registrados em docs/estado.
- **Evidência:** scripts/graphify/catalog-adapter.mjs existe e é integro: digest em :160, verificação de provenance.independentlyVerified e digest em :165, parâmetros --input/--out/--expected-project (:188), `npm run graphify:catalog` em package.json:53. Mas opera sobre UM catálogo de entrada por vez e não há artefato de catálogo origem+destino versionado nem manifesto assinado: grep -rn 'catalog-adapter' fora de scripts/ → só scripts/automation.config.json:434-443. A_planos_execucao.md:29 mantém Etapa 12 como P.| cético: scripts/graphify/catalog-adapter.mjs existe com digest/verificação (conforme verificador inicial, :160,:165,:188) e package.json:53 'graphify:catalog'; não há par de catálogos origem+destino versionado nem manifesto assinado (A_planos_execucao.md:29 mantém Etapa 12 como P).

### F0296 · supabase db push aplica as 600+ migrations do repo

- **Tipo:** Doc/config
- **O que os docs afirmam:** Repo tem mais de 600 migrations replicáveis via CLI.
- **Fontes:** `docs/STAGING.md:19-21`
- **O que falta:** Sanear as 271 migrations que falham no replay ou corrigir docs/STAGING.md:19-21 para indicar supabase/schema.sql como caminho de provisionamento.
- **Evidência:** ls supabase/migrations/_.sql| wc -l → 700 (≥600 confirmado). Porém o replay não é limpo: supabase/schema.sql:6-8 ('As 692 migrations em supabase/migrations/ NAO replayam (271 arquivos falham)') e docs/agentes/replay-do-repo-261117.md:9 ('271 arquivos falham, 377 erros'). docs/STAGING.md:19-21 ainda afirma que `supabase db push --linked` aplica as 600+ migrations. \| cético: ls supabase/migrations/_.sql \| wc -l → 700 (≥600). Mas supabase/schema.sql:6-8 declara 'As 692 migrations ... NAO replayam (271 arquivos falham)'; docs/STAGING.md:20 ainda afirma 'supabase db push --linked # aplica as 600+ migrations do repo'.

### F0307 · types.ts contém objetos usados pelo código

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 16 P: faltam auth_users_view, leads, team_members, enqueue_email.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:32`
- **O que falta:** Criar public.auth_users_view (ou trocar FollowUpTerritoryRules.tsx:61,83 para salespeople/profiles); corrigir/remover referências a team_members (ranking-api) e leads (ai-agent-orchestrator). enqueue_email já resolvido.
- **Evidência:** Objetos usados pelo código ausentes em types.ts E no banco real: auth_users_view — src/components/settings/FollowUpTerritoryRules.tsx:61 e :83 (db.from('auth_users_view')), componente montado em src/pages/Configuracoes.tsx:54,362; grep -rl auth_users_view docs/contexto/supabase → 0 e em types.ts → 0 (query quebra em runtime). team_members — supabase/functions/ranking-api/index.ts:89,167,186,262,317,382, tabela inexistente (tables.md → 0); ranking-api fora da allowlist deploy.yml:144. leads — supabase/functions/ai-agent-orchestrator/index.ts:294, inexistente, function fora da allowlist. enqueue_email — supabase/functions/send-churn-alert-email/index.ts:118 comenta 'A RPC enqueue_email não existe' (function está na allowlist, posição 92).| cético: Ausentes em types.ts E no banco real (tables/views/functions.md → 0): auth_users_view usado em src/components/settings/FollowUpTerritoryRules.t…

### F0314 · 57 campos lidos e 19 escritos por Edge Functions fora do contrato gerado

- **Tipo:** Edge function
- **O que os docs afirmam:** Há 57 campos lidos por 25 Edge Functions e 19 campos filtrados/escritos por 11 funções que não constam no contrato gerado.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:243-243`
- **O que falta:** Corrigir ou remover as leituras de leads/team_members; tirar da UI ou deployar ai-agent-orchestrator; colocar a checagem de contratos das edges contra types.ts no CI.
- **Evidência:** Métrica de 2026-08-26 (docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:243). Mitigação existente: 6 supabase/functions/*/contract_test.ts (ex.: pipeline-pulse-aggregator/contract_test.ts:29 proíbe lead_routing_assignments) rodados pelo job deno-tests (pr-checks.yml:335, scripts/deno-test-suite.mjs). Campos fora do schema ainda existem: supabase/functions/ai-agent-orchestrator/index.ts:294 .from('leads') e ranking-api/index.ts:89,167 .from('team_members') — tabelas ausentes do banco (contexto/supabase/tables/public: leads.md e team_members.md não existem); ambas as functions estão fora da allowlist deploy.yml:144 (não rodam em produção).| cético: Confirmado: supabase/functions/ai-agent-orchestrator/index.ts:294 .from('leads') e supabase/functions/ranking-api/index.ts:89,167,186,262,317,382 .from('team_members'); tables/public não tem leads.md nem team_members.md. Agrava…

### F0315 · Etapa 45 do plano: Reconciliar tabelas, RPCs e campos usados pelas Edges

- **Tipo:** Edge function
- **O que os docs afirmam:** Resolver leads, lead_routing_assignments, team_members, enqueue_email e 76 usos de campo incompatível. Saída esperada: contratos gerados sem escape untyped. Gate: DDL somente se aprovado.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:713-713`
- **O que falta:** Resolver leads/team_members nas duas edges, eliminar 'as any' em _shared e marcar a etapa 45.
- **Evidência:** Dos 4 alvos: lead_routing_assignments corrigido (pipeline-pulse-aggregator/contract_test.ts:29 garante ausência; function na allowlist deploy.yml:144); enqueue_email substituída (supabase/functions/_shared/transactional-email-sender.ts:4 'Substitui a RPC enqueue_email, que não existe'; `grep -rn "rpc('enqueue_email'" src supabase/functions` → 0); leads ainda lida em ai-agent-orchestrator/index.ts:294 e team_members em ranking-api/index.ts:89,167 — tabelas inexistentes no banco (tables/public sem leads.md/team_members.md), functions fora da allowlist. Saída 'sem escape untyped': `grep -rl 'as any' supabase/functions` → _shared/retry.ts e _shared/rate-limit.ts. STATUS_100_ETAPAS não marca a etapa 45 como concluída.| cético: Confirmado: docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:185 marca a etapa 45 como ⬜. leads (ai-agent-orchestrator/index.ts:294) e team_members (ranking-api/index.ts:…

### F0316 · Todos os nomes em trigger_internal_edge_job/allowlist/net.http_post e em function→function existem

- **Tipo:** Edge function
- **O que os docs afirmam:** Doc: verificado que todos os alvos de migrations e de chamadas entre functions existem como pasta.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:315-317`
- **O que falta:** Deployar as 12 functions, o que exige liberar vagas no limite de 100 ou subir o plano (decisão de custo do dono), ou então desagendar os crons e tirar esses nomes do ARRAY de trigger_internal_edge_job.
- **Evidência:** Os 24 nomes do ARRAY de public.trigger_internal_edge_job (contexto/supabase/functions/public/trigger_internal_edge_job__f02f045c8b4350ab.sql:16-42) têm pasta em supabase/functions/ (loop [ -d ] → 0 ausentes), então o critério literal 'pasta existe' se cumpre. Mas 12 deles estão fora da allowlist ACTIVE de .github/workflows/deploy.yml:144 e não rodam em produção: check-v4-callback-alerts, process-call-recording-ingest, winloss-webhook-health-monitor, webvitals-regression-alert, process-scheduled-sends, check-quote-expiration, check-lead-sla, sdr-consecutive-alerts, challenge-expiration-alerts, send-alert-notifications, scheduled-reports-runner, rotate-daily-challenges. Há cron ativo chamando-os, por exemplo cron.md:35 (job 46 rotate-daily-challenges), cron.md:44 (job 81 check-lead-sla) e cron.md:51 (job 88 scheduled-reports-runner).
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Implementado.

### F3252 · 20261001160000_centralize_internal_edge_calls depende de functions_base_url

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Pend. 3 P: substitui 20260831130003; chave ausente no banco.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:348`
- **O que falta:** Deployar ou ajustar os 12 destinos não deployados e verificar o HTTP de resposta em net._http_response.
- **Evidência:** functions/public/trigger_internal_edge_job__f02f045c8b4350ab.sql:49 lê functions_base_url de _internal_secrets, e a linha :56 lança internal_edge_job_secrets_missing se a chave faltar. Todos os jobs que usam a função saem succeeded (por exemplo o job 36, cron-runs.md:173-178), então a chave existe. Mas 12 destinos estão fora da allowlist em .github/workflows/deploy.yml:144 (lista em F3241), e essas chamadas internas vão para functions não deployadas.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F0320 · Etapa 77 do plano: Implementar concorrência segura

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Locks/constraints/idempotency em prêmio, lead routing, cadências, quotes, workflows e webhooks. Saída esperada: testes de corrida. Gate: possível DDL.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:754-754`
- **O que falta:** Testes de corrida para cadências, workflows e webhooks, rodando no CI com sessão válida.
- **Evidência:** Locks existem em 9 funções do banco real (pg_advisory_xact_lock/FOR UPDATE SKIP LOCKED em contexto/supabase/functions: resolve_weekly_matchups, dequeue_call_recording_ingest_jobs, route_unassigned_client_portfolio, match_weekly_players, auto_assign_lead, next_dialer_item, award_sale_xp, etc.). Testes de corrida existem: tests/e2e/quote-to-sale-concurrent.spec.ts:23-55, quote-to-sale-race-trigger-vs-rpc.spec.ts, quote-to-sale-concurrent-won.spec.ts, supabase/tests/quote-to-sale-stress.sql — mas os e2e fazem test.skip(!HAS_AUTH) (spec:24-25; tests/e2e/helpers/auth.ts:32) e dependem dos secrets E2E_* (pr-checks.yml ~:523-545). STATUS_100_ETAPAS_2026-08-30.md:232 marca etapa 77 como ⬜. Cobertura limitada a quotes/prêmio/lead routing; sem teste de corrida para cadências, workflows e webhooks.| cético: Sem evidência nova: há locks e testes de corrida para quotes, prêmio e lead routing, mas ne…

### F3254 · Etapa canônica 26/08 nº 45: Reconciliar tabelas/RPCs/campos usados pelas Edges

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Etapa canônica 45 (plano 26/08, matriz de status 30/08, estado ⬜): leads, lead_routing_assignments, team_members, enqueue_email, 76 usos incompatíveis; contratos gerados sem escape untyped.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:185-185`
- **O que falta:** Reconciliar ranking-api e ai-agent-orchestrator com o schema real. As duas também estão fora da allowlist de deploy.yml:144.
- **Evidência:** lead_routing_assignments e enqueue_email só aparecem em comentário ou teste: supabase/functions/send-churn-alert-email/index.ts:118, _shared/transactional-email-sender.ts:4 e pipeline-pulse-aggregator/contract_test.ts:29. Ainda há usos incompatíveis: supabase/functions/ranking-api/index.ts:89,167,186 usa .from('team_members') e supabase/functions/ai-agent-orchestrator/index.ts:294 usa .from('leads'). team_members e leads não existem no snapshot (tables/public sem os .md).
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F3255 · Função SQL/RPC archive_old_activities (2 afirmações nos docs)

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** RPCs expostas no destino e ausentes de types.ts: archive_old_activities, archive_old_data, cleanup_deleted_records, cleanup_old_audit_logs, cleanup_old_records, refresh_materialized_views, reindex_tables.| API.md lista a function SQL `archive_old_activities` com última definição em 20260104181000_stored_procedures_additional.sql, grants "—" e uso no front "—".
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:502-504`, `docs/API.md:473-473`
- **O que falta:** Criar activities_archive, ou dropar a função. Falta também chamador real e revisão do grant a authenticated (o critério pede grants mínimos).
- **Evidência:** função public.archive_old_activities existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: A função existe: snap/functions.md:82 (public.archive_old_activities, grants para authenticated e service_role, sem chamador) e está em src/integrations/supabase/types.ts:23789. Está quebrada: o corpo faz INSERT INTO activities_archive (snap/functions/public/archive_old_activities__61f62895d355edf7.sql), tabela ausente de snap/tables.md (grep → 0). Não está em snap/cron.md.

### F3258 · Função SQL/RPC calculate_deal_probability (2 afirmações nos docs)

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Quinze funções da primeira geração do schema (modelo deals, nunca criado) continuam em public sem chamador: calculate_deal_probability, update_client_score, aggregate_sales_stats, cleanup_old_records, archive_old_data, calculate_team_performance, bulk_update_deal_stages, archive_old_activities, calculate_deal_health_score, generate_sales_forecast, reindex_tables, refresh_materialized_views, cleanup_deleted_records, cleanup_old_audit_logs, check_failed_attempts. As duas últimas tinham cron só em comentário.| API.md lista a function SQL `calculate_deal_probability` com última definição em 20260105000005_stored_procedures.sql, grants "—" e uso no front "—".
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:82`, `docs/API.md:507-507`
- **O que falta:** Dropar em migration as 15 funções do modelo deals ou dar a elas um chamador. Hoje são código morto que referencia tabela inexistente.
- **Evidência:** função public.calculate_deal_probability existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: A função existe: snap/functions.md (public.calculate_deal_probability, search_path=public, grants para authenticated e service_role, sem chamador) e está em types.ts:23889. O corpo lê FROM deals (snap/functions/public/calculate_deal_probability__8397e78d1be629f8.sql:22-24), tabela ausente de snap/tables.md: a função quebraria se chamada. Nenhum DROP em migration.

### F3259 · Função SQL/RPC create_version (2 afirmações nos docs)

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Doc: Advisor sinaliza 8 funções com search_path mutável (não SECURITY DEFINER); tratar por assinatura/owner.| API.md lista a function SQL `create_version` com última definição em 20250102_versioning.sql, grants "—" e uso no front "—".
- **Fontes:** `docs/auditoria/VALIDACAO_SINCRONIA_GITHUB_SUPABASE_2026-09-10.md:161,167-173,199`, `docs/API.md:543-543`
- **O que falta:** SET search_path explícito (ou justificativa) em create_version, check_failed_attempts e cleanup_deleted_records. Revogar anon e ligar a função a um trigger, ou dropá-la.
- **Evidência:** função public.create_version existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: A função existe: snap/functions.md (public.create_version), sem search_path (coluna vazia) e com EXECUTE para anon, authenticated e service_role. check_failed_attempts e cleanup_deleted_records também estão sem search_path. Não há trigger de create_version em snap/triggers.md. O corpo grava em entity_versions (snap/functions/public/create_version__12ae32cb1ec02d01.sql:6).

### F3266 · Regras das PRs #459/#461/#464 incorporadas: post único no feed de batalha, funções SQL ignorando soft delete, 12 crons da máquina de vendas

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Os 5 arquivos dessas PRs fechadas estão byte a byte na main.
- **Fontes:** `docs/agentes/veredicto-branches-vivas-261117.md:202-205`
- **O que falta:** Deployar ou incluir na allowlist as 7 edges da máquina de vendas chamadas pelos jobs 79-82, 84, 85 e 88.
- **Evidência:** (1) Post único: supabase/migrations/20261112190000_feed_batalha_post_unico.sql:28 faz DROP TRIGGER tr_victory_battle; em triggers.md:293 resta só tr_notify_battle_victory (grep tr_victory_battle → 0). (2) Soft delete: a migration 20261112190200_funcoes_activities_ignoram_soft_delete.sql existe, e as 4 funções no banco (calculate_deal_health, compute_pipeline_inspection, create_activities_from_action_items e get_semantic_coverage) contêm 'deleted_at IS NULL'. (3) Crons: os jobs 77-88 estão ativos em cron.md e saem succeeded, mas 7 chamam edges fora da allowlist de .github/workflows/deploy.yml:144: process-scheduled-sends (79), check-quote-expiration (80), check-lead-sla (81), sdr-consecutive-alerts (82), challenge-expiration-alerts (84), send-alert-notifications (85) e scheduled-reports-runner (88).
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F3269 · RPC/função SQL `check_failed_attempts`

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** API.md lista a function SQL `check_failed_attempts` com última definição em 20260104183000_security_enhancements.sql, grants "—" e uso no front "—".
- **Fontes:** `docs/API.md:515-515`
- **O que falta:** Falta chamador real (edge, cron, trigger ou front); hoje é código morto. O EXECUTE para anon e authenticated vem por default, não por GRANT explícito: decidir se é intencional, revogar ou remover a função.
- **Evidência:** função public.check_failed_attempts existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: Existe no banco real: functions.md:118 (public.check_failed_attempts(p_email text, p_minutes integer), sql). EXECUTE para anon, authenticated e service_role, sem config de search_path, e colunas código/cron/triggers/banco vazias. Fora de types.ts não há chamador: grep -rn check_failed_attempts src supabase/functions → 0 resultados.

### F0324 · Wrappers public.* → private.* como SECURITY DEFINER

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Wrappers em public delegam a funções em schema private (sem USAGE para authenticated) mantendo auth.uid() do chamador.
- **Fontes:** `docs/SECURITY_HARDENING.md:230-232`
- **O que falta:** Tornar o wrapper SECURITY DEFINER ou documentar a exceção.
- **Evidência:** Schema private existe com USAGE só para service_role (contexto/supabase/schemas.md:7). 7 funções public.* delegam a private.* (contexto/supabase/functions/public/*.sql): 6 são SECURITY DEFINER (auto_promote_sequence_winners:4,9; spin_prize_wheel:4,171; auto_victory_post; check_battle_achievements; register_race_daily_checkin; trg_refresh_ranking_on_sale), mas public.auto_pause_enrollment é SECURITY INVOKER (supabase/migrations/20261013121000:12; functions.md:94 secdef=não) e faz PERFORM private.auto_pause_enrollment (public/auto_pause_enrollment__2c91a3d483f36a28.sql:44) — só funciona porque EXECUTE é apenas service_role; contradiz docs/SECURITY_HARDENING.md:230-232 ('wrappers são SECURITY DEFINER').| cético: Confirmado: contexto/supabase/functions/public/auto_pause_enrollment__2c91a3d483f36a28.sql:1-5 não tem SECURITY DEFINER e :44 faz PERFORM private.auto_pause_enrollment; functions.m…

### F0325 · Coletor de catálogo canônico do banco habilitado

- **Tipo:** Integração externa
- **O que os docs afirmam:** Etapas 21-25 P/NI: catalog-adapter com fixture; reconcile-catalog.mjs recusa catálogo não atestado.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:476-478`
- **O que falta:** Alimentar o adapter com um coletor atestado e ligar o reconcile ao fluxo.
- **Evidência:** scripts/graphify/catalog-adapter.mjs existe (normalizeCatalog :140-163, reconcileStaticContracts :165) com testes catalog-adapter.test.mjs e scripts npm graphify:catalog/graphify:reconcile (package.json:53-54). Porém só lê JSON via --input (:192,205), nunca coleta do banco (`grep -n 'pg\|postgres\|fetch(' catalog-adapter.mjs reconcile-catalog.mjs` → 0); normalizeCatalog fixa provenance.independentlyVerified=false (:146) e reconcileStaticContracts lança 'Reconciliação exige catálogo íntegro e verificado por coletor RO confiável.' (:166) — reconcile sempre recusa; teste usa fixture (catalog-adapter.test.mjs:44).| cético: Confirmado: scripts/graphify/catalog-adapter.mjs:146 fixa independentlyVerified:false e :165-166 lança erro se não for true, então o reconcile sempre recusa; graphify:catalog/reconcile (package.json:53-54) não está em nenhum workflow.

### F0326 · Coletor do catálogo canônico não habilitado

- **Tipo:** Integração externa
- **O que os docs afirmam:** Coleta do catálogo Supabase só por conexão RO identificada com usyxfpqlsspldubptrdl; coletor não habilitado.
- **Fontes:** `docs/graphify/README.md:77-83`
- **O que falta:** Atestar a identidade do projeto usyxfpqlsspldubptrdl e a sessão RO de forma verificável (credencial RO de verdade), ligar a saída do snapshot ao catalog-adapter com independentlyVerified=true e atualizar docs/graphify/README.md:79.
- **Evidência:** Existe um coletor real do banco: scripts/supabase_snapshot/snapshot.py:949-951 (psycopg.connect + SET default_transaction_read_only = on), agendado por .github/workflows/contexto.yml:45 (cron '3 * * * *') e executado em contexto.yml:233 com o secret SUPABASE_DB_URL (:221). Faltam a atestação de identidade e a credencial RO: o RO é só um ajuste de sessão, e não há checagem do ref do projeto (grep usyxfpqlsspldubptrdl em contexto.yml e snapshot.py → 0; só aparece em scripts/supabase_snapshot/README.md:3; PROJECT_REF em snapshot.py:82 é opcional e serve à Management API). O coletor também não alimenta o graphify: scripts/graphify/catalog-adapter.mjs:146 grava independentlyVerified:false e :165 exige true. docs/graphify/README.md:79 segue dizendo 'não está habilitado'.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F0334 · Correção: backfill de sales.stage a partir de deal_stage_transitions.to_stage

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Popular sales.stage por backfill.
- **Fontes:** `docs/estado/04_DOMINIO_ANALYTICS_BI.md:486-487`
- **O que falta:** Trigger ou default que preencha stage nas vendas novas, mais backfill das nulas; conferir com SELECT count(*) WHERE stage IS NULL em produção.
- **Evidência:** Coluna public.sales.stage existe, nullable, sem default (contexto/supabase/tables/public/sales.md:57); deal_stage_transitions.to_stage existe (:22). Houve backfill, mas derivado de sales.status, não de deal_stage_transitions.to_stage: supabase/migrations/20260814072502_winloss_extend_sales.sql:30-40 'UPDATE public.sales SET stage = COALESCE(stage, CASE status ...)' (no ledger: migrations.md). Ausente: `grep -rn 'UPDATE public.sales.*stage' supabase/migrations` não retorna backfill a partir de to_stage; nenhum trigger preenche stage em novas vendas (só bulk_update_deal_stages altera; record_sale_stage_transition apenas grava transições). Preenchimento efetivo das vendas abertas exige query em produção: NÃO VERIFICADO.| cético: Confirmado: tables/public/sales.md:57 stage é nullable e sem default; :348 o trigger trg_record_sale_stage_transition (functions/public/record_sale_stage_transitio…

### F0336 · Correção: unificar status de venda em views/RPCs/edge functions

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Substituir status=completed por ANY(completed, won, closed) em mv_competitive_ranking, revenue_forecast_view, revops-hub/index.ts:41, LTVBySegment.tsx:33.
- **Fontes:** `docs/estado/04_DOMINIO_ANALYTICS_BI.md:479-482`
- **O que falta:** Trocar `.eq('status','completed')` em src/components/analytics/LTVBySegment.tsx:45 (e em src/hooks/useDealTimeline.ts:61, citado pelo verificador) pelo conjunto canônico won/completed/closed. Revisar as views do snapshot views.md:147-170 e :467-469, que ainda filtram 'completed' isolado ou sem 'closed'.
- **Evidência:** 3 de 4 consumidores corrigidos: mv_competitive_ranking usa status = ANY(completed,won,closed) (snapshot views.md bloco :398, linha 19 do bloco); revenue_forecast_view idem (views.md bloco :610, linha 39); supabase/functions/revops-hub/index.ts:7,72 usa isWonSaleStatus de supabase/functions/_shared/sale-statuses.ts:7-9 (revops-hub está na allowlist deploy.yml:144). Pendente: src/components/analytics/LTVBySegment.tsx:45 ainda `.eq('status','completed')` e é montado em src/pages/Analytics.tsx:19,116 e src/components/purchase-intelligence/PurchaseIntelligenceHub.tsx:151; também src/hooks/useDealTimeline.ts:61 `.eq('status','completed')`.| cético: Confirmado. Snapshot views.md:416 (mv_competitive_ranking) e views.md:648 (revenue_forecast_view) usam status = ANY(completed, won, closed). Pendente: src/components/analytics/LTVBySegment.tsx:44-45 ainda faz `.eq('status', 'completed')`. Em views.…

### F0338 · Etapa 12 do plano: Capturar snapshots de catálogo

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Exportar metadados, nunca dados pessoais, de origem e destino no mesmo instante. Saída esperada: manifests assinados. Gate: acesso RO.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:671-671`
- **O que falta:** Gravar SHA-256 por arquivo e uma assinatura no manifest.json gerado por scripts/supabase_snapshot/snapshot.py. Registrar formalmente (ADR) que a origem rapjswienfhkobhlamxb está fora de escopo, ou capturar o snapshot dela.
- **Evidência:** Snapshot de catálogo do DESTINO existe e é regenerado a cada hora: scripts/supabase_snapshot/snapshot.py executado por .github/workflows/contexto.yml:44-45,178-233 (secret SUPABASE_DB_URL, sessão read-only conforme scripts/supabase_snapshot/README.md:41), saída versionada na branch contexto (docs/contexto/supabase/manifest.json gerado_em 2026-11-20T02:18:41Z; README.md:14,85 — só catálogo, sem dados pessoais). Inventário semanal: .github/workflows/inventario-estado-semanal.yml:23-24,110-112 → inventario/estado/{banco,rotas,edges}.json. Faltam: snapshot da ORIGEM (rapjswienfhkobhlamxb) e 'manifests assinados' — manifest.json não tem hash/assinatura (grep 'digest\|sha\|assin' em docs/contexto/supabase/README.md e scripts/supabase_snapshot/README.md → só menções a assinatura de função). docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:29 marca etapa 12 como P.| céti…

### F0340 · Etapa 96 do plano: Deprecar antes de remover objetos de banco

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Revogar consumidores em staging, alertar uso e observar ao menos um ciclo de negócio. Saída esperada: zero chamada no período acordado. Gate: autorização por objeto.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:779-779`
- **O que falta:** Registrar por objeto (views duplicadas, 6 grupos de índices) um doc de deprecação com REVOKE/telemetria (pg_stat_user_indexes, consumers em src/) e janela de observação ≥1 ciclo antes de DROP; usar branch Supabase como staging.
- **Evidência:** Único passo de deprecação executado: supabase/migrations/20261001203300_deny_dead_tables_revoke_anon_grants.sql (4 REVOKE em tabelas mortas, direto em produção), registrado em docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:182 como P ('Janela e telemetria' faltando) e :95 etapa 96 = NI 'ausente'. Não há staging, alerta de uso nem ciclo de observação: grep -i deprec em supabase/migrations → só comentário em 20261117180000_auditoria_webhooks.sql:22. Objetos candidatos continuam vivos no banco real: views duplicadas activities_active/v_active_activities e clients_active/v_active_clients (snapshot views.md:4,87,806,839); índices duplicados mantidos (A_planos_execucao.md:364,383).| CONTESTADO pelo cético (NAO_IMPLEMENTADO): O único artefato citado como 'deprecação' faz o oposto da etapa: supabase/migrations/20261001203300_deny_dead_tables_revoke_anon_grants.sql:37 e…
- **Revisão:** em disputa. O cético propõe Não implementado e o juiz ainda não decidiu.

### F0341 · Etapa canônica 26/08 nº 12: Capturar snapshots de catálogo origem+destino

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Etapa canônica 12 (plano 26/08, matriz de status 30/08, estado 🔒): metadados, nunca dados pessoais; manifests assinados.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:135-135`
- **O que falta:** O mesmo de F0338: hash e assinatura por arquivo no manifest, e fechamento formal (ou captura) da parte 'origem'.
- **Evidência:** Snapshots versionados do DESTINO existem: inventario/estado/{banco,rotas,edges}.json (último commit 813f591b1; gerados por .github/workflows/inventario-estado-semanal.yml:23-24,110-112 a partir do banco oficial) e docs/contexto/supabase/* na branch contexto (contexto.yml:44-45,233; manifest.json 2026-11-20). Sem snapshot da origem rapjswienfhkobhlamxb e sem assinatura/hash nos manifests (grep digest/sha → 0 nos READMEs). STATUS_100_ETAPAS_2026-08-30.md:135 mantém 🔒; A_planos_execucao.md:29 = P.| cético: Confirmado. Os snapshots do destino estão versionados (docs/contexto/supabase/_, manifest.json gerado_em 2026-11-20; inventario/estado/_.json). manifest.json não tem hash nem assinatura (campos: carried, entrada, erros, gerado_em, gerador, produtor). Não há snapshot da origem. A_planos_execucao.md:29 marca a etapa 12 como P.

### F0349 · Etapa canônica 26/08 nº 30: Comparar privilégios, jobs e ledger

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Etapa canônica 30 (plano 26/08, matriz de status 30/08, estado 🔒): ACL/default ACL, sequences, cron, Vault, checksums; reconciliação completa sem aplicar nada.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:158-158`
- **O que falta:** Reconciliação origem×destino de ACL, default ACL, sequences, cron e Vault (ou ADR de obsolescência), mais SHA-256 dos arquivos de migration registrados.
- **Evidência:** Parte 'ledger' feita no destino: supabase/migrations/20261117090000_marca_594_migrations_como_aplicadas.sql:1-30 reconciliou schema_migrations (701 registros em docs/contexto/supabase/migrations.md; linha 698 confirma a própria versão), com drift vigiado por .github/workflows/migrations-drift.yml + scripts/db-audit/check-migration-drift.mjs. ACL/default ACL, sequences, cron e Vault do destino catalogados (grants.md, sequences.md, cron.md 45 jobs, vault.md). Falta a comparação com a origem e checksums; A_planos_execucao.md:36 etapa 30 = NI.| cético: Confirmado. O ledger do destino foi reconciliado: supabase/migrations/20261117090000_marca_594_migrations_como_aplicadas.sql existe e o snapshot migrations.md tem 701 linhas de tabela, com a própria versão em :698. O drift é vigiado por .github/workflows/migrations-drift.yml (push, schedule, dispatch). A comparação com a origem e os checksums…

### F0350 · Etapa canônica 26/08 nº 96: Deprecar antes de remover objetos de banco

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Etapa canônica 96 (plano 26/08, matriz de status 30/08, estado 🔒): revogar consumidores em staging; observar ≥1 ciclo; zero chamada no período.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:261-261`
- **O que falta:** Mesmo que F0340.
- **Evidência:** Idem F0340: único passo é supabase/migrations/20261001203300_deny_dead_tables_revoke_anon_grants.sql (REVOKE direto em produção, sem staging/ciclo de observação); A_planos_execucao.md:95 etapa 96 = NI, :182 P092 = P 'Janela e telemetria'. Views duplicadas seguem no banco real (views.md:4,87,806,839); STATUS_100_ETAPAS_2026-08-30.md:261 🔒.| CONTESTADO pelo cético (NAO_IMPLEMENTADO): Pelo mesmo motivo de F0340: a única migration associada remove direto, sem deprecação. supabase/migrations/20261001203300_deny_dead_tables_revoke_anon_grants.sql:37 `DROP TABLE IF EXISTS public.cadence_enrollments`, sem REVOKE prévio, sem staging (docs/STAGING.md:3, único projeto) e sem período de observação. A_planos_execucao.md:95 marca a etapa 96 como 'NI \| ausente'. As views duplicadas seguem vivas no banco real, sem registro de deprecação (views.md:4,87,806,839).
- **Revisão:** em disputa. O cético propõe Não implementado e o juiz ainda não decidiu.

### F0351 · Exportação de pg_get_functiondef, policies, ACLs, buckets e jobs antes do deploy

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Antes do deploy, exportar definições de funções, pg_policies, ACLs, reloptions, buckets e jobs afetados; registrar SHA e hashes das migrations; confirmar backup/PITR.
- **Fontes:** `docs/execucao/ROLLBACK_HARDENING_CANONICO_2026-08-31.md:9-15`
- **O que falta:** Passo pré-aplicação em apply-migration.yml (e em deploy.yml, se o db push for mantido) que exporte o catálogo afetado e registre o SHA do merge e o sha256 da migration como artifact. Confirmar o PITR no painel Supabase.
- **Evidência:** Export de catálogo existe e roda de hora em hora, mas não é acionado pré-deploy: scripts/supabase_snapshot/snapshot.py exporta pg_get_functiondef (:558), pg_policies (:598), ACL/default ACL (:656-686), reloptions (:533), cron.job (:714) e storage.buckets (:750), via .github/workflows/contexto.yml:44-45,221-233. O caminho de deploy de DDL .github/workflows/apply-migration.yml não tem passo de export, hash SHA-256 nem checagem de PITR (grep 'snapshot\|functiondef\|backup\|PITR\|pg_dump' → 0). Backup: .github/workflows/db-backup.yml:1-20 pg_dump diário condicionado ao secret SUPABASE_DB_URL. PITR: NÃO VERIFICÁVEL (docs/contexto/supabase/project-config.md 'backups (redigido)'; painel Supabase não acessível). public.admin_capture_rollback_snapshot (cron.md:17) só grava métricas de pg_stat_database, não catálogo.| cético: Confirmado. O export de catálogo existe só como snapshot horário (scrip…

### F0352 · Extração de migrations SQL em lote separado (611 arquivos)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** As 611 migrations não cabem em um único escopo e devem ser extraídas em lote separado sem confundir com schema aplicado.
- **Fontes:** `docs/graphify/BASELINE_AST_SRC_2026-09-11.md:44`
- **O que falta:** Rodar `npm run graphify:contracts` em job próprio (graphify.yml ou contexto.yml) e versionar o lote de migrationEvents em docs/contexto/codigo/ ou inventario/estado, separado do catálogo aplicado.
- **Evidência:** scripts/graphify/static-contracts.mjs:220-247 já percorre supabase/migrations/ e extrai migrationEvents, mas no MESMO escopo do coletor (não lote separado) e com saída em .graphify-local (não versionada); a revisão versionada docs/graphify/revisao-20260911/resultados.json não contém eventos de migration (grep -c migration → 0); .github/workflows/graphify.yml não executa graphify:contracts (grep → 0; script só em package.json:52,54). O ledger aplicado está versionado em docs/contexto/supabase/migrations.md (branch contexto), o que cobre 'schema aplicado', não o lote de arquivos.| CONTESTADO pelo cético (IMPLEMENTADO): O lote de migrations é extraído e versionado em snapshot próprio, separado do schema aplicado, por outro gerador além do static-contracts.mjs. O snapshot docs/contexto/codigo/banco.json (branch contexto) tem `fonte` = [drizzle, src/integrations/supabase/types.ts, supabase/m…
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F0353 · Gate de acesso ao canônico: token Management API ou DSN RO

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Antes de qualquer escrita no canônico, operador fornece token Management API ou DSN PostgreSQL somente leitura + credencial de escrita separada.
- **Fontes:** `docs/execucao/RECONCILIACAO_GITHUB_SUPABASE_2026-08-31.md:162-181`
- **O que falta:** Criar o role snapshot_reader (README.md:97-101) e um secret RO distinto para contexto.yml e inventario-estado-semanal.yml, deixando a credencial de escrita só para apply-migration.yml.
- **Evidência:** Identidade comprovada: docs/estado/IDENTIDADE_BANCO_2026-09-13.md §1-§2 (health do gateway MCP aponta para usyxfpqlsspldubptrdl + laço escrita API/leitura MCP) e docs/agentes/banco-e-mcp.md:12-17; snapshot de 20/11 coletado via secret SUPABASE_DB_URL (contexto.yml:221) com sessão default_transaction_read_only (scripts/supabase_snapshot/README.md:41,125); tipos via Management API só leitura (types-sync.yml:73). Porém não há credencial RO separada da de escrita: o mesmo SUPABASE_DB_URL aplica DDL em apply-migration.yml:84; role snapshot_reader é opcional (README.md:94-97) e não existe no banco (grep snapshot_reader docs/contexto/supabase/roles.md → 0). Valor dos segredos: NÃO VERIFICÁVEL.| cético: Confirmado. Não há credencial RO separada da de escrita: o mesmo secret SUPABASE_DB_URL é lido em contexto.yml:221 (snapshot) e usado para aplicar DDL em apply-migration.yml:40,84 (`psql "$SUPAB…

### F0355 · Handoff P042: Validar as 1.350 constraints do destino com dados reais

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Fila canônica do handoff (onda 5): Validar as 1.350 constraints do destino com dados reais. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:338-338`
- **O que falta:** Checar as violações e rodar ALTER TABLE ... VALIDATE CONSTRAINT nas 3 constraints, com migration comentada em supabase/migrations/.
- **Evidência:** Banco real: 1.245 constraints PK/FK/UNIQUE/CHECK em public (docs/contexto/supabase/tables/public/*.md), 1.242 validadas e 3 NOT VALID da aplicação: lead_scores.md:35 (lead_scores_score_range), orders.md:47 (orders_total_non_negative), quotes.md:74 (quotes_total_value_non_negative). Nenhum registro de validação com dados reais: A_planos_execucao.md:141 'Validar 1.350 constraints| NI \| ausente'. Critério 'nenhuma constraint NOT VALID' não atendido. \| cético: Confirmado no banco real: 3 constraints de aplicação continuam NOT VALID, validada = não. São tables/public/quotes.md:74 quotes_total_value_non_negative, lead_scores.md:35 lead_scores_score_range e orders.md:47 orders_total_non_negative. O critério 'nenhuma constraint NOT VALID' não é atendido.

### F0356 · Handoff P092: Deprecar objetos de banco candidatos antes de remoção

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Fila canônica do handoff (onda 10): Deprecar objetos de banco candidatos antes de remoção. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:413-413`
- **O que falta:** Mesmo que F0340.
- **Evidência:** Idem F0340/F0350: A_planos_execucao.md:182 'P092 Deprecar objetos de banco| P \| 20261001203300_deny_dead_tables_revoke_anon_grants.sql \| Janela e telemetria'. Views duplicadas (activities_active/v_active_activities, clients_active/v_active_clients) seguem no banco real (docs/contexto/supabase/views.md:4,87,806,839) e índices duplicados mantidos (A_planos:364,383); nenhum processo documentado por objeto (grep -i deprec em docs/decisions docs/execucao → só menção genérica em PLANO_WORKFLOWS…). \| CONTESTADO pelo cético (NAO_IMPLEMENTADO): A_planos_execucao.md:182 atribui P a P092 com base em 20261001203300_deny_dead_tables_revoke_anon_grants.sql, mas essa migration faz DROP direto: :37 `DROP TABLE IF EXISTS public.cadence_enrollments`, com :12-14 'DROP documentado... falha alto'. O REVOKE de :35 é em webhook_events, que é mantida (deny-all). Não há objeto deprecado antes de remoção, nem…
- **Revisão:** em disputa. O cético propõe Não implementado e o juiz ainda não decidiu.

### F0357 · Índices não usados / N+1 via pg_stat_user_indexes e pg_stat_statements

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Doc pede auditar índices não usados e top 20 queries com EXPLAIN no vivo.
- **Fontes:** `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:590`
- **O que falta:** Doc com EXPLAIN (ANALYZE) das top 20 de stats.md:492+ e decisão por índice de stats.md:427+ (manter, ou DROP via migration).
- **Evidência:** Relatório produzido automaticamente: docs/contexto/supabase/stats.md:427-473 'Índices nunca usados' (41 índices, via snapshot.py:874-876 pg_stat_user_indexes) e stats.md:492-511 'Consultas mais custosas (pg_stat_statements)' (snapshot.py:913), regenerados a cada hora por contexto.yml:44-45. Faltam EXPLAIN das top 20, análise N+1 e ações registradas: nenhum DROP INDEX desde 07/2026 (A_planos_execucao.md:364) e nenhuma decisão em docs/decisions sobre os índices listados; AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:590 segue como pedido.| cético: Confirmado. O relatório automático existe: stats.md:427 'Índices nunca usados' e stats.md:492 'Consultas mais custosas (pg_stat_statements)', gerados por scripts/supabase_snapshot/snapshot.py. Não há EXPLAIN das top 20 nem ações registradas. Ausente: `grep -rln -iE 'pg_stat_user_indexes\|idx_scan' scripts supabase/functions .github/workflows docs/ex…

### F0361 · Pendências vivas 1-7 (queries de verificação no banco)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** NI exceto #4 (search_path coberto por asserção em 20260902221500).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:336`
- **O que falta:** Registrar o fechamento das pendências 1-3 e 5-7 apontando para os arquivos do snapshot, ou executar as queries e anexar o resultado.
- **Evidência:** Lista das 7 pendências em docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:581-592; A_planos_execucao.md:336 marca NI exceto #4. #4 coberto por asserção em supabase/migrations/20260902221500_enable_rls_orphan_tables_and_fix_search_path.sql:139 (RAISE 'restam SECURITY DEFINER sem search_path'). O snapshot vivo do workflow contexto cobre o conteúdo das queries #1/#2 (policies.md, tables/public/*.md com RLS), #3 (cron.md), #5 (edge-functions.md), #6 (auth.md) e #7 (indexes.md/stats.md), mas nenhum documento registra a execução/resultado das pendências 1-3 e 5-7 como tal: rg -i 'pendências de verificação viva' docs/ → só a lista original.| cético: Sem evidência nova. #4 coberto por asserção em supabase/migrations/20260902221500_enable_rls_orphan_tables_and_fix_search_path.sql; as demais só têm cobertura indireta pelo snapshot (policies.md, cron.md, indexes.md), sem registro de fecha…

### F0362 · pg_stat_statements_reset após rodadas de stress

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Adicionar pg_stat_statements_reset() após stress para higienizar métricas de slow queries.
- **Fontes:** `docs/reports/BACKEND_DEEP_AUDIT_2026-07-11.md:91-93`
- **O que falta:** Chamar SELECT extensions.pg_stat_statements_reset() (ou public.reset_pg_stat_statements_weekly()) ao final de supabase/tests/quote-to-sale-stress.sql e dos scripts de carga.
- **Evidência:** supabase/tests/quote-to-sale-stress.sql termina com ROLLBACK eecho (últimas 15 linhas), sem pg_stat_statements_reset: rg pg_stat_statements_reset supabase/tests scripts → só canonical_post_migration_assertions.sql:184 (asserção sobre a função semanal). Existe higienização periódica: cron reset-pg-stat-statements-weekly '0 4 * * 1' (cron.md id 9) chamando public.reset_pg_stat_statements_weekly (functions.md:324). \| cético: supabase/tests/quote-to-sale-stress.sql termina em ROLLBACK + \echo (últimas linhas) sem reset; scripts/load/k6-smoke.js também não reseta; grep pg_stat_statements_reset fora de migrations → só supabase/tests/canonical_post_migration_assertions.sql:184, supabase/schema.sql:10177/20051 (corpo da função) e testes de contrato. Higienização periódica existe: cron.md:13 reset-pg-stat-statements-weekly.

### F0364 · Plano 30/08 etapa 42 (P042): Validar as 1.350 constraints do destino com dados reais

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Etapa 42 do plano de 100 etapas (auditoria 30/08; = P042 do handoff): Lista de violações, constraints não validadas e contratos intencionais.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:700-700`
- **O que falta:** Rodar VALIDATE CONSTRAINT nos 3 CHECK (lead_scores_score_range, orders_total_non_negative, quotes_total_value_non_negative) ou documentar as violações e os contratos intencionais.
- **Evidência:** Banco real tem 3 CHECK NOT VALID: contexto/supabase/snapshot.json:68713 (score 0-100), :69848 (total >= 0), :72181 (total_value >= 0), criados de propósito em supabase/migrations/20261116223100_constraints_integridade_negocio.sql:27-48. Nenhuma lista de violações/constraints não validadas documentada: ausente rg -i 'convalidated\|NOT VALID' docs/ → 0 além das migrations. Plano em AUDITORIA_EXAUSTIVA_2026-08-30...md:700.| cético: contexto/supabase/snapshot.json:68713, :69848, :72181 são os únicos 3 CHECK NOT VALID (grep -c 'NOT VALID' → 3), criados de propósito em supabase/migrations/20261116223100_constraints_integridade_negocio.sql:26-48 (comentário: validar depois de limpar histórico). Nenhuma lista de violações publicada.

### F0365 · Plano 30/08 etapa 92 (P092): Deprecar objetos de banco candidatos antes de remoção

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Etapa 92 do plano de 100 etapas (auditoria 30/08; = P092 do handoff): Telemetria, aviso, janela de compatibilidade e autorização individual para DROP.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:765-765`
- **O que falta:** Por objeto: telemetria de uso, COMMENT/aviso de deprecação, janela de compatibilidade e autorização individual registrada antes do DROP.
- **Evidência:** docs/DEAD_TABLES.md:23-48 lista candidatas por tabela com nota e :79-83 prescreve janela de observação de 30 dias; não há telemetria de uso nem aviso de deprecação por objeto: ausente rg -i 'deprecat' docs/*.md docs/execucao → 0 (só docs/agentes/migrations-arquivadas-veredicto-261117.md:130, que trata do schema 'deprecated'). Índices duplicados seguem no banco sem marcação (indexes.md sem seção de duplicados). Etapa em AUDITORIA_EXAUSTIVA_2026-08-30...md:765.| cético: docs/DEAD_TABLES.md lista candidatas e janela de 30 dias; ausente: grep -ciE 'deprecat\|obsolet' contexto/supabase/snapshot.json → 0 (nenhum COMMENT de deprecação em objeto do banco).

### F0370 · Reconciliação do ledger schema_migrations

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Ledger de produção não reconciliado (MIGRATION_RENAME_MAP §4-9); 20260903000002 nunca aplicada.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:155`
- **O que falta:** Replay das migrations em banco limpo continua quebrado; falta workflow de CI que aplique supabase/schema.sql (ou as migrations) num Postgres 17 efêmero e falhe em erro.
- **Evidência:** Ledger reconciliado: contexto/supabase/migrations.md tem 700 versões = 700 arquivos (comm sem diferença), 20260903000002 registrada (migrations.md:610). Reconciliação feita em PRs #540 (commit 31ed35da3) e #543 (a45b9ed7c). Porém o critério 'replay em banco limpo passa' falha: docs/agentes/replay-do-repo-261117.md:8-11 (271 arquivos falham, 377 erros) e nenhum workflow faz replay (rg -i 'db reset\|replay' .github/workflows → 0).| cético: Ledger reconciliado (700=700, comm -3 → 0; migrations.md:610 tem 20260903000002). Replay das migrations segue falhando (docs/agentes/replay-do-repo-261117.md:8-11). Observação: o baseline já existe — supabase/schema.sql:1-20, commit da0c2a116 (#548) testou a restauração (replay-do-repo-261117.md:162-185: 5329/5329 objetos) — mas nenhum workflow roda replay ou restauração (grep 'db reset\|replay\|schema.sql' .github/workflows → só comentário em contexto.…

### F0381 · Replay das 692 migrations num Postgres limpo falha (271 arquivos, 377 erros)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Repo não é replayável; supabase db reset não funciona; produção não reconstruível a partir do repo.
- **Fontes:** `docs/agentes/replay-do-repo-261117.md:8-11,113-120`
- **O que falta:** 1) Tornar supabase/migrations/ replayável: neutralizar as migrations que mexem nas relações fantasmas (deals, semantic_index, call_tracking, notes, leads, geo_access_logs, migration_log) e corrigir as 62 divergências de coluna, ou fazer squash num schema de base que o db reset use. 2) Criar um workflow de CI que restaure supabase/schema.sql e/ou faça o replay num Postgres efêmero com pg_cron, pg_net, vault e vector. 3) Regenerar o schema.sql periodicamente: contexto.yml:187 registra que ele não é gerado no CI.
- **Evidência:** O replay das migrations continua quebrado. docs/agentes/replay-do-repo-261117.md:8-11 registra 271 arquivos que falham e 377 erros. Em :113-120 o mesmo doc diz: 'supabase db reset / base nova a partir do repo não funciona' e 'Produção não é reconstruível a partir do repo'. Em :102-108 registra a decisão de não consertar agora ('projeto com escopo próprio'). Mesmo assim, existe um caminho de reconstrução versionado: supabase/schema.sql:1-18 é o schema de produção obtido por introspecção, feito para 'reconstruir o schema numa base vazia' e aplicável com psql -f, entrou no commit da0c2a116 (2026-11-17, #548), e a restauração foi testada num Postgres limpo segundo replay-do-repo-261117.md:162-185 (5329/5329 objetos, FALTA 0, SOBRA 0, RLS 408/408). Nenhum CI testa isso: grep -rniE 'db reset\|replay\|schema\.sql' .github/workflows/ só acha um comentário em contexto.yml:187. supabase/config.to…
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F0392 · Verificação pós-reconciliação do ledger (§9)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** A.11 §9 NI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:429`
- **O que falta:** Registrar data/saída da verificação §9 em docs/execucao/MIGRATION_RENAME_MAP.md e atualizar A_planos_execucao.md:429
- **Evidência:** Resultado da verificação §9 (docs/execucao/MIGRATION_RENAME_MAP.md:167-183) é satisfeito no banco real: /docs/contexto/supabase/migrations.md tem 700 versões, todas com 14 dígitos (grep de versão não-14-dígitos → 0), sem duplicata, idêntico aos 700 arquivos locais (comm → 0/0). Porém não há registro da execução: grep -rni 'pós-reconciliação\|reconciliação executada' docs → só docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:429 ('NI', sem registro) e o próprio MIGRATION_RENAME_MAP.md:167 (instrução).| cético: Estado-alvo satisfeito (comm ledger remoto × arquivos locais = 0/0, 700 versões de 14 dígitos), mas critério é 'Registro' e não há registro da execução da §9: docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:429 segue 'NI'. Sem evidência nova.

### F0397 · ACL de TRUNCATE por supabase_admin + 4 constraints reescritas (PR #513)

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Resgate de feat/hermes-graphify-fundacao e audit/rlx-security-fix.
- **Fontes:** `docs/agentes/branches-encerradas-261117.md:118`
- **O que falta:** Executar o ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin ... REVOKE TRUNCATE como supabase_admin (SQL Editor) e re-coletar snapshot
- **Evidência:** Constraints: supabase/migrations/20261116223100_constraints_integridade_negocio.sql:1-8 (resgate audit/rlx-security-fix, 4 ADD CONSTRAINT/índice) aplicada (migrations.md:688) e presente no banco real: tables/public/quotes.md:74 quotes_total_value_non_negative, orders.md:47 orders_total_non_negative, lead_scores.md:35 lead_scores_score_range, clients.md:98 ux_clients_phone. TRUNCATE em tabelas existentes: grants.md awk anon/authenticated com TRUNCATE → 0. MAS a 'ACL de TRUNCATE por supabase_admin' NÃO vigora: supabase/migrations/20261116223000_revoke_supabase_admin_default_truncate.sql:1-7 cabeçalho 'NAO APLICAVEL NESTE PROJETO... postgres não é membro de supabase_admin', e grants.md:1366 (Default privileges) mostra 'public| supabase_admin \| tables \| anon=arwdDxtm, authenticated=arwdDxtm' (D = TRUNCATE ainda concedido). docs/agentes/branches-encerradas-261117.md:118 cita PR #513; git l…

### F0398 · Auditoria: funções com proacl NULL ou grant a anon/PUBLIC

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** SECURITY DEFINER com ACL default é crítico.
- **Fontes:** `docs/RLS_AUDIT_QUERIES.md:49-67`
- **O que falta:** Revogar EXECUTE de anon nas trigger functions e helpers não usados em fluxo anônimo; documentar as que ficarem
- **Evidência:** Banco real functions.md (coluna 'security definer' e 'EXECUTE (roles API)'): 304 funções SECURITY DEFINER em public/private; 20 delas com EXECUTE para anon: get_current_salesperson_id, get_login_lockout_status, get_user_role, has_role (functions.md:251), is_admin_or_manager (x2), is_country_blocked, is_email_opted_out, log_audit_event, log_data_access, record_failed_login_attempt, protect_pa_nudge_content, trigger fns (audit_log_row_change, audit_trigger, auto_victory_post, fn_quotes_inbound_ordering_guard, trg_deal_stage_history, trg_invalidate_forecast_narrative_cache, trg_recording_generate_coaching, trigger_auto_coaching_on_recording). Default ACL de funções em public para owner postgres já exclui anon (grants.md:1363 'postgres=X, authenticated=X, service_role=X'), mas owner supabase_admin ainda concede anon=X (grants.md:1366). README do auditoria pendente :267 registra 'helpers de …

### F0399 · Auditoria: grants de tabela/view para anon/PUBLIC — zero em tabelas de negócio

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** information_schema.role_table_grants para anon/PUBLIC.
- **Fontes:** `docs/RLS_AUDIT_QUERIES.md:36-47`
- **O que falta:** REVOKE em massa de anon nas tabelas de negócio + ALTER DEFAULT PRIVILEGES FOR ROLE postgres ... FROM anon (grants.md:1365 ainda anon=arwdxtm)
- **Evidência:** Banco real grants.md:6-1324 (Tabelas e views): awk role=anon em objetos public → 412 linhas, 410 com SELECT e a maioria com DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE (ex. public._internal_secrets anon :10, public.accounts anon :28, public.access_denied_logs anon :16). Ou seja, a query de docs/RLS_AUDIT_QUERIES.md:36-47 não retorna zero: anon tem grant de DML em praticamente todas as tabelas de negócio; o bloqueio efetivo é só RLS (policies.md:8 '_internal_secrets Deny all' etc.; 0 policies anon com true). Default ACL para owner postgres ainda dá anon=arwdxtm em tabelas (grants.md:1364). Exceção já tratada: webhook_dispatch_rate/webhook_allowed_domains (migration 20261117060000:28).| cético: Reconfirmado: grants.md tem 412 linhas 'public.* \| anon \|' (ex. grants.md:239 public.clients anon DELETE, INSERT, ... UPDATE; :918 public.sales idem). A expectativa 'zero em tabelas de ne…

### F0400 · Auditoria: policies com USING(true)/WITH CHECK(true) — esperado zero sem justificativa

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Query em pg_policies; qualquer linha é achado.
- **Fontes:** `docs/RLS_AUDIT_QUERIES.md:9-34`
- **O que falta:** Documento de exceções com justificativa por policy e checagem em CI com allowlist
- **Evidência:** Query de docs/RLS_AUDIT_QUERIES.md:9-34 aplicada ao snapshot do banco real (policies.md, awk USING/WITH CHECK = `true`): 113 policies USING(true) + 7 WITH CHECK(true) = 116 linhas (não zero). Perfil: ~105 são SELECT para authenticated em tabelas de catálogo/gamificação (cadences, pipelines, products, race_*, teams...), 6 são ALL/INSERT para service_role (ai_narrative_cache, edge_job_locks, plan_rollback_ddl, webhook_inbound_log, edge_retry_events, v4_callback_alerts) e 1 INSERT authenticated em intent_audit_logs. Nenhuma para anon. Justificativa por linha não existe: grep 'USING(true)' docs → só correções pontuais (FASE4_PROGRESSO.md:20, F_banco_dados.md:187,310) e regra em SCHEMA_CONVENTIONS.md:27; sem lista de exceções.| cético: grep -c '`true`' policies.md → 117 linhas (USING/CHECK true), 0 para anon. Não há lista de justificativas: docs/RLS_MATRIX.md cobre só 10 tabelas sensíveis e …

### F0403 · Classificação das policies USING(true)

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Etapa 36 P: 5 placeholders removidos; faltam 176 USING/48 CHECK.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:42`
- **O que falta:** Classificar as policies true restantes (policy, role, cmd, categoria, decisão) e atualizar A_planos_execucao.md:42
- **Evidência:** Volume reduziu (doc A_planos_execucao.md:42 falava em 176 USING/48 CHECK; banco real policies.md hoje: 113 USING true / 7 CHECK true — awk), e 0 delas para anon. Mas a 'lista de exceções' classificada não existe: grep -rl 'USING(true)\|USING (true)' docs → só menções em auditorias (FASE4_PROGRESSO.md:20 C10 corrigido; F_banco_dados.md:187 leads) e regra geral SCHEMA_CONVENTIONS.md:27; nenhum arquivo classifica as 116 restantes (catálogo/service_role/pendente).| cético: Volume caiu para ~117 linhas com `true` (policies.md), mas não existe classificação/lista de exceções: grep -rliE 'using ?\(true\)' docs → só auditorias, regra em SCHEMA_CONVENTIONS.md e docs/runbooks/race-arena.md:111 (uma justificativa isolada para view_race_events).

### F0404 · Default ACLs fechadas incluindo FOR ROLE supabase_admin

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Etapa 34 P: 20260902121000 feita; falta revogar FOR ROLE supabase_admin.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:40`
- **O que falta:** Executar como supabase_admin e revalidar com supabase/tests/db01_default_acl_assertions.sql
- **Evidência:** Parte feita: supabase/migrations/20260902121000_fix_default_privileges_truncate_and_battle_score_search_path.sql:10-11 (ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE TRUNCATE ON TABLES FROM anon, authenticated — papel executor postgres), efeito visível em grants.md:1364 'public| postgres \| tables \| anon=arwdxtm' (sem D). Parte FOR ROLE supabase_admin: migration existe (supabase/migrations/20261116223000_revoke_supabase_admin_default_truncate.sql:35-36) e está registrada no ledger (migrations.md:687), porém seu cabeçalho :1-7 declara 'NAO APLICAVEL NESTE PROJETO' (postgres não é superuser/membro de supabase_admin) e o banco real ainda mostra grants.md:1366 'public \| supabase_admin \| tables \| anon=arwdDxtm, authenticated=arwdDxtm' (TRUNCATE presente). Teste de pós-condição em supabase/tests/db01_default_acl_assertions.sql. \| cético: Confirmado: 20260902121000 teve efeito para own…

### F0409 · fn_backfill_orders_conversion_seq e fn_cleanup_webhook_dedupe inacessíveis a admin via Data API

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Funções internal não executáveis nem por admin da aplicação via REST — só service_role.
- **Fontes:** `docs/SECURITY_HARDENING.md:68-69,76`
- **O que falta:** REVOKE EXECUTE ON FUNCTION public.backfill_orders_conversion_seq() e public.fn_backfill_orders_conversion_seq() FROM authenticated (ou corrigir o doc :68,76); teste RPC com JWT de admin/vendedor não executado (sem credencial)
- **Evidência:** fn_cleanup_webhook_dedupe: banco real functions.md:181 EXECUTE só 'service_role' (SECURITY DEFINER, search_path=public) → admin via Data API recebe 42501, conforme docs/SECURITY_HARDENING.md:68-69,76. fn_backfill_orders_conversion_seq: functions.md:177 EXECUTE 'authenticated, service_role' e corpo functions/public/fn_backfill_orders_conversion_seq__12ae32cb1ec02d01.sql:10-16 permite explicitamente admin ('IF NOT public.has_role(auth.uid(), ''admin'') THEN RAISE... Apenas administradores podem reexecutar o backfill') — ou seja, admin da aplicação CONSEGUE executá-la via REST, contradizendo o doc (❌* na tabela :69). Ambas estão em schema public, não em schema 'internal'.| cético: Confirmado e agravado: fn_cleanup_webhook_dedupe só service_role (functions.md:181) conforme docs/SECURITY_HARDENING.md:69,76; fn_backfill_orders_conversion_seq tem EXECUTE 'authenticated, service_role' (function…

### F0410 · Funções internal (29) com EXECUTE só para service_role

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** 29 funções internas (ex.: fn_cleanup_webhook_dedupe, fn_auto_map_inbound_seller, enqueue_v4_callback, backfill_orders_conversion_seq) só executáveis via service_role.
- **Fontes:** `docs/SECURITY_HARDENING.md:26-32`
- **O que falta:** REVOKE EXECUTE ... FROM authenticated em fn_auto_map_inbound_seller, enqueue_v4_callback e backfill_orders_conversion_seq (e nas demais internas), via migration, ou corrigir a matriz §2 de docs/SECURITY_HARDENING.md.
- **Evidência:** Snapshot supabase/functions.md (coluna EXECUTE roles API): L181 public.fn_cleanup_webhook_dedupe = service_role (ok); L176 public.fn_auto_map_inbound_seller = authenticated, service_role; L157 public.enqueue_v4_callback = authenticated, service_role; L100 public.backfill_orders_conversion_seq = authenticated, service_role. Distribuição real: 56 funções só service_role, 279 authenticated+service_role, 42 com anon (não 29/113/11). docs/SECURITY_HARDENING.md:26-32 declara a matriz; docs/SECURITY_HARDENING.md:231-233 admite que a contagem nominal não vale mais.| cético: Snapshot functions.md: L181 public.fn_cleanup_webhook_dedupe EXECUTE = service_role (ok); L176 fn_auto_map_inbound_seller = authenticated, service_role; L157 enqueue_v4_callback = authenticated, service_role; L100 backfill_orders_conversion_seq = authenticated, service_role. Só 1 dos 4 exemplos 'internal' está restrito a ser…

### F0411 · Funções public (11) granted a anon

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** check_rate_limit, count_failed_login_attempts, count_reset_requests_24h, generate_device_fingerprint executáveis por anon para fluxos pré-login.
- **Fontes:** `docs/SECURITY_HARDENING.md:34`
- **O que falta:** As 4 funções existem, mas nenhuma tem EXECUTE para anon. Duas saídas: dar GRANT TO anon, se algum fluxo pré-login vier a chamá-las, ou corrigir SECURITY_HARDENING.md §2 e ADR-008 com as 9 funções que de fato são anon (lints.md:896-904).
- **Evidência:** Snapshot supabase/functions.md: L121 public.check_rate_limit, L142 public.count_failed_login_attempts, L143 public.count_reset_requests_24h, L202 public.generate_device_fingerprint — todas com EXECUTE = authenticated, service_role (anon ausente). As 42 funções que hoje têm anon são helpers de RLS/trigger functions (functions.md: get_user_role, has_role, is_admin_or_manager, get_login_lockout_status, record_failed_login_attempt, is_country_blocked etc.), não as 4 citadas. docs/SECURITY_HARDENING.md:34 e docs/decisions/ADR-008-anon-executable-security-definer.md listam essas 4 como anon.| cético: Snapshot functions.md: L121 check_rate_limit, L142 count_failed_login_attempts, L143 count_reset_requests_24h e L202 generate_device_fingerprint têm EXECUTE = authenticated, service_role, sem anon. Nenhum chamador no código: grep em src/ e supabase/functions só acha src/integrations/supabase/type…

### F0412 · Funções user (113) granted a authenticated + service_role

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Funções de usuário como fn_convert_quote_to_sale, award_salesperson_xp, get_detailed_kpis, fn_admin_wal_health granted a authenticated.
- **Fontes:** `docs/SECURITY_HARDENING.md:33`
- **O que falta:** Atualizar docs/SECURITY_HARDENING.md §2: award_salesperson_xp é interna, get_detailed_kpis foi removida e a contagem 113 está defasada.
- **Evidência:** Snapshot supabase/functions.md: L182 public.fn_convert_quote_to_sale = authenticated, service_role (ok); L173 public.fn_admin_wal_health = authenticated, service_role (ok); L99 public.award_salesperson_xp = service_role apenas (authenticated sem EXECUTE); get_detailed_kpis ausente do banco (grep functions.md → 0) — removida em supabase/migrations/20261027120000_sales_status_canonizacao_rpcs.sql:1264 (DROP FUNCTION IF EXISTS public.get_detailed_kpis()). 279 funções com authenticated+service_role (doc diz 113).| cético: functions.md: L182 fn_convert_quote_to_sale e L173 fn_admin_wal_health = authenticated, service_role (ok). L99 award_salesperson_xp = só service_role. get_detailed_kpis não existe no banco (grep functions.md → 0) e foi removida em supabase/migrations/20261027120000_sales_status_canonizacao_rpcs.sql:1264 (DROP FUNCTION IF EXISTS public.get_detailed_kpis()).

### F0413 · Migration 20261001203300_deny_dead_tables_revoke_anon_grants revoga anon de fn_test__/fn_cron__

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** fn_test_cleanup_dedupe_privileges, fn_cron_expected_interval, fn_cron_stalled_threshold, fn_test_simulate_stalled_check, fn_test_cleanup_cron_alerts, fn_test_backdate_cron_alert sem anon.
- **Fontes:** `docs/RLS_AUDIT_QUERIES.md:70-85`
- **O que falta:** Migration com REVOKE EXECUTE ON FUNCTION public.fn_cron_expected_interval(text), public.fn_cron_stalled_threshold(text) FROM PUBLIC, anon. Também atualizar docs/RLS_AUDIT_QUERIES.md:70-85.
- **Evidência:** Arquivo existe: supabase/migrations/20261001203300_deny_dead_tables_revoke_anon_grants.sql:44-54 (REVOKE EXECUTE ... FROM anon nas 6 funções); registrada em schema_migrations (snapshot migrations.md:628). Banco real (functions.md): L194 fn_test_backdate_cron_alert, L195 fn_test_cleanup_cron_alerts, L198 fn_test_simulate_stalled_check = service_role; L196 fn_test_cleanup_dedupe_privileges = authenticated, service_role (sem anon, ok). PORÉM L183 fn_cron_expected_interval e L184 fn_cron_stalled_threshold = anon, authenticated, service_role; snapshot.json execute_public=true para ambas (grant a PUBLIC herdado de 20260712230734_*.sql:24-25 e do default de função não-DEFINER). A migration revogou só FROM anon, não FROM PUBLIC.| cético: O arquivo existe. supabase/migrations/20261001203300_deny_dead_tables_revoke_anon_grants.sql:44-54 faz um loop com 'REVOKE EXECUTE ... FROM anon' (não FROM PUB…

### F0414 · Migration de RLS 20260902221500 aplicada no banco

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Arquivo existe; CHANGELOG diz "aplicação no banco pendente".
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:161`
- **O que falta:** A policy da migration não está em pg_policies. Versionar a policy viva ou executar a migration de fato, e corrigir a nota em B_funcionalidades_docs.md:161.
- **Evidência:** Arquivo supabase/migrations/20260902221500_enable_rls_orphan_tables_and_fix_search_path.sql existe; consta no ledger (snapshot migrations.md:608) mas foi inserida por marcação, sem execução, em supabase/migrations/20261117090000_marca_594_migrations_como_aplicadas.sql:613. Efeito RLS presente: snapshot tables.md L8 ab_tests, L158-160 experiment_assignments/variants/experiments, L211 migration_log, L324 security_events = RLS sim (roles e user_permissions_cache não existem no banco; a migration usa to_regclass guard). SECURITY DEFINER sem search_path: 0 em functions.md. Policy criada pela migration (L83 security_events_admin_select) NÃO existe em produção (grep policies.md → 0); produção tem 'Admins and managers can read security_events' (policies.md:805), sem migration correspondente.| cético: A migration 20260902221500_enable_rls_orphan_tables_and_fix_search_path.sql:81-84 cria a policy…

### F0415 · Owner-folder em todos os buckets

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** P030 P: 20260831130002.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:134`
- **O que falta:** Criar policy owner-folder para winloss-reports, ou documentar que o acesso a esse bucket é intencionalmente só via service_role (edge function export-winloss-pdf).
- **Evidência:** Snapshot storage.md: 6 buckets (avatars, call-recordings, quote-pdfs, report-exports, report-snapshots, winloss-reports). policies.md:1027-1040: policies owner-folder ((storage.foldername(name))[1] = auth.uid()) para avatars, call-recordings, quote-pdfs, report-snapshots e report-exports. winloss-reports: zero policies em storage.objects (grep 'winloss' policies.md só acha tabelas public.*); supabase/migrations/20260831130002_harden_storage_buckets.sql:41-52 cria o bucket privado mas nenhuma policy para ele.| cético: storage.md:7-12 lista 6 buckets. policies.md:1027-1040 tem policies owner-folder ((storage.foldername(name))[1] = auth.uid()) para avatars, call-recordings, quote-pdfs, report-snapshots e report-exports. winloss-reports (storage.md:12) não tem nenhuma policy em storage.objects. supabase/migrations/20260831130002_harden_storage_buckets.sql:39-52 cria o bucket privado, mas ne…

### F0422 · Policies versionadas em migrations (auditabilidade)

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** ADR-003: todas as policies são versionadas em migrations.
- **Fontes:** `docs/decisions/ADR-003-supabase-rls-security.md:27-27`
- **O que falta:** Versionar as policies em drift em migration e, opcionalmente, adicionar uma checagem de CI que compare pg_policies com as migrations.
- **Evidência:** docs/decisions/ADR-003-supabase-rls-security.md:27 afirma 'todas as policies são versionadas em migrations'. Produção: 1033 policies (1017 public, 14 storage, 2 realtime — snapshot.json). Cruzamento com grep de CREATE POLICY em supabase/migrations/_.sql: ~11 policies public sem nenhuma migration (ex.: 'Admins and managers can manage experiments', 'Admins and managers can read security_events' policies.md:805, 'Users can read their own 2FA log', 'anon can insert error logs'); 10 admin_delete__ vêm de format() em 20261001193000_soft_delete_business_tables.sql:109. Dump supabase/schema.sql contém todas, mas é snapshot, não migration.| cético: docs/decisions/ADR-003-supabase-rls-security.md:27 afirma que todas as policies estão versionadas em migrations. Pelo menos 8 policies vivas não têm nenhum CREATE POLICY em supabase/migrations (grep -rlF → 0; mesma lista de F0421). Elas aparecem só em…

### F0426 · Query viva de policies USING(true) com lista de exceções

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** T7 P.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:328`
- **O que falta:** Criar a lista versionada de exceções USING(true) com justificativa e um teste SQL que falhe para qualquer policy fora dela.
- **Evidência:** Query viva existe em docs/RLS_AUDIT_QUERIES.md:9-24 (SELECT ... FROM pg_policies WHERE qual/with_check = true). Lista de exceções versionada ausente: grep -rli 'using\s*\(\s*true' supabase/tests scripts → 0 arquivos com allowlist; supabase/tests/rls_test_suite.sql não trata USING(true). Produção hoje tem 117 policies com USING/WITH CHECK literal true (snapshot.json db.policies), sem classificação. docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:328 (T7 P).| cético: A query viva existe em docs/RLS_AUDIT_QUERIES.md:9-35. Não há lista de exceções versionada: grep em docs, scripts, supabase/tests, tests e .github só acha menções em auditorias e docs/SCHEMA_CONVENTIONS.md:27 (regra genérica), nenhuma allowlist. docs/estado/08_ADMIN_SEGURANCA.md:221 cita 96 tabelas com USING (true) sem classificação.

### F0434 · SECURITY DEFINER endurecidas (ADR-008)

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Etapa 39 P: ADR-008; 26 migrations com SET search_path; teste e2e security-definer-rpc-access.spec.ts; faltam 15/204 grants e 8 funções do Advisor.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:45`
- **O que falta:** Atualizar o ADR-008 com as 9 funções anon reais, prover PGHOST/env no workflow para o spec rodar e confirmar o Security Advisor no painel Supabase (sem acesso nesta sessão).
- **Evidência:** docs/decisions/ADR-008-anon-executable-security-definer.md existe (Status Aceito). tests/e2e/security-definer-rpc-access.spec.ts existe (2 tests) mas :70 test.skip(!HAS_PG|\| !HAS_HTTP) e grep PGHOST .github/workflows → 0: nunca roda no CI. Banco: 0 SECURITY DEFINER sem search_path (functions.md); porém snapshot lints.md:896-904 lista 9 rpc_anon_executable (SECURITY DEFINER chamável por anon: get_current_salesperson_id, get_login_lockout_status, get_user_role, has_role, is_admin_or_manager...), e a lista de exceções do ADR-008 (check_rate_limit, count_failed_login_attempts, count_reset_requests_24h) não bate com as funções que de fato têm anon (functions.md L121/L142/L143 = sem anon). Supabase Advisor não está no snapshot — 'Advisor sem alertas' não verificável aqui. \| cético: ADR-008 e tests/e2e/security-definer-rpc-access.spec.ts existem. Porém o spec, na linha :70, faz test.skip(!HA…

### F3271 · Etapa canônica 26/08 nº 72: Corrigir filtros .in de alta cardinalidade (4 violações)

- **Tipo:** Service/lib
- **O que os docs afirmam:** Etapa canônica 72 (plano 26/08, matriz de status 30/08, estado ⬜): join/RPC/batching; testes unitários verdes.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:227-227`
- **O que falta:** supabase/functions/_shared/chunked_in_lint_test.ts existe mas nenhum import encontrado (grep)
- **Evidência:** supabase/functions/_shared/chunked_in_lint_test.ts existe mas nenhum import encontrado (grep)| CONTESTADO pelo cético (IMPLEMENTADO): O helper supabase/functions/_shared/chunked-in.ts é importado por mais de 20 edges (ex.: send-alert-notifications, ranking-api, generate-revenue-forecast). O lint supabase/functions/_shared/chunked_in_lint_test.ts:46 não é importado porque é teste deno, e roda em .github/workflows/qa-exhaustive.yml:78-81. Emulei a regra do lint (regex e whitelist das linhas 25-62) em Python sobre supabase/functions: TOTAL 0 violações. O guard do front src/lib/supabase/all-in-calls.test.ts passou (1 de 1), com helper em src/lib/supabase/chunkedIn.ts. O deno local não rodou: o import de https://deno.land/std falhou por rede.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3272 · Service/lib catalog-adapter (3 afirmações nos docs)

- **Tipo:** Service/lib
- **O que os docs afirmam:** Normalizador usa null para flags não observadas; reconciliação recusa catálogo não atestado.| Adaptador normaliza todos esses objetos a partir de exportação de metadados. \| Normaliza exportação de metadados do catálogo; recusa linhas de negócio, projeto divergente e metadados não read-only; marca tudo como não verificado.
- **Fontes:** `docs/graphify/EXECUCAO_LOTE_F_P0_2026-09-11.md:11`, `docs/graphify/EXECUCAO_LOTE_C_2026-09-11.md:5-11`, `docs/graphify/README.md:47-53`
- **O que falta:** scripts/graphify/catalog-adapter.mjs existe mas nenhum import encontrado (grep)
- **Evidência:** scripts/graphify/catalog-adapter.mjs existe mas nenhum import encontrado (grep)| CONTESTADO pelo cético (IMPLEMENTADO): É um script CLI, não um módulo importável. Fios encontrados: package.json:53 (graphify:catalog → node scripts/graphify/catalog-adapter.mjs) e o import em scripts/graphify/reconcile-catalog.mjs:7. As recusas estão em scripts/graphify/catalog-adapter.mjs:69 (rows/records/data), :70 (projeto divergente) e :71 (sessão não read-only); flag não observada vira null em :21. Testes em scripts/graphify/catalog-adapter.test.mjs:32-34 (assert null) e :37 (recusas); node --test resultou em 3 pass, 0 fail.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F0447 · 403 de 408 FKs documentadas (coluna → tabela.id) existem no banco

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Comparação mecânica das constraints "FK → `tabela.id`" do dicionário contra relationships.md do snapshot. 5 FKs documentadas não existem como constraint no banco (itens individuais abaixo).
- **Fontes:** `docs/DATA_DICTIONARY.md:406-7104`
- **O que falta:** Alinhar docs/DATA_DICTIONARY.md a relationships.md, ou criar as constraints que faltam por migration.
- **Evidência:** Reexecutei a comparação: docs/DATA_DICTIONARY.md (padrão '### `tabela`' + 'FK → `alvo.id`') = 413 FKs documentadas; docs/contexto/supabase/relationships.md = 420 FKs reais. 20 documentadas não existem como constraint (vs 5 do doc), ex.: access_denied_logs.user_id→auth.users (DATA_DICTIONARY.md:422), audit_logs.changed_by→auth.users (:847), cadence_enrollments._→cadences/clients (:1108-1109, tabela inexistente), call_tracking._ (:1494-1496, tabela inexistente), notifications.user_id→auth.users (:3790), territory_history.territory_id→sales_territories (:6244; real aponta para public.territories, relationships.md:382), webhook_logs.webhook_event_id (:6652), user_roles.assigned_by (:6429), webhooks.user_id (:6668), whatsapp_template_versions.created_by (:6753); 3 são artefatos de parse (cs_tickets.urgent, follow_up_territory_rules.otherwise, pricing_rules.tier_pricing).| cético: Amostra con…

### F0451 · 78 FKs sem ON DELETE explícito (18,9%)

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** 78 chaves estrangeiras reais sem ação ON DELETE explícita.
- **Fontes:** `docs/execucao/VALIDACAO_ADVERSARIAL_E_CORRECOES_2026-09-02.md:134`
- **O que falta:** Decidir e aplicar ON DELETE nas 7 FKs (activities/clients/products/suppliers/teams.deleted_by, approval_requests.requester_id, geo_blocked_regions.blocked_by), ou registrar aceite.
- **Evidência:** Tratamento aplicado: supabase/migrations/20261001190500_fk_on_delete_actions.sql:1-25 (semântica SET NULL/CASCADE/RESTRICT, idempotente), aplicada em produção (docs/contexto/supabase/migrations.md:620). Banco real hoje: relationships.md = 420 FKs; coluna 'on delete' = CASCADE 276, SET NULL 133, RESTRICT 4, NO ACTION 7 (1,7%, não mais 78/18,9%). Restam sem ação explícita 7 FKs, todas → auth.users: activities.deleted_by (relationships.md:19), approval_requests.requester_id (:34), clients.deleted_by (:92), geo_blocked_regions.blocked_by (:183), products.deleted_by (:256), suppliers.deleted_by (:367), teams.deleted_by (:378).| cético: Confirmado: a coluna 'on delete' de relationships.md tem CASCADE 276, SET NULL 133, RESTRICT 4 e NO ACTION 7. As 7 NO ACTION apontam todas para auth.users: relationships.md:19, 34, 92, 183, 256, 367, 378. O tratamento em massa está em 20261001190500_fk_on_dele…

### F0454 · Buckets usados pelo código: call-recordings, quote-pdfs, report-snapshots, winloss-reports (winloss-reports criado em runtime best-effort)

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Doc: código referencia 4 buckets; winloss-reports é criado em runtime fora das migrations; SINCRONIA mediu 6 buckets e 0 objetos no destino.
- **Fontes:** `docs/auditoria/MATRIZ_FORENSE_BANCOS_E_CONTRATOS_2026-08-26.md:288,291-294`
- **O que falta:** Remover o createBucket de export-winloss-pdf/index.ts:94 e, se usuários forem ler o bucket direto, criar policy SELECT em storage.objects para winloss-reports.
- **Evidência:** Os 4 buckets existem no banco real: docs/contexto/supabase/storage.md:8 (call-recordings), :9 (quote-pdfs), :11 (report-snapshots), :12 (winloss-reports, criado 2026-08-31). winloss-reports agora nasce em migration: supabase/migrations/20260831130002_harden_storage_buckets.sql:39-55 (INSERT em storage.buckets), aplicada (migrations.md:601). Porém: (a) grep -c 'winloss-reports' policies.md → 0 — nenhuma policy em storage.objects para esse bucket (só service_role alcança); (b) a criação best-effort em runtime continua no código: supabase/functions/export-winloss-pdf/index.ts:88-94 (`createBucket(bucket, { public: false }).catch(() => null)`), function na allowlist (.github/workflows/deploy.yml:144).| cético: Confirmado: os 4 buckets existem (storage.md:8,9,11,12), mas policies.md:1027-1040 não tem nenhuma policy com bucket 'winloss-reports' (grep winloss em policies.md só acha tabelas pub…

### F0466 · Handoff P043: Medir seis grupos de índices duplicados e propor remoção

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Fila canônica do handoff (onda 5): Medir seis grupos de índices duplicados e propor remoção. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:339-339`
- **O que falta:** Proposta formal de remoção, com parecer por par, e migration de DROP INDEX dos duplicados após autorização do dono.
- **Evidência:** Medição existe: docs/auditoria/VALIDACAO_SINCRONIA_GITHUB_SUPABASE_2026-09-10.md:180-184 identifica 6 pares idênticos (audit_log x2, clients, conversation_analyses, race_badges, saved_filters) e afirma 'Nenhum índice foi removido'. Snapshot atual confirma que os pares continuam: contexto/supabase/indexes.md — audit_log: idx_audit_created/idx_audit_log_created_at (created_at) e idx_audit_user/idx_audit_log_user_id (user_id); clients: idx_clients_created/idx_clients_created_at e idx_clients_deleted/idx_clients_deleted_at; conversation_analyses: idx_conv_analyses_analyzed_by/idx_conversation_analyses_analyzed_by e idx_conv_analyses_created/idx_conversation_analyses_created_at; race_badges: race_badges_salesperson_id_badge_code_season_id_key/race_badges_unique_per_season; saved_filters: idx_saved_filters_user/idx_saved_filters_user_entity. Handoff segue '[ ]' em docs/handoff/HANDOFF_CLINE_E…

### F0472 · Migration 20260530 sem CREATE POLICY IF NOT EXISTS (sintaxe inválida)

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Postgres não suporta CREATE POLICY IF NOT EXISTS; migração 20260530 pode ter falhado deixando RLS de sales/activities indeterminado.
- **Fontes:** `docs/auditoria/RELATORIO_FALHAS.md:650-652`
- **O que falta:** Corrigir o arquivo histórico 20260530000002, trocando por DROP IF EXISTS + CREATE ou convertendo em no-op, para que um banco novo ou staging não quebre ao aplicar as migrations.
- **Evidência:** Arquivo histórico continua com sintaxe inválida: supabase/migrations/20260530000002_enable_rls_and_remove_env_risk.sql:50,53,57,60,64,68,72,75,79,82 ('CREATE POLICY IF NOT EXISTS'), não foi reescrito como DROP IF EXISTS + CREATE (renomeado de 20260530_ conforme docs/execucao/MIGRATION_RENAME_MAP.md:25). Estado real resolvido: nenhuma policy *_select_policy/_insert_policy no banco (grep em contexto/supabase/policies.md → 0); sales e activities têm RLS=sim e policies por papel (policies.md:35-38 activities; :730-737 sales); a migration supabase/migrations/20261119700000_fix_rls_sales_activities_using_true.sql:21-24 faz DROP POLICY IF EXISTS dessas quatro e está no ledger (contexto/supabase/migrations.md:706). Ledger também registra 20260530000002 (migrations.md:443). RELATORIO_FALHAS.md:650-652 ainda cita o caminho antigo.| cético: O arquivo continua com a sintaxe inválida: supabase/migra…

### F0475 · Migration 20260902121000 incompleta: faltam REVOKE TRUNCATE FOR ROLE supabase_admin (2 default grants restantes)

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Doc: SQL executa ALTER DEFAULT PRIVILEGES sem FOR ROLE supabase_admin; recomenda nova migration com FOR ROLE validada em staging.
- **Fontes:** `docs/auditoria/VALIDACAO_SINCRONIA_GITHUB_SUPABASE_2026-09-10.md:111-115,197,208-211`
- **O que falta:** Confirmar pg_default_acl de supabase_admin no banco. Se o TRUNCATE ainda estiver lá, revogar como supabase_admin (pelo dashboard) e ajustar o cabeçalho do arquivo.
- **Evidência:** Correção versionada existe: supabase/migrations/20261116223000_revoke_supabase_admin_default_truncate.sql:35-36 ('ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public REVOKE TRUNCATE ON TABLES FROM anon, authenticated') com DO block de pós-condição (:38-55) e teste supabase/tests/db01_default_acl_assertions.sql; versão consta no ledger (contexto/supabase/migrations.md:687). Porém o cabeçalho do próprio arquivo (:1-7) afirma 'NAO APLICAVEL NESTE PROJETO… o run aborta e a versao nao e registrada' porque o usuário postgres não é membro de supabase_admin — contradição com o ledger. pg_default_acl não é introspectado no snapshot, então o estado efetivo do default ACL não é confirmável aqui. A original 20260902121000 (:10) segue sem FOR ROLE, como o doc descreve (VALIDACAO_SINCRONIA_GITHUB_SUPABASE_2026-09-10.md:111-115).| cético: A migration nova existe: supabase/migrations/2026…

### F0498 · Nenhuma function/trigger/cron alimenta as tabelas da lista A

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Doc afirma que nenhuma function/trigger/cron definida nas migrations escreve nas tabelas da lista A (zero escritor SQL interno).
- **Fontes:** `docs/DEAD_TABLES.md:19-21`
- **O que falta:** Corrigir docs/DEAD_TABLES.md: registrar anonymize_data_subject como escritor SQL (UPDATE LGPD) de buying_committee e website_visitor_logs e retirar call_tracking da lista A (já inexistente).
- **Evidência:** Lista A em docs/DEAD_TABLES.md:19-47. No banco real: nenhum `INSERT INTO` nas 22 tabelas em contexto/supabase/functions/public/*.sql; contexto/supabase/cron.md sem referência (grep → 0); triggers em contexto/supabase/triggers.md:42,90-91,105,185-186,247-248,316,381 são apenas `updated_at`/consent/AFTER INSERT sobre a própria tabela (não a alimentam). PORÉM a função SQL `anonymize_data_subject` escreve nelas: contexto/supabase/functions/public/anonymize_data_subject__27b00b89e193986b.sql:152 (`UPDATE public.buying_committee`) e :501 (`UPDATE public.website_visitor_logs`). Além disso `call_tracking` da lista nem existe no banco (contexto/supabase/tables/public/call_tracking.md ausente).| cético: Afirmação de docs/DEAD_TABLES.md:19-21 contradita pelo banco real: grep de INSERT/UPDATE/DELETE nas 22 tabelas da lista A em contexto/supabase/functions/ → só 2 hits, contexto/supabase/functions/p…

### F0512 · Tabela leads existe ou chamadas trocadas

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Etapa 45 P: sequence-runner:366 e ai-agent-orchestrator:300 consultam leads inexistente.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:49`
- **O que falta:** Em supabase/functions/ai-agent-orchestrator/index.ts, trocar 'leads' na :219 e na :294 por uma tabela que existe (sales ou lead_scores) ou tirar o tipo 'lead'. Bug latente: a function não está deployada.
- **Evidência:** sequence-runner corrigido: supabase/functions/sequence-runner/index.ts:361-366 usa supabase.from("sales") com label 'sequence-runner.leads'. ai-agent-orchestrator NÃO: supabase/functions/ai-agent-orchestrator/index.ts:292-297 `.from('leads').update({score})`. Tabela leads ausente no banco real: grep 'public.leads' em contexto/supabase/tables.md e views.md → 0 resultados. ai-agent-orchestrator está fora da allowlist (.github/workflows/deploy.yml:144, grep → 0), logo não roda em produção.| cético: sequence-runner corrigido: supabase/functions/sequence-runner/index.ts:364 usa .from("sales") (o label 'sequence-runner.leads' na :366 é só rótulo). ai-agent-orchestrator ainda usa leads em DOIS lugares: supabase/functions/ai-agent-orchestrator/index.ts:218-219 (loadEntityForCaller faz entityType 'lead' → tabela 'leads') e :293-296 (update_lead_score faz .from('leads').update). Não existe tabela…

### F0513 · Tabela leads referenciada por 4 functions mas inexistente

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Doc top-15/§2.6: ai-agent-orchestrator, report-builder-execute, report-embed-public e sequence-runner referenciam `leads`, que não existe.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:270-276, 357-357`
- **O que falta:** Tirar 'leads' de ALLOWED_ENTITIES em supabase/functions/report-embed-public/index.ts:18 (está em produção) e de report-builder-execute/index.ts:22,30; ajustar ai-agent-orchestrator/index.ts:219,294. Outra saída: criar a tabela leads com RLS.
- **Evidência:** Tabela leads inexistente no banco (contexto/supabase/tables.md e views.md: 0 ocorrências). sequence-runner já mapeado para sales (sequence-runner/index.ts:364). Ainda referenciam leads: ai-agent-orchestrator/index.ts:294 (fora da allowlist); report-builder-execute/index.ts:22,30,46 aceita base 'leads' e faz supabase.from(entity) na linha 172 (fora da allowlist); report-embed-public/index.ts:18,31,50 ALLOWED_ENTITIES inclui 'leads' e admin.from(entity) na linha 247 — esta ESTÁ na allowlist (deploy.yml:144), logo um embed com entity=leads falha em produção.| cético: Confirmado: grep "['\"]leads['\"]" em supabase/functions → report-builder-execute/index.ts:22,30; report-embed-public/index.ts:18 (ALLOWED_ENTITIES contém 'leads'), consumido em admin.from(entity) na :246; ai-agent-orchestrator/index.ts:219,294. Só sequence-runner foi remapeado (index.ts:364 → sales). report-embed-public e seq…

### F3306 · updated_at em todas as tabelas (146 sem)

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** 146 tabelas sem updated_at; 37 com coluna e sem trigger.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:283`
- **O que falta:** Adicionar updated_at às 235 tabelas sem a coluna (ou registrar a exceção para tabelas append-only/log) e criar o trigger nas 7 tabelas que têm a coluna mas não o trigger.
- **Evidência:** As funções de trigger existem (functions/public/set_updated_at__12ae32cb1ec02d01.sql, handle_updated_at___.sql, update_updated_at_column___.sql) e há muitos triggers de updated_at em triggers.md. Contagem sobre tables/public/*.md: 408 tabelas, das quais 235 não têm a coluna updated_at. 7 têm a coluna mas nenhum trigger de updated_at: app_config, churn_alert_settings, client_churn_alerts_state, data_retention_policies, _internal_secrets, stage_probabilities e v4_callback_alert_settings. A convenção 'em todas as tabelas' não está cumprida.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F0520 · Handoff P059: Teste de contrato entre .from/.rpc e objetos vivos/tipos

- **Tipo:** Teste
- **O que os docs afirmam:** Fila canônica do handoff (onda 6): Teste de contrato entre .from/.rpc e objetos vivos/tipos. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:360-360`
- **O que falta:** Um gate obrigatório em CI que cruze .from/.rpc de src/ E de supabase/functions/ com o catálogo vivo (snapshot contexto/supabase ou types.ts) e falhe em objeto ausente. Exemplo: um step em pr-checks.yml rodando scripts/graphify/static-contracts.mjs contra types.ts.
- **Evidência:** ausente: ls tests/contracts scripts/check-contracts* → 0 resultados. Existem peças soltas: scripts/graphify/static-contracts.mjs:21-27 extrai .from/.rpc/.functions.invoke e :277 process.exitCode=1, mas grep 'static-contracts\|graphify:contracts' em .github/workflows/_.yml → 0 (não roda em CI); scripts/graphify/reconcile-catalog.mjs:31 idem sem CI; tests/migrations/__contract_test.ts só via deno task test:migrations (deno.json:4), fora da CI (ver F0525); scripts/check-data-layer.mjs:5-9 só valida camada (quem pode chamar .from/.rpc), não existência do objeto.| cético: Continua sem tests/contracts e sem scripts/check-contracts*. graphify:contracts e graphify:reconcile (package.json:52,54) não são chamados em nenhum workflow: grep em .github/workflows só acha graphify:test (pr-checks.yml:144, graphify.yml:50). Cobertura parcial que o verificador não citou: o job gen-types-drift (pr-checks.…

### F0522 · Plano 30/08 etapa 59 (P059): Teste de contrato entre .from/.rpc e objetos vivos/tipos

- **Tipo:** Teste
- **O que os docs afirmam:** Etapa 59 do plano de 100 etapas (auditoria 30/08; = P059 do handoff): Falha explícita para relações ou RPCs inexistentes.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:720-720`
- **O que falta:** Igual a F0520: um gate obrigatório que falhe para relação/RPC inexistente em src/ e em supabase/functions/.
- **Evidência:** Mesmo artefato de F0520: ausente tests/contracts/* e scripts/check-contracts* (ls → 0). scripts/graphify/static-contracts.mjs:21-27,277 e reconcile-catalog.mjs:31 existem mas grep em .github/workflows/_.yml → 0 chamadores; tests/migrations/__contract_test.ts não entram no runner (scripts/deno-test-suite.mjs:29,59).| cético: Mesmo artefato de F0520: não existe tests/contracts nem scripts/check-contracts*. static-contracts e reconcile-catalog não rodam em CI. O que existe é parcial: pr-checks.yml:669-697 (gen-types-drift, opcional, pula sem token) mais o typecheck com client tipado (client.ts:9), só para o front. Nada falha para relação inexistente em edge function (prova: 'leads' em report-embed-public/index.ts:18).

### F0525 · Testes de contrato de migrations incluídos no runner Deno

- **Tipo:** Teste
- **O que os docs afirmam:** tests/migrations/*.ts (deno.json:4) não entram: scripts/deno-test-suite.mjs:29 só varre supabase/functions.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:85`
- **O que falta:** Adicionar ao job Deno de .github/workflows/pr-checks.yml (:367) um step 'deno task test:migrations', ou incluir tests/migrations no walk de scripts/deno-test-suite.mjs:59. Depois, apagar a cópia duplicada em supabase/functions/_shared/canonical-hardening_contract_test.ts.
- **Evidência:** scripts/deno-test-suite.mjs:29 FUNCTIONS_DIR = supabase/functions e :59 allFiles = walk(FUNCTIONS_DIR) — tests/migrations não é varrido. deno.json:4 define task test:migrations, mas grep 'test:migrations\|tests/migrations' em .github/workflows/*.yml → 0 resultados. CI só roda deno-test-suite (pr-checks.yml:367,370).| cético: scripts/deno-test-suite.mjs:30 FUNCTIONS_DIR = supabase/functions; o walk(FUNCTIONS_DIR) (:59) não varre tests/migrations. Workflows não chamam test:migrations: grep 'test:migrations\|tests/migrations' → 0. A CI só roda deno-test-suite (pr-checks.yml:367,370). Fato novo: uma versão reduzida (289 linhas) do contract test canônico está em supabase/functions/_shared/canonical-hardening_contract_test.ts e casa o padrão _test.ts do walk (:44). Logo, parte do contrato canônico já roda em CI. Os 3 arquivos de tests/migrations/ (567+100+31 linhas) continuam fora.

### F0528 · Field history tracking completo

- **Tipo:** Trigger
- **O que os docs afirmam:** Falta histórico completo de alterações por campo.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:158`
- **O que falta:** Gravar o diff por coluna em audit_log_row_change (só as chaves que mudaram entre OLD e NEW) e criar um componente de histórico por campo nas telas de venda, cliente e orçamento.
- **Evidência:** Existe auditoria por linha: trigger audit_business_changes → public.audit_log_row_change em 10 tabelas (contexto/supabase/triggers.md: activities, client_portfolio, clients, commissions, orders, quotes, sales, user_roles, webhooks, winloss_webhook_subscriptions); corpo functions/public/audit_log_row_change__12ae32cb1ec02d01.sql:30-52 grava old_data/new_data da linha inteira e changes = jsonb_build_object('old','new') — sem diff por coluna. audit_logs com ~33.7k linhas (stats.md:17). entity_versions existe mas vazia (stats.md:147, 0 linhas) e create_version não tem trigger (grep create_version em triggers.md → 0). UI: src/pages/AuditLogsPage.tsx:266-272 exibe JSON bruto de changes em /audit-logs (AppRoutes.tsx:525); não há componente de histórico por campo nas páginas de entidade (grep 'field_history\|FieldHistory' em src → 0).| cético: contexto/supabase/functions/public/audit_log_row_ch…

### F3310 · Trigger create_version anexado (versionamento de entidades)

- **Tipo:** Trigger
- **O que os docs afirmam:** create_version nunca anexada; entity_versions morta.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:88,55`
- **O que falta:** CREATE TRIGGER chamando create_version nas tabelas versionadas, mais uma UI/hook que leia entity_versions. Ou registrar a remoção e dropar a função e a tabela.
- **Evidência:** função create_version existe mas nenhum trigger a executa (triggers.md)| cético: public.create_version existe (functions.md:146; sem migration de origem, '—'), mas nenhum trigger a executa: grep create_version em triggers.md → 0. public.entity_versions existe (tables.md:153) e tem 0 linhas (stats.md:147). Nenhum uso em src (grep entity_versions\|create_version em src, fora de types.ts → 0).

### F3312 · Trigger trg_log_price_change (4 afirmações nos docs)

- **Tipo:** Trigger
- **O que os docs afirmam:** Definir payload, retenção e idempotência de fn_log_price_change/trg_log_price_change. Saída esperada: teste de mudança auditada. Gate: autorização de função/trigger.| Doc: histórico de preço não é gravado; nenhuma função menciona price_history. \| Defeito comprovado: trg_log_price_change está ligado a product_variants e chama fn_log_price_change, que apenas retorna NEW; a auditoria de preço prometida não ocorre. Observação: o doc refere-se ao projeto ORIGEM rapjswienfhkobhlamxb, que AGENTS.md declara não pertencer a este repo; verificar também o equivalente no destino usyxfpqlsspldubptrdl. \| Etapa canônica 33 (plano 26/08, matriz de status 30/08, estado 🔒): payload, retenção, idempotência…
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:698-698`, `docs/auditoria/MATRIZ_FORENSE_BANCOS_E_CONTRATOS_2026-08-26.md:181`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:426-426`, `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:166-166`
- **O que falta:** Teste automatizado de mudança auditada: alterar unit_price em supplier_products e conferir o registro em price_history. Também não há retenção nem idempotência definidas para price_history.
- **Evidência:** fn_log_price_change e trg_log_price_change são do projeto origem e não existem no destino: grep -c log_price functions.md triggers.md → 0/0. A auditoria de preço funciona por outro caminho: triggers.md:344 trigger_record_price_history AFTER UPDATE ON supplier_products → public.record_price_history, que faz INSERT INTO price_history (record_price_history__12ae32cb1ec02d01.sql:9) e em price_alerts (:14). public.price_history existe com RLS (tables.md:247) e é lida em src/hooks/usePriceHistory.ts:37, usado por src/pages/PriceEvolution.tsx e ComparadorPrecos.tsx (AppRoutes.tsx:427,755). Falta o teste exigido: grep -rn price_history supabase/tests tests e2e → 0 resultados.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F0529 · ADR de migrations e gate check-migrations

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Etapa 15 P: MIGRATION_RENAME_MAP e scripts/check-migrations.mjs; sem ADR; ledger vivo não reparado.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:31`
- **O que falta:** Criar docs/decisions/ADR-011-migrations.md com a convenção de versão, o fluxo DDL via MCP + arquivo e os gates.
- **Evidência:** Gate existe e roda: scripts/check-migrations.mjs (207 linhas), pr-checks.yml:184-190. Ledger reparado: contexto/supabase/migrations.md 700 versões = 700 arquivos; docs/agentes/achados-auditoria-261117.md:147; replay-do-repo-261117.md:114 (PR #543). ADR ausente: ls docs/decisions → ADR-001..ADR-010, nenhuma sobre migrations (grep -il migration docs/decisions/*.md → só ADR-003 cita policies versionadas); docs/execucao/MIGRATION_RENAME_MAP.md:1,167 é mapa, não ADR.| cético: O gate e o ledger estão ok (700/700, pr-checks.yml:184-190). Falta o ADR: ls docs/decisions → ADR-001 a ADR-010, nenhum sobre migrations; find docs -ipath '_adr_' fora de docs/decisions → 0; grep -rlE '^# ADR' docs fora de decisions → 0.

### F0531 · Diagrama ER automatizado (pg_dump --schema-only → mermaid no CI mensal)

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Doc aponta ausência de ER para ~398 tabelas; ação: gerar ER no CI mensal.
- **Fontes:** `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:179,183,577`
- **O que falta:** Gerar o ER a partir do banco real em workflow agendado, por exemplo em .github/workflows/contexto.yml, e versionar em docs/ER.md. Exige mudar o limite de 120 tabelas em snapshot.py:1388 (diagrama por domínio ou top-N, como faz gen-data-dict).
- **Evidência:** docs/ER.md existe (erDiagram mermaid, 40 tabelas mais conectadas), gerado por scripts/gen-data-dict.mjs:3-4,23 a partir de supabase/migrations/_.sql (não de pg_dump do banco real) e rodado manualmente: grep 'gen-data-dict\|ER.md' em .github/workflows/_.yml e package.json → 0. scripts/supabase_snapshot/snapshot.py:1393 tem código de ER mas o snapshot publicado não contém erDiagram (grep em contexto/supabase/*.md → 0). contexto.yml:44-45 roda de hora em hora mas não gera ER. docs/estado/11_DADOS_BANCO.md:4 é coleta de 2026-08-16.| cético: docs/ER.md:3-5 é gerado à mão por scripts/gen-data-dict.mjs (último commit em 2026-10-02); nenhum workflow nem script do package.json o chama. Fato novo: scripts/supabase_snapshot/snapshot.py:1388 só gera o ER se houver até 120 tabelas ('0 < len(tables) <= 120'). Por isso o snapshot horário do banco real omite o diagrama: contexto/supabase/relationships.…

### F0532 · Diff de schema (funções/views/policies) em CI

- **Tipo:** Workflow CI
- **O que os docs afirmam:** NÃO VERIFICADO (lacuna mantida).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:286`
- **O que falta:** Um job agendado ou de PR que compare a definição de funções/views/policies das migrations com contexto/supabase/{functions,views,policies}.md e falhe em divergência. Outra saída: tornar db-probe.yml agendado e fazer ele falhar quando aparecer 'false'.
- **Evidência:** .github/workflows/migrations-drift.yml:1-13,24-26 compara só VERSÕES do ledger (repo × supabase_migrations.schema_migrations), diário e em PR. .github/workflows/contexto.yml:396-398 detecta mudança estrutural entre snapshots sucessivos do banco (STRUCTURAL diff), não repo × prod de funções/views/policies. scripts/graphify/reconcile-catalog.mjs:31 e static-contracts.mjs:277 fazem a reconciliação estático × observado mas grep em .github/workflows → 0 chamadores.| cético: Peças que existem: migrations-drift.yml:1-26 (compara só as versões do ledger, diário e em PR); pr-checks.yml:669-697 gen-types-drift (types.ts × banco vivo: cobre assinatura de tabelas, views e funções, mas pula sem token e não cobre policies); db-probe.yml:12-63 sonda a existência no banco dos objetos das migrations recentes (funções, policies, cron), mas só roda manual (workflow_dispatch) e não reprova objeto ausente. …

## Não verificável (3)

### F0150 · Banco canônico usyxfpqlsspldubptrdl confirmado via Management API (ACTIVE_HEALTHY, us-east-2)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Doc confirma o projeto canônico pela Management API.
- **Fontes:** `docs/auditoria/VALIDACAO_SINCRONIA_GITHUB_SUPABASE_2026-09-10.md:6-7`
- **O que falta:** Token da Management API para confirmar ACTIVE_HEALTHY/us-east-2.
- **Evidência:** A confirmação via Management API (ACTIVE_HEALTHY, us-east-2) exige token da Management API que não tenho (docs/auditoria/VALIDACAO_SINCRONIA_GITHUB_SUPABASE_2026-09-10.md:6-7). Parte verificável no repo confere: supabase/config.toml:1 project_id = "usyxfpqlsspldubptrdl"; src/integrations/supabase/env.ts:5 fallback https://usyxfpqlsspldubptrdl.supabase.co; supabase/.temp/project-ref = usyxfpqlsspldubptrdl; .github/workflows/deploy.yml:148 --project-ref usyxfpqlsspldubptrdl; snapshot do banco real (.../contexto/supabase/) coletado do mesmo projeto.| cético: O próprio snapshot não tem a Management API: .../contexto/supabase/project-config.md:3 e edge-functions.md:3 ('Management API desabilitada: defina SUPABASE_PROJECT_REF e SUPABASE_ACCESS_TOKEN'). Parte local confere: supabase/config.toml:1 project_id = "usyxfpqlsspldubptrdl"; src/integrations/supabase/env.ts:5.

### F0380 · Remoção do registro de sonda acidental (notes = **probe**)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Doc: um registro externo acidental com notes=**probe** foi inserido por script legado e aguarda autorização de remoção.
- **Fontes:** `docs/auditoria/EXECUCAO_ONDA_0_2026-08-26.md:66`
- **O que falta:** SELECT count(*) FROM public.activities WHERE notes='**probe**' no banco oficial; se >0, autorização e DELETE registrado; proteger scripts/seed-probe.ts.
- **Evidência:** Snapshot não traz linhas de dados (stats.md:22 só ~2.2k linhas em activities); SELECT count(*) WHERE notes='**probe**' exige consulta ao banco de produção. Nenhum registro de remoção: docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:400 ('NI, sem registro'); scripts/seed-probe.ts:31 ainda insere notes='**probe**'.| cético: O snapshot não traz linhas de activities; a contagem exige SELECT em produção, sem acesso nesta verificação.

### F0420 · Policies cron_job_policy e cron_job_run_details_policy criadas pelo pg_cron (sem migration)

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Duas policies de plataforma, fora do dump.
- **Fontes:** `docs/agentes/replay-do-repo-261117.md:234-237`
- **O que falta:** Rodar SELECT policyname FROM pg_policies WHERE schemaname='cron' no gateway MCP oficial, que não está disponível nesta sessão (os MCPs Supabase disponíveis são de outros projetos). O snapshot não inventaria o schema cron.
- **Evidência:** Lado repo confirmado: grep -rn 'cron_job_policy\|cron_job_run_details_policy' em supabase/ e src/ → só comentários (supabase/schema.sql:25597, :36439) e docs/agentes/replay-do-repo-261117.md:235-236; nenhum CREATE POLICY. Lado produção: o snapshot (snapshot.json db.policies) só cobre schemas public, realtime e storage — zero entradas para schema cron; policies.md e tables.md não listam cron.job/cron.job_run_details.| cético: snapshot.json db.policies conta só public 1017, storage 14 e realtime 2; não há schema cron (grep cron_job_policy no snapshot → 0). No repo, o nome só aparece em comentários: docs/agentes/replay-do-repo-261117.md:235-236 e supabase/schema.sql. Não existe CREATE POLICY para ele.
