// components/ThemeToggle.tsx
'use client';

import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { ThemeAtom } from '@/atoms/ThemeAtom';

export default function ThemeToggle() {
  const [theme, setTheme] = useAtom(ThemeAtom);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button onClick={toggleTheme}>
      {theme === 'dark' ? 'ライトモードにする' : 'ダークモードにする'}
    </button>
  );
}
