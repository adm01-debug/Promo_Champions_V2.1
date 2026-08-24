import React, { FC, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Send, Loader2 } from 'lucide-react';

interface PostVictoryFormProps {
  salespersonId: string;
  onPost: (data: { event_type: string; title: string; description?: string; value?: number }) => void;
  isPosting: boolean;
}

export const PostVictoryForm: FC<PostVictoryFormProps> = React.memo(({ onPost, isPosting }) => {
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('sale');
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) return;
    onPost({
      event_type: eventType,
      title: title.trim(),
      value: value ? Number(value) : undefined,
    });
    setTitle('');
    setValue('');
  };

  return (
    <Card className="border-none shadow-md bg-gradient-to-r from-primary/5 to-accent/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Compartilhar Vitória</span>
        </div>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger className="w-32 h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sale">🏆 Venda</SelectItem>
                <SelectItem value="achievement">⭐ Conquista</SelectItem>
                <SelectItem value="record">🚀 Recorde</SelectItem>
                <SelectItem value="streak">🔥 Sequência</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="O que você conquistou?"
              className="h-9 text-sm flex-1"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="Valor (R$)"
              className="h-9 text-sm w-32"
            />
            <Button size="sm" className="h-9 ml-auto" onClick={handleSubmit} disabled={!title.trim() || isPosting}>
              {isPosting ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Send className="h-3 w-3 mr-1" />}
              Publicar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

PostVictoryForm.displayName = 'PostVictoryForm';
