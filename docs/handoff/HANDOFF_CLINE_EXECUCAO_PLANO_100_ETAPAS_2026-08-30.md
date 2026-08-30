# Handoff operacional para o Cline — execução do plano de 100 etapas

**Projeto:** Promo Champions V2.1  
**Data do handoff:** 30/08/2026  
**Idioma obrigatório:** Português do Brasil  
**Estado inicial do programa:** auditoria concluída; 0 de 100 etapas de remediação executadas  
**Origem de dados:** Lovable Cloud, projeto `rapjswienfhkobhlamxb`  
**Destino de dados:** Supabase, projeto `usyxfpqlsspldubptrdl`  
**Branch padrão:** `main`  
**Documento canônico do diagnóstico e plano:** [AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md](../auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md)

## 1. Missão do Cline

Executar o plano de 100 etapas de forma incremental, verificável e reversível, preservando o design e as funcionalidades já corretas. O objetivo não é produzir uma grande reescrita nem apenas fazer o código compilar. O objetivo final é obter um sistema seguro, coerente com o banco vivo, testado e operando em produção com tráfego real dentro dos SLOs.

O Cline deve atuar como engenheiro de software sênior e orquestrador da execução. Cada correção deve partir de evidência atual, entrar em um lote pequeno, passar por revisão/CI e ter rollback definido. Não executar as 100 etapas em uma única branch ou PR.

## 2. Leitura obrigatória antes de qualquer ação

Nesta ordem:

1. `AGENTS.md` da raiz;
2. `README.md` completo;
3. todos os documentos aplicáveis em `docs/`;
4. o relatório canônico de auditoria vinculado acima;
5. `CLAUDE.md`, somente como contexto — ele contém pelo menos uma afirmação desatualizada sobre `migrate-helper`;
6. `supabase/config.toml` e o histórico Git do objeto que será alterado;
7. código, testes, migrations e contratos vivos diretamente relacionados ao lote escolhido.

Se o estado vivo divergir deste handoff, prevalece a nova evidência viva. Registrar a divergência e atualizar a documentação; nunca adaptar silenciosamente o fato à documentação antiga.

## 3. Regras inegociáveis

1. Comunicar, comentar código relevante, descrever commits e PRs sempre em pt-BR.
2. Nunca alterar ou apagar tabela, coluna, constraint, índice, RLS/policy, grant, função, trigger, view, enum, extensão, publicação Realtime, storage, job ou migration aplicada sem autorização explícita do usuário.
3. Nunca copiar, reconciliar, sobrescrever ou excluir dados entre origem e destino sem autorização explícita, backup restaurável e dry-run.
4. Nunca excluir arquivo candidato a lixo sem aprovação nominal do usuário.
5. Tabela vazia, coluna nula, ausência de `.from`, ausência de `.rpc` ou ausência de `invoke` não prova inutilidade.
6. Não reproduzir segredos em logs, commits, PRs, documentos, screenshots ou mensagens.
7. Não alterar o design visual salvo quando a correção de um bug aprovado exigir mudança mínima e demonstrável.
8. Não introduzir dados aleatórios, mocks ou sucesso otimista em fluxos apresentados como produção.
9. Não editar migrations já aplicadas. Criar migration corretiva nova, única e ordenável.
10. Não executar `git checkout -b`. Usar sempre worktree isolado conforme `AGENTS.md`.
11. Não usar bypass de CI para declarar uma etapa pronta.
12. Código mergeado não significa pronto: deploy, tráfego real, observação e aceite são necessários quando a etapa muda runtime.
13. Diagnosticar bugs de produção com logs e estado real antes do patch.
14. Fazer diff mínimo; não misturar formatação massiva, refatoração e correção funcional no mesmo PR.
15. Parar e pedir decisão diante de custo, mudança arquitetural, ação destrutiva, dúvida de negócio ou autorização ausente.

## 4. Legenda de gates de autorização

