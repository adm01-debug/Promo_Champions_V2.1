# Runbook — ElevenLabs (elevenlabs-voice, elevenlabs-tts, elevenlabs-stt)

## O que faz

Voz da assistente de IA — TTS/STT via `api.elevenlabs.io` usando
`ELEVENLABS_API_KEY` (header `xi-api-key`). Consumido pelo frontend via
`src/hooks/useElevenLabsVoice.ts` (configuração em
`src/components/settings/AIAssistantSettings.tsx`).

> **Estado real**: `elevenlabs-stt` existe no repo mas **não está deployada**
> (health retorna 404 em produção). `elevenlabs-voice`/`elevenlabs-tts`
> respondem (401 sem auth = deployadas). Transcrição de chamadas usa o
> gateway Lovable AI (`transcribe-call-recording`, Gemini multimodal),
> não o elevenlabs-stt.

## Configuração

| Item | Onde |
|------|------|
| `ELEVENLABS_API_KEY` | Secret das edge functions |
| Voz/idioma padrão | Configuração da assistente em Settings (frontend) |

## Sinais de falha

- Frontend mostra erro ao usar voz → function retorna erro configurado
  ("ElevenLabs API key not configured" quando o secret falta).
- 401/402 da API ElevenLabs → chave inválida ou **cota/plano estourado**
  (quota exceeded aparece como erro de quota nos logs).
- 404 no endpoint → function não deployada (como `elevenlabs-stt` hoje).

## Onde olhar

1. Supabase → Edge Functions → Logs de `elevenlabs-*` (mensagem de erro
   da ElevenLabs aparece no corpo do log).
2. ElevenLabs Dashboard → Usage/Subscription — consumo de caracteres e
   estado do plano.
3. `curl -i https://usyxfpqlsspldubptrdl.supabase.co/functions/v1/elevenlabs-tts`
   — 401 = deployada e pedindo auth; 404 = não existe em produção.

## Mitigação / rollback

- **Quota estourada**: upgrade/plano no ElevenLabs ou reduzir uso de voz
  (desligar a feature nas configurações da assistente).
- **Chave inválida**: nova API key no ElevenLabs → atualizar
  `ELEVENLABS_API_KEY` nos secrets.
- **Function ausente (404)**: se a feature for necessária, deploy manual
  (`supabase functions deploy elevenlabs-stt`); se não for, remover do
  frontend o caminho que a chama.
- **Fallback de voz**: a app continua sem voz — não há fallback automático;
  degradar desligando o botão de voz nas configurações até resolver.
