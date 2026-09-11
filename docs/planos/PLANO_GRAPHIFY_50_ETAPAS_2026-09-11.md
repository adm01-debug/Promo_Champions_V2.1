# Plano de implementação do Graphify — 50 etapas

Data: 11/09/2026. Projeto: Promo_Champions_V2.1. Responsável pela execução: engenharia; revisão dos lotes: mantenedor do projeto.

## Resultado esperado e limites

Integrar o Graphify ao trabalho de engenharia para consultar arquitetura, rastrear dependências, avaliar impacto de mudanças e investigar funcionalidades sem ligação comprovada entre frontend, Edge Functions e banco. A integração deve preservar o design, o comportamento do produto e os controles existentes.

Este documento é um plano executável, não uma declaração de implementação concluída. As 50 etapas começam como **PENDENTES**. A inspeção preparatória abaixo não equivale à execução dos testes propostos. A entrega deste documento não instala workflows, não modifica hooks e não altera o Supabase.

A primeira versão será local, determinística e sem chamadas a modelos. Não adicionaremos Neo4j, extensão PostgreSQL, tabela de grafo, serviço público ou dependência ao bundle do cliente. Enriquecimento semântico é opcional e depende de avaliação de custo e autorização para enviar conteúdo a um provedor. MCP é uma interface opcional: a CLI deve continuar suficiente.

O grafo é um índice derivado com evidências, não a fonte de verdade. Código, configuração, migrations e observações autorizadas do ambiente continuam sendo as fontes. Ausência de aresta não prova código morto; tabela vazia não prova funcionalidade incompleta; ligação estática não prova funcionamento em produção.

## Diagnóstico preparatório verificável

Inspeção do ambiente local e do repositório em 11/09/2026:

| Observação | Evidência | Consequência |
| --- | --- | --- |
| Existe instalação local de `graphifyy` 0.9.48, com requisito Python >=3.10 | Metadados do pacote no ambiente `uv` e CLI instalada | Não confundir ferramenta disponível para um operador com dependência reproduzível do projeto |
| Há regras de exclusão e integração para Claude | `.graphifyignore`, `.claude/CLAUDE.md` e skill referenciada existente no ambiente local | Preservar instruções; verificar portabilidade para clone limpo |
| Existem relatório e manifesto versionados | `graphify-out/GRAPH_REPORT.md`, `graphify-out/manifest.json` | São artefatos históricos; não representam automaticamente o código atual |
| O relatório cita 29/08/2026 e commit `7211d60d` | Cabeçalho do relatório | Recalcular antes de usar conclusões sobre dependências |
| O resumo histórico afirma 0% INFERRED, mas também informa 137 arestas INFERRED | Seção de proveniência do relatório | Validar contadores a partir do mesmo conjunto de arestas |
| `graphify-out/graph.json` não foi encontrado na raiz local inspecionada | Verificação de existência; JSON e HTML estão no `.gitignore` | Não é possível assumir que o relatório entregue permita consultas reproduzíveis |
| A configuração de hooks aponta para `.husky/_` | `git config core.hooksPath` | Não executar instalação automática de hook por cima do Husky |
| Não foram encontradas referências Graphify nos scripts/workflows pesquisados | Busca em `package.json`, `scripts/` e `.github/` | Integração automatizada ainda precisa ser especificada e testada |
| A ajuda da extração PostgreSQL descreve tabelas, views, funções e FKs, sem detalhe de colunas | Ajuda da CLI instalada | Catálogo completo exige adaptação e testes, não apenas uma flag de conexão |
| A raiz local e o GitHub não estavam no mesmo commit | Local `f5370737dd7def26ffcafac8e4cb0435c025c593`; `origin/main` após fetch `a8cbee7f84536d98e00649bb877dd2cb8bf8add0` | Plano criado em worktree isolado baseado no remoto, sem atualizar nem sobrescrever a raiz |

Na base remota acima, `git ls-files` contou 2.037 arquivos em `src/`, 289 em `supabase/functions/`, 611 em `supabase/migrations/` e 82 em `docs/`. Dos 611 arquivos de migrations, 609 são SQL. Essas medidas **não** são contagens de funções implantadas, versões únicas de migration ou objetos reais do banco. Os arquivos adicionados por este plano não estão nessa baseline.

Não foi feita conexão ao banco nesta preparação. Quantidades e correções históricas do Supabase não foram revalidadas. Banco canônico esperado: projeto `usyxfpqlsspldubptrdl`. O hostname, isoladamente, não basta para validar um proxy MCP.

## Arquitetura proposta

```text
Arquivos permitidos + configuração de resolução + metadados RO autorizados
                         |
                extração por domínio
                         |
       normalização + proveniência + integridade
                         |
       snapshot atômico identificado por SHA e hashes
                         |
        consultas CLI / agentes / relatórios privados
                         |
      revisão humana + testes reais antes de correções
```

Locais propostos, sujeitos à verificação de convenções na etapa 02:

- `tools/graphify/`: runtime Python isolado e resolução de dependências; nenhum pacote Python misturado ao runtime Vite.
- `scripts/graphify/`: wrappers pequenos, adaptadores e validações; reutilizar utilitários existentes antes de duplicá-los.
- `tests/graphify/`: fixtures sintéticas e testes determinísticos, sem dados pessoais ou credenciais.
- `docs/graphify/`: contrato, operação, decisões, catálogo de limitações e evidências sanitizadas.
- `graphify-out/`: saída derivada local, com política explícita para o relatório e manifesto históricos já rastreados.
- `.github/workflows/graphify.yml`: workflow proposto, inicialmente informativo e sem segredos de produção.

