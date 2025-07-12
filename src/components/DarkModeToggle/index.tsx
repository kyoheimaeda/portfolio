// components/DarkModeToggle.tsx
'use client';

import { useAtom } from 'jotai';
import { ThemeAtom } from '@/atoms/ThemeAtom';
import { Moon, Sun } from 'lucide-react';
import styles from "./DarkModeToggle.module.scss";


export default function DarkModeToggle() {
  const [theme, setTheme] = useAtom(ThemeAtom);

  return (
    <button
      className={styles.darkModeToggle}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle Dark Mode"
    >
      {theme === 'dark' ? <Sun /> : <Moon />}
    </button>
  );
}
