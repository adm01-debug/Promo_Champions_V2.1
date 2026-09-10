function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

Deno.test("pipeline-pulse-aggregator usa contrato canônico e protege agregados globais", async () => {
  const source = await Deno.readTextFile(
    new URL("./index.ts", import.meta.url),
  );

  assert(
    source.includes("getUserClient(req)"),
    "exige JWT antes de consultar dados globais",
  );
  assert(source.includes('"is_admin_or_manager"'), "exige role operacional");
  assert(
    source.includes("getServiceClient("),
    "bypass de RLS deve ser explícito e posterior ao RBAC",
  );
  assert(
    source.indexOf("caller = await getUserClient(req)") <
      source.indexOf("const supabase = getServiceClient("),
    "RBAC deve ocorrer antes do service role",
  );
  assert(
    source.includes("lead_routing_log"),
    "usa o ledger de roteamento que existe no schema",
  );
  assert(
    !source.includes("lead_routing_assignments"),
    "não consulta tabela inexistente",
  );
  assert(
    source.includes('"id, amount, status, salesperson_id, created_at"'),
    "usa amount, coluna real de sales",
  );
  assert(!source.includes("total_amount"), "não consulta coluna inexistente");
  for (
    const status of ["lead", "qualified", "pending", "proposal", "negotiation"]
  ) {
    assert(
      source.includes(`"${status}"`),
      `status canônico ausente: ${status}`,
    );
  }
  assert(
    source.includes('label: "Receita ganha 30d"'),
    "não chama receita realizada de forecast IA",
  );
  assert(
    !source.includes("teamCapacity"),
    "não inventa capacidade a partir de uma coluna inexistente",
  );
});