## Regras de execução e conclusão

Cada etapa exige um registro com status, commit, arquivos, comando executado, resultado, evidência sanitizada, limitação e próximo responsável. Estados: PENDENTE, EM EXECUÇÃO, VALIDADA LOCALMENTE, PUBLICADA, VALIDADA EM USO ou BLOQUEADA. Uma etapa opcional só pode ser dispensada por decisão registrada, não por omissão.

Prioridades: P0 = segurança/integridade; P1 = núcleo necessário; P2 = experiência e evolução. Porte relativo: P = alteração localizada; M = integração com fixtures; G = vários contratos ou ambientes. Porte não é promessa de prazo: medir o piloto antes de estimar calendário.

Cada etapa depende das citadas em seu campo **Depende**. Acesso ao banco bloqueia apenas as entregas que exigem observação do banco, não a análise estática independente. O caminho SQL previsto por migrations e o catálogo observado são camadas distintas e nunca serão mesclados como se tivessem a mesma atualidade.

Nenhuma etapa autoriza apagar arquivos classificados como lixo, executar migrations, alterar tabelas/colunas/funções, mudar RLS/grants, publicar Edge Functions ou rotacionar credenciais. Descobertas desse tipo geram tarefas separadas com escopo e autorização próprios. Não usar tokens colados no chat; acessar credenciais pelo mecanismo seguro do ambiente, sem imprimi-las.

## Fase A — Escopo, riscos e contratos

### Etapa 01 — Fixar baseline e preservar o trabalho existente

- **Prioridade/porte:** P0/P. **Depende:** nenhuma.
- **Execução:** registrar HEAD, `origin/main`, estado sujo, worktrees, versões das ferramentas e arquivos Graphify já rastreados. Criar worktree exclusivo, sem incorporar PRs abertos por suposição.
- **Saída:** baseline em `docs/graphify/` com hashes e comandos de reprodução, sem caminhos pessoais desnecessários.
- **Aceite:** clone/worktree limpo reproduz as contagens; nenhuma mudança anterior é perdida. Mudança de SHA invalida a identificação do snapshot, não o trabalho do usuário.

### Etapa 02 — Mapear domínios e inventariar a integração existente

- **Prioridade/porte:** P1/M. **Depende:** 01.
- **Execução:** confrontar README, `docs/estado/`, scripts, configurações TS/Deno, aliases, código gerado e skills com o código atual. Particionar CRM, SDR, analytics, gamificação, IA, administração e infraestrutura usando caminhos reais.
- **Saída:** mapa de entradas, exclusões e responsáveis; inventário de integrações reutilizáveis e referências não portáveis.
- **Aceite:** todo arquivo candidato pertence a um domínio ou tem exclusão justificada; nomes em documentação não prevalecem sobre evidência divergente.

### Etapa 03 — Definir perguntas de negócio técnico e sucesso mensurável

- **Prioridade/porte:** P1/P. **Depende:** 02.
- **Execução:** selecionar pelo menos 20 perguntas reais, como “quais telas chamam esta RPC?” e “o que depende desta coluna?”. Produzir respostas de referência por inspeção independente do grafo.
- **Saída:** conjunto de avaliação com respostas, fontes e casos intencionalmente sem resposta estática.
- **Aceite:** cada pergunta tem fonte verificável e métrica; economia de tokens e tempo será medida, nunca presumida.

### Etapa 04 — Registrar decisão de arquitetura local-first

- **Prioridade/porte:** P1/P. **Depende:** 02, 03.
- **Execução:** escolher versão candidata, runtime isolado, formato intermediário e interfaces mínimas. Conferir licença da versão pinada e dependências, não apenas da branch upstream atual.
- **Saída:** ADR em `docs/decisions/`, com identificador livre, alternativas, limites e motivos para não criar serviço de produção nesta fase.
- **Aceite:** nenhuma dependência entra no bundle React; CLI offline permanece caminho suportado; atualizações de versão exigem regressão.

### Etapa 05 — Modelar ameaças e definir classificação de conteúdo

- **Prioridade/porte:** P0/M. **Depende:** 02, 04.
- **Execução:** avaliar segredos em código/SQL/docs, prompt injection, links simbólicos, arquivos gigantes, HTML gerado, exfiltração e permissões de artefatos privados.
- **Saída:** política de leitura mínima, retenção, acesso, sanitização e limites de CPU/memória/tempo.
- **Aceite:** documentos e descrições do banco são dados não confiáveis, nunca instruções executáveis; conteúdo sensível não alcança logs, artefatos ou modelos.

## Fase B — Fundação reproduzível e segura

### Etapa 06 — Fixar ferramenta e dependências em ambiente isolado

- **Prioridade/porte:** P1/M. **Depende:** 04, 05.
- **Execução:** validar a versão local 0.9.48 como candidata, pinando versão e dependências transitivas em `tools/graphify/`. Registrar Python/uv suportados e verificar instalação limpa sem tocar na instalação global.
- **Saída:** configuração e lock reproduzíveis, instrução de bootstrap e verificação de versão.
- **Aceite:** duas instalações limpas produzem o mesmo conjunto de dependências; a extração estrutural posterior funciona sem chave ou tráfego de modelo.

### Etapa 07 — Criar wrapper com preflight e contratos de erro

