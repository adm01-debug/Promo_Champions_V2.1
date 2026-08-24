import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send } from 'lucide-react';
import { QuestionType, QUESTION_TYPES } from '@/hooks/useDealChatHistory';
import { VoiceControls } from './VoiceControls';
import { detectQuestionType } from './constants';

interface ChatInputAreaProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  onSend: (overrideType?: QuestionType) => void;
  selectedQuestionType: QuestionType | 'auto';
  setSelectedQuestionType: (type: QuestionType | 'auto') => void;
  hasDealContext: boolean;
  selectedSalesperson: string | null;
  selectedPersonName?: string;
  isListening: boolean;
  onToggleListening: () => void;
  isProcessingSTT: boolean;
  responseMode: 'text' | 'audio' | 'both';
  isApiConfigured: boolean;
}

export function ChatInputArea({
  input,
  setInput,
  isLoading,
  onSend,
  selectedQuestionType,
  setSelectedQuestionType,
  hasDealContext,
  selectedSalesperson,
  selectedPersonName,
  isListening,
  onToggleListening,
  isProcessingSTT,
  responseMode,
  isApiConfigured,
}: ChatInputAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="p-4 border-t border-border/50 bg-background/50">
      {hasDealContext && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Tipo:</span>
          <div className="flex gap-1 flex-wrap">
            <Badge
              variant={selectedQuestionType === 'auto' ? 'default' : 'outline'}
              className="cursor-pointer text-[10px] px-2 py-0.5"
              onClick={() => setSelectedQuestionType('auto')}
            >
              ✨ Auto
            </Badge>
            {QUESTION_TYPES.map((type) => (
              <Badge
                key={type.value}
                variant={selectedQuestionType === type.value ? 'default' : 'outline'}
                className="cursor-pointer text-[10px] px-2 py-0.5"
                onClick={() => setSelectedQuestionType(type.value)}
              >
                {type.label}
              </Badge>
            ))}
          </div>
          {selectedQuestionType === 'auto' && input.trim() && (
            <span className="text-[10px] text-muted-foreground">
              → {QUESTION_TYPES.find(t => t.value === detectQuestionType(input))?.label || 'Geral'}
            </span>
          )}
        </div>
      )}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua pergunta..."
            className="min-h-[44px] max-h-[120px] resize-none pr-20"
            rows={1}
          />
          <div className="absolute right-2 bottom-2">
            <VoiceControls
              isListening={isListening}
              onToggleListening={onToggleListening}
              isProcessingSTT={isProcessingSTT}
              responseMode={responseMode}
              isApiConfigured={isApiConfigured}
            />
          </div>
        </div>
        <Button onClick={() => onSend()} disabled={!input.trim() || isLoading} className="shrink-0">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground mt-2 text-center">
        {selectedSalesperson
          ? `Respostas personalizadas para ${selectedPersonName}`
          : 'Selecione um vendedor para respostas personalizadas'}
      </p>
    </div>
  );
}
