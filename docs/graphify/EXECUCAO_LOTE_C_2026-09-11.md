# Execução Graphify — lote C: adaptador de catálogo descartável

Data: 11/09/2026. Este lote implementa e testa localmente o contrato que receberá o catálogo Supabase quando houver uma conexão RO canônica verificada. Não conecta ao Supabase, não executa SQL e não contém dados de negócio.

## Entregas

- Normalização de schemas, tabelas, colunas, constraints, índices, RLS, policies, grants/default grants, funções, views, enums, extensões, roles, buckets e jobs.
- Identidade obrigatória do projeto e declaração de sessão somente leitura, marcada explicitamente como não verificada pela CLI.
- Sanitização de padrões conhecidos de segredo em metadados textuais.
- Recusa explícita de `rows`, `records` e `data` no documento bruto.
- Reconciliação entre o catálogo estático do repositório e o catálogo observado, sem transformar ausência em perda ou correção automática.

## Simulações

Uma fixture descartável cobriu RLS forçada, policy, ACL/default ACL, função `SECURITY DEFINER`, view, enum, extensão, role, bucket, job e referências estáticas de tabela/RPC. A fixture também confirmou recusa para projeto divergente, sessão não read-only e linhas de negócio.

## Limites

O adaptador não substitui o coletor autenticado. A coleta do projeto canônico continua bloqueada até o MCP confirmar o projeto `usyxfpqlsspldubptrdl` e uma sessão RO. Ausências no resultado são classificadas como pendências de investigação.