- **Prioridade/porte:** P1/M. **Depende:** 06.
- **Execução:** implementar entrada única em `scripts/graphify/` que valide versão, raiz real, configuração, limites, diretório de saída e suporte dos comandos. Não interpolar entrada em shell.
- **Saída:** comandos documentados para extrair, validar e consultar; códigos de erro distintos para falha, ausência de configuração e resultado parcial.
- **Aceite:** caminho com espaços, executável ausente e argumento malicioso têm testes; nenhum fallback transforma falha em sucesso silencioso.

### Etapa 08 — Fortalecer seleção e exclusão de arquivos

- **Prioridade/porte:** P0/M. **Depende:** 05, 07.
- **Execução:** revisar `.graphifyignore` e `.gitignore` por conteúdo, incluindo outputs recursivos, caches, arquivos pessoais e exemplos de ambiente. Avaliar `tokens.css` como possível design token antes de mudar sua classificação.
- **Saída:** regras testadas para arquivos rastreados e não rastreados; lista de candidatos históricos preservada para decisão do usuário.
- **Aceite:** segredo sintético em `.env.example`, comentário SQL ou arquivo não rastreado é barrado; output nunca vira input; nada é apagado sem autorização.

### Etapa 09 — Isolar snapshots por worktree e revisão

- **Prioridade/porte:** P0/M. **Depende:** 07, 08.
- **Execução:** identificar raiz Git sem presumir que `.git` é diretório. Segregar caches por projeto/configuração; registrar SHA e digest do conteúdo modificado, sem confundir checkout sujo com HEAD limpo.
- **Saída:** resolução worktree-aware e controle de concorrência por destino de saída.
- **Aceite:** duas branches executadas simultaneamente não sobrescrevem seus snapshots; uma delas falhar não corrompe a outra.

### Etapa 10 — Construir corpus sintético de referência

- **Prioridade/porte:** P1/M. **Depende:** 07, 08, 09.
- **Execução:** criar fixtures TS/TSX, imports Deno, SQL, docs, ciclos, referências ausentes, overloads e nomes repetidos em schemas distintos.
- **Saída:** `tests/graphify/` com entradas pequenas e resultados esperados revisados manualmente.
- **Aceite:** testes são offline, não usam clientes reais e detectam pelo menos uma mutação deliberada de cada contrato crítico.

## Fase C — Extração estrutural do produto

### Etapa 11 — Executar piloto AST do frontend

- **Prioridade/porte:** P1/M. **Depende:** 10.
- **Execução:** extrair um domínio representativo em modo somente código; conferir imports, exports, componentes e hooks contra as fixtures e fontes.
- **Saída:** snapshot piloto, contagem de arquivos processados/ignorados/com erro e relatório de custo local.
- **Aceite:** nenhuma chamada de modelo; arquivos com erro aparecem explicitamente no denominador de cobertura.

### Etapa 12 — Resolver aliases, lazy imports e fronteiras de módulos

- **Prioridade/porte:** P1/G. **Depende:** 11.
- **Execução:** respeitar configurações TS/Vite reais, reexports, barrels e imports lazy literais. Classificar caminhos calculados como não resolvidos ou inferidos com justificativa.
- **Saída:** adaptador mínimo apenas para lacunas verificadas do Graphify, sem manter um parser paralelo desnecessário.
- **Aceite:** alias aponta ao arquivo correto; nomes iguais em módulos diferentes não se fundem; import dinâmico desconhecido não vira certeza.

### Etapa 13 — Mapear Edge Functions e dependências Deno

- **Prioridade/porte:** P1/G. **Depende:** 10, 12.
- **Execução:** ler entrypoints, `_shared`, imports remotos/npm e configuração Deno. Separar arquivo existente, handler exportado, função configurada e implantação observada.
- **Saída:** subgrafo Edge com origem e versão dos imports disponíveis, falhas e limites explícitos.
- **Aceite:** diretório não é contado automaticamente como função implantada; import remoto não dispara execução nem download arbitrário durante análise offline.

### Etapa 14 — Representar migrations como histórico, não como banco aplicado

- **Prioridade/porte:** P0/G. **Depende:** 10, 13.
- **Execução:** extrair DDL e referências SQL, versões duplicadas, ordenação, renomes e objetos removidos. Tratar SQL dinâmico e comandos não suportados como lacunas, sem executar migrations.
- **Saída:** eventos de schema previstos por arquivo/hash e camada de estado previsto com grau de completude.
- **Aceite:** CREATE seguido de DROP não mantém objeto ativo por engano; duas migrations da mesma versão não são colapsadas; nenhuma migration histórica é editada.

### Etapa 15 — Ligar frontend, Edge, RPC e entidades de dados

- **Prioridade/porte:** P1/G. **Depende:** 12, 13, 14.
- **Execução:** mapear chamadas literais `.from`, `.rpc`, `functions.invoke`, subscriptions e storage, preservando schema, direção, operação e arquivo/linha.
- **Saída:** relações intercamadas com confiança; fila de chamadas dinâmicas não resolvidas.
- **Aceite:** fixtures distinguem SELECT, escrita e execução RPC; uma relação estática não é promovida a comprovação de autorização ou sucesso em runtime.

## Fase D — Integridade, proveniência e atualização

### Etapa 16 — Definir identidade estável e relações múltiplas