| Gate            | Quando é obrigatório                                                          | O que apresentar antes de pedir autorização                                                 |
| --------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `AUTH-OPS`      | desativar função, rotacionar segredo, mudar configuração externa              | alvo exato, impacto, janela, dependentes, rollback e validação                              |
| `AUTH-DB`       | qualquer DDL, policy, grant, rotina, trigger, view, cron, Realtime ou storage | SQL exato, objetos, locks, impacto, backup, dry-run, rollback e testes                      |
| `AUTH-DATA`     | inserir, atualizar, excluir, copiar ou reconciliar registros                  | chaves/linhas afetadas, origem da verdade, conflito, backup, dry-run e query de conferência |
| `AUTH-DELETE`   | remover arquivo ou artefato preexistente                                      | nome exato, buscas de consumidor, telemetria, alternativa de depreciação e recuperação      |
| `AUTH-DEPLOY`   | deploy, canário, tráfego ou release                                           | commit/PR, CI, plano de rollout, métricas, alertas, rollback e janela                       |
| `AUTH-BUSINESS` | decisão funcional ou semântica                                                | opções, impacto, recomendação técnica e trade-off real                                      |

Uma autorização vale somente para os objetos e a ação nominalmente descritos. Não ampliar o escopo por similaridade.

## 5. Achados que definem a prioridade

### P0 — contenção imediata, sem ação remota não autorizada

- `supabase/functions/migrate-helper/index.ts` contém uma chave fixa e uma ação capaz de devolver credenciais administrativas;
- a função foi reintroduzida após remoção anterior por segurança e permanece implantada na origem sem JWT;
- nove views exclusivas do destino são `security definer` por padrão, têm `SELECT` efetivo para `anon` e podem contornar RLS;
- o destino possui 30 funções de aplicação `SECURITY DEFINER` executáveis por `anon`, acima da allowlist de 11;
- rotinas de soft delete/restore, fila e gamificação têm autorização ausente, confiada ao chamador ou vulnerável a comparação com `NULL`.

### P1 — segurança e integridade

- policies administrativas usam `raw_user_meta_data` controlável pelo usuário;
- grants amplos tornam qualquer policy permissiva mais grave;
- 140 handlers referenciam cliente privilegiado/service role, mas somente 9 usam o helper central;
- CORS estático com fallback curinga domina 156 de 170 handlers;
- 7 Edge Functions não compilam; outras 34 falham no typecheck;
- quatro jobs cron têm contratos quebrados;
- código chama quatro relações, cinco RPCs e duas Edge Functions inexistentes;
- migrations, ledger, tipos e estado vivo não representam uma sequência única reproduzível;
- existem fluxos que persistem ou apresentam dados fabricados como reais.

### Estado de preservação do banco

- todas as 406 relações públicas da origem existem no destino;
- não há coluna comum presente na origem e ausente no destino;
- o destino possui 398 tabelas públicas, todas com RLS;
- 304 tabelas do destino estão vazias e 94 têm dados;
- 137 colunas estão integralmente nulas nas tabelas que possuem linhas;
- o catálogo nominal completo está no relatório canônico;
- nenhuma dessas constatações autoriza remoção.

## 6. Unidade de execução

Cada unidade de trabalho deve abranger preferencialmente uma etapa ou um pequeno conjunto inseparável de etapas do mesmo risco. Para cada unidade:

1. sincronizar a `main` e criar worktree/branch isolado;
2. registrar IDs das etapas e hipótese;
3. revalidar a evidência no código e, quando aplicável, no estado vivo somente leitura;
4. escrever o pacote de aprovação se houver gate;
5. aguardar autorização quando obrigatória;
6. implementar o menor diff capaz de resolver o contrato;
7. adicionar/ajustar testes que falhem antes e passem depois;
8. executar verificações proporcionais ao risco;
9. revisar diff, segredos, migrations e impacto de compatibilidade;
10. commit `--no-verify`, push e PR;
11. aguardar CI e revisões; corrigir sem esconder falhas;
12. fazer merge squash conforme o fluxo do repositório;
13. se houver runtime, solicitar `AUTH-DEPLOY`, implantar gradualmente e observar;
14. registrar evidência antes/depois, rollback e status da etapa;
15. limpar worktree/branch local conforme `AGENTS.md`.

