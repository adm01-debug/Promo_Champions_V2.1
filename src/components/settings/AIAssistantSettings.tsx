import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useSalespersonPreferences } from '@/hooks/useSalespersonPreferences';
import { Bot, Sparkles, Save, Loader2 } from 'lucide-react';

const SUGGESTED_NAMES = [
  { name: 'Max', emoji: '🤖' },
  { name: 'Aria', emoji: '✨' },
  { name: 'Coach Alex', emoji: '🏆' },
  { name: 'Sales Guru', emoji: '🚀' },
  { name: 'Mentor Pro', emoji: '💡' },
  { name: 'Vendedor Virtual', emoji: '💼' },
];

export function AIAssistantSettings() {
  const { aiAssistantName, updatePreferences, isUpdating, isLoading } = useSalespersonPreferences();
  const [name, setName] = useState('');

  useEffect(() => {
    if (aiAssistantName) {
      setName(aiAssistantName);
    }
  }, [aiAssistantName]);

  const handleSave = () => {
    if (name.trim()) {
      updatePreferences({ ai_assistant_name: name.trim() });
    }
  };

  const handleSuggestionClick = (suggestedName: string) => {
    setName(suggestedName);
  };

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
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Personalizar Assistente IA
        </CardTitle>
        <CardDescription>
          Dê um nome personalizado para o seu assistente de vendas. 
          Ele usará esse nome quando conversar com você!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Name Display */}
        <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Nome atual</p>
            <p className="text-lg font-semibold">{aiAssistantName}</p>
          </div>
        </div>

        {/* Name Input */}
        <div className="space-y-2">
          <Label htmlFor="ai-name">Novo nome do assistente</Label>
          <div className="flex gap-2">
            <Input
              id="ai-name"
              placeholder="Digite o nome..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
            />
            <Button 
              onClick={handleSave} 
              disabled={isUpdating || !name.trim() || name === aiAssistantName}
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Suggestions */}
        <div className="space-y-2">
          <Label>Sugestões de nomes</Label>
          <div className="flex flex-wrap gap-2">
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

        {/* Privacy Notice */}
        <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
          <p className="flex items-center gap-1">
            <span>🔒</span>
            <strong>Privacidade:</strong> Seus dados de vendas são exclusivamente seus. 
            Outros vendedores não têm acesso às suas informações.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