- **Prioridade/porte:** P0/G. **Depende:** 15.
- **Execução:** qualificar IDs por domínio, caminho e assinatura/schema; preservar várias relações entre os mesmos nós e direção. Verificar se o formato nativo as preserva; adaptar somente quando necessário.
- **Saída:** esquema de dados versionado e mapeamento entre grafo nativo e extensão do projeto.
- **Aceite:** leitura e escrita entre os mesmos nós coexistem; overloads e schemas homônimos não colidem; serialização tem teste de ida e volta.

### Etapa 17 — Anexar proveniência e confiança verificáveis

- **Prioridade/porte:** P0/M. **Depende:** 16.
- **Execução:** registrar arquivo/linha ou objeto observado, hash, extrator/versão, instante e classes EXTRACTED, INFERRED ou AMBIGUOUS. Não inventar linha para metadado remoto.
- **Saída:** contrato de evidência e contadores calculados a partir do snapshot real.
- **Aceite:** toda aresta tem origem ou limitação declarada; totais e percentuais são coerentes; a contradição do relatório histórico não se repete.

### Etapa 18 — Implementar publicação atômica e diagnóstico

- **Prioridade/porte:** P0/M. **Depende:** 16, 17.
- **Execução:** validar IDs, endpoints, formato e contadores antes de promover uma geração completa. Publicar manifesto e grafo como uma unidade; preservar o último snapshot válido.
- **Saída:** validação de integridade e procedimento de recuperação de geração interrompida.
- **Aceite:** interrupção antes da promoção deixa a versão anterior íntegra; corrupção é detectada; autoarestas legítimas são classificadas, não eliminadas indiscriminadamente.

### Etapa 19 — Validar cache e atualização incremental

- **Prioridade/porte:** P1/G. **Depende:** 18.
- **Execução:** incluir conteúdo, configuração, versão do extrator e esquema na chave; tratar renome, exclusão e dependentes afetados. Falhas não recebem hash de processamento bem-sucedido.
- **Saída:** atualização incremental com fallback integral explícito, sem uso automático de flags que forçam reduções suspeitas.
- **Aceite:** snapshot incremental e integral são semanticamente equivalentes após adicionar, editar, renomear e remover arquivos; casos com falha são tentados novamente.

### Etapa 20 — Estabelecer cobertura e escala por domínio

- **Prioridade/porte:** P1/M. **Depende:** 18, 19.
- **Execução:** executar todos os domínios aprovados por lotes limitados e juntar snapshots compatíveis. Separar cobertura de arquivos, símbolos e relações verificáveis.
- **Saída:** primeira baseline estrutural atualizada, lista de exclusões e referências não resolvidas por domínio.
- **Aceite:** 100% das entradas elegíveis têm resultado declarado; não declarar 100% de compreensão do sistema a partir disso; consumo e tempo ficam registrados.

## Fase E — Catálogo Supabase somente leitura

### Etapa 21 — Validar identidade, acesso e sessão de leitura

- **Prioridade/porte:** P0/G. **Depende:** 05, 17.
- **Execução:** validar projeto esperado `usyxfpqlsspldubptrdl`, metadados confiáveis do endpoint e identidade da sessão. Usar conexão segura, privilégios mínimos, transação read-only e timeouts quando suportados. Se MCP não garantir o contrato, bloquear esse caminho e documentar alternativa RO.
- **Saída:** evidência sanitizada de identidade/acesso; seleção explícita de schemas e capacidades visíveis.
- **Aceite:** endpoint divergente e HTTP 403 interrompem a coleta; falta de permissão é “não observado”, nunca catálogo vazio; nenhum segredo aparece em argumentos/logs.

### Etapa 22 — Coletar estrutura relacional completa

- **Prioridade/porte:** P1/G. **Depende:** 16, 21.
- **Execução:** coletar schemas, tabelas, partições, colunas, tipos, defaults, nulabilidade, identidade, generated, constraints e índices com expressões/predicados. Não ler linhas de negócio.
- **Saída:** snapshot de catálogo com schema e identidade de objetos, distinguindo estimativas de tamanho de provas de uso.
- **Aceite:** banco sintético cobre PK/FK/UNIQUE/CHECK/EXCLUDE, índice parcial e composto; ausência de linhas não reduz classificação funcional.

### Etapa 23 — Coletar segurança e objetos programáveis

- **Prioridade/porte:** P0/G. **Depende:** 22.
- **Execução:** representar RLS habilitada/forçada, policies, roles/membership, ACL/default ACL, funções com assinatura, SECURITY DEFINER/search_path, triggers, views/materialized views e enums. Sanitizar definições que possam embutir credenciais.
- **Saída:** relações de autorização e execução, incluindo visibilidade parcial e diferenças entre privilégios explícitos e efetivos.
- **Aceite:** fixture cobre PUBLIC, herança, default grants, policy permissiva/restritiva, owner e bypass RLS; análise estática não é anunciada como teste de isolamento entre tenants.

### Etapa 24 — Coletar extensões, storage e automações

- **Prioridade/porte:** P1/G. **Depende:** 21, 23.
- **Execução:** inventariar extensões/versões, buckets/configuração/policies, jobs disponíveis, agendamentos e vínculo com funções; incluir metadados de implantação Edge quando acessíveis. Proibir listagem de documentos privados e execução de jobs.
- **Saída:** catálogo de recursos operacionais com fonte e instante; segredos em comandos de cron e URLs são redigidos antes de persistência.
- **Aceite:** extensão ausente, permissão negada e job desativado são estados diferentes; inventário nunca dispara cron, função, webhook ou envio externo.

### Etapa 25 — Comparar código, migrations e catálogo observado

