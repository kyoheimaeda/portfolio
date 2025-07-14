// components/ThemeProvider/index.tsx
'use client';

import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { ThemeAtom } from '@/atoms/ThemeAtom';

const colors = ['#41B883', '#83CD29', '#F0DB4F', '#2589CA', '#A259FF', '#CB6699', '#F16529'];

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useAtomValue(ThemeAtom);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', colors[index]);
    const interval = setInterval(() => {
      const nextIndex = (index + 1) % colors.length;
      setIndex(nextIndex);
      document.documentElement.style.setProperty('--color-primary', colors[nextIndex]);
    }, 3000);
    return () => clearInterval(interval);
  }, [index]);

  return <>{children}</>;
}
