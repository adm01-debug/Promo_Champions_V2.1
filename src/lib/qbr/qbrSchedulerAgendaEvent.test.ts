/**
 * Contrato edge/banco do qbr-scheduler: a linha gravada em agenda_events
 * precisa passar nos CHECKs de produção. Antes o payload usava
 * event_type "qbr" e status "scheduled", e o insert falhava inteiro.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  buildQbrAgendaEvent,
  QBR_EVENT_TYPE,
  QBR_TITLE_PREFIX,
} from '../../../supabase/functions/qbr-scheduler/agenda-event';

// Copiados de agenda_events_*_check (snapshot de produção, db.constraints).
const EVENT_TYPES = ['reminder', 'follow_up', 'meeting', 'call', 'task'];
const STATUSES = ['pending', 'in_progress', 'completed', 'cancelled'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const schedule = {
  owner_salesperson_id: 'aaaaaaaa-0000-0000-0000-000000000001',
  next_qbr_at: '2026-11-20',
  frequency: 'quarterly',
};

describe('qbr-scheduler — linha de agenda_events', () => {
  it('respeita os CHECKs de event_type, status e priority', () => {
    const row = buildQbrAgendaEvent(schedule, 'Conta A');
    expect(EVENT_TYPES).toContain(row.event_type);
    expect(STATUSES).toContain(row.status);
    expect(PRIORITIES).toContain(row.priority);
  });

  it('mantém dono, horário e título reconhecível pelo dedup', () => {
    const row = buildQbrAgendaEvent(schedule, 'Conta A');
    expect(row.salesperson_id).toBe(schedule.owner_salesperson_id);
    expect(row.scheduled_at).toBe('2026-11-20T14:00:00.000Z');
    expect(row.event_type).toBe(QBR_EVENT_TYPE);
    expect(String(row.title).startsWith(QBR_TITLE_PREFIX)).toBe(true);
  });

  it('a edge usa o builder, deduplica pelo mesmo tipo e não engole erro do insert', () => {
    const src = readFileSync(
      join(process.cwd(), 'supabase/functions/qbr-scheduler/index.ts'),
      'utf8'
    );
    expect(src).not.toMatch(/event_type:\s*["']qbr["']/);
    expect(src).not.toMatch(/\.eq\(\s*["']event_type["']\s*,\s*["']qbr["']/);
    expect(src).toContain('buildQbrAgendaEvent(');
    expect(src).toMatch(/if \(evError\) throw/);
  });
});
