import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Available ElevenLabs voices
export const VOICE_OPTIONS = [
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', description: 'Voz masculina profunda e profissional', gender: 'male' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', description: 'Voz masculina clara e amigável', gender: 'male' },
  { id: 'ThT5KcBeYPX3keUQqHPh', name: 'Dorothy', description: 'Voz feminina suave e acolhedora', gender: 'female' },
  { id: 'jsCqWAovK2LkecY7zXl4', name: 'Freya', description: 'Voz feminina energética', gender: 'female' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', description: 'Voz masculina jovem e dinâmica', gender: 'male' },
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', description: 'Voz feminina profissional', gender: 'female' },
] as const;

export type VoiceId = typeof VOICE_OPTIONS[number]['id'];

interface UseElevenLabsVoiceOptions {
  defaultVoiceId?: string;
  onSpeakStart?: () => void;
  onSpeakEnd?: () => void;
  onError?: (error: string) => void;
}

export function useElevenLabsVoice(options: UseElevenLabsVoiceOptions = {}) {
  const {
    defaultVoiceId = VOICE_OPTIONS[0].id,
    onSpeakStart,
    onSpeakEnd,
    onError,
  } = options;

  const [voiceId, setVoiceId] = useState<string>(defaultVoiceId);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingTTS, setIsLoadingTTS] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessingSTT, _setIsProcessingSTT] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [useBrowserFallback, setUseBrowserFallback] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Check if ElevenLabs API is configured (we'll assume it is for now)
  const isApiConfigured = true;

  // Browser fallback TTS
  const speakWithBrowserTTS = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      utterance.onstart = () => {
        setIsSpeaking(true);
        onSpeakStart?.();
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        onSpeakEnd?.();
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
        onError?.('Erro ao sintetizar voz');
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      onError?.('Síntese de voz não suportada neste navegador');
    }
  }, [onSpeakStart, onSpeakEnd, onError]);

  // Main speak function
  const speak = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // Use browser fallback if enabled
    if (useBrowserFallback) {
      speakWithBrowserTTS(text);
      return;
    }

    setIsLoadingTTS(true);
    
    try {
      // Use ElevenLabs via edge function
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-voice`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ text, voiceId }),
      });

      if (!response.ok) {
        // Fallback to browser TTS
        speakWithBrowserTTS(text);
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
      
      audioRef.current = new Audio(audioUrl);
      
      audioRef.current.onplay = () => {
        setIsSpeaking(true);
        onSpeakStart?.();
      };
      
      audioRef.current.onended = () => {
        setIsSpeaking(false);
        onSpeakEnd?.();
        URL.revokeObjectURL(audioUrl);
      };
      
      audioRef.current.onerror = () => {
        setIsSpeaking(false);
        onError?.('Erro ao reproduzir áudio');
        // Fallback to browser TTS
        speakWithBrowserTTS(text);
      };
      
      await audioRef.current.play();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('TTS error:', error);
      }
      // Fallback to browser TTS
      speakWithBrowserTTS(text);
    } finally {
      setIsLoadingTTS(false);
    }
  }, [voiceId, useBrowserFallback, speakWithBrowserTTS, onSpeakStart, onSpeakEnd, onError]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    onSpeakEnd?.();
  }, [onSpeakEnd]);

  // Browser Speech Recognition
  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      onError?.('Reconhecimento de voz não suportado neste navegador');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event: Event & { results: SpeechRecognitionResultList }) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
    };

    recognition.onerror = (event: Event & { error: string }) => {
      if (import.meta.env.DEV) {
        console.error('Speech recognition error:', event.error);
      }
      setIsListening(false);
      if (event.error !== 'no-speech') {
        onError?.('Erro no reconhecimento de voz');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [onError]);

  // Stop listening
  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      stopListening();
    };
  }, [stopSpeaking, stopListening]);

  return {
    // TTS
    speak,
    stopSpeaking,
    isSpeaking,
    isLoadingTTS,
    voiceId,
    setVoiceId,
    
    // STT
    startListening,
    stopListening,
    isListening,
    isProcessingSTT,
    transcript,
    
    // Config
    isApiConfigured,
    useBrowserFallback,
    setUseBrowserFallback,
    
    // Voice options
    VOICE_OPTIONS,
  };
}

// Re-export for backwards compatibility
export default useElevenLabsVoice;

// Type declarations for browser APIs
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: any;
  }
}
