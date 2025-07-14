// components/ThemeToggle.tsx
'use client';

import { useAtom } from 'jotai';
import { ThemeAtom } from '@/atoms/ThemeAtom';
import { MdContrast } from "react-icons/md";
import styles from "./ThemeToggle.module.scss";


export default function ThemeToggle() {
  const [theme, setTheme] = useAtom(ThemeAtom);

  return (
    <button
      className={styles.darkModeToggle}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle Dark Mode"
    >
      <MdContrast className={`${styles.icon} ${theme === 'dark' ? styles.isDark : styles.isLight}`} />
    </button>
  );
}