- **Prioridade/porte:** P0/G. **Depende:** 14, 15, 20, 22, 23, 24.
- **Execução:** confrontar três camadas: referências do código, histórico/ledger visível e objetos observados. Quando autorizado, origem entra como quarta fonte independente. Classificar diferença intencional, perda confirmada, parcial e não verificável.
- **Saída:** matriz com objeto, evidências, timestamps, impacto e decisão pendente; comparação de assinatura/definição quando disponível, não só nomes e quantidades.
- **Aceite:** objeto sem consumidor estático não é automaticamente lixo; ledger igual não prova schema igual; divergência não gera migration ou reparo automático.

## Fase F — Conhecimento e diagnóstico de lacunas

### Etapa 26 — Indexar documentação e decisões com rastreabilidade

- **Prioridade/porte:** P1/M. **Depende:** 17, 20.
- **Execução:** começar por links, títulos e referências explícitas de Markdown e ADRs permitidos; distinguir documentos históricos, atuais e propostas.
- **Saída:** relações documento→arquivo/objeto/decisão, mantendo autor/data quando disponíveis.
- **Aceite:** afirmação antiga não sobrescreve código ou observação recente; link quebrado aparece como pendência, não como implementação faltante comprovada.

### Etapa 27 — Avaliar enriquecimento semântico opcional

- **Prioridade/porte:** P2/M. **Depende:** 05, 06, 26.
- **Execução:** comparar valor adicional com baseline AST em amostra sanitizada. Antes de qualquer chamada externa, registrar provedor/modelo, dados enviados, custo máximo, autorização e política de retenção.
- **Saída:** decisão habilitar/desabilitar e, se aprovado, processamento limitado, schema de resposta e cache versionado por prompt/modelo/configuração.
- **Aceite:** sem aprovação, mantém-se desabilitado; instruções maliciosas no documento não acionam ferramentas; inferência nunca recebe rótulo de evidência extraída.

### Etapa 28 — Montar matriz de funcionalidades e ligações

- **Prioridade/porte:** P1/G. **Depende:** 15, 20, 26.
- **Execução:** ligar requisito, rota, componente, hook, serviço, Edge/RPC, entidade e teste. Acrescentar estado observado da etapa 25 quando disponível, sem bloquear a matriz estática.
- **Saída:** matriz por funcionalidade com estados “referência comprovada”, “ligação não resolvida”, “teste ausente” e “runtime não verificado”.
- **Aceite:** mock, flag e DEMO_MODE exigem leitura do contexto; não declarar função incompleta apenas pela presença de um marcador ou ausência de aresta.

### Etapa 29 — Priorizar achados sem aplicar correções automáticas

- **Prioridade/porte:** P1/M. **Depende:** 03, 28.
- **Execução:** ordenar achados por evidência, impacto em segurança/dados/usuário e dependências. Enriquecer com etapa 25 quando desbloqueada; separar débito conhecido de regressão.
- **Saída:** backlog deduplicado, com hipótese, reprodução mínima, referência e responsável por validação.
- **Aceite:** cada falha confirmada tem reprodução ou evidência direta; hipóteses mantêm esse rótulo; nenhum arquivo/objeto é removido pelo diagnóstico.

### Etapa 30 — Gerar relatório coerente e auditável

- **Prioridade/porte:** P1/M. **Depende:** 17, 20, 26, 29.
- **Execução:** gerar visão por domínio, relações de alto impacto, cobertura, limitações e evidências; incluir estado de cada fonte e etapa opcional.
- **Saída:** relatório em português referenciando o snapshot exato e, quando publicado, links de código fixados no commit.
- **Aceite:** totais são calculados, não escritos manualmente; fonte velha ou indisponível aparece em destaque; relatório não afirma que o sistema está “10/10”.

## Fase G — Uso por desenvolvedores e agentes

### Etapa 31 — Expor comandos de consulta reproduzíveis

- **Prioridade/porte:** P1/M. **Depende:** 07, 18, 30.
- **Execução:** conectar scripts de projeto a consulta, caminho, explicação e validação usando apenas comandos confirmados na versão pinada. Rotular comandos semânticos com requisitos distintos dos offline.
- **Saída:** exemplos testados no projeto e mensagens de erro em português, sem substituir scripts existentes.
- **Aceite:** consulta mostra revisão/fonte; snapshot ausente ou obsoleto não resulta em resposta categórica; clone limpo consegue recriar o índice.

### Etapa 32 — Implementar análise conservadora de impacto por diff

- **Prioridade/porte:** P1/G. **Depende:** 19, 31.
- **Execução:** calcular base correta de comparação, símbolos alterados e dependentes reversos. Considerar remoções, renomes, SQL e relações desconhecidas; não reduzir a suíte obrigatória baseado apenas no grafo.
- **Saída:** relatório de impacto com testes sugeridos e confiança, sem executar testes com efeitos externos automaticamente.
- **Aceite:** chamada A→B implica impacto potencial em A ao mudar B; dependência dinâmica produz aviso e fallback abrangente.

### Etapa 33 — Integrar instruções dos agentes sem sobrescrever regras

- **Prioridade/porte:** P1/M. **Depende:** 31, 32.
- **Execução:** revisar `AGENTS.md`, `.claude/CLAUDE.md` e regras efetivamente usadas pelo Cline/Codex. Acrescentar orientação pequena: consultar grafo fresco, conferir fonte e validar runtime quando necessário.
- **Saída:** documentação portátil e links existentes, sem instalação global automática nem duplicação extensa da skill.
- **Aceite:** instruções pt-BR e isolamento Git permanecem; conteúdo do grafo não amplia permissões; agente sabe continuar por inspeção direta quando índice falha.

