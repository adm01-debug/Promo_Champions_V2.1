# Execução Graphify — lote B: integridade, multigrafo e contratos estáticos

Data: 11/09/2026. Base: fundação Graphify do lote A. Este lote corrige falhas reproduzidas na revisão e implementa componentes locais das etapas 07, 14–19, 31–33, 36, 41 e 45. Não consulta ou altera o Supabase, não habilita atualização incremental e não implanta Edge Functions.

## Entregas

- O wrapper valida versão exata, raiz de saída e todos os ancestrais de `--out`; links simbólicos externos, artefatos parciais e reuso de destino são recusados.
- A extração ocorre em diretório temporário dentro de `.graphify-local/.staging` e só é promovida após validar o grafo, criar `multigraph.json` e criar `snapshot.json` com proveniência.
- O multigrafo preserva relações múltiplas dirigidas, materializa imports externos como referências explícitas e oferece impacto reverso conservador com fontes e limitações.
- O coletor estático lê somente arquivos do repositório: chamadas Supabase literais e DDL previsto nas migrations. SQL dinâmico, referências dinâmicas e versões repetidas são lacunas, não fatos do banco.
- A CI possui workflow isolado, sem segredos, que verifica lock e testes da fundação.

## Cenários simulados e resultados

| Cenário | Resultado esperado | Resultado |
| --- | --- | --- |
| `--out` atravessa link simbólico intermediário | nenhuma escrita externa | recusado antes de executar extração |
| `.graphify-local` é link simbólico | nenhuma escrita externa | recusado |
| destino contém somente manifesto parcial | nenhuma promoção/reuso | recusado |
| versão `0.9.480` para requisito `0.9.48` | recusar | recusado |
| grafo vazio | não publicar | recusado; staging removido |
| token sintético codificado em JSON | bloquear sem imprimir valor | bloqueado |
| subprocesso escreve token sintético em stderr | mensagem sanitizada | valor redigido |
| leitura e escrita entre os mesmos nós | duas relações dirigidas | preservadas com ids diferentes |
| import externo sem nó nativo | referência explícita | materializado como `external_reference` |
| alteração de nó chamado por outros | listar dependentes e evidência | impacto reverso retornado; relações dinâmicas/inferidas geram limitação |

## Limites que permanecem

- Atualização incremental, reconciliação com catálogo canônico, storage, jobs, RLS, grants e deploy não são declarados concluídos.
- O catálogo estático descreve código e migrations versionadas, não o banco aplicado.
- A análise de impacto sugere testes; não autoriza pular testes, inferir autorização ou remover código/tabelas.
- O MCP de catálogo continuava sem sessão autenticada verificável na última tentativa; esse estado bloqueia apenas leitura do canônico.
