// ============================================================================
// OFFLINE SUPPORT
// src/lib/offline.ts
// ============================================================================

export class OfflineManager {
  private db: IDBDatabase | null = null;

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('salespro_offline', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        db.createObjectStore('deals', { keyPath: 'id' });
        db.createObjectStore('clients', { keyPath: 'id' });
        db.createObjectStore('activities', { keyPath: 'id' });
      };
    });
  }

  async save(store: string, data: any) {
    if (!this.db) await this.init();
    
    const tx = this.db!.transaction(store, 'readwrite');
    const objectStore = tx.objectStore(store);
    objectStore.put(data);
    
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(data);
      tx.onerror = () => reject(tx.error);
    });
  }

  async getAll(store: string) {
    if (!this.db) await this.init();
    
    const tx = this.db!.transaction(store, 'readonly');
    const objectStore = tx.objectStore(store);
    const request = objectStore.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

// ============================================================================
// LOCALIZATION - i18n
// src/lib/i18n.ts
// ============================================================================

const translations = {
  'pt-BR': {
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Excluir',
    'deals.title': 'Negócios',
    'clients.title': 'Clientes',
  },
  'en': {
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'deals.title': 'Deals',
    'clients.title': 'Clients',
  },
};

export const t = (key: string, locale = 'pt-BR') => {
  return translations[locale]?.[key] || key;
};

// ============================================================================
// FEATURE FLAGS
// src/lib/feature-flags.ts
// ============================================================================

class FeatureFlags {
  private flags: Record<string, boolean> = {};

  async load() {
    const { data } = await supabase
      .from('feature_flags')
      .select('*')
      .eq('active', true);
    
    this.flags = (data || []).reduce((acc, flag) => {
      acc[flag.name] = flag.enabled;
      return acc;
    }, {});
  }

  isEnabled(feature: string): boolean {
    return this.flags[feature] || false;
  }
}

export const featureFlags = new FeatureFlags();

// ============================================================================
// A/B TESTING
// src/lib/ab-testing.ts
// ============================================================================

export class ABTest {
  getVariant(testName: string): 'A' | 'B' {
    const stored = localStorage.getItem(`ab_${testName}`);
    if (stored) return stored as 'A' | 'B';
    
    const variant = Math.random() > 0.5 ? 'A' : 'B';
    localStorage.setItem(`ab_${testName}`, variant);
    
    // Track
    analytics.track('ab_test_assigned', {
      test: testName,
      variant,
    });
    
    return variant;
  }

  trackConversion(testName: string) {
    const variant = this.getVariant(testName);
    analytics.track('ab_test_conversion', {
      test: testName,
      variant,
    });
  }
}

// ============================================================================
// FORM VALIDATION
// src/lib/validation.ts
// ============================================================================

import { z } from 'zod';

export const schemas = {
  client: z.object({
    name: z.string().min(2, 'Nome muito curto'),
    email: z.string().email('Email inválido'),
    phone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone inválido'),
  }),
  
  deal: z.object({
    title: z.string().min(3, 'Título muito curto'),
    value: z.number().positive('Valor deve ser positivo'),
    client_id: z.string().uuid('Cliente inválido'),
  }),
};

export const validate = <T>(schema: z.ZodSchema<T>, data: any): T => {
  return schema.parse(data);
};

// ============================================================================
// RATE LIMITING (Client-side)
// src/lib/rate-limit.ts
// ============================================================================

class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  canMakeRequest(key: string, maxRequests = 10, window = 60000): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    
    // Remove old timestamps
    const validTimestamps = timestamps.filter(t => now - t < window);
    
    if (validTimestamps.length >= maxRequests) {
      return false;
    }
    
    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);
    
    return true;
  }
}

export const rateLimiter = new RateLimiter();

// ============================================================================
// ERROR TRACKING
// src/lib/error-tracking.ts
// ============================================================================

class ErrorTracker {
  capture(error: Error, context?: Record<string, any>) {
    // Log to backend
    supabase.from('error_logs').insert({
      message: error.message,
      stack: error.stack,
      context,
      user_id: supabase.auth.getUser().then(u => u.data.user?.id),
      timestamp: new Date().toISOString(),
    });

    // Send to Sentry (if configured)
    if (window.Sentry) {
      window.Sentry.captureException(error, { extra: context });
    }
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    supabase.from('error_logs').insert({
      message,
      level,
      timestamp: new Date().toISOString(),
    });
  }
}

export const errorTracker = new ErrorTracker();

// ============================================================================
// SEARCH OPTIMIZATION
// src/lib/search.ts
// ============================================================================

export class Search {
  async fuzzySearch(query: string, table: string, fields: string[]) {
    const { data } = await supabase
      .from(table)
      .select('*')
      .textSearch(fields.join('||'), query, {
        type: 'websearch',
        config: 'portuguese',
      });

    return data || [];
  }

  highlightMatch(text: string, query: string): string {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }
}

// ============================================================================
// PDF GENERATION ADVANCED
// src/lib/pdf-generator.ts
// ============================================================================

import jsPDF from 'jspdf';

export class PDFGenerator {
  createProposal(deal: any) {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Proposta Comercial', 20, 20);
    
    // Client info
    doc.setFontSize(12);
    doc.text(`Cliente: ${deal.client_name}`, 20, 40);
    doc.text(`Deal: ${deal.title}`, 20, 50);
    doc.text(`Valor: R$ ${deal.value.toLocaleString('pt-BR')}`, 20, 60);
    
    // Items
    let y = 80;
    deal.items?.forEach((item: any, i: number) => {
      doc.text(`${i+1}. ${item.name} - R$ ${item.price}`, 30, y);
      y += 10;
    });
    
    // Footer
    doc.setFontSize(10);
    doc.text('Proposta válida por 30 dias', 20, 280);
    
    return doc;
  }

  save(doc: jsPDF, filename: string) {
    doc.save(filename);
  }
}

// ============================================================================
// USAGE & EXPORT
// ============================================================================

export const offline = new OfflineManager();
export const abTest = new ABTest();
export const search = new Search();
export const pdfGenerator = new PDFGenerator();

/*
// Usage examples

// Offline
await offline.init();
await offline.save('deals', dealData);

// Feature Flags
await featureFlags.load();
if (featureFlags.isEnabled('new_dashboard')) {
  // Show new dashboard
}

// A/B Test
const variant = abTest.getVariant('checkout_flow');
if (variant === 'A') {
  // Show variant A
}

// Error Tracking
try {
  riskyOperation();
} catch (error) {
  errorTracker.capture(error, { userId: '123' });
}
*/
