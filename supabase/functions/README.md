# Supabase Edge Functions — Conventions

This README documents the **mandatory** import patterns, version pinning, and
shared-module rules for every function under `supabase/functions/`. These rules
are enforced by automated checks (Deno tests + a CI bundler workflow) — break
them and the build goes red.

---

## 1. `@supabase/supabase-js` — pinned `npm:` specifier

**Always** import the Supabase client via the Deno-native `npm:` specifier,
pinned to the exact version below:

```typescript
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
```

### Why
- **Stability**: `esm.sh` (the previous default) periodically returns 502s,
  stale redirects, and integrity-hash drift. The Supabase edge runtime
  resolves `npm:` specifiers natively at deploy time — no third-party CDN in
  the critical path.
- **Reproducibility**: A pinned version (`@2.49.4`) means every function boots
  with the same SDK across deploys; floating tags (`@latest`, `@2`) silently
  ship breaking changes.
- **Single source of truth**: One version everywhere makes upgrades a single
  find-and-replace, and `mem://constraints/edge-supabase-js-import` records
  the rule for future agents.

### What you must NOT do

```typescript
// ❌ esm.sh — unstable
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// ❌ Floating version — non-reproducible
import { createClient } from "npm:@supabase/supabase-js";
import { createClient } from "npm:@supabase/supabase-js@latest";

// ❌ Different pinned version — drift
import { createClient } from "npm:@supabase/supabase-js@2.50.0";
```

### Upgrading the pinned version
1. Update the pin in **every** `supabase/functions/**/index.ts` in one commit
   (use a global find-and-replace — no partial migrations).
2. Update this README and `mem://constraints/edge-supabase-js-import`.
3. Deploy a representative sample (≥5 diverse functions) and verify boot logs
   are clean before merging.

---

## 2. CORS — single source of truth in `_shared/cors.ts`

Every function that responds to a browser **must** obtain CORS headers from the
canonical shared module using the current request:

```typescript
import { getCorsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const responseCorsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: responseCorsHeaders });
  }
  // ... include responseCorsHeaders in EVERY response, including errors
  return new Response(JSON.stringify(data), {
    headers: { ...responseCorsHeaders, "Content-Type": "application/json" },
  });
});
```

`corsHeaders` permanece reservado a chamadas estritamente server-to-server.
Para endpoints de navegador, usar o valor estático ignora a allowlist de
`ALLOWED_ORIGINS`.

### What you must NOT do

```typescript
// ❌ Local declaration — drifts from canonical headers, breaks preflights
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};
```

### Enforcement
`supabase/functions/_shared/cors_lint_test.ts` walks the entire functions
tree and **fails the build** if `corsHeaders` is declared anywhere other than
`_shared/cors.ts`. The test output lists every offender as `file:line` so the
fix is mechanical (replace the local const with the import).

Run locally:
```bash
deno test supabase/functions/_shared/cors_lint_test.ts
```

---

## 3. Other third-party imports

| Library                  | Recommended specifier                                  | Notes |
|--------------------------|--------------------------------------------------------|-------|
| Deno std (`http/server`) | `https://deno.land/std@0.168.0/http/server.ts`         | Pin the std version; do not float. Prefer `Deno.serve` for new functions. |
| Resend                   | `npm:resend@<pinned>`                                  | Always pin; never `npm:resend` alone. |
| Zod                      | `npm:zod@<pinned>`                                     | Use for input validation on every function that accepts a body. |
| Anything else from npm   | `npm:<pkg>@<exact-version>`                            | Pinned. No floating tags. |

**Rule**: every external import must be pinned to an exact version. Floating
specifiers (no version, `@latest`, range like `@^2`) are forbidden because
they make deploys non-reproducible.

---

## 4. Internal imports — relative paths only

Edge functions cannot import from the React app:

```typescript
// ❌ Not in the function's context — will fail to bundle
import { supabase } from "../../../src/integrations/supabase/client.ts";
```

Instead, create the admin client inline using env vars:

```typescript
import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);
```

Shared helpers belong under `supabase/functions/_shared/` and are imported
with relative paths: `import { foo } from "../_shared/foo.ts";`.

---

## 5. File layout per function

```
supabase/functions/<name>/
├── index.ts            # Entry point — Deno.serve(...) lives here
└── *_test.ts           # Optional Deno tests (run by supabase--test_edge_functions)
```

