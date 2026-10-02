import { getCorsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";
import {
  collectErrors,
  validateEnum,
  validateString,
  validateUUID,
} from "../_shared/validation.ts";
import {
  getServiceClient,
  getUserClient,
  UnauthorizedError,
} from "../_shared/auth-client.ts";

Deno.serve(
  withRequestId("push-subscribe", async (req, ctx) => {
    const corsHeaders = getCorsHeaders(req);
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const json = (data: unknown, status = 200) =>
      new Response(
        JSON.stringify({ ...(data as object), request_id: ctx.requestId }),
        {
          status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );

    try {
      // Bypass de RLS necessário: o upsert em push_subscriptions já é
      // restrito ao user_id do JWT validado abaixo.
      const supabase = getServiceClient(
        "gerencia push_subscriptions do proprio usuario autenticado",
      );

      const body = await req.json().catch(() => null);
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        return json({ error: "invalid_json_body" }, 400);
      }

      const actionErrors = collectErrors([
        validateEnum(
          body.action,
          "action",
          ["subscribe", "unsubscribe", "get-vapid-key"],
          true,
        ),
      ]);
      if (actionErrors.length) {
        return json({ error: "dados_invalidos", details: actionErrors }, 400);
      }

      const { subscription, user_id, action } = body as {
        subscription?: {
          endpoint?: unknown;
          keys?: { p256dh?: unknown; auth?: unknown };
        };
        user_id?: unknown;
        action: "subscribe" | "unsubscribe" | "get-vapid-key";
      };

      // get-vapid-key is public — no auth required
      if (action === "get-vapid-key") {
        const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
        return json({ vapidPublicKey: vapidPublicKey || null });
      }

      // subscribe / unsubscribe: caller must be authenticated and can only
      // manage their own subscription (user_id in body must match JWT sub)
      let caller;
      try {
        caller = await getUserClient(req);
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          return json({ error: "Unauthorized" }, 401);
        }
        throw error;
      }
      const callerUserId = caller.userId;

      const userIdErrors = collectErrors([
        validateUUID(user_id, "user_id", true),
      ]);
      if (userIdErrors.length) {
        return json({ error: "dados_invalidos", details: userIdErrors }, 400);
      }
      if (user_id !== callerUserId) {
        return json(
          { error: "Forbidden: cannot manage another user's subscription" },
          403,
        );
      }

      if (action === "subscribe") {
        const subscriptionErrors = collectErrors([
          validateString(subscription?.endpoint, "subscription.endpoint", {
            required: true,
            maxLength: 2048,
          }),
          validateString(
            subscription?.keys?.p256dh,
            "subscription.keys.p256dh",
            {
              required: true,
              maxLength: 512,
            },
          ),
          validateString(subscription?.keys?.auth, "subscription.keys.auth", {
            required: true,
            maxLength: 512,
          }),
        ]);
        if (subscriptionErrors.length) {
          return json(
            { error: "dados_invalidos", details: subscriptionErrors },
            400,
          );
        }
        const validSubscription = subscription as {
          endpoint: string;
          keys: { p256dh: string; auth: string };
        };

        const { error } = await supabase
          .from("push_subscriptions")
          .upsert(
            {
              user_id: user_id as string,
              endpoint: validSubscription.endpoint,
              p256dh: validSubscription.keys.p256dh,
              auth: validSubscription.keys.auth,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" },
          )
          .select()
          .single();

        if (error) throw error;
        return json({ success: true, message: "Subscription saved" });
      }

      // unsubscribe
      const { error } = await supabase
        .from("push_subscriptions")
        .delete()
        .eq("user_id", user_id as string);
      if (error) throw error;
      return json({ success: true, message: "Subscription removed" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      ctx.log("error", "push_subscribe_failed", { error: message });
      return json({ error: message }, 500);
    }
  }),
);
