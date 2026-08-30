# Status de execução — Plano de 100 etapas

| Campo | Valor |
|---|---|
| Data de abertura | 2026-08-30 |
| Executor | Cline (agente) sob supervisão do operador |
| Branch de trabalho | `docs/hermes-h108538-status-100-etapas` |
| Fontes | Handoff 2026-08-30 (canônico operacional); Auditoria canônica 2026-08-30 v2; Auditoria exaustiva 2026-08-26 (plano 1–100) |
| Modo | Somente leitura em bancos/painéis; escrita restrita a este documento |
| Destino declarado | Supabase Cloud `usyxfpqlsspldubptrdl` (sa-east-1) |
| Origem | `rapjswienfhkobhlamxb` (Lovable Cloud) |

---

## 1. Resumo executivo

A sessão de abertura revalidou os achados P0 em modo somente leitura e acionou a **condição de parada do §17 do handoff**: o ambiente de banco atualmente acessível **não é o projeto destino**. Conclusões:

1. **Nenhum acesso funcional ao banco destino** (`usyxfpqlsspldubptrdl`) nem à origem (`rapjswienfhkobhlamxb`): o token da CLI autenticada (`adm01@promobrindes.com.br`) recebe **HTTP 403** da Management API para ambos os projetos e a lista de projetos visíveis (12) não contém nenhum dos dois.
2. **O MCP Supabase disponível aponta para um banco self-hosted de outro sistema** (PostgreSQL 15.8 @ `10.0.1.132`): 1 tabela / 440 views / 46 funções / 0 policies no `public` — incompatível com o destino medido na auditoria (423 tabelas / 2.288 funções / 363 policies / 9 triggers). O ledger desse banco está **poluído com múltiplos projetos** (nomes `sicoob_*`, `team_messages`, `contact_tags` ao lado de nomes do domínio Promo Champions) e **não contém as 3 migrations mais novas do repo** (27–30/08). **Toda medida de catálogo feita contra esse banco é inválida para esta execução.**
3. **Revalidação P0 concluída apenas no escopo repo/local**: histórico git limpo para os padrões de chave citados (P0-004, parcial); divergências de caminhos em P0-005; divergência de contagens de migrations em P0-006. Itens dependentes de banco (P0-001, P0-002, P0-003 e o ledger de P0-006) ficam **bloqueados até o acesso correto**.
4. Nenhuma escrita foi executada em qualquer banco ou painel. Todas as ações foram leitura (`SELECT` de catálogo, `git log`, greps locais, chamadas GET de API).

---

## 2. Condição de parada acionada — identidade de ambiente (§17)

> §17: "se o projeto/ambiente não puder ser identificado de forma inequívoca" e "sem acesso ao painel" → parar e escalar. Acionada nas duas condições.

**Evidências coletadas (2026-08-30):**

| Verificação | Resultado |
|---|---|
| MCP `connection_info` / `overview` | Self-hosted PG 15.8 @ `10.0.1.132:5432`, db `postgres`, 2,3 GB, 31 conexões ativas |
| Catálogo `public` do banco acessível | 1 tabela, 440 views, 46 funções, 0 policies, 0 triggers de negócio |
| Destino medido na auditoria canônica | 423 tabelas, 2.288 funções, 363 policies, 9 triggers críticos, 597 roles |
| Tabelas-chave do destino no banco acessível | `clients`, `sales`, `quotes_inbound`, `race_leaderboard` **ausentes** |
| Ledger do banco acessível | 792 versões; nomes de outro(s) sistema(s) (`sicoob_*`, `team_messages`, `contact_tags`) misturados a nomes do domínio Promo Champions; topo `20260825093000` |
| Migrations do repo ausentes nesse ledger | `20260827202206`, `20260830000001`, `20260830000002` (e possivelmente outras) |
| Management API `POST /v1/projects/usyxfpqlsspldubptrdl/database/query` | **HTTP 403** — "The bearer token does not have privileges" |
| Management API `POST /v1/projects/rapjswienfhkobhlamxb/database/query` | **HTTP 403** — idem |
| `supabase projects list` (conta `adm01@promobrindes.com.br`) | 12 projetos listados; **nenhum** é o destino ou a origem |

**Decisão:** nenhuma ação remota ou DDL até que o operador forneça acesso inequívoco ao destino (ver §7).


---

## 3. Revalidação dos achados P0 (somente leitura)

