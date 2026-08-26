# Candidatos de limpeza — aguardando autorização

**Regra aplicada:** nenhum arquivo foi apagado, movido, ignorado ou incluído em
commit apenas por parecer gerado. Os itens abaixo foram produzidos durante a
análise local ou pela ferramenta de desenvolvimento e precisam de validação
explícita antes de qualquer exclusão.

| Item | Tamanho | Evidência | Classificação proposta | Ação pendente |
| --- | ---: | --- | --- | --- |
| `deno.lock` | 332 KiB | não era versionado; foi gerado durante `deno check`; o projeto não declara lock Deno | **Ambíguo**: pode virar lock reprodutível ou ser artefato local | decidir entre versionar com política de lock ou apagar como artefato local |
| `supabase/.temp/cli-latest` | 4 KiB | criado pela tentativa de `supabase start`; os demais metadados `.temp` já versionados são de outra natureza | **Provável temporário local** | autorizar exclusão ou decidir por versionamento |
| `graphify-out/` | 792 KiB | saída gerada pelo mapeamento estrutural desta auditoria; contém cache, detector e caminho do interpretador local | **Artefato de análise local** | autorizar exclusão após extrair o que for necessário ao relatório |
| `supabase/functions/graphify-out/` | 52 KiB | cache gerado de análise no subdiretório de Edge Functions | **Artefato de análise local** | autorizar exclusão |
| `bun.lockb` | 194 KiB | está versionado, mas também consta no `.gitignore`; o repositório usa `package-lock.json` no CI e mantém `bun.lock` como lock alternativo | **Legado ambíguo**: pode ter consumidores Bun fora do CI | confirmar se algum fluxo Bun ainda o utiliza antes de remover ou desversionar |

## Itens explicitamente fora de limpeza

- Tabelas vazias, migrations antigas, objetos de banco e arquivos de domínio
  não foram classificados como lixo.
- Novos testes, migrations de correção e documentos desta onda são entregáveis,
  não candidatos de descarte.
- Nenhuma regra de `.gitignore` foi adicionada para esconder esses itens sem
  decisão do responsável.
- O fato de `bun.lockb` já estar no `.gitignore` não o torna descartável: por
  ainda ser rastreado, a remoção exigirá autorização explícita e uma verificação
  do fluxo Bun em uso.

## Decisão solicitada

Uma autorização pode ser dada por item, por exemplo: “autorize apagar somente
os dois diretórios `graphify-out`” ou “versione `deno.lock` e apague os demais”.
Até lá, todos permanecem intactos e fora do commit.
