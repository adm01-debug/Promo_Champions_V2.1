# Execução Graphify — lote F P0: correções da auditoria adversarial

Data: 11/09/2026. Este lote corrige controles locais identificados na auditoria adversarial. Não afirma validar o banco canônico, não executa SQL remoto e não altera migrations aplicadas.

## Controles implementados

- O wrapper usa exclusivamente o runtime Graphify criado por `uv sync --locked` em `tools/graphify/.venv`.
- Segredos comuns (Supabase, GitHub, JWT, Stripe, Resend, AWS, URI PostgreSQL e Bearer) são redigidos de diagnósticos; valores sob chaves sensíveis também são removidos de metadados.
- O escopo recusa arquivos sensíveis e o staging é validado recursivamente para links simbólicos ou arquivos especiais antes de publicar.
- O snapshot registra e exige estado Git estável; impacto recusa IDs não presentes e snapshots obsoletos, salvo exceção explícita `--allow-stale`.
- O catálogo representa flags ausentes como `null`, nunca como `false`, e a reconciliação recusa catálogo não atestado por coletor RO confiável.
- O parser estático deixa ACL, RLS/policies, extensões, cron, Storage e blocos procedurais como lacunas explícitas quando ainda não consegue modelá-los. Comentários e strings não viram DDL.
- Links Markdown que apontam para symlink externo deixam de ser classificados como locais.
- O CI instala o runtime travado e executa uma extração real; o pipeline canônico agora também dispara em PRs encadeadas.

## Limites remanescentes

Um atestado RO verificável, coletor canônico e parser PostgreSQL completo continuam necessários antes de qualquer afirmação sobre RLS, ACL, grants, jobs, Storage ou migrations aplicadas. A migration DB-01 não é alterada neste lote: a reversão permanece na PR #125 e requer revisão própria.
