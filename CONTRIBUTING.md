# Contribuindo com Promo Champions v2

Obrigado pelo interesse em contribuir! 🏆

## Setup de Desenvolvimento

1. Fork o repositório
2. Clone seu fork: `git clone https://github.com/SEU_USER/Promo_Champions_V2.1.git`
3. Instale dependências: `npm ci` (canônico — o CI usa npm e o lockfile é `package-lock.json`)
4. Configure variáveis: `cp .env.example .env` (preencha credenciais Supabase)
5. Inicie Supabase local: `supabase start`
6. Crie uma branch: `git checkout -b feature/minha-feature`
7. Faça suas alterações
8. Execute testes: `npm run test`
9. Commit seguindo Conventional Commits com scopes do projeto
10. Push: `git push origin feature/minha-feature`
11. Abra um Pull Request

## Convenção de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/) com scopes customizados:

**Tipos:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`

**Scopes:** `auth`, `bi`, `crm`, `gamification`, `ui`, `hooks`, `services`, `db`, `config`, `deps`

Exemplo: `fix(bi): corrigir classificação ABC com receita zero`

## Estilo de Código

- **TypeScript** modo estrito (`strict: true` + `noImplicitReturns` + `noFallthroughCasesInSwitch`)
- **ESLint** + **Prettier** (formatar antes de commitar)
- **Tailwind-first**: sempre prefira classes Tailwind, evite `style={{}}` inline
- **Componentes**: `PascalCase` com `displayName` e `forwardRef`
- **Hooks**: `camelCase` com prefixo `use`
- **Arquivos**: `kebab-case` para utilitários, `PascalCase` para componentes
- **TODO/FIXME**: `// TODO(@user): #issue-id — descrição`
- Veja [docs/style-guide.md](./docs/style-guide.md) e [docs/component-guidelines.md](./docs/component-guidelines.md)

## Testes

- **Unitários**: Vitest (`npm run test`)
- **E2E**: Playwright (`npm run test:e2e`)
- **Cobertura**: thresholds em `vitest.config.ts` (85% linhas / 75% branches sobre os arquivos instrumentados em `coverage.include`)
- Adicione testes para novas features e correções de bugs

## Processo de Pull Request

1. Atualize documentação se necessário
2. Adicione testes para novas funcionalidades
3. Garanta que todos os testes passam
4. Solicite review dos maintainers
5. Responda ao feedback
6. Squash commits antes do merge

## Arquitetura

```
src/
├── components/   # UI + gamification (shadcn/ui + custom)
├── contexts/     # Auth, Audio, Theme
├── hooks/        # useAbortController, useMountedRef, etc.
├── lib/          # gamification, bi-helpers, utils
├── pages/        # Lazy-loaded route pages
├── routes/       # AppRoutes + lazyPages com prefetch
├── services/     # Camada Supabase (activity, bi, goals, etc.)
└── types/        # Definições TypeScript
```

## Dúvidas?

Abra uma issue ou entre em contato com a equipe.