| ID | Achado (fonte) | Status | Evidência desta sessão |
|---|---|---|---|
| P0-001 | RLS/policies do destino (31 grants; policies abertas; `clients`/`sales` sem policy restritiva de SELECT; views vazadas) | 🔶 **Bloqueado — acesso** | Requer catálogo do destino; banco acessível não é o destino (§2). Nenhuma conclusão pode ser extraída do banco errado |
| P0-002 | Guards ausentes em 47 funções mutating (5 críticas) | 🔶 **Bloqueado — acesso** | Funções vivem no banco destino; inacessível |
| P0-003 | 563 funções sem `search_path` fixo | 🔶 **Bloqueado — acesso** | Idem |
| P0-004 | Rotação de credenciais + **exposição adicional de chaves externas** fora da service_role | 🔵 **Parcial — repo limpo; painéis pendentes** | `git log -S` para `sk_live_`, `rk_live_`, `key-{20}`, `sbp_{20}`, `sk-or-`, `mlsn.`, `re_`: **0 ocorrências reais**; únicas 2 ocorrências são commits de docs de auditoria que citam o padrão `sbp_` (registro do incidente, não segredo novo). Working tree limpa. Exposição nos painéis Stripe/Resend/MailerSend/OpenRouter **não verificável sem acesso aos painéis** |
| P0-005 | Mock/simulação em 5 arquivos de produção | ⚠️ **Divergente — caminhos não reproduzem** | Dos 5 caminhos citados, 4 **não existem** no repo (nem em `main` nem na branch de auditoria `c3e73adc9`): `components/admin/funnel/FunnelSettingsTab.tsx`, `components/achievements/Achievements.tsx`, `pages/Leaderboard.tsx`, `pages/Suppliers.tsx`. O 5º existe em caminho diferente — `components/competitive/PrizeWheel.tsx` (citado como `gamification/`) — e **não contém mock/simulação**. Achados reais com marcação `mock/simulado`: `src/pages/RevenueForecastV2.tsx`, `src/pages/FollowUpInteligente.tsx` (e `Index.test.tsx`, legítimo). Suspeitos adicionais a validar na Onda 5: `components/gamification/PremiumPrizeWheel.tsx` e `SlotMachine.tsx` (`DEMO_MODE = true`) |
| P0-006 | Divergência ledger × arquivos de migration | ⚠️ **Divergente — contagens e ledger inacessível** | Repo `main`: **595 arquivos** `.sql`, **586 versões distintas** (auditoria de 26/08 citou 263 arquivos/275 versões — não reproduzível); 6 versões com prefixo duplicado; 15 nomes fora do padrão de 14 dígitos; 4 versões posteriores ao topo citado (`20260825093000`); 582 ≤ topo. Ledger do **destino** inacessível (§2); o topo citado coincide com o topo do banco self-hosted errado, cuja identidade precisa ser confirmada (§7) |

---

## 4. Divergências detectadas nesta sessão (registro obrigatório)

| # | Divergência | Impacto | Tratamento |
|---|---|---|---|
| D-01 | Banco acessível via MCP não é o destino (§2) | Inválida qualquer medição de catálogo prévia feita contra `10.0.1.132` | Parada §17; aguardar acesso correto |
| D-02 | Token CLI sem privilégio nos projetos destino/origem (HTTP 403) | Bloqueia Management API, incluindo leitura | Operador precisa fornecer token com escopo ou executar consultas guiadas |
| D-03 | P0-005 cita 5 caminhos; 4 inexistem e o 5º está em outro diretório e sem mock | Escopo da etapa 45 precisa ser reescrito com os arquivos reais | Alvos reais provisórios: `RevenueForecastV2.tsx`, `FollowUpInteligente.tsx`; validar `PremiumPrizeWheel.tsx`/`SlotMachine.tsx` (`DEMO_MODE`) |
| D-04 | Auditoria de 26/08 citou 263 arquivos/275 versões de migration; repo `main` tem 595/586 | Baseline de P0-006/etapa 21 precisa ser refeita sobre o estado atual | Recalcular contra o ledger do destino quando acessível |
| D-05 | Topo do ledger citado (`20260825093000`) coincide com o topo do banco self-hosted errado | Sugere que a medição original do "destino" pode ter sido feita (ao menos em parte) sobre esse banco, ou que ledgers foram sincronizados entre projetos | Confirmar com o operador qual banco foi medido em 30/08 e qual é a identidade do self-hosted |
| D-06 | Repo contém 6 versões duplicadas e 15 nomes fora do padrão de 14 dígitos | Risco operacional em `supabase migration up/repair` | Entra no escopo da etapa 22 (lista nominal) |

