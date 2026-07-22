/**
 * Onda P — dependency-cruiser guard-rail.
 * Detecta ciclos, imports test→prod e violações de camada.
 * `type-only` e `dynamic-import` são excluídos de ciclos/layer rules pois não
 * geram hazard de runtime (TS apaga tipos; dynamic-import quebra o ciclo em
 * tempo de execução via lazy loading).
 */
const RUNTIME_ONLY_TO = {
  dependencyTypesNot: ["type-only", "dynamic-import"],
};

module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment:
        "Ciclos de import em runtime quebram tree-shaking. Ciclos type-only/dynamic-import documentados abaixo são permitidos.",
      from: {
        pathNot: [
          // Type-only cycle (import type BISDRData) — TS apaga em compile.
          "^src/hooks/bi/useBISDR(Transformers)?\\.ts$",
          // Arquitetural: MainLayout renderiza sidebar que referencia lazyPages
          // que carrega rotas que usam MainLayout. Todos os edges de lazyPages
          // são dynamic-import (React.lazy), sem hazard de runtime.
          "^src/components/organisms/(AppSidebar|RoleAwareSidebar)\\.tsx$",
          "^src/components/templates/MainLayout\\.tsx$",
          "^src/routes/lazyPages\\.ts$",
          "^src/pages/AdminTelemetria\\.tsx$",
        ],
      },
      to: { circular: true, ...RUNTIME_ONLY_TO },
    },
    {
      name: "no-orphans",
      severity: "warn",
      comment: "Módulo órfão — provavelmente código morto.",
      from: {
        orphan: true,
        pathNot: [
          "\\.d\\.ts$",
          "^src/main\\.tsx$",
          "^src/integrations/",
          "^src/test/",
          "^src/types/",
          "^scripts/",
          "^supabase/functions/",
          "\\.(test|spec)\\.(ts|tsx)$",
        ],
      },
      to: {},
    },
    {
      name: "not-to-test",
      severity: "error",
      comment: "Código de produção não pode importar arquivos de teste.",
      from: { pathNot: "\\.(test|spec)\\.(ts|tsx)$" },
      to: { path: "\\.(test|spec)\\.(ts|tsx)$" },
    },
    {
      name: "lib-not-to-ui",
      severity: "error",
      comment: "src/lib é camada pura; não deve depender de components/pages.",
      from: { path: "^src/lib/" },
      to: { path: "^src/(components|pages)/", ...RUNTIME_ONLY_TO },
    },
    {
      name: "components-not-to-pages",
      severity: "error",
      comment: "Components não podem importar pages (inversão). Dynamic-import (prefetch) é permitido.",
      from: { path: "^src/components/" },
      to: { path: "^src/pages/", ...RUNTIME_ONLY_TO },
    },
    {
      name: "shared-not-to-function",
      severity: "error",
      comment: "_shared/ não pode depender de edge functions específicas.",
      from: { path: "^supabase/functions/_shared/" },
      to: {
        path: "^supabase/functions/(?!_shared/)",
      },
    },
  ],
  options: {
    doNotFollow: { path: ["node_modules"] },
    exclude: {
      path: [
        "node_modules",
        "dist",
        "bundle-stats",
        "coverage",
        "\\.(test|spec)\\.(ts|tsx)$",
        "supabase/functions/[^/]+/vendor/",
        "tests/",
      ],
    },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default"],
      mainFields: ["module", "main", "types", "typings"],
    },
    reporterOptions: {
      archi: {
        collapsePattern:
          "^(node_modules|packages|src|lib|app|test|spec)/[^/]+|^supabase/functions/[^/]+",
      },
    },
  },
};
