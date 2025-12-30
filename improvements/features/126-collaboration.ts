// Melhoria 126 - Real-time Collaboration
export const useCollaboration = (dealId: string) => {
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [cursors, setCursors] = useState<Record<string, {x: number; y: number}>>({});

  useEffect(() => {
    const channel = supabase.channel(`deal:${dealId}`);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setActiveUsers(Object.keys(state));
      })
      .on('broadcast', { event: 'cursor' }, ({ payload }) => {
        setCursors(prev => ({ ...prev, [payload.userId]: payload.position }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dealId]);

  const updateCursor = (x: number, y: number) => {
    channel.send({
      type: 'broadcast',
      event: 'cursor',
      payload: { userId: user.id, position: { x, y } }
    });
  };

  return { activeUsers, cursors, updateCursor };
};