---

## 5. Matriz de status das 100 etapas

**Legenda de status:** ⬜ Pendente · 🔶 Bloqueada por acesso · 🔒 Aguardando gate/autorização · 🔵 Parcial · ✅ Concluída
**Legenda de alvo:** BD = banco destino · BO = banco origem · Repo = repositório · Ext = painel/serviço externo

| # | Fase | Etapa (resumo) | Alvo | Status | Próxima ação |
|---|---|---|---|---|---|
| 1 | A | Snapshot físico lógico completo do destino | BD | 🔶 | Aguardar acesso + janela aprovada |
| 21 | C | Reconciliar ledger × 595 arquivos × 586 versões | BD+Repo | 🔵 | Repo medido (595/586; baseline da auditoria não reproduz); falta ledger do destino |
| 22 | C | Marcar local-only vs aplicada/reparada (lista nominal) | BD+Repo | 🔶 | Depende de 21 (ledger destino); 6 duplicadas + 15 fora do padrão já identificadas |
| 23 | C | Reparar ledger apenas com `migration repair` (sem DDL) | BD | 🔒 | Gate: aprovação operador + janela; pré-requisito: 21/22 |
| 24 | C | Garantir snapshot pré-RLS | BD | 🔶 | Depende de 1/11 + janela |
| 25 | C | Medir baseline real (latência p50/p95/p99, conexões, locks) | BD | 🔶 | Depende de 11 |
| 26 | C | Habilitar RLS nas 11 tabelas P0 | BD | 🔒 | Gate: pacote DDL + rollback + janela; depende de 13/14 |
| 27 | C | Criar policies admin nas 11 tabelas | BD | 🔒 | Idem |
| 28 | C | Substituir 40 policies `USING (true)` | BD | 🔒 | Idem |
| 29 | C | Endurecer `fn_bootstrap_*` | BD | 🔒 | Idem |
| 30 | C | Testes: negar `authenticated` fora do escopo | BD | 🔒 | Pós-26/27 |
| 31 | C | Testes: negar `anon` em P0 | BD | 🔒 | Pós-26/27 |
| 32 | C | Testes: permitir admin | BD | 🔒 | Pós-26/27 |
| 33 | C | Validar RPCs admin após policies | BD | 🔒 | Pós-26/27 |
| 34 | C | Revogar 31 `GRANT ... TO anon` | BD | 🔒 | Gate: pacote DDL + rollback + janela |
| 35 | C | Revogar `EXECUTE` de `anon` nas 5 funções críticas | BD | 🔒 | Idem |
| 36 | C | Manter grants mínimos em RPCs legítimos | BD | 🔒 | Idem |
| 37 | C | Revisar 17 policies Multi-tenant/Defense | BD | 🔒 | Idem |
| 38 | C | Corrigir função `is_admin()` ambígua | BD | 🔒 | Idem |
| 39 | C | Migrar funções multi-tenant p/ `tenant_id` atual | BD | 🔒 | Idem |
| 40 | C | Testar cross-tenant por papéis | BD | 🔒 | Pós-37/38/39 |

