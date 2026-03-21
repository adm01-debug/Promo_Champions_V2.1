/**
 * Calendar & Scheduling Tests
 * Tests: time slot generation, conflict detection, recurring events, timezone
 */
import { describe, it, expect } from 'vitest';

describe('Calendar - Time Slot Generation', () => {
  const generateTimeSlots = (startHour: number, endHour: number, intervalMinutes: number): string[] => {
    const slots: string[] = [];
    for (let h = startHour; h < endHour; h++) {
      for (let m = 0; m < 60; m += intervalMinutes) {
        slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      }
    }
    return slots;
  };

  it('should generate 30min slots for business hours', () => {
    const slots = generateTimeSlots(8, 18, 30);
    expect(slots[0]).toBe('08:00');
    expect(slots[1]).toBe('08:30');
    expect(slots).toHaveLength(20);
  });

  it('should generate hourly slots', () => {
    expect(generateTimeSlots(9, 12, 60)).toEqual(['09:00', '10:00', '11:00']);
  });

  it('should generate 15min slots', () => {
    expect(generateTimeSlots(9, 10, 15)).toHaveLength(4);
  });
});

describe('Calendar - Conflict Detection', () => {
  type Event = { start: string; end: string; title: string };

  const hasConflict = (newEvent: Event, existingEvents: Event[]): boolean => {
    const newStart = new Date(newEvent.start).getTime();
    const newEnd = new Date(newEvent.end).getTime();
    return existingEvents.some(e => {
      const eStart = new Date(e.start).getTime();
      const eEnd = new Date(e.end).getTime();
      return newStart < eEnd && newEnd > eStart;
    });
  };

  const events: Event[] = [
    { start: '2024-01-15T10:00:00', end: '2024-01-15T11:00:00', title: 'Meeting A' },
    { start: '2024-01-15T14:00:00', end: '2024-01-15T15:00:00', title: 'Meeting B' },
  ];

  it('should detect overlapping events', () => {
    expect(hasConflict(
      { start: '2024-01-15T10:30:00', end: '2024-01-15T11:30:00', title: 'New' },
      events
    )).toBe(true);
  });

  it('should allow non-overlapping events', () => {
    expect(hasConflict(
      { start: '2024-01-15T12:00:00', end: '2024-01-15T13:00:00', title: 'New' },
      events
    )).toBe(false);
  });

  it('should allow back-to-back events', () => {
    expect(hasConflict(
      { start: '2024-01-15T11:00:00', end: '2024-01-15T12:00:00', title: 'New' },
      events
    )).toBe(false);
  });

  it('should handle empty calendar', () => {
    expect(hasConflict(
      { start: '2024-01-15T10:00:00', end: '2024-01-15T11:00:00', title: 'New' },
      []
    )).toBe(false);
  });
});

describe('Calendar - Recurring Events', () => {
  const generateRecurring = (startDate: string, recurrence: 'daily' | 'weekly' | 'monthly', count: number): string[] => {
    const dates: string[] = [];
    const d = new Date(startDate);
    for (let i = 0; i < count; i++) {
      dates.push(d.toISOString().split('T')[0]);
      if (recurrence === 'daily') d.setDate(d.getDate() + 1);
      else if (recurrence === 'weekly') d.setDate(d.getDate() + 7);
      else if (recurrence === 'monthly') d.setMonth(d.getMonth() + 1);
    }
    return dates;
  };

  it('should generate daily recurrence', () => {
    const dates = generateRecurring('2024-01-01', 'daily', 3);
    expect(dates).toEqual(['2024-01-01', '2024-01-02', '2024-01-03']);
  });

  it('should generate weekly recurrence', () => {
    const dates = generateRecurring('2024-01-01', 'weekly', 3);
    expect(dates).toEqual(['2024-01-01', '2024-01-08', '2024-01-15']);
  });

  it('should generate monthly recurrence', () => {
    const dates = generateRecurring('2024-01-15', 'monthly', 3);
    expect(dates).toEqual(['2024-01-15', '2024-02-15', '2024-03-15']);
  });
});

describe('Calendar - Working Days', () => {
  const isWorkingDay = (date: Date): boolean => {
    const day = date.getDay();
    return day !== 0 && day !== 6;
  };

  const getWorkingDaysInRange = (start: string, end: string): number => {
    let count = 0;
    const d = new Date(start);
    const endDate = new Date(end);
    while (d <= endDate) {
      if (isWorkingDay(d)) count++;
      d.setDate(d.getDate() + 1);
    }
    return count;
  };

  it('should identify weekdays', () => {
    expect(isWorkingDay(new Date('2024-01-15'))).toBe(true); // Monday
    expect(isWorkingDay(new Date('2024-01-13'))).toBe(false); // Saturday
    expect(isWorkingDay(new Date('2024-01-14'))).toBe(false); // Sunday
  });

  it('should count working days in a week', () => {
    expect(getWorkingDaysInRange('2024-01-15', '2024-01-19')).toBe(5);
  });

  it('should count working days in a full week', () => {
    expect(getWorkingDaysInRange('2024-01-15', '2024-01-21')).toBe(5);
  });
});

describe('Calendar - Event Duration Formatting', () => {
  const formatEventDuration = (startISO: string, endISO: string): string => {
    const diffMs = new Date(endISO).getTime() - new Date(startISO).getTime();
    const minutes = Math.round(diffMs / 60000);
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  };

  it('should format short meetings', () => {
    expect(formatEventDuration('2024-01-15T10:00:00', '2024-01-15T10:30:00')).toBe('30 min');
  });

  it('should format hour meetings', () => {
    expect(formatEventDuration('2024-01-15T10:00:00', '2024-01-15T11:00:00')).toBe('1h');
  });

  it('should format mixed duration', () => {
    expect(formatEventDuration('2024-01-15T10:00:00', '2024-01-15T11:30:00')).toBe('1h 30min');
  });
});

describe('Calendar - Availability Check', () => {
  const getAvailableSlots = (
    allSlots: string[],
    bookedSlots: string[]
  ): string[] => {
    return allSlots.filter(s => !bookedSlots.includes(s));
  };

  it('should return unbooked slots', () => {
    const all = ['09:00', '09:30', '10:00', '10:30', '11:00'];
    const booked = ['09:30', '10:30'];
    expect(getAvailableSlots(all, booked)).toEqual(['09:00', '10:00', '11:00']);
  });

  it('should return all if none booked', () => {
    expect(getAvailableSlots(['09:00', '10:00'], [])).toHaveLength(2);
  });

  it('should return empty if all booked', () => {
    expect(getAvailableSlots(['09:00'], ['09:00'])).toHaveLength(0);
  });
});
