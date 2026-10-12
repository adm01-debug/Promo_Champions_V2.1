/**
 * Chamada interna à function send-transactional-email — o caminho real de
 * envio (Resend + supressão/opt-out + descadastro + auditoria de entrega).
 * Substitui a RPC `enqueue_email`, que não existe no banco e fazia os
 * chamadores falharem silenciosamente.
 */
export async function sendTransactionalEmail(params: {
  supabaseUrl: string;
  serviceRoleKey: string;
  to: string;
  subject: string;
  html: string;
  purpose?: "transactional" | "outreach";
}): Promise<{ error: Error | null }> {
  try {
    const res = await fetch(
      `${params.supabaseUrl.replace(/\/$/, "")}/functions/v1/send-transactional-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: params.serviceRoleKey,
          Authorization: `Bearer ${params.serviceRoleKey}`,
        },
        body: JSON.stringify({
          to: params.to,
          subject: params.subject,
          html: params.html,
          // outreach (não transactional): campanhas precisam respeitar
          // opt-out/descadastro — prepareEmail só aplica a supressão nesse modo.
          purpose: params.purpose ?? "outreach",
        }),
      },
    );
    const body = await res.json().catch(() => null) as
      | { ok?: boolean; error?: string }
      | null;
    if (!res.ok || body?.ok === false) {
      return {
        error: new Error(body?.error ?? `send_status_${res.status}`),
      };
    }
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e : new Error(String(e)) };
  }
}
