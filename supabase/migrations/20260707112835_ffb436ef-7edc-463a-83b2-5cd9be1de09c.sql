CREATE INDEX IF NOT EXISTS idx_salespeople_lower_email
  ON public.salespeople (lower(email))
  WHERE email IS NOT NULL;