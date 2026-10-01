// PII-MASK — Mascaramento de dados pessoais (LGPD) para logs do frontend.
//
// Logs do browser também trafegam para serviços externos (Sentry via
// errorTracking, consoles de diagnóstico). Email, telefone e CPF/CNPJ nunca
// devem ser gravados em claro — usar estes helpers antes de logar.
//
// Gemeo de `supabase/functions/_shared/pii.ts` — manter as duas em sincronia.

const EMAIL_RE = /^[^\s@]+@([^\s@]+)$/;
const CPF_RE = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g;
const CNPJ_RE = /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g;
const PHONE_RE = /(?:\+?55[\s.-]?)?(?:\(?\d{2}\)?[\s.-]?)?9?\d{4}[\s.-]?\d{4}\b/g;
const EMAIL_ANY_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/g;

/** `maria.silva@empresa.com` → `m***a@empresa.com` */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return "";
  const m = EMAIL_RE.exec(email.trim());
  if (!m) return "***";
  const local = email.trim().slice(0, email.trim().length - m[1].length - 1);
  const domain = m[1];
  const head = local.slice(0, 1);
  const tail = local.length > 1 ? local.slice(-1) : "";
  return `${head}***${tail}@${domain}`;
}

/** `+55 (11) 98765-4321` → `***4321` — preserva só os 4 últimos dígitos. */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "***";
  return `***${digits.slice(-4)}`;
}

/** CPF `123.456.789-09` → `***.***.***-09`; CNPJ → `**.***.***\/XXXX-09` (dois últimos dígitos). */
export function maskDoc(doc: string | null | undefined): string {
  if (!doc) return "";
  const digits = doc.replace(/\D/g, "");
  if (digits.length === 11) return `***.***.***-${digits.slice(-2)}`;
  if (digits.length === 14) return `**.***.***/****-${digits.slice(-2)}`;
  if (digits.length >= 4) return `***${digits.slice(-4)}`;
  return "***";
}

/**
 * Varre texto livre e mascara emails, telefones e CPF/CNPJ embutidos.
 */
export function maskFreeText(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(EMAIL_ANY_RE, (m) => maskEmail(m))
    .replace(CNPJ_RE, (m) => maskDoc(m))
    .replace(CPF_RE, (m) => maskDoc(m))
    .replace(PHONE_RE, (m) => (m.replace(/\D/g, "").length >= 8 ? maskPhone(m) : m));
}
