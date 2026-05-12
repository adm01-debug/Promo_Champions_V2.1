import { describe, it, expect } from 'vitest';

/**
 * Sale Notification Elite System Tests
 * Tests the logic for competitive alerts, ranking photography, and notification filtering.
 */

describe('Competitive Message Formatting', () => {
  const formatSaleNotification = (
    sellerName: string,
    amount: number,
    sellerRank: number,
    recipientRank: number
  ) => {
    const amountStr = amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const rankDiff = recipientRank - sellerRank;
    
    let message = `${sellerName} acaba de fechar uma venda de ${amountStr}! `;
    message += `Ele está na ${sellerRank}ª posição. `;
    
    if (sellerRank < recipientRank) {
      message += `Cuidado! Ele está ${rankDiff} posição(ões) à sua frente! 🚀`;
    } else if (sellerRank > recipientRank) {
      message += `Você ainda está ${sellerRank - recipientRank} posição(ões) à frente dele. Continue assim! 🔥`;
    } else {
      message += `Vocês estão empatados no ranking! Quem vai desempatar primeiro? ⚡`;
    }
    
    return message;
  };

  it('should format message correctly when seller is ahead of recipient', () => {
    const msg = formatSaleNotification('João', 5000, 2, 5);
    expect(msg).toContain('João');
    // Using a more flexible check for currency due to different space characters in toLocaleString
    expect(msg).toMatch(/R\$.*5\.000,00/);
    expect(msg).toContain('2ª posição');
    expect(msg).toContain('3 posição(ões) à sua frente');
  });

  it('should format message correctly when recipient is ahead of seller', () => {
    const msg = formatSaleNotification('Maria', 10000, 10, 3);
    expect(msg).toContain('10ª posição');
    expect(msg).toContain('7 posição(ões) à frente dele');
  });

  it('should format message correctly for a tie', () => {
    const msg = formatSaleNotification('Pedro', 2500, 1, 1);
    expect(msg).toContain('empatados');
  });
});

describe('Notification Filtering Logic', () => {
  interface Notification {
    id: string;
    category: string;
    read_at: string | null;
  }

  const filterNotifications = (
    notifications: Notification[],
    category?: string,
    unreadOnly?: boolean
  ) => {
    return notifications.filter(n => {
      if (category && n.category !== category) return false;
      if (unreadOnly && n.read_at !== null) return false;
      return true;
    });
  };

  const mockNotifications: Notification[] = [
    { id: '1', category: 'sales', read_at: null },
    { id: '2', category: 'sales', read_at: '2024-01-01' },
    { id: '3', category: 'gamification', read_at: null },
    { id: '4', category: 'system', read_at: null },
  ];

  it('should filter by category', () => {
    const filtered = filterNotifications(mockNotifications, 'sales');
    expect(filtered).toHaveLength(2);
    expect(filtered.every(n => n.category === 'sales')).toBe(true);
  });

  it('should filter unread only', () => {
    const filtered = filterNotifications(mockNotifications, undefined, true);
    expect(filtered).toHaveLength(3);
    expect(filtered.every(n => n.read_at === null)).toBe(true);
  });

  it('should combine filters', () => {
    const filtered = filterNotifications(mockNotifications, 'sales', true);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('1');
  });
});

describe('Sale Notification Audit - Accuracy Validation', () => {
  interface AuditLog {
    sale_id: string;
    seller_rank: number;
    recipient_rank: number;
    timestamp: string;
  }

  const validateAuditEntry = (log: AuditLog, expectedSellerRank: number, expectedRecipientRank: number) => {
    return log.seller_rank === expectedSellerRank && log.recipient_rank === expectedRecipientRank;
  };

  it('should validate audit entry correctly', () => {
    const log: AuditLog = {
      sale_id: 'sale-123',
      seller_rank: 1,
      recipient_rank: 5,
      timestamp: new Date().toISOString()
    };
    expect(validateAuditEntry(log, 1, 5)).toBe(true);
    expect(validateAuditEntry(log, 2, 5)).toBe(false);
  });
});

describe('Notification Channel Preference Logic', () => {
  interface Preferences {
    in_app: boolean;
    email: boolean;
  }

  const shouldSendViaChannel = (prefs: Preferences, channel: 'in_app' | 'email') => {
    return prefs[channel];
  };

  it('should respect channel preferences', () => {
    const prefs: Preferences = { in_app: true, email: false };
    expect(shouldSendViaChannel(prefs, 'in_app')).toBe(true);
    expect(shouldSendViaChannel(prefs, 'email')).toBe(false);
  });
});
