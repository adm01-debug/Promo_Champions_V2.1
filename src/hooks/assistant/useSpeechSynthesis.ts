import { useCallback, useEffect, useRef, useState } from "react";

/**
 * TTS via Web Speech API (SpeechSynthesis) — pt-BR nativo, sem custo, sem rede.
 *
 * Cenários cobertos:
 * - Browser sem suporte → `supported=false`, controles ficam desabilitados.
 * - Autoplay bloqueado → só toca em resposta a gesto do usuário (é o que faz).
 * - Troca de texto durante playback → cancela e reinicia.
 * - Unmount → cancela para não vazar utterance ativa.
 * - Voz pt-BR pode carregar assíncrono → re-escuta `voiceschanged`.
 */
export function useSpeechSynthesis(text: string) {
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!supported) return;
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const pt = voices.find((v) => v.lang?.toLowerCase().startsWith("pt-br"))
        ?? voices.find((v) => v.lang?.toLowerCase().startsWith("pt"))
        ?? voices[0]
        ?? null;
      setVoice(pt);
    };
    pickVoice();
    window.speechSynthesis.addEventListener("voiceschanged", pickVoice);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", pickVoice);
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [supported]);

  const speak = useCallback(() => {
    if (!supported || !text?.trim()) return;
    // Remove marcações markdown básicas para não "ler" asteriscos e crases.
    const clean = text
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/[#*_`>~-]+/g, " ")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .replace(/\s+/g, " ")
      .trim();
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = voice?.lang ?? "pt-BR";
    if (voice) u.voice = voice;
    u.rate = 1.05;
    u.pitch = 1;
    u.onend = () => setIsSpeaking(false);
    u.onerror = () => setIsSpeaking(false);
    utterRef.current = u;
    setIsSpeaking(true);
    window.speechSynthesis.speak(u);
  }, [supported, text, voice]);

  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel();
    };
  }, [supported]);

  return { supported, isSpeaking, speak, stop };
}