## 7. Estrutura obrigatória de branch, commit e PR

### Branch

Usar o padrão do `AGENTS.md`, com descrição curta e IDs das etapas quando útil. Exemplo conceitual:

`fix/hermes-<id>-p001-p006-conter-migrate-helper`

### Commit

- uma intenção coesa;
- mensagem em pt-BR;
- não versionar saída gerada incidental;
- usar `--no-verify` conforme a regra do projeto, sem dispensar verificações manuais/CI.

### Corpo da PR

Incluir obrigatoriamente:

- etapas do plano cobertas;
- problema e evidência atual;
- escopo incluído e excluído;
- arquivos/objetos alterados;
- autorização associada, quando aplicável;
- risco e compatibilidade;
- testes executados com resultado;
- evidência antes/depois;
- migration e impacto de lock, se houver;
- rollout, métricas e rollback;
- itens que continuam pendentes.

## 8. Registro de progresso

Na primeira PR de execução, criar `docs/execucao/STATUS_PLANO_100_ETAPAS.md`. Não alterar o relatório canônico para fingir que um achado histórico nunca existiu.

Cada etapa do registro deve ter:

| Campo           | Conteúdo obrigatório                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------------- |
| ID              | `P001` a `P100`                                                                                               |
| Estado          | pendente, em diagnóstico, aguardando autorização, em implementação, em CI, em canário, concluída ou bloqueada |
| Owner           | pessoa/agente responsável                                                                                     |
| Evidência atual | link para log, consulta, arquivo e linha ou snapshot                                                          |
| Autorização     | ID/link/data ou não aplicável                                                                                 |
| PR/commit       | links ou hashes                                                                                               |
| Testes          | comandos e resultados                                                                                         |
| Deploy          | ambiente, versão e horário                                                                                    |
| Rollback        | instrução testada ou não aplicável                                                                            |
| Resultado       | métrica antes/depois e pendências                                                                             |

Não marcar uma etapa como concluída se falta deploy/observação exigido pelo próprio objetivo.

## 9. Protocolo de banco de dados

### Diagnóstico somente leitura

Antes de propor SQL:

- confirmar projeto/host por fingerprint não secreto;
- coletar definição viva com schema qualificado;
- coletar owner, grants, policies, dependências, triggers, índices e consumidores;
- comparar origem, destino, migration local, ledger e tipos;
- medir contagem/PK/hash quando o assunto for dado;
- separar objeto gerenciado pelo Supabase de objeto da aplicação;
- preservar a query e o timestamp como evidência sem dados sensíveis.

### Pacote `AUTH-DB`

Apresentar:

1. objeto exato e ambiente;
2. definição atual;
3. definição proposta;
4. SQL completo e migration correspondente;
5. impacto de lock, tempo e volume;
6. dependentes internos/externos;
7. backup e teste de restauração;
8. dry-run em clone/staging;
9. testes de autorização, integridade e performance;
10. SQL/ação de rollback;
11. janela e observabilidade;
12. autorização explícita solicitada.

### Execução autorizada

- aplicar primeiro em ambiente efêmero/staging;
- usar `lock_timeout` e `statement_timeout` adequados;
- preferir mudança aditiva e compatível;
- não combinar objetos não autorizados na mesma migration;
- testar personas `anon`, `authenticated`, admin e `service_role` quando houver RLS/grants;
- comparar definição viva e hash após aplicação;
- nunca copiar cegamente a origem sobre o destino;
- nunca usar a origem como ambiente de teste mutável.

### Migrations

