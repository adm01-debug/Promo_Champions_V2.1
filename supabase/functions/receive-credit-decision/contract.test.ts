import { assert, assertEquals } from "jsr:@std/assert@1";
import {
  CreditDecisionPayloadSchema,
  hmacSha256Hex,
  signatureMatches,
} from "./contract.ts";

Deno.test("assinatura HMAC confere com vetor conhecido", async () => {
  const hex = await hmacSha256Hex("key", "The quick brown fox jumps over the lazy dog");
  assertEquals(hex, "f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8");
  assert(await signatureMatches("key", "The quick brown fox jumps over the lazy dog", `sha256=${hex}`));
  assert(await signatureMatches("key", "The quick brown fox jumps over the lazy dog", hex.toUpperCase()));
  assert(!(await signatureMatches("outra", "The quick brown fox jumps over the lazy dog", `sha256=${hex}`)));
});

Deno.test("payload aprovado com limite e parcelas passa", () => {
  const r = CreditDecisionPayloadSchema.safeParse({
    pedido_id: "0d1f8d3c-0000-4000-8000-000000000001",
    analise_id: "a1",
    decisao: "aprovado",
    limite_aprovado: 15000,
    parcelas_max: 3,
    parecer: "Empresa ativa desde 2015",
  });
  assert(r.success);
});

Deno.test("decisao fora de aprovado/reprovado e pedido sem UUID sao rejeitados", () => {
  assert(!CreditDecisionPayloadSchema.safeParse({
    pedido_id: "0d1f8d3c-0000-4000-8000-000000000001",
    analise_id: "a1",
    decisao: "pendente",
  }).success);
  assert(!CreditDecisionPayloadSchema.safeParse({
    pedido_id: "PED-1",
    analise_id: "a1",
    decisao: "reprovado",
  }).success);
});
