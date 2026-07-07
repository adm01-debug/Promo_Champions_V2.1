-- IMP10: CHECK constraints defensivas em quotes_inbound (source, status, tamanho de payload)

-- 1) source: só valores conhecidos + não-vazio
ALTER TABLE public.quotes_inbound
  ADD CONSTRAINT chk_quotes_inbound_source_allowed
  CHECK (source IN ('gift_store','bitrix24','manual','api','webhook'));

-- 2) status: só valores esperados no fluxo (NULL permitido)
ALTER TABLE public.quotes_inbound
  ADD CONSTRAINT chk_quotes_inbound_status_allowed
  CHECK (
    status IS NULL OR status IN (
      'draft','pending','sent','approved','rejected',
      'expired','converted','cancelled','won','lost','open'
    )
  );

-- 3) raw_payload: limite defensivo de tamanho (256 KB) — evita DoS por payload gigante
ALTER TABLE public.quotes_inbound
  ADD CONSTRAINT chk_quotes_inbound_raw_payload_size
  CHECK (pg_column_size(raw_payload) <= 262144);

-- 4) quote_number/client_name: comprimento máximo defensivo
ALTER TABLE public.quotes_inbound
  ADD CONSTRAINT chk_quotes_inbound_quote_number_len
  CHECK (quote_number IS NULL OR char_length(quote_number) <= 128);

ALTER TABLE public.quotes_inbound
  ADD CONSTRAINT chk_quotes_inbound_client_name_len
  CHECK (client_name IS NULL OR char_length(client_name) <= 512);

-- 5) seller_email: formato mínimo (contém @ e ponto) quando presente
ALTER TABLE public.quotes_inbound
  ADD CONSTRAINT chk_quotes_inbound_seller_email_format
  CHECK (
    seller_email IS NULL
    OR seller_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  );