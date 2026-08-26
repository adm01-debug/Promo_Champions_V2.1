/**
 * Leitura limitada de corpos UTF-8 para endpoints públicos.
 *
 * A checagem de Content-Length evita trabalho desnecessário quando o cliente
 * declara um corpo excessivo; a checagem do ArrayBuffer protege também
 * transferências chunked ou cabeçalhos adulterados.
 */
export async function readUtf8BodyWithinLimit(
  req: Request,
  maxBytes: number,
): Promise<string | null> {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 0) {
    throw new Error("invalid_body_limit");
  }

  const declaredLength = req.headers.get("content-length");
  if (declaredLength !== null) {
    if (!/^\d+$/.test(declaredLength)) return null;
    const declaredBytes = Number(declaredLength);
    if (!Number.isSafeInteger(declaredBytes) || declaredBytes > maxBytes) {
      return null;
    }
  }

  const body = await req.arrayBuffer();
  if (body.byteLength > maxBytes) return null;
  return new TextDecoder().decode(body);
}
