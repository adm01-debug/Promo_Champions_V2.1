# Estado real do projeto — inventário gerado

Pasta de **dados gerados por script**, não de relatórios escritos à mão. É a fonte de consulta dos
agentes para "o que existe hoje" no banco e no código. Se um número aqui divergir do que você mediu,
regere o arquivo (comandos abaixo) em vez de corrigir à mão. Mesmo padrão do Zapp_Web_V2.

| Arquivo | Como gerar | O que tem |
|---|---|---|
| `banco.json` | `SUPABASE_ACCESS_TOKEN=... node scripts/inventario/gerar-banco.mjs` (Management API: `/database/query/read-only` + `/functions`, só leitura) **ou**, sem token, rodar `scripts/inventario/banco.sql` no MCP oficial (`db_query` do gateway `supabase-promo-champions-v2-mcp`), salvar a resposta e `node scripts/inventario/gerar-banco.mjs --entrada <arquivo>` | banco oficial (`usyxfpqlsspldubptrdl`), só leitura: cada tabela (RLS, policies, triggers, linhas, tamanho, se é citada em função/view e quantos `.from()` e `/rest/v1/<tabela>` tem em `src/` e `supabase/functions/`), tabelas órfãs, cada cron job (agenda, funções chamadas, falhas e taxa em 24 h/7 d, duração máxima), horas em que o cron ficou parado, tamanho do histórico do cron, saúde das integrações (`integration_connections` × último `integration_health_checks`), edge functions publicadas × pastas do repo (só com token; sem token fica `publicadas: null`) e a lista `alertas`. **Criado pela primeira execução do workflow semanal** (a sessão que montou esta pasta não tinha o token). |
| `rotas.json` | `node scripts/inventario/gerar-rotas.mjs` (`--check` só confere se está em dia) | as URLs de `src/routes/AppRoutes.tsx` (página de `lazyPages.ts`, acesso `publica`/`autenticado`/`admin_ou_gestor`/`admin`, redirecionamentos), o item do menu lateral de cada URL (`sidebarMenuData.ts`: perfil SDR/Closer/Gestão, grupo, sistema, admin) e, por URL, os hooks, tabelas, RPCs, buckets e edge functions alcançados pelos imports da página, mais `fora_do_menu` e `problemas` (menu sem rota, rota sem arquivo, rota duplicada, import quebrado) |
| `edges.json` | `node scripts/inventario/gerar-repo.mjs < /dev/null` | as edge functions: linhas, segredos lidos (`Deno.env.get`) e quem invoca cada uma (src, migrations, outras edges, `tests/e2e`, CI) |
| `tabelas-uso.json` (não versionado) | `node scripts/inventario/gerar-repo.mjs < lista-de-tabelas.txt` | quantos `.from('tabela')` cada tabela tem — também sai em `banco.json` → `tabelas[].uso_no_codigo` |

## Como ler `banco.json`

- **`alertas`** é o que um agente precisa saber antes de mexer: `tabela_sem_rls`, `rls_sem_policy`,
  `cron_falhando` (taxa ≥ 5 % em 7 dias), `cron_parado` (hora com mais da metade das execuções
  falhando), `cron_sem_execucao` (job ativo diário sem nenhuma execução em 24 h),
  `historico_cron_sem_limpeza` (> 50 mil linhas com mais de 7 dias), `integracao_sem_sucesso`
  (integração ativa cujo último health check não foi `success`, ou nunca checada),
  `dead_letters_pendentes` (tabela `*dead_letter*` com linha esperando replay), `edge_sem_deploy`,
  `edge_publicada_sem_codigo` e `edge_limite_do_plano` (≥ 95 das 100 edges que o plano aceita).
  Os limiares estão em `LIMIARES` no script.
- **`tabelas_orfas`**: 0 linhas + não citada em função/view do banco + nenhum `.from()` nem `/rest/v1/`
  no código (`.from(variavel)` não é resolvido). Candidata a limpeza, não prova de que pode apagar.
- **`linhas`** é `count(*)` exato quando a tabela tem menos de 200 mil linhas (`linhas_exatas: true`);
  acima disso, a estimativa do planner.
- A resposta só é gravada se as tabelas baterem (≥ 90 %, nos dois sentidos) com as de `public` em
  `src/integrations/supabase/types.ts` **e** o ledger bater com `supabase/migrations/` +
  `scripts/db-audit/legacy-ledger-versions.txt`: maior versão aplicada entre as 20 mais recentes (ou à
  frente) e quantidade de registros a até 10 % da esperada. Barra resposta de outro banco (ex.: o ref
  antigo `rapjswienfhkobhlamxb`).
- O PR semanal (`inventario-estado-semanal.yml`) só abre quando algo estrutural mudou: tabela
  nova/apagada, alerta novo, RLS/policy, contagem de linhas, rota, edge etc. `medido_em`/`gerado_em` e a
  telemetria viva do cron/integrações (`execucoes_24h`, `taxa_falha_7d_pct`, `falhas_7d`, `latencia_ms`,
  `ultimo_health_check`...) sozinhos não abrem PR — regenere à mão quando precisar do valor fresco.
- Nada de segredo sai do banco: de `cron.job` só o nome das funções chamadas (nunca o comando); de
  `integration_connections`/`integration_health_checks` nem `config`, `secret_refs`, `details` ou `error`.
  O teste `scripts/ci/inventario-banco.unit.mjs` barra escrita e esses campos no SQL, e o script se
  recusa a gravar saída com cara de credencial (Bearer, JWT, `sb_secret_`).
