// Guard-rails estáticos para que o job continue usando o contrato atômico do
// banco, sem retornar a atualizações e logs separados.
import { assert, assertStringIncludes } from "jsr:@std/assert@1";

const sourceUrl = new URL("./index.ts", import.meta.url);

Deno.test("auto-reassign-inactive aceita somente POST do serviço interno", async () => {
  const source = await Deno.readTextFile(sourceUrl);
  assert(
    /req\.method\s*!==\s*["']POST["']/.test(source),
    "a edge deve restringir o método a POST",
  );
  assertStringIncludes(source, "isInternalServiceRequest(req)");

  const authAt = source.indexOf("isInternalServiceRequest(req)");
  const clientAt = source.indexOf("const supabase = createClient");
  assert(
    authAt >= 0 && authAt < clientAt,
    "a autorização deve preceder o client privilegiado",
  );
});

Deno.test("auto-reassign-inactive usa RPC compare-and-swap e não separa a auditoria", async () => {
  const source = await Deno.readTextFile(sourceUrl);
  assert(
    /\.rpc\(\s*["']reassign_inactive_client_portfolio["']/.test(source),
    "a edge deve chamar a RPC de reatribuição atômica",
  );
  assertStringIncludes(
    source,
    "p_expected_updated_at: assignment.client.updated_at",
  );
  assertStringIncludes(source, "REASSIGNMENT_BATCH_SIZE");
  assert(
    !/\.from\(["']client_portfolio["']\)\s*\.update/.test(source),
    "a edge não pode atualizar client_portfolio fora da RPC atômica",
  );
  assert(
    !/\.from\(["']lead_routing_log["']\)\s*\.insert/.test(source),
    "a edge não pode gravar o log de roteamento em uma segunda operação",
  );
});

Deno.test("a RPC revalida a inatividade depois de bloquear a carteira", async () => {
  const migration = await Deno.readTextFile(
    new URL("../../migrations/20260830000002_harden_lead_routing.sql", import.meta.url),
  );
  assertStringIncludes(migration, "v_portfolio.last_purchase_date >= current_date - p_inactivity_threshold_days");
  assertStringIncludes(migration, "Carteira não atingiu o limite de inatividade observado");
});
