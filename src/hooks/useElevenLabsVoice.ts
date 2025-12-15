import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type VoiceId = 
  | 'CwhRBWXzGAHq8TQ4Fs17'  // Roger
  | 'EXAVITQu4vr4xnSDxMaL'  // Sarah
  | 'FGY2WhTYpPnrIDTdsKH5'  // Laura
  | 'IKne3meq5aSn9XLyUdCD'  // Charlie
  | 'JBFqnCBsd6RMkjVDRZzb'  // George
  | 'TX3LPaxmHKxFdv7VOQHJ'  // Liam
  | 'onwK4e9ZLuTAKqWW03F9'; // Daniel

export const VOICE_OPTIONS = [
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', gender: 'Masculino' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', gender: 'Feminino' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', gender: 'Feminino' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', gender: 'Masculino' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', gender: 'Masculino' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', gender: 'Masculino' },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', gender: 'Masculino' },
] as const;

interface UseElevenLabsVoiceOptions {
  defaultVoiceId?: VoiceId;
  onSpeakStart?: () => void;
  onSpeakEnd?: () => void;
  onError?: (error: string) => void;
}

interface UseElevenLabsVoiceReturn {
  // TTS
  speak: (text: string) => Promise<void>;
  stopSpeaking: () => void;
  isSpeaking: boolean;
  isLoadingTTS: boolean;
  
  // STT
  startListening: () => Promise<void>;
  stopListening: () => void;
  isListening: boolean;
  isProcessingSTT: boolean;
  transcript: string;
  
  // Settings
  voiceId: VoiceId;
  setVoiceId: (id: VoiceId) => void;
  isApiConfigured: boolean;
  
  // Fallback to browser TTS/STT
  useBrowserFallback: boolean;
  setUseBrowserFallback: (value: boolean) => void;
}

export function useElevenLabsVoice(options: UseElevenLabsVoiceOptions = {}): UseElevenLabsVoiceReturn {
  const { 
    defaultVoiceId = 'CwhRBWXzGAHq8TQ4Fs17',
    onSpeakStart,
    onSpeakEnd,
    onError 
  } = options;
  
  const { toast } = useToast();
  
  // State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingTTS, setIsLoadingTTS] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessingSTT, setIsProcessingSTT] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceId, setVoiceId] = useState<VoiceId>(defaultVoiceId);
  const [isApiConfigured, setIsApiConfigured] = useState(true);
  const [useBrowserFallback, setUseBrowserFallback] = useState(false);
  
  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Browser Speech Recognition fallback
  const SpeechRecognition = typeof window !== 'undefined' 
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition 
    : null;
  const recognitionRef = useRef<any>(null);

  // TTS with ElevenLabs
  const speakWithElevenLabs = useCallback(async (text: string) => {
    if (!text.trim()) return;
    
    setIsLoadingTTS(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('elevenlabs-tts', {
        body: { text, voiceId }
      });
      
      if (error) throw error;
      
      if (data?.error === 'api_key_not_configured') {
        setIsApiConfigured(false);
        setUseBrowserFallback(true);
        throw new Error('API key not configured');
      }
      
      if (!data?.audioContent) {
        throw new Error('No audio content received');
      }
      
      // Create audio from base64
      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
        { type: 'audio/mpeg' }
      );
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Play audio
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onplay = () => {
        setIsSpeaking(true);
        onSpeakStart?.();
      };
      
      audio.onended = () => {
        setIsSpeaking(false);
        onSpeakEnd?.();
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setIsSpeaking(false);
        onError?.('Erro ao reproduzir áudio');
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
      
    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      const message = error instanceof Error ? error.message : 'Erro ao gerar voz';
      onError?.(message);
      
      // Fallback to browser TTS
      if (useBrowserFallback || !isApiConfigured) {
        speakWithBrowser(text);
      }
    } finally {
      setIsLoadingTTS(false);
    }
  }, [voiceId, onSpeakStart, onSpeakEnd, onError, useBrowserFallback, isApiConfigured]);

  // Browser TTS fallback
  const speakWithBrowser = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      toast({
        title: 'Navegador não suportado',
        description: 'Seu navegador não suporta síntese de voz.',
        variant: 'destructive',
      });
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang.startsWith('pt')) || voices[0];
    if (ptVoice) utterance.voice = ptVoice;

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
    };

    window.speechSynthesis.speak(utterance);
  }, [toast, onSpeakStart, onSpeakEnd]);

  // Main speak function
  const speak = useCallback(async (text: string) => {
    if (useBrowserFallback || !isApiConfigured) {
      speakWithBrowser(text);
    } else {
      await speakWithElevenLabs(text);
    }
  }, [useBrowserFallback, isApiConfigured, speakWithBrowser, speakWithElevenLabs]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  // STT with ElevenLabs
  const processAudioWithElevenLabs = useCallback(async (audioBlob: Blob) => {
    setIsProcessingSTT(true);
    
    try {
      // Convert blob to base64
      const buffer = await audioBlob.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      
      const { data, error } = await supabase.functions.invoke('elevenlabs-stt', {
        body: { audio: base64 }
      });
      
      if (error) throw error;
      
      if (data?.error === 'api_key_not_configured') {
        setIsApiConfigured(false);
        setUseBrowserFallback(true);
        throw new Error('API key not configured');
      }
      
      if (data?.text) {
        setTranscript(data.text);
      }
      
    } catch (error) {
      console.error('ElevenLabs STT error:', error);
      onError?.('Erro ao processar áudio');
    } finally {
      setIsProcessingSTT(false);
    }
  }, [onError]);

  // Start listening with ElevenLabs or browser fallback
  const startListening = useCallback(async () => {
    if (useBrowserFallback || !isApiConfigured) {
      // Browser fallback
      if (!SpeechRecognition) {
        toast({
          title: 'Navegador não suportado',
          description: 'Use Chrome, Edge ou Safari para entrada de voz.',
          variant: 'destructive',
        });
        return;
      }

      if (!recognitionRef.current) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'pt-BR';

        recognition.onresult = (event: any) => {
          const result = Array.from(event.results)
            .map((r: any) => r[0].transcript)
            .join('');
          setTranscript(result);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            toast({
              title: 'Microfone bloqueado',
              description: 'Permita o acesso ao microfone nas configurações.',
              variant: 'destructive',
            });
          }
        };

        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
      }

      try {
        recognitionRef.current.start();
        setIsListening(true);
        setTranscript('');
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
      
      return;
    }

    // ElevenLabs STT with MediaRecorder
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        
        if (audioBlob.size > 0) {
          await processAudioWithElevenLabs(audioBlob);
        }
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsListening(true);
      setTranscript('');
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: 'Erro no microfone',
        description: 'Não foi possível acessar o microfone.',
        variant: 'destructive',
      });
    }
  }, [useBrowserFallback, isApiConfigured, SpeechRecognition, toast, processAudioWithElevenLabs]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    setIsListening(false);
  }, []);

  return {
    // TTS
    speak,
    stopSpeaking,
    isSpeaking,
    isLoadingTTS,
    
    // STT
    startListening,
    stopListening,
    isListening,
    isProcessingSTT,
    transcript,
    
    // Settings
    voiceId,
    setVoiceId,
    isApiConfigured,
    
    // Fallback
    useBrowserFallback,
    setUseBrowserFallback,
  };
}
