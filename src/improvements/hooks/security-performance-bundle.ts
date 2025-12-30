// ============================================================================
// 2FA - TWO FACTOR AUTHENTICATION
// supabase/migrations/YYYYMMDD_2fa.sql
// ============================================================================

/*
CREATE TABLE IF NOT EXISTS user_2fa (
  user_id UUID PRIMARY KEY REFERENCES auth.users,
  enabled BOOLEAN DEFAULT false,
  secret TEXT NOT NULL,
  backup_codes TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS 2fa_verification_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  success BOOLEAN,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
*/

// src/hooks/use2FA.ts

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

export const use2FA = () => {
  const [qrCode, setQrCode] = useState<string>('');

  // Check 2FA status
  const { data: status } = useQuery({
    queryKey: ['2fa-status'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase
        .from('user_2fa')
        .select('enabled, verified_at')
        .eq('user_id', user?.id)
        .single();
      return data;
    },
  });

  // Setup 2FA
  const setup = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const secret = authenticator.generateSecret();

      const otpauthUrl = authenticator.keyuri(
        user?.email || '',
        'SalesPro',
        secret
      );

      const qr = await QRCode.toDataURL(otpauthUrl);
      setQrCode(qr);

      await supabase.from('user_2fa').upsert({
        user_id: user?.id,
        secret,
        enabled: false,
      });

      return { secret, qrCode: qr };
    },
  });

  // Verify and enable
  const verify = useMutation({
    mutationFn: async (token: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase
        .from('user_2fa')
        .select('secret')
        .eq('user_id', user?.id)
        .single();

      const isValid = authenticator.verify({
        token,
        secret: data.secret,
      });

      if (!isValid) throw new Error('Código inválido');

      await supabase
        .from('user_2fa')
        .update({ enabled: true, verified_at: new Date().toISOString() })
        .eq('user_id', user?.id);

      return true;
    },
  });

  return { status, setup, verify, qrCode };
};

// ============================================================================
// AUDIT TRAIL COMPLETO
// supabase/migrations/YYYYMMDD_audit_trail.sql
// ============================================================================

/*
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_log(user_id, created_at DESC);
CREATE INDEX idx_audit_table ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_action ON audit_log(action, created_at DESC);

-- Trigger function
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (
    user_id, action, table_name, record_id, old_values, new_values
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to critical tables
CREATE TRIGGER audit_clients AFTER INSERT OR UPDATE OR DELETE ON clients
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_deals AFTER INSERT OR UPDATE OR DELETE ON deals
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();
*/

// src/hooks/useAuditLog.ts

export const useAuditLog = (filters?: {
  userId?: string;
  table?: string;
  recordId?: string;
  action?: string;
}) => {
  return useQuery({
    queryKey: ['audit-log', filters],
    queryFn: async () => {
      let query = supabase
        .from('audit_log')
        .select(`
          *,
          user:auth.users(email, full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (filters?.userId) query = query.eq('user_id', filters.userId);
      if (filters?.table) query = query.eq('table_name', filters.table);
      if (filters?.recordId) query = query.eq('record_id', filters.recordId);
      if (filters?.action) query = query.eq('action', filters.action);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

// ============================================================================
// DEBOUNCE & THROTTLE HOOKS
// src/hooks/useDebounce.ts
// ============================================================================

import { useEffect, useState, useRef, useCallback } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

export function useThrottle<T>(value: T, limit: number = 500): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}

// ============================================================================
// MEMOIZATION HELPERS
// src/hooks/useMemoized.ts
// ============================================================================

import { useMemo } from 'react';

export function useMemoizedArray<T>(
  items: T[],
  dependencies: any[] = []
): T[] {
  return useMemo(() => items, dependencies);
}

export function useMemoizedObject<T extends Record<string, any>>(
  obj: T,
  dependencies: any[] = []
): T {
  return useMemo(() => obj, dependencies);
}

export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: any[] = []
): T {
  return useCallback(callback, dependencies);
}

// Memoization decorator
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// 1. Debounce search
const SearchInput = () => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  
  useEffect(() => {
    // Buscar apenas após 300ms sem digitar
    fetchResults(debouncedSearch);
  }, [debouncedSearch]);
  
  return <Input value={search} onChange={e => setSearch(e.target.value)} />;
};

// 2. Throttle scroll
const InfiniteList = () => {
  const handleScroll = useThrottle((e) => {
    // Executar no máximo a cada 500ms
    checkLoadMore(e);
  }, 500);
  
  return <div onScroll={handleScroll}>...</div>;
};

// 3. Memoized calculation
const ExpensiveComponent = ({ data }) => {
  const processed = useMemo(() => {
    return expensiveCalculation(data);
  }, [data]);
  
  return <div>{processed}</div>;
};
*/
