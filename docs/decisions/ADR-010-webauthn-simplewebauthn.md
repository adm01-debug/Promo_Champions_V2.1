# ADR-010: WebAuthn/passkeys com verificação criptográfica real (SimpleWebAuthn)

**Data:** 2026-10-01
**Status:** Aceito
**Pacote:** auditoria de autenticação — [WEBAUTHN]

## Contexto

A edge function `webauthn` e o hook `useWebAuthn` existiam, mas a verificação
era fake/incompleta:

- `register-verify` gravava o `attestationObject` (CBOR bruto) na coluna
  `public_key` sem verificar a attestation — a chave pública real da credencial
  nunca era extraída.
- `login-verify` apenas conferia se `clientDataJSON`/`signature` existiam e se
  o challenge batia — **nunca validou a assinatura** da assertion contra a
  chave pública. Qualquer cliente podia forjar um JSON e receber um magic link
  (`admin.generateLink`) de login.
- Um commit anterior (`648dcc9d4`) conteve a superfície retornando 503 e com
  `PASSKEYS_AVAILABLE = false` no hook — meio-termo: hook vivo apontando para
  stub.

A auditoria pedia uma de duas vias: (a) implementar com
`@simplewebauthn/server` no Deno, ou (b) remover a superfície inteira.

## Decisão

**Opção (a): implementação real com `npm:@simplewebauthn/server@14.0.2`.**

A biblioteca é mantida, compatível com Deno via `npm:` specifier e a versão
pinada foi publicada há mais de 7 dias (2026-09-13), satisfazendo a política
de supply chain do repo. A infraestrutura necessária já existia
(`webauthn_credentials`, `webauthn_challenges`).

O que a function passa a verificar de verdade:

- `register-verify` → `verifyRegistrationResponse`: challenge consumível de
  uso único (anti-replay), origin allowlistada (`expectedOrigins`), RP ID,
  flags e formato da attestation; persiste a chave pública COSE real
  (base64url) e o counter.
- `login-verify` → `verifyAuthenticationResponse`: assinatura ECDSA/RSA
  contra a chave COSE armazenada, challenge consumível, origin, RP ID e
  contador atualizado via `authenticationInfo.newCounter`.
- Emissão de sessão continua via `admin.generateLink` (magiclink) + `verifyOtp`
  no cliente — sessão real emitida pelo GoTrue.

Helpers puros ficam em `_shared/webauthn-helpers.ts` com cobertura de
`deno test` (`webauthn-helpers_test.ts`).

## Consequências

- **Credenciais legadas são invalidadas**: linhas de `webauthn_credentials`
  gravadas antes desta versão têm `public_key` = attestationObject, não a
  chave COSE — a verificação falha e o usuário precisa registrar a passkey
  novamente. Não há conversão possível (a chave real nunca foi extraída).
- `PASSKEYS_AVAILABLE` volta a `true` em `useWebAuthn.ts` e o card
  "Temporariamente Indisponíveis" de `PasskeySettings` deixa de aparecer.
- Login por passkey depende do domínio servir `https://<rpId>` — em produção
  o RP ID é o hostname da página, enviado pelo cliente.

## Rollback

Reverter `PASSKEYS_AVAILABLE` para `false` em `src/hooks/useWebAuthn.ts`
reestabelece o estado de manutenção sem deploy de backend. Para desligar a
function, restaurar o stub 503 em `supabase/functions/webauthn/index.ts`.