- timestamp único de 14 dígitos;
- não usar `CREATE POLICY IF NOT EXISTS`, que é inválido no PostgreSQL;
- não renomear migration já aplicada;
- não alterar arquivo presente no ledger;
- incluir reversão segura quando tecnicamente possível;
- replay completo em banco limpo antes do merge;
- regenerar tipos somente da fonte viva autorizada;
- provar que o diff final do schema é o esperado.

## 10. Protocolo de código e Edge Functions

Para cada endpoint ou fluxo:

1. definir ator, papel e recurso;
2. validar autenticação e autorização de propriedade antes de usar service role;
3. limitar IDs, paginação, payload e efeitos;
4. configurar CORS por allowlist e natureza do endpoint;
5. definir `verify_jwt` explicitamente;
6. usar timeout, request ID, retry somente idempotente e circuit breaker conforme risco;
7. não logar token, PII desnecessária ou payload sensível;
8. retornar falha honesta quando integração não estiver configurada;
9. testar sucesso, não autenticado, não autorizado, recurso alheio, timeout, provider down e replay;
10. conferir o deploy vivo contra o commit e o manifesto.

Para contratos ausentes, decidir uma destas opções e documentar:

- implementar o objeto/endpoint real;
- adaptar o consumidor ao contrato vivo correto;
- remover o fluxo após decisão de produto e evidência de não uso;
- manter desabilitado e claramente rotulado.

Nunca criar tabela/RPC/Edge apenas para fazer o teste parar de falhar sem validar o domínio.

## 11. Protocolo para mocks, IA e integrações

Todo valor exibido como real deve ter proveniência rastreável. Para cada fluxo listado na auditoria:

- identificar a fonte real esperada;
- definir estado `loading`, vazio, indisponível, demo e erro;
- impedir persistência de valor fabricado;
- remover alegações como “real-time”, “IA”, “neural”, “verificado”, “enviado” ou “entregue” sem evidência;
- usar feature flag se a integração real ainda não estiver disponível;
- adicionar teste que prove que falta de provedor não gera sucesso;
- preservar o layout/design sempre que possível.

## 12. Matriz mínima de verificações

| Tipo de mudança    | Verificações mínimas                                                                         |
| ------------------ | -------------------------------------------------------------------------------------------- |
| documentação       | Prettier do arquivo, links, `git diff --check`, consistência factual                         |
| frontend           | typecheck, lint, testes unitários do domínio, build, smoke da rota, acessibilidade relevante |
| Edge               | `deno check`/bundle, testes unitários/contrato, auth negativa, CORS, timeout e idempotência  |
| SQL/RLS            | replay limpo, pgTAP/contratos por persona, definição antes/depois, EXPLAIN quando aplicável  |
| migration de dados | contagem, PK/hash, conflitos, dry-run, backup/restore, reconciliação pós-aplicação           |
| dependência        | `npm audit`, build, testes, bundle e notas de breaking change                                |
| performance        | baseline, carga representativa, p50/p95/p99, erro, CPU/IO/WAL e regressão aceita             |
| deploy             | manifesto, canário, dashboards, alertas, rollback e janela de observação                     |

Não reduzir a suíte existente para tornar uma PR verde. Skips novos exigem justificativa, owner e prazo.

## 13. Fila canônica das 100 etapas

O texto completo, critérios e contexto estão no relatório canônico. A lista abaixo é o índice operacional. Todas começam como pendentes.

### Onda 1 — contenção crítica

- [ ] `P001` — congelar releases e registrar exceções; gate `AUTH-BUSINESS`/owner técnico.
- [ ] `P002` — bloquear uso operacional de `migrate-helper`; gate `AUTH-OPS`.
- [ ] `P003` — rotacionar a chave fixa; gate `AUTH-OPS`.
- [ ] `P004` — rotacionar credenciais de origem potencialmente expostas; gate `AUTH-OPS`.
- [ ] `P005` — substituir por resposta segura e remover `migrate-helper` do deploy; gates `AUTH-OPS` e `AUTH-DEPLOY`.
- [ ] `P006` — ampliar scanner de segredos e criar regressão; sem gate remoto.
- [ ] `P007` — auditar acessos ao endpoint/credenciais; somente leitura, preservar evidência.
- [ ] `P008` — propor contenção das nove views abertas a `anon`; gate `AUTH-DB`.
- [ ] `P009` — propor contenção das funções mutáveis anônimas; gate `AUTH-DB`.
- [ ] `P010` — registrar baseline imutável de código e estado vivo; somente leitura.