| 2 | A | Export `auth.users` destino | BD | 🔶 | Idem |
| 41 | E | Validar 597 arquivos de função com parser Deno | Repo | ⬜ | **Lote 1** — repo-local, sem gate |
| 42 | E | Corrigir assinaturas inválidas dos parsers | Repo | ⬜ | **Lote 1** — depende da lista da etapa 41 |
| 43 | E | Mover lógica sensível do frontend p/ backend | Repo | ⬜ | Lote 2 — gate: aprovação do plano de refatoração |
| 44 | E | Remover ~1.360 `console.log` de produção | Repo | ⬜ | Lote 2 — gate: aprovação do lote de limpeza |
| 45 | E | Substituir mocks por dados reais | Repo | ⬜ | Reescrito pela D-03: alvos reais `RevenueForecastV2.tsx`, `FollowUpInteligente.tsx`; validar `PremiumPrizeWheel`/`SlotMachine` |
| 46 | E | Corrigir query `AdminDiagnostics.tsx` (`from('system_config')`) | Repo | ⬜ | **Lote 1** (candidata) — verificar uso real de `from('system_config')` e trocar por RPC |
| 47 | E | Implementar botão "Ver Todos" | Repo | ⬜ | Lote 2 |
| 48 | E | Implementar `CopyAsTemplate` e `SendForApproval` | Repo | ⬜ | Lote 2 |
| 49 | E | Implementar `copyTemplate` | Repo | ⬜ | Lote 2 |
| 50 | E | Adicionar guardas de sessão/roles admin nas telas críticas | Repo | ⬜ | Lote 3 (após gates de segurança) |
| 51 | F | Varredura de segredos (git + backend + frontend) | Repo | 🔵 | Repo: histórico limpo p/ padrões citados (P0-004); falta varredura com ferramenta dedicada (gitleaks/trufflehog) |
| 52 | F | Reescrever histórico Git removendo service_role | Repo | 🔒 | Gate: autorização explícita de reescrita de histórico |
| 53 | F | Revogar service_role exposta no painel Supabase | BD | 🔶 | Gate externo; depende de acesso ao painel do projeto destino |
| 54 | F | Rotacionar `jwt_secret` | BD | 🔒 | Gate: janela + plano de invalidação de sessões |
| 55 | F | Rotacionar chaves Stripe/Resend/MailerSend/OpenRouter | Ext | 🔶 | Gate externo; depende de acesso aos painéis |
| 56 | F | Rotacionar `DB_PUBLIC_URL`/API keys legadas | BD | 🔶 | Idem |
| 57 | F | Confirmar revogação de todas as chaves comprometidas | BD+Ext | 🔶 | Pós-53/54/55/56 |
| 58 | G | Proteger SQL defensivo no frontend (`clients`, `quotes_inbound`) | Repo | ⬜ | Lote 3 (após RLS do destino) |
| 59 | G | Decidir unicidade `quotes_inbound` (UNIQUE vs dedupe por janela) | BD | 🔒 | Gate: decisão de negócio + acesso BD |
| 61 | G | Adicionar guards em 47 funções mutating | BD | 🔒 | Gate: pacote DDL + janela; depende de P0-002 revalidado no destino |
| 62 | G | Fixar `search_path` nas 563 funções | BD | 🔒 | Idem; depende de P0-003 revalidado |
| 63 | G | Reconciliar políticas das 41 funções sensíveis | BD | 🔒 | Idem |
| 64 | G | Segregar hardening pós-estabilização em migration única | BD | 🔒 | Gate: pacote DDL |
| 65 | G | Criar migration baseline de hardening única | BD | 🔒 | Gate: pacote DDL |
| 66 | G | Validar 9 triggers críticos ativos no destino | BD | 🔶 | Depende de acesso ao destino |
| 67 | G | Validar webhooks Stripe/Resend/MailerSend com chaves rotacionadas | Ext | 🔶 | Pós-55; depende de painéis |
| 68 | G | Fixar `security_invoker` nas views relatadas | BD | 🔒 | Gate: pacote DDL; depende de P0-001 revalidado |
| 69 | G | Revalidar `quotes_inbound` pós-RLS/grants | BD | 🔒 | Pós-26..36 |
| 70 | G | Corrigir 64 avisos de segurança remanescentes (owners) | BD | 🔒 | Gate: pacote DDL + dono nomeado |
| 71 | H | Corrigir paginação >1000 (`.in()`) | Repo | ⬜ | Lote 2 — repo-local |
| 72 | H | Otimizar polling do admin | Repo | ⬜ | Lote 2 |
| 73 | H | Adicionar `.limit()` nas queries críticas | Repo | ⬜ | Lote 2 |
| 74 | H | Criar 5 índices faltantes | BD | 🔒 | Gate: pacote DDL + medição antes/depois |
| 75 | H | Criar 7 FKs/índices recomendados | BD | 🔒 | Idem |
| 76 | H | Remover 3 índices redundantes | BD | 🔒 | Idem |
| 77 | H | Criar 12 colunas geradas | BD | 🔒 | Idem |
| 78 | H | Corrigir placeholder `updated_at` em `admin_audit_log` | BD | 🔒 | Gate: pacote DDL + validação de dados |
| 79 | H | Adicionar FK em `products.ncm` | BD | 🔒 | Gate: pacote DDL |
| 80 | H | Documentar mapeamento `tenants ↔ companies` | Repo | ⬜ | **Lote 1** (candidata, parte doc) — repo-local; decisão final exige BD |

