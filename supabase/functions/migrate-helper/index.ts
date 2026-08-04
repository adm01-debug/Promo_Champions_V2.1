// migrate-helper — utilitário de migração de dados (export/import paginado).
//
// ⚠️ SEGURANÇA — decisões deliberadas:
//  • NÃO existe (e nunca existirá) ação que devolva `SUPABASE_SERVICE_ROLE_KEY`,
//    `SUPABASE_DB_URL` ou qualquer credencial. Expor isso por HTTP = acesso
//    total ao banco ignorando RLS.
//  • NÃO existe chave de acesso fixa em código. Autenticação é por JWT do
//    usuário + verificação de role `admin` via `has_role` (SECURITY DEFINER).
//  • O bypass de RLS (service_role) só é usado DEPOIS da checagem de admin,
//    porque migração precisa ler/escrever linhas de todos os usuários.
//  • Não executa SQL arbitrário: apenas SELECT paginado e UPSERT tipados
//    através do client PostgREST.

import { getCorsHeaders } from "../_shared/cors.ts";
import {
  getServiceClient,
  getUserClient,
  requireAdmin,
  UnauthorizedError,
} from "../_shared/auth-client.ts";

/** Limites defensivos para evitar timeout / payload gigante. */
const MAX_PAGE_SIZE = 1000;
const DEFAULT_PAGE_SIZE = 500;
const MAX_IMPORT_ROWS = 1000;

type Action = "ping" | "count" | "export" | "import";

interface RequestBody {
  action?: unknown;
  table?: unknown;
  offset?: unknown;
  limit?: unknown;
  order_by?: unknown;
  rows?: unknown;
  on_conflict?: unknown;
}

interface ParsedRequest {
  action: Action;
  table: string;
  offset: number;
  limit: number;
  orderBy: string;
  rows: Record<string, unknown>[];
  onConflict: string | null;
}

const ACTIONS: readonly Action[] = ["ping", "count", "export", "import"];

/** Identificador seguro de tabela/coluna: evita injeção no parser PostgREST. */
const IDENTIFIER = /^[a-z_][a-z0-9_]{0,62}$/;

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

function toInt(value: unknown, fallback: number): number {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    throw new ValidationError("offset/limit devem ser inteiros");
  }
  return n;
}

export function parseRequest(body: RequestBody): ParsedRequest {
  const action = body.action;
  if (typeof action !== "string" || !ACTIONS.includes(action as Action)) {
    throw new ValidationError(`action inválida. Use: ${ACTIONS.join(", ")}`);
  }

  const parsed: ParsedRequest = {
    action: action as Action,
    table: "",
    offset: 0,
    limit: DEFAULT_PAGE_SIZE,
    orderBy: "id",
    rows: [],
    onConflict: null,
  };

  if (parsed.action === "ping") return parsed;

  if (typeof body.table !== "string" || !IDENTIFIER.test(body.table)) {
    throw new ValidationError("table inválida (snake_case, sem schema)");
  }
  parsed.table = body.table;

  if (body.order_by !== undefined && body.order_by !== null) {
    if (typeof body.order_by !== "string" || !IDENTIFIER.test(body.order_by)) {
      throw new ValidationError("order_by inválido");
    }
    parsed.orderBy = body.order_by;
  }

  if (parsed.action === "export") {
    parsed.offset = toInt(body.offset, 0);
    parsed.limit = toInt(body.limit, DEFAULT_PAGE_SIZE);
    if (parsed.offset < 0) throw new ValidationError("offset não pode ser negativo");
    if (parsed.limit < 1 || parsed.limit > MAX_PAGE_SIZE) {
      throw new ValidationError(`limit deve estar entre 1 e ${MAX_PAGE_SIZE}`);
    }
  }

  if (parsed.action === "import") {
    if (!Array.isArray(body.rows) || body.rows.length === 0) {
      throw new ValidationError("rows deve ser um array não vazio");
    }
    if (body.rows.length > MAX_IMPORT_ROWS) {
      throw new ValidationError(`máximo de ${MAX_IMPORT_ROWS} rows por chamada`);
    }
    for (const row of body.rows) {
      if (typeof row !== "object" || row === null || Array.isArray(row)) {
        throw new ValidationError("cada row deve ser um objeto");
      }
    }
    parsed.rows = body.rows as Record<string, unknown>[];
    if (body.on_conflict !== undefined && body.on_conflict !== null) {
      if (typeof body.on_conflict !== "string" || !IDENTIFIER.test(body.on_conflict)) {
        throw new ValidationError("on_conflict inválido");
      }
      parsed.onConflict = body.on_conflict;
    }
  }

  return parsed;
}

Deno.serve(async (req: Request): Promise<Response> => {
  const cors = getCorsHeaders(req);
  const json = (payload: unknown, status = 200) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { ...cors, "Content-Type": "application/json" },
    });

  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    // 1) Autenticação real (JWT) + autorização (role admin).
    const ctx = await getUserClient(req);
    await requireAdmin(ctx);

    // 2) Validação de input.
    let body: RequestBody;
    try {
      body = (await req.json()) as RequestBody;
    } catch {
      throw new ValidationError("corpo da requisição deve ser JSON válido");
    }
    const parsed = parseRequest(body);

    if (parsed.action === "ping") {
      return json({ ok: true, user_id: ctx.userId, actions: ACTIONS });
    }

    // 3) Bypass de RLS legítimo: migração precisa acessar linhas de todos os
    //    usuários, e o chamador já foi validado como admin acima.
    const admin = getServiceClient("migração administrativa de dados entre projetos (admin já validado)");

    if (parsed.action === "count") {
      const { count, error } = await admin
        .from(parsed.table)
        .select("*", { count: "exact", head: true });
      if (error) return json({ error: error.message }, 400);
      return json({ table: parsed.table, count: count ?? 0 });
    }

    if (parsed.action === "export") {
      const { data, error } = await admin
        .from(parsed.table)
        .select("*")
        .order(parsed.orderBy, { ascending: true })
        .range(parsed.offset, parsed.offset + parsed.limit - 1);
      if (error) return json({ error: error.message }, 400);
      const rows = data ?? [];
      return json({
        table: parsed.table,
        offset: parsed.offset,
        limit: parsed.limit,
        returned: rows.length,
        has_more: rows.length === parsed.limit,
        next_offset: parsed.offset + rows.length,
        rows,
      });
    }

    // import
    const query = admin.from(parsed.table);
    const { data, error } = parsed.onConflict
      ? await query.upsert(parsed.rows, { onConflict: parsed.onConflict }).select("*")
      : await query.insert(parsed.rows).select("*");
    if (error) return json({ error: error.message }, 400);
    return json({ table: parsed.table, inserted: data?.length ?? 0 });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return json({ error: err.message }, 401);
    }
    if (err instanceof ValidationError) {
      return json({ error: err.message }, 400);
    }
    const message = err instanceof Error ? err.message : "unexpected_error";
    console.error("[migrate-helper] erro inesperado", message);
    return json({ error: "internal_error" }, 500);
  }
});