**Gate de saída da onda:** risco de exfiltração contido, credenciais antigas invalidadas quando autorizado, matriz emergencial de views/funções aprovada e baseline preservado.

### Onda 2 — governança e fonte de verdade

- [ ] `P011` — definir oficialmente origem, destino, staging e produção; gate `AUTH-BUSINESS`.
- [ ] `P012` — corrigir documentação contraditória sobre `migrate-helper`.
- [ ] `P013` — criar manifesto versionado de deploy.
- [ ] `P014` — adicionar fingerprint não secreto de ambiente.
- [ ] `P015` — inventariar Edge Functions implantadas no destino; somente leitura.
- [ ] `P016` — consolidar matriz `verify_jwt` declarada/implantada/exigida.
- [ ] `P017` — atribuir owner, criticidade e SLA aos ativos; gate organizacional.
- [ ] `P018` — adicionar detecção de drift somente leitura no CI.
- [ ] `P019` — documentar e testar restore em ambiente isolado; gate para infraestrutura de teste.
- [ ] `P020` — formalizar checklist de mudança e release.

**Gate de saída da onda:** cada ação sabe em qual ambiente ocorre, cada ativo crítico tem owner e o drift deixa de ser invisível.

### Onda 3 — reconciliação de dados

- [ ] `P021` — comparar tabelas comuns por PK, contagem e hash; somente leitura.
- [ ] `P022` — identificar a linha ausente em `quotes_inbound`; `AUTH-DATA` para corrigir.
- [ ] `P023` — classificar as linhas ausentes em logs/dedupe; `AUTH-DATA` para copiar/reprocessar.
- [ ] `P024` — validar retenção dos sete históricos menores.
- [ ] `P025` — provar e preservar o crescimento legítimo de 54 conjuntos no destino.
- [ ] `P026` — classificar toda coluna exclusiva do destino.
- [ ] `P027` — classificar as 137 colunas integralmente nulas.
- [ ] `P028` — atribuir owner às 304 tabelas vazias.
- [ ] `P029` — validar as 31 relações exclusivas do destino.
- [ ] `P030` — reconciliar contratos de dados e storage; `AUTH-DB`/`AUTH-DATA` para mudanças.

**Gate de saída da onda:** zero ressincronização cega; toda diferença é intencional, reconciliada ou tem owner e decisão pendente.

### Onda 4 — segurança do banco

- [ ] `P031` — corrigir `security_invoker` e grants das nove views; gate `AUTH-DB`.
- [ ] `P032` — revisar leitura anônima/refresh de `mv_competitive_ranking`; gate `AUTH-DB`.
- [ ] `P033` — retirar elevação por `raw_user_meta_data`; gate `AUTH-DB`.
- [ ] `P034` — corrigir policies permissivas de login, manutenção e XP; gate `AUTH-DB`.
- [ ] `P035` — auditar as 30 funções `SECURITY DEFINER` anônimas; gate `AUTH-DB` para revogações/alterações.
- [ ] `P036` — proteger rotinas de soft delete/restore/listagem; gate `AUTH-DB`.
- [ ] `P037` — corrigir bypass por `NULL` na gamificação; gate `AUTH-DB`.
- [ ] `P038` — proteger `claim_pending_cadence_tasks`; gate `AUTH-DB`.
- [ ] `P039` — reduzir grants/default ACLs amplos; gate `AUTH-DB` por objeto.
- [ ] `P040` — criar suíte automatizada de segurança SQL.