| 81 | I | Alcançar 0 erros de lint | Repo | ⬜ | **Lote 1** — baseline `npm run lint` + correções mecânicas |
| 82 | I | Restaurar suite de testes + baseline | Repo | ⬜ | **Lote 1** — `vitest run` baseline; correções pontuais |
| 83 | I | Definir política de tratamento de exceções | Repo | ⬜ | Lote 2 — gate: aprovação da política (doc) |
| 84 | I | Criar métricas de erro críticas no backend | BD | 🔶 | Depende de acesso BD + definição da etapa 83 |
| 85 | I | Remover `lovable-tagger` de produção | Repo | ⬜ | Lote 2 — sem gate (mudança de build) |
| 86 | I | Validar webhooks críticos pós-rotação | Ext | 🔶 | Pós-55/67 |
| 87 | I | Atualizar dependências críticas (vite, eslint 9, vitest 3) | Repo | ⬜ | Lote 3 — gate: aprovação do plano de upgrades |
| 88 | I | Definir política de pin de versões | Repo | ⬜ | Lote 2 — gate: aprovação da política (doc) |
| 89 | I | Criar `npm run ci` | Repo | ⬜ | **Lote 1** — adicionar script; gate: nenhum |
| 90 | J | Medir conexões ativas/hit ratio/IO real | BD | 🔶 | Depende de acesso ao destino |
| 91 | J | Refatorar/abandonar 6 tabelas legadas (Top 20) | BD+Repo | ⬜ | Análise repo-local possível; decisão/remoção exige gate + BD |
| 92 | J | Decidir manter/remover 5 tabelas perf sem RLS | BD | 🔒 | Gate: decisão + acesso BD |
| 93 | J | Decidir manter/remover 4 candidatas a morta | BD | 🔒 | Idem |
| 94 | J | Confirmar design órfão (`battles`/`badges`/`client_audit_log`) | BD | 🔒 | Idem |
| 95 | J | Normalizar `quotes_inbound.items` (JSONB) | BD | 🔒 | Gate: decisão de arquitetura + BD |
| 96 | J | Analisar função `cleanup_old_read_notifications()` | BD | 🔒 | Gate: análise + BD |
| 97 | J | Formalizar remoção de legados só pós-estabilidade | Repo | 🔒 | Gate: aprovação do operador (registro de política) |
| 98 | J | Validar tipos TypeScript gerados vs schema real | BD+Repo | 🔶 | Depende de acesso ao destino (`supabase gen types`) |
| 99 | J | Definir requisito de rollback por migration futura | Repo | ⬜ | **Lote 1** (candidata, parte doc) — política em `docs/` |
| 100 | J | Publicar relatório final de validação | Repo | 🔒 | Última etapa; consolida todas |

---

## 6. Proposta — Lote 1 (executável sem acesso ao banco)

Critérios: escopo repo-local, sem DDL, sem remoto, sem gate externo, validação objetiva, reversível. Ataca as Ondas 3a/3b (estabilização backend/frontend) enquanto o acesso ao destino está bloqueado.

| Etapa | Entregável | Validação |
|---|---|---|
| 41 | Script de validação sintática das 597 Edge Functions com parser real (`deno check`; fallback `deno lint`) + relatório nominal em `docs/execucao/` | Relatório JSON/MD com lista fechada de arquivos com assinatura inválida |
| 42 | Correção **somente** dos arquivos listados pela etapa 41 (escopo fechado) | Reexecução do parser com 0 falhas |
| 81 | Baseline de lint: registrar contagem atual de erros e zerar erros (`npm run lint`); warnings ficam para política posterior (etapa 83) | `npm run lint` com 0 erros |
| 82 | Baseline de testes: `npm run test` (vitest run), registrar falhas e corrigir as triviais; não triviais viram lista para o Lote 2 | `vitest run` verde ou com lista nominal de falhas remanescentes justificada |
| 89 | Criar `npm run ci` (lint + test + build) | Script presente e executando |

Sequência de PRs proposta (pequenos, independentes): **PR-1** script+relatório (41) → **PR-2** correções de assinatura (42) → **PR-3** lint zero erros (81) → **PR-4** baseline de testes + `npm run ci` (82+89).

Em paralelo (fora do lote, depende do operador): acesso de leitura ao destino para destravar a Fase B e a revalidação de P0-001/002/003/006.

---

## 7. Pendências de acesso (bloqueio atual — pedido ao operador)

