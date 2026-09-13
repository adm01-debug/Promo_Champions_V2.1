export interface AnalyticsEvent {
  entered_at: string;
  route: string;
  salesperson_id: string | null;
}

export interface PageView {
  count: number;
  path: string;
}

export interface UserActivity {
  last_active: string;
  name: string;
  user_id: string;
}

export function aggregatePageViews(events: AnalyticsEvent[]): PageView[] {
  const counts = new Map<string, number>();

  for (const event of events) {
    counts.set(event.route, (counts.get(event.route) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count || a.path.localeCompare(b.path));
}

export function aggregateUserActivity(
  events: AnalyticsEvent[],
  salespeople: Map<string, string>
): UserActivity[] {
  const activity = new Map<string, UserActivity>();

  for (const event of events) {
    if (!event.salesperson_id) continue;

    const previous = activity.get(event.salesperson_id);
    if (!previous || event.entered_at > previous.last_active) {
      activity.set(event.salesperson_id, {
        user_id: event.salesperson_id,
        name: salespeople.get(event.salesperson_id) ?? 'Usuário removido',
        last_active: event.entered_at,
      });
    }
  }

  return [...activity.values()].sort((a, b) =>
    b.last_active.localeCompare(a.last_active)
  );
}