**Gate de saída da onda:** menor privilégio comprovado por testes positivos e negativos com todas as personas relevantes.

### Onda 5 — integridade e operação do banco

- [ ] `P041` — restaurar ou aposentar `tr_log_lead_stage_transition`; gates `AUTH-BUSINESS` e `AUTH-DB`.
- [ ] `P042` — validar as 1.350 constraints do destino.
- [ ] `P043` — medir seis grupos de índices duplicados; `AUTH-DB`/`AUTH-DELETE` antes de `DROP`.
- [ ] `P044` — avaliar as 11 FKs sem índice líder; `AUTH-DB` antes de criar.
- [ ] `P045` — decidir índice parcial/global de `quotes_inbound`; gate `AUTH-DB`.
- [ ] `P046` — corrigir quatro jobs cron quebrados; gates `AUTH-DB` e `AUTH-DEPLOY`.
- [ ] `P047` — validar os 25 jobs ativos.
- [ ] `P048` — revisar as 69 tabelas extras no Realtime; gate `AUTH-DB`.
- [ ] `P049` — qualificar schemas de extensões/rotinas; gate `AUTH-DB`.
- [ ] `P050` — definir manutenção, refresh e limites operacionais; gate `AUTH-DB` para jobs.

**Gate de saída da onda:** jobs funcionais, constraints explicadas, performance medida e nenhuma remoção de índice sem evidência/aval.

### Onda 6 — migrations, schema e tipos

- [ ] `P051` — gerar baseline canônico do banco vivo.
- [ ] `P052` — reconciliar 242 entradas do ledger com 595 SQLs locais.
- [ ] `P053` — catalogar os 15 nomes de migration não conformes sem renomear histórico.
- [ ] `P054` — resolver timestamps duplicados com migrations novas.
- [ ] `P055` — corrigir dez usos inválidos de `CREATE POLICY IF NOT EXISTS`.
- [ ] `P056` — separar/guardar 80 migrations destrutivas ou de manutenção.
- [ ] `P057` — executar replay completo em banco efêmero.
- [ ] `P058` — regenerar tipos do destino autorizado.
- [ ] `P059` — criar teste de contrato `.from`/`.rpc` × banco vivo/tipos.
- [ ] `P060` — bloquear merge diante de drift não justificado.

**Gate de saída da onda:** banco limpo reproduzível, migrations prospectivamente válidas, tipos representativos e drift automatizado.

### Onda 7 — Edge Functions

- [ ] `P061` — corrigir sete falhas de sintaxe/import.
- [ ] `P062` — corrigir 34 falhas adicionais de typecheck.
- [ ] `P063` — corrigir 28 testes Deno, separando ambiente de defeito real.
- [ ] `P064` — corrigir lint compartilhado e contratos de retry.
- [ ] `P065` — criar matriz de autenticação/autorização das 170 funções.
- [ ] `P066` — centralizar service role e validar ownership.
- [ ] `P067` — migrar CORS para allowlist dinâmica.
- [ ] `P068` — aplicar timeout, circuit breaker, idempotência e request ID por risco.
- [ ] `P069` — resolver quick actions, relações e RPCs ausentes; `AUTH-BUSINESS`/`AUTH-DB` conforme decisão.
- [ ] `P070` — reconciliar `verify_jwt`, código e deploy; gate `AUTH-DEPLOY`.

**Gate de saída da onda:** 170 funções compiláveis, contratos testados, autorização explícita e deploy rastreável.

### Onda 8 — verdade funcional e integrações

