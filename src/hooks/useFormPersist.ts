import { useEffect, useState } from 'react';

export function useFormPersist<T extends Record<string, any>>(
  key: string,
  initialValues: T
): [T, (values: T) => void, () => void] {
  const [values, setValues] = useState<T>(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialValues;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(values));
  }, [key, values]);

  const clear = () => {
    localStorage.removeItem(key);
    setValues(initialValues);
  };

  return [values, setValues, clear];
}
