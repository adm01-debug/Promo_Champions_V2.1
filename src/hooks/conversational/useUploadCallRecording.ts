import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UploadInput {
  file: File;
  title: string;
  sale_id?: string;
  client_id?: string;
  duration_seconds?: number;
}

/**
 * Faz upload de um arquivo de áudio para o bucket privado `call-recordings`
 * e cria o registro correspondente em `call_recordings` (status = 'ready').
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

      const { error: upErr } = await supabase.storage
        .from("call-recordings")
        .upload(path, input.file, {
          contentType: input.file.type || "audio/mpeg",
          upsert: false,
        });
      if (upErr) throw upErr;

      const { error: insErr } = await supabase
        .from("call_recordings")
        .insert({
          id: recordingId,
          salesperson_id: sp as string,
          sale_id: input.sale_id ?? null,
          client_id: input.client_id ?? null,
          title: input.title,
          audio_url: path,
          duration_seconds: input.duration_seconds ?? 0,
          status: "ready",
          metadata: {
            original_filename: input.file.name,
            size_bytes: input.file.size,
            mime_type: input.file.type,
          },
        });
      if (insErr) {
        // rollback: remove arquivo se a linha falhar
        await supabase.storage.from("call-recordings").remove([path]).catch(() => {});
        throw insErr;
      }

      return { id: recordingId, path };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["call-recordings"] });
      toast.success("Áudio enviado com sucesso! 🎙️");
    },
    onError: (e) => toast.error(`Falha no upload: ${e instanceof Error ? e.message : "erro desconhecido"}`),
  });
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
