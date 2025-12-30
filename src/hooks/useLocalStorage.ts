import { useState, useEffect, useCallback } from 'react';

type StorageType = 'local' | 'session';

interface UseLocalStorageOptions<T> {
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
  storageType?: StorageType;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const {
    serializer = JSON.stringify,
    deserializer = JSON.parse,
    storageType = 'local'
  } = options;

  const storage = storageType === 'local' ? localStorage : sessionStorage;

  // Get stored value or initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = storage.getItem(key);
      return item !== null ? deserializer(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading ${storageType}Storage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update storage when value changes
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      storage.setItem(key, serializer(valueToStore));
      
      // Dispatch event for other tabs/windows
      window.dispatchEvent(new StorageEvent('storage', {
        key,
        newValue: serializer(valueToStore)
      }));
    } catch (error) {
      console.warn(`Error setting ${storageType}Storage key "${key}":`, error);
    }
  }, [key, storedValue, serializer, storage, storageType]);

  // Remove from storage
  const removeValue = useCallback(() => {
    try {
      storage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing ${storageType}Storage key "${key}":`, error);
    }
  }, [key, initialValue, storage, storageType]);

  // Listen for changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(deserializer(e.newValue));
        } catch (error) {
          console.warn(`Error parsing storage event for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, deserializer]);

  return [storedValue, setValue, removeValue];
}

// Simplified session storage hook
export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  return useLocalStorage(key, initialValue, { storageType: 'session' });
}

// Hook for storing form drafts
export function useFormDraft<T extends Record<string, any>>(
  formId: string,
  initialValues: T,
  debounceMs: number = 500
): {
  values: T;
  setValues: (values: T | ((prev: T) => T)) => void;
  clearDraft: () => void;
  hasDraft: boolean;
} {
  const [values, setValues, clearDraft] = useLocalStorage<T>(
    `form-draft-${formId}`,
    initialValues
  );

  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(`form-draft-${formId}`);
    setHasDraft(stored !== null && stored !== JSON.stringify(initialValues));
  }, [formId, initialValues]);

  return { values, setValues, clearDraft, hasDraft };
}
