/**
 * Scan de duplicados na base de clientes: correspondência exata por
 * email/telefone e aproximada por nome (Levenshtein). Usado pela página
 * de deduplicação.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DuplicateGroup {
  key: string;
  clients: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    company: string | null;
    total_value: number;
  }[];
  similarity: number;
  match_type: 'email' | 'phone' | 'name';
}

function levenshtein(a: string, b: string): number {
  const m = a.length,
    n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i]![j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1]![j - 1]!
          : 1 + Math.min(dp[i - 1]![j]!, dp[i]![j - 1]!, dp[i - 1]![j - 1]!);
  return dp[m]![n]!;
}

function nameSimilarity(a: string, b: string): number {
  const la = a.toLowerCase().trim();
  const lb = b.toLowerCase().trim();
  if (la === lb) return 1;
  const maxLen = Math.max(la.length, lb.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(la, lb) / maxLen;
}

export function useDeduplicationScan() {
  return useQuery<DuplicateGroup[]>({
    queryKey: ['deduplication-scan'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, email, phone, company, total_value')
        .order('name')
        .limit(1000);

      if (error) throw error;
      const clients = data || [];
      const groups: DuplicateGroup[] = [];
      const seen = new Set<string>();

      // Exact matches first (Email/Phone)
      const emailMap: Record<string, typeof clients> = {};
      const phoneMap: Record<string, typeof clients> = {};

      clients.forEach(c => {
        if (c.email) {
          const key = c.email.toLowerCase().trim();
          if (!emailMap[key]) emailMap[key] = [];
          emailMap[key].push(c);
        }
        if (c.phone) {
          const normalized = c.phone.replace(/\D/g, '');
          if (normalized.length >= 8) {
            const key = normalized.slice(-8);
            if (!phoneMap[key]) phoneMap[key] = [];
            phoneMap[key].push(c);
          }
        }
      });

      Object.entries(emailMap).forEach(([email, group]) => {
        if (group.length > 1) {
          groups.push({
            key: `email-${email}`,
            clients: group,
            similarity: 1,
            match_type: 'email',
          });
          group.forEach(c => seen.add(c.id));
        }
      });

      Object.entries(phoneMap).forEach(([phone, group]) => {
        if (group.length > 1) {
          const key = `phone-${phone}`;
          if (!groups.some(g => g.key.includes(phone))) {
            groups.push({ key, clients: group, similarity: 0.98, match_type: 'phone' });
            group.forEach(c => seen.add(c.id));
          }
        }
      });

      // Fuzzy Name Matching (only for those not already in exact groups)
      const remainingClients = clients.filter(c => !seen.has(c.id));
      for (let i = 0; i < remainingClients.length; i++) {
        for (let j = i + 1; j < remainingClients.length; j++) {
          const sim = nameSimilarity(
            remainingClients[i]!.name,
            remainingClients[j]!.name
          );
          if (sim >= 0.88) {
            groups.push({
              key: `fuzzy-${remainingClients[i]!.id}-${remainingClients[j]!.id}`,
              clients: [remainingClients[i]!, remainingClients[j]!],
              similarity: Math.round(sim * 100) / 100,
              match_type: 'name',
            });
          }
        }
      }

      return groups.sort((a, b) => b.similarity - a.similarity);
    },
    staleTime: 0, // Always fresh
  });
}
