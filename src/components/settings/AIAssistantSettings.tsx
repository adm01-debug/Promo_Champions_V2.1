import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSalespersonPreferences, ResponseMode } from '@/hooks/sales/useSalespersonPreferences';
import { VoiceId } from '@/hooks/useElevenLabsVoice';
import { Bot, Sparkles, Save, Loader2, Volume2, MessageSquare, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SUGGESTED_NAMES = [
  { name: 'Max', emoji: '🤖' },
  { name: 'Aria', emoji: '✨' },
  { name: 'Coach Alex', emoji: '🏆' },
  { name: 'Sales Guru', emoji: '🚀' },
  { name: 'Mentor Pro', emoji: '💡' },
  { name: 'Vendedor Virtual', emoji: '💼' },
];

export function AIAssistantSettings() {
  const { 
    aiAssistantName, 
    responseMode: savedResponseMode,
    voiceId: savedVoiceId,
    voiceName: _savedVoiceName,
    updatePreferences, 
    isUpdating, 
    isLoading,
    VOICE_OPTIONS,
  } = useSalespersonPreferences();
  
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [responseMode, setResponseMode] = useState<ResponseMode>('text');
  const [voiceId, setVoiceId] = useState<string>('CwhRBWXzGAHq8TQ4Fs17');
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  useEffect(() => {
    if (aiAssistantName) setName(aiAssistantName);
    if (savedResponseMode) setResponseMode(savedResponseMode);
    if (savedVoiceId) setVoiceId(savedVoiceId as VoiceId);
  }, [aiAssistantName, savedResponseMode, savedVoiceId]);

  const handleSave = () => {
    const selectedVoice = VOICE_OPTIONS.find(v => v.id === voiceId);
    updatePreferences({ 
      ai_assistant_name: name.trim() || undefined,
      response_mode: responseMode,
      voice_id: voiceId,
      voice_name: selectedVoice?.name || 'Roger',
    });
  };

  const handleSuggestionClick = (suggestedName: string) => {
    setName(suggestedName);
  };

  const handleTestVoice = async () => {
    setIsTestingVoice(true);
    try {
      const testText = `Olá! Eu sou ${name || 'seu assistente'}. Estou aqui para ajudar você a vender mais!`;
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text: testText, voiceId }),
        }
      );

      const data = await response.json();
      
      if (data.error === 'api_key_not_configured') {
        toast({
          title: 'API não configurada',
          description: 'A chave do ElevenLabs ainda não foi configurada.',
          variant: 'destructive',
        });
        return;
      }

      if (data.audioContent) {
        const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
        const audio = new Audio(audioUrl);
        await audio.play();
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error testing voice:', error);
      }
      toast({
        title: 'Erro ao testar voz',
        description: 'Não foi possível reproduzir o áudio de teste.',
        variant: 'destructive',
      });
    } finally {
      setIsTestingVoice(false);
    }
  };

  const hasChanges = 
    name !== aiAssistantName || 
    responseMode !== savedResponseMode || 
    voiceId !== savedVoiceId;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="bg-gradient-to-br from-card/80 to-card/40 border border-border/20 shadow-2xl backdrop-blur-md rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-border/10">
        <h3 className="font-display font-black text-lg uppercase tracking-tighter italic flex items-center gap-3">
          <Bot className="h-5 w-5 text-primary" />
          Neural Link Interface
        </h3>
        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">
          Configure your tactical AI pilot companion
        </p>
      </div>
      <div className="p-6 space-y-6">

        {/* Current Assistant Display */}
        <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Seu assistente</p>
            <p className="text-lg font-semibold">{aiAssistantName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Modo de resposta</p>
            <p className="text-sm font-medium">
              {savedResponseMode === 'text' && '📝 Texto'}
              {savedResponseMode === 'audio' && '🔊 Áudio'}
              {savedResponseMode === 'both' && '📝🔊 Ambos'}
            </p>
          </div>
        </div>

        {/* Name Input */}
        <div className="space-y-2">
          <Label htmlFor="ai-name">Nome do assistente</Label>
          <Input
            id="ai-name"
            placeholder="Digite o nome..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={30}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {SUGGESTED_NAMES.map((suggestion) => (
              <Button
                key={suggestion.name}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(suggestion.name)}
                className="hover:bg-primary/10"
              >
                <span className="mr-1">{suggestion.emoji}</span>
                {suggestion.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Response Mode */}
        <div className="space-y-3">
          <Label>Como você prefere receber as respostas?</Label>
          <RadioGroup
            value={responseMode}
            onValueChange={(v) => setResponseMode(v as ResponseMode)}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            <div className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${responseMode === 'text' ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'}`}>
              <RadioGroupItem value="text" id="mode-text" />
              <Label htmlFor="mode-text" className="cursor-pointer flex items-center gap-2 flex-1">
                <MessageSquare className="h-4 w-4" />
                <div>
                  <p className="font-medium">Texto</p>
                  <p className="text-xs text-muted-foreground">Respostas escritas</p>
                </div>
              </Label>
            </div>
            <div className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${responseMode === 'audio' ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'}`}>
              <RadioGroupItem value="audio" id="mode-audio" />
              <Label htmlFor="mode-audio" className="cursor-pointer flex items-center gap-2 flex-1">
                <Volume2 className="h-4 w-4" />
                <div>
                  <p className="font-medium">Áudio</p>
                  <p className="text-xs text-muted-foreground">Apenas voz</p>
                </div>
              </Label>
            </div>
            <div className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${responseMode === 'both' ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'}`}>
              <RadioGroupItem value="both" id="mode-both" />
              <Label htmlFor="mode-both" className="cursor-pointer flex items-center gap-2 flex-1">
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4" />
                  <span className="mx-0.5">+</span>
                  <Volume2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Ambos</p>
                  <p className="text-xs text-muted-foreground">Texto + Áudio</p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Voice Selection */}
        {(responseMode === 'audio' || responseMode === 'both') && (
          <div className="space-y-3 animate-fade-in">
            <Label>Escolha a voz do seu assistente</Label>
            <div className="flex gap-2">
              <Select value={voiceId} onValueChange={(v) => setVoiceId(v as VoiceId)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione uma voz" />
                </SelectTrigger>
                <SelectContent>
                  {VOICE_OPTIONS.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      <div className="flex items-center gap-2">
                        <span>{voice.gender === 'male' ? '👨' : '👩'}</span>
                        <span>{voice.name}</span>
                        <span className="text-muted-foreground text-xs">({voice.gender})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="icon"
                aria-label="Testar voz"
                onClick={handleTestVoice}
                disabled={isTestingVoice}
                title="Testar voz"
              >
                {isTestingVoice ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Clique no botão ▶ para ouvir uma prévia da voz selecionada
            </p>
          </div>
        )}

        {/* Save Button */}
        <Button 
          onClick={handleSave} 
          disabled={isUpdating || !hasChanges}
          className="w-full"
        >
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Salvar Preferências
        </Button>

        {/* Privacy Notice */}
        <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
          <p className="flex items-center gap-1">
            <span>🔒</span>
            <strong>Privacidade:</strong> Seus dados de vendas são exclusivamente seus. 
            Outros vendedores não têm acesso às suas informações.
          </p>
        </div>
      </div>
    </div>

  );
}