### Etapa 34 — Avaliar interface MCP local e coexistência com Husky

- **Prioridade/porte:** P2/M. **Depende:** 05, 09, 31, 33.
- **Execução:** verificar suporte real a servidor MCP na versão pinada; preferir stdio somente leitura se adotado. Tratar hook como opt-in, respeitando `core.hooksPath`, e não instalar ambos só por disponibilidade.
- **Saída:** decisão separada para MCP e hook; adaptador mínimo ou dispensa justificada com CLI suportada.
- **Aceite:** nenhum endpoint público; duas worktrees e falha da ferramenta não quebram Husky; desinstalação reverte apenas o que a integração acrescentou.

### Etapa 35 — Publicar visualização privada e utilizável

- **Prioridade/porte:** P2/M. **Depende:** 05, 30, 31.
- **Execução:** avaliar HTML local por comunidade/filtro para o volume real, sem adicionar tela ao produto. Verificar escape de rótulos, scripts/CDNs, acessibilidade básica e acesso aos artefatos.
- **Saída:** visualização sanitizada ou fallback textual se segurança/desempenho não forem aceitáveis.
- **Aceite:** fixture com HTML malicioso não executa; nenhum upload público ou conteúdo de cliente; abertura não depende de executar o app em produção.

## Fase H — Integração contínua e governança

### Etapa 36 — Criar workflow informativo sem credenciais de produção

- **Prioridade/porte:** P1/M. **Depende:** 06, 08, 18, 20, 32.
- **Execução:** adicionar workflow isolado com permissões mínimas, timeout, concorrência e versões fixadas. Analisar código de PR sem segredos; nunca combinar checkout não confiável com evento privilegiado.
- **Saída:** job Graphify separado dos gates atuais, inicialmente não bloqueante e com erros visíveis.
- **Aceite:** execução em PR de origem não confiável não recebe token privilegiado; lint, typecheck, testes, build, Deno e E2E existentes não são enfraquecidos.

### Etapa 37 — Proteger caches, artefatos e retenção no CI

- **Prioridade/porte:** P0/M. **Depende:** 05, 09, 18, 36.
- **Execução:** separar confiança de caches de PR e branch protegida; chavear por versões/configuração; limitar tamanho, acesso e retenção. Escanear saídas antes de upload.
- **Saída:** política implementada e identificador de snapshot ligado ao commit da execução.
- **Aceite:** cache adulterado/incompatível é rejeitado; relatório privado não é publicado em Pages; falha de sanitização bloqueia upload, não é mascarada.

### Etapa 38 — Atualizar após merge e verificar obsolescência

- **Prioridade/porte:** P1/M. **Depende:** 19, 36, 37.
- **Execução:** gerar artefato no SHA efetivamente mergeado e auditoria periódica configurável; evitar commits automáticos de outputs e loops de workflow. Banco, se habilitado, tem job separado com segredo mínimo e evento confiável.
- **Saída:** índice da branch principal com estado de atualização e política de expiração das fontes.
- **Aceite:** dois merges próximos não promovem snapshot antigo sobre novo; indisponibilidade de catálogo não apaga evidência anterior nem a anuncia como atual.

### Etapa 39 — Calibrar alertas antes de criar bloqueios

- **Prioridade/porte:** P1/M. **Depende:** 29, 36, 38.
- **Execução:** observar pelo menos três PRs reais; revisar falsos positivos e regressões. Começar gates por integridade, vazamento e reprodutibilidade; métricas heurísticas ficam informativas.
- **Saída:** limiares baseados em baseline, owner e política de exceção com justificativa e expiração.
- **Aceite:** nenhum bloqueio por número bruto de nós ou “arquivo órfão”; required check só muda após decisão do mantenedor e verificação de disponibilidade.

### Etapa 40 — Definir manutenção e atualização de dependências

- **Prioridade/porte:** P1/M. **Depende:** 06, 37, 39.
- **Execução:** definir responsável, revisão periódica, changelog, revalidação de licença e teste lado a lado de atualização do Graphify. Documentar invalidadores de cache e migração do formato.
- **Saída:** rotina de manutenção e alerta de falha persistente, sem adicionar notificação externa paga por padrão.
- **Aceite:** nova versão só substitui anterior após corpus/regressão; rollback inclui runtime, configuração e formato compatível.

## Fase I — Validação adversarial e de não regressão

### Etapa 41 — Exercitar cenários hostis de arquivos e conteúdo

- **Prioridade/porte:** P0/G. **Depende:** 08, 18, 27, 35, 37.
- **Execução:** testar segredo sintético, arquivo enorme, encoding inválido, symlink externo/cíclico, path traversal, prompt injection e HTML malicioso em ambiente descartável. Se semântica estiver dispensada, testar que permanece desativada.
- **Saída:** evidências automatizadas com fixtures, falhas esperadas e cobertura dos controles.
- **Aceite:** nenhum acesso fora do escopo, vazamento, comando arbitrário ou publicação parcial; falhas consomem recursos limitados.

### Etapa 42 — Validar adaptador de catálogo e permissões em banco descartável

