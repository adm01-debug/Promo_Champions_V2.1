# Execução Graphify — lote D: integridade do escopo

Data: 11/09/2026. Este lote corrige lacunas de segurança e integridade encontradas durante a simulação da extração. Não habilita atualização incremental nativa, não conecta ao Supabase e não altera o produto.

## Correções verificadas

- Escopo com um único arquivo regular agora é suportado e identificado corretamente no `snapshot.json`.
- Qualquer link simbólico dentro do escopo é recusado antes de iniciar o extrator; isso impede que um caminho aparentemente interno atravesse para conteúdo externo.
- Arquivos acima de 10 MiB e escopos acima de 200 MiB são recusados.
- O digest é calculado antes da extração e conferido depois. Se o conteúdo mudar no intervalo, o staging é descartado e nenhum snapshot é publicado.
- O digest da configuração passou a incluir as versões de esquema e os limites que podem alterar a interpretação do resultado.

## Simulações

- Fixture de arquivo único: publicação válida com contagem de uma entrada.
- Fixture com symlink aninhado: recusa antes de chamar o extrator.
- Fixture com mutação durante a extração: recusa e ausência de diretório publicado.
- Extração real offline de `src/lib/revenueForecast`: snapshot íntegro e relatório reverso que encontrou `csvexport`, `csvexport_test` e `forecastengine_test` como dependentes potenciais de `forecastengine`.

## Limite remanescente

`graphify update` da versão pinada escreve cache dentro da origem e exige `--force` após remoções. Esse contrato ainda não é compatível com snapshots externos, atômicos e descartáveis. Por segurança, a integração continua usando somente extração integral para cada geração; a etapa 19 permanece parcial até haver equivalência incremental/integral demonstrada para adicionar, editar, renomear e remover arquivos.
