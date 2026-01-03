import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Mic,
  MicOff,
  Volume2,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceControlsProps {
  // STT state
  isListening: boolean;
  onToggleListening: () => void;
  isProcessingSTT: boolean;
  
  // TTS state for manual playback
  isSpeaking?: boolean;
  isLoadingTTS?: boolean;
  onManualSpeak?: () => void;
  showSpeakButton?: boolean;
  
  // Status
  isApiConfigured?: boolean;
  responseMode?: 'text' | 'audio' | 'both';
  
  className?: string;
}

export function VoiceControls({
  isListening,
  onToggleListening,
  isProcessingSTT,
  isSpeaking,
  isLoadingTTS,
  onManualSpeak,
  showSpeakButton,
  isApiConfigured,
  responseMode = 'text',
  className,
}: VoiceControlsProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {/* Voice Input Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-7 w-7 transition-colors',
                isListening && 'text-destructive bg-destructive/10 animate-pulse',
                isProcessingSTT && 'opacity-50'
              )}
              onClick={onToggleListening}
              disabled={isProcessingSTT}
            >
              {isProcessingSTT ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isListening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{isListening ? 'Parar gravação' : 'Falar pergunta'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Manual Speak Button (only show when there's content to speak) */}
      {showSpeakButton && onManualSpeak && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-7 w-7 transition-colors',
                  isSpeaking && 'text-primary bg-primary/10 animate-pulse'
                )}
                onClick={onManualSpeak}
                disabled={isLoadingTTS}
              >
                {isLoadingTTS ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{isSpeaking ? 'Parar' : 'Ouvir resposta'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Response mode indicator */}
      {responseMode !== 'text' && (
        <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 h-5">
          {responseMode === 'audio' ? '🔊' : '📝🔊'}
        </Badge>
      )}
    </div>
  );
}
