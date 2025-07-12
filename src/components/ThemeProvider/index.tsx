'use client';

import { useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { ThemeAtom } from '@/atoms/ThemeAtom';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useAtomValue(ThemeAtom);

  useEffect(() => {
    const root = document.documentElement; // <html> 要素にクラス付与
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <>
      {children}
    </>
  );
}