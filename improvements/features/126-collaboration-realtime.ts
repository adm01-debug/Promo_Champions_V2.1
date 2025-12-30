// Melhoria 126 - Collaboration Real-time

import { createClient } from '@supabase/supabase-js';

interface OnlineUser {
  user_id: string;
  user_name: string;
  avatar_url?: string;
  cursor_position?: { x: number; y: number };
  current_page?: string;
}

class CollaborationManager {
  private channel: any;
  private onlineUsers: Map<string, OnlineUser> = new Map();

  async initialize(userId: string, userName: string) {
    this.channel = supabase.channel('collaboration');

    // Broadcast presence
    this.channel
      .on('presence', { event: 'sync' }, () => {
        const state = this.channel.presenceState();
        this.onlineUsers.clear();
        
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: OnlineUser) => {
            this.onlineUsers.set(presence.user_id, presence);
          });
        });
      })
      .on('broadcast', { event: 'cursor-move' }, ({ payload }) => {
        this.updateCursor(payload.user_id, payload.position);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await this.channel.track({
            user_id: userId,
            user_name: userName,
            online_at: new Date().toISOString(),
          });
        }
      });
  }

  broadcastCursorPosition(x: number, y: number) {
    this.channel.send({
      type: 'broadcast',
      event: 'cursor-move',
      payload: { position: { x, y } },
    });
  }

  broadcastEdit(elementId: string, content: string) {
    this.channel.send({
      type: 'broadcast',
      event: 'edit',
      payload: { elementId, content },
    });
  }

  getOnlineUsers(): OnlineUser[] {
    return Array.from(this.onlineUsers.values());
  }

  private updateCursor(userId: string, position: { x: number; y: number }) {
    const user = this.onlineUsers.get(userId);
    if (user) {
      user.cursor_position = position;
      this.renderCursor(userId, position);
    }
  }

  private renderCursor(userId: string, position: { x: number; y: number }) {
    let cursor = document.getElementById(`cursor-${userId}`);
    
    if (!cursor) {
      cursor = document.createElement('div');
      cursor.id = `cursor-${userId}`;
      cursor.className = 'remote-cursor';
      document.body.appendChild(cursor);
    }

    cursor.style.left = `${position.x}px`;
    cursor.style.top = `${position.y}px`;
  }
}

export const collaboration = new CollaborationManager();
