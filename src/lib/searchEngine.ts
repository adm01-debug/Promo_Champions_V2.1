// Advanced Search Engine
export interface SearchFilter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in';
  value: any;
}

export interface SearchOptions {
  query?: string;
  filters?: SearchFilter[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export class SearchEngine<T extends Record<string, any>> {
  private data: T[];
  
  constructor(data: T[]) {
    this.data = data;
  }
  
  search(options: SearchOptions): { results: T[]; total: number } {
    let results = [...this.data];
    
    // Text search
    if (options.query) {
      results = this.textSearch(results, options.query);
    }
    
    // Apply filters
    if (options.filters) {
      results = this.applyFilters(results, options.filters);
    }
    
    // Sort
    if (options.sortBy) {
      results = this.sort(results, options.sortBy, options.sortOrder || 'asc');
    }
    
    const total = results.length;
    
    // Pagination
    if (options.limit) {
      const offset = options.offset || 0;
      results = results.slice(offset, offset + options.limit);
    }
    
    return { results, total };
  }
  
  private textSearch(data: T[], query: string): T[] {
    const lowerQuery = query.toLowerCase();
    
    return data.filter(item => {
      return Object.values(item).some(value => {
        if (typeof value === 'string') {
          return value.toLowerCase().includes(lowerQuery);
        }
        return false;
      });
    });
  }
  
  private applyFilters(data: T[], filters: SearchFilter[]): T[] {
    return data.filter(item => {
      return filters.every(filter => {
        const value = item[filter.field];
        
        switch (filter.operator) {
          case 'eq':
            return value === filter.value;
          case 'neq':
            return value !== filter.value;
          case 'gt':
            return value > filter.value;
          case 'gte':
            return value >= filter.value;
          case 'lt':
            return value < filter.value;
          case 'lte':
            return value <= filter.value;
          case 'contains':
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'in':
            return Array.isArray(filter.value) && filter.value.includes(value);
          default:
            return true;
        }
      });
    });
  }
  
  private sort(data: T[], field: string, order: 'asc' | 'desc'): T[] {
    return data.sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];
      
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }
}
