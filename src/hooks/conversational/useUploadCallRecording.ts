import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { resolveRecordingMimeType } from "@/lib/recordingMime";
import { toast } from "sonner";

interface UploadInput {
  file: File;
  title: string;
  sale_id?: string;
  client_id?: string;
  duration_seconds?: number;
}

/**
 * Faz upload do áudio para o bucket privado `call-recordings` e ENFILEIRA
 * a criação da linha em `call_recordings` em `call_recording_ingest_jobs`.
 *
 * Vantagens sobre o insert direto:
 *  • idempotência: `idempotency_key = sha256(salesperson_id|audio_url|size|mtime)`
 *    → reenvios/reties nunca duplicam registros;
 *  • retry automático com backoff exponencial + jitter no worker
 *    (`process-call-recording-ingest`);
 *  • rollback do arquivo em caso de falha ao enfileirar.
 */
export function useUploadCallRecording() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: UploadInput) => {
      const { data: sp, error: spErr } = await supabase.rpc("get_current_salesperson_id");
      if (spErr) throw spErr;
      if (!sp) throw new Error("Salesperson não encontrado para o usuário atual");

      const ext = input.file.name.split(".").pop()?.toLowerCase() || "mp3";
      const recordingId = crypto.randomUUID();
      const path = `${sp as string}/${recordingId}.${ext}`;
      const contentType = resolveRecordingMimeType(input.file);

      const { error: upErr } = await supabase.storage
        .from("call-recordings")
        .upload(path, input.file, {
          contentType,
          upsert: false,
        });
      if (upErr) throw upErr;

      const idempotencyKey = await sha256(
        [sp as string, path, input.file.size, input.file.lastModified].join("|"),
      );

      const payload = {
        id: recordingId,
        salesperson_id: sp as string,
        sale_id: input.sale_id ?? null,
        client_id: input.client_id ?? null,
        title: input.title,
        audio_url: path,
        duration_seconds: input.duration_seconds ?? 0,
        status: "ready" as const,
        metadata: {
          original_filename: input.file.name,
          size_bytes: input.file.size,
          mime_type: contentType,
        },
      };

      const { error: qErr } = await supabase
        .from("call_recording_ingest_jobs")
        .insert({
          idempotency_key: idempotencyKey,
          recording_id: recordingId,
          salesperson_id: sp as string,
          payload,
        });

      if (qErr && qErr.code !== "23505" /* dedupe = já enfileirado */) {
        await supabase.storage.from("call-recordings").remove([path]).catch(() => {});
        throw qErr;
      }

      // Dispara o worker imediatamente para reduzir latência; se falhar,
      // o cron de 1min ainda drena a fila.
      supabase.functions.invoke("process-call-recording-ingest", { body: {} }).catch(() => {});

      return { id: recordingId, path, idempotency_key: idempotencyKey };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["call-recordings"] });
      qc.invalidateQueries({ queryKey: ["call-recording-ingest-jobs"] });
      toast.success("Áudio enviado — processamento em andamento 🎙️");
    },
    onError: (e) =>
      toast.error(`Falha no upload: ${e instanceof Error ? e.message : "erro desconhecido"}`),
  });
}

async function sha256(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Gera uma URL assinada (1h) para reproduzir um áudio armazenado de forma privada.
 */
export async function getCallRecordingSignedUrl(audioPath: string): Promise<string | null> {
  if (!audioPath) return null;
  const { data, error } = await supabase.storage
    .from("call-recordings")
    .createSignedUrl(audioPath, 60 * 60);
  if (error) return null;
  return data?.signedUrl ?? null;
}
