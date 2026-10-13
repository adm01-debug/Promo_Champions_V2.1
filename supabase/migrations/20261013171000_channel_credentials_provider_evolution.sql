-- Permite provider 'evolution' (Evolution API da VPS, instância wpp2) em
-- channel_credentials. Sem o CHECK ampliado, o cadastro da credencial falha
-- antes mesmo de chegar ao roteamento do send-multichannel-message.

ALTER TABLE public.channel_credentials
  DROP CONSTRAINT IF EXISTS channel_credentials_provider_check,
  ADD CONSTRAINT channel_credentials_provider_check
    CHECK (provider IN ('twilio','meta_cloud','zapi','messagebird','evolution'));
