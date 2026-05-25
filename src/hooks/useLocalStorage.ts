import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';

export function useLocalStorage<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem('dm:' + key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('dm:' + key, JSON.stringify(value));
    } catch {}
  }, [key, value]);

  return [value, setValue];
}