- **Prioridade/porte:** P0/G. **Depende:** 10, 22, 23, 24, 25.
- **Execução:** montar fixtures de catálogo em PostgreSQL/Supabase local ou staging dedicado autorizado; testar roles, ACL/default ACL, RLS, overloads, views, triggers, índices, jobs e permissões negadas.
- **Saída:** comparação automatizada entre DDL da fixture e catálogo coletado, com comandos e versões. Criação de fixtures nunca ocorre no canônico.
- **Aceite:** nenhuma escrita pela sessão coletora; snapshot não contém dados pessoais; permissões insuficientes e diferenças intencionais são representadas corretamente.

### Etapa 43 — Testar recuperação, concorrência e equivalência

- **Prioridade/porte:** P0/M. **Depende:** 18, 19, 38, 40.
- **Execução:** interromper extração em pontos controlados, corromper cópia do cache, executar duas worktrees e comparar incremental/integral; simular downgrade compatível.
- **Saída:** suíte de resiliência e relatório de recuperação sem limpeza destrutiva.
- **Aceite:** último snapshot válido permanece utilizável; divergência é detectada; lock abandonado tem recuperação segura e auditável.

### Etapa 44 — Medir qualidade das respostas e benefício operacional

- **Prioridade/porte:** P1/G. **Depende:** 03, 20, 25, 30, 32, 41, 42, 43.
- **Execução:** comparar respostas do grafo às referências independentes, medir acertos/omissões por categoria, tempo frio/quente e recursos; medir tokens apenas quando houver consulta com modelo.
- **Saída:** benchmark reproduzível com hardware, versões e dados sanitizados; orçamento operacional proposto após medição.
- **Aceite:** fontes apresentadas conferem com respostas; casos críticos do corpus não têm omissão silenciosa; redução de tokens/tempo só é anunciada com comparação equivalente.

### Etapa 45 — Executar gates existentes e provar ausência de impacto no produto

- **Prioridade/porte:** P0/G. **Depende:** 31, 33, 36, 41, 42, 43, 44.
- **Execução:** rodar scripts reais do `package.json` para lint, typecheck, testes e build, mais validações Deno/CI existentes. Conferir diff do bundle e contratos de hooks; E2E conforme ambiente autorizado disponível.
- **Saída:** matriz de comandos, resultados e falhas preexistentes versus introduzidas; não afirmar E2E aprovado se faltam acesso/credenciais válidas.
- **Aceite:** nenhuma regressão introduzida; nenhum componente visual ou schema de produção alterado. Gate bloqueado permanece bloqueado e limita a conclusão.

## Fase J — Adoção, operação e encerramento

### Etapa 46 — Pilotar em revisão real de mudança pequena

- **Prioridade/porte:** P1/M. **Depende:** 39, 45.
- **Execução:** escolher PR real de baixo risco e usar consulta→fontes→impacto→testes durante a revisão; registrar utilidade e erro encontrado, sem modificar escopo do PR.
- **Saída:** caso de uso com antes/depois, limitações e revisão humana.
- **Aceite:** mantenedor reproduz a consulta no mesmo SHA e confirma resultado; adoção não depende de confiança cega no grafo.

### Etapa 47 — Expandir por domínios e registrar integrações bloqueadas

- **Prioridade/porte:** P1/M. **Depende:** 20, 25, 46.
- **Execução:** habilitar uso rotineiro em todos os domínios inventariados, mantendo custos e cobertura observados. Se acesso ao catálogo estiver bloqueado, entregar apenas perfil estático e deixar esta etapa incompleta.
- **Saída:** matriz domínio→fonte→cobertura→owner→estado de atualização.
- **Aceite:** nenhum domínio é omitido silenciosamente; banco/Edge reais só recebem selo de observado com evidência atual de identidade e coleta.

### Etapa 48 — Finalizar runbook, incidentes e rollback

- **Prioridade/porte:** P0/M. **Depende:** 34, 38, 40, 43, 47.
- **Execução:** documentar bootstrap, atualização, consulta, autorização de catálogo, incidente de vazamento, falha de parser e volta à versão anterior. Diferenciar desabilitar workflow de apagar artefatos.
- **Saída:** runbook com caminhos exatos, ações reversíveis e responsáveis; expurgo de conteúdo sensível segue autorização e procedimento específico.
- **Aceite:** ensaio remove somente integração adicionada quando necessário, preservando Husky, regras de agentes, dados e aplicação; restauração é testada.

### Etapa 49 — Entregar handoff e treinar uso responsável

- **Prioridade/porte:** P1/M. **Depende:** 46, 47, 48.
- **Execução:** fornecer exemplos para desenvolvedor, Cline e Codex, com perguntas do projeto, limites de confiança, tratamento de fonte velha e política de acesso.
- **Saída:** handoff em `docs/graphify/`, comandos verificados e responsáveis pela operação/triagem.
- **Aceite:** outra pessoa/agente consegue preparar o ambiente, atualizar e responder uma pergunta com evidência; nenhum segredo ou diretório pessoal é requisito implícito.

### Etapa 50 — Auditar as 50 etapas e comprovar operação real

- **Prioridade/porte:** P0/M. **Depende:** 01–49, admitindo apenas dispensas explícitas das opções previstas.
- **Execução:** reconciliar commits, PRs, merge, CI, artefatos e uso real. Observar pelo menos três PRs e sete dias de operação; revisar backlog residual e acessos antes do encerramento.
- **Saída:** relatório final com matriz das 50 etapas, evidências, riscos aceitos e melhorias ainda pendentes.
- **Aceite:** etapas obrigatórias têm evidência reproduzível; pipeline atualizado na branch principal e usado de fato pela engenharia. Como ferramenta de engenharia, “produção” significa esse fluxo real, não apenas arquivos presentes. Não declarar perfeição, auditoria integral do negócio ou correções de banco que esta integração não executou.

