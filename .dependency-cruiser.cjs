/**
 * Onda P — dependency-cruiser guard-rail.
 * Detecta ciclos, imports test→prod e violações de camada.
 */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment:
        "Ciclos de import quebram tree-shaking e podem gerar undefined em runtime.",
      from: {},
      to: { circular: true },
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
          "^src/integrations/supabase/",
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
      name: "no-deprecated-core",
      severity: "warn",
      from: {},
      to: { dependencyTypes: ["deprecated"] },
    },
    {
      name: "lib-not-to-ui",
      severity: "error",
      comment: "src/lib é camada pura; não deve depender de components/pages.",
      from: { path: "^src/lib/" },
      to: { path: "^src/(components|pages)/" },
    },
    {
      name: "components-not-to-pages",
      severity: "error",
      comment: "Components não podem importar pages (inversão de dependência).",
      from: { path: "^src/components/" },
      to: { path: "^src/pages/" },
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
    doNotFollow: {
      path: ["node_modules"],
    },
    exclude: {
      path: [
        "node_modules",
        "dist",
        "bundle-stats",
        "coverage",
        "\\.test\\.(ts|tsx)$",
        "\\.spec\\.(ts|tsx)$",
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
      dot: { collapsePattern: "node_modules/(@[^/]+/[^/]+|[^/]+)" },
      archi: {
        collapsePattern:
          "^(node_modules|packages|src|lib|app|test|spec)/[^/]+|^supabase/functions/[^/]+",
      },
    },
  },
};