1. **Token Management API com escopo** nos projetos destino (`usyxfpqlsspldubptrdl`) e origem (`rapjswienfhkobhlamxb`) — o token atual recebe **HTTP 403** nos dois; ou execução guiada das queries de leitura pelo operador.
2. **Alternativa:** DSN read-only do destino (pooler porta 6543, role `readonly`).
3. **Identidade do banco self-hosted** `10.0.1.132`: qual projeto ele representa, por que o ledger mistura domínios de sistemas diferentes e quem o provisionou — necessário para encerrar D-01/D-05.
4. **Confirmação de qual banco foi medido** na auditoria canônica de 30/08 (o topo do ledger citado coincide com o do banco errado — D-05).
5. **Acesso Lovable** (painel/API) — Fase A, etapa 6 (congelamento da origem).
6. **Painéis Stripe, Resend, MailerSend, OpenRouter** — rotação de chaves (P0-004, etapas 55–57).

---

## 8. Log da sessão (2026-08-30)

| Ação | Resultado |
|---|---|
| Criação de worktree isolado (`chat-h108538`, branch `docs/hermes-h108538-status-100-etapas`) | OK — isolamento verificado |
| P0-004: `git log -S` × 7 padrões de chave externa (`sk_live_`, `rk_live_`, `key-`, `sbp_`, `sk-or-`, `mlsn.`, `re_`) | Histórico e working tree limpos; 2 hits são docs de auditoria citando o padrão |
| P0-005: verificação dos 5 caminhos citados | 4 inexistem no repo; 5º existe em outro diretório e sem mock; alvos reais identificados por grep |
| P0-006: contagem de migrations do repo `main` | 595 arquivos / 586 versões distintas / 6 duplicadas / 15 fora do padrão / 4 pós-topo |
| Medição do banco acessível via MCP (catálogo + ledger 792 versões + tabelas-chave + funções + policies) | Confirmado: **não é o destino** (evidências em §2) |
| Verificação de migrations do repo no ledger acessível (3 mais recentes) | Ausentes — reforça que o ledger não reflete o repo |
| Management API: `POST /v1/projects/{destino,origem}/database/query` | **HTTP 403** nos dois projetos |
| `supabase projects list` (conta CLI autenticada) | 12 projetos; destino e origem ausentes |
| Escrita em bancos/painéis remotos | **Nenhuma** (modo somente leitura respeitado) |
| Condição de parada §17 | **Acionada** — aguardando acesso correto (§7) |


| 60 | G | Formalizar decisão `reprocess_confidence=0.4` (manter/remover) | BD | 🔒 | Gate: decisão de negócio |

| 3 | A | Inventário secrets/env destino | BD | 🔶 | Idem |
| 4 | A | Inventário Stripe/Resend/MailerSend/OpenRouter + rotação | Ext | 🔶 | Aguardar acesso aos painéis |
| 5 | A | Inventário storage origem | BO | 🔶 | Aguardar acesso à origem |
| 6 | A | Congelar escrita na origem Lovable | BO | 🔶 | Aguardar acesso Lovable |
| 7 | A | Snapshot físico lógico da origem | BO | 🔶 | Idem |
| 8 | A | Export `auth.users` origem | BO | 🔶 | Idem |
| 9 | A | Snapshot de buckets/storage destino | BD | 🔶 | Aguardar acesso ao destino |
| 10 | A | Painel de status com proprietário/validação | Repo | 🔵 | Este documento é o embrião; falta painel por etapa |
| 11 | B | Acesso RO ao destino (pooler/relatórios) | BD | 🔶 | Pedir token/DSN RO ao operador (§7) |
| 12 | B | Acesso de escrita controlada | BD | 🔶 | Após etapa 11 + janela |
| 13 | B | Confirmar Top 20 e contadores (mínimos reais) | BD | 🔶 | Reexecutar contadores no destino real |
| 14 | B | Catálogo 423 tabelas (RLS, políticas, crescimento, IO) | BD | 🔶 | Depende de 11 |
| 15 | B | Reconciliar 100 rotas × persistência real | BD+Repo | 🔶 | Parcial repo-local possível (mapa de rotas); cruzamento exige BD |
| 16 | B | Mapa 72 buckets × 169 Edge × 14 crons × variáveis | BD | 🔶 | Depende de 11 |
| 17 | B | Isolar toolchains (2 CLIs + CLI origem) | Repo | ⬜ | Executável localmente; propor no Lote 2 |
| 18 | B | Travar package manager (remover `yarn.lock`/`bun.lock`) | Repo | ⬜ | PR pequeno; gate: aprovação do lote de limpeza |
| 19 | B | Confirmar `meta_criadores` vs `meta_creators` | BD+Repo | 🔶 | Grep repo-local possível; decisão exige BD |
| 20 | B | Testar 5 RPCs dos gráficos + SQL do agrupador | BD+Repo | 🔶 | Grep repo-local possível; teste exige BD |