- [ ] `P071` — tornar `enrich-lead` real ou honestamente indisponível.
- [ ] `P072` — substituir métricas falsas de `UsageAnalytics`.
- [ ] `P073` — separar `LiveIntelligenceFeed` real de demo.
- [ ] `P074` — usar metadados reais em `RecordingSummaryDrawer`.
- [ ] `P075` — tornar `PriceElasticity` real ou explicitamente simulado.
- [ ] `P076` — integrar WhatsApp e persistir status do provedor.
- [ ] `P077` — retirar/rotular aleatoriedade em IA, reações, velocímetro e battlecards.
- [ ] `P078` — gerar PDF verdadeiro e alinhar storage/privacidade.
- [ ] `P079` — corrigir relações e ownership de pipeline/customer success.
- [ ] `P080` — concluir ou manter desabilitadas assinatura digital, WebAuthn e integrações parciais.

**Gate de saída da onda:** produção nunca apresenta dado inventado, integração ausente ou envio otimista como fato real.

### Onda 9 — qualidade e higiene

- [ ] `P081` — elevar cobertura dos fluxos P0/P1.
- [ ] `P082` — corrigir ambiente do workflow E2E/CI.
- [ ] `P083` — triar 483 testes Playwright e estabilizar smoke crítico.
- [ ] `P084` — executar acessibilidade autenticada nas 175 rotas.
- [ ] `P085` — aplicar Prettier em lotes separados de lógica.
- [ ] `P086` — corrigir 14 vulnerabilidades npm com testes de breaking changes.
- [ ] `P087` — corrigir ciclos de chunks e budgets ausentes.
- [ ] `P088` — validar oito módulos órfãos; gate `AUTH-DELETE` para excluir/mover.
- [ ] `P089` — padronizar lockfile e artefatos gerados; gate `AUTH-DELETE` por arquivo preexistente.
- [ ] `P090` — consolidar documentação e marcar histórico como histórico.

**Gate de saída da onda:** CI confiável, testes críticos verdes, acessibilidade medida e nenhuma limpeza não aprovada.

### Onda 10 — validação e produção

- [ ] `P091` — executar somente limpezas nominalmente aprovadas; gate `AUTH-DELETE`.
- [ ] `P092` — deprecar antes de remover objetos de banco; gates `AUTH-DB` e `AUTH-DELETE`.
- [ ] `P093` — manter entregas em PRs pequenos e reversíveis.
- [ ] `P094` — ensaiar tudo em clone de staging; gates de infraestrutura aplicáveis.
- [ ] `P095` — fazer canário controlado; gate `AUTH-DEPLOY`.
- [ ] `P096` — implantar observabilidade e SLOs.
- [ ] `P097` — executar carga, concorrência e degradação.
- [ ] `P098` — conduzir UAT e obter aceite de negócio.
- [ ] `P099` — confirmar restore, rollback e go/no-go; gates `AUTH-OPS`, `AUTH-BUSINESS` e `AUTH-DEPLOY`.
- [ ] `P100` — implantar gradualmente, observar tráfego real e obter aceite final; gate `AUTH-DEPLOY`.

**Gate de saída do programa:** produção estável dentro dos SLOs, zero P0/P1 sem tratamento aceito, rollback comprovado e aceite técnico/de negócio.

## 14. Estratégia recomendada de PRs iniciais

Não começar por refatorações amplas. A sequência recomendada é:

1. PR documental/CI para `P006`, `P010`, `P012`, `P013` e `P014`, sem alterar runtime;
2. pacote de autorização emergencial para `P002` a `P005`;
3. PR de contenção de `migrate-helper` após autorização;
4. pacote SQL separado para views (`P008`/`P031`) e outro para funções anônimas (`P009`/`P035` a `P038`);
5. suíte de segurança SQL `P040` antes ou junto das mudanças de autorização;
6. correções de compilação Edge em pequenos lotes `P061`/`P062`, sem refatoração funcional paralela;
7. correção do ambiente CI/E2E `P082` para tornar os gates confiáveis;
8. somente depois avançar para reconciliação mutável, limpeza, migrations estruturais e integrações.

Se uma etapa inicial depender de decisão do usuário, registrar `aguardando autorização` e avançar apenas para outra atividade segura e independente.

## 15. Modelo de solicitação de autorização

Usar este formato:

