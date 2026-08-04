# Smoke Test do Backend de Destino (pós-migração)

Valida ponta a ponta que o backend migrado está funcional e seguro, em 4 fases:

| Fase | O que valida |
| --- | --- |
| `connectivity` | `/auth/v1/health` responde com a `anon key` do destino |
| `auth` | `signInWithPassword` + `getUser()` (revalidação do token no servidor) |
| `rls` | Cliente anônimo não lê tabelas sensíveis; usuário não escala privilégio em `user_roles`; RPC `has_role` executável |
| `data` | Tabelas de negócio (`sales`, `clients`, `salespeople`, `quotes_inbound`, `orders`) legíveis e com dados |

## Como rodar

```bash
TARGET_SUPABASE_URL="https://<projeto>.supabase.co" \
TARGET_SUPABASE_ANON_KEY="<anon key do destino>" \
TARGET_SMOKE_EMAIL="usuario@dominio.com" \
TARGET_SMOKE_PASSWORD="<senha>" \
npm run smoke:target
```

Exit code `0` = tudo verde. Qualquer check reprovado retorna `1` (pronto para CI).

## Garantias e limites

- **Não escreve dados de negócio.** A única mutação tentada é o `INSERT` proposital em
  `user_roles` com role `admin`, que **deve ser rejeitado**. Se ele passar, o teste falha
  como incidente crítico de segurança.
- Um usuário `admin`/`manager` legitimamente enxerga roles de terceiros; o check registra
  esse caso como aprovado e informa o perfil detectado.
- A checagem anônima aprova tanto negação explícita (`42501`, `PGRST301`, RLS) quanto
  retorno de zero linhas; qualquer linha vazada reprova.
- Credenciais vêm apenas de variáveis de ambiente — nunca são impressas no relatório.

## Testes unitários dos helpers

A lógica de avaliação vive em `scripts/smokeTargetHelpers.ts` e é coberta sem rede por
`src/test/smoke-target-helpers.test.ts` (`npm test`).