- Keep all runtime code in `index.ts`. Do **not** create subfolders inside a
  function — the bundler treats each function as a single module.
- Tests use Deno conventions (`*_test.ts` or `*.test.ts`) and run with
  `--allow-net --allow-env`.

---

## 6. `supabase/config.toml` — function flags

The repo has exactly **one** `config.toml` (at `supabase/config.toml`). Add a
per-function block only when you need a non-default setting (e.g.
`verify_jwt = false` for public webhooks):

```toml
[functions.my-public-webhook]
verify_jwt = false
```

Do **not** create additional `config.toml` files inside subdirectories — they
are silently ignored.

### Webhooks públicos de provedores

`inbound-email-webhook` e `multichannel-status-webhook` usam `verify_jwt = false`
porque os provedores externos não possuem JWT do Supabase. Isto só é seguro
porque cada requisição é verificada sobre o corpo bruto **antes** de qualquer
acesso com `service_role`:

| Endpoint | Protocolo aceito | Configuração obrigatória |
|---|---|---|
| `inbound-email-webhook` | Resend/Svix | `RESEND_WEBHOOK_SECRET` |
|  | Twilio SendGrid/ECDSA | `SENDGRID_WEBHOOK_PUBLIC_KEY` |
|  | Integrador HMAC-SHA256 (`X-Webhook-Signature`) | `INBOUND_EMAIL_WEBHOOK_SECRET` |
| `multichannel-status-webhook` | Twilio (`X-Twilio-Signature`) | `TWILIO_AUTH_TOKEN` e, quando a URL pública divergir, `TWILIO_WEBHOOK_URL` |
|  | Meta Cloud (`X-Hub-Signature-256`) | `META_APP_SECRET`; o handshake também exige `META_WEBHOOK_VERIFY_TOKEN` |
|  | Integrador HMAC-SHA256 (`X-Webhook-Signature`) | `MULTICHANNEL_WEBHOOK_SECRET` |

Ausência de segredo/chave retorna `503`; assinatura ausente, ambígua ou inválida
retorna `401`. Nunca crie uma exceção de JWT sem uma dessas verificações.

---

## 7. CI enforcement

Two checks gate every PR that touches `supabase/functions/**`:

1. **CORS lint** (`_shared/cors_lint_test.ts`) — fails if `corsHeaders` is
      declared outside `_shared/cors.ts` e verifica os endpoints de navegador
      selecionados contra regressão para CORS estático.
2. **Bundle check** (`.github/workflows/edge-functions-bundle.yml` →
   `scripts/bundle-edge-functions.ts`) — runs `deno check` on every
   function, extracts the failing import URL when resolution breaks, and
   groups failures by URL to spot systemic outages (e.g. "30× one CDN URL"
   = the CDN is down). Import-resolution failures fail the build;
   pre-existing TypeScript errors are surfaced as advisory warnings only.

Run the bundle check locally before pushing:

```bash
# Full sweep (~12s)
deno run --allow-read --allow-run --allow-env --allow-net \
  scripts/bundle-edge-functions.ts

# Targeted (faster while iterating)
ONLY=lead-scoring,dispatch-webhook deno run --allow-read --allow-run \
  --allow-env --allow-net scripts/bundle-edge-functions.ts
```

The root `deno.json` sets `nodeModulesDir: "auto"` so `deno check` resolves
`npm:` specifiers locally. The Supabase edge runtime ignores this file at
deploy time — it auto-installs npm modules itself.

---

## 8. Quick checklist for new functions

- [ ] Imports `@supabase/supabase-js` via `npm:@supabase/supabase-js@2.49.4`
- [ ] Imports `getCorsHeaders` from `../_shared/cors.ts` (no local declaration)
- [ ] Handles `OPTIONS` preflight + espalha `responseCorsHeaders` em **todas**
      as respostas (incluindo 4xx/5xx)
- [ ] Validates request body with Zod (or returns 400 on bad input)
- [ ] All third-party imports are pinned to exact versions
- [ ] No imports from `src/`
- [ ] Per-function block in `supabase/config.toml` only if a non-default
      flag (e.g. `verify_jwt = false`) is required
- [ ] `deno run scripts/bundle-edge-functions.ts ONLY=<your-fn>` passes
- [ ] `deno test supabase/functions/_shared/cors_lint_test.ts` passes
