import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  checkAudioSignature,
  checkFileSignature,
  detectFileSignature,
} from "./file-signature.ts";
import { rateLimitUserKey } from "./rate-limit.ts";

function bytes(arr: number[], padTo = 16): Uint8Array {
  const b = new Uint8Array(Math.max(arr.length, padTo));
  b.set(arr);
  return b;
}

function text(t: string): Uint8Array {
  return new TextEncoder().encode(t);
}

function jwtWithSub(sub: string): string {
  const b64 = (o: unknown) =>
    btoa(JSON.stringify(o)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${b64({ alg: "none" })}.${b64({ sub })}.sig`;
}

Deno.test("detectFileSignature reconhece áudio", () => {
  assertEquals(detectFileSignature(text("RIFF\x00\x00\x00\x00WAVEfmt ")), "wav");
  assertEquals(detectFileSignature(text("ID3\x04\x00\x00\x00")), "mp3");
  assertEquals(detectFileSignature(bytes([0xff, 0xfb, 0x90, 0x00])), "mp3");
  assertEquals(detectFileSignature(text("OggS\x00\x02")), "ogg");
  assertEquals(detectFileSignature(bytes([0x1a, 0x45, 0xdf, 0xa3])), "webm");
  assertEquals(detectFileSignature(text("\x00\x00\x00\x18ftypM4A ")), "mp4");
  assertEquals(detectFileSignature(text("fLaC\x00\x00")), "flac");
});

Deno.test("detectFileSignature reconhece pdf e imagens", () => {
  assertEquals(detectFileSignature(text("%PDF-1.7\n")), "pdf");
  assertEquals(detectFileSignature(bytes([0x89, 0x50, 0x4e, 0x47])), "png");
  assertEquals(detectFileSignature(bytes([0xff, 0xd8, 0xff, 0xe0])), "jpeg");
  assertEquals(detectFileSignature(text("RIFF\x00\x00\x00\x00WEBPVP8 ")), "webp");
});

Deno.test("detectFileSignature reconhece formatos perigosos", () => {
  assertEquals(detectFileSignature(text("MZ\x90\x00")), "exe");
  assertEquals(detectFileSignature(bytes([0x7f, 0x45, 0x4c, 0x46])), "elf");
  assertEquals(detectFileSignature(bytes([0x50, 0x4b, 0x03, 0x04])), "zip");
  assertEquals(detectFileSignature(text("  <!DOCTYPE html><body>")), "html");
});

Deno.test("detectFileSignature retorna null para conteúdo desconhecido", () => {
  assertEquals(detectFileSignature(text("texto qualquer sem assinatura")), null);
  assertEquals(detectFileSignature(bytes([0x01, 0x02])), null);
});

Deno.test("checkAudioSignature aceita áudio e rejeita disfarces", () => {
  assertEquals(checkAudioSignature(text("RIFF\x00\x00\x00\x00WAVEfmt ")).ok, true);
  assertEquals(checkAudioSignature(bytes([0x1a, 0x45, 0xdf, 0xa3])).ok, true);
  assertEquals(checkAudioSignature(text("MZ\x90\x00")).ok, false);
  assertEquals(checkAudioSignature(text("%PDF-1.7")).ok, false);
  assertEquals(checkAudioSignature(text("<html><body>")).ok, false);
  assertEquals(checkAudioSignature(text("xyz")).ok, false);
});

Deno.test("checkFileSignature honra o conjunto permitido", () => {
  const pdfOnly = new Set<"pdf">(["pdf"]);
  assertEquals(checkFileSignature(text("%PDF-1.5"), pdfOnly).ok, true);
  const r = checkFileSignature(bytes([0x89, 0x50, 0x4e, 0x47]), pdfOnly);
  assertEquals(r.ok, false);
  assertEquals(r.reason, "signature_mismatch");
  assertEquals(r.detected, "png");
});

Deno.test("rateLimitUserKey extrai sub do JWT e ignora entradas inválidas", () => {
  assertEquals(rateLimitUserKey(new Request("https://x", { headers: {} })), undefined);
  assertEquals(
    rateLimitUserKey(new Request("https://x", { headers: { Authorization: "Basic abc" } })),
    undefined,
  );
  assertEquals(
    rateLimitUserKey(
      new Request("https://x", { headers: { Authorization: "Bearer nao-e-jwt" } }),
    ),
    undefined,
  );
  assertEquals(
    rateLimitUserKey(
      new Request("https://x", {
        headers: { Authorization: `Bearer ${jwtWithSub("user-123")}` },
      }),
    ),
    "user:user-123",
  );
});
