import { corsHeaders } from '../_shared/cors.ts';
import { withRequestId } from "../_shared/request-id.ts";
import { filterOptedOut } from "../_shared/unsubscribe.ts";
import { createClient } from 'npm:@supabase/supabase-js@2.49.4';


const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(withRequestId("email-bulk-send", async (req, _ctx) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { job_id } = (await req.json()) as { job_id: string };
    if (!job_id) {
      return new Response(JSON.stringify({ error: 'job_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: job } = await admin
      .from('email_bulk_jobs')
      .select('id, owner_id, status')
      .eq('id', job_id)
      .maybeSingle();

    if (!job || job.owner_id !== user.id) {
      return new Response(JSON.stringify({ error: 'forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    await admin.from('email_bulk_jobs').update({ status: 'sending' }).eq('id', job_id);

    const { data: drafts } = await admin
      .from('email_bulk_drafts')
      .select('id, recipient_email, recipient_name, subject, body, client_id')
      .eq('job_id', job_id)
      .eq('approved', true)
      .is('sent_at', null)
      .limit(10000);

    // Guarda de opt-out: nunca enviar para quem se descadastrou (falha fechada).
    const { allowed, blocked } = await filterOptedOut(
      admin as never,
      drafts ?? [],
      (d) => d.recipient_email,
    );

    let skipped = 0;
    for (const d of blocked) {
      await admin
        .from('email_bulk_drafts')
        .update({ error: 'opted_out' })
        .eq('id', d.id);
      skipped++;
    }

    let sent = 0;
    let failed = 0;

    // Remetente: env dedicada ou o configurado nos alertas (única fonte hoje).
    let fromAddress = Deno.env.get('BULK_EMAIL_FROM') ?? '';
    if (!fromAddress) {
      const { data: s } = await admin
        .from('churn_alert_settings')
        .select('email_from, email_reply_to')
        .maybeSingle();
      fromAddress = (s as { email_from?: string } | null)?.email_from ?? '';
    }
    if (!fromAddress) {
      await admin
        .from('email_bulk_jobs')
        .update({ status: 'failed', error_message: 'sender_not_configured' })
        .eq('id', job_id);
      return new Response(
        JSON.stringify({
          error:
            'Remetente de e-mail não configurado. Defina um domínio verificado antes de disparar envios.',
          needsEmailSetup: true,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    for (const d of allowed) {
      if (!d.recipient_email) {
        await admin
          .from('email_bulk_drafts')
          .update({ error: 'missing_recipient_email' })
          .eq('id', d.id);
        failed++;
        continue;
      }
      try {
        // Conformidade LGPD/CAN-SPAM: todo envio em massa carrega descadastro
        // visível (rodapé) e one-click (RFC 8058) para provedores.
        const footer = await unsubscribeFooterHtml(d.recipient_email);
        const headers = await unsubscribeHeaders(d.recipient_email);
        const html = `${d.body ?? ''}${footer}`;

        const { error } = await admin.rpc('enqueue_email', {
          p_to: [d.recipient_email],
          p_from: fromAddress,
          p_reply_to: null,
          p_subject: d.subject,
          p_html: html,
          p_purpose: 'transactional',
          p_template_name: 'bulk-composer',
          p_headers: headers,
        } as never);
        if (error) throw new Error(error.message);

        await admin
          .from('email_bulk_drafts')
          .update({ sent_at: new Date().toISOString(), error: null })
          .eq('id', d.id);
        sent++;
      } catch (e) {
        const msg = (e as Error).message ?? String(e);
        if (/enqueue_email/i.test(msg) && /does not exist/i.test(msg)) {
          // Falha de infraestrutura: aborta o lote em vez de queimar destinatários.
          await admin
            .from('email_bulk_jobs')
            .update({ status: 'failed', error_message: 'email_infra_missing' })
            .eq('id', job_id);
          return new Response(
            JSON.stringify({
              error:
                'Infraestrutura de e-mail ainda não configurada. Configure um domínio verificado antes de disparar envios.',
              needsEmailSetup: true,
              sent,
              failed,
              skipped,
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
          );
        }
        await admin
          .from('email_bulk_drafts')
          .update({ error: msg.slice(0, 500) })
          .eq('id', d.id);
        failed++;
      }
    }


    await admin
      .from('email_bulk_jobs')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', job_id);

    return new Response(JSON.stringify({ sent, failed, skipped }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (e) {
    console.error('email-bulk-send error:', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}));
