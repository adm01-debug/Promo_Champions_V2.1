import { getCorsHeaders } from '../_shared/cors.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.4';
import { withRequestId } from '../_shared/request-id.ts';

interface Payload {
  test?: boolean;
  clientName?: string;
  level?: string;
  daysSince?: number;
  salespersonName?: string;
}

interface Settings {
  email_enabled: boolean;
  email_from: string | null;
  email_reply_to: string | null;
  email_recipients: string[];
  email_subject_template: string;
  email_provider: string;
}

function renderSubject(tpl: string, ctx: Record<string, string>) {
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => ctx[k] ?? '');
}

function renderHtml(ctx: {
  clientName: string;
  level: string;
  daysSince: number;
  salespersonName: string;
}) {
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#ffffff;padding:24px;color:#111">
    <div style="max-width:560px;margin:0 auto;border:1px solid #eee;border-radius:12px;padding:24px">
      <h1 style="font-size:20px;margin:0 0 12px">Alerta de risco de churn</h1>
      <p style="margin:0 0 8px"><strong>Cliente:</strong> ${ctx.clientName}</p>
      <p style="margin:0 0 8px"><strong>Nível de risco:</strong> ${ctx.level}</p>
      <p style="margin:0 0 8px"><strong>Dias sem comprar:</strong> ${ctx.daysSince}</p>
      <p style="margin:0 0 8px"><strong>Responsável:</strong> ${ctx.salespersonName}</p>
      <p style="color:#666;font-size:12px;margin-top:16px">Este e-mail foi enviado automaticamente pelo Promo Champions.</p>
    </div></body></html>`;
}

Deno.serve(withRequestId('send-churn-alert-email', async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const body = (await req.json().catch(() => ({}))) as Payload;

    const { data: settings, error: sErr } = await supabase
      .from('churn_alert_settings')
      .select('email_enabled, email_from, email_reply_to, email_recipients, email_subject_template, email_provider')
      .maybeSingle();
    if (sErr) throw sErr;
    const s = settings as Settings | null;
    if (!s) throw new Error('Configuração de churn não encontrada.');
    if (!s.email_enabled) throw new Error('Envio de e-mail desativado nas configurações.');
    if (!s.email_from) throw new Error('Remetente (email_from) não configurado.');
    if (!s.email_recipients || s.email_recipients.length === 0) {
      throw new Error('Nenhum destinatário configurado.');
    }

    const ctx = {
      clientName: body.clientName ?? 'Cliente de Teste',
      level: body.level ?? 'critical',
      daysSince: body.daysSince ?? 42,
      salespersonName: body.salespersonName ?? 'Vendedor',
    };
    const subject = renderSubject(s.email_subject_template, {
      client_name: ctx.clientName,
      level: ctx.level,
      days: String(ctx.daysSince),
    });
    const html = renderHtml(ctx);

    // Tenta usar infra de e-mail do Lovable (enqueue_email). Se ausente, orienta setup.
    const { error: qErr } = await supabase.rpc('enqueue_email', {
      p_to: s.email_recipients,
      p_from: s.email_from,
      p_reply_to: s.email_reply_to,
      p_subject: subject,
      p_html: html,
      p_purpose: 'transactional',
      p_template_name: 'churn-alert',
    } as never);

    if (qErr) {
      const msg = qErr.message ?? String(qErr);
      if (/function .*enqueue_email.* does not exist/i.test(msg)) {
        return new Response(
          JSON.stringify({
            ok: false,
            error:
              'Infraestrutura de e-mail ainda não configurada. Configure um domínio verificado em Admin → E-mails antes de enviar.',
            needsEmailSetup: true,
          }),
          { status: 400, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } },
        );
      }
      throw qErr;
    }

    return new Response(
      JSON.stringify({ ok: true, test: !!body.test, recipients: s.email_recipients.length }),
      { status: 200, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 400,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }
});
