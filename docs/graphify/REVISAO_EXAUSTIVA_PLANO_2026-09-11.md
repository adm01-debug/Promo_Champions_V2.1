# Revisão do plano Graphify: implementação, lacunas e evidências

Data: 11/09/2026. Objeto: [plano Graphify de 50 etapas](../planos/PLANO_GRAPHIFY_50_ETAPAS_2026-09-11.md). Revisão do código `a90a0523bb51fe4fb0f450f7e77bf2e2f2b9d863` e do estado remoto observado nesta sessão.

## Veredito

**Não implementamos todas as melhorias.** Há uma fundação local funcional, mas existem defeitos nos controles dessa fundação, adaptadores essenciais ausentes e requisitos de operação ainda sem evidência. Os PRs #131 e #132 permanecem abertos; a integração nova não está incorporada à `main` remota.

Considerando o aceite integral de cada etapa, a matriz abaixo registra **25 etapas parciais, 20 pendentes e 5 com validação do banco bloqueada**. Nenhuma das 50 tem seu aceite integral demonstrado por esta revisão. Isso não significa ausência de trabalho: pinagem, extração AST, validação básica e testes locais existem. Tampouco representa uma porcentagem de prontidão do produto.

A revisão cobre todas as etapas do plano Graphify. O plano geral de 100 etapas é outro programa: seus documentos históricos foram consultados para identificar dependências e alegações que precisam ser revalidadas, mas esta entrega não certifica as 100 etapas nem todas as funcionalidades do produto.

## 1. Baseline e método

