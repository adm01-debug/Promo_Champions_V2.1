# inventario — estado real do sistema para agentes de IA

Gera `inventario/estado/{banco,rotas,edges}.json` a partir do banco oficial (só leitura) e do código.
Como rodar, o que cada arquivo tem e como ler os alertas: [`inventario/estado/README.md`](../../inventario/estado/README.md).
Agendado em `.github/workflows/inventario-estado-semanal.yml` (segunda 10:23 UTC), que abre PR
`automation/inventario-estado` com auto-merge quando algo estrutural mudou.

Testes: `node --test scripts/ci/inventario-banco.unit.mjs scripts/ci/inventario-rotas.unit.mjs scripts/ci/inventario-mudou.unit.mjs`.
Secrets: `SUPABASE_ACCESS_TOKEN` (Management API, só `/database/query/read-only` e `GET /functions`).
