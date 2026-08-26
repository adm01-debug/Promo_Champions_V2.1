import { readUtf8BodyWithinLimit } from "./request-body.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

Deno.test("readUtf8BodyWithinLimit aceita corpo dentro do limite", async () => {
  const request = new Request("https://example.test", {
    method: "POST",
    body: "olá",
  });
  assert(
    await readUtf8BodyWithinLimit(request, 8) === "olá",
    "o corpo UTF-8 deveria ser preservado",
  );
});

Deno.test("readUtf8BodyWithinLimit rejeita Content-Length inválido ou excessivo", async () => {
  const malformed = new Request("https://example.test", {
    method: "POST",
    headers: { "content-length": "not-a-number" },
    body: "x",
  });
  const oversized = new Request("https://example.test", {
    method: "POST",
    headers: { "content-length": "9" },
    body: "x",
  });

  assert(
    await readUtf8BodyWithinLimit(malformed, 8) === null,
    "Content-Length malformado deve ser rejeitado",
  );
  assert(
    await readUtf8BodyWithinLimit(oversized, 8) === null,
    "Content-Length acima do limite deve ser rejeitado",
  );
});

Deno.test("readUtf8BodyWithinLimit mede bytes reais, inclusive em transferências chunked", async () => {
  const request = new Request("https://example.test", {
    method: "POST",
    body: "á", // dois bytes em UTF-8
  });
  assert(
    await readUtf8BodyWithinLimit(request, 1) === null,
    "o limite deve considerar bytes, e não caracteres",
  );
});
