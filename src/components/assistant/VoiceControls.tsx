import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Settings2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { VOICE_OPTIONS, VoiceId } from '@/hooks/useElevenLabsVoice';

interface VoiceControlsProps {
  // TTS state
  isTTSEnabled: boolean;
  onToggleTTS: () => void;
  isSpeaking: boolean;
  isLoadingTTS: boolean;
  
  // STT state
  isListening: boolean;
  onToggleListening: () => void;
  isProcessingSTT: boolean;
  
  // Settings
  voiceId: VoiceId;
  onVoiceChange: (id: VoiceId) => void;
  isApiConfigured: boolean;
  useBrowserFallback: boolean;
  onFallbackChange: (value: boolean) => void;
  
  className?: string;
}

export function VoiceControls({
  isTTSEnabled,
  onToggleTTS,
  isSpeaking,
  isLoadingTTS,
  isListening,
  onToggleListening,
  isProcessingSTT,
  voiceId,
  onVoiceChange,
  isApiConfigured,
  useBrowserFallback,
  onFallbackChange,
  className,
}: VoiceControlsProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {/* Voice Input Button */}
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
        title={isListening ? 'Parar gravação' : 'Entrada por voz'}
      >
        {isProcessingSTT ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isListening ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>

      {/* TTS Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'h-7 w-7 transition-colors',
          isTTSEnabled && 'text-primary bg-primary/10',
          isSpeaking && 'animate-pulse'
        )}
        onClick={onToggleTTS}
        disabled={isLoadingTTS}
        title={isTTSEnabled ? 'Desativar leitura' : 'Ativar leitura em voz alta'}
      >
        {isLoadingTTS ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isTTSEnabled ? (
          <Volume2 className="h-4 w-4" />
        ) : (
          <VolumeX className="h-4 w-4" />
        )}
      </Button>

      {/* Voice Settings Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            title="Configurações de voz"
          >
            <Settings2 className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Configurações de Voz</h4>
              {!isApiConfigured && (
                <Badge variant="outline" className="text-amber-500 border-amber-500/50">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Sem API
                </Badge>
              )}
            </div>

            {/* Voice Selection */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Voz ElevenLabs</Label>
              <Select 
                value={voiceId} 
                onValueChange={(v) => onVoiceChange(v as VoiceId)}
                disabled={useBrowserFallback}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VOICE_OPTIONS.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      <div className="flex items-center gap-2">
                        <span>{voice.name}</span>
                        <Badge variant="secondary" className="text-[10px] px-1 py-0">
                          {voice.gender}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Browser Fallback Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Usar voz do navegador</Label>
                <p className="text-[10px] text-muted-foreground">
                  Quando ElevenLabs não disponível
                </p>
              </div>
              <Switch
                checked={useBrowserFallback}
                onCheckedChange={onFallbackChange}
              />
            </div>

            {/* API Status */}
            <div className="pt-2 border-t border-border/50">
              <div className="flex items-center gap-2 text-xs">
                <div className={cn(
                  'h-2 w-2 rounded-full',
                  isApiConfigured ? 'bg-emerald-500' : 'bg-amber-500'
                )} />
                <span className="text-muted-foreground">
                  {isApiConfigured 
                    ? 'ElevenLabs conectado' 
                    : 'Aguardando API key'}
                </span>
              </div>
              {!isApiConfigured && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  Adicione ELEVENLABS_API_KEY nos secrets para usar vozes premium
                </p>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
