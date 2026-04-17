import type { ChannelKind, ProviderKind } from "@/hooks/multichannel/useChannelCredentials";

export const CHANNEL_LABEL: Record<ChannelKind, string> = {
  whatsapp: "WhatsApp",
  sms: "SMS",
};

export const PROVIDER_LABEL: Record<ProviderKind, string> = {
  twilio: "Twilio",
  meta_cloud: "Meta Cloud API",
  zapi: "Z-API",
  messagebird: "MessageBird",
};

export const STATUS_LABEL: Record<string, string> = {
  queued: "Enfileirada",
  sent: "Enviada",
  delivered: "Entregue",
  read: "Lida",
  failed: "Falhou",
};

export const statusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "delivered":
    case "read":
      return "default";
    case "sent":
      return "secondary";
    case "failed":
      return "destructive";
    default:
      return "outline";
  }
};

/** Normalize phone to E.164-ish (digits only with +). */
export const normalizePhone = (raw: string): string => {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return `+${digits}`;
};

/** Provider field schema for dynamic form. */
export const PROVIDER_FIELDS: Record<ProviderKind, Array<{ key: string; label: string; secret?: boolean; help?: string }>> = {
  twilio: [
    { key: "account_sid", label: "Account SID" },
    { key: "auth_token", label: "Auth Token", secret: true },
    { key: "agent_phone", label: "Telefone do vendedor (E.164, opcional)", help: "Número que receberá a perna do vendedor em chamadas click-to-call" },
  ],
  meta_cloud: [
    { key: "phone_number_id", label: "Phone Number ID" },
    { key: "access_token", label: "Access Token", secret: true },
  ],
  zapi: [
    { key: "instance_id", label: "Instance ID" },
    { key: "token", label: "Token", secret: true },
    { key: "client_token", label: "Client Token (opcional)", secret: true },
  ],
  messagebird: [
    { key: "api_key", label: "API Key", secret: true },
  ],
};