| Fonte                                                                   | Estado observado                                                                                                                   |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `main` da pasta principal local                                         | `f5370737dd7def26ffcafac8e4cb0435c025c593`; limpa na consulta inicial                                                              |
| `main` remota, via `git ls-remote`                                      | `a8cbee7f84536d98e00649bb877dd2cb8bf8add0`                                                                                         |
| [PR #131](https://github.com/adm01-debug/Promo_Champions_V2.1/pull/131) | Aberto; base `main`; head `bd6a2b1deb0d04f1d761510c1d66cf5f8f117a7f`; documento de planejamento                                    |
| [PR #132](https://github.com/adm01-debug/Promo_Champions_V2.1/pull/132) | Aberto; base é a branch do #131; head `a90a0523bb51fe4fb0f450f7e77bf2e2f2b9d863`; 13 arquivos no PR                                |
| Pacote acumulado de Graphify                                            | 14 arquivos, 1.728 adições, 6 remoções em relação à `main` remota; nenhum diff em `src/` ou `supabase/`                            |
| Runtime local usado nos testes                                          | Node 24.19.0, uv 0.12.5, Graphify 0.9.48; CI configurado para Node 22, portanto execução local não é reprodução idêntica do runner |
| Migrations versionadas                                                  | 609 arquivos SQL; 600 prefixos de versão distintos; 6 grupos repetidos, com 9 arquivos excedentes                                  |
| Edge Functions versionadas                                              | 169 entrypoints `index.ts`; 288 arquivos `.ts`; não são contagens de deploy                                                        |
| MCP `promo_champions`                                                   | Consulta `supabase_db_connection_info` retornou `Management API 401: Unauthorized`                                                 |

Método: leitura do plano e dos scripts, comparação de refs remotas, consulta dos PRs/checks/logs, reexecução de testes locais e experimentos adversariais em repositório temporário com dados sintéticos. O worktree de implementação e a pasta principal foram preservados. O relatório e o reprodutor estão em worktree de auditoria separado.

O Graphify orientou a inspeção dos artefatos brutos e a verificação de proveniência e relações múltiplas. A consulta nativa não foi usada como prova de ausência de dependências. Não houve consulta de dados de negócio, DDL, deploy, merge ou alteração das funções do produto nesta revisão.

## 2. Defeitos confirmados e lacunas técnicas prioritárias

As prioridades abaixo são relativas à ferramenta de engenharia; não afirmam exposição comprovada da aplicação web.

### G-01 — P1: link simbólico intermediário permite escrita fora da raiz

Fonte: `scripts/graphify/extract-code-only.mjs:89–105,123` no SHA auditado. O código resolve a raiz `.graphify-local`, mas valida o restante de `--out` apenas lexicalmente. Um link em `.graphify-local/atalho` pode apontar para outro diretório.

Reprodução: criar um repositório temporário com um arquivo TS inofensivo; apontar `atalho` para um segundo diretório temporário; executar com `--out .graphify-local/atalho/extracao-real`. **O Graphify real 0.9.48 gravou `graph.json` no destino externo e o wrapper terminou com código 0.** Nenhum arquivo de usuário foi usado como alvo.

Correção necessária: conferir componentes existentes do caminho, resolver ancestrais e rejeitar links que escapem; reservar a geração antes da execução; testar também destino final simbólico, link quebrado e concorrência. Etapas 07, 08, 09 e 41 não podem ser encerradas com a proteção atual.

### G-02 — P1: proteção de segredos não cobre a representação decodificada nem os logs do subprocesso

Fontes: `scripts/graphify/verify-output.mjs:18–24`, `graphify-utils.mjs:3–9,87–90` e `extract-code-only.mjs:65–66`.

Reprodução A: um JSON válido contém token totalmente sintético com o primeiro caractere representado por escape Unicode. O scanner não reconhece a representação textual; após `JSON.parse`, o token está no nó e o verificador termina com código 0. O caso demonstra evasão do detector atual, não vazamento observado de uma credencial real.

Reprodução B: executável simulado escreve uma sentinela de token em stderr; `stdio: inherit` a encaminha antes da validação final. O reprodutor captura essa saída e imprime somente um booleano. Não foi demonstrado que a CLI real emita credenciais; foi demonstrada a falta de uma barreira de sanitização nessa fronteira.

Correção necessária: validar conteúdo estruturado decodificado, limitar e sanitizar logs, conferir todos os artefatos que possam ser divulgados e manter os dados brutos locais em área restrita. O scanner atual contempla alguns padrões, não garante ausência universal de segredos. Etapas 05, 08, 27, 37 e 41.

### G-03 — P2: verificação de versão aceita outro número

Fonte: `scripts/graphify/extract-code-only.mjs:119`. A comparação usa `includes`.

Reprodução: executável de fixture reporta `graphify 0.9.480`, enquanto a versão exigida é `0.9.48`; o wrapper prossegue e termina com sucesso. A reprodução confirma o bug de comparação; não afirma que a versão 0.9.480 esteja publicada.

Correção necessária: interpretar e comparar a versão inteira; testar sufixos, saídas inesperadas e binário ausente. Definir se o override `--expected-version` deve permanecer como mecanismo explicitamente excepcional. Etapas 06 e 07.

### G-04 — P1: grafo vazio e importação com destino vazio são aceitos

Fonte: `scripts/graphify/graphify-utils.mjs:31–83`.

Reprodução: `{nodes:[],edges:[]}` é aprovado. Aresta `imports` com origem existente e `target` igual a string vazia também é aprovada e contada como importação não resolvida. Uma aresta sem `relation` nem proveniência passa como íntegra; esta última condição é lacuna em relação ao contrato futuro, inclusive aceita pelos testes atuais.

Correção necessária: distinguir explicitamente corpus legitimamente vazio, falha de extração e ausência de snapshot; rejeitar IDs/endpoints vazios; validar esquema de relações e requisitos mínimos de evidência. Imports externos legítimos devem continuar representados como pendência de resolução. Etapas 16–18 e 31.

### G-05 — P1: saída incompleta pode ser reutilizada; não há publicação atômica

Fonte: `scripts/graphify/extract-code-only.mjs:105–107,123–135`.

Reprodução: um destino com `graphify-out/manifest.json`, mas sem `graph.json`, é aceito. A proteção contra reuso verifica somente a presença do JSON final, não a existência de uma geração anterior incompleta. O cenário foi executado com CLI simulada.

Inspeção adicional: não há lock/reserva exclusiva, promoção atômica do conjunto grafo+manifesto nem controle de SHA/hash de configuração no wrapper. A execução grava antes da validação; uma falha pode deixar artefatos rejeitados no diretório. Corrupção por concorrência não foi reproduzida nesta revisão e permanece hipótese a testar.

Correção necessária: geração isolada, publicação após validação e recuperação explícita de execução interrompida. Etapas 09, 18, 19, 38 e 43.

### G-06 — P2: limites operacionais e códigos de saída não cumprem o plano

Fonte: `scripts/graphify/extract-code-only.mjs:49–68,110–139` e `verify-output.mjs:18,36–38`.

Há limiar de quantidade de arquivos, mas não limites de bytes, tempo do subprocesso ou tamanho do JSON lido integralmente. `--max-workers` aceita qualquer inteiro positivo seguro, sem teto operacional. Falhas diversas usam código 1; não existem códigos distintos para configuração ausente e resultado parcial previstos na etapa 07.

Evidência por inspeção; não foi provocado consumo excessivo de memória ou CPU. Correção necessária: limites configuráveis com valores padrão seguros, timeouts e contrato de erro documentado. Etapas 05, 07, 18 e 41.

### G-07 — P1: o núcleo que liga código, banco e impacto ainda não foi implementado

Os arquivos próprios de implementação são somente `extract-code-only.mjs`, `verify-output.mjs` e `graphify-utils.mjs`, acompanhados de testes dos utilitários. Não existe adaptador multigrafo, interpretador de eventos de migrations, coletor de catálogo, reconciliador código/banco ou analisador de impacto por diff.

O snapshot de `src` conserva 38.217 relações brutas, mas apresenta 5.595 imports sem nó local e 270 relações potencialmente reduzidas na carga de grafo simples. Recontagem nesta revisão reproduziu os números. O aviso de colapso não preserva relações durante consultas: é diagnóstico, não a implementação do adaptador.

Correção necessária: contratos e fixtures antes dos adaptadores; preservar direção, operação, schema e assinatura; validar equivalência serializada e resolução antes de usar impacto para decisões. Etapas 12–25, 28 e 32.

## 3. Testes e qualidade da evidência

| Verificação                                  | Resultado atual e alcance                                                                                                                   |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run graphify:test`                      | 8 aprovados; somente utilitários, nenhum teste existente executa a CLI do wrapper                                                           |
| `uv lock --directory tools/graphify --check` | Aprovado; 35 pacotes resolvidos; não substitui duas instalações limpas exigidas no plano                                                    |
| `deno lint`                                  | Aprovado; 288 arquivos; não equivale a `deno check`, testes Deno ou deploy                                                                  |
| `npm run ci`                                 | Aprovado, código 0: lint, typecheck, scanner, 8 testes Graphify, testes com cobertura, build e budget de bundle                             |
| Testes Vitest dentro do CI local             | 516 aprovados, 2 ignorados; 53 arquivos de testes aprovados e 1 ignorado                                                                    |
| Cobertura instrumentada                      | 99,93% de linhas e 96,21% de branches no recorte configurado; não é cobertura de todo o sistema                                             |
| Build e budget                               | Aprovados; 414 chunks totalizam 2.434,4 KB gzip; aviso de import estático/dinâmico simultâneo de `AbcPieChart.tsx` permanece                |
| Reprodutor adversarial                       | 14 verificações: 3 conformes e 11 divergentes; verificações relacionadas compartilham a mesma causa, portanto não são 11 bugs independentes |
| Snapshot bruto de `src`                      | 9.349 nós; 38.217 relações; 38.093 EXTRACTED; 124 INFERRED; 5.595 imports sem nó; 270 pares multirrelação; manifesto com 2.035 entradas     |
| Consumo de modelo na extração registrada     | Contadores de entrada/saída do snapshot são 0; isso não mede tokens desta revisão nem economia comparativa                                  |

O reprodutor em [revisao-20260911/reproduzir.mjs](revisao-20260911/reproduzir.mjs) usa apenas fixtures locais, não conecta ao banco e não altera fontes auditadas. Deve terminar com código **1** enquanto houver divergências. Requer Graphify 0.9.48 instalado no caminho do runtime do projeto. Execução:

```bash
node docs/graphify/revisao-20260911/reproduzir.mjs /caminho/do/worktree-com-runtime
```

Ele cria um repositório e alvos descartáveis via `mkdtemp`, preservados para inspeção. Parte dos cenários usa executável simulado para testar o wrapper; o escape por symlink também é validado com a CLI real. O cenário de erro de JSON **não** reproduziu a sentinela privada no log no Node observado; não foi classificado como falha confirmada.

## 4. GitHub e verificações externas

O [run do PR #131](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/34591274996) reportou lint/typecheck, testes unitários, build, Deno lint, Lighthouse, bundle e auditoria de dependências aprovados. Como esse PR é documental e precede a fundação, seus checks não validam o código novo do #132.

- **E2E #131: falhou.** Os logs registram 20 falhas e 101 aprovações, incluindo timeouts de `locator.fill` e de navegação. A causa-raiz de todas as falhas não foi diagnosticada nesta revisão.
- **Supabase Types Drift #131: verde sem comparação real.** O log contém a execução efetiva `SUPABASE_ACCESS_TOKEN not set — skipping types drift check.` Não prova sincronização de tipos com o banco.
- **Vercel #131 e #132: falhou.** O status informa falta de acesso do autor Git TIPROMO ao projeto Vercel. Não é prova de defeito de build.
- **#132: não tem o pipeline canônico executado no head observado.** `.github/workflows/pr-checks.yml` aceita PRs com base `main`; o #132 tem como base a branch do #131. Seus checks visíveis são externos. CodeRabbit registra revisão pulada para essa base.

Antes de concluir publicação: corrigir a fundação, integrar a base documental segundo o fluxo autorizado e validar o head final com base `main`. Não transportar o sucesso de outro SHA ou de outro PR como se fosse aprovação do #132. Nenhum merge foi realizado nesta revisão.

## 5. Matriz completa das 50 etapas

Legenda: **PARCIAL** = há implementação/evidência de parte da entrega, mas falta cumprir o aceite integral; **PENDENTE** = não há implementação própria ou evidência suficiente da entrega; **BLOQUEADA** = validação do catálogo canônico indisponível, além de lacunas de implementação quando indicadas. Os estados são uma classificação desta revisão, não substituem silenciosamente o workflow de status do plano. Todas as etapas permanecem abertas para aceite.

| Etapa | Entrega do plano                 | Estado    | Evidência e requisito restante                                                                                                                |
| ----- | -------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 01    | Baseline e preservação           | PARCIAL   | SHAs/worktrees e contagens registrados; a pasta principal difere da `main` remota; falta baseline automatizada e reproduzível em clone limpo. |
| 02    | Domínios e inventário            | PARCIAL   | Contagens por diretório e docs existem; falta classificação de cada entrada elegível, responsáveis e exclusões justificadas.                  |
| 03    | Perguntas e sucesso mensurável   | PENDENTE  | Há exemplos no plano, mas não conjunto de 20 perguntas com respostas independentes e métricas.                                                |
| 04    | ADR local-first                  | PARCIAL   | Runtime isolado e abordagem local aplicados; ADR formal, licença/dependências revisadas e alternativas não foram entregues.                   |
| 05    | Ameaças e conteúdo               | PARCIAL   | Scanner e restrições básicas existem; G-01/G-02/G-06 demonstram limites; faltam política e testes abrangentes.                                |
| 06    | Runtime reproduzível             | PARCIAL   | Versão e 35 dependências pinadas; falta demonstrar duas instalações limpas iguais; G-03 afeta preflight.                                      |
| 07    | Wrapper e erros                  | PARCIAL   | Extração funciona; validação de caminho/versão incompleta; faltam CLI de consulta, timeouts e erros distintos.                                |
| 08    | Seleção e exclusões              | PARCIAL   | Regras `.env.*` e outputs existentes; faltam cenários de conteúdo/arquivos não rastreados e revisão de `tokens.css`; G-01/G-02.               |
| 09    | Isolamento e revisão             | PARCIAL   | Usa `git rev-parse`; falta SHA+digest de conteúdo/configuração, lock e teste de duas worktrees; G-05.                                         |
| 10    | Corpus sintético                 | PARCIAL   | Há fixtures JSON nos 8 testes; não existe corpus persistente TS/TSX/Deno/SQL com mutações, overloads e schemas homônimos.                     |
| 11    | Piloto AST frontend              | PARCIAL   | Baseline real `src` existe; faltam corpus de referência completo e cobertura de erros de parser por entrada.                                  |
| 12    | Aliases e módulos                | PARCIAL   | Extrator nativo gera relações; 5.595 imports não materializados; adaptador/fixtures de resolução próprios ausentes.                           |
| 13    | Edge e Deno                      | PARCIAL   | Há snapshots locais de extração Edge e contagem de entrypoints; faltam contratos de imports, cobertura e implantação observada.               |
| 14    | Histórico de migrations          | PENDENTE  | 609 SQL/600 prefixos medidos; nenhum adaptador de CREATE/ALTER/DROP/renomes e SQL dinâmico.                                                   |
| 15    | Ligações intercamadas            | PENDENTE  | Não há extrator próprio de `.from`, `.rpc`, `functions.invoke`, storage e subscriptions com operação/proveniência.                            |
| 16    | Identidade e multirrelações      | PARCIAL   | Detecta 270 relações sob risco; adaptador multigrafo e testes de ida/volta ausentes.                                                          |
| 17    | Proveniência e confiança         | PARCIAL   | JSON nativo inclui fontes/confiança; falta contrato obrigatório de hashes, versão e instante; aceita arestas sem evidência.                   |
| 18    | Publicação atômica               | PARCIAL   | Validador básico existe; G-04/G-05; grafo e manifesto não são promovidos atomicamente.                                                        |
| 19    | Incremental                      | PENDENTE  | Reuso de snapshot completo é recusado; não há implementação de atualização nem equivalência integral/incremental.                             |
| 20    | Cobertura por domínio            | PARCIAL   | Baseline frontend e snapshots locais; falta matriz de cobertura e união compatível de todos os domínios.                                      |
| 21    | Identidade e leitura             | BLOQUEADA | MCP retorna 401; identidade canônica e sessão read-only não confirmadas.                                                                      |
| 22    | Estrutura relacional             | BLOQUEADA | Catálogo vivo não coletado; adaptador de colunas/constraints/índices também não foi implementado.                                             |
| 23    | Segurança e objetos programáveis | BLOQUEADA | Sem leitura atual de RLS/ACL/funções; adaptador e testes de visibilidade/permissão ausentes.                                                  |
| 24    | Storage, extensões e jobs        | BLOQUEADA | Sem inventário atual; sanitizador de cron/URLs e coletor operacional ausentes.                                                                |
| 25    | Reconciliação                    | BLOQUEADA | Não há snapshot canônico nem reconciliador por assinatura/definição; contagens históricas não resolvem.                                       |
| 26    | Documentação rastreável          | PENDENTE  | Markdown existe como fonte; indexador de referências/documentos atuais versus históricos ausente.                                             |
| 27    | Semântica opcional               | PENDENTE  | Permanece desabilitada; falta decisão final documentada de dispensa ou avaliação conforme critérios.                                          |
| 28    | Matriz funcional                 | PENDENTE  | Não foi produzida matriz requisito→rota→hook→serviço→banco→teste pelo novo fluxo.                                                             |
| 29    | Backlog de achados               | PENDENTE  | Esta revisão lista defeitos da fundação; backlog funcional deduplicado do produto depende da matriz ainda ausente.                            |
| 30    | Relatório auditável              | PARCIAL   | Relatórios manuais de lote/baseline existentes; gerador por snapshot/fonte e cobertura ausente.                                               |
| 31    | CLI de consulta                  | PARCIAL   | `graphify:verify` e extração disponíveis; falta interface de consulta/path/explain com verificação de atualidade.                             |
| 32    | Impacto por diff                 | PENDENTE  | Nenhum adaptador; relação reversa, renomes, exclusões e SQL ainda sem contrato implementado.                                                  |
| 33    | Instruções de agentes            | PARCIAL   | Integração anterior na `.claude/CLAUDE.md` existe; ainda em inglês e sem fluxo portátil novo de frescor/impacto.                              |
| 34    | MCP local e hook                 | PENDENTE  | Nenhuma nova interface/hook nem decisão formal separada; mantê-los desligados não fecha a avaliação opcional.                                 |
| 35    | Visualização privada             | PENDENTE  | Não entregue; faltam escolha de fallback, agregação, escape e teste de conteúdo malicioso.                                                    |
| 36    | Workflow Graphify                | PARCIAL   | Testes de utilitários adicionados ao pipeline; workflow de extração/impacto não existe e #132 não disparou gate canônico.                     |
| 37    | Caches e artefatos CI            | PARCIAL   | Saídas ignoradas e nenhum upload novo; falta implementar política de CI, retenção e rejeição de cache adulterado.                             |
| 38    | Atualização pós-merge            | PENDENTE  | Não há gerador no SHA mergeado, promoção ordenada ou política de expiração.                                                                   |
| 39    | Alertas calibrados               | PENDENTE  | Não existem três PRs observados com esse fluxo, limiares e exceções registradas.                                                              |
| 40    | Manutenção de versões            | PENDENTE  | Pinagem presente não equivale a rotina de atualização, licença, migração de formato e rollback testado.                                       |
| 41    | Cenários hostis                  | PARCIAL   | Novas reproduções confirmaram falhas; faltam correções e casos de tamanho, encoding, prompt/HTML e corrida.                                   |
| 42    | Banco descartável                | PENDENTE  | Nenhum coletor/fixture relacional implementado; esta entrega pode avançar sem acessar o canônico.                                             |
| 43    | Recuperação e concorrência       | PENDENTE  | Não há suíte de interrupção, lock abandonado, corrupção e equivalência incremental.                                                           |
| 44    | Qualidade e benefício            | PENDENTE  | Contagens e consulta de fumaça não substituem comparação com gabaritos, tempo e recursos equivalentes.                                        |
| 45    | Não regressão e gates            | PARCIAL   | Testes locais reexecutados; testes do wrapper não abrangem seus riscos, E2E remoto falha e CI #132 não executou.                              |
| 46    | Piloto em PR real                | PENDENTE  | Não existe caso concluído do fluxo consulta→fontes→impacto→testes reproduzido por mantenedor.                                                 |
| 47    | Expansão e cobertura             | PENDENTE  | Faltam todos os domínios com fonte, owner, atualização e perfil estático formal; catálogo indisponível.                                       |
| 48    | Runbook e rollback               | PARCIAL   | README documenta bootstrap/limites; faltam ensaios de incidente, recuperação e restauração.                                                   |
| 49    | Handoff e treinamento            | PENDENTE  | Handoff específico com comandos finais e reprodução por outra pessoa não foi entregue.                                                        |
| 50    | Aceite e operação                | PARCIAL   | Esta revisão reconcilia 50 etapas; faltam fechamento obrigatório, merge, três PRs e sete dias de uso real.                                    |

## 6. Correções necessárias no próprio plano

1. **Antecipar contratos de identidade/proveniência.** A etapa 16 depende da 15, mas 12–15 precisam da identidade estável para integrar seus resultados. Definir o esquema mínimo antes desses adaptadores e preservar os números canônicos.
2. **Separar desenvolvimento do coletor de leitura em produção.** A etapa 42 aparece após a 25 e depende das coletas 22–25; o texto também exige testes descartáveis antes do canônico. Especificar duas partes: implementar/testar o coletor com fixtures e, depois, habilitar sua aplicação ao canônico. A falta de token não impede a primeira parte.
3. **Quebrar o ciclo operacional implícito 39→45→46.** A 39 exige observar três PRs; a 45 depende da 40, que depende da 39; a 46 só então prevê o primeiro piloto. Separar piloto informativo inicial de calibração final para não depender de uma adoção que o plano só habilita depois.
4. **Definir caminhos estático e enriquecido.** O bloqueio de banco não deve impedir fixtures, multigrafo, consultas ou relatório estático; apenas limita a certificação da reconciliação e operação completa.
5. **Tornar evidência por etapa obrigatória e atualizável.** O plano diz que todas começam pendentes; o lote A declara 11–50 pendentes, embora outro documento registre piloto e baseline. Manter uma matriz única com commit, teste e aceite residual.
6. **Corrigir contagem e descrição dos testes.** O lote A e a descrição do #132 dizem 6 testes; o head possui 8. Os testes são de utilitários, não end-to-end do wrapper, e não cobrem o symlink que foi reproduzido.
7. **Definir significado de check pulado.** Sucesso de um job que não comparou tipos deve ser registrado como não observado. Ausência de pipeline em PR encadeado deve impedir certificar o head.
8. **Especificar origem imutável dos snapshots.** SHA da fonte, digest do conteúdo sujo, configuração e runtime precisam acompanhar a geração. O manifesto nativo contém `mtime`, `seen`, `ast_hash` e `semantic_hash`, sem o contrato completo de revisão do projeto.

As mudanças acima são recomendações desta revisão. O plano canônico e o código de implementação não foram reescritos nesta entrega.

## 7. Banco e vínculo com o plano geral de 100 etapas

O único resultado remoto atual desta revisão é a falha 401 na identificação do MCP. Isso significa **não observado**, e não banco vazio, banco incorreto ou ausência de tabelas/policies. Não é possível certificar sincronização, perda real, ACL/default ACL, ledger, Advisors, storage, cron ou deploy das Edge Functions com esse resultado.

No código auditado existe `supabase/migrations/20260910130000_revoke_supabase_admin_default_truncate.sql`, incorporada à `main` remota pelo commit `a8cbee7f8` (#124). Isso comprova a presença da correção DB-01 no repositório. Sua aplicação atual e efeito sobre grants do canônico não foram reconsultados nesta sessão.

Os números antigos de 71 Edge Functions ausentes, três migrations incompatíveis e quantidades de objetos do banco **não foram confirmados novamente**. As contagens atuais de arquivos não permitem concluir quais deployments faltam.

Os documentos de 30/08 e 02/09 mantêm pendências históricas de WebAuthn, CORS/allowlist, cron dependente de deployment e sincronização de schema. Elas precisam de reconciliação nominal por commit+objeto+teste, e não podem ser declaradas atuais ou resolvidas apenas pelo texto antigo. Também não se deve classificar tabela vazia como função incompleta.

Próxima prova do banco: identificar o projeto e a sessão, coletar metadados em leitura controlada, comparar assinaturas/definições e ledger, reconsultar ACL/Advisors e registrar capacidades não visíveis. Para Graphify, o adaptador deve primeiro passar pela fixture descartável da etapa 42. Não há necessidade de solicitar novamente autorização para a auditoria de leitura já pedida; a indisponibilidade observada é técnica.

## 8. Ordem recomendada de execução após esta revisão

1. Corrigir G-01 a G-06 em lote pequeno, incorporando regressões reais da CLI; revalidar o #132 antes de merge.
2. Formalizar identidade, proveniência, gabaritos e critérios de cobertura; atualizar a matriz de status sem renumerar etapas.
3. Implementar multigrafo e publicação atômica; depois incremental com equivalência integral, remoção, renome e falha.
4. Implementar resoluções TS/Deno, histórico SQL e ligações intercamadas; entregar consulta/impacto estático com pendências explícitas.
5. Construir coletor e fixtures de catálogo descartável; validar o canônico quando a conexão autenticada estiver operacional.
6. Consolidar matriz funcional e reconciliação; cada correção de produto descoberta recebe escopo/testes próprios.
7. Habilitar CI informativo no head correto, piloto real, manutenção e handoff; observar três PRs e sete dias antes do encerramento.

**Decisão técnica:** a fundação ainda exige correção; a integração Graphify e a saúde integral do produto não podem ser certificadas como concluídas. Os achados desta revisão são entregues para correção, sem modificar a aplicação ou o banco durante a auditoria.
