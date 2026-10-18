-- Normaliza outbound_messages.to_number para dígitos puros.
-- send-multichannel-message passou a gravar só dígitos e o match de respostas
-- do whatsapp-inbound-webhook compara dígitos/'+'+dígitos; linhas históricas
-- com máscara ('+55 (11) 9xxxx-xxxx') nunca casavam e a cadência não pausava.
UPDATE public.outbound_messages
SET to_number = regexp_replace(to_number, '[^0-9]', '', 'g')
WHERE to_number IS NOT NULL
  AND to_number ~ '[^0-9]';
