import { supabase } from '@/integrations/supabase/client';

export class CollaborationManager {
  private channel: any;

  async joinRoom(roomId: string, userId: string) {
    this.channel = supabase.channel(roomId);
    
    this.channel
      .on('presence', { event: 'sync' }, () => {
        const state = this.channel.presenceState();
        console.log('Presence state:', state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }: any) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }: any) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          await this.channel.track({ user_id: userId, online_at: new Date().toISOString() });
        }
      });
  }

  async sendMessage(message: any) {
    if (!this.channel) return;
    await this.channel.send({
      type: 'broadcast',
      event: 'message',
      payload: message,
    });
  }

  onMessage(callback: (message: any) => void) {
    if (!this.channel) return;
    this.channel.on('broadcast', { event: 'message' }, ({ payload }: any) => {
      callback(payload);
    });
  }

  async leave() {
    if (!this.channel) return;
    await this.channel.unsubscribe();
  }
}
