import { FC, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical,
  Reply,
  Heart,
  Pin,
  Trash2,
  Edit,
  AtSign
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  isPinned?: boolean;
  reactions?: { emoji: string; count: number }[];
  replyTo?: { id: string; authorName: string; preview: string };
}

interface ChatThreadProps {
  messages: Message[];
  onSend?: (message: string) => void;
  onReply?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onPin?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
}

export const ChatThread: FC<ChatThreadProps> = ({
  messages,
  onSend,
  onReply,
  onReact,
  onPin,
  onDelete
}) => {
  const [input, setInput] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend?.(input);
    setInput('');
    setReplyingTo(null);
  };

  return (
    <Card className="flex flex-col h-[500px]">
      <div className="p-4 border-b flex items-center gap-3">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Chat da Equipe</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="group">
            {message.replyTo && (
              <div className="ml-10 mb-1 text-xs text-muted-foreground flex items-center gap-1">
                <Reply className="h-3 w-3" />
                Respondendo a {message.replyTo.authorName}: {message.replyTo.preview}
              </div>
            )}
            
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={message.author.avatar} />
                <AvatarFallback>{message.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{message.author.name}</span>
                  <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                  {message.isPinned && (
                    <Pin className="h-3 w-3 text-primary" />
                  )}
                </div>
                
                <p className="text-sm mt-1">{message.content}</p>
                
                {message.reactions && message.reactions.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {message.reactions.map((reaction, i) => (
                      <button 
                        key={i}
                        className="px-2 py-0.5 bg-muted rounded-full text-xs hover:bg-muted/80"
                        onClick={() => onReact?.(message.id, reaction.emoji)}
                      >
                        {reaction.emoji} {reaction.count}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-start gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setReplyingTo(message)}>
                  <Reply className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onReact?.(message.id, '❤️')}>
                  <Heart className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onPin?.(message.id)}>
                  <Pin className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {replyingTo && (
        <div className="px-4 py-2 bg-muted/50 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Respondendo a {replyingTo.author.name}
          </span>
          <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>
            Cancelar
          </Button>
        </div>
      )}

      <div className="p-4 border-t flex gap-2">
        <Button variant="ghost" size="icon">
          <Paperclip className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <AtSign className="h-4 w-4" />
        </Button>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua mensagem..."
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1"
        />
        <Button variant="ghost" size="icon">
          <Smile className="h-4 w-4" />
        </Button>
        <Button onClick={handleSend}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  users: { id: string; name: string; avatar?: string }[];
  placeholder?: string;
}

export const MentionInput: FC<MentionInputProps> = ({
  value,
  onChange,
  users,
  placeholder
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filter, setFilter] = useState('');

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    const lastAtIndex = newValue.lastIndexOf('@');
    if (lastAtIndex !== -1 && lastAtIndex === newValue.length - 1) {
      setShowSuggestions(true);
      setFilter('');
    } else if (lastAtIndex !== -1) {
      const afterAt = newValue.slice(lastAtIndex + 1);
      if (!afterAt.includes(' ')) {
        setShowSuggestions(true);
        setFilter(afterAt.toLowerCase());
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(filter)
  );

  const selectUser = (user: { id: string; name: string }) => {
    const lastAtIndex = value.lastIndexOf('@');
    const newValue = value.slice(0, lastAtIndex) + `@${user.name} `;
    onChange(newValue);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={handleInput}
        placeholder={placeholder}
      />
      {showSuggestions && filteredUsers.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-popover border rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filteredUsers.map((user) => (
            <button
              key={user.id}
              className="w-full flex items-center gap-2 p-2 hover:bg-muted text-left"
              onClick={() => selectUser(user)}
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm">{user.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
