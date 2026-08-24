import { useState } from 'react';
import { Phone, PhoneOff, Settings2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  useInitiateCall,
  useCallSession,
  useTwilioCredentialsCheck,
} from '@/hooks/dialer/useClickToCall';
import { CallStatusBadge } from './CallStatusBadge';

interface Props {
  toNumber: string | null | undefined;
  saleId?: string;
  queueItemId?: string;
  size?: 'sm' | 'default';
  variant?: 'default' | 'outline' | 'secondary';
}

export const ClickToCallButton = ({
  toNumber,
  saleId,
  queueItemId,
  size = 'default',
  variant = 'default',
}: Props) => {
  const [callSid, setCallSid] = useState<string | null>(null);
  const { data: check } = useTwilioCredentialsCheck();
  const initiate = useInitiateCall();
  const { data: session } = useCallSession(callSid);

  const status = session?.status;
  const isLive = !!status && ['initiated', 'ringing', 'in-progress'].includes(status);
  const isFinished = !!status && !isLive;

  const handleClick = async () => {
    if (!toNumber) {
      toast.error('Número de telefone ausente');
      return;
    }
    if (!check?.configured) {
      toast.error('Twilio não configurado', {
        action: {
          label: 'Configurar',
          onClick: () => window.location.assign('/multichannel'),
        },
      });
      return;
    }
    const res = await initiate.mutateAsync({
      to_number: toNumber,
      sale_id: saleId,
      queue_item_id: queueItemId,
    });
    setCallSid(res.call_sid);
  };

  const reset = () => setCallSid(null);

  if (!check?.configured) {
    return (
      <Button asChild size={size} variant="outline">
        <Link to="/multichannel">
          <Settings2 className="h-4 w-4 mr-2" /> Configurar Twilio
        </Link>
      </Button>
    );
  }

  if (callSid && status) {
    return (
      <div className="flex items-center gap-2">
        <CallStatusBadge status={status} />
        {session?.duration_seconds != null && session.duration_seconds > 0 && (
          <span className="text-xs font-mono text-muted-foreground">
            {Math.floor(session.duration_seconds / 60)
              .toString()
              .padStart(2, '0')}
            :{(session.duration_seconds % 60).toString().padStart(2, '0')}
          </span>
        )}
        {isFinished && (
          <Button size="sm" variant="ghost" onClick={reset}>
            Nova
          </Button>
        )}
      </div>
    );
  }

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleClick}
      disabled={initiate.isPending || !toNumber}
    >
      {isLive ? <PhoneOff className="h-4 w-4 mr-2" /> : <Phone className="h-4 w-4 mr-2" />}
      {initiate.isPending ? 'Discando…' : 'Ligar'}
    </Button>
  );
};
