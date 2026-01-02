export const arrayHelpers = {
  groupBy: <T>(arr: T[], key: keyof T): Record<string, T[]> => {
    return arr.reduce((acc, item) => {
      const group = String(item[key]);
      if (!acc[group]) acc[group] = [];
      acc[group].push(item);
      return acc;
    }, {} as Record<string, T[]>);
  },

  unique: <T>(arr: T[], key?: keyof T): T[] => {
    if (!key) return [...new Set(arr)];
    const seen = new Set();
    return arr.filter(item => {
      const val = item[key];
      if (seen.has(val)) return false;
      seen.add(val);
      return true;
    });
  },

  sortBy: <T>(arr: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => {
    return [...arr].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  },

  chunk: <T>(arr: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  },

  sum: <T>(arr: T[], key: keyof T): number => {
    return arr.reduce((acc, item) => acc + Number(item[key]), 0);
  },

  avg: <T>(arr: T[], key: keyof T): number => {
    return arr.length ? arrayHelpers.sum(arr, key) / arr.length : 0;
  },
};