## Lotes de entrega e pontos de parada

| Lote | Etapas | Entrega e condição de avanço |
| --- | --- | --- |
| A — Fundação | 01–10 | Contratos, segurança, ferramenta pinada e fixtures aprovados |
| B — Grafo estrutural | 11–20 | Extração local e incremental íntegra, sem modelo externo |
| C — Banco RO | 21–25 | Identidade e permissão verificadas; pode ficar bloqueado sem impedir trabalho estático |
| D — Diagnóstico | 26–30 | Documentos e matriz estática; comparação real depende do lote C |
| E — Interfaces | 31–35 | CLI suportada; MCP/hook/semântica são decisões explícitas, não requisitos artificiais |
| F — CI | 36–40 | Informativo primeiro; segredo de produção fora dos PRs |
| G — Validação | 41–45 | Segurança, resiliência, banco descartável e não regressão |
| H — Operação | 46–50 | Piloto, expansão, rollback, handoff e evidência de uso real |

Cada lote cabe em um ou mais PRs pequenos, separados por responsabilidade. Não presumir que oito lotes cabem em oito commits. Não incluir correções funcionais descobertas pelo grafo no mesmo PR de infraestrutura. Commits convencionais em português; revisão de CI antes de merge. Não reenviar todos os arquivos a um modelo em toda alteração: AST primeiro, incremental validado depois, semântica apenas no material aprovado e alterado.

## Simulações planejadas antes do rollout

Esta matriz é um desenho de testes, **não** resultado de testes já executados.

| Cenário | Resultado exigido | Etapas |
| --- | --- | --- |
| Relatório antigo com grafo ausente | Aviso de indisponibilidade, sem inventar resposta | 18, 31 |
| SHA igual com arquivo local alterado | Snapshot identificado como modificado | 09, 19 |
| Alias TS, import lazy e barrel | Resolução correta ou pendência explícita | 12 |
| Duas funções homônimas e schemas diferentes | IDs e assinaturas distintos | 14, 16, 23 |
| Uma função lê e escreve a mesma tabela | Duas relações preservadas | 15, 16 |
| Arquivo renomeado ou excluído | Nenhuma referência residual falsa após atualização | 19, 43 |
| Falha de parser no meio do lote | Cobertura parcial explícita; cache não marca sucesso | 18, 19 |
| Tabela vazia, usada por rota dinâmica | Não classificar como lixo ou inacabada só por isso | 25, 28 |
| MCP aponta para outro banco ou retorna 403 | Coleta bloqueada; nenhum fallback para banco errado | 21 |
| RLS/default ACL visível parcialmente | Não observado, em vez de conclusão de segurança | 23, 42 |
| Cron contém URL/segredo sensível | Redação antes de persistência; nunca executar | 24, 41 |
| Migration no ledger com definição divergente | Achado de divergência, sem reparo automático | 25 |
| Credencial sintética em exemplo/documento | Bloqueio de artefato e de envio externo | 08, 27, 37, 41 |
| Duas worktrees e dois merges simultâneos | Saídas isoladas; promoção ordenada pelo SHA alvo | 09, 38, 43 |
| Cache de PR não confiável | Não contaminar artefato da branch principal | 37 |
| HTML/prompt malicioso em rótulo/documento | Nenhum script ou comando executado | 27, 35, 41 |
| Instalação do hook com Husky presente | Sem sobrescrita; CLI funciona sem hook | 34, 48 |
| Modelo/API indisponível | Perfil AST continua independente | 27, 31 |
| CI/E2E preexistente falha | Registrar causa e limitar aceite, sem fabricar aprovação | 45 |

## Evidências desta entrega documental

A preparação consultou arquivos do projeto, metadados/ajuda da ferramenta, documentação upstream e estado Git; fez fetch de `main` e criou worktree isolado. Não executou as 50 etapas, a extração completa, consultas ao Supabase, alterações de produto ou testes de runtime. A validação do documento deve conferir numeração 01–50, dependências, links locais, ausência de marcadores de segredo e diff sem erros de whitespace. Resultados efetivos de publicação e validação ficam registrados no PR desta entrega.

## Referências

- [README do projeto](../../README.md), [arquitetura](../ARCHITECTURE.md) e [convenções dos agentes](../../AGENTS.md).
- [Mapeamento de estado](../estado/README.md), [plano canônico de auditoria de 100 etapas](../auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md) e [candidatos de limpeza](../auditoria/CANDIDATOS_DE_LIMPEZA_2026-08-26.md). Este plano Graphify não substitui a auditoria de 100 etapas nem autoriza sua limpeza.
- [Relatório Graphify histórico](../../graphify-out/GRAPH_REPORT.md) e [regras de exclusão](../../.graphifyignore): evidências locais a serem revalidadas, não prova de atualização.
- [Repositório oficial Graphify](https://github.com/Graphify-Labs/graphify): descreve extração estrutural local por AST, consultas sobre grafo e enriquecimento semântico separado. Consultado em 11/09/2026; não assumir que a branch upstream tem os mesmos contratos da versão instalada.
- Skill Graphify instalada e metadados locais de `graphifyy` 0.9.48: orientaram preservação de proveniência, validação do incremental, inspeção da versão real e separação entre extração estrutural e semântica. A portabilidade dessas instruções será tratada na etapa 33.