```md
### Solicitação <ID>

- Etapas: Pxxx/Pyyy
- Gate: AUTH-...
- Ambiente: ...
- Objeto/arquivo/dado exato: ...
- Estado atual comprovado: ...
- Ação proposta: ...
- Por que é necessária: ...
- Impacto/indisponibilidade/locks: ...
- Dependentes e compatibilidade: ...
- Backup e restauração testada: ...
- Dry-run e resultado: ...
- Testes antes/depois: ...
- Rollback: ...
- Métricas e janela de observação: ...
- Pergunta explícita: Autoriza exatamente a ação acima?
```

Ausência de resposta não é autorização.

## 16. Modelo de evidência de conclusão

```md
### Conclusão Pxxx

- Diagnóstico confirmado: ...
- Autorização: ... ou não aplicável
- PR/commit: ...
- Alterações: ...
- Testes locais: ...
- CI: ...
- Migration/deploy: ... ou não aplicável
- Evidência antes/depois: ...
- Métrica observada: ...
- Rollback validado: ...
- Pendências/riscos residuais: ...
- Critério de pronto atendido: sim/não e por quê
```

## 17. Condições de parada obrigatória

Parar o lote e comunicar imediatamente se:

- o projeto/ambiente não puder ser identificado de forma inequívoca;
- surgir segredo novo ou indício de exploração;
- o diff atingir objeto/arquivo fora da autorização;
- contagem, PK ou hash indicar risco de sobrescrita de dado válido;
- uma migration exigir reescrever histórico aplicado;
- backup/restore ou rollback falhar;
- teste negativo de autorização permitir acesso indevido;
- CI falhar em área relacionada;
- canário piorar erro, latência, integridade ou métrica crítica;
- o resultado depender de uma decisão real de negócio;
- uma limpeza tiver apenas ausência de referência estática como justificativa.

Não marcar como bloqueio definitivo apenas porque o trabalho é grande. Registrar evidência, isolar o impedimento e avançar somente em tarefas seguras e independentes.

## 18. Definição final de pronto

O programa só termina quando todos os itens forem verdadeiros:

- 100 etapas com estado e evidência;
- nenhum P0/P1 aberto sem mitigação formal, owner e prazo aceitos;
- origem, destino, migrations, ledger, tipos, deploy e documentação reconciliados;
- segurança SQL/Edge comprovada por testes negativos;
- mocks não são apresentados nem persistidos como dados reais;
- CI, unitários, contratos, smoke, E2E crítico e acessibilidade verdes;
- backup restaurado e rollback ensaiado;
- nenhuma exclusão ou alteração estrutural ocorreu sem autorização nominal;
- canário e produção foram observados com tráfego real dentro dos SLOs;
- aceite técnico e de negócio foi registrado.

## 19. Mensagem de ativação sugerida para o Cline

> Leia integralmente `AGENTS.md`, `README.md`, a documentação aplicável e este handoff. Depois leia o relatório canônico `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md`. Não altere banco, dados, deploy, segredos ou arquivos candidatos a lixo sem a autorização explícita exigida. Comece revalidando os achados P0 em modo somente leitura, crie o registro de status das 100 etapas e proponha o primeiro lote pequeno e reversível. Para qualquer ação com gate, produza o pacote de autorização e aguarde. Use worktree isolado, diff mínimo, testes proporcionais, PR em pt-BR, CI verde, rollback e evidência antes/depois. Não declare pronto sem produção com tráfego real.

## 20. Estado deste handoff

Este documento transfere contexto e protocolo; não concede autorização para executar ações remotas, destrutivas ou estruturais. Na data da criação:

- a auditoria foi concluída;
- o plano de 100 etapas foi definido;
- nenhum objeto ou dado dos bancos foi alterado pela auditoria;
- nenhum candidato a lixo foi removido;
- nenhuma etapa de remediação foi considerada concluída;
- o próximo executor deve iniciar por revalidação P0, registro de progresso e pacotes de autorização.
