# types-sync — auto-correção do `types.ts` com o banco oficial

**O que faz:** o workflow `.github/workflows/types-sync.yml` regenera `src/integrations/supabase/types.ts`
a partir do banco oficial (`usyxfpqlsspldubptrdl`, `supabase gen types typescript --project-id`), confere o
candidato com `validar.mjs`, roda `npm run typecheck` + `npm run typecheck:baseline` e, se tudo passar,
abre/atualiza o PR `automation/types-sync` com auto-merge. Se o gate recusar, nada é aplicado e a issue
`[types-sync] drift do banco quebra o typecheck` recebe o resumo.

**Quando roda:** push em `main` que toque `supabase/migrations/**`, segunda 05:49 UTC e dispatch manual.

**`validar.mjs`:** recusa candidato com menos de 100 KB, sem o bloco `public.Tables` ou com menos de 90 %
das tabelas atuais (cara de outro projeto); imprime `{ mudou, tabelas, funcoes }` e grava o resumo
(tabelas/funções novas e removidas) que vai no corpo do PR.

```sh
node scripts/types-sync/validar.mjs /caminho/types.novo.ts --resumo /tmp/resumo.md
node --test scripts/ci/types-sync.unit.mjs
```

**Secrets:** `SUPABASE_ACCESS_TOKEN` (já existe; só no job `ler-banco`, que não instala dependências).
**Pré-requisito do repo:** "Allow GitHub Actions to create and approve pull requests" ligado.
