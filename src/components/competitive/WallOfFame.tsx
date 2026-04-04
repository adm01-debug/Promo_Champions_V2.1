import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, Pin, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useKudos } from '@/hooks/useKudos';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface WallOfFameProps {
  salespersonId?: string;
}

export const WallOfFame: FC<WallOfFameProps> = ({ salespersonId }) => {
  const { kudos, isLoading, sendKudos, KUDOS_TYPES } = useKudos();
  const [toId, setToId] = useState('');
  const [message, setMessage] = useState('');
  const [kudosType, setKudosType] = useState('recognition');
  const [showForm, setShowForm] = useState(false);

  const { data: salespeople } = useQuery({
    queryKey: ['salespeople-list'],
    queryFn: async () => {
      const { data } = await supabase.rpc('get_active_salespeople');
      return data || [];
    },
  });

  const handleSend = () => {
    if (!salespersonId || !toId || !message.trim()) return;
    sendKudos.mutate(
      { fromId: salespersonId, toId, message: message.trim(), type: kudosType },
      {
        onSuccess: () => { setMessage(''); setToId(''); setShowForm(false); toast.success('Kudos enviado! 🌟'); },
        onError: () => toast.error('Erro ao enviar kudos'),
      }
    );
  };

  if (isLoading) {
    return <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-muted/30 animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border-none shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-rank-gold/10 via-yellow-500/5 to-rank-gold/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-rank-gold to-yellow-600 flex items-center justify-center">
                  <Star className="h-4 w-4 text-white" />
                </div>
                Wall of Fame
              </CardTitle>
              {salespersonId && (
                <Button size="sm" className="h-7 text-xs gap-1" onClick={() => setShowForm(!showForm)}>
                  <Heart className="h-3 w-3" />
                  Dar Kudos
                </Button>
              )}
            </div>
          </CardHeader>
        </div>
      </Card>

      {/* Send Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <Card className="border-primary/20">
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Select value={toId} onValueChange={setToId}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Para quem?" /></SelectTrigger>
                    <SelectContent>
                      {(salespeople || []).filter(sp => sp.id !== salespersonId).map(sp => (
                        <SelectItem key={sp.id} value={sp.id}>{sp.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={kudosType} onValueChange={setKudosType}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(KUDOS_TYPES).map(([key, { label, emoji }]) => (
                        <SelectItem key={key} value={key}>{emoji} {label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Escreva uma mensagem de reconhecimento..." className="text-sm min-h-[60px]" />
                <Button size="sm" className="w-full h-8 text-xs gap-1" onClick={handleSend} disabled={!toId || !message.trim() || sendKudos.isPending}>
                  <Send className="h-3 w-3" /> Enviar Kudos
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kudos Feed */}
      {kudos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Star className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium">Nenhum kudos ainda</p>
            <p className="text-xs text-muted-foreground mt-1">Seja o primeiro a reconhecer um colega!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {kudos.map((k, i) => {
            const typeInfo = KUDOS_TYPES[k.kudos_type] || KUDOS_TYPES.recognition;
            return (
              <motion.div key={k.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className={cn('border-none shadow-sm', k.is_pinned && 'ring-1 ring-rank-gold/30 bg-rank-gold/5')}>
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarImage src={k.from_avatar || undefined} />
                        <AvatarFallback className="text-xs">{k.from_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-foreground">{k.from_name}</span>
                          <span className="text-xs text-muted-foreground">→</span>
                          <span className="text-sm font-bold text-primary">{k.to_name}</span>
                          <Badge variant="outline" className="text-[10px] h-4">{typeInfo.emoji} {typeInfo.label}</Badge>
                          {k.is_pinned && <Pin className="h-3 w-3 text-rank-gold" />}
                        </div>
                        <p className="text-sm text-foreground mt-1">{k.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(k.created_at), { addSuffix: true, locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
