import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Bot, Loader2, User, Volume2 } from 'lucide-react';
import { ChatMessage } from '@/hooks/sales/useSalesAssistant';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: ChatMessage;
  salespersonAvatar?: string;
  aiName?: string;
  showAudioButton?: boolean;
  onPlayAudio?: (text: string) => void;
  isSpeaking?: boolean;
  isLoadingTTS?: boolean;
}

export function MessageBubble({
  message,
  salespersonAvatar,
  showAudioButton,
  onPlayAudio,
  isSpeaking,
  isLoadingTTS,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3 animate-fade-in', isUser ? 'flex-row-reverse' : '')}>
      <Avatar className="h-8 w-8 shrink-0">
        {isUser ? (
          <>
            <AvatarImage src={salespersonAvatar || ''} />
            <AvatarFallback className="bg-primary/20">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </>
        ) : (
          <AvatarFallback className="bg-gradient-to-br from-primary to-accent">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </AvatarFallback>
        )}
      </Avatar>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted/50 border border-border/50 rounded-bl-md'
        )}
      >
        <div className="whitespace-pre-wrap">{message.content || '...'}</div>
        <div className={cn('flex items-center gap-2 mt-1', isUser ? 'justify-end' : 'justify-between')}>
          <span className={cn('text-[10px] opacity-60')}>
            {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
          {!isUser && showAudioButton && message.content && (
            <Button
              variant="ghost"
              size="icon"
              aria-label={isSpeaking ? "Parar áudio" : "Ouvir mensagem"}
              className={cn(
                'h-5 w-5 opacity-60 hover:opacity-100 transition-opacity',
                isSpeaking && 'text-primary opacity-100'
              )}
              onClick={() => onPlayAudio?.(message.content)}
              disabled={isLoadingTTS}
            >
              {isLoadingTTS ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Volume2 className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
