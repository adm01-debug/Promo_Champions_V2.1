import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { matchOrigin } from "./cors.ts";

Deno.test("matchOrigin aceita curingas de subdomínio sem gerar regex inválida", () => {
  assertEquals(matchOrigin("https://preview.lovable.app", "*.lovable.app"), true);
  assertEquals(matchOrigin("http://preview.lovable.app", "*.lovable.app"), true);
  assertEquals(matchOrigin("https://preview.example.com", "https://*.example.com"), true);
  assertEquals(matchOrigin("https://preview.evil-example.com", "https://*.example.com"), false);
  assertEquals(matchOrigin("https://lovable.app", "*.lovable.app"), false);
});
